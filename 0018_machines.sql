-- Machinery & vehicles catalogue (new + used machines, trucks, forklifts).
-- Separate from the parts catalogue: machines are sold by enquiry, with
-- year / hours / condition instead of SKUs and stock quantities.
-- Idempotent: safe to run even if an earlier draft of this table exists.

create table if not exists public.machines (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null,            -- dozer, excavator, wheel_loader, crane, truck, forklift, other
  brand text not null,
  model text,
  condition text,                    -- 'new' | 'used' | null (null for sourcing listings)
  year int,
  hours_or_km int,
  capacity text,
  location text,
  price_aed numeric,                 -- null = "Price on request"
  description text,
  specs jsonb not null default '{}'::jsonb,
  images text[] not null default '{}',   -- storage paths inside the machine-images bucket
  status text not null default 'available',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Constraints (re-created so an older draft of the table picks up 'sourcing').
alter table public.machines alter column condition drop not null;
alter table public.machines drop constraint if exists machines_status_check;
alter table public.machines add constraint machines_status_check
  check (status in ('available','reserved','sold','sourcing'));
alter table public.machines drop constraint if exists machines_condition_check;
alter table public.machines add constraint machines_condition_check
  check (condition is null or condition in ('new','used'));

create index if not exists machines_published_idx on public.machines (is_published, created_at desc);

drop trigger if exists machines_set_updated_at on public.machines;
create trigger machines_set_updated_at
  before update on public.machines
  for each row execute function set_updated_at();

alter table public.machines enable row level security;

drop policy if exists "public can read published machines" on public.machines;
create policy "public can read published machines"
  on public.machines for select
  using (is_published = true);

drop policy if exists "admin manages machines" on public.machines;
create policy "admin manages machines"
  on public.machines for all
  using (is_admin()) with check (is_admin());

-- ============================================================================
-- Storage bucket for machine photos: public read, admin-only write.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('machine-images', 'machine-images', true)
on conflict (id) do nothing;

drop policy if exists "public read machine images" on storage.objects;
create policy "public read machine images"
  on storage.objects for select
  using (bucket_id = 'machine-images');

drop policy if exists "admin insert machine images" on storage.objects;
create policy "admin insert machine images"
  on storage.objects for insert
  with check (bucket_id = 'machine-images' and is_admin());

drop policy if exists "admin update machine images" on storage.objects;
create policy "admin update machine images"
  on storage.objects for update
  using (bucket_id = 'machine-images' and is_admin());

drop policy if exists "admin delete machine images" on storage.objects;
create policy "admin delete machine images"
  on storage.objects for delete
  using (bucket_id = 'machine-images' and is_admin());
