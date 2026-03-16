-- Cedar: Add agents_enabled kill switch to feature_flags
-- This flag controls whether the intelligence pipeline runs at all.
-- Set to false to halt all monitoring without deploying code.

INSERT INTO feature_flags (flag_name, tier, enabled) VALUES
  ('agents_enabled', 'monitor', true),
  ('agents_enabled', 'intelligence', true)
ON CONFLICT DO NOTHING;
