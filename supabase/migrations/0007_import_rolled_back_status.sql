-- Adds the 'rolled_back' status so a completed import that's since been
-- undone is distinguishable from one still in effect (controls whether the
-- Import Wizard's Rollback button shows). Part of Checkpoint 1 of the
-- Excel Import Wizard build — see the wizard's approved planning doc.
alter type import_job_status add value 'rolled_back';
