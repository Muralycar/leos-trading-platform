import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database, ImportJobStatus } from "@/lib/supabase/types";

type ImportJobRow = Database["public"]["Tables"]["import_jobs"]["Row"];

export interface ImportJobListItem {
  id: string;
  brandId: string | null;
  brandName: string;
  fileName: string;
  status: ImportJobStatus;
  rowCount: number | null;
  headers: string[] | null;
  duplicateOfFileName: string | null;
  duplicateOfCreatedAt: string | null;
  parseError: string | null;
  createdAt: string;
}

function mapRow(row: ImportJobRow, brandNameById: Map<string, string>): ImportJobListItem {
  const report = (row.report ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    brandId: row.brand_id,
    brandName: row.brand_id ? (brandNameById.get(row.brand_id) ?? "Unknown brand") : "Unknown brand",
    fileName: row.file_name,
    status: row.status,
    rowCount: row.row_count,
    headers: Array.isArray(report.headers) ? (report.headers as string[]) : null,
    duplicateOfFileName: typeof report.duplicateOfFileName === "string" ? report.duplicateOfFileName : null,
    duplicateOfCreatedAt: typeof report.duplicateOfCreatedAt === "string" ? report.duplicateOfCreatedAt : null,
    parseError: typeof report.error === "string" ? report.error : null,
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
