-- Cedar MVP: Initial Schema
-- All tables use UUIDs, timestamptz for timestamps, and default jurisdiction 'FL'
-- The changes table is APPEND-ONLY — enforced by trigger in 003_rls_policies.sql

-- Practices: one row per subscribing medical practice
CREATE TABLE practices (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_email            TEXT NOT NULL UNIQUE,
  name                   TEXT NOT NULL,
  tier                   TEXT NOT NULL DEFAULT 'monitor' CHECK (tier IN ('monitor', 'intelligence')),
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sources: the 71 regulatory sources Cedar monitors
CREATE TABLE sources (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  jurisdiction TEXT NOT NULL DEFAULT 'FL',
  url          TEXT NOT NULL,
  fetch_method TEXT NOT NULL CHECK (fetch_method IN ('gov_api', 'oxylabs', 'browserbase')),
  tier         TEXT NOT NULL CHECK (tier IN ('critical', 'high', 'medium', 'low')),
  is_active    BOOLEAN NOT NULL DEFAULT true,
  scrape_config JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Source URLs: individual URLs tracked per source (some sources have multiple endpoints)
CREATE TABLE source_urls (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id      UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  url            TEXT NOT NULL,
  last_fetched_at TIMESTAMPTZ,
  last_hash      TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Changes: detected regulatory changes — APPEND-ONLY
-- Never UPDATE or DELETE rows. Append-only enforced by trigger in 003_rls_policies.sql
CREATE TABLE changes (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id          UUID NOT NULL REFERENCES sources(id),
  source_url_id      UUID REFERENCES source_urls(id),
  jurisdiction       TEXT NOT NULL DEFAULT 'FL',
  detected_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  content_before     TEXT,
  content_after      TEXT,
  diff               TEXT,
  hash               TEXT NOT NULL,
  chain_hash         TEXT,
  agent_version      TEXT,
  relevance_score    FLOAT,
  severity           TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low', 'informational')),
  summary            TEXT,
  raw_classification JSONB,
  review_status      TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'auto_approved')),
  -- Corrections: if superseded by a newer change record
  superseded_by      UUID REFERENCES changes(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Practice acknowledgments: which practice acknowledged which change
CREATE TABLE practice_acknowledgments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id      UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  change_id        UUID NOT NULL REFERENCES changes(id),
  acknowledged_by  TEXT NOT NULL, -- email of staff member who acknowledged
  acknowledged_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(practice_id, change_id)
);

-- Review actions: HITL reviewer decisions — never update changes directly
CREATE TABLE review_actions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_id   UUID NOT NULL REFERENCES changes(id),
  reviewer_id TEXT NOT NULL, -- WorkOS user ID
  action      TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'edit')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cost events: every external API call logged here
CREATE TABLE cost_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service    TEXT NOT NULL, -- 'claude', 'oxylabs', 'browserbase', 'docling', 'whisper', 'resend', 'onesignal'
  operation  TEXT NOT NULL, -- e.g. 'relevance_filter', 'classify', 'summarize', 'fetch', 'email'
  tokens_in  INTEGER,
  tokens_out INTEGER,
  cost_usd   NUMERIC(10, 6) NOT NULL,
  context    JSONB, -- e.g. { change_id, source_id, practice_id }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_changes_source_id ON changes(source_id);
CREATE INDEX idx_changes_detected_at ON changes(detected_at DESC);
CREATE INDEX idx_changes_severity ON changes(severity);
CREATE INDEX idx_changes_jurisdiction ON changes(jurisdiction);
CREATE INDEX idx_changes_review_status ON changes(review_status);
CREATE INDEX idx_practice_acknowledgments_practice_id ON practice_acknowledgments(practice_id);
CREATE INDEX idx_source_urls_source_id ON source_urls(source_id);
CREATE INDEX idx_cost_events_service ON cost_events(service);
CREATE INDEX idx_cost_events_created_at ON cost_events(created_at DESC);
