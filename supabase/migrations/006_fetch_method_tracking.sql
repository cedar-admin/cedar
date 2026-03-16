-- Migration 006: Add last_fetch_method to source_urls
-- Tracks which fetch method was actually used last time (vs configured method).
-- Enables dispatcher to skip failed methods and use the last-successful one directly.

ALTER TABLE source_urls
  ADD COLUMN IF NOT EXISTS last_fetch_method TEXT
    CHECK (last_fetch_method IN ('gov_api', 'oxylabs', 'browserbase'));

-- Index for quickly finding all source_urls currently using a given method
-- (useful for rollups and debugging escalation state)
CREATE INDEX IF NOT EXISTS idx_source_urls_last_fetch_method
  ON source_urls(last_fetch_method)
  WHERE last_fetch_method IS NOT NULL;

COMMENT ON COLUMN source_urls.last_fetch_method IS
  'Actual fetch method used on the last successful fetch. May differ from sources.fetch_method when escalation occurred (oxylabs → browserbase). NULL until first successful fetch.';
