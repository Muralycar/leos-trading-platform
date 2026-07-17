-- Adds what the RFQ Management Dashboard needs on top of 0001's rfq_enquiries:
--   - internal_notes (admin-only free text; the table is already staff-only
--     via RLS, so no separate policy needed for this column)
--   - updated_at, auto-maintained by trigger
--   - a simpler 4-stage status workflow (new/in_progress/quoted/closed)
--     replacing the originally-speced 5-stage one (new/contacted/quoted/
--     won/lost) — safe to rebuild the enum outright since rfq_enquiries has
--     had no real rows yet (only a test row, since deleted)
--   - tightens rfq_enquiries SELECT/UPDATE to admin-only (was any staff /
--     editor-or-admin) — this module is admin-only by requirement

alter table rfq_enquiries add column internal_notes text;
alter table rfq_enquiries add column updated_at timestamptz not null default now();

create function set_updated_at() returns trigger
  language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger rfq_enquiries_set_updated_at
  before update on rfq_enquiries
  for each row
  execute function set_updated_at();

alter table rfq_enquiries alter column status drop default;

create type rfq_status_new as enum ('new', 'in_progress', 'quoted', 'closed');

alter table rfq_enquiries
  alter column status type rfq_status_new
  using (
    case status::text
      when 'contacted' then 'in_progress'
      when 'won' then 'closed'
      when 'lost' then 'closed'
      else status::text
    end
  )::rfq_status_new;

alter table rfq_enquiries alter column status set default 'new'::rfq_status_new;

drop type rfq_status;
alter type rfq_status_new rename to rfq_status;

create index rfq_enquiries_status_idx on rfq_enquiries(status);

drop policy "staff can read rfqs" on rfq_enquiries;
create policy "admin can read rfqs" on rfq_enquiries for select using (is_admin());

drop policy "editor or admin can update rfqs" on rfq_enquiries;
create policy "admin can update rfqs" on rfq_enquiries for update using (is_admin());
