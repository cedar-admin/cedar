-- Migration 013: Validation log table for weekly audit chain validation results
-- Stores one row per weekly cron run with aggregate chain integrity results.

CREATE TABLE validation_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  run_type        TEXT NOT NULL DEFAULT 'weekly_chain_validation',
  sources_checked INT NOT NULL DEFAULT 0,
  chains_valid    INT NOT NULL DEFAULT 0,
  chains_broken   INT NOT NULL DEFAULT 0,
  total_changes   INT NOT NULL DEFAULT 0,
  -- Array of { change_id, chain_sequence, type, expected, actual, source_id } objects
  errors          JSONB NOT NULL DEFAULT '[]',
  summary         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_validation_log_run_at ON validation_log(run_at DESC);

ALTER TABLE validation_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "validation_log_read"  ON validation_log FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "validation_log_admin" ON validation_log FOR ALL    USING (auth.jwt()->>'role' = 'admin');

COMMENT ON TABLE validation_log IS
  'One row per weekly audit chain validation run. chains_broken > 0 indicates tamper detection.';
