// The full set of columns a spreadsheet row can map to. Kept as one shared
// list so the mapping form, the required-field check, the duplicate-target
// check, and the mapping-preview labels can never drift out of sync with
// each other.
//
// `target` says which table a field ends up on when Checkpoint 4 writes it:
// - oem_part_number/description/equipment_make/equipment_model/application/
//   country_of_origin/weight/dimensions/price/currency/min_order_qty/
//   public_notes/internal_notes -> products (a product-level fact).
// - quantity/condition/warehouse_location/bin_location/arrival_date/
//   supplier_reference/purchase_reference -> inventory_batches (a per-lot
//   fact — note this is deliberately NOT products.condition, which is a
//   separate, unrelated enum admins set manually via Product Management;
//   a spreadsheet's free-text "Condition" column can't be losslessly
//   coerced into that enum, so it always means the batch's condition).

import { optionalStr, optionalNum, optionalInt } from "@/lib/admin/import/coerce";

export type ImportFieldTarget = "product" | "batch";

export interface ImportTargetField {
  key: string;
  label: string;
  target: ImportFieldTarget;
  required?: boolean;
}

export const IMPORT_TARGET_FIELDS: ImportTargetField[] = [
  { key: "oem_part_number", label: "OEM Part Number", target: "product", required: true },
  { key: "description", label: "Description", target: "product", required: true },
  { key: "quantity", label: "Quantity", target: "batch", required: true },
  { key: "equipment_make", label: "Equipment Make", target: "product" },
  { key: "equipment_model", label: "Equipment Model", target: "product" },
  { key: "application", label: "Application", target: "product" },
  { key: "country_of_origin", label: "Country of Origin", target: "product" },
  { key: "weight", label: "Weight", target: "product" },
  { key: "dimensions", label: "Dimensions", target: "product" },
  { key: "price", label: "Price", target: "product" },
  { key: "currency", label: "Currency", target: "product" },
  { key: "min_order_qty", label: "Min Order Qty", target: "product" },
  { key: "public_notes", label: "Public Notes", target: "product" },
  { key: "internal_notes", label: "Internal Notes (private)", target: "product" },
  { key: "condition", label: "Condition (this batch)", target: "batch" },
  { key: "warehouse_location", label: "Warehouse Location", target: "batch" },
  { key: "bin_location", label: "Bin Location", target: "batch" },
  { key: "arrival_date", label: "Arrival Date", target: "batch" },
  { key: "supplier_reference", label: "Supplier Reference (private)", target: "batch" },
  { key: "purchase_reference", label: "Purchase Reference (private)", target: "batch" },
];

export const REQUIRED_IMPORT_FIELD_KEYS = IMPORT_TARGET_FIELDS.filter((f) => f.required).map((f) => f.key);

/** Product-level fields eligible for the "Update all mapped fields" behavior — excludes identity (oem_part_number) and batch-only fields. */
export const UPDATABLE_PRODUCT_FIELD_KEYS = IMPORT_TARGET_FIELDS.filter((f) => f.target === "product" && f.key !== "oem_part_number").map(
  (f) => f.key,
);

export function importFieldLabel(key: string): string {
  return IMPORT_TARGET_FIELDS.find((f) => f.key === key)?.label ?? key;
}

/**
 * Coerces a raw cell value to the correctly-typed value for a given
 * UPDATABLE_PRODUCT_FIELD_KEYS member — weight/price are numeric,
 * min_order_qty is integer, everything else is text. One place for this
 * mapping so the "update all mapped fields" write path and any future
 * caller can't drift into disagreeing about a field's type.
 */
export function coerceProductFieldValue(key: string, rawValue: unknown): string | number | null {
  if (key === "weight" || key === "price") return optionalNum(rawValue);
  if (key === "min_order_qty") return optionalInt(rawValue);
  return optionalStr(rawValue);
}
