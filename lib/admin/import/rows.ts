import { createServerSupabaseClient } from "@/lib/supabase/server";
import { selectAllPaginated } from "@/lib/supabase/paginate";
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

type SupabaseClientLike = Awaited<ReturnType<typeof createServerSupabaseClient>>;

/**
 * Rows that passed Checkpoint 3's field validation — candidates for product
 * matching (not yet-errored rows). Accepts an optional injected client so
 * the confirm/rollback write logic (and its verification scripts, which run
 * outside a Next.js request and can't call createServerSupabaseClient()
 * themselves) can supply one explicitly; every existing caller that omits
 * it keeps today's behavior unchanged.
 */
export async function listMatchableRows(jobId: string, client?: SupabaseClientLike): Promise<ImportRowRecord[]> {
  const supabase = client ?? (await createServerSupabaseClient());
  // Paginated — PostgREST caps an unpaginated select at 1000 rows, and a
  // brand's file can easily exceed that (Iveco's real file has 1,561 rows).
  // An explicit .order() is required: without one, Postgres/PostgREST don't
  // guarantee stable row order across separate paged requests, and rows
  // can be skipped or duplicated across the page boundary (the same
  // documented gotcha selectAllPaginated itself warns about).
  const rows = await selectAllPaginated<ImportRowRow>((from, to) =>
    supabase.from("import_rows").select("*").eq("import_job_id", jobId).in("validation_status", ["valid", "duplicate"]).order("id").range(from, to),
  );
  return rows.map(mapRow);
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
 * One RPC call per chunk — a real bulk `UPDATE ... FROM jsonb_array_elements(...)
 * WHERE id = ...`, not one request per row and not a REST upsert. A
 * partial-column upsert here (`{id, outcome, mapped_product_id}` only) was
 * tried first and looks equivalent, but Postgres validates NOT NULL
 * constraints on the tentative INSERT row before ON CONFLICT even decides
 * whether to redirect to UPDATE — so it fails on import_job_id/raw_data/
 * validation_status not being in the payload, even though every id here
 * already exists (Checkpoint 3 created these rows) and the statement was
 * only ever going to update them. bulk_set_import_row_outcome (migration
 * 0010) is a real UPDATE statement with no INSERT branch at all, so this
 * doesn't apply.
 */
export async function updateRowOutcomes(
  updates: { id: string; outcome: ImportRowOutcome; mappedProductId: string | null }[],
  client?: SupabaseClientLike,
): Promise<void> {
  const supabase = client ?? (await createServerSupabaseClient());
  for (let i = 0; i < updates.length; i += UPDATE_CHUNK_SIZE) {
    const chunk = updates.slice(i, i + UPDATE_CHUNK_SIZE);
    const payload = chunk.map((u) => ({ id: u.id, outcome: u.outcome, mapped_product_id: u.mappedProductId }));
    const { error } = await supabase.rpc("bulk_set_import_row_outcome", { updates: payload });
    if (error) throw error;
  }
}
