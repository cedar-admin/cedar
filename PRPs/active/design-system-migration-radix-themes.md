name: "Cedar Design System Migration: shadcn/ui → Radix Themes"

## Goal

Full rip-and-replace migration from shadcn/ui component library to Radix Themes. Every page and component in the Cedar codebase is rewritten to use Radix Themes components, Radix Colors, and Radix layout primitives. The `components/ui/` directory is deleted. After this PRP, Cedar has zero shadcn/ui dependencies and `pnpm build` passes clean.

## Why

- Cedar is pre-launch with zero users — no incremental migration needed
- Radix Themes provides a cohesive component library with built-in dark mode, spacing scale, typography system, and color tokens — eliminating the need for Cedar's custom three-tier token architecture (primitives → semantics → bridge)
- Consolidates two icon libraries (Phosphor in shadcn + Remix in Cedar code) down to Remix only
- CLAUDE.md and design-standards.md have already been updated to reference Radix Themes — the code must catch up to the documentation

## Success Criteria

- [ ] `pnpm build` passes with 0 errors, 0 warnings
- [ ] `components/ui/` directory deleted
- [ ] `components.json` deleted
- [ ] All pages render correctly in both light and dark mode
- [ ] No imports from `@/components/ui/*` anywhere in codebase
- [ ] No Phosphor icon imports (`@phosphor-icons/react`)
- [ ] `@radix-ui/themes` is the sole UI component library
- [ ] All existing functionality preserved (data queries, auth, navigation, forms)

## Context

### Files to Read First
```yaml
- file: CLAUDE.md
  why: Design system section already updated for Radix Themes — this is the target state

- file: docs/design-system/design-standards.md
  why: Already updated for Radix Themes — reference for component mapping and styling rules

- file: app/globals.css
  why: Current shadcn token architecture — will be replaced with Radix Colors palette

- file: app/layout.tsx
  why: Root layout — needs Theme provider wrapping

- file: app/providers.tsx
  why: Current ThemeProvider + TooltipProvider — needs Theme from @radix-ui/themes added

- file: package.json
  why: Current dependencies to add/remove

- file: lib/ui-constants.ts
  why: Severity/status color maps using Tailwind colors — must be updated to Radix CSS variables

- file: .claude/skills/ui-components/SKILL.md
  why: Already updated with Radix Themes patterns — use as reference

- file: .claude/skills/design-tokens/SKILL.md
  why: Already updated with Radix token decision tree — use as reference
```

### Current File Tree (relevant subset)
```
app/
├── globals.css                          (M) Replace with Radix Colors + Cedar custom tokens
├── layout.tsx                           (M) Add <Theme> wrapper
├── providers.tsx                        (M) Add <Theme> inside ThemeProvider
├── page.tsx                             (M) Landing/redirect page
├── sign-in/page.tsx                     ( ) No UI changes needed (WorkOS redirect)
├── onboarding/
│   ├── page.tsx                         ( ) Minimal — wraps OnboardingForm
│   └── OnboardingForm.tsx               (M) Uses Card, Button, Input, Label, Select, Separator
├── pricing/page.tsx                     (M) Uses Badge, Button, Card, Separator
├── (dashboard)/
│   ├── layout.tsx                       (M) Uses SidebarShell
│   ├── home/page.tsx                    (M) Uses Card, Button, Separator, SeverityBadge
│   ├── changes/
│   │   ├── page.tsx                     (M) Uses Card, Alert, Table, Button, SeverityBadge, StatusBadge
│   │   └── [id]/page.tsx               (M) Uses Badge, Card, LegalDisclaimer, SeverityBadge, StatusBadge
│   ├── library/
│   │   ├── page.tsx                     (M) Uses UpgradeBanner, DomainCard, EmptyState
│   │   ├── [slug]/page.tsx             (M) Uses Card, Badge, Input, Select, filters
│   │   └── [slug]/[id]/
│   │       ├── page.tsx                 (M) Uses Card, Badge, Tabs
│   │       └── RegulationTabs.tsx       (M) 617 lines — 4-tab view, largest file
│   ├── sources/page.tsx                 (M) Uses Badge, Card, Alert, Table
│   ├── audit/
│   │   ├── page.tsx                     (M) Uses Badge, Card, Button, Table
│   │   └── export/page.tsx              (M) Client component — print layout
│   ├── faq/
│   │   ├── page.tsx                     (M) Uses Card, Badge, Input, UpgradeBanner
│   │   └── [id]/page.tsx               (M) Uses Badge, Card, Alert, LegalDisclaimer
│   └── settings/page.tsx               (M) Uses Badge, Card, Button, Separator, Alert, Input, Select
├── (admin)/
│   ├── layout.tsx                       (M) Uses SidebarShell
│   ├── practices/page.tsx               (M) Uses Alert, Card, PracticesTable
│   ├── reviews/
│   │   ├── page.tsx                     (M) Uses Badge, Card, Alert, SeverityBadge, StatusBadge
│   │   ├── [id]/page.tsx               (M) Uses Card, SeverityBadge, StatusBadge, ReviewActions
│   │   └── ReviewActions.tsx            (M) Uses Button, Textarea
│   └── system/
│       ├── page.tsx                     (M) Uses Card, Badge, Button
│       ├── TriggerButton.tsx            (M) Uses Button
│       └── SeedCorpusButton.tsx         (M) Uses Button

components/
├── ui/                                  (D) DELETE entire directory (31 shadcn components)
├── Sidebar.tsx                          (M) Uses Badge, Button, Separator, ThemeToggle
├── SidebarShell.tsx                     (M) Uses Sidebar, BreadcrumbNav
├── SidebarLink.tsx                      (M) Uses Badge
├── SignOutButton.tsx                    (M) Uses Button
├── BreadcrumbNav.tsx                    (M) Custom breadcrumb
├── SeverityBadge.tsx                    (M) Uses Badge
├── StatusBadge.tsx                      (M) Uses Badge
├── EmptyState.tsx                       (M) Uses Card
├── DataList.tsx                         (M) Uses Card, SeverityBadge
├── LegalDisclaimer.tsx                  (M) Uses Alert
├── UpgradeBanner.tsx                    (M) Uses Button
├── NotificationsForm.tsx                (M) Uses Switch, Label, Separator, Select
├── ContentReader.tsx                    (M) Uses Button, Card
├── AuthorityBadge.tsx                   (M) Uses Badge
├── ConfidenceBadge.tsx                  (M) Uses Badge
├── ServiceLineTag.tsx                   (M) Uses Badge
├── DeadlineChip.tsx                     (M) Uses Badge
├── DomainCard.tsx                       (M) Uses Card, SeverityBadge
├── RegulationRow.tsx                    (M) Uses Badge + Cedar composites
├── RelationshipCard.tsx                 (M) Uses Card, Badge
├── LibraryBrowser.tsx                   (M) Uses Badge, Button, Card, Input, Select
├── admin/
│   ├── PracticesTable.tsx               (M) Uses Badge, Button, Card, Select, Table, SlideOverPanel
│   └── SlideOverPanel.tsx               (M) Uses Badge, Button

lib/
├── ui-constants.ts                      (M) Update color class maps to Radix CSS variables
├── utils.ts                             ( ) Keep cn() — still needed for custom components

(D) = DELETE, (M) = MODIFY, ( ) = NO CHANGE
```

### Files to Delete
```
components/ui/                           (entire directory — 31 files)
components.json                          (shadcn config)
specs/tokens/token-reference.md          (old shadcn token reference)
specs/components/slide-over-panel.md     (references shadcn patterns)
scripts/token-audit.js                   (audits old token system)
docs/design-system/current-state-audit-20260320.md  (one-time audit, no longer relevant)
```

### Known Gotchas
```typescript
// 1. Radix Themes <Theme> must wrap all content — add in providers.tsx
//    <Theme accentColor="green" grayColor="gray" radius="large" scaling="100%" panelBackground="translucent">

// 2. Font override: Radix Themes has its own default font. Override in globals.css:
//    .radix-themes { --default-font-family: var(--font-geist-sans), system-ui, sans-serif; }

// 3. CSS import order matters: Radix Themes styles must load AFTER Tailwind preflight
//    but BEFORE Tailwind utilities (layer ordering)

// 4. Portalled content (Sheet/SlideOver, custom modals) must wrap in <Theme>
//    to inherit Radix color tokens inside portals

// 5. lib/ui-constants.ts uses Tailwind color classes with dark: prefixes.
//    Must migrate to Radix CSS variable references that auto-swap in dark mode.

// 6. The `radix-ui` package (v1.4.3) in package.json may conflict with
//    @radix-ui/themes — check compatibility or remove

// 7. ThemeProvider (next-themes) uses attribute="class" to apply .dark/.light.
//    Radix Themes reads these classes for color switching. Keep this config.

// 8. next-themes must NOT pass appearance to <Theme> — let it inherit from
//    the HTML class attribute set by ThemeProvider

// 9. Some shadcn components (Dialog, DropdownMenu) are thin wrappers around
//    the same Radix primitives that @radix-ui/themes uses. The API is similar
//    but not identical — check prop names.

// 10. RegulationTabs.tsx is 617 lines with 4 tab views — the largest rewrite.
//     Follow the same patterns used in other pages.
```

## Component Mapping Reference

```
OLD (shadcn)                              NEW (Radix Themes)
────────────────────────────────────────  ──────────────────────────────────────
<Button variant="outline" size="sm">      <Button variant="outline" size="1">
<Button variant="destructive">            <Button color="red">
<Button variant="ghost">                  <Button variant="ghost">
<Button variant="ghost" size="icon">      <IconButton variant="ghost" size="2">
<Input placeholder="...">                 <TextField.Root placeholder="..." />
<Textarea>                                <TextArea>
<Select> (multi-part)                     <Select.Root><Select.Trigger /><Select.Content>
<Badge variant="outline">                 <Badge variant="outline">
<Badge variant="secondary">               <Badge variant="soft">
<Badge variant="destructive">             <Badge color="red">
<Card><CardContent>                       <Card><Box p="4">  (or use Inset)
<CardHeader><CardTitle>                   <Flex p="4" pb="0" justify="between"><Heading size="3">
<Alert><AlertDescription>                 <Callout.Root><Callout.Icon>...<Callout.Text>
<Dialog>                                  <Dialog.Root><Dialog.Trigger>...<Dialog.Content>
<Separator>                               <Separator>
<Switch>                                  <Switch>
<Tabs>                                    <Tabs.Root><Tabs.List><Tabs.Trigger>...<Tabs.Content>
<Table>                                   <Table.Root><Table.Header><Table.Row><Table.ColumnHeaderCell>
<Skeleton>                                <Skeleton> (wraps children)
<Avatar>                                  <Avatar>
<Tooltip>                                 <Tooltip>
<DropdownMenu>                            <DropdownMenu.Root>...
<Popover>                                 <Popover.Root>...
<ScrollArea>                              <ScrollArea>
<Checkbox>                                <Checkbox>
<Label>                                   <Text as="label" size="2" weight="medium">
<Progress>                                <Progress>
space-y-6 on div                          <Flex direction="column" gap="6">
<h1 className="text-2xl font-semibold">  <Heading size="6" weight="bold">
<p className="text-sm text-muted-...">   <Text size="2" color="gray">
```

## Size Mapping (shadcn → Radix Themes)

```
shadcn size="sm"   → Radix size="1"
shadcn size="default" or no size → Radix size="2"
shadcn size="lg"   → Radix size="3"
shadcn size="icon" → Radix <IconButton> size="2"
```

## Tasks (execute in order)

### Task 1: Install Radix Themes and Update Dependencies
**File:** `package.json`
**Action:** MODIFY (via pnpm commands)

```bash
# Install Radix Themes
pnpm add @radix-ui/themes

# Remove shadcn-specific packages
pnpm remove class-variance-authority @phosphor-icons/react lucide-react shadcn

# Keep: clsx, tailwind-merge, next-themes, cmdk, sonner, tw-animate-css
# Keep: @radix-ui/react-dialog (used for custom Sheet/SlideOver)
# Remove @radix-ui/react-dropdown-menu (bundled in @radix-ui/themes)
# Check if `radix-ui` package (v1.4.3) conflicts — likely remove it
```

After install, verify no version conflicts.

### Task 2: Replace globals.css
**File:** `app/globals.css`
**Action:** REWRITE

Structure:
```css
/* 1. Layer ordering declaration */
@layer theme, base, radix, components, utilities;

/* 2. Imports (order matters) */
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "@radix-ui/themes/styles.css" layer(radix);
@import "tailwindcss/utilities.css" layer(utilities);
@import "tw-animate-css" layer(utilities);
@import "remixicon/fonts/remixicon.css";

/* 3. Cedar custom Radix Colors palette — EXACT values from user spec */
/* (green and gray, light + dark, with @supports P3 blocks) */
/* Use the EXACT CSS provided in the feature description */

/* 4. Cedar custom tokens that Radix Themes doesn't provide */
/* Motion durations, easing, layout widths — from user spec */

/* 5. Reduced motion safety net */

/* 6. Font override for Radix Themes */
.radix-themes {
  --default-font-family: var(--font-geist-sans), system-ui, sans-serif;
}

/* 7. Keep existing animation keyframes */
/* panel-in-right, panel-out-right, panel-in-left, panel-out-left,
   scrim-in, scrim-out, fade-in, fade-out, scale-in, scale-out */

/* 8. Keep utility animation classes */
/* .animate-panel-in-right, .animate-panel-out-right, etc. */
/* .transition-interactive, .transition-transform */

/* 9. Reduced motion safety net (from user spec) */
```

Remove: The entire `@theme { }` primitive block, `:root` / `.dark` semantic blocks, `@theme inline { }` bridge block, `@layer base` block, `@custom-variant dark`, `@import "shadcn/tailwind.css"`, radius-nested utility, and the 4 unused slide-* keyframes.

### Task 3: Update Root Layout and Providers
**File:** `app/layout.tsx`
**Action:** MODIFY

```tsx
// Add suppressHydrationWarning (already present)
// Font variables already configured (keep as-is)
// No @radix-ui/themes/styles.css import needed — handled by globals.css
```

**File:** `app/providers.tsx`
**Action:** MODIFY

```tsx
'use client'

import { ThemeProvider } from 'next-themes'
import { Theme } from '@radix-ui/themes'
// Remove: TooltipProvider from @/components/ui/tooltip

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Theme
        accentColor="green"
        grayColor="gray"
        radius="large"
        scaling="100%"
        panelBackground="translucent"
      >
        {children}
      </Theme>
    </ThemeProvider>
  )
}
```

### Task 4: Delete shadcn/ui Directory and Config
**Action:** DELETE

```bash
rm -rf components/ui/
rm components.json
```

### Task 5: Update lib/ui-constants.ts
**File:** `lib/ui-constants.ts`
**Action:** MODIFY

Replace Tailwind color classes with Radix CSS variable references. The key insight: Radix Themes provides named color scales (red, orange, amber, yellow, green, blue, purple, indigo, sky) that auto-swap in dark mode.

```typescript
// Before:
// 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800'
// After:
// 'bg-[var(--red-a3)] text-[var(--red-11)] border-[var(--red-6)]'
// No dark: prefix needed — Radix variables auto-swap

// SEVERITY_CLASS — used by SeverityBadge and other components
export const SEVERITY_CLASS: Record<string, string> = {
  critical:      'bg-[var(--red-a3)] text-[var(--red-11)] border-[var(--red-6)]',
  high:          'bg-[var(--orange-a3)] text-[var(--orange-11)] border-[var(--orange-6)]',
  medium:        'bg-[var(--amber-a3)] text-[var(--amber-11)] border-[var(--amber-6)]',
  low:           'bg-[var(--green-a3)] text-[var(--green-11)] border-[var(--green-6)]',
  informational: 'bg-[var(--blue-a3)] text-[var(--blue-11)] border-[var(--blue-6)]',
}

// SEVERITY_DOT
export const SEVERITY_DOT: Record<string, string> = {
  critical:      'bg-[var(--red-9)]',
  high:          'bg-[var(--orange-9)]',
  medium:        'bg-[var(--amber-9)]',
  low:           'bg-[var(--green-9)]',
  informational: 'bg-[var(--blue-9)]',
}

// SEVERITY_ICON
export const SEVERITY_ICON: Record<string, string> = {
  critical:      'ri-error-warning-fill text-[var(--red-9)]',
  high:          'ri-alert-fill text-[var(--orange-9)]',
  medium:        'ri-information-fill text-[var(--amber-9)]',
  low:           'ri-checkbox-circle-fill text-[var(--green-9)]',
  informational: 'ri-information-line text-[var(--blue-9)]',
}

// STATUS_CLASS — same pattern
export const STATUS_CLASS: Record<string, string> = {
  approved:      'text-[var(--green-11)] bg-[var(--green-a3)] border-[var(--green-6)]',
  auto_approved: '',
  pending:       'text-[var(--amber-11)] bg-[var(--amber-a3)] border-[var(--amber-6)]',
  pending_review:'text-[var(--amber-11)] bg-[var(--amber-a3)] border-[var(--amber-6)]',
  rejected:      'text-[var(--red-11)] bg-[var(--red-a3)] border-[var(--red-6)]',
  not_required:  '',
}

// AUTHORITY_LEVEL_CLASS — same pattern
export const AUTHORITY_LEVEL_CLASS: Record<string, string> = {
  federal_statute:                'bg-[var(--red-a3)] text-[var(--red-11)] border-[var(--red-6)]',
  federal_regulation:             'bg-[var(--orange-a3)] text-[var(--orange-11)] border-[var(--orange-6)]',
  sub_regulatory_guidance:        'bg-[var(--amber-a3)] text-[var(--amber-11)] border-[var(--amber-6)]',
  national_coverage_determination:'bg-[var(--blue-a3)] text-[var(--blue-11)] border-[var(--blue-6)]',
  local_coverage_determination:   'bg-[var(--sky-a3)] text-[var(--sky-11)] border-[var(--sky-6)]',
  state_statute:                  'bg-[var(--purple-a3)] text-[var(--purple-11)] border-[var(--purple-6)]',
  state_board_rule:               'bg-[var(--indigo-a3)] text-[var(--indigo-11)] border-[var(--indigo-6)]',
  professional_standard:          'bg-[var(--gray-a3)] text-[var(--gray-11)] border-[var(--gray-6)]',
}
```

Note: Radix Themes may not expose all named color scales (sky, indigo) unless explicitly imported. Check availability — may need to use Radix's closest available color or keep those as raw Tailwind with appropriate dark mode handling. For `sky`, consider using `cyan` which Radix does provide.

### Task 6: Rewrite Cedar Composite Components
**Action:** MODIFY each file in `components/`

For each component, replace shadcn imports with Radix Themes imports and update JSX. Key patterns:

**SeverityBadge.tsx:**
```tsx
import { Badge } from '@radix-ui/themes'
// Badge variant="outline" → Badge variant="outline"
// Pass className for custom colors from SEVERITY_CLASS
```

**StatusBadge.tsx:**
```tsx
import { Badge } from '@radix-ui/themes'
// Remove dark: prefixes — Radix vars handle dark mode
```

**EmptyState.tsx:**
```tsx
import { Card, Flex, Text } from '@radix-ui/themes'
// Card + Flex direction="column" align="center" py="9"
```

**DataList.tsx:**
```tsx
import { Card, Box, Flex, Text } from '@radix-ui/themes'
// Replace CardContent with Box p="4"
```

**LegalDisclaimer.tsx:**
```tsx
import { Callout } from '@radix-ui/themes'
// Alert → Callout.Root + Callout.Icon + Callout.Text
```

**UpgradeBanner.tsx:**
```tsx
import { Button, Flex, Text, Card } from '@radix-ui/themes'
```

**NotificationsForm.tsx:**
```tsx
import { Switch, Text, Separator, Select, Flex } from '@radix-ui/themes'
// Label → <Text as="label" size="2" weight="medium">
```

**ContentReader.tsx:**
```tsx
import { Button, IconButton, Card, Box } from '@radix-ui/themes'
```

**Sidebar.tsx:**
```tsx
import { Badge, Separator, Flex, Text, Box } from '@radix-ui/themes'
import { IconButton } from '@radix-ui/themes'
// Remove ThemeToggle from ui/ — rebuild inline or as separate component
// Use Radix CSS vars for sidebar colors
// Remove dark: prefixes from RoleBadge — use var(--amber-*), var(--purple-*) tokens
```

**SidebarShell.tsx:**
```tsx
import { Box, Flex } from '@radix-ui/themes'
// Layout wrapper — uses Sidebar + BreadcrumbNav
```

**SidebarLink.tsx:**
```tsx
import { Badge, Text } from '@radix-ui/themes'
```

**SignOutButton.tsx:**
```tsx
import { Button } from '@radix-ui/themes'
// or IconButton for icon-only version
```

**BreadcrumbNav.tsx:**
```tsx
import { Flex, Text, Link as RadixLink } from '@radix-ui/themes'
```

**AuthorityBadge.tsx, ConfidenceBadge.tsx, ServiceLineTag.tsx, DeadlineChip.tsx:**
```tsx
import { Badge } from '@radix-ui/themes'
// All use Badge — update className to use Radix CSS vars
```

**DomainCard.tsx:**
```tsx
import { Card, Box, Flex, Text } from '@radix-ui/themes'
```

**RegulationRow.tsx, RelationshipCard.tsx:**
```tsx
import { Badge, Card, Box, Flex, Text } from '@radix-ui/themes'
```

**LibraryBrowser.tsx:**
```tsx
// NOTE: This component is orphaned (not imported anywhere per STATUS.md).
// Consider deleting instead of migrating. If keeping, migrate like other components.
```

**ThemeToggle** (currently `components/ui/theme-toggle.tsx`):
```tsx
// This is used by Sidebar. Since components/ui/ is being deleted,
// move to components/ThemeToggle.tsx and rewrite with Radix IconButton:
import { IconButton } from '@radix-ui/themes'
import { useTheme } from 'next-themes'
// <IconButton variant="ghost" size="1">
//   <i className={theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line'} />
// </IconButton>
```

### Task 7: Rewrite Admin Components
**File:** `components/admin/SlideOverPanel.tsx`
**Action:** MODIFY

```tsx
import { Badge, Button, IconButton, Flex, Text, Heading, Box, Separator } from '@radix-ui/themes'
import { Theme } from '@radix-ui/themes'

// Since this is a custom overlay (not a Radix Dialog), it uses Radix CSS vars for styling:
// bg-[var(--color-background)], border-[var(--gray-6)], shadow-[var(--shadow-5)]
//
// TierBadge and SubscriptionBadge local helpers:
// Replace dark: Tailwind classes with Radix CSS vars:
// intelligence → color="purple" on Badge
// active subscription → color="green" on Badge
// canceled → color="red" on Badge
// trialing → color="blue" on Badge
// past_due/unpaid → color="amber" on Badge
```

**File:** `components/admin/PracticesTable.tsx`
**Action:** MODIFY

```tsx
import { Badge, Button, IconButton, Card, Box, Flex, Text, Heading, Select, Table, Separator } from '@radix-ui/themes'
// Replace shadcn Table parts with Radix Table parts:
// TableHeader → Table.Header
// TableBody → Table.Body
// TableRow → Table.Row
// TableHead → Table.ColumnHeaderCell
// TableCell → Table.Cell
```

### Task 8: Rewrite All Dashboard Pages

Rewrite each page following these patterns:

**Common pattern for all pages:**
```tsx
// Before:
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// After:
import { Card, Box, Flex, Heading, Text, Button } from '@radix-ui/themes'

// Before:
<div className="space-y-6">
  <h1 className="text-2xl font-semibold text-foreground">Title</h1>
  <p className="text-sm text-muted-foreground mt-1">Subtitle</p>
// After:
<Flex direction="column" gap="6">
  <Box>
    <Heading size="6" weight="bold">Title</Heading>
    <Text size="2" color="gray" mt="1">Subtitle</Text>
  </Box>

// Before:
<Card>
  <CardHeader className="pb-3">
    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      Section
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
// After:
<Card>
  <Box p="4" pb="3">
    <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
      Section
    </Text>
  </Box>
  <Box px="4" pb="4">
    {/* content */}
  </Box>
</Card>

// Before:
<Button variant="ghost" size="sm" asChild>
  <Link href="/changes">View all <i className="ri-arrow-right-line" /></Link>
</Button>
// After:
<Button variant="ghost" size="1" asChild>
  <Link href="/changes">View all <i className="ri-arrow-right-line" /></Link>
</Button>
```

**Pages to rewrite (in order — grouped by complexity):**

Simple pages (minimal UI):
1. `app/page.tsx` — landing/redirect
2. `app/sign-in/page.tsx` — WorkOS redirect (may need no changes)
3. `app/(dashboard)/audit/export/page.tsx` — print layout

Medium complexity:
4. `app/(dashboard)/home/page.tsx` — stats grid, cards, activity feed
5. `app/(dashboard)/sources/page.tsx` — table, badges, alert
6. `app/(dashboard)/audit/page.tsx` — table, badges, buttons
7. `app/(dashboard)/changes/page.tsx` — table, filters, badges
8. `app/(dashboard)/changes/[id]/page.tsx` — detail view, badges, disclaimer
9. `app/(dashboard)/faq/page.tsx` — card list, search, upgrade banner
10. `app/(dashboard)/faq/[id]/page.tsx` — detail view, disclaimer
11. `app/(dashboard)/settings/page.tsx` — forms, switches, selects, cards
12. `app/(dashboard)/library/page.tsx` — domain card grid
13. `app/pricing/page.tsx` — feature cards, badges
14. `app/onboarding/OnboardingForm.tsx` — multi-step form

Higher complexity:
15. `app/(dashboard)/library/[slug]/page.tsx` — filtered list with search
16. `app/(dashboard)/library/[slug]/[id]/page.tsx` — tabbed detail view
17. `app/(dashboard)/library/[slug]/[id]/RegulationTabs.tsx` — 617 lines, 4 tabs

Admin pages:
18. `app/(admin)/practices/page.tsx` — table with slide-over
19. `app/(admin)/reviews/page.tsx` — review queue
20. `app/(admin)/reviews/[id]/page.tsx` — review detail
21. `app/(admin)/reviews/ReviewActions.tsx` — approve/reject buttons
22. `app/(admin)/system/page.tsx` — system health
23. `app/(admin)/system/TriggerButton.tsx` — trigger button
24. `app/(admin)/system/SeedCorpusButton.tsx` — seed button

Layout files:
25. `app/(dashboard)/layout.tsx` — SidebarShell wrapper
26. `app/(admin)/layout.tsx` — SidebarShell wrapper

**Key rules for page rewrites:**
- Replace `<div className="space-y-6">` with `<Flex direction="column" gap="6">`
- Replace `<h1 className="text-2xl font-semibold text-foreground">` with `<Heading size="6" weight="bold">`
- Replace `<p className="text-sm text-muted-foreground">` with `<Text size="2" color="gray">`
- Replace `<CardContent className="pt-5 pb-4">` with `<Box p="4">`
- Replace `text-destructive` with `color="red"` on Radix components or `text-[var(--red-9)]`
- Replace `text-green-500 dark:text-green-400` with `text-[var(--green-9)]`
- Replace `bg-muted/30` with `bg-[var(--gray-a3)]`
- Replace `text-muted-foreground` with `color="gray"` on Radix Text, or `text-[var(--gray-11)]` in className
- Replace `divide-y divide-border` with `<Separator>` between items, or `border-b border-[var(--gray-6)]`
- Keep `transition-colors` from Tailwind for hover effects on custom elements
- Keep `truncate`, `line-clamp-*`, `overflow-*` utilities from Tailwind
- Use Next.js `<Link>` for routing — Radix `<Link>` is for styling only (wrap with asChild if needed)

### Task 9: Cleanup
**Action:** DELETE + MODIFY

```bash
# Delete stale files
rm specs/tokens/token-reference.md
rm scripts/token-audit.js
rm specs/components/slide-over-panel.md
rm docs/design-system/current-state-audit-20260320.md

# Remove orphaned component
rm components/LibraryBrowser.tsx

# Check eslint.config.mjs — remove shadcn/tailwindcss plugin rules if present
# The eslint-plugin-tailwindcss package may need updating or removal if it
# enforces shadcn-specific rules

# Remove unused @radix-ui/react-* primitives from package.json
# Keep: @radix-ui/react-dialog (if used for Sheet/SlideOver custom build)
# Remove: @radix-ui/react-dropdown-menu (bundled in @radix-ui/themes)
# Remove: radix-ui package (v1.4.3) — likely shadcn registry dependency
```

### Task 10: Build Verification and Fix
**Action:** RUN

```bash
pnpm build
```

Fix any TypeScript errors, missing imports, or build failures iteratively until clean.

Common issues to expect:
- Missing Radix Themes type imports
- Radix Themes components that don't accept `className` on all parts
- `asChild` prop differences between shadcn wrappers and Radix Themes components
- Missing color scales (sky, indigo may not be available in Radix Themes — use closest match)
- Sonner toast may need adjustment since it was configured in shadcn's sonner.tsx

## Integration Points
```yaml
DATABASE:
  - No changes needed — this is UI-only

INNGEST:
  - No changes needed

API ROUTES:
  - No changes needed — API routes don't render UI

UI:
  - Every .tsx file in app/ and components/ is modified
  - Global CSS completely rewritten
  - Provider chain updated

ENV:
  - No new environment variables
```

## Validation

### Build Check
```bash
pnpm build
# Must pass with 0 errors, 0 warnings
```

### Functional Verification
```bash
# 1. Start dev server
env -u ANTHROPIC_API_KEY npx next dev --port 3000

# 2. Navigate to each page and verify rendering:
#    - /home — stats grid, cards, activity feed
#    - /changes — table with severity badges
#    - /changes/[id] — detail view with diff
#    - /library — domain card grid
#    - /library/[slug] — filtered regulation list
#    - /library/[slug]/[id] — tabbed detail view
#    - /sources — source table
#    - /audit — audit trail table
#    - /settings — forms and toggles
#    - /faq — FAQ list and detail
#    - /practices (admin) — practices table with slide-over
#    - /reviews (admin) — review queue
#    - /system (admin) — system health
#    - /pricing — pricing cards

# 3. Toggle dark mode — verify all pages look correct in both modes

# 4. Test sidebar collapse/expand on desktop and tablet widths

# 5. Verify no console errors in browser dev tools
```

### Import Verification
```bash
# No remaining shadcn imports
grep -r "@/components/ui/" app/ components/ --include="*.tsx" --include="*.ts"
# Should return 0 results

# No Phosphor icon imports
grep -r "@phosphor-icons" app/ components/ --include="*.tsx" --include="*.ts"
# Should return 0 results

# No lucide-react imports
grep -r "lucide-react" app/ components/ --include="*.tsx" --include="*.ts"
# Should return 0 results
```

## Anti-Patterns
- ❌ Do NOT incrementally migrate — this is a full rip-and-replace
- ❌ Do NOT override Radix Themes component internals with Tailwind color classes — use props
- ❌ Do NOT use `dark:` prefix on Radix Themes components — automatic dark mode
- ❌ Do NOT use raw Tailwind color classes (bg-green-500) on custom components — use `var(--green-9)`
- ❌ Do NOT use `<div className="space-y-6">` — use `<Flex direction="column" gap="6">`
- ❌ Do NOT use raw HTML form elements — use Radix Themes TextField, TextArea, Select, Switch
- ❌ Do NOT add new features — this is a visual migration only, preserving all existing functionality
- ❌ Do NOT modify data queries, auth logic, or API routes — UI components only
- ❌ Do NOT use Phosphor or Lucide icons — Remix Icon only
- ❌ Do NOT forget to wrap portalled content (custom Sheet/SlideOver) in `<Theme>`

## Confidence Score: 7/10

**Why not higher:**
- The 617-line RegulationTabs.tsx is complex and may have edge cases
- Radix Themes Badge may not support arbitrary className for custom colors the same way shadcn Badge does — may need to test `className` passthrough
- Color scale availability (sky, indigo) in Radix Themes needs runtime verification
- The CSS layer ordering (`@layer theme, base, radix, components, utilities`) with Tailwind v4 and Radix Themes hasn't been tested — may need adjustments
- Sonner toast integration may need custom styling since the shadcn sonner.tsx wrapper handled that
- The `radix-ui` package (v1.4.3) in dependencies is unclear — may be the same as `@radix-ui/themes` or a registry helper

**Why not lower:**
- The pattern is very mechanical — same transformation repeated across ~50 files
- CLAUDE.md and design-standards.md already document the target state thoroughly
- Component mapping is well-defined and 1:1 in most cases
- No backend changes — purely UI layer
- Pre-launch with zero users — no risk of breaking production users
