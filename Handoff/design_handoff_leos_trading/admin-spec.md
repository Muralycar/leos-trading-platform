# Admin Functional Requirements

## Launch-Required
- **Secure login** — Supabase Auth (email/password or magic link), roles: `admin`, `editor`, `viewer` (see `data-model.md#users--roles`). All `/admin/**` routes and mutation API routes check role server-side, not just client-side.
- **Media library** — upload/replace images (product photos, category/hero placeholders, brand logos) to Supabase Storage; used across product/category/brand editors.
- **Page content editing** — edit copy blocks on About/Export/Sourcing/Contact (`pages` table) without a redeploy.
- **Brand management** — create/edit/archive brands (name, slug, logo, description, industries, SEO fields).
- **Category management** — create/edit both `equipment_categories` and `product_categories`; set parent/child relationships.
- **Product management** — create/edit individual products by hand (not just via import); bulk actions: publish, unpublish, change brand, change category, change availability, assign image, archive, delete (delete gated to `admin` role only).
- **Stock quantity updates** — edit `inventory_batches` quantities directly, or via re-import.
- **Excel/CSV import** — full workflow per `inventory-import-spec.md`.
- **Draft/publish workflow** — every new product (manual or imported) defaults to `draft`; explicit publish action required.
- **RFQ management** — list/filter `rfq_enquiries` by status/source/date, mark status (new/contacted/quoted/won/lost), view attachment.
- **Global contact settings** — edit phone numbers, WhatsApp number, email, address (feeds header/footer/contact page everywhere, single source of truth).
- **Preview before publish** — draft products/pages viewable via a signed preview URL before going live.

## Important, Can Follow Launch
- **SEO settings per page/product** — override meta title/description/canonical beyond the generated defaults.
- **Version history** — track edits to products/pages with rollback.
- **Audit log** — who changed what, when (import actions, publishes, deletes especially).
- **Saved import templates management UI** — view/edit/delete `import_templates` outside the live import flow.
- **Search analytics dashboard** — most-searched terms, zero-result searches, per-brand search volume, per-product enquiry volume (data captured from launch per `search-spec.md`, dashboard view can follow).

## Explicitly Out of Scope for This Handoff
- Multi-warehouse logistics/fulfillment beyond simple location/bin fields.
- Payment processing (site is lead-gen, not e-commerce).
- Customer accounts/login (no public-facing auth needed).
