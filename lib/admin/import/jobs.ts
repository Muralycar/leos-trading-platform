import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database, ImportJobStatus, ProductStatus } from "@/lib/supabase/types";

type ImportJobRow = Database["public"]["Tables"]["import_jobs"]["Row"];

export interface ImportRowErrorSample {
  rowNumber: number;
  reason: string;
}

export interface RepeatedPartNumber {
  partNumber: string;
  count: number;
}

export interface MissingFromFileProduct {
  id: string;
  oemPartNumber: string;
  description: string;
  quantity: number;
}

export type ImportBehavior = "skip" | "replace" | "add" | "update_fields";

export interface ImportJobListItem {
  id: string;
  brandId: string | null;
  brandName: string;
  equipmentCategoryId: string | null;
  fileName: string;
  storagePath: string;
  status: ImportJobStatus;
  rowCount: number | null;
  headers: string[] | null;
  duplicateOfFileName: string | null;
  duplicateOfCreatedAt: string | null;
  parseError: string | null;
  /** Header text -> target field key, set once mapping (Checkpoint 3) has run. */
  mapping: Record<string, string> | null;
  validCount: number | null;
  duplicateCount: number | null;
  errorCount: number | null;
  errorSamples: ImportRowErrorSample[] | null;
  repeatedPartNumbers: RepeatedPartNumber[] | null;
  /** Set once Checkpoint 4's preview has been computed. */
  behavior: ImportBehavior | null;
  createCount: number | null;
  updateCount: number | null;
  unchangedCount: number | null;
  skipCount: number | null;
  missingFromFile: MissingFromFileProduct[] | null;
  createdAt: string;
}

function mapRow(row: ImportJobRow, brandNameById: Map<string, string>): ImportJobListItem {
  const report = (row.report ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    brandId: row.brand_id,
    brandName: row.brand_id ? (brandNameById.get(row.brand_id) ?? "Unknown brand") : "Unknown brand",
    equipmentCategoryId: row.equipment_category_id,
    fileName: row.file_name,
    storagePath: row.storage_path,
    status: row.status,
    rowCount: row.row_count,
    headers: Array.isArray(report.headers) ? (report.headers as string[]) : null,
    duplicateOfFileName: typeof report.duplicateOfFileName === "string" ? report.duplicateOfFileName : null,
    duplicateOfCreatedAt: typeof report.duplicateOfCreatedAt === "string" ? report.duplicateOfCreatedAt : null,
    parseError: typeof report.error === "string" ? report.error : null,
    mapping: report.mapping && typeof report.mapping === "object" ? (report.mapping as Record<string, string>) : null,
    validCount: typeof report.validCount === "number" ? report.validCount : null,
    duplicateCount: typeof report.duplicateCount === "number" ? report.duplicateCount : null,
    errorCount: typeof report.errorCount === "number" ? report.errorCount : null,
    errorSamples: Array.isArray(report.errorSamples) ? (report.errorSamples as ImportRowErrorSample[]) : null,
    repeatedPartNumbers: Array.isArray(report.repeatedPartNumbers) ? (report.repeatedPartNumbers as RepeatedPartNumber[]) : null,
    behavior: typeof report.behavior === "string" ? (report.behavior as ImportBehavior) : null,
    createCount: typeof report.createCount === "number" ? report.createCount : null,
    updateCount: typeof report.updateCount === "number" ? report.updateCount : null,
    unchangedCount: typeof report.unchangedCount === "number" ? report.unchangedCount : null,
    skipCount: typeof report.skipCount === "number" ? report.skipCount : null,
    missingFromFile: Array.isArray(report.missingFromFile) ? (report.missingFromFile as MissingFromFileProduct[]) : null,
    createdAt: row.created_at,
  };
}

/**
 * All brands, not just active ones (unlike lib/data/inventory.ts's
 * getBrands()) — a job's brand may have since been archived, and the
 * import history should still show its real name rather than "Unknown
 * brand".
 */
async function brandNameMap(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>): Promise<Map<string, string>> {
  const { data, error } = await supabase.from("brands").select("id, name");
  if (error) throw error;
  return new Map(data.map((b) => [b.id, b.name]));
}

export async function listImportJobs(): Promise<ImportJobListItem[]> {
  const supabase = await createServerSupabaseClient();
  const [{ data, error }, brandNameById] = await Promise.all([
    supabase.from("import_jobs").select("*").order("created_at", { ascending: false }),
    brandNameMap(supabase),
  ]);
  if (error) throw error;
  return data.map((row) => mapRow(row, brandNameById));
}

export async function getImportJob(id: string): Promise<ImportJobListItem | undefined> {
  const supabase = await createServerSupabaseClient();
  const [{ data, error }, brandNameById] = await Promise.all([
    supabase.from("import_jobs").select("*").eq("id", id).maybeSingle(),
    brandNameMap(supabase),
  ]);
  if (error) throw error;
  return data ? mapRow(data, brandNameById) : undefined;
}

export interface AffectedProduct {
  id: string;
  oemPartNumber: string;
  description: string;
  quantity: number;
  status: ProductStatus;
}

/**
 * Every product this job wrote a batch for — new or matched — found via
 * inventory_batches.import_job_id rather than import_rows, since every
 * batch this job created (for both a brand-new product and a matched one)
 * carries that tag regardless of outcome. Naturally returns nothing once a
 * job has been rolled back, since its batches no longer exist by then.
 */
export async function getAffectedProducts(jobId: string): Promise<AffectedProduct[]> {
  const supabase = await createServerSupabaseClient();
  const { data: batchRows, error: batchError } = await supabase.from("inventory_batches").select("product_id").eq("import_job_id", jobId);
  if (batchError) throw batchError;

  const productIds = [...new Set((batchRows ?? []).map((b) => b.product_id))];
  if (productIds.length === 0) return [];

  const { data: products, error: productsError } = await supabase
    .from("product_admin_view")
    .select("id, oem_part_number, description, quantity, status")
    .in("id", productIds)
    .order("oem_part_number");
  if (productsError) throw productsError;

  return products.map((p) => ({ id: p.id, oemPartNumber: p.oem_part_number, description: p.description, quantity: p.quantity, status: p.status }));
}
