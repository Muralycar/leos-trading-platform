-- Adds a 'spam' status to the RFQ workflow so junk submissions can be
-- filtered out of the admin list (hidden by default) without being deleted.
--
-- NOTE: `alter type ... add value` cannot be used in the same transaction
-- as statements that use the new value. Run the first statement on its own,
-- then the rest.

alter type rfq_status add value if not exists 'spam';

-- Safety net: flag obvious bot submissions at insert time, regardless of
-- which path they came through. Mirrors the patterns seen in real spam
-- (heavily dotted Gmail addresses, random mixed-case names).
create or replace function public.flag_spam_rfq()
returns trigger language plpgsql as $$
declare
  local_part text;
  dots int;
begin
  local_part := split_part(new.email, '@', 1);
  dots := length(local_part) - length(replace(local_part, '.', ''));
  if (new.email ilike '%@gmail.com' and dots >= 3)
     or (new.name !~ '\s' and new.name ~ '[a-z][A-Z].*[a-z][A-Z]') then
    new.status := 'spam';
  end if;
  return new;
end $$;

drop trigger if exists trg_flag_spam_rfq on public.rfq_enquiries;
create trigger trg_flag_spam_rfq
  before insert on public.rfq_enquiries
  for each row execute function public.flag_spam_rfq();

-- LATER (only after confirming SUPABASE_SERVICE_ROLE_KEY is set in Vercel and
-- a real test submission still works): close the open public insert so bots
-- can no longer write to the table directly with the public anon key.
--
--   drop policy if exists "anyone can submit an rfq" on rfq_enquiries;
