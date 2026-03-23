name: "PRP: Core dashboard and library UX normalization"

## Goal

Fix the highest-impact UX violations across Cedar's primary user path — Home, Changes, Change detail, and Library — by building shared UI primitives first, then applying them page by page. Every P0 issue resolved, every P1 issue within scope resolved or explicitly deferred.

## Why

- Cedar's primary user path (Home → Changes → Change detail → Library) has 3 P0 issues and 6 in-scope P1 issues that break discoverability, wayfinding, and trust
- Design system compliance was declared complete in Session 29, but the audit (March 23) revealed systematic regressions at the granular level
- The most common interaction in the product (navigating from the Changes table to a detail page) has no full-row click behavior — new users cannot discover this navigation
- Section headings at 12px (size="2") throughout every card create a flat wall of text with no navigable hierarchy — this is the single most pervasive violation, affecting every page with cards
- The AI Summary block carries no "AI-generated" badge — Cedar's core trust signal is missing on the detail view
- These are UX violations with user impact, not aesthetic preferences

## Success Criteria

- [ ] Changes table rows are fully clickable (full row, cursor pointer, hover bg, trailing chevron)
- [ ] Change detail `h1` is the change summary/description, not the source name
- [ ] Home activity feed shows a summary excerpt on each item
- [ ] All card section headings use `size="3"` (16px, `weight="medium"`) not `size="2"` (12px)
- [ ] AI trust pattern applied at the correct tier per surface: collection views (`/home` feed) carry `<AiBadge />` inline with AI summary text — no disclaimer; the change detail AI Summary card carries `<AiBadge />` on its section header AND `<AiDisclaimer />` inside the card body (page-level `<LegalDisclaimer />` removed from change detail — its role is absorbed into the card)
- [ ] Sidebar nav label "My Practice" changed to "Settings" (aligns with page title and browser tab)
- [ ] Sidebar nav label "Regulation Library" shortened to "Library" (aligns with page title "Regulation Library" on the page — nav label can be shorter, but this is P2 only if there is audit finding; per audit P1-4 the issue is "Source Library" vs. "Sources" — fix that instead)
- [ ] Sources page `h1` "Source Library" changed to "Sources" (aligns with nav label)
- [ ] Filter pills extracted into a shared `FilterPills` component — same size (`text-sm`, 14px) everywhere
- [ ] Hash values show first 8 chars + copy button via a shared `HashWithCopy` component
- [ ] `DomainCard` uses pseudo-element pattern instead of full `<Link>` wrapper
- [ ] `DomainCard` hover changes border color, not heading text color (no green on hover)
- [ ] `npm run build` passes with 0 errors, 0 warnings

## Context

### Files to Read First

```yaml
- doc: docs/design-system/ux-standards.md
  why: §2 navigable collections (full-row click, card pseudo-element pattern), §5 wayfinding consistency

- doc: docs/design-system/art-direction.md
  why: §4 type scale (section heading = size="4" standalone, size="3" in cards), §3 neutral-interactive (no green on hover)

- doc: docs/design-system/information-density.md
  why: §3.2 AI-generated badge at every tier, §6.1 hash truncation + copy, §2.3 change identity cluster

- doc: docs/design-system/design-standards.md
  why: §1 neutral-interactive model, badge color semantics, component selection

- doc: docs/design-system/frontend-standards.md
  why: heading hierarchy rules, landmark structure, accessible card patterns

- doc: docs/design-system/content-standards.md
  why: §2 sentence case rules for section headings and button labels

- file: research/ui-audit/design-audit.md
  why: Source of truth for all issues — P0-1, P0-2, P0-3, P1-1 through P1-8

- file: components/DomainCard.tsx
  why: Full `<Link>` wrapper must be replaced with pseudo-element pattern

- file: components/Sidebar.tsx
  why: Line 19 — "My Practice" label needs to change to "Settings"

- file: app/(dashboard)/changes/page.tsx
  why: Table rows need full-row click, filter pills need to move to FilterPills component

- file: app/(dashboard)/changes/[id]/page.tsx
  why: h1 must become change description; AI Summary section needs badge

- file: app/(dashboard)/home/page.tsx
  why: Activity feed items need summary excerpt; card headings need size fix

- file: app/(dashboard)/library/page.tsx
  why: Filter pills need to move to FilterPills component; Sources nav label fix

- file: app/(dashboard)/sources/page.tsx
  why: h1 "Source Library" → "Sources" (P1-4)

- file: app/(dashboard)/audit/page.tsx
  why: Hash values in audit trail need HashWithCopy component (P1-6)
```

### Current File Tree (relevant subset)

```
components/
  DomainCard.tsx           ← full Link wrapper (P1-7), green hover (P1-8)
  Sidebar.tsx              ← "My Practice" label (P1-3)
  LegalDisclaimer.tsx      ← reference for disclaimer pattern
  SeverityBadge.tsx        ← reference for badge pattern
  EmptyState.tsx           ← reference for empty state pattern

app/(dashboard)/
  home/page.tsx            ← P0-3 (no summary in feed), P1-1 (heading size)
  changes/page.tsx         ← P0-1 (no full-row click), P1-5 (filter pill size)
  changes/[id]/page.tsx    ← P0-2 (wrong h1), P1-1, P1-2 (no AI badge), P1-6
  library/page.tsx         ← P1-5 (filter pill size), P1-7/8 via DomainCard
  sources/page.tsx         ← P1-4 (wrong h1)
  audit/page.tsx           ← P1-6 (hash no copy)
  settings/page.tsx        ← P1-1 (heading size), P1-3 (linked via nav label)
```

### Files to Create or Modify

```
# NEW shared primitives
components/SectionHeading.tsx          (+) Shared section heading: wraps Radix <Heading>, enforces size="3"/"4" by context
components/FilterPills.tsx             (+) Shared filter pill row: unified sizing (text-sm), token usage
components/HashWithCopy.tsx            (+) Hash display: 8 chars + ellipsis + copy-to-clipboard button
components/AiBadge.tsx                 (+) "AI-generated" badge: small gray Radix <Badge>, consistent placement

# MODIFIED components
components/DomainCard.tsx              (M) Replace Link wrapper with pseudo-element pattern; fix hover
components/Sidebar.tsx                 (M) "My Practice" → "Settings" at line 19

# MODIFIED pages
app/(dashboard)/changes/page.tsx       (M) Full-row click, trailing chevron, use FilterPills
app/(dashboard)/changes/[id]/page.tsx  (M) Fix h1, add AiBadge, HashWithCopy, fix heading sizes
app/(dashboard)/home/page.tsx          (M) Add summary to activity feed items, fix heading sizes
app/(dashboard)/library/page.tsx       (M) Use FilterPills
app/(dashboard)/sources/page.tsx       (M) h1 "Source Library" → "Sources"
app/(dashboard)/audit/page.tsx         (M) Use HashWithCopy for hash column
app/(dashboard)/settings/page.tsx      (M) Fix heading sizes (P1-1)
```

### Known Gotchas

```typescript
// 1. Table row full-row click in Next.js App Router (server components):
//    Use <tr onClick> ONLY in a client component — server components can't attach handlers.
//    The pattern for a server-rendered table with navigable rows:
//    - Extract a <ChangeTableRow> client component that wraps <Table.Row>
//    - Use router.push() in onClick, with <Link> on the primary cell for SSR fallback
//    - Keyboard: add tabIndex={0} + onKeyDown for Enter key navigation

// 2. DomainCard pseudo-element pattern:
//    The heading <Link> gets an ::after pseudo-element via Tailwind's after: prefix:
//    className="after:absolute after:inset-0 after:content-['']"
//    The <Card> wrapper needs `relative` positioning for the pseudo-element to scope correctly.
//    Secondary interactive elements inside the card need `relative z-10` to sit above the overlay.

// 3. HashWithCopy needs `use client` for clipboard API.
//    navigator.clipboard.writeText() is async, must handle rejection.
//    Show a transient "Copied" state (replace icon for 1.5s, then reset).

// 4. AiBadge trust pattern — two surfaces, two treatments:
//
//    COLLECTION VIEW (home activity feed, changes table rows):
//      - Render <AiBadge /> inline with AI summary text — no disclaimer.
//      - Rule: badge appears, full disclaimer does NOT (per information-density.md §9.2).
//
//    DETAIL VIEW (change detail AI Summary card):
//      - Render <AiBadge /> inline with the section heading.
//      - Render <AiDisclaimer /> INSIDE the AI Summary card body, below the summary text.
//      - Remove the page-level <LegalDisclaimer /> from changes/[id]/page.tsx entirely —
//        its role is absorbed into the card. One disclaimer, scoped to its content block.
//
//    COMPONENTS:
//      AiBadge — chip only: <Badge color="gray" variant="soft" size="1">AI-generated</Badge>
//      AiDisclaimer — compact inline text: <Text size="1" color="gray">...</Text>
//        Text: "This summary was generated by AI and has not been reviewed by a licensed
//        attorney. This is not legal advice. For decisions specific to your practice,
//        consult your legal counsel."
//      LegalDisclaimer (existing) — keep the component file, but REMOVE its usage from
//        changes/[id]/page.tsx. It may still be used elsewhere; do not delete it.

// 5. SectionHeading is a pure display component.
//    Two variants: "card" (inside a <Card> header → size="3") and "standalone" (outside cards → size="4").
//    Default variant = "card" since most usages are inside cards.

// 6. FilterPills: active state uses cedar-filter-active-* tokens; inactive uses cedar-page-bg.
//    /changes pills are severity-aware (active state uses per-severity color class).
//    /library pills use standard gray active state only (practice_type filter, no semantic color).
//    FilterPills component must accept an optional `activeClass` prop for the severity override.

// 7. Sentence case for section heading copy:
//    "Critical & High Alerts" → "Critical & high alerts"
//    "Recent Activity — Last 7 Days" → "Recent activity — last 7 days"
//    "AI Summary" → "AI summary"
//    "Detected Changes" → "Detected changes"
//    "View Audit Trail" button → "View audit trail"
//    "Compliance Health" → "Compliance health"

// 8. Stat card values: replace <p className="text-2xl font-bold"> with <Text size="5" weight="bold">
//    and <span className="text-xs"> with <Text size="1">. Use Radix layout primitives.
```

---

## Tasks (execute in order)

> **Execution order is deliberate.** Phases 1–2 build shared primitives and fix nav. Phase 3 then works through the primary user journey in sequence: **Home → Changes → Change detail → Library**. This ensures that shared primitives are in place before any page consumes them, and that the coherence of the core path is verifiable end-to-end before moving to secondary pages.

---

### Phase 1 — Shared primitives (Tasks 1–5)

### Task 1: Create `components/SectionHeading.tsx`

**File:** `components/SectionHeading.tsx`
**Action:** CREATE
**Pattern:** Follow `components/SeverityBadge.tsx` for file structure (simple display component)

```typescript
// Props:
interface SectionHeadingProps {
  as?: 'h2' | 'h3' | 'h4'
  variant?: 'card' | 'standalone'  // 'card' = size="3", 'standalone' = size="4"
  id?: string
  children: React.ReactNode
  mb?: string  // Radix spacing token, passed through — default none
}

// Implementation:
// - 'card' variant: <Heading as={as} size="3" weight="medium" ...>
// - 'standalone' variant: <Heading as={as} size="4" weight="medium" ...>
// - Default: as="h2", variant="card"
// - Forward id for aria-labelledby on <section> elements
// - Import Heading from '@radix-ui/themes'
```

---

### Task 2: Create `components/AiBadge.tsx` — full AI trust pattern

**File:** `components/AiBadge.tsx`
**Action:** CREATE

This file exports TWO components. Together they define the complete AI trust pattern. Neither has interactivity — both are server components.

```typescript
import { Badge, Text } from '@radix-ui/themes'

// ── AiBadge ──────────────────────────────────────────────────────────────────
// The inline chip. Used on EVERY AI surface at EVERY tier (collection + detail).
// Placement: inline with section heading via <Flex align="center" gap="2">.
// On collection views: appears beside the summary text label (e.g., after "AI summary" text node).
// On detail views: appears beside the <SectionHeading> for the AI content block.
export function AiBadge() {
  return (
    <Badge color="gray" variant="soft" size="1">
      AI-generated
    </Badge>
  )
}

// ── AiDisclaimer ─────────────────────────────────────────────────────────────
// The inline disclaimer. Used ONLY on detail views, INSIDE the AI content card,
// below the AI-generated text. Never on collection views (feed items, table rows).
//
// This replaces the page-level <LegalDisclaimer /> (Callout) wherever AI content
// is scoped to a card. The Callout form (LegalDisclaimer) is retained for contexts
// where no containing card exists.
export function AiDisclaimer() {
  return (
    <Text as="p" size="1" color="gray" mt="3" className="leading-relaxed">
      This summary was generated by AI and has not been reviewed by a licensed attorney.
      This is not legal advice. For decisions specific to your practice, consult your
      legal counsel.
    </Text>
  )
}
```

**Rule summary — which component goes where:**

| Surface | AiBadge | AiDisclaimer | LegalDisclaimer (Callout) |
|---|---|---|---|
| `/home` activity feed items | ✓ inline with summary text | ✗ | ✗ |
| `/changes` table row summary cell | ✗ (omit — too noisy at row level) | ✗ | ✗ |
| `/changes/[id]` AI Summary card header | ✓ inline with heading | — | — |
| `/changes/[id]` AI Summary card body | — | ✓ below summary text | ✗ (remove) |

---

### Task 3: Create `components/HashWithCopy.tsx`

**File:** `components/HashWithCopy.tsx`
**Action:** CREATE
**Pattern:** Client component (requires clipboard API)

```typescript
'use client'

interface HashWithCopyProps {
  hash: string
  displayLength?: number  // default 8
}

// Renders: <span className="font-mono text-xs">{hash.slice(0, displayLength)}…</span>
// + an <IconButton> with copy icon (ri-file-copy-line)
// On click: navigator.clipboard.writeText(hash).then(() => setCopied(true))
// After 1500ms: setCopied(false)
// When copied: show ri-check-line icon instead of copy icon (no text change)
// Wrap in <Flex align="center" gap="1">
// IconButton: variant="ghost", color="gray", size="1", aria-label="Copy full hash"
// Tooltip via Radix <Tooltip content="Copy hash"> wrapping the IconButton
```

---

### Task 4: Create `components/FilterPills.tsx`

**File:** `components/FilterPills.tsx`
**Action:** CREATE

```typescript
// Props:
interface FilterPill {
  label: string
  href: string
  isActive: boolean
  activeClass?: string  // override for severity-colored active state
}

interface FilterPillsProps {
  pills: FilterPill[]
}

// Renders: <div className="flex items-center gap-2 flex-wrap">
// Each pill: <Link href={pill.href} className={`px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${active ? (pill.activeClass ?? STANDARD_ACTIVE) : INACTIVE}`}>
//
// STANDARD_ACTIVE = 'bg-[var(--cedar-filter-active-bg)] text-[var(--cedar-filter-active-text)] border-[var(--cedar-filter-active-border)]'
// INACTIVE = 'bg-[var(--cedar-page-bg)] text-[var(--cedar-text-secondary)] border-[var(--cedar-border)] hover:border-[var(--cedar-border-strong)] hover:text-[var(--cedar-text-primary)]'
//
// Note: text-sm (14px) is the canonical size for filter pills — not text-xs
```

---

### Task 5: Refactor `components/DomainCard.tsx` — accessible card pattern + hover fix

**File:** `components/DomainCard.tsx`
**Action:** MODIFY
**Depends on:** None (standalone refactor)

```typescript
// BEFORE: <Link href={...} className="block group">
//           <Card ...>...</Card>
//         </Link>

// AFTER: <Card variant="surface" className="relative h-full transition-interactive hover:bg-[var(--cedar-interactive-hover)]">
//   <Box p="4">
//     <Flex direction="column" gap="3">
//       <Flex align="start" justify="between" gap="2">
//         <Heading as={headingLevel} size="3">
//           <Link
//             href={`/library/${domain.slug}`}
//             className="after:absolute after:inset-0 after:content-[''] hover:underline"
//           >
//             {domain.name}
//           </Link>
//         </Heading>
//         {highestSeverity && <SeverityBadge severity={highestSeverity} className="relative z-10" />}
//       </Flex>
//       ... rest of card content (no className group-hover changes)
//     </Flex>
//   </Box>
// </Card>

// KEY CHANGES:
// 1. Remove outer <Link> wrapper — no full anchor around card
// 2. <Card> gets relative positioning for pseudo-element scoping
// 3. Heading link gets after:absolute after:inset-0 overlay
// 4. Remove `group-hover:text-[var(--cedar-accent-text)]` from heading — no green on hover
// 5. Remove `hover:shadow-[var(--shadow-3)]` — replace with hover:bg-[var(--cedar-interactive-hover)]
// 6. Hover state: background highlight, not shadow change
// 7. recentChangeCount accent text: change from cedar-accent-text to gray (informational, not green)
//    Use <Text ... color="gray"> or keep as-is if gray is already the fallback

// REMOVE: className={cn('block group', className)} from outer wrapper
// NOTE: cn utility still needed if className prop is kept — check if callers pass className
```

---

---

### Phase 2 — Nav/wayfinding (Tasks 6–7)

### Task 6: Fix sidebar nav label "My Practice" → "Settings"

**File:** `components/Sidebar.tsx`
**Action:** MODIFY

```typescript
// Line 19 in MAIN_NAV array:
// BEFORE: { href: '/settings', label: 'My Practice', icon: 'ri-stethoscope-line' },
// AFTER:  { href: '/settings', label: 'Settings',    icon: 'ri-stethoscope-line' },
```

---

### Task 7: Fix `/sources` page title

**File:** `app/(dashboard)/sources/page.tsx`
**Action:** MODIFY

Read the file first, then:
```typescript
// Find: <Heading as="h1" ...>Source Library</Heading>
// Change to: <Heading as="h1" ...>Sources</Heading>
// Also update: export const metadata = { title: 'Sources — Cedar' }
// (was: 'Source Library — Cedar')
```

---

---

### Phase 3 — Primary journey pages in order: Home → Changes → Change detail → Library (Tasks 8–11)

### Task 8: Fix `/home` — activity feed summary + heading sizes + AI badge + copy

**File:** `app/(dashboard)/home/page.tsx`
**Action:** MODIFY
**Depends on:** Tasks 1, 2

**Fix activity feed (P0-3) — add summary text:**
```typescript
// BEFORE (activity feed row, lines ~206-211):
// <SeverityBadge severity={c.severity} />
// <Text as="span" size="2" className="flex-1 truncate">{src?.name ?? '—'}</Text>
// <time ...>{timeAgo(c.detected_at)}</time>

// AFTER:
// <SeverityBadge severity={c.severity} />
// <div className="flex-1 min-w-0">
//   <Text as="p" size="1" color="gray" className="truncate">{src?.name ?? '—'}</Text>
//   <div className="flex items-center gap-1.5 mt-0.5">
//     <Text as="p" size="2" className="line-clamp-1 flex-1">
//       {c.summary ?? <Text as="span" color="gray" className="italic">No summary available</Text>}
//     </Text>
//     {c.summary && <AiBadge />}
//   </div>
// </div>
// <time ... className="text-xs text-[var(--cedar-text-secondary)] shrink-0">...</time>

// ALSO: confirm the Supabase query at line ~41 already selects 'summary' — it does:
// .select('id, severity, summary, detected_at, sources(name)')
// No query change needed.
```

**Fix "Critical & High Alerts" card heading (P1-1 + sentence case):**
```typescript
// BEFORE: <Heading as="h2" size="2" weight="bold">Critical &amp; High Alerts</Heading>
// AFTER: <SectionHeading as="h2">Critical &amp; high alerts</SectionHeading>
// Keep the surrounding <Flex align="center" justify="between"> with the "View all" button
```

**Fix "Compliance Health" card heading (P1-1 + sentence case):**
```typescript
// BEFORE: <Heading as="h2" size="2" weight="bold">Compliance Health</Heading>
// AFTER: <SectionHeading as="h2">Compliance health</SectionHeading>
```

**Fix "Recent Activity" section heading (P1-1 + sentence case):**
```typescript
// BEFORE: <Heading id="activity-heading" as="h2" size="2" weight="bold">Recent Activity — Last 7 Days</Heading>
// AFTER: <SectionHeading id="activity-heading" as="h2">Recent activity — last 7 days</SectionHeading>
// NOTE: SectionHeading must forward id prop for aria-labelledby to work
```

**Fix stat card markup:**
```typescript
// BEFORE: <p className="text-2xl font-bold ...">...</p>
// AFTER: <Text size="5" weight="bold" ...>...</Text>

// BEFORE: <span className="text-xs text-[var(--cedar-text-secondary)]">{s.label}</span>
// AFTER: <Text size="1" color="gray">{s.label}</Text>

// BEFORE: stat card container: <div className="grid ...">
// AFTER: <Grid columns={{ initial: '2', md: '4' }} gap="4">
```

**Fix "View Audit Trail" button label (sentence case):**
```typescript
// BEFORE: <Link href="/audit">View Audit Trail</Link>
// AFTER:  <Link href="/audit">View audit trail</Link>
```

---

### Task 9: Fix `/changes` page — full-row click + FilterPills

**File:** `app/(dashboard)/changes/page.tsx`
**Action:** MODIFY
**Depends on:** Task 4 (FilterPills)

**Step 9a — Extract a `ChangeTableRow` client component** (can be co-located in the same file or a separate file in the same directory):

```typescript
// app/(dashboard)/changes/ChangeTableRow.tsx  (+)  OR inline as 'use client' export at top of file

'use client'
import { useRouter } from 'next/navigation'
import { Table, Text } from '@radix-ui/themes'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { timeAgo } from '@/lib/format'
import Link from 'next/link'

interface ChangeTableRowProps {
  change: {
    id: string
    severity: string | null
    summary: string | null
    jurisdiction: string | null
    detected_at: string
    review_status: string
    sources: { name: string } | null
  }
}

export function ChangeTableRow({ change }: ChangeTableRowProps) {
  const router = useRouter()
  const href = `/changes/${change.id}`

  return (
    <Table.Row
      key={change.id}
      className="cursor-pointer hover:bg-[var(--cedar-interactive-hover)] transition-colors"
      onClick={() => router.push(href)}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') router.push(href) }}
    >
      <Table.Cell><SeverityBadge severity={change.severity} /></Table.Cell>
      <Table.Cell>
        <Text as="span" size="2" weight="medium">{change.sources?.name ?? 'Unknown Source'}</Text>
        <Text as="span" size="1" color="gray" className="block mt-0.5">{change.jurisdiction ?? 'FL'}</Text>
      </Table.Cell>
      <Table.Cell>
        {/* Primary link for SSR/a11y — visually underlines on hover via parent group */}
        <Link
          href={href}
          onClick={(e) => e.stopPropagation()}
          className="group-hover:underline"
        >
          <Text as="p" size="2" className="line-clamp-2">
            {change.summary ?? <Text as="span" color="gray" className="italic">No summary available</Text>}
          </Text>
        </Link>
      </Table.Cell>
      <Table.Cell>
        <time dateTime={new Date(change.detected_at).toISOString()} className="text-sm text-[var(--cedar-text-secondary)] whitespace-nowrap">
          {timeAgo(change.detected_at)}
        </time>
      </Table.Cell>
      <Table.Cell><StatusBadge status={change.review_status} /></Table.Cell>
      {/* Trailing chevron */}
      <Table.Cell className="w-8">
        <i className="ri-arrow-right-s-line text-[var(--cedar-text-secondary)]" aria-hidden="true" />
      </Table.Cell>
    </Table.Row>
  )
}
```

**Step 9b — In `changes/page.tsx`:**
- Add a `<Table.ColumnHeaderCell className="w-8" />` header cell for the chevron column
- Replace the inline `<Table.Row>` render with `<ChangeTableRow change={change} key={change.id} />`
- Replace the inline filter pill `<div>` with `<FilterPills pills={...} />`:

```typescript
// Build pills array:
const allPill = { label: 'All', href: '/changes', isActive: !severity }
const severityPills = SEVERITIES.map((s) => ({
  label: s.charAt(0).toUpperCase() + s.slice(1),
  href: `/changes?severity=${s}`,
  isActive: severity === s,
  activeClass: SEVERITY_ACTIVE_CLASS[s],
}))
// <FilterPills pills={[allPill, ...severityPills]} />
```

---

### Task 10: Fix `/changes/[id]` — correct h1, AI trust pattern, heading fixes, HashWithCopy

**File:** `app/(dashboard)/changes/[id]/page.tsx`
**Action:** MODIFY
**Depends on:** Tasks 1, 2, 3

**Fix the h1 (P0-2):**
```typescript
// BEFORE:
// <Heading as="h1" size="6" weight="bold">
//   {c.sources?.name ?? 'Unknown Source'}
// </Heading>
// <Text size="2" color="gray" as="p" mt="1">
//   Change detected {date}
// </Text>

// AFTER:
// <Heading as="h1" size="6" weight="bold" className="leading-tight">
//   {c.summary ?? 'Regulatory change detected'}
// </Heading>
// <Text size="2" color="gray" as="p" mt="1">
//   {c.sources?.name ?? 'Unknown source'} · Change detected {date}
// </Text>
```

**Fix AI Summary section header and trust pattern (P1-2):**
```typescript
// BEFORE:
// <Card variant="surface">
//   <Box px="4" pt="4" pb="3">
//     <Heading as="h2" size="2" weight="bold">AI Summary</Heading>
//   </Box>
//   <Box p="4">
//     {c.summary ? <Text ...>{c.summary}</Text> : ...}
//   </Box>
// </Card>
// <LegalDisclaimer />   ← PAGE LEVEL — remove this

// AFTER:
// <Card variant="surface">
//   <Box px="4" pt="4" pb="3">
//     <Flex align="center" gap="2">
//       <SectionHeading as="h2">AI summary</SectionHeading>
//       <AiBadge />
//     </Flex>
//   </Box>
//   <Box p="4">
//     {c.summary ? (
//       <>
//         <Text as="p" size="2" className="leading-relaxed">{c.summary}</Text>
//         <AiDisclaimer />
//       </>
//     ) : (
//       <Text as="p" size="2" color="gray" className="italic">No AI summary available for this change.</Text>
//     )}
//   </Box>
// </Card>
// ← LegalDisclaimer REMOVED from page level entirely
```

**Fix other card headings (P1-1, sentence case):**
```typescript
// "Detected Changes" → <SectionHeading as="h2">Detected changes</SectionHeading>
// "Details"          → <SectionHeading as="h2">Details</SectionHeading>
```

**Fix hash display (P1-6):**
```typescript
// In the metadata sidebar <dl>:
// BEFORE:
// <dd className="text-xs font-mono ... break-all">{c.hash.slice(0, 16)}&hellip;</dd>
// AFTER:
// <dd className="mt-0.5"><HashWithCopy hash={c.hash} /></dd>
```

---

### Task 11: Fix `/library` — use FilterPills

**File:** `app/(dashboard)/library/page.tsx`
**Action:** MODIFY
**Depends on:** Tasks 4, 5 (FilterPills + DomainCard already fixed)

```typescript
// Replace the practice type filter pill <div> (lines ~106-131) with:
// <FilterPills pills={[allPill, ...typePills]} />
// where typePills = (practiceTypes ?? []).map((pt) => ({
//   label: pt.display_name,
//   href: `/library?practice_type=${pt.slug}`,
//   isActive: practiceTypeSlug === pt.slug,
// }))
```

---

---

### Phase 4 — Secondary pages (Tasks 12–13)

### Task 12: Fix `/settings` — section heading sizes

**File:** `app/(dashboard)/settings/page.tsx`
**Action:** MODIFY
**Depends on:** Task 1

Read the file first, then replace all `<Heading as="h2" size="2" weight="bold">` section headings inside cards with `<SectionHeading as="h2">` for each section: Practice, Subscription, Notifications, Team Members, Jurisdictions.

Also fix sentence case where applicable per `content-standards.md §2`.

---

### Task 13: Fix `/audit` — HashWithCopy in hash column

**File:** `app/(dashboard)/audit/page.tsx`
**Action:** MODIFY
**Depends on:** Task 3

Read the file first, then:
```typescript
// Find hash display in the change audit table (around line 191)
// BEFORE: <span className="...font-mono...">{hash.slice(0, 12)}...</span>
// AFTER: <HashWithCopy hash={hash} />
```

---

## Integration Points

```yaml
DATABASE:
  - No schema changes required

INNGEST:
  - No changes required

API ROUTES:
  - No changes required

UI:
  - 4 new shared components: SectionHeading, AiBadge, HashWithCopy, FilterPills
  - 1 modified component: DomainCard (pseudo-element pattern)
  - 1 new client component: ChangeTableRow (for full-row navigation)
  - 6 modified pages: home, changes, changes/[id], library, sources, settings, audit

ENV:
  - No new environment variables
```

---

## Validation

### Build Check

```bash
npm run build
# Must pass with 0 errors, 0 warnings
```

### Functional Verification

Walk the primary journey in order after starting the dev server:

```bash
env -u ANTHROPIC_API_KEY npx next dev --port 3000
```

**Journey: Home → Changes → Change detail → Library**

```bash
# Step 1 — /home
# - Verify stat card values use <Text size="5"> (larger, bolder than before)
# - Verify card section headings are visibly 16px (not 12px label-sized)
# - If changes exist: each activity feed item shows source name (small gray) + summary (14px) + AiBadge chip
# - Empty feed: no change — empty state unchanged

# Step 2 — /changes  (navigate via sidebar)
# - Verify filter pills are text-sm (14px) and use FilterPills component
# - If changes exist: hover any row → full row highlights, cursor pointer
# - If changes exist: click severity badge cell → navigates to detail (not just summary cell)
# - Verify rightmost column has chevron icon on each row

# Step 3 — /changes/[any-valid-id]  (navigate by clicking a row, or type a known ID)
# - Verify h1 is the change summary text, NOT "Florida Board of Medicine" or any agency name
# - Verify subtitle line reads: "[Agency name] · Change detected [date]"
# - Verify "AI summary" section header: SectionHeading (16px) + gray "AI-generated" badge inline
# - Verify AI disclaimer appears INSIDE the AI summary card, below summary text (not as Callout at page bottom)
# - Verify no standalone LegalDisclaimer Callout below the cards
# - Verify hash shows 8 chars + copy button

# Step 4 — /library  (navigate via sidebar)
# - Hover a DomainCard: background lightens, heading stays gray (no green)
# - Click anywhere on the card surface: navigates to domain page
# - If practice_type pills visible: same size as /changes pills (text-sm)
```

**Secondary pages**

```bash
# /settings — sidebar item reads "Settings" (not "My Practice")
# /settings — card section headings visibly 16px
# /sources  — h1 reads "Sources" (not "Source Library")
# /audit    — if chain records exist: hash column shows HashWithCopy
```

### Visual spot-check checklist (journey order)

```
[ ] /home — stat card values: large bold number (Text size="5"), small gray label (Text size="1")
[ ] /home — card section headings clearly larger than data labels (16px vs previous 12px)
[ ] /home — activity feed item (when populated): source name (12px gray), summary (14px) + AiBadge chip
[ ] /changes — filter pills: text-sm (14px), same visual weight as /library pills
[ ] /changes — table has chevron column (rightmost, visible on every row)
[ ] /changes/[id] — h1 is the change description, NOT the agency name
[ ] /changes/[id] — subtitle line shows agency name as secondary metadata
[ ] /changes/[id] — "AI summary" heading: 16px + gray "AI-generated" badge inline
[ ] /changes/[id] — AI disclaimer is inside the AI summary card (not a Callout at page bottom)
[ ] /changes/[id] — no standalone LegalDisclaimer Callout anywhere on the page
[ ] /library — DomainCard hover: background highlight only, heading stays gray (not green)
[ ] /settings — sidebar active item reads "Settings" (not "My Practice")
[ ] /sources — page h1 reads "Sources"
```

---

## Anti-Patterns

- ❌ Do not use `size="2" weight="bold"` for section headings inside cards — use `SectionHeading` (size="3" weight="medium")
- ❌ Do not wrap entire cards in `<Link>` or `<a>` — use the pseudo-element heading-link pattern
- ❌ Do not use `--cedar-accent-text` (green) for hover states on interactive elements — use gray or bg-highlight
- ❌ Do not add row click behavior to server components — extract a client component
- ❌ Do not use `text-xs` (12px) for filter pills — canonical size is `text-sm` (14px)
- ❌ Do not show raw hash values longer than 8 chars without a copy button
- ❌ Do not display AI-generated content on a detail view without both `<AiBadge />` on the heading AND `<AiDisclaimer />` inside the content block
- ❌ Do not place `<LegalDisclaimer />` (Callout) at the page level on the change detail page — the inline `<AiDisclaimer />` inside the card is the correct scoped treatment
- ❌ Do not add `<AiDisclaimer />` to collection views (feed items, table rows) — badge only at collection tier
- ❌ Do not add scope beyond this PRP — note future work in STATUS.md
- ❌ Do not use `any` types — define proper interfaces
- ❌ Do not modify the changes table schema
- ❌ Do not skip cost tracking on external API calls (not applicable here — UI-only PRP)

---

## Confidence Score

**9/10** — All file locations verified, all issue descriptions confirmed against source code, implementation patterns are well-defined. The one uncertainty: `ChangeTableRow` client component extraction might require careful import handling if `changes/page.tsx` is a large server component with many imports that don't work in client context. Keep the extraction minimal — only the row rendering logic in the client component, all data fetching stays in the server component.

---

## Deferred / Out of Scope

These items were identified in the audit but are explicitly excluded from this PRP:

- `/pricing` — entire page out of scope
- `/faq` — full redesign out of scope; FAQ card `<Link>` wrapper (same P1-7 issue) noted for future
- `/sources` — only the h1 rename is in scope; no per-source detail page, no table hover suppression
- `/audit` — only hash display fix in scope; no pagination overhaul, no cron copy rewrite
- Section heading size on `/audit` (standalone h2 at size="3" vs size="4") — P2, not in scope
- `disable invite button` aria-describedby wiring — P2, not in scope
- `recentChangeCount` / `highestSeverity` data connections on DomainCard — backend/data work, explicitly out of scope
- Content/copy fixes on `/home` ("Welcome back" greeting change) — P2, defer
- Playwright audit script updates — update only after all above fixes are applied

After completing all tasks, update STATUS.md with what was built and move this PRP to `PRPs/completed/`.
