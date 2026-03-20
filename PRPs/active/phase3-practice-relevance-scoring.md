name: "Phase 3 — Practice-Type Relevance Scoring & Healthcare Specialization"

## Goal

Populate the connections between the classified 99K-entity corpus and specific practice types / clinical workflows: (1) fill `kg_entity_practice_relevance` using domain-to-practice-type heuristics + Claude API fallback, (2) fill `kg_service_line_regulations` using domain-to-service-line mapping rules + Claude API fallback, (3) populate `authority_level` on `kg_entities` using source metadata + Claude API fallback, (4) add a `kg_domain_practice_type_map` mapping table with full seed data, and (5) add a `mv_practice_relevance_summary` materialized view for fast dashboard rendering.

All three scoring functions run two passes: **rule-based first** (fast, deterministic, no cost), then **ML pass via Claude API** for entities that couldn't be classified by rules. All functions are idempotent and re-runnable — a full reclassification pass cleanly replaces previous results (except entries with `classified_by = 'manual'`).

## Why

- Cedar's library is currently corpus-wide — it shows all 99K entities to every user regardless of practice type. Phase 3 makes it possible to filter the library, change feed, and alerts to what matters for a hormone optimization clinic vs. a compounding pharmacy.
- The practice-type filter in `library-v2.jsx` drives off `kg_entity_practice_relevance`. Without population, the filter returns nothing.
- Service line tags on entity cards drive off `kg_service_line_regulations`. Without population, no service line tags appear.
- `authority_level` enables sorting by regulatory weight (federal statute → state board rule).
- This phase is a prerequisite for Phase 4 (ML classification) and the practice-filtered dashboard views.

## Success Criteria

- [ ] Migration 027 applied to production — `kg_domain_practice_type_map` exists with ≥50 rows; `mv_practice_relevance_summary` exists with 14 rows
- [ ] `corpus-authority-classify` runs successfully; `SELECT COUNT(*) FROM kg_entities WHERE authority_level IS NOT NULL` returns > 80,000 rows (rule + ML combined)
- [ ] `corpus-practice-score` runs successfully; `SELECT COUNT(*) FROM kg_entity_practice_relevance` returns > 100,000 rows
- [ ] `corpus-service-line-map` runs successfully; all 10 service lines have ≥50 entity mappings
- [ ] `SELECT stage, COUNT(*) FROM kg_classification_log GROUP BY stage` shows both `rule` and `ml` rows
- [ ] `mv_practice_relevance_summary` shows non-zero `total_regulations` for all 8 Cedar-target practice types
- [ ] `npm run build` passes with 0 errors, 0 warnings
- [ ] All three functions registered in Inngest dashboard and triggerable manually

## Context

### Files to Read First

```yaml
- migration: supabase/migrations/022_taxonomy_schema.sql
  why: Defines all Phase 1 tables — kg_practice_types, kg_entity_practice_relevance,
       kg_service_line_regulations, kg_service_lines, authority_level_enum, kg_classification_log

- migration: supabase/migrations/024_taxonomy_seed.sql
  why: ALL seeded slugs for kg_practice_types (14 rows) and kg_service_lines (10 rows with
       regulation_domains array). Scoring functions must use these exact slugs.

- migration: supabase/migrations/023_search_indexes.sql
  why: mv_corpus_facets definition and refresh_corpus_facets() RPC — replicate for mv_practice_relevance_summary

- file: inngest/corpus-classify.ts
  why: Canonical batch Inngest pattern — BATCH_SIZE, step.run() per batch, upsert with onConflict,
       load maps in first step, log rows, refresh view at end. Mirror this exactly.

- file: lib/cost-tracker.ts
  why: trackCost() + calculateClaudeCost() interface — required for every Claude API call.
       Model: claude-sonnet-4-5-20250929. $3/$15 per M input/output tokens.

- file: app/api/inngest/route.ts
  why: Where new functions must be registered (import + add to functions array)

- file: lib/db/client.ts
  why: createServerClient() — use this in all Inngest functions (service role, bypasses RLS)
```

### Current File Tree (relevant subset)

```bash
inngest/
  corpus-classify.ts      # batch classifier — exact pattern to follow
  corpus-seed.ts
  fr-daily-poll.ts
  ecfr-daily-check.ts
  client.ts
lib/
  cost-tracker.ts         # trackCost() + calculateClaudeCost()
  db/client.ts            # createServerClient()
supabase/migrations/
  022_taxonomy_schema.sql  # Phase 1 schema (all target tables)
  023_search_indexes.sql   # mv_corpus_facets + refresh RPC pattern
  024_taxonomy_seed.sql    # practice_types + service_lines seed slugs
  025_phase2_schema.sql    # relationship type enum + versioning
  026_phase2_config_seed.sql
app/api/inngest/route.ts   # register all functions here
```

### Files to Create or Modify

```bash
supabase/migrations/027_phase3_schema.sql   (+) kg_domain_practice_type_map + mv_practice_relevance_summary
inngest/corpus-authority-classify.ts        (+) populate authority_level — rule pass + ML fallback
inngest/corpus-practice-score.ts            (+) populate kg_entity_practice_relevance — rule + ML
inngest/corpus-service-line-map.ts          (+) populate kg_service_line_regulations — rule + ML
app/api/inngest/route.ts                    (M) register 3 new functions
```

### ML Classification Architecture

Each function has two passes that run sequentially within the same Inngest function:

**Pass 1 — Rule-based (stage: 'rule')**
- Deterministic heuristics: CFR part ranges, source name patterns, document_type, agency metadata
- Fast, zero cost, covers ~70-80% of corpus
- Results written immediately; logged to `kg_classification_log` with `stage = 'rule'`

**Pass 2 — ML fallback via Claude API (stage: 'ml')**
- Runs only on entities not classified by Pass 1
- Batches of 15 entities per API call (balance token efficiency vs. parsing reliability)
- Claude receives: entity name, description, document_type, source_name, cfr_references (as context)
- Claude returns structured JSON with scores/classifications
- Results written via UPSERT; logged to `kg_classification_log` with `stage = 'ml'`, `classified_by = 'claude-sonnet'`
- Every API call tracked via `trackCost()` from `lib/cost-tracker.ts`

**Re-run behavior (idempotency):**
- All scoring tables use `UPSERT ... ON CONFLICT DO UPDATE SET ... WHERE classified_by != 'manual'`
- This means: rule and ML results are overwritten on re-run; manual review entries are preserved
- `kg_classification_log` is always INSERT (append-only audit trail) — each run adds new rows
- `kg_entities.authority_level` and `issuing_agency` use plain UPDATE on every re-run (no manual protection needed at this stage)

### Known Gotchas

```typescript
// 1. corpus-classify MUST run before corpus-practice-score and corpus-service-line-map.
//    Both depend on kg_entity_domains being populated. Log a warning if count is 0.

// 2. authority_level column already exists on kg_entities (migration 022).
//    Use UPSERT on entity id (not UPDATE WHERE NULL) so re-runs overwrite stale values.
//    Only update authority_level and issuing_agency — never touch other columns.

// 3. Claude API — model and cost:
//    model: 'claude-sonnet-4-5-20250929' (full model ID — use this exact string)
//    classified_by: 'claude-sonnet-4-5-20250929' (same string in kg_classification_log)
//    Import: import Anthropic from '@anthropic-ai/sdk'
//    Cost: calculateClaudeCost(tokensIn, tokensOut) from lib/cost-tracker.ts
//    Wire trackCost() on every Claude call from day one — no exceptions.
//    Operation names: 'corpus_authority_classify', 'corpus_practice_score', 'corpus_service_line_map'

// 4. Claude batch size = 15 entities per call.
//    Larger batches risk exceeding context or getting truncated JSON.
//    If Claude returns invalid JSON, log the error and skip the batch (don't throw).
//    Only send entities that heuristic rules didn't cover — never send the full corpus to Claude.

// 5. Claude prompt must request strict JSON only — no prose, no markdown.
//    Wrap parse in try/catch; on failure: logger.warn() and continue.
//    Include assigned_domains in entity context for practice-score and service-line-map prompts.

// 6. needs_review threshold is 0.70 (not 0.75):
//    If Claude returns relevance_score or confidence < 0.70: write to kg_classification_log
//    with needs_review=true. Do NOT suppress the row — write it but flag it.
//    The HITL review workflow will surface these for human inspection.

// 7. kg_classification_log records for ML pass: stage='ml', classified_by='claude-sonnet-4-5-20250929',
//    run_id from Inngest runId. Insert one row per entity (not per domain assignment).

// 7. The UPSERT WHERE classified_by != 'manual' guard:
//    Supabase JS upsert doesn't support conditional DO UPDATE natively.
//    Work around: before writing, fetch existing rows with classified_by='manual',
//    exclude those entity IDs from the upsert batch.

// 8. applies_to_all_types = true in kg_domain_practice_type_map:
//    One row with a sentinel practice_type_slug is sufficient. The scoring function
//    checks applies_to_all_types and fans out to all practice type IDs at runtime.

// 9. kg_service_lines.regulation_domains is TEXT[] of domain slugs.
//    May contain slugs that have no kg_entity_domains entries yet (before corpus-classify runs).
//    This is not an error — the ML pass will catch entities missed by the rule-based join.
```

## Tasks (execute in order)

---

### Task 1: Migration 027

**File:** `supabase/migrations/027_phase3_schema.sql`
**Action:** CREATE

```sql
-- ============================================================================
-- Cedar Migration 027: Phase 3 — Domain-Practice-Type Map + Practice Summary View
-- ============================================================================

-- ── 1. kg_domain_practice_type_map ───────────────────────────────────────────
-- Maps domain slugs → practice type slugs with relevance weights.
-- Drives the rule-based pass in corpus-practice-score.
-- applies_to_all_types = true: one sentinel row means "this domain applies to all 14 practice types."

CREATE TABLE IF NOT EXISTS kg_domain_practice_type_map (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_slug          TEXT NOT NULL,
  practice_type_slug   TEXT NOT NULL,
  relevance_weight     NUMERIC(4,3) NOT NULL DEFAULT 0.80
    CHECK (relevance_weight BETWEEN 0 AND 1),
  applies_to_all_types BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (domain_slug, practice_type_slug)
);

CREATE INDEX IF NOT EXISTS idx_domain_pt_map_domain
  ON kg_domain_practice_type_map(domain_slug);
CREATE INDEX IF NOT EXISTS idx_domain_pt_map_all
  ON kg_domain_practice_type_map(applies_to_all_types) WHERE applies_to_all_types = true;

ALTER TABLE kg_domain_practice_type_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "domain_pt_map_read" ON kg_domain_practice_type_map
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "domain_pt_map_admin" ON kg_domain_practice_type_map
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ── 2. Seed kg_domain_practice_type_map ──────────────────────────────────────

-- Cross-cutting domains (all practice types): use sentinel practice_type_slug
-- The scoring function fans these out to all 14 practice types at runtime.
INSERT INTO kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight, applies_to_all_types)
VALUES
  ('hipaa',           '_all_types', 0.85, true),
  ('osha',            '_all_types', 0.80, true),
  ('licensing_cred',  '_all_types', 0.85, true),
  ('fraud_abuse',     '_all_types', 0.75, true)
ON CONFLICT (domain_slug, practice_type_slug) DO NOTHING;

-- Controlled substances — prescribing practices
INSERT INTO kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
VALUES
  ('controlled_substances',  'endocrinology',          0.90),
  ('controlled_substances',  'hormone_therapy_clinic', 0.90),
  ('controlled_substances',  'functional_medicine',    0.85),
  ('controlled_substances',  'peptide_therapy',        0.85),
  ('controlled_substances',  'weight_management',      0.80),
  ('controlled_substances',  'telehealth_practice',    0.80),
  ('controlled_substances',  'family_medicine',        0.85),
  ('controlled_substances',  'internal_medicine',      0.85),
  ('controlled_substances',  'compounding_pharmacy',   0.80),
  ('cs_prescribing',         'endocrinology',          0.95),
  ('cs_prescribing',         'hormone_therapy_clinic', 0.95),
  ('cs_prescribing',         'functional_medicine',    0.90),
  ('cs_prescribing',         'telehealth_practice',    0.90),
  ('cs_prescribing',         'weight_management',      0.85),
  ('cs_prescribing',         'family_medicine',        0.90),
  ('cs_prescribing',         'internal_medicine',      0.90),
  ('cs_prescribing',         'compounding_pharmacy',   0.80),
  ('cs_rx_testosterone',     'hormone_therapy_clinic', 0.98),
  ('cs_rx_testosterone',     'endocrinology',          0.98),
  ('cs_rx_testosterone',     'functional_medicine',    0.90),
  ('cs_rx_testosterone',     'regenerative_medicine',  0.85),
  ('cs_rx_testosterone',     'weight_management',      0.82),
  ('cs_rx_stimulants',       'functional_medicine',    0.88),
  ('cs_rx_stimulants',       'family_medicine',        0.88),
  ('cs_rx_stimulants',       'internal_medicine',      0.85),
  ('cs_rx_buprenorphine',    'functional_medicine',    0.85),
  ('cs_rx_buprenorphine',    'internal_medicine',      0.88),
  ('cs_rx_telehealth',       'telehealth_practice',    0.98),
  ('cs_rx_telehealth',       'functional_medicine',    0.88),
  ('cs_rx_telehealth',       'hormone_therapy_clinic', 0.85),
  ('cs_pdmp',                'endocrinology',          0.92),
  ('cs_pdmp',                'hormone_therapy_clinic', 0.92),
  ('cs_pdmp',                'functional_medicine',    0.88),
  ('cs_pdmp',                'telehealth_practice',    0.88),
  ('cs_pdmp',                'family_medicine',        0.88),
  ('cs_pdmp',                'compounding_pharmacy',   0.80),
  ('cs_dea_registration',    'endocrinology',          0.90),
  ('cs_dea_registration',    'hormone_therapy_clinic', 0.90),
  ('cs_dea_registration',    'functional_medicine',    0.88),
  ('cs_dea_registration',    'compounding_pharmacy',   0.88),
  ('cs_dea_registration',    'telehealth_practice',    0.85)
ON CONFLICT (domain_slug, practice_type_slug) DO NOTHING;

-- FDA Compounding
INSERT INTO kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
VALUES
  ('fda_compounding',        'compounding_pharmacy',   0.98),
  ('fda_compounding',        'hormone_therapy_clinic', 0.90),
  ('fda_compounding',        'weight_management',      0.90),
  ('fda_compounding',        'peptide_therapy',        0.90),
  ('fda_compounding',        'iv_therapy',             0.85),
  ('fda_compounding',        'functional_medicine',    0.80),
  ('fda_compounding',        'regenerative_medicine',  0.82),
  ('comp_503a',              'compounding_pharmacy',   0.98),
  ('comp_503a',              'hormone_therapy_clinic', 0.85),
  ('comp_503a',              'functional_medicine',    0.80),
  ('comp_503b',              'compounding_pharmacy',   0.98),
  ('comp_usp_795',           'compounding_pharmacy',   0.98),
  ('comp_usp_797',           'compounding_pharmacy',   0.98),
  ('comp_usp_797',           'iv_therapy',             0.90),
  ('comp_usp_797',           'hormone_therapy_clinic', 0.85),
  ('comp_usp_800',           'compounding_pharmacy',   0.98),
  ('comp_usp_800',           'iv_therapy',             0.88),
  ('comp_bulk_drug',         'compounding_pharmacy',   0.98),
  ('comp_bulk_drug',         'hormone_therapy_clinic', 0.88),
  ('comp_glp1_shortage',     'weight_management',      0.98),
  ('comp_glp1_shortage',     'compounding_pharmacy',   0.95),
  ('comp_glp1_shortage',     'functional_medicine',    0.85),
  ('comp_quality_systems',   'compounding_pharmacy',   0.95)
ON CONFLICT (domain_slug, practice_type_slug) DO NOTHING;

-- FDA Peptides
INSERT INTO kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
VALUES
  ('fda_peptides',              'peptide_therapy',        0.98),
  ('fda_peptides',              'hormone_therapy_clinic', 0.88),
  ('fda_peptides',              'functional_medicine',    0.85),
  ('fda_peptides',              'regenerative_medicine',  0.88),
  ('fda_peptides',              'weight_management',      0.85),
  ('fda_peptides',              'iv_therapy',             0.80),
  ('peptide_regulatory_status', 'peptide_therapy',        0.98),
  ('peptide_bpc157',            'peptide_therapy',        0.98),
  ('peptide_bpc157',            'regenerative_medicine',  0.90),
  ('peptide_ghrh',              'peptide_therapy',        0.98),
  ('peptide_ghrh',              'hormone_therapy_clinic', 0.88),
  ('peptide_nad',               'iv_therapy',             0.95),
  ('peptide_nad',               'functional_medicine',    0.88),
  ('peptide_nad',               'peptide_therapy',        0.92),
  ('peptide_weight_loss',       'weight_management',      0.95),
  ('peptide_weight_loss',       'compounding_pharmacy',   0.88)
ON CONFLICT (domain_slug, practice_type_slug) DO NOTHING;

-- FDA general
INSERT INTO kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
VALUES
  ('fda',                     'compounding_pharmacy',   0.85),
  ('fda',                     'weight_management',      0.80),
  ('fda',                     'peptide_therapy',        0.85),
  ('fda_drug_approval',       'compounding_pharmacy',   0.88),
  ('fda_enforcement',         'compounding_pharmacy',   0.90),
  ('fda_enforcement',         'hormone_therapy_clinic', 0.82),
  ('fda_dietary_supplements', 'functional_medicine',    0.85),
  ('fda_dietary_supplements', 'regenerative_medicine',  0.80)
ON CONFLICT (domain_slug, practice_type_slug) DO NOTHING;

-- Medicare/Medicaid
INSERT INTO kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
VALUES
  ('medicare_medicaid', 'family_medicine',        0.90),
  ('medicare_medicaid', 'internal_medicine',      0.90),
  ('medicare_medicaid', 'functional_medicine',    0.75),
  ('medicare_medicaid', 'endocrinology',          0.85),
  ('cms_billing',       'family_medicine',        0.92),
  ('cms_billing',       'internal_medicine',      0.92),
  ('cms_billing',       'functional_medicine',    0.78),
  ('cms_billing',       'endocrinology',          0.88),
  ('cms_telehealth',    'telehealth_practice',    0.98),
  ('cms_telehealth',    'functional_medicine',    0.85),
  ('cms_telehealth',    'hormone_therapy_clinic', 0.80),
  ('cms_coverage',      'family_medicine',        0.90),
  ('cms_coverage',      'internal_medicine',      0.90),
  ('medicaid_fl',       'family_medicine',        0.88),
  ('medicaid_fl',       'internal_medicine',      0.88)
ON CONFLICT (domain_slug, practice_type_slug) DO NOTHING;

-- Licensing specializations
INSERT INTO kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
VALUES
  ('state_medical_license', 'endocrinology',          0.90),
  ('state_medical_license', 'functional_medicine',    0.90),
  ('state_medical_license', 'hormone_therapy_clinic', 0.88),
  ('state_medical_license', 'family_medicine',        0.90),
  ('state_medical_license', 'internal_medicine',      0.90),
  ('state_medical_license', 'telehealth_practice',    0.88),
  ('state_medical_license', 'med_spa',                0.85),
  ('pharmacy_license',      'compounding_pharmacy',   0.98),
  ('facility_license',      'med_spa',                0.95),
  ('facility_license',      'iv_therapy',             0.90),
  ('facility_license',      'hormone_therapy_clinic', 0.85),
  ('facility_license',      'compounding_pharmacy',   0.90),
  ('scope_of_practice',     'telehealth_practice',    0.92),
  ('scope_of_practice',     'functional_medicine',    0.88),
  ('scope_of_practice',     'hormone_therapy_clinic', 0.85),
  ('fl_medspa_regulation',  'med_spa',                0.98),
  ('fl_medspa_regulation',  'dermatology',            0.92),
  ('fl_hcc_license',        'med_spa',                0.95),
  ('fl_hcc_license',        'hormone_therapy_clinic', 0.90),
  ('fl_hcc_license',        'iv_therapy',             0.90),
  ('fl_telehealth_license', 'telehealth_practice',    0.98),
  ('fl_cs_cert',            'endocrinology',          0.90),
  ('fl_cs_cert',            'hormone_therapy_clinic', 0.90),
  ('fl_cs_cert',            'functional_medicine',    0.88)
ON CONFLICT (domain_slug, practice_type_slug) DO NOTHING;

-- OSHA specializations (injection/infusion-heavy practices have higher bloodborne exposure)
INSERT INTO kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
VALUES
  ('osha_bloodborne', 'iv_therapy',             0.95),
  ('osha_bloodborne', 'hormone_therapy_clinic', 0.90),
  ('osha_bloodborne', 'compounding_pharmacy',   0.90),
  ('osha_bloodborne', 'peptide_therapy',        0.88),
  ('osha_hazcom',     'compounding_pharmacy',   0.92),
  ('osha_hazcom',     'iv_therapy',             0.85)
ON CONFLICT (domain_slug, practice_type_slug) DO NOTHING;

-- Clinical Standards + Billing
INSERT INTO kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
VALUES
  ('standard_of_care', 'endocrinology',          0.88),
  ('standard_of_care', 'functional_medicine',    0.85),
  ('standard_of_care', 'hormone_therapy_clinic', 0.85),
  ('infection_control','iv_therapy',             0.92),
  ('infection_control','compounding_pharmacy',   0.90),
  ('lab_requirements', 'functional_medicine',    0.88),
  ('lab_requirements', 'endocrinology',          0.88),
  ('billing_coding',   'family_medicine',        0.88),
  ('billing_coding',   'internal_medicine',      0.88),
  ('billing_coding',   'endocrinology',          0.82),
  ('cash_pay_practices','functional_medicine',   0.92),
  ('cash_pay_practices','hormone_therapy_clinic',0.88),
  ('cash_pay_practices','iv_therapy',            0.85),
  ('cash_pay_practices','med_spa',               0.88),
  ('cash_pay_practices','weight_management',     0.85)
ON CONFLICT (domain_slug, practice_type_slug) DO NOTHING;

-- ── 3. mv_practice_relevance_summary ─────────────────────────────────────────
-- Pre-computed per-practice-type regulation counts and relevance distributions.
-- Refreshed after corpus-practice-score completes.
-- Filters at relevance_score >= 0.70 to exclude noise.

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_practice_relevance_summary AS
SELECT
  pt.id               AS practice_type_id,
  pt.slug             AS practice_type_slug,
  pt.display_name,
  pt.is_cedar_target,
  COUNT(DISTINCT epr.entity_id)                                                AS total_regulations,
  COUNT(DISTINCT CASE WHEN epr.relevance_score >= 0.90 THEN epr.entity_id END) AS high_relevance_count,
  COUNT(DISTINCT CASE WHEN epr.relevance_score >= 0.70
                       AND epr.relevance_score <  0.90 THEN epr.entity_id END) AS medium_relevance_count,
  ROUND(AVG(epr.relevance_score)::NUMERIC, 3)                                  AS avg_relevance_score
FROM kg_practice_types pt
LEFT JOIN kg_entity_practice_relevance epr
  ON epr.practice_type_id = pt.id
  AND epr.relevance_score >= 0.70
GROUP BY pt.id, pt.slug, pt.display_name, pt.is_cedar_target;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_practice_relevance_summary
  ON mv_practice_relevance_summary(practice_type_id);

CREATE OR REPLACE FUNCTION refresh_practice_relevance_summary()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_practice_relevance_summary;
END;
$$;
```

**Apply via Supabase Management API or downloaded supabase CLI binary (same method as migrations 025-026).**

**Acceptance:** `SELECT COUNT(*) FROM kg_domain_practice_type_map` ≥ 60. `SELECT COUNT(*) FROM mv_practice_relevance_summary` = 14.

---

### Task 2: `corpus-authority-classify` Inngest Function

**File:** `inngest/corpus-authority-classify.ts`
**Action:** CREATE
**Pattern:** Follow `corpus-classify.ts` structure; two passes within one function

```typescript
// Populates authority_level + issuing_agency on kg_entities.
// Pass 1: Deterministic rule-based (source name, document_type, entity_type).
// Pass 2: Claude API ML fallback for entities rule-pass could not classify (returns null).
// Event: 'cedar/corpus.authority-classify'
// Re-runnable: UPSERT overwrites previous rule/ml values; manual entries preserved.
// Claude batch size: 15 entities per API call.

import Anthropic from '@anthropic-ai/sdk'
import { inngest } from './client'
import { createServerClient } from '../lib/db/client'
import { trackCost, calculateClaudeCost } from '../lib/cost-tracker'

const MODEL = 'claude-sonnet-4-5-20250929'
const RULE_BATCH_SIZE = 1000
const ML_BATCH_SIZE   = 15

type AuthorityLevel =
  | 'federal_statute' | 'federal_regulation' | 'sub_regulatory_guidance'
  | 'national_coverage_determination' | 'local_coverage_determination'
  | 'state_statute' | 'state_board_rule' | 'professional_standard'

const VALID_AUTHORITY_LEVELS: AuthorityLevel[] = [
  'federal_statute', 'federal_regulation', 'sub_regulatory_guidance',
  'national_coverage_determination', 'local_coverage_determination',
  'state_statute', 'state_board_rule', 'professional_standard',
]

interface EntityForAuth {
  id: string
  document_type: string | null
  entity_type: string
  name: string
  source_name: string | null
  metadata: Record<string, unknown> | null
}

// ── Rule-based classifier ───────────────────────────────────────────────────
function classifyAuthorityByRule(e: EntityForAuth): { level: AuthorityLevel; agency: string } | null {
  const src       = (e.source_name ?? '').toLowerCase()
  const docType   = (e.document_type ?? '').toUpperCase()
  const entType   = (e.entity_type ?? '').toLowerCase()
  const name      = (e.name ?? '').toLowerCase()

  // Entity-type overrides
  if (entType === 'enforcement_action' || docType === 'WARNING_LETTER' || docType === 'RECALL') {
    return { level: 'sub_regulatory_guidance', agency: 'FDA' }
  }

  // FL State Boards → state_board_rule
  if (src.includes('fl board') || src.includes('board of medicine') ||
      src.includes('board of pharmacy') || src.includes('board of osteopathic') ||
      src.includes('mqa') || src.includes('fl administrative register') ||
      src.includes('florida administrative')) {
    return { level: 'state_board_rule', agency: 'FL-BOARD' }
  }

  // FDA Compounding Guidance → sub_regulatory_guidance
  if (src.includes('fda compounding guidance') || src.includes('compounding guidance')) {
    return { level: 'sub_regulatory_guidance', agency: 'FDA' }
  }

  // openFDA Drug Enforcement → sub_regulatory_guidance
  if (src.includes('openfda') || (src.includes('drug enforcement') && src.includes('open'))) {
    return { level: 'sub_regulatory_guidance', agency: 'FDA' }
  }

  // eCFR → federal_regulation
  if (src.includes('ecfr') || src.includes('electronic code of federal')) {
    return { level: 'federal_regulation', agency: detectFederalAgency(src, name) }
  }

  // DEA Diversion Control → federal_regulation
  if (src.includes('dea diversion') || src.includes('diversion control')) {
    return { level: 'federal_regulation', agency: 'DEA' }
  }

  // Federal Register — doc type determines level
  if (src.includes('federal register') || src.includes('fda federal')) {
    if (docType === 'RULE' || docType === 'PROPOSED_RULE' || docType === 'FINAL_RULE') {
      return { level: 'federal_regulation', agency: detectFederalAgency(src, name) }
    }
    if (docType === 'NOTICE') {
      return { level: 'sub_regulatory_guidance', agency: detectFederalAgency(src, name) }
    }
    // FR with unknown type — default federal_regulation
    return { level: 'federal_regulation', agency: detectFederalAgency(src, name) }
  }

  // Name-based fallbacks
  if (name.includes(' guidance') || name.includes('advisory') || name.includes('transmittal')) {
    return { level: 'sub_regulatory_guidance', agency: detectFederalAgency(src, name) }
  }
  if (/\d+ cfr /i.test(e.name ?? '')) {
    return { level: 'federal_regulation', agency: detectFederalAgency(src, name) }
  }

  return null
}

function detectFederalAgency(src: string, name: string): string {
  if (src.includes('dea') || name.includes('dea'))        return 'DEA'
  if (src.includes('fda') || name.includes('fda') || name.includes('21 cfr'))    return 'FDA'
  if (src.includes('cms') || name.includes('42 cfr') || name.includes('medicare')) return 'CMS'
  if (src.includes('hhs') || name.includes('45 cfr') || name.includes('hipaa'))   return 'HHS'
  if (src.includes('osha') || name.includes('29 cfr'))    return 'OSHA'
  return 'FEDERAL'
}

// ── Claude ML classifier ────────────────────────────────────────────────────
interface MLAuthResult {
  entity_id: string
  authority_level: AuthorityLevel | null
  issuing_agency: string
  confidence: number
}

async function classifyAuthorityWithClaude(
  entities: EntityForAuth[],
  logger: { warn: (m: string) => void; info: (m: string) => void }
): Promise<MLAuthResult[]> {
  const client = new Anthropic()

  const entityList = entities.map((e, i) => ({
    index: i,
    id: e.id,
    name: e.name,
    description: (e.metadata as { description?: string } | null)?.description ?? null,
    document_type: e.document_type,
    entity_type: e.entity_type,
    source_name: e.source_name,
  }))

  const prompt = `You are classifying healthcare regulatory entities for Cedar, a regulatory intelligence platform for independent medical practices.

For each entity below, determine its authority_level and issuing_agency.

authority_level must be exactly one of:
- federal_statute (a US statute enacted by Congress)
- federal_regulation (a CFR regulation or published Federal Register rule)
- sub_regulatory_guidance (FDA guidance, CMS transmittal, advisory, notice, enforcement action)
- national_coverage_determination (CMS national coverage decision)
- local_coverage_determination (MAC local coverage decision)
- state_statute (a state law enacted by a state legislature)
- state_board_rule (a state board administrative rule, board order, or board guidance)
- professional_standard (accreditation standard, USP chapter, clinical guideline)

issuing_agency: short code like 'FDA', 'DEA', 'CMS', 'HHS', 'OSHA', 'FL-BOARD', 'USP', 'FEDERAL', etc.

Respond ONLY with a JSON array. No prose, no markdown. Example:
[{"index":0,"authority_level":"federal_regulation","issuing_agency":"FDA","confidence":0.92}]

Entities:
${JSON.stringify(entityList, null, 2)}`

  let response
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })
  } catch (err) {
    logger.warn(`[authority-classify] Claude API error: ${(err as Error).message}`)
    return []
  }

  // Track cost
  const tokensIn  = response.usage.input_tokens
  const tokensOut = response.usage.output_tokens
  await trackCost({
    service: 'claude',
    operation: 'corpus_authority_classify',
    cost_usd: calculateClaudeCost(tokensIn, tokensOut),
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    context: { entity_count: entities.length },
  })

  const raw = response.content[0]?.type === 'text' ? response.content[0].text : ''
  let parsed: Array<{ index: number; authority_level: string; issuing_agency: string; confidence: number }> = []
  try {
    parsed = JSON.parse(raw.trim())
  } catch {
    logger.warn(`[authority-classify] Claude JSON parse failed. Raw: ${raw.slice(0, 200)}`)
    return []
  }

  return parsed.map(r => {
    const entity = entities[r.index]
    if (!entity) return null
    const level = VALID_AUTHORITY_LEVELS.includes(r.authority_level as AuthorityLevel)
      ? r.authority_level as AuthorityLevel
      : null
    return { entity_id: entity.id, authority_level: level, issuing_agency: r.issuing_agency ?? 'UNKNOWN', confidence: r.confidence ?? 0.7 }
  }).filter(Boolean) as MLAuthResult[]
}

// ── Main function ───────────────────────────────────────────────────────────
export const corpusAuthorityClassify = inngest.createFunction(
  {
    id: 'corpus-authority-classify',
    name: 'Corpus Authority Classify — Populate authority_level on kg_entities',
    retries: 1,
    concurrency: { limit: 1 },
    timeouts: { finish: '2h' },
  },
  { event: 'cedar/corpus.authority-classify' },
  async ({ step, logger, runId }) => {

    // Step 1: Load source ID → name map
    const sourceMap = await step.run('load-source-map', async () => {
      const supabase = createServerClient()
      const { data, error } = await supabase.from('sources').select('id, name')
      if (error) throw new Error(`Source map load failed: ${error.message}`)
      const map: Record<string, string> = {}
      for (const s of data ?? []) map[s.id] = s.name
      return map
    })

    // Step 2: Count total entities
    const totalCount = await step.run('count-entities', async () => {
      const supabase = createServerClient()
      const { count, error } = await supabase.from('kg_entities').select('id', { count: 'exact', head: true })
      if (error) throw new Error(`Count failed: ${error.message}`)
      logger.info(`[authority-classify] ${count} total entities`)
      return count ?? 0
    })

    // ── PASS 1: Rule-based classification ──────────────────────────────────
    const totalBatches = Math.ceil(totalCount / RULE_BATCH_SIZE)
    const unclassifiedIds: string[] = []
    let ruleClassified = 0

    for (let i = 0; i < totalBatches; i++) {
      const batchResult = await step.run(`rule-pass-batch-${i}`, async () => {
        const supabase = createServerClient()

        const { data: entities, error } = await supabase
          .from('kg_entities')
          .select('id, document_type, entity_type, name, metadata, source_id')
          .range(i * RULE_BATCH_SIZE, i * RULE_BATCH_SIZE + RULE_BATCH_SIZE - 1)
        if (error) throw new Error(`Batch ${i} fetch failed: ${error.message}`)
        if (!entities?.length) return { classified: 0, unclassified: [] as string[] }

        // Fetch existing manual entries to protect them
        const entityIds = entities.map(e => e.id)
        const { data: manualEntries } = await supabase
          .from('kg_classification_log')
          .select('entity_id')
          .in('entity_id', entityIds)
          .eq('stage', 'manual')
        const manualIds = new Set((manualEntries ?? []).map(r => r.entity_id))

        const updates: Array<{ id: string; authority_level: string; issuing_agency: string }> = []
        const logRows: Array<{
          entity_id: string; stage: string; confidence: number
          classified_by: string; needs_review: boolean; run_id: string
        }> = []
        const missed: string[] = []

        for (const entity of entities) {
          if (manualIds.has(entity.id)) continue  // preserve manual entries

          const mapped: EntityForAuth = {
            id: entity.id,
            document_type: entity.document_type,
            entity_type: entity.entity_type,
            name: entity.name,
            source_name: sourceMap[entity.source_id ?? ''] ?? null,
            metadata: entity.metadata as Record<string, unknown> | null,
          }
          const result = classifyAuthorityByRule(mapped)

          if (result) {
            updates.push({ id: entity.id, authority_level: result.level, issuing_agency: result.agency })
            logRows.push({
              entity_id: entity.id, stage: 'rule', confidence: 0.95,
              classified_by: 'rule:source-doctype', needs_review: false,
              run_id: runId ?? 'unknown',
            })
          } else {
            missed.push(entity.id)
          }
        }

        if (updates.length > 0) {
          const { error: upsertErr } = await supabase
            .from('kg_entities')
            .upsert(updates.map(u => ({ id: u.id, authority_level: u.authority_level, issuing_agency: u.issuing_agency })),
              { onConflict: 'id' })
          if (upsertErr) logger.warn(`[authority-classify] Rule batch ${i} upsert warn: ${upsertErr.message}`)
        }
        if (logRows.length > 0) {
          const { error: logErr } = await supabase.from('kg_classification_log').insert(logRows)
          if (logErr) logger.warn(`[authority-classify] Rule batch ${i} log warn: ${logErr.message}`)
        }

        return { classified: updates.length, unclassified: missed }
      })

      ruleClassified += batchResult.classified
      unclassifiedIds.push(...batchResult.unclassified)
      logger.info(`[authority-classify] Rule batch ${i + 1}/${totalBatches} — ${batchResult.classified} classified, ${batchResult.unclassified.length} to ML`)
    }

    logger.info(`[authority-classify] Rule pass done — ${ruleClassified} classified, ${unclassifiedIds.length} going to ML pass`)

    // ── PASS 2: ML fallback for unclassified entities ──────────────────────
    if (unclassifiedIds.length === 0) {
      logger.info('[authority-classify] No entities need ML pass')
      return { ruleClassified, mlClassified: 0 }
    }

    // Fetch full entity data for unclassified IDs
    const mlEntityData: EntityForAuth[] = []
    const ML_FETCH_BATCH = 500

    for (let j = 0; j < unclassifiedIds.length; j += ML_FETCH_BATCH) {
      const fetchResult = await step.run(`ml-fetch-${j}`, async () => {
        const supabase = createServerClient()
        const ids = unclassifiedIds.slice(j, j + ML_FETCH_BATCH)
        const { data, error } = await supabase
          .from('kg_entities')
          .select('id, document_type, entity_type, name, metadata, source_id')
          .in('id', ids)
        if (error) throw new Error(`ML entity fetch failed: ${error.message}`)
        return (data ?? []).map(e => ({
          id: e.id,
          document_type: e.document_type,
          entity_type: e.entity_type,
          name: e.name,
          source_name: sourceMap[e.source_id ?? ''] ?? null,
          metadata: e.metadata as Record<string, unknown> | null,
        }))
      })
      mlEntityData.push(...fetchResult)
    }

    let mlClassified = 0
    const mlTotalBatches = Math.ceil(mlEntityData.length / ML_BATCH_SIZE)

    for (let k = 0; k < mlTotalBatches; k++) {
      const mlStats = await step.run(`ml-classify-batch-${k}`, async () => {
        const supabase = createServerClient()
        const batch = mlEntityData.slice(k * ML_BATCH_SIZE, k * ML_BATCH_SIZE + ML_BATCH_SIZE)

        const results = await classifyAuthorityWithClaude(batch, logger)
        if (!results.length) return 0

        const updates = results
          .filter(r => r.authority_level !== null)
          .map(r => ({ id: r.entity_id, authority_level: r.authority_level as string, issuing_agency: r.issuing_agency }))

        if (updates.length > 0) {
          const { error: upsertErr } = await supabase
            .from('kg_entities')
            .upsert(updates, { onConflict: 'id' })
          if (upsertErr) logger.warn(`[authority-classify] ML batch ${k} upsert warn: ${upsertErr.message}`)
        }

        // Log ML classifications
        const logRows = results.map(r => ({
          entity_id: r.entity_id,
          stage: 'ml',
          confidence: r.confidence,
          classified_by: 'claude-sonnet-4-5-20250929',
          needs_review: r.confidence < 0.70,
          review_reason: r.confidence < 0.70 ? `ML confidence ${r.confidence} below 0.70 threshold` : null,
          run_id: runId ?? 'unknown',
        }))
        const { error: logErr } = await supabase.from('kg_classification_log').insert(logRows)
        if (logErr) logger.warn(`[authority-classify] ML batch ${k} log warn: ${logErr.message}`)

        return updates.length
      })

      mlClassified += mlStats
      logger.info(`[authority-classify] ML batch ${k + 1}/${mlTotalBatches} — ${mlStats} classified`)
    }

    logger.info(`[authority-classify] Done — rule: ${ruleClassified}, ML: ${mlClassified}`)
    return { ruleClassified, mlClassified }
  }
)
```

---

### Task 3: `corpus-practice-score` Inngest Function

**File:** `inngest/corpus-practice-score.ts`
**Action:** CREATE
**Pattern:** Rule pass over all entities with domain assignments; ML pass for entities with no domain assignments or no practice type coverage

```typescript
// Populates kg_entity_practice_relevance.
// Pass 1 (rule): entities with kg_entity_domains entries → domain-practice-type map lookup.
// Pass 2 (ML):   entities with NO domain assignments → Claude determines practice type relevance.
// Also: entities where rule pass produced 0 practice rows → ML fallback.
// Event: 'cedar/corpus.practice-score'
// Re-runnable: UPSERT preserves manual entries; overwrites rule/ml.

import Anthropic from '@anthropic-ai/sdk'
import { inngest } from './client'
import { createServerClient } from '../lib/db/client'
import { trackCost, calculateClaudeCost } from '../lib/cost-tracker'

const MODEL         = 'claude-sonnet-4-5-20250929'
const RULE_BATCH    = 200   // entities per rule-pass batch (join with entity_domains is expensive)
const ML_BATCH_SIZE = 15    // entities per Claude API call

// Practice type slugs from migration 024 (all 14)
const ALL_PRACTICE_SLUGS = [
  'endocrinology', 'functional_medicine', 'hormone_therapy_clinic', 'med_spa',
  'regenerative_medicine', 'weight_management', 'telehealth_practice', 'iv_therapy',
  'peptide_therapy', 'compounding_pharmacy', 'dermatology', 'family_medicine',
  'internal_medicine', 'chiropractor',
]

// ── ML classifier ───────────────────────────────────────────────────────────
interface MLPracticeResult {
  entity_id: string
  scores: Array<{ practice_type_slug: string; relevance_score: number }>
}

async function scorePracticeWithClaude(
  entities: Array<{ id: string; name: string; description: string | null; document_type: string | null; source_name: string | null; cfr_refs: string | null; assigned_domains: string[] }>,
  logger: { warn: (m: string) => void }
): Promise<MLPracticeResult[]> {
  const client = new Anthropic()

  const prompt = `You are scoring healthcare regulatory entities for relevance to independent medical practice types.

Context: Cedar is a compliance intelligence platform for independent medical practices (functional medicine, hormone therapy, compounding pharmacy, med spa, weight management, IV therapy, etc.) in Florida.

Practice types (use exactly these slugs):
${ALL_PRACTICE_SLUGS.join(', ')}

Each entity includes its already-classified regulatory domains (assigned_domains) as context.
Use these domain classifications to inform your relevance scoring.

For each entity, return only practice types with relevance_score >= 0.60.
Scoring guide:
- 0.90-1.00: This regulation directly governs this practice type's core workflow
- 0.75-0.89: This regulation has significant compliance implications for this practice type
- 0.60-0.74: Some relevance but not central to this practice type

Note: scores below 0.70 will be flagged for human review — only include if genuinely relevant.

Respond ONLY with a JSON array. No prose, no markdown:
[{"index":0,"scores":[{"practice_type_slug":"hormone_therapy_clinic","relevance_score":0.95},...]}]

Entities:
${JSON.stringify(entities.map((e, i) => ({
  index: i, id: e.id, name: e.name,
  description: e.description?.slice(0, 300) ?? null,
  document_type: e.document_type, source_name: e.source_name, cfr_refs: e.cfr_refs,
  assigned_domains: e.assigned_domains,
})), null, 2)}`

  let response
  try {
    response = await client.messages.create({
      model: MODEL, max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })
  } catch (err) {
    logger.warn(`[practice-score] Claude API error: ${(err as Error).message}`)
    return []
  }

  await trackCost({
    service: 'claude',
    operation: 'corpus_practice_score',
    cost_usd: calculateClaudeCost(response.usage.input_tokens, response.usage.output_tokens),
    tokens_in: response.usage.input_tokens,
    tokens_out: response.usage.output_tokens,
    context: { entity_count: entities.length },
  })

  const raw = response.content[0]?.type === 'text' ? response.content[0].text : ''
  let parsed: Array<{ index: number; scores: Array<{ practice_type_slug: string; relevance_score: number }> }> = []
  try {
    parsed = JSON.parse(raw.trim())
  } catch {
    logger.warn(`[practice-score] Claude JSON parse failed. Raw: ${raw.slice(0, 200)}`)
    return []
  }

  return parsed.map(r => ({
    entity_id: entities[r.index]?.id ?? '',
    scores: (r.scores ?? []).filter(s => ALL_PRACTICE_SLUGS.includes(s.practice_type_slug) && s.relevance_score >= 0.60),
  })).filter(r => r.entity_id && r.scores.length > 0)
}

export const corpusPracticeScore = inngest.createFunction(
  {
    id: 'corpus-practice-score',
    name: 'Corpus Practice Score — Populate kg_entity_practice_relevance',
    retries: 1,
    concurrency: { limit: 1 },
    timeouts: { finish: '4h' },
  },
  { event: 'cedar/corpus.practice-score' },
  async ({ step, logger, runId }) => {

    // Step 1: Load lookup maps
    const { domainMap, practiceMap, sourceMap } = await step.run('load-maps', async () => {
      const supabase = createServerClient()
      const [{ data: domains }, { data: practices }, { data: sources }] = await Promise.all([
        supabase.from('kg_domains').select('id, slug'),
        supabase.from('kg_practice_types').select('id, slug'),
        supabase.from('sources').select('id, name'),
      ])
      const domainMap: Record<string, string> = {}
      const practiceMap: Record<string, string> = {}
      const sourceMap: Record<string, string> = {}
      for (const d of domains ?? []) domainMap[d.slug] = d.id
      for (const p of practices ?? []) practiceMap[p.slug] = p.id
      for (const s of sources ?? []) sourceMap[s.id] = s.name
      return { domainMap, practiceMap, sourceMap }
    })

    const allPracticeTypeIds = Object.values(practiceMap)

    // Step 2: Load domain-practice-type mapping from DB
    const rawMappings = await step.run('load-domain-practice-map', async () => {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('kg_domain_practice_type_map')
        .select('domain_slug, practice_type_slug, relevance_weight, applies_to_all_types')
      if (error) throw new Error(`Domain-practice map failed: ${error.message}`)
      return data ?? []
    })

    // Build domainId → [{practiceTypeId, weight}] lookup (fan out all_types entries)
    const domainIdToPractices: Record<string, Array<{ practiceTypeId: string; weight: number }>> = {}
    for (const row of rawMappings) {
      const domainId = domainMap[row.domain_slug]
      if (!domainId) continue
      if (!domainIdToPractices[domainId]) domainIdToPractices[domainId] = []

      if (row.applies_to_all_types) {
        for (const ptId of allPracticeTypeIds) {
          domainIdToPractices[domainId].push({ practiceTypeId: ptId, weight: row.relevance_weight })
        }
      } else {
        const ptId = practiceMap[row.practice_type_slug]
        if (ptId) domainIdToPractices[domainId].push({ practiceTypeId: ptId, weight: row.relevance_weight })
      }
    }

    // Step 3: Check corpus-classify ran (warn if empty)
    const classifiedCount = await step.run('check-entity-domains', async () => {
      const supabase = createServerClient()
      const { count } = await supabase.from('kg_entity_domains').select('entity_id', { count: 'exact', head: true })
      return count ?? 0
    })
    if (classifiedCount === 0) {
      logger.warn('[practice-score] kg_entity_domains is empty — run corpus-classify first. Proceeding with ML-only pass.')
    }

    // Step 4: Count total entities for batching
    const entityCount = await step.run('count-entities', async () => {
      const supabase = createServerClient()
      const { count } = await supabase.from('kg_entities').select('id', { count: 'exact', head: true })
      return count ?? 0
    })

    // ── PASS 1: Rule-based scoring ──────────────────────────────────────────
    const totalBatches = Math.ceil(entityCount / RULE_BATCH)
    let ruleScored = 0
    let ruleRelevanceRows = 0
    const noScoreIds: string[] = []  // entities that got 0 practice type assignments from rules

    for (let i = 0; i < totalBatches; i++) {
      const stats = await step.run(`rule-score-batch-${i}`, async () => {
        const supabase = createServerClient()

        const { data: entityBatch, error: entityErr } = await supabase
          .from('kg_entities')
          .select('id, source_id')
          .range(i * RULE_BATCH, i * RULE_BATCH + RULE_BATCH - 1)
        if (entityErr) throw new Error(`Entity batch ${i}: ${entityErr.message}`)
        if (!entityBatch?.length) return { scored: 0, rows: 0, missed: [] as string[] }

        const entityIds = entityBatch.map(e => e.id)

        // Protect manual entries
        const { data: manualEntries } = await supabase
          .from('kg_entity_practice_relevance')
          .select('entity_id')
          .in('entity_id', entityIds)
          .eq('classified_by', 'manual')
        const manualIds = new Set((manualEntries ?? []).map(r => r.entity_id))

        // Fetch domain assignments
        const { data: domainAssignments, error: domErr } = await supabase
          .from('kg_entity_domains')
          .select('entity_id, domain_id, relevance_score')
          .in('entity_id', entityIds)
        if (domErr) throw new Error(`Domain fetch batch ${i}: ${domErr.message}`)

        // Group by entity
        const entityDomains: Record<string, Array<{ domainId: string; score: number }>> = {}
        for (const da of domainAssignments ?? []) {
          if (!entityDomains[da.entity_id]) entityDomains[da.entity_id] = []
          entityDomains[da.entity_id].push({ domainId: da.domain_id, score: da.relevance_score ?? 0.8 })
        }

        const relevanceRows: Array<{
          entity_id: string; practice_type_id: string; relevance_score: number
          classified_by: string; classified_at: string
        }> = []
        const missed: string[] = []

        for (const { id: entityId } of entityBatch) {
          if (manualIds.has(entityId)) continue
          const domains = entityDomains[entityId] ?? []
          if (!domains.length) { missed.push(entityId); continue }

          const practiceScores: Record<string, number> = {}
          for (const { domainId, score: entityDomainScore } of domains) {
            for (const { practiceTypeId, weight } of (domainIdToPractices[domainId] ?? [])) {
              const combined = Math.round(weight * entityDomainScore * 1000) / 1000
              if (!practiceScores[practiceTypeId] || combined > practiceScores[practiceTypeId]) {
                practiceScores[practiceTypeId] = combined
              }
            }
          }

          if (Object.keys(practiceScores).length === 0) { missed.push(entityId); continue }

          for (const [ptId, score] of Object.entries(practiceScores)) {
            if (score < 0.50) continue
            relevanceRows.push({
              entity_id: entityId, practice_type_id: ptId,
              relevance_score: score, classified_by: 'rule:domain-practice-map',
              classified_at: new Date().toISOString(),
            })
          }

          if (!Object.keys(practiceScores).some(k => practiceScores[k] >= 0.50)) {
            missed.push(entityId)
          }
        }

        if (relevanceRows.length > 0) {
          const { error: upsertErr } = await supabase
            .from('kg_entity_practice_relevance')
            .upsert(relevanceRows, { onConflict: 'entity_id,practice_type_id' })
          if (upsertErr) logger.warn(`[practice-score] Rule batch ${i} upsert warn: ${upsertErr.message}`)
        }

        return { scored: entityBatch.length, rows: relevanceRows.length, missed }
      })

      ruleScored += stats.scored
      ruleRelevanceRows += stats.rows
      noScoreIds.push(...stats.missed)
      logger.info(`[practice-score] Rule batch ${i + 1}/${totalBatches} — ${stats.rows} rows, ${stats.missed.length} to ML`)
    }

    logger.info(`[practice-score] Rule pass done — ${ruleRelevanceRows} rows written, ${noScoreIds.length} entities to ML`)

    // ── PASS 2: ML for unscored entities ────────────────────────────────────
    let mlRelevanceRows = 0

    if (noScoreIds.length > 0) {
      // Build domain ID → slug map for including domain context in Claude prompt
      const domainIdToSlugForML: Record<string, string> = {}
      for (const [slug, id] of Object.entries(domainMap)) domainIdToSlugForML[id] = slug

      // Fetch full entity data + existing domain classifications (context for Claude)
      const ML_FETCH_CHUNK = 500
      const mlEntities: Array<{ id: string; name: string; description: string | null; document_type: string | null; source_name: string | null; cfr_refs: string | null; assigned_domains: string[] }> = []

      for (let j = 0; j < noScoreIds.length; j += ML_FETCH_CHUNK) {
        const fetched = await step.run(`ml-fetch-entities-${j}`, async () => {
          const supabase = createServerClient()
          const ids = noScoreIds.slice(j, j + ML_FETCH_CHUNK)

          // Fetch entity details and their existing domain assignments in parallel
          const [{ data: entities }, { data: domainAssignments }] = await Promise.all([
            supabase.from('kg_entities')
              .select('id, name, description, document_type, source_id, cfr_references')
              .in('id', ids),
            supabase.from('kg_entity_domains')
              .select('entity_id, domain_id')
              .in('entity_id', ids),
          ])

          const entityDomainIds: Record<string, string[]> = {}
          for (const da of domainAssignments ?? []) {
            if (!entityDomainIds[da.entity_id]) entityDomainIds[da.entity_id] = []
            entityDomainIds[da.entity_id].push(da.domain_id)
          }

          return (entities ?? []).map(e => ({
            id: e.id,
            name: e.name,
            description: e.description,
            document_type: e.document_type,
            source_name: sourceMap[e.source_id ?? ''] ?? null,
            cfr_refs: e.cfr_references ? JSON.stringify(e.cfr_references).slice(0, 100) : null,
            // Domain slugs already assigned — pass as context to Claude for better scoring
            assigned_domains: (entityDomainIds[e.id] ?? [])
              .map(id => domainIdToSlugForML[id])
              .filter(Boolean),
          }))
        })
        mlEntities.push(...fetched)
      }

      const mlTotalBatches = Math.ceil(mlEntities.length / ML_BATCH_SIZE)

      for (let k = 0; k < mlTotalBatches; k++) {
        const mlStats = await step.run(`ml-score-batch-${k}`, async () => {
          const supabase = createServerClient()
          const batch = mlEntities.slice(k * ML_BATCH_SIZE, k * ML_BATCH_SIZE + ML_BATCH_SIZE)

          const results = await scorePracticeWithClaude(batch, logger)
          if (!results.length) return 0

          const relevanceRows: Array<{
            entity_id: string; practice_type_id: string; relevance_score: number
            classified_by: string; classified_at: string
          }> = []
          const logRows: Array<{
            entity_id: string; stage: string; confidence: number
            classified_by: string; needs_review: boolean; review_reason: string | null; run_id: string
          }> = []

          for (const r of results) {
            for (const { practice_type_slug, relevance_score } of r.scores) {
              const ptId = practiceMap[practice_type_slug]
              if (!ptId) continue
              relevanceRows.push({
                entity_id: r.entity_id, practice_type_id: ptId,
                relevance_score, classified_by: 'claude-sonnet-4-5-20250929',
                classified_at: new Date().toISOString(),
              })
            }
            // needs_review=true if any score is below 0.70 (not authoritative — flag for human review)
            const minScore = Math.min(...r.scores.map(s => s.relevance_score))
            logRows.push({
              entity_id: r.entity_id, stage: 'ml', confidence: minScore,
              classified_by: 'claude-sonnet-4-5-20250929',
              needs_review: minScore < 0.70,
              review_reason: minScore < 0.70 ? `ML score ${minScore} below 0.70 threshold` : null,
              run_id: runId ?? 'unknown',
            })
          }

          if (relevanceRows.length > 0) {
            const { error: upsertErr } = await supabase
              .from('kg_entity_practice_relevance')
              .upsert(relevanceRows, { onConflict: 'entity_id,practice_type_id' })
            if (upsertErr) logger.warn(`[practice-score] ML batch ${k} upsert warn: ${upsertErr.message}`)
          }
          if (logRows.length > 0) {
            await supabase.from('kg_classification_log').insert(logRows)
          }

          return relevanceRows.length
        })

        mlRelevanceRows += mlStats
        logger.info(`[practice-score] ML batch ${k + 1}/${mlTotalBatches} — ${mlStats} rows`)
      }
    }

    // Step N: Refresh materialized views
    await step.run('refresh-views', async () => {
      const supabase = createServerClient()
      const [r1, r2] = await Promise.all([
        supabase.rpc('refresh_corpus_facets'),
        supabase.rpc('refresh_practice_relevance_summary'),
      ])
      if (r1.error) logger.warn(`[practice-score] Facets refresh: ${r1.error.message}`)
      if (r2.error) logger.warn(`[practice-score] Summary refresh: ${r2.error.message}`)
    })

    logger.info(`[practice-score] Done — rule: ${ruleRelevanceRows} rows, ML: ${mlRelevanceRows} rows`)
    return { ruleRelevanceRows, mlRelevanceRows }
  }
)
```

---

### Task 4: `corpus-service-line-map` Inngest Function

**File:** `inngest/corpus-service-line-map.ts`
**Action:** CREATE
**Pattern:** Rule pass per service line using `regulation_domains`; ML pass for high-relevance entities not yet linked to any service line

```typescript
// Populates kg_service_line_regulations.
// Pass 1 (rule): per service line, finds entities in its regulation_domains via kg_entity_domains.
// Pass 2 (ML):   entities with high practice type relevance (>= 0.80) but no service line
//                mapping → Claude determines which service lines apply and with what role.
// Event: 'cedar/corpus.service-line-map'
// Re-runnable: UPSERT preserves manual entries.

import Anthropic from '@anthropic-ai/sdk'
import { inngest } from './client'
import { createServerClient } from '../lib/db/client'
import { trackCost, calculateClaudeCost } from '../lib/cost-tracker'

const MODEL         = 'claude-sonnet-4-5-20250929'
const ML_BATCH_SIZE = 15

// Domain slug prefix → regulation_role (most specific first)
const DOMAIN_ROLE_RULES: Array<{ prefix: string; role: string }> = [
  { prefix: 'cs_rx_',            role: 'prescribing' },
  { prefix: 'cs_prescribing',    role: 'prescribing' },
  { prefix: 'cs_pdmp',           role: 'prescribing' },
  { prefix: 'cs_dea',            role: 'prescribing' },
  { prefix: 'cs_scheduling',     role: 'prescribing' },
  { prefix: 'controlled_sub',    role: 'prescribing' },
  { prefix: 'comp_',             role: 'dispensing' },
  { prefix: 'fda_compounding',   role: 'dispensing' },
  { prefix: 'pharmacy_license',  role: 'dispensing' },
  { prefix: 'cms_billing',       role: 'billing' },
  { prefix: 'billing_coding',    role: 'billing' },
  { prefix: 'cpt_',              role: 'billing' },
  { prefix: 'icd10_',            role: 'billing' },
  { prefix: 'fee_',              role: 'billing' },
  { prefix: 'prior_auth',        role: 'billing' },
  { prefix: 'cash_pay',          role: 'billing' },
  { prefix: 'osha',              role: 'safety' },
  { prefix: 'infection_',        role: 'safety' },
  { prefix: 'scope_of_practice', role: 'scope_of_practice' },
  { prefix: 'state_medical',     role: 'scope_of_practice' },
  { prefix: 'nursing_',          role: 'scope_of_practice' },
  { prefix: 'fl_telehealth',     role: 'scope_of_practice' },
  { prefix: 'facility_',         role: 'scope_of_practice' },
  { prefix: 'fl_med',            role: 'scope_of_practice' },
  { prefix: 'fl_hcc',            role: 'scope_of_practice' },
  { prefix: 'fl_medspa',         role: 'scope_of_practice' },
]

function roleForDomain(slug: string): string {
  for (const { prefix, role } of DOMAIN_ROLE_RULES) {
    if (slug.startsWith(prefix)) return role
  }
  return 'general'
}

// ── ML classifier ───────────────────────────────────────────────────────────
interface MLServiceLineResult {
  entity_id: string
  mappings: Array<{ service_line_slug: string; regulation_role: string; relevance_score: number }>
}

async function mapServiceLinesWithClaude(
  entities: Array<{ id: string; name: string; description: string | null; document_type: string | null; source_name: string | null; assigned_domains: string[] }>,
  serviceLines: Array<{ id: string; slug: string; name: string }>,
  logger: { warn: (m: string) => void }
): Promise<MLServiceLineResult[]> {
  const client = new Anthropic()
  const slList = serviceLines.map(sl => `${sl.slug}: ${sl.name}`).join('\n')

  const prompt = `You are mapping healthcare regulatory entities to clinical service lines for Cedar, a compliance platform for independent medical practices.

Context: These entities were not matched by rule-based mapping. Each includes assigned_domains (regulatory domains already classified) as context for your mapping.

Service lines (use exactly these slugs):
${slList}

regulation_role must be one of: prescribing, dispensing, billing, safety, scope_of_practice, general

For each entity, return only service lines with relevance_score >= 0.65.
Note: scores below 0.70 will be flagged for human review — only include if genuinely applicable.

Respond ONLY with a JSON array. No prose, no markdown:
[{"index":0,"mappings":[{"service_line_slug":"hormone_optimization","regulation_role":"prescribing","relevance_score":0.92}]}]

Entities:
${JSON.stringify(entities.map((e, i) => ({
  index: i, id: e.id, name: e.name,
  description: e.description?.slice(0, 300) ?? null,
  document_type: e.document_type, source_name: e.source_name,
  assigned_domains: e.assigned_domains,
})), null, 2)}`

  let response
  try {
    response = await client.messages.create({
      model: MODEL, max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })
  } catch (err) {
    logger.warn(`[service-line-map] Claude API error: ${(err as Error).message}`)
    return []
  }

  await trackCost({
    service: 'claude',
    operation: 'corpus_service_line_map',
    cost_usd: calculateClaudeCost(response.usage.input_tokens, response.usage.output_tokens),
    tokens_in: response.usage.input_tokens,
    tokens_out: response.usage.output_tokens,
    context: { entity_count: entities.length },
  })

  const raw = response.content[0]?.type === 'text' ? response.content[0].text : ''
  let parsed: Array<{ index: number; mappings: Array<{ service_line_slug: string; regulation_role: string; relevance_score: number }> }> = []
  try {
    parsed = JSON.parse(raw.trim())
  } catch {
    logger.warn(`[service-line-map] Claude JSON parse failed. Raw: ${raw.slice(0, 200)}`)
    return []
  }

  const slugSet = new Set(serviceLines.map(sl => sl.slug))
  const validRoles = new Set(['prescribing','dispensing','billing','safety','scope_of_practice','general'])

  return parsed.map(r => ({
    entity_id: entities[r.index]?.id ?? '',
    mappings: (r.mappings ?? []).filter(m =>
      slugSet.has(m.service_line_slug) &&
      validRoles.has(m.regulation_role) &&
      m.relevance_score >= 0.65
    ),
  })).filter(r => r.entity_id && r.mappings.length > 0)
}

export const corpusServiceLineMap = inngest.createFunction(
  {
    id: 'corpus-service-line-map',
    name: 'Corpus Service Line Map — Populate kg_service_line_regulations',
    retries: 1,
    concurrency: { limit: 1 },
    timeouts: { finish: '2h' },
  },
  { event: 'cedar/corpus.service-line-map' },
  async ({ step, logger, runId }) => {

    // Step 1: Load service lines + domain map
    const { serviceLines, domainMap, sourceMap } = await step.run('load-maps', async () => {
      const supabase = createServerClient()
      const [{ data: sls }, { data: domains }, { data: sources }] = await Promise.all([
        supabase.from('kg_service_lines').select('id, slug, name, regulation_domains').eq('is_active', true),
        supabase.from('kg_domains').select('id, slug'),
        supabase.from('sources').select('id, name'),
      ])
      const domainMap: Record<string, string> = {}
      const domainSlugFromId: Record<string, string> = {}
      for (const d of domains ?? []) { domainMap[d.slug] = d.id; domainSlugFromId[d.id] = d.slug }
      const sourceMap: Record<string, string> = {}
      for (const s of sources ?? []) sourceMap[s.id] = s.name
      return { serviceLines: sls ?? [], domainMap, domainSlugFromId, sourceMap }
    })

    // ── PASS 1: Rule-based mapping via regulation_domains ──────────────────
    const mappedEntityIds = new Set<string>()
    let ruleRows = 0

    for (const sl of serviceLines) {
      const rowCount = await step.run(`rule-map-${sl.slug}`, async () => {
        const supabase = createServerClient()
        const domainSlugs: string[] = (sl.regulation_domains as string[] | null) ?? []
        if (!domainSlugs.length) return 0

        const domainIds = domainSlugs.map(s => domainMap[s]).filter(Boolean)
        if (!domainIds.length) return 0

        // Protect manual entries
        const { data: existingManual } = await supabase
          .from('kg_service_line_regulations')
          .select('entity_id')
          .eq('service_line_id', sl.id)
          .eq('classified_by', 'manual')
        const manualIds = new Set((existingManual ?? []).map(r => r.entity_id))

        const { data: assignments, error } = await supabase
          .from('kg_entity_domains')
          .select('entity_id, domain_id, relevance_score')
          .in('domain_id', domainIds)
        if (error) throw new Error(`${sl.slug} domain fetch: ${error.message}`)
        if (!assignments?.length) return 0

        // Best score per entity (may match multiple domains)
        const entityBest: Record<string, { score: number; domainId: string }> = {}
        for (const a of assignments) {
          const score = a.relevance_score ?? 0.8
          if (!entityBest[a.entity_id] || score > entityBest[a.entity_id].score) {
            entityBest[a.entity_id] = { score, domainId: a.domain_id }
          }
        }

        // Build rows, skip manual entries
        // NOTE: domainSlugFromId is returned from load-maps step but not destructured above.
        // Resolve domainId → slug inline using domainMap (invert lookup)
        const domainIdToSlug: Record<string, string> = {}
        for (const [slug, id] of Object.entries(domainMap)) domainIdToSlug[id] = slug

        const rows = Object.entries(entityBest)
          .filter(([entityId]) => !manualIds.has(entityId))
          .map(([entityId, { score, domainId }]) => ({
            service_line_id: sl.id,
            entity_id:       entityId,
            regulation_role: roleForDomain(domainIdToSlug[domainId] ?? ''),
            relevance_score: score,
            classified_by:   'rule:regulation-domains',
            classified_at:   new Date().toISOString(),
          }))

        // Insert in 1000-row chunks
        for (let j = 0; j < rows.length; j += 1000) {
          const chunk = rows.slice(j, j + 1000)
          const { error: upsertErr } = await supabase
            .from('kg_service_line_regulations')
            .upsert(chunk, { onConflict: 'service_line_id,entity_id' })
          if (upsertErr) logger.warn(`[service-line-map] ${sl.slug} chunk ${j} warn: ${upsertErr.message}`)
        }

        for (const id of Object.keys(entityBest)) mappedEntityIds.add(id)
        return rows.length
      })

      ruleRows += rowCount
      logger.info(`[service-line-map] Rule: ${sl.slug} → ${rowCount} rows`)
    }

    logger.info(`[service-line-map] Rule pass done — ${ruleRows} rows, ${mappedEntityIds.size} entities covered`)

    // ── PASS 2: ML for high-relevance entities not yet mapped to any service line ──
    // Find entities with practice relevance >= 0.80 that have no service line mapping
    const unmappedHighRelevance = await step.run('find-unmapped-entities', async () => {
      const supabase = createServerClient()
      // Entities with high practice relevance
      const { data: relevant } = await supabase
        .from('kg_entity_practice_relevance')
        .select('entity_id')
        .gte('relevance_score', 0.80)
      const relevantIds = (relevant ?? []).map(r => r.entity_id)
      if (!relevantIds.length) return []

      // Entities already mapped to at least one service line
      const { data: mapped } = await supabase
        .from('kg_service_line_regulations')
        .select('entity_id')
        .in('entity_id', relevantIds)
      const mappedIdsSet = new Set((mapped ?? []).map(r => r.entity_id))

      return relevantIds.filter(id => !mappedIdsSet.has(id))
    })

    logger.info(`[service-line-map] ${unmappedHighRelevance.length} high-relevance entities without service line mapping → ML pass`)

    let mlRows = 0

    if (unmappedHighRelevance.length > 0) {
      // Build service line lookup for ML prompt
      const slForML = serviceLines.map(sl => ({ id: sl.id, slug: sl.slug, name: sl.name }))
      const slIdFromSlug: Record<string, string> = {}
      for (const sl of serviceLines) slIdFromSlug[sl.slug] = sl.id

      // Build domain ID → slug map for ML context
      const domainIdToSlugSL: Record<string, string> = {}
      for (const [slug, id] of Object.entries(domainMap)) domainIdToSlugSL[id] = slug

      // Fetch entity details + domain classifications as context for Claude
      const ML_FETCH_CHUNK = 500
      const mlEntities: Array<{ id: string; name: string; description: string | null; document_type: string | null; source_name: string | null; assigned_domains: string[] }> = []

      for (let j = 0; j < unmappedHighRelevance.length; j += ML_FETCH_CHUNK) {
        const fetched = await step.run(`ml-fetch-unmapped-${j}`, async () => {
          const supabase = createServerClient()
          const ids = unmappedHighRelevance.slice(j, j + ML_FETCH_CHUNK)

          const [{ data: entities }, { data: domainAssignments }] = await Promise.all([
            supabase.from('kg_entities')
              .select('id, name, description, document_type, source_id')
              .in('id', ids),
            supabase.from('kg_entity_domains')
              .select('entity_id, domain_id')
              .in('entity_id', ids),
          ])

          const entityDomainIds: Record<string, string[]> = {}
          for (const da of domainAssignments ?? []) {
            if (!entityDomainIds[da.entity_id]) entityDomainIds[da.entity_id] = []
            entityDomainIds[da.entity_id].push(da.domain_id)
          }

          return (entities ?? []).map(e => ({
            id: e.id, name: e.name, description: e.description,
            document_type: e.document_type,
            source_name: sourceMap[e.source_id ?? ''] ?? null,
            assigned_domains: (entityDomainIds[e.id] ?? [])
              .map(id => domainIdToSlugSL[id]).filter(Boolean),
          }))
        })
        mlEntities.push(...fetched)
      }

      const mlTotalBatches = Math.ceil(mlEntities.length / ML_BATCH_SIZE)

      for (let k = 0; k < mlTotalBatches; k++) {
        const mlStats = await step.run(`ml-map-batch-${k}`, async () => {
          const supabase = createServerClient()
          const batch = mlEntities.slice(k * ML_BATCH_SIZE, k * ML_BATCH_SIZE + ML_BATCH_SIZE)

          const results = await mapServiceLinesWithClaude(batch, slForML, logger)
          if (!results.length) return 0

          const rows: Array<{
            service_line_id: string; entity_id: string; regulation_role: string
            relevance_score: number; classified_by: string; classified_at: string
          }> = []
          const logRows: Array<{
            entity_id: string; stage: string; confidence: number
            classified_by: string; needs_review: boolean; run_id: string
          }> = []

          for (const r of results) {
            for (const m of r.mappings) {
              const slId = slIdFromSlug[m.service_line_slug]
              if (!slId) continue
              rows.push({
                service_line_id: slId,
                entity_id: r.entity_id,
                regulation_role: m.regulation_role,
                relevance_score: m.relevance_score,
                classified_by: 'claude-sonnet-4-5-20250929',
                classified_at: new Date().toISOString(),
              })
            }
            // needs_review=true if any mapping score is below 0.70
            const minScore = Math.min(...r.mappings.map(m => m.relevance_score))
            logRows.push({
              entity_id: r.entity_id, stage: 'ml', confidence: minScore,
              classified_by: 'claude-sonnet-4-5-20250929',
              needs_review: minScore < 0.70,
              review_reason: minScore < 0.70 ? `ML score ${minScore} below 0.70 threshold` : null,
              run_id: runId ?? 'unknown',
            })
          }

          if (rows.length > 0) {
            const { error: upsertErr } = await supabase
              .from('kg_service_line_regulations')
              .upsert(rows, { onConflict: 'service_line_id,entity_id' })
            if (upsertErr) logger.warn(`[service-line-map] ML batch ${k} upsert warn: ${upsertErr.message}`)
          }
          if (logRows.length > 0) {
            await supabase.from('kg_classification_log').insert(logRows)
          }

          return rows.length
        })

        mlRows += mlStats
        logger.info(`[service-line-map] ML batch ${k + 1}/${mlTotalBatches} — ${mlStats} rows`)
      }
    }

    logger.info(`[service-line-map] Done — rule: ${ruleRows} rows, ML: ${mlRows} rows`)
    return { ruleRows, mlRows, serviceLineCount: serviceLines.length }
  }
)
```

---

### Task 5: Register New Functions in Inngest Route

**File:** `app/api/inngest/route.ts`
**Action:** MODIFY

```typescript
// Add after existing imports:
import { corpusAuthorityClassify } from '../../../inngest/corpus-authority-classify'
import { corpusPracticeScore }      from '../../../inngest/corpus-practice-score'
import { corpusServiceLineMap }     from '../../../inngest/corpus-service-line-map'

// Add to functions array:
// corpusAuthorityClassify,
// corpusPracticeScore,
// corpusServiceLineMap,
```

---

### Task 6: Apply Migration + Build + Deploy

```bash
# 1. Apply migration 027 to production Supabase (same method as 025-026)

# 2. Build check
npm run build
# Must pass 0 errors, 0 warnings

# 3. Commit and push via PAT
git add -A
git commit -m "feat: Phase 3 — practice-type relevance scoring, service line mapping, authority classification"
PAT="$GITHUB_PAT"
git remote set-url origin "https://${PAT}@github.com/cedar-admin/cedar.git"
git push origin main
git remote set-url origin "https://github.com/cedar-admin/cedar.git"
```

---

### Task 7: Execute in Order

Trigger from Inngest dev dashboard. Run each to completion before starting the next.

1. **`cedar/corpus.classify`** — if `kg_entity_domains` is empty (check `SELECT COUNT(*) FROM kg_entity_domains`)
2. **`cedar/corpus.authority-classify`** — populates authority_level + issuing_agency
3. **`cedar/corpus.practice-score`** — populates kg_entity_practice_relevance; refreshes both views
4. **`cedar/corpus.service-line-map`** — populates kg_service_line_regulations

## Integration Points

```yaml
DATABASE:
  - supabase/migrations/027_phase3_schema.sql — new table + materialized view
  - kg_domain_practice_type_map: populated by migration, read by corpus-practice-score
  - kg_entity_practice_relevance: populated by corpus-practice-score (rule + ML)
  - kg_service_line_regulations: populated by corpus-service-line-map (rule + ML)
  - kg_entities.authority_level + issuing_agency: updated by corpus-authority-classify
  - mv_practice_relevance_summary: refreshed by corpus-practice-score
  - mv_corpus_facets: refreshed by corpus-practice-score
  - kg_classification_log: receives stage='rule' rows from rule pass + stage='ml' rows from ML pass
  - cost_events: receives one row per Claude API batch call across all three functions

INNGEST:
  - cedar/corpus.authority-classify → corpusAuthorityClassify
  - cedar/corpus.practice-score → corpusPracticeScore
  - cedar/corpus.service-line-map → corpusServiceLineMap
  - All registered in app/api/inngest/route.ts

ENV:
  - ANTHROPIC_API_KEY — already in .env.local and Vercel env vars
  - No new variables needed

COST TRACKING:
  - Operation names: 'corpus_authority_classify', 'corpus_practice_score', 'corpus_service_line_map'
  - At 15 entities/call, 99K entities → ~6,600 calls for practice-score ML pass (worst case: all unclassified)
  - Typical ML pass will be much smaller (~10-20% of corpus)
  - Rough cost estimate: 1,000 ML calls × ~500 input tokens × $3/M = ~$1.50 per run
```

## Validation

### Build Check

```bash
npm run build
# Must pass 0 errors, 0 warnings
```

### Database Verification

```sql
-- After corpus-authority-classify:
SELECT authority_level, COUNT(*) FROM kg_entities
  WHERE authority_level IS NOT NULL
  GROUP BY authority_level ORDER BY COUNT(*) DESC;
-- Expected: federal_regulation largest, state_board_rule present

SELECT COUNT(*) FROM kg_entities WHERE authority_level IS NOT NULL;
-- Expected: > 80,000

-- Check ML vs rule split for authority classify:
SELECT stage, classified_by, COUNT(*) FROM kg_classification_log
  WHERE stage IN ('rule','ml')
  GROUP BY stage, classified_by;

-- After corpus-practice-score:
SELECT COUNT(*) FROM kg_entity_practice_relevance;
-- Expected: > 100,000

SELECT pt.slug, pt.display_name, COUNT(*) AS entity_count
FROM kg_entity_practice_relevance epr
JOIN kg_practice_types pt ON pt.id = epr.practice_type_id
WHERE epr.relevance_score >= 0.70
GROUP BY pt.slug, pt.display_name
ORDER BY entity_count DESC;
-- All 8 Cedar-target practice types should appear with > 1,000 entities each

SELECT practice_type_slug, display_name, total_regulations, high_relevance_count
FROM mv_practice_relevance_summary
WHERE is_cedar_target = true
ORDER BY total_regulations DESC;
-- All 8 Cedar-target rows: non-zero total_regulations

-- After corpus-service-line-map:
SELECT sl.slug, sl.name, COUNT(*) AS entity_count
FROM kg_service_line_regulations slr
JOIN kg_service_lines sl ON sl.id = slr.service_line_id
GROUP BY sl.slug, sl.name
ORDER BY entity_count DESC;
-- All 10 service lines: >= 50 entities each

SELECT regulation_role, COUNT(*) FROM kg_service_line_regulations GROUP BY regulation_role;
-- Expected roles: prescribing, dispensing, billing, safety, scope_of_practice, general

-- Full Phase 3 completion summary:
SELECT
  (SELECT COUNT(*) FROM kg_entities WHERE authority_level IS NOT NULL)             AS authority_classified,
  (SELECT COUNT(*) FROM kg_entity_practice_relevance)                              AS practice_relevance_rows,
  (SELECT COUNT(*) FROM kg_service_line_regulations)                               AS service_line_rows,
  (SELECT COUNT(*) FROM mv_practice_relevance_summary WHERE total_regulations > 0) AS active_practice_types,
  (SELECT COUNT(*) FROM kg_classification_log WHERE stage = 'rule')                AS rule_log_entries,
  (SELECT COUNT(*) FROM kg_classification_log WHERE stage = 'ml')                  AS ml_log_entries,
  (SELECT COUNT(*) FROM cost_events WHERE operation LIKE 'corpus_%')               AS cost_events_logged;

-- Spot check: hormone optimization service line should have prescribing entities
SELECT slr.regulation_role, e.name
FROM kg_service_line_regulations slr
JOIN kg_service_lines sl ON sl.id = slr.service_line_id
JOIN kg_entities e ON e.id = slr.entity_id
WHERE sl.slug = 'hormone_optimization' AND slr.regulation_role = 'prescribing'
LIMIT 5;
```

### needs_review Verification

```sql
-- Confirm low-confidence ML results are flagged for review (not silently dropped)
SELECT stage, classified_by, needs_review, COUNT(*)
FROM kg_classification_log
WHERE stage = 'ml'
GROUP BY stage, classified_by, needs_review;
-- Expected: rows with needs_review=false (confident ML) AND needs_review=true (borderline ML)
-- needs_review=true rows will surface in the HITL review queue for manual inspection

-- Spot check: borderline practice-score ML entries
SELECT cl.entity_id, cl.confidence, cl.review_reason, e.name
FROM kg_classification_log cl
JOIN kg_entities e ON e.id = cl.entity_id
WHERE cl.stage = 'ml' AND cl.needs_review = true
LIMIT 10;
```

### Cost Event Verification

```sql
SELECT operation, COUNT(*) AS calls,
  SUM(tokens_in) AS total_tokens_in, SUM(tokens_out) AS total_tokens_out,
  ROUND(SUM(cost_usd)::NUMERIC, 4) AS total_cost_usd
FROM cost_events
WHERE service = 'claude' AND operation LIKE 'corpus_%'
GROUP BY operation;
```

## Anti-Patterns

- ❌ Do not skip `trackCost()` on any Claude API call — every call must be tracked from day one
- ❌ Do not use any model string other than `'claude-sonnet-4-5-20250929'` — must match in both API call and classified_by log field
- ❌ Do not throw on Claude JSON parse failure — log warning and continue (never break the batch pipeline)
- ❌ Do not send the full corpus to Claude — only entities that heuristic rules couldn't classify
- ❌ Do not suppress ML results with score < 0.70 — write them with needs_review=true for HITL review
- ❌ Do not overwrite `classified_by = 'manual'` entries — check before upserting
- ❌ Do not run corpus-practice-score or corpus-service-line-map before corpus-classify
- ❌ Do not use `DELETE + INSERT` instead of UPSERT — these must be idempotent
- ❌ Do not add UI changes in this phase — Phase 3 is data population only
- ❌ Do not skip the materialized view refresh at the end of corpus-practice-score
- ❌ Do not use anon key — always `createServerClient()` in Inngest functions
- ❌ Do not send entities to Claude without truncating description to 300 chars — avoid token blowout

## Confidence Score: 8/10

High confidence because:
- All target schema already exists (tables, enums, indexes from migrations 022-024)
- Exact slug values known from migration 024 seed data
- Pattern to follow (`corpus-classify.ts`) is well-established
- `trackCost()` and `calculateClaudeCost()` interfaces confirmed from `lib/cost-tracker.ts`
- The domain-practice-type mapping seed is fully specified in migration 027

One point of uncertainty: Supabase JS client join syntax for source name resolution in corpus-authority-classify. The alternative (load source map first in a separate step) is fully documented and should be used if the join syntax doesn't resolve correctly at runtime.
