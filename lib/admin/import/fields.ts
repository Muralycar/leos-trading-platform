// The full set of columns a spreadsheet row can map to. Kept as one shared
// list so the mapping form, the required-field check, the duplicate-target
// check, and the mapping-preview labels can never drift out of sync with
// each other.

export interface ImportTargetField {
  key: string;
  label: string;
  required?: boolean;
}

export const IMPORT_TARGET_FIELDS: ImportTargetField[] = [
  { key: "oem_part_number", label: "OEM Part Number", required: true },
  { key: "description", label: "Description", required: true },
  { key: "quantity", label: "Quantity", required: true },
  { key: "condition", label: "Condition" },
  { key: "warehouse_location", label: "Warehouse Location" },
  { key: "bin_location", label: "Bin Location" },
  { key: "arrival_date", label: "Arrival Date" },
  { key: "country_of_origin", label: "Country of Origin" },
  { key: "weight", label: "Weight" },
  { key: "dimensions", label: "Dimensions" },
  { key: "price", label: "Price" },
  { key: "currency", label: "Currency" },
  { key: "min_order_qty", label: "Min Order Qty" },
  { key: "public_notes", label: "Public Notes" },
  { key: "internal_notes", label: "Internal Notes (private)" },
  { key: "supplier_reference", label: "Supplier Reference (private)" },
  { key: "purchase_reference", label: "Purchase Reference (private)" },
];

export const REQUIRED_IMPORT_FIELD_KEYS = IMPORT_TARGET_FIELDS.filter((f) => f.required).map((f) => f.key);

export function importFieldLabel(key: string): string {
  return IMPORT_TARGET_FIELDS.find((f) => f.key === key)?.label ?? key;
}
