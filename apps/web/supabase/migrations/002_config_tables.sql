-- Migration: 002_config_tables.sql
-- Purpose: Create configuration tables for feature flags, prompt templates, system config, and review rules; seed initial config data
-- Tables affected: feature_flags, prompt_templates, system_config, review_rules
-- Special considerations: RLS enabled on all tables; seed data included

-- ============================================================
-- Feature flags: what features are enabled per subscription tier
-- ============================================================
create table public.feature_flags (
  id         uuid primary key default gen_random_uuid(),
  flag_name  text not null,
  tier       text not null check (tier in ('monitor', 'intelligence')),
  enabled    boolean not null default false,
  created_at timestamptz not null default now(),
  unique(flag_name, tier)
);

alter table public.feature_flags enable row level security;

comment on table public.feature_flags is 'Tier-based feature gates — controls which features are available per subscription tier.';

-- ============================================================
-- Prompt templates: active agent prompts (MVP prompts live in code, migrate here after stability)
-- ============================================================
create table public.prompt_templates (
  id         uuid primary key default gen_random_uuid(),
  agent_name text not null, -- 'relevance_filter', 'classifier', 'ontology_mapper'
  version    text not null,
  prompt     text not null,
  is_active  boolean not null default false,
  created_at timestamptz not null default now(),
  unique(agent_name, version)
);

alter table public.prompt_templates enable row level security;

comment on table public.prompt_templates is 'Agent prompt storage for post-MVP migration from code-based prompts.';

-- ============================================================
-- System config: operational thresholds — never hardcode these in application code
-- ============================================================
create table public.system_config (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  value       text not null,
  description text,
  updated_at  timestamptz not null default now()
);

alter table public.system_config enable row level security;

comment on table public.system_config is 'Operational thresholds and configuration — cost limits, schedules, confidence thresholds.';

-- ============================================================
-- Review rules: HITL routing — determines which severity levels go to attorney review
-- ============================================================
create table public.review_rules (
  id              uuid primary key default gen_random_uuid(),
  severity        text not null unique check (severity in ('critical', 'high', 'medium', 'low', 'informational')),
  auto_approve    boolean not null default false,
  route_to_hitl   boolean not null default false,
  notes           text
);

alter table public.review_rules enable row level security;

comment on table public.review_rules is 'HITL routing rules — determines which severity levels require attorney review.';

-- ============================================================
-- Seed: Feature flags
-- ============================================================
insert into public.feature_flags (flag_name, tier, enabled) values
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

-- ============================================================
-- Seed: System config defaults
-- ============================================================
insert into public.system_config (key, value, description) values
  ('confidence_threshold',      '0.7',   'Minimum relevance score for a change to be processed'),
  ('max_retry_attempts',        '3',     'Max Inngest retry attempts per job'),
  ('cost_limit_per_run_usd',    '0.50',  'Max spend per monitoring run before alerting'),
  ('detection_latency_hours',   '24',    'Target max hours between source publication and detection'),
  ('critical_review_sla_hours', '4',     'Max hours for attorney to review critical changes'),
  ('high_review_sla_hours',     '24',    'Max hours for attorney to review high-severity changes'),
  ('weekly_discovery_day',      'sunday','Day of week for weekly re-crawl of all sources'),
  ('digest_delivery_day',       'friday','Day of week for weekly digest delivery');

-- ============================================================
-- Seed: Review rules
-- Critical + High → HITL (attorney must review before publishing to Intelligence tier)
-- Medium/Low/Informational → auto-approve
-- ============================================================
insert into public.review_rules (severity, auto_approve, route_to_hitl, notes) values
  ('critical',      false, true,  'Attorney review required within 4 hours. Push notification triggered immediately on detection.'),
  ('high',          false, true,  'Attorney review required within 24 hours.'),
  ('medium',        true,  false, 'Auto-approved. Included in weekly digest for attorney batch review.'),
  ('low',           true,  false, 'Auto-approved. No active notification.'),
  ('informational', true,  false, 'Auto-approved. Visible in feed but not alerted.');
