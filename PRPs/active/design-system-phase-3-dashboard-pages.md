name: "Design System Phase 3 — Dashboard Pages"

## Goal

Refactor all user-facing dashboard pages and auth/public pages to fully comply with Cedar's design standards and frontend structural standards. Zero violations after this phase: correct heading hierarchy with explicit `as` props, metadata exports on every page, timestamps in `<time>` elements, no dark: prefixes, no raw Radix step variables, correct component variants, proper form label association, and meaningful sections with `aria-labelledby`.

## Why

- Phase 1 (foundations) and Phase 2 (shell/navigation) are complete. Phase 3 closes out the user-visible surface.
- Practice owners interact exclusively with these pages — accessibility, semantic HTML, and design consistency all affect trust signals for a compliance product.
- Blocked design system phases 4 (admin) until this is clean.

## Success Criteria

- [ ] `pnpm build` — 0 errors, 0 warnings
- [ ] Every page file has exactly one `<Heading as="h1" size="6" weight="bold">` (or `size="5"` where page-title is dynamic and content-dense — see notes)
- [ ] No `<Heading>` without explicit `as` prop anywhere in scope files
- [ ] No `dark:` prefixes in any in-scope file
- [ ] No raw Radix step variables (`var(--gray-6)`, `var(--accent-9)`, `var(--red-9)`, etc.) in `className` or `style` props in component files — only `var(--cedar-*)` tokens permitted
- [ ] Every visible date/timestamp wrapped in `<time datetime="ISO-string">`
- [ ] All `<Table.Root>` have `variant="surface"`
- [ ] Every page exports `metadata` or `generateMetadata` with `title: "Page Name — Cedar"`
- [ ] All icon-only buttons have `aria-label`; all icons accompanied by text have `aria-hidden="true"`
- [ ] All form inputs have associated `<label>` elements (htmlFor matching id)

## Context

### Files to Read First
```yaml
- file: docs/design-system/design-standards.md
  why: Authoritative reference for all component variants, color decisions, forbidden patterns

- file: docs/design-system/frontend-standards.md
  why: Semantic HTML rules — heading hierarchy, landmark structure, time elements, form labels, section usage

- file: .claude/skills/design-tokens/SKILL.md
  why: Decision tree for which token system to use for any given value

- file: .claude/skills/ui-components/SKILL.md
  why: Component routing — when to use Radix Themes vs custom Tailwind

- file: app/globals.css
  why: All --cedar-* token definitions — what tokens are available to reference

- file: lib/ui-constants.ts
  why: SEVERITIES array and shared semantic color mappings used across pages

- file: lib/format.ts
  why: timeAgo(), formatDate(), capitalize() utilities used throughout
```

### Current File Tree (in-scope files)
```bash
app/
  page.tsx                                    # Root redirect — add metadata only
  sign-in/page.tsx                            # WorkOS redirect — add metadata only
  onboarding/
    page.tsx                                  # Onboarding shell
    OnboardingForm.tsx                        # Multi-step form (client component)
  pricing/page.tsx                            # Public pricing page

  (dashboard)/
    home/page.tsx
    changes/page.tsx
    changes/[id]/page.tsx
    library/page.tsx
    library/[slug]/page.tsx
    library/[slug]/[id]/page.tsx
    library/[slug]/[id]/RegulationTabs.tsx    # client component
    faq/page.tsx
    faq/[id]/page.tsx
    sources/page.tsx
    audit/page.tsx
    audit/export/page.tsx                     # print-only client component
    settings/page.tsx
```

### Files to Create or Modify
```bash
app/page.tsx                                              (M) add metadata export
app/sign-in/page.tsx                                      (M) add metadata export
app/onboarding/page.tsx                                   (M) heading hierarchy, metadata
app/onboarding/OnboardingForm.tsx                         (M) heading as props, label association, button variants
app/pricing/page.tsx                                      (M) heading hierarchy, section h2, button variants, tokens, metadata
app/(dashboard)/home/page.tsx                             (M) as="h1", section headings, tokens, <time>, metadata, icons
app/(dashboard)/changes/page.tsx                          (M) as="h1", table variant, tokens, <time>, metadata, filter pills
app/(dashboard)/changes/[id]/page.tsx                     (M) as="h1" size="6", h2 sections, DiffViewer dark: removal, <time>, generateMetadata
app/(dashboard)/library/page.tsx                          (M) as="h1", h2 section, Radix Grid, filter pill tokens, metadata
app/(dashboard)/library/[slug]/page.tsx                   (M) as="h1", breadcrumb ol/li, search type="search", button variants, generateMetadata
app/(dashboard)/library/[slug]/[id]/page.tsx              (M) <time> for dates, badge color props, generateMetadata
app/(dashboard)/library/[slug]/[id]/RegulationTabs.tsx    (M) Radix Tabs.Root, h2 headings, raw var removal, <time>, dark: removal
app/(dashboard)/faq/page.tsx                              (M) as="h1", h2 topic groups, DifficultyBadge tokens, metadata
app/(dashboard)/faq/[id]/page.tsx                         (M) size="6" on h1, h2 sidebar sections, <time>, dark: removal, generateMetadata
app/(dashboard)/sources/page.tsx                          (M) as="h1", table variant, MonitoringTierBadge tokens, <time>, metadata
app/(dashboard)/audit/page.tsx                            (M) as="h1", h2 sections, table variant, <time>, button variants, metadata
app/(dashboard)/audit/export/page.tsx                     (M) heading hierarchy, metadata (note: client component)
app/(dashboard)/settings/page.tsx                         (M) as="h1", h2 card headings, label association, button variants, dark: removal, metadata
```

### Known Gotchas

```typescript
// TOKEN RULES:
// ✅ OK in className: var(--cedar-*) tokens defined in app/globals.css
// ✅ OK in Radix component props: color="gray", color="red", etc.
// ❌ FORBIDDEN in className: var(--gray-6), var(--accent-9), var(--red-9), etc. (raw Radix steps)
// ❌ FORBIDDEN: dark: Tailwind prefix — Cedar uses Radix Themes automatic dark mode
// ❌ FORBIDDEN: hardcoded hex/rgb/hsl

// HEADING SIZES (design-standards §21):
// Page title: size="6" weight="bold" as="h1"
// Section: size="3" weight="bold" as="h2" (or size="4" for prominent sections)
// Card title / sub-section: size="2" weight="bold" as="h3"
// Note: existing card section labels use <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
//   which is a LABEL STYLE (all-caps category label), NOT a heading. Convert the semantic section
//   headings (e.g. "AI Summary", "Chain Validation Runs", "Practice", "Subscription") to <Heading as="h2">.
//   Keep purely decorative card category labels as <Text> where there is already an h2 above them.

// AUDIT/EXPORT PAGE is 'use client' — metadata export via export const metadata = {} doesn't work
// in client components. Add a separate layout.tsx for /audit/export OR add metadata to the parent
// audit/layout.tsx OR note this as acceptable (print page accessed from /audit link).
// Best approach: wrap in a thin server component that exports metadata and renders the client below.

// REGULATION TABS — RegulationTabs.tsx uses custom tab buttons. Convert to Radix <Tabs.Root>
// which has built-in keyboard navigation (Arrow keys, Home, End). This is a significant change —
// replace the manual state machine with Radix primitives but keep all tab content identical.

// DIFF VIEWER in changes/[id]/page.tsx — currently uses dark: Tailwind classes for colors.
// Replace dark: classes with CSS that uses Cedar semantic tokens for diff highlight colors.
// Check globals.css for --cedar-diff-added-bg / --cedar-diff-removed-bg. If they don't exist,
// use: bg-[var(--cedar-surface-success)] for added, bg-[var(--cedar-surface-error)] for removed.
// Actually: use Radix color semantic tokens without dark: prefix:
//   added: className="bg-[var(--green-a3)] text-[var(--green-11)]"  ← still raw step vars!
// The cleanest approach for DiffViewer: use inline style={{ backgroundColor: 'var(--green-a3)' }}
// BUT that's still a raw step var. Check globals.css for diff-specific tokens.
// If none exist, add --cedar-diff-added-bg: var(--green-a3) etc. to globals.css first.
// Then use bg-[var(--cedar-diff-added-bg)] in className.

// <time datetime="..."> PATTERN:
// <time dateTime={new Date(iso).toISOString()}>{displayString}</time>
// For timeAgo() calls: <time dateTime={new Date(iso).toISOString()}>{timeAgo(iso)}</time>
// For formatDate() calls: <time dateTime={new Date(iso).toISOString()}>{formatDate(iso)}</time>

// FILTER PILLS (changes page and library page) — currently use <Link> with manual bg/text/border
// classes using CSS custom property tokens. The SEVERITY_ACTIVE_CLASS map uses raw Radix vars.
// These are navigation links (change URL = navigate), so <Link> is semantically correct.
// For active state styling, use Cedar semantic tokens: var(--cedar-interactive-active-bg) or
// similar. If those tokens don't exist in globals.css, add them.
// The filter pills MUST remain as <Link> not <button> because they navigate.

// PAGINATION — uses <Link> styled as buttons for navigation. This is correct semantics.
// Disabled state uses <span> — acceptable.

// CARD SECTION LABELS (the uppercase tiny tracking labels like "AI SUMMARY"):
// These are decorative category labels, NOT section headings.
// They co-exist with semantic <Heading> — the <Heading> is the section heading,
// the label is supplementary. When a card is a named section, add:
//   <section aria-labelledby="section-id">
//     <Heading id="section-id" as="h2" ...>AI Summary</Heading>
//   </section>
// OR keep the card labels as <Text> and add a proper <Heading> inside the card.
// Choice: make the card-top label the h2 — convert <Text size="1" weight="bold" color="gray">
// to <Heading as="h2" size="1" weight="bold" color="gray" className="uppercase tracking-wide">
// Wait — that's unusual for size="1" heading. Design-standards §21 says headings don't have
// size="1". The correct pattern for card section labels that ARE the semantic heading:
//   <Heading as="h2" size="2" weight="bold">AI Summary</Heading>
// and drop the uppercase tracking-wide styling (or keep via className if desired).
// Check design-standards.md §21 for exact recommended card heading pattern.

// FORM LABELS — for inputs that currently have no label:
// Pattern: <label htmlFor="input-id"><Text as="span" size="2">Label text</Text></label>
//          <TextField.Root id="input-id" ... />
// For Radix Select: use <label htmlFor="select-trigger-id"> or wrap in a form group

// SETTINGS PAGE TierBadge and SubscriptionStatus — currently use dark: prefixes.
// Replace with Radix color props where possible, or use Cedar semantic tokens.
// TierBadge for intelligence: use <Badge color="purple"> (Radix built-in)
// TierBadge for monitor: use <Badge color="gray"> (Radix built-in)
// SubscriptionStatus indicators: use var(--cedar-status-active), var(--cedar-status-warning),
// var(--cedar-status-error) if they exist in globals.css. If not, use Radix color scheme:
//   active: text-[var(--green-11)], dot: bg-[var(--green-9)] — these ARE raw step vars
//   Better: use <Badge color="green"> or inline style the dot, or add Cedar status tokens.

// FAQ DifficultyBadge — remove dark: prefixes, use Radix color props:
//   Straightforward → color="green"
//   Moderate → color="yellow" (or "amber" if supported)
//   Complex → color="red"
// These render correctly in dark mode automatically via Radix.

// AUDIT EXPORT PAGE is 'use client' and intentionally print-optimized with white bg / plain HTML.
// It should NOT use Radix Themes components (would need Theme wrapper, adds complexity).
// The fix here is minimal: add heading hierarchy (h1 for the title), ensure metadata is provided.
// Create a thin server wrapper: audit/export/layout.tsx with metadata, keep page.tsx as-is
// except fixing the heading structure.

// ONBOARDING FORM breadcrumb step indicators use bg-[var(--accent-9)] — raw step var.
// Replace with: bg-[var(--cedar-interactive-accent)] or use Radix <Badge color="blue"> / similar.
// Check globals.css for available Cedar accent tokens.
```

## Tasks (execute in order)

---

### Task 0: Read Design References
**Action:** READ (no code changes)

Before writing any code, read in full:
1. `docs/design-system/design-standards.md` — especially §6 (buttons), §12 (tabs), §21 (typography), §32 (grid)
2. `docs/design-system/frontend-standards.md` — especially §5.3 (dl), §5.4 (time), §8 (forms), §8.6 (search input)
3. `app/globals.css` — catalog all `--cedar-*` token names available

Identify: does `--cedar-diff-added-bg` / `--cedar-diff-removed-bg` exist? Does `--cedar-status-active` etc. exist? What Cedar tokens cover the interactive states (active filter pills)?

---

### Task 1: Add Missing Cedar Tokens to globals.css (if needed)
**File:** `app/globals.css`
**Action:** MODIFY (only add tokens if they don't already exist)
**Depends on:** Task 0

If diff-viewer tokens are missing, add in the appropriate `:root` / `.dark` sections:
```css
/* Only add if not already present */
--cedar-diff-added-bg: var(--green-a3);
--cedar-diff-added-text: var(--green-11);
--cedar-diff-added-border: var(--green-6);
--cedar-diff-removed-bg: var(--red-a3);
--cedar-diff-removed-text: var(--red-11);
--cedar-diff-removed-border: var(--red-6);
```

If filter-pill active state tokens are missing, add:
```css
--cedar-filter-active-bg: var(--accent-9);
--cedar-filter-active-text: #fff;
--cedar-filter-active-border: var(--accent-9);
```

If urgency/status dot tokens are missing, add:
```css
--cedar-status-dot-success: var(--green-9);
--cedar-status-dot-warning: var(--yellow-9);
--cedar-status-dot-error: var(--red-9);
```

---

### Task 2: Simple Metadata-Only Files
**Files:** `app/page.tsx`, `app/sign-in/page.tsx`
**Action:** MODIFY

`app/page.tsx` — add metadata export before the function:
```typescript
export const metadata = { title: 'Cedar' }
// keep the redirect function unchanged
```

`app/sign-in/page.tsx` — this is already a full redirect. Add metadata:
```typescript
export const metadata = { title: 'Sign In — Cedar' }
// keep existing function unchanged
```

---

### Task 3: Dashboard Home Page
**File:** `app/(dashboard)/home/page.tsx`
**Action:** MODIFY

Issues to fix:
1. Add `export const metadata = { title: 'Dashboard — Cedar' }`
2. `<Heading size="6" weight="bold">` → `<Heading as="h1" size="6" weight="bold">`
3. Stats section: wrap in `<section aria-labelledby="overview-heading">` with `<Heading id="overview-heading" as="h2" size="3" weight="bold">Overview</Heading>`
4. Each stat Card: add `variant="surface"` to `<Card>` props
5. Stat card icon: `<i className={`${s.icon}...`} aria-hidden="true" />` — add `aria-hidden`
6. Remove `text-[var(--red-9)]` → `text-[var(--cedar-status-dot-error)]` (or use Radix color)
   For urgent stat value: `style={{ color: 'var(--red-9)' }}` isn't ideal — use `className="text-[var(--cedar-status-dot-error)]"` via the new token
7. Critical & High Alerts section: convert to `<section aria-labelledby="alerts-heading">` with `<Heading id="alerts-heading" as="h2" size="3" weight="bold">Critical & High Alerts</Heading>` (replace the `<Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">`)
8. "View all" button: `<Button variant="ghost" color="gray" size="1" asChild>` (ghost for utility navigation)
9. Empty state in alerts: use `<EmptyState>` component
10. `divide-y divide-[var(--gray-6)]` → `divide-y divide-[var(--cedar-border)]` (use Cedar token)
11. Alert list items: each is a `<Link>` — these are navigation links, correct. Add `aria-hidden="true"` to icons inside. Wrap time in `<time dateTime={new Date(c.detected_at).toISOString()}>{timeAgo(c.detected_at)}</time>`
12. Compliance Health section: same section heading pattern. `<Heading id="health-heading" as="h2" size="3" weight="bold">Compliance Health</Heading>`
13. Replace `text-[var(--red-9)]` and `text-[var(--green-11)]` with Cedar tokens or Radix color semantics (see Task 1 tokens)
14. `bg-[var(--green-9)]` dot → `bg-[var(--cedar-status-dot-success)]`
15. `<Button variant="outline">` → `<Button variant="soft" color="gray" highContrast>`
16. Recent Activity section: `<section aria-labelledby="activity-heading">` with `<Heading id="activity-heading" as="h2" size="3" weight="bold">Recent Activity — Last 7 Days</Heading>`
17. Empty state: use `<EmptyState>` component
18. Timestamps in activity list: wrap in `<time>`

---

### Task 4: Changes Feed Page
**File:** `app/(dashboard)/changes/page.tsx`
**Action:** MODIFY

Issues to fix:
1. Add `export const metadata = { title: 'Changes — Cedar' }`
2. `<Heading size="6" weight="bold">` → `<Heading as="h1" size="6" weight="bold">Changes</Heading>` (change "Regulatory Changes" to "Changes" per PRP scope)
3. `SEVERITY_ACTIVE_CLASS` — remove raw `var(--red-a3)`, `var(--orange-a3)`, etc. Map them to Cedar tokens from Task 1, OR rewrite using Radix Badge-style inline semantics. Since these are Link elements, the cleanest approach is to use `--cedar-*` tokens that wrap the Radix step values.
4. Filter "All" link active state: `bg-foreground text-background border-foreground` uses Tailwind semantic variables. Replace with Cedar tokens: `bg-[var(--cedar-interactive-active-bg)] text-[var(--cedar-interactive-active-text)] border-[var(--cedar-interactive-active-border)]`
5. Filter severity link inactive: `bg-background text-muted-foreground border-border hover:...` — replace with Cedar tokens: `bg-[var(--cedar-surface)] text-[var(--cedar-text-secondary)] border-[var(--cedar-border)]`
6. Table: `<Table.Root>` → `<Table.Root variant="surface">`
7. Empty state: replace raw `<h2>` and `<p>` tags with `<Heading as="h2" size="3">` and `<Text as="p" size="2" color="gray">`
8. Table cells: replace `<p className="text-sm ...">` inside cells with `<Text as="p" size="2" ...>` or `<span>` as appropriate
9. Timestamps: `<Table.Cell>{timeAgo(change.detected_at)}</Table.Cell>` → wrap in `<time dateTime={new Date(change.detected_at).toISOString()}>{timeAgo(change.detected_at)}</time>`
10. Pagination links: these are `<Link>` elements styled as buttons — keep as `<Link>` (correct navigation semantics). Replace raw CSS var references with Cedar tokens. Add `aria-label="Go to previous page"` / `aria-label="Go to next page"` for icon-only links
11. Icons in buttons/links: add `aria-hidden="true"` to all `<i>` tags

---

### Task 5: Change Detail Page
**File:** `app/(dashboard)/changes/[id]/page.tsx`
**Action:** MODIFY

Issues to fix:
1. Add `generateMetadata`:
```typescript
export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = createServerClient()
  const { data } = await supabase.from('changes').select('summary, sources(name)').eq('id', id).single()
  const src = (data?.sources as { name: string } | null)?.name ?? 'Change'
  return { title: `${src} — Cedar` }
}
```
2. Page title: `<Heading size="5" weight="bold">` → `<Heading as="h1" size="6" weight="bold">{c.sources?.name ?? 'Unknown Source'}</Heading>` (move source name to h1, remove the separate heading — adjust layout accordingly)
3. AI Summary card: Convert card section label to `<Heading as="h2" size="2" weight="bold">AI Summary</Heading>`
4. Detected Changes card: `<Heading as="h2" size="2" weight="bold">Detected Changes</Heading>`
5. Details sidebar card: `<Heading as="h2" size="2" weight="bold">Details</Heading>` (on the first card in aside)
6. DiffViewer component: Replace all `dark:` prefixes:
   - `dark:bg-green-950/40` → use `bg-[var(--cedar-diff-added-bg)]`
   - `dark:text-green-400` / `text-green-600` → `text-[var(--cedar-diff-added-text)]`
   - `dark:border-green-800` / `border-green-200` → `border-[var(--cedar-diff-added-border)]`
   - `dark:bg-red-950/40` → `bg-[var(--cedar-diff-removed-bg)]`
   - etc. Same pattern for removed lines
   - `bg-card text-muted-foreground` → `bg-[var(--cedar-surface)] text-[var(--cedar-text-secondary)]`
   - `border-border` → `border-[var(--cedar-border)]`
7. Back link: it's a `<Link>` with `text-[var(--gray-11)]` → replace with Cedar token
8. Detected-at date: wrap full date string in `<time dateTime={new Date(c.detected_at).toISOString()}>`
9. Source link: already has `target="_blank" rel="noopener noreferrer"` ✓. Change class `text-primary hover:text-primary/80` to use Radix `<Link>` component: `<Link href={c.sources.url} target="_blank" rel="noopener noreferrer" color="gray" highContrast underline="always">`
10. Icon `<i>` tags: add `aria-hidden="true"`

---

### Task 6: Regulation Library Home
**File:** `app/(dashboard)/library/page.tsx`
**Action:** MODIFY

Issues to fix:
1. Add `export const metadata = { title: 'Regulation Library — Cedar' }`
2. Both gated and non-gated branches: `<Heading size="6" weight="bold">` → `<Heading as="h1" size="6" weight="bold">`
3. Practice type filter pills:
   - Active: replace `bg-[var(--accent-9)] text-white border-[var(--accent-9)]` with Cedar tokens `bg-[var(--cedar-filter-active-bg)] text-[var(--cedar-filter-active-text)] border-[var(--cedar-filter-active-border)]`
   - Inactive: replace `bg-[var(--color-panel)] text-[var(--gray-11)] border-[var(--gray-6)] hover:border-[var(--accent-a6)]` with Cedar tokens
4. Domain cards section: add `<section aria-labelledby="browse-heading">` wrapping the grid:
   ```tsx
   <section aria-labelledby="browse-heading">
     <Heading id="browse-heading" as="h2" size="3" weight="bold" mb="4">Browse by Category</Heading>
     <Grid columns={{ initial: '1', md: '2', lg: '3' }} gap="4">
       {(domains ?? []).map((domain) => { ... <DomainCard headingLevel="h3" ... /> ... })}
     </Grid>
   </section>
   ```
   Note: check if DomainCard accepts a `headingLevel` prop — if not, add it (see Task 6B)
5. Replace `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">` with Radix `<Grid columns={{ initial: '1', md: '2', lg: '3' }} gap="4">`

---

### Task 6B: DomainCard Component — headingLevel prop
**File:** `components/DomainCard.tsx`
**Action:** MODIFY
**Depends on:** Task 6

Read DomainCard.tsx first. Add `headingLevel` prop (default `'h3'`) that controls the card title heading element. Ensure the card title renders as `<Heading as={headingLevel} ...>`. This is the only change.

---

### Task 7: Library Category Detail Page
**File:** `app/(dashboard)/library/[slug]/page.tsx`
**Action:** MODIFY

Issues to fix:
1. Add `generateMetadata`:
```typescript
export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = createServerClient()
  const { data: domain } = await supabase.from('kg_domains').select('name').eq('slug', slug).maybeSingle()
  return { title: domain ? `${domain.name} — Cedar` : 'Regulation Library — Cedar' }
}
```
2. `<Heading size="6" weight="bold">` → `<Heading as="h1" size="6" weight="bold">`
3. Breadcrumb: convert from `<nav><span>` to proper `<nav aria-label="Breadcrumb"><ol>/<li>` structure per frontend-standards:
```tsx
<nav aria-label="Breadcrumb">
  <ol className="flex items-center gap-1.5 text-sm text-[var(--cedar-text-secondary)]">
    {breadcrumbs.map((crumb, i) => (
      <li key={crumb.href} className="flex items-center gap-1.5">
        {i > 0 && <i className="ri-arrow-right-s-line text-xs" aria-hidden="true" />}
        <Link href={crumb.href} ...>{crumb.label}</Link>
      </li>
    ))}
    <li className="flex items-center gap-1.5">
      <i className="ri-arrow-right-s-line text-xs" aria-hidden="true" />
      <span aria-current="page" className="...font-medium truncate">{domain.name}</span>
    </li>
  </ol>
</nav>
```
4. `<TextField.Root>` — add `type="search"` per frontend-standards §8.6. Also add an accessible label: wrap in a `<form>` (already exists) and add a visually-hidden label:
```tsx
<label htmlFor="regulation-search" className="sr-only">Search regulations</label>
<TextField.Root id="regulation-search" name="q" type="search" ... />
```
5. Sub-domain `<Badge>` in nav: replace `className` hover overrides with Radix color props. Use `<Badge variant="outline" color="gray">` with `asChild` or wrap `<Link asChild>` inside Badge.
6. Sort button: `<Button variant="outline">` → `<Button variant="soft" color="gray" highContrast size="1">`
7. Pagination buttons: `<Button variant="outline">` → `<Button variant="soft" color="gray" highContrast size="1">` (these are inside `<Link asChild>` — verify asChild pattern works or use `asChild` on Button)
8. Active filter Badge: `<Badge variant="soft" className="text-xs gap-1">` → use `<Badge variant="soft" color="gray" size="1">` (Radix color prop)
9. "Clear all" link: use Radix `<Link>` component: `<Link color="gray" highContrast underline="always" ...>`
10. Icon `<i>` tags throughout: add `aria-hidden="true"`
11. Entity list container: replace `border border-[var(--gray-6)] rounded-md` with `border border-[var(--cedar-border)] rounded-md`
12. Replace any remaining raw Radix step vars in className with Cedar tokens

---

### Task 8: Regulation Detail Page
**File:** `app/(dashboard)/library/[slug]/[id]/page.tsx`
**Action:** MODIFY

Issues to fix:
1. Add `generateMetadata`:
```typescript
export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = createServerClient()
  const { data } = await supabase.from('kg_entities').select('name').eq('id', id).maybeSingle()
  return { title: data ? `${data.name} — Cedar` : 'Regulation — Cedar' }
}
```
2. `<Heading size="6" weight="bold" as="h1">` — already has `as="h1"` ✓. Verify size is "6".
3. Breadcrumb: same `<nav aria-label="Breadcrumb"><ol><li>` conversion as Task 7
4. Metadata date rows (effective_date, publication_date): wrap display dates in `<time>`:
```tsx
<time dateTime={entity.effective_date}>{new Date(entity.effective_date).toLocaleDateString(...)}</time>
```
5. Badge rows: add Radix `color` props:
   - `<Badge variant="soft">` entity_type → `<Badge variant="soft" color="gray">`
   - `<Badge variant="outline">` document_type → `<Badge variant="outline" color="gray">`
   - `<Badge variant="outline">` jurisdiction → `<Badge variant="outline" color="gray">`
   - `<Badge variant="outline">` status → `<Badge variant="outline" color="gray">`
6. Icon `<i>` tags in metadata row: add `aria-hidden="true"`
7. Back link: uses raw `text-[var(--gray-11)]` → Cedar token

---

### Task 9: RegulationTabs Component
**File:** `app/(dashboard)/library/[slug]/[id]/RegulationTabs.tsx`
**Action:** MODIFY

This is the most complex task. Issues to fix:

**Tab bar conversion to Radix Tabs.Root:**
```tsx
import { Tabs } from '@radix-ui/themes'

// Replace the manual tab bar + state with:
<Tabs.Root defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview"><Text as="span">Overview</Text></Tabs.Trigger>
    <Tabs.Trigger value="reader"><Text as="span">Reader</Text></Tabs.Trigger>
    <Tabs.Trigger value="timeline">
      <Text as="span">Timeline</Text>
      {versions.length > 0 && <Badge variant="soft" color="gray" ml="1" size="1">{versions.length}</Badge>}
    </Tabs.Trigger>
    <Tabs.Trigger value="related">
      <Text as="span">Related</Text>
      {(outgoing + incoming) > 0 && <Badge ...>{count}</Badge>}
    </Tabs.Trigger>
  </Tabs.List>

  <Box pt="4">
    <Tabs.Content value="overview"><OverviewTab ... /></Tabs.Content>
    <Tabs.Content value="reader"><ReaderTab ... /></Tabs.Content>
    <Tabs.Content value="timeline"><TimelineTab ... /></Tabs.Content>
    <Tabs.Content value="related"><RelatedTab ... /></Tabs.Content>
  </Box>
</Tabs.Root>
```
Note: Radix Themes Tabs.Root inherits the `gray` accent per design-standards §12 — no color prop needed.

**Section headings in tab content:**
- OverviewTab "Summary" card: `<Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">Summary</Text>` → `<Heading as="h2" size="2" weight="bold">Summary</Heading>` (since this is top-level within the tab)
- Same for "Classification Audit Trail", "Key Details", "Categories", "Relevant Practice Types", "Service Lines", "Original Source"

**Remove raw Radix step vars:**
- `border-[var(--gray-6)]` → `border-[var(--cedar-border)]`
- `bg-[var(--accent-9)]` → `bg-[var(--cedar-status-dot-success)]` or appropriate Cedar token
- `bg-[var(--gray-a6)]` → `bg-[var(--cedar-interactive-hover)]` or appropriate
- `border-[var(--color-background)]` → `border-[var(--cedar-page-bg)]` (check globals.css)
- `bg-[var(--color-background)]` → same

**DifficultyBadge in this file (none, but check ConfidenceBadge/AuthorityBadge imports)**

**Classification audit table:**
- Replace raw `<table>` with `<Table.Root variant="surface"><Table.Header>...` etc.
- Or keep raw `<table>` but fix the raw Radix step vars in className
- Decision: convert to Radix `<Table.Root variant="surface">` for consistency

**Timeline section:**
- `text-[var(--gray-11)]` → `text-[var(--cedar-text-secondary)]`  (use Cedar token)
- `bg-[var(--accent-9)]` timeline dot → `bg-[var(--cedar-status-dot-success)]`
- `bg-[var(--gray-a6)]` classification dot → appropriate Cedar token
- `border-[var(--color-background)]` → Cedar token

**Dates in timeline:**
- `{formatDate(event.date)}` → `<time dateTime={new Date(event.date).toISOString()}>{formatDate(event.date)}</time>`

**Related tab section labels:**
- `<Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">Outgoing...` → `<Heading as="h2" size="2" weight="bold">...`
- `<Text size="2" weight="medium">` relationship type → `<Heading as="h3" size="2" weight="bold">`

**Remove `useState` import if switching to Radix Tabs.Root** (Radix handles state internally with `defaultValue`)

---

### Task 10: FAQ List Page
**File:** `app/(dashboard)/faq/page.tsx`
**Action:** MODIFY

Issues to fix:
1. Add `export const metadata = { title: 'FAQ — Cedar' }`
2. `<Heading size="6" weight="bold">` → `<Heading as="h1" size="6" weight="bold">Regulatory FAQ</Heading>`
3. `DifficultyBadge` function: remove `dark:` prefixes, use Radix color props:
```tsx
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colorMap: Record<string, 'green' | 'yellow' | 'red'> = {
    Straightforward: 'green',
    Moderate: 'yellow',
    Complex: 'red',
  }
  return (
    <Badge variant="outline" color={colorMap[difficulty] ?? 'gray'}>
      {difficulty}
    </Badge>
  )
}
```
4. Topic groups: `<Text size="2" weight="bold" color="gray">{topic}</Text>` → `<Heading as="h2" size="3" weight="bold">{topic}</Heading>`
5. FAQ item cards: `<Link key={faq.id} href={...}><Card ...>` — this is a navigable card. Add `aria-label` to give screen readers context, or ensure the question text is descriptive enough. Remove `className="cursor-pointer"` (redundant on a link). Card becomes a link — semantically a `<Link>` containing a `<Card>` is fine.
6. Attorney Reviewed badge: replace `dark:text-purple-400` with Radix color: use `<Badge variant="soft" color="purple">` for the attorney reviewed indicator
7. Icons: add `aria-hidden="true"` to all `<i>` tags
8. Search field: add accessible label (even if disabled): `<label htmlFor="faq-search" className="sr-only">Search FAQs</label>` + `id="faq-search"` on TextField.Root

---

### Task 11: FAQ Detail Page
**File:** `app/(dashboard)/faq/[id]/page.tsx`
**Action:** MODIFY

Issues to fix:
1. Add `generateMetadata`:
```typescript
export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const faq = MOCK_FAQS.find((f) => f.id === id)
  return { title: faq ? `${faq.question.slice(0, 60)}… — Cedar` : 'FAQ — Cedar' }
}
```
2. `<Heading size="5" weight="bold" as="h1">` → `<Heading as="h1" size="6" weight="bold">` (size "5" is too small for a page title per PRP)
3. `DifficultyBadge`: same fix as Task 10 — use Radix color props, remove dark: prefixes
4. Last reviewed date: wrap in `<time dateTime={faq.lastReviewed}>{new Date(faq.lastReviewed).toLocaleDateString(...)}</time>`
5. `renderMarkdown` function: `<h4>` tags have raw `className` with `text-[var(--gray-12)]`. Remove inline color className — Radix Themes provides heading color. Or convert to `<Heading as="h4" size="2" weight="bold">` BUT this is inside a custom markdown renderer. Simplest: render as `<strong className="block text-sm font-semibold mt-5 mb-1.5">` without raw var references. OR use `--cedar-text-primary` token.
6. Custom disclaimer `<Callout.Root>`: remove `dark:border-amber-800 dark:bg-amber-950/40 bg-amber-50 border-amber-200`. Use `<Callout.Root color="amber" variant="surface">` — Radix handles dark mode automatically.
7. Callout text class: remove `text-amber-800 dark:text-amber-300` — let Radix handle theming
8. Attorney reviewed card: `className="border-purple-200 dark:border-purple-800"` → remove. Use Radix surface card without custom border. `Text` with `dark:text-purple-300` → use Radix color="purple"
9. "Have a follow-up?" card: `text-[var(--accent-9)]` → use Radix `<Link color="gray" highContrast>` instead of raw anchor
10. Source regulations sidebar: `<Heading as="h2" size="2" weight="bold">Source Regulations</Heading>` (convert from Text)
11. "Attorney Reviewed" card heading: `<Heading as="h2" size="2" weight="bold">Attorney Reviewed</Heading>` + use Radix `color="purple"` on Text, remove dark: class
12. "Have a follow-up?" heading: `<Heading as="h2" size="2" weight="bold">Have a follow-up?</Heading>`
13. Source regulation links: replace `text-[var(--gray-12)] hover:text-[var(--accent-9)]` with Radix Link

---

### Task 12: Sources Page
**File:** `app/(dashboard)/sources/page.tsx`
**Action:** MODIFY

Issues to fix:
1. Add `export const metadata = { title: 'Sources — Cedar' }`
2. `<Heading size="6" weight="bold">` → `<Heading as="h1" size="6" weight="bold">Source Library</Heading>`
3. `MonitoringTierBadge`: remove `dark:` prefixes, use Radix color props:
```tsx
function MonitoringTierBadge({ tier }: { tier: string | null }) {
  const key = tier?.toLowerCase() ?? 'standard'
  const color = key === 'critical' ? 'red' : key === 'low' ? 'gray' : 'blue'
  return (
    <Badge variant="outline" color={color as 'red' | 'gray' | 'blue'}>
      {tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Standard'}
    </Badge>
  )
}
```
4. `FreshnessIndicator`: replace raw step vars with Cedar tokens:
   - `bg-[var(--green-9)]` → `bg-[var(--cedar-status-dot-success)]`
   - `bg-yellow-400` → `bg-[var(--cedar-status-dot-warning)]`
   - `bg-[var(--gray-11)] opacity-30` → `bg-[var(--cedar-text-secondary)] opacity-30`
5. `<Table.Root>` → `<Table.Root variant="surface">`
6. The local `timeAgo` function is redundant — import from `@/lib/format` instead (keep DRY)
7. Table timestamp cells: wrap in `<time dateTime={...}>`
8. Empty state: replace `<p>` inside inner `<div>` with `<Text as="p">` components
9. Icons in badges/indicators: `aria-hidden="true"`

---

### Task 13: Audit Trail Page
**File:** `app/(dashboard)/audit/page.tsx`
**Action:** MODIFY

Issues to fix:
1. Add `export const metadata = { title: 'Audit Trail — Cedar' }`
2. `<Heading size="6" weight="bold">` → `<Heading as="h1" size="6" weight="bold">Audit Trail</Heading>`
3. Export PDF button: `<Button variant="outline" size="1" asChild>` → `<Button variant="soft" color="gray" highContrast size="1" asChild>`
4. Export PDF button icon: add `aria-hidden="true"` to `<i>`
5. Section 1 heading: raw `<h2 className="text-sm font-semibold text-[var(--gray-12)]">Chain Validation Runs</h2>` → `<Heading as="h2" size="3" weight="bold">Chain Validation Runs</Heading>` (remove className — Radix Heading handles color)
6. Section 2 heading: same — `<Heading as="h2" size="3" weight="bold">Change Audit Trail</Heading>` + `<Text as="span" size="1" color="gray">most recent 50 records</Text>`
7. Both tables: `<Table.Root>` → `<Table.Root variant="surface">`
8. Timestamps in tables:
   - `{formatDate(log.run_at)}` → `<time dateTime={new Date(log.run_at).toISOString()}>{formatDate(log.run_at)}</time>`
   - `{timeAgo(c.detected_at)}` → `<time dateTime={new Date(c.detected_at).toISOString()}>{timeAgo(c.detected_at)}</time>`
9. Broken chains badge: `<Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800">` → `<Badge variant="outline" color="red">`
10. Valid chains `<span className="text-sm font-medium text-[var(--green-11)]">` → `<Text size="2" weight="medium" color="green" as="span">`
11. Empty state icons: add `aria-hidden="true"` to `<i>`

---

### Task 14: Audit Export Page
**File:** `app/(dashboard)/audit/export/page.tsx`
**Action:** MODIFY (minimal — print document)

This page is intentionally plain HTML for browser print. The fixes are:
1. Add a heading in the letterhead section: the "Audit Trail Export" `<p>` → `<h1 className="font-semibold text-gray-700 text-sm">Audit Trail Export</h1>`
2. Wrap the `formatDate(c.detected_at)` calls in `<time dateTime={new Date(c.detected_at).toISOString()}>` elements
3. For metadata: since this is a client component (`'use client'`), static `export const metadata` is not supported. Add `app/(dashboard)/audit/export/layout.tsx` (server component) that exports the metadata:
```typescript
// app/(dashboard)/audit/export/layout.tsx
export const metadata = { title: 'Audit Export — Cedar' }
export default function AuditExportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

---

### Task 15: Settings Page
**File:** `app/(dashboard)/settings/page.tsx`
**Action:** MODIFY

Issues to fix:
1. Add `export const metadata = { title: 'Settings — Cedar' }`
2. `<Heading size="6" weight="bold">` → `<Heading as="h1" size="6" weight="bold">Settings</Heading>`
3. Card section labels → convert to `<Heading as="h2" ...>` where semantically appropriate:
   - "Account" card: `<Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">Account</Text>` → `<Heading as="h2" size="2" weight="bold">Account</Heading>`
   - "Practice" → same
   - "Subscription" → same
   - "Notifications" → same
   - "Team Members" → same
   - "Jurisdictions" → same
4. `TierBadge`:
   - Remove `dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800`
   - Use `<Badge variant="outline" color={isIntelligence ? 'purple' : 'gray'}>` — Radix handles dark mode
5. `SubscriptionStatus`: Remove all `dark:` prefixes. Use Radix color tokens via `<Text>`:
   - active/trialing: `<Text as="span" size="2" weight="medium" color="green">` with dot `bg-[var(--cedar-status-dot-success)]`
   - past_due: color="yellow", dot `bg-[var(--cedar-status-dot-warning)]`
   - canceled: color="red", dot `bg-[var(--cedar-status-dot-error)]`
   - inactive: color="gray"
6. Admin role badge: `className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"` → `color="orange"` on Badge (Radix color, no className)
7. Billing buttons: `<Button variant="outline">` → `<Button variant="soft" color="gray" highContrast>`
8. "Upgrade Plan" button: same — `variant="soft" color="gray" highContrast`
9. Team invite form: add labels:
   ```tsx
   <label htmlFor="invite-email" className="sr-only">Invite email</label>
   <TextField.Root id="invite-email" type="email" ... />

   {/* For Select: */}
   <label htmlFor="invite-role" className="sr-only">Role</label>
   <Select.Root defaultValue="monitor">
     <Select.Trigger id="invite-role" ... />
   ```
10. Invite button: `<Button variant="outline">` → `<Button variant="soft" color="gray" highContrast>` (but disabled so variant matters less)
11. "Stripe Customer" `<Text className="font-mono text-[var(--gray-11)]">` → `<Text className="font-mono" color="gray">`
12. Remove `style={{ border: ... }}` if present — use Cedar tokens
13. Icons: add `aria-hidden="true"`
14. Member since date: wrap in `<time dateTime={new Date(practice.created_at).toISOString()}>{...}</time>`
15. Renewal date: wrap in `<time dateTime={...}>`

---

### Task 16: Onboarding Pages
**Files:** `app/onboarding/page.tsx`, `app/onboarding/OnboardingForm.tsx`
**Action:** MODIFY

`app/onboarding/page.tsx`:
1. Add `export const metadata = { title: 'Get Started — Cedar' }`
2. Logo area: `<span className="text-lg font-semibold tracking-tight text-foreground">Cedar</span>` — `text-foreground` is a Tailwind token. Replace with `text-[var(--cedar-text-primary)]` or use `<Text size="4" weight="bold" as="span">Cedar</Text>`
3. `<i className="ri-leaf-line text-primary text-xl">` — `text-primary` is Tailwind token. Use `text-[var(--cedar-brand-primary)]` or Cedar semantic token. Add `aria-hidden="true"`.

`app/onboarding/OnboardingForm.tsx` (read full file first — only read limit=80 lines earlier):
1. `<Heading size="5">Set up your practice</Heading>` → `<Heading as="h1" size="6" weight="bold">Set up your practice</Heading>`
2. Step indicator `<span className="w-6 h-6 bg-[var(--accent-9)] text-white ...">` → replace with Cedar token `bg-[var(--cedar-filter-active-bg)]`
3. All form fields: add `<label htmlFor="...">` elements:
   - Practice name field: `<label htmlFor="practice-name">`, `id="practice-name"` on TextField
   - Owner name: `<label htmlFor="owner-name">`
   - Phone: `<label htmlFor="phone">`
   - Practice type: `<label htmlFor="practice-type">`
4. Step 2 plan selection: plan cards are interactive — ensure they use `<button type="button">` (not `<div onClick>`)
5. Button variants: replace `<Button>` (default variant) with `<Button variant="classic" color="gray" highContrast>` for primary action
6. Any `<Heading>` in step 2 (plan selection): add `as` prop
7. Read the full file and audit all remaining issues

---

### Task 17: Pricing Page
**File:** `app/pricing/page.tsx`
**Action:** MODIFY

Issues to fix:
1. Add `export const metadata = { title: 'Pricing — Cedar' }`
2. `<Heading size="7" weight="bold" mb="3">Cedar Plans</Heading>` → `<Heading as="h1" size="6" weight="bold" mb="3">Cedar Plans</Heading>`
3. Add Plans section heading: `<Heading as="h2" size="4" weight="bold" mb="6" align="center">Choose Your Plan</Heading>` (insert between the intro text and the plan cards)
4. Plan card headings:
   - `<Heading size="4" weight="bold">Monitor</Heading>` → `<Heading as="h3" size="4" weight="bold">Monitor</Heading>`
   - `<Heading size="4" weight="bold">Intelligence</Heading>` → `<Heading as="h3" size="4" weight="bold">Intelligence</Heading>`
5. Active plan card border: `className` with `border-[var(--accent-9)] ring-1 ring-[var(--accent-9)]` → use Cedar token `border-[var(--cedar-interactive-focus)] ring-1 ring-[var(--cedar-interactive-focus)]` (check globals.css)
6. `<Box className="min-h-screen bg-[var(--color-background)]">` — `var(--color-background)` is a raw Radix var. Use `bg-[var(--cedar-page-bg)]` or remove (let parent handle it)
7. Feature list items icon: add `aria-hidden="true"` to `<i>` tags
8. CTA buttons: `<Button type="submit" style={{ width: '100%' }}>` → `<Button type="submit" variant="classic" color="gray" highContrast style={{ width: '100%' }}>` (or use `className="w-full"` via Radix className support)
9. "Most popular" badge: `<Badge variant="soft">` → `<Badge variant="soft" color="gray">`
10. "Current plan" badge: `<Badge variant="outline" color="green">` ← already has color ✓

---

### Task 18: Final Token Audit & Build Verification
**Action:** GREP + BUILD

Run these checks before marking complete:

1. Grep for remaining raw Radix step vars in modified files:
```bash
# Check for raw --gray-*, --red-*, --green-*, --accent-*, --color-panel, etc. in className
grep -r "var(--gray-[0-9]" app/(dashboard)/ app/onboarding/ app/pricing/
grep -r "var(--red-[0-9]" app/(dashboard)/ app/onboarding/ app/pricing/
grep -r "var(--accent-[0-9]" app/(dashboard)/ app/onboarding/ app/pricing/
grep -r "var(--color-panel)" app/(dashboard)/
grep -r "dark:" app/(dashboard)/ app/onboarding/ app/pricing/ components/
```

2. Grep for missing `as` props on Heading:
```bash
grep -rn "<Heading " app/(dashboard)/ app/onboarding/ app/pricing/ | grep -v 'as='
```

3. Grep for `<Heading` without size prop:
```bash
grep -rn "<Heading " app/(dashboard)/ app/onboarding/ app/pricing/ | grep -v 'size='
```

4. Grep for un-timed dates:
```bash
grep -rn "timeAgo\|formatDate\|toLocaleString\|toLocaleDateString" app/(dashboard)/ | grep -v "<time"
```

5. Run build:
```bash
pnpm build
```

---

## Integration Points
```yaml
DATABASE:
  - No schema changes needed

INNGEST:
  - No changes

API ROUTES:
  - No changes

UI:
  - All 17 in-scope files modified
  - app/globals.css: possible token additions (Task 1)
  - components/DomainCard.tsx: headingLevel prop addition (Task 6B)

ENV:
  - No new variables
```

## Validation

### Build Check
```bash
pnpm build
# Must pass with 0 errors, 0 warnings
```

### Structural Verification
```bash
# Heading as prop audit — zero results expected:
grep -rn "<Heading " app/\(dashboard\)/ app/onboarding/ app/pricing/ | grep -v " as="

# Dark mode class audit — zero results expected in component files:
grep -rn "dark:" app/\(dashboard\)/ app/onboarding/ app/pricing/ components/DomainCard.tsx

# Raw Radix step variable audit — zero results expected (className only, not props):
grep -rn 'className.*var(--gray-[0-9]' app/\(dashboard\)/
grep -rn 'className.*var(--accent-9)' app/\(dashboard\)/
```

### Manual Visual Verification
```
1. Start dev server: env -u ANTHROPIC_API_KEY npx next dev --port 3000
2. Navigate to / → should redirect to /changes
3. Visit /changes — verify: h1 "Changes", table has surface variant, no heading without as
4. Visit /changes/[any-id] — verify: h1 is the source name, h2 sections, diff viewer without dark classes
5. Visit /library — verify: h1, h2 "Browse by Category", Radix Grid layout, filter pills use Cedar tokens
6. Visit /library/[any-slug] — verify: breadcrumb is ol/li, search input has label, h1 present
7. Visit /audit — verify: h1 "Audit Trail", h2 sections, table surface variant, export button is soft/gray
8. Visit /settings — verify: h1, h2 card sections, form labels present on invite inputs
9. Toggle dark mode — verify: /home, /changes, /library, /settings all render correctly without color artifacts
10. Resize to 768px — verify library grid collapses, changes table scrollable
```

## Anti-Patterns for This PRP
- ❌ Do NOT change data fetching logic — preserve existing Supabase queries exactly
- ❌ Do NOT add new features — this is a styling/structure compliance pass only
- ❌ Do NOT use `dark:` class prefixes — Cedar uses Radix Themes automatic dark mode
- ❌ Do NOT use raw Radix step variables (`var(--gray-6)`) in `className` — only `var(--cedar-*)` tokens
- ❌ Do NOT skip `as` prop on any `<Heading>` — every single Heading needs explicit `as`
- ❌ Do NOT create new `<Heading>` without both `as` and `size` props
- ❌ Do NOT wrap non-interactive elements in clickable `<div onClick>` — use `<Link>` or `<button>`
- ❌ Do NOT remove `<LegalDisclaimer>` from change detail or library detail pages
- ❌ Do NOT modify the audit/export page's HTML structure beyond heading hierarchy + metadata — it is intentionally print-optimized plain HTML

## Confidence Score

**8/10** — High confidence for one-pass implementation. The work is mechanical (find/fix pattern violations). Risks:
- RegulationTabs Radix Tabs.Root conversion is the highest-risk task (state model change + may expose type issues)
- OnboardingForm needs full read before fixing (only read 80 lines in research phase)
- Token availability in globals.css must be verified before Task 1 — some Cedar tokens may not exist yet and need to be added
- `DomainCard.tsx` needs `headingLevel` prop — must verify existing prop interface
