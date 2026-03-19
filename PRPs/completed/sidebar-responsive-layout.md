name: "Sidebar Responsive Layout — Desktop Push + Tablet Overlay"

## Goal

Fix the layout so the main content area responds to sidebar open/closed state. Desktop (lg+): content shifts right by `w-60` when sidebar is open, fills full width when closed. Tablet (<lg): sidebar overlays content with a scrim — content never moves.

## Why

- The sidebar already animates correctly with `translateX`. The layout wrapper is broken: `ml-60` is hardcoded in both layouts, so closing the sidebar leaves a 240px dead zone on the left.
- Tablet has no scrim and no overlay behavior — sidebar slides over content but content still has a permanent left margin.
- MVP dashboard usability fix; affects all 15 pages.

## Success Criteria

- [ ] Desktop (≥lg): opening sidebar pushes content right by 240px; closing collapses margin back to 0. Transition matches sidebar's 200ms duration.
- [ ] Desktop (≥lg): no scrim — sidebar and content share horizontal space.
- [ ] Tablet (<lg): sidebar slides over content; main content never shifts.
- [ ] Tablet (<lg): semi-transparent scrim appears behind sidebar when open; tapping scrim closes sidebar.
- [ ] Sidebar z-index above scrim; scrim above main content.
- [ ] No TypeScript `any` types.
- [ ] `node scripts/token-audit.js` — 0 errors.
- [ ] `npm run build` passes with 0 errors, 0 warnings.

## Context

### Files to Read First

```yaml
- file: components/Sidebar.tsx
  why: Current sidebar — holds collapsed state internally; this state must be lifted out

- file: app/(dashboard)/layout.tsx
  why: Dashboard layout with hardcoded ml-60 — needs SidebarShell wrapper

- file: app/(admin)/layout.tsx
  why: Admin layout with hardcoded ml-60 — same fix needed

- file: components/admin/SlideOverPanel.tsx
  why: Canonical scrim pattern to reuse — fixed inset-0 z-40 bg-scrim animate-scrim-in

- file: app/globals.css
  why: Animation classes (animate-scrim-in), duration tokens (--duration-base), easing tokens (--ease-standard)
```

### Current File Tree (relevant subset)

```bash
components/
  Sidebar.tsx          # 'use client' — holds collapsed state, renders fixed aside
  SidebarLink.tsx
  BreadcrumbNav.tsx    # 'use client'
app/
  (dashboard)/
    layout.tsx         # Server component — renders Sidebar + main with ml-60
  (admin)/
    layout.tsx         # Server component — renders Sidebar + main with ml-60
app/globals.css        # Token definitions, animate-scrim-in, transition utilities
```

### Files to Create or Modify

```bash
components/SidebarShell.tsx          (+) Client component that holds collapsed state, renders sidebar + main wrapper + tablet scrim
components/Sidebar.tsx               (M) Remove internal collapsed state; accept collapsed/onCollapse/onExpand props
app/(dashboard)/layout.tsx           (M) Replace Sidebar + main with SidebarShell
app/(admin)/layout.tsx               (M) Replace Sidebar + main with SidebarShell
```

### Current Sidebar State (critical context)

The sidebar is **fixed positioned** (`fixed inset-y-0 left-0 z-[40]`), always `w-60`. It collapses via `-translate-x-full` and expands via `translate-x-0`. The transition uses an inline style:

```tsx
style={{ transition: 'translate var(--duration-base) var(--ease-standard)' }}
```

Both layouts currently render:
```tsx
<div className="flex h-screen overflow-hidden bg-background">
  <Sidebar user={user} practice={practice} role={role} />
  <main className="flex-1 overflow-y-auto ml-60">  {/* ← broken: always 240px left */}
    <div className="max-w-5xl mx-auto px-8 py-8">
      <BreadcrumbNav />
      {children}
    </div>
  </main>
</div>
```

### Scrim Pattern (from SlideOverPanel.tsx)

```tsx
{/* Scrim */}
<div
  className="fixed inset-0 z-40 bg-scrim animate-scrim-in !m-0"
  onClick={onClose}
  aria-hidden="true"
/>
```

For the sidebar scrim, use `z-[30]` (below sidebar's `z-[40]`) and `lg:hidden` to suppress on desktop.

### Known Gotchas

```typescript
// Next.js App Router: server components CAN pass pre-rendered children to client components.
// The layouts are server components — they can do:
//   <SidebarShell user={user} practice={practice} role={role}>
//     {children}
//   </SidebarShell>
// This is valid. The children server-render normally; SidebarShell wraps them client-side.

// BreadcrumbNav is a 'use client' component — it must stay inside the main content wrapper.
// Move it from the layout into SidebarShell's main wrapper.

// The sidebar expand trigger button (left-edge button shown when collapsed) is rendered
// inside Sidebar.tsx. It references collapsed state — that state now comes from props.

// margin-left transition: Tailwind's transition-[margin] exists but duration must match
// var(--duration-base). Use inline style for transition property (same pattern as sidebar):
//   style={{ transition: 'margin-left var(--duration-base) var(--ease-standard)' }}
// This matches exactly how the sidebar animates its translateX.

// Do NOT use arbitrary Tailwind values like ml-[240px] — use ml-60 (Tailwind scale = 15rem = 240px).

// No JS-based breakpoint detection — use Tailwind lg: prefix for all breakpoint-specific behavior.
// The scrim uses lg:hidden to suppress on desktop.

// z-index layers:
//   main content:    z-[0] (default flow)
//   tablet scrim:    z-[30]
//   sidebar:         z-[40] (existing, do not change)
//   sidebar expand trigger: z-50 (existing, do not change)
```

## Tasks (execute in order)

### Task 1: Modify Sidebar.tsx — lift state out

**File:** `components/Sidebar.tsx`
**Action:** MODIFY

Remove the internal `useState(false)` for `collapsed`. Add controlled props instead. Pass `collapsed`, `onCollapse`, `onExpand` from the parent.

```typescript
// REMOVE:
// const [collapsed, setCollapsed] = useState(false)

// ADD to SidebarProps interface:
interface SidebarProps {
  user: { email: string; firstName: string | null; lastName: string | null }
  practice: { name: string; tier: string } | null
  role: UserRole
  collapsed: boolean         // controlled from parent
  onCollapse: () => void
  onExpand: () => void
}

// UPDATE function signature:
export function Sidebar({ user, practice, role, collapsed, onCollapse, onExpand }: SidebarProps) {
  // Remove useState for collapsed
  // Replace setCollapsed(true) → onCollapse()
  // Replace setCollapsed(false) → onExpand()
}
```

The rest of the component is unchanged: the aside uses `collapsed ? '-translate-x-full' : 'translate-x-0'` and the inline style transition exactly as before.

### Task 2: Create SidebarShell.tsx — layout client wrapper

**File:** `components/SidebarShell.tsx`
**Action:** CREATE

This client component owns `collapsed` state and renders the full layout shell: sidebar, tablet scrim, and main content wrapper. It accepts the user/practice/role props to forward to Sidebar, plus `children` for the page content.

```typescript
'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { BreadcrumbNav } from '@/components/BreadcrumbNav'
import type { UserRole } from '@/lib/layout-data'

interface SidebarShellProps {
  user: { email: string; firstName: string | null; lastName: string | null }
  practice: { name: string; tier: string } | null
  role: UserRole
  children: React.ReactNode
}

export function SidebarShell({ user, practice, role, children }: SidebarShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        user={user}
        practice={practice}
        role={role}
        collapsed={collapsed}
        onCollapse={() => setCollapsed(true)}
        onExpand={() => setCollapsed(false)}
      />

      {/* Tablet scrim: visible only below lg, only when sidebar is open */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-[30] bg-scrim animate-scrim-in lg:hidden !m-0"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}

      {/* Main content: margin-left responds to collapsed state on desktop only */}
      <main
        className={`flex-1 overflow-y-auto${collapsed ? '' : ' lg:ml-60'}`}
        style={{ transition: 'margin-left var(--duration-base) var(--ease-standard)' }}
      >
        <div className="max-w-5xl mx-auto px-8 py-8">
          <BreadcrumbNav />
          {children}
        </div>
      </main>
    </div>
  )
}
```

**Important:** `bg-scrim` is the CSS variable-backed token already used in SlideOverPanel. Verify it exists in globals.css before using; if it maps to `bg-black/40` or similar, use the same token.

### Task 3: Update app/(dashboard)/layout.tsx

**File:** `app/(dashboard)/layout.tsx`
**Action:** MODIFY
**Depends on:** Tasks 1 + 2

```typescript
import { getLayoutData } from '@/lib/layout-data'
import { SidebarShell } from '@/components/SidebarShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, practice, role } = await getLayoutData()

  return (
    <SidebarShell user={user} practice={practice} role={role}>
      {children}
    </SidebarShell>
  )
}
```

Remove the `Sidebar` and `BreadcrumbNav` imports — they are now handled inside `SidebarShell`.

### Task 4: Update app/(admin)/layout.tsx

**File:** `app/(admin)/layout.tsx`
**Action:** MODIFY
**Depends on:** Tasks 1 + 2

```typescript
import { getLayoutData } from '@/lib/layout-data'
import { SidebarShell } from '@/components/SidebarShell'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, practice, role } = await getLayoutData()

  if (role !== 'admin') {
    redirect('/home')
  }

  return (
    <SidebarShell user={user} practice={practice} role={role}>
      {children}
    </SidebarShell>
  )
}
```

Remove `Sidebar` and `BreadcrumbNav` imports.

### Task 5: Verify bg-scrim token exists

**File:** `app/globals.css`
**Action:** READ + VERIFY

Search for `--scrim` or `bg-scrim` in globals.css. The SlideOverPanel uses `bg-scrim` — confirm it is defined. If the token is missing, add it to `:root` in globals.css:

```css
:root {
  /* ... existing tokens ... */
  --scrim: oklch(0 0 0 / 0.4);  /* only if missing */
}
```

And in `@theme inline {}` bridge section:
```css
@theme inline {
  /* ... existing ... */
  --color-scrim: var(--scrim);  /* only if missing */
}
```

Do NOT add if it already exists.

### Task 6: Run token audit and build check

**Action:** VALIDATE

```bash
node scripts/token-audit.js
npm run build
```

Both must pass with 0 errors. Fix any violations before marking complete.

## Integration Points

```yaml
DATABASE:
  - None — pure UI change

INNGEST:
  - None

API ROUTES:
  - None

UI:
  - components/Sidebar.tsx — controlled props (no internal state)
  - components/SidebarShell.tsx — new client wrapper (new file)
  - app/(dashboard)/layout.tsx — uses SidebarShell
  - app/(admin)/layout.tsx — uses SidebarShell

ENV:
  - None
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
# Must report 0 violations
```

### Functional Verification

```
Manual test steps:

Desktop (resize browser to ≥ 1024px width):
1. Load any dashboard page — sidebar should be open, content offset 240px from left
2. Click the collapse arrow in sidebar header
   → Sidebar slides off-screen to the left (translateX)
   → Main content margin-left animates from 240px to 0 simultaneously (200ms)
   → Content fills full viewport width
   → No dead zone on the left
3. Click the expand trigger (left-edge button)
   → Sidebar slides back in
   → Content margin-left animates back to 240px
4. Confirm no scrim appears on desktop during open/close

Tablet (resize browser to < 1024px, or DevTools mobile mode):
1. Load any dashboard page — sidebar may be open or closed by default
2. If sidebar is open: a semi-transparent dark overlay should cover the main content
3. Main content should use FULL viewport width (no left margin) regardless of sidebar state
4. Click the scrim — sidebar should close and scrim should disappear
5. Click expand trigger — sidebar opens over content with scrim
6. Content never shifts left or right at any tablet breakpoint
```

## Anti-Patterns

- ❌ Do not use arbitrary Tailwind values — `ml-[240px]` is forbidden; use `ml-60`
- ❌ Do not detect breakpoints in JavaScript — use Tailwind `lg:` prefix only
- ❌ Do not use `transition-all` — only transition `margin-left` (avoid layout thrash)
- ❌ Do not add scope beyond this PRP — note future work in STATUS.md
- ❌ Do not use `any` types in TypeScript
- ❌ Do not duplicate the `BreadcrumbNav` — remove it from layouts, keep it only in SidebarShell
- ❌ Do not change the sidebar's translateX animation — only the layout wrapper changes
- ❌ Do not hardcode `200ms` — use `var(--duration-base)` so it stays in sync with sidebar

## Confidence Score

**9/10** — All required files are read, the state-lift pattern is straightforward, there are no database/API changes, and the scrim pattern is directly copy-adapted from SlideOverPanel. The only risk is if `bg-scrim` token isn't defined (Task 5 handles this). The client/server boundary is clean: SidebarShell is a client component that receives server-rendered children as a slot.
