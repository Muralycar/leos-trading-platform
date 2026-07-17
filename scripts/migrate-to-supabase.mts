// One-time bridge: lib/data/inventory.generated.json -> Supabase.
//
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see
// .env.local.example). Run with:
//   node --env-file=.env.local scripts/migrate-to-supabase.mts
//
// Idempotent — safe to re-run. Products are upserted on the same
// (brand_id, oem_part_number_normalized) key the schema enforces; the
// synthetic "phase2-migration" import_jobs row (one per brand) is reused if
// it already exists rather than duplicated; that job's batches are deleted
// and reinserted fresh each run — the same "Replace" semantics a real
// re-import uses, applied to this script's own synthetic job.
//
// Run supabase/migrations/0001_init_schema.sql and supabase/seed.sql
// against the target project before this script.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { Database } from "../lib/supabase/types.ts";
import { selectAllPaginated } from "../lib/supabase/paginate.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Copy .env.local.example to .env.local, fill in your project's values, and re-run with:\n" +
      "  node --env-file=.env.local scripts/migrate-to-supabase.mts",
  );
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface GeneratedProduct {
  id: string;
  brandSlug: string;
  equipmentCategorySlug: string;
  productCategorySlug: string;
  oemPartNumber: string;
  oemPartNumberNormalized: string;
  description: string;
}
interface GeneratedBatch {
  id: string;
  productId: string;
  quantity: number;
  sourceLine: number;
}
interface GeneratedData {
  products: GeneratedProduct[];
  batches: GeneratedBatch[];
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

async function main() {
  const dataPath = resolve(ROOT, "lib/data/inventory.generated.json");
  const data: GeneratedData = JSON.parse(readFileSync(dataPath, "utf-8"));
  console.log(`Loaded ${data.products.length} products / ${data.batches.length} batches from ${dataPath}`);

  const { data: brandRows, error: brandsError } = await supabase.from("brands").select("id, slug");
  if (brandsError) throw brandsError;
  const brandIdBySlug = new Map(brandRows.map((b) => [b.slug, b.id]));

  const { data: categoryRows, error: categoriesError } = await supabase.from("equipment_categories").select("id, slug");
  if (categoriesError) throw categoriesError;
  const categoryIdBySlug = new Map(categoryRows.map((c) => [c.slug, c.id]));

  const { data: productCategoryRows, error: productCategoriesError } = await supabase
    .from("product_categories")
    .select("id, slug");
  if (productCategoriesError) throw productCategoriesError;
  const productCategoryIdBySlug = new Map(productCategoryRows.map((c) => [c.slug, c.id]));

  const brandSlugs = [...new Set(data.products.map((p) => p.brandSlug))];
  for (const slug of brandSlugs) {
    if (!brandIdBySlug.has(slug)) throw new Error(`Brand "${slug}" not found — run supabase/seed.sql first.`);
  }

  // --- One synthetic import_jobs row per brand (reused if it already exists) ---
  const importJobIdByBrand = new Map<string, string>();
  for (const brandSlug of brandSlugs) {
    const brandId = brandIdBySlug.get(brandSlug)!;
    const { data: existingJob, error: findJobError } = await supabase
      .from("import_jobs")
      .select("id")
      .eq("brand_id", brandId)
      .eq("file_name", "phase2-migration")
      .maybeSingle();
    if (findJobError) throw findJobError;

    if (existingJob) {
      importJobIdByBrand.set(brandSlug, existingJob.id);
      continue;
    }

    const { data: job, error: createJobError } = await supabase
      .from("import_jobs")
      .insert({
        brand_id: brandId,
        file_name: "phase2-migration",
        storage_path: "n/a — local-json migration, no uploaded file",
        status: "imported",
        row_count: data.products.filter((p) => p.brandSlug === brandSlug).length,
      })
      .select("id")
      .single();
    if (createJobError) throw createJobError;
    importJobIdByBrand.set(brandSlug, job.id);
  }
  console.log("Import job lineage:", Object.fromEntries(importJobIdByBrand));

  // --- Products: bulk upsert on (brand_id, oem_part_number_normalized) ---
  const productRows = data.products.map((p) => ({
    brand_id: brandIdBySlug.get(p.brandSlug)!,
    equipment_category_id: categoryIdBySlug.get(p.equipmentCategorySlug)!,
    oem_part_number: p.oemPartNumber,
    description: p.description,
    status: "published" as const,
  }));

  for (const rows of chunk(productRows, 500)) {
    const { error } = await supabase.from("products").upsert(rows, { onConflict: "brand_id,oem_part_number_normalized" });
    if (error) throw error;
  }
  console.log(`Upserted ${productRows.length} products`);

  // --- Resolve local JSON product id -> DB uuid via the natural key ---
  const productIdByLocalId = new Map<string, string>();
  const categoryMapRows: { product_id: string; product_category_id: string }[] = [];

  for (const brandSlug of brandSlugs) {
    const brandId = brandIdBySlug.get(brandSlug)!;
    const dbProducts = await selectAllPaginated<{ id: string; oem_part_number_normalized: string }>((from, to) =>
      supabase
        .from("products")
        .select("id, oem_part_number_normalized")
        .eq("brand_id", brandId)
        .order("id", { ascending: true })
        .range(from, to),
    );
    const dbIdByNormalized = new Map(dbProducts.map((p) => [p.oem_part_number_normalized, p.id]));

    for (const p of data.products.filter((x) => x.brandSlug === brandSlug)) {
      const dbId = dbIdByNormalized.get(p.oemPartNumberNormalized);
      if (!dbId) throw new Error(`Product ${p.id} not found after upsert — this should not happen.`);
      productIdByLocalId.set(p.id, dbId);

      const categoryId = productCategoryIdBySlug.get(p.productCategorySlug);
      if (categoryId) categoryMapRows.push({ product_id: dbId, product_category_id: categoryId });
    }
  }

  for (const rows of chunk(categoryMapRows, 500)) {
    const { error } = await supabase.from("product_category_map").upsert(rows, { onConflict: "product_id,product_category_id" });
    if (error) throw error;
  }
  console.log(`Upserted ${categoryMapRows.length} product_category_map rows`);

  // --- Inventory batches: replace this script's own synthetic job's batches each run ---
  for (const brandSlug of brandSlugs) {
    const importJobId = importJobIdByBrand.get(brandSlug)!;
    const { error: deleteError } = await supabase.from("inventory_batches").delete().eq("import_job_id", importJobId);
    if (deleteError) throw deleteError;
  }

  const batchRows = data.batches.map((b) => {
    const productId = productIdByLocalId.get(b.productId);
    if (!productId) throw new Error(`Batch ${b.id} references unknown product ${b.productId}`);
    const brandSlug = data.products.find((p) => p.id === b.productId)!.brandSlug;
    return {
      product_id: productId,
      quantity: b.quantity,
      source_line: b.sourceLine,
      import_job_id: importJobIdByBrand.get(brandSlug)!,
      is_current: true,
    };
  });

  for (const rows of chunk(batchRows, 500)) {
    const { error } = await supabase.from("inventory_batches").insert(rows);
    if (error) throw error;
  }
  console.log(`Inserted ${batchRows.length} inventory batches`);

  console.log("\nMigration complete. Verify row counts against lib/data/inventory.generated.json before proceeding.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
