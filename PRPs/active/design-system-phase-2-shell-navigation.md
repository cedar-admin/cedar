name: "Design System Phase 2 — Shell & Navigation"

## Goal

Bring the application shell — `SidebarShell`, `Sidebar`, `SidebarLink`, `BreadcrumbNav`, `ThemeToggle`, and the two layout files — into full compliance with design standards and frontend structural standards. After this phase, every page loads inside a correctly structured, accessible, responsive shell with zero raw Radix step variables in shell/navigation files.

## Why

- Design System Phase 1 (foundations) is complete. Phase 2 is the next block before Phase 3 (Dashboard Pages).
- Current shell components violate multiple structural rules: duplicate `<main>` landmark, missing `<ul>/<li>` nav structure, no `aria-current="page"`, missing focus trap, raw Radix step variables throughout.
- These violations affect every page in the app — fixing them here fixes the entire shell in one pass.

## Success Criteria

- [ ] `pnpm build` — 0 errors, 0 warnings
- [ ] `SidebarShell` does NOT render `<main>` (root layout provides it)
- [ ] Sidebar nav uses `<nav aria-label="Main navigation">` → `<ul>` → `<li>` structure
- [ ] Active `SidebarLink` has `aria-current="page"`
- [ ] Overlay sidebar (below lg) traps focus, closes on Escape, returns focus to trigger
- [ ] Scrim uses `animate-scrim-in` / `animate-scrim-out` classes (animated exit)
- [ ] Zero raw Radix step variables (`--gray-6`, `--accent-a3`, `--color-panel-translucent`, etc.) in any of the 5 shell component files
- [ ] `ThemeToggle` `aria-label` reflects current mode ("Switch to dark mode" / "Switch to light mode")
- [ ] All icons in shell have `aria-hidden="true"`
- [ ] `BreadcrumbNav` uses `<ol>` + `<li>`, Radix `<Link>`, and `aria-current="page"` on last crumb
- [ ] `RoleBadge` uses Radix `color` prop, no className color overrides
- [ ] Dark mode works correctly — `CedarLogo` uses `.logo-light` / `.logo-dark` CSS classes

## Context

### Files to Read First

```yaml
- file: docs/design-system/design-standards.md
  why: §4 (Styling Rules), §5 (Cedar Semantic Tokens), §6 (Buttons), §12 (Tabs & Navigation) — the token usage rules and forbidden patterns that govern all changes in this PRP

- file: docs/design-system/frontend-standards.md
  why: §2 (Landmarks), §5 (Lists), §6 (Interactive Elements), §11 (ARIA), §12 (Forbidden Patterns), §13 (Keyboard & Focus), §15 (Responsive Structure) — the structural rules driving every fix

- file: app/globals.css
  why: All --cedar-* token definitions, animation classes (animate-scrim-in, animate-scrim-out, transition-interactive), --width-sidebar, --duration-base, --ease-standard, .logo-light / .logo-dark classes

- file: components/SidebarShell.tsx
  why: PRIMARY file to modify — fix <main>, scrim animation, focus trap setup

- file: components/Sidebar.tsx
  why: PRIMARY file to modify — ul/li structure, Cedar tokens, RoleBadge, focus trap receiver

- file: components/SidebarLink.tsx
  why: PRIMARY file to modify — aria-current, tokens, aria-hidden icons, Text as="span"

- file: components/BreadcrumbNav.tsx
  why: PRIMARY file to modify — ol/li, Radix Link, aria-current, tokens

- file: components/ThemeToggle.tsx
  why: PRIMARY file to modify — color prop, aria-label state, aria-hidden

- file: app/(dashboard)/layout.tsx
  why: Verify no <main> or <h1>; add responsive padding wrapper if missing

- file: app/(admin)/layout.tsx
  why: Verify role check preserved; verify no <main> or <h1>

- file: app/layout.tsx
  why: Confirm root layout provides <main id="main-content"> — do NOT modify this file
```

### Current File Tree (relevant subset)

```bash
components/
  SidebarShell.tsx        # Layout wrapper — renders <main> (violation)
  Sidebar.tsx             # Nav — no ul/li, raw Radix variables throughout
  SidebarLink.tsx         # Nav link — no aria-current, raw variables, no Text as="span"
  BreadcrumbNav.tsx       # Breadcrumbs — uses span/flex not ol/li, raw variables
  ThemeToggle.tsx         # Theme toggle — missing color="gray", bad aria-label

app/(dashboard)/layout.tsx   # Clean — just delegates to SidebarShell
app/(admin)/layout.tsx       # Clean — role check + delegates to SidebarShell
app/layout.tsx               # Root — provides <main id="main-content"> (DO NOT MODIFY)
app/globals.css              # All --cedar-* token definitions, animation classes
```

### Files to Create or Modify

```bash
components/SidebarShell.tsx        (M) Remove <main>, fix tokens, scrim animation, focus trap
components/Sidebar.tsx             (M) ul/li structure, Cedar tokens, RoleBadge color prop, CedarLogo fix
components/SidebarLink.tsx         (M) aria-current, Cedar tokens, aria-hidden icons, Text as="span"
components/BreadcrumbNav.tsx       (M) ol/li structure, Radix Link, aria-current, Cedar tokens
components/ThemeToggle.tsx         (M) color="gray", aria-label state, aria-hidden icon
app/(dashboard)/layout.tsx         (M) Verify clean; add responsive padding wrapper if absent
app/(admin)/layout.tsx             (M) Verify clean; no structural changes needed
```

### Cedar Semantic Tokens Reference (from globals.css)

The following Cedar tokens must replace all raw Radix step variables in shell files:

```
--cedar-text-primary     → replaces --gray-12
--cedar-text-secondary   → replaces --gray-11
--cedar-text-muted       → replaces --gray-9
--cedar-interactive-hover    → replaces --gray-a3
--cedar-interactive-active   → replaces --gray-a4
--cedar-interactive-selected → replaces --gray-a3 (selected nav item bg)
--cedar-panel-bg         → replaces --color-panel-translucent
--cedar-page-bg          → replaces --color-background
--cedar-border-subtle    → replaces --gray-6
--cedar-border-interactive → replaces --gray-7
--cedar-overlay          → replaces --color-overlay or --scrim
--cedar-accent-bg        → replaces --accent-a3 (if user avatar bg; prefer Radix color prop)
--cedar-accent-text      → replaces --accent-11
--cedar-warning-bg       → replaces --amber-a3
--cedar-warning-text     → replaces --amber-11
--cedar-warning-border   → replaces --amber-6
```

NOTE: `--amber-*`, `--purple-*`, `--accent-*` in RoleBadge should be replaced with Radix `color` prop, not Cedar tokens.

### Animation Classes (from globals.css)

```css
.animate-scrim-in  { animation: scrim-in var(--duration-base) var(--ease-out) both; }
.animate-scrim-out { animation: scrim-out var(--duration-fast) var(--ease-in) both; }
.transition-interactive {
  transition-property: color, background-color, border-color, opacity;
  transition-duration: var(--duration-base);
  transition-timing-function: var(--ease-standard);
}
--width-sidebar: 15rem;   /* use this instead of w-60 or hardcoded 240px */
--duration-base: 200ms;
--duration-fast: exists in globals.css
--ease-standard: cubic-bezier(0.2, 0, 0, 1)
```

Logo classes (from globals.css):
```css
.logo-dark  { display: none; }
.logo-light { display: block; }
.dark .logo-light { display: none; }
.dark .logo-dark  { display: block; }
```

### Known Gotchas

```typescript
// 1. ROOT LAYOUT PROVIDES <main> — do NOT add another one
//    app/layout.tsx: <main id="main-content">{children}</main>
//    SidebarShell renders INSIDE that main. Its content area must be a <div>, not <main>.

// 2. SCRIM ANIMATION requires a closing state
//    Current: {!collapsed && <div className="animate-scrim-in ...">}
//    Problem: conditional unmount means animate-scrim-out never plays.
//    Fix: add `isClosing` boolean state in SidebarShell.
//    When user triggers close: setIsClosing(true), then after --duration-fast, setCollapsed(true) + setIsClosing(false)
//    Scrim renders when: !collapsed || isClosing
//    Scrim class: isClosing ? "animate-scrim-out" : "animate-scrim-in"
//    Handle --duration-fast by using setTimeout with ~150ms (check globals.css for exact value)

// 3. FOCUS TRAP only activates in overlay mode (below lg)
//    Use a useEffect with window.innerWidth or a CSS-based detection via useMediaQuery
//    Simpler: check if window width < 1024 when sidebar opens
//    Required behavior:
//      - Tab cycles within sidebar's focusable elements
//      - Shift+Tab cycles backwards
//      - Escape calls onCollapse()
//      - On close, focus returns to the expand trigger button (ref needed)

// 4. ul/li STRUCTURE — Sidebar currently maps SidebarLink directly without list wrapper
//    Fix: wrap nav content in <ul className="..."> and wrap each <SidebarLink> in <li>
//    SidebarLink renders the <Link> or <span> directly — it does NOT render its own <li>

// 5. RoleBadge — use Radix color prop, not className overrides:
//    admin → <Badge color="amber" variant="outline" ...>
//    intelligence → <Badge color="purple" variant="outline" ...>
//    monitor/default → <Badge color="gray" variant="outline" ...>

// 6. CedarLogo — current uses Tailwind dark: classes, globals.css has .logo-light/.logo-dark
//    Fix: <img className="logo-light h-6 w-auto" ...> and <img className="logo-dark h-6 w-auto" ...>
//    Remove dark:hidden and hidden dark:block classes

// 7. BreadcrumbNav Radix <Link> — import from @radix-ui/themes, not next/link
//    Use: <Link color="gray" highContrast underline="hover">
//    Radix Link renders as <a> under the hood — wrap with Next.js Link using asChild if navigation needed
//    OR: use Next.js <Link asChild> pattern...
//    Actually: Radix <Link> from @radix-ui/themes is purely visual styling — use it wrapping next/link via asChild:
//    <RadixLink asChild color="gray" highContrast underline="hover"><NextLink href={crumb.href}>...</NextLink></RadixLink>
//    Import: import { Link as RadixLink } from '@radix-ui/themes'
//    Import: import Link from 'next/link'

// 8. SidebarLink text — text label is currently a raw string inside <Link>
//    Fix: wrap in <Text as="span" size="2"> — "as" required since it's inside <a> (NextLink renders <a>)
//    Import Text from @radix-ui/themes

// 9. aria-hidden on icons — all <i className="ri-..."> inside interactive elements need aria-hidden="true"
//    Icons alongside text are decorative. Apply to ALL icons in shell components.

// 10. ThemeToggle color="gray" — Radix IconButton needs explicit color="gray" per design-standards.md §6
//     The mounted/unmounted versions both need color="gray"

// 11. Disabled SidebarLink badge — currently uses className color overrides
//     Replace with: <Badge variant="outline" size="1" color="gray">
```

---

## Tasks (execute in order)

### Task 1: Fix ThemeToggle.tsx
**File:** `components/ThemeToggle.tsx`
**Action:** MODIFY
**Why first:** Smallest file, establishes the pattern for other fixes.

Changes:
- Add `color="gray"` to both `<IconButton>` calls (mounted and unmounted fallback)
- Change `aria-label` from `"Toggle theme"` to reflect current state:
  - When `theme === 'dark'`: `aria-label="Switch to light mode"`
  - When `theme === 'light'`: `aria-label="Switch to dark mode"`
  - Unmounted fallback: `aria-label="Switch to dark mode"` (safe default)
- Add `aria-hidden="true"` to the `<i>` icon element

```tsx
// Final shape:
<IconButton
  variant="ghost"
  color="gray"
  size="1"
  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
>
  <i className={theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line'} aria-hidden="true" />
</IconButton>
```

---

### Task 2: Fix BreadcrumbNav.tsx
**File:** `components/BreadcrumbNav.tsx`
**Action:** MODIFY

Changes:
- Change outer container from `<nav aria-label="Breadcrumb" className="flex items-center gap-1.5 ...">` with inner `<span>` wrappers to `<nav aria-label="Breadcrumb">` containing `<ol>` + `<li>` elements
- Use Radix `<Link>` (aliased as `RadixLink`) from `@radix-ui/themes` with `asChild` wrapping Next.js `<Link>` for navigation + Radix styling
- Add `aria-current="page"` to last crumb
- Separator icon gets `aria-hidden="true"` explicitly
- Replace all raw Radix variables with Cedar tokens

```tsx
// Imports needed:
import Link from 'next/link'
import { Link as RadixLink, Text } from '@radix-ui/themes'
import { usePathname } from 'next/navigation'

// Structure:
return (
  <nav aria-label="Breadcrumb" className="mb-6">
    <ol className="flex items-center gap-1.5 text-sm">
      {crumbs.map((crumb, i) => (
        <li key={crumb.href} className="flex items-center gap-1.5">
          {i > 0 && (
            <i
              className="ri-arrow-right-s-line text-[var(--cedar-text-muted)] text-base leading-none"
              aria-hidden="true"
            />
          )}
          {crumb.isLast ? (
            <Text as="span" size="2" weight="medium" className="text-[var(--cedar-text-primary)]">
              {crumb.label}
            </Text>
          ) : (
            <RadixLink asChild color="gray" highContrast underline="hover" size="2">
              <Link href={crumb.href} aria-current={crumb.isLast ? 'page' : undefined}>
                {crumb.label}
              </Link>
            </RadixLink>
          )}
        </li>
      ))}
    </ol>
  </nav>
)
// Note: aria-current="page" should be on the LAST crumb's element (the span, not a link)
// Add aria-current="page" as aria attribute on the last <li> or the <Text as="span"> with role note
// Per spec: use aria-current="page" on the current page item
// For last crumb (isLast=true), add aria-current="page" to the wrapper <li> or span
// Cleanest: <Text as="span" ... aria-current="page"> on the last item
```

---

### Task 3: Fix SidebarLink.tsx
**File:** `components/SidebarLink.tsx`
**Action:** MODIFY
**Depends on:** Task 2 (establishes pattern for Text as="span" and Cedar tokens)

Changes:
- Add `aria-current={isActive ? "page" : undefined}` to active `<Link>`
- Replace raw Radix variables with Cedar semantic tokens
- Add `aria-hidden="true"` to icon `<i>` element
- Wrap label text in `<Text as="span" size="2">` (inside `<a>`, must be span per §4)
- Fix disabled state to use Cedar tokens and Radix color prop on Badge
- Touch target: add `min-h-[44px]` to ensure 44×44px minimum (current `py-2` + text-sm ≈ 36px — need `py-2.5` or `min-h-[44px]`)

```tsx
// Imports:
import { Badge, Text } from '@radix-ui/themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Disabled variant:
<span
  className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--cedar-text-muted)] cursor-not-allowed min-h-[44px]"
  aria-disabled="true"
>
  <i className={`${icon} text-base shrink-0`} aria-hidden="true" />
  <Text as="span" size="2" className="flex-1">{label}</Text>
  {badge && (
    <Badge variant="outline" size="1" color="gray">
      {badge}
    </Badge>
  )}
</span>

// Active/inactive variant:
<Link
  href={href}
  aria-current={isActive ? "page" : undefined}
  className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-2)] min-h-[44px] transition-interactive ${
    isActive
      ? 'bg-[var(--cedar-interactive-selected)] text-[var(--cedar-text-primary)] font-medium'
      : 'text-[var(--cedar-text-secondary)] hover:bg-[var(--cedar-interactive-hover)] hover:text-[var(--cedar-text-primary)]'
  }`}
>
  <i className={`${icon} text-base shrink-0`} aria-hidden="true" />
  <Text as="span" size="2">{label}</Text>
</Link>
```

---

### Task 4: Fix Sidebar.tsx
**File:** `components/Sidebar.tsx`
**Action:** MODIFY
**Depends on:** Task 3 (SidebarLink changes)

Changes:
1. **RoleBadge**: Use Radix `color` prop instead of className color overrides
2. **CedarLogo**: Use `.logo-light` / `.logo-dark` CSS classes instead of Tailwind `dark:` prefix classes
3. **Nav structure**: Wrap `SidebarLink` calls in `<ul>` + `<li>` with `<nav aria-label="Main navigation">`
4. **Admin section label**: Replace `<p>` with `<Text as="span">` or appropriate element
5. **User info**: Replace `<p>` with `<Text as="span">` + proper sizing
6. **All raw Radix variables**: Replace with Cedar semantic tokens
7. **Icons**: Add `aria-hidden="true"` to user avatar icon and all decorative icons
8. **Expand trigger button**: add `aria-expanded` attribute reflecting sidebar state

```tsx
// RoleBadge — Radix color props:
function RoleBadge({ role, tier }: { role: UserRole; tier: string | null }) {
  if (role === 'admin') {
    return <Badge color="amber" variant="outline" className="mt-1 text-xs">Admin</Badge>
  }
  const label = tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Monitor'
  const isIntelligence = tier?.toLowerCase() === 'intelligence'
  return (
    <Badge
      color={isIntelligence ? 'purple' : 'gray'}
      variant="outline"
      className="mt-1 text-xs"
    >
      {label}
    </Badge>
  )
}

// CedarLogo — use CSS classes from globals.css:
function CedarLogo() {
  return (
    <>
      <img src="/cedar-logo-light.svg" alt="Cedar" className="logo-light h-6 w-auto" />
      <img src="/cedar-logo-dark.svg"  alt="Cedar" className="logo-dark h-6 w-auto" />
    </>
  )
}

// Sidebar <aside> — replace raw variables:
<aside
  className={`fixed inset-y-0 left-0 z-[40] flex flex-col border-r border-[var(--cedar-border-subtle)] bg-[var(--cedar-panel-bg)] ${
    collapsed ? '-translate-x-full' : 'translate-x-0'
  }`}
  style={{
    width: 'var(--width-sidebar)',
    transition: 'translate var(--duration-base) var(--ease-standard)'
  }}
>

// Nav structure — add ul/li:
<nav aria-label="Main navigation" className="flex-1 px-2 py-3">
  <ul className="space-y-0.5">
    {MAIN_NAV.map((item) => (
      <li key={item.label}>
        <SidebarLink ... />
      </li>
    ))}
    {role === 'admin' && (
      <>
        <li role="presentation" className="pt-4 pb-1 px-3">
          <Text as="span" size="1" weight="bold" className="uppercase tracking-wider text-[var(--cedar-text-muted)]">
            Admin
          </Text>
        </li>
        {/* Separator as li */}
        <li role="presentation"><Separator className="my-1" /></li>
        {ADMIN_NAV.map((item) => (
          <li key={item.href}>
            <SidebarLink ... />
          </li>
        ))}
      </>
    )}
  </ul>
</nav>

// Bottom section — use Cedar tokens, Text as="span":
// practice name:
<Text as="span" size="1" weight="medium" className="text-[var(--cedar-text-primary)] truncate block">
  {practice.name}
</Text>

// user name and email:
<Text as="span" size="1" weight="medium" className="text-[var(--cedar-text-primary)] truncate block">{displayName}</Text>
<Text as="span" size="1" className="text-[var(--cedar-text-muted)] truncate block">{user.email}</Text>

// User avatar icon:
<div className="w-7 h-7 bg-[var(--cedar-accent-bg)] flex items-center justify-center shrink-0">
  <i className="ri-user-line text-[var(--cedar-accent-text)] text-sm" aria-hidden="true" />
</div>

// Collapse/expand IconButtons — add color="gray" (it's already there), ensure aria-labels exist
// Expand trigger:
<IconButton
  variant="ghost"
  color="gray"
  size="1"
  onClick={onExpand}
  aria-label="Expand sidebar"
  aria-expanded={!collapsed}
  className={`fixed left-0 top-4 z-50 ... border-[var(--cedar-border-subtle)] text-[var(--cedar-text-muted)] hover:text-[var(--cedar-text-primary)] hover:bg-[var(--cedar-interactive-hover)] transition-interactive ${...}`}
>
  <i className="ri-arrow-right-s-line text-sm" aria-hidden="true" />
</IconButton>

// Logo header border:
<div className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-[var(--cedar-border-subtle)]">

// Collapse button:
<IconButton
  variant="ghost"
  color="gray"
  size="1"
  onClick={onCollapse}
  aria-label="Collapse sidebar"
  className="text-[var(--cedar-text-muted)] hover:text-[var(--cedar-text-primary)] hover:bg-[var(--cedar-interactive-hover)]"
>
  <i className="ri-arrow-left-s-line text-base" aria-hidden="true" />
</IconButton>

// Bottom dividers:
border-[var(--cedar-border-subtle)]  // all instances
```

---

### Task 5: Fix SidebarShell.tsx
**File:** `components/SidebarShell.tsx`
**Action:** MODIFY
**Depends on:** Tasks 3, 4 (Sidebar and SidebarLink are correct before wiring focus trap)

This is the most complex task. Changes:
1. **Remove `<main>`** — replace with `<div>` (root layout provides `<main id="main-content">`)
2. **Fix outer container token** — `bg-[var(--cedar-page-bg)]` instead of `--color-background`
3. **Scrim animation** — add `isClosing` state machine for animate-scrim-out
4. **Focus trap** — when sidebar is open in overlay mode (below lg breakpoint)
5. **Content wrapper** — responsive padding via Radix `<Box>` props
6. **width-sidebar** — reference via `var(--width-sidebar)` in margin transition

```tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Box } from '@radix-ui/themes'
import { Sidebar } from '@/components/Sidebar'
import { BreadcrumbNav } from '@/components/BreadcrumbNav'
import type { UserRole } from '@/lib/layout-data'

// Duration-fast from globals.css — used for scrim-out animation completion
const DURATION_FAST_MS = 150  // check globals.css --duration-fast value; use 150ms as safe default

interface SidebarShellProps {
  user: { email: string; firstName: string | null; lastName: string | null }
  practice: { name: string; tier: string } | null
  role: UserRole
  children: React.ReactNode
}

export function SidebarShell({ user, practice, role, children }: SidebarShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const expandTriggerRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)

  // Detect overlay mode (below lg = 1024px)
  const isOverlay = () => typeof window !== 'undefined' && window.innerWidth < 1024

  // Animated close: play scrim-out, then collapse
  const handleCollapse = useCallback(() => {
    if (isOverlay()) {
      setIsClosing(true)
      setTimeout(() => {
        setCollapsed(true)
        setIsClosing(false)
        // Return focus to expand trigger
        expandTriggerRef.current?.focus()
      }, DURATION_FAST_MS)
    } else {
      setCollapsed(true)
    }
  }, [])

  const handleExpand = useCallback(() => {
    setCollapsed(false)
  }, [])

  // Focus trap: when sidebar is open in overlay mode
  useEffect(() => {
    if (collapsed || !isOverlay()) return

    const sidebar = sidebarRef.current
    if (!sidebar) return

    // Get all focusable elements within sidebar
    const getFocusable = () =>
      Array.from(
        sidebar.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleCollapse()
        return
      }

      if (e.key !== 'Tab') return

      const focusable = getFocusable()
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Move focus to first focusable element in sidebar when it opens
    const focusable = getFocusable()
    if (focusable.length > 0) {
      focusable[0].focus()
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [collapsed, handleCollapse])

  const showScrim = !collapsed || isClosing

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--cedar-page-bg)]">
      <Sidebar
        ref={sidebarRef}            // pass ref so focus trap can access sidebar DOM
        expandTriggerRef={expandTriggerRef}  // pass ref to expand button
        user={user}
        practice={practice}
        role={role}
        collapsed={collapsed}
        onCollapse={handleCollapse}
        onExpand={handleExpand}
      />

      {/* Overlay scrim — below lg only, animated in/out */}
      {showScrim && (
        <div
          className={`fixed inset-0 z-[30] bg-[var(--cedar-overlay)] lg:hidden !m-0 ${
            isClosing ? 'animate-scrim-out' : 'animate-scrim-in'
          }`}
          onClick={handleCollapse}
          aria-hidden="true"
        />
      )}

      {/* Content area — NOT a <main> (root layout provides it) */}
      <div
        className={`flex-1 overflow-y-auto`}
        style={{
          marginLeft: collapsed ? '0' : 'var(--width-sidebar)',
          transition: 'margin-left var(--duration-base) var(--ease-standard)'
        }}
      >
        <Box p={{ initial: '4', md: '6' }} className="max-w-5xl mx-auto">
          <BreadcrumbNav />
          {children}
        </Box>
      </div>
    </div>
  )
}
```

**IMPORTANT:** Sidebar.tsx must accept a `ref` prop for the `<aside>` element and pass through `expandTriggerRef` to the expand trigger `<IconButton>`. Update the `SidebarProps` interface:

```tsx
interface SidebarProps {
  ref?: React.RefObject<HTMLElement>     // for focus trap — forwardRef needed
  expandTriggerRef?: React.RefObject<HTMLButtonElement>  // for focus restoration
  user: ...
  // ... rest of props
}

// Sidebar must use forwardRef:
import { forwardRef } from 'react'
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { user, practice, role, collapsed, onCollapse, onExpand, expandTriggerRef },
  ref
) {
  return (
    <>
      <IconButton
        ref={expandTriggerRef}  // attach to expand trigger
        ...
      >

      <aside ref={ref} ...>  // attach sidebar ref
```

NOTE: Radix `<IconButton>` supports `ref`. If not, use a native `<button>` styled equivalently or check Radix docs.

---

### Task 6: Verify dashboard and admin layouts
**File:** `app/(dashboard)/layout.tsx` and `app/(admin)/layout.tsx`
**Action:** VERIFY (no changes expected)

Read both files. Confirm:
- Neither renders `<main>` (violation)
- Neither renders `<Heading as="h1">` (violation)
- Both just delegate to `<SidebarShell>` with user/practice/role data
- Admin layout preserves the `if (role !== 'admin') redirect('/home')` check

Both files currently look correct based on pre-work reading. No changes needed unless violations are found.

---

### Task 7: Run build and fix errors
**File:** Various
**Action:** VERIFY + FIX

```bash
pnpm build
```

Fix any TypeScript errors from:
- `forwardRef` additions to Sidebar
- New ref prop types in SidebarProps
- Any import changes

---

## Integration Points

```yaml
UI:
  - SidebarShell: renders inside <main id="main-content"> from app/layout.tsx — must NOT add another <main>
  - Sidebar: receives ref via forwardRef for focus trap
  - SidebarLink: rendered inside <li> added by Sidebar
  - BreadcrumbNav: imported inside SidebarShell content area
  - ThemeToggle: imported inside Sidebar bottom section
  - No data fetching changes — all components receive same props as before
  - No API routes or database changes

ENV:
  - No new environment variables needed
```

## Validation

### Build Check

```bash
pnpm build
# Must pass with 0 errors, 0 warnings
```

### Visual Verification

```bash
# Start dev server
env -u ANTHROPIC_API_KEY npx next dev --port 3000

# 1. Navigate to http://localhost:3000/home — verify sidebar renders inline (desktop)
# 2. Open browser DevTools → toggle to 768px viewport
# 3. Verify sidebar is hidden (translated off-screen)
# 4. Click expand trigger — verify sidebar slides in as overlay with scrim
# 5. Press Escape — verify sidebar closes with scrim fade-out animation, focus returns to trigger
# 6. Click scrim — verify sidebar closes with scrim fade-out
# 7. Tab through sidebar links — verify focus stays within sidebar (trap)
# 8. Back to desktop — verify inline sidebar, no scrim
# 9. Navigate to /library — verify breadcrumb shows "Regulation Library"
# 10. Navigate to /library/[some-id] — verify breadcrumb shows Home > Regulation Library > Detail
# 11. Toggle dark mode — verify logo switches (CedarLogo classes), all tokens adapt
# 12. Inspect sidebar links — verify active link has aria-current="page" in DOM
# 13. Open browser DevTools → Accessibility tree — verify:
#     - One <main> landmark (from root layout)
#     - <nav aria-label="Main navigation"> in sidebar
#     - <nav aria-label="Breadcrumb"> for breadcrumbs
#     - Active link has aria-current="page"
```

### Landmark Scan (manual)

Use browser DevTools Accessibility panel or axe DevTools:
- 1 × `<main>` (from root layout, ID = "main-content")
- 1 × `<nav aria-label="Main navigation">` (sidebar)
- 1 × `<nav aria-label="Breadcrumb">` (breadcrumb, only on multi-segment paths)
- 0 × unlabeled `<nav>` elements
- 0 × `<section>` without `aria-labelledby` or `aria-label`

### Token Audit

Run after implementation to verify no raw Radix variables remain in shell files:

```bash
grep -n "var(--gray-[0-9]" components/SidebarShell.tsx components/Sidebar.tsx components/SidebarLink.tsx components/BreadcrumbNav.tsx components/ThemeToggle.tsx
grep -n "var(--amber-\|var(--purple-\|var(--accent-\|var(--color-panel\|var(--color-background" components/SidebarShell.tsx components/Sidebar.tsx components/SidebarLink.tsx components/BreadcrumbNav.tsx components/ThemeToggle.tsx
# Both commands must return 0 results
```

---

## Anti-Patterns

- ❌ Do NOT add `<main>` anywhere in SidebarShell — root layout already provides it
- ❌ Do NOT use raw Radix step variables (`--gray-6`, `--gray-12`, `--accent-a3`, etc.) in component files
- ❌ Do NOT use Tailwind `dark:` prefix for theme switching — Cedar tokens auto-swap via Radix Colors
- ❌ Do NOT add `<div onClick={...}>` for interactive elements — use `<button>` or `<Link>`
- ❌ Do NOT skip `as="span"` on `<Text>` inside `<Link>` or any inline context
- ❌ Do NOT skip `aria-hidden="true"` on decorative icons
- ❌ Do NOT hardcode `ml-60` — use `var(--width-sidebar)` or `margin-left: 'var(--width-sidebar)'`
- ❌ Do NOT remove the role-check redirect in `app/(admin)/layout.tsx` — business logic must be preserved
- ❌ Do NOT add scope beyond this PRP (no page content changes, no new features)
- ❌ Do NOT use `tabindex="1"` or any positive tabindex
- ❌ Do NOT use `any` types — define proper TypeScript interfaces for ref props

---

## Confidence Score: 9/10

High confidence for one-pass success. The current codebase is clean and well-structured — this is a targeted compliance pass, not a structural rewrite. The main complexity is the forwardRef addition to Sidebar (well-understood React pattern) and the focus trap (standard DOM pattern, code provided above). Token replacements are mechanical. The only unknown is whether Radix `<IconButton>` accepts a `ref` for the expand trigger — if not, use `<button type="button">` styled to match, or wrap in a `forwardRef` div.
