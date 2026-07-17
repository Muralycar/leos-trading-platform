# Handoff: Leos Trading FZE — Industrial Parts Platform

## Overview
Lead-generation website for Leos Trading FZE (UAE-based OEM/aftermarket industrial parts trading and sourcing). Core commercial feature is part-number/description/brand search across a multi-brand inventory, driving RFQ and WhatsApp inquiries. Not e-commerce — no cart/checkout.

## About the Design Files
The files in `/source` are **HTML/CSS/JS design references** — static prototypes showing approved look, copy, layout and interaction, built with hand-written HTML, one shared `styles.css`, and a flat `data.js` array standing in for a real database. They are not production code to copy verbatim. Your task is to **recreate these screens in Next.js/TypeScript/Tailwind**, replacing the static `data.js` with live Supabase queries, using Tailwind's config to encode the design tokens below — not to iframe or lightly wrap the HTML.

## Fidelity
**High-fidelity.** Colors, type, spacing, copy and component states in `/source` are final/approved. Recreate pixel-for-pixel using Tailwind utilities generated from the tokens in `design-system.md`. Do not redesign; only change what's needed for accessibility or technical correctness (call those out explicitly in your PR).

## Required Production Stack
Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth + Storage) · Vercel hosting.

## Suggested Folder Structure
```
/app
  /(site)/page.tsx                → Homepage
  /(site)/search/page.tsx         → Inventory search
  /(site)/parts/[brand]/[sku]/page.tsx → Product detail
  /(site)/brands/page.tsx, /brands/[brand]/page.tsx
  /(site)/categories/[category]/page.tsx
  /(site)/sourcing/page.tsx, /export/page.tsx, /about/page.tsx, /contact/page.tsx
  /admin/...                      → Auth-gated dashboard (see admin-spec.md)
  /api/search, /api/rfq, /api/import/...
/components                       → see components.md
/lib/supabase, /lib/search, /lib/import
/styles/tokens.ts or tailwind.config.ts
```

## Environment Variables (template)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-only, used by import/admin routes
RFQ_NOTIFICATION_EMAIL=trade@leosdubai.com
RESEND_API_KEY=                  # or other transactional email provider
NEXT_PUBLIC_SITE_URL=https://www.leosdubai.com
```

## Implementation Phases → Deliverables Map
1. **Source code** — scaffold Next.js app, port pages/components from `/source` (see `pages.md`, `components.md`).
2. **Database** — apply schema in `data-model.md` to Supabase.
3. **Admin** — build `/admin` per `admin-spec.md`, gated by Supabase Auth.
4. **Inventory import** — implement workflow in `inventory-import-spec.md`.
5. **Public search** — implement ranking/normalization in `search-spec.md`, backed by Postgres full-text + trigram indexes.
6. **Publication** — publish flag on `products`; queries everywhere filter `status = 'published'`.
7. **RFQ** — wire all RFQ/Request-a-Part/Contact forms to `rfq_enquiries` table + email notification.
8. **Deployment** — GitHub → Vercel, staging (`staging.leosdubai.com`) before production cutover of `www.leosdubai.com`.
9. **Testing** — acceptance criteria below.

## Acceptance Criteria (must all pass before calling this "done")
- Admin creates brand "Toyota", uploads a spreadsheet, maps columns, imports as drafts, publishes selected rows.
- Toyota then appears automatically in: brand filter, category filter, brand page, sitemap — with zero code changes.
- Searching an exact OEM part number returns that product first.
- Searching a reasonable punctuation/spacing variant of a real part number still finds it.
- A no-match search opens the Request-a-Part form pre-filled with the searched text.
- RFQ/Request-a-Part/Contact submissions land in `rfq_enquiries` and trigger an email to `trade@leosdubai.com`.
- Mobile drawer nav, dropdown mega-menu, and all form/empty/loading states match `/source`.
- No part number, brand, or quantity anywhere in the UI is invented — only real imported data or explicit "Sourcing Network" language for uncovered categories.

## Known Limitations of the `/source` Prototype
- `data.js` contains a 21-row curated sample (real SKUs/quantities from client spreadsheets — see `inventory-examples.md`), not the full 2,257-row dataset. Full spreadsheets are with the client; request them for the real import.
- No backend exists: search, filters and RFQ "submit" are client-side only (in-memory array filter; form submit just swaps a confirmation panel).
- Image slots for categories/hero/warehouse are placeholders (`<image-slot>` custom element) — real photography is pending per `image-asset-map.md`.
- Admin dashboard was never built as HTML — only specified in `admin-spec.md`. Build from spec, not from a mockup.

## Items Requiring Credentials / Business Confirmation
- Supabase project + keys, Vercel project, GitHub repo access.
- Domain/DNS access for `staging.leosdubai.com` and cutover of `www.leosdubai.com`.
- Transactional email provider account for RFQ notifications.
- The 3 full inventory spreadsheets (Kohler/Iveco/Kobelco) plus any new brand files, from the client.
- Final confirmation of which fields (cost, supplier) must stay admin-only vs. which can ever be public — treat all cost/supplier data as private by default until told otherwise.

## Files
See `/source` for the approved HTML/CSS/JS. See the other markdown files in this folder for design tokens, component inventory, page specs, routes, data model, import spec, search spec, and admin spec.
