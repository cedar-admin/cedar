-- Migration: 022_taxonomy_schema.sql
-- Purpose: Taxonomy schema extensions — practice types, entity-practice relevance, classification log, service lines, practice profiles/staff/equipment
-- Tables affected: kg_domains (alter), kg_entity_domains (alter), kg_entities (alter), classification_rules (alter), kg_practice_types, kg_entity_practice_relevance, kg_classification_log, kg_service_lines, kg_service_line_regulations, practice_profiles, practice_service_lines, practice_staff, practice_equipment (create)
-- Special considerations: Creates authority_level_enum type; owner policies reference practices.owner_email (add index)

-- ── 1. Extend kg_domains with hierarchy metadata ───────────────────────────
-- NOTE: parent_id already exists (migration 008). Do NOT add parent_domain_id.
-- Just add depth, domain_code, taxonomy_source.

alter table public.kg_domains
  add column if not exists depth           integer not null default 0,
  add column if not exists domain_code     text,        -- e.g. 'HIPAA.SECURITY.ACCESS'
  add column if not exists taxonomy_source text;        -- 'cedar_internal', 'nucc', 'cfr_index'

create index if not exists idx_kg_domains_depth on public.kg_domains(depth);
create index if not exists idx_kg_domains_code on public.kg_domains(domain_code) where domain_code is not null;

-- ── 2. Extend kg_entity_domains with classification metadata ───────────────
-- Existing columns: entity_id, domain_id (PK), confidence, assigned_by, created_at
-- Adding: relevance_score (per research doc NUMERIC(4,3)), classified_by, classified_at, is_primary

alter table public.kg_entity_domains
  add column if not exists relevance_score  numeric(4,3) check (relevance_score between 0 and 1),
  add column if not exists classified_by    text default 'rule',
  add column if not exists classified_at    timestamptz default now(),
  add column if not exists is_primary       boolean not null default false;

create index if not exists idx_entity_domains_primary
  on public.kg_entity_domains(entity_id) where is_primary;

-- ── 3. authority_level_enum and issuing_agency on kg_entities ─────────────
-- Values exactly from research doc (Section: "Healthcare-specific schema additions")

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

alter table public.kg_entities
  add column if not exists authority_level authority_level_enum,
  add column if not exists issuing_agency  text;  -- primary agency shortname: 'FDA', 'DEA', 'FL-BOM'

create index if not exists idx_kg_entities_authority_level
  on public.kg_entities(authority_level) where authority_level is not null;
create index if not exists idx_kg_entities_issuing_agency
  on public.kg_entities(issuing_agency) where issuing_agency is not null;

-- ── 4. Extend classification_rules with pipeline stage and threshold ───────
-- is_active already exists. stage = INTEGER per research doc (1=rule, 2=keyword, 3=ml)

alter table public.classification_rules
  add column if not exists stage                integer not null default 1,
  add column if not exists confidence_threshold numeric(4,3) not null default 0.85;

create index if not exists idx_classification_rules_stage
  on public.classification_rules(stage, is_active) where is_active = true;

-- ── 5. kg_practice_types — NUCC-based practice type registry ──────────────
-- Schema from research doc + slug for machine keys (not in research doc but needed for Inngest)

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

create policy "practice_types_select_authenticated" on public.kg_practice_types
  for select to authenticated using (true);
create policy "practice_types_insert_admin" on public.kg_practice_types
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "practice_types_update_admin" on public.kg_practice_types
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "practice_types_delete_admin" on public.kg_practice_types
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── 6. kg_entity_practice_relevance — entity <-> practice type scoring ──────
-- Exactly from research doc

create table if not exists public.kg_entity_practice_relevance (
  entity_id        uuid not null references public.kg_entities(id) on delete cascade,
  practice_type_id uuid not null references public.kg_practice_types(id) on delete cascade,
  relevance_score  numeric(4,3) check (relevance_score between 0 and 1),
  classified_by    text not null default 'rule',
  classified_at    timestamptz not null default now(),
  primary key (entity_id, practice_type_id)
);

comment on table public.kg_entity_practice_relevance is 'Entity-to-practice-type relevance scores for personalized regulation feeds.';

create index if not exists idx_entity_practice_relevance_entity
  on public.kg_entity_practice_relevance(entity_id);
create index if not exists idx_entity_practice_relevance_type
  on public.kg_entity_practice_relevance(practice_type_id);
create index if not exists idx_entity_practice_relevance_score
  on public.kg_entity_practice_relevance(relevance_score desc);

alter table public.kg_entity_practice_relevance enable row level security;

create policy "entity_practice_relevance_select_authenticated" on public.kg_entity_practice_relevance
  for select to authenticated using (true);
create policy "entity_practice_relevance_insert_admin" on public.kg_entity_practice_relevance
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "entity_practice_relevance_update_admin" on public.kg_entity_practice_relevance
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "entity_practice_relevance_delete_admin" on public.kg_entity_practice_relevance
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── 7. kg_classification_log — audit trail for classification ─────────────
-- Schema from research doc + needs_review + run_id (needed for Inngest tracking)

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

create index if not exists idx_classification_log_entity
  on public.kg_classification_log(entity_id);
create index if not exists idx_classification_log_stage
  on public.kg_classification_log(stage);
create index if not exists idx_classification_log_needs_review
  on public.kg_classification_log(needs_review) where needs_review = true;
create index if not exists idx_classification_log_created
  on public.kg_classification_log(classified_at desc);

alter table public.kg_classification_log enable row level security;

create policy "classification_log_select_authenticated" on public.kg_classification_log
  for select to authenticated using (true);
create policy "classification_log_insert_admin" on public.kg_classification_log
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "classification_log_update_admin" on public.kg_classification_log
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "classification_log_delete_admin" on public.kg_classification_log
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── 8. kg_service_lines — clinical workflow taxonomy ─────────────────────
-- Schema from research doc + slug for machine keys
-- MUST be created before practice_service_lines (FK dependency)

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

create policy "service_lines_select_authenticated" on public.kg_service_lines
  for select to authenticated using (true);
create policy "service_lines_insert_admin" on public.kg_service_lines
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "service_lines_update_admin" on public.kg_service_lines
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "service_lines_delete_admin" on public.kg_service_lines
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── 9. kg_service_line_regulations — service line <-> entity mapping ────────
-- Schema from research doc; adds regulation_role column

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

create index if not exists idx_service_line_regs_service
  on public.kg_service_line_regulations(service_line_id);
create index if not exists idx_service_line_regs_entity
  on public.kg_service_line_regulations(entity_id);

alter table public.kg_service_line_regulations enable row level security;

create policy "service_line_regs_select_authenticated" on public.kg_service_line_regulations
  for select to authenticated using (true);
create policy "service_line_regs_insert_admin" on public.kg_service_line_regulations
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "service_line_regs_update_admin" on public.kg_service_line_regulations
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "service_line_regs_delete_admin" on public.kg_service_line_regulations
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── 10. practice_profiles — extended onboarding configuration ────────────
-- practices already has: owner_name, practice_type (simple text), phone
-- practice_profiles adds detailed operational config for personalization

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

create policy "practice_profiles_select_owner" on public.practice_profiles
  for select to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));
create policy "practice_profiles_insert_owner" on public.practice_profiles
  for insert to authenticated
  with check (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));
create policy "practice_profiles_update_owner" on public.practice_profiles
  for update to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')))
  with check (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));
create policy "practice_profiles_delete_owner" on public.practice_profiles
  for delete to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_profiles_select_admin" on public.practice_profiles
  for select to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');
create policy "practice_profiles_insert_admin" on public.practice_profiles
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "practice_profiles_update_admin" on public.practice_profiles
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "practice_profiles_delete_admin" on public.practice_profiles
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── 11. practice_service_lines — which service lines a practice offers ────
-- FK to kg_service_lines which is now created (step 8 above)

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

create policy "practice_service_lines_select_owner" on public.practice_service_lines
  for select to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));
create policy "practice_service_lines_insert_owner" on public.practice_service_lines
  for insert to authenticated
  with check (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));
create policy "practice_service_lines_update_owner" on public.practice_service_lines
  for update to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')))
  with check (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));
create policy "practice_service_lines_delete_owner" on public.practice_service_lines
  for delete to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_service_lines_select_admin" on public.practice_service_lines
  for select to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');
create policy "practice_service_lines_insert_admin" on public.practice_service_lines
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "practice_service_lines_update_admin" on public.practice_service_lines
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "practice_service_lines_delete_admin" on public.practice_service_lines
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── 12. practice_staff — staffing/provider composition ───────────────────

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

create policy "practice_staff_select_owner" on public.practice_staff
  for select to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));
create policy "practice_staff_insert_owner" on public.practice_staff
  for insert to authenticated
  with check (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));
create policy "practice_staff_update_owner" on public.practice_staff
  for update to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')))
  with check (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));
create policy "practice_staff_delete_owner" on public.practice_staff
  for delete to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_staff_select_admin" on public.practice_staff
  for select to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');
create policy "practice_staff_insert_admin" on public.practice_staff
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "practice_staff_update_admin" on public.practice_staff
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "practice_staff_delete_admin" on public.practice_staff
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── 13. practice_equipment — technology/EHR inventory ────────────────────

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

create policy "practice_equipment_select_owner" on public.practice_equipment
  for select to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));
create policy "practice_equipment_insert_owner" on public.practice_equipment
  for insert to authenticated
  with check (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));
create policy "practice_equipment_update_owner" on public.practice_equipment
  for update to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')))
  with check (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));
create policy "practice_equipment_delete_owner" on public.practice_equipment
  for delete to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_equipment_select_admin" on public.practice_equipment
  for select to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');
create policy "practice_equipment_insert_admin" on public.practice_equipment
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "practice_equipment_update_admin" on public.practice_equipment
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "practice_equipment_delete_admin" on public.practice_equipment
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');
