-- Migration: 026_phase2_config_seed.sql
-- Purpose: Seed system_config with pipeline state keys for FR daily poll and eCFR daily check
-- Tables affected: system_config
-- Special considerations: DML only — initializes polling dates relative to migration run time

-- fr_last_poll_date: date of the last successful Federal Register daily poll.
-- Initialized to 2 days ago. After first run, the pipeline updates this to today.
-- Pipeline reads this and fetches FR documents published since this date.

insert into public.system_config (key, value, description) values
  ('fr_last_poll_date',
   to_char(now() - interval '2 days', 'YYYY-MM-DD'),
   'Last successful Federal Register daily poll date (YYYY-MM-DD). Updated by fr-daily-poll after each run.'),
  ('ecfr_last_checked_date',
   to_char(now() - interval '3 days', 'YYYY-MM-DD'),
   'Last date eCFR titles were checked for amendments (YYYY-MM-DD). Updated by ecfr-daily-check after each run.')
on conflict (key) do nothing;
