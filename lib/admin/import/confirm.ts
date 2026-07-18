// The actual product/batch write logic for a completed import — extracted
// out of the confirmImport Server Action so it (a) takes an injected
// Supabase client instead of creating its own from request cookies, which
// makes it directly callable from a verification script outside a Next.js
// request, and (b) can be unit/integration-tested without needing a real
// admin session.
//
// Rewritten to scale to arbitrarily large catalogs on a serverless
// platform: every write is now a bulk insert/upsert processed in chunks
// (lib/admin/import/chunk.ts) instead of one round trip per product, and
// every step is idempotent — safe to retry from scratch if a prior attempt
// was cut off partway (e.g. a serverless function timeout), which a naive
// "just batch it" rewrite would not be on its own.

import type { createServerSupabaseClient } from "@/lib/supabase/server";
import { classifyDescription } from "@/lib/data/categorize";
import { getBrandProductsByNormalizedKey } from "@/lib/admin/import/matching";
import { listMatchableRows, groupByNormalizedPartNumber, updateRowOutcomes, type ImportRowRecord } from "@/lib/admin/import/rows";
import { UPDATABLE_PRODUCT_FIELD_KEYS, coerceProductFieldValue } from "@/lib/admin/import/fields";
import { cellToString, optionalStr, optionalNum, optionalInt, requiredQuantity, toCamel } from "@/lib/admin/import/coerce";
import { processInChunks, WRITE_CHUNK_SIZE, FILTER_CHUNK_SIZE, CHUNK_CONCURRENCY } from "@/lib/admin/import/chunk";
import { reportBase, type ImportJobListItem } from "@/lib/admin/import/jobs";

type SupabaseClientLike = Awaited<ReturnType<typeof createServerSupabaseClient>>;

function buildProductInsert(row: ImportRowRecord, job: ImportJobListItem) {
  return {
    brand_id: job.brandId!,
    equipment_category_id: job.equipmentCategoryId!,
    oem_part_number: cellToString(row.mapped.oem_part_number),
    description: cellToString(row.mapped.description),
    equipment_make: optionalStr(row.mapped.equipment_make),
    equipment_model: optionalStr(row.mapped.equipment_model),
    application: optionalStr(row.mapped.application),
    country_of_origin: optionalStr(row.mapped.country_of_origin),
    weight: optionalNum(row.mapped.weight),
    dimensions: optionalStr(row.mapped.dimensions),
    price: optionalNum(row.mapped.price),
    currency: optionalStr(row.mapped.currency),
    min_order_qty: optionalInt(row.mapped.min_order_qty),
    public_notes: optionalStr(row.mapped.public_notes),
    internal_notes: optionalStr(row.mapped.internal_notes),
    status: "draft" as const,
  };
}

/**
 * Applies a confirmed, previewed import: creates new products, applies the
 * chosen behavior to matched products, and writes every inventory batch —
 * the only place in the whole wizard allowed to touch products/
 * inventory_batches. Throws on any failure; every step here is safe to
 * simply call again from scratch (see each step's comment) if a prior
 * attempt didn't reach the final status update.
 */
export async function runConfirmImport(
  supabase: SupabaseClientLike,
  job: ImportJobListItem,
  jobId: string,
  actorProfileId: string,
): Promise<void> {
  if (!job.brandId || !job.equipmentCategoryId) throw new Error("Job is missing its brand or default equipment category.");
  if (job.status !== "previewed") throw new Error("Job is not in a previewed state.");
  if (!job.behavior) throw new Error("Job has no confirmed behavior.");

  const rows = await listMatchableRows(jobId, supabase);
  const writable = rows.filter((r) => r.outcome === "create" || r.outcome === "update");
  const groups = groupByNormalizedPartNumber(writable);
  const createEntries = [...groups.entries()].filter(([, groupRows]) => groupRows[0].outcome === "create");
  const updateEntries = [...groups.entries()].filter(([, groupRows]) => groupRows[0].outcome === "update");

  const [{ data: productCategories, error: catErr }, { data: warehouseLocations, error: whErr }] = await Promise.all([
    supabase.from("product_categories").select("id, slug"),
    supabase.from("warehouse_locations").select("id, name"),
  ]);
  if (catErr) throw catErr;
  if (whErr) throw whErr;
  const categoryIdBySlug = new Map((productCategories ?? []).map((c) => [c.slug, c.id]));
  const warehouseIdByName = new Map((warehouseLocations ?? []).map((w) => [w.name.trim().toLowerCase(), w.id]));

  // ---- 1. Bulk-create new products ----
  // ignoreDuplicates -> ON CONFLICT (brand_id, oem_part_number_normalized)
  // DO NOTHING: safe to re-run — a normalized key a prior, incomplete
  // attempt already created is silently skipped rather than erroring or
  // duplicating.
  if (createEntries.length > 0) {
    const productRows = createEntries.map(([, groupRows]) => buildProductInsert(groupRows[0], job));
    await processInChunks(productRows, WRITE_CHUNK_SIZE, CHUNK_CONCURRENCY, async (chunk) => {
      const { error } = await supabase
        .from("products")
        .upsert(chunk, { onConflict: "brand_id,oem_part_number_normalized", ignoreDuplicates: true });
      if (error) throw error;
    });
  }

  // ---- 2. Re-fetch the complete brand product map ----
  // Covers pre-existing matches, products just created above, and any
  // products a prior partial attempt at this same confirm already
  // created — from here on this is the single source of truth for "what
  // product id does this normalized key resolve to."
  const productsByKey = await getBrandProductsByNormalizedKey(job.brandId, supabase);

  function resolveProductId(key: string, groupRows: ImportRowRecord[]): string {
    const id = productsByKey.get(key)?.id ?? groupRows[0].mappedProductId;
    if (!id) throw new Error(`No product could be resolved for normalized key "${key}".`);
    return id;
  }

  // ---- 3. Bulk-link a category to each newly created product ----
  // ignoreDuplicates on the (product_id, product_category_id) primary key
  // — safe to re-run for the same reason as step 1.
  if (createEntries.length > 0) {
    const categoryMapRows = createEntries
      .map(([key, groupRows]) => {
        const productId = resolveProductId(key, groupRows);
        const category = classifyDescription(cellToString(groupRows[0].mapped.description));
        const categoryId = categoryIdBySlug.get(category.slug);
        return categoryId ? { product_id: productId, product_category_id: categoryId } : null;
      })
      .filter((r): r is { product_id: string; product_category_id: string } => r !== null);

    await processInChunks(categoryMapRows, WRITE_CHUNK_SIZE, CHUNK_CONCURRENCY, async (chunk) => {
      const { error } = await supabase
        .from("product_category_map")
        .upsert(chunk, { onConflict: "product_id,product_category_id", ignoreDuplicates: true });
      if (error) throw error;
    });
  }

  // ---- 4. Backfill mapped_product_id on every created row ----
  // Reuses updateRowOutcomes' real bulk-update RPC (lib/admin/import/rows.ts)
  // rather than a REST upsert — outcome is already 'create' for every one of
  // these rows (set by computePreview), so this just re-asserts it alongside
  // the newly-resolved product id; safe to re-run, always writes the same
  // values.
  if (createEntries.length > 0) {
    const rowLinks = createEntries.flatMap(([key, groupRows]) => {
      const productId = resolveProductId(key, groupRows);
      return groupRows.map((r) => ({ id: r.id, outcome: "create" as const, mappedProductId: productId }));
    });
    await updateRowOutcomes(rowLinks, supabase);
  }

  // ---- 5. Clear out anything THIS job already wrote in a prior, incomplete attempt ----
  // import_job_id=jobId only ever tags a batch this exact job created —
  // never a manual entry, never another job's batch — so deleting them
  // before rewriting is safe and a no-op on a first attempt.
  {
    const { error } = await supabase.from("inventory_batches").delete().eq("import_job_id", jobId);
    if (error) throw error;
  }

  // ---- 6. Supersede prior-import batches for matched products ----
  // Chunked over product ids (a `.in()` filter travels in the URL, not the
  // body). Naturally idempotent even without the chunking: the `is_current
  // = true` condition means re-running this after a partial success just
  // matches fewer (or zero) additional rows the second time.
  if (job.behavior === "replace" || job.behavior === "update_fields") {
    const productIdsToSupersede = [...new Set(updateEntries.map(([key, groupRows]) => resolveProductId(key, groupRows)))];
    await processInChunks(productIdsToSupersede, FILTER_CHUNK_SIZE, CHUNK_CONCURRENCY, async (idChunk) => {
      const { error } = await supabase
        .from("inventory_batches")
        .update({ is_current: false, superseded_by_import_job_id: jobId })
        .in("product_id", idChunk)
        .eq("is_current", true)
        .not("import_job_id", "is", null);
      if (error) throw error;
    });
  }

  // ---- 7. Bulk-insert every batch (new products + matched products) ----
  function resolveWarehouseId(row: ImportRowRecord): string | null {
    const name = optionalStr(row.mapped.warehouse_location);
    return name ? (warehouseIdByName.get(name.trim().toLowerCase()) ?? null) : null;
  }
  function batchInsertFor(row: ImportRowRecord, productId: string) {
    return {
      product_id: productId,
      quantity: requiredQuantity(row.mapped.quantity),
      condition: optionalStr(row.mapped.condition),
      warehouse_location_id: resolveWarehouseId(row),
      bin_location: optionalStr(row.mapped.bin_location),
      arrival_date: optionalStr(row.mapped.arrival_date),
      supplier_reference: optionalStr(row.mapped.supplier_reference),
      purchase_reference: optionalStr(row.mapped.purchase_reference),
      is_current: true,
      import_job_id: jobId,
    };
  }

  const batchRows = [...groups.entries()].flatMap(([key, groupRows]) => {
    const productId = resolveProductId(key, groupRows);
    return groupRows.map((row) => batchInsertFor(row, productId));
  });
  await processInChunks(batchRows, WRITE_CHUNK_SIZE, CHUNK_CONCURRENCY, async (chunk) => {
    const { error } = await supabase.from("inventory_batches").insert(chunk);
    if (error) throw error;
  });

  // ---- 8. Bulk-update product field changes ("update all mapped fields" behavior) ----
  // A real bulk UPDATE via RPC (bulk_update_product_fields, migration
  // 0010), not a REST upsert — the same NOT NULL-on-tentative-insert issue
  // from step 4 applies here too (brand_id/equipment_category_id/
  // oem_part_number/status are NOT NULL and aren't part of this payload).
  // Every row carries the full set of UPDATABLE_PRODUCT_FIELD_KEYS (not
  // just the ones that changed), with blank cells falling back to the
  // product's current value — preserves "blank cell never overwrites
  // existing data" exactly, since the RPC always SETs every column it
  // knows about.
  if (job.behavior === "update_fields" && updateEntries.length > 0) {
    const productFieldRows = updateEntries.map(([key, groupRows]) => {
      const productId = resolveProductId(key, groupRows);
      const current = productsByKey.get(key) as unknown as Record<string, unknown> | undefined;
      const first = groupRows[0].mapped;
      const row: Record<string, string | number | null> = { id: productId };
      for (const fieldKey of UPDATABLE_PRODUCT_FIELD_KEYS) {
        const fileValue = optionalStr(first[fieldKey]);
        row[fieldKey] = fileValue === null ? ((current?.[toCamel(fieldKey)] as string | number | null | undefined) ?? null) : coerceProductFieldValue(fieldKey, first[fieldKey]);
      }
      return row;
    });
    await processInChunks(productFieldRows, WRITE_CHUNK_SIZE, CHUNK_CONCURRENCY, async (chunk) => {
      const { error } = await supabase.rpc("bulk_update_product_fields", { updates: chunk });
      if (error) throw error;
    });
  }

  // ---- 9. Finalize job status ----
  const { error: jobUpdateError } = await supabase
    .from("import_jobs")
    .update({
      status: "imported",
      report: {
        ...reportBase(job),
        behavior: job.behavior,
        createCount: job.createCount,
        updateCount: job.updateCount,
        unchangedCount: job.unchangedCount,
        skipCount: job.skipCount,
        missingFromFile: job.missingFromFile,
        confirmedAt: new Date().toISOString(),
        confirmedBy: actorProfileId,
      },
    })
    .eq("id", jobId);
  if (jobUpdateError) throw jobUpdateError;
}
