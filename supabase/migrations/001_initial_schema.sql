-- Migration: 001_initial_schema.sql
-- Purpose: Create core Cedar tables for practices, sources, changes, acknowledgments, reviews, and cost tracking
-- Tables affected: practices, sources, source_urls, changes, practice_acknowledgments, review_actions, cost_events
-- Special considerations: RLS enabled on all tables; append-only enforcement on changes is in 003

-- ============================================================
-- Practices: one row per subscribing medical practice
-- ============================================================
create table public.practices (
  id                     uuid primary key default gen_random_uuid(),
  owner_email            text not null unique,
  name                   text not null,
  tier                   text not null default 'monitor' check (tier in ('monitor', 'intelligence')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at             timestamptz not null default now()
);

alter table public.practices enable row level security;

comment on table public.practices is 'Subscribing medical practices with owner, tier, and Stripe billing references.';

-- ============================================================
-- Sources: the 71+ regulatory sources Cedar monitors
-- ============================================================
create table public.sources (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  jurisdiction text not null default 'FL',
  url          text not null,
  fetch_method text not null check (fetch_method in ('gov_api', 'oxylabs', 'browserbase')),
  tier         text not null check (tier in ('critical', 'high', 'medium', 'low')),
  is_active    boolean not null default true,
  scrape_config jsonb,
  created_at   timestamptz not null default now()
);

alter table public.sources enable row level security;

comment on table public.sources is 'Regulatory sources Cedar monitors — 71+ across federal and Florida state agencies.';

-- ============================================================
-- Source URLs: individual URLs tracked per source
-- ============================================================
create table public.source_urls (
  id              uuid primary key default gen_random_uuid(),
  source_id       uuid not null references public.sources(id) on delete cascade,
  url             text not null,
  last_fetched_at timestamptz,
  last_hash       text,
  created_at      timestamptz not null default now()
);

alter table public.source_urls enable row level security;

comment on table public.source_urls is 'Individual URLs tracked per source; some sources have multiple monitored endpoints.';

-- ============================================================
-- Changes: detected regulatory changes — APPEND-ONLY
-- Never UPDATE or DELETE rows. Append-only enforced by trigger in 003_rls_policies.sql
-- ============================================================
create table public.changes (
  id                 uuid primary key default gen_random_uuid(),
  source_id          uuid not null references public.sources(id),
  source_url_id      uuid references public.source_urls(id),
  jurisdiction       text not null default 'FL',
  detected_at        timestamptz not null default now(),
  content_before     text,
  content_after      text,
  diff               text,
  hash               text not null,
  chain_hash         text,
  agent_version      text,
  relevance_score    float,
  severity           text check (severity in ('critical', 'high', 'medium', 'low', 'informational')),
  summary            text,
  raw_classification jsonb,
  review_status      text not null default 'pending' check (review_status in ('pending', 'approved', 'rejected', 'auto_approved')),
  -- Corrections: if superseded by a newer change record
  superseded_by      uuid references public.changes(id),
  created_at         timestamptz not null default now()
);

alter table public.changes enable row level security;

comment on table public.changes is 'Append-only ledger of detected regulatory changes with AI classification and chain-hashed audit trail.';

-- ============================================================
-- Practice acknowledgments: which practice acknowledged which change
-- ============================================================
create table public.practice_acknowledgments (
  id               uuid primary key default gen_random_uuid(),
  practice_id      uuid not null references public.practices(id) on delete cascade,
  change_id        uuid not null references public.changes(id),
  acknowledged_by  text not null, -- email of staff member who acknowledged
  acknowledged_at  timestamptz not null default now(),
  unique(practice_id, change_id)
);

alter table public.practice_acknowledgments enable row level security;

comment on table public.practice_acknowledgments is 'Records of which practice acknowledged which regulatory change.';

-- ============================================================
-- Review actions: HITL reviewer decisions — never update changes directly
-- ============================================================
create table public.review_actions (
  id          uuid primary key default gen_random_uuid(),
  change_id   uuid not null references public.changes(id),
  reviewer_id text not null, -- WorkOS user ID
  action      text not null check (action in ('approve', 'reject', 'edit')),
  notes       text,
  created_at  timestamptz not null default now()
);

alter table public.review_actions enable row level security;

comment on table public.review_actions is 'HITL reviewer decisions on changes — approve, reject, or edit.';

-- ============================================================
-- Cost events: every external API call logged here
-- ============================================================
create table public.cost_events (
  id         uuid primary key default gen_random_uuid(),
  service    text not null, -- 'claude', 'oxylabs', 'browserbase', 'docling', 'whisper', 'resend', 'onesignal'
  operation  text not null, -- e.g. 'relevance_filter', 'classify', 'summarize', 'fetch', 'email'
  tokens_in  integer,
  tokens_out integer,
  cost_usd   numeric(10, 6) not null,
  context    jsonb, -- e.g. { change_id, source_id, practice_id }
  created_at timestamptz not null default now()
);

alter table public.cost_events enable row level security;

comment on table public.cost_events is 'Per-call cost tracking for all external API usage (Claude, Oxylabs, BrowserBase, etc.).';

-- ============================================================
-- Indexes for common query patterns
-- ============================================================
create index idx_changes_source_id on public.changes(source_id);
create index idx_changes_detected_at on public.changes(detected_at desc);
create index idx_changes_severity on public.changes(severity);
create index idx_changes_jurisdiction on public.changes(jurisdiction);
create index idx_changes_review_status on public.changes(review_status);
create index idx_practice_acknowledgments_practice_id on public.practice_acknowledgments(practice_id);
create index idx_source_urls_source_id on public.source_urls(source_id);
create index idx_cost_events_service on public.cost_events(service);
create index idx_cost_events_created_at on public.cost_events(created_at desc);
create index idx_practices_owner_email on public.practices(owner_email);
