// Rollback logic, extracted the same way as confirm.ts — takes an injected
// client rather than creating its own from request cookies, so it can be
// called directly from a verification script. Same rollback semantics as
// before; the only change is chunking the .in() queries so a job that
// touched thousands of products can be rolled back without exceeding a
// typical proxy's URL length limit.

import type { createServerSupabaseClient } from "@/lib/supabase/server";
import { chunkArray, FILTER_CHUNK_SIZE } from "@/lib/admin/import/chunk";

type SupabaseClientLike = Awaited<ReturnType<typeof createServerSupabaseClient>>;

/**
 * Undoes a completed import: restores everything it superseded, deletes
 * everything it created, and deletes products it created fresh that
 * haven't been edited since. Every step here already reads/writes by
 * import_job_id or by an explicit id list rather than depending on any
 * state left by a previous rollback attempt, so — like confirm — this is
 * safe to call again from scratch if a prior attempt didn't finish.
 */
export async function runRollbackImport(supabase: SupabaseClientLike, jobId: string): Promise<void> {
  // 1. Restore exactly what this job superseded — "Replace" never deleted
  // the prior batch, only deactivated it, so this is always possible.
  // Naturally idempotent: a batch already restored no longer matches this
  // filter, so re-running matches fewer (or zero) rows the second time.
  {
    const { error } = await supabase
      .from("inventory_batches")
      .update({ is_current: true, superseded_by_import_job_id: null })
      .eq("superseded_by_import_job_id", jobId);
    if (error) throw error;
  }

  // 2. Remove every batch this job created (whether for a new product or
  // an existing one) — naturally idempotent (deleting an already-deleted
  // row is a no-op).
  {
    const { error } = await supabase.from("inventory_batches").delete().eq("import_job_id", jobId);
    if (error) throw error;
  }

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
    // .in() values travel in the request URL, not the body — chunked so a
    // job that created thousands of products doesn't build an
    // impractically long query string.
    const products: { id: string; created_at: string; updated_at: string }[] = [];
    for (const idChunk of chunkArray(createdProductIds, FILTER_CHUNK_SIZE)) {
      const { data, error } = await supabase.from("products").select("id, created_at, updated_at").in("id", idChunk);
      if (error) throw error;
      products.push(...data);
    }

    const untouchedIds = products.filter((p) => p.created_at === p.updated_at).map((p) => p.id);
    if (untouchedIds.length > 0) {
      // import_rows.mapped_product_id has no ON DELETE CASCADE/SET NULL —
      // deleting the product it points to would otherwise violate that FK.
      // Nulling it here (not deleting the row) preserves import_rows as the
      // historical audit record: outcome stays 'create', raw_data and
      // error_notes are untouched, it just no longer points at a product
      // that no longer exists. Naturally idempotent (unlinking an
      // already-null reference, or deleting an already-deleted product,
      // is a no-op).
      for (const idChunk of chunkArray(untouchedIds, FILTER_CHUNK_SIZE)) {
        const { error: unlinkError } = await supabase
          .from("import_rows")
          .update({ mapped_product_id: null })
          .eq("import_job_id", jobId)
          .in("mapped_product_id", idChunk);
        if (unlinkError) throw unlinkError;
      }

      for (const idChunk of chunkArray(untouchedIds, FILTER_CHUNK_SIZE)) {
        const { error: deleteProductsError } = await supabase.from("products").delete().in("id", idChunk);
        if (deleteProductsError) throw deleteProductsError;
      }
    }
  }

  const { error: statusError } = await supabase.from("import_jobs").update({ status: "rolled_back" }).eq("id", jobId);
  if (statusError) throw statusError;
}
