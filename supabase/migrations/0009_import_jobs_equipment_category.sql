-- The approved Import Wizard plan has the admin choose a default equipment
-- category for a job's brand-new products at mapping time (paired with the
-- column mapping and reusable via import_templates.default_equipment_category_id,
-- which already existed). import_jobs itself had nowhere to remember which
-- category was chosen for *this* job, so it's added here as a proper FK
-- rather than a loose id inside the report jsonb.
alter table import_jobs add column equipment_category_id uuid references equipment_categories(id);
