-- Run this statement ON ITS OWN (Postgres can't use a new enum value in the
-- same transaction that adds it). Lets machinery enquiries be tagged with
-- their own source in rfq_enquiries.

alter type rfq_source add value if not exists 'machinery';
