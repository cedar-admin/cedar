name: "Classification Engine — Universal Stage 1 Classifier"

## Goal

A `lib/classification/` module that classifies any entity in Cedar's corpus — eCFR regulations, Federal Register notices, openFDA enforcement reports, FL board orders, DEA guidance, CMS transmittals, professional guidelines, and any future source. The engine reads the 487 rules from `classification_rules`, evaluates each entity against every applicable rule type (structural, agency, dataset, authority), and returns domain assignments and an authority level.

The engine is a pure function library. No Inngest, no database writes. It receives an entity and a pre-loaded rule context; it returns a `ClassificationResult`. PRP-03 handles orchestration and persistence.

After this PRP:
- An eCFR Part 1306 entity → `cs_prescribing` (structural rule) + `federal_regulation` (authority)
- A Federal Register DEA notice → `controlled_substances` (agency rule) + `sub_regulatory_guidance` (authority)
- An openFDA drug enforcement report → `fda_drug_approval` (dataset rule) + `sub_regulatory_guidance` (authority)
- A FL Board of Medicine final order → `licensing_cred` (source-based) + `state_board_rule` (authority)
- A Title 7 agriculture entity → `filtered: true` (structural rules find no match, no agency/dataset match either)

## Why

- **Business value:** The 487 classification rules from PRP-01 are inert database rows. This engine makes them executable across every source Cedar monitors — federal, state, professional. Stage 1 classification is deterministic: zero AI cost, zero API calls, and it covers ~85% of entities.
- **Roadmap phase:** MVP → 1.0 Launch bridge. Second of four PRPs. PRP-03 (Inngest pipeline) calls this engine; PRP-04 (Library wiring) displays its output.
- **Problems this solves:** Classification logic is split across `corpus-classify.ts` (23 hardcoded rules, CFR-focused) and `corpus-authority-classify.ts` (source-name matching). This engine centralizes all classification into a single, testable, database-driven module that works for any source type.

## Success Criteria

- [ ] `lib/classification/` directory exists with `types.ts`, `rules.ts`, `engine.ts`, `authority.ts`, `matchers/structural.ts`, `matchers/agency.ts`, `matchers/dataset.ts`
- [ ] `classify()` returns domain assignments for an eCFR entity (structural match via title+part)
- [ ] `classify()` returns domain assignments for a Federal Register entity (agency match + structural match via cfr_references)
- [ ] `classify()` returns domain assignments for an openFDA entity (dataset match)
- [ ] `classify()` returns `authority` for all three entity types above
- [ ] Entities with no matching rules of any type return `domains: []` (unclassified), enabling HITL or Stage 4 pickup
- [ ] The CFR allowlist gates structural rule matching only — agency, dataset, and authority rules still fire for entities with no CFR citation
- [ ] The engine is stateless: rules, allowlist, domain map, and source map are passed in via `ClassificationContext`
- [ ] `npm run build` passes with 0 errors, 0 warnings

## Context

### Files to Read First
```yaml
- file: CLAUDE.md
  why: Session conventions, stack, module status

- file: STATUS.md
  why: Current build state, all 10 source IDs (3 gov API + 7 Oxylabs)

- migration: supabase/migrations/028_classification_foundation.sql
  why: THE SOURCE OF TRUTH. Read the actual rule_config JSONB format for all 4 rule types (structural, agency, dataset, authority_level). Read the exact column names. Do not rely on any PRP spec — read the migration that shipped.

- migration: supabase/migrations/001_initial_schema.sql
  why: sources table schema — name, jurisdiction, fetch_method. The engine needs source metadata to match authority rules.

- migration: supabase/migrations/007_kg_foundation.sql
  why: kg_entities base schema — entity_type, jurisdiction, source_id, metadata

- migration: supabase/migrations/008_ontology_schema.sql
  why: kg_entity_domains junction table schema (entity_id, domain_id PK)

- migration: supabase/migrations/019_kg_corpus_columns.sql
  why: Entity columns added for corpus: cfr_references, agencies, document_type, citation, publication_date

- migration: supabase/migrations/022_taxonomy_schema.sql
  why: kg_entity_domains extensions (relevance_score, classified_by, is_primary), kg_classification_log schema, authority_level_enum values

- file: inngest/corpus-classify.ts
  why: EXISTING classification pattern — shows how rules match entities, how domain rows and log rows are shaped, how the batch loop works. The new engine produces the same output shape.

- file: inngest/corpus-authority-classify.ts
  why: EXISTING authority pattern — shows how source_name + document_type maps to authority_level_enum. Contains the complete mapping logic the new engine must replicate using DB rules instead.

- file: lib/corpus/ecfr-ingest.ts
  why: eCFR entity shape — metadata.title_number (int), metadata.part_number (STRING)

- file: lib/corpus/federal-register-ingest.ts
  why: FR entity shape — cfr_references [{title,part}], agencies [{name,slug,...}], document_type ('Rule'|'Proposed Rule'|'Notice')

- file: lib/corpus/openfda-ingest.ts
  why: openFDA entity shape — metadata contains full API record, document_type ('DRUG_ENFORCEMENT'|'DEVICE_ENFORCEMENT'), entity_type ('enforcement_action')

- file: lib/db/client.ts
  why: createServerClient() pattern

- research: research/outputs/part2/P2_S1.md
  section: "1A. Core Interfaces"
  why: ClassificationResult, CitationParser, RuleSet interface designs

- research: research/outputs/part3/P3_S4.md
  section: "1A. Federal Sources" and "1B. State Sources"
  why: Complete source_type × document_subtype → authority_level mapping table. This is the reference for how every source type maps to an authority level.
```

### Current File Tree (relevant subset)
```bash
lib/
  classification/              # DOES NOT EXIST — created by this PRP
  corpus/
    ecfr-ingest.ts             # eCFR entity metadata shape
    federal-register-ingest.ts # FR entity shape (agencies, cfr_references, document_type)
    openfda-ingest.ts          # openFDA entity shape
    shared.ts                  # UpsertResult, KGEntityInsert types
  db/
    client.ts                  # createServerClient()
    types.ts                   # Generated Supabase types

inngest/
  corpus-classify.ts           # Existing 23 hardcoded rules — DO NOT MODIFY
  corpus-authority-classify.ts # Existing hardcoded authority assignment — DO NOT MODIFY

supabase/migrations/
  001_initial_schema.sql       # sources table
  028_classification_foundation.sql  # 487 rules + 407 allowlist rows
```

### Files to Create or Modify
```bash
lib/classification/types.ts              (+) TypeScript interfaces for classification I/O
lib/classification/rules.ts              (+) Load rules, allowlist, domain map, source map from Supabase
lib/classification/matchers/structural.ts (+) Match entities against structural rules via CFR citation
lib/classification/matchers/agency.ts    (+) Match entities against agency rules via agency name/slug
lib/classification/matchers/dataset.ts   (+) Match entities against dataset rules via source/endpoint
lib/classification/authority.ts          (+) Match entities against authority_level rules
lib/classification/engine.ts             (+) Main classify() — runs all matchers, deduplicates, returns result
```

### Known Gotchas
```typescript
// Cedar-specific constraints for this feature:
//
// 1. THREE ENTITY METADATA PATTERNS — EACH SOURCE TYPE IS DIFFERENT:
//
//    eCFR entities:
//      entity_type = 'regulation'
//      document_type = 'CFR_PART'
//      metadata.title_number = 21 (integer)
//      metadata.part_number = "1306" (STRING — parse to int)
//      cfr_references = null (not populated by ecfr-ingest)
//      agencies = null
//      source name = 'eCFR Title 21 (Food & Drugs)'
//
//    Federal Register entities:
//      entity_type = 'regulation' | 'proposed_rule' | 'notice'
//      document_type = 'Rule' | 'Proposed Rule' | 'Notice' (title case)
//      cfr_references = [{title: 21, part: 1306}, ...]
//      agencies = [{name: "Food and Drug Administration", slug: "food-and-drug-administration", ...}]
//      source name = 'FDA Federal Register'
//
//    openFDA entities:
//      entity_type = 'enforcement_action'
//      document_type = 'DRUG_ENFORCEMENT' | 'DEVICE_ENFORCEMENT'
//      cfr_references = null
//      agencies = null
//      metadata contains full openFDA record with product_description, etc.
//      source name = 'openFDA Drug Enforcement Reports'
//
//    FL Board / Oxylabs entities (not yet in corpus, but sources exist):
//      Will have source_id pointing to FL Board sources
//      Will have jurisdiction = 'FL'
//      Classified by authority rules + eventually FL-specific structural rules
//
// 2. rule_config JSONB FORMAT (from actual migration 028):
//    Structural: {"title": 21, "part": 1306, "sections": null, "confidence": 0.95}
//    Agency:     {"agency_slug": "fda", "agency_tier": 1, "a_score": 0.95}
//    Dataset:    {"dataset_endpoint": "drug/enforcement", "confidence": 0.88}
//    Authority:  {"source_type": "federal_register", "document_subtype": "final_rule",
//                 "authority_level": "binding_federal", "confidence": 0.99}
//
// 3. AGENCY MATCHING — SLUG-TO-NAME MAPPING REQUIRED:
//    The agency_slug in rules is a Cedar internal key like "fda", "hhs_ocr", "dot_phmsa".
//    FR entities have agencies[].slug from the FR API like "food-and-drug-administration",
//    "office-for-civil-rights", "pipeline-and-hazardous-materials-safety-administration".
//    A simple substring check of "hhs_ocr" against "office-for-civil-rights" FAILS.
//
//    The agency matcher needs a SLUG_TO_PATTERNS mapping:
//      "fda"       → ["food and drug", "fda"]
//      "cms"       → ["centers for medicare", "centers for medicaid", "cms"]
//      "dea"       → ["drug enforcement", "dea"]
//      "osha"      → ["occupational safety", "osha"]
//      "oig"       → ["inspector general", "oig"]
//      "hhs_ocr"   → ["office for civil rights", "ocr"]
//      "cdc"       → ["centers for disease control", "cdc"]
//      "nrc"       → ["nuclear regulatory", "nrc"]
//      "epa"       → ["environmental protection", "epa"]
//      "dot_phmsa" → ["pipeline and hazardous", "phmsa", "hazardous materials"]
//      "eeoc"      → ["equal employment", "eeoc"]
//      "dol_whd"   → ["wage and hour", "whd", "department of labor"]
//      "ftc"       → ["federal trade", "ftc"]
//      "hhs_onc"   → ["health information technology", "onc", "national coordinator"]
//      "fcc"       → ["federal communications", "fcc"]
//      "hrsa"      → ["health resources", "hrsa"]
//      "samhsa"    → ["substance abuse", "samhsa"]
//      "cmmi"      → ["innovation center", "cmmi"]
//      "doj"       → ["department of justice", "doj"]
//      "irs"       → ["internal revenue", "irs"]
//
//    This mapping lives IN the agency matcher as a constant — it's a translation
//    layer between rule slugs and real-world entity text. It mirrors the patterns
//    already used in corpus-classify.ts hasAgency() calls.
//    Matching checks: entity.agencies[].name, entity.agencies[].slug,
//    and entity.sourceName — all case-insensitive, any pattern match = hit.
//
// 4. DATASET MATCHING:
//    The dataset_endpoint in rules is like "drug/enforcement".
//    openFDA entities have document_type like "DRUG_ENFORCEMENT".
//    Match by normalizing: "drug/enforcement" → "drug_enforcement" and
//    comparing to document_type. Or match metadata fields.
//    The source name "openFDA Drug Enforcement Reports" also signals this.
//
// 5. CFR ALLOWLIST — GATES STRUCTURAL RULES ONLY:
//    The allowlist filters which (title, part) combinations are relevant.
//    It applies ONLY to structural rule matching. If an entity has no CFR
//    citation or its citations aren't in the allowlist, structural rules
//    return nothing — but agency, dataset, and authority rules still fire.
//    An openFDA enforcement report has no CFR citation. It still gets
//    classified by dataset rules and authority rules.
//
// 6. AUTHORITY LEVEL: TIER LABELS vs ENUM VALUES:
//    Authority rules in migration 028 use tier labels:
//      binding_federal, binding_state, influential, operational,
//      interpretive, informational
//    kg_entities.authority_level uses authority_level_enum:
//      federal_statute, federal_regulation, sub_regulatory_guidance,
//      national_coverage_determination, local_coverage_determination,
//      state_statute, state_board_rule, professional_standard
//    authority.ts maps from (source_type + document_subtype) → enum value.
//    The tier label goes in the result as metadata (for display/sorting).
//    The existing corpus-authority-classify.ts has the complete mapping
//    logic — replicate it using DB rules as the driver.
//
// 7. SOURCE RESOLUTION:
//    Authority and agency rules need to know the entity's source type
//    (ecfr, federal_register, openfda, state_board, etc.).
//    The engine doesn't query the sources table directly — it receives
//    a sourceMap (source_id → {name, jurisdiction, fetch_method}) in the
//    ClassificationContext. PRP-03's Inngest function loads this once
//    and passes it in.
//    Alternatively, ClassificationInput includes a sourceName field
//    resolved by the caller.
//
// 8. ENGINE IS PURE — NO SIDE EFFECTS:
//    classify() takes an entity + ClassificationContext.
//    It returns a ClassificationResult.
//    It does NOT create Supabase clients, write tables, or fire events.
//    PRP-03 handles all I/O.
//
// 9. DEDUPLICATION:
//    An entity might match a structural rule AND an agency rule for the
//    same domain slug. Deduplicate by slug — keep the match with the
//    highest confidence. The first domain assigned is isPrimary=true.
//
// 10. UNCLASSIFIED ENTITIES:
//    If no rule of any type matches an entity, return domains=[] and
//    authority=null. This is a valid outcome — it means the entity needs
//    Stage 2 (keyword), Stage 4 (AI), or HITL classification. The Inngest
//    function in PRP-03 logs these for future processing.
//
// 11. INNGEST FUNCTIONS — DO NOT MODIFY:
//    corpus-classify.ts and corpus-authority-classify.ts continue working.
//    PRP-03 builds a NEW Inngest function. The old functions are deprecated
//    by convention, not deleted.
//
// 12. kg_classification_log STAGE CONSTRAINT:
//    The log table has CHECK (stage IN ('rule', 'keyword', 'ml', 'manual')).
//    ALL Stage 1 domain assignments use stage='rule' regardless of which
//    matcher produced them. The matcherType field on DomainAssignment
//    ('structural', 'agency', 'dataset') provides traceability without
//    violating the constraint. PRP-03 writes stage='rule' to the log.
```

## Tasks (execute in order)

### Task 1: Classification Types
**File:** `lib/classification/types.ts`
**Action:** CREATE

```typescript
// Core types for the universal classification pipeline.

// Input: a kg_entities row enriched with source metadata.
// The caller (PRP-03 Inngest function) resolves source_id → sourceName
// before calling classify().
export interface ClassificationInput {
  id: string
  name: string
  description: string | null
  entity_type: string
  document_type: string | null
  jurisdiction: string
  source_id: string | null
  sourceName: string | null     // resolved from sources table by caller
  sourceJurisdiction: string | null  // from sources.jurisdiction
  metadata: Record<string, unknown> | null
  agencies: Array<{ name: string; slug?: string; [k: string]: unknown }> | null
  cfr_references: Array<{ title: number; part: number }> | null
  citation: string | null
  identifier: string | null
}

// A single domain assignment
export interface DomainAssignment {
  domainSlug: string
  domainId: string       // UUID from slug→UUID map
  confidence: number
  isPrimary: boolean
  assignedBy: string     // rule name
  ruleId: string         // classification_rules.id
  stage: 'rule' | 'keyword' | 'ml' | 'manual'  // must match kg_classification_log CHECK constraint
  matcherType: 'structural' | 'agency' | 'dataset'  // which matcher produced this — for traceability
}

// Authority level assignment
export interface AuthorityAssignment {
  level: string          // authority_level_enum value (e.g., 'federal_regulation')
  tier: string           // tier label from rule (e.g., 'binding_federal')
  confidence: number
  assignedBy: string     // rule name
  ruleId: string
}

// Complete classification result for one entity
export interface ClassificationResult {
  entityId: string
  filtered: boolean      // true if entity matched zero rules of any type
  domains: DomainAssignment[]
  authority: AuthorityAssignment | null
  domainCodes: string[]  // unique slugs for kg_entities.domain_codes
  stage: 'rule'          // Stage 1 = deterministic rule matching; matches kg_classification_log values
}

// A loaded rule from the database
export interface ClassificationRule {
  id: string
  name: string
  ruleType: 'structural' | 'agency' | 'dataset' | 'authority_level'
  stage: number
  jurisdiction: string
  domainCode: string | null
  secondaryDomainCodes: string[] | null
  ruleConfig: Record<string, unknown>
  confidenceThreshold: number
  priority: number
  aiRefinementNeeded: boolean
  notes: string | null
}

// Source metadata for authority/agency matching
export interface SourceInfo {
  id: string
  name: string
  jurisdiction: string
  fetchMethod: string
}

// Pre-loaded context — loaded once per pipeline run, reused across all entities
export interface ClassificationContext {
  rules: ClassificationRule[]
  allowlist: Set<string>                    // "title:part" keys
  domainMap: Record<string, string>         // slug → UUID
  sourceMap: Record<string, SourceInfo>     // source_id → source metadata
}
```

### Task 2: Rule and Context Loading
**File:** `lib/classification/rules.ts`
**Action:** CREATE
**Pattern:** Follow `inngest/corpus-classify.ts` load-domain-map step

```typescript
// Load everything the engine needs into a ClassificationContext.
// Called ONCE per pipeline run, then passed to classify() for each entity.

import { createServerClient } from '../db/client'
import type { ClassificationRule, ClassificationContext, SourceInfo } from './types'

export async function loadClassificationContext(
  jurisdiction: string = 'federal'
): Promise<ClassificationContext> {
  const supabase = createServerClient()

  // Load in parallel
  const [rules, allowlist, domainMap, sourceMap] = await Promise.all([
    loadRules(supabase, jurisdiction),
    loadAllowlist(supabase),
    loadDomainMap(supabase),
    loadSourceMap(supabase),
  ])

  return { rules, allowlist, domainMap, sourceMap }
}

// Load all active rules for this jurisdiction.
// Federal rules always apply regardless of jurisdiction parameter.
// When jurisdiction='FL', load both federal and FL rules.
async function loadRules(supabase: ..., jurisdiction: string): Promise<ClassificationRule[]> {
  // SELECT * FROM classification_rules
  // WHERE is_active = true
  //   AND (jurisdiction = $1 OR jurisdiction = 'federal')
  // ORDER BY priority ASC
  // Parse snake_case DB columns → camelCase interface
}

// Build allowlist: Set<"title:part">
async function loadAllowlist(supabase: ...): Promise<Set<string>> {
  // SELECT title_number, part_number FROM cfr_allowlist
  // Return new Set(rows.map(r => `${r.title_number}:${r.part_number}`))
}

// Build domain slug → UUID map
async function loadDomainMap(supabase: ...): Promise<Record<string, string>> {
  // SELECT id, slug FROM kg_domains
}

// Build source_id → source metadata map
async function loadSourceMap(supabase: ...): Promise<Record<string, SourceInfo>> {
  // SELECT id, name, jurisdiction, fetch_method FROM sources WHERE is_active = true
}
```

### Task 3: Structural Matcher
**File:** `lib/classification/matchers/structural.ts`
**Action:** CREATE

```typescript
// Matches entities against structural rules using CFR citations.
// Applies the cfr_allowlist as a gate: only citations present in the
// allowlist are eligible for structural matching.
//
// Returns domain assignments from matched structural rules.
// Returns empty array if entity has no CFR citations or none are in allowlist.
// This is fine — other matchers (agency, dataset) may still match.

import type { ClassificationInput, ClassificationRule, DomainAssignment } from '../types'

export function matchStructural(
  entity: ClassificationInput,
  rules: ClassificationRule[],    // pre-filtered to ruleType='structural'
  allowlist: Set<string>,
  domainMap: Record<string, string>
): DomainAssignment[] {
  // 1. Extract (title, part) pairs from entity:
  //    Pattern A: metadata.title_number + metadata.part_number (eCFR)
  //    Pattern B: cfr_references array (Federal Register)
  //    Pattern C: parse from citation string as fallback (e.g., "Title 21 CFR Part 1306")
  //    Collect all unique pairs.
  //
  // 2. Filter through allowlist: keep only pairs where
  //    allowlist.has(`${title}:${part}`) is true.
  //    If nothing survives, return [].
  //
  // 3. For each surviving (title, part), find matching rules:
  //    rule.ruleConfig.title === title AND rule.ruleConfig.part === part
  //    Handle section-level rules: if rule has sections array, check if
  //    entity has a matching section (optional for proof of concept).
  //
  // 4. Build DomainAssignment for domain_code + each secondary_domain_codes.
  //    Resolve slugs → UUIDs via domainMap. Skip unresolved slugs.
  //
  // 5. Return all assignments.
}

// Extract (title, part) from entity using all available fields
function extractCitations(entity: ClassificationInput): Array<{title: number, part: number}> {
  // metadata.title_number (int) + metadata.part_number (STRING → parseInt)
  // cfr_references array
  // citation string regex fallback
  // Deduplicate
}
```

### Task 4: Agency Matcher
**File:** `lib/classification/matchers/agency.ts`
**Action:** CREATE

```typescript
// Matches entities against agency rules.
// Checks entity.agencies array AND entity.sourceName for matches
// against rule_config.agency_slug.
//
// This matcher runs for ALL entities regardless of CFR citations.
// A FL Board of Medicine document with no CFR reference still matches
// agency rules if the source or agency metadata matches.

import type { ClassificationInput, ClassificationRule, DomainAssignment } from '../types'

export function matchAgency(
  entity: ClassificationInput,
  rules: ClassificationRule[],    // pre-filtered to ruleType='agency'
  domainMap: Record<string, string>
): DomainAssignment[] {
  // 1. For each agency rule:
  //    rule.ruleConfig.agency_slug is a Cedar key like "fda", "hhs_ocr", "dot_phmsa"
  //
  // 2. Look up matchable patterns from SLUG_TO_PATTERNS constant (see Gotcha #3):
  //    "hhs_ocr" → ["office for civil rights", "ocr"]
  //
  // 3. Check each pattern against (all case-insensitive):
  //    a. entity.agencies[].name — e.g., "Office for Civil Rights"
  //    b. entity.agencies[].slug — e.g., "office-for-civil-rights" (replace hyphens with spaces)
  //    c. entity.sourceName — e.g., "DEA Diversion Control"
  //    Any pattern hit on any field = match.
  //
  // 4. If match found, build DomainAssignment from domain_code + secondary_domain_codes.
  //    confidence = rule.ruleConfig.a_score (the agency relevance score)
  //    stage = 'rule', matcherType = 'agency'
  //
  // 5. Return all assignments.
}
```

### Task 5: Dataset Matcher
**File:** `lib/classification/matchers/dataset.ts`
**Action:** CREATE

```typescript
// Matches entities against dataset rules (openFDA endpoints, CMS datasets, etc.).
// Checks entity.document_type and entity.sourceName against
// rule_config.dataset_endpoint.
//
// This matcher runs for ALL entities. It primarily classifies openFDA
// content today, but the pattern extends to any dataset-oriented source.

import type { ClassificationInput, ClassificationRule, DomainAssignment } from '../types'

export function matchDataset(
  entity: ClassificationInput,
  rules: ClassificationRule[],    // pre-filtered to ruleType='dataset'
  domainMap: Record<string, string>
): DomainAssignment[] {
  // 1. For each dataset rule:
  //    rule.ruleConfig.dataset_endpoint is like "drug/enforcement"
  //
  // 2. Normalize the endpoint to a matchable pattern:
  //    "drug/enforcement" → "drug_enforcement" (replace / with _)
  //
  // 3. Check entity.document_type against normalized endpoint
  //    (case-insensitive: "DRUG_ENFORCEMENT" matches "drug_enforcement")
  //
  // 4. Also check entity.sourceName for dataset context
  //    (e.g., source "openFDA Drug Enforcement Reports" → "drug_enforcement")
  //
  // 5. Also check entity.metadata for endpoint markers if available
  //    (e.g., metadata.openfda_endpoint if set by ingest)
  //
  // 6. Build DomainAssignment from domain_code + secondary_domain_codes.
  //    confidence = rule.ruleConfig.confidence
  //
  // 7. Return all assignments.
}
```

### Task 6: Authority Level Assignment
**File:** `lib/classification/authority.ts`
**Action:** CREATE

```typescript
// Assigns authority level to an entity by matching authority_level rules.
// Uses source type + document subtype to determine the legal weight
// of the regulatory content.
//
// Returns the authority_level_enum value for kg_entities.authority_level
// plus the tier label for display/sorting.

import type { ClassificationInput, ClassificationRule, AuthorityAssignment } from './types'

// authority_level_enum values (from migration 022)
type AuthorityLevelEnum =
  | 'federal_statute' | 'federal_regulation' | 'sub_regulatory_guidance'
  | 'national_coverage_determination' | 'local_coverage_determination'
  | 'state_statute' | 'state_board_rule' | 'professional_standard'

export function assignAuthority(
  entity: ClassificationInput,
  rules: ClassificationRule[]   // pre-filtered to ruleType='authority_level'
): AuthorityAssignment | null {
  // 1. Infer source_type from entity characteristics:
  //    - sourceName contains 'ecfr' or 'eCFR' → 'ecfr'
  //    - sourceName contains 'Federal Register' → 'federal_register'
  //    - sourceName contains 'openFDA' → 'openfda'
  //    - sourceName contains 'FL Board' or 'Board of Medicine' etc. → 'state_board'
  //    - sourceName contains 'FL Administrative' → 'state_admin_register'
  //    - sourceName contains 'DEA' → 'dea'
  //    - sourceName contains 'FDA Compounding' → 'fda'
  //    (Mirror patterns from corpus-authority-classify.ts)
  //
  // 2. Infer document_subtype from entity.document_type:
  //    'Rule' | 'RULE' → 'final_rule'
  //    'Proposed Rule' | 'PROPOSED_RULE' | 'PRORULE' → 'proposed_rule'
  //    'Notice' | 'NOTICE' → check further (NCD? DEA scheduling? general?)
  //    'CFR_PART' → 'codified_regulation'
  //    'DRUG_ENFORCEMENT' → 'enforcement_report'
  //    'WARNING_LETTER' → 'enforcement_action'
  //    'RECALL' → 'enforcement_report'
  //    entity_type='enforcement_action' → 'enforcement_report'
  //    (Mirror patterns from corpus-authority-classify.ts)
  //
  // 3. Match rules: find first rule where
  //    rule.ruleConfig.source_type matches inferred source_type AND
  //    rule.ruleConfig.document_subtype matches inferred document_subtype
  //    (or document_subtype is null in rule = wildcard match)
  //    Rules are sorted by priority — first match wins.
  //
  // 4. Map the rule's tier label to authority_level_enum:
  //    The rule gives us "binding_federal" — we need "federal_regulation".
  //    Use the (source_type, document_subtype) → enum mapping:
  //
  //    TIER_TO_ENUM mapping (derived from corpus-authority-classify.ts + P3-S4):
  //    (ecfr, codified_regulation) → 'federal_regulation'
  //    (federal_register, final_rule) → 'federal_regulation'
  //    (federal_register, interim_final_rule) → 'federal_regulation'
  //    (federal_register, direct_final_rule) → 'federal_regulation'
  //    (federal_register, proposed_rule) → 'federal_regulation'  // status='proposed' set elsewhere
  //    (federal_register, anprm) → 'sub_regulatory_guidance'
  //    (fda, guidance) → 'sub_regulatory_guidance'
  //    (cms, transmittal) → 'sub_regulatory_guidance'
  //    (cms, mln_matters) → 'sub_regulatory_guidance'
  //    (oig, advisory_opinion) → 'sub_regulatory_guidance'
  //    (oig, compliance_guidance) → 'sub_regulatory_guidance'
  //    (oig, work_plan) → 'sub_regulatory_guidance'
  //    (dea, diversion_control) → 'federal_regulation'
  //    (openfda, *) → 'sub_regulatory_guidance'
  //    (state_board, final_order) → 'state_board_rule'
  //    (state_board, meeting_minutes) → 'sub_regulatory_guidance'
  //    (state_legislature, enacted_bill) → 'state_statute'
  //    (state_legislature, pending_bill) → 'state_statute'  // status='proposed'
  //    (state_admin_register, final_rule) → 'state_board_rule'
  //    (court, injunction) → 'federal_regulation'
  //    (court, decision) → 'sub_regulatory_guidance'
  //    (cdc, guideline) → 'professional_standard'
  //    (uspstf, recommendation) → 'professional_standard'
  //
  //    Default fallback: 'sub_regulatory_guidance'
  //
  // 5. Return AuthorityAssignment with enum value, tier label, confidence, rule reference.
  //    Return null if no rule matches (entity needs manual authority assignment).
}
```

### Task 7: Main Classification Engine
**File:** `lib/classification/engine.ts`
**Action:** CREATE

```typescript
// Main entry point for classification.
// Runs ALL matchers against the entity, deduplicates, assigns authority.
//
// PURE FUNCTION — all data comes via parameters. No DB calls, no side effects.

import type {
  ClassificationInput,
  ClassificationResult,
  ClassificationContext,
  DomainAssignment,
} from './types'
import { matchStructural } from './matchers/structural'
import { matchAgency } from './matchers/agency'
import { matchDataset } from './matchers/dataset'
import { assignAuthority } from './authority'

export function classify(
  entity: ClassificationInput,
  context: ClassificationContext
): ClassificationResult {
  // 1. PARTITION RULES BY TYPE
  const structuralRules = context.rules.filter(r => r.ruleType === 'structural')
  const agencyRules = context.rules.filter(r => r.ruleType === 'agency')
  const datasetRules = context.rules.filter(r => r.ruleType === 'dataset')
  const authorityRules = context.rules.filter(r => r.ruleType === 'authority_level')

  // 2. RUN ALL MATCHERS — each returns DomainAssignment[]
  //    Structural: gates through allowlist internally
  //    Agency: runs against agencies array + sourceName
  //    Dataset: runs against document_type + sourceName
  const structuralDomains = matchStructural(entity, structuralRules, context.allowlist, context.domainMap)
  const agencyDomains = matchAgency(entity, agencyRules, context.domainMap)
  const datasetDomains = matchDataset(entity, datasetRules, context.domainMap)

  // 3. MERGE + DEDUPLICATE
  //    Combine all assignments. If multiple rules assign the same domain slug,
  //    keep the one with highest confidence.
  //    Mark the first domain as isPrimary=true, rest as false.
  const allDomains = deduplicateDomains([
    ...structuralDomains,
    ...agencyDomains,
    ...datasetDomains,
  ])

  // 4. AUTHORITY LEVEL
  const authority = assignAuthority(entity, authorityRules)

  // 5. ASSEMBLE RESULT
  const domainCodes = [...new Set(allDomains.map(d => d.domainSlug))]

  return {
    entityId: entity.id,
    filtered: allDomains.length === 0 && authority === null,
    domains: allDomains,
    authority,
    domainCodes,
    stage: 'rule',
  }
}

// Deduplicate domain assignments by slug — keep highest confidence per slug.
// First entry overall gets isPrimary=true.
function deduplicateDomains(assignments: DomainAssignment[]): DomainAssignment[] {
  // Group by domainSlug
  // For each group, keep the assignment with highest confidence
  // Mark the first in the final array as isPrimary=true
}
```

### Task 8: Build Verification
**File:** (none — CLI command)
**Action:** VERIFY

```bash
npm run build
# Must pass with 0 errors, 0 warnings
```

### Task 9: Smoke Test
**Action:** VERIFY

Write a temporary test script or use the dev server to verify the engine works end-to-end against production data.

```typescript
// Verification plan:
//
// 1. loadClassificationContext('federal')
//    → Confirm: 487 rules, 407 allowlist entries, 80+ domain slugs, 10 sources
//
// 2. classify(eCFR Title 21 Part 1306 entity, context)
//    → domains includes cs_prescribing (structural match)
//    → authority.level === 'federal_regulation'
//
// 3. classify(Federal Register DEA notice entity, context)
//    → domains includes controlled_substances (agency match via DEA)
//    → authority.level === 'federal_regulation' or 'sub_regulatory_guidance'
//
// 4. classify(openFDA drug enforcement entity, context)
//    → domains includes fda_drug_approval (dataset match)
//    → authority.level === 'sub_regulatory_guidance' (tier: binding_federal... check)
//
// 5. classify(entity with no CFR citation, no agency, no dataset match)
//    → filtered === true, domains empty
//
// 6. classify(FR entity with cfr_references for Title 42 Part 410)
//    → domains includes cms_billing (structural match via cfr_references)
//    → agency match also fires (CMS agency rule)
//    → deduplication keeps highest confidence per slug
```

## Integration Points
```yaml
DATABASE:
  - READ: classification_rules (487 active rules)
  - READ: cfr_allowlist (407 rows → Set)
  - READ: kg_domains (slug→UUID map)
  - READ: sources (source_id→metadata map)
  - No writes — PRP-03 handles persistence

INNGEST:
  - None (PRP-03 builds the Inngest function)

API ROUTES:
  - None

UI:
  - None

ENV:
  - None (uses existing Supabase credentials via createServerClient)
```

## Validation

### Build Check
```bash
npm run build
# Must pass with 0 errors, 0 warnings
```

### Functional Verification
```bash
# After build:
# 1. loadClassificationContext() returns populated context
# 2. classify() works for eCFR, FR, and openFDA entity types
# 3. Entities with no matches return filtered=true
# 4. Cross-source entities (FR with cfr_references + agencies) get multiple matches, deduplicated
```

## Anti-Patterns
- ❌ Do not hardcode domain logic — all rules come from the database
- ❌ Do not assume entities have CFR citations — many sources (openFDA, FL boards, DEA) don't
- ❌ Do not apply the cfr_allowlist to non-structural matchers — it gates structural rules only
- ❌ Do not create Supabase clients inside classify() — the engine is a pure function
- ❌ Do not modify corpus-classify.ts or corpus-authority-classify.ts
- ❌ Do not write to any database table — PRP-03 handles persistence
- ❌ Do not use `any` types — define proper interfaces
- ❌ Do not forget metadata.part_number is a STRING in eCFR entities
- ❌ Do not skip agency matching for entities that lack an agencies array — fall back to sourceName
- ❌ Do not return filtered=true just because structural rules didn't match — check all matchers first
