"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/admin/auth";
import { getImportJob } from "@/lib/admin/import/jobs";
import type { ImportBehavior, MissingFromFileProduct } from "@/lib/admin/import/jobs";
import { getBrandProductsByNormalizedKey } from "@/lib/admin/import/matching";
import { listMatchableRows, groupByNormalizedPartNumber, updateRowOutcomes, type ImportRowRecord } from "@/lib/admin/import/rows";
import { UPDATABLE_PRODUCT_FIELD_KEYS } from "@/lib/admin/import/fields";
import { revalidatePublicProductPaths } from "@/lib/admin/revalidate";
import { cellToString, optionalStr, optionalNum, optionalInt, requiredQuantity } from "@/lib/admin/import/coerce";
import { classifyDescription } from "@/lib/data/categorize";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database, ImportRowOutcome } from "@/lib/supabase/types";

const BEHAVIORS: ImportBehavior[] = ["skip", "replace", "add", "update_fields"];

function previewError(jobId: string, message: string): never {
  redirect(`/admin/import/${jobId}/preview?error=${encodeURIComponent(message)}`);
}

function reportBase(job: NonNullable<Awaited<ReturnType<typeof getImportJob>>>) {
  return {
    headers: job.headers,
    duplicateOfJobId: null as string | null,
    duplicateOfFileName: job.duplicateOfFileName,
    duplicateOfCreatedAt: job.duplicateOfCreatedAt,
    mapping: job.mapping,
    validCount: job.validCount,
    duplicateCount: job.duplicateCount,
    errorCount: job.errorCount,
    errorSamples: job.errorSamples,
    repeatedPartNumbers: job.repeatedPartNumbers,
  };
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

function toCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

export async function confirmImport(jobId: string) {
  const profile = await requireRole("editor", "admin");
  const job = await getImportJob(jobId);
  if (!job) redirect("/admin/import?error=" + encodeURIComponent("Import job not found."));
  if (!job.brandId || !job.equipmentCategoryId) redirect(`/admin/import/${jobId}/preview`);
  if (job.status !== "previewed") redirect(`/admin/import/${jobId}/preview`);

  const supabase = await createServerSupabaseClient();
  const rows = await listMatchableRows(jobId);
  const writable = rows.filter((r) => r.outcome === "create" || r.outcome === "update");
  const groups = groupByNormalizedPartNumber(writable);

  const [{ data: productCategories, error: catErr }, { data: warehouseLocations, error: whErr }] = await Promise.all([
    supabase.from("product_categories").select("id, slug"),
    supabase.from("warehouse_locations").select("id, name"),
  ]);
  if (catErr) throw catErr;
  if (whErr) throw whErr;
  const categoryIdBySlug = new Map((productCategories ?? []).map((c) => [c.slug, c.id]));
  const warehouseIdByName = new Map((warehouseLocations ?? []).map((w) => [w.name.trim().toLowerCase(), w.id]));

  function resolveWarehouseId(row: ImportRowRecord): string | null {
    const name = optionalStr(row.mapped.warehouse_location);
    if (!name) return null;
    return warehouseIdByName.get(name.trim().toLowerCase()) ?? null;
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

  const batchesToInsert: ReturnType<typeof batchInsertFor>[] = [];
  const productsToSupersede = new Set<string>();

  for (const [, groupRows] of groups) {
    const outcome = groupRows[0].outcome;
    const first = groupRows[0];

    if (outcome === "create") {
      const description = cellToString(first.mapped.description);
      const category = classifyDescription(description);
      const { data: product, error: insertProductError } = await supabase
        .from("products")
        .insert({
          brand_id: job.brandId,
          equipment_category_id: job.equipmentCategoryId,
          oem_part_number: cellToString(first.mapped.oem_part_number),
          description,
          equipment_make: optionalStr(first.mapped.equipment_make),
          equipment_model: optionalStr(first.mapped.equipment_model),
          application: optionalStr(first.mapped.application),
          country_of_origin: optionalStr(first.mapped.country_of_origin),
          weight: optionalNum(first.mapped.weight),
          dimensions: optionalStr(first.mapped.dimensions),
          price: optionalNum(first.mapped.price),
          currency: optionalStr(first.mapped.currency),
          min_order_qty: optionalInt(first.mapped.min_order_qty),
          public_notes: optionalStr(first.mapped.public_notes),
          internal_notes: optionalStr(first.mapped.internal_notes),
          status: "draft",
        })
        .select("id")
        .single();
      if (insertProductError || !product) throw insertProductError ?? new Error("Product insert failed.");

      const categoryId = categoryIdBySlug.get(category.slug);
      if (categoryId) {
        const { error: mapError } = await supabase.from("product_category_map").insert({ product_id: product.id, product_category_id: categoryId });
        if (mapError) throw mapError;
      }

      for (const row of groupRows) batchesToInsert.push(batchInsertFor(row, product.id));
    } else {
      // outcome === "update" — mapped_product_id was resolved and stored on every row in this group during computePreview.
      const productId = first.mappedProductId;
      if (!productId) throw new Error("An update row is missing its matched product id.");

      if (job.behavior === "replace" || job.behavior === "update_fields") {
        productsToSupersede.add(productId);
      }
      for (const row of groupRows) batchesToInsert.push(batchInsertFor(row, productId));

      if (job.behavior === "update_fields") {
        const productUpdate: Record<string, unknown> = {};
        for (const key of UPDATABLE_PRODUCT_FIELD_KEYS) {
          const value = optionalStr(first.mapped[key]);
          if (value === null) continue; // blank cell never overwrites existing data
          if (key === "weight" || key === "price") productUpdate[key] = optionalNum(first.mapped[key]);
          else if (key === "min_order_qty") productUpdate[key] = optionalInt(first.mapped[key]);
          else productUpdate[key] = value;
        }
        if (Object.keys(productUpdate).length > 0) {
          // Dynamically-keyed partial update — supabase-js's generic Update
          // type wants literal keys, but every key here is a validated
          // member of UPDATABLE_PRODUCT_FIELD_KEYS (real products columns).
          const { error: updateProductError } = await supabase
            .from("products")
            .update(productUpdate as Database["public"]["Tables"]["products"]["Update"])
            .eq("id", productId);
          if (updateProductError) throw updateProductError;
        }
      }
    }
  }

  if (productsToSupersede.size > 0) {
    const { error: supersedeError } = await supabase
      .from("inventory_batches")
      .update({ is_current: false, superseded_by_import_job_id: jobId })
      .in("product_id", [...productsToSupersede])
      .eq("is_current", true)
      .not("import_job_id", "is", null);
    if (supersedeError) throw supersedeError;
  }

  const BATCH_CHUNK = 500;
  for (let i = 0; i < batchesToInsert.length; i += BATCH_CHUNK) {
    const { error: insertBatchError } = await supabase.from("inventory_batches").insert(batchesToInsert.slice(i, i + BATCH_CHUNK));
    if (insertBatchError) throw insertBatchError;
  }

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
        confirmedBy: profile.id,
      },
    })
    .eq("id", jobId);
  if (jobUpdateError) throw jobUpdateError;

  revalidatePath("/admin/products");
  revalidatePath("/admin/import");
  revalidatePath(`/admin/import/${jobId}/preview`);
  revalidatePublicProductPaths();
  redirect(`/admin/import/${jobId}/preview`);
}
