-- Structural data with no spreadsheet involved — mirrors what's currently
-- hand-authored in lib/placeholder-data.ts, lib/data/categorize.ts, and
-- SITE_SETTINGS. Idempotent (on conflict do nothing) so it's safe to re-run.
-- Run once after applying 0001_init_schema.sql, before scripts/migrate-to-supabase.mts.
--
-- Note: equipment_categories here only carries the columns the reviewed
-- schema defines (id/name/slug/parent_id). The "live vs sourcing" status,
-- brand label copy, and category images that lib/placeholder-data.ts
-- currently hardcodes are presentation config, not inventory data — they
-- stay in application code for now ("live" becomes "has ≥1 published
-- product", computed, not stored) rather than adding un-reviewed columns
-- here.

insert into equipment_categories (name, slug) values
  ('Truck Parts', 'truck-parts'),
  ('Construction Equipment Parts', 'construction-equipment-parts'),
  ('Generator Parts', 'generator-parts'),
  ('Mining & Industrial Parts', 'mining-industrial-parts'),
  ('Marine Parts', 'marine-parts'),
  ('Tyres, Batteries & Accessories', 'tyres-batteries-accessories')
on conflict (slug) do nothing;

insert into product_categories (name, slug) values
  ('Filters', 'filters'),
  ('Gaskets & Seals', 'gaskets-seals'),
  ('Bearings & Bushings', 'bearings-bushings'),
  ('Pumps', 'pumps'),
  ('Electrical', 'electrical'),
  ('Engine Components', 'engine-components'),
  ('Hoses & Fittings', 'hoses-fittings'),
  ('Belts', 'belts'),
  ('Brake & Suspension', 'brake-suspension'),
  ('Body & Cab', 'body-cab'),
  ('Fasteners & Hardware', 'fasteners-hardware'),
  ('General Hardware', 'general-hardware')
on conflict (slug) do nothing;

insert into brands (name, slug, status) values
  ('Kohler', 'kohler', 'active'),
  ('Iveco', 'iveco', 'active'),
  ('Kobelco', 'kobelco', 'active')
on conflict (slug) do nothing;

insert into settings (id, phone_primary, phone_secondary, whatsapp_number, email, address) values
  (true, '+971 50 848 9640', '+971 50 285 1056', '971508489640', 'trade@leosdubai.com', 'SRTIP, Sharjah, UAE')
on conflict (id) do nothing;
