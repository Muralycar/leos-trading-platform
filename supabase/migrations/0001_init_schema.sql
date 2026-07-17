-- Phase 3 initial schema. Reviewed in chat before implementation — see the
-- "Phase 3 — Supabase Architecture & Migration Plan" design doc for the
-- rationale behind each table. Apply with `supabase db push` or paste into
-- the Supabase SQL editor, in this file order (it's already dependency-safe).

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists pgcrypto;  -- gen_random_uuid()
create extension if not exists pg_trgm;   -- partial/trigram part-number search

-- ============================================================================
-- Enums
-- ============================================================================
create type product_status     as enum ('draft', 'published', 'archived');
create type product_condition  as enum ('genuine_oem', 'aftermarket', 'obsolete_dead_stock', 'used_serviceable');
create type brand_status       as enum ('active', 'archived');
create type identifier_type    as enum ('alternative', 'superseded', 'cross_reference');
create type rfq_source         as enum ('product_page', 'sourcing_request', 'contact', 'search_no_result');
create type rfq_status         as enum ('new', 'contacted', 'quoted', 'won', 'lost');
create type import_job_status  as enum ('pending', 'mapped', 'validated', 'previewed', 'imported', 'failed', 'cancelled');
create type import_row_status  as enum ('valid', 'duplicate', 'missing_required', 'unrecognized_category', 'unrecognized_brand', 'needs_review');
create type import_row_outcome as enum ('create', 'update', 'unchanged', 'skip', 'needs_review', 'error');
create type user_role          as enum ('admin', 'editor', 'viewer');

-- ============================================================================
-- Structural tables (no FK dependencies on products)
-- ============================================================================
create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text,
  description text,
  industries text[],
  seo_title text,
  seo_description text,
  status brand_status not null default 'active',
  created_at timestamptz not null default now()
);

create table equipment_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  parent_id uuid references equipment_categories(id)
);

create table product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table warehouse_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  is_active boolean not null default true
);

-- profiles.id references auth.users, which already exists in every Supabase project.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'viewer',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Import pipeline (import_jobs must exist before inventory_batches, which
-- references it)
-- ============================================================================
create table import_jobs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id),
  uploaded_by uuid references auth.users(id),
  file_name text not null,
  file_checksum text,
  storage_path text not null,
  status import_job_status not null default 'pending',
  row_count integer,
  report jsonb,
  created_at timestamptz not null default now()
);
create index import_jobs_brand_checksum_idx on import_jobs(brand_id, file_checksum);

create table import_templates (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id),
  name text not null,
  column_mapping jsonb not null,
  default_equipment_category_id uuid references equipment_categories(id),
  created_by uuid references auth.users(id)
);

-- ============================================================================
-- Product model
-- ============================================================================
create table products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  equipment_category_id uuid not null references equipment_categories(id),
  oem_part_number text not null,
  oem_part_number_normalized text generated always as (
    upper(regexp_replace(oem_part_number, '[-./\s]', '', 'g'))
  ) stored,
  description text not null,
  equipment_make text,
  equipment_model text,
  application text,
  condition product_condition,
  country_of_origin text,
  weight numeric,
  dimensions text,
  price numeric,
  currency text,
  min_order_qty integer,
  public_notes text,
  internal_notes text,
  status product_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_id, oem_part_number_normalized)
);
create index products_normalized_trgm_idx on products using gin (oem_part_number_normalized gin_trgm_ops);
create index products_fts_idx on products using gin (
  to_tsvector('simple', coalesce(description,'') || ' ' || coalesce(application,''))
);
create index products_status_idx on products(status);

create table product_identifiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  identifier_type identifier_type not null,
  value text not null,
  value_normalized text generated always as (
    upper(regexp_replace(value, '[-./\s]', '', 'g'))
  ) stored
);
create index product_identifiers_normalized_trgm_idx on product_identifiers using gin (value_normalized gin_trgm_ops);
create index product_identifiers_product_id_idx on product_identifiers(product_id);

create table product_category_map (
  product_id uuid not null references products(id) on delete cascade,
  product_category_id uuid not null references product_categories(id) on delete cascade,
  primary key (product_id, product_category_id)
);

-- ============================================================================
-- Inventory Batch model
-- ============================================================================
create table inventory_batches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null check (quantity >= 0),
  condition text,
  warehouse_location_id uuid references warehouse_locations(id),
  bin_location text,
  arrival_date date,
  supplier_reference text,
  purchase_reference text,
  internal_cost numeric,
  source_line integer,
  import_job_id uuid references import_jobs(id) on delete set null,
  is_current boolean not null default true,
  superseded_by_import_job_id uuid references import_jobs(id) on delete set null,
  created_at timestamptz not null default now()
);
create index inventory_batches_product_id_idx on inventory_batches(product_id);
create index inventory_batches_import_job_id_idx on inventory_batches(import_job_id);
create index inventory_batches_current_idx on inventory_batches(product_id) where is_current;

-- Deliberately a plain view (NOT security_invoker) so it runs with the
-- view owner's privileges and can aggregate inventory_batches even though
-- anon/authenticated have no direct SELECT grant on that table below. Only
-- quantity + a derived status are exposed — never cost/supplier/batch
-- detail — so bypassing per-row RLS here is intentional and safe.
create view product_public_availability as
select
  p.id as product_id,
  coalesce(sum(b.quantity) filter (where b.is_current), 0)::int as quantity,
  case
    when coalesce(sum(b.quantity) filter (where b.is_current), 0) <= 0 then 'out_of_stock'
    when coalesce(sum(b.quantity) filter (where b.is_current), 0) <= 2 then 'limited_stock'
    else 'in_stock'
  end as status
from products p
left join inventory_batches b on b.product_id = p.id
group by p.id;

-- ============================================================================
-- Media model
-- ============================================================================
create table product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false
);
create index product_media_product_id_idx on product_media(product_id);

create table technical_documents (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  brand_id uuid references brands(id) on delete cascade,
  title text not null,
  storage_path text not null,
  is_public boolean not null default false
);

-- ============================================================================
-- import_rows (must follow products, which mapped_product_id references)
-- ============================================================================
create table import_rows (
  id uuid primary key default gen_random_uuid(),
  import_job_id uuid not null references import_jobs(id) on delete cascade,
  raw_data jsonb not null,
  mapped_product_id uuid references products(id),
  validation_status import_row_status not null,
  outcome import_row_outcome,
  error_notes text
);
create index import_rows_import_job_id_idx on import_rows(import_job_id);

-- ============================================================================
-- RFQ model
-- ============================================================================
create table rfq_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  phone text,
  whatsapp text,
  country text,
  brand text,
  part_number text,
  product_id uuid references products(id),
  quantity_required text,
  message text,
  attachment_url text,
  source rfq_source not null,
  status rfq_status not null default 'new',
  created_at timestamptz not null default now()
);
create index rfq_enquiries_created_at_idx on rfq_enquiries(created_at desc);

-- ============================================================================
-- Pages & settings
-- ============================================================================
create table pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  sections jsonb not null default '{}',
  seo_title text,
  seo_description text,
  updated_at timestamptz not null default now()
);

create table settings (
  id boolean primary key default true check (id),   -- singleton-row trick
  phone_primary text not null,
  phone_secondary text,
  whatsapp_number text not null,
  email text not null,
  address text not null
);

-- ============================================================================
-- Row Level Security
-- ============================================================================

-- Helper: is the current user staff (any role), and is the current user
-- editor-or-above. Kept as tiny SQL functions so policies read cleanly and
-- so there's one place to change the "who is staff" definition.
create function is_staff() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where profiles.id = auth.uid());
$$;

create function is_editor_or_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where profiles.id = auth.uid() and role in ('admin','editor'));
$$;

create function is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where profiles.id = auth.uid() and role = 'admin');
$$;

-- brands
alter table brands enable row level security;
create policy "public read active brands" on brands for select using (status = 'active');
create policy "staff manage brands" on brands for all using (is_editor_or_admin());

-- equipment_categories / product_categories — plain taxonomy, always public
alter table equipment_categories enable row level security;
create policy "public read equipment categories" on equipment_categories for select using (true);
create policy "staff manage equipment categories" on equipment_categories for all using (is_editor_or_admin());

alter table product_categories enable row level security;
create policy "public read product categories" on product_categories for select using (true);
create policy "staff manage product categories" on product_categories for all using (is_editor_or_admin());

-- warehouse_locations — internal only, never public
alter table warehouse_locations enable row level security;
create policy "staff only warehouse locations" on warehouse_locations for all using (is_staff());

-- profiles — a user reads their own row; staff (any role) can read all for
-- the admin user list; only admins can write (invite / change role).
alter table profiles enable row level security;
create policy "read own profile" on profiles for select using (auth.uid() = id or is_staff());
create policy "admin manage profiles" on profiles for all using (is_admin());

-- products
alter table products enable row level security;
create policy "public read published products" on products for select using (status = 'published');
create policy "staff full access to products" on products for all using (is_editor_or_admin());

-- product_identifiers — public only through a published product
alter table product_identifiers enable row level security;
create policy "public read identifiers of published products" on product_identifiers for select using (
  exists (select 1 from products where products.id = product_identifiers.product_id and products.status = 'published')
);
create policy "staff manage identifiers" on product_identifiers for all using (is_editor_or_admin());

-- product_category_map — same rule as identifiers
alter table product_category_map enable row level security;
create policy "public read category map of published products" on product_category_map for select using (
  exists (select 1 from products where products.id = product_category_map.product_id and products.status = 'published')
);
create policy "staff manage category map" on product_category_map for all using (is_editor_or_admin());

-- inventory_batches — never public directly; the view above is the only
-- public-facing read path (see the view's own comment).
alter table inventory_batches enable row level security;
create policy "staff full access to inventory batches" on inventory_batches for all using (is_editor_or_admin());
grant select on product_public_availability to anon, authenticated;

-- product_media — public only through a published product
alter table product_media enable row level security;
create policy "public read media of published products" on product_media for select using (
  exists (select 1 from products where products.id = product_media.product_id and products.status = 'published')
);
create policy "staff manage media" on product_media for all using (is_editor_or_admin());

-- technical_documents — public only when explicitly flagged is_public
alter table technical_documents enable row level security;
create policy "public read public documents" on technical_documents for select using (is_public = true);
create policy "staff manage documents" on technical_documents for all using (is_editor_or_admin());

-- import_jobs / import_templates / import_rows — staff only, never public
alter table import_jobs enable row level security;
create policy "staff manage import jobs" on import_jobs for all using (is_editor_or_admin());

alter table import_templates enable row level security;
create policy "staff manage import templates" on import_templates for all using (is_editor_or_admin());

alter table import_rows enable row level security;
create policy "staff manage import rows" on import_rows for all using (is_editor_or_admin());

-- rfq_enquiries — anyone can submit, only staff can read/manage; only
-- editor/admin can change status (viewer is read-only per the role matrix).
alter table rfq_enquiries enable row level security;
create policy "anyone can submit an rfq" on rfq_enquiries for insert with check (true);
create policy "staff can read rfqs" on rfq_enquiries for select using (is_staff());
create policy "editor or admin can update rfqs" on rfq_enquiries for update using (is_editor_or_admin());

-- pages / settings — public copy, staff-editable
alter table pages enable row level security;
create policy "public read pages" on pages for select using (true);
create policy "staff manage pages" on pages for all using (is_editor_or_admin());

alter table settings enable row level security;
create policy "public read settings" on settings for select using (true);
create policy "staff manage settings" on settings for all using (is_editor_or_admin());
