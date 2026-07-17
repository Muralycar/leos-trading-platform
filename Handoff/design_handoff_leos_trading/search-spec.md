# Part-Number Search Specification

## Searchable Fields
Exact OEM part number · Partial OEM part number · Internal SKU (only if flagged public) · Alternative part number · Superseded part number · Description · Brand · Equipment model · Application.

## Normalization Rules (apply to both stored values and incoming query)
- Case-insensitive (uppercase both sides before comparing).
- Collapse/ignore internal whitespace differences.
- Treat hyphens, dots, and slashes as optional/equivalent separators — strip them for a "normalized" comparison field (`*_normalized` columns in `data-model.md`), while always displaying the original formatted value.
- Example: a stored number `5801-23-4560` must also be found by `5801234560`, `5801 23 4560`, and reasonable partial fragments (`5801-23`, `23-4560`) via partial/`LIKE`/trigram match on the normalized field — but avoid overly broad fuzzy matching (no full Levenshtein/typo-tolerant matching against short numeric codes; that produces irrelevant results at this data density).

## Ranking Order
1. Exact match on normalized OEM part number.
2. Exact match on normalized alternative/superseded part number.
3. Partial match on normalized OEM/alternative part number.
4. Match on description, application, or brand (full-text).

## Implementation Approach (Postgres/Supabase)
- Add generated `*_normalized` columns (`regexp_replace(upper(value), '[-./\s]', '', 'g')`) on `products.oem_part_number` and `product_identifiers.value`.
- `pg_trgm` GIN index on the normalized columns for fast partial/similarity search at tens-of-thousands-of-rows scale.
- Postgres full-text (`tsvector`) index on `description || application` for the description/application fallback tier.
- A single `/api/search` route runs the four-tier query in order, `UNION`-ing with a rank column, returns top N with `LIMIT`/`OFFSET` for pagination; debounce the client input (≈300ms) before firing.

## Result Display
Each result shows: brand, OEM part number, description, category, equipment/application (when present), availability, quantity (only when the admin has flagged that brand/product for public quantity display — otherwise status only), image (or placeholder), Request Quotation button, WhatsApp Inquiry button.

**Never expose**: purchase cost, supplier name/reference, internal notes, warehouse cost, private documents, unpublished/draft stock.

## Availability Labels
`IN STOCK` · `LIMITED STOCK` · `AVAILABILITY ON REQUEST` · `OUT OF STOCK` (four states — the current prototype only implements the first three since no real row currently has zero stock; add `OUT OF STOCK` when a real zero-quantity, still-orderable-via-sourcing product exists).

## Filters
Brand, product category, equipment category, equipment model, availability, condition, genuine/aftermarket, country of origin (when populated). **Generated dynamically from published inventory** — a brand/category is only offered as a filter once at least one published product references it. Do not hard-code Kohler/Iveco/Kobelco/Toyota as the filter universe.

## No-Result Workflow
On zero matches, show "PART NOT FOUND IN CURRENT ONLINE STOCK" plus a Request-a-Part form with: part number (pre-filled from the search query), brand (select, optional), equipment model, photo upload, datasheet upload, required quantity, message — submit routes into `rfq_enquiries` with `source: 'search_no_result'`, and offer a WhatsApp continuation button alongside the form.

## Search Analytics (admin-facing)
Log every search query (term + result count + timestamp, no other personal data) to power an admin view of: most-searched part numbers, zero-result searches, brands receiving the most searches, products receiving the most enquiries (join against `rfq_enquiries.product_id`).
