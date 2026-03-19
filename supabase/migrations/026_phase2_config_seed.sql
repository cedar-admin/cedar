-- ============================================================================
-- Cedar Migration 026: Phase 2 System Config — Pipeline State Keys
-- ============================================================================

-- fr_last_poll_date: date of the last successful Federal Register daily poll.
-- Initialized to 2 days ago. After first run, the pipeline updates this to today.
-- Pipeline reads this and fetches FR documents published since this date.

INSERT INTO system_config (key, value, description) VALUES
  ('fr_last_poll_date',
   to_char(now() - interval '2 days', 'YYYY-MM-DD'),
   'Last successful Federal Register daily poll date (YYYY-MM-DD). Updated by fr-daily-poll after each run.'),
  ('ecfr_last_checked_date',
   to_char(now() - interval '3 days', 'YYYY-MM-DD'),
   'Last date eCFR titles were checked for amendments (YYYY-MM-DD). Updated by ecfr-daily-check after each run.')
ON CONFLICT (key) DO NOTHING;
