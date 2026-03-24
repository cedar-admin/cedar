name: "Admin UI library curation and design ops v1"

## Goal
Refine Cedar's existing admin-only `/system/ui` workspace into a smaller, more operationally useful design-system reference that keeps the routed architecture but narrows v1 to the highest-value Cedar patterns. The result should feel closer to the *usefulness* of the Supabase Design System docs: clear sectioning, strong page contracts, live real-component previews, and pattern guidance that helps us make implementation decisions quickly.

**Measurable end state:** `/system/ui` remains admin-only and routed, but the seeded inventory is reduced from the current broad 16-page set to a curated core set. Each page documents a real Cedar foundation, component, or pattern with: status, when to use, hard rules, anatomy, live example, where it is used in Cedar today, and links to the governing Cedar docs.

## Why
- The current routed library solved the architecture problem, but v1 is still too broad. It reads like a seeded reference set rather than a sharp design-ops workspace.
- Cedar's biggest design-system risks are not "missing every possible page." They are drift in a small set of recurring decisions: hierarchy, trust signaling, semantic color, surface nesting, collection headers, table behavior, and detail-page composition.
- Supabase's current design-system docs are useful because they separate introduction, patterns, and component layers clearly, and their pattern pages explain composition decisions instead of only rendering examples. Cedar should mirror that rigor while staying Cedar-native in structure and implementation.
- v1 should optimize for operational leverage: if a teammate is building or reviewing UI, `/system/ui` should answer "what should I use?" in under 3 minutes.
- This is still MVP-era internal tooling. No Storybook, no MDX docs stack, no external docs site, no attempt to document every atom in the system.

## Success Criteria
- [ ] `/system/ui` remains admin-only and continues to redirect non-admin users to `/home`
- [ ] The routed shell and left-nav remain intact, but the seeded v1 inventory is reduced to a curated core set instead of the current broad 16-page spread
- [ ] The v1 IA still separates `Foundations`, `Components`, and `Patterns`
- [ ] Every seeded detail page uses the same documentation contract:
  - status
  - short description
  - when to use
  - hard rules
  - anatomy or composition notes
  - live example using real Cedar components/tokens
  - "Used in Cedar" references
  - governing Cedar docs
- [ ] Statuses remain first-class and visible (`Approved`, `Candidate`, `Experimental`), with metadata-driven rendering in nav and page headers
- [ ] At least one page is explicitly marked `candidate` so the status lifecycle is real, not decorative
- [ ] Deferred pages are removed from the seeded v1 nav and documented as follow-up inventory, not left half-canonical in the active library
- [ ] `npm run build` passes with 0 errors, 0 warnings

## Context

### Files to Read First
```yaml
# Cedar design docs
- doc: docs/design-system/design-standards.md
  why: Component props, Cedar token usage, semantic color rules, surface rules

- doc: docs/design-system/frontend-standards.md
  why: Heading hierarchy, landmarks, semantic page structure

- doc: docs/design-system/ux-standards.md
  why: Interaction consistency, clickable rows/cards, hover rules

- doc: docs/design-system/content-standards.md
  why: Sentence case, naming consistency, user-facing copy formulas

- doc: docs/design-system/art-direction.md
  why: 3-second test, Cedar's calm/structured/trustworthy/current bar

- doc: docs/design-system/information-density.md
  why: Tiering, metadata clusters, section spacing, collection-vs-detail density rules

# Existing UI Library implementation
- file: app/system/ui/layout.tsx
  why: Current standalone shell and admin-only guard

- file: app/system/ui/page.tsx
  why: Current overview and content tone

- file: app/system/ui/_lib/nav-config.ts
  why: Current IA, item metadata, and seeded page count

- file: app/system/ui/_lib/DetailPage.tsx
  why: Current page contract is too thin for a design-ops workspace

- file: app/system/ui/_lib/LibraryNav.tsx
  why: Nav rendering, status affordances, active-state behavior

- file: app/system/ui/_lib/PreviewFrame.tsx
  why: Preview framing modes for examples

- file: app/system/ui/foundations/[slug]/page.tsx
  why: Current foundation pages and slugs

- file: app/system/ui/components/[slug]/page.tsx
  why: Current component pages and slugs

- file: app/system/ui/patterns/[slug]/page.tsx
  why: Current pattern pages and slugs

# Audit artifacts that show which patterns most need canonicalization
- file: research/ui-audit/design-audit.md
  why: Baseline drift findings

- file: research/ui-audit/design-audit-delta.md
  why: Which recurring patterns were normalized and should now become canonical docs

- file: research/ui-audit/report.json
  why: Current routed/product surfaces exercised by the UI audit
```

### Current File Tree (relevant subset)
```bash
app/system/ui/
  layout.tsx
  page.tsx
  _lib/
    DetailPage.tsx
    LibraryNav.tsx
    PreviewFrame.tsx
    demo-data.ts
    nav-config.ts
  getting-started/[slug]/page.tsx
  foundations/[slug]/page.tsx
  components/[slug]/page.tsx
  patterns/[slug]/page.tsx
```

### Files to Create or Modify
```bash
# Existing routed workspace, refined rather than replaced
app/system/ui/page.tsx                         (M) Rewrite overview into a sharper design-ops index
app/system/ui/_lib/nav-config.ts              (M) Reduce seeded inventory; enrich metadata for status, docs, and usage references
app/system/ui/_lib/DetailPage.tsx             (M) Expand the standard page contract beyond title/description
app/system/ui/_lib/LibraryNav.tsx             (M) Support curated IA and stronger status signaling
app/system/ui/_lib/PreviewFrame.tsx           (M) Add any framing tweaks needed for anatomy/live examples
app/system/ui/_lib/demo-data.ts               (M) Keep only sample data needed by curated v1 pages
app/system/ui/getting-started/[slug]/page.tsx (M) Narrow to a single overview/how-to-use page
app/system/ui/foundations/[slug]/page.tsx     (M) Trim and rewrite foundation pages around Cedar's real decision points
app/system/ui/components/[slug]/page.tsx      (M) Trim and rewrite component pages around Cedar composites that matter operationally
app/system/ui/patterns/[slug]/page.tsx        (M) Focus pattern docs on recurring composition problems
STATUS.md                                     (M) Update current state and next priority after implementation
```

### Known Gotchas
```typescript
// ROUTING:
// - These routes already exist in app/system/ui, not app/(admin)/system/ui.
// - Admin access is enforced in app/system/ui/layout.tsx via getLayoutData(); preserve that.
// - generateStaticParams() is driven by nav-config. Removing slugs requires keeping the route handlers in sync.
//
// SCOPE:
// - Do not add Storybook, MDX, Contentlayer, Nextra, or any external docs tooling.
// - Do not create a parallel component gallery disconnected from real Cedar components.
// - Do not try to document every atom in Radix Themes. Cedar's value is in its usage guidance and composites.
//
// CONTENT MODEL:
// - The library must stay routed and browseable.
// - The page contract must stay consistent across all seeded pages.
// - Copy must be sentence case and follow content-standards.md.
//
// DESIGN-SYSTEM FIT:
// - Examples must use Cedar's real tokens/components, not faux generic samples.
// - Avoid long-scroll encyclopedic pages. The routed IA is already correct.
// - Statuses must be meaningful. Avoid marking every page approved by default.
```

## Architecture

### IA direction for curated v1

Keep the current routed shell and left navigation. Change the *inventory strategy*.

The official Supabase Design System currently separates its docs into an introduction plus higher-order buckets like UI patterns, fragment components, and atom components, and its UI pattern docs emphasize composition guidance over raw component display. Cedar should borrow that structural discipline, but adapt it to Cedar's own docs and component stack:

```text
Cedar UI Library v1

Getting started
  Overview

Foundations
  Typography
  Semantic color and status
  Surfaces and spacing

Components
  Section heading
  AI trust
  Filter pills

Patterns
  Page layout
  Collection pages
  Detail pages
  Tables
```

This yields a v1 that is intentionally smaller, but still covers the decisions most likely to drift.

### Deferred inventory

These should not stay seeded in active v1 unless they are rewritten to the same quality bar:

- Buttons
- Domain card
- Navigation
- Empty states
- Collection header
- Detail header
- Settings section

Document them as follow-up inventory in the overview or PRP notes instead of leaving them as broad-but-thin active pages.

### Page contract for every seeded detail page

Every active page should answer these questions in the same order:

1. What is this?
2. When should I use it?
3. What rules are non-negotiable?
4. What is the approved anatomy/composition?
5. What does the real Cedar implementation look like?
6. Where is it already used in the product?
7. Which Cedar docs govern it?

That means each `LibraryNavItem` should carry enough metadata to support:

- status
- short description
- optional file path or component path
- list of governing docs
- list of live Cedar usage references
- optional related pages

## Tasks (execute in order)

### Task 1: Re-scope the seeded inventory
**File:** `app/system/ui/_lib/nav-config.ts`
**Action:** MODIFY
**Pattern:** Follow the current metadata-driven nav model, but make it richer and smaller

```typescript
// Replace the current "16 approved pages by default" seed set with a curated v1.
// Keep group structure, but reduce active pages to the core inventory defined above.
// Extend item metadata so DetailPage can render:
// - status
// - description
// - optional filePath
// - governingDocs: Array<{ label, href }>
// - usedIn: Array<{ label, href }>
// - optional related: Array<{ label, href }>
//
// Make at least one page `candidate`.
// Avoid inventing placeholder pages that do not correspond to a real Cedar implementation need.
```

### Task 2: Upgrade the standard page contract
**File:** `app/system/ui/_lib/DetailPage.tsx`
**Action:** MODIFY
**Depends on:** Task 1

```typescript
// Evolve DetailPage from a simple title wrapper into a reusable documentation scaffold.
// It should support a consistent header plus metadata blocks such as:
// - used in Cedar
// - governing docs
// - related pages
//
// Keep the page structure semantic:
// - one h1
// - h2 sections
// - sentence-case section titles
//
// Do not hardcode page-specific copy here; provide layout slots and small shared helpers only.
```

### Task 3: Rewrite the overview as an operations index
**File:** `app/system/ui/page.tsx`
**Action:** MODIFY
**Depends on:** Task 1

```typescript
// The overview should stop reading like a general intro page and start acting like a design-ops home.
// Include:
// - what this library is for
// - how to choose between Foundations / Components / Patterns
// - the status lifecycle (approved/candidate/experimental)
// - the curated v1 inventory
// - deferred pages / next expansion areas
//
// Optimize for orientation in under 3 minutes, not narrative prose.
```

### Task 4: Rewrite the seeded detail pages around Cedar's real drift points
**Files:**
- `app/system/ui/getting-started/[slug]/page.tsx`
- `app/system/ui/foundations/[slug]/page.tsx`
- `app/system/ui/components/[slug]/page.tsx`
- `app/system/ui/patterns/[slug]/page.tsx`
**Action:** MODIFY
**Depends on:** Tasks 1–3

```typescript
// Trim out broad or low-leverage pages and rewrite the remaining pages to the stronger contract.
// Each page should use real Cedar components and examples, not generic filler.
//
// Prioritize content that directly reinforces the recent audit/fix work:
// - Typography: heading scale, label scale, metric values
// - Semantic color and status: severity/status/authority confidence rules
// - Surfaces and spacing: nested surface rule, section rhythm
// - Section heading: canonical heading component
// - AI trust: badge + disclaimer behavior
// - Filter pills: URL-driven filtering pattern
// - Page layout: collection vs detail vs settings anatomy
// - Collection pages: title/count/filter/section ordering
// - Detail pages: identity cluster, timing cluster, AI summary placement
// - Tables: ghost vs surface, clickable rows, chevrons, column order
//
// Remove the pages that do not meet the v1 usefulness bar instead of keeping them half-documented.
```

### Task 5: Refine navigation/status affordances
**Files:**
- `app/system/ui/_lib/LibraryNav.tsx`
- `app/system/ui/_lib/PreviewFrame.tsx`
- `app/system/ui/_lib/demo-data.ts`
**Action:** MODIFY
**Depends on:** Tasks 1–4

```typescript
// Nav should make the curated set feel intentional, not sparse.
// Improve status signaling without adding visual noise.
// PreviewFrame should still support inline/contained/full-width, but prioritize the layouts needed
// by the retained pages. Remove sample data that only served deleted pages.
```

### Task 6: Update project tracking
**File:** `STATUS.md`
**Action:** MODIFY
**Depends on:** Task 5

```markdown
Update:
- what changed in /system/ui
- why the inventory was narrowed
- what pages remain deferred
- what the next UI-library expansion area is after this PRP
```

## Integration Points
```yaml
DATABASE:
  - None

INNGEST:
  - None

API ROUTES:
  - None

UI:
  - /system/ui shell stays in place
  - nav-config drives all routed documentation pages
  - page content should reference real product routes/components where helpful

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
# 1. Sign in as an admin and open /system/ui
#    Expect: library loads with curated nav and overview content
#
# 2. Visit each seeded page from the nav
#    Expect: active state works, one h1 per page, status badge renders, content contract is consistent
#
# 3. Verify at least one candidate page renders correctly in both nav and page header
#    Expect: status appears in both places and is visually distinct from approved
#
# 4. Attempt /system/ui as a non-admin user
#    Expect: redirect to /home
#
# 5. Spot-check Cedar usage references shown on detail pages
#    Expect: paths/routes referenced are real and current
```

## Anti-Patterns
- ❌ Do not rebuild `/system/ui` as a long-scroll monolith
- ❌ Do not keep 16+ pages seeded just to look comprehensive
- ❌ Do not turn the library into a generic Radix gallery; it must stay Cedar-native
- ❌ Do not leave every page marked `approved`
- ❌ Do not copy Supabase branding, component code, or IA verbatim
- ❌ Do not duplicate large chunks of the six Cedar design docs word-for-word; summarize and link them
- ❌ Do not add external docs tooling in v1
