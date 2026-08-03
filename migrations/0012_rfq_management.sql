-- Phase 1 of the RFQ and Quotation Management System: widens the RFQ
-- workflow from 4 statuses to 10, adds status history and internal notes
-- (both admin-only, mirroring rfq_enquiries' own access level).

-- ============================================================================
-- Status enum: new/in_progress/quoted/closed -> full 10-stage workflow.
-- 'new' and 'closed' are preserved as-is; 'in_progress' -> 'reviewing' and
-- 'quoted' -> 'quotation_ready' are the closest semantic equivalents.
-- ============================================================================
alter table rfq_enquiries alter column status drop default;
drop index rfq_enquiries_status_idx;

create type rfq_status_new as enum (
  'new', 'reviewing', 'waiting_supplier', 'quotation_preparation',
  'quotation_ready', 'sent', 'accepted', 'revision_requested', 'lost', 'closed'
);

alter table rfq_enquiries
  alter column status type rfq_status_new
  using (
    case status::text
      when 'new' then 'new'
      when 'in_progress' then 'reviewing'
      when 'quoted' then 'quotation_ready'
      when 'closed' then 'closed'
      else 'new'
    end
  )::rfq_status_new;

alter table rfq_enquiries alter column status set default 'new'::rfq_status_new;
drop type rfq_status;
alter type rfq_status_new rename to rfq_status;
create index rfq_enquiries_status_idx on rfq_enquiries(status);

-- ============================================================================
-- Status history
-- ============================================================================
create table rfq_status_history (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references rfq_enquiries(id) on delete cascade,
  old_status rfq_status not null,
  new_status rfq_status not null,
  changed_by uuid references profiles(id),
  changed_by_email text,
  changed_at timestamptz not null default now()
);
create index rfq_status_history_rfq_id_idx on rfq_status_history(rfq_id, changed_at desc);

alter table rfq_status_history enable row level security;
create policy "admin can read rfq status history" on rfq_status_history for select using (is_admin());
create policy "admin can insert rfq status history" on rfq_status_history for insert with check (is_admin());

-- Atomic status change, mirroring revise_listing_draft's pattern (0011):
-- default security invoker, so both statements still respect the caller's
-- RLS -- a non-admin caller affects 0 rows on both, same as calling the
-- underlying tables directly.
create function change_rfq_status(
  p_rfq_id uuid, p_new_status rfq_status, p_changed_by uuid, p_changed_by_email text
) returns rfq_enquiries
language plpgsql as $$
declare
  v_old_status rfq_status;
  v_result rfq_enquiries;
begin
  select status into v_old_status from rfq_enquiries where id = p_rfq_id;
  if v_old_status is null then
    raise exception 'RFQ % not found', p_rfq_id;
  end if;

  update rfq_enquiries set status = p_new_status where id = p_rfq_id
  returning * into v_result;

  if v_old_status is distinct from p_new_status then
    insert into rfq_status_history (rfq_id, old_status, new_status, changed_by, changed_by_email)
    values (p_rfq_id, v_old_status, p_new_status, p_changed_by, p_changed_by_email);
  end if;

  return v_result;
end;
$$;

-- ============================================================================
-- Internal notes: replaces the single-textarea rfq_enquiries.internal_notes
-- for new writes. That column is kept in place, untouched, deprecated --
-- its existing content is migrated below so nothing is lost.
-- ============================================================================
create table rfq_internal_notes (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references rfq_enquiries(id) on delete cascade,
  author_id uuid references profiles(id),
  author_email text,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index rfq_internal_notes_rfq_id_idx on rfq_internal_notes(rfq_id, created_at desc);

alter table rfq_internal_notes enable row level security;
-- Any admin can add/edit/delete any note -- the RFQ module is already
-- admin-only end-to-end, with no per-author restriction used anywhere
-- else in this codebase.
create policy "admin manage rfq internal notes" on rfq_internal_notes for all using (is_admin());

create trigger rfq_internal_notes_set_updated_at
  before update on rfq_internal_notes
  for each row execute function set_updated_at();

insert into rfq_internal_notes (rfq_id, body, created_at, updated_at)
select id, internal_notes, created_at, created_at
from rfq_enquiries
where internal_notes is not null and internal_notes <> '';
