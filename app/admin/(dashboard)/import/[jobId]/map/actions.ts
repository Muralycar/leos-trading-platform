"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/admin/auth";
import { getImportJob } from "@/lib/admin/import/jobs";
import { saveTemplateForBrand } from "@/lib/admin/import/templates";
import { downloadJobFile } from "@/lib/admin/import/storage";
import { parseWorkbook } from "@/lib/admin/import/parseSheet";
import { REQUIRED_IMPORT_FIELD_KEYS, importFieldLabel } from "@/lib/admin/import/fields";
import { normalizePartNumber } from "@/lib/part-number";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ImportRowStatus, ImportRowOutcome } from "@/lib/supabase/types";

const INSERT_CHUNK_SIZE = 500;

function mapError(jobId: string, message: string): never {
  redirect(`/admin/import/${jobId}/map?error=${encodeURIComponent(message)}`);
}

function cellToString(value: unknown): string {
  return value === undefined || value === null ? "" : String(value).trim();
}

interface MappingSelection {
  /** header index -> target field key, "ignore" columns excluded */
  idxToField: Record<number, string>;
}

function parseMappingForm(formData: FormData, headerCount: number, jobId: string): MappingSelection {
  const idxToField: Record<number, string> = {};
  const fieldCounts: Record<string, number> = {};

  for (let i = 0; i < headerCount; i++) {
    const value = String(formData.get(`mapping_${i}`) ?? "");
    if (!value) continue;
    idxToField[i] = value;
    fieldCounts[value] = (fieldCounts[value] ?? 0) + 1;
  }

  const duplicated = Object.entries(fieldCounts).find(([, count]) => count > 1);
  if (duplicated) {
    mapError(jobId, `“${importFieldLabel(duplicated[0])}” is mapped to more than one column — each field can only be mapped once.`);
  }

  const mappedFields = new Set(Object.values(idxToField));
  const missing = REQUIRED_IMPORT_FIELD_KEYS.filter((key) => !mappedFields.has(key));
  if (missing.length > 0) {
    mapError(jobId, `Map a column to: ${missing.map(importFieldLabel).join(", ")} before continuing.`);
  }

  return { idxToField };
}

interface RowResult {
  raw_data: { mapped: Record<string, unknown>; original: unknown[] };
  validation_status: ImportRowStatus;
  outcome: ImportRowOutcome | null;
  error_notes: string | null;
  normalizedPartNumber: string | null;
}

function evaluateRow(row: unknown[], idxToField: Record<number, string>): RowResult {
  const mapped: Record<string, unknown> = {};
  for (const [idxStr, field] of Object.entries(idxToField)) {
    mapped[field] = row[Number(idxStr)];
  }

  const oemRaw = cellToString(mapped.oem_part_number);
  const descRaw = cellToString(mapped.description);
  const qtyRaw = mapped.quantity;
  const qtyStr = cellToString(qtyRaw);

  const reasons: string[] = [];
  if (!oemRaw) reasons.push("Missing OEM part number");
  if (!descRaw) reasons.push("Missing description");
  if (!qtyStr) {
    reasons.push("Missing quantity");
  } else {
    const n = typeof qtyRaw === "number" ? qtyRaw : Number(qtyStr);
    if (!Number.isFinite(n) || n < 0) reasons.push(`Quantity '${qtyStr}' is not a valid number`);
  }

  if (reasons.length > 0) {
    return {
      raw_data: { mapped, original: row },
      validation_status: "missing_required",
      outcome: "error",
      error_notes: reasons.join("; "),
      normalizedPartNumber: null,
    };
  }

  return {
    raw_data: { mapped, original: row },
    validation_status: "valid",
    outcome: null,
    error_notes: null,
    normalizedPartNumber: normalizePartNumber(oemRaw),
  };
}

export async function saveMapping(jobId: string, formData: FormData) {
  const profile = await requireRole("editor", "admin");
  const job = await getImportJob(jobId);
  if (!job) redirect("/admin/import?error=" + encodeURIComponent("Import job not found."));
  if (!job.brandId || !job.headers) {
    redirect("/admin/import?error=" + encodeURIComponent("This job isn't ready for mapping."));
  }
  if (job.status !== "mapped" && job.status !== "validated") {
    redirect("/admin/import?error=" + encodeURIComponent("This job isn't ready for mapping."));
  }

  const equipmentCategoryId = String(formData.get("equipment_category_id") ?? "");
  if (!equipmentCategoryId) mapError(jobId, "Select a default equipment category for new products from this file.");

  const { idxToField } = parseMappingForm(formData, job.headers.length, jobId);

  const supabase = await createServerSupabaseClient();
  const bytes = await downloadJobFile(supabase, job.storagePath);
  const { dataRows } = parseWorkbook(bytes);

  const results = dataRows.map((row) => evaluateRow(row, idxToField));

  // Rows with the same normalized part number are never rejected or merged
  // — they become multiple batches under one product later. Here they're
  // only tagged 'duplicate' (informational) instead of 'valid', and counted
  // for the mapping-confirmation screen's "repeated part numbers" callout.
  const countsByPartNumber = new Map<string, number>();
  for (const r of results) {
    if (r.normalizedPartNumber) countsByPartNumber.set(r.normalizedPartNumber, (countsByPartNumber.get(r.normalizedPartNumber) ?? 0) + 1);
  }
  for (const r of results) {
    if (r.normalizedPartNumber && (countsByPartNumber.get(r.normalizedPartNumber) ?? 0) > 1) {
      r.validation_status = "duplicate";
    }
  }

  const repeatedPartNumbers = [...countsByPartNumber.entries()]
    .filter(([, count]) => count > 1)
    .map(([partNumber, count]) => ({ partNumber, count }));

  const errorSamples = results
    .map((r, i) => ({ rowNumber: i + 2, reason: r.error_notes })) // +2: header is row 1, data starts at row 2
    .filter((r): r is { rowNumber: number; reason: string } => r.reason !== null)
    .slice(0, 25);

  const validCount = results.filter((r) => r.validation_status === "valid").length;
  const duplicateCount = results.filter((r) => r.validation_status === "duplicate").length;
  const errorCount = results.filter((r) => r.validation_status === "missing_required").length;

  const { error: deleteError } = await supabase.from("import_rows").delete().eq("import_job_id", jobId);
  if (deleteError) throw deleteError;

  for (let i = 0; i < results.length; i += INSERT_CHUNK_SIZE) {
    const chunk = results.slice(i, i + INSERT_CHUNK_SIZE).map((r) => ({
      import_job_id: jobId,
      raw_data: r.raw_data,
      validation_status: r.validation_status,
      outcome: r.outcome,
      error_notes: r.error_notes,
    }));
    const { error: insertError } = await supabase.from("import_rows").insert(chunk);
    if (insertError) throw insertError;
  }

  const headerKeyedMapping: Record<string, string> = {};
  for (const [idxStr, field] of Object.entries(idxToField)) {
    const header = job.headers[Number(idxStr)];
    if (header) headerKeyedMapping[header] = field;
  }

  const previousReport = {
    headers: job.headers,
    duplicateOfJobId: null as string | null,
    duplicateOfFileName: job.duplicateOfFileName,
    duplicateOfCreatedAt: job.duplicateOfCreatedAt,
  };

  const { error: updateError } = await supabase
    .from("import_jobs")
    .update({
      status: "validated",
      equipment_category_id: equipmentCategoryId,
      report: {
        ...previousReport,
        mapping: headerKeyedMapping,
        validCount,
        duplicateCount,
        errorCount,
        errorSamples,
        repeatedPartNumbers,
      },
    })
    .eq("id", jobId);
  if (updateError) throw updateError;

  if (formData.get("save_template")) {
    await saveTemplateForBrand({
      brandId: job.brandId,
      brandName: job.brandName,
      columnMapping: headerKeyedMapping,
      defaultEquipmentCategoryId: equipmentCategoryId,
      createdBy: profile.id,
    });
  }

  revalidatePath(`/admin/import/${jobId}/map`);
  revalidatePath("/admin/import");
  redirect(`/admin/import/${jobId}/map`);
}

export async function resetMapping(jobId: string) {
  await requireRole("editor", "admin");
  const job = await getImportJob(jobId);
  if (!job) redirect("/admin/import?error=" + encodeURIComponent("Import job not found."));
  if (job.status !== "validated") {
    redirect(`/admin/import/${jobId}/map`);
  }

  const supabase = await createServerSupabaseClient();
  const { error: deleteError } = await supabase.from("import_rows").delete().eq("import_job_id", jobId);
  if (deleteError) throw deleteError;

  const { error: updateError } = await supabase
    .from("import_jobs")
    .update({
      status: "mapped",
      report: {
        headers: job.headers,
        duplicateOfJobId: null,
        duplicateOfFileName: job.duplicateOfFileName,
        duplicateOfCreatedAt: job.duplicateOfCreatedAt,
      },
    })
    .eq("id", jobId);
  if (updateError) throw updateError;

  revalidatePath(`/admin/import/${jobId}/map`);
  revalidatePath("/admin/import");
  redirect(`/admin/import/${jobId}/map`);
}
