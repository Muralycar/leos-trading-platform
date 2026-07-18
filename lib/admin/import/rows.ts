import { createServerSupabaseClient } from "@/lib/supabase/server";
import { normalizePartNumber } from "@/lib/part-number";
import { cellToString } from "@/lib/admin/import/coerce";
import type { Database, ImportRowOutcome, ImportRowStatus } from "@/lib/supabase/types";

type ImportRowRow = Database["public"]["Tables"]["import_rows"]["Row"];

export interface MappedRowData {
  mapped: Record<string, unknown>;
  original: unknown[];
}

export interface ImportRowRecord {
  id: string;
  mapped: Record<string, unknown>;
  validationStatus: ImportRowStatus;
  outcome: ImportRowOutcome | null;
  mappedProductId: string | null;
  errorNotes: string | null;
}

function mapRow(row: ImportRowRow): ImportRowRecord {
  const raw = row.raw_data as unknown as MappedRowData;
  return {
    id: row.id,
    mapped: raw.mapped ?? {},
    validationStatus: row.validation_status,
    outcome: row.outcome,
    mappedProductId: row.mapped_product_id,
    errorNotes: row.error_notes,
  };
}

/**
 * Groups rows by normalized OEM part number — the unit every downstream
 * decision (matched vs. new, one row = one batch) operates on, since
 * repeated part numbers within a file are never merged or rejected, only
 * grouped under the one product they share.
 */
export function groupByNormalizedPartNumber(rows: ImportRowRecord[]): Map<string, ImportRowRecord[]> {
  const groups = new Map<string, ImportRowRecord[]>();
  for (const row of rows) {
    const key = normalizePartNumber(cellToString(row.mapped.oem_part_number));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }
  return groups;
}

/** Rows that passed Checkpoint 3's field validation — candidates for product matching (not yet-errored rows). */
export async function listMatchableRows(jobId: string): Promise<ImportRowRecord[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("import_rows")
    .select("*")
    .eq("import_job_id", jobId)
    .in("validation_status", ["valid", "duplicate"]);
  if (error) throw error;
  return data.map(mapRow);
}

export async function listImportRowsByOutcome(jobId: string, outcomes: ImportRowOutcome[], limit = 50): Promise<ImportRowRecord[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("import_rows")
    .select("*")
    .eq("import_job_id", jobId)
    .in("outcome", outcomes)
    .limit(limit);
  if (error) throw error;
  return data.map(mapRow);
}

const UPDATE_CHUNK_SIZE = 500;

/**
 * One upsert request per chunk (PostgREST's INSERT ... ON CONFLICT (id) DO
 * UPDATE SET <only the columns provided> = EXCLUDED.<column>), not one
 * request per row — every id here already exists from Checkpoint 3, so
 * this only ever updates outcome/mapped_product_id and never touches
 * raw_data/validation_status, which aren't in the payload.
 */
export async function updateRowOutcomes(
  updates: { id: string; outcome: ImportRowOutcome; mappedProductId: string | null }[],
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  for (let i = 0; i < updates.length; i += UPDATE_CHUNK_SIZE) {
    const chunk = updates.slice(i, i + UPDATE_CHUNK_SIZE);
    // Partial-column upsert: PostgREST's generic Insert type demands every
    // NOT NULL column, but at runtime ON CONFLICT DO UPDATE only SETs the
    // columns actually present in the payload — safe here since every id
    // already exists (Checkpoint 3 created these rows).
    const payload = chunk.map((u) => ({ id: u.id, outcome: u.outcome, mapped_product_id: u.mappedProductId })) as unknown as Database["public"]["Tables"]["import_rows"]["Insert"][];
    const { error } = await supabase.from("import_rows").upsert(payload, { onConflict: "id" });
    if (error) throw error;
  }
}
