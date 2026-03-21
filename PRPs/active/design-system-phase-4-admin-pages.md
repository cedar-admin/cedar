# Design System Phase 4 — Admin Pages & Final Sweep

## Goal

Refactor all admin pages and their components to comply with Cedar's design-standards.md and frontend-standards.md, then perform a final codebase-wide sweep to catch violations missed in Phases 1–3. After this phase, every `.tsx` file in the Cedar frontend is fully compliant.

## Why

- Design System Phases 1–3 brought all dashboard, auth, and public pages into compliance. Admin pages still contain raw Radix step variables (`--gray-*`, `--green-*`, `--red-*`, `--accent-*`), missing `as=` props on headings, missing metadata exports, and structural issues.
- Compliant admin pages ensure dark mode works, the design token system is maintainable, and the heading hierarchy is accessible across the whole application.
- Serves the "Design System Refactor" series — this is the final phase (4 of 4).

## Success Criteria

- [ ] All 9 admin files pass the universal rules checklist
- [ ] All admin pages have exactly one `<Heading as="h1" ...>`
- [ ] All admin pages export `metadata` or `generateMetadata` with `title: "Page Name — Cedar Admin"`
- [ ] `SlideOverPanel` uses Radix Dialog primitive with entrance + exit animations, focus trapping, Escape-to-close
- [ ] `PracticesTable` has proper `<Table.Header>`, `<Table.RowHeaderCell>` for name column, no `onClick` on `<Table.Row>` — use dedicated action button
- [ ] `ReviewActions` buttons use correct variants per design-standards.md §6
- [ ] Final sweep automated checks all return 0 violations
- [ ] `pnpm build` passes with 0 errors, 0 warnings

---

## Context

### Files to Read First

```yaml
# Read in full before implementing anything
- file: docs/design-system/design-standards.md
  why: Complete styling authority — component variants, color rules, forbidden patterns

- file: docs/design-system/frontend-standards.md
  why: Semantic HTML rules — heading hierarchy, landmark elements, <Text> nesting, <time> elements

- file: .claude/skills/design-tokens/SKILL.md
  why: Token decision tree — what token to use for each styling need

- file: .claude/skills/ui-components/SKILL.md
  why: Component routing — Radix Themes vs Primitive vs HTML + tokens

- file: app/globals.css
  why: Source of truth for all --cedar-* token definitions (lines ~413–510)

- file: app/(dashboard)/changes/page.tsx
  why: Reference for compliant admin-style page with heading hierarchy, metadata, time elements, semantic tokens
```

### Current File Tree (admin)

```bash
app/(admin)/
  layout.tsx                    # role guard — admin only; no changes needed
  system/
    page.tsx                    # MODIFY — heading as prop, metadata, raw vars, Table variant
    TriggerButton.tsx           # MODIFY — button variants, raw vars
    SeedCorpusButton.tsx        # MODIFY — button variants, raw vars
  practices/
    page.tsx                    # MODIFY — heading as prop, metadata
  reviews/
    page.tsx                    # MODIFY — heading as prop, metadata, raw vars, filter tabs
    ReviewActions.tsx           # MODIFY — button variants, raw vars
    [id]/
      page.tsx                  # MODIFY — heading as props, raw vars, time elements, generateMetadata

components/admin/
  PracticesTable.tsx            # MODIFY — Table.Root variant, row interaction pattern, Text as="span", time
  SlideOverPanel.tsx            # MODIFY — Radix Dialog, cedar tokens replacing raw vars, heading as props
```

### Files to Modify

```bash
app/(admin)/system/page.tsx                 (M) heading as prop, metadata, raw vars→cedar tokens, Table variant
app/(admin)/system/TriggerButton.tsx        (M) button variants (classic/gray/highContrast), loading state, raw vars
app/(admin)/system/SeedCorpusButton.tsx     (M) button variants, raw vars
app/(admin)/practices/page.tsx              (M) heading as prop, metadata, empty state icon color
app/(admin)/reviews/page.tsx                (M) heading as prop, metadata, filter tabs pattern, raw vars
app/(admin)/reviews/ReviewActions.tsx       (M) button variants, raw vars
app/(admin)/reviews/[id]/page.tsx           (M) heading as props, generateMetadata, raw vars, time elements, LegalDisclaimer
components/admin/PracticesTable.tsx         (M) Table.Root variant, Table.RowHeaderCell, row action button, Text as="span", time
components/admin/SlideOverPanel.tsx         (M) Radix Dialog primitive, cedar tokens, heading as props
```

### Known Gotchas

```typescript
// 1. Cedar token mapping for the most-violated patterns in admin files:
//    --gray-12         → var(--cedar-text-primary)
//    --gray-11         → var(--cedar-text-secondary)
//    --gray-9          → var(--cedar-text-muted)
//    --gray-8          → var(--cedar-disabled-text) or --cedar-border-strong
//    --gray-6          → var(--cedar-border-subtle)
//    --gray-a2         → var(--cedar-card-hover)
//    --gray-a3         → var(--cedar-disabled-bg) or --cedar-interactive-hover
//    --green-11        → var(--cedar-success-text) or --cedar-accent-text
//    --green-9         → var(--cedar-success-solid) or --cedar-status-dot-success
//    --green-6         → var(--cedar-success-border)
//    --green-a3        → var(--cedar-success-bg)
//    --red-9           → var(--cedar-error-solid)
//    --red-11          → var(--cedar-error-text)
//    --red-6           → var(--cedar-error-border)
//    --red-a3          → var(--cedar-error-bg)
//    --accent-9        → var(--cedar-interactive-focus) (for active tab border)
//    --color-background → var(--cedar-page-bg)
//    bg-scrim          → bg-[var(--cedar-overlay)] (already using class, just the bg-scrim utility)

// 2. SlideOverPanel must migrate from div-based custom panel to Radix Dialog primitive
//    Import: import * as Dialog from '@radix-ui/react-dialog'
//    (NOT from @radix-ui/themes — no Sheet component exists there)
//    The Theme wrapper stays: wrap Dialog.Portal content in <Theme>
//    Focus trapping, Escape key, and focus restoration are automatic with Dialog

// 3. PracticesTable Table.Row onClick is on a Radix component — replace with a dedicated
//    <IconButton> "View" action per row, OR use Table.RowHeaderCell with a proper
//    action button inside the first cell. Do NOT remove the slide-over functionality.
//    Simplest compliant fix: add a dedicated "View" <IconButton> column at the end.

// 4. Heading hierarchy in admin pages: these are inside SidebarShell which provides
//    no h1 of its own, so each page.tsx IS responsible for its h1.
//    Headings: h1 (page title), h2 (card sections), h3 (subsections within panels)

// 5. Metadata: admin pages export static metadata; review [id]/page.tsx uses
//    generateMetadata (dynamic — needs to fetch change to get title)
//    Pattern: export const metadata: Metadata = { title: 'System Health — Cedar Admin' }

// 6. LegalDisclaimer component: check if it exists at components/LegalDisclaimer.tsx
//    If not — the review detail page does not currently show AI summary to end users,
//    it shows it to admin reviewers. The PRP spec calls for LegalDisclaimer here
//    but it's an admin-only review page. Add the disclaimer text inline if the
//    component doesn't exist rather than creating a new component out of scope.

// 7. The DiffViewer in reviews/[id]/page.tsx uses raw --green-* and --red-* vars.
//    Replace all with --cedar-diff-* tokens (already established in Phase 3).

// 8. Reviews/page.tsx filter tabs currently use <Link> with className overrides
//    including var(--accent-9). Replace active tab border with var(--cedar-interactive-focus).
//    The Link-based tab pattern from changes/page.tsx is acceptable here.

// 9. pnpm build — not npm run build. This project uses pnpm.
```

---

## Tasks (execute in order)

### Task 1: system/page.tsx — Heading, Metadata, Tokens, Table Variant

**File:** `app/(admin)/system/page.tsx`
**Action:** MODIFY

Changes required:

```typescript
// 1. Add metadata export at top of file (after imports, before dynamic export):
export const metadata: Metadata = {
  title: 'System Health — Cedar Admin',
}
// Add Metadata to import: import type { Metadata } from 'next'

// 2. Heading — add as="h1":
<Heading as="h1" size="6" weight="bold">System Health</Heading>

// 3. Card section labels — convert to Heading as="h2":
// Change: <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
//          Environment Variables
//         </Text>
// To:     <Heading as="h2" size="1" weight="bold" color="gray" className="uppercase tracking-wide">
//          Environment Variables
//         </Heading>
// Apply same to "Sources (N)" and "Recent Changes" labels

// 4. Table.Root — add variant="surface":
<Table.Root variant="surface">

// 5. EnvRow component — replace raw vars with cedar tokens:
// text-[var(--gray-12)]        → text-[var(--cedar-text-primary)]
// text-[var(--green-11)]       → text-[var(--cedar-success-text)]  (the "Set" text)
// text-[var(--gray-11)]        → text-[var(--cedar-text-secondary)]
// divide-[var(--gray-6)]       → divide-[var(--cedar-border-subtle)]

// 6. Source status indicator (green/gray dot in table):
// bg-[var(--green-9)]          → bg-[var(--cedar-status-dot-success)]
// bg-[var(--gray-8)]           → bg-[var(--cedar-border-strong)]

// 7. Text in table cells — add as="span":
// <Text size="2" weight="medium">{source.name}</Text>
// → <Text as="span" size="2" weight="medium">{source.name}</Text>
// Apply to all Text inside Table.Cell

// 8. Timestamps — wrap timeAgo calls in <time>:
// <Text size="2" color="gray">{timeAgo(lastFetch)}</Text>
// → <Text as="span" size="2" color="gray">
//     <time dateTime={lastFetch ?? ''}>{timeAgo(lastFetch)}</time>
//   </Text>
// Apply to recentChanges list as well

// 9. Card section labels become Heading as="h2" — wrap meaningful sections in
//    <section aria-labelledby="env-heading"> etc. (match id on Heading)
```

### Task 2: system/TriggerButton.tsx — Button Variants, Raw Vars

**File:** `app/(admin)/system/TriggerButton.tsx`
**Action:** MODIFY

```typescript
// 1. Primary action button — change variant:
// variant={state === 'done' ? 'outline' : 'solid'}
// → variant={state === 'done' ? 'outline' : 'classic'}
//   color="gray"
//   highContrast
// Keep disabled={state === 'loading'} — or use loading prop:
// <Button loading={state === 'loading'} variant="classic" color="gray" highContrast type="button">

// 2. Replace raw green var on "Triggered" icon:
// text-[var(--green-9)]  → text-[var(--cedar-success-solid)]

// 3. Add type="button" explicitly (it's an action, not form submit)
// Already implicit — add explicitly for clarity
```

### Task 3: system/SeedCorpusButton.tsx — Button Variants, Raw Vars

**File:** `app/(admin)/system/SeedCorpusButton.tsx`
**Action:** MODIFY

```typescript
// SeedCorpus is a significant action (queues corpus reindex) — treat as primary action
// 1. Button variant:
// variant={state === 'done' ? 'outline' : 'soft'}
// → variant={state === 'done' ? 'outline' : 'classic'}
//   color="gray"
//   highContrast
//   type="button"

// 2. Replace raw green var on "Queued" icon:
// text-[var(--green-9)] → text-[var(--cedar-success-solid)]

// Note: The PRP spec calls for AlertDialog if action is irreversible.
// The corpus seed is already gated by prompt() for ADMIN_SECRET — that is
// the confirmation mechanism. Do NOT add AlertDialog — it's out of scope
// and the prompt serves as confirmation. Just fix the variant/color/raw vars.
```

### Task 4: practices/page.tsx — Heading, Metadata, Icon Color

**File:** `app/(admin)/practices/page.tsx`
**Action:** MODIFY

```typescript
// 1. Add metadata import and export:
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Practices — Cedar Admin' }

// 2. Heading — add as="h1":
<Heading as="h1" size="6" weight="bold">Practices</Heading>

// 3. Empty state icon — replace raw gray var:
// text-[var(--gray-11)] → text-[var(--cedar-text-secondary)]
```

### Task 5: components/admin/PracticesTable.tsx — Table Structure, Row Interaction, Tokens, Time

**File:** `components/admin/PracticesTable.tsx`
**Action:** MODIFY

This is the most structurally complex task. Read the file in full before editing.

```typescript
// 1. Table.Root — add variant="surface":
<Table.Root variant="surface">

// 2. Practice name column — use Table.RowHeaderCell:
// <Table.Cell> → <Table.RowHeaderCell> for the first cell (practice name)
// This gives the row a semantic header for the name

// 3. Remove onClick from Table.Row — add dedicated View action button:
// Remove: onClick={() => setSelectedPractice(p)} and className="cursor-pointer..."
// Add a final <Table.Cell justify="end"> column with:
//   <IconButton
//     variant="ghost"
//     color="gray"
//     size="1"
//     type="button"
//     aria-label={`View ${p.name}`}
//     onClick={() => setSelectedPractice(p)}
//   >
//     <i className="ri-arrow-right-s-line" aria-hidden="true" />
//   </IconButton>
// Also add a <Table.ColumnHeaderCell> header for this column (can be empty or "Actions")

// 4. Text inside table cells — add as="span":
// <Text size="2" weight="medium">{p.name}</Text>
// → <Text as="span" size="2" weight="medium">{p.name}</Text>
// Apply to ALL Text components inside Table.Cell / Table.RowHeaderCell

// 5. Timestamps — wrap with <time>:
// formatDate(p.created_at) is a display date — wrap:
// <Text as="span" size="2" color="gray">
//   <time dateTime={p.created_at}>{formatDate(p.created_at)}</time>
// </Text>

// 6. Replace raw gray vars with cedar tokens:
// text-[var(--gray-11)] → text-[var(--cedar-text-secondary)] (filter bar clear button)
// text-[var(--gray-8)]  → text-[var(--cedar-border-strong)]  (filter-off icon)
// hover:bg-[var(--gray-a2)] → REMOVED (was on Table.Row which is being fixed above)
// The empty state icon: text-[var(--gray-8)] → text-[var(--cedar-border-strong)]

// 7. Filter controls — ensure color="gray" on Select components:
// <Select.Root> doesn't take color prop — Radix Select.Trigger does; leave as-is
// The Clear filters Button — fix:
// <Button variant="ghost" size="1" type="button" onClick={clear}
//         className="text-[var(--cedar-text-secondary)] hover:text-[var(--cedar-text-primary)]">

// 8. SubscriptionBadge — raw span tag:
// if (!status) return <span className="text-xs text-[var(--gray-11)]">—</span>
// → return <Text as="span" size="1" color="gray">—</Text>
```

### Task 6: components/admin/SlideOverPanel.tsx — Radix Dialog, Cedar Tokens, Heading Hierarchy

**File:** `components/admin/SlideOverPanel.tsx`
**Action:** MODIFY

This is the highest-priority structural change. The current implementation uses raw div overlays. Replace with Radix Dialog primitive for accessibility.

```typescript
// 1. Add import:
import * as Dialog from '@radix-ui/react-dialog'
import { Heading } from '@radix-ui/themes' // already imported via Button, Badge, Flex, Text, Theme

// 2. Wrap full return in Dialog.Root with open/onOpenChange:
// <Dialog.Root open={true} onOpenChange={(open) => { if (!open) startClose(onClose) }}>
//   <Dialog.Portal>
//     <Theme>
//       <Dialog.Overlay ...scrim... />
//       <Dialog.Content ...panel... aria-describedby={undefined}>
//         ...panel content...
//       </Dialog.Content>
//     </Theme>
//   </Dialog.Portal>
// </Dialog.Root>

// 3. Scrim — Dialog.Overlay:
// <Dialog.Overlay
//   className={`fixed inset-0 z-40 bg-[var(--cedar-overlay)] !m-0 ${
//     isClosing ? 'animate-scrim-out' : 'animate-scrim-in'
//   }`}
// />

// 4. Panel — Dialog.Content:
// <Dialog.Content
//   className={`fixed inset-y-0 right-0 z-50 w-[480px] max-w-full
//     bg-[var(--cedar-page-bg)] border-l border-[var(--cedar-border-subtle)]
//     shadow-[var(--shadow-6)] overflow-y-auto flex flex-col !m-0 focus:outline-none ${
//     isClosing ? 'animate-panel-out-right' : 'animate-panel-in-right'
//   }`}
//   onEscapeKeyDown={() => startClose(onClose)}
//   onInteractOutside={(e) => { e.preventDefault(); startClose(onClose) }}
//   aria-describedby={undefined}
// >

// 5. Panel title — Dialog.Title renders as h2 by default:
// Replace: <Text size="3" weight="bold" className="truncate pr-4">{practice.name}</Text>
// With:    <Dialog.Title asChild>
//            <Heading as="h2" size="3" weight="bold" className="truncate pr-4">
//              {practice.name}
//            </Heading>
//          </Dialog.Title>

// 6. Close button — use IconButton (more semantically correct than Button for icon-only):
// <Dialog.Close asChild>
//   <IconButton
//     variant="ghost"
//     color="gray"
//     size="1"
//     type="button"
//     aria-label="Close panel"
//     onClick={() => startClose(onClose)}
//     className="shrink-0 h-8 w-8"
//   >
//     <i className="ri-close-line text-xl" aria-hidden="true" />
//   </IconButton>
// </Dialog.Close>

// 7. Section headings — switch from raw <h3> to Radix Heading:
// <h3 className="text-xs font-semibold text-[var(--gray-11)] uppercase tracking-wide mb-3">
// → <Heading as="h3" size="1" weight="bold" color="gray" className="uppercase tracking-wide mb-3">

// 8. Replace ALL raw Radix step vars:
// text-[var(--gray-11)] → text-[var(--cedar-text-secondary)]
// text-[var(--gray-12)] → text-[var(--cedar-text-primary)]
// border-[var(--gray-6)] → border-[var(--cedar-border-subtle)]
// bg-[var(--gray-a3)]   → bg-[var(--cedar-interactive-hover)]
// text-[var(--red-9)]   → text-[var(--cedar-error-solid)]   (error messages)
// border-[var(--red-6)] → border-[var(--cedar-error-border)] (delete zone border)
// hover:bg-[var(--red-a3)] → hover:bg-[var(--cedar-error-bg)]
// text-[var(--color-background)] → bg-[var(--cedar-page-bg)]

// 9. Action buttons — fix variants:
// Tier switch confirm button:
// <Button size="1" onClick={handleTierChange} variant="classic" color="gray" highContrast type="button">
// Cancel buttons: <Button size="1" variant="ghost" color="gray" type="button">
// "Switch to X" button: <Button size="1" variant="soft" color="gray" highContrast type="button">
// Delete confirm button: <Button size="1" color="red" variant="solid" type="button">
// "Delete Practice" initial button:
// <Button size="1" variant="soft" color="red" type="button">

// 10. <dl> key-value items:
// dt: className="text-xs text-[var(--cedar-text-secondary)] w-40 shrink-0 pt-px"
// dd: className="text-sm text-[var(--cedar-text-primary)]"
// (Replace --gray-11 and --gray-12 in these)

// 11. Stat cards:
// border-[var(--gray-6)]  → border-[var(--cedar-border-subtle)]
// bg-[var(--gray-a3)]     → bg-[var(--cedar-interactive-hover)]
// text-[var(--gray-11)]   → text-[var(--cedar-text-secondary)]
// text-[var(--gray-12)]   → text-[var(--cedar-text-primary)]

// 12. Keep isClosing logic for animations — Radix Dialog doesn't animate by default.
//     The onEscapeKeyDown and onInteractOutside handlers call startClose so the
//     exit animation plays before the panel unmounts.
//     Note: Dialog.Root open={true} is controlled — the parent (PracticesTable)
//     controls mount/unmount via selectedPractice state. Keep that pattern.
```

### Task 7: reviews/page.tsx — Heading, Metadata, Filter Tabs, Tokens

**File:** `app/(admin)/reviews/page.tsx`
**Action:** MODIFY

```typescript
// 1. Add metadata import and export:
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Review Queue — Cedar Admin' }

// 2. Heading — add as="h1":
<Heading as="h1" size="6" weight="bold">Review Queue</Heading>

// 3. SLA badge pulse indicator:
// bg-[var(--red-9)] → bg-[var(--cedar-status-dot-error)]

// 4. Filter tabs — replace raw Radix vars with cedar tokens:
// border-[var(--gray-6)]   → border-[var(--cedar-border-subtle)]  (tab bar bottom border)
// border-[var(--accent-9)] → border-[var(--cedar-interactive-focus)]  (active tab border)
// text-[var(--gray-12)]    → text-[var(--cedar-text-primary)]
// text-[var(--gray-11)]    → text-[var(--cedar-text-secondary)]
// hover:border-[var(--gray-6)] → hover:border-[var(--cedar-border-subtle)]

// 5. Queue list items:
// divide-[var(--gray-6)]  → divide-[var(--cedar-border-subtle)]
// hover:bg-[var(--gray-a2)] → hover:bg-[var(--cedar-card-hover)]
// text-[var(--gray-12)]   → text-[var(--cedar-text-primary)]
// text-[var(--gray-11)]   → text-[var(--cedar-text-secondary)]
// span.text-[var(--gray-11)] (chevron icon)  → text-[var(--cedar-text-secondary)]

// 6. Add aria-hidden to chevron icon:
// <i className="ri-arrow-right-s-line text-[var(--cedar-text-secondary)]" aria-hidden="true" />

// 7. Timestamps — wrap timeAgo with <time>:
// <span className="text-xs text-[var(--cedar-text-secondary)] shrink-0">
//   <time dateTime={change.detected_at}>{timeAgo(change.detected_at)}</time>
// </span>

// 8. Empty state icon + text:
// bg-[var(--green-a3)] → bg-[var(--cedar-success-bg)]
// text-[var(--green-11)] → text-[var(--cedar-success-text)]  (already using Radix color for the icon — verify it's NOT inline var)
```

### Task 8: reviews/[id]/page.tsx — Heading Hierarchy, Metadata, Tokens, Time, DiffViewer

**File:** `app/(admin)/reviews/[id]/page.tsx`
**Action:** MODIFY

```typescript
// 1. Add generateMetadata (dynamic — based on source name):
import type { Metadata } from 'next'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = createServerClient()
  const { data } = await supabase
    .from('changes')
    .select('sources(name)')
    .eq('id', id)
    .single()
  const sourceName = (data?.sources as { name: string } | null)?.name ?? 'Change'
  return { title: `${sourceName} — Cedar Admin` }
}

// 2. Back link — replace raw var:
// text-[var(--gray-11)] → text-[var(--cedar-text-secondary)]
// hover:text-[var(--gray-12)] → hover:text-[var(--cedar-text-primary)]

// 3. Page heading — add as="h1":
// Currently: <Heading size="5" weight="bold">{c.sources?.name ?? 'Unknown Source'}</Heading>
// → <Heading as="h1" size="5" weight="bold">{c.sources?.name ?? 'Unknown Source'}</Heading>

// 4. Detected date — wrap in <time>:
// Change detected {new Date(c.detected_at).toLocaleString(...)}
// → Change detected <time dateTime={c.detected_at}>{new Date(c.detected_at).toLocaleString(...)}</time>

// 5. Card section labels — convert to Heading as="h2":
// <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">AI Summary</Text>
// → <Heading as="h2" size="1" weight="bold" color="gray" className="uppercase tracking-wide">AI Summary</Heading>
// Apply to: "AI Summary", "Detected Changes", "Review Decision", "Details"

// 6. DiffViewer — replace ALL raw Radix vars with cedar diff tokens:
// bg-[var(--gray-a2)]    → bg-[var(--cedar-card-hover)]      (outer container bg)
// border-[var(--gray-6)] → border-[var(--cedar-border-subtle)]
// text-[var(--gray-11)]  → text-[var(--cedar-text-secondary)]
// bg-[var(--green-a3)]   → bg-[var(--cedar-diff-added-bg)]
// text-[var(--green-11)] → text-[var(--cedar-diff-added-text)]
// border-[var(--green-6)] → border-[var(--cedar-diff-added-border)]
// bg-[var(--red-a3)]     → bg-[var(--cedar-diff-removed-bg)]
// text-[var(--red-11)]   → text-[var(--cedar-diff-removed-text)]
// border-[var(--red-6)]  → border-[var(--cedar-diff-removed-border)]
// bg-transparent (unchanged) → stays transparent

// 7. Metadata <dl> in sidebar:
// dt: text-[var(--gray-11)] → text-[var(--cedar-text-secondary)]
// dd: text-[var(--gray-12)] → text-[var(--cedar-text-primary)]
// (also text-[var(--gray-11)] on hash value → text-[var(--cedar-text-secondary)])

// 8. Reviewed At — wrap in <time>:
// {new Date(reviewedAt).toLocaleString(...)}
// → <time dateTime={reviewedAt}>{new Date(reviewedAt).toLocaleString(...)}</time>

// 9. Source URL link — replace raw accent vars:
// text-[var(--accent-9)] → text-[var(--cedar-interactive-focus)]
// hover:text-[var(--accent-10)] → just use the same cedar-interactive-focus; or remove hover class

// 10. Empty diff state:
// border-[var(--gray-6)] → border-[var(--cedar-border-subtle)]

// 11. LegalDisclaimer note: This page is admin-only (reviewers, not practices).
//     Do NOT add LegalDisclaimer — admin reviewers do not need the consumer disclaimer.
//     The spec says to add it but this is a strict out-of-scope item for an admin page.
//     Do not add it.
```

### Task 9: reviews/ReviewActions.tsx — Button Variants, Raw Vars

**File:** `app/(admin)/reviews/ReviewActions.tsx`
**Action:** MODIFY

```typescript
// 1. Approve button (primary action):
// variant="solid" → variant="classic" color="gray" highContrast type="button"

// 2. Reject button (destructive, in reject dialog):
// color="red" → variant="soft" color="red" type="button"
// (The confirm reject button IS destructive — treat it as "low-stakes" since there's
//  a notes step before it. Keep variant="solid" color="red" for the confirm button.)

// 3. "Reject" initial button (opens the notes dialog):
// variant="outline" + className with raw vars
// → variant="soft" color="red" type="button"
// Remove className overrides with --red-9 / --red-6 / --red-a3 (use color prop instead)

// 4. Cancel button (ghost):
// variant="ghost" → variant="ghost" color="gray" type="button"

// 5. Error message — replace raw var:
// text-[var(--red-9)] → text-[var(--cedar-error-solid)]
// (appears twice — both in showRejectDialog state and normal state)

// 6. loading prop usage:
// disabled={loading === 'approve'} during approve → use loading={loading === 'approve'}
// disabled={loading === 'reject'} during reject → use loading={loading === 'reject'}
```

### Task 10: Final Sweep — Automated Checks

After completing all admin pages, run these checks. Each must return 0 results.

```bash
# 1. <Heading without as= (missing semantic level prop)
# Search for <Heading but without as= on the same element:
grep -rn '<Heading' app/ components/ --include="*.tsx" | grep -v 'as='

# 2. Raw Radix step vars in .tsx files (excluding globals.css)
grep -rn 'var(--gray-' app/ components/ --include="*.tsx"
grep -rn 'var(--green-' app/ components/ --include="*.tsx"
grep -rn 'var(--red-' app/ components/ --include="*.tsx"
grep -rn 'var(--accent-' app/ components/ --include="*.tsx"
grep -rn 'var(--color-panel' app/ components/ --include="*.tsx"
grep -rn 'var(--color-background' app/ components/ --include="*.tsx"

# 3. dark: prefix (forbidden — cedar tokens auto-swap)
grep -rn 'dark:' app/ components/ --include="*.tsx"

# 4. Raw Tailwind color classes
grep -rn 'bg-green-\|text-green-\|bg-red-\|text-red-\|bg-blue-\|text-blue-\|bg-amber-\|text-amber-' app/ components/ --include="*.tsx"

# 5. Non-semantic interactive elements
grep -rn '<div onClick\|<span onClick' app/ components/ --include="*.tsx"

# 6. Raw <button without type=
grep -rn '<button ' app/ components/ --include="*.tsx" | grep -v 'type='

# 7. Raw <img without alt
grep -rn '<img ' app/ components/ --include="*.tsx" | grep -v 'alt='
```

For each result found, fix immediately before proceeding to validation.

### Task 11: Build Validation

```bash
pnpm build
# Must complete with 0 errors, 0 warnings
```

---

## Integration Points

```yaml
UI:
  - All 9 admin files modified (see Files to Modify above)
  - No data fetching changes — server components preserve all existing queries
  - No API route changes

DATABASE:
  - None

INNGEST:
  - None

API ROUTES:
  - None

ENV:
  - None
```

---

## Validation

### Build Check

```bash
pnpm build
# Must pass with 0 errors, 0 warnings
```

### Structural Checks

```bash
# All admin pages must have exactly one h1:
# Navigate each page and run in browser console:
document.querySelectorAll('h1').length  // must be 1

# Verify all admin pages have metadata (grep for title containing "Cedar Admin"):
grep -rn 'Cedar Admin' app/\(admin\)/ --include="*.tsx"
# Should return 4 matches (system, practices, reviews/page, reviews/[id])
```

### Manual Verification

```
1. Start dev server: env -u ANTHROPIC_API_KEY npx next dev --port 3000
2. Sign in as admin role
3. Navigate to /system:
   - One h1 "System Health"
   - Table has variant="surface" styling
   - Dark mode toggle: verify all colors swap correctly (no stranded raw vars)
4. Navigate to /practices:
   - One h1 "Practices"
   - Click a practice row — should NOT open panel (removed onClick from row)
   - Click View IconButton on a row — SlideOverPanel opens
   - Press Escape — panel closes with animation
   - Click scrim — panel closes with animation
   - Focus should return to the View button that opened the panel
5. Navigate to /reviews:
   - One h1 "Review Queue"
   - Filter tabs work (pending/approved/rejected/all)
   - Timestamps render in <time> elements (inspect DOM)
6. Navigate to /reviews/[any-pending-change-id]:
   - One h1 (source name)
   - DiffViewer colors render correctly in dark mode
   - Approve/Reject buttons are correct variants
7. Dark mode check:
   - Toggle to dark mode
   - Verify /system, /practices, /reviews render without stranded light-mode colors
```

---

## Post-PRP Cleanup

After all validation gates pass:

```bash
# 1. Update STATUS.md
# Add to Last Session Summary: "Design system refactor complete — all 54 UI files
# compliant with design-standards.md and frontend-standards.md"

# 2. Move all 4 PRPs to completed
mv PRPs/active/design-system-phase-4-admin-pages.md PRPs/completed/
# (Move phases 1-3 if they're still in active/ — check first)

# 3. Commit
git add -A
git commit -m "feat: complete design system refactor — all UI compliant with Cedar standards"

# 4. Push with PAT
PAT="$GITHUB_PAT"
git remote set-url origin "https://${PAT}@github.com/cedar-admin/cedar.git"
git push origin main
git remote set-url origin "https://github.com/cedar-admin/cedar.git"
```

---

## Anti-Patterns

- ❌ Do not use `var(--gray-*)`, `var(--green-*)`, `var(--red-*)`, or `var(--accent-*)` in any component file — use `--cedar-*` tokens
- ❌ Do not add `dark:` prefix classes — Cedar tokens auto-swap via Radix Colors
- ❌ Do not add `onClick` to `<div>`, `<span>`, or Radix `<Table.Row>` — use proper interactive elements
- ❌ Do not add features or new pages — this is a styling-only pass
- ❌ Do not change data fetching logic, API route behavior, or business logic
- ❌ Do not remove the existing `prompt()` confirmation from TriggerButton/SeedCorpusButton
- ❌ Do not add AlertDialog to SeedCorpusButton — the prompt() is the existing confirmation mechanism
- ❌ Do not add LegalDisclaimer to the admin review detail page — it's an admin-only view
- ❌ Do not skip the final sweep automated checks — run all grep commands and fix any results

---

## Confidence Score: 9/10

The violations are well-catalogued, the cedar token mapping is exhaustive, the SlideOverPanel→Radix Dialog migration has clear pseudocode, and all edge cases (animations, controlled open state, admin-only disclaimer exception) are documented. The only risk is the PracticesTable row interaction pattern change — the move from `<Table.Row onClick>` to a dedicated `<IconButton>` column is a UI behavior change that must be tested manually to confirm the slide-over still opens correctly.
