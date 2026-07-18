"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/admin/auth";
import { getImportJob } from "@/lib/admin/import/jobs";
import { runRollbackImport } from "@/lib/admin/import/rollback";
import { revalidatePublicProductPaths } from "@/lib/admin/revalidate";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Admin-only, per the confirmed permission split (matches bulkDelete's
 * precedent) — undoing a rollback isn't itself supported, so this is a
 * more consequential action than running an import in the first place.
 */
export async function rollbackImport(jobId: string) {
  await requireRole("admin");
  const job = await getImportJob(jobId);
  if (!job) redirect("/admin/import?error=" + encodeURIComponent("Import job not found."));
  if (job.status !== "imported") redirect(`/admin/import/${jobId}`);

  const supabase = await createServerSupabaseClient();
  await runRollbackImport(supabase, jobId);

  revalidatePath("/admin/products");
  revalidatePath("/admin/import");
  revalidatePath(`/admin/import/${jobId}`);
  revalidatePublicProductPaths();
  redirect(`/admin/import/${jobId}`);
}
