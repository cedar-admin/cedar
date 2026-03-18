name: "Design System Token Refactor"

## Goal

Migrate all UI code to use Cedar's design system tokens and conventions. No functionality, layout, or visual design changes — this is a class/token migration only. After completion: `node scripts/token-audit.js` exits 0, `pnpm lint` exits 0, the app looks and behaves identically.

## Why

- Enforces the token architecture so future changes are made once (in globals.css) and propagate everywhere
- Sidebar and PracticeSlideOver motion is hardcoded; motion needs to use the shared token system for easing/duration consistency
- Raw `<button>` elements bypass shadcn's focus/a11y handling and will break when design variants change
- Phase: MVP cleanup — visual consistency pass noted in STATUS.md

## Success Criteria

- [ ] `components/Sidebar.tsx` uses motion tokens for transitions (no `duration-200 ease-in-out`)
- [ ] `components/admin/PracticeSlideOver.tsx` has `.animate-panel-in-right` on panel, `.animate-scrim-in` on scrim, `bg-scrim` for overlay
- [ ] All raw `<button>` elements in components/ and app/ replaced with `<Button>` from shadcn
- [ ] `node scripts/token-audit.js` exits 0 (zero errors)
- [ ] `pnpm lint` exits 0 (zero errors; warnings are acceptable)
- [ ] `pnpm build` passes with 0 errors, 0 warnings
- [ ] App renders identically in both light and dark mode

## Context

### Files to Read First

```yaml
- file: docs/design-system/design-standards.md
  why: Core design rules — especially Section 5 (Motion) and Section 9 (Dark Mode)

- file: specs/tokens/token-reference.md
  why: Available tokens for motion, color, spacing, z-index

- file: app/globals.css
  why: Actual animation utility classes (.animate-panel-in-right, .animate-scrim-in, .transition-interactive, etc.)

- file: eslint.config.mjs
  why: tailwindcss/no-arbitrary-value is 'warn' — no-arbitrary-value produces warnings (not errors), so `var()` in style props is fine

- file: scripts/token-audit.js
  why: Scans ONLY `src/` and `app/` directories — components/ is NOT scanned. Zero errors required.

- file: components/ui/button.tsx
  why: Button component signature — understand variant/size options and how className merging works
```

### Known Gotchas

```
1. TOKEN AUDIT SCAN SCOPE: scripts/token-audit.js scans ['src', 'app'] — NOT 'components/'.
   Fixes to Sidebar.tsx and PracticeSlideOver.tsx won't affect audit results.
   Run the audit after each app/ file change to verify.

2. MOTION TOKENS FOR WIDTH ANIMATION: The Sidebar uses a CSS width transition (w-0 ↔ w-60),
   NOT a translateX animation. Do NOT convert it to .animate-panel-in-left — that would
   change the visual behavior (slide vs collapse). Instead use inline style with CSS variable
   references: style={{ transition: 'all var(--duration-base) var(--ease-standard)' }}
   This is an allowed inline style per design standards ("except for dynamic values").

3. NAMED TAILWIND STATUS COLORS ARE ALLOWED: bg-green-50, text-red-700, bg-amber-50, etc.
   paired with dark: variants are explicitly permitted by the design system for status badges,
   severity indicators, and diff viewers. Do NOT replace these with semantic tokens —
   the design standard says: "Use dark: prefix only for non-semantic colors (status badges
   with raw Tailwind colors)". SEVERITY_CLASS, STATUS_CLASS, SubscriptionBadge, DiffViewer
   colors — all leave untouched.

4. ESLint 'tailwindcss/no-arbitrary-value' is 'warn' not 'error'. The task requires zero
   errors. Warnings from this rule are acceptable. However, prefer inline style with var()
   over arbitrary Tailwind values to keep the component clean.

5. Button className merging: shadcn Button uses cn() — custom classes passed via className
   prop correctly override the base variant classes. Padding/sizing from raw button classes
   will take precedence. Safe to convert raw <button> by adding variant="ghost" and keeping
   the same className string. For icon-only close buttons use size="icon".

6. PracticeSlideOver animation: The panel is conditionally rendered (only when selectedPractice
   is set in PracticesTable), so .animate-panel-in-right fires on every open. No exit
   animation needed for the initial implementation.

7. bg-scrim token: The --scrim CSS variable is defined in globals.css as:
     :root  { --scrim: oklch(0 0 0 / 50%); }
     .dark  { --scrim: oklch(0 0 0 / 70%); }
   It is bridged as --color-scrim → bg-scrim in @theme inline.
   Replaces `bg-black/50 dark:bg-black/70` perfectly.
```

### Files to Create or Modify

```bash
# ALL MODIFIED (M), no new files

components/Sidebar.tsx                           (M) motion tokens + raw <button> → <Button>
components/admin/PracticeSlideOver.tsx           (M) entrance animation + scrim token + <button> → <Button>
app/onboarding/OnboardingForm.tsx                (M) plan-selector <button> → <Button>
app/(dashboard)/library/[id]/LibraryDetailTabs.tsx  (M) tab <button> → <Button>
```

### Current File Tree (relevant)

```
components/
  Sidebar.tsx                  — sidebar with width-transition animation
  SidebarLink.tsx              — uses transition-colors (OK per design standards)
  admin/
    PracticeSlideOver.tsx      — slide-over with no entrance animation, raw scrim color
    PracticesTable.tsx         — no violations
app/
  onboarding/
    OnboardingForm.tsx         — plan selector <button> elements
  (dashboard)/
    library/[id]/
      LibraryDetailTabs.tsx    — tab <button> elements
scripts/
  token-audit.js               — scans src/ and app/ only
eslint.config.mjs              — tailwindcss/no-arbitrary-value: 'warn'
app/globals.css                — animation utility classes source of truth
```

---

## Tasks (execute in order)

---

### Task 1: Fix PracticeSlideOver — entrance animation + scrim token + close button

**File:** `components/admin/PracticeSlideOver.tsx`
**Action:** MODIFY
**Depends on:** Nothing

**What to change:**

1. **Scrim div** (currently line ~83): Replace raw overlay with token-based scrim + entrance animation
2. **Panel div** (currently line ~90): Add entrance animation class
3. **Close button** (currently line ~96): Replace raw `<button>` with `<Button>`

```tsx
// ── BEFORE (scrim) ────────────────────────────────────────────────────────────
<div
  className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70"
  onClick={onClose}
  aria-hidden="true"
/>

// ── AFTER (scrim) ─────────────────────────────────────────────────────────────
<div
  className="fixed inset-0 z-40 bg-scrim animate-scrim-in"
  onClick={onClose}
  aria-hidden="true"
/>

// ── BEFORE (panel) ────────────────────────────────────────────────────────────
<div className="fixed inset-y-0 right-0 z-50 w-[480px] max-w-full bg-background border-l border-border shadow-xl overflow-y-auto flex flex-col">

// ── AFTER (panel) ─────────────────────────────────────────────────────────────
<div className="fixed inset-y-0 right-0 z-50 w-[480px] max-w-full bg-background border-l border-border shadow-xl overflow-y-auto flex flex-col animate-panel-in-right">

// ── BEFORE (close button) ────────────────────────────────────────────────────
<button
  onClick={onClose}
  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
  aria-label="Close panel"
>
  <i className="ri-close-line text-xl" />
</button>

// ── AFTER (close button) ─────────────────────────────────────────────────────
<Button
  variant="ghost"
  size="icon"
  onClick={onClose}
  className="text-muted-foreground hover:text-foreground shrink-0 h-8 w-8"
  aria-label="Close panel"
>
  <i className="ri-close-line text-xl" />
</Button>
```

**Import note:** `Button` is already imported at the top of this file — no new import needed.

**After this file:** Run `node scripts/token-audit.js` — this file is in `components/`, not scanned. Audit result unchanged (expected: 0 errors). Visually verify the panel slides in from the right and scrim fades in.

---

### Task 2: Fix Sidebar — motion tokens + raw `<button>` → `<Button>`

**File:** `components/Sidebar.tsx`
**Action:** MODIFY
**Depends on:** Nothing (can be done in parallel with Task 1)

**What to change:**

1. **Add `Button` import** (currently not imported in Sidebar.tsx)
2. **Expand trigger `<button>`** (line ~82): Replace with `<Button>`
3. **`<aside>` element** (line ~94): Replace `transition-all duration-200 ease-in-out` with inline style using CSS variable tokens
4. **Collapse `<button>`** (line ~104): Replace with `<Button>`

```tsx
// ── ADD TO IMPORTS ────────────────────────────────────────────────────────────
import { Button } from '@/components/ui/button'

// ── BEFORE (expand trigger) ───────────────────────────────────────────────────
<button
  onClick={() => setCollapsed(false)}
  aria-label="Expand sidebar"
  className={`fixed left-0 top-4 z-50 flex items-center justify-center w-5 h-8 bg-sidebar border-r border-t border-b border-sidebar-border text-sidebar-foreground/60 hover:text-sidebar-foreground transition-opacity duration-200 ${
    collapsed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
  }`}
>
  <i className="ri-arrow-right-s-line text-sm" />
</button>

// ── AFTER (expand trigger) ────────────────────────────────────────────────────
<Button
  variant="ghost"
  size="icon"
  onClick={() => setCollapsed(false)}
  aria-label="Expand sidebar"
  className={`fixed left-0 top-4 z-50 flex items-center justify-center w-5 h-8 rounded-none bg-sidebar border-r border-t border-b border-sidebar-border text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar transition-interactive ${
    collapsed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
  }`}
>
  <i className="ri-arrow-right-s-line text-sm" />
</Button>

// ── BEFORE (<aside> with hardcoded transition) ────────────────────────────────
<aside
  className={`flex flex-col shrink-0 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-200 ease-in-out ${
    collapsed ? 'w-0 overflow-hidden border-r-0' : 'w-60 overflow-y-auto'
  }`}
>

// ── AFTER (<aside> with token-based transition) ───────────────────────────────
<aside
  className={`flex flex-col shrink-0 h-screen border-r border-sidebar-border bg-sidebar ${
    collapsed ? 'w-0 overflow-hidden border-r-0' : 'w-60 overflow-y-auto'
  }`}
  style={{ transition: 'all var(--duration-base) var(--ease-standard)' }}
>

// ── BEFORE (collapse button) ──────────────────────────────────────────────────
<button
  onClick={() => setCollapsed(true)}
  aria-label="Collapse sidebar"
  className="flex items-center justify-center w-6 h-6 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
>
  <i className="ri-arrow-left-s-line text-base" />
</button>

// ── AFTER (collapse button) ───────────────────────────────────────────────────
<Button
  variant="ghost"
  size="icon"
  onClick={() => setCollapsed(true)}
  aria-label="Collapse sidebar"
  className="w-6 h-6 rounded-none text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
>
  <i className="ri-arrow-left-s-line text-base" />
</Button>
```

**Key details:**
- Inline style `transition: 'all var(--duration-base) var(--ease-standard)'` uses CSS variable references — this is the token-based approach for the width animation (which cannot use the keyframe animation classes without changing visual behavior)
- `transition-interactive` on the expand trigger covers the opacity fade correctly
- `rounded-none` added to both Button instances to override the Button component's default `rounded-md`, preserving the square appearance of the sidebar controls

**After this file:** Run `node scripts/token-audit.js` — `components/` is not scanned; result unchanged. Visually verify sidebar still collapses/expands with the same motion.

---

### Task 3: Fix OnboardingForm plan-selector buttons

**File:** `app/onboarding/OnboardingForm.tsx`
**Action:** MODIFY
**Depends on:** Nothing

**What to change:** Replace 2 raw `<button>` plan-selector elements with `<Button>`.

```tsx
// ── BEFORE ───────────────────────────────────────────────────────────────────
<button
  type="button"
  onClick={() => setTier('monitor')}
  className={`text-left p-4 border transition-colors ${
    tier === 'monitor'
      ? 'border-primary bg-primary/5'
      : 'border-border bg-card hover:bg-muted/40'
  }`}
>

// ── AFTER ────────────────────────────────────────────────────────────────────
<Button
  type="button"
  variant="ghost"
  onClick={() => setTier('monitor')}
  className={`h-auto text-left p-4 border rounded-none w-full justify-start transition-interactive ${
    tier === 'monitor'
      ? 'border-primary bg-primary/5 hover:bg-primary/5'
      : 'border-border bg-card hover:bg-muted/40'
  }`}
>
```

Apply the same pattern to the `intelligence` plan button. The key overrides:
- `h-auto` — override Button's fixed height
- `rounded-none` — override Button's default border-radius (plan cards have no radius in current design)
- `w-full justify-start` — override Button flex behavior, make it fill the grid cell and left-align content
- `transition-interactive` — replaces `transition-colors` with the token-based preset
- `hover:bg-primary/5` / `hover:bg-muted/40` — keep explicit hover states since Button ghost's default hover would conflict

**After this file:** Run `node scripts/token-audit.js` — this file is in `app/`, it IS scanned. Expected: 0 errors.

---

### Task 4: Fix LibraryDetailTabs tab buttons

**File:** `app/(dashboard)/library/[id]/LibraryDetailTabs.tsx`
**Action:** MODIFY
**Depends on:** Nothing

**What to change:** Replace raw `<button>` tab buttons with `<Button>`.

```tsx
// ── BEFORE ───────────────────────────────────────────────────────────────────
<button
  key={t}
  type="button"
  onClick={() => setTab(t)}
  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
    tab === t
      ? 'border-primary text-foreground'
      : 'border-transparent text-muted-foreground hover:text-foreground'
  }`}
>
  {labels[t]}
</button>

// ── AFTER ────────────────────────────────────────────────────────────────────
<Button
  key={t}
  type="button"
  variant="ghost"
  onClick={() => setTab(t)}
  className={`px-4 py-2 h-auto rounded-none text-sm font-medium border-b-2 transition-interactive -mb-px ${
    tab === t
      ? 'border-primary text-foreground hover:bg-transparent'
      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-transparent'
  }`}
>
  {labels[t]}
</Button>
```

Key overrides:
- `h-auto` — override fixed height
- `rounded-none` — tabs have no border-radius in current design
- `hover:bg-transparent` — suppress Button ghost's hover background; tab hover is text-color only
- `transition-interactive` — replaces `transition-colors`

**After this file:** Run `node scripts/token-audit.js`. Expected: 0 errors.

---

### Task 5: Final validation sweep

**Action:** Verify + commit

```bash
# 1. Run the token audit
node scripts/token-audit.js
# Expected: 0 errors, 0 warnings (or 0 errors if warnings exist from pre-existing code)

# 2. Run lint
pnpm lint
# Expected: 0 errors (warnings OK per task requirement)

# 3. Run build
pnpm build
# Expected: 0 errors, 0 warnings
```

If lint shows NEW warnings from our changes (e.g., `tailwindcss/no-arbitrary-value` on the `w-[480px]` in PracticeSlideOver panel), note that `w-[480px]` should remain as-is — changing it to `w-[var(--width-panel)]` would be preferable but introduces a different arbitrary value form; the current form is pre-existing and not introduced by this refactor.

---

## Integration Points

```yaml
DATABASE:
  - None

INNGEST:
  - None

API ROUTES:
  - None

UI:
  - components/Sidebar.tsx — sidebar motion + buttons
  - components/admin/PracticeSlideOver.tsx — panel animation + scrim token + close button
  - app/onboarding/OnboardingForm.tsx — plan selector buttons
  - app/(dashboard)/library/[id]/LibraryDetailTabs.tsx — tab buttons

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

### Token Audit

```bash
node scripts/token-audit.js
# Must exit with code 0 (zero errors)
# Note: scans src/ and app/ only — components/ violations not detected by this tool
```

### Lint Check

```bash
pnpm lint
# Must exit with 0 errors (warnings acceptable)
```

### Visual Verification

```bash
# Start dev server (use this exact command per CLAUDE.md):
env -u ANTHROPIC_API_KEY npx next dev --port 3000

# Then verify in browser:
# 1. /practices (admin) — open a practice row → PracticeSlideOver should slide in from right
#    Scrim should fade in. Close X button should work. Light + dark mode.
# 2. Sidebar — click collapse arrow → sidebar collapses smoothly
#    Expand trigger appears. Click it → sidebar expands. Motion should feel identical.
# 3. /library/[id] — tab buttons (Cedar Summary / Source File / Live Source) work
# 4. /onboarding — plan cards (Monitor / Intelligence) toggle correctly
```

---

## Complete Violation Catalog

### What IS being fixed in this PRP

| File | Violation | Fix |
|------|-----------|-----|
| `components/admin/PracticeSlideOver.tsx:83` | `bg-black/50 dark:bg-black/70` — raw color instead of scrim token | Replace with `bg-scrim` |
| `components/admin/PracticeSlideOver.tsx:83` | Scrim has no entrance animation | Add `animate-scrim-in` |
| `components/admin/PracticeSlideOver.tsx:90` | Panel has no entrance animation | Add `animate-panel-in-right` |
| `components/admin/PracticeSlideOver.tsx:96` | Raw `<button>` close trigger | Replace with `<Button variant="ghost" size="icon">` |
| `components/Sidebar.tsx:85` | `transition-opacity duration-200` hardcoded | Replace with `transition-interactive` |
| `components/Sidebar.tsx:94` | `transition-all duration-200 ease-in-out` hardcoded | Replace with inline style using `var(--duration-base)` + `var(--ease-standard)` |
| `components/Sidebar.tsx:82` | Raw `<button>` expand trigger | Replace with `<Button variant="ghost" size="icon">` |
| `components/Sidebar.tsx:104` | Raw `<button>` collapse trigger | Replace with `<Button variant="ghost" size="icon">` |
| `app/onboarding/OnboardingForm.tsx:178` | Raw `<button>` plan selector (Monitor) | Replace with `<Button variant="ghost">` |
| `app/onboarding/OnboardingForm.tsx:206` | Raw `<button>` plan selector (Intelligence) | Replace with `<Button variant="ghost">` |
| `app/(dashboard)/library/[id]/LibraryDetailTabs.tsx:89` | Raw `<button>` tab buttons | Replace with `<Button variant="ghost">` |

### What is NOT a violation (leave untouched)

| Pattern | Why it's OK |
|---------|-------------|
| `bg-green-50 text-green-700 border-green-200 dark:bg-green-950...` in status badges | Explicitly allowed per design standards: "Use dark: prefix only for non-semantic colors (status badges with raw Tailwind colors)" |
| `SEVERITY_CLASS`, `SEVERITY_DOT`, `STATUS_CLASS` in `lib/ui-constants.ts` | Status color constants — canonical source of truth, design-compliant |
| `DiffViewer` green/red row backgrounds in `changes/[id]/page.tsx` and `reviews/[id]/page.tsx` | Semantic diff colors — visually meaningful, require dark: pairs |
| `transition-colors` in `SidebarLink.tsx` | Design standards explicitly allow `transition-colors` as alternative to `.transition-interactive` |
| `style={{ width: \`${w}%\` }}` in `UpgradeBanner.tsx` | Dynamic computed value — inline styles allowed for this per design standards |
| `style={{ transform: ... }}` in `progress.tsx` | Dynamic computed value in shadcn primitive — leave shadcn components untouched |
| `w-[480px]` in `PracticeSlideOver.tsx` | Pre-existing; `--width-panel: 30rem (480px)` token exists but no `w-panel` Tailwind class; fix deferred to token extension work |
| `bg-scrim` usage added by this PRP | Correct token usage |
| `animate-panel-in-right`, `animate-scrim-in` added by this PRP | Correct design system usage (already in ESLint whitelist) |

---

## Anti-Patterns

- ❌ Do not convert the Sidebar width animation to `.animate-panel-in-left` — that would change the visual behavior from a width-collapse to a translateX slide, violating the no-visual-change requirement
- ❌ Do not replace status badge colors (green/red/amber/blue/purple with dark: pairs) — these are allowed by design standards
- ❌ Do not add arbitrary Tailwind values like `ease-[cubic-bezier(...)]` — use CSS variable references in style prop instead
- ❌ Do not modify any logic, data fetching, or component props — token/class migration only
- ❌ Do not modify shadcn/ui primitives in `components/ui/` — only Cedar application code
- ❌ Do not skip running token-audit.js and lint before committing

---

## Commit & Push

After all tasks pass validation:

```bash
git add -A
git commit -m "chore: design system token refactor — motion, scrim, raw button migration"

PAT="$GITHUB_PAT"
git remote set-url origin "https://${PAT}@github.com/cedar-admin/cedar.git"
git push origin main
git remote set-url origin "https://github.com/cedar-admin/cedar.git"

sleep 10 && curl -s "https://api.vercel.com/v6/deployments?projectId=prj_YykyqY89BoocNV2xV3MUWcDjpdxv&limit=1" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  | jq '.deployments[0] | {id: .uid, state, url}'
```

---

## Confidence Score

**9/10** — All violations are clearly identified, changes are purely cosmetic class/token swaps, no data or logic is touched, and the exact before/after code is documented for each change. Minor uncertainty (−1) on whether Button component class merging for the icon-only buttons preserves exact pixel dimensions — may need minor className tuning.
