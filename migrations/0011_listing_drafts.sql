-- Phase 1 of the Listing Generator: draft storage only, no external
-- publishing. review_data and generated_outputs stay jsonb for now
-- (matches the precedent set by pages.sections jsonb) so the shape can
-- evolve while real products are tested, rather than locking in a wide
-- column layout before that's proven out.

create type listing_draft_status as enum ('draft', 'reviewed', 'approved', 'published');

create table listing_drafts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,

  -- Versioning: every regenerate/revise inserts a NEW row rather than
  -- overwriting history. is_current + the partial unique index below are
  -- the actual guarantee that exactly one row per product is "the" active
  -- draft at any time; version is just a human-readable counter.
  version integer not null default 1,
  is_current boolean not null default true,

  status listing_draft_status not null default 'draft',

  -- Editable snapshot of the review-form fields (brand, part number, name,
  -- category, condition, quantity, compatible equipment, origin, weight,
  -- dimensions, price, currency, shipping notes, warranty, image URLs,
  -- internal notes) plus a needsConfirmation[] list. Never auto-refreshed
  -- from the live product except via an explicit, separate "resync" action
  -- — see lib/admin/listing-generator.ts for the enforcement of that rule.
  review_data jsonb not null default '{}',

  -- { website, ebay, alibaba, seo, linkedin } — see lib/listing-generator/types.ts.
  generated_outputs jsonb not null default '{}',

  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz
);

-- The actual "one active current draft per product" guarantee — a
-- Postgres partial unique index, not just an application-level check.
create unique index listing_drafts_one_current_per_product
  on listing_drafts(product_id) where is_current;

create index listing_drafts_product_id_idx on listing_drafts(product_id);
create index listing_drafts_status_idx on listing_drafts(status);

alter table listing_drafts enable row level security;

-- Same gate as products/media/import: editor-or-admin only. Viewers get
-- no access to this table at all, matching how the Products admin pages
-- already require requireRole("editor", "admin") wholesale.
create policy "staff manage listing drafts" on listing_drafts
  for all using (is_editor_or_admin());

-- Reuses the set_updated_at() trigger function already defined in
-- migrations/0003_rfq_dashboard.sql — no new trigger function needed.
create trigger listing_drafts_set_updated_at
  before update on listing_drafts
  for each row execute function set_updated_at();

-- Atomic "create a new version" helper: flips the old current row off and
-- inserts the new one in one statement, so a crash or concurrent request
-- can never leave two rows marked is_current for the same product (the
-- unique index would reject that anyway, but this avoids the transient
-- window a two-step update-then-insert from application code would have).
-- security invoker (the default) — runs as the calling user, still subject
-- to the RLS policy above, so this never bypasses the editor-or-admin gate.
create function revise_listing_draft(
  p_product_id uuid,
  p_review_data jsonb,
  p_generated_outputs jsonb,
  p_created_by uuid
) returns listing_drafts
language plpgsql as $$
declare
  v_new_version integer;
  v_result listing_drafts;
begin
  update listing_drafts
    set is_current = false
    where product_id = p_product_id and is_current = true;

  select coalesce(max(version), 0) + 1 into v_new_version
    from listing_drafts where product_id = p_product_id;

  insert into listing_drafts (product_id, version, is_current, status, review_data, generated_outputs, created_by)
  values (p_product_id, v_new_version, true, 'draft', p_review_data, p_generated_outputs, p_created_by)
  returning * into v_result;

  return v_result;
end;
$$;
