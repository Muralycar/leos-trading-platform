-- Phase 2.2: emailing an approved quotation to the customer, plus a
-- token-gated read-only customer view. Extends quotation_activity_type
-- (from 0014) rather than creating a parallel activity table.

alter type quotation_activity_type add value 'email_sent';
alter type quotation_activity_type add value 'email_failed';

-- ============================================================================
-- Customer access tokens. Only the SHA-256 hash of the token is ever
-- stored -- the raw token exists only in the email link, so a database
-- leak alone can never be used to reconstruct a working link. Tied to a
-- specific revision (quotation_id), not the quotation_number group, so a
-- later revision is never silently exposed through an old link.
-- ============================================================================
create table quotation_access_tokens (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references quotations(id) on delete cascade,
  token_hash text not null,
  created_by uuid references profiles(id),
  created_by_email text,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz
);
create unique index quotation_access_tokens_token_hash_key on quotation_access_tokens(token_hash);
create index quotation_access_tokens_quotation_id_idx on quotation_access_tokens(quotation_id);

alter table quotation_access_tokens enable row level security;
create policy "admin manage quotation access tokens" on quotation_access_tokens for all using (is_admin());

-- ============================================================================
-- Email delivery log.
-- ============================================================================
create type quotation_email_status as enum ('queued', 'sent', 'delivered', 'bounced', 'failed');

create table quotation_email_log (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references quotations(id) on delete cascade,
  quotation_revision integer not null,
  recipient text not null,
  sender text not null,
  subject text not null,
  provider text not null default 'resend',
  provider_message_id text,
  delivery_status quotation_email_status not null default 'queued',
  sent_by uuid references profiles(id),
  sent_by_email text,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

-- At most one send "in flight" per quotation at a time -- the concrete
-- mechanism preventing a double-click from dispatching two emails, entirely
-- independent of when quotations.status itself flips to 'sent'.
create unique index quotation_email_log_one_in_flight
  on quotation_email_log(quotation_id) where delivery_status = 'queued';
create index quotation_email_log_quotation_id_idx on quotation_email_log(quotation_id, created_at desc);

alter table quotation_email_log enable row level security;
create policy "admin manage quotation email log" on quotation_email_log for all using (is_admin());
