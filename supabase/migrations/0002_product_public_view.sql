-- Flattens exactly what public pages need per product (brand/category
-- names, one product category, availability, primary image) into one row,
-- so lib/data/inventory.ts doesn't need fragile nested selects scattered
-- across every consuming page. Published products only.
--
-- Deliberately a plain view (not security_invoker), same reasoning as
-- product_public_availability in 0001: it aggregates/joins tables that have
-- no public RLS policy of their own (product_category_map's public policy
-- already requires published, but product_media likewise) — the view's own
-- `where status = 'published'` plus its narrow column list is the actual
-- safety boundary, not per-row RLS on every underlying table.

create view product_public_view as
select
  p.id,
  p.oem_part_number,
  p.oem_part_number_normalized,
  p.description,
  b.slug as brand_slug,
  b.name as brand_name,
  ec.slug as equipment_category_slug,
  ec.name as equipment_category_name,
  pc.slug as product_category_slug,
  pc.name as product_category_name,
  pm.storage_path as image_path,
  coalesce(av.quantity, 0) as quantity,
  coalesce(av.status, 'out_of_stock') as status
from products p
join brands b on b.id = p.brand_id
join equipment_categories ec on ec.id = p.equipment_category_id
left join lateral (
  select product_category_id from product_category_map where product_id = p.id limit 1
) primary_cat on true
left join product_categories pc on pc.id = primary_cat.product_category_id
left join lateral (
  select storage_path from product_media where product_id = p.id and is_primary = true limit 1
) pm on true
left join product_public_availability av on av.product_id = p.id
where p.status = 'published';

grant select on product_public_view to anon, authenticated;
