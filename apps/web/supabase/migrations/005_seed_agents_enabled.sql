-- Migration: 005_seed_agents_enabled.sql
-- Purpose: Add agents_enabled kill switch to feature_flags for pipeline control
-- Tables affected: feature_flags
-- Special considerations: DML only

-- Cedar: Add agents_enabled kill switch to feature_flags
-- This flag controls whether the intelligence pipeline runs at all.
-- Set to false to halt all monitoring without deploying code.

insert into public.feature_flags (flag_name, tier, enabled) values
  ('agents_enabled', 'monitor', true),
  ('agents_enabled', 'intelligence', true)
on conflict do nothing;
