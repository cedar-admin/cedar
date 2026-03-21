name: "Design System Refactor — Phase 1: Foundations"

## Goal

Deploy the corrected design foundations: updated `globals.css` with the correct Radix Colors palette, root layout landmark structure, providers verification, shared component alignment to the new design standards, `lib/ui-constants.ts` refactor to Radix color names, and deletion of the orphaned `components/LibraryBrowser.tsx`. Every subsequent phase builds on this.

## Why

- The current `globals.css` uses the old green palette (green-9 = `#30a46c`); the corrected palette (green-9 = `#3fc964` light / `#98e9a5` dark) is brighter and was generated via the Radix Colors customizer
- Gray scale overrides are missing entirely — relying on Radix defaults rather than Cedar's explicit values
- Cedar semantic tokens (`--cedar-text-muted`, `--cedar-card-hover`, `--cedar-error-text`, `--cedar-focus-ring`) are undefined, causing silent failures in components that reference them
- `lib/ui-constants.ts` exports className strings (`SEVERITY_CLASS`, `SEVERITY_DOT`, `AUTHORITY_LEVEL_CLASS`) — Badge components must use the `color` prop for dark mode to work; className overrides don't adapt
- Phase 2, 3, and 4 all depend on this foundation being correct

## Success Criteria

- [ ] `pnpm build` — 0 errors
- [ ] `app/globals.css` has green-9 = `#3fc964` (light) and `#98e9a5` (dark) — verified via spot-check
- [ ] Root layout: `<html lang="en">`, skip-nav link, `<main id="main-content">`, viewport metadata
- [ ] `app/providers.tsx` Theme props match spec exactly
- [ ] Every shared Badge component uses `color` prop — no `className` color overrides
- [ ] Every `<Heading>` in shared components has explicit `as` prop
- [ ] Every `<Text>` inside a non-block context uses `as="span"`
- [ ] `lib/ui-constants.ts` exports Radix color names only — no `_CLASS`, `_DOT`, or className string maps
- [ ] `components/LibraryBrowser.tsx` is deleted
- [ ] Dark mode: toggle and visually verify 3+ shared components render correctly in both modes

## Pre-Work — Read These Files First

Read **all five** before making any changes. These are the authority for every decision.

```yaml
- file: CLAUDE.md
  why: Session startup, design system section

- file: docs/design-system/design-standards.md
  why: Full design standards — all 38 sections

- file: docs/design-system/frontend-standards.md
  why: Full frontend structural standards — all 16 sections
  note: If this file does not exist locally, run `git pull` first — it should be in the repo.
        The rules you'll need most: §1.2 (Heading as prop), §2.2 (landmark structure),
        §4 (Text nesting), §8 (form label association)

- file: .claude/skills/design-tokens/SKILL.md
  why: Token decision tree

- file: .claude/skills/ui-components/SKILL.md
  why: Component routing
```

## Context

### Files to Create or Modify

```bash
# MODIFIED
app/globals.css                    (M) replace with corrected palette — see Task 1
app/layout.tsx                     (M) skip-nav + <main> landmark + viewport metadata
app/providers.tsx                  (M) verify/correct Theme props
lib/ui-constants.ts                (M) replace _CLASS/_DOT maps with _COLOR maps
components/SeverityBadge.tsx       (M) color prop + variant="soft" + no dot
components/StatusBadge.tsx         (M) color prop + variant="soft" + icons
components/AuthorityBadge.tsx      (M) color prop + variant="outline"
components/ConfidenceBadge.tsx     (M) color prop + variant="outline"
components/DeadlineChip.tsx        (M) color prop + variant="outline"
components/ServiceLineTag.tsx      (M) add color="gray"
components/EmptyState.tsx          (M) --cedar-text-muted + as props
components/LegalDisclaimer.tsx     (M) canonical disclaimer text
components/UpgradeBanner.tsx       (M) verify no hardcoded colors
components/DomainCard.tsx          (M) variant="surface" + headingLevel prop + as="span" on Text
components/RelationshipCard.tsx    (M) variant="surface" + headingLevel prop + as="span" on Text
components/RegulationRow.tsx       (M) as="span" on all Text inside Link
components/DataList.tsx            (M) as="span" on all Text inside Link + cedar-text-muted
components/ContentReader.tsx       (M) Cedar tokens + Radix components for raw HTML
components/NotificationsForm.tsx   (M) color="gray" on Switch
components/SignOutButton.tsx       (M) color="gray" prop + hover:cedar-error-text

# DELETED
components/LibraryBrowser.tsx      (D) orphaned stub
```

### Known Gotchas

```typescript
// 1. Radix Badge color prop — pass a string color name, NOT className
//    WRONG: <Badge className="text-[var(--red-11)] bg-[var(--red-a3)]">
//    RIGHT: <Badge color="red" variant="soft">
//    The color prop is what enables dark mode adaptation. className overrides break it.

// 2. Heading `as` prop — Radix Heading defaults to <h3>. Always specify explicitly.
//    For DomainCard and RelationshipCard: accept a `headingLevel` prop that defaults
//    to "h3" so calling pages can override the semantic level.
//    Pattern:
//      interface DomainCardProps { headingLevel?: 'h2' | 'h3' | 'h4' }
//      <Heading as={headingLevel ?? 'h3'} size="3">

// 3. Text `as="span"` — Radix Text defaults to <p>. A <p> inside a <Link> (which
//    renders as <a>) is invalid HTML. Rule: if Text is inside any Link/a element,
//    add as="span".

// 4. globals.css — the corrected file will be in the repo before this PRP is executed.
//    If it is NOT there when you start: stop and ask the user to provide it.
//    Do NOT reconstruct it from memory. The palette values must be exact.

// 5. Cedar semantic tokens — these tokens are NEW in the updated globals.css.
//    They will not exist in any component yet and must be adopted in this phase:
//      --cedar-text-muted    → muted icon/text color (use instead of --gray-9 in components)
//      --cedar-card-hover    → hover background for clickable cards/rows
//      --cedar-error-text    → destructive text color (hover state on SignOutButton)
//      --cedar-focus-ring    → focus ring color
//      --cedar-focus-offset  → focus ring offset

// 6. LegalDisclaimer text must match CLAUDE.md exactly:
//    "This summary was generated by AI and has not been reviewed by a licensed attorney.
//     This is not legal advice. For decisions specific to your practice,
//     consult your legal counsel."

// 7. Duplicate <main> check — after adding <main id="main-content"> to root layout,
//    grep for other <main> elements in layout files. If any exist, replace with <div>.

// 8. Removed exports from lib/ui-constants.ts — after deleting _CLASS/_DOT maps,
//    grep all files that import them and fix the imports. Do not skip this.
```

---

## Tasks (execute in order)

### Task 1: Verify and deploy updated globals.css
**File:** `app/globals.css`
**Action:** REPLACE
**Depends on:** Nothing

The corrected `globals.css` should already be in the repo. Start with `git pull`.

Then verify the file at `app/globals.css` contains the correct palette:
```bash
grep "#3fc964" app/globals.css   # must find at least 1 match (light green-9)
grep "#98e9a5" app/globals.css   # must find at least 1 match (dark green-9)
```

If **both match** → the file is correct. Run `pnpm build` to confirm 0 errors and continue to Task 2.

If **either is missing** → the corrected file has not been committed. Stop and ask the user to provide it before proceeding. Do not attempt to reconstruct the palette.

The updated globals.css contains these sections — verify each is present:
- Green 12-step scale (light + dark) with the new palette values
- Gray 12-step scale (light + dark) — was missing entirely before
- P3 wide gamut coverage for all 12 steps + alpha variants for both green and gray
- `--color-background: #fff` (light) and `#141414` (dark) — background overrides
- Utility tokens: `--green-contrast`, `--green-surface`, `--green-indicator`, `--green-track` (and gray equivalents)
- Accent mapping that references `--green-*` equivalents (not hardcoded values)
- Cedar semantic tokens: `--cedar-text-muted`, `--cedar-text-contrast`, `--cedar-accent-bg`, `--cedar-card-hover`, `--cedar-error-text`, `--cedar-focus-ring`, `--cedar-focus-offset`
- Animation library: slide (right/left/bottom), panel (right/left), scrim, fade, scale — all entrance/exit pairs
- `prefers-reduced-motion` blanket rule

```bash
pnpm build   # must pass 0 errors before continuing
```

---

### Task 2: Update app/layout.tsx — Landmark Structure
**File:** `app/layout.tsx`
**Action:** MODIFY
**Depends on:** Task 1

Current state: has `lang="en"` ✅, missing skip-nav link, missing `<main>` wrapper, missing viewport metadata.

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const geistSans = Geist({ variable: '--font-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cedar — Florida Regulatory Intelligence',
  description: 'Monitor 71 Florida healthcare regulatory sources. Get alerted when rules change.',
  // ADD: viewport configuration
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        {/* ADD: skip-nav — must be first focusable element in <body> */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-background)] focus:text-[var(--gray-12)] focus:rounded-[var(--radius-3)] focus:border focus:border-[var(--gray-6)]"
        >
          Skip to main content
        </a>
        <Providers>
          {/* ADD: <main> landmark wrapping children */}
          <main id="main-content">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
```

After editing, check for duplicate `<main>` landmarks:
```bash
grep -rn "<main" app/ --include="*.tsx"
# Only one result should exist — the one just added in app/layout.tsx.
# If any dashboard or other layout file also has <main>, replace it with <div>.
```

---

### Task 3: Verify app/providers.tsx
**File:** `app/providers.tsx`
**Action:** VERIFY — modify only if any prop differs

Target configuration per `design-standards.md §2`:
```tsx
<Theme
  accentColor="green"
  grayColor="gray"
  radius="large"
  scaling="100%"
  panelBackground="translucent"
>
```

The current file already matches this. Confirm and mark verified — no changes expected.

---

### Task 4: Refactor lib/ui-constants.ts
**File:** `lib/ui-constants.ts`
**Action:** MODIFY
**Depends on:** Nothing (but must complete before Tasks 5–10)

**Remove** these exports entirely:
- `SEVERITY_CLASS` (className string map)
- `SEVERITY_DOT` (className string map)
- `STATUS_CLASS` (className string map)
- `AUTHORITY_LEVEL_CLASS` (className string map)

**Add** these exports (Radix color name strings):
```typescript
export const SEVERITY_COLOR: Record<string, string> = {
  critical:      'red',
  high:          'orange',
  medium:        'amber',
  low:           'green',
  informational: 'blue',
}

export const STATUS_COLOR: Record<string, string> = {
  approved:       'green',
  auto_approved:  'gray',
  pending:        'amber',
  pending_review: 'amber',
  rejected:       'red',
  not_required:   'gray',
}

export const AUTHORITY_LEVEL_COLOR: Record<string, string> = {
  federal_statute:                 'red',
  federal_regulation:              'orange',
  sub_regulatory_guidance:         'amber',
  national_coverage_determination: 'blue',
  local_coverage_determination:    'cyan',
  state_statute:                   'purple',
  state_board_rule:                'indigo',
  professional_standard:           'gray',
}
```

**Keep** everything else:
- `SEVERITY_ICON` — used for icon rendering elsewhere
- `SEVERITIES` array + `Severity` type
- `STATUS_LABEL`
- `AUTHORITY_LEVEL_LABEL`
- `RELATIONSHIP_TYPE_LABEL`

After editing, scan for any other files that imported the removed exports and fix them:
```bash
grep -rn "SEVERITY_CLASS\|SEVERITY_DOT\|STATUS_CLASS\|AUTHORITY_LEVEL_CLASS" \
  app/ components/ lib/ --include="*.tsx" --include="*.ts"
# Should return 0 results after all component tasks are done.
# Fix any hits immediately before moving on.
```

---

### Task 5: Refactor components/SeverityBadge.tsx
**File:** `components/SeverityBadge.tsx`
**Action:** MODIFY
**Depends on:** Task 4

```tsx
import { Badge } from '@radix-ui/themes'
import { SEVERITY_COLOR } from '@/lib/ui-constants'
import { capitalize } from '@/lib/format'

interface SeverityBadgeProps {
  severity: string | null
  className?: string
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const key = severity?.toLowerCase() ?? ''
  const color = (SEVERITY_COLOR[key] ?? 'gray') as any
  const label = severity ? capitalize(severity) : 'Unknown'
  return (
    <Badge color={color} variant="soft" className={className}>
      {label}
    </Badge>
  )
}
```

Changes: `variant="outline"` → `variant="soft"`. Removed `SEVERITY_CLASS`, `SEVERITY_DOT`, `cn()`, dot `<span>`. Color via prop, not className.

---

### Task 6: Refactor components/StatusBadge.tsx
**File:** `components/StatusBadge.tsx`
**Action:** MODIFY
**Depends on:** Task 4

```tsx
import { Badge } from '@radix-ui/themes'
import { STATUS_COLOR, STATUS_LABEL } from '@/lib/ui-constants'

const STATUS_ICON: Record<string, string | undefined> = {
  approved:       'ri-shield-check-line',
  auto_approved:  'ri-robot-line',
  pending:        'ri-time-line',
  pending_review: 'ri-time-line',
  rejected:       'ri-close-circle-line',
  not_required:   'ri-robot-line',
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = (STATUS_COLOR[status] ?? 'gray') as any
  const label = STATUS_LABEL[status] ?? status
  const icon = STATUS_ICON[status]
  return (
    <Badge color={color} variant="soft" className="gap-1.5">
      {icon && <i className={`${icon} text-xs`} />}
      {label}
    </Badge>
  )
}
```

---

### Task 7: Refactor components/AuthorityBadge.tsx
**File:** `components/AuthorityBadge.tsx`
**Action:** MODIFY
**Depends on:** Task 4

```tsx
import { Badge } from '@radix-ui/themes'
import { AUTHORITY_LEVEL_LABEL, AUTHORITY_LEVEL_COLOR } from '@/lib/ui-constants'

interface AuthorityBadgeProps {
  level: string | null
  className?: string
}

export function AuthorityBadge({ level, className }: AuthorityBadgeProps) {
  if (!level) return null
  const label = AUTHORITY_LEVEL_LABEL[level] ?? level.replace(/_/g, ' ')
  const color = (AUTHORITY_LEVEL_COLOR[level] ?? 'gray') as any
  return (
    <Badge color={color} variant="outline" className={className}>
      {label}
    </Badge>
  )
}
```

---

### Task 8: Refactor components/ConfidenceBadge.tsx
**File:** `components/ConfidenceBadge.tsx`
**Action:** MODIFY
**Depends on:** Nothing

```tsx
import { Badge } from '@radix-ui/themes'

interface ConfidenceBadgeProps {
  confidence: number | null
  className?: string
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  if (confidence == null) return null
  const pct = Math.round(confidence * 100)
  const color: 'green' | 'amber' | 'red' =
    confidence > 0.8 ? 'green' : confidence > 0.5 ? 'amber' : 'red'
  return (
    <Badge color={color} variant="outline" className={className}>
      {pct}%
    </Badge>
  )
}
```

---

### Task 9: Refactor components/DeadlineChip.tsx
**File:** `components/DeadlineChip.tsx`
**Action:** MODIFY
**Depends on:** Nothing

```tsx
import { Badge } from '@radix-ui/themes'
import { daysUntil } from '@/lib/format'

interface DeadlineChipProps {
  date: string | null
  label?: string
  className?: string
}

export function DeadlineChip({ date, label = 'Deadline', className }: DeadlineChipProps) {
  const days = daysUntil(date)
  if (days == null) return null

  let text: string
  let color: 'red' | 'amber' | 'gray'

  if (days < 0) {
    text = 'Passed'
    color = 'gray'
  } else if (days === 0) {
    text = 'Today'
    color = 'red'
  } else if (days <= 7) {
    text = `${days}d left`
    color = 'red'
  } else if (days <= 30) {
    text = `${days}d left`
    color = 'amber'
  } else {
    const d = new Date(date!)
    text = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    color = 'gray'
  }

  return (
    <Badge color={color} variant="outline" className={`text-xs gap-1 ${className ?? ''}`}>
      <i className="ri-time-line" />
      {label}: {text}
    </Badge>
  )
}
```

---

### Task 10: Fix components/ServiceLineTag.tsx
**File:** `components/ServiceLineTag.tsx`
**Action:** MODIFY
**Depends on:** Nothing

Add `color="gray"` — currently missing, so it inherits the theme accent (green):

```tsx
import { Badge } from '@radix-ui/themes'

interface ServiceLineTagProps {
  name: string
  className?: string
}

export function ServiceLineTag({ name, className }: ServiceLineTagProps) {
  return (
    <Badge color="gray" variant="soft" className={`text-xs ${className ?? ''}`}>
      {name}
    </Badge>
  )
}
```

---

### Task 11: Fix components/EmptyState.tsx
**File:** `components/EmptyState.tsx`
**Action:** MODIFY
**Depends on:** Task 1 (requires `--cedar-text-muted` token from updated globals.css)

```tsx
import { Flex, Text, Heading } from '@radix-ui/themes'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Flex direction="column" align="center" justify="center" py="9" className="text-center">
      <i className={`${icon} text-4xl text-[var(--cedar-text-muted)] mb-3`} />
      <Heading as="h3" size="3" mb="1">{title}</Heading>
      <Text as="span" size="2" color="gray" className="max-w-sm">{description}</Text>
    </Flex>
  )
}
```

Changes: Removed `<Card>` wrapper (pages provide their own containment), icon token `--gray-9` → `--cedar-text-muted`, added `as="h3"` to Heading, added `as="span"` to Text (inline-only context).

---

### Task 12: Fix components/LegalDisclaimer.tsx
**File:** `components/LegalDisclaimer.tsx`
**Action:** MODIFY
**Depends on:** Nothing

Update disclaimer text to match CLAUDE.md canonical wording exactly:

```tsx
import { Callout } from '@radix-ui/themes'

export function LegalDisclaimer() {
  return (
    <Callout.Root mt="6" color="gray" variant="soft">
      <Callout.Icon>
        <i className="ri-scales-3-line" />
      </Callout.Icon>
      <Callout.Text>
        This summary was generated by AI and has not been reviewed by a licensed attorney.
        This is not legal advice. For decisions specific to your practice, consult your legal counsel.
      </Callout.Text>
    </Callout.Root>
  )
}
```

---

### Task 13: Verify components/UpgradeBanner.tsx
**File:** `components/UpgradeBanner.tsx`
**Action:** VERIFY — modify only if hardcoded colors are found

Check for hardcoded hex/rgb/hsl values:
```bash
grep -n "#[0-9a-fA-F]\{6\}\|rgb(\|hsl(" components/UpgradeBanner.tsx
```

The current file uses `var(--accent-a3)`, `var(--accent-11)`, `var(--gray-a3)`, `var(--gray-6)`, `var(--color-background)` — all Radix/Cedar tokens. If the grep returns nothing, mark verified with no changes. If any hardcoded colors are found, replace them with the appropriate Cedar token.

---

### Task 14: Fix components/DomainCard.tsx
**File:** `components/DomainCard.tsx`
**Action:** MODIFY
**Depends on:** Task 1 (requires `--cedar-card-hover` token)

Changes:
1. Add `variant="surface"` to `<Card>`
2. Accept `headingLevel` prop (defaults to `"h3"`) — set `as={headingLevel ?? 'h3'}` on `<Heading>`
3. All `<Text>` inside the `<Link>` → add `as="span"`

```tsx
import Link from 'next/link'
import { Card, Box, Flex, Text, Heading } from '@radix-ui/themes'
import { SeverityBadge } from '@/components/SeverityBadge'
import { cn } from '@/lib/utils'

interface DomainCardProps {
  domain: {
    name: string
    slug: string
    description: string | null
    color: string | null
  }
  regulationCount: number
  recentChangeCount: number
  highestSeverity: string | null
  headingLevel?: 'h2' | 'h3' | 'h4'  // NEW — parent controls semantic level
  className?: string
}

export function DomainCard({
  domain,
  regulationCount,
  recentChangeCount,
  highestSeverity,
  headingLevel = 'h3',
  className,
}: DomainCardProps) {
  return (
    <Link href={`/library/${domain.slug}`} className={cn('block group', className)}>
      <Card variant="surface" className="h-full transition-interactive hover:shadow-[var(--shadow-3)]">
        <Box p="4">
          <Flex direction="column" gap="3">
            <Flex align="start" justify="between" gap="2">
              <Heading
                as={headingLevel}
                size="3"
                className="group-hover:text-[var(--accent-11)] transition-colors line-clamp-2"
              >
                {domain.name}
              </Heading>
              {highestSeverity && <SeverityBadge severity={highestSeverity} />}
            </Flex>
            {domain.description && (
              <Text as="span" size="2" color="gray" className="line-clamp-2">
                {domain.description}
              </Text>
            )}
            <Flex align="center" gap="4">
              <Text as="span" size="1" color="gray" className="flex items-center gap-1">
                <i className="ri-file-list-3-line" />
                {regulationCount.toLocaleString()} regulations
              </Text>
              {recentChangeCount > 0 && (
                <Text as="span" size="1" className="flex items-center gap-1 text-[var(--accent-11)]">
                  <i className="ri-refresh-line" />
                  {recentChangeCount} recent
                </Text>
              )}
            </Flex>
          </Flex>
        </Box>
      </Card>
    </Link>
  )
}
```

---

### Task 15: Fix components/RelationshipCard.tsx
**File:** `components/RelationshipCard.tsx`
**Action:** MODIFY
**Depends on:** Nothing

Changes:
1. Add `variant="surface"` to `<Card>`
2. Accept `headingLevel` prop — use it on any `<Heading>` (there are none currently, but add the prop for consistency with DomainCard; no heading to render here)
3. All `<Text>` inside the `<Link>` → add `as="span"`

```tsx
import Link from 'next/link'
import { Card, Box, Flex, Text, Badge } from '@radix-ui/themes'
import { ConfidenceBadge } from '@/components/ConfidenceBadge'
import { RELATIONSHIP_TYPE_LABEL } from '@/lib/ui-constants'

// (interface unchanged except headingLevel unused here — omit it; RelationshipCard has no heading)

export function RelationshipCard({ relationship, domainSlug }: RelationshipCardProps) {
  // ...href logic unchanged...
  return (
    <Link href={href} className="block group">
      <Card variant="surface" className="transition-interactive hover:shadow-[var(--shadow-3)]">
        <Box p="4">
          <Flex direction="column" gap="1">
            <Flex align="center" gap="2">
              <Badge variant="outline" size="1" className="shrink-0">
                {typeLabel}
              </Badge>
              <ConfidenceBadge confidence={relationship.confidence} />
            </Flex>
            <Text as="span" size="2" weight="medium"
              className="group-hover:text-[var(--accent-11)] transition-colors line-clamp-2 text-[var(--gray-12)]">
              {relationship.target.name}
            </Text>
            {relationship.target.citation && (
              <Text as="span" size="1" color="gray">{relationship.target.citation}</Text>
            )}
            {relationship.fr_citation && (
              <Text as="span" size="1" color="gray">FR: {relationship.fr_citation}</Text>
            )}
          </Flex>
        </Box>
      </Card>
    </Link>
  )
}
```

---

### Task 16: Fix components/RegulationRow.tsx
**File:** `components/RegulationRow.tsx`
**Action:** MODIFY
**Depends on:** Nothing

All `<Text>` components are inside the root `<Link>` element — add `as="span"` to each:

```tsx
// Root element is <Link>, so every Text inside it needs as="span"
<Text as="span" size="2" weight="medium" className="line-clamp-2 text-[var(--gray-12)]">
  {entity.name}
</Text>

{entity.citation && (
  <Text as="span" size="1" color="gray">{entity.citation}</Text>
)}

{entity.description && (
  <Text as="span" size="1" color="gray" className="line-clamp-2">{entity.description}</Text>
)}

// Date text:
<Text as="span" size="1" color="gray">
  <time>{...}</time>
</Text>
```

The hover class `hover:bg-[var(--gray-a2)]` is already a valid Cedar token — keep it unchanged.

---

### Task 17: Fix components/DataList.tsx
**File:** `components/DataList.tsx`
**Action:** MODIFY
**Depends on:** Task 1 (requires `--cedar-text-muted` token)

Two areas to fix:

**Empty state** (inline in DataList, not using EmptyState component):
```tsx
// Icon: --gray-9 → --cedar-text-muted
<i className={`${emptyIcon} text-4xl text-[var(--cedar-text-muted)] mb-3`} />
// Text: add as="span"
<Text as="span" size="3" weight="medium" mb="1">{emptyTitle}</Text>
<Text as="span" size="2" color="gray" className="max-w-sm">{emptyDescription}</Text>
```

**List rows** (all Text inside `<Link>`):
```tsx
<Text as="span" size="2" className="line-clamp-1 text-[var(--gray-12)]">
  {item.title || <span className="text-[var(--gray-9)] italic">No summary available</span>}
</Text>
{item.subtitle && (
  <Text as="span" size="1" color="gray" className="mt-0.5">{item.subtitle}</Text>
)}
{item.timestamp && (
  <Text as="span" size="1" color="gray" className="shrink-0">
    {timeAgo(item.timestamp)}
  </Text>
)}
```

---

### Task 18: Fix components/ContentReader.tsx
**File:** `components/ContentReader.tsx`
**Action:** MODIFY
**Depends on:** Task 1 (requires `--cedar-text-muted`, `--color-background` tokens)

Current issues: raw `<h2>` in fullscreen header, raw `<p>` in no-content state, icon uses `--gray-9`.

```tsx
// Import Heading and Text from @radix-ui/themes (already imports Card, Box, Button, IconButton)
import { Button, IconButton, Card, Box, Heading, Text } from '@radix-ui/themes'

// No-content state — replace raw <p> with Radix Text:
if (!content) {
  return (
    <Box className={`flex flex-col items-center justify-center py-12 text-center ${className ?? ''}`}>
      <i className="ri-file-unknow-line text-3xl text-[var(--cedar-text-muted)] mb-2" />
      <Text as="p" size="2" color="gray">No content snapshot available</Text>
    </Box>
  )
}

// Fullscreen header — replace raw <h2> with Radix Heading:
<Heading as="h2" size="3" className="truncate">
  {title ?? 'Document'}
</Heading>
// Remove explicit text-[var(--gray-12)] from heading — Heading already uses gray-12 by default
```

The prose body div and `bg-[var(--color-background)]` references are fine — keep them unchanged.

---

### Task 19: Fix components/NotificationsForm.tsx
**File:** `components/NotificationsForm.tsx`
**Action:** MODIFY
**Depends on:** Nothing

Add `color="gray"` to both `<Switch>` elements. Currently they inherit the theme accent (green), but form controls should use gray per design-standards.md §10.

```tsx
<Switch
  id="email-alerts"
  color="gray"
  checked={prefs.email_alerts}
  onCheckedChange={(checked) => update({ email_alerts: checked })}
  disabled={isPending}
/>

<Switch
  id="weekly-digest"
  color="gray"
  checked={prefs.weekly_digest}
  onCheckedChange={(checked) => update({ weekly_digest: checked })}
  disabled={isPending}
/>
```

Label associations are already correct (`Text as="label"` with `htmlFor` matching Switch `id`). No other changes needed.

---

### Task 20: Fix components/SignOutButton.tsx
**File:** `components/SignOutButton.tsx`
**Action:** MODIFY
**Depends on:** Task 1 (requires `--cedar-error-text` token)

```tsx
'use client'

import { Button } from '@radix-ui/themes'
import { handleSignOut } from '@/app/actions/auth'

export function SignOutButton() {
  return (
    <form action={handleSignOut}>
      <Button
        variant="ghost"
        color="gray"
        size="1"
        type="submit"
        className="hover:text-[var(--cedar-error-text)]"
      >
        <i className="ri-logout-box-line" />
        Sign out
      </Button>
    </form>
  )
}
```

Changes: added `color="gray"` prop (replaces `className="text-[var(--gray-11)]"`), hover changes to `cedar-error-text` instead of `gray-12`.

---

### Task 21: Delete components/LibraryBrowser.tsx
**File:** `components/LibraryBrowser.tsx`
**Action:** DELETE
**Depends on:** Nothing

```bash
rm components/LibraryBrowser.tsx
# Verify:
ls components/LibraryBrowser.tsx 2>&1  # should return "No such file"
```

Confirm no imports of this file exist anywhere:
```bash
grep -rn "LibraryBrowser" app/ components/ --include="*.tsx" --include="*.ts"
# Should return 0 results
```

---

### Task 22: Cleanup scan — broken imports
**Action:** SEARCH AND FIX
**Depends on:** Tasks 4–21

```bash
# Check for removed ui-constants exports
grep -rn "SEVERITY_CLASS\|SEVERITY_DOT\|STATUS_CLASS\|AUTHORITY_LEVEL_CLASS" \
  app/ components/ lib/ --include="*.tsx" --include="*.ts"
# Must return 0 results

# Check for raw Tailwind color classes on components (not in globals.css)
grep -rn "bg-green-\|text-green-\|border-green-\|bg-red-\|text-red-\|bg-amber-" \
  components/ --include="*.tsx"
# Must return 0 results

# Check for hardcoded hex in components (allowed only in globals.css)
grep -rn "#[0-9a-fA-F]\{6\}" components/ --include="*.tsx"
# Should return 0 results
```

Fix any hits found before proceeding to Task 23.

---

### Task 23: Final build and dark mode verification
**Action:** VALIDATE
**Depends on:** Tasks 1–22

```bash
pnpm build
# Must pass with 0 errors, 0 warnings
```

Then start the dev server and manually verify:
```bash
env -u ANTHROPIC_API_KEY npx next dev --port 3000
```

Navigate to any page that renders shared components. Toggle dark mode via the ThemeToggle and visually confirm:
- [ ] `SeverityBadge` — all 5 severity levels render soft tinted backgrounds in both modes
- [ ] `StatusBadge` — icons present, colors correct in both modes
- [ ] `AuthorityBadge` — outline variant with correct color in both modes
- [ ] `EmptyState` — icon visible and appropriately muted in both modes
- [ ] `SignOutButton` — base color gray, hover shifts to error red in both modes

---

## Integration Points

```yaml
DATABASE: none

INNGEST: none

API ROUTES: none

UI:
  - app/globals.css: full palette replacement
  - app/layout.tsx: landmark structure
  - app/providers.tsx: verify only
  - lib/ui-constants.ts: export shape change (callers fixed in Task 22)
  - components/: 16 components modified, 1 deleted

ENV: none
```

---

## Validation Gates

All must pass before marking this PRP complete:

```bash
# 1. Build check
pnpm build                          # 0 errors

# 2. Palette spot-check
grep "#3fc964" app/globals.css       # light green-9 present
grep "#98e9a5" app/globals.css       # dark green-9 present

# 3. Landmark structure
grep -n "main-content\|skip.*main\|<main" app/layout.tsx
# Expect: skip-nav href + <main id="main-content">

# 4. No duplicate <main>
grep -rn "<main" app/ --include="*.tsx"
# Expect: exactly 1 result (app/layout.tsx)

# 5. No legacy color exports
grep -rn "SEVERITY_CLASS\|SEVERITY_DOT\|STATUS_CLASS\|AUTHORITY_LEVEL_CLASS" \
  app/ components/ lib/ --include="*.tsx" --include="*.ts"
# Expect: 0 results

# 6. LibraryBrowser deleted
ls components/LibraryBrowser.tsx 2>&1  # "No such file"

# 7. Dark mode — manual visual check (3+ components verified in both modes)
```

---

## Anti-Patterns

- ❌ Do NOT include the full globals.css palette inline in this PRP or reconstruct it — the corrected file is authoritative and lives in the repo; if it's missing, stop and ask the user
- ❌ Do NOT use `className` for colors on Badge or Button components — use the `color` prop
- ❌ Do NOT leave `<Text>` without `as="span"` inside any `<Link>` or `<a>` element
- ❌ Do NOT add `<Heading>` without an explicit `as` prop
- ❌ Do NOT modify sidebar, navigation, or any `(dashboard)` page layouts — Phase 2 and Phase 3 scope
- ❌ Do NOT create new components — only modify existing ones
- ❌ Do NOT commit if `pnpm build` has any errors
- ❌ Do NOT use raw Tailwind colors (`bg-green-500`) — use `bg-[var(--accent-9)]`

---

## Confidence Score

**9/10** — High confidence for one-pass implementation success. All files read and current state documented. The one residual uncertainty is whether the corrected `globals.css` has been committed to the repo by the time the executor runs — Task 1 detects this with a spot-check and stops cleanly if not.
