name: "Sidebar Transform Collapse"

## Goal
Replace the sidebar's width-based collapse animation with a `translateX` transform so the sidebar slides fully off-screen to the left. The sidebar maintains a fixed `w-60` width at all times; the main content area never reflows.

## Why
- Current width transition (`w-0 ↔ w-60`) causes the main content area to reflow and shift on every open/close
- GPU-composited `transform` animations run at 60fps without layout thrashing; `width` transitions are layout-expensive
- Consistent with Cedar's animation design standard: "Only animate `transform` and `opacity`"

## Success Criteria
- [ ] Sidebar width is always `w-60` — no conditional width classes
- [ ] Collapsed state uses `translate-x-[-100%]` (`-translate-x-full`); expanded uses `translate-x-0`
- [ ] Main content area has a permanent `ml-60` that never changes — zero reflow on toggle
- [ ] Sidebar is `position: fixed` (out of document flow)
- [ ] Expand/collapse chevron buttons both remain functional
- [ ] No TypeScript `any` types introduced
- [ ] `npm run build` passes with 0 errors, 0 warnings
- [ ] `node scripts/token-audit.js` passes with 0 errors

## Context

### Files to Read First
```yaml
- file: components/Sidebar.tsx
  why: Contains all current collapse logic — the exact classes and inline styles to replace

- file: app/(dashboard)/layout.tsx
  why: Main content offset — needs ml-60 added permanently

- file: app/(admin)/layout.tsx
  why: Same layout structure as dashboard — same ml-60 change needed

- file: app/globals.css
  why: Confirms available animation tokens: --duration-base, --ease-standard, z-index scale
```

### Current File Tree (relevant subset)
```bash
components/
  Sidebar.tsx          # All collapse logic lives here
  SidebarLink.tsx      # No changes needed

app/
  (dashboard)/
    layout.tsx         # Needs ml-60 on main
  (admin)/
    layout.tsx         # Needs ml-60 on main
  globals.css          # Token reference only — no changes
```

### Files to Modify
```bash
components/Sidebar.tsx          (M) Replace width-based collapse with translateX transform + fix positioning
app/(dashboard)/layout.tsx      (M) Add permanent ml-60 to main
app/(admin)/layout.tsx          (M) Add permanent ml-60 to main
```

### Current Collapse Mechanism (what to replace)

**`components/Sidebar.tsx` lines 96–101 — current:**
```tsx
<aside
  className={`flex flex-col shrink-0 h-screen border-r border-sidebar-border bg-sidebar ${
    collapsed ? 'w-0 overflow-hidden border-r-0' : 'w-60 overflow-y-auto'
  }`}
  style={{ transition: 'all var(--duration-base) var(--ease-standard)' }}
>
```

Problems:
- `w-0 ↔ w-60` drives a layout-expensive width transition
- `transition: 'all'` transitions every property including layout properties
- `shrink-0` + in-flow position means the main content area resizes when sidebar collapses

**`app/(dashboard)/layout.tsx` line 11 — current:**
```tsx
<main className="flex-1 overflow-y-auto">
```
`flex-1` means main grows/shrinks as sidebar width changes.

### Known Gotchas
```typescript
// 1. The aside becomes position:fixed — it leaves document flow entirely.
//    Without ml-60 on main, the main content will render under the sidebar.
//    Both layout files must add ml-60 to main.

// 2. The expand trigger button is already position:fixed (left-0, z-50).
//    It works correctly before and after this change — no modification needed.

// 3. The collapse button inside the sidebar header moves off-screen with the
//    sidebar when collapsed — that's correct behavior. Only the expand button
//    (outside the aside) needs to be visible when collapsed.

// 4. Use inline style for the transform transition to reference CSS custom
//    properties (design tokens). Tailwind's transition-transform sets the
//    property correctly but can't reference --duration-base or --ease-standard.
//    Pattern: style={{ transition: 'transform var(--duration-base) var(--ease-standard)' }}
//    This matches the existing pattern already used in this file.

// 5. The sidebar needs overflow-y-auto always (never overflow-hidden) since
//    it's fixed-position and full height. The content is never clipped by width.

// 6. z-index: Use z-[40] for sidebar, z-[50] for expand button (already set).
//    This matches the Cedar z-index token scale.

// 7. Do NOT use transition-all or transition: 'all' — only transition transform.
```

## Tasks (execute in order)

### Task 1: Update Sidebar.tsx — replace width collapse with transform
**File:** `components/Sidebar.tsx`
**Action:** MODIFY

Replace the `aside` element and its className logic. Key changes:
1. Remove `shrink-0` (no longer in flow)
2. Add `fixed inset-y-0 left-0 z-[40]` (always positioned at left edge, full height)
3. Remove conditional `w-0`/`w-60` — always `w-60`
4. Remove conditional `overflow-hidden`/`overflow-y-auto` — always `overflow-y-auto`
5. Remove conditional `border-r-0` — always `border-r border-sidebar-border`
6. Add conditional `translate-x-0` / `-translate-x-full` for the toggle
7. Replace `transition: 'all ...'` with `transition: 'transform var(--duration-base) var(--ease-standard)'`

```tsx
{/* Before (remove this): */}
<aside
  className={`flex flex-col shrink-0 h-screen border-r border-sidebar-border bg-sidebar ${
    collapsed ? 'w-0 overflow-hidden border-r-0' : 'w-60 overflow-y-auto'
  }`}
  style={{ transition: 'all var(--duration-base) var(--ease-standard)' }}
>

{/* After (replace with this): */}
<aside
  className={`fixed inset-y-0 left-0 z-[40] flex flex-col w-60 h-screen overflow-y-auto border-r border-sidebar-border bg-sidebar ${
    collapsed ? '-translate-x-full' : 'translate-x-0'
  }`}
  style={{ transition: 'transform var(--duration-base) var(--ease-standard)' }}
>
```

No other changes to `Sidebar.tsx` — the expand trigger button, collapse button, nav content, and bottom section are all unchanged.

### Task 2: Update dashboard layout — permanent ml-60
**File:** `app/(dashboard)/layout.tsx`
**Action:** MODIFY
**Depends on:** Task 1

The sidebar is now fixed-position and out of document flow. Without an offset, `main` would render starting at x=0, hidden behind the sidebar.

```tsx
{/* Before: */}
<main className="flex-1 overflow-y-auto">

{/* After: */}
<main className="flex-1 overflow-y-auto ml-60">
```

The `ml-60` is permanent and never changes — it does not toggle with sidebar state. This is intentional: the content always respects the sidebar's reserved column, whether the sidebar is visible or off-screen.

### Task 3: Update admin layout — permanent ml-60
**File:** `app/(admin)/layout.tsx`
**Action:** MODIFY
**Depends on:** Task 1

Same change as Task 2.

```tsx
{/* Before: */}
<main className="flex-1 overflow-y-auto">

{/* After: */}
<main className="flex-1 overflow-y-auto ml-60">
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
  - components/Sidebar.tsx — collapse mechanism replaced
  - app/(dashboard)/layout.tsx — main offset added
  - app/(admin)/layout.tsx — main offset added

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
# Must pass with 0 errors
```

### Functional Verification
```
1. Start dev server: env -u ANTHROPIC_API_KEY npx next dev --port 3000
2. Navigate to /home
3. Verify sidebar is visible at w-60 — content starts at the sidebar's right edge
4. Click the collapse chevron (<) in the sidebar header
5. Verify sidebar slides off to the left — SMOOTH, no width animation
6. Verify main content DOES NOT shift or reflow — it stays in place
7. Verify the expand trigger (>) appears at the left edge
8. Click the expand trigger
9. Verify sidebar slides back in from the left — SMOOTH
10. Verify main content remains stationary throughout
11. Navigate to /practices (admin route) — verify same behavior
12. Toggle theme (light/dark) — verify sidebar renders correctly in both modes
13. Open browser DevTools → Performance tab → record a collapse animation
    → Verify only "Composite Layers" frames appear (no "Layout" or "Recalculate Style" in the critical path)
```

## Anti-Patterns
- ❌ Do not add `ml-60` conditionally — it must be permanent and never toggle
- ❌ Do not use `transition: 'all ...'` — only transition `transform`
- ❌ Do not add `overflow-hidden` to the aside — it is never needed with fixed positioning
- ❌ Do not use `w-0` — sidebar width must always be `w-60`
- ❌ Do not change sidebar visual appearance, content, or nav structure — only collapse mechanism
- ❌ Do not use arbitrary Tailwind values — `-translate-x-full` and `translate-x-0` are valid scale classes
- ❌ Do not use `any` types
- ❌ Do not add scope beyond this PRP

---
**Confidence score: 9/10** — Three small, surgical edits to well-understood files. The only risk is forgetting one of the two layout files; the PRP calls both out explicitly.
