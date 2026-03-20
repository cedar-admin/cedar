-- ============================================================================
-- Cedar Declarative Schema: Tables
-- ============================================================================
-- This file represents the desired final state of all database tables.
-- It is NOT executed as a migration. Use for reference and to generate
-- migrations via `supabase db diff -f <migration_name>`.
--
-- Source: consolidated from migrations 001-027
-- ============================================================================


-- ============================================================================
-- EXTENSIONS
-- ============================================================================

create extension if not exists hstore;
create extension if not exists pg_trgm;


-- ============================================================================
-- ENUM TYPES
-- ============================================================================

do $$ begin
  create type authority_level_enum as enum (
    'federal_statute',
    'federal_regulation',
    'sub_regulatory_guidance',
    'national_coverage_determination',
    'local_coverage_determination',
    'state_statute',
    'state_board_rule',
    'professional_standard'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type relationship_type_enum as enum (
    'amends',           -- FR document modifies CFR section
    'amended_by',       -- inverse
    'supersedes',       -- new regulation replaces old
    'superseded_by',    -- inverse
    'implements',       -- regulation implements a statute
    'interprets',       -- guidance/notice interprets regulation
    'cites',            -- document references another
    'cited_by',         -- inverse
    'corrects',         -- correction of another document
    'part_of',          -- section → part → chapter hierarchy
    'has_legal_basis',  -- regulation → authorizing statute
    'conflicts_with',   -- identified regulatory conflict
    'related_to',       -- general association
    'delegates_to',     -- authority delegation
    'enables',          -- permits an activity
    'restricts'         -- constrains an activity
  );
exception when duplicate_object then null;
end $$;


-- ============================================================================
-- TIER 1: NO FK DEPENDENCIES
-- ============================================================================


-- ── practices ───────────────────────────────────────────────────────────────
-- Source: 001, altered by 014, 015, 017, 018

create table public.practices (
  id                     uuid primary key default gen_random_uuid(),
  owner_email            text not null unique,
  name                   text not null,
  tier                   text not null default 'monitor' check (tier in ('monitor', 'intelligence')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at             timestamptz not null default now(),
  -- 014_billing_columns
  subscription_status    text default 'inactive'
    check (subscription_status in (
      'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'inactive'
    )),
  current_period_end     timestamptz,
  -- 015_practice_profile
  owner_name             text,
  practice_type          text
    check (practice_type in (
      'medical_practice', 'pharmacy', 'dental', 'mental_health',
      'physical_therapy', 'chiropractic', 'optometry', 'other'
    )),
  phone                  text,
  -- 017_notification_prefs
  notification_preferences jsonb
    not null
    default '{"email_alerts": true, "email_threshold": "high", "weekly_digest": false}'::jsonb,
  -- 018_practices_soft_delete
  deleted_at             timestamptz null default null
);

alter table public.practices enable row level security;

comment on table public.practices is 'Subscribing medical practices with owner, tier, and Stripe billing references.';


-- ── sources ─────────────────────────────────────────────────────────────────
-- Source: 001

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


-- ── cost_events ─────────────────────────────────────────────────────────────
-- Source: 001

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


-- ── kg_entity_types ─────────────────────────────────────────────────────────
-- Source: 008

create table public.kg_entity_types (
    id              uuid primary key default gen_random_uuid(),

    -- Identity
    slug            text not null unique,          -- machine key: 'regulation', 'enforcement_action'
    name            text not null,                 -- display: 'Regulation', 'Enforcement Action'
    description     text,                          -- one-sentence definition

    -- Hierarchy
    parent_id       uuid references public.kg_entity_types(id),
    depth           int not null default 0,        -- 0 = root, 1 = child, 2 = grandchild
    path            text not null default '',       -- materialized path: 'regulation/final_rule'
    sort_order      int not null default 0,        -- display ordering within siblings

    -- Classification guidance
    distinguishing_criteria text,                  -- what separates this type from similar types
    example_documents       text[],               -- real-world examples for classifier training

    -- Lifecycle
    is_active       boolean not null default true,
    is_system       boolean not null default false, -- system types can't be deleted, only deactivated
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    created_by      text,                          -- admin user id or 'system'

    -- Constraints
    constraint depth_limit check (depth <= 3),
    constraint slug_format check (slug ~ '^[a-z][a-z0-9_]*$')
);

comment on table public.kg_entity_types is 'Hierarchical registry of entity types — every kg_entity references one type.';

alter table public.kg_entity_types enable row level security;


-- ── kg_relationship_types ───────────────────────────────────────────────────
-- Source: 008

create table public.kg_relationship_types (
    id              uuid primary key default gen_random_uuid(),

    -- Identity
    slug            text not null unique,
    name            text not null,                 -- 'Supersedes', 'Amends'
    description     text,                          -- what this relationship means

    -- Directionality
    forward_label   text not null,                 -- A → B: "supersedes"
    inverse_label   text not null,                 -- B → A: "superseded by"

    -- Constraints on usage
    valid_from_types text[],                       -- entity type slugs allowed as source (null = any)
    valid_to_types   text[],                       -- entity type slugs allowed as target (null = any)
    is_temporal      boolean not null default false, -- does this relationship have effective dates?
    is_exclusive     boolean not null default false, -- can an entity have only one of these?

    -- Lifecycle
    is_active       boolean not null default true,
    is_system       boolean not null default false,
    sort_order      int not null default 0,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    created_by      text,

    constraint slug_format check (slug ~ '^[a-z][a-z0-9_]*$')
);

comment on table public.kg_relationship_types is 'Typed directed relationships between entities with directionality labels.';

alter table public.kg_relationship_types enable row level security;


-- ── kg_domains ──────────────────────────────────────────────────────────────
-- Source: 008, altered by 022

create table public.kg_domains (
    id              uuid primary key default gen_random_uuid(),
    slug            text not null unique,
    name            text not null,
    description     text,
    parent_id       uuid references public.kg_domains(id),
    color           text,                          -- hex color for UI display
    is_active       boolean not null default true,
    sort_order      int not null default 0,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    -- 022_taxonomy_schema
    depth           integer not null default 0,
    domain_code     text,        -- e.g. 'HIPAA.SECURITY.ACCESS'
    taxonomy_source text,        -- 'cedar_internal', 'nucc', 'cfr_index'

    constraint slug_format check (slug ~ '^[a-z][a-z0-9_]*$')
);

comment on table public.kg_domains is 'Cross-cutting domain labels applied to entities (many-to-many via kg_entity_domains).';

alter table public.kg_domains enable row level security;


-- ── kg_jurisdictions ────────────────────────────────────────────────────────
-- Source: 008

create table public.kg_jurisdictions (
    id              uuid primary key default gen_random_uuid(),
    code            text not null unique,           -- 'US', 'FL', 'FL-BOM', 'FL-BOP'
    name            text not null,
    jurisdiction_type text not null,                -- 'federal', 'state', 'board', 'local'
    parent_code     text references public.kg_jurisdictions(code),
    is_active       boolean not null default true,
    created_at      timestamptz not null default now()
);

comment on table public.kg_jurisdictions is 'Hierarchical jurisdiction registry — federal, state, board, local.';

alter table public.kg_jurisdictions enable row level security;


-- ── classification_rule_sets ────────────────────────────────────────────────
-- Source: 008

create table public.classification_rule_sets (
    id              uuid primary key default gen_random_uuid(),
    name            text not null,
    description     text,
    is_active       boolean not null default true,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    created_by      text not null default 'system'
);

comment on table public.classification_rule_sets is 'Named groups of classification rules that can be toggled together.';

alter table public.classification_rule_sets enable row level security;


-- ── kg_practice_types ───────────────────────────────────────────────────────
-- Source: 022

create table if not exists public.kg_practice_types (
  id             uuid primary key default gen_random_uuid(),
  nucc_code      text unique,              -- NUCC taxonomy code (nullable for non-standard types)
  slug           text not null unique,     -- machine key: 'hormone_therapy_clinic'
  grouping       text not null,            -- NUCC Level 1: 'Allopathic & Osteopathic Physicians'
  classification text not null,            -- NUCC Level 2: 'Internal Medicine'
  specialization text,                     -- NUCC Level 3: 'Endocrinology, Diabetes & Metabolism'
  display_name   text not null,            -- 'Hormone Therapy / Endocrinology'
  is_cedar_target boolean not null default false,  -- Cedar's primary target market
  is_active      boolean not null default true,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now()
);

comment on table public.kg_practice_types is 'NUCC-based practice type registry for Cedar target market segmentation.';

alter table public.kg_practice_types enable row level security;


-- ── kg_service_lines ────────────────────────────────────────────────────────
-- Source: 022

create table if not exists public.kg_service_lines (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,       -- machine key: 'hormone_optimization'
  name             text not null,              -- 'Testosterone Pellet Therapy'
  description      text,
  practice_type_id uuid references public.kg_practice_types(id),  -- primary practice type
  cpt_codes        text[],                     -- associated CPT code ranges
  icd10_codes      text[],                     -- associated ICD-10 codes (from research doc)
  regulation_domains text[],                  -- domain slugs most relevant to this service line
  is_cedar_target  boolean not null default false,
  is_active        boolean not null default true,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now()
);

comment on table public.kg_service_lines is 'Clinical workflow taxonomy linking services to regulation domains.';

alter table public.kg_service_lines enable row level security;


-- ── crawl_templates ─────────────────────────────────────────────────────────
-- Source: 011

create table public.crawl_templates (
    id              uuid primary key default gen_random_uuid(),
    slug            text not null unique,
    name            text not null,
    description     text,

    -- The template scrape_config — sources inherit from this
    -- Source-level scrape_config fields override template fields (shallow merge per top-level key)
    default_config  jsonb not null default '{}',

    -- Which sources use this template
    -- (denormalized count for admin UI — computed, not authoritative)
    source_count    int not null default 0,

    -- Template versioning
    version         int not null default 1,
    changelog       jsonb default '[]',

    -- Lifecycle
    is_active       boolean not null default true,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    created_by      text not null default 'system',

    constraint slug_format check (slug ~ '^[a-z][a-z0-9_]*$')
);

comment on table public.crawl_templates is 'Template-driven scrape configurations that sources inherit from.';

alter table public.crawl_templates enable row level security;


-- ── validation_log ──────────────────────────────────────────────────────────
-- Source: 013

create table public.validation_log (
  id              uuid primary key default gen_random_uuid(),
  run_at          timestamptz not null default now(),
  run_type        text not null default 'weekly_chain_validation',
  sources_checked int not null default 0,
  chains_valid    int not null default 0,
  chains_broken   int not null default 0,
  total_changes   int not null default 0,
  -- Array of { change_id, chain_sequence, type, expected, actual, source_id } objects
  errors          jsonb not null default '[]',
  summary         text,
  created_at      timestamptz not null default now()
);

alter table public.validation_log enable row level security;

comment on table public.validation_log is
  'One row per weekly audit chain validation run. chains_broken > 0 indicates tamper detection.';


-- ── taxonomy_changelog ──────────────────────────────────────────────────────
-- Source: 008

create table public.taxonomy_changelog (
    id              uuid primary key default gen_random_uuid(),

    table_name      text not null,                  -- which taxonomy table changed
    record_id       uuid not null,                  -- which record changed
    action          text not null,                  -- 'insert', 'update', 'delete', 'deactivate'

    old_values      jsonb,                          -- before (null for inserts)
    new_values      jsonb,                          -- after (null for deletes)

    changed_by      text not null,                  -- admin user id or 'system'
    reason          text,
    created_at      timestamptz not null default now()
);

comment on table public.taxonomy_changelog is 'Append-only audit log of changes to the taxonomy system itself.';

alter table public.taxonomy_changelog enable row level security;


-- ── feature_flags ───────────────────────────────────────────────────────────
-- Source: 002

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


-- ── prompt_templates ────────────────────────────────────────────────────────
-- Source: 002

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


-- ── system_config ───────────────────────────────────────────────────────────
-- Source: 002

create table public.system_config (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  value       text not null,
  description text,
  updated_at  timestamptz not null default now()
);

alter table public.system_config enable row level security;

comment on table public.system_config is 'Operational thresholds and configuration — cost limits, schedules, confidence thresholds.';


-- ── review_rules ────────────────────────────────────────────────────────────
-- Source: 002

create table public.review_rules (
  id              uuid primary key default gen_random_uuid(),
  severity        text not null unique check (severity in ('critical', 'high', 'medium', 'low', 'informational')),
  auto_approve    boolean not null default false,
  route_to_hitl   boolean not null default false,
  notes           text
);

alter table public.review_rules enable row level security;

comment on table public.review_rules is 'HITL routing rules — determines which severity levels require attorney review.';


-- ============================================================================
-- TIER 2: DEPENDS ON sources
-- ============================================================================


-- ── source_urls ─────────────────────────────────────────────────────────────
-- Source: 001, altered by 006, 011

create table public.source_urls (
  id              uuid primary key default gen_random_uuid(),
  source_id       uuid not null references public.sources(id) on delete cascade,
  url             text not null,
  last_fetched_at timestamptz,
  last_hash       text,
  created_at      timestamptz not null default now(),
  -- 006_fetch_method_tracking
  last_fetch_method text
    check (last_fetch_method in ('gov_api', 'oxylabs', 'browserbase')),
  -- 011_crawl_profiles
  scrape_config   jsonb
);

alter table public.source_urls enable row level security;

comment on table public.source_urls is 'Individual URLs tracked per source; some sources have multiple monitored endpoints.';


-- ============================================================================
-- TIER 3: DEPENDS ON sources + source_urls
-- ============================================================================


-- ── changes ─────────────────────────────────────────────────────────────────
-- Source: 001, altered by 010, 012, 016

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
  review_status      text not null default 'pending' check (review_status in ('pending', 'pending_review', 'approved', 'rejected', 'auto_approved', 'not_required')),
  -- Corrections: if superseded by a newer change record
  superseded_by      uuid references public.changes(id),
  created_at         timestamptz not null default now(),
  -- 010_chain_sequence
  prev_chain_hash    text,
  chain_sequence     integer,
  -- 012_normalized_diff
  normalized_diff    jsonb,
  -- 016_hitl_columns
  reviewed_by        text,
  reviewed_at        timestamptz,
  review_action      text,
  review_notes       text
);

alter table public.changes enable row level security;

comment on table public.changes is 'Append-only ledger of detected regulatory changes with AI classification and chain-hashed audit trail.';


-- ============================================================================
-- TIER 4: DEPENDS ON practices + changes
-- ============================================================================


-- ── practice_acknowledgments ────────────────────────────────────────────────
-- Source: 001

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


-- ── review_actions ──────────────────────────────────────────────────────────
-- Source: 001

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


-- ============================================================================
-- TIER 5: DEPENDS ON kg_entities (and sources/changes)
-- ============================================================================

-- NOTE: kg_entities must be created before its dependents, but it also has
-- FKs to sources and changes (Tier 1/3), plus columns added by 008, 019, 022, 023.


-- ── kg_entities ─────────────────────────────────────────────────────────────
-- Source: 007, altered by 008, 019, 022, 023

create table public.kg_entities (
    id              uuid primary key default gen_random_uuid(),
    name            text not null,
    description     text,
    entity_type     text not null,           -- human-readable slug, e.g. 'regulation'
    jurisdiction    text not null default 'FL',
    status          text,                    -- e.g. 'active', 'proposed', 'superseded'
    identifier      text,                    -- official document number or citation
    effective_date  date,
    source_id       uuid references public.sources(id),
    change_id       uuid references public.changes(id),
    external_url    text,
    metadata        jsonb,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    -- 008_ontology_schema
    entity_type_id              uuid references public.kg_entity_types(id),
    current_classification_id   uuid,  -- FK added below after classification_results is created
    classification_confidence   decimal(3,2),
    last_classified_at          timestamptz,
    -- 019_kg_corpus_columns
    publication_date   date,
    document_type      text,
    pdf_url            text,
    comment_close_date date,
    agencies           jsonb,
    cfr_references     jsonb,
    citation           text,
    -- 022_taxonomy_schema
    authority_level    authority_level_enum,
    issuing_agency     text,  -- primary agency shortname: 'FDA', 'DEA', 'FL-BOM'
    -- 023_search_indexes
    search_vector      tsvector
);

comment on table public.kg_entities is
  'Discrete regulatory artifacts — statutes, rules, guidance, enforcement actions — forming the knowledge graph.';

alter table public.kg_entities enable row level security;


-- ── kg_relationships ────────────────────────────────────────────────────────
-- Source: 007, altered by 008, 025

create table public.kg_relationships (
    id                  uuid primary key default gen_random_uuid(),
    source_entity_id    uuid not null references public.kg_entities(id) on delete cascade,
    target_entity_id    uuid not null references public.kg_entities(id) on delete cascade,
    relationship_type   text not null,       -- e.g. 'supersedes', 'amends', 'implements'
    confidence          decimal(3,2),        -- 0.00-1.00, null = manually asserted (certain)
    notes               text,
    source_change_id    uuid references public.changes(id),
    created_at          timestamptz not null default now(),
    -- 008_ontology_schema
    relationship_type_id uuid references public.kg_relationship_types(id),
    -- 025_phase2_schema
    rel_type         relationship_type_enum,
    effective_date   date,
    end_date         date,
    provenance       text,
      -- 'api_cfr_references' | 'api_correction_of' | 'nlp_extracted' | 'manual'
    fr_citation      text
      -- e.g. '89 FR 1433'
);

comment on table public.kg_relationships is
  'Directed edges between KG entities with typed relationships and provenance.';

alter table public.kg_relationships enable row level security;


-- ── kg_entity_versions ──────────────────────────────────────────────────────
-- Source: 007, altered by 025

create table public.kg_entity_versions (
    id              uuid primary key default gen_random_uuid(),
    entity_id       uuid not null references public.kg_entities(id) on delete cascade,
    version_number  integer not null,
    snapshot        jsonb not null,          -- full entity state at this version
    change_id       uuid references public.changes(id),
    created_at      timestamptz not null default now(),
    unique (entity_id, version_number),
    -- 025_phase2_schema
    version_date         date,
    content_hash         text,    -- SHA-256 of content_snapshot
    content_snapshot     text,    -- full regulation text at this point
    fr_document_number   text,    -- FR doc that triggered this version
    change_summary       text     -- AI-generated summary of what changed
);

comment on table public.kg_entity_versions is
  'Immutable snapshots of entity state over time, linked to triggering changes.';

alter table public.kg_entity_versions enable row level security;


-- ── kg_entity_domains ───────────────────────────────────────────────────────
-- Source: 008, altered by 022

create table public.kg_entity_domains (
    entity_id       uuid not null references public.kg_entities(id) on delete cascade,
    domain_id       uuid not null references public.kg_domains(id) on delete cascade,
    confidence      decimal(3,2),                  -- 0.00-1.00, null if manually assigned
    assigned_by     text not null default 'system', -- 'system', 'agent', or admin user id
    created_at      timestamptz not null default now(),
    primary key (entity_id, domain_id),
    -- 022_taxonomy_schema
    relevance_score  numeric(4,3) check (relevance_score between 0 and 1),
    classified_by    text default 'rule',
    classified_at    timestamptz default now(),
    is_primary       boolean not null default false
);

comment on table public.kg_entity_domains is 'Junction table mapping entities to domains with confidence scores.';

alter table public.kg_entity_domains enable row level security;


-- ── kg_entity_jurisdictions ─────────────────────────────────────────────────
-- Source: 008

create table public.kg_entity_jurisdictions (
    entity_id       uuid not null references public.kg_entities(id) on delete cascade,
    jurisdiction_id uuid not null references public.kg_jurisdictions(id) on delete cascade,
    is_primary      boolean not null default false,
    created_at      timestamptz not null default now(),
    primary key (entity_id, jurisdiction_id)
);

comment on table public.kg_entity_jurisdictions is 'Junction table mapping entities to multiple jurisdictions.';

alter table public.kg_entity_jurisdictions enable row level security;


-- ── classification_rules ────────────────────────────────────────────────────
-- Source: 008, altered by 022

create table public.classification_rules (
    id              uuid primary key default gen_random_uuid(),

    -- Identity
    name            text not null,
    description     text,

    -- Rule definition
    rule_type       text not null default 'assign_entity_type',
    -- 'assign_entity_type' — sets entity_type on matching content
    -- 'assign_domain'      — tags matching content with a domain
    -- 'assign_severity'    — sets severity level
    -- 'flag_for_review'    — routes to HITL review
    -- 'exclude'            — marks content as non-regulatory noise

    -- Conditions (evaluated as AND — all must match)
    conditions      jsonb not null default '[]',
    -- Each condition: { "field": "...", "operator": "...", "value": "..." }
    -- Fields: source_id, source_name, source_agency, jurisdiction,
    --         content_keywords, document_structure, url_pattern,
    --         content_length, detected_severity, agent_confidence
    -- Operators: eq, neq, contains, not_contains, gt, lt, gte, lte,
    --            matches (regex), in, not_in, exists, not_exists

    -- Action (what to do when conditions match)
    action          jsonb not null default '{}',
    -- Examples:
    --   { "entity_type_slug": "enforcement_action" }
    --   { "domain_slugs": ["compounding", "controlled_substances"] }
    --   { "severity": "critical", "requires_review": true }
    --   { "exclude": true, "reason": "navigation content" }

    -- Execution
    priority        int not null default 100,       -- lower = evaluated first
    stop_on_match   boolean not null default false,  -- if true, skip remaining rules
    rule_set_id     uuid,                           -- optional grouping (FK added below)

    -- Lifecycle
    is_active       boolean not null default true,
    version         int not null default 1,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    created_by      text not null default 'system',

    -- Stats
    times_matched   bigint not null default 0,
    last_matched_at timestamptz,

    -- 022_taxonomy_schema
    stage                integer not null default 1,
    confidence_threshold numeric(4,3) not null default 0.85
);

comment on table public.classification_rules is 'Programmatic rules evaluated at ingest time for entity classification.';

alter table public.classification_rules enable row level security;


-- ── classification_results ──────────────────────────────────────────────────
-- Source: 008

create table public.classification_results (
    id              uuid primary key default gen_random_uuid(),

    -- What was classified
    change_id       uuid references public.changes(id),           -- if classifying a change
    entity_id       uuid references public.kg_entities(id),       -- if classifying an entity

    -- Classification output
    entity_type_slug    text references public.kg_entity_types(slug),
    domain_slugs        text[],
    severity            text,
    confidence          decimal(3,2),                       -- 0.00-1.00

    -- How it was classified
    classification_method text not null,
    -- 'programmatic' — matched a classification_rule
    -- 'agent'        — classified by intelligence pipeline
    -- 'manual'       — admin override

    -- Provenance
    rule_id         uuid references public.classification_rules(id),  -- which rule matched (programmatic)
    agent_name      text,                                       -- which agent (agent)
    agent_version   text,                                       -- agent@version
    model           text,                                       -- claude model used
    reasoning       text,                                       -- agent's reasoning or admin's notes
    raw_output      jsonb,                                      -- full agent response

    -- Lifecycle
    is_current      boolean not null default true,              -- latest classification for this entity
    superseded_by   uuid references public.classification_results(id),
    created_at      timestamptz not null default now(),
    created_by      text not null default 'system',

    -- At least one target must be set
    constraint has_target check (change_id is not null or entity_id is not null)
);

comment on table public.classification_results is 'Provenance records for every classification attempt — programmatic, agent, or manual.';

alter table public.classification_results enable row level security;


-- ── classification_overrides ────────────────────────────────────────────────
-- Source: 008

create table public.classification_overrides (
    id              uuid primary key default gen_random_uuid(),

    -- What was reclassified
    entity_id       uuid references public.kg_entities(id),
    change_id       uuid references public.changes(id),

    -- What changed
    field_changed   text not null,                  -- 'entity_type', 'domains', 'severity', 'metadata'
    old_value       jsonb not null,
    new_value       jsonb not null,

    -- Who and why
    overridden_by   text not null,                  -- admin user id
    reason          text not null,                  -- required: explain every override

    -- Context
    previous_result_id uuid references public.classification_results(id),
    new_result_id      uuid references public.classification_results(id),

    created_at      timestamptz not null default now(),

    constraint has_target check (entity_id is not null or change_id is not null)
);

comment on table public.classification_overrides is 'Append-only audit trail of manual reclassification decisions.';

alter table public.classification_overrides enable row level security;


-- ── kg_entity_merges ────────────────────────────────────────────────────────
-- Source: 008

create table public.kg_entity_merges (
    id              uuid primary key default gen_random_uuid(),

    -- The merge
    surviving_entity_id uuid not null references public.kg_entities(id),
    merged_entity_id    uuid not null references public.kg_entities(id),

    -- Context
    merge_reason    text not null,
    merge_strategy  text not null default 'keep_surviving',
    -- 'keep_surviving'   — surviving entity's data wins
    -- 'keep_merged'      — merged entity's data wins
    -- 'combine'          — merge metadata from both

    -- Snapshot of merged entity at time of merge (for undo)
    merged_entity_snapshot jsonb not null,

    -- Who
    merged_by       text not null,
    created_at      timestamptz not null default now(),

    constraint different_entities check (surviving_entity_id != merged_entity_id)
);

comment on table public.kg_entity_merges is 'Append-only records of entity merge operations with full snapshots for undo.';

alter table public.kg_entity_merges enable row level security;


-- ── kg_entity_practice_relevance ────────────────────────────────────────────
-- Source: 022

create table if not exists public.kg_entity_practice_relevance (
  entity_id        uuid not null references public.kg_entities(id) on delete cascade,
  practice_type_id uuid not null references public.kg_practice_types(id) on delete cascade,
  relevance_score  numeric(4,3) check (relevance_score between 0 and 1),
  classified_by    text not null default 'rule',
  classified_at    timestamptz not null default now(),
  primary key (entity_id, practice_type_id)
);

comment on table public.kg_entity_practice_relevance is 'Entity-to-practice-type relevance scores for personalized regulation feeds.';

alter table public.kg_entity_practice_relevance enable row level security;


-- ── kg_classification_log ───────────────────────────────────────────────────
-- Source: 022

create table if not exists public.kg_classification_log (
  id            uuid primary key default gen_random_uuid(),
  entity_id     uuid not null references public.kg_entities(id) on delete cascade,
  domain_id     uuid references public.kg_domains(id),
  stage         text not null check (stage in ('rule', 'keyword', 'ml', 'manual')),
  confidence    numeric(4,3),
  rule_id       uuid references public.classification_rules(id),
  classified_at timestamptz not null default now(),
  classified_by text,                         -- rule slug, model version, or user email
  needs_review  boolean not null default false,
  review_reason text,
  run_id        text                           -- Inngest run ID for batch tracing
);

comment on table public.kg_classification_log is 'Audit trail for domain classification pipeline runs.';

alter table public.kg_classification_log enable row level security;


-- ── kg_service_line_regulations ─────────────────────────────────────────────
-- Source: 022

create table if not exists public.kg_service_line_regulations (
  service_line_id  uuid not null references public.kg_service_lines(id) on delete cascade,
  entity_id        uuid not null references public.kg_entities(id) on delete cascade,
  regulation_role  text not null default 'general',
    -- 'prescribing', 'dispensing', 'billing', 'safety', 'scope_of_practice', 'general'
  relevance_score  numeric(4,3) not null default 1.0,
  classified_by    text not null default 'rule',
  classified_at    timestamptz not null default now(),
  primary key (service_line_id, entity_id)
);

comment on table public.kg_service_line_regulations is 'Service line to entity mapping with regulation roles.';

alter table public.kg_service_line_regulations enable row level security;


-- ============================================================================
-- TIER 6: DEPENDS ON practices
-- ============================================================================


-- ── practice_profiles ───────────────────────────────────────────────────────
-- Source: 022

create table if not exists public.practice_profiles (
  id                  uuid primary key default gen_random_uuid(),
  practice_id         uuid not null unique references public.practices(id) on delete cascade,
  state               text not null default 'FL',
  city                text,
  zip_code            text,
  provider_count      int,
  annual_revenue_band text check (annual_revenue_band in ('under_500k', '500k_1m', '1m_5m', '5m_plus')),
  compounding_pharmacy boolean not null default false,
  accepts_medicare    boolean not null default false,
  accepts_medicaid    boolean not null default false,
  dea_registered      boolean not null default false,
  uses_telehealth     boolean not null default false,
  website             text,
  npi                 text,
  onboarding_complete boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.practice_profiles is 'Extended onboarding configuration — operational details for personalization.';

alter table public.practice_profiles enable row level security;


-- ── practice_service_lines ──────────────────────────────────────────────────
-- Source: 022

create table if not exists public.practice_service_lines (
  id              uuid primary key default gen_random_uuid(),
  practice_id     uuid not null references public.practices(id) on delete cascade,
  service_line_id uuid not null references public.kg_service_lines(id) on delete cascade,
  is_primary      boolean not null default false,
  volume_band     text check (volume_band in ('low', 'medium', 'high')),
  created_at      timestamptz not null default now(),
  unique (practice_id, service_line_id)
);

comment on table public.practice_service_lines is 'Which service lines a practice offers, with volume indicators.';

alter table public.practice_service_lines enable row level security;


-- ── practice_staff ──────────────────────────────────────────────────────────
-- Source: 022

create table if not exists public.practice_staff (
  id          uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id) on delete cascade,
  role        text not null,  -- 'md', 'do', 'np', 'pa', 'rn', 'pharmacist', 'ma', 'admin'
  count       int not null default 1,
  created_at  timestamptz not null default now(),
  unique (practice_id, role)
);

comment on table public.practice_staff is 'Staffing and provider composition per practice.';

alter table public.practice_staff enable row level security;


-- ── practice_equipment ──────────────────────────────────────────────────────
-- Source: 022

create table if not exists public.practice_equipment (
  id             uuid primary key default gen_random_uuid(),
  practice_id    uuid not null references public.practices(id) on delete cascade,
  equipment_type text not null,  -- 'ehr', 'pharmacy_management', 'lab', 'imaging', etc.
  vendor         text,
  created_at     timestamptz not null default now(),
  unique (practice_id, equipment_type)
);

comment on table public.practice_equipment is 'Technology and EHR inventory per practice.';

alter table public.practice_equipment enable row level security;


-- ============================================================================
-- TIER 7: DEPENDS ON classification_rule_sets (FK constraint added separately)
-- ============================================================================

alter table public.classification_rules
    add constraint fk_rule_set
    foreign key (rule_set_id) references public.classification_rule_sets(id);


-- ============================================================================
-- TIER 8: kg_domain_practice_type_map (no FK dependencies, text slugs)
-- ============================================================================


-- ── kg_domain_practice_type_map ─────────────────────────────────────────────
-- Source: 027

create table if not exists public.kg_domain_practice_type_map (
  id                   uuid primary key default gen_random_uuid(),
  domain_slug          text not null,
  practice_type_slug   text not null,
  relevance_weight     numeric(4,3) not null default 0.80
    check (relevance_weight between 0 and 1),
  applies_to_all_types boolean not null default false,
  created_at           timestamptz not null default now(),
  unique (domain_slug, practice_type_slug)
);

comment on table public.kg_domain_practice_type_map is 'Maps regulatory domains to practice types with relevance weights for scoring pipeline.';

alter table public.kg_domain_practice_type_map enable row level security;


-- ============================================================================
-- TIER 9: DEPENDS ON source_urls
-- ============================================================================


-- ── discovery_runs ──────────────────────────────────────────────────────────
-- Source: 011

create table public.discovery_runs (
    id              uuid primary key default gen_random_uuid(),
    source_url_id   uuid not null references public.source_urls(id),

    -- Run details
    run_type        text not null,  -- 'pass_1_skim', 'pass_2_extract', 'initial_crawl', 'workflow'
    started_at      timestamptz not null default now(),
    completed_at    timestamptz,
    status          text not null default 'running',  -- running, completed, failed, partial

    -- Pass 1 results
    items_scanned   int default 0,
    items_changed   int default 0,
    items_new       int default 0,
    items_queued    int default 0,         -- queued for pass 2
    nav_changed     boolean default false,  -- structural navigation change detected

    -- Pass 2 results
    items_extracted int default 0,
    items_classified int default 0,
    entities_created int default 0,

    -- Cost
    fetch_cost_usd  decimal(10,6) default 0,
    agent_cost_usd  decimal(10,6) default 0,

    -- Learned patterns this run
    patterns_discovered jsonb default '[]',

    -- Errors
    errors          jsonb default '[]',

    created_at      timestamptz not null default now()
);

comment on table public.discovery_runs is 'Per-source monitoring pass log with scan, extraction, and cost metrics.';

alter table public.discovery_runs enable row level security;


-- ============================================================================
-- DEFERRED FK: kg_entities.current_classification_id → classification_results
-- (classification_results created after kg_entities)
-- ============================================================================

alter table public.kg_entities
    add constraint fk_kg_entities_current_classification
    foreign key (current_classification_id) references public.classification_results(id);


-- ============================================================================
-- MATERIALIZED VIEWS
-- ============================================================================


-- ── mv_corpus_facets ────────────────────────────────────────────────────────
-- Source: 023

create materialized view if not exists public.mv_corpus_facets as
select
  metadata->>'jurisdiction'  as jurisdiction,
  metadata->>'agency'        as agency,
  t.name                     as entity_type,
  d.name                     as domain,
  count(*)                   as doc_count
from public.kg_entities e
left join public.kg_entity_types t on e.entity_type_id = t.id
left join public.kg_entity_domains ed on e.id = ed.entity_id and ed.is_primary = true
left join public.kg_domains d on ed.domain_id = d.id
group by 1, 2, 3, 4;


-- ── mv_practice_relevance_summary ───────────────────────────────────────────
-- Source: 027

create materialized view if not exists public.mv_practice_relevance_summary as
select
  pt.id               as practice_type_id,
  pt.slug             as practice_type_slug,
  pt.display_name,
  pt.is_cedar_target,
  count(distinct epr.entity_id)                                                as total_regulations,
  count(distinct case when epr.relevance_score >= 0.90 then epr.entity_id end) as high_relevance_count,
  count(distinct case when epr.relevance_score >= 0.70
                       and epr.relevance_score <  0.90 then epr.entity_id end) as medium_relevance_count,
  round(avg(epr.relevance_score)::numeric, 3)                                  as avg_relevance_score
from public.kg_practice_types pt
left join public.kg_entity_practice_relevance epr
  on epr.practice_type_id = pt.id
  and epr.relevance_score >= 0.70
group by pt.id, pt.slug, pt.display_name, pt.is_cedar_target;


-- ============================================================================
-- REGULAR VIEWS
-- ============================================================================


-- ── v_entity_types_flat ─────────────────────────────────────────────────────
-- Source: 008

create view public.v_entity_types_flat as
select
    t.id,
    t.slug,
    t.name,
    t.description,
    t.path,
    t.depth,
    p.slug as parent_slug,
    p.name as parent_name,
    t.is_active,
    t.sort_order,
    (select count(*) from public.kg_entities e where e.entity_type_id = t.id) as entity_count
from public.kg_entity_types t
left join public.kg_entity_types p on t.parent_id = p.id
where t.is_active = true
order by t.path, t.sort_order;


-- ── v_entity_details ────────────────────────────────────────────────────────
-- Source: 008

create view public.v_entity_details as
select
    e.id,
    e.name,
    e.description,
    e.status,
    e.effective_date,
    e.jurisdiction,
    et.slug as entity_type_slug,
    et.name as entity_type_name,
    et.path as entity_type_path,
    e.classification_confidence,
    array_agg(distinct d.slug) filter (where d.slug is not null) as domain_slugs,
    array_agg(distinct d.name) filter (where d.name is not null) as domain_names,
    array_agg(distinct j.code) filter (where j.code is not null) as jurisdiction_codes,
    e.created_at,
    e.updated_at
from public.kg_entities e
left join public.kg_entity_types et on e.entity_type_id = et.id
left join public.kg_entity_domains ed on e.id = ed.entity_id
left join public.kg_domains d on ed.domain_id = d.id
left join public.kg_entity_jurisdictions ej on e.id = ej.entity_id
left join public.kg_jurisdictions j on ej.jurisdiction_id = j.id
group by e.id, et.slug, et.name, et.path;


-- ── v_classification_history ────────────────────────────────────────────────
-- Source: 008

create view public.v_classification_history as
select
    cr.id,
    cr.entity_id,
    cr.change_id,
    cr.entity_type_slug,
    cr.domain_slugs,
    cr.severity,
    cr.confidence,
    cr.classification_method,
    cr.agent_name,
    cr.agent_version,
    cr.reasoning,
    cr.is_current,
    cr.created_at,
    cr.created_by
from public.classification_results cr
order by cr.created_at desc;


-- ── v_active_rules ──────────────────────────────────────────────────────────
-- Source: 008

create view public.v_active_rules as
select
    r.id,
    r.name,
    r.description,
    r.rule_type,
    r.conditions,
    r.action,
    r.priority,
    r.times_matched,
    r.last_matched_at,
    rs.name as rule_set_name,
    r.updated_at
from public.classification_rules r
left join public.classification_rule_sets rs on r.rule_set_id = rs.id
where r.is_active = true
order by r.priority;
