name: "Admin UI library interface and design ops workspace"

## Goal

Build an internal admin-only **UI Library** at `/system/ui` — a routed, navigable design operations workspace modeled after the organizational quality and documentation rigor of the Supabase Design System docs. Each topic gets its own routed page with structured guidance (when to use, rules, live examples, variants). A dedicated shell with left-side navigation provides browsable access across four sections: Getting Started, Foundations, Components, and UI Patterns.

**Measurable end state:** A multi-page admin-only UI Library with a shared shell, left navigation, an overview page, and **16 curated detail pages** — each following a consistent Supabase-inspired content model with guidance text, usage rules, and live rendered examples. The architecture supports future expansion to dozens more pages without structural changes.

## Why

- **Design drift prevention:** Cedar has 16 pages and 25+ composite components. Without a canonical rendered reference, patterns diverge silently. This interface is the single source of truth for "what does the approved version look like and when should I use it?"
- **Design ops workflow:** Today, new patterns go straight into product screens. This creates a staging step: implement in the library first, review there, then propagate. Future PRPs add candidate variants here, compare side by side, and promote winners.
- **Why Supabase-quality documentation matters:** Rendering a component is not documentation. Supabase's design system succeeds because every page answers "when to use this," "how to use it well," and "what to avoid" — not just "here's what it looks like." Cedar needs the same rigor to scale from 16 to 50+ pages without drift.
- **Why routed pages instead of one long scroll:**
  - Large patterns (tables, detail headers, layout compositions) need full-width preview space
  - 29+ items on one page violates Cedar's information-density rules
  - Routable URLs let PRPs reference patterns directly: "Match `/system/ui/patterns/tables`"
  - Adding a candidate variant means editing one page, not a monolith
  - Left navigation makes the full inventory scannable in 3 seconds (art-direction's "3-second test")
- **Why a curated v1 instead of 29 pages immediately:** Quality over quantity. 16 well-documented pages with proper guidance establish the right content model. Filling 29 slots with thin "here's the component rendered" pages would undermine the Supabase-quality bar and create tech debt from day one.

## Success Criteria

- [ ] `/system/ui` overview page renders for admin users; non-admins redirect to `/home`
- [ ] Left navigation renders 4 groups with v1 items: Getting Started (1), Foundations (4), Components (5), UI Patterns (6)
- [ ] Clicking a nav item navigates to the correct detail page with active state
- [ ] Every detail page follows the standard content model: title, description, when to use, usage rules, live examples, status
- [ ] Live examples render real Cedar components with realistic sample data
- [ ] Full-width pattern pages (layout, tables, collection-header) use the full available content width
- [ ] Status badges render correctly: `Approved` (green soft), `Candidate` (amber soft), `Experimental` (blue soft)
- [ ] Architecture supports adding new pages by adding to nav-config + creating a render case (no structural changes)
- [ ] Sidebar nav entry "UI library" appears under Admin section for admin users only
- [ ] `npm run build` passes with 0 errors, 0 warnings

## Context

### Files to Read First
```yaml
# Design system references (critical — the UI Library must exemplify these rules)
- doc: docs/design-system/design-standards.md
  why: Component variant rules, surface nesting, badge/button rules, spacing

- doc: docs/design-system/frontend-standards.md
  why: Heading hierarchy (h1→h2→h3), landmark elements, as prop on every Heading

- doc: docs/design-system/ux-standards.md
  why: Page structure, empty states, interaction patterns, clickable collections

- doc: docs/design-system/content-standards.md
  why: Sentence case everywhere, controlled vocabulary, microcopy rules

- doc: docs/design-system/art-direction.md
  why: Visual tone — calm, structured, trustworthy. Five anti-pattern categories.

- doc: docs/design-system/information-density.md
  why: Section spacing (32px between), metadata clustering, density parameters

# Admin route and layout patterns
- file: app/(admin)/layout.tsx
  why: Admin auth guard — role !== 'admin' redirects to /home. Wraps children in SidebarShell.

- file: app/(admin)/system/page.tsx
  why: Existing admin page pattern — metadata export, Flex/Heading/Card layout

# Shell and navigation
- file: components/SidebarShell.tsx
  why: Outer shell — flex h-screen, sidebar + content area with max-w-5xl mx-auto + BreadcrumbNav

- file: components/Sidebar.tsx
  why: ADMIN_NAV array. Active link logic: pathname.startsWith(href).

- file: components/SidebarLink.tsx
  why: Nav link active state: pathname === href || pathname.startsWith(href)

# Components to render (read each for exact prop interfaces)
- file: components/SectionHeading.tsx
  props: "{ as?: 'h2'|'h3'|'h4'; variant?: 'card'|'standalone'; id?; children; mb? }"

- file: components/FilterPills.tsx
  props: "{ pills: Array<{ label; href; isActive; activeClass? }> }"

- file: components/AiBadge.tsx
  props: "(no props) — also exports AiDisclaimer (no props)"

- file: components/HashWithCopy.tsx
  props: "{ hash: string; displayLength?: number }"

- file: components/DomainCard.tsx
  props: "{ domain: { name, slug, description, color }; regulationCount; recentChangeCount; highestSeverity; headingLevel?; className? }"

- file: components/SeverityBadge.tsx
  props: "{ severity: string | null; className? }"

- file: components/StatusBadge.tsx
  props: "{ status: string }"

- file: components/AuthorityBadge.tsx
  props: "{ level: string | null; className? }"

- file: components/ConfidenceBadge.tsx
  props: "{ confidence: number | null; className? }"

- file: components/DeadlineChip.tsx
  props: "{ date: string | null; label?; className? }"

- file: components/EmptyState.tsx
  props: "{ icon: string; title: string; description: string }"

- file: components/UpgradeBanner.tsx
  props: "{ feature: string }"

# Supporting utilities
- file: lib/ui-constants.ts
  why: SEVERITY_COLOR, STATUS_COLOR, AUTHORITY_LEVEL_COLOR, AUTHORITY_LEVEL_LABEL, STATUS_LABEL, SEVERITIES

- file: lib/format.ts
  why: timeAgo, formatDate, capitalize, daysUntil utilities

# Token definitions
- file: app/globals.css
  why: All 57 --cedar-* token definitions
```

### Files to Create or Modify
```bash
# Shared infrastructure (6 files)
app/(admin)/system/ui/layout.tsx              (+) UI Library shell — secondary left nav + content area
app/(admin)/system/ui/_lib/nav-config.ts      (+) Navigation structure, item definitions, status metadata
app/(admin)/system/ui/_lib/demo-data.ts       (+) Shared sample data for all previews
app/(admin)/system/ui/_lib/PreviewFrame.tsx    (+) Preview wrapper for inline/contained/full-width modes
app/(admin)/system/ui/_lib/LibraryNav.tsx      (+) Client component — left navigation with active state
app/(admin)/system/ui/_lib/DetailPage.tsx      (+) Shared detail page wrapper — consistent content model

# Pages (5 files — 1 overview + 4 dynamic route files serving 16 total pages)
app/(admin)/system/ui/page.tsx                            (+) Overview / introduction
app/(admin)/system/ui/getting-started/[slug]/page.tsx     (+) Getting started pages (1 slug in v1)
app/(admin)/system/ui/foundations/[slug]/page.tsx          (+) Foundation detail pages (4 slugs in v1)
app/(admin)/system/ui/components/[slug]/page.tsx           (+) Component detail pages (5 slugs in v1)
app/(admin)/system/ui/patterns/[slug]/page.tsx             (+) UI Pattern detail pages (6 slugs in v1)

# Sidebar modification
components/Sidebar.tsx                                     (M) Add nav entry to ADMIN_NAV
```

### Known Gotchas
```typescript
// ROUTING:
// - _lib/ prefix = Next.js private folder, not treated as a route segment
// - Dynamic [slug] routes need generateStaticParams() since slugs are known at build time
// - SidebarLink active logic: pathname.startsWith(href) — /system/ui stays active across all sub-routes
//
// LAYOUT:
// - SidebarShell wraps content in <Box p={{ initial: '4', md: '6' }} className="max-w-5xl mx-auto">
// - The UI Library layout sits INSIDE that box. Available width is ~960px.
// - Left nav takes ~220px, content gets ~740px — sufficient for all preview sizes.
// - "Full-width" means filling available content width, not viewport width.
//
// COMPONENTS:
// - HashWithCopy and FilterPills are 'use client' — fine as client islands in server pages
// - FilterPills needs href props — use "#" anchors for non-navigating demos
// - DomainCard links to /library/{slug} — use realistic but clearly fake slugs
// - DeadlineChip needs a future date string — compute dynamically via helper
// - EmptyState icon prop takes Remix icon class names (e.g., 'ri-inbox-line')
//
// DESIGN SYSTEM:
// - Every <Heading> must have explicit `as` prop
// - Sentence case on ALL labels and headings
// - Section spacing: gap="6" (32px) between, gap="2"–"3" within
// - Table inside Card → variant="ghost" (nested surface rule)
// - No <Text> without as="span" inside inline elements
// - No database queries — all examples use hardcoded sample data
```

## Architecture

### Information Architecture (Supabase-Inspired)

Supabase's design system uses four tiers: Getting Started → UI Patterns → Fragment Components → Atom Components. Cedar adapts this into four groups that map to Cedar's own design system structure:

```
CEDAR UI LIBRARY                    SUPABASE EQUIVALENT
─────────────────                   ───────────────────
Getting Started                     Getting Started
  Overview (introduction)             Introduction

Foundations                         Getting Started (deeper topics)
  Typography                          Typography
  Buttons                             (part of Atom Components)
  Badges and semantic color           Color Usage
  Surfaces                            Theming

Components                          Fragment Components
  Section heading                     Page Header / Page Section
  Filter pills                        Filter Bar
  AI trust                            (no equivalent — Cedar-specific)
  Hash with copy                      (no equivalent — Cedar-specific)
  Domain card                         Metric Card

UI Patterns                         UI Patterns
  Layout                              Layout
  Navigation                          Navigation
  Tables                              Tables
  Empty states                        Empty States
  Collection header                   (part of Layout)
  Detail header                       (part of Layout)
  Settings section                    (part of Forms/Layout)
```

### Route Structure (v1 — 16 curated pages)

```
/system/ui                                    → Overview introduction
/system/ui/getting-started/overview           → What this library is, how to use it, content model
/system/ui/foundations/typography              → Type scale, weights, usage rules
/system/ui/foundations/buttons                 → Button variants, when to use each
/system/ui/foundations/badges                  → All badge types, semantic color system
/system/ui/foundations/surfaces                → Card/table surfaces, nesting rules
/system/ui/components/section-heading         → SectionHeading variants and usage
/system/ui/components/filter-pills            → FilterPills usage and integration
/system/ui/components/ai-trust                → AiBadge + AiDisclaimer pattern
/system/ui/components/hash-with-copy          → HashWithCopy usage
/system/ui/components/domain-card             → DomainCard usage and props
/system/ui/patterns/layout                    → Page anatomy, container sizes, spacing
/system/ui/patterns/navigation                → Sidebar, breadcrumbs, page titles, URL state
/system/ui/patterns/tables                    → Table patterns: ghost/surface, row click, sort
/system/ui/patterns/empty-states              → Three empty state types, copy rules
/system/ui/patterns/collection-header         → Collection page header composition
/system/ui/patterns/detail-header             → Detail page metadata cluster composition
/system/ui/patterns/settings-section          → Settings card composition
```

### Future expansion (not in v1, but architecture supports)

```
/system/ui/foundations/empty-states            → (currently in patterns — could split later)
/system/ui/foundations/filter-pills            → (currently in components)
/system/ui/foundations/section-headings        → (currently in components)
/system/ui/components/severity-badge           → individual badge pages
/system/ui/components/status-badge
/system/ui/components/authority-badge
/system/ui/components/confidence-badge
/system/ui/components/deadline-chip
/system/ui/components/empty-state
/system/ui/components/upgrade-banner
/system/ui/patterns/forms                      → form layout patterns
/system/ui/patterns/modality                   → dialog/sheet decision framework
/system/ui/patterns/charts                     → if Cedar adds data viz
/system/ui/patterns/feed-list                  → feed/list inside card
/system/ui/patterns/activity-row               → activity feed row
/system/ui/patterns/audit-row                  → audit row with hash
/system/ui/patterns/upgrade-gated              → upgrade-gated block
```

Adding any of these is: 1 entry in nav-config, 1 render case in the appropriate `[slug]/page.tsx`.

### Access Strategy

**Auth:** Inherits from `app/(admin)/layout.tsx` — `role !== 'admin'` redirects to `/home`.

**Sidebar entry:** Add to `ADMIN_NAV` in `components/Sidebar.tsx`:
```typescript
{ href: '/system/ui', label: 'UI library', icon: 'ri-palette-line' },
```

### Standard Content Model (Per Page)

Every detail page in the library follows a consistent content model inspired by Supabase's pattern pages. This is what elevates the library from "component gallery" to "design documentation":

```
┌──────────────────────────────────────────────────────────┐
│ [h1] Page title                          [Status badge]  │
│ [description — 1-2 sentences]                            │
│ [file path, if applicable — monospace muted]             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ WHEN TO USE                                              │
│ Concise guidance on when this pattern/component is the   │
│ right choice. Bullet points. Decision criteria.          │
│ "Use X when..." / "Choose X over Y when..."             │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ USAGE RULES                                              │
│ Specific rules and constraints:                          │
│ - Required props/configurations                          │
│ - Variant selection guidance                             │
│ - Spacing/layout requirements                            │
│ - Accessibility requirements                             │
│ - What NOT to do (forbidden patterns)                    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ EXAMPLES                                                 │
│ Live rendered examples with labels:                      │
│ ┌─ PreviewFrame ──────────────────────────────────────┐  │
│ │  [Rendered component/pattern with sample data]      │  │
│ └─────────────────────────────────────────────────────┘  │
│ Caption: variant name or context                         │
│                                                          │
│ [Additional examples for variants/states as needed]      │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ VARIANTS (if applicable)                                 │
│ Visual comparison of variant options with labels.        │
│ Candidate/experimental variants clearly separated.       │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ NOTES (optional)                                         │
│ Adoption notes, cross-references, future considerations. │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

Not every page needs every section. The minimum is: title, description, status, when to use, examples. Foundations pages lean heavier on rules; pattern pages lean heavier on examples and decision frameworks.

### Content Model Implementation

The `DetailPage` wrapper provides the structural scaffolding. Each individual page provides the content:

```typescript
// DetailPage.tsx renders:
// - h1 + status badge (from LibraryNavItem)
// - description (from LibraryNavItem)
// - filePath caption (from LibraryNavItem, if present)
// - {children} — the page provides the rest

// Each page.tsx provides sections via:
<DetailPage item={item}>
  <ContentSection heading="When to use">
    {/* Prose + bullet points */}
  </ContentSection>

  <ContentSection heading="Usage rules">
    {/* Rules + forbidden patterns */}
  </ContentSection>

  <ContentSection heading="Examples">
    <PreviewFrame size="inline" label="Severity badges">
      {/* Live rendered examples */}
    </PreviewFrame>
  </ContentSection>
</DetailPage>
```

`ContentSection` is a lightweight helper that renders an h2 heading with consistent styling and spacing. It's not a separate file — it's part of `DetailPage.tsx`:

```typescript
function ContentSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Flex direction="column" gap="3">
      <Heading as="h2" size="4" weight="medium">{heading}</Heading>
      {children}
    </Flex>
  )
}
```

### UI Library Shell (layout.tsx)

Two-column layout inside the existing `SidebarShell` content area:

```
┌─────────────────────────────────────────────────────┐
│ SidebarShell (existing)                             │
│ ┌──────────┬──────────────────────────────────────┐ │
│ │ Main     │  UI Library layout.tsx                │ │
│ │ Sidebar  │ ┌────────────┬───────────────────────┐│ │
│ │          │ │ LibraryNav │  Detail content        ││ │
│ │          │ │            │  (page.tsx children)   ││ │
│ │          │ │ Getting    │                        ││ │
│ │          │ │ Started    │  [h1] Tables           ││ │
│ │          │ │  Overview  │  [Approved badge]      ││ │
│ │          │ │ ─────────  │  [description]         ││ │
│ │          │ │ Foundations│                        ││ │
│ │          │ │  Typography│  When to use            ││ │
│ │          │ │  Buttons   │  ...                   ││ │
│ │          │ │  Badges    │  Usage rules            ││ │
│ │          │ │  Surfaces  │  ...                   ││ │
│ │          │ │ ─────────  │  Examples               ││ │
│ │          │ │ Components │  [full-width preview]  ││ │
│ │          │ │  Section   │                        ││ │
│ │          │ │  Filter    │                        ││ │
│ │          │ │  AI trust  │                        ││ │
│ │          │ │  Hash copy │                        ││ │
│ │          │ │  Domain    │                        ││ │
│ │          │ │ ─────────  │                        ││ │
│ │          │ │ UI Patterns│                        ││ │
│ │          │ │  Layout    │                        ││ │
│ │          │ │  Navigation│                        ││ │
│ │          │ │  Tables    │                        ││ │
│ │          │ │  Empty st. │                        ││ │
│ │          │ │  Collection│                        ││ │
│ │          │ │  Detail hdr│                        ││ │
│ │          │ │  Settings  │                        ││ │
│ │          │ └────────────┴───────────────────────┘│ │
│ └──────────┴──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Left column:** `LibraryNav` — 220px, sticky top, scrollable overflow, right border
**Right column:** detail content — fills remaining ~740px width

### Left Navigation (LibraryNav)

Client component using `usePathname()` for active state:

```
GETTING STARTED                   ← group label (muted, uppercase, size 1)
  Overview                        ← active: selected bg + font-medium

FOUNDATIONS
  Typography
  Buttons
  Badges and semantic color
  Surfaces

COMPONENTS
  Section heading
  Filter pills
  AI trust
  Hash with copy
  Domain card

UI PATTERNS
  Layout
  Navigation
  Tables
  Empty states
  Collection header
  Detail header
  Settings section
```

- Active item: `bg-[var(--cedar-interactive-selected)]`, `font-medium`, `text-[var(--cedar-text-primary)]`
- Inactive: `text-[var(--cedar-text-secondary)]`, hover `bg-[var(--cedar-interactive-hover)]`
- Group labels: non-interactive, `<Text size="1" weight="bold" className="uppercase tracking-wider text-[var(--cedar-text-muted)]">` — matching the Admin separator style in the main sidebar
- Candidate/experimental items: small colored dot (amber/blue) next to label
- Wrapped in `<nav aria-label="UI library">`
- Items: `<Link>` with `min-h-[36px]` touch targets

### Navigation Config (nav-config.ts)

```typescript
export type LibraryItemStatus = 'approved' | 'candidate' | 'experimental'

export interface LibraryNavItem {
  slug: string
  label: string           // sentence case, displayed in nav and page title
  status: LibraryItemStatus
  description: string     // 1-2 sentence description for detail page header
  filePath?: string       // optional source file path
}

export interface LibraryNavGroup {
  key: 'getting-started' | 'foundations' | 'components' | 'patterns'
  label: string
  basePath: string        // e.g., '/system/ui/foundations'
  items: LibraryNavItem[]
}

export const LIBRARY_NAV: LibraryNavGroup[] = [
  {
    key: 'getting-started',
    label: 'Getting started',
    basePath: '/system/ui/getting-started',
    items: [
      {
        slug: 'overview',
        label: 'Overview',
        status: 'approved',
        description: 'What the UI Library is, who it serves, and how to use it effectively.',
      },
    ],
  },
  {
    key: 'foundations',
    label: 'Foundations',
    basePath: '/system/ui/foundations',
    items: [
      {
        slug: 'typography',
        label: 'Typography',
        status: 'approved',
        description: 'Type scale, weights, and intended usage for page titles, headings, body, and captions.',
      },
      {
        slug: 'buttons',
        label: 'Buttons',
        status: 'approved',
        description: 'Primary, secondary, tertiary, destructive, and icon-only button variants with selection guidance.',
      },
      {
        slug: 'badges',
        label: 'Badges and semantic color',
        status: 'approved',
        description: 'Severity, status, authority, role/tier, and confidence badge color mappings. The complete Cedar semantic color system.',
      },
      {
        slug: 'surfaces',
        label: 'Surfaces',
        status: 'approved',
        description: 'Card and table surface variants, including the nested surface rule and when to use ghost vs surface.',
      },
    ],
  },
  {
    key: 'components',
    label: 'Components',
    basePath: '/system/ui/components',
    items: [
      {
        slug: 'section-heading',
        label: 'Section heading',
        status: 'approved',
        description: 'Card and standalone section heading variants for consistent labeling.',
        filePath: 'components/SectionHeading.tsx',
      },
      {
        slug: 'filter-pills',
        label: 'Filter pills',
        status: 'approved',
        description: 'URL-driven horizontal pill bar for collection filtering.',
        filePath: 'components/FilterPills.tsx',
      },
      {
        slug: 'ai-trust',
        label: 'AI trust',
        status: 'approved',
        description: 'AI-generated badge and legal disclaimer pattern for all AI-produced content.',
        filePath: 'components/AiBadge.tsx',
      },
      {
        slug: 'hash-with-copy',
        label: 'Hash with copy',
        status: 'approved',
        description: 'Truncated hash display with clipboard copy action for audit trail references.',
        filePath: 'components/HashWithCopy.tsx',
      },
      {
        slug: 'domain-card',
        label: 'Domain card',
        status: 'approved',
        description: 'Clickable domain card with severity indicator, regulation count, and full-surface click target.',
        filePath: 'components/DomainCard.tsx',
      },
    ],
  },
  {
    key: 'patterns',
    label: 'UI patterns',
    basePath: '/system/ui/patterns',
    items: [
      {
        slug: 'layout',
        label: 'Layout',
        status: 'approved',
        description: 'Page anatomy, container sizing, section spacing, and the three Cedar page types.',
      },
      {
        slug: 'navigation',
        label: 'Navigation',
        status: 'approved',
        description: 'Sidebar structure, breadcrumbs, page titles, URL state encoding, and wayfinding rules.',
      },
      {
        slug: 'tables',
        label: 'Tables',
        status: 'approved',
        description: 'Data table patterns: surface vs ghost, clickable rows, column ordering, and pagination.',
      },
      {
        slug: 'empty-states',
        label: 'Empty states',
        status: 'approved',
        description: 'Three empty state types: first use, no filter results, and error loading.',
      },
      {
        slug: 'collection-header',
        label: 'Collection header',
        status: 'approved',
        description: 'Standard page header composition with title, count badge, and filter pill bar.',
      },
      {
        slug: 'detail-header',
        label: 'Detail header',
        status: 'approved',
        description: 'Detail page metadata cluster: title, badges, source info, and effective dates.',
      },
      {
        slug: 'settings-section',
        label: 'Settings section',
        status: 'approved',
        description: 'Settings card composition with heading, description, and form control.',
      },
    ],
  },
]

// Helper: get all slugs for generateStaticParams()
export function getAllSlugs(groupKey: string): string[] { ... }

// Helper: find item by group + slug
export function getLibraryItem(groupKey: string, slug: string): LibraryNavItem | undefined { ... }
```

### Status Model

| Status | Badge | Meaning |
|---|---|---|
| `Approved` | `<Badge color="green" variant="soft">Approved</Badge>` | Canonical. Use in production. This is how the pattern looks and behaves everywhere. |
| `Candidate` | `<Badge color="amber" variant="soft">Candidate</Badge>` | Proposed for adoption. Under active review. May change before promotion. |
| `Experimental` | `<Badge color="blue" variant="soft">Experimental</Badge>` | Exploratory. Testing an idea. Not intended for production in current form. |

**How status appears on pages:**
- Status badge renders immediately after the h1 title on every detail page (part of `DetailPage` wrapper)
- In the left nav, candidate/experimental items show a small colored dot next to their label
- The overview page groups items by status — approved first, then any candidates below a separator

**Promotion workflow:**
1. Future PRP adds item to `nav-config.ts` with `status: 'candidate'`
2. Adds render content in the appropriate `[slug]/page.tsx`
3. After review, changes `status` to `'approved'` and removes/updates superseded version
4. Follow-up PRP propagates the pattern to production screens

### Preview Model

Three sizes, chosen based on what's being documented:

| Size | CSS | Use for | Examples |
|---|---|---|---|
| `inline` | `<Flex wrap="wrap" gap="3" align="center">` | Small atoms that flow horizontally | Badges, buttons, pills, headings |
| `contained` | `<Box className="max-w-md">` | Mid-sized self-contained items | Cards, empty states, individual components |
| `full-width` | `<Box className="w-full">` | Large compositions needing full content width | Table sections, detail headers, collection headers, settings layouts |

**Selection rule:** If the pattern is wider than 448px (max-w-md) when rendered at its natural size, use `full-width`. If it's a single-line element like a badge row, use `inline`. Everything else uses `contained`.

`PreviewFrame` wraps each example in a subtle bordered container (`border border-[var(--cedar-border-subtle)] rounded-lg p-4 bg-[var(--cedar-page-bg)]`) with an optional label above as `<Text size="1" color="gray">`.

### Demo Data (demo-data.ts)

Centralized sample data used across all pages:

```typescript
export const SAMPLE_HASHES = {
  sha256: 'a1b2c3d4e5f67890abcdef1234567890a1b2c3d4e5f67890abcdef1234567890',
}

export const SAMPLE_DOMAIN = {
  name: 'Board of Medicine',
  slug: 'board-of-medicine',
  description: 'Florida Board of Medicine rules, orders, and disciplinary actions affecting licensed physicians.',
  color: null,
}

export const SAMPLE_FILTER_PILLS = [
  { label: 'All', href: '#', isActive: true },
  { label: 'Critical', href: '#', isActive: false },
  { label: 'High', href: '#', isActive: false },
  { label: 'Medium', href: '#', isActive: false },
]

export function futureDate(daysFromNow: number): string {
  const d = new Date(); d.setDate(d.getDate() + daysFromNow); return d.toISOString()
}

export const SAMPLE_REGULATIONS = [
  { title: 'Telehealth prescribing requirements updated', severity: 'high', date: '2026-03-20T14:30:00Z', source: 'FL Board of Medicine' },
  { title: 'Compounding pharmacy labeling standards', severity: 'medium', date: '2026-03-18T09:15:00Z', source: 'FL Board of Pharmacy' },
  { title: 'Patient record retention period extended', severity: 'low', date: '2026-03-15T11:00:00Z', source: 'FL Dept of Health' },
]
```

## Tasks (execute in order)

### Task 1: Create nav config
**File:** `app/(admin)/system/ui/_lib/nav-config.ts`
**Action:** CREATE

Define `LIBRARY_NAV`, types, and helpers as specified above. All v1 items are `status: 'approved'`.

### Task 2: Create demo data
**File:** `app/(admin)/system/ui/_lib/demo-data.ts`
**Action:** CREATE

Centralized sample data as specified. Include `futureDate()` helper.

### Task 3: Create PreviewFrame component
**File:** `app/(admin)/system/ui/_lib/PreviewFrame.tsx`
**Action:** CREATE

Server component (no interactivity needed in v1). Three sizes: inline, contained, full-width. Subtle border container with optional label.

### Task 4: Create DetailPage wrapper and ContentSection
**File:** `app/(admin)/system/ui/_lib/DetailPage.tsx`
**Action:** CREATE

Server component. Provides the standard content model:
- h1 + status badge from `LibraryNavItem`
- description
- filePath caption (monospace, muted, if present)
- `{children}` slot for page-specific content

Also exports `ContentSection` — renders an h2 heading with consistent styling:
```typescript
export function ContentSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Flex direction="column" gap="3">
      <Heading as="h2" size="4" weight="medium">{heading}</Heading>
      {children}
    </Flex>
  )
}
```

### Task 5: Create LibraryNav component
**File:** `app/(admin)/system/ui/_lib/LibraryNav.tsx`
**Action:** CREATE

Client component (`'use client'`). Uses `usePathname()`. Renders overview link + 4 groups from `LIBRARY_NAV`. Active state, group labels, candidate dots, `<nav aria-label="UI library">`, sticky positioning.

### Task 6: Create UI Library layout
**File:** `app/(admin)/system/ui/layout.tsx`
**Action:** CREATE

Two-column flex layout. Left: `LibraryNav` (w-[220px], sticky, scrollable, border-right). Right: children (flex-1). Metadata: `title: 'UI library — Cedar Admin'`.

### Task 7: Create overview page (`/system/ui`)
**File:** `app/(admin)/system/ui/page.tsx`
**Action:** CREATE

The library's front door. Content:

- **h1:** "UI library"
- **Description:** "Cedar's internal design reference. Approved patterns, components, and foundations rendered in the real app environment."
- **What this is:** Brief section explaining the library's purpose — a design operations workspace, not a gallery. Reference to Supabase's design system model.
- **How to use it:** Browse the left nav. Each page documents when to use a pattern, the rules, and live examples. Reference patterns by URL in PRPs.
- **Library structure:** Four groups explained:
  - **Foundations:** Design primitives — type, color, surfaces, buttons
  - **Components:** Reusable Cedar composites — badges, pills, cards
  - **UI Patterns:** Higher-order compositions — layout, tables, empty states, headers
- **Status legend:** Approved / Candidate / Experimental with badge examples and definitions
- **Adoption workflow:** Numbered steps: implement → add as candidate → review → promote → propagate via PRP

### Task 8: Create getting-started overview page
**File:** `app/(admin)/system/ui/getting-started/[slug]/page.tsx`
**Action:** CREATE

Dynamic route with `generateStaticParams` from `getAllSlugs('getting-started')`.

**overview** page content:
- **When to use:** "Reference this library before building any new UI, modifying existing pages, or reviewing a PRP that touches the frontend."
- **Usage rules:**
  - Always check the approved pattern before building custom
  - Follow the standard content model for new pages added to this library
  - New patterns enter as candidates first, never directly as approved
  - Reference library URLs in PRPs for pattern consistency
- **The content model:** Explain what every library page contains (title, description, when to use, rules, examples, variants, notes) — meta-documentation of the documentation itself
- **Adding new pages:** Step-by-step: add to nav-config → create render case → write guidance content → set status

### Task 9: Create foundation detail pages
**File:** `app/(admin)/system/ui/foundations/[slug]/page.tsx`
**Action:** CREATE

Dynamic route. Each slug renders structured content following the content model:

**typography:**
- When to use: "Every text element in Cedar uses these scales. No arbitrary font sizes."
- Usage rules: Two weights for most text (400, 600). Bold (700) reserved for page titles and stat values. Every `<Heading>` needs `as` prop. `<Text>` inside inline elements needs `as="span"`.
- Examples (PreviewFrame full-width):
  - Heading sizes 6/5/4/3 with labels (Page title 24px / Section heading 18px / Card title 14px / Subsection)
  - Text sizes 3/2/1 with labels (Reading 16px / Body 14px / Caption 12px)
  - Weight examples: regular, semibold, bold
- Notes: Reference `docs/design-system/design-standards.md` for complete rules.

**buttons:**
- When to use: "Choose button variant by action weight, not by visual preference."
- Usage rules: Primary for main page action (one per viewport). Secondary for supporting actions. Tertiary for utility actions. Destructive inside AlertDialog for high-stakes. Loading state uses Radix `loading` prop. Never custom-style loading.
- Examples (PreviewFrame inline):
  - Row: Primary, Secondary, Tertiary, Destructive, Icon-only — each labeled
  - Destructive dialog pair: confirm (solid red) + cancel (soft gray)
- Forbidden: Custom color on buttons. More than one primary per viewport.

**badges:**
- When to use: "Badges convey categorical status. Use `soft` variant for primary classifications, `outline` for secondary/supporting."
- Usage rules: All badge colors flow through `lib/ui-constants.ts`. Never hardcode badge colors. Never use className overrides on Radix Badge. Same data = same badge appearance everywhere.
- Examples (PreviewFrame full-width, grouped):
  - Severity (5 levels via SeverityBadge): critical, high, medium, low, informational
  - Status (6 states via StatusBadge): approved, auto_approved, pending, pending_review, rejected, not_required
  - Authority (4 levels via AuthorityBadge): federal_statute, federal_regulation, state_statute, state_board_rule
  - Role/tier (3 inline): Admin amber, Intelligence purple, Monitor gray
  - Confidence (3 levels via ConfidenceBadge): 0.92, 0.67, 0.35
- Notes: Badge components are the canonical way to render these values. Never build a one-off badge.

**surfaces:**
- When to use: "Cards provide visual containment for related content. Tables display comparable data."
- Usage rules: Default card variant is `surface`. Clickable cards use `asChild` + hover token. **Nested surface rule:** inner component uses `variant="ghost"` when inside another surfaced component. Quick test: if removing the inner surface looks cleaner without losing information, use ghost.
- Examples (PreviewFrame full-width):
  - Standard card (variant="surface") with paragraph
  - Card + ghost table (3 rows) — labeled "Nested surface rule: table inside card"
  - Stat card (size="2")
  - Ghost card (no-chrome inline)
- Forbidden: Table variant="surface" inside Card variant="surface". Double borders.

### Task 10: Create component detail pages
**File:** `app/(admin)/system/ui/components/[slug]/page.tsx`
**Action:** CREATE

Dynamic route. Each slug follows the content model:

**section-heading:**
- When to use: "Use SectionHeading for all section labels inside cards and standalone page sections. Never use raw Heading for section labeling."
- Usage rules: `variant="card"` inside Card surfaces (size 3). `variant="standalone"` for page-level sections (size 4). Always set `as` prop matching the semantic heading level.
- Examples (PreviewFrame full-width): Both variants rendered, labeled, with context showing Card vs standalone usage
- File path: `components/SectionHeading.tsx`

**filter-pills:**
- When to use: "Use FilterPills on any collection page (changes, sources, library) for category/severity filtering. Always URL-driven — never local state."
- Usage rules: Each pill is a Link with `href`. One pill is always active. Pill labels use sentence case. The "All" pill is always first.
- Examples (PreviewFrame full-width): FilterPills with SAMPLE_FILTER_PILLS
- Notes: Active state tokens: `--cedar-filter-active-bg`, `--cedar-filter-active-text`, `--cedar-filter-active-border`

**ai-trust:**
- When to use: "AiBadge appears on every AI-generated content item at every tier (collection and detail views). AiDisclaimer appears on detail views only, inside the AI content card."
- Usage rules: AiBadge renders inline with other metadata badges. AiDisclaimer renders as the last element inside AI content containers. Never omit either — Cedar's credibility depends on transparent AI labeling.
- Examples (PreviewFrame contained):
  - AiBadge alone (inline context)
  - Card containing sample AI summary text + AiDisclaimer below

**hash-with-copy:**
- When to use: "Use HashWithCopy for any hash value in audit trail views, chain validation displays, and change record metadata."
- Usage rules: Default displayLength is 8 characters. Copy action uses navigator.clipboard. Truncation uses ellipsis character (…). Show full hash only in tooltips or dedicated audit views.
- Examples (PreviewFrame inline): HashWithCopy with sample SHA-256 hash, then another with displayLength={12}

**domain-card:**
- When to use: "Use DomainCard for the domain/category browsing grid on the regulation library page."
- Usage rules: Full-card click via `::after` pseudo-element on heading link. SeverityBadge appears if `highestSeverity` is non-null — positioned above the pseudo-element with `relative z-10`. Description truncated at 2 lines. Set `headingLevel` based on page hierarchy.
- Examples (PreviewFrame contained): DomainCard with SAMPLE_DOMAIN, regulationCount=24, recentChangeCount=3, highestSeverity="high"

### Task 11: Create UI pattern detail pages
**File:** `app/(admin)/system/ui/patterns/[slug]/page.tsx`
**Action:** CREATE

Dynamic route. Pattern pages follow the Supabase model most closely — they document higher-order compositions with decision frameworks and full-width examples.

**layout:**
Inspired directly by Supabase's Layout page. Documents Cedar's page anatomy.
- When to use: "Every Cedar page follows one of three layout types. Choose based on the page's primary purpose."
- Usage rules: Three layout types documented:
  - **Collection layout** (changes, sources, library): collection header + filter bar + data table/card grid. Uses standard section spacing (gap="6"). Max-width from SidebarShell.
  - **Detail layout** (change detail, regulation detail): metadata header cluster + tabbed content. Breadcrumb back-navigation.
  - **Settings layout** (settings, admin pages): card sections with form controls. Single-column, stacked cards.
- Examples (PreviewFrame full-width, one per layout type):
  - Collection: Heading + count badge + FilterPills + ghost table skeleton
  - Detail: metadata cluster + tab bar mockup
  - Settings: stacked cards with headings and switch controls
- Notes: SidebarShell provides `max-w-5xl mx-auto` and `p={{ initial: '4', md: '6' }}`. Pages slot into this container.

**navigation:**
Inspired by Supabase's Navigation page. Documents Cedar's wayfinding system.
- When to use: "Whenever building a new page or modifying page flow."
- Usage rules:
  - Five signals must be consistent: sidebar active state, page title, breadcrumbs, browser tab title, URL
  - URL encodes: filters, sort, pagination, search, tab state. Does NOT encode: modal state, hover state, auth
  - Sidebar active logic: `pathname.startsWith(href)` — child routes keep parent active
  - Breadcrumbs appear on all pages except root-level (home, changes, library list)
  - Page title format: "Page title — Cedar" in `<title>` via metadata export
- Examples (PreviewFrame full-width): Mockup showing sidebar active state + breadcrumb + page title alignment
- Notes: See `components/BreadcrumbNav.tsx` for breadcrumb implementation.

**tables:**
Inspired by Supabase's Tables page. Documents Cedar's three table patterns.
- When to use: "Use tables when users need to compare attributes across many items with sorting and filtering."
- Usage rules:
  - **Surface table** (`variant="surface"`): standalone table on a page, not inside a card
  - **Ghost table** (`variant="ghost"`): table inside a Card (nested surface rule)
  - **Clickable rows:** full-row click target, `cursor: pointer`, hover background, trailing chevron, `onClick` on `<tr>`
  - Max 5-7 visible columns. Column order: identifier → status → attributes → metadata → actions
  - Size 2 standard, size 1 compact
- Examples (PreviewFrame full-width):
  - Ghost table inside Card with 3 regulation rows (SeverityBadge, title, date, source)
  - Clickable row demonstration with hover state note
- Forbidden: Surface table inside Card. More than 7 columns. Table for browsing visual items (use card grid).

**empty-states:**
Inspired by Supabase's Empty States page. Documents Cedar's three types.
- When to use: "Every collection view and data-dependent section needs an empty state. Choose the type based on why the area is empty."
- Usage rules:
  - **First use:** Encouraging. Primary CTA to create/add. Active language ("Create a source" not "No sources found").
  - **No filter results:** Acknowledge the active filter. "Clear filters" button.
  - **Error loading:** "Unable to load…" with Retry button.
  - Never show "No records" during loading — use skeletons.
  - EmptyState component provides the standard centered layout (icon + title + description).
- Examples (PreviewFrame contained, one per type):
  - First use: icon="ri-inbox-line", title="No changes detected", description with CTA guidance
  - No results: icon="ri-search-line", title="No matches", description referencing active filters
  - Error: icon="ri-error-warning-line", title="Unable to load changes", description with retry guidance
- Notes: Copy formula from content-standards.md: icon + headline + 1-2 sentences + CTA.

**collection-header:**
- When to use: "Every collection page (/changes, /sources, /library) uses this header pattern."
- Usage rules: Flex with Heading (h1, size 6, bold) + count Badge (gray, outline) on the first row. FilterPills on the second row. gap="4" between rows. The heading text is the collection name. The count shows total items.
- Examples (PreviewFrame full-width): Heading "Regulatory updates" + Badge "47" + FilterPills with severity options
- Notes: This is a composition, not a standalone component. Build it from Radix primitives + FilterPills.

**detail-header:**
- When to use: "Every detail view (change detail, regulation detail) uses this metadata cluster pattern."
- Usage rules: Two-row cluster following information-density rules (max 4 items per cluster):
  - Row 1 (identity cluster): Heading (h1), SeverityBadge, AuthorityBadge, AiBadge
  - Row 2 (source cluster): source name, effective date (`<time>`), detected date (`<time>`)
  - Cluster membership and order never change between views
- Examples (PreviewFrame full-width): Full metadata cluster with sample regulation data
- Notes: Same clustering appears in table rows (condensed) and detail views (expanded). Only size/padding varies — color, shape, label text are identical everywhere.

**settings-section:**
- When to use: "Settings pages and admin configuration pages. Any page where the user configures key-value preferences."
- Usage rules: Card (variant="surface") containing SectionHeading + descriptive text + form control(s). One logical concern per card. Stacked vertically with gap="6".
- Examples (PreviewFrame full-width):
  - Card with SectionHeading "Email notifications", description, and Switch control
  - Card with SectionHeading "Alert threshold", description, and a mocked Select control
- Notes: Form controls use gray by default. Validation errors show `color="red"` on the field + error text below.

### Task 12: Add sidebar nav entry
**File:** `components/Sidebar.tsx`
**Action:** MODIFY

Add to `ADMIN_NAV` after "System Health":
```typescript
{ href: '/system/ui', label: 'UI library', icon: 'ri-palette-line' },
```

## Integration Points
```yaml
DATABASE:
  - None — all examples use hardcoded sample data

INNGEST:
  - None

API ROUTES:
  - None

UI:
  - New layout: app/(admin)/system/ui/layout.tsx
  - New pages: overview + 16 detail pages (via 4 dynamic routes)
  - New shared: 6 files in _lib/ (nav-config, demo-data, PreviewFrame, LibraryNav, DetailPage)
  - Modified: components/Sidebar.tsx (add nav entry)

ENV:
  - None
```

## What v1 Intentionally Does NOT Include

- **No code snippets** — Supabase shows code; Cedar v1 prioritizes guidance text and live examples instead. Code panels can be added in v2.
- **No live editing controls** — read-only reference
- **No external reference embeds** — no Figma iframes, no external images
- **No exhaustive prop permutation** — show representative variants, not every combination
- **No interactive state toggling** — buttons don't fire, forms don't submit
- **No database queries** — all sample data is hardcoded
- **No Storybook, MDX, or external tooling** — plain Next.js pages
- **No mobile-optimized secondary nav** — desktop-first internal tool
- **No search within the library** — 16 pages are navigable by scanning the left nav
- **No right-side table of contents** — pages are short enough to scroll; add in v2 if pages grow
- **Individual badge component pages** — severity, status, authority, confidence, deadline badges are documented together on the foundations/badges page. Individual component pages can be added later.

## Deferred Items (v2+)

- **Code snippet panels:** Expandable source blocks per example (Supabase has these)
- **Right-side table of contents:** For longer pages, anchor-linked section nav
- **Individual badge/chip pages:** Separate component pages for each badge type
- **Prop playground:** Interactive controls to toggle component props
- **Dark/light side-by-side:** Split view showing both themes
- **Search:** Find patterns by name or keyword
- **Usage audit:** Automated count of where each component is used in the codebase
- **Visual regression:** Automated screenshot comparison
- **Figma embed:** Design-to-code comparison
- **Forms pattern page:** Form layout patterns (page forms, panel forms, field types)
- **Modality pattern page:** Dialog vs sheet decision framework, dirty form dismissal
- **Charts pattern page:** If Cedar adds data visualization
- **Feed/list, activity row, audit row, upgrade-gated pages:** Remaining compositions from the original PRP

## Validation

### Build Check
```bash
npm run build
# Must pass with 0 errors, 0 warnings
```

### Functional Verification
```bash
# 1. Start dev server
env -u ANTHROPIC_API_KEY npx next dev --port 3000

# 2. Navigate to /system/ui as admin
#    Expected: Overview page renders with introduction and library structure

# 3. Navigate to /system/ui as non-admin
#    Expected: Redirect to /home

# 4. Check sidebar
#    Expected: "UI library" under Admin section for admin users only

# 5. Click every left nav item (16 items + overview)
#    Expected: Each navigates to correct detail page, active state updates

# 6. Verify content model on 3 representative pages:
#    - /system/ui/foundations/badges (foundation page)
#    - /system/ui/components/domain-card (component page)
#    - /system/ui/patterns/tables (pattern page)
#    Each should have: h1 + status badge, description, "When to use", "Usage rules", "Examples"

# 7. Verify preview sizes:
#    - /system/ui/foundations/buttons → inline preview (badges flow horizontally)
#    - /system/ui/components/domain-card → contained preview (single card)
#    - /system/ui/patterns/tables → full-width preview (table fills content width)

# 8. Verify heading hierarchy on any detail page
#    Expected: One h1 (page title), h2 for content sections (When to use, Usage rules, Examples)

# 9. Verify nested surface rule on /system/ui/foundations/surfaces
#    Expected: Table inside Card uses variant="ghost"

# 10. Check browser console on 3 pages
#     Expected: No React errors or warnings
```

## Anti-Patterns
- Do not create thin "just render the component" pages — every page needs guidance content
- Do not try to fill all 29+ possible slugs in v1 — stick to the curated 16
- Do not skip the content model sections (when to use, rules) — this is what makes it useful
- Do not use Title Case on labels or headings — sentence case everywhere
- Do not skip `as` prop on any Heading
- Do not nest surface inside surface
- Do not fetch from the database
- Do not add Storybook, MDX, or external tooling
- Do not duplicate sample data across pages — import from demo-data.ts
- Do not render every prop permutation — show representative variants

## Confidence Score

**7/10** for one-pass implementation success.

Rationale: 12 files to create (6 shared infrastructure + 5 page files + 1 sidebar edit). The curated scope (16 pages vs 29) is more realistic, but the Supabase-quality content model adds writing work — each page needs structured guidance text (when to use, rules, forbidden patterns), not just rendered components. The main risks are: (1) getting the secondary nav layout right within SidebarShell's container, (2) writing high-quality guidance content for all 16 pages on first pass, (3) the pattern pages (layout, navigation, tables) require composing realistic full-width examples. No database, API, or state management complexity.
