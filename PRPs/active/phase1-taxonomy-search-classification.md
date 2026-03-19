name: "Phase 1: Taxonomy Foundation, Search Indexes & Rule-Based Classification"

## Goal

Make the existing 98,777-entity corpus searchable, browsable, and domain-classified. This means: extending the schema with a healthcare regulatory domain hierarchy, adding full-text and faceted search indexes, seeding a 3-level domain taxonomy (~10 L1 + ~60 L2 + ~300 L3), and running a rule-based classification pass that assigns entities to domains with relevance scores.

**Note on phase scope:** The research doc (`docs/architecture/data-architecture-research.md`) places `kg_practice_types`, `kg_service_lines`, and `authority_level` in Phase 3. This PRP is per the command args, which explicitly scope all schema creation to Phase 1. Tables are created now, seeded lightly, and populated in depth during Phase 3.

## Why

- The regulation library is live with 99K real entities but has no classification — users see undifferentiated lists with no way to navigate by topic or practice type
- A 3-level domain taxonomy gives the library its navigation spine (HIPAA → Privacy Rule → PHI De-identification)
- Full-text search (tsvector + trigram) + faceted counts turn the flat 99K table into a browsable library
- Rule-based classification assigns ~70% of the corpus with high confidence — the fast, cheap first pass before ML
- `kg_practice_types`, `kg_service_lines`, and practice profile tables are created here so Phase 2/3 can populate them without additional schema work
- This is Phase 1 of 5; subsequent phases layer ML reclassification, practice personalization, and UI on top

## Success Criteria

- [ ] Migration 022 applies to production Supabase cleanly — no column/table conflicts
- [ ] Migration 023 applies cleanly — `search_vector` populated, `mv_corpus_facets` materialized
- [ ] Migration 024 seeds correctly: 10 L1 domains, 55+ L2, 50+ L3 nodes
- [ ] `kg_practice_types` seeded with 10+ NUCC-relevant practice types
- [ ] `kg_service_lines` seeded with 8+ clinical workflow records
- [ ] `corpus-classify` Inngest function registered and visible in Inngest dashboard
- [ ] Triggering `cedar/corpus.classify` classifies ≥1,000 entities without error
- [ ] `kg_entity_domains` has rows with `relevance_score` populated after classification run
- [ ] `kg_classification_log` has rows with `stage='rule'`
- [ ] Items below 0.85 confidence threshold appear in log with `needs_review=true`
- [ ] `npm run build` passes with 0 errors, 0 warnings

## Context

### Files to Read First

```yaml
- file: docs/architecture/data-architecture-research.md
  why: Primary source — contains the exact SQL blocks for all schema additions; Phase 1 section defines scope

- file: docs/wireframes/library-v2.jsx
  why: Header comment block shows the full data model intent and how tables relate to the UI

- migration: supabase/migrations/007_kg_foundation.sql
  why: kg_entities base — jurisdiction, effective_date already exist here; DON'T re-add

- migration: supabase/migrations/008_ontology_schema.sql
  why: CRITICAL — kg_domains already has parent_id (=parent_domain_id), is_active, sort_order;
       kg_entity_domains already exists with confidence + assigned_by;
       classification_rules already has is_active; must use ADD COLUMN IF NOT EXISTS

- migration: supabase/migrations/009_ontology_junction_rls.sql
  why: RLS pattern for KG junction tables — replicate for new tables

- migration: supabase/migrations/015_practice_profile.sql
  why: practices already has owner_name, practice_type, phone — don't duplicate in practice_profiles

- migration: supabase/migrations/019_kg_corpus_columns.sql
  why: kg_entities already has agencies JSONB, cfr_references JSONB, document_type, citation — don't re-add

- migration: supabase/migrations/021_kg_entity_upsert_constraint.sql
  why: Most recent migration (021); new migrations start at 022

- file: inngest/corpus-seed.ts
  why: Inngest step.run() + logger pattern to mirror exactly in corpus-classify.ts

- file: lib/db/client.ts
  why: createServerClient() — use this in all Inngest steps
```

### Critical Schema Facts — What Already Exists (DO NOT RE-ADD)

```
kg_entities columns already present:
  jurisdiction TEXT NOT NULL DEFAULT 'FL'     (migration 007)
  effective_date DATE                          (migration 007)
  entity_type_id UUID                          (migration 008)
  classification_confidence DECIMAL(3,2)       (migration 008)
  last_classified_at TIMESTAMPTZ              (migration 008)
  agencies JSONB                              (migration 019)
  cfr_references JSONB                        (migration 019)
  document_type TEXT                          (migration 019)
  citation TEXT                               (migration 019)

kg_domains columns already present:
  parent_id UUID REFERENCES kg_domains(id)    (migration 008) ← this IS parent_domain_id
  is_active BOOLEAN                           (migration 008)
  sort_order INT                              (migration 008)
  color TEXT                                  (migration 008)
  MISSING: depth, domain_code, taxonomy_source

kg_entity_domains table already exists with:
  entity_id, domain_id (composite PK)          (migration 008)
  confidence DECIMAL(3,2)                      (migration 008) ← keep as-is; add relevance_score
  assigned_by TEXT DEFAULT 'system'            (migration 008) ← keep as-is; add classified_by
  created_at TIMESTAMPTZ                       (migration 008)
  MISSING: relevance_score, classified_by, classified_at, is_primary

classification_rules columns already present:
  is_active BOOLEAN                           (migration 008)
  priority INT                                (migration 008)
  MISSING: stage (INTEGER), confidence_threshold
```

### Files to Create or Modify

```bash
# MIGRATIONS (in exact order)
supabase/migrations/022_taxonomy_schema.sql      (+) Schema additions — new tables + column extensions
supabase/migrations/023_search_indexes.sql       (+) Full-text + trigram + JSONB indexes + mv_corpus_facets
supabase/migrations/024_taxonomy_seed.sql        (+) Domain taxonomy + practice types + service lines

# INNGEST
inngest/corpus-classify.ts                       (+) Rule-based classification Inngest function

# APP REGISTRATION (read file first to find serve() location)
app/api/inngest/route.ts                         (M) Add corpusClassify to serve() array
```

---

## Tasks (execute in order)

### Task 1: Migration 022 — Schema Additions
**File:** `supabase/migrations/022_taxonomy_schema.sql`
**Action:** CREATE
**Source:** Exact SQL from `docs/architecture/data-architecture-research.md`

Write the file in this exact table order (FK dependencies):
1. kg_domains extensions
2. kg_entity_domains extensions
3. authority_level_enum + kg_entities column additions
4. classification_rules extensions
5. kg_practice_types
6. kg_entity_practice_relevance (references kg_practice_types)
7. kg_classification_log
8. **kg_service_lines** ← must come BEFORE practice_service_lines
9. kg_service_line_regulations (references kg_service_lines + kg_entities)
10. practice_profiles (references practices)
11. practice_service_lines (references kg_service_lines — FK must be already created)
12. practice_staff
13. practice_equipment

```sql
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
```

---

### Task 2: Migration 023 — Search Indexes + Materialized View
**File:** `supabase/migrations/023_search_indexes.sql`
**Action:** CREATE
**Source:** SQL from research doc "Search and indexing additions" section
**Depends on:** Task 1 (022 must be applied first for authority_level_enum column to exist)

```sql
-- ============================================================================
-- Cedar Migration 023: Full-Text Search, Trigram, JSONB Indexes + Facet View
-- Source: docs/architecture/data-architecture-research.md
-- ============================================================================

-- ── 1. pg_trgm extension (fuzzy matching) ─────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── 2. search_vector column + GIN index ───────────────────────────────────
-- Weighted: name=A (most important), description=B
ALTER TABLE kg_entities
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

UPDATE kg_entities SET search_vector =
  setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B');

CREATE INDEX IF NOT EXISTS idx_kg_entities_search ON kg_entities USING GIN (search_vector);

-- ── 3. Auto-update trigger for search_vector ──────────────────────────────
CREATE OR REPLACE FUNCTION kg_entities_search_vector_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_kg_entities_search_vector ON kg_entities;
CREATE TRIGGER trg_kg_entities_search_vector
  BEFORE INSERT OR UPDATE OF name, description ON kg_entities
  FOR EACH ROW EXECUTE FUNCTION kg_entities_search_vector_update();

-- ── 4. Trigram GIN index on name (fuzzy matching) ─────────────────────────
CREATE INDEX IF NOT EXISTS idx_kg_entities_name_trgm
  ON kg_entities USING GIN (name gin_trgm_ops);

-- ── 5. JSONB indexes ──────────────────────────────────────────────────────
-- Full JSONB GIN index (jsonb_path_ops = 40% smaller per research doc)
CREATE INDEX IF NOT EXISTS idx_kg_entities_meta
  ON kg_entities USING GIN (metadata jsonb_path_ops);

-- Expression indexes for frequently filtered JSONB fields (from research doc)
CREATE INDEX IF NOT EXISTS idx_kg_entities_metadata_jurisdiction
  ON kg_entities ((metadata->>'jurisdiction'))
  WHERE metadata->>'jurisdiction' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_kg_entities_metadata_agency
  ON kg_entities ((metadata->>'agency'))
  WHERE metadata->>'agency' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_kg_entities_metadata_cfr_ref
  ON kg_entities ((metadata->>'cfr_reference'))
  WHERE metadata->>'cfr_reference' IS NOT NULL;

-- ── 6. Materialized view for faceted navigation ───────────────────────────
-- Design from research doc: LEFT JOINs to get entity_type name + domain name
-- Groups by jurisdiction, agency (from metadata), entity_type, domain

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_corpus_facets AS
SELECT
  metadata->>'jurisdiction'  AS jurisdiction,
  metadata->>'agency'        AS agency,
  t.name                     AS entity_type,
  d.name                     AS domain,
  COUNT(*)                   AS doc_count
FROM kg_entities e
LEFT JOIN kg_entity_types t ON e.entity_type_id = t.id
LEFT JOIN kg_entity_domains ed ON e.id = ed.entity_id AND ed.is_primary = true
LEFT JOIN kg_domains d ON ed.domain_id = d.id
GROUP BY 1, 2, 3, 4;

-- NULLS NOT DISTINCT requires PostgreSQL 15. Supabase is PG 15 — safe to use.
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_corpus_facets
  ON mv_corpus_facets (jurisdiction, agency, entity_type, domain)
  NULLS NOT DISTINCT;

-- ── 7. Helper RPC for materialized view refresh ───────────────────────────
-- Called from Inngest corpus-classify at end of each run
CREATE OR REPLACE FUNCTION refresh_corpus_facets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_corpus_facets;
END;
$$;
```

---

### Task 3: Migration 024 — Taxonomy Seed Data
**File:** `supabase/migrations/024_taxonomy_seed.sql`
**Action:** CREATE
**Depends on:** Tasks 1 and 2 (tables must exist; depth column must be on kg_domains)

All INSERTs use `ON CONFLICT (slug) DO NOTHING` — fully idempotent.

**Domain hierarchy structure** (write in this order):

```sql
-- ============================================================================
-- Cedar Migration 024: Taxonomy Seed Data
-- ============================================================================

-- ── LEVEL 1: 10 Root Compliance Domains (depth=0) ────────────────────────

INSERT INTO kg_domains (slug, name, description, depth, domain_code, taxonomy_source, sort_order)
VALUES
  ('hipaa',             'HIPAA & Privacy',            'Health Insurance Portability and Accountability Act compliance', 0, 'HIPAA',    'cedar_internal', 10),
  ('medicare_medicaid', 'Medicare & Medicaid',         'CMS program billing, coverage, and fraud prevention requirements', 0, 'CMS',   'cedar_internal', 20),
  ('controlled_substances', 'Controlled Substances',   'DEA scheduling, PDMP, prescribing, dispensing requirements',    0, 'CS',      'cedar_internal', 30),
  ('fda',               'FDA Regulation',              'Food, Drug & Cosmetic Act, 503A/B compounding, labeling',       0, 'FDA',     'cedar_internal', 40),
  ('osha',              'OSHA & Workplace Safety',     'Occupational health, bloodborne pathogens, workplace standards', 0, 'OSHA',   'cedar_internal', 50),
  ('fraud_abuse',       'Fraud & Abuse',               'Anti-Kickback Statute, Stark Law, False Claims Act',            0, 'FR-ABUSE','cedar_internal', 60),
  ('licensing_cred',    'Licensing & Credentialing',   'State medical licensing, DEA registration, board requirements',  0, 'LIC',    'cedar_internal', 70),
  ('clinical_standards','Clinical Standards',          'Clinical practice guidelines, standard of care, accreditation', 0, 'CLIN',   'cedar_internal', 80),
  ('employment',        'Employment & HR',             'Labor law, provider contracts, non-compete, FMLA',              0, 'EMP',     'cedar_internal', 90),
  ('billing_coding',    'Billing & Coding',            'CPT/ICD-10 accuracy, payer rules, NSA, claim submission',       0, 'BILL',   'cedar_internal', 100)
ON CONFLICT (slug) DO NOTHING;

-- ── LEVEL 2: ~55 Regulatory Topics (depth=1) ─────────────────────────────
-- Pattern: INSERT ... SELECT slug, name, description, parent lookup, depth=1 ...

-- HIPAA L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('hipaa_privacy',         'Privacy Rule',               'PHI use, disclosure, patient rights, minimum necessary',       'HIPAA-PR',  10),
  ('hipaa_security',        'Security Rule',              'Administrative, physical, technical safeguards for ePHI',      'HIPAA-SEC', 20),
  ('hipaa_breach',          'Breach Notification',        'Breach assessment, 60-day notification, HHS reporting',        'HIPAA-BN',  30),
  ('hipaa_transactions',    'Transactions & Code Sets',   'EDI standards, 837/835/270/271, NPI usage requirements',       'HIPAA-TX',  40),
  ('hipaa_enforcement',     'HIPAA Enforcement',          'OCR investigations, civil monetary penalties, CAP',            'HIPAA-ENF', 50)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'hipaa'
ON CONFLICT (slug) DO NOTHING;

-- Medicare/Medicaid L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('cms_billing',           'CMS Billing Requirements',      'Part B billing, place of service, modifiers',               'CMS-BILL',  10),
  ('cms_coverage',          'Coverage & Medical Necessity',  'LCD/NCD, prior authorization, documentation',               'CMS-COV',   20),
  ('cms_fraud_prevention',  'Medicare Fraud Prevention',     'OIG exclusions, ZPIC/RAC audits, enrollment integrity',     'CMS-FRAUD', 30),
  ('cms_telehealth',        'CMS Telehealth Policy',         'Medicare telehealth coverage, originating site, modalities', 'CMS-TH',   40),
  ('cms_quality',           'Quality Reporting',             'MIPS, MACRA, quality measures, value-based care',           'CMS-QR',    50),
  ('medicaid_fl',           'Florida Medicaid',              'FL Medicaid managed care, provider enrollment, billing',    'FL-MCD',    60)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'medicare_medicaid'
ON CONFLICT (slug) DO NOTHING;

-- Controlled Substances L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('cs_dea_registration',   'DEA Registration',             'DEA Form 224, renewal, location-specific requirements',     'CS-DEA',    10),
  ('cs_scheduling',         'Scheduling & Classification',   'Schedule I-V criteria, rescheduling petitions, analogues',  'CS-SCHED',  20),
  ('cs_prescribing',        'Prescribing Requirements',      'Valid prescription, telehealth prescribing, Ryan Haight Act','CS-RX',    30),
  ('cs_dispensing',         'Dispensing & Recordkeeping',    'Inventory, DEA 222 forms, logbooks, theft reporting',       'CS-DISP',   40),
  ('cs_pdmp',               'PDMP Requirements',             'Florida E-FORCSE, mandatory check, reporting timelines',    'CS-PDMP',   50),
  ('cs_disposal',           'Disposal & Destruction',        'DEA take-back, on-site destruction, reverse distributor',  'CS-DISP2',  60)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'controlled_substances'
ON CONFLICT (slug) DO NOTHING;

-- FDA L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('fda_compounding',       'Drug Compounding',              '503A/503B, USP 795/797/800, outsourcing facility rules',   'FDA-COMP',  10),
  ('fda_drug_approval',     'Drug Approval & Labeling',      'NDA/ANDA, off-label use, promotional labeling rules',     'FDA-DRUG',  20),
  ('fda_enforcement',       'FDA Enforcement',               'Warning letters, import alerts, injunctions, recalls',    'FDA-ENF',   30),
  ('fda_biologics',         'Biologics & Biosimilars',       'BLA, biosimilar guidance, cell/gene therapy',             'FDA-BIO',   40),
  ('fda_devices',           'Medical Devices',               '510(k), PMA, device classification, UDI',                 'FDA-DEV',   50),
  ('fda_dietary_supplements','Dietary Supplements',          'DSHEA, structure/function claims, GMP',                   'FDA-SUPP',  60),
  ('fda_peptides',          'Peptides & Novel Therapies',    'BPC-157, ipamorelin, bulk drug list, regulatory status',  'FDA-PEPT',  70)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'fda'
ON CONFLICT (slug) DO NOTHING;

-- OSHA L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('osha_bloodborne',       'Bloodborne Pathogens',          'Exposure control plan, sharps safety, hep B vaccination', 'OSHA-BBP',  10),
  ('osha_hazcom',           'Hazard Communication',          'SDS, chemical labeling, employee training requirements',  'OSHA-HAZ',  20),
  ('osha_respiratory',      'Respiratory Protection',        'N95 fit testing, respirator program, COVID protocols',    'OSHA-RESP', 30),
  ('osha_general_industry', 'General Industry Standards',    'Walking surfaces, electrical safety, fire protection',    'OSHA-GEN',  40)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'osha'
ON CONFLICT (slug) DO NOTHING;

-- Fraud & Abuse L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('aks',                   'Anti-Kickback Statute',         'Safe harbors, referral fees, marketing arrangements',     'FR-AKS',   10),
  ('stark_law',             'Stark Law (Self-Referral)',      'Physician self-referral prohibitions, exceptions',       'FR-STARK',  20),
  ('false_claims',          'False Claims Act',              'Qui tam, overpayment return, 60-day rule, penalties',    'FR-FCA',    30),
  ('oig_compliance',        'OIG Compliance Program',        'Compliance guidance, exclusion screening, OIG hotline',  'FR-OIG',    40),
  ('transparency',          'Sunshine Act & Transparency',   'Open Payments reporting, pharma manufacturer rules',     'FR-TRANS',  50)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'fraud_abuse'
ON CONFLICT (slug) DO NOTHING;

-- Licensing & Credentialing L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('state_medical_license', 'State Medical Licensing',       'FL Board of Medicine, DO board, application, renewal, CE','LIC-MED',   10),
  ('nursing_license',       'Nursing Licensure',             'FL Board of Nursing, APRN protocols, collaborative agree','LIC-NUR',   20),
  ('pharmacy_license',      'Pharmacy Licensure',            'FL Board of Pharmacy, pharmacist-in-charge, permit types','LIC-PHARM', 30),
  ('facility_license',      'Facility Licensure',            'AHCA health care clinic, med spa registration, ASC',     'LIC-FAC',   40),
  ('scope_of_practice',     'Scope of Practice',             'NP/PA supervision, delegation, collaborative practice',  'LIC-SCOPE', 50),
  ('credentialing',         'Insurance Credentialing',       'Provider credentialing, CAQH, payer network enrollment', 'LIC-CRED',  60),
  ('cme_requirements',      'CME & CE Requirements',         'Continuing education hours, board-mandated topics',      'LIC-CME',   70)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'licensing_cred'
ON CONFLICT (slug) DO NOTHING;

-- Clinical Standards L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('standard_of_care',      'Standard of Care',              'Clinical guidelines, evidence-based protocols, liability','CLIN-SOC',  10),
  ('documentation',         'Clinical Documentation',        'Medical record requirements, retention, e-signature',    'CLIN-DOC',  20),
  ('informed_consent',      'Informed Consent',              'FL consent statutes, documentation requirements',        'CLIN-IC',   30),
  ('infection_control',     'Infection Control',             'Sterilization, disinfection, environmental services',    'CLIN-INF',  40),
  ('lab_requirements',      'Lab & Diagnostics',             'CLIA waiver, lab licensing, point-of-care testing',     'CLIN-LAB',  50),
  ('accreditation',         'Accreditation Standards',       'Joint Commission, AAAHC, AAAASF ambulatory surgery',    'CLIN-ACCR', 60)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'clinical_standards'
ON CONFLICT (slug) DO NOTHING;

-- Employment L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('employment_law',        'Employment Law',                'FLSA, ADA, Title VII, FL employment statutes',           'EMP-LAW',   10),
  ('provider_contracts',    'Provider Contracts',            'Employment vs. IC, restrictive covenants',               'EMP-CONT',  20),
  ('noncompete',            'Non-Compete Agreements',        'FL non-compete enforceability, FTC rule developments',   'EMP-NC',    30),
  ('fmla_leave',            'FMLA & Leave Policies',         'Family Medical Leave Act, FL-specific leave laws',       'EMP-FMLA',  40)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'employment'
ON CONFLICT (slug) DO NOTHING;

-- Billing & Coding L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('cpt_coding',            'CPT Coding',                    'Current Procedural Terminology, coding guidelines, updates','BILL-CPT', 10),
  ('icd10_coding',          'ICD-10 Diagnosis Coding',       'Diagnosis coding accuracy, specificity, HCC mapping',    'BILL-ICD',  20),
  ('fee_schedules',         'Fee Schedules',                 'Medicare physician fee schedule, RVU changes, locality',  'BILL-FEE', 30),
  ('prior_auth',            'Prior Authorization',           'Payer PA requirements, electronic PA, appeals process',  'BILL-PA',   40),
  ('no_surprises_act',      'Balance Billing & NSA',         'No Surprises Act, good faith estimates, balance billing ban','BILL-BB',50),
  ('cash_pay_practices',    'Cash-Pay & Concierge',          'DPC, membership fees, fee disclosure, price transparency','BILL-CASH', 60)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'billing_coding'
ON CONFLICT (slug) DO NOTHING;

-- ── LEVEL 3: ~50+ Specific Requirement Areas (depth=2) ───────────────────
-- Focus on highest-priority domains for Cedar's target market

-- HIPAA Privacy L3
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 2, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('hipaa_phi_deidentification','PHI De-identification',     'Safe Harbor & Expert Determination methods, test data',  'HIPAA-PR-DEID', 10),
  ('hipaa_minimum_necessary',   'Minimum Necessary Standard','Limiting PHI use to job function requirements',          'HIPAA-PR-MN',   20),
  ('hipaa_business_associates', 'Business Associate Agreements','BAA requirements, subcontractors, BAA templates',     'HIPAA-PR-BAA',  30),
  ('hipaa_patient_rights',      'Patient Rights',            'Access, amendment, accounting of disclosures, HIPAA Right of Access', 'HIPAA-PR-PAT', 40),
  ('hipaa_marketing',           'Marketing & Fundraising',   'Authorization requirements, treatment exception, TPO',  'HIPAA-PR-MKT',  50)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'hipaa_privacy'
ON CONFLICT (slug) DO NOTHING;

-- HIPAA Security L3
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 2, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('hipaa_risk_analysis',   'Risk Analysis & Management',   'Annual risk assessment, risk management plan, documentation','HIPAA-SEC-RA',  10),
  ('hipaa_access_controls', 'Access Controls',              'Unique user ID, emergency access, automatic logoff, encryption','HIPAA-SEC-AC', 20),
  ('hipaa_audit_controls',  'Audit Controls',               'Activity logging, review procedures, incident response',  'HIPAA-SEC-AUD', 30),
  ('hipaa_transmission',    'Transmission Security',        'Encryption in transit, VPN, TLS, email security',         'HIPAA-SEC-TX',  40),
  ('hipaa_workforce',       'Workforce Training & Sanctions','HIPAA training program, sanctions policy, background checks','HIPAA-SEC-WF', 50)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'hipaa_security'
ON CONFLICT (slug) DO NOTHING;

-- FDA Compounding L3
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 2, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('comp_503a',             '503A In-Office Compounding',   'Patient-specific compounding, valid Rx, DQSA requirements', 'FDA-COMP-503A',10),
  ('comp_503b',             '503B Outsourcing Facilities',  'FDA-registered OSFs, bulk drug substances, GMP inspection',  'FDA-COMP-503B',20),
  ('comp_usp_795',          'USP <795> Non-Sterile',        'Non-sterile compounding, BUD dating, personnel qualif.',     'FDA-COMP-795', 30),
  ('comp_usp_797',          'USP <797> Sterile',            'ISO classification, ISO 5/7/8, environmental monitoring',    'FDA-COMP-797', 40),
  ('comp_usp_800',          'USP <800> Hazardous Drugs',    'Hazardous drug handling, containment, C-PEC, engineering',  'FDA-COMP-800', 50),
  ('comp_bulk_drug',        'Bulk Drug Substances (503A)',   'FDA bulk drug list, nominated substances, 503A eligibility','FDA-COMP-BULK',60),
  ('comp_glp1_shortage',    'GLP-1 Compounding',            'Semaglutide/tirzepatide compounding during drug shortage',  'FDA-COMP-GLP1',70),
  ('comp_quality_systems',  'Compounding Quality Systems',  'CGMP equivalents, recall procedures, adverse event reporting','FDA-COMP-QS', 80)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'fda_compounding'
ON CONFLICT (slug) DO NOTHING;

-- Controlled Substances Prescribing L3
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 2, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('cs_rx_testosterone',    'Testosterone Prescribing',     'TRT protocols, lab requirements, age restrictions',         'CS-RX-TEST',  10),
  ('cs_rx_stimulants',      'Stimulant Prescribing',        'Adderall/Ritalin, ADHD diagnosis documentation',            'CS-RX-STIM',  20),
  ('cs_rx_benzodiazepines', 'Benzodiazepine Prescribing',   'Prescribing limits, co-prescribing restrictions, tapering', 'CS-RX-BENZO', 30),
  ('cs_rx_buprenorphine',   'Buprenorphine & MAT',          'MATE Act, waiver-free prescribing, OTP clinic requirements','CS-RX-BUP',   40),
  ('cs_rx_telehealth',      'Telemedicine CS Prescribing',  'Ryan Haight exceptions, DEA special registration',         'CS-RX-TH',    50)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'cs_prescribing'
ON CONFLICT (slug) DO NOTHING;

-- FDA Peptides L3
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 2, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('peptide_regulatory_status','Peptide Regulatory Status', 'Bulk drug list status, biologics vs drugs classification',  'FDA-PEPT-STAT',10),
  ('peptide_bpc157',          'BPC-157 Compliance',         'FDA guidance on BPC-157, research vs therapeutic use',      'FDA-PEPT-BPC', 20),
  ('peptide_ghrh',            'Ipamorelin & GHRH Peptides', 'Growth hormone secretagogues, compounding eligibility',     'FDA-PEPT-GHR', 30),
  ('peptide_nad',             'NAD+ & NAC Therapy',         'NAD+ IV infusion rules, NAC regulatory status changes',     'FDA-PEPT-NAD', 40),
  ('peptide_weight_loss',     'Weight Loss Peptide Therapies','Semaglutide, tirzepatide, liraglutide prescribing context','FDA-PEPT-WL',  50)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'fda_peptides'
ON CONFLICT (slug) DO NOTHING;

-- FL Medical Licensing L3
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 2, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('fl_med_license_app',    'FL Medical License Application','Initial MD/DO license, FCVS, primary source verification', 'LIC-MED-APP',  10),
  ('fl_med_license_renewal','FL License Renewal & CE',       'Biennial renewal, 40-hour CE, online CME tracking',        'LIC-MED-REN',  20),
  ('fl_med_discipline',     'FL Board Disciplinary Actions', 'Complaint process, probable cause, final orders, appeals', 'LIC-MED-DISC', 30),
  ('fl_cs_cert',            'CS Prescribing Certification',  'FL 3-hour CS course requirement, prescribing certificate', 'LIC-MED-CSC',  40),
  ('fl_telehealth_license', 'FL Telehealth Registration',    'Out-of-state provider telehealth registration, FS 456.47', 'LIC-MED-TH',   50)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'state_medical_license'
ON CONFLICT (slug) DO NOTHING;

-- Facility Licensing L3
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 2, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('fl_hcc_license',        'FL Health Care Clinic License', 'AHCA HCC license, medical director requirement, inspection','LIC-FAC-HCC', 10),
  ('fl_medspa_regulation',  'Med Spa Regulation (FL)',       'Laser/IPL, medical director, scope, ownership restrictions','LIC-FAC-SPA', 20),
  ('fl_ambulatory_surgery', 'Ambulatory Surgery Center',     'AHCA ASC license, accreditation, QAPI, adverse reporting', 'LIC-FAC-ASC', 30),
  ('fl_clinic_ownership',   'FL Clinic Ownership Laws',      'Corporate practice of medicine, AMMA, anti-fee-splitting',  'LIC-FAC-OWN', 40)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'facility_license'
ON CONFLICT (slug) DO NOTHING;

-- ── kg_practice_types seed — NUCC-relevant practices ─────────────────────
-- Schema: nucc_code, slug, grouping, classification, specialization, display_name, is_cedar_target

INSERT INTO kg_practice_types (nucc_code, slug, grouping, classification, specialization, display_name, is_cedar_target, sort_order)
VALUES
  ('207RE0101X', 'endocrinology',         'Allopathic & Osteopathic Physicians', 'Internal Medicine',  'Endocrinology, Diabetes & Metabolism', 'Endocrinology / Hormone Therapy', true, 10),
  (NULL,         'functional_medicine',   'Allopathic & Osteopathic Physicians', 'Internal Medicine',  'Integrative/Functional Medicine',       'Functional Medicine',             true, 20),
  (NULL,         'hormone_therapy_clinic','Ambulatory Health Care Facilities',   'Clinic/Center',      'Hormone Optimization',                  'Hormone Optimization Clinic',    true, 25),
  (NULL,         'med_spa',               'Ambulatory Health Care Facilities',   'Clinic/Center',      'Medical Aesthetic/Med Spa',             'Medical Spa (Med Spa)',           true, 30),
  (NULL,         'regenerative_medicine', 'Ambulatory Health Care Facilities',   'Clinic/Center',      'Regenerative Medicine',                 'Regenerative Medicine Clinic',   true, 40),
  (NULL,         'weight_management',     'Ambulatory Health Care Facilities',   'Clinic/Center',      'Medical Weight Management',             'Weight Management Clinic',        true, 50),
  (NULL,         'telehealth_practice',   'Ambulatory Health Care Facilities',   'Clinic/Center',      'Telehealth-Only Practice',              'Telehealth / Virtual Care',       true, 60),
  (NULL,         'iv_therapy',            'Ambulatory Health Care Facilities',   'Clinic/Center',      'IV Infusion Therapy',                   'IV Therapy Clinic',              true, 70),
  (NULL,         'peptide_therapy',       'Ambulatory Health Care Facilities',   'Clinic/Center',      'Peptide Therapy',                       'Peptide Therapy Clinic',         true, 80),
  ('333600000X', 'compounding_pharmacy',  'Pharmacy Service Providers',          'Pharmacy',           'Compounding Pharmacy',                  'Compounding Pharmacy (503A/B)',   true, 90),
  ('207N00000X', 'dermatology',           'Allopathic & Osteopathic Physicians', 'Dermatology',        NULL,                                    'Dermatology / Cosmetic',         true, 100),
  ('207Q00000X', 'family_medicine',       'Allopathic & Osteopathic Physicians', 'Family Medicine',    NULL,                                    'Family Medicine',                false, 110),
  ('207R00000X', 'internal_medicine',     'Allopathic & Osteopathic Physicians', 'Internal Medicine',  NULL,                                    'Internal Medicine',              false, 120),
  ('101200000X', 'chiropractor',          'Chiropractic Providers',              'Chiropractor',       NULL,                                    'Chiropractic',                   false, 130)
ON CONFLICT (slug) DO NOTHING;

-- ── kg_service_lines seed — clinical workflows ────────────────────────────

INSERT INTO kg_service_lines (slug, name, description, regulation_domains, is_cedar_target, sort_order)
VALUES
  ('hormone_optimization',  'Hormone Optimization',         'TRT, HRT, thyroid, adrenal hormone therapy',
    ARRAY['controlled_substances', 'cs_prescribing', 'cs_rx_testosterone', 'licensing_cred'], true, 10),
  ('compounding_services',  'Compounding Services',         '503A patient-specific compounding, sterile/non-sterile',
    ARRAY['fda_compounding', 'comp_503a', 'comp_usp_795', 'comp_usp_797', 'comp_usp_800'], true, 20),
  ('weight_management',     'Medical Weight Management',    'GLP-1 therapy, metabolic panels, lifestyle counseling',
    ARRAY['fda_compounding', 'comp_glp1_shortage', 'cms_billing'], true, 30),
  ('peptide_therapy',       'Peptide Therapy',              'Peptide injection protocols, research compounds, ipamorelin',
    ARRAY['fda_peptides', 'fda_compounding', 'controlled_substances'], true, 40),
  ('iv_infusion_therapy',   'IV Infusion Therapy',          'NAD+, vitamin C, glutathione, hydration infusions',
    ARRAY['clinical_standards', 'facility_license', 'billing_coding'], true, 50),
  ('aesthetic_services',    'Aesthetic & Med Spa',          'Botox, fillers, laser, body contouring, skin care',
    ARRAY['facility_license', 'fl_medspa_regulation', 'licensing_cred'], true, 60),
  ('telehealth_services',   'Telehealth / Virtual Care',    'Virtual consults, remote prescribing, multi-state care',
    ARRAY['cs_rx_telehealth', 'cms_telehealth', 'hipaa_security'], true, 70),
  ('preventive_wellness',   'Preventive & Functional Medicine','Functional labs, root cause protocols, longevity medicine',
    ARRAY['clinical_standards', 'billing_coding', 'cms_billing'], true, 80),
  ('mental_health_services','Mental Health Services',        'Psychiatry, therapy, medication management, ketamine',
    ARRAY['hipaa_privacy', 'cms_telehealth', 'licensing_cred'], false, 90),
  ('primary_care',          'Primary Care',                  'General primary care, acute visits, chronic disease',
    ARRAY['cms_billing', 'cms_coverage', 'clinical_standards'], false, 100)
ON CONFLICT (slug) DO NOTHING;
```

---

### Task 4: Inngest Classification Function
**File:** `inngest/corpus-classify.ts`
**Action:** CREATE
**Depends on:** Tasks 1-3 applied to Supabase
**Pattern:** Follow `inngest/corpus-seed.ts` for step structure, logger usage, error handling

```typescript
// Rule-based classification of kg_entities → kg_entity_domains + kg_classification_log
// Event: 'cedar/corpus.classify'
// Re-runnable: uses ON CONFLICT DO UPDATE for idempotency
// Processes in batches of 500 to stay within memory limits

import { inngest } from './client'
import { createServerClient } from '../lib/db/client'

const BATCH_SIZE = 500
const CONFIDENCE_THRESHOLD = 0.85

interface EntityRow {
  id: string
  name: string
  description: string | null
  entity_type: string
  document_type: string | null
  source_id: string | null
  metadata: Record<string, unknown> | null
  agencies: Array<{ name: string; slug?: string }> | null
  cfr_references: Array<{ title: number; part: number }> | null
  issuing_agency: string | null
}

interface Rule {
  id: string
  name: string
  domains: string[]   // domain slugs
  relevance: number   // 0–1
  test: (e: EntityRow) => boolean
}

// ── Rule helpers ───────────────────────────────────────────────────────────
function hasCFRPart(e: EntityRow, title: number, part: number): boolean {
  return (e.cfr_references ?? []).some(r => r.title === title && r.part === part)
}
function hasCFRRange(e: EntityRow, title: number, min: number, max: number): boolean {
  return (e.cfr_references ?? []).some(r => r.title === title && r.part >= min && r.part <= max)
}
function matchesKeywords(e: EntityRow, keywords: string[]): boolean {
  const text = `${e.name} ${e.description ?? ''}`.toLowerCase()
  return keywords.some(k => text.includes(k.toLowerCase()))
}
function hasAgency(e: EntityRow, names: string[]): boolean {
  return (e.agencies ?? []).some(a =>
    names.some(n => (a.name ?? '').toLowerCase().includes(n.toLowerCase()))
  )
}

// ── Classification rules ───────────────────────────────────────────────────
// Rule priorities: most specific first (high relevance), broad last (lower relevance)
const RULES: Rule[] = [
  // CFR Title 21 ranges
  { id: 'ecfr-t21-p216',    name: 'eCFR 21 CFR 216 → 503A compounding',
    domains: ['fda_compounding', 'comp_503a'], relevance: 0.95,
    test: e => hasCFRPart(e, 21, 216) },
  { id: 'ecfr-t21-p1300',   name: 'eCFR 21 CFR 1300–1322 → controlled substances',
    domains: ['controlled_substances', 'cs_scheduling', 'cs_dispensing'], relevance: 0.95,
    test: e => hasCFRRange(e, 21, 1300, 1322) },
  { id: 'ecfr-t21-p600',    name: 'eCFR 21 CFR 600–799 → biologics',
    domains: ['fda_biologics'], relevance: 0.90,
    test: e => hasCFRRange(e, 21, 600, 799) },
  { id: 'ecfr-t21-p210',    name: 'eCFR 21 CFR 210–211 → drug manufacturing',
    domains: ['fda', 'fda_drug_approval'], relevance: 0.88,
    test: e => hasCFRRange(e, 21, 210, 211) },
  { id: 'ecfr-t45',         name: 'CFR Title 45 → HIPAA',
    domains: ['hipaa'], relevance: 0.92,
    test: e => hasCFRRange(e, 45, 160, 199) },
  { id: 'ecfr-t42-400',     name: 'CFR Title 42 Part 400+ → Medicare/Medicaid',
    domains: ['medicare_medicaid'], relevance: 0.90,
    test: e => hasCFRRange(e, 42, 400, 999) },
  { id: 'ecfr-t29',         name: 'CFR Title 29 → OSHA',
    domains: ['osha'], relevance: 0.92,
    test: e => hasCFRRange(e, 29, 1900, 1999) },

  // Agency-based
  { id: 'agency-dea',       name: 'Agency: DEA → controlled substances',
    domains: ['controlled_substances'], relevance: 0.90,
    test: e => hasAgency(e, ['Drug Enforcement', 'DEA']) },
  { id: 'agency-cms',       name: 'Agency: CMS → medicare/medicaid',
    domains: ['medicare_medicaid'], relevance: 0.90,
    test: e => hasAgency(e, ['Centers for Medicare', 'Centers for Medicaid', 'CMS']) },
  { id: 'agency-ocr',       name: 'Agency: OCR → HIPAA',
    domains: ['hipaa'], relevance: 0.92,
    test: e => hasAgency(e, ['Office for Civil Rights', 'OCR']) },
  { id: 'agency-osha',      name: 'Agency: OSHA → workplace safety',
    domains: ['osha'], relevance: 0.92,
    test: e => hasAgency(e, ['Occupational Safety', 'OSHA']) },
  { id: 'agency-oig',       name: 'Agency: OIG → fraud & abuse',
    domains: ['fraud_abuse', 'oig_compliance'], relevance: 0.88,
    test: e => hasAgency(e, ['Office of Inspector General', 'OIG']) },

  // Keyword-based (lower specificity, lower relevance)
  { id: 'kw-glp1',          name: 'Keywords: GLP-1 → compounding + weight management',
    domains: ['fda_compounding', 'comp_glp1_shortage'], relevance: 0.95,
    test: e => matchesKeywords(e, ['semaglutide', 'tirzepatide', 'GLP-1', 'Ozempic', 'Mounjaro', 'Wegovy']) },
  { id: 'kw-compounding',   name: 'Keywords: compounding → fda_compounding',
    domains: ['fda_compounding'], relevance: 0.85,
    test: e => matchesKeywords(e, ['compounding', '503A', '503B', 'USP 795', 'USP 797', 'USP 800', 'outsourcing facility']) },
  { id: 'kw-controlled',    name: 'Keywords: controlled substances',
    domains: ['controlled_substances'], relevance: 0.85,
    test: e => matchesKeywords(e, ['schedule II', 'schedule III', 'schedule IV', 'controlled substance', 'PDMP', 'buprenorphine']) },
  { id: 'kw-hipaa',         name: 'Keywords: HIPAA → hipaa',
    domains: ['hipaa'], relevance: 0.90,
    test: e => matchesKeywords(e, ['HIPAA', 'PHI', 'protected health information', 'covered entity', 'business associate', 'ePHI']) },
  { id: 'kw-telehealth',    name: 'Keywords: telehealth',
    domains: ['cms_telehealth', 'cs_rx_telehealth'], relevance: 0.85,
    test: e => matchesKeywords(e, ['telehealth', 'telemedicine', 'remote prescribing', 'Ryan Haight']) },
  { id: 'kw-peptides',      name: 'Keywords: peptides → fda_peptides',
    domains: ['fda_peptides'], relevance: 0.88,
    test: e => matchesKeywords(e, ['BPC-157', 'ipamorelin', 'peptide therapy', 'growth hormone secretagogue', 'NAD+']) },
  { id: 'kw-billing',       name: 'Keywords: billing/coding',
    domains: ['billing_coding'], relevance: 0.78,
    test: e => matchesKeywords(e, ['CPT code', 'ICD-10', 'fee schedule', 'relative value unit', 'prior authorization']) },
  { id: 'kw-fl-board',      name: 'Keywords: FL board → licensing_cred',
    domains: ['licensing_cred', 'state_medical_license'], relevance: 0.88,
    test: e => matchesKeywords(e, ['Board of Medicine', 'Board of Pharmacy', 'Board of Osteopathic', 'MQA', 'medical quality assurance']) },
  { id: 'kw-testosterone',  name: 'Keywords: testosterone prescribing',
    domains: ['controlled_substances', 'cs_rx_testosterone'], relevance: 0.90,
    test: e => matchesKeywords(e, ['testosterone', 'TRT', 'hormone replacement', 'anabolic steroid']) },
  { id: 'doc-enforcement',  name: 'Doc type: enforcement → fraud_abuse',
    domains: ['fraud_abuse'], relevance: 0.75,
    test: e => e.entity_type === 'enforcement_action' || e.document_type === 'RECALL' || e.document_type === 'WARNING_LETTER' },
]

// ── Main function ──────────────────────────────────────────────────────────
export const corpusClassify = inngest.createFunction(
  {
    id: 'corpus-classify',
    name: 'Corpus Classify — Rule-Based Domain Classification',
    retries: 1,
    concurrency: { limit: 1 },
    timeoutMs: 60 * 60 * 1000,
  },
  { event: 'cedar/corpus.classify' },
  async ({ step, logger, runId }) => {

    // Step 1: Load domain slug → UUID map
    const domainMap = await step.run('load-domain-map', async () => {
      const supabase = createServerClient()
      const { data, error } = await supabase.from('kg_domains').select('id, slug')
      if (error) throw new Error(`Domain load failed: ${error.message}`)
      const map: Record<string, string> = {}
      for (const d of data ?? []) map[d.slug] = d.id
      logger.info(`[corpus-classify] ${Object.keys(map).length} domains loaded`)
      return map
    })

    // Step 2: Count entities
    const totalCount = await step.run('count-entities', async () => {
      const supabase = createServerClient()
      const { count, error } = await supabase
        .from('kg_entities')
        .select('id', { count: 'exact', head: true })
      if (error) throw new Error(`Count failed: ${error.message}`)
      logger.info(`[corpus-classify] ${count} entities to classify`)
      return count ?? 0
    })

    // Step 3: Batch classification
    const totalBatches = Math.ceil(totalCount / BATCH_SIZE)
    let totalClassified = 0
    let totalAssignments = 0

    for (let i = 0; i < totalBatches; i++) {
      const stats = await step.run(`classify-batch-${i}`, async () => {
        const supabase = createServerClient()

        const { data: entities, error } = await supabase
          .from('kg_entities')
          .select('id, name, description, entity_type, document_type, source_id, metadata, agencies, cfr_references, issuing_agency')
          .range(i * BATCH_SIZE, i * BATCH_SIZE + BATCH_SIZE - 1)

        if (error) throw new Error(`Batch ${i} fetch failed: ${error.message}`)
        if (!entities?.length) return { classified: 0, assignments: 0 }

        const domainRows: Array<{
          entity_id: string; domain_id: string; relevance_score: number
          confidence: number; classified_by: string; is_primary: boolean; assigned_by: string
        }> = []
        const logRows: Array<{
          entity_id: string; domain_id: string; stage: string; confidence: number
          classified_by: string; needs_review: boolean; review_reason: string | null; run_id: string
        }> = []

        for (const entity of entities as EntityRow[]) {
          let isPrimary = true
          for (const rule of RULES) {
            if (!rule.test(entity)) continue
            for (const domainSlug of rule.domains) {
              const domainId = domainMap[domainSlug]
              if (!domainId) continue
              const needsReview = rule.relevance < CONFIDENCE_THRESHOLD
              domainRows.push({
                entity_id: entity.id, domain_id: domainId,
                relevance_score: rule.relevance, confidence: rule.relevance,
                classified_by: rule.id, is_primary: isPrimary, assigned_by: `rule:${rule.id}`,
              })
              logRows.push({
                entity_id: entity.id, domain_id: domainId, stage: 'rule',
                confidence: rule.relevance, classified_by: rule.id,
                needs_review: needsReview,
                review_reason: needsReview ? `Confidence ${rule.relevance} below threshold ${CONFIDENCE_THRESHOLD}` : null,
                run_id: runId ?? 'unknown',
              })
              isPrimary = false
            }
          }
        }

        if (domainRows.length > 0) {
          const { error: upsertErr } = await supabase
            .from('kg_entity_domains')
            .upsert(domainRows, { onConflict: 'entity_id,domain_id' })
          if (upsertErr) logger.warn(`[corpus-classify] Batch ${i} upsert warn: ${upsertErr.message}`)
        }
        if (logRows.length > 0) {
          const { error: logErr } = await supabase.from('kg_classification_log').insert(logRows)
          if (logErr) logger.warn(`[corpus-classify] Batch ${i} log warn: ${logErr.message}`)
        }

        return { classified: entities.length, assignments: domainRows.length }
      })

      totalClassified += stats.classified
      totalAssignments += stats.assignments
      logger.info(`[corpus-classify] Batch ${i + 1}/${totalBatches} — ${stats.classified} entities, ${stats.assignments} assignments`)
    }

    // Step 4: Refresh materialized view
    await step.run('refresh-facets', async () => {
      const supabase = createServerClient()
      const { error } = await supabase.rpc('refresh_corpus_facets')
      if (error) logger.warn(`[corpus-classify] Facet refresh warn: ${error.message}`)
      else logger.info('[corpus-classify] mv_corpus_facets refreshed')
    })

    logger.info(`[corpus-classify] Done — ${totalClassified} entities, ${totalAssignments} assignments`)
    return { totalClassified, totalAssignments, totalBatches }
  }
)
```

---

### Task 5: Register Function in Inngest Route
**File:** `app/api/inngest/route.ts`
**Action:** MODIFY
**Depends on:** Task 4

Read the file first to find the exact `serve()` call, then add `corpusClassify`:

```typescript
// Add to imports:
import { corpusClassify } from '../../../inngest/corpus-classify'

// Add corpusClassify to the functions array in serve()
```

---

## Integration Points

```yaml
DATABASE:
  - Migration 022: tables + column extensions (run first; push to Supabase)
  - Migration 023: search indexes + mv_corpus_facets (run second)
  - Migration 024: seed data (run third; depends on 022 table structure)
  - After 022 is applied: regenerate types
    → npx supabase gen types typescript --project-id serumeiwrvtwisibuawe > lib/db/types.ts

INNGEST:
  - New event: 'cedar/corpus.classify' → corpusClassify function
  - corpusClassify reads kg_entities in batches of 500
  - Writes to kg_entity_domains (UPSERT) + kg_classification_log (INSERT)
  - Calls refresh_corpus_facets() RPC at end

API ROUTES:
  - app/api/inngest/route.ts: add corpusClassify to serve() array

UI:
  - No UI changes in Phase 1 — schema and data only
  - Library page already queries kg_entities; domain facets will be added in Phase 2

ENV:
  - No new env vars needed
```

## Validation

### Build Check
```bash
npm run build
# Must pass with 0 errors, 0 warnings
```

### Apply Migrations
```bash
npx supabase db push
# Verify in Supabase dashboard → Database → Migrations
# All three (022, 023, 024) should appear
```

### Verify Schema
```sql
-- New columns on kg_domains
SELECT column_name FROM information_schema.columns
WHERE table_name = 'kg_domains' AND column_name IN ('depth', 'domain_code', 'taxonomy_source');
-- 3 rows

-- New columns on kg_entity_domains
SELECT column_name FROM information_schema.columns
WHERE table_name = 'kg_entity_domains' AND column_name IN ('relevance_score', 'classified_by', 'classified_at', 'is_primary');
-- 4 rows

-- authority_level_enum type
SELECT typname FROM pg_type WHERE typname = 'authority_level_enum';

-- New tables (9 expected)
SELECT tablename FROM pg_tables WHERE schemaname = 'public'
AND tablename IN (
  'kg_practice_types', 'kg_entity_practice_relevance', 'kg_classification_log',
  'kg_service_lines', 'kg_service_line_regulations',
  'practice_profiles', 'practice_service_lines', 'practice_staff', 'practice_equipment'
);
-- 9 rows

-- search_vector populated
SELECT COUNT(*) FROM kg_entities WHERE search_vector IS NOT NULL;
-- ~98,777

-- mv_corpus_facets populated
SELECT COUNT(*) FROM mv_corpus_facets;
-- > 0 (even before classification runs)
```

### Verify Seed Data
```sql
-- Domain counts by level
SELECT depth, COUNT(*) FROM kg_domains GROUP BY depth ORDER BY depth;
-- depth=0: 10, depth=1: 55+, depth=2: 50+

-- Practice types
SELECT COUNT(*), COUNT(*) FILTER (WHERE is_cedar_target) AS cedar_target
FROM kg_practice_types;

-- Service lines
SELECT slug, is_cedar_target FROM kg_service_lines ORDER BY sort_order;
```

### Trigger Classification Run
```bash
# Terminal 1
npx inngest-cli@latest dev

# Terminal 2
env -u ANTHROPIC_API_KEY npx next dev --port 3000

# In Inngest dashboard (localhost:8288):
# Send event: cedar/corpus.classify  payload: {}
# Watch steps: load-domain-map → count-entities → classify-batch-0..N → refresh-facets
```

### Verify Classification Results
```sql
-- Entities with at least one domain assignment
SELECT COUNT(DISTINCT entity_id) FROM kg_entity_domains;

-- Domain assignment distribution (top 10)
SELECT d.slug, d.name, COUNT(ed.entity_id) AS entity_count
FROM kg_domains d
LEFT JOIN kg_entity_domains ed ON ed.domain_id = d.id
GROUP BY d.id, d.slug, d.name
ORDER BY entity_count DESC
LIMIT 10;

-- Classification log summary
SELECT stage, needs_review, COUNT(*) AS count
FROM kg_classification_log
GROUP BY stage, needs_review;
-- should show stage='rule', needs_review=false (bulk) + needs_review=true (low-confidence)

-- Unclassified entities (expect some — not all rules will match)
SELECT COUNT(*) FROM kg_entities e
WHERE NOT EXISTS (SELECT 1 FROM kg_entity_domains ed WHERE ed.entity_id = e.id);
```

### Regenerate Types (after migrations applied)
```bash
npx supabase gen types typescript --project-id serumeiwrvtwisibuawe > lib/db/types.ts
npm run build  # verify clean
```

## Anti-Patterns

- ❌ Do not add `parent_domain_id` — `parent_id` already exists in migration 008 and serves the same purpose
- ❌ Do not add `is_active` to `classification_rules` — already exists in migration 008
- ❌ Do not add `jurisdiction` or `effective_date` to `kg_entities` — already exists in migration 007
- ❌ Do not create `practice_service_lines` before `kg_service_lines` — FK will fail; use the ordering in Task 1
- ❌ Do not use `REFRESH MATERIALIZED VIEW CONCURRENTLY` without a unique index on the view (added in 023)
- ❌ Do not use `DECIMAL(3,2)` for relevance scores — research doc uses `NUMERIC(4,3)` for 0.000–1.000 precision
- ❌ Do not skip `ON CONFLICT (slug) DO NOTHING` on seed INSERTs — must be idempotent
- ❌ Do not forget to register `corpusClassify` in the Inngest `serve()` call
- ❌ Do not process all 99K entities in one Supabase query — batch at 500

## Confidence Score: 9/10

The research doc and wireframe are now incorporated. The 1-point deduction is for:
- The `mv_corpus_facets` refresh with `CONCURRENTLY` requires a unique index with `NULLS NOT DISTINCT` — this is PostgreSQL 15 syntax; Supabase is on PG 15, but verify before applying
- The `kg_entity_domains` upsert uses `onConflict: 'entity_id,domain_id'` — verify PostgREST treats the composite PRIMARY KEY as the conflict target (it should; if not, add `UNIQUE (entity_id, domain_id)` explicitly)
