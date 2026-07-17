-- Admin-facing counterpart to product_public_view: every status (not just
-- published), plus private fields (price, internal_notes, ...) the public
-- view deliberately omits.
--
-- Unlike product_public_view/product_public_availability (0001/0002),
-- which are plain views that intentionally bypass RLS to aggregate data
-- anon has no direct grant on, this one is created WITH
-- (security_invoker = true) — it runs as the querying user, so it inherits
-- RLS from products/inventory_batches ("staff full access") normally.
-- Staff already have real SELECT grants on those tables via existing
-- policies, so this is correct rather than redundant: even if application
-- code ever forgot a role check, the database would still block a
-- non-staff query against this view.

create view product_admin_view with (security_invoker = true) as
select
  p.id,
  p.brand_id,
  b.slug as brand_slug,
  b.name as brand_name,
  p.equipment_category_id,
  ec.slug as equipment_category_slug,
  ec.name as equipment_category_name,
  p.oem_part_number,
  p.oem_part_number_normalized,
  p.description,
  p.equipment_make,
  p.equipment_model,
  p.application,
  p.condition,
  p.country_of_origin,
  p.weight,
  p.dimensions,
  p.price,
  p.currency,
  p.min_order_qty,
  p.public_notes,
  p.internal_notes,
  p.status,
  p.created_at,
  p.updated_at,
  coalesce(av.quantity, 0) as quantity,
  coalesce(av.status, 'out_of_stock') as availability_status
from products p
join brands b on b.id = p.brand_id
join equipment_categories ec on ec.id = p.equipment_category_id
left join product_public_availability av on av.product_id = p.id;
