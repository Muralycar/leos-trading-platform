"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/admin/auth";
import { getImportJob } from "@/lib/admin/import/jobs";
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

  // 1. Restore exactly what this job superseded — "Replace" never deleted
  // the prior batch, only deactivated it, so this is always possible.
  const { error: restoreError } = await supabase
    .from("inventory_batches")
    .update({ is_current: true, superseded_by_import_job_id: null })
    .eq("superseded_by_import_job_id", jobId);
  if (restoreError) throw restoreError;

  // 2. Remove every batch this job created (whether for a new product or an existing one).
  const { error: deleteBatchesError } = await supabase.from("inventory_batches").delete().eq("import_job_id", jobId);
  if (deleteBatchesError) throw deleteBatchesError;

  // 3. Remove products this job created fresh — but only if untouched
  // since (created_at === updated_at, unchanged by the products_set_updated_at
  // trigger added in 0005). A product an admin has since deliberately
  // edited is never silently deleted, even if this job originated it —
  // its batch from this job is still gone from step 2, but the product
  // record itself is left alone.
  const { data: createdRows, error: createdRowsError } = await supabase
    .from("import_rows")
    .select("mapped_product_id")
    .eq("import_job_id", jobId)
    .eq("outcome", "create");
  if (createdRowsError) throw createdRowsError;

  const createdProductIds = [...new Set((createdRows ?? []).map((r) => r.mapped_product_id).filter((id): id is string => !!id))];
  if (createdProductIds.length > 0) {
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, created_at, updated_at")
      .in("id", createdProductIds);
    if (productsError) throw productsError;

    const untouchedIds = products.filter((p) => p.created_at === p.updated_at).map((p) => p.id);
    if (untouchedIds.length > 0) {
      // import_rows.mapped_product_id has no ON DELETE CASCADE/SET NULL —
      // deleting the product it points to would otherwise violate that FK.
      // Nulling it here (not deleting the row) preserves import_rows as the
      // historical audit record: outcome stays 'create', raw_data and
      // error_notes are untouched, it just no longer points at a product
      // that no longer exists.
      const { error: unlinkError } = await supabase
        .from("import_rows")
        .update({ mapped_product_id: null })
        .eq("import_job_id", jobId)
        .in("mapped_product_id", untouchedIds);
      if (unlinkError) throw unlinkError;

      const { error: deleteProductsError } = await supabase.from("products").delete().in("id", untouchedIds);
      if (deleteProductsError) throw deleteProductsError;
    }
  }

  const { error: statusError } = await supabase.from("import_jobs").update({ status: "rolled_back" }).eq("id", jobId);
  if (statusError) throw statusError;

  revalidatePath("/admin/products");
  revalidatePath("/admin/import");
  revalidatePath(`/admin/import/${jobId}`);
  revalidatePublicProductPaths();
  redirect(`/admin/import/${jobId}`);
}
