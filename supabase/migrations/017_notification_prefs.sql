-- Cedar: Add notification_preferences JSONB to practices
-- Stores per-practice notification settings persisted from the Settings page.

ALTER TABLE practices
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB
    NOT NULL
    DEFAULT '{"email_alerts": true, "email_threshold": "high", "weekly_digest": false}'::jsonb;

COMMENT ON COLUMN practices.notification_preferences IS
  'JSON object: { email_alerts: boolean, email_threshold: "critical"|"high"|"medium"|"all", weekly_digest: boolean }';
