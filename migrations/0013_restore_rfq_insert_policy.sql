-- Restores the public RFQ-submission INSERT policy on rfq_enquiries.
-- Verification of migrations/0012 found this policy missing: anon-key
-- inserts (the exact path app/api/rfq/route.ts uses for every public
-- RFQ / Request-a-Part / Contact / search-no-result submission) were
-- being rejected with "new row violates row-level security policy".
-- Nothing in 0012 touches this policy or its dependencies, so this is
-- unrelated to the RFQ management feature -- fixed here as its own change.
-- Idempotent: safe to run whether or not the policy currently exists.

drop policy if exists "anyone can submit an rfq" on rfq_enquiries;
create policy "anyone can submit an rfq" on rfq_enquiries for insert with check (true);
