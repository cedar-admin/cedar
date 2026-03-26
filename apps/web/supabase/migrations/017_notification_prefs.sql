-- Migration: 017_notification_prefs.sql
-- Purpose: Add notification_preferences JSONB column to practices for per-practice alert settings
-- Tables affected: practices
-- Special considerations: None

-- Cedar: Add notification_preferences JSONB to practices
-- Stores per-practice notification settings persisted from the Settings page.

alter table public.practices
  add column if not exists notification_preferences jsonb
    not null
    default '{"email_alerts": true, "email_threshold": "high", "weekly_digest": false}'::jsonb;

comment on column public.practices.notification_preferences is
  'JSON object: { email_alerts: boolean, email_threshold: "critical"|"high"|"medium"|"all", weekly_digest: boolean }';
