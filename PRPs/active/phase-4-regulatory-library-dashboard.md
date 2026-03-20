name: "Phase 4: Regulatory Library Dashboard"

## Goal
Replace the existing flat-list library page with a hierarchical, category-driven regulatory library experience. Users browse by regulatory domain (category grid → regulation list → regulation detail), filter by practice type, search with full-text search, and explore entity relationships and version history — all powered by live Supabase queries against the Phase 1-3 knowledge graph schema.

## Why
- **Business value:** The library is Cedar's core browse experience — how practice owners discover and understand the regulations that affect them. The current flat list of 98K+ entities is unusable without hierarchical navigation and practice-type filtering.
- **Roadmap phase:** MVP — this is the primary user-facing deliverable that makes the knowledge graph visible and navigable.
- **Problems solved:** Replaces hardcoded/flat data with live KG queries; adds category-based navigation, practice-type filtering, full-text search (tsvector), version history, relationship browsing, and classification audit trail display.

## Success Criteria
- [ ] Library landing page shows category grid from `kg_domains` (depth 0-1) with regulation counts, recent change counts, and highest severity
- [ ] Practice-type filter pills filter categories to show only domains containing relevant entities
- [ ] Category detail page lists regulations within a domain (including child domains via recursive CTE)
- [ ] Regulation list supports full-text search via `search_vector` (@@), sort by severity/date, filter by type/status
- [ ] Regulation detail page has 4 tabs: Overview, Reader, Timeline, Related
- [ ] Overview tab shows summary, key metadata, classification audit trail, authority level
- [ ] Reader tab shows `content_snapshot` from `kg_entity_versions` with fullscreen mode
- [ ] Timeline tab shows version history from `kg_entity_versions` + classification events
- [ ] Related tab shows connected entities via `kg_relationships` with relationship type labels
- [ ] Breadcrumb navigation supports arbitrary domain hierarchy depth
- [ ] All new shared components follow Cedar design system (token-audit passes with 0 errors)
- [ ] Mobile-responsive down to 768px
- [ ] Dark mode works correctly for all new UI
- [ ] `npm run build` passes with 0 errors, 0 warnings

## Context

### Files to Read First
```yaml
# Design system — MUST read before writing any UI code
- doc: docs/design-system/design-standards.md
  why: All UI patterns, spacing, typography, motion, component decisions

- doc: specs/tokens/token-reference.md
  why: Available design tokens for colors, spacing, radius, shadows, z-index

# Wireframe — UX reference (structure guide, not style guide)
- doc: docs/wireframes/library-v2.jsx
  why: Layout patterns, information architecture, navigation flow, component ideas

# Existing library implementation — patterns to follow and replace
- file: app/(dashboard)/library/page.tsx
  why: Current server component pattern with pagination, filters, role gating

- file: app/(dashboard)/library/[id]/page.tsx
  why: Current detail page layout (2-column, metadata sidebar, tabs)

- file: app/(dashboard)/library/[id]/LibraryDetailTabs.tsx
  why: Current tab implementation pattern (summary + live source)

- file: components/LibraryBrowser.tsx
  why: Current client-side filter/search/pagination component

# Shared components — reuse these
- file: components/SeverityBadge.tsx
  why: Pattern for badge components using ui-constants.ts

- file: components/StatusBadge.tsx
  why: Review status badge pattern

- file: components/EmptyState.tsx
  why: Empty state pattern

- file: components/DataList.tsx
  why: Clickable list pattern with severity + timestamp

- file: components/BreadcrumbNav.tsx
  why: Existing breadcrumb component

# Layout and sidebar
- file: components/Sidebar.tsx
  why: Current nav structure — need to understand existing nav items

- file: components/SidebarShell.tsx
  why: Layout wrapper pattern

# Data layer
- file: lib/db/client.ts
  why: createServerClient() and createBrowserClient() patterns

- file: lib/db/types.ts
  why: All TypeScript types for kg_* tables

- file: lib/layout-data.ts
  why: getLayoutData() for role/practice/user, UserRole type

- file: lib/features.ts
  why: isFeatureEnabled() for tier gating

# UI utilities
- file: lib/ui-constants.ts
  why: SEVERITY_CLASS, SEVERITY_DOT, STATUS_CLASS, STATUS_LABEL maps

- file: lib/format.ts
  why: timeAgo(), formatDate(), capitalize()

# Schema context (Phases 1-3)
- migration: supabase/migrations/022_taxonomy_schema_extensions.sql
  why: kg_domains hierarchy, kg_entity_domains, kg_practice_types, kg_entity_practice_relevance, kg_classification_log, kg_service_lines, kg_service_line_regulations

- migration: supabase/migrations/023_search_and_facets.sql
  why: search_vector, GIN indexes, mv_corpus_facets materialized view

- migration: supabase/migrations/024_taxonomy_seed.sql
  why: Domain hierarchy (10 L0 + ~55 L1 + ~50 L2), 14 practice types, 10 service lines

- migration: supabase/migrations/025_phase2_relationships_versioning.sql
  why: relationship_type_enum, kg_relationships extensions, kg_entity_versions extensions

- migration: supabase/migrations/027_phase3_domain_practice_type_map.sql
  why: kg_domain_practice_type_map, mv_practice_relevance_summary, refresh RPC

# Design tokens source
- file: app/globals.css
  why: All CSS custom properties, theme tokens, animation classes
```

### Current File Tree (relevant subset)
```bash
app/(dashboard)/
  layout.tsx                    # SidebarShell wrapper
  library/
    page.tsx                    # Current flat-list library (REPLACE)
    [id]/
      page.tsx                  # Current detail page (REPLACE)
      LibraryDetailTabs.tsx     # Current tabs (REPLACE)

components/
  Sidebar.tsx                   # Nav sidebar (MODIFY — add Ask Cedar, My Practice)
  SidebarShell.tsx              # Layout wrapper
  SidebarLink.tsx               # Nav link component
  SeverityBadge.tsx             # Severity badge (REUSE)
  StatusBadge.tsx               # Status badge (REUSE)
  EmptyState.tsx                # Empty state (REUSE)
  DataList.tsx                  # Data list (REUSE)
  BreadcrumbNav.tsx             # Breadcrumb (REUSE/EXTEND)
  LibraryBrowser.tsx            # Current flat list browser (REPLACE)
  LegalDisclaimer.tsx           # Disclaimer (REUSE)
  UpgradeBanner.tsx             # Upgrade banner (REUSE)
  ui/                           # shadcn/ui primitives (29 components)

lib/
  db/client.ts                  # Supabase client factories
  db/types.ts                   # Generated DB types
  ui-constants.ts               # Severity/status class maps
  format.ts                     # timeAgo, formatDate, capitalize
  features.ts                   # Feature flag checking
  layout-data.ts                # getLayoutData()
```

### Files to Create or Modify
```bash
# NEW shared components
components/ConfidenceBadge.tsx            (+) Classification confidence indicator
components/AuthorityBadge.tsx             (+) Authority level badge (federal_statute, state_board_rule, etc.)
components/ServiceLineTag.tsx             (+) Practice type / service line tag pill
components/DeadlineChip.tsx               (+) Comment close date or effective date countdown
components/DomainCard.tsx                 (+) Category grid card with counts and severity
components/RegulationRow.tsx              (+) Regulation list item with badges, tags, metadata
components/ContentReader.tsx              (+) Content display with fullscreen mode for Reader tab
components/RelationshipCard.tsx           (+) Related entity card with relationship type

# NEW library pages (replace existing)
app/(dashboard)/library/page.tsx                     (M) Category grid landing page
app/(dashboard)/library/[slug]/page.tsx              (+) Category detail — regulation list
app/(dashboard)/library/[slug]/[id]/page.tsx         (+) Regulation detail — 4-tab view
app/(dashboard)/library/[slug]/[id]/RegulationTabs.tsx (+) Client component for Overview/Reader/Timeline/Related tabs

# DELETE old routes (replaced by new hierarchy)
app/(dashboard)/library/[id]/page.tsx                (D) Old flat detail route
app/(dashboard)/library/[id]/LibraryDetailTabs.tsx   (D) Old tabs component

# MODIFY existing
components/LibraryBrowser.tsx             (M) Repurpose for category detail list view (or replace)
components/Sidebar.tsx                    (M) Add "Ask Cedar" (grayed, SOON badge) + "My Practice"
components/BreadcrumbNav.tsx              (M) Support domain hierarchy breadcrumbs
lib/ui-constants.ts                       (M) Add AUTHORITY_LEVEL_LABEL, AUTHORITY_LEVEL_CLASS, RELATIONSHIP_TYPE_LABEL maps
lib/format.ts                             (M) Add daysUntil() for deadline chip
```

### Database Schema Reference

**kg_domains** (hierarchical taxonomy):
```
id, name, slug, description, parent_id (self-ref), depth (0-2),
domain_code, taxonomy_source, sort_order, color, is_active
```

**kg_entities** (regulations):
```
id, name, description, entity_type, document_type, citation, identifier,
jurisdiction, external_url, publication_date, effective_date, comment_close_date,
status, authority_level (enum), issuing_agency, source_id, change_id,
metadata (jsonb), search_vector (tsvector), classification_confidence
```

**kg_entity_domains** (entity ↔ domain classification):
```
entity_id, domain_id, confidence, relevance_score, assigned_by,
classified_by, is_primary
```

**kg_practice_types** (14 practice types):
```
id, slug, nucc_code, grouping, classification, specialization,
display_name, is_cedar_target, is_active, sort_order
```

**kg_entity_practice_relevance** (entity ↔ practice type scoring):
```
entity_id, practice_type_id, relevance_score, classified_by
```

**kg_entity_versions** (version history):
```
id, entity_id, version_number, version_date, snapshot (jsonb),
content_hash, content_snapshot (text), fr_document_number, change_summary
```

**kg_relationships** (entity connections):
```
id, source_entity_id, target_entity_id, relationship_type, rel_type (enum),
confidence, notes, effective_date, end_date, provenance, fr_citation
```
Enum values: amends, amended_by, supersedes, superseded_by, implements, interprets, cites, cited_by, corrects, part_of, has_legal_basis, conflicts_with, related_to, delegates_to, enables, restricts

**kg_classification_log** (audit trail):
```
id, entity_id, domain_id, stage, confidence, rule_id,
classified_at, classified_by, needs_review, review_reason, run_id
```

**kg_service_lines** (10 clinical workflows):
```
id, slug, name, description, practice_type_id, cpt_codes, icd10_codes,
regulation_domains, is_cedar_target, is_active, sort_order
```

**kg_service_line_regulations** (service line ↔ entity):
```
service_line_id, entity_id, regulation_role, relevance_score, classified_by
```

**mv_corpus_facets** (materialized view):
```
jurisdiction, agency, entity_type, domain, doc_count
```

**mv_practice_relevance_summary** (materialized view):
```
practice_type_id, domain_id, total_regulations (count),
avg_relevance (avg score)
```
Refresh RPC: `refresh_practice_relevance_summary()`

### Known Gotchas
```typescript
// Cedar-specific constraints for this feature:
// - search_vector uses tsvector — query with websearch_to_tsquery() or plainto_tsquery()
//   Supabase JS: .textSearch('search_vector', query, { type: 'websearch' })
// - kg_domains.parent_id (NOT parent_domain_id) — check types.ts for actual column name
// - kg_domains.depth: 0 = root, 1 = topic, 2 = specific requirement
// - kg_relationships.rel_type is the enum column (not relationship_type which is plain text)
// - mv_corpus_facets and mv_practice_relevance_summary are materialized views —
//   query them like tables but data may be stale (refreshed periodically)
// - Task 0 runs the Phase 3 scoring pipeline — data should be populated, but still
//   handle null/empty gracefully as a defensive measure
// - Feature gating: Library is gated to Intelligence tier — check role === 'monitor'
//   and show UpgradeBanner (existing pattern in current library page)
// - All AI summaries must include LegalDisclaimer component
// - RLS: Use createServerClient() (service role) in server components
// - Design system: NO hardcoded colors, NO arbitrary Tailwind values, NO raw HTML form elements
// - Icons: Remix Icon ONLY (ri-* classes)
// - Dark mode: semantic tokens handle it automatically; use dark: prefix only for
//   non-semantic status colors (severity badges, etc.)
// - Run `node scripts/token-audit.js` before finishing — zero errors required
// - The route structure uses [slug] for domains (human-readable) and [id] (uuid) for entities
```

## Tasks (execute in order)

### Task 0: Run Classification Pipelines to Populate Knowledge Graph Data
**Action:** EXECUTE (Inngest events via dev server)
**Depends on:** Dev server + Inngest dev server running

The Phase 3 scoring pipeline has not yet been triggered against live data. All downstream UI depends on populated classification data. Run each pipeline step in sequence, waiting for completion before the next.

**Setup:**
```bash
# Terminal 1: Inngest dev server
npx inngest-cli@latest dev

# Terminal 2: Next.js dev server (unset Claude Code's empty ANTHROPIC_API_KEY)
env -u ANTHROPIC_API_KEY npx next dev --port 3000
```

**Step 1 — Domain classification:**
Trigger `cedar/corpus.classify` via the Inngest dev dashboard (http://localhost:8288).
Wait for the function run to complete (check Inngest dashboard for success status).
This populates `kg_entity_domains` — assigning each of the ~99K entities to taxonomy domains.

**Step 2 — Authority classification:**
Trigger `cedar/corpus.authority-classify` via the Inngest dev dashboard.
Wait for completion.
This populates `authority_level` and `issuing_agency` on `kg_entities` using source name/doc type heuristics (rule-based first pass, Claude API ML fallback at 15 entities/batch).

**Step 3 — Practice-type relevance scoring:**
Trigger `cedar/corpus.practice-score` via the Inngest dev dashboard.
Wait for completion.
This populates `kg_entity_practice_relevance` via the domain→practice-type map and refreshes both materialized views (`mv_corpus_facets` and `mv_practice_relevance_summary`).

**Step 4 — Service line mapping:**
Trigger `cedar/corpus.service-line-map` via the Inngest dev dashboard.
Wait for completion.
This populates `kg_service_line_regulations` using `regulation_domains` on each service line.

**Validation queries (run all five — all must pass before proceeding to Task 1):**
```sql
-- 1. kg_entity_domains has rows
SELECT COUNT(*) AS entity_domain_count FROM kg_entity_domains;
-- Expected: > 0 (ideally close to or exceeding 99K assignments)

-- 2. authority_level populated on >50% of entities
SELECT
  COUNT(*) FILTER (WHERE authority_level IS NOT NULL) AS classified,
  COUNT(*) AS total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE authority_level IS NOT NULL) / COUNT(*), 1) AS pct
FROM kg_entities;
-- Expected: pct > 50

-- 3. kg_entity_practice_relevance has rows
SELECT COUNT(*) AS practice_relevance_count FROM kg_entity_practice_relevance;
-- Expected: > 0 (ideally > 100K rows across 14 practice types)

-- 4. kg_service_line_regulations has rows
SELECT COUNT(*) AS service_line_reg_count FROM kg_service_line_regulations;
-- Expected: > 0 (all 10 service lines should have ≥ 50 entities each)

-- 5. Both materialized views are refreshed and non-empty
SELECT COUNT(*) AS facet_count FROM mv_corpus_facets;
SELECT COUNT(*) AS relevance_summary_count FROM mv_practice_relevance_summary;
-- Expected: both > 0
```

**Acceptance criteria:** All five validation checks pass. If any pipeline step fails, check Inngest logs for errors, resolve, and re-trigger that step before proceeding.

---

### Task 1: Add UI Constants for New Badge Types
**File:** `lib/ui-constants.ts`
**Action:** MODIFY
**Pattern:** Follow existing `SEVERITY_CLASS` / `STATUS_CLASS` pattern

```typescript
// Add these maps to the existing file:

export const AUTHORITY_LEVEL_LABEL: Record<string, string> = {
  federal_statute: 'Federal Statute',
  federal_regulation: 'Federal Regulation',
  sub_regulatory_guidance: 'Sub-Regulatory Guidance',
  national_coverage_determination: 'National Coverage Determination',
  local_coverage_determination: 'Local Coverage Determination',
  state_statute: 'State Statute',
  state_board_rule: 'State Board Rule',
  professional_standard: 'Professional Standard',
}

export const AUTHORITY_LEVEL_CLASS: Record<string, string> = {
  // Use semantic weight: federal_statute = highest authority (red-ish),
  // professional_standard = lowest (gray-ish). Follow SEVERITY_CLASS pattern
  // with bg-*, text-*, border-*, dark:* variants
}

export const RELATIONSHIP_TYPE_LABEL: Record<string, string> = {
  amends: 'Amends',
  amended_by: 'Amended by',
  supersedes: 'Supersedes',
  superseded_by: 'Superseded by',
  implements: 'Implements',
  interprets: 'Interprets',
  cites: 'Cites',
  cited_by: 'Cited by',
  corrects: 'Corrects',
  part_of: 'Part of',
  has_legal_basis: 'Legal basis',
  conflicts_with: 'Conflicts with',
  related_to: 'Related to',
  delegates_to: 'Delegates to',
  enables: 'Enables',
  restricts: 'Restricts',
}
```

### Task 3: Add Format Utility for Deadlines
**File:** `lib/format.ts`
**Action:** MODIFY

```typescript
// Add to existing file:
export function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const target = new Date(iso)
  const now = new Date()
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}
```

### Task 4: Create Shared Components
**Files:** `components/ConfidenceBadge.tsx`, `components/AuthorityBadge.tsx`, `components/ServiceLineTag.tsx`, `components/DeadlineChip.tsx`, `components/DomainCard.tsx`, `components/RegulationRow.tsx`, `components/ContentReader.tsx`, `components/RelationshipCard.tsx`
**Action:** CREATE (8 files)
**Pattern:** Follow `components/SeverityBadge.tsx` for badge patterns, use CVA + cn() for variants

**ConfidenceBadge:**
```typescript
// Props: confidence: number | null (0-1), className?: string
// Display: "92%" with color scale (green > 0.8, yellow > 0.5, red otherwise)
// Use Badge variant="outline" pattern from SeverityBadge
```

**AuthorityBadge:**
```typescript
// Props: level: string | null, className?: string
// Display: human-readable label from AUTHORITY_LEVEL_LABEL
// Color: Use AUTHORITY_LEVEL_CLASS from ui-constants
// Use Badge variant="outline" pattern
```

**ServiceLineTag:**
```typescript
// Props: name: string, className?: string
// Display: small pill/tag for practice type or service line names
// Use Badge variant="secondary" with text-xs
```

**DeadlineChip:**
```typescript
// Props: date: string | null, label?: string (default "Deadline"), className?: string
// Display: "Closes in 14 days" or "Effective Mar 25" or "Passed" if past
// Color: red if <= 7 days, yellow if <= 30 days, muted otherwise
// Uses daysUntil() from format.ts
```

**DomainCard:**
```typescript
// Props: domain (name, slug, description, color), regulationCount, recentChangeCount,
//        highestSeverity, className?: string
// Display: Card with domain name, description, regulation count stat,
//          recent changes count, severity indicator
// Links to /library/[slug]
// Use Card from ui/, follow design-standards.md card patterns
```

**RegulationRow:**
```typescript
// Props: entity (id, name, citation, entity_type, document_type, jurisdiction,
//        status, authority_level, publication_date, effective_date, comment_close_date,
//        classification_confidence, description), domainSlug: string,
//        serviceTags?: string[], className?: string
// Display: Clickable row with severity badge, name, citation, authority badge,
//          confidence badge, deadline chip, service line tags
// Links to /library/[domainSlug]/[id]
```

**ContentReader:**
```typescript
// Props: content: string | null, title?: string, className?: string
// Display: Rendered content (plain text or markdown) with fullscreen toggle
// Fullscreen: fixed overlay with close button, scrollable content
// Follow motion/overlay patterns from design-standards.md
```

**RelationshipCard:**
```typescript
// Props: relationship (rel_type, target entity name, target entity id, confidence,
//        effective_date, fr_citation), domainSlug?: string
// Display: Card showing relationship type label, linked entity name, confidence,
//          date range if applicable
// Links to target entity detail page
```

### Task 5: Update Sidebar Navigation
**File:** `components/Sidebar.tsx`
**Action:** MODIFY

```typescript
// In MAIN_NAV array, add after "Regulation Library":
// { href: '#', label: 'Ask Cedar', icon: 'ri-chat-ai-line', disabled: true, badge: 'SOON' }
// { href: '/settings', label: 'My Practice', icon: 'ri-stethoscope-line' }
//
// In the SidebarLink rendering, handle disabled state:
// - Grayed out text, no hover effect, no link navigation
// - Show "SOON" badge next to label
// Modify SidebarLink.tsx if needed to accept disabled + badge props
```

### Task 6: Library Landing Page — Category Grid
**File:** `app/(dashboard)/library/page.tsx`
**Action:** MODIFY (complete rewrite)

```typescript
// Server component pattern (existing pattern from current page.tsx):
// 1. getLayoutData() for role check
// 2. If monitor role → show UpgradeBanner (existing pattern)
// 3. Query practice types for filter pills:
//    supabase.from('kg_practice_types').select('id, slug, display_name, sort_order')
//      .eq('is_active', true).order('sort_order')
// 4. Read selected practice_type from searchParams
// 5. Query domains with counts:
//    - Base: kg_domains WHERE depth <= 1 AND is_active = true, ordered by sort_order
//    - For each domain, need: regulation count, recent change count, highest severity
//    - Use mv_corpus_facets for regulation counts per domain
//    - Use mv_practice_relevance_summary when practice_type filter is active
//    - Recent changes: count kg_entity_versions WHERE version_date > now() - 14 days
//      joined through kg_entity_domains
//    - Highest severity: MAX severity from kg_entities joined through kg_entity_domains
//
// IMPORTANT: For efficiency, do aggregation in a single query or a few queries,
// not N+1 per domain. Options:
//   a) RPC function that returns domain stats
//   b) Multiple queries joined client-side
//   c) Query entity_domains grouped by domain_id with aggregates
//
// Recommended approach: Two queries:
//   Query 1: All active domains (depth <= 1) ordered by sort_order
//   Query 2: Domain stats via a single aggregate query joining
//            kg_entity_domains → kg_entities, grouped by domain_id,
//            selecting count(*), max(severity from metadata), etc.
//   Then merge client-side.
//
// 6. Render:
//    - Page title: "Regulation Library"
//    - Subtitle: total entity count
//    - Practice type filter pills (horizontal scroll, "All" default + each practice type)
//    - Grid of DomainCard components (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
//    - Empty state if no domains

// Layout:
// <div className="space-y-6">
//   <header> title + subtitle </header>
//   {isGated && <UpgradeBanner feature="Regulation Library" />}
//   <div> practice type filter pills </div>
//   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//     {domains.map(d => <DomainCard key={d.id} ... />)}
//   </div>
// </div>
```

### Task 7: Category Detail Page — Regulation List
**File:** `app/(dashboard)/library/[slug]/page.tsx`
**Action:** CREATE

```typescript
// Server component:
// 1. getLayoutData() for role check
// 2. Resolve domain from slug: supabase.from('kg_domains').select('*').eq('slug', slug).maybeSingle()
//    If not found → notFound()
// 3. Build breadcrumb: recursive query up parent_id chain to root
//    Or: query all ancestors with a recursive CTE via RPC, or iteratively
//    For simplicity: fetch domain, if parent_id exists fetch parent, etc. (max 3 levels)
// 4. Get child domain IDs (for including sub-category entities):
//    supabase.from('kg_domains').select('id').eq('parent_id', domain.id)
//    Combine: domainIds = [domain.id, ...childDomainIds]
// 5. Parse searchParams: page, q (search), sort, type_filter, status_filter
// 6. Count entities in this domain + children:
//    supabase.from('kg_entity_domains').select('entity_id', { count: 'exact', head: true })
//      .in('domain_id', domainIds)
//    Apply search filter via separate query on kg_entities with textSearch if q provided
// 7. Fetch paginated entities:
//    Join kg_entity_domains → kg_entities for this domain + children
//    Apply filters: entity_type, status
//    Apply search: .textSearch('search_vector', q, { type: 'websearch' }) on kg_entities
//    Sort: by severity (metadata), publication_date, effective_date
//    Pagination: range(from, to) with PAGE_SIZE = 50
// 8. For each entity, also fetch:
//    - Service line tags from kg_service_line_regulations joined to kg_service_lines
//    - Classification confidence from kg_classification_log (latest per entity)
//    Or batch these in separate queries and merge client-side
// 9. Render:
//    - Breadcrumb: Home > Library > [Parent Domain] > [Current Domain]
//    - Page title: domain.name
//    - Subtitle: domain.description + entity count
//    - Search bar + filter row (type, status, sort)
//    - List of RegulationRow components
//    - Pagination controls
//    - Empty state if no entities

// NOTE on search implementation:
// Supabase JS client supports: .textSearch('search_vector', query, { type: 'websearch' })
// This replaces the current ilike search. The search_vector column already has
// GIN index and weighted fields (name=A, description=B).
```

### Task 8: Regulation Detail Page — 4-Tab View
**File:** `app/(dashboard)/library/[slug]/[id]/page.tsx`
**Action:** CREATE

```typescript
// Server component:
// 1. getLayoutData() for role
// 2. Fetch entity by id:
//    supabase.from('kg_entities').select('*').eq('id', id).maybeSingle()
//    If not found → notFound()
// 3. Resolve domain from slug for breadcrumb context
// 4. Build breadcrumb: Home > Library > [Domain Chain] > [Entity Name]
// 5. Fetch additional data for all tabs (parallel Promise.all):
//    a) Classification log: supabase.from('kg_classification_log')
//       .select('*').eq('entity_id', id).order('classified_at', { ascending: false })
//    b) Entity versions: supabase.from('kg_entity_versions')
//       .select('*').eq('entity_id', id).order('version_date', { ascending: false, nullsFirst: false })
//    c) Relationships (outgoing): supabase.from('kg_relationships')
//       .select('*, target:kg_entities!target_entity_id(id, name, entity_type, citation)')
//       .eq('source_entity_id', id)
//    d) Relationships (incoming): supabase.from('kg_relationships')
//       .select('*, source:kg_entities!source_entity_id(id, name, entity_type, citation)')
//       .eq('target_entity_id', id)
//    e) Service line tags: supabase.from('kg_service_line_regulations')
//       .select('*, service_line:kg_service_lines(name, slug)')
//       .eq('entity_id', id)
//    f) Domain assignments: supabase.from('kg_entity_domains')
//       .select('*, domain:kg_domains(name, slug)')
//       .eq('entity_id', id)
//    g) Practice relevance: supabase.from('kg_entity_practice_relevance')
//       .select('*, practice_type:kg_practice_types(display_name, slug)')
//       .eq('entity_id', id)
// 6. Render header (outside tabs):
//    - Back link to category: /library/[slug]
//    - Badge row: entity_type, document_type, jurisdiction, authority level, status
//    - Entity name (h1)
//    - Citation, effective date, publication date metadata row
// 7. Pass all fetched data to <RegulationTabs> client component
// 8. LegalDisclaimer at bottom
```

### Task 9: Regulation Tabs Client Component
**File:** `app/(dashboard)/library/[slug]/[id]/RegulationTabs.tsx`
**Action:** CREATE

```typescript
// 'use client' component
// Props: entity, classificationLog, versions, outgoingRelationships,
//        incomingRelationships, serviceLines, domains, practiceRelevance, domainSlug
//
// Tab bar: Overview | Reader | Timeline | Related
// Follow existing tab pattern from LibraryDetailTabs.tsx (Button-based tabs with
// border-b-2 active indicator)
//
// OVERVIEW TAB:
//   - Two-column layout: main content + sidebar (follow existing [id]/page.tsx pattern)
//   - Main: entity.description (summary), classification audit trail table
//   - Sidebar: Key details card (authority level, jurisdiction, issuing agency, status,
//     citation, effective date, publication date, classification confidence),
//     domains card, practice types card, service lines card, source link card
//
// READER TAB:
//   - Use ContentReader component
//   - Content source: latest kg_entity_versions.content_snapshot
//   - If no content_snapshot available, show external_url link as fallback
//   - Fullscreen button in top-right
//
// TIMELINE TAB:
//   - Vertical timeline of events, newest first
//   - Merge kg_entity_versions + kg_classification_log, sorted by date
//   - Version entries: date, change_summary, fr_document_number link
//   - Classification entries: stage, confidence, classified_by, domain assigned
//   - Use visual timeline pattern (left border line, dot markers)
//
// RELATED TAB:
//   - Section: "Outgoing" — entities this regulation affects
//   - Section: "Incoming" — entities that affect this regulation
//   - Each relationship rendered as RelationshipCard
//   - Group by relationship type for clarity
//   - Empty state if no relationships
```

### Task 10: Extend BreadcrumbNav for Domain Hierarchy
**File:** `components/BreadcrumbNav.tsx`
**Action:** MODIFY

```typescript
// Current component likely takes simple breadcrumb items
// Extend to accept an array of { label, href } segments
// Render using shadcn Breadcrumb primitives from components/ui/breadcrumb.tsx
// Pattern: Home > Library > [Parent Domain] > [Current Domain] > [Entity Name]
// Last item is not a link (current page)
// Truncate long entity names with text truncation
```

### Task 11: Delete Old Route Files
**Action:** DELETE
```bash
# These routes are replaced by the new [slug]/[id] hierarchy:
app/(dashboard)/library/[id]/page.tsx
app/(dashboard)/library/[id]/LibraryDetailTabs.tsx
```

### Task 12: Visual Polish and Responsive Testing
**Action:** VERIFY

```bash
# 1. Run token audit
node scripts/token-audit.js

# 2. Verify build
npm run build

# 3. Manual visual checks (dev server):
#    - Library landing: category grid renders, practice type pills work
#    - Click domain → regulation list with search and filters
#    - Click regulation → 4-tab detail view
#    - Test at 1440px, 1024px, 768px widths
#    - Test dark mode toggle on each view
#    - Test empty states (domain with 0 entities)
#    - Test breadcrumb navigation at each depth level
```

## Integration Points
```yaml
DATABASE:
  - No new migrations needed — all tables exist from Phases 1-3
  - Read-only queries against: kg_domains, kg_entities, kg_entity_domains,
    kg_practice_types, kg_entity_practice_relevance, kg_relationships,
    kg_entity_versions, kg_classification_log, kg_service_lines,
    kg_service_line_regulations, mv_corpus_facets, mv_practice_relevance_summary
  - Full-text search via search_vector column (GIN indexed)
  - Recursive domain hierarchy via parent_id on kg_domains

INNGEST:
  - No Inngest functions needed — this is pure UI/read layer

API ROUTES:
  - No new API routes needed — use server components with createServerClient()
  - All data fetching happens in server components (RSC)

UI:
  - 8 new shared components in components/
  - 3 new page routes under app/(dashboard)/library/
  - Modified: Sidebar.tsx, BreadcrumbNav.tsx, ui-constants.ts, format.ts
  - Deleted: old [id]/ route and LibraryDetailTabs

ENV:
  - No new environment variables needed
```

## Validation

### Build Check
```bash
npm run build
# Must pass with 0 errors, 0 warnings
```

### Token Audit
```bash
node scripts/token-audit.js
# Must pass with 0 errors
```

### Functional Verification
```bash
# Step-by-step manual test (start dev server first):
# env -u ANTHROPIC_API_KEY npx next dev --port 3000

# 1. Navigate to /library
#    Expected: Category grid with domain cards showing counts
#    Verify: Cards show regulation counts from mv_corpus_facets

# 2. Click a practice type filter pill (e.g., "Hormone Therapy")
#    Expected: Grid filters to show only domains with relevant entities
#    Verify: Domain cards update counts

# 3. Click a domain card (e.g., "Controlled Substances")
#    Expected: Regulation list page with entities in that domain
#    Verify: Breadcrumb shows "Home > Library > Controlled Substances"

# 4. Type a search query in the category detail search bar
#    Expected: Results filter using tsvector full-text search
#    Verify: Results match the query term

# 5. Click a regulation row
#    Expected: Detail page with 4 tabs
#    Verify: Overview tab shows metadata, classification log

# 6. Click "Reader" tab
#    Expected: Content snapshot displayed (or "no content" empty state)
#    Verify: Fullscreen button works

# 7. Click "Timeline" tab
#    Expected: Version history and classification events in timeline
#    Verify: Entries sorted newest first

# 8. Click "Related" tab
#    Expected: Related entities grouped by relationship type
#    Verify: Each card links to the related entity

# 9. Test breadcrumb navigation
#    Expected: All breadcrumb links navigate correctly

# 10. Resize to 768px width
#     Expected: Grid becomes single column, layout remains usable
```

### Database Verification
```sql
-- Verify data exists for dashboard to display
SELECT COUNT(*) FROM kg_domains WHERE is_active = true AND depth <= 1;
-- Expected: ~65 domains (10 root + ~55 L1)

SELECT COUNT(*) FROM kg_entity_domains;
-- Expected: > 0 (populated by Phase 1 classification pipeline)

SELECT COUNT(*) FROM kg_practice_types WHERE is_active = true;
-- Expected: 14

SELECT COUNT(*) FROM mv_corpus_facets;
-- Expected: > 0 (materialized view populated)

-- If any of these return 0, the dashboard will show empty states
-- which is acceptable — the UI should handle empty data gracefully
```

## Anti-Patterns
- ❌ Do not create API routes for data that can be fetched in server components
- ❌ Do not use `ilike` for search — use `textSearch()` with the `search_vector` column
- ❌ Do not hardcode colors — use design tokens and `SEVERITY_CLASS` / `AUTHORITY_LEVEL_CLASS` maps
- ❌ Do not use raw HTML buttons, inputs, or selects — use shadcn/ui components
- ❌ Do not use any icon library besides Remix Icon (`ri-*` classes)
- ❌ Do not skip dark mode — use semantic tokens, test both themes
- ❌ Do not use arbitrary Tailwind values (`p-[13px]`) — use the spacing scale
- ❌ Do not create N+1 query patterns — batch domain stats into aggregate queries
- ❌ Do not forget empty states for every data-driven view
- ❌ Do not forget loading skeletons for data fetches
- ❌ Do not forget the LegalDisclaimer on regulation detail pages
- ❌ Do not modify the `changes` table — it's append-only
- ❌ Do not skip the token audit (`node scripts/token-audit.js`) before finishing
- ❌ Do not add scope beyond this PRP — note future work in STATUS.md

## Confidence Score
**7/10** — High confidence on the component and page structure. The main risk areas are:
1. **Domain stats aggregation** — joining multiple tables for counts/severity per domain may require creative Supabase queries or an RPC; exact query patterns will need iteration
2. **Phase 3 data availability** — scoring pipeline may not have run, so many enrichment fields (authority_level, practice relevance, service lines) may be null; all UI must handle empty states gracefully
3. **Search vector query syntax** — need to verify Supabase JS client's `.textSearch()` works correctly with the `search_vector` column
4. **Relationship foreign key joins** — Supabase's embedded select syntax for joining kg_relationships → kg_entities needs exact FK naming from the schema
