-- Migration: 006_fetch_method_tracking.sql
-- Purpose: Add last_fetch_method column to source_urls for dispatcher escalation tracking
-- Tables affected: source_urls
-- Special considerations: None

-- Tracks which fetch method was actually used last time (vs configured method).
-- Enables dispatcher to skip failed methods and use the last-successful one directly.

alter table public.source_urls
  add column if not exists last_fetch_method text
    check (last_fetch_method in ('gov_api', 'oxylabs', 'browserbase'));

-- Index for quickly finding all source_urls currently using a given method
-- (useful for rollups and debugging escalation state)
create index if not exists idx_source_urls_last_fetch_method
  on public.source_urls(last_fetch_method)
  where last_fetch_method is not null;

comment on column public.source_urls.last_fetch_method is
  'Actual fetch method used on the last successful fetch. May differ from sources.fetch_method when escalation occurred (oxylabs → browserbase). NULL until first successful fetch.';
