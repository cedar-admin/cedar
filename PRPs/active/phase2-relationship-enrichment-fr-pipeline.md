name: "Phase 2 — Relationship Enrichment & Daily Federal Register Pipeline"

## Goal

Enrich kg_relationships with typed relationships, temporal bounds, and provenance; extend kg_entity_versions with content hashing for diff-based versioning; build two automated Inngest pipelines — a daily Federal Register poller and a daily eCFR change detector — that ingest new federal regulatory documents and link them to the existing 98,777-entity corpus; and implement cascade detection so downstream entities are flagged when their dependencies change.

At the end of this phase, Cedar ingests new federal regulations daily and links them to the corpus automatically without manual intervention.

## Why

- The corpus has 98,777 entities but zero relationship-type metadata. Typed relationships (amends, corrects, implements) are what make the knowledge graph useful for compliance monitoring.
- The Federal Register publishes new rules daily (6 AM ET). Without a polling pipeline, the corpus goes stale the day after seeding.
- eCFR sections change within 2 days of FR publication. Content hashing ensures Cedar detects actual text changes, not just publication events.
- Cascade detection is the mechanism that flags downstream regulations when an upstream document changes — critical for avoiding false negatives in the compliance feed.
- This is Phase 2 of 5 from `docs/architecture/data-architecture-research.md`.

## Success Criteria

- [ ] Migration 025 applies cleanly: `relationship_type_enum` Postgres type created; `effective_date`, `end_date`, `provenance`, `fr_citation` added to `kg_relationships`; composite indexes created
- [ ] Migration 025 applies cleanly: `version_date`, `content_hash`, `content_snapshot`, `fr_document_number`, `change_summary` added to `kg_entity_versions`; new UNIQUE constraint + index
- [ ] Migration 026 applies cleanly: `fr_last_poll_date` and `ecfr_last_checked_date` keys exist in `system_config`
- [ ] `cedar/corpus.fr-daily-poll` can be triggered from Inngest dashboard and runs without error
- [ ] After FR poll runs, new kg_entities with `entity_type='regulation'` and `document_type='RULE'` exist for documents published since the last poll date
- [ ] After FR poll runs, `kg_relationships` rows exist with `provenance='api_cfr_references'` and the `relationship_type` enum value `amends`
- [ ] `cedar/corpus.ecfr-daily-check` can be triggered from Inngest dashboard and runs without error
- [ ] After eCFR check runs for a changed title, new `kg_entity_versions` rows exist with `content_hash` and `version_date` populated
- [ ] `detectCascades()` returns entity IDs for downstream entities and writes `kg_classification_log` rows with `needs_review=true`
- [ ] `npm run build` passes with 0 errors, 0 warnings
- [ ] `npx supabase gen types typescript` regenerated after migrations

## Context

### Files to Read First

```yaml
- migration: supabase/migrations/007_kg_foundation.sql
  why: Defines current kg_relationships columns (relationship_type TEXT, confidence, notes, source_change_id) and kg_entity_versions columns (version_number, snapshot JSONB). Migration 025 must only ADD missing columns — never drop or rename existing ones.

- migration: supabase/migrations/008_ontology_schema.sql
  why: Defines kg_relationship_types reference table (slug, forward_label, inverse_label). The new relationship_type_enum column is a Postgres enum, separate from the FK to this table. Both coexist.

- migration: supabase/migrations/019_kg_corpus_columns.sql
  why: Defines cfr_references JSONB column on kg_entities — used to match FR documents to CFR entities.

- migration: supabase/migrations/022_taxonomy_schema.sql
  why: Defines kg_classification_log table (entity_id, domain_id, stage, confidence, needs_review, run_id). Cascade detection writes here.

- migration: supabase/migrations/002_config_tables.sql
  why: Defines system_config (key TEXT UNIQUE, value TEXT). Pipeline state (last poll date) is stored here.

- file: lib/corpus/shared.ts
  why: upsertEntities() and KGEntityInsert interface — reuse for inserting new FR documents.

- file: lib/corpus/federal-register-ingest.ts
  why: Existing pattern for fetching FR API with searchFederalRegister(). Daily poll is a trimmed version of this, not a full rewrite.

- file: lib/corpus/ecfr-ingest.ts
  why: Existing eCFR ingestion pattern — understand ECFRNode types and extractParts().

- file: lib/fetchers/gov-apis.ts
  why: fetchECFRVersions(), fetchECFRStructure(), fetchECFRPart(), searchFederalRegister() all already exist. Need to ADD: (1) CFR title filter support to searchFederalRegister, (2) exported fetchECFRTitles() for the titles endpoint. Do not modify existing function signatures.

- file: inngest/corpus-classify.ts
  why: Pattern for Inngest function structure — step.run(), logger, createServerClient(), retries, concurrency, timeouts, batching.

- file: inngest/corpus-seed.ts
  why: Pattern for multi-step Inngest pipeline with step.run() and source ID lookup by name.

- file: app/api/inngest/route.ts
  why: Where new Inngest functions must be registered in the serve() call.

- file: lib/cost-tracker.ts
  why: trackCost() must be called after every external API call. Use service: 'gov_api', cost_usd: 0 for FR and eCFR (free APIs).
```

### Current File Tree (relevant subset)

```bash
supabase/migrations/
  007_kg_foundation.sql         # kg_relationships, kg_entity_versions base schemas
  008_ontology_schema.sql       # kg_relationship_types reference table
  022_taxonomy_schema.sql       # kg_classification_log
  023_search_indexes.sql        # search vector, GIN indexes
  024_taxonomy_seed.sql         # domain/practice_type seeds
  025_*.sql                     # TO CREATE — relationship enrichment schema
  026_*.sql                     # TO CREATE — system_config pipeline keys seed

inngest/
  client.ts
  corpus-seed.ts                # Pattern to follow
  corpus-classify.ts            # Pattern to follow
  fr-daily-poll.ts              # TO CREATE
  ecfr-daily-check.ts           # TO CREATE

lib/corpus/
  shared.ts                     # upsertEntities(), KGEntityInsert
  federal-register-ingest.ts    # fetchYear() pattern
  ecfr-ingest.ts                # ECFRNode types
  relationship-linker.ts        # TO CREATE
  cascade-detect.ts             # TO CREATE

lib/fetchers/
  gov-apis.ts                   # fetchECFRVersions, fetchECFRStructure, searchFederalRegister

app/api/inngest/route.ts        # MODIFY — register new functions
lib/db/types.ts                 # REGENERATE after migrations
```

### Files to Create or Modify

```bash
supabase/migrations/025_phase2_schema.sql           (+) Relationship enrichment + entity versioning columns
supabase/migrations/026_phase2_config_seed.sql      (+) system_config pipeline state keys
lib/fetchers/gov-apis.ts                            (M) Add CFR title filter + export fetchECFRTitles()
lib/corpus/relationship-linker.ts                   (+) createRelationships() utility
lib/corpus/cascade-detect.ts                        (+) detectCascades() utility
inngest/fr-daily-poll.ts                            (+) Daily FR polling Inngest function
inngest/ecfr-daily-check.ts                         (+) Daily eCFR change detection function
app/api/inngest/route.ts                            (M) Register frDailyPoll + ecfrDailyCheck
lib/db/types.ts                                     (M) Regenerate after migrations
```

### Known Gotchas

```typescript
// 1. kg_relationships already has a unique index on (source_entity_id, target_entity_id, relationship_type).
//    The new relationship_type_enum column is ADDITIONAL — the TEXT column stays. Both coexist.
//    When inserting new rows via the pipeline, set BOTH relationship_type (TEXT) and
//    relationship_type_enum (enum) to keep them in sync.

// 2. kg_entity_versions already has UNIQUE(entity_id, version_number).
//    Migration 025 adds UNIQUE(entity_id, version_date) as a SEPARATE constraint.
//    version_date can be NULL on old rows (pre-Phase 2) — add constraint as DEFERRABLE or use
//    CREATE UNIQUE INDEX ... WHERE version_date IS NOT NULL to avoid conflicts with legacy rows.

// 3. Federal Register API: No auth required.
//    URL: https://www.federalregister.gov/api/v1/documents
//    CFR title filter: conditions[cfr][title][]=21 (append multiple for 21, 29, 42, 45)
//    The existing searchFederalRegister() filters by agencies. For the daily poll, filter by CFR title
//    instead of agencies — this is a broader net and catches all agencies amending those titles.

// 4. eCFR versioner API: No auth required.
//    Titles endpoint: https://www.ecfr.gov/api/versioner/v1/titles.json
//    Returns array of { number, up_to_date_as_of, latest_amended_on } per title.
//    The versioner lags 1-3 days — always use up_to_date_as_of, never today's date.
//    Structure endpoint: /api/versioner/v1/structure/{date}/title-{number}.json
//    Content endpoint: /api/versioner/v1/full/{date}/title-{number}.json?part={part}

// 5. SHA-256 hashing in Node/Next.js:
//    import { createHash } from 'crypto'
//    const hash = createHash('sha256').update(text).digest('hex')

// 6. system_config pipeline state:
//    Read: supabase.from('system_config').select('value').eq('key', 'fr_last_poll_date').single()
//    Write: supabase.from('system_config').update({ value: date }).eq('key', 'fr_last_poll_date')
//    Always UPDATE (never INSERT) since seeds create the rows in migration 026.

// 7. CFR entity matching for relationship creation:
//    FR documents have cfr_references: [{ title: 21, part: 216, chapter: null, section: null }]
//    Match to kg_entities where cfr_references @> '[{"title": 21, "part": 216}]'::jsonb
//    (JSONB containment operator @>). Use service role client — not anon.
//    Batch the lookups: one query per CFR title (e.g., all parts for title 21 in one jsonb query).

// 8. Relationship upsert strategy:
//    The unique index on kg_relationships is (source_entity_id, target_entity_id, relationship_type).
//    Use INSERT ... ON CONFLICT (source_entity_id, target_entity_id, relationship_type) DO UPDATE
//    SET effective_date = EXCLUDED.effective_date, provenance = EXCLUDED.provenance, fr_citation = EXCLUDED.fr_citation

// 9. Inngest cron timezone:
//    Inngest cron '0 12 * * 1-5' = 12:00 UTC = 7:00 AM ET (EST) = 8:00 AM ET (EDT).
//    Use '0 12 * * 1-5' as the cron expression. This covers weekdays only.

// 10. Cost tracking for gov APIs:
//     Always call trackCost() after each API request even though cost_usd: 0.
//     This creates audit visibility for rate limit tracking.

// 11. Cascade detection CTE depth limit:
//     Cap recursive traversal at depth 5 to prevent runaway queries on dense subgraphs.
//     Relationship types that propagate: 'cites', 'implements', 'interprets'.
//     Types that do NOT propagate: 'amends', 'corrects', 'related_to' (too noisy).
```

---

## Tasks (execute in order)

### Task 1: Migration 025 — Relationship Enrichment + Entity Version Content Hashing
**File:** `supabase/migrations/025_phase2_schema.sql`
**Action:** CREATE

```sql
-- ============================================================================
-- Cedar Migration 025: Phase 2 Schema — Relationship Enrichment + Versioning
-- Based on: docs/architecture/data-architecture-research.md (Phase 2)
-- ============================================================================

-- ── 1. Relationship type enum ──────────────────────────────────────────────
-- NOTE: kg_relationships already has relationship_type TEXT column (migration 007).
-- This enum is a NEW column alongside it — old TEXT column stays for backwards compat.
-- When new rows are inserted, set BOTH columns in sync.

DO $$ BEGIN
  CREATE TYPE relationship_type_enum AS ENUM (
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
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 2. Extend kg_relationships ─────────────────────────────────────────────
-- Existing columns: relationship_type TEXT, confidence DECIMAL(3,2), notes TEXT, source_change_id

ALTER TABLE kg_relationships
  ADD COLUMN IF NOT EXISTS rel_type         relationship_type_enum,
  ADD COLUMN IF NOT EXISTS effective_date   DATE,
  ADD COLUMN IF NOT EXISTS end_date         DATE,
  ADD COLUMN IF NOT EXISTS provenance       TEXT,
    -- 'api_cfr_references' | 'api_correction_of' | 'nlp_extracted' | 'manual'
  ADD COLUMN IF NOT EXISTS fr_citation      TEXT;
    -- e.g. '89 FR 1433'

-- Composite indexes for efficient relationship traversal by type
CREATE INDEX IF NOT EXISTS idx_relationships_source_type
  ON kg_relationships(source_entity_id, relationship_type);

CREATE INDEX IF NOT EXISTS idx_relationships_target_type
  ON kg_relationships(target_entity_id, relationship_type);

-- ── 3. Extend kg_entity_versions with content-hash versioning ─────────────
-- Existing columns: version_number INTEGER, snapshot JSONB, change_id
-- Phase 2 adds content-hash based versioning (FRBR Expression model).
-- version_date can be NULL on pre-Phase-2 rows (version_number scheme).

ALTER TABLE kg_entity_versions
  ADD COLUMN IF NOT EXISTS version_date         DATE,
  ADD COLUMN IF NOT EXISTS content_hash         TEXT,    -- SHA-256 of content_snapshot
  ADD COLUMN IF NOT EXISTS content_snapshot     TEXT,    -- full regulation text at this point
  ADD COLUMN IF NOT EXISTS fr_document_number   TEXT,    -- FR doc that triggered this version
  ADD COLUMN IF NOT EXISTS change_summary       TEXT;    -- AI-generated summary of what changed

-- Unique constraint on (entity_id, version_date) for content-hash versioning.
-- WHERE version_date IS NOT NULL avoids conflict with legacy rows (version_number scheme).
CREATE UNIQUE INDEX IF NOT EXISTS idx_kg_entity_versions_date_unique
  ON kg_entity_versions(entity_id, version_date)
  WHERE version_date IS NOT NULL;

-- Fast lookup for "most recent version of entity"
CREATE INDEX IF NOT EXISTS idx_kg_entity_versions_date_desc
  ON kg_entity_versions(entity_id, version_date DESC)
  WHERE version_date IS NOT NULL;
```

**Acceptance criteria:**
- `psql` can SELECT `rel_type::text` from `kg_relationships` without error
- `psql` can SELECT `content_hash` from `kg_entity_versions` without error
- Migration is idempotent (IF NOT EXISTS / DO NOTHING everywhere)

---

### Task 2: Migration 026 — Seed Pipeline State Keys in system_config
**File:** `supabase/migrations/026_phase2_config_seed.sql`
**Action:** CREATE

```sql
-- ============================================================================
-- Cedar Migration 026: Phase 2 System Config — Pipeline State Keys
-- ============================================================================

-- fr_last_poll_date: date of the last successful Federal Register daily poll.
-- Initialized to 2 days ago. After first run, the pipeline updates this to today.
-- Pipeline reads this and fetches FR documents published since this date.

INSERT INTO system_config (key, value, description) VALUES
  ('fr_last_poll_date',
   to_char(now() - interval '2 days', 'YYYY-MM-DD'),
   'Last successful Federal Register daily poll date (YYYY-MM-DD). Updated by fr-daily-poll after each run.'),
  ('ecfr_last_checked_date',
   to_char(now() - interval '3 days', 'YYYY-MM-DD'),
   'Last date eCFR titles were checked for amendments (YYYY-MM-DD). Updated by ecfr-daily-check after each run.')
ON CONFLICT (key) DO NOTHING;
```

**Acceptance criteria:**
- `SELECT * FROM system_config WHERE key IN ('fr_last_poll_date', 'ecfr_last_checked_date')` returns 2 rows
- Values are valid YYYY-MM-DD date strings

---

### Task 3: Extend lib/fetchers/gov-apis.ts with CFR title filter and eCFR titles export
**File:** `lib/fetchers/gov-apis.ts`
**Action:** MODIFY

Add two things to this file:

**3a. Export `fetchECFRTitles()`** — expose the private `getECFRLatestDate()` logic as a public function that returns the full titles metadata for downstream use:

```typescript
// After the existing fetchECFRStructure export, add:

export interface ECFRTitleInfo {
  number:              number
  name:                string
  latest_amended_on:   string   // YYYY-MM-DD — last actual text amendment
  up_to_date_as_of:   string   // YYYY-MM-DD — safe date for content fetch
}

/**
 * Fetch all eCFR titles metadata including latest_amended_on.
 * Used by ecfr-daily-check to determine which titles changed since last poll.
 * Endpoint: https://www.ecfr.gov/api/versioner/v1/titles.json
 */
export async function fetchECFRTitles(): Promise<ECFRTitleInfo[]> {
  const res = await fetchWithTimeout('https://www.ecfr.gov/api/versioner/v1/titles.json')
  if (!res.ok) throw new Error(`eCFR titles error: ${res.status} ${res.statusText}`)
  const data = await res.json() as { titles: ECFRTitleInfo[] }
  return data.titles ?? []
}
```

**3b. Extend `FederalRegisterSearchParams`** to support CFR title filtering (for the daily poll). Add an optional `cfrTitles` field and use it to append `conditions[cfr][title][]=N` params:

```typescript
// In the existing FederalRegisterSearchParams interface, add:
  cfrTitles?: number[]  // e.g. [21, 29, 42, 45] — filters by CFR title

// In the existing searchFederalRegister() function, after the types loop, add:
  if (params.cfrTitles?.length) {
    params.cfrTitles.forEach(t =>
      url.searchParams.append('conditions[cfr][title][]', String(t))
    )
  }
```

**Acceptance criteria:**
- `fetchECFRTitles()` is exported
- `FederalRegisterSearchParams.cfrTitles` is optional and backward-compatible
- No existing function signatures changed

---

### Task 4: Create lib/corpus/relationship-linker.ts
**File:** `lib/corpus/relationship-linker.ts`
**Action:** CREATE

This utility creates `kg_relationships` between two entities. Called by both the FR daily poll and eCFR check pipelines.

```typescript
import { createServerClient } from '../db/client'

export interface RelationshipRow {
  source_entity_id:  string
  target_entity_id:  string
  relationship_type: string   // TEXT column — always set
  rel_type:          string   // matches relationship_type_enum values
  effective_date?:   string   // YYYY-MM-DD
  provenance:        string   // 'api_cfr_references' | 'api_correction_of' | 'nlp_extracted' | 'manual'
  fr_citation?:      string   // e.g. '89 FR 12345'
  confidence?:       number   // 0–1, default 1.0 for API-extracted
}

export interface LinkResult {
  linked: number
  errors: string[]
}

/**
 * Bulk upsert relationships. Idempotent via ON CONFLICT DO UPDATE.
 * The unique constraint is (source_entity_id, target_entity_id, relationship_type).
 */
export async function createRelationships(rows: RelationshipRow[]): Promise<LinkResult> {
  if (rows.length === 0) return { linked: 0, errors: [] }
  const supabase = createServerClient()
  const errors: string[] = []
  let linked = 0

  // Batch in groups of 200
  const BATCH = 200
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { data, error } = await supabase
      .from('kg_relationships')
      .upsert(
        batch.map(r => ({
          source_entity_id:  r.source_entity_id,
          target_entity_id:  r.target_entity_id,
          relationship_type: r.relationship_type,   // TEXT column
          rel_type:          r.rel_type,            // enum column
          effective_date:    r.effective_date ?? null,
          provenance:        r.provenance,
          fr_citation:       r.fr_citation ?? null,
          confidence:        r.confidence ?? 1.0,
        })),
        { onConflict: 'source_entity_id,target_entity_id,relationship_type' }
      )
      .select('id')

    if (error) {
      errors.push(`Batch ${i}: ${error.message}`)
    } else {
      linked += data?.length ?? batch.length
    }
  }

  return { linked, errors }
}

/**
 * Find kg_entity IDs that match a list of CFR references.
 * Used to find the target entities for "amends" relationships.
 *
 * @param cfrRefs Array of {title, part} objects from FR API cfr_references field
 * @returns Map from "title:part" string to entity ID
 */
export async function matchCFREntitiesToRefs(
  cfrRefs: Array<{ title: number; part: number }>
): Promise<Map<string, string>> {
  if (cfrRefs.length === 0) return new Map()
  const supabase = createServerClient()
  const result = new Map<string, string>()

  // Group by title for efficient JSONB containment queries
  const byTitle = new Map<number, number[]>()
  for (const ref of cfrRefs) {
    const parts = byTitle.get(ref.title) ?? []
    parts.push(ref.part)
    byTitle.set(ref.title, parts)
  }

  for (const [title, parts] of byTitle.entries()) {
    // Build a query that matches any entity whose cfr_references contains title=N
    // We then filter by part in JS to avoid complex JSONB queries
    const { data, error } = await supabase
      .from('kg_entities')
      .select('id, cfr_references')
      .contains('cfr_references', JSON.stringify([{ title }]))  // JSONB containment
      .limit(500)

    if (error || !data) continue

    for (const entity of data) {
      const refs = entity.cfr_references as Array<{ title: number; part: number }> | null
      if (!refs) continue
      for (const ref of refs) {
        if (ref.title === title && parts.includes(ref.part)) {
          result.set(`${title}:${ref.part}`, entity.id)
        }
      }
    }
  }

  return result
}
```

**Acceptance criteria:**
- `createRelationships([])` returns `{ linked: 0, errors: [] }` without hitting DB
- Supabase upsert uses `onConflict: 'source_entity_id,target_entity_id,relationship_type'`

---

### Task 5: Create lib/corpus/cascade-detect.ts
**File:** `lib/corpus/cascade-detect.ts`
**Action:** CREATE

```typescript
import { createServerClient } from '../db/client'

/**
 * Find all entities that transitively cite, implement, or interpret a changed entity.
 * Uses recursive CTE with depth limit 5 to prevent runaway traversal.
 *
 * Writes flagged entities to kg_classification_log with needs_review=true.
 * Only propagates through 'cites', 'implements', 'interprets' relationship types.
 *
 * @param entityId  The entity that changed
 * @param runId     Inngest run ID for tracing
 * @returns         Array of downstream entity IDs flagged for re-evaluation
 */
export async function detectCascades(entityId: string, runId: string): Promise<string[]> {
  const supabase = createServerClient()

  // Recursive CTE: finds all entities where this entity is a dependency
  // We use raw SQL via rpc or supabase.rpc — but since we don't have a stored function,
  // use supabase's query builder with a manual approach instead:
  // Strategy: do up to 5 hops iteratively (simpler than raw SQL RPC for now)

  const PROPAGATION_TYPES = ['cites', 'implements', 'interprets']
  const visited = new Set<string>([entityId])
  const cascade: string[] = []
  let frontier = [entityId]

  for (let depth = 0; depth < 5 && frontier.length > 0; depth++) {
    const { data, error } = await supabase
      .from('kg_relationships')
      .select('source_entity_id')
      .in('target_entity_id', frontier)
      .in('relationship_type', PROPAGATION_TYPES)

    if (error || !data) break

    const next: string[] = []
    for (const row of data) {
      if (!visited.has(row.source_entity_id)) {
        visited.add(row.source_entity_id)
        cascade.push(row.source_entity_id)
        next.push(row.source_entity_id)
      }
    }
    frontier = next
  }

  // Write cascade candidates to kg_classification_log
  if (cascade.length > 0) {
    const logRows = cascade.map(id => ({
      entity_id:      id,
      stage:          'rule' as const,
      confidence:     null,
      classified_by:  `cascade:${entityId}`,
      needs_review:   true,
      review_reason:  `Downstream dependency of changed entity ${entityId}`,
      run_id:         runId,
    }))

    // Insert in batches of 200
    const BATCH = 200
    for (let i = 0; i < logRows.length; i += BATCH) {
      await supabase
        .from('kg_classification_log')
        .insert(logRows.slice(i, i + BATCH))
    }
  }

  return cascade
}
```

**Acceptance criteria:**
- Returns empty array when entity has no downstream relationships
- Does not include the input entityId in the returned cascade array
- Writes to `kg_classification_log` with `needs_review=true` for all cascade candidates

---

### Task 6: Create inngest/fr-daily-poll.ts
**File:** `inngest/fr-daily-poll.ts`
**Action:** CREATE

Pattern: Mirror `inngest/corpus-seed.ts` structure (step.run(), logger, createServerClient(), trackCost()).

```typescript
// Daily Federal Register poll — ingests new RULE/PROPOSED_RULE documents and links
// them to existing CFR entities via 'amends' and 'corrects' relationships.
// Cron: 7:00 AM ET on business days (12:00 UTC, Mon–Fri)
// Event: 'cedar/corpus.fr-daily-poll' (also triggerable manually from Inngest dashboard)

import { inngest } from './client'
import { createServerClient } from '../lib/db/client'
import { searchFederalRegister } from '../lib/fetchers/gov-apis'
import { trackCost } from '../lib/cost-tracker'
import { upsertEntities, type KGEntityInsert } from '../lib/corpus/shared'
import { createRelationships, matchCFREntitiesToRefs } from '../lib/corpus/relationship-linker'

// CFR titles covering healthcare, pharma, DEA, labor (OSHA), social services (HHS/CMS)
const CFR_TITLES = [21, 29, 42, 45]
const FR_TYPES   = ['RULE', 'PROPOSED_RULE']
const PER_PAGE   = 1000

const FR_SOURCE_NAME = 'FDA Federal Register'

// FR API fields needed for entity creation + relationship linking
const FIELDS = [
  'document_number', 'title', 'abstract', 'type', 'publication_date',
  'effective_on', 'html_url', 'pdf_url', 'citation', 'comments_close_on',
  'agencies', 'cfr_references', 'correction_of', 'docket_ids',
  'regulation_id_numbers', 'significant',
]

const TYPE_TO_ENTITY: Record<string, string> = {
  'Rule': 'regulation', 'RULE': 'regulation',
  'Proposed Rule': 'proposed_rule', 'PROPOSED_RULE': 'proposed_rule',
}
const TYPE_TO_STATUS: Record<string, string> = {
  'Rule': 'active', 'RULE': 'active',
  'Proposed Rule': 'proposed', 'PROPOSED_RULE': 'proposed',
}

export const frDailyPoll = inngest.createFunction(
  {
    id: 'fr-daily-poll',
    name: 'FR Daily Poll — Federal Register New Documents',
    retries: 2,
    concurrency: { limit: 1 },
    timeouts: { finish: '30m' },
  },
  [
    { event: 'cedar/corpus.fr-daily-poll' },
    { cron: '0 12 * * 1-5' },  // 7:00 AM ET weekdays
  ],
  async ({ step, logger, runId }) => {

    // ── Step 1: Load last poll date from system_config ─────────────────────
    const lastPollDate = await step.run('load-last-poll-date', async () => {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'fr_last_poll_date')
        .single()
      if (error) throw new Error(`system_config read failed: ${error.message}`)
      return data?.value ?? new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
    })

    logger.info(`[fr-daily-poll] Polling for FR docs published since ${lastPollDate}`)

    // ── Step 2: Load source ID ─────────────────────────────────────────────
    const sourceId = await step.run('load-source-id', async () => {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('sources')
        .select('id')
        .eq('name', FR_SOURCE_NAME)
        .single()
      if (error || !data) throw new Error(`Source '${FR_SOURCE_NAME}' not found`)
      return data.id as string
    })

    // ── Step 3: Fetch new FR documents ─────────────────────────────────────
    // Paginate through FR API filtering by CFR titles 21, 29, 42, 45 and date >= lastPollDate
    const fetchedDocs = await step.run('fetch-fr-documents', async () => {
      const today = new Date().toISOString().split('T')[0]
      const docs: Array<Record<string, unknown>> = []
      let page = 1
      let totalPages = 1

      do {
        const raw = await searchFederalRegister({
          agencies: [],          // empty = all agencies (filter by CFR title instead)
          types: FR_TYPES,
          dateGte: lastPollDate,
          dateLte: today,
          cfrTitles: CFR_TITLES,
          perPage: PER_PAGE,
          page,
          fields: FIELDS,
        })

        await trackCost({
          service: 'gov_api',
          operation: 'fr_daily_poll',
          cost_usd: 0,
          context: { page, lastPollDate, run_id: runId },
        })

        const parsed = JSON.parse(raw) as { count: number; total_pages: number; results: unknown[] }
        totalPages = parsed.total_pages ?? 1
        docs.push(...(parsed.results as Array<Record<string, unknown>>))
        logger.info(`[fr-daily-poll] Page ${page}/${totalPages} — ${parsed.results?.length ?? 0} docs`)
        page++
      } while (page <= totalPages)

      logger.info(`[fr-daily-poll] Fetched ${docs.length} total docs since ${lastPollDate}`)
      return docs
    })

    if (fetchedDocs.length === 0) {
      logger.info('[fr-daily-poll] No new documents — skipping relationship linking')
      return { documents: 0, relationships: 0, cascades: 0 }
    }

    // ── Step 4: Upsert FR documents as kg_entities ─────────────────────────
    const upsertedIds = await step.run('upsert-fr-entities', async () => {
      const entities: KGEntityInsert[] = fetchedDocs
        .filter(doc => doc.document_number)
        .map(doc => ({
          name:              String(doc.title ?? doc.document_number),
          description:       doc.abstract as string | undefined,
          entity_type:       TYPE_TO_ENTITY[doc.type as string] ?? 'notice',
          jurisdiction:      'US',
          status:            TYPE_TO_STATUS[doc.type as string] ?? 'active',
          identifier:        String(doc.document_number),
          source_id:         sourceId,
          publication_date:  doc.publication_date as string | undefined,
          effective_date:    doc.effective_on as string | undefined,
          document_type:     String(doc.type),
          citation:          doc.citation as string | undefined,
          pdf_url:           doc.pdf_url as string | undefined,
          external_url:      doc.html_url as string | undefined,
          comment_close_date: doc.comments_close_on as string | undefined,
          agencies:          Array.isArray(doc.agencies) ? doc.agencies : undefined,
          cfr_references:    Array.isArray(doc.cfr_references) ? doc.cfr_references : undefined,
          metadata:          doc,
        }))

      const result = await upsertEntities(entities)
      if (result.errors.length > 0) {
        logger.warn(`[fr-daily-poll] Upsert errors: ${result.errors.join('; ')}`)
      }
      logger.info(`[fr-daily-poll] Upserted ${result.upserted} entities`)
      return result.upserted
    })

    // ── Step 5: Create 'amends' and 'corrects' relationships ───────────────
    const relationshipStats = await step.run('create-relationships', async () => {
      const supabase = createServerClient()
      const relRows: Parameters<typeof createRelationships>[0] = []

      for (const doc of fetchedDocs) {
        if (!doc.document_number) continue

        // Look up this doc's entity ID
        const { data: frEntity } = await supabase
          .from('kg_entities')
          .select('id')
          .eq('identifier', String(doc.document_number))
          .eq('source_id', sourceId)
          .single()

        if (!frEntity) continue
        const frEntityId = frEntity.id as string

        // 'amends' relationships via cfr_references
        const cfrRefs = Array.isArray(doc.cfr_references)
          ? (doc.cfr_references as Array<{ title: number; part: number }>)
          : []

        if (cfrRefs.length > 0) {
          const cfrMap = await matchCFREntitiesToRefs(cfrRefs)
          for (const targetId of cfrMap.values()) {
            relRows.push({
              source_entity_id:  frEntityId,
              target_entity_id:  targetId,
              relationship_type: 'amends',
              rel_type:          'amends',
              effective_date:    doc.effective_on as string | undefined,
              provenance:        'api_cfr_references',
              fr_citation:       doc.citation as string | undefined,
              confidence:        1.0,
            })
          }
        }

        // 'corrects' relationship via correction_of field
        if (doc.correction_of && typeof doc.correction_of === 'object') {
          const correctedDocNum = (doc.correction_of as { document_number?: string }).document_number
          if (correctedDocNum) {
            const { data: correctedEntity } = await supabase
              .from('kg_entities')
              .select('id')
              .eq('identifier', correctedDocNum)
              .eq('source_id', sourceId)
              .single()

            if (correctedEntity) {
              relRows.push({
                source_entity_id:  frEntityId,
                target_entity_id:  correctedEntity.id as string,
                relationship_type: 'corrects',
                rel_type:          'corrects',
                provenance:        'api_correction_of',
                fr_citation:       doc.citation as string | undefined,
                confidence:        1.0,
              })
            }
          }
        }
      }

      const result = await createRelationships(relRows)
      if (result.errors.length > 0) {
        logger.warn(`[fr-daily-poll] Relationship errors: ${result.errors.join('; ')}`)
      }
      logger.info(`[fr-daily-poll] Created ${result.linked} relationships`)
      return { linked: result.linked, attempted: relRows.length }
    })

    // ── Step 6: Update last poll date ──────────────────────────────────────
    await step.run('update-poll-date', async () => {
      const supabase = createServerClient()
      const today = new Date().toISOString().split('T')[0]
      const { error } = await supabase
        .from('system_config')
        .update({ value: today })
        .eq('key', 'fr_last_poll_date')
      if (error) logger.warn(`[fr-daily-poll] Failed to update poll date: ${error.message}`)
      else logger.info(`[fr-daily-poll] Poll date updated to ${today}`)
    })

    logger.info(`[fr-daily-poll] Done — ${upsertedIds} entities, ${relationshipStats.linked} relationships`)
    return {
      documents:     upsertedIds,
      relationships: relationshipStats.linked,
    }
  }
)
```

**Important implementation note:** The `searchFederalRegister()` call passes `agencies: []` (empty array). The existing `searchFederalRegister()` does `params.agencies.forEach(a => url.searchParams.append('agencies[]', a))` — an empty array results in no agency filter, which is correct (we filter by CFR title instead). Verify this doesn't break the URL construction.

**Acceptance criteria:**
- Triggering `cedar/corpus.fr-daily-poll` from Inngest dashboard runs all 6 steps without error
- `SELECT COUNT(*) FROM kg_entities WHERE source_id = '[FDA FR source ID]' AND created_at > NOW() - INTERVAL '1 hour'` shows new rows
- `SELECT COUNT(*) FROM kg_relationships WHERE provenance = 'api_cfr_references'` shows rows with non-zero count

---

### Task 7: Create inngest/ecfr-daily-check.ts
**File:** `inngest/ecfr-daily-check.ts`
**Action:** CREATE

```typescript
// Daily eCFR change detection — polls eCFR titles for amendments, computes
// SHA-256 content hashes, creates new kg_entity_versions when content changes.
// Cron: 7:30 AM ET weekdays (30 minutes after FR poll)
// Event: 'cedar/corpus.ecfr-daily-check'

import { createHash } from 'crypto'
import { inngest } from './client'
import { createServerClient } from '../lib/db/client'
import { fetchECFRTitles, fetchECFRPart, fetchECFRStructure } from '../lib/fetchers/gov-apis'
import { trackCost } from '../lib/cost-tracker'
import { detectCascades } from '../lib/corpus/cascade-detect'

// Titles to monitor: 21 (FDA), 29 (OSHA), 42 (Medicare/Medicaid), 45 (HIPAA/HHS)
const MONITORED_TITLES = [21, 29, 42, 45]

// eCFR source name for looking up source_id
const ECFR_SOURCE_NAME = 'eCFR Title 21 (Food & Drugs)'  // primary source — log other titles under same source for now

export const ecfrDailyCheck = inngest.createFunction(
  {
    id: 'ecfr-daily-check',
    name: 'eCFR Daily Check — Detect Amendment Changes',
    retries: 2,
    concurrency: { limit: 1 },
    timeouts: { finish: '45m' },
  },
  [
    { event: 'cedar/corpus.ecfr-daily-check' },
    { cron: '30 12 * * 1-5' },  // 7:30 AM ET weekdays
  ],
  async ({ step, logger, runId }) => {

    // ── Step 1: Load last checked date ─────────────────────────────────────
    const lastCheckedDate = await step.run('load-last-checked-date', async () => {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'ecfr_last_checked_date')
        .single()
      if (error) throw new Error(`system_config read failed: ${error.message}`)
      return data?.value ?? new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0]
    })

    logger.info(`[ecfr-daily-check] Checking eCFR titles changed since ${lastCheckedDate}`)

    // ── Step 2: Fetch eCFR titles metadata ─────────────────────────────────
    const changedTitles = await step.run('check-ecfr-titles', async () => {
      const titles = await fetchECFRTitles()
      await trackCost({ service: 'gov_api', operation: 'ecfr_titles_check', cost_usd: 0,
        context: { run_id: runId, last_checked: lastCheckedDate } })

      return titles
        .filter(t => MONITORED_TITLES.includes(t.number))
        .filter(t => t.latest_amended_on > lastCheckedDate)
        .map(t => ({ number: t.number, amendedOn: t.latest_amended_on, asOf: t.up_to_date_as_of }))
    })

    if (changedTitles.length === 0) {
      logger.info('[ecfr-daily-check] No titles changed since last check')
      await updateLastCheckedDate()
      return { titles_changed: 0, versions_created: 0, cascade_entities: 0 }
    }

    logger.info(`[ecfr-daily-check] Changed titles: ${changedTitles.map(t => t.number).join(', ')}`)

    // ── Step 3: For each changed title, detect changed parts ───────────────
    let totalVersions = 0
    let totalCascades = 0

    for (const title of changedTitles) {
      const versionStats = await step.run(`process-title-${title.number}`, async () => {
        const supabase = createServerClient()
        let versionsCreated = 0
        let cascadesDetected = 0

        // Fetch structure to get list of parts
        const rawStructure = await fetchECFRStructure(title.number)
        await trackCost({ service: 'gov_api', operation: 'ecfr_structure_fetch', cost_usd: 0,
          context: { title: title.number, run_id: runId } })

        const structure = JSON.parse(rawStructure)
        const parts = extractPartNumbers(structure)

        logger.info(`[ecfr-daily-check] Title ${title.number}: ${parts.length} parts to check`)

        // Check each part for content changes
        for (const partNum of parts) {
          try {
            const rawContent = await fetchECFRPart(title.number, partNum)
            await trackCost({ service: 'gov_api', operation: 'ecfr_part_fetch', cost_usd: 0,
              context: { title: title.number, part: partNum, run_id: runId } })

            const contentHash = createHash('sha256').update(rawContent).digest('hex')
            const contentSnippet = rawContent.substring(0, 5000)  // first 5KB for snapshot

            // Find the kg_entity for this CFR part
            const { data: entity } = await supabase
              .from('kg_entities')
              .select('id')
              .contains('cfr_references', JSON.stringify([{ title: title.number, part: parseInt(partNum) }]))
              .limit(1)
              .single()

            if (!entity) continue

            // Get most recent content_hash for this entity
            const { data: latestVersion } = await supabase
              .from('kg_entity_versions')
              .select('content_hash')
              .eq('entity_id', entity.id)
              .not('version_date', 'is', null)
              .order('version_date', { ascending: false })
              .limit(1)
              .single()

            // Only create new version if content actually changed
            if (latestVersion?.content_hash === contentHash) continue

            const versionDate = title.asOf
            const { error: vErr } = await supabase
              .from('kg_entity_versions')
              .upsert({
                entity_id:        entity.id,
                version_number:   0,     // not used for Phase 2 versioning — set 0
                snapshot:         {},    // not used for Phase 2 — set empty JSONB
                version_date:     versionDate,
                content_hash:     contentHash,
                content_snapshot: contentSnippet,
              }, { onConflict: 'entity_id,version_date' })

            if (vErr) {
              logger.warn(`[ecfr-daily-check] Version insert error for ${entity.id}: ${vErr.message}`)
              continue
            }

            versionsCreated++

            // Cascade detection for changed entity
            const cascadeIds = await detectCascades(entity.id, runId ?? 'unknown')
            cascadesDetected += cascadeIds.length

            // Trigger reclassification of changed entity
            // (send classify event — pipeline will pick it up)
            // Note: sending event here is optional for MVP. Log the need instead.
            logger.info(`[ecfr-daily-check] New version for entity ${entity.id} (title ${title.number} part ${partNum}) — ${cascadeIds.length} cascade entities`)
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            logger.warn(`[ecfr-daily-check] Title ${title.number} part ${partNum} error: ${msg}`)
          }
        }

        return { versionsCreated, cascadesDetected }
      })

      totalVersions += versionStats.versionsCreated
      totalCascades += versionStats.cascadesDetected
    }

    // ── Step 4: Update last checked date ───────────────────────────────────
    await step.run('update-checked-date', async () => {
      await updateLastCheckedDate()
    })

    logger.info(`[ecfr-daily-check] Done — ${changedTitles.length} titles, ${totalVersions} versions, ${totalCascades} cascades`)
    return {
      titles_changed:  changedTitles.length,
      versions_created: totalVersions,
      cascade_entities: totalCascades,
    }

    async function updateLastCheckedDate() {
      const supabase = createServerClient()
      const today = new Date().toISOString().split('T')[0]
      await supabase.from('system_config').update({ value: today }).eq('key', 'ecfr_last_checked_date')
    }
  }
)

// Extract part numbers as strings from eCFR structure tree
function extractPartNumbers(node: { label_level?: string; reserved?: boolean; children?: unknown[] }): string[] {
  const parts: string[] = []
  if (node.label_level?.startsWith('Part ') && !node.reserved) {
    const match = node.label_level.match(/Part (\d+)/)
    if (match) parts.push(match[1])
  }
  for (const child of (node.children ?? []) as typeof node[]) {
    parts.push(...extractPartNumbers(child))
  }
  return parts
}
```

**Critical note on version_number:** The existing kg_entity_versions table has UNIQUE(entity_id, version_number) and version_number NOT NULL. For Phase 2 rows, set version_number = 0 (a sentinel value). The real deduplication is via the new `idx_kg_entity_versions_date_unique` partial index on (entity_id, version_date) WHERE version_date IS NOT NULL. Alternatively, set version_number to a large timestamp-based value — but 0 is simplest if the schema allows it. **Check if version_number has any check constraints** in migration 007 — if not, 0 works. If uniqueness on version_number breaks, use `999999` or similar unique value per insert.

**Acceptance criteria:**
- Triggering `cedar/corpus.ecfr-daily-check` runs all 4 steps without error
- After run, `SELECT COUNT(*) FROM kg_entity_versions WHERE version_date IS NOT NULL` returns rows
- `ecfr_last_checked_date` in `system_config` is updated to today

---

### Task 8: Register new functions in Inngest route
**File:** `app/api/inngest/route.ts`
**Action:** MODIFY

Add the two new imports and include both functions in the `functions` array:

```typescript
// Add these two imports to the existing list:
import { frDailyPoll }    from '../../../inngest/fr-daily-poll'
import { ecfrDailyCheck } from '../../../inngest/ecfr-daily-check'

// Add to the functions array:
// functions: [
//   ...existing...,
//   frDailyPoll,
//   ecfrDailyCheck,
// ]
```

**Acceptance criteria:**
- `npm run build` passes
- Inngest dev dashboard shows `fr-daily-poll` and `ecfr-daily-check` as registered functions

---

### Task 9: Apply migrations to Supabase and regenerate types
**Action:** BASH COMMANDS (run in order)

```bash
# 1. Push migrations to production Supabase
npx supabase db push

# 2. Regenerate TypeScript types
npx supabase gen types typescript --project-id serumeiwrvtwisibuawe > lib/db/types.ts

# 3. Verify build is clean
npm run build
```

If `supabase db push` requires auth, ensure `SUPABASE_ACCESS_TOKEN` is set in environment or use:
```bash
npx supabase db push --db-url "$SUPABASE_DB_URL"
```

**Acceptance criteria:**
- `supabase db push` reports migrations 025 and 026 applied
- `lib/db/types.ts` reflects new columns on `kg_relationships` and `kg_entity_versions`
- `npm run build` returns exit code 0

---

## Integration Points

```yaml
DATABASE:
  - Migration 025: relationship_type_enum Postgres type, new columns on kg_relationships + kg_entity_versions
  - Migration 026: fr_last_poll_date + ecfr_last_checked_date in system_config
  - All new INSERT/UPDATE operations use service role client (bypasses RLS)
  - kg_relationships RLS: existing policy "kg_relationships_admin" covers writes from admin role

INNGEST:
  - New events: cedar/corpus.fr-daily-poll, cedar/corpus.ecfr-daily-check
  - New crons: '0 12 * * 1-5' (FR poll at 7 AM ET), '30 12 * * 1-5' (eCFR check at 7:30 AM ET)
  - Both functions accept manual trigger via Inngest dashboard (no payload required)
  - Both registered in app/api/inngest/route.ts serve() call

API ROUTES:
  - No new API routes required for Phase 2

UI:
  - No UI changes in Phase 2 (UI changes are Phase 2 Library UI — separate from this PRP)

ENV:
  - No new environment variables needed. All gov APIs are public/unauthenticated.
  - FR API: https://www.federalregister.gov/api/v1/documents — no auth
  - eCFR API: https://www.ecfr.gov/api/versioner/v1/ — no auth
```

---

## Validation

### Build Check
```bash
npm run build
# Must pass with 0 errors, 0 warnings
```

### Migration Verification
```sql
-- Verify migration 025 applied
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'kg_relationships'
AND column_name IN ('rel_type', 'effective_date', 'end_date', 'provenance', 'fr_citation');
-- Expected: 5 rows

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'kg_entity_versions'
AND column_name IN ('version_date', 'content_hash', 'content_snapshot', 'fr_document_number', 'change_summary');
-- Expected: 5 rows

-- Verify relationship_type_enum exists
SELECT typname FROM pg_type WHERE typname = 'relationship_type_enum';
-- Expected: 1 row

-- Verify migration 026 applied
SELECT key, value FROM system_config
WHERE key IN ('fr_last_poll_date', 'ecfr_last_checked_date');
-- Expected: 2 rows with YYYY-MM-DD values
```

### Functional Verification

**Test FR daily poll:**
```bash
# 1. Start dev servers
# Terminal 1: npx inngest-cli@latest dev
# Terminal 2: env -u ANTHROPIC_API_KEY npx next dev --port 3000

# 2. In Inngest dashboard (localhost:8288), click "Send Event"
# Event name: cedar/corpus.fr-daily-poll
# Payload: {} (empty)

# 3. Watch all 6 steps complete in Inngest UI (green checkmarks)
```

```sql
-- After FR poll runs:
-- Check new FR entities were created
SELECT COUNT(*) FROM kg_entities
WHERE created_at > NOW() - INTERVAL '10 minutes'
AND document_type = 'Rule';
-- Expected: > 0 rows (depends on FR activity since last poll date)

-- Check 'amends' relationships were created
SELECT COUNT(*), provenance
FROM kg_relationships
WHERE provenance IN ('api_cfr_references', 'api_correction_of')
GROUP BY provenance;
-- Expected: rows with non-zero counts

-- Check system_config was updated
SELECT value FROM system_config WHERE key = 'fr_last_poll_date';
-- Expected: today's date in YYYY-MM-DD format
```

**Test eCFR daily check:**
```bash
# In Inngest dashboard, Send Event: cedar/corpus.ecfr-daily-check with payload {}
```

```sql
-- After eCFR check runs:
SELECT COUNT(*) FROM kg_entity_versions WHERE version_date IS NOT NULL;
-- Expected: > 0 if any eCFR title was amended since last checked date

SELECT value FROM system_config WHERE key = 'ecfr_last_checked_date';
-- Expected: today's date

-- Check cascade detection ran (if any versions were created)
SELECT COUNT(*) FROM kg_classification_log
WHERE needs_review = true
AND created_at > NOW() - INTERVAL '10 minutes';
-- Expected: rows if cascade detected
```

**Test idempotency:**
```bash
# Trigger cedar/corpus.fr-daily-poll twice in a row.
# Second run should find 0 new documents (poll date already updated to today).
# Both runs should complete without error.
```

---

## Anti-Patterns

- ❌ Do not drop or rename `relationship_type TEXT` — it's the existing unique index key. Add `rel_type` (enum) as a new column alongside it.
- ❌ Do not set `version_number = NULL` — the column is NOT NULL. Use 0 or a sentinel value for Phase 2 rows. If 0 causes UNIQUE constraint violation (entity_id, version_number), use the entity's existing max version + 1 from a subquery, or use `nextval` of a sequence.
- ❌ Do not call `fetchECFRPart()` for every section (thousands of sections) — only call it at the part level. The structure tree gives parts; fetch at part granularity.
- ❌ Do not use anon Supabase client in Inngest functions — always use `createServerClient()` (service role).
- ❌ Do not skip `trackCost()` on every FR and eCFR API call, even though cost_usd: 0.
- ❌ Do not create new Inngest client instances — always import from `inngest/client.ts`.
- ❌ Do not forget to register both new functions in `app/api/inngest/route.ts` — otherwise they won't appear in the Inngest dashboard.
- ❌ Do not hardcode source IDs — always look up by name via DB query (pattern from corpus-seed.ts step 1).
- ❌ Do not add scope beyond this PRP — Phase 3 (practice-type relevance scoring) and Library UI updates are separate phases.

---

## Confidence Score: 8/10

**Rationale:** All patterns are well-established in the codebase. The main risk is the `version_number NOT NULL` constraint on `kg_entity_versions` — the sentinel value approach (0) may cause unique constraint violations if an entity already has a version_number=0 row. If this becomes an issue: use `SELECT MAX(version_number) + 1 FROM kg_entity_versions WHERE entity_id = $id` per insert. The FR daily poll is straightforward given the existing `searchFederalRegister()` — only the CFR title filter param is new. The cascade detection is simple iterative BFS, not a raw SQL CTE, which avoids Supabase query builder limitations but is slightly less efficient (acceptable at current scale).
