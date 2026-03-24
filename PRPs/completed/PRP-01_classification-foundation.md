name: "Classification Foundation — Schema Extensions + Structural Rule Seed Data"

## Goal

The classification pipeline has a complete database foundation:

1. The `classification_rules` table gains the P2-S1 columns (`jurisdiction`, `domain_code`, `secondary_domain_codes`, `rule_config`, `ai_refinement_needed`, `notes`) that the classification engine reads from.
2. The table contains **414+ structural domain-classification rules** (from P1-S8) and **~26 authority-level assignment rules** (from P3-S4), all seeded as `jurisdiction = 'federal'`.
3. A `cfr_allowlist` table holds the 407 relevant (title, part) pairs from P1-S2F — the relevance gate that filters the ~99K entity corpus down to ~12–18K healthcare-relevant entities.
4. `kg_entities` gains `domain_codes jsonb` and `classification_stage text` columns for downstream query performance.

After this PRP, the database holds everything the classification engine (PRP-02) needs to classify, assign authority levels, and write results.

## Why

- **Business value:** The Library page exists but shows zero categorized regulations. Classification rules are hardcoded in `corpus-classify.ts`. Moving them to the database with P2-S1's purpose-built schema enables rule iteration, jurisdiction scoping, and audit trails — all critical for a compliance platform.
- **Roadmap phase:** MVP → 1.0 Launch bridge. First of four PRPs that get classified regulations into the Library.
- **Problems this solves:** Classification rules locked in application code. No allowlist table for relevance filtering. No authority-level assignment rules. `kg_entities` missing columns the Library needs for filtering and display.

## Success Criteria

- [ ] `classification_rules` has new columns: `jurisdiction`, `domain_code`, `secondary_domain_codes`, `rule_config`, `ai_refinement_needed`, `notes`
- [ ] `cfr_allowlist` table exists with 407 rows (15 titles, exact parts from P1-S2F `RELEVANT_PARTS` dict)
- [ ] `classification_rules` contains 414+ rows with `rule_type = 'structural'` and `stage = 1`
- [ ] `classification_rules` contains ~26 rows with `rule_type = 'authority_level'`
- [ ] Every `domain_code` and `secondary_domain_codes` value references a valid `kg_domains` slug
- [ ] `kg_entities` has `domain_codes jsonb` and `classification_stage text` columns
- [ ] `npm run build` passes with 0 errors, 0 warnings

## Context

### Files to Read First
```yaml
- file: CLAUDE.md
  why: Session conventions, stack, module status

- file: STATUS.md
  why: Current build state — 27 migrations, 98,777 entities, taxonomy seeded

- migration: supabase/migrations/008_ontology_schema.sql
  why: classification_rules table schema — the existing table with conditions/action JSONB pattern and 7 generic rules

- migration: supabase/migrations/022_taxonomy_schema.sql
  why: authority_level_enum (already created), stage + confidence_threshold columns (already added to classification_rules)

- migration: supabase/migrations/024_taxonomy_seed.sql
  why: All domain slugs (10 L1, ~55 L2, ~50 L3). Every domain_code and secondary_domain_codes entry MUST reference one of these exact slugs.

- migration: supabase/migrations/019_kg_corpus_columns.sql
  why: Shows what columns already exist on kg_entities (cfr_references, citation, metadata fields, etc.)

- research: research/outputs/part2/P2_S1.md
  section: "1E. Jurisdiction-Scoped Classification Rules Table"
  why: The target schema design for classification_rules — columns, rule_config JSONB format, structural/agency/authority_level rule_type values

- research: research/outputs/part1/P1_S2-F.md
  section: "Deliverable 2: Engineering-Ready Allowlist"
  why: RELEVANT_PARTS Python dict — the exact (title, part) pairs for the cfr_allowlist table (407 entries across 15 titles)

- research: research/outputs/part1/P1_S8-A-A.md
  why: Title 21 Chapter I (FDA) structural rules — 113 parts with domain mappings and cross-classification triggers

- research: research/outputs/part1/P1_S8-A-B.md
  why: Title 21 Chapter II (DEA) + Title 42 (Public Health) structural rules

- research: research/outputs/part1/P1_S8-A-C.md
  why: Consolidated Title 21/42 mapping tables (Python dicts) + implementation notes. Use for validation — cross-check individual rules from S8-A-A and S8-A-B against these consolidated dicts.

- research: research/outputs/part1/P1_S8-B-A.md
  why: Title 45 (HIPAA/HHS) structural rules

- research: research/outputs/part1/P1_S8-B-B.md
  why: Title 29 (Labor/OSHA) structural rules

- research: research/outputs/part1/P1_S8-B-C.md
  why: Title 26 (Tax) + Title 16 (FTC) structural rules

- research: research/outputs/part1/P1_S8-B-D.md
  why: Tier 3 titles group 1 (Title 47 telecom, Title 10 energy, etc.)

- research: research/outputs/part1/P1_S8-B-E.md
  why: Tier 3 titles group 2 (Title 20 SSA, Title 32 TRICARE, etc.) + final consolidation

- research: research/outputs/part1/P1_S8-C.md
  why: Agency → domain mapping (26 rules) + openFDA dataset mapping (18 rules)

- research: research/outputs/part3/P3_S4.md
  section: "5C. Authority Level Rules — Entries in classification_rules"
  why: ~26 INSERT statements for authority_level rules. These use the P2-S1 column format (jurisdiction, rule_type, priority, domain_code, rule_config, notes, created_by). Copy the SQL directly — it is production-ready.

- file: inngest/corpus-classify.ts
  why: Existing hardcoded classification rules — shows the working domain slugs (from 024_taxonomy_seed.sql) and the entity field names (cfr_references, agencies, metadata). Do NOT modify this file in this PRP.

- file: lib/corpus/ecfr-ingest.ts
  why: Shows how eCFR entities store their title/part in metadata: metadata.title_number (integer) and metadata.part_number (string like "1306"). The structural rules' rule_config must account for this.

- doc: docs/supabase-prompts/create-migration.md
  why: Migration file header format and conventions

- doc: docs/supabase-prompts/sql-style-guide.md
  why: SQL INSERT style conventions
```

### Current File Tree (relevant subset)
```bash
supabase/migrations/
  008_ontology_schema.sql        # classification_rules table + 7 generic rules
  022_taxonomy_schema.sql        # authority_level_enum, stage + confidence_threshold columns
  024_taxonomy_seed.sql          # domain taxonomy (10 L1, ~55 L2, ~50+ L3)
  027_phase3_schema.sql          # latest migration

inngest/corpus-classify.ts       # 23 hardcoded rules (DO NOT MODIFY — PRP-02 replaces)

lib/corpus/ecfr-ingest.ts        # Shows metadata shape: {title_number, part_number, ...}

research/outputs/part1/
  P1_S2-F.md                    # RELEVANT_PARTS allowlist (407 parts)
  P1_S8-A-A.md through P1_S8-C.md  # 414 structural + 26 agency + 18 openFDA rules

research/outputs/part3/
  P3_S4.md                      # Authority level assignment rules (~26 INSERT statements)
```

### Files to Create or Modify
```bash
supabase/migrations/028_classification_foundation.sql  (+) ALTER classification_rules + ALTER kg_entities + CREATE cfr_allowlist + SEED structural rules + SEED authority rules
```

### Known Gotchas
```typescript
// Cedar-specific constraints for this feature:
//
// 1. DOMAIN SLUG RECONCILIATION — CRITICAL:
//    The research files (P1-S8) use dot-notation domain codes like
//    "controlled-substances.registration" and "hipaa-privacy.security-rule".
//    The database (024_taxonomy_seed.sql) uses underscore slugs like
//    "cs_dea_registration" and "hipaa_security".
//
//    When writing seed data, every domain_code and secondary_domain_codes
//    value MUST be a slug from kg_domains. Read 024_taxonomy_seed.sql to
//    get the full slug list. The mapping is done at INSERT-generation time,
//    not at runtime.
//
//    Key mappings (non-obvious):
//      "controlled-substances.registration" → "cs_dea_registration"
//      "controlled-substances.prescribing"  → "cs_prescribing"
//      "controlled-substances.disposal"     → "cs_disposal"
//      "compounding.503a"                   → "comp_503a"
//      "compounding.503b"                   → "comp_503b"
//      "fda-regulation.drugs"               → "fda_drug_approval"
//      "fda-regulation.devices"             → "fda_devices"
//      "fda-regulation.biologics"           → "fda_biologics"
//      "hipaa-privacy.security-rule"        → "hipaa_security"
//      "hipaa-privacy.privacy-rule"         → "hipaa_privacy"
//      "medicare-billing.physician-services"→ "cms_billing"
//      "medicare-billing.coverage"          → "cms_coverage"
//      "fraud-compliance.anti-kickback"     → "aks"
//      "fraud-compliance.stark-law"         → "stark_law"
//      "clinical-operations.laboratory"     → "lab_requirements"
//      "state-regulations.licensure"        → "state_medical_license"
//    If a research code maps to a domain that has no L2/L3 in the DB,
//    use the closest L1 parent slug.
//
// 2. EXISTING classification_rules DATA:
//    Migration 008 inserted 7 rules using the conditions/action JSONB pattern.
//    Do NOT delete or modify these. New structural and authority rules use the
//    P2-S1 columns (rule_config, domain_code, secondary_domain_codes) alongside
//    the existing columns. The existing 7 rules have conditions/action populated;
//    the new rules have rule_config/domain_code populated. Both patterns coexist.
//    PRP-02's engine reads from the new columns for structural/authority rules.
//
// 3. rule_config JSONB FORMAT (from P2-S1):
//    Structural rules:
//      {"title": 21, "part": 1306, "sections": null, "confidence": 0.95}
//    Agency rules:
//      {"agency_slug": "drug-enforcement-administration", "agency_tier": "high", "a_score": 0.45}
//    Authority level rules (from P3-S4):
//      {"source_type": "federal_register", "document_type": "RULE",
//       "authority_level": "federal_regulation", "status": "active", "conditions": []}
//
// 4. eCFR ENTITY METADATA STRUCTURE:
//    See ecfr-ingest.ts lines 90-99. eCFR entities store:
//      metadata.title_number (integer, e.g., 21)
//      metadata.part_number  (string, e.g., "1306")
//    The rule_config format uses integers for both title and part.
//    The classification engine (PRP-02) handles the type conversion.
//    Federal Register entities have cfr_references JSONB array instead:
//      [{title: 21, part: 1306}]
//    The engine matches against BOTH patterns. This PRP only writes rules;
//    PRP-02 writes the matching logic.
//
// 5. STAGE VALUES (from migration 022):
//    1 = structural (rule-based), 2 = keyword, 3 = ml/embedding, 4 = AI
//    All domain rules in this PRP: stage = 1
//    Authority-level rules: stage = 1 (they're also deterministic lookups)
//
// 6. CROSS-CLASSIFICATIONS:
//    Many CFR parts map to multiple domains. The P2-S1 schema handles this with:
//      domain_code          = primary domain slug
//      secondary_domain_codes = text[] of additional domain slugs
//    Example: 21 CFR 216 →
//      domain_code = 'fda_compounding'
//      secondary_domain_codes = ARRAY['comp_503a', 'comp_bulk_drug']
//
// 7. P3-S4 AUTHORITY RULES — COPY THE SQL:
//    P3-S4 section 5C contains production-ready INSERT statements using the
//    P2-S1 column format. Copy these into the migration. The only adjustment
//    needed: the P3-S4 SQL references columns that don't exist yet on the
//    existing table — the ALTER TABLE in this migration adds them first.
//    P3-S4 uses rule_type = 'authority_level' — this is a new value, allowed
//    because the existing table has no CHECK constraint on rule_type.
//
// 8. ALLOWLIST COUNT:
//    P1-S2F's text says "367 parts" but the actual RELEVANT_PARTS Python dict
//    has 407 entries. The dict is the source of truth. Count them.
//
// 9. DO NOT TOUCH corpus-classify.ts or any inngest/ files. PRP-02 builds
//    the engine that reads these database rules. The existing hardcoded rules
//    continue to work until PRP-02 replaces them.
```

## Tasks (execute in order)

### Task 1: ALTER classification_rules — Add P2-S1 Columns
**File:** `supabase/migrations/028_classification_foundation.sql`
**Action:** CREATE (beginning of migration file)
**Pattern:** Follow `supabase/migrations/022_taxonomy_schema.sql` for ALTER style

```sql
-- Add P2-S1 pipeline columns alongside existing conditions/action JSONB
alter table public.classification_rules
  add column if not exists jurisdiction           text not null default 'federal',
  add column if not exists domain_code            text,
  add column if not exists secondary_domain_codes text[],
  add column if not exists rule_config            jsonb,
  add column if not exists ai_refinement_needed   boolean not null default false,
  add column if not exists notes                  text;

-- domain_code should reference a kg_domains slug, but we use text (not FK)
-- for flexibility with sentinel values like 'authority-level-assignment'

create index if not exists idx_classification_rules_jurisdiction
  on public.classification_rules(jurisdiction, is_active) where is_active = true;

create index if not exists idx_classification_rules_domain_code
  on public.classification_rules(domain_code) where domain_code is not null;

-- GIN index on rule_config for JSONB containment queries
create index if not exists idx_classification_rules_rule_config
  on public.classification_rules using gin(rule_config) where rule_config is not null;
```

### Task 2: ALTER kg_entities — Add Classification Output Columns
**File:** `supabase/migrations/028_classification_foundation.sql` (continuation)
**Action:** APPEND to migration
**Pattern:** Follow `supabase/migrations/019_kg_corpus_columns.sql`

```sql
-- domain_codes: denormalized JSONB array of domain slugs assigned to this entity.
-- Enables fast filtering without joining through kg_entity_domains.
-- Canonical source of truth is still kg_entity_domains; this is a performance copy
-- updated by the classification pipeline after writing to the junction table.
alter table public.kg_entities
  add column if not exists domain_codes         jsonb,
  add column if not exists classification_stage  text;

-- classification_stage values: 'structural', 'keyword', 'ml', 'ai', 'manual'
-- Tracks which pipeline stage produced the final classification for this entity.

create index if not exists idx_kg_entities_domain_codes
  on public.kg_entities using gin(domain_codes) where domain_codes is not null;

create index if not exists idx_kg_entities_classification_stage
  on public.kg_entities(classification_stage) where classification_stage is not null;
```

### Task 3: CREATE cfr_allowlist + Seed Data
**File:** `supabase/migrations/028_classification_foundation.sql` (continuation)
**Action:** APPEND to migration

```sql
create table if not exists public.cfr_allowlist (
  id            uuid primary key default gen_random_uuid(),
  title_number  integer not null,
  part_number   integer not null,
  notes         text,
  created_at    timestamptz not null default now(),
  unique(title_number, part_number)
);

comment on table public.cfr_allowlist is
  'Part-level allowlist of CFR content relevant to healthcare practices. Derived from P1-S2F RELEVANT_PARTS. Used as relevance gate before classification.';

create index idx_cfr_allowlist_lookup
  on public.cfr_allowlist(title_number, part_number);

alter table public.cfr_allowlist enable row level security;

-- Service role (Inngest functions) bypasses RLS automatically.
-- No anon/authenticated policy needed — this table is backend-only.
```

Then INSERT all 407 (title, part) pairs from the `RELEVANT_PARTS` dict in `P1_S2-F.md` Deliverable 2. Use a single multi-row INSERT. Convert `"title_21": [1, 2, 3, ...]` to `(21, 1), (21, 2), (21, 3), ...`.

**IMPORTANT:** Use the exact values from the Python dict. The dict has these title keys and part counts:
- title_2: 19 parts
- title_10: 14 parts
- title_16: 40 parts
- title_20: 11 parts
- title_21: 123 parts
- title_26: 4 parts
- title_28: 6 parts
- title_29: 54 parts
- title_32: 1 part
- title_38: 11 parts
- title_40: 11 parts
- title_42: 77 parts
- title_45: 21 parts
- title_47: 4 parts
- title_49: 11 parts
Total: 407 rows.

### Task 4: Seed Structural Classification Rules (414+ rules)
**File:** `supabase/migrations/028_classification_foundation.sql` (continuation)
**Action:** APPEND to migration

Convert the structural rules from ALL P1-S8 research files into INSERT statements using the P2-S1 column format.

**INSERT format for structural rules:**

```sql
insert into public.classification_rules
  (name, rule_type, stage, jurisdiction, domain_code, secondary_domain_codes,
   rule_config, confidence_threshold, priority, is_active, created_by, notes)
values
  (
    'eCFR 21 CFR Part 216 → compounding',         -- name
    'structural',                                   -- rule_type
    1,                                              -- stage
    'federal',                                      -- jurisdiction
    'fda_compounding',                              -- domain_code (PRIMARY domain slug)
    ARRAY['comp_503a', 'comp_bulk_drug'],           -- secondary_domain_codes
    '{"title": 21, "part": 216, "sections": null, "confidence": 0.95}'::jsonb,  -- rule_config
    0.85,                                           -- confidence_threshold
    100,                                            -- priority
    true,                                           -- is_active
    'research-p1-s8',                               -- created_by
    'Pharmacy Compounding — 503A bulk drug lists, restrictions'  -- notes
  );
```

**How to build each rule:**

1. Read each P1-S8 research file's mapping table
2. For each row:
   - Extract CFR title and part number → put in rule_config as `{"title": X, "part": Y}`
   - Extract primary domain (research code like "compounding.503a") → resolve to DB slug (e.g., "comp_503a") using the mapping in Gotcha #1. That DB slug goes in `domain_code`.
   - Extract cross-classification triggers → resolve each to a DB slug, put in `secondary_domain_codes` array
   - Set confidence in rule_config: High relevance = 0.95, Medium = 0.88, Low = 0.80
   - Set priority: 100 for all structural part-level rules (they're all equally specific)
3. Skip Reserved parts (marked as N/A in the research tables)
4. For the 12 AI-fallback parts (flagged in P1-S8-A-A), still create the structural rule but set `ai_refinement_needed = true`

**File size note:** This task generates 450+ INSERT statements. If the migration file exceeds Claude Code's context window in a single pass, batch the work by research file — complete all rules from P1-S8-A-A, verify the slug mappings, then continue with P1-S8-A-B, and so on. Each batch appends to the same migration file. The SQL is additive — order within the INSERT block doesn't matter.

**Research files to process (in order):**

| File | Content | Approx Rules |
|---|---|---|
| P1_S8-A-A.md | Title 21 Chapter I (FDA) — 113 parts | ~100 (minus Reserved) |
| P1_S8-A-B.md | Title 21 DEA (Parts 1300-1321) + Title 42 (Parts 1-1008) | ~80 |
| P1_S8-B-A.md | Title 45 HIPAA/HHS | ~20 |
| P1_S8-B-B.md | Title 29 OSHA/Labor | ~45 |
| P1_S8-B-C.md | Title 26 Tax + Title 16 FTC | ~37 |
| P1_S8-B-D.md | Tier 3 Group 1 (Title 47, Title 10, etc.) | ~15 |
| P1_S8-B-E.md | Tier 3 Group 2 (Title 20, Title 32, etc.) | ~20 |
| P1_S8-C.md | Agency rules (26) + openFDA dataset rules (18) | 44 |

**Agency rules (from P1-S8-C):** Use `rule_type = 'agency'` and a different rule_config:
```sql
  'agency',                     -- rule_type
  1,                            -- stage
  'federal',                    -- jurisdiction
  'controlled_substances',      -- domain_code
  NULL,                         -- secondary_domain_codes
  '{"agency_slug": "drug-enforcement-administration", "agency_tier": "high", "a_score": 0.45}'::jsonb,
  0.85,                         -- confidence_threshold
  150,                          -- priority (agency rules evaluated after structural)
```

**openFDA rules (from P1-S8-C):** Use `rule_type = 'dataset'`:
```sql
  'dataset',                    -- rule_type
  1,                            -- stage
  'federal',                    -- jurisdiction
  'fda_enforcement',            -- domain_code
  NULL,                         -- secondary_domain_codes
  '{"dataset_endpoint": "drug/enforcement", "field_filters": []}'::jsonb,
```

**Rule naming convention:** `'eCFR {title} CFR Part {part} → {short_description}'` for structural, `'Agency: {name} → {domain}'` for agency, `'openFDA: {endpoint} → {domain}'` for dataset.

### Task 5: Seed Authority Level Assignment Rules (from P3-S4)
**File:** `supabase/migrations/028_classification_foundation.sql` (continuation)
**Action:** APPEND to migration
**Depends on:** Task 1 (columns must exist first)

Copy the ~26 INSERT statements from `research/outputs/part3/P3_S4.md` section "5C. Authority Level Rules." These are production-ready SQL that uses the P2-S1 column format.

The P3-S4 INSERTs reference columns:
```sql
(jurisdiction, rule_type, priority, domain_code, rule_config, notes, created_by)
```

**Adjustments needed:**
- Add `stage = 1` (P3-S4's SQL doesn't include it but the column has a default of 1, so this is handled)
- Add `is_active = true` (same — has a default)
- Verify that the rule_config JSONB in P3-S4 uses valid authority_level_enum values (they should — P3-S4 was written against the same enum in migration 022)

These rules cover:
- eCFR entries → `federal_regulation`
- Federal Register final rules → `federal_regulation`
- Federal Register proposed rules → `federal_regulation` + `status = 'proposed'`
- Federal Register notices (general) → `sub_regulatory_guidance`
- Federal Register notices (NCD) → `national_coverage_determination`
- Federal Register notices (DEA scheduling) → `federal_regulation`
- openFDA entries → `sub_regulatory_guidance`
- CMS transmittals → `sub_regulatory_guidance`
- CMS NCDs → `national_coverage_determination`
- CMS LCDs → `local_coverage_determination`
- FL Statutes → `state_statute`
- FL FAC rules → `state_board_rule`
- Professional guidelines → `professional_standard`
- (and several more — read the full P3-S4 section 5C)

### Task 6: Verification
**File:** (no file — SQL verification + build check)
**Action:** VERIFY
**Depends on:** Tasks 1–5

**6A. Domain slug integrity check:**
```sql
-- Every domain_code in classification_rules must exist in kg_domains
SELECT cr.name, cr.domain_code
FROM public.classification_rules cr
LEFT JOIN public.kg_domains d ON d.slug = cr.domain_code
WHERE cr.domain_code IS NOT NULL
  AND cr.domain_code != 'authority-level-assignment'
  AND d.id IS NULL;
-- Expected: 0 rows

-- Every secondary_domain_code must exist in kg_domains
WITH expanded AS (
  SELECT cr.name, unnest(cr.secondary_domain_codes) AS slug
  FROM public.classification_rules cr
  WHERE cr.secondary_domain_codes IS NOT NULL
)
SELECT e.name, e.slug
FROM expanded e
LEFT JOIN public.kg_domains d ON d.slug = e.slug
WHERE d.id IS NULL;
-- Expected: 0 rows
```

**6B. Row count checks:**
```sql
-- Structural rules
SELECT count(*) FROM public.classification_rules
WHERE rule_type = 'structural' AND jurisdiction = 'federal';
-- Expected: 350+ (structural CFR part rules)

-- Agency rules
SELECT count(*) FROM public.classification_rules
WHERE rule_type = 'agency' AND jurisdiction = 'federal';
-- Expected: ~26

-- Dataset (openFDA) rules
SELECT count(*) FROM public.classification_rules
WHERE rule_type = 'dataset' AND jurisdiction = 'federal';
-- Expected: ~18

-- Authority level rules
SELECT count(*) FROM public.classification_rules
WHERE rule_type = 'authority_level';
-- Expected: ~26

-- Allowlist
SELECT count(*) FROM public.cfr_allowlist;
-- Expected: 407

-- Allowlist by title
SELECT title_number, count(*) as parts
FROM public.cfr_allowlist
GROUP BY title_number ORDER BY title_number;
-- Expected: 15 rows
```

**6C. Spot checks:**
```sql
-- 21 CFR Part 1306 should be controlled substances prescribing
SELECT name, domain_code, secondary_domain_codes, rule_config
FROM public.classification_rules
WHERE rule_type = 'structural'
  AND rule_config @> '{"title": 21, "part": 1306}';

-- 42 CFR Part 164 should be HIPAA
SELECT name, domain_code, secondary_domain_codes
FROM public.classification_rules
WHERE rule_type = 'structural'
  AND rule_config @> '{"title": 42, "part": 164}';

-- Authority rule for FR final rules
SELECT name, rule_config->'authority_level' as authority
FROM public.classification_rules
WHERE rule_type = 'authority_level'
  AND rule_config @> '{"source_type": "federal_register", "document_type": "RULE"}';

-- Every structural rule's (title, part) should exist in cfr_allowlist
SELECT cr.name, cr.rule_config->>'title' as title, cr.rule_config->>'part' as part
FROM public.classification_rules cr
LEFT JOIN public.cfr_allowlist a
  ON a.title_number = (cr.rule_config->>'title')::int
  AND a.part_number = (cr.rule_config->>'part')::int
WHERE cr.rule_type = 'structural'
  AND a.id IS NULL;
-- Expected: 0 rows (every classified part is also in the allowlist)
-- If this returns rows, it means structural classification rules exist for parts
-- that would get filtered out by the relevance gate — a silent data loss bug.
```

**6D. Build check:**
```bash
npm run build
# Must pass with 0 errors, 0 warnings
```

## Integration Points
```yaml
DATABASE:
  - ALTER TABLE: classification_rules + 6 new columns (jurisdiction, domain_code, secondary_domain_codes, rule_config, ai_refinement_needed, notes)
  - ALTER TABLE: kg_entities + 2 new columns (domain_codes, classification_stage)
  - CREATE TABLE: cfr_allowlist
  - INSERT: 407 cfr_allowlist rows
  - INSERT: 414+ structural classification rules
  - INSERT: ~26 agency classification rules
  - INSERT: ~18 openFDA dataset rules
  - INSERT: ~26 authority level assignment rules

INNGEST:
  - None (PRP-02 builds the pipeline that reads these rules)

API ROUTES:
  - None (PRP-04 wires Library queries)

UI:
  - None (PRP-04 wires Library page)

ENV:
  - None
```

## Validation

### Build Check
```bash
npm run build
# Must pass with 0 errors, 0 warnings
```

### Functional Verification
```bash
# 1. Apply migration locally or verify SQL syntax
# 2. Run all verification queries from Task 6
# 3. Spot-check 10 structural rules against research files:
#    - 21 CFR Part 216 → domain_code = 'fda_compounding', secondary includes 'comp_503a'
#    - 21 CFR Part 1306 → domain_code includes 'cs_prescribing'
#    - 21 CFR Part 1271 → domain_code = 'fda_biologics'
#    - 42 CFR Part 410 → domain_code = 'cms_billing'
#    - 42 CFR Part 493 → domain_code = 'lab_requirements' or 'clinical_standards'
#    - 45 CFR Part 164 → domain_code includes 'hipaa_privacy' or 'hipaa_security'
#    - 29 CFR Part 1910 → domain_code includes 'osha'
#    - 16 CFR Part 255 → domain_code relates to advertising/FTC
#    - 21 CFR Part 211 → domain_code = 'fda_drug_approval', secondary includes compounding
#    - 42 CFR Part 1001 → domain_code = 'oig_compliance' or 'fraud_abuse'
# 4. Spot-check 3 authority level rules:
#    - FR RULE type → authority_level = 'federal_regulation'
#    - eCFR entries → authority_level = 'federal_regulation'
#    - openFDA → authority_level = 'sub_regulatory_guidance'
# 5. Confirm cfr_allowlist has correct Title 21 part count (123)
```

### Database Verification
```sql
-- See Task 6 for complete verification queries
```

## Anti-Patterns
- ❌ Do not create new patterns when existing ones work — mirror existing code
- ❌ Do not skip validation — fix and retry
- ❌ Do not add scope beyond this PRP — note future work in STATUS.md
- ❌ Do not modify the changes table schema — it's append-only by design
- ❌ Do not modify corpus-classify.ts or any inngest/ files — PRP-02 handles the engine
- ❌ Do not invent domain slugs — every slug MUST exist in kg_domains (migration 024)
- ❌ Do not delete or modify the 7 existing classification_rules rows from migration 008
- ❌ Do not skip reading ALL P1-S8 research files — rules span 8+ files across multiple CFR titles
- ❌ Do not use the conditions/action JSONB columns for new rules — use the P2-S1 columns (rule_config, domain_code, secondary_domain_codes)
- ❌ Do not assume the research domain codes match DB slugs — they use different naming conventions and require translation at seed-data-generation time
- ❌ Do not skip the P3-S4 authority level rules — they are explicitly in scope for this PRP
