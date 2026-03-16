-- Cedar MVP: Configuration Tables
-- All feature behavior is driven by DB config — no code changes needed to adjust behavior

-- Feature flags: what features are enabled per subscription tier
CREATE TABLE feature_flags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name  TEXT NOT NULL,
  tier       TEXT NOT NULL CHECK (tier IN ('monitor', 'intelligence')),
  enabled    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(flag_name, tier)
);

-- Prompt templates: active agent prompts (MVP prompts live in code, migrate here after stability)
CREATE TABLE prompt_templates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL, -- 'relevance_filter', 'classifier', 'ontology_mapper'
  version    TEXT NOT NULL,
  prompt     TEXT NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agent_name, version)
);

-- System config: operational thresholds — never hardcode these in application code
CREATE TABLE system_config (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,
  value       TEXT NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Review rules: HITL routing — determines which severity levels go to attorney review
CREATE TABLE review_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity        TEXT NOT NULL UNIQUE CHECK (severity IN ('critical', 'high', 'medium', 'low', 'informational')),
  auto_approve    BOOLEAN NOT NULL DEFAULT false,
  route_to_hitl   BOOLEAN NOT NULL DEFAULT false,
  notes           TEXT
);

-- Seed: Feature flags
INSERT INTO feature_flags (flag_name, tier, enabled) VALUES
  -- Monitor tier features
  ('change_feed',           'monitor',      true),
  ('email_alerts',          'monitor',      true),
  ('audit_trail',           'monitor',      true),
  ('audit_trail_export',    'monitor',      true),
  ('source_library',        'monitor',      true),
  ('team_access',           'monitor',      true),
  -- Intelligence tier features (everything in Monitor, plus:)
  ('change_feed',           'intelligence', true),
  ('email_alerts',          'intelligence', true),
  ('audit_trail',           'intelligence', true),
  ('audit_trail_export',    'intelligence', true),
  ('source_library',        'intelligence', true),
  ('team_access',           'intelligence', true),
  ('conversational_qa',     'intelligence', true),
  ('knowledge_graph',       'intelligence', true),
  ('attorney_reviewed',     'intelligence', true),
  ('weekly_digest',         'intelligence', true),
  ('push_notifications',    'intelligence', true),
  ('regulation_browser',    'intelligence', true),
  ('digest_archive',        'intelligence', true);

-- Seed: System config defaults
INSERT INTO system_config (key, value, description) VALUES
  ('confidence_threshold',      '0.7',   'Minimum relevance score for a change to be processed'),
  ('max_retry_attempts',        '3',     'Max Inngest retry attempts per job'),
  ('cost_limit_per_run_usd',    '0.50',  'Max spend per monitoring run before alerting'),
  ('detection_latency_hours',   '24',    'Target max hours between source publication and detection'),
  ('critical_review_sla_hours', '4',     'Max hours for attorney to review critical changes'),
  ('high_review_sla_hours',     '24',    'Max hours for attorney to review high-severity changes'),
  ('weekly_discovery_day',      'sunday','Day of week for weekly re-crawl of all sources'),
  ('digest_delivery_day',       'friday','Day of week for weekly digest delivery');

-- Seed: Review rules
-- Critical + High → HITL (attorney must review before publishing to Intelligence tier)
-- Medium/Low/Informational → auto-approve
INSERT INTO review_rules (severity, auto_approve, route_to_hitl, notes) VALUES
  ('critical',      false, true,  'Attorney review required within 4 hours. Push notification triggered immediately on detection.'),
  ('high',          false, true,  'Attorney review required within 24 hours.'),
  ('medium',        true,  false, 'Auto-approved. Included in weekly digest for attorney batch review.'),
  ('low',           true,  false, 'Auto-approved. No active notification.'),
  ('informational', true,  false, 'Auto-approved. Visible in feed but not alerted.');
