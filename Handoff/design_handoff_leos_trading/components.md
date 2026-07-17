# Component Inventory

Each component references its source markup/CSS in `/source`. Build each as a typed React component accepting the listed data props.

## Header / Desktop Navigation
- **Purpose**: global nav + primary CTA + contact shortcuts.
- **Content**: crest logo (small) + "LEOS TRADING / SALES · SERVICE · RENTAL" wordmark, flat links (Home, Brands, Export, About), two dropdown groups (Products: 6 category links; Inventory: Search All Stock + one link per live brand + Recently Added), Sourcing dropdown (5 anchor links into `/sourcing`), phone icon, WhatsApp icon, "Request Quotation" button.
- **Variants**: sticky, blurred background (`backdrop-filter: blur(10px)`), `.active` state on current top-level link.
- **Responsive**: ≥1180px shows full nav; below that, nav + primary button hide, hamburger shows.
- **Data required**: brand list (for Inventory dropdown, must be generated — do not hard-code 3 brands), category list (Products dropdown), global contact settings (phone, WhatsApp number).

## Mobile Navigation Drawer
- **Purpose**: full-screen nav overlay below 1180px.
- **Behavior**: hamburger button toggles `.open` class (fixed overlay, full viewport, `z-index:200`); close button top-right. Currently a flat link list (Home, 3 category links, Search All Stock, Brands, Request a Part, Sourcing, Export, About, Contact) — flatten the desktop dropdowns for mobile rather than nesting accordions, to keep it a single tap away.
- **Data required**: same as desktop nav, flattened.

## Hero
- **Purpose**: homepage top section — headline, subhead, search bar, two CTAs, full-bleed background image slot.
- **Content fields**: headline (`PARTS & EQUIPMENT. SOURCED FROM THE UAE.`), subhead, background image, primary CTA → `/search`, secondary CTA → `/sourcing#request`.
- **Behavior**: search form submits query string to `/search?q=`.

## Search Bar (hero + search page)
- **Purpose**: primary discovery input.
- **States**: default, focused (brass border), with query (page loads pre-filled from `?q=`).
- **Data required**: none client-side beyond query string; server does the actual search (see `search-spec.md`).

## Stat Strip
- **Purpose**: trust-building numeric proof (SKU count, units in stock, live-brand count, coverage).
- **Data required**: computed aggregates from `products` table (`COUNT(*) WHERE status='published'`, `SUM(quantity)`), not hard-coded — must update as inventory grows.

## Category Card
- **Purpose**: homepage/products-overview tile per equipment category.
- **Variants**: `live` (status tag = SKU count, "View Inventory" CTA) vs `sourcing`/`onboarding` (status tag = "Sourcing Network"/"Onboarding", "Request a Part" CTA, dimmed image).
- **Data required**: category name, associated brand(s), live SKU count, representative image (nullable → image placeholder).

## Brand Card / Brand Directory
- **Purpose**: `/brands` page — brands grouped by equipment category, rendered as chip lists.
- **Data required**: brand → category group mapping; must render dynamically as brands are added (never hard-code the 3 launch brands).

## Product / Part Card
- **Purpose**: used in featured-inventory grid, search results (list variant), related-parts grid.
- **Content fields**: image (nullable), SKU (mono, brass), name, brand tag, availability tag.
- **Variants**: grid card (square media) vs. list row (`.result-row`, 5-column: thumb / sku+name+category / brand / qty / status).
- **Data required**: sku, name, brand, category, sub-category, quantity, computed status.

## Filter Sidebar
- **Purpose**: `/search` left rail — brand, category, availability checkboxes.
- **Behavior**: must be **generated dynamically** from published inventory (a newly published brand/category appears as a filter automatically, no code change). Counts next to each option = live count of published, matching records.
- **Data required**: distinct brands/categories with counts, from the database — not the static array in `data.js`.

## Empty / No-Results State
- **Purpose**: shown when a search returns zero rows.
- **Content**: "No exact match found" + explanatory copy + "Send Part Number or Equipment Details" CTA.
- **Behavior**: CTA links to Request-a-Part form with the searched query **pre-filled** into the part-number field.

## RFQ / Request-a-Part Form
- **Purpose**: appears on product pages (`#rfq`, pre-filled with that SKU), `/sourcing#request` (generic), `/contact` (generic).
- **Fields**: Name*, Company, Email*, Phone, Part Number/Equipment Details (pre-fillable), Quantity Required, Message.
- **States**: default form → on submit, form hides and a confirmation panel shows (checkmark icon + "Request received").
- **Behavior (production)**: POST to `/api/rfq`, insert into `rfq_enquiries`, send email notification to `trade@leosdubai.com`, then show the same confirmation state. Attachment upload (photo/datasheet) should be added here per the import-adjacent brief — store in Supabase Storage, reference in `rfq_enquiries.attachment_url`.

## WhatsApp Button
- **Purpose**: `https://wa.me/<number>?text=<prefilled inquiry>` — used in header, product actions, CTA banners.
- **Data required**: global WhatsApp number from settings (not hard-coded per instance).

## Availability Badge
- **Purpose**: single source of truth for stock language — "In Stock" (green), "Limited Stock" (amber), "Availability On Request" (gray). Never a 4th ad hoc state.
- **Logic**: server-computed from real `quantity`/`status`, thresholds configurable (current prototype: `stock <= 2` → limited).

## SEO Metadata Panel
- **Purpose**: collapsible `<details>` on product page showing computed meta title/description/slug/structured-data note. In production this should be generated at build/request time and also emitted as real `<meta>`/JSON-LD tags — the visible panel is optional dev/QA sugar, not required in the final UI unless the client wants it kept.

## Footer
- **Purpose**: brand blurb, Products links, Company links, Contact block (address/phones/email), bottom bar (copyright + tagline).
- **Data required**: global settings (address, phones, email), category list (must stay in sync with live categories).

## Breadcrumb
- **Purpose**: product page only — Home / Category / Brand / SKU, each a real link.

## Step List / Icon List
- **Purpose**: generic numbered-process and checkmark-list patterns reused across About/Export/Sourcing — static content components, no dynamic data.
