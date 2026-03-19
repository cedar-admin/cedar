-- ============================================================================
-- Cedar Migration 022: Taxonomy Schema Extensions
-- Based on docs/architecture/data-architecture-research.md
-- ============================================================================

-- ── 1. Extend kg_domains with hierarchy metadata ───────────────────────────
-- NOTE: parent_id already exists (migration 008). Do NOT add parent_domain_id.
-- Just add depth, domain_code, taxonomy_source.

ALTER TABLE kg_domains
  ADD COLUMN IF NOT EXISTS depth           INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS domain_code     TEXT,        -- e.g. 'HIPAA.SECURITY.ACCESS'
  ADD COLUMN IF NOT EXISTS taxonomy_source TEXT;        -- 'cedar_internal', 'nucc', 'cfr_index'

CREATE INDEX IF NOT EXISTS idx_kg_domains_depth ON kg_domains(depth);
CREATE INDEX IF NOT EXISTS idx_kg_domains_code ON kg_domains(domain_code) WHERE domain_code IS NOT NULL;

-- ── 2. Extend kg_entity_domains with classification metadata ───────────────
-- Existing columns: entity_id, domain_id (PK), confidence, assigned_by, created_at
-- Adding: relevance_score (per research doc NUMERIC(4,3)), classified_by, classified_at, is_primary

ALTER TABLE kg_entity_domains
  ADD COLUMN IF NOT EXISTS relevance_score  NUMERIC(4,3) CHECK (relevance_score BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS classified_by    TEXT DEFAULT 'rule',
  ADD COLUMN IF NOT EXISTS classified_at    TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS is_primary       BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_entity_domains_primary
  ON kg_entity_domains(entity_id) WHERE is_primary;

-- ── 3. authority_level_enum and issuing_agency on kg_entities ─────────────
-- Values exactly from research doc (Section: "Healthcare-specific schema additions")

DO $$ BEGIN
  CREATE TYPE authority_level_enum AS ENUM (
    'federal_statute',
    'federal_regulation',
    'sub_regulatory_guidance',
    'national_coverage_determination',
    'local_coverage_determination',
    'state_statute',
    'state_board_rule',
    'professional_standard'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE kg_entities
  ADD COLUMN IF NOT EXISTS authority_level authority_level_enum,
  ADD COLUMN IF NOT EXISTS issuing_agency  TEXT;  -- primary agency shortname: 'FDA', 'DEA', 'FL-BOM'

CREATE INDEX IF NOT EXISTS idx_kg_entities_authority_level
  ON kg_entities(authority_level) WHERE authority_level IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_kg_entities_issuing_agency
  ON kg_entities(issuing_agency) WHERE issuing_agency IS NOT NULL;

-- ── 4. Extend classification_rules with pipeline stage and threshold ───────
-- is_active already exists. stage = INTEGER per research doc (1=rule, 2=keyword, 3=ml)

ALTER TABLE classification_rules
  ADD COLUMN IF NOT EXISTS stage                INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS confidence_threshold NUMERIC(4,3) NOT NULL DEFAULT 0.85;

CREATE INDEX IF NOT EXISTS idx_classification_rules_stage
  ON classification_rules(stage, is_active) WHERE is_active = true;

-- ── 5. kg_practice_types — NUCC-based practice type registry ──────────────
-- Schema from research doc + slug for machine keys (not in research doc but needed for Inngest)

CREATE TABLE IF NOT EXISTS kg_practice_types (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nucc_code      TEXT UNIQUE,              -- NUCC taxonomy code (nullable for non-standard types)
  slug           TEXT NOT NULL UNIQUE,     -- machine key: 'hormone_therapy_clinic'
  grouping       TEXT NOT NULL,            -- NUCC Level 1: 'Allopathic & Osteopathic Physicians'
  classification TEXT NOT NULL,            -- NUCC Level 2: 'Internal Medicine'
  specialization TEXT,                     -- NUCC Level 3: 'Endocrinology, Diabetes & Metabolism'
  display_name   TEXT NOT NULL,            -- 'Hormone Therapy / Endocrinology'
  is_cedar_target BOOLEAN NOT NULL DEFAULT false,  -- Cedar's primary target market
  is_active      BOOLEAN NOT NULL DEFAULT true,
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE kg_practice_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "practice_types_read" ON kg_practice_types
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "practice_types_admin" ON kg_practice_types
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ── 6. kg_entity_practice_relevance — entity ↔ practice type scoring ──────
-- Exactly from research doc

CREATE TABLE IF NOT EXISTS kg_entity_practice_relevance (
  entity_id        UUID NOT NULL REFERENCES kg_entities(id) ON DELETE CASCADE,
  practice_type_id UUID NOT NULL REFERENCES kg_practice_types(id) ON DELETE CASCADE,
  relevance_score  NUMERIC(4,3) CHECK (relevance_score BETWEEN 0 AND 1),
  classified_by    TEXT NOT NULL DEFAULT 'rule',
  classified_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (entity_id, practice_type_id)
);

CREATE INDEX IF NOT EXISTS idx_entity_practice_relevance_entity
  ON kg_entity_practice_relevance(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_practice_relevance_type
  ON kg_entity_practice_relevance(practice_type_id);
CREATE INDEX IF NOT EXISTS idx_entity_practice_relevance_score
  ON kg_entity_practice_relevance(relevance_score DESC);

ALTER TABLE kg_entity_practice_relevance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entity_practice_relevance_read" ON kg_entity_practice_relevance
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "entity_practice_relevance_admin" ON kg_entity_practice_relevance
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ── 7. kg_classification_log — audit trail for classification ─────────────
-- Schema from research doc + needs_review + run_id (needed for Inngest tracking)

CREATE TABLE IF NOT EXISTS kg_classification_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id     UUID NOT NULL REFERENCES kg_entities(id) ON DELETE CASCADE,
  domain_id     UUID REFERENCES kg_domains(id),
  stage         TEXT NOT NULL CHECK (stage IN ('rule', 'keyword', 'ml', 'manual')),
  confidence    NUMERIC(4,3),
  rule_id       UUID REFERENCES classification_rules(id),
  classified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  classified_by TEXT,                         -- rule slug, model version, or user email
  needs_review  BOOLEAN NOT NULL DEFAULT false,
  review_reason TEXT,
  run_id        TEXT                           -- Inngest run ID for batch tracing
);

CREATE INDEX IF NOT EXISTS idx_classification_log_entity
  ON kg_classification_log(entity_id);
CREATE INDEX IF NOT EXISTS idx_classification_log_stage
  ON kg_classification_log(stage);
CREATE INDEX IF NOT EXISTS idx_classification_log_needs_review
  ON kg_classification_log(needs_review) WHERE needs_review = true;
CREATE INDEX IF NOT EXISTS idx_classification_log_created
  ON kg_classification_log(classified_at DESC);

ALTER TABLE kg_classification_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "classification_log_read" ON kg_classification_log
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "classification_log_admin" ON kg_classification_log
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ── 8. kg_service_lines — clinical workflow taxonomy ─────────────────────
-- Schema from research doc + slug for machine keys
-- MUST be created before practice_service_lines (FK dependency)

CREATE TABLE IF NOT EXISTS kg_service_lines (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT NOT NULL UNIQUE,       -- machine key: 'hormone_optimization'
  name             TEXT NOT NULL,              -- 'Testosterone Pellet Therapy'
  description      TEXT,
  practice_type_id UUID REFERENCES kg_practice_types(id),  -- primary practice type
  cpt_codes        TEXT[],                     -- associated CPT code ranges
  icd10_codes      TEXT[],                     -- associated ICD-10 codes (from research doc)
  regulation_domains TEXT[],                  -- domain slugs most relevant to this service line
  is_cedar_target  BOOLEAN NOT NULL DEFAULT false,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  sort_order       INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE kg_service_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_lines_read" ON kg_service_lines
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "service_lines_admin" ON kg_service_lines
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ── 9. kg_service_line_regulations — service line ↔ entity mapping ────────
-- Schema from research doc; adds regulation_role column

CREATE TABLE IF NOT EXISTS kg_service_line_regulations (
  service_line_id  UUID NOT NULL REFERENCES kg_service_lines(id) ON DELETE CASCADE,
  entity_id        UUID NOT NULL REFERENCES kg_entities(id) ON DELETE CASCADE,
  regulation_role  TEXT NOT NULL DEFAULT 'general',
    -- 'prescribing', 'dispensing', 'billing', 'safety', 'scope_of_practice', 'general'
  relevance_score  NUMERIC(4,3) NOT NULL DEFAULT 1.0,
  classified_by    TEXT NOT NULL DEFAULT 'rule',
  classified_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (service_line_id, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_service_line_regs_service
  ON kg_service_line_regulations(service_line_id);
CREATE INDEX IF NOT EXISTS idx_service_line_regs_entity
  ON kg_service_line_regulations(entity_id);

ALTER TABLE kg_service_line_regulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_line_regs_read" ON kg_service_line_regulations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "service_line_regs_admin" ON kg_service_line_regulations
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ── 10. practice_profiles — extended onboarding configuration ────────────
-- practices already has: owner_name, practice_type (simple text), phone
-- practice_profiles adds detailed operational config for personalization

CREATE TABLE IF NOT EXISTS practice_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id         UUID NOT NULL UNIQUE REFERENCES practices(id) ON DELETE CASCADE,
  state               TEXT NOT NULL DEFAULT 'FL',
  city                TEXT,
  zip_code            TEXT,
  provider_count      INT,
  annual_revenue_band TEXT CHECK (annual_revenue_band IN ('under_500k', '500k_1m', '1m_5m', '5m_plus')),
  compounding_pharmacy BOOLEAN NOT NULL DEFAULT false,
  accepts_medicare    BOOLEAN NOT NULL DEFAULT false,
  accepts_medicaid    BOOLEAN NOT NULL DEFAULT false,
  dea_registered      BOOLEAN NOT NULL DEFAULT false,
  uses_telehealth     BOOLEAN NOT NULL DEFAULT false,
  website             TEXT,
  npi                 TEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE practice_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "practice_profiles_owner" ON practice_profiles
  FOR ALL TO authenticated
  USING  (practice_id IN (SELECT id FROM practices WHERE owner_email = (auth.jwt() ->> 'email')))
  WITH CHECK (practice_id IN (SELECT id FROM practices WHERE owner_email = (auth.jwt() ->> 'email')));
CREATE POLICY "practice_profiles_admin" ON practice_profiles
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ── 11. practice_service_lines — which service lines a practice offers ────
-- FK to kg_service_lines which is now created (step 8 above)

CREATE TABLE IF NOT EXISTS practice_service_lines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id     UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  service_line_id UUID NOT NULL REFERENCES kg_service_lines(id) ON DELETE CASCADE,
  is_primary      BOOLEAN NOT NULL DEFAULT false,
  volume_band     TEXT CHECK (volume_band IN ('low', 'medium', 'high')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (practice_id, service_line_id)
);

ALTER TABLE practice_service_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "practice_service_lines_owner" ON practice_service_lines
  FOR ALL TO authenticated
  USING  (practice_id IN (SELECT id FROM practices WHERE owner_email = (auth.jwt() ->> 'email')))
  WITH CHECK (practice_id IN (SELECT id FROM practices WHERE owner_email = (auth.jwt() ->> 'email')));
CREATE POLICY "practice_service_lines_admin" ON practice_service_lines
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ── 12. practice_staff — staffing/provider composition ───────────────────

CREATE TABLE IF NOT EXISTS practice_staff (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,  -- 'md', 'do', 'np', 'pa', 'rn', 'pharmacist', 'ma', 'admin'
  count       INT NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (practice_id, role)
);

ALTER TABLE practice_staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "practice_staff_owner" ON practice_staff
  FOR ALL TO authenticated
  USING  (practice_id IN (SELECT id FROM practices WHERE owner_email = (auth.jwt() ->> 'email')))
  WITH CHECK (practice_id IN (SELECT id FROM practices WHERE owner_email = (auth.jwt() ->> 'email')));
CREATE POLICY "practice_staff_admin" ON practice_staff
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ── 13. practice_equipment — technology/EHR inventory ────────────────────

CREATE TABLE IF NOT EXISTS practice_equipment (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id    UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  equipment_type TEXT NOT NULL,  -- 'ehr', 'pharmacy_management', 'lab', 'imaging', etc.
  vendor         TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (practice_id, equipment_type)
);

ALTER TABLE practice_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "practice_equipment_owner" ON practice_equipment
  FOR ALL TO authenticated
  USING  (practice_id IN (SELECT id FROM practices WHERE owner_email = (auth.jwt() ->> 'email')))
  WITH CHECK (practice_id IN (SELECT id FROM practices WHERE owner_email = (auth.jwt() ->> 'email')));
CREATE POLICY "practice_equipment_admin" ON practice_equipment
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');
