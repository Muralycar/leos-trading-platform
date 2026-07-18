-- Two small RPC functions for genuine bulk "update N rows with different
-- values per row" — something PostgREST's REST upsert cannot safely do via
-- `ON CONFLICT ... DO UPDATE` here. Discovered while rewriting the Import
-- Wizard's confirm step to batch its writes: Postgres validates NOT NULL
-- constraints on the tentative INSERT row before ON CONFLICT resolution
-- even decides whether to redirect to UPDATE — so a partial-column upsert
-- payload (e.g. just {id, outcome, mapped_product_id}) fails with a
-- not-null violation on import_job_id/raw_data/validation_status, EVEN
-- THOUGH the row already exists and the statement was only ever meant to
-- update it. This affected the already-shipped updateRowOutcomes()
-- (lib/admin/import/rows.ts, used by computePreview) too — it was never
-- caught before because verification always reproduced the logic with a
-- plain per-row .update() instead of calling the real function.
--
-- Both functions run with the caller's own privileges (security invoker,
-- the default) — RLS on import_rows/products still applies exactly as it
-- does for any other write these tables receive.

create or replace function bulk_set_import_row_outcome(updates jsonb)
returns void
language plpgsql
as $$
begin
  -- ->> returns SQL NULL for a JSON null, so a row with mapped_product_id
  -- omitted or explicitly null correctly clears the column, no nullif needed.
  update import_rows ir
  set outcome = (u->>'outcome')::import_row_outcome,
      mapped_product_id = (u->>'mapped_product_id')::uuid
  from jsonb_array_elements(updates) as u
  where ir.id = (u->>'id')::uuid;
end;
$$;

create or replace function bulk_update_product_fields(updates jsonb)
returns void
language plpgsql
as $$
begin
  update products p
  set description = coalesce(u->>'description', p.description),
      equipment_make = u->>'equipment_make',
      equipment_model = u->>'equipment_model',
      application = u->>'application',
      country_of_origin = u->>'country_of_origin',
      weight = (u->>'weight')::numeric,
      dimensions = u->>'dimensions',
      price = (u->>'price')::numeric,
      currency = u->>'currency',
      min_order_qty = (u->>'min_order_qty')::integer,
      public_notes = u->>'public_notes',
      internal_notes = u->>'internal_notes'
  from jsonb_array_elements(updates) as u
  where p.id = (u->>'id')::uuid;
end;
$$;
