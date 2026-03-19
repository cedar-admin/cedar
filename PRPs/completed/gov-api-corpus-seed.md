name: "Gov API Corpus Seed — Initial Regulatory Baseline"

## Goal

Build and execute an Inngest function (`corpus-seed`) that bulk-ingests the current state of federal regulations from the 3 gov API sources into `kg_entities`. This populates Cedar's regulation library with real regulatory data — the baseline that future change detection runs against.

Sources:
1. **eCFR** — Full text of CFR Title 21 (Food & Drugs) structure: every part, its name, authority, source, and current status
2. **Federal Register** — All FDA + DEA final rules, proposed rules, and notices from the last 5 years (paginated, up to 2000 per query window)
3. **openFDA** — All ongoing drug enforcement actions + device enforcement actions

Approach: Pull wide, store everything in `kg_entities` with full API response in `metadata` JSONB, populate promoted columns where data maps. Classification/enrichment via Claude is a separate future pass.

## Why

- The regulation library is empty — it has placeholder content
- `monitor.ts` detects changes against a baseline, but there IS no baseline yet
- Practice owners need to browse current regulations, not just see change alerts
- This is the foundation the entire product sits on
- MVP scope — required before the product has real value

## Success Criteria

- [ ] eCFR: All Title 21 parts ingested as `kg_entities` with `entity_type = 'regulation'`, each with part number, name, authority, and source citation
- [ ] Federal Register: All FDA + DEA RULE, PROPOSED_RULE, and NOTICE documents from 2021-present ingested as `kg_entities`, each with document_number as `identifier`, title, abstract, publication_date, effective_date, cfr_references, citation, agencies, and pdf_url
- [ ] openFDA: All ongoing drug + device enforcement actions ingested as `kg_entities` with report_number as `identifier`, classification, product_description, and distribution info in metadata
- [ ] Every entity has `source_id` linking to the correct Cedar source
- [ ] No duplicate entities (upsert on `identifier` + `source_id`)
- [ ] `metadata` JSONB contains the FULL API response for each item — nothing dropped
- [ ] Cost events logged for each API call
- [ ] Regulation library page shows real data after ingestion
- [ ] `npm run build` passes with 0 errors, 0 warnings

## Context

### Files to Read First

```yaml
- file: lib/fetchers/gov-apis.ts
  why: Existing API clients — extend these for bulk pulls

- file: lib/knowledge-graph/entities.ts
  why: Existing KG entity CRUD — may need bulk insert helper

- file: lib/cost-tracker.ts
  why: Every API call must be tracked

- file: supabase/migrations/007_kg_foundation.sql
  why: kg_entities schema

- file: supabase/migrations/019_kg_corpus_columns.sql
  why: New columns (publication_date, document_type, pdf_url, etc.)

- file: supabase/migrations/008_ontology_schema.sql
  why: Entity types, domains — need to know what slugs exist for entity_type

- file: inngest/monitor.ts
  why: Pattern for Inngest function structure, step.run() usage

- file: supabase/migrations/004_seed_sources.sql
  why: Source IDs and names — need to map ingested items to correct source_id
```

### Files to Create or Modify

```bash
# New files
lib/corpus/ecfr-ingest.ts              (+) eCFR bulk ingestion logic
lib/corpus/federal-register-ingest.ts  (+) Federal Register bulk ingestion logic
lib/corpus/openfda-ingest.ts           (+) openFDA bulk ingestion logic
lib/corpus/shared.ts                   (+) Shared upsert helper, dedup logic
inngest/corpus-seed.ts                 (+) Inngest function that orchestrates all 3 ingestions

# Modified files
lib/fetchers/gov-apis.ts               (M) Add bulk fetch functions (paginated FR search, eCFR structure endpoint, openFDA pagination)
app/api/inngest/route.ts               (M) Register corpus-seed function
```

### Known Gotchas

```typescript
// 1. FEDERAL REGISTER PAGINATION: Max 2000 results per query. Use date range
//    filters to partition: 2021, 2022, 2023, 2024, 2025, 2026. Each year-slice
//    stays under 2000 for FDA+DEA.

// 2. eCFR STRUCTURE vs FULL TEXT: The eCFR structure endpoint
//    (/api/versioner/v1/structure/YYYY-MM-DD/title-21.json) returns the
//    hierarchy of parts/subparts/sections WITHOUT full text. This is the
//    wide-and-shallow pass. Full text extraction per section is the deep pass.

// 3. OPENFDA 404 = EMPTY: openFDA returns 404 when no results match.
//    Already handled in gov-apis.ts — returns empty results array.

// 4. OPENFDA LIMIT: Max 1000 results per request, max skip of 25000.
//    For larger datasets, use date range partitioning.

// 5. UPSERT LOGIC: Use identifier + source_id as the natural key.
//    ON CONFLICT (identifier, source_id) DO UPDATE to refresh metadata
//    without creating duplicates. This requires a unique index.

// 6. INNGEST STEP PAYLOAD LIMIT: Each step.run() return value must be
//    under ~4MB. Don't return full API responses from steps — process
//    and insert within the step, return only counts/stats.

// 7. COST TRACKING: Gov APIs are free ($0) but still log to cost_events
//    for audit visibility and rate limit tracking.

// 8. NO AI CLASSIFICATION IN THIS PRP: This is pure ingestion. Entity
//    enrichment via Claude (summaries, severity, domain tags) is a
//    separate future pass. Store raw data now, classify later.

// 9. NEW COLUMNS: Migration 019 added publication_date, document_type,
//    pdf_url, comment_close_date, agencies, cfr_references, citation.
//    Populate these from structured API responses. Anything that doesn't
//    map to a column goes in metadata JSONB.

// 10. UNIQUE INDEX NEEDED: kg_entities needs a unique index on
//     (identifier, source_id) for upsert logic. Add in this session
//     if it doesn't exist.
```

## Tasks (execute in order)

### Task 1: Add unique index for upsert dedup

**File:** `supabase/migrations/020_kg_entity_upsert_index.sql`
**Action:** CREATE

```sql
-- Unique index for corpus upsert: same identifier from same source = same entity
CREATE UNIQUE INDEX IF NOT EXISTS idx_kg_entities_identifier_source
  ON kg_entities(identifier, source_id)
  WHERE identifier IS NOT NULL AND source_id IS NOT NULL;
```

Apply to production Supabase and regenerate types.

### Task 2: Add bulk fetch functions to gov-apis.ts

**File:** `lib/fetchers/gov-apis.ts`
**Action:** MODIFY

Add three new functions:

```typescript
// 1. eCFR structure — returns hierarchy of title 21 (parts, subparts, sections)
export async function fetchECFRStructure(titleNumber: number): Promise<string>
// GET https://www.ecfr.gov/api/versioner/v1/structure/{today}/title-{titleNumber}.json

// 2. Federal Register bulk search — paginated, with date range
export async function searchFederalRegister(params: {
  agencies: string[]
  types: string[]          // ['RULE', 'PROPOSED_RULE', 'NOTICE']
  dateGte: string          // YYYY-MM-DD
  dateLte: string          // YYYY-MM-DD
  perPage?: number         // max 1000
  page?: number            // pagination
  fields: string[]         // all available fields
}): Promise<string>

// 3. openFDA paginated fetch — handles skip-based pagination
export async function fetchOpenFDAPaginated(params: {
  endpoint: string         // 'drug/enforcement', 'device/enforcement'
  search?: string
  limit?: number           // max 1000
  skip?: number
}): Promise<string>
```

### Task 3: Create shared upsert helper

**File:** `lib/corpus/shared.ts`
**Action:** CREATE

```typescript
// Bulk upsert kg_entities with dedup on identifier + source_id
// Returns { inserted: number, updated: number, errors: string[] }
export async function upsertEntities(entities: KGEntityInsert[]): Promise<UpsertResult>

// KGEntityInsert matches kg_entities columns including new migration 019 fields
export interface KGEntityInsert {
  name: string
  description?: string
  entity_type: string
  jurisdiction: string
  status?: string
  identifier: string        // dedup key
  effective_date?: string
  source_id: string
  change_id?: string
  external_url?: string
  metadata: Record<string, unknown>  // FULL API response goes here
  // Migration 019 columns
  publication_date?: string
  document_type?: string
  pdf_url?: string
  comment_close_date?: string
  agencies?: unknown[]
  cfr_references?: unknown[]
  citation?: string
}
```

### Task 4: eCFR ingestion module

**File:** `lib/corpus/ecfr-ingest.ts`
**Action:** CREATE

```typescript
// Fetch eCFR Title 21 structure, parse into parts, upsert each part as a kg_entity
// Each part becomes one entity:
//   entity_type: 'regulation'
//   identifier: 'ecfr-title-21-part-{number}'
//   name: part name from structure API
//   jurisdiction: 'US'
//   status: 'active'
//   document_type: 'CFR_PART'
//   citation: 'Title 21 CFR Part {number}'
//   external_url: 'https://www.ecfr.gov/current/title-21/part-{number}'
//   metadata: full structure response for this part (subparts, sections, authority, source)
//
// Returns stats: { parts_ingested: number, errors: string[] }
```

### Task 5: Federal Register ingestion module

**File:** `lib/corpus/federal-register-ingest.ts`
**Action:** CREATE

```typescript
// Paginate through Federal Register API for FDA + DEA documents, 2021-present
// Partition by year to stay under 2000 result limit per query
// Each document becomes one entity:
//   entity_type: 'regulation' (RULE), 'proposed_rule' (PROPOSED_RULE), 'notice' (NOTICE)
//   identifier: document_number
//   name: title
//   description: abstract
//   jurisdiction: 'US'
//   status: map from type (RULE → 'active', PROPOSED_RULE → 'proposed', NOTICE → 'active')
//   publication_date: publication_date
//   effective_date: effective_on
//   document_type: type (RULE, PROPOSED_RULE, NOTICE)
//   citation: citation field from API
//   pdf_url: pdf_url
//   external_url: html_url
//   comment_close_date: comments_close_on
//   agencies: agencies array
//   cfr_references: cfr_references array
//   metadata: FULL API response for this document
//
// Agencies to pull: food-and-drug-administration, drug-enforcement-administration,
//   federal-trade-commission, health-and-human-services-department,
//   centers-for-medicare-medicaid-services
//
// Fields to request (all available):
//   abstract, action, agencies, cfr_references, citation, comments_close_on,
//   correction_of, dates, docket_ids, document_number, effective_on,
//   html_url, pdf_url, publication_date, regulation_id_numbers,
//   regulation_id_number_info, significant, title, topics, type
//
// Returns stats: { documents_ingested: number, by_type: Record<string, number>, errors: string[] }
```

### Task 6: openFDA ingestion module

**File:** `lib/corpus/openfda-ingest.ts`
**Action:** CREATE

```typescript
// Paginate through openFDA drug/enforcement and device/enforcement
// Each enforcement action becomes one entity:
//   entity_type: 'enforcement_action'
//   identifier: report_number (drug) or res_event_number (device)
//   name: product_description (truncated to 200 chars)
//   description: reason_for_recall
//   jurisdiction: 'US' (or 'FL' if distribution_pattern mentions Florida)
//   status: map from status field
//   publication_date: report_date or event_date_initiated
//   document_type: 'DRUG_ENFORCEMENT' or 'DEVICE_ENFORCEMENT'
//   external_url: null (no direct URL for individual enforcement records)
//   metadata: FULL API response for this record (includes classification,
//     distribution_pattern, recalling_firm, voluntary_mandated, etc.)
//
// Returns stats: { actions_ingested: number, by_endpoint: Record<string, number>, errors: string[] }
```

### Task 7: Inngest corpus-seed orchestrator

**File:** `inngest/corpus-seed.ts`
**Action:** CREATE

```typescript
// Single Inngest function triggered by event 'cedar/corpus.seed'
// Runs each ingestion as a separate step.run() for observability and retry:
//   Step 1: Look up source IDs from sources table
//   Step 2: Run eCFR ingestion → return stats
//   Step 3: Run Federal Register ingestion (year by year) → return stats
//   Step 4: Run openFDA drug enforcement → return stats
//   Step 5: Run openFDA device enforcement → return stats
//   Step 6: Log total stats to console and return summary
//
// Configuration:
//   id: 'corpus-seed'
//   retries: 1
//   concurrency: { limit: 1 }  // only one corpus seed at a time
```

### Task 8: Register corpus-seed in Inngest route

**File:** `app/api/inngest/route.ts`
**Action:** MODIFY

Add import and registration:
```typescript
import { corpusSeed } from '../../../inngest/corpus-seed'
// Add to functions array:
functions: [
  // ... existing functions
  corpusSeed,
]
```

### Task 9: Add corpus seed trigger to System Health page

**Action:** MODIFY the admin System Health page

Add a "Seed Corpus" button that sends the `cedar/corpus.seed` event. This is a one-time operation but should be re-runnable (upsert logic handles dedup).

### Task 10: Execute the corpus seed

**Action:** Trigger `cedar/corpus.seed` from System Health page or Inngest dashboard.

Monitor execution in Inngest Cloud. Verify results in Supabase and the regulation library page.

## Integration Points

```yaml
DATABASE:
  - Migration 020: unique index on kg_entities(identifier, source_id)
  - kg_entities bulk inserts (hundreds of rows)
  - cost_events logged per API call

INNGEST:
  - New function: corpus-seed (cedar/corpus.seed event)
  - Register in /api/inngest route

API ROUTES:
  - /api/inngest — register new function (no new routes needed)

UI:
  - System Health page: add "Seed Corpus" button
  - Regulation library page should display ingested entities automatically (already queries kg_entities)

ENV:
  - No new environment variables needed — gov APIs are free, no auth
```

## Validation

### Build Check

```bash
npm run build
# Must pass with 0 errors, 0 warnings
```

### Functional Verification

```
1. Trigger corpus-seed from System Health or Inngest dashboard
2. Monitor Inngest execution — all steps should complete
3. Check regulation library page — should show real regulations
4. Verify entity counts in Supabase (see queries below)
```

### Database Verification

```sql
-- Entity counts by source
SELECT s.name, COUNT(e.id) as entities
FROM kg_entities e
JOIN sources s ON s.id = e.source_id
GROUP BY s.name
ORDER BY entities DESC;

-- Entity counts by type
SELECT entity_type, document_type, COUNT(*) as count
FROM kg_entities
GROUP BY entity_type, document_type
ORDER BY count DESC;

-- Verify no duplicates
SELECT identifier, source_id, COUNT(*) as dupes
FROM kg_entities
WHERE identifier IS NOT NULL
GROUP BY identifier, source_id
HAVING COUNT(*) > 1;

-- Verify metadata is populated (not null)
SELECT COUNT(*) as total,
       COUNT(metadata) as has_metadata,
       COUNT(publication_date) as has_pub_date,
       COUNT(citation) as has_citation
FROM kg_entities;

-- Cost events from corpus seed
SELECT service, operation, COUNT(*) as calls, SUM(cost_usd) as total_cost
FROM cost_events
WHERE operation LIKE 'corpus%' OR operation LIKE 'bulk%'
GROUP BY service, operation;

-- Sample entities
SELECT name, entity_type, document_type, identifier, citation, publication_date, jurisdiction
FROM kg_entities
ORDER BY publication_date DESC NULLS LAST
LIMIT 20;
```

## Anti-Patterns

- ❌ Do not run Claude classification during ingestion — this PRP is pure data collection
- ❌ Do not skip storing the full API response in metadata — nothing should be dropped
- ❌ Do not return large payloads from Inngest step.run() — process and insert within the step, return only counts
- ❌ Do not modify existing monitor.ts or intelligence pipeline — corpus seed is additive
- ❌ Do not hardcode source IDs — look them up by name from the sources table
- ❌ Do not skip cost tracking even though gov APIs are free — log at $0 for audit visibility
- ❌ Do not create entities without identifier — every entity needs a dedup key
- ❌ Do not paginate past API limits (FR: 2000 results, openFDA: 25000 skip) — use date partitioning
- ❌ Do not modify migration files already applied — add new migrations only
