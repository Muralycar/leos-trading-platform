"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/admin/auth";
import { getImportJob, reportBase } from "@/lib/admin/import/jobs";
import type { ImportBehavior, MissingFromFileProduct } from "@/lib/admin/import/jobs";
import { getBrandProductsByNormalizedKey } from "@/lib/admin/import/matching";
import { listMatchableRows, groupByNormalizedPartNumber, updateRowOutcomes } from "@/lib/admin/import/rows";
import { UPDATABLE_PRODUCT_FIELD_KEYS } from "@/lib/admin/import/fields";
import { revalidatePublicProductPaths } from "@/lib/admin/revalidate";
import { optionalStr, requiredQuantity, toCamel } from "@/lib/admin/import/coerce";
import { runConfirmImport } from "@/lib/admin/import/confirm";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ImportRowOutcome } from "@/lib/supabase/types";

const BEHAVIORS: ImportBehavior[] = ["skip", "replace", "add", "update_fields"];

function previewError(jobId: string, message: string): never {
  redirect(`/admin/import/${jobId}/preview?error=${encodeURIComponent(message)}`);
}

export async function computePreview(jobId: string, formData: FormData) {
  await requireRole("editor", "admin");
  const job = await getImportJob(jobId);
  if (!job) redirect("/admin/import?error=" + encodeURIComponent("Import job not found."));
  if (!job.brandId) redirect("/admin/import?error=" + encodeURIComponent("This job has no brand."));
  if (job.status !== "validated" && job.status !== "previewed") {
    redirect(`/admin/import/${jobId}/map`);
  }

  const behavior = String(formData.get("behavior") ?? "") as ImportBehavior;
  if (!BEHAVIORS.includes(behavior)) previewError(jobId, "Choose how to handle existing matched products.");

  const [rows, productsByKey] = await Promise.all([listMatchableRows(jobId), getBrandProductsByNormalizedKey(job.brandId)]);
  const groups = groupByNormalizedPartNumber(rows);

  const updates: { id: string; outcome: ImportRowOutcome; mappedProductId: string | null }[] = [];
  let createCount = 0;
  let updateCount = 0;
  let unchangedCount = 0;
  let skipCount = 0;
  const touchedKeys = new Set<string>();

  for (const [normalizedKey, groupRows] of groups) {
    touchedKeys.add(normalizedKey);
    const matched = productsByKey.get(normalizedKey);
    const fileQtyTotal = groupRows.reduce((sum, r) => sum + requiredQuantity(r.mapped.quantity), 0);

    let outcome: ImportRowOutcome;
    let mappedProductId: string | null = null;

    if (!matched) {
      outcome = "create";
    } else {
      mappedProductId = matched.id;
      if (behavior === "skip") {
        outcome = "skip";
      } else if (behavior === "add") {
        outcome = fileQtyTotal > 0 ? "update" : "unchanged";
      } else {
        // replace / update_fields: compare against current state
        const qtyChanged = fileQtyTotal !== matched.quantity;
        let fieldsChanged = false;
        if (behavior === "update_fields") {
          const first = groupRows[0].mapped;
          for (const key of UPDATABLE_PRODUCT_FIELD_KEYS) {
            const fileValue = optionalStr(first[key]);
            if (fileValue === null) continue; // blank cell never overwrites existing data
            const currentValue = (matched as unknown as Record<string, unknown>)[toCamel(key)];
            if (currentValue === null || currentValue === undefined || String(currentValue) !== fileValue) {
              fieldsChanged = true;
              break;
            }
          }
        }
        outcome = qtyChanged || fieldsChanged ? "update" : "unchanged";
      }
    }

    if (outcome === "create") createCount += groupRows.length;
    else if (outcome === "update") updateCount += groupRows.length;
    else if (outcome === "unchanged") unchangedCount += groupRows.length;
    else if (outcome === "skip") skipCount += groupRows.length;

    for (const row of groupRows) updates.push({ id: row.id, outcome, mappedProductId });
  }

  await updateRowOutcomes(updates);

  const missingFromFile: MissingFromFileProduct[] = [...productsByKey.entries()]
    .filter(([key]) => !touchedKeys.has(key))
    .map(([, p]) => ({ id: p.id, oemPartNumber: p.oemPartNumber, description: p.description, quantity: p.quantity }));

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("import_jobs")
    .update({
      status: "previewed",
      report: {
        ...reportBase(job),
        behavior,
        createCount,
        updateCount,
        unchangedCount,
        skipCount,
        missingFromFile,
      },
    })
    .eq("id", jobId);
  if (error) throw error;

  revalidatePath(`/admin/import/${jobId}/preview`);
  revalidatePath("/admin/import");
  redirect(`/admin/import/${jobId}/preview`);
}

export async function resetPreview(jobId: string) {
  await requireRole("editor", "admin");
  const job = await getImportJob(jobId);
  if (!job) redirect("/admin/import?error=" + encodeURIComponent("Import job not found."));
  if (job.status !== "previewed") redirect(`/admin/import/${jobId}/preview`);

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("import_jobs")
    .update({ status: "validated", report: reportBase(job) })
    .eq("id", jobId);
  if (error) throw error;

  revalidatePath(`/admin/import/${jobId}/preview`);
  revalidatePath("/admin/import");
  redirect(`/admin/import/${jobId}/preview`);
}

export async function cancelImport(jobId: string) {
  await requireRole("editor", "admin");
  const job = await getImportJob(jobId);
  if (!job) redirect("/admin/import?error=" + encodeURIComponent("Import job not found."));
  if (job.status !== "validated" && job.status !== "previewed") redirect(`/admin/import/${jobId}/preview`);

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("import_jobs").update({ status: "cancelled" }).eq("id", jobId);
  if (error) throw error;

  revalidatePath("/admin/import");
  redirect("/admin/import");
}

export async function confirmImport(jobId: string) {
  const profile = await requireRole("editor", "admin");
  const job = await getImportJob(jobId);
  if (!job) redirect("/admin/import?error=" + encodeURIComponent("Import job not found."));
  if (!job.brandId || !job.equipmentCategoryId) redirect(`/admin/import/${jobId}/preview`);
  if (job.status !== "previewed") redirect(`/admin/import/${jobId}/preview`);

  const supabase = await createServerSupabaseClient();
  await runConfirmImport(supabase, job, jobId, profile.id);

  revalidatePath("/admin/products");
  revalidatePath("/admin/import");
  revalidatePath(`/admin/import/${jobId}/preview`);
  revalidatePublicProductPaths();
  redirect(`/admin/import/${jobId}/preview`);
}
