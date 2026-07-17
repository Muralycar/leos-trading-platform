# Page-by-Page Specification

Each entry: source file → intended route → section order → data requirements. Full copy is in the source HTML; only non-obvious/dynamic copy is repeated here.

## Homepage (`source/index.html` → `/`)
1. Header (global)
2. Hero — headline "PARTS & EQUIPMENT. SOURCED FROM THE UAE.", subhead, search bar, two CTAs, background image slot.
3. Stat strip — 4 numbers, must be live-computed (see `components.md`).
4. Categories grid — 6 cards from `LEOS_CATEGORIES` equivalent (dynamic).
5. "Why Leos" 4-up feature grid — static copy.
6. Inventory-depth split (image + copy + checklist) — static copy, image placeholder.
7. Brand strip — scrolling/wrapping list of all supported brand names, dynamic (all brands across all category groups).
8. Featured Parts — 4 product cards, most-recent-or-highest-stock published products.
9. CTA banner — WhatsApp + "Request a Part".
10. Footer (global).

## Inventory Search (`source/search.html` → `/search`)
1. Header
2. Search hero band — page title + big search input (reads `?q=` from URL, debounce on type).
3. Two-column layout: filter sidebar (Brand/Category/Availability, dynamic per `components.md`) + results.
4. Results header — live count + sort select (Relevance / Part Number / Stock Availability).
5. Result list — `.result-row` per match; empty state per `components.md` when zero.
6. Footer.
- **URL params supported**: `q` (free text), `cat` (pre-check one category), `brand` (pre-check one brand) — used by homepage category cards and nav links.

## Product Detail (`source/product.html` → `/parts/[brand]/[sku]`)
1. Header
2. Breadcrumb
3. Two-column: image gallery (real image or placeholder) + detail panel (brand/category/status tags, SKU, name, generated description sentence, spec table [Brand, Category—Subcategory, Available Quantity], action buttons [Request Quotation → `#rfq`, WhatsApp Inquiry with pre-filled message, Email Inquiry `mailto:` with subject], technical-notes box, collapsible SEO metadata panel).
4. Related Parts — same-category products, excluding current, max 4.
5. RFQ section (`#rfq`) — sticky summary column + form (pre-filled with this SKU) + confirmation state.
6. Footer.
- **Note**: current schema has no `altSku`/`application`/`compatibleModels`/`condition` fields because the real spreadsheets didn't include them — add back only if/when the client supplies that data; never fabricate.

## About (`source/about.html` → `/about`)
Page header → "What We Do" split (image + icon list) → 4-step "How We Work" process → stat strip → CTA banner (→ Contact). All static copy.

## Export (`source/export.html` → `/export`)
Page header → capability split (icon list + image, reversed layout) → 4-step shipping process → CTA banner (→ Contact). All static copy.

## Sourcing (`source/sourcing.html` → `/sourcing`)
Page header → `#request` (generic RFQ form, no pre-filled SKU) → `#hard-to-find` (split, reversed) → `#obsolete` (split) → `#genuine-aftermarket` (2-col comparison: Genuine OEM vs Aftermarket) → `#procurement` (4-step process) → CTA banner (→ `#request`). Anchors are linked directly from the header's Sourcing dropdown.

## Contact (`source/contact.html` → `/contact`)
Page header → two-column: contact-info card (address/phone/WhatsApp/email as `.contact-line` rows) + generic RFQ form. Contact details must come from global settings, not be hard-coded in the template.

## Brands (`source/brands.html` → `/brands`)
Page header → brand directory (grouped chips, dynamic per `components.md`) → CTA banner (→ `/sourcing#request`).
- **Brand detail** (`/brands/[brand]`) does not exist as a static mockup yet — build it following the Product Detail page's visual language: brand hero, live SKU count, category breakdown, filtered product grid (reuse Search's result list).

## Brand Guidelines (`source/brand-guidelines.html` → internal reference only, not a public route)
Design-system documentation page (positioning, logo usage, color, type, photography enhancement guide with per-image analysis, component samples, iconography, motion, scalability plan). Useful as living style-guide reference; do not ship as a public marketing page unless the client asks.

## Category Detail (`/categories/[category]`) — not yet mocked
Build following Product Category conventions already established by the homepage category cards + Search's filtered view: category hero, brand(s) under this category, filtered product grid.

## Not Yet Designed
Admin dashboard (`/admin/**`) — build from `admin-spec.md` and `inventory-import-spec.md` only; there is no HTML mockup for these screens. Use the same design tokens (dark theme, brass accent, mono for data-dense areas) for visual consistency, but the admin can be denser/more utilitarian than the public site.
