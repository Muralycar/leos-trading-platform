-- Phase 2.1: Quotation creation, calculation, and revisioning from an RFQ.
-- All four new tables are admin-only, matching rfq_enquiries/listing_drafts'
-- existing access level. Line and header monetary totals are Postgres
-- GENERATED ALWAYS AS columns (exact decimal `numeric` arithmetic, never
-- JS floats) so the database is the sole source of truth for every number.

-- ============================================================================
-- Sequential quotation numbering: one row per year, incremented atomically
-- via INSERT ... ON CONFLICT ... RETURNING, which Postgres serializes safely
-- under concurrent transactions without any explicit locking.
-- ============================================================================
create table quotation_number_counters (
  year integer primary key,
  last_number integer not null default 0
);
alter table quotation_number_counters enable row level security;
create policy "admin manage quotation number counters" on quotation_number_counters for all using (is_admin());

-- ============================================================================
-- Quotations (header). Each revision is its own row; all revisions of one
-- logical quotation share quotation_number and are distinguished by
-- `revision`. Exactly one row per quotation_number may have is_current =
-- true, enforced the same way migrations/0011 enforces "one current draft
-- per product."
-- ============================================================================
create type quotation_status as enum (
  'draft', 'under_review', 'approved', 'sent', 'accepted',
  'revision_requested', 'rejected', 'expired', 'cancelled'
);

create table quotations (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references rfq_enquiries(id),
  quotation_number text not null,
  revision integer not null default 0,
  revision_label text generated always as (quotation_number || '-R' || revision) stored,
  is_current boolean not null default true,
  status quotation_status not null default 'draft',

  customer_name text not null,
  company_name text,
  customer_email text not null,
  customer_phone text,
  customer_address text,
  country text,
  customer_reference text,
  po_number text,

  quotation_date date not null default current_date,
  valid_until date,
  expected_delivery date,
  currency text,
  exchange_rate numeric(14,6),
  salesperson text,
  prepared_by text,
  approved_by text,
  incoterm text,
  delivery_terms text,
  payment_terms text,
  shipment_terms text,
  warranty text,
  country_of_origin_note text,
  shipping_method text,
  port_of_loading text,
  port_of_destination text,
  bank_details text,
  swift_code text,
  iban text,
  signature_reference text,
  notes text,
  internal_notes text,

  freight numeric(14,2) not null default 0,
  packing_charges numeric(14,2) not null default 0,
  insurance numeric(14,2) not null default 0,
  other_charges numeric(14,2) not null default 0,
  rounding_adjustment numeric(14,2) not null default 0,
  subtotal numeric(14,2) not null default 0,       -- trigger-maintained from quotation_items
  total_discount numeric(14,2) not null default 0,  -- trigger-maintained
  tax_total numeric(14,2) not null default 0,        -- trigger-maintained
  grand_total numeric(14,2) generated always as (
    subtotal - total_discount + tax_total + freight + packing_charges + insurance + other_charges + rounding_adjustment
  ) stored,

  created_by uuid references profiles(id),
  created_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index quotations_number_revision_key on quotations(quotation_number, revision);
create unique index quotations_one_current_per_number on quotations(quotation_number) where is_current;
create index quotations_rfq_id_idx on quotations(rfq_id);
create index quotations_status_idx on quotations(status);

alter table quotations enable row level security;
create policy "admin manage quotations" on quotations for all using (is_admin());

create trigger quotations_set_updated_at
  before update on quotations
  for each row execute function set_updated_at();

-- ============================================================================
-- Quotation line items. sort_order uses wide spacing (1000-increments) so
-- inserting/duplicating a line between two others never requires
-- renumbering the rest -- just take the midpoint value.
-- ============================================================================
create table quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references quotations(id) on delete cascade,
  sort_order integer not null,
  product_id uuid references products(id),
  part_number text,
  description text not null,
  brand text,
  quantity numeric(12,3) not null default 1,
  unit text,
  unit_price numeric(14,4) not null default 0,
  discount_percent numeric(5,2) not null default 0,
  tax_percent numeric(5,2) not null default 0,
  lead_time text,
  country_of_origin text,
  condition product_condition,
  remarks text,

  line_subtotal numeric(14,2) generated always as (
    round(quantity * unit_price, 2)
  ) stored,
  line_discount_amount numeric(14,2) generated always as (
    round(quantity * unit_price * discount_percent / 100.0, 2)
  ) stored,
  line_tax_amount numeric(14,2) generated always as (
    round(
      (round(quantity * unit_price, 2) - round(quantity * unit_price * discount_percent / 100.0, 2))
      * tax_percent / 100.0,
    2)
  ) stored,
  line_total numeric(14,2) generated always as (
    round(quantity * unit_price, 2)
    - round(quantity * unit_price * discount_percent / 100.0, 2)
    + round(
        (round(quantity * unit_price, 2) - round(quantity * unit_price * discount_percent / 100.0, 2))
        * tax_percent / 100.0,
      2)
  ) stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quotation_items_quotation_id_idx on quotation_items(quotation_id, sort_order);

alter table quotation_items enable row level security;
create policy "admin manage quotation items" on quotation_items for all using (is_admin());

create trigger quotation_items_set_updated_at
  before update on quotation_items
  for each row execute function set_updated_at();

-- Keeps quotations.subtotal/total_discount/tax_total in sync with its items
-- on every insert/update/delete -- so grand_total (a generated column on
-- quotations) is always correct regardless of which code path touched items.
create function sync_quotation_totals() returns trigger
  language plpgsql as $$
declare
  v_quotation_id uuid := coalesce(new.quotation_id, old.quotation_id);
begin
  update quotations set
    subtotal = (select coalesce(sum(line_subtotal), 0) from quotation_items where quotation_id = v_quotation_id),
    total_discount = (select coalesce(sum(line_discount_amount), 0) from quotation_items where quotation_id = v_quotation_id),
    tax_total = (select coalesce(sum(line_tax_amount), 0) from quotation_items where quotation_id = v_quotation_id)
  where id = v_quotation_id;
  return null;
end;
$$;

create trigger quotation_items_sync_totals
  after insert or update or delete on quotation_items
  for each row execute function sync_quotation_totals();

-- ============================================================================
-- Unified activity table (covers both status history and general activity).
-- ============================================================================
create type quotation_activity_type as enum (
  'quotation_created', 'quotation_updated', 'status_changed',
  'revision_created', 'line_added', 'line_removed'
);

create table quotation_activity (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references quotations(id) on delete cascade,
  event_type quotation_activity_type not null,
  old_status quotation_status,
  new_status quotation_status,
  details jsonb not null default '{}',
  actor_id uuid references profiles(id),
  actor_email text,
  created_at timestamptz not null default now()
);
create index quotation_activity_quotation_id_idx on quotation_activity(quotation_id, created_at desc);

alter table quotation_activity enable row level security;
create policy "admin manage quotation activity" on quotation_activity for all using (is_admin());

-- ============================================================================
-- RPCs. All default security invoker (like revise_listing_draft and
-- change_rfq_status) -- every statement inside still respects the calling
-- admin's own RLS, so a non-admin caller affects 0 rows throughout.
-- ============================================================================

-- Atomically allocates the next number for the year and creates revision 0.
-- p_currency is passed in from the app layer (the RFQ's linked product's
-- currency, if any) rather than looked up here, so this function never has
-- to hardcode a fallback currency.
create function create_quotation_from_rfq(
  p_rfq_id uuid, p_currency text, p_created_by uuid, p_created_by_email text
) returns quotations
language plpgsql as $$
declare
  v_rfq rfq_enquiries;
  v_year integer := extract(year from now())::integer;
  v_seq integer;
  v_number text;
  v_result quotations;
begin
  select * into v_rfq from rfq_enquiries where id = p_rfq_id;
  if not found then
    raise exception 'RFQ % not found', p_rfq_id;
  end if;

  insert into quotation_number_counters (year, last_number)
  values (v_year, 1)
  on conflict (year) do update set last_number = quotation_number_counters.last_number + 1
  returning last_number into v_seq;

  v_number := 'LEOS-QT-' || v_year || '-' || lpad(v_seq::text, 4, '0');

  insert into quotations (
    rfq_id, quotation_number, revision, is_current, status,
    customer_name, company_name, customer_email, customer_phone, country,
    currency, prepared_by, created_by, created_by_email
  ) values (
    p_rfq_id, v_number, 0, true, 'draft',
    v_rfq.name, v_rfq.company, v_rfq.email, v_rfq.phone, v_rfq.country,
    p_currency, p_created_by_email, p_created_by, p_created_by_email
  )
  returning * into v_result;

  insert into quotation_activity (quotation_id, event_type, actor_id, actor_email)
  values (v_result.id, 'quotation_created', p_created_by, p_created_by_email);

  return v_result;
end;
$$;

-- Atomically retires the current revision and creates the next one,
-- copying all header fields and all line items. The old row is never
-- modified beyond is_current -- fully preserved.
create function create_quotation_revision(
  p_quotation_id uuid, p_created_by uuid, p_created_by_email text
) returns quotations
language plpgsql as $$
declare
  v_old quotations;
  v_new quotations;
begin
  select * into v_old from quotations where id = p_quotation_id;
  if not found then
    raise exception 'Quotation % not found', p_quotation_id;
  end if;

  update quotations set is_current = false where id = v_old.id;

  -- approved_by is deliberately NOT copied forward -- a new revision has not
  -- itself been approved yet, even if the revision it was created from was.
  insert into quotations (
    rfq_id, quotation_number, revision, is_current, status,
    customer_name, company_name, customer_email, customer_phone, customer_address, country, customer_reference,
    po_number, valid_until, expected_delivery, currency, exchange_rate, salesperson, prepared_by,
    incoterm, delivery_terms, payment_terms, shipment_terms, warranty,
    country_of_origin_note, shipping_method, port_of_loading, port_of_destination,
    bank_details, swift_code, iban, signature_reference, notes, internal_notes,
    freight, packing_charges, insurance, other_charges, rounding_adjustment,
    created_by, created_by_email
  )
  select
    rfq_id, quotation_number, revision + 1, true, 'draft',
    customer_name, company_name, customer_email, customer_phone, customer_address, country, customer_reference,
    po_number, valid_until, expected_delivery, currency, exchange_rate, salesperson, prepared_by,
    incoterm, delivery_terms, payment_terms, shipment_terms, warranty,
    country_of_origin_note, shipping_method, port_of_loading, port_of_destination,
    bank_details, swift_code, iban, signature_reference, notes, internal_notes,
    freight, packing_charges, insurance, other_charges, rounding_adjustment,
    p_created_by, p_created_by_email
  from quotations where id = v_old.id
  returning * into v_new;

  insert into quotation_items (
    quotation_id, sort_order, product_id, part_number, description, brand,
    quantity, unit, unit_price, discount_percent, tax_percent, lead_time,
    country_of_origin, condition, remarks
  )
  select
    v_new.id, sort_order, product_id, part_number, description, brand,
    quantity, unit, unit_price, discount_percent, tax_percent, lead_time,
    country_of_origin, condition, remarks
  from quotation_items where quotation_id = v_old.id;

  insert into quotation_activity (quotation_id, event_type, actor_id, actor_email, details)
  values (
    v_new.id, 'revision_created', p_created_by, p_created_by_email,
    jsonb_build_object('from_revision', v_old.revision, 'to_revision', v_new.revision)
  );

  return v_new;
end;
$$;

create function change_quotation_status(
  p_quotation_id uuid, p_new_status quotation_status, p_changed_by uuid, p_changed_by_email text
) returns quotations
language plpgsql as $$
declare
  v_old_status quotation_status;
  v_result quotations;
begin
  select status into v_old_status from quotations where id = p_quotation_id;
  if v_old_status is null then
    raise exception 'Quotation % not found', p_quotation_id;
  end if;

  update quotations set status = p_new_status where id = p_quotation_id
  returning * into v_result;

  if v_old_status is distinct from p_new_status then
    insert into quotation_activity (quotation_id, event_type, old_status, new_status, actor_id, actor_email)
    values (p_quotation_id, 'status_changed', v_old_status, p_new_status, p_changed_by, p_changed_by_email);
  end if;

  return v_result;
end;
$$;
