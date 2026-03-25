name: "Classified Corpus Seed — Fetch, Filter, Classify, Store"

## Goal

A new Inngest function `cedar/corpus.classified-seed` that builds Cedar's regulatory corpus from scratch — fetching only relevant content, classifying every entity on ingest, and writing fully classified entities to the knowledge graph. When it finishes, the Library has 12–18K entities with domain assignments, authority levels, and classification audit trails.

This replaces the old `corpus-seed` function, which ingested 99K entities without classification or relevance filtering.

Pipeline per source: **fetch → filter (allowlist) → build entity → upsert → classify → write classification results**

After this PRP:
- `kg_entities`: ~12–18K rows (eCFR across 15 titles, Federal Register, openFDA) — all relevant to healthcare practices
- `kg_entity_domains`: domain assignments for every entity, with confidence scores
- `kg_classification_log`: audit trail for every classification decision
- `kg_entities.domain_codes`, `classification_stage`, `authority_level`: populated on every entity
- Library page shows real categorized regulations

## Why

- **Business value:** The corpus is empty (2 entities). The Library page shows nothing. This pipeline populates it with classified, organized regulatory content — the entire point of the platform.
- **Roadmap phase:** MVP → 1.0 Launch bridge. Third of four PRPs. PRP-04 (Library wiring) displays what this pipeline produces.
- **Problems this solves:** The old `corpus-seed` ingested everything blindly (99K entities, ~80% irrelevant). This pipeline uses the allowlist to fetch only healthcare-relevant content and classifies every entity on ingest using the PRP-02 engine.

## Success Criteria

- [ ] New Inngest function `cedar/corpus.classified-seed` registered in route handler
- [ ] eCFR ingestion expanded from Title 21 only → all 15 allowlist titles (2, 10, 16, 20, 21, 26, 28, 29, 32, 38, 40, 42, 45, 47, 49)
- [ ] Only parts present in `cfr_allowlist` are ingested (407 parts across 15 titles)
- [ ] Federal Register entities ingested with expanded CFR title filtering
- [ ] openFDA entities ingested and classified
- [ ] Every ingested entity has: domain assignments in `kg_entity_domains`, authority level on `kg_entities`, classification log entries, denormalized `domain_codes` and `classification_stage`
- [ ] Entities that match zero classification rules are flagged (not silently dropped)
- [ ] Pipeline is idempotent — re-running doesn't create duplicates (upsert on identifier+source_id)
- [ ] `npm run build` passes with 0 errors, 0 warnings

## Context

### Files to Read First
```yaml
- file: CLAUDE.md
  why: Session conventions, stack, Inngest patterns, cost tracking requirements

- file: STATUS.md
  why: Current build state, source IDs, known issues

- file: lib/classification/engine.ts
  why: The classification engine from PRP-02. classify() + loadClassificationContext(). Read the actual code, not the PRP spec.

- file: lib/classification/types.ts
  why: ClassificationInput, ClassificationResult, ClassificationContext interfaces — these are the contracts between the pipeline and the engine.

- file: lib/classification/rules.ts
  why: loadClassificationContext() loads rules, allowlist, domain map, source map in parallel.

- file: inngest/corpus-seed.ts
  why: The EXISTING pipeline this replaces. Shows the Inngest step pattern, source ID lookup, ingest function calls, and summary reporting. Follow this structure.

- file: inngest/corpus-classify.ts
  why: Shows how classified entities are written to kg_entity_domains and kg_classification_log. The new pipeline writes the same row shapes.

- file: inngest/corpus-authority-classify.ts
  why: Shows how authority_level is written to kg_entities. The new pipeline does this inline.

- file: lib/corpus/ecfr-ingest.ts
  why: Current eCFR ingest — Title 21 only, no filtering. Shows entity building pattern (ECFRNode parsing, KGEntityInsert shape, upsertEntities). The new pipeline generalizes this to any title with allowlist filtering.

- file: lib/corpus/federal-register-ingest.ts
  why: Current FR ingest — shows agency list, year-by-year pagination, entity building from FR API response, cfr_references population.

- file: lib/corpus/openfda-ingest.ts
  why: Current openFDA ingest — shows endpoint pagination, entity building from openFDA records.

- file: lib/corpus/shared.ts
  why: upsertEntities() helper — batch upsert with (identifier, source_id) dedup.

- file: lib/fetchers/gov-apis.ts
  why: fetchECFRStructure(titleNumber), searchFederalRegister(), fetchOpenFDAPaginated() — the actual API callers. fetchECFRStructure already accepts any title number. searchFederalRegister already accepts cfrTitles filter.

- migration: supabase/migrations/028_classification_foundation.sql
  why: cfr_allowlist table (407 rows), classification rules (487 rows)

- migration: supabase/migrations/022_taxonomy_schema.sql
  why: kg_entity_domains schema (with relevance_score, classified_by, is_primary), kg_classification_log schema

- migration: supabase/migrations/004_seed_sources.sql
  why: Source records — the eCFR source is "eCFR Title 21 (Food & Drugs)". This pipeline reuses that source_id for all 15 eCFR titles (the entity metadata carries the actual title number).

- file: app/api/inngest/route.ts
  why: Inngest function registration — the new function must be imported and added to the functions array.
```

### Current File Tree (relevant subset)
```bash
inngest/
  client.ts                    # Inngest client singleton
  corpus-seed.ts               # OLD pipeline — no filtering, no classification (DO NOT MODIFY)
  corpus-classify.ts           # OLD post-hoc classifier (DO NOT MODIFY)
  corpus-authority-classify.ts # OLD post-hoc authority assigner (DO NOT MODIFY)

lib/
  classification/
    engine.ts                  # classify() + loadClassificationContext() from PRP-02
    types.ts                   # ClassificationInput, ClassificationResult, etc.
    rules.ts                   # Context loader
    matchers/                  # structural, agency, dataset matchers
    authority.ts               # Authority level assignment
  corpus/
    ecfr-ingest.ts             # Title 21 only ingest (pattern to generalize)
    federal-register-ingest.ts # FR ingest (expand filtering)
    openfda-ingest.ts          # openFDA ingest (add classification)
    shared.ts                  # upsertEntities(), KGEntityInsert
  fetchers/
    gov-apis.ts                # fetchECFRStructure, searchFederalRegister, fetchOpenFDAPaginated
  cost-tracker.ts              # trackCost() — wrap external API calls

app/api/inngest/route.ts       # Function registration
```

### Files to Create or Modify
```bash
inngest/classified-seed.ts                (+) New Inngest function — the full pipeline
lib/corpus/classified-ecfr-ingest.ts      (+) eCFR ingest generalized to any title with allowlist filter
app/api/inngest/route.ts                  (M) Register the new function
```

### Known Gotchas
```typescript
// Cedar-specific constraints for this feature:
//
// 1. INNGEST STEP FUNCTIONS — EACH STEP IS INDEPENDENTLY RETRIABLE:
//    All async work must be inside step.run(). Each step gets its own
//    try/catch and retry behavior. Data flows between steps via return
//    values (must be JSON-serializable — no Set, no Map, no functions).
//    The classification context (ClassificationContext) contains a Set
//    (the allowlist) — it CANNOT be passed between steps. Load it fresh
//    inside the step that needs it, or convert to an array for passing.
//
// 2. SOURCE_ID FOR MULTI-TITLE eCFR:
//    The existing eCFR source record is named "eCFR Title 21 (Food & Drugs)".
//    The pipeline reuses this source_id for all 15 titles. The entity's
//    metadata.title_number and identifier (e.g., "ecfr-title-42-part-410")
//    carry the actual title. The source_id traces back to "eCFR gov API" as
//    the fetch method. The source name is cosmetic for now.
//    The upsert key is (identifier, source_id) — identifiers are title-specific
//    so there are no collisions across titles.
//
// 3. ENTITY BUILDING PATTERN — FOLLOW ecfr-ingest.ts:
//    Each eCFR entity has:
//      identifier: `ecfr-title-${title}-part-${partNumber}`
//      citation: `Title ${title} CFR Part ${partNumber}`
//      document_type: 'CFR_PART'
//      entity_type: 'regulation'
//      jurisdiction: 'US'
//      external_url: `https://www.ecfr.gov/current/title-${title}/part-${partNumber}`
//      metadata: { title_number: int, part_number: string, ... }
//
// 4. ClassificationInput SHAPE:
//    The classify() function expects ClassificationInput. When building this
//    from a freshly upserted entity, the caller must resolve sourceName from
//    the source map. For eCFR entities: sourceName = 'eCFR Title 21 (Food & Drugs)'
//    (or whatever the source record name is).
//    The entity row from upsert may not include all ClassificationInput fields —
//    build it from the KGEntityInsert data you already have.
//
// 5. WRITING CLASSIFICATION RESULTS — THREE DESTINATIONS:
//    For each classified entity:
//    a. kg_entity_domains: upsert rows for each DomainAssignment
//       Columns: entity_id, domain_id, confidence, relevance_score, 
//       classified_by (rule name), is_primary, assigned_by ('rule:ruleName')
//       Use ON CONFLICT (entity_id, domain_id) DO UPDATE for idempotency.
//    b. kg_classification_log: insert one row per domain assignment
//       Columns: entity_id, domain_id, stage ('rule'), confidence,
//       classified_by, needs_review, review_reason, run_id
//    c. kg_entities: update denormalized columns
//       domain_codes (JSONB array of slugs), classification_stage ('structural'),
//       authority_level (enum value), issuing_agency (if available)
//    Follow the exact row shapes from corpus-classify.ts and
//    corpus-authority-classify.ts.
//
// 6. BATCH PROCESSING:
//    eCFR: 15 titles, ~407 parts total. Each title can be its own Inngest step.
//    FR: The existing ingest paginates by year (2021-present) × agencies.
//    openFDA: Paginates with skip-based pagination (max 25K).
//    Classification runs in memory after each batch of entities is upserted.
//    A reasonable batch: fetch one eCFR title → filter → upsert → classify
//    → write results, all in one step. 15 steps for eCFR, a few for FR, one for openFDA.
//
// 7. FEDERAL REGISTER FILTERING:
//    The existing FR ingest uses 5 agencies (FDA, DEA, FTC, HHS, CMS).
//    The searchFederalRegister() function already supports a cfrTitles parameter.
//    Use the 15 allowlist title numbers as the cfrTitles filter to narrow FR
//    results to documents that reference healthcare-relevant CFR parts.
//    Also keep the agency filter — FR documents from relevant agencies without
//    CFR references are still classified via agency rules.
//
// 8. openFDA — 15 ENDPOINTS WITH DATASET RULES:
//    Migration 028 has dataset rules for these endpoints:
//      drug/enforcement, drug/event, drug/label, drug/ndc, drug/drugsfda,
//      device/enforcement, device/event, device/recall, device/510k,
//      device/pma, device/registrationlisting, device/udi,
//      food/enforcement, food/event, other/nsde
//    The existing openfda-ingest.ts only covers drug/enforcement + device/enforcement.
//    Expand to all 15 endpoints.
//
//    VOLUME CAUTION: Some endpoints have millions of records (drug/event alone
//    has 20M+). Apply sensible search filters per endpoint:
//    - Enforcement endpoints: all records (manageable volume)
//    - Event endpoints: recent years only (e.g., last 3 years)
//    - Approval/clearance endpoints (drug/drugsfda, device/510k, device/pma): all records
//    - Label/NDC endpoints: recent updates only
//    openFDA max skip is 25,000 — that's the hard ceiling per endpoint+query.
//    If an endpoint has more than 25K results even with filters, take the
//    most recent 25K. This is a corpus seed, not a complete mirror.
//
// 9. COST TRACKING:
//    Every external API call (eCFR, FR, openFDA) must be wrapped with
//    trackCost() per CLAUDE.md. eCFR and FR are free (cost_usd: 0) but
//    the calls should still be logged for observability.
//
// 10. IDEMPOTENCY:
//    Re-running the pipeline must not create duplicate entities or
//    classification records. Entities upsert on (identifier, source_id).
//    kg_entity_domains upsert on (entity_id, domain_id).
//    kg_classification_log is append-only — re-runs add new log entries
//    (this is intentional for audit trail; each run is a separate audit record).
//
// 11. UNCLASSIFIED ENTITIES:
//    If classify() returns filtered=true (no rules matched), the entity is
//    still stored in kg_entities but gets NO domain assignments.
//    Log these with needs_review=true and a review_reason explaining why
//    no rules matched. The HITL review queue picks them up later.
//
// 12. ALLOWLIST IS FOR eCFR STRUCTURAL MATCHING ONLY:
//    The allowlist determines which eCFR PARTS get fetched and ingested.
//    FR documents are filtered by agency + cfr_references overlap.
//    openFDA entities are always ingested (dataset rules handle them).
//    The allowlist does NOT filter FR or openFDA at ingest time — those
//    sources have their own relevance signals (agency, dataset endpoint).
//
// 13. DO NOT MODIFY OLD FUNCTIONS:
//    corpus-seed.ts, corpus-classify.ts, corpus-authority-classify.ts
//    remain untouched. They're deprecated by this new pipeline but
//    preserved for reference and rollback.
```

## Tasks (execute in order)

### Task 1: Classified eCFR Ingest Module
**File:** `lib/corpus/classified-ecfr-ingest.ts`
**Action:** CREATE
**Pattern:** Follow `lib/corpus/ecfr-ingest.ts` for entity building, add allowlist filter

```typescript
// eCFR ingest generalized to any title, filtered by cfr_allowlist.
// Fetches structure for a single title, extracts parts, filters to only
// parts in the allowlist, builds entities, and returns them for upsert.
//
// This module does NOT call classify() — the Inngest function handles
// classification after upsert so it has entity IDs.

import { fetchECFRStructure } from '../fetchers/gov-apis'
import { trackCost } from '../cost-tracker'
import type { KGEntityInsert } from './shared'

// Re-export ECFRNode and extractParts from ecfr-ingest (or duplicate — they're small)

export interface ECFRTitleIngestResult {
  entities: KGEntityInsert[]
  totalPartsInTitle: number
  partsAfterFilter: number
  errors: string[]
}

export async function ingestECFRTitle(
  titleNumber: number,
  sourceId: string,
  allowlist: Set<string>   // "title:part" keys, e.g., "21:1306"
): Promise<ECFRTitleIngestResult> {
  // 1. Fetch structure: fetchECFRStructure(titleNumber)
  // 2. Extract parts (same extractParts logic as ecfr-ingest.ts)
  // 3. Filter: keep only parts where allowlist.has(`${titleNumber}:${partIdentifier}`)
  // 4. Build KGEntityInsert for each surviving part:
  //    identifier: `ecfr-title-${titleNumber}-part-${partIdentifier}`
  //    citation: `Title ${titleNumber} CFR Part ${partIdentifier}`
  //    metadata.title_number: titleNumber (integer)
  //    metadata.part_number: partIdentifier (string, as-is from eCFR API)
  //    external_url: `https://www.ecfr.gov/current/title-${titleNumber}/part-${partIdentifier}`
  //    entity_type: 'regulation', document_type: 'CFR_PART', jurisdiction: 'US'
  // 5. trackCost for the API call
  // 6. Return entities + stats (total parts found, parts after filter)
}
```

### Task 2: Main Inngest Pipeline Function
**File:** `inngest/classified-seed.ts`
**Action:** CREATE
**Pattern:** Follow `inngest/corpus-seed.ts` for step structure and source ID lookup

```typescript
// Classified corpus seed — fetches, filters, classifies, and stores
// the complete regulatory baseline.
// Event: 'cedar/corpus.classified-seed'
// Re-runnable: upsert logic on entities + domain assignments.
// Uses PRP-02 classification engine for inline classification.

import { inngest } from './client'
import { createServerClient } from '../lib/db/client'
import { loadClassificationContext, classify } from '../lib/classification/engine'
import type { ClassificationInput, ClassificationResult } from '../lib/classification/types'
import { ingestECFRTitle } from '../lib/corpus/classified-ecfr-ingest'
import { upsertEntities, type KGEntityInsert } from '../lib/corpus/shared'
import { trackCost } from '../lib/cost-tracker'

// The 15 allowlist titles from P1-S2F
const ECFR_TITLES = [2, 10, 16, 20, 21, 26, 28, 29, 32, 38, 40, 42, 45, 47, 49]

export const classifiedSeed = inngest.createFunction(
  {
    id: 'classified-seed',
    name: 'Classified Corpus Seed — Filtered + Classified Regulatory Baseline',
    retries: 1,
    concurrency: { limit: 1 },
    timeouts: { finish: '2h' },  // 15 eCFR titles + FR + openFDA
  },
  { event: 'cedar/corpus.classified-seed' },
  async ({ step, logger, runId }) => {

    // ── Step 1: Load source IDs ─────────────────────────────────────────
    // Look up the eCFR, FR, and openFDA source records.
    // Use the existing eCFR source for all 15 titles.
    const sourceIds = await step.run('load-source-ids', async () => {
      // Query sources table for eCFR, FR, and openFDA sources
      // Return { ecfr: uuid, fr: uuid, openfda: uuid }
    })

    // ── Step 2: Load allowlist as serializable array ────────────────────
    // Can't pass Set between steps — load as array, convert in each step.
    const allowlistArray = await step.run('load-allowlist', async () => {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('cfr_allowlist')
        .select('title_number, part_number')
      if (error) throw new Error(`Allowlist load failed: ${error.message}`)
      return (data ?? []).map(r => `${r.title_number}:${r.part_number}`)
    })

    // ── Step 3-17: eCFR titles (one step per title) ────────────────────
    // Each step: fetch → filter → upsert → classify → write results
    let totalEcfr = 0
    for (const title of ECFR_TITLES) {
      const stats = await step.run(`ecfr-title-${title}`, async () => {
        const allowlist = new Set(allowlistArray)

        // 1. Fetch and filter
        const result = await ingestECFRTitle(title, sourceIds.ecfr, allowlist)

        if (result.entities.length === 0) {
          return { title, ingested: 0, classified: 0, errors: result.errors }
        }

        // 2. Upsert entities to get IDs
        const upsertResult = await upsertEntities(result.entities)

        // 3. Load classification context (fresh per step)
        const context = await loadClassificationContext('federal')

        // 4. Fetch the upserted entities back to get their UUIDs
        const supabase = createServerClient()
        const identifiers = result.entities.map(e => e.identifier)
        const { data: dbEntities } = await supabase
          .from('kg_entities')
          .select('id, name, description, entity_type, document_type, jurisdiction, source_id, metadata, agencies, cfr_references, citation, identifier')
          .in('identifier', identifiers)

        // 5. Classify each entity
        const source = context.sourceMap[sourceIds.ecfr]
        let classifiedCount = 0

        for (const entity of dbEntities ?? []) {
          const input: ClassificationInput = {
            ...entity,
            sourceName: source?.name ?? null,
            sourceJurisdiction: source?.jurisdiction ?? null,
          }

          const classResult = classify(input, context)
          if (classResult.domains.length > 0 || classResult.authority) {
            await writeClassificationResults(supabase, classResult, runId ?? 'classified-seed')
            classifiedCount++
          } else {
            // Log unclassified entity for HITL
            await logUnclassified(supabase, entity.id, runId ?? 'classified-seed')
          }
        }

        return {
          title,
          ingested: upsertResult.upserted,
          classified: classifiedCount,
          errors: [...result.errors, ...upsertResult.errors],
        }
      })

      totalEcfr += stats.ingested
      logger.info(`[classified-seed] eCFR Title ${stats.title}: ${stats.ingested} ingested, ${stats.classified} classified`)
    }

    // ── Step 18: Federal Register ──────────────────────────────────────
    // Reuse existing FR ingest logic but with expanded CFR title filtering.
    // FR documents matching relevant agencies OR relevant CFR titles get ingested.
    // All ingested FR entities get classified inline.
    const frStats = await step.run('ingest-fr', async () => {
      // Use searchFederalRegister with cfrTitles = ECFR_TITLES
      // Paginate by year as the existing ingest does
      // Upsert entities, then classify each one
      // Return stats
    })

    // ── Step 19: openFDA ───────────────────────────────────────────────
    // Ingest from all relevant openFDA endpoints (not just drug/enforcement).
    // Classify all entities via dataset rules.
    const openfdaStats = await step.run('ingest-openfda', async () => {
      // Paginate through each relevant endpoint
      // Upsert entities, then classify each one
      // Return stats
    })

    // ── Step 20: Refresh materialized view ─────────────────────────────
    await step.run('refresh-facets', async () => {
      const supabase = createServerClient()
      const { error } = await supabase.rpc('refresh_corpus_facets')
      if (error) logger.warn(`[classified-seed] Facet refresh: ${error.message}`)
    })

    // ── Step 21: Summary ───────────────────────────────────────────────
    return await step.run('summarize', async () => {
      const summary = {
        ecfr_entities: totalEcfr,
        fr_entities: frStats.ingested,
        openfda_entities: openfdaStats.ingested,
        total_entities: totalEcfr + frStats.ingested + openfdaStats.ingested,
        total_classified: totalEcfr + frStats.classified + openfdaStats.classified,
        // Entities that matched zero rules
        total_unclassified: (totalEcfr + frStats.ingested + openfdaStats.ingested) -
                           (totalEcfr + frStats.classified + openfdaStats.classified),
      }
      logger.info(`[classified-seed] ===== COMPLETE =====`)
      logger.info(`[classified-seed] ${JSON.stringify(summary, null, 2)}`)
      return summary
    })
  }
)

// ── Helper: Write classification results to all three destinations ────────
async function writeClassificationResults(
  supabase: ReturnType<typeof createServerClient>,
  result: ClassificationResult,
  runId: string
): Promise<void> {
  // 1. kg_entity_domains — upsert domain assignments
  //    Follow corpus-classify.ts row shape:
  //    { entity_id, domain_id, relevance_score, confidence, classified_by,
  //      is_primary, assigned_by }
  //    ON CONFLICT (entity_id, domain_id) DO UPDATE

  // 2. kg_classification_log — insert audit trail
  //    { entity_id, domain_id, stage: 'rule', confidence, classified_by,
  //      needs_review: bool, review_reason, run_id }

  // 3. kg_entities — update denormalized columns
  //    { domain_codes: result.domainCodes (JSONB),
  //      classification_stage: 'structural',
  //      authority_level: result.authority?.level,
  //      issuing_agency: inferred from source/agency }
}

// ── Helper: Log unclassified entity for HITL pickup ──────────────────────
async function logUnclassified(
  supabase: ReturnType<typeof createServerClient>,
  entityId: string,
  runId: string
): Promise<void> {
  // Insert into kg_classification_log with needs_review=true
  // review_reason: 'No classification rules matched — requires Stage 2/4 or manual classification'
}
```

### Task 3: Register the New Function
**File:** `app/api/inngest/route.ts`
**Action:** MODIFY

```typescript
// Add import:
import { classifiedSeed } from '../../../inngest/classified-seed'

// Add to functions array:
functions: [
  // ... existing functions ...
  classifiedSeed,
],
```

### Task 4: Build Verification
**File:** (none — CLI command)
**Action:** VERIFY

```bash
npm run build
# Must pass with 0 errors, 0 warnings
```

### Task 5: Trigger and Verify
**Action:** VERIFY

```bash
# 1. Start dev server:
env -u ANTHROPIC_API_KEY npx next dev --port 3000

# 2. Open Inngest dashboard and trigger 'cedar/corpus.classified-seed'

# 3. Monitor logs for each step:
#    - eCFR Title 21: expect ~123 entities (123 allowlist parts)
#    - eCFR Title 42: expect ~77 entities
#    - eCFR Title 29: expect ~54 entities
#    - Other titles: smaller counts per allowlist
#    - FR: expect several thousand documents
#    - openFDA: expect several thousand enforcement reports
#    - Total: 12-18K entities

# 4. Verify in Supabase:
```

```sql
-- Total entity count
SELECT count(*) FROM public.kg_entities;
-- Expected: 12,000–18,000

-- Entities with domain assignments
SELECT count(DISTINCT entity_id) FROM public.kg_entity_domains;
-- Expected: close to total entities (most should classify)

-- Entities with authority levels
SELECT authority_level, count(*) 
FROM public.kg_entities 
WHERE authority_level IS NOT NULL
GROUP BY authority_level;
-- Expected: federal_regulation (eCFR), sub_regulatory_guidance (openFDA), mix for FR

-- Domain distribution (top 10)
SELECT d.name, count(*) as entity_count
FROM public.kg_entity_domains ed
JOIN public.kg_domains d ON d.id = ed.domain_id
GROUP BY d.name
ORDER BY entity_count DESC
LIMIT 10;

-- Unclassified entities (needs review)
SELECT count(*) FROM public.kg_classification_log
WHERE needs_review = true;

-- Classification log entries
SELECT stage, count(*) FROM public.kg_classification_log
GROUP BY stage;
-- Expected: all 'rule'

-- eCFR entities by title
SELECT 
  (metadata->>'title_number')::int as title,
  count(*) as parts
FROM public.kg_entities
WHERE document_type = 'CFR_PART'
GROUP BY title
ORDER BY title;
-- Expected: 15 rows matching allowlist counts
```

## Integration Points
```yaml
DATABASE:
  - READ: sources (source IDs for eCFR, FR, openFDA)
  - READ: cfr_allowlist (407 rows → filtering)
  - READ: classification_rules, kg_domains (via loadClassificationContext)
  - WRITE: kg_entities (upsert ~12-18K entities)
  - WRITE: kg_entity_domains (domain assignments per entity)
  - WRITE: kg_classification_log (audit trail per classification)
  - UPDATE: kg_entities (domain_codes, classification_stage, authority_level)
  - RPC: refresh_corpus_facets (materialized view refresh)

INNGEST:
  - NEW FUNCTION: cedar/corpus.classified-seed
  - REGISTERED: app/api/inngest/route.ts

API ROUTES:
  - None

UI:
  - None (PRP-04 wires Library)

ENV:
  - None (uses existing Supabase + Inngest credentials)
```

## Validation

### Build Check
```bash
npm run build
# Must pass with 0 errors, 0 warnings
```

### Functional Verification
```bash
# See Task 5 for complete verification procedure
# Key checks:
# 1. Trigger the function via Inngest dashboard
# 2. Confirm all 15 eCFR titles processed
# 3. Confirm entity count is 12-18K (not 99K)
# 4. Confirm domain assignments exist for most entities
# 5. Confirm authority levels assigned
# 6. Spot-check: Title 21 Part 1306 entity has cs_prescribing domain + federal_regulation authority
```

## Anti-Patterns
- ❌ Do not create new patterns when existing ones work — follow corpus-seed.ts step structure and corpus-classify.ts write patterns
- ❌ Do not skip validation — fix and retry
- ❌ Do not add scope beyond this PRP — no UI changes, no new API routes
- ❌ Do not modify corpus-seed.ts, corpus-classify.ts, or corpus-authority-classify.ts
- ❌ Do not hardcode domain logic — all classification goes through the PRP-02 engine
- ❌ Do not ingest parts not in the cfr_allowlist — only fetch what's relevant
- ❌ Do not skip cost tracking on API calls — every eCFR, FR, and openFDA call logs to cost_events
- ❌ Do not pass ClassificationContext between Inngest steps — it contains a Set which isn't JSON-serializable. Load fresh per step.
- ❌ Do not forget to update kg_entities denormalized columns (domain_codes, classification_stage, authority_level) after classification
- ❌ Do not ingest all 99K entities — the whole point of this PRP is relevance filtering
