"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireRole } from "@/lib/admin/auth";
import { parseWorkbook } from "@/lib/admin/import/parseSheet";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CATALOG_CACHE_TAG } from "@/lib/data/inventory";

const BUCKET = "import-uploads";
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["xlsx", "xls", "csv"];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function newImportError(message: string): never {
  redirect(`/admin/import/new?error=${encodeURIComponent(message)}`);
}

async function resolveBrandId(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  formData: FormData,
): Promise<string> {
  const brandChoice = String(formData.get("brand_id") ?? "");

  if (brandChoice !== "__new__") {
    if (!brandChoice) newImportError("Select a brand, or choose “Create new brand…”.");
    return brandChoice;
  }

  const newBrandName = String(formData.get("new_brand_name") ?? "").trim();
  if (!newBrandName) newImportError("Enter a name for the new brand.");

  const slug = slugify(newBrandName);
  if (!slug) newImportError("That brand name doesn't produce a usable slug — try adding letters or numbers.");

  const { data, error } = await supabase.from("brands").insert({ name: newBrandName, slug }).select("id").single();
  if (error) {
    const message = error.code === "23505" ? "A brand with that name or slug already exists." : "Couldn't create the brand. Please try again.";
    newImportError(message);
  }

  // getBrands() now persists across requests (lib/data/inventory.ts) —
  // without this, a freshly created brand wouldn't appear in public/admin
  // brand dropdowns until the cache's own revalidate window passed.
  revalidateTag(CATALOG_CACHE_TAG);
  return data.id;
}

export async function createImportJob(formData: FormData) {
  const profile = await requireRole("editor", "admin");
  const supabase = await createServerSupabaseClient();

  const brandId = await resolveBrandId(supabase, formData);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    newImportError("Choose a file to upload.");
  }
  if (file.size > MAX_FILE_BYTES) {
    newImportError("File is too large — the limit is 10MB.");
  }
  const extension = fileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    newImportError("Unsupported file type — upload a .xlsx, .xls, or .csv file.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const checksum = createHash("sha256").update(bytes).digest("hex");

  const { data: duplicate } = await supabase
    .from("import_jobs")
    .select("id, file_name, created_at")
    .eq("brand_id", brandId)
    .eq("file_checksum", checksum)
    .eq("status", "imported")
    .limit(1)
    .maybeSingle();

  const storagePath = `imports/${brandId}/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (uploadError) {
    newImportError("Couldn't store the uploaded file. Please try again.");
  }

  const { data: job, error: insertError } = await supabase
    .from("import_jobs")
    .insert({
      brand_id: brandId,
      uploaded_by: profile.id,
      file_name: file.name,
      file_checksum: checksum,
      storage_path: storagePath,
      status: "pending",
    })
    .select("id")
    .single();
  if (insertError) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    newImportError("Couldn't create the import job. Please try again.");
  }

  try {
    const { headers, dataRows } = parseWorkbook(bytes);
    await supabase
      .from("import_jobs")
      .update({
        status: "mapped",
        row_count: dataRows.length,
        report: {
          headers,
          parsedAt: new Date().toISOString(),
          duplicateOfJobId: duplicate?.id ?? null,
          duplicateOfFileName: duplicate?.file_name ?? null,
          duplicateOfCreatedAt: duplicate?.created_at ?? null,
        },
      })
      .eq("id", job.id);
  } catch (err) {
    await supabase
      .from("import_jobs")
      .update({
        status: "failed",
        report: { error: err instanceof Error ? err.message : "Unable to parse the file." },
      })
      .eq("id", job.id);
  }

  revalidatePath("/admin/import");
  redirect(`/admin/import?created=${job.id}`);
}
