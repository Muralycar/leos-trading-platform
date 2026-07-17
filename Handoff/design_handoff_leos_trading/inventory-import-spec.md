# Inventory Import Specification

## Workflow
1. **Upload** — admin uploads `.xlsx`, `.xls`, or `.csv` to `/admin/import`. File stored in Supabase Storage, row inserted into `import_jobs` (status `pending`).
2. **Select or create brand** — dropdown of existing `brands` + "Create new brand" inline action.
3. **Select equipment category** — existing `equipment_categories` + "create new" inline action. This becomes the default for all rows unless overridden by a column mapping or rule (step 6).
4. **Detect headers** — parse first row of the sheet as candidate column headers; show them to the admin.
5. **Map columns** — admin maps each detected column to a target field from the supported-fields list below. If a brand already has a saved `import_templates` row, pre-fill the mapping and let the admin adjust before continuing.
6. **Save mapping as reusable template** — prompt "Save this mapping as a template for [Brand]?" → upsert `import_templates`.
7. **Validate rows** — required-field check (see minimum required fields below), type checks (quantity numeric ≥0), normalize `oem_part_number` (uppercase, strip whitespace/punctuation for the dedupe key only — display value keeps original formatting).
8. **Detect duplicates** — match on `(brand_id, oem_part_number_normalized)` against existing `products`. Also flag in-file duplicates (same key appearing twice in the upload).
9. **Preview category assignment** — apply keyword-based classification rules (see Rule Engine below) to suggest a `product_category`; anything below a confidence threshold (or with no rule match) is marked `needs_review`, never auto-published.
10. **Choose update behavior for existing matches** — per row-group or globally: skip / update all mapped fields / update quantity only (replace or add) / update descriptions only if empty / update images only if empty / import as a separate stock batch / mark for manual review.
11. **Preview** — summary screen before commit: total rows, valid, new, existing/updates, duplicates, missing part numbers, missing descriptions, invalid quantities, unrecognized categories, unrecognized brands, rows needing manual review. Admin can inspect/edit individual problem rows inline.
12. **Confirm import** — writes `import_rows` → creates/updates `products` (status always `draft` for new rows) → creates `inventory_batches`. Generates an **import report** (counts from the preview, downloadable/log entry).
13. **Review & publish** — admin reviews drafts in `/admin/products?status=draft`, assigns images, corrects categories, edits descriptions individually or in bulk, then publishes (bulk or one-by-one).

## Supported Import Fields
Internal SKU (system-generated if absent) · OEM part number · Alternative part number · Superseded part number · Description · Brand · Manufacturer · Product category · Subcategory · Equipment category · Equipment make · Equipment model · Application · Engine model · Chassis/model series · Quantity · Unit of measurement · Condition · Availability status · Warehouse location · Bin/shelf location · Country of origin · Manufacturer reference · Package quantity · Weight · Dimensions · Purchase reference (private) · Internal notes (private) · Public notes · Image filename/URL · Datasheet filename · Price (private unless confirmed public) · Currency · Minimum order quantity · Date received.

**Minimum required** (admin-adjustable in import settings): Brand, OEM part number *or* internal SKU, Description.

**Never invent missing technical information** — a mapped-but-empty cell stays empty; do not backfill with placeholder text.

## Category Rule Engine
Reusable, admin-editable keyword rules, e.g.:
- description contains `FILTER` → suggest product category "Filters"
- description contains `GASKET` or `SEAL` → "Gaskets & Seals"
- description contains `PUMP` → "Pumps"
- description contains `RELAY`, `FUSE`, `SOLENOID`, `ALTERNATOR`, `SENSOR` → "Electrical"
- brand = X and equipment_category = Truck → equipment_category "Truck Parts" (brand/category combination rules)

Rules **suggest**, they never silently overwrite a category an admin has manually confirmed on a previously-published product — re-imports of the same SKU keep the confirmed category unless the admin explicitly changes it.

## Validation Rules Summary
- `oem_part_number` or internal SKU: required, becomes part of the normalized dedupe key.
- `quantity`: numeric, ≥ 0; non-numeric or negative → row flagged `invalid_quantity`, excluded from auto-import, surfaced for manual fix.
- `brand`, `equipment_category`: must resolve to an existing or newly-created record before the row can be marked `valid`; otherwise `unrecognized_brand` / `unrecognized_category`.
- Duplicate key within the same file: keep the first occurrence as primary, flag subsequent ones for review (do not silently sum/overwrite without the admin's chosen update behavior).

## Import Report
Per job: total rows, valid, new products created, existing products updated, duplicates found (in-file and against DB), rows missing part numbers, rows missing descriptions, invalid quantities, unrecognized categories, unrecognized brands, rows requiring manual review — persisted against the `import_jobs` row so it's auditable later, not just shown once in the UI.
