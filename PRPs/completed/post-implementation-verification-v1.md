name: "post-implementation-verification-v1"

## Goal

Run a post-implementation verification pass against the `core-dashboard-ux-normalization` PRP:
re-run the Playwright UI audit, capture fresh screenshots, produce a before/after delta audit,
and fix all nested surface violations (design-standards.md §8) found across touched screens.

Output: `research/ui-audit/design-audit-delta.md` + patched components with 0 nested surface violations.

## Why

- The last PRP resolved 3 P0 and 6 P1 issues. This session closes the loop — confirming what
  actually landed, what improved but is still weak, and what regressed.
- Nested surface violations (Card → Table surface-on-surface layering) were missed in the
  original audit and are a known design-standards breach that must be fixed before the next
  UX sprint.
- Without a delta audit, the next PRP would have no verified baseline to scope against.

## Success Criteria

- [ ] Playwright audit re-run produces a fresh `research/ui-audit/report.json`
- [ ] Fresh screenshots saved for `/home`, `/changes`, `/changes/[id]`, `/library`, `/settings`, `/sources`, `/audit`
- [ ] `research/ui-audit/design-audit-delta.md` written with all 6 required sections
- [ ] Every nested surface violation found and reported
- [ ] All nested surface violations patched (`variant="ghost"` on inner tables/cards)
- [ ] Post-fix screenshots captured for affected screens
- [ ] `npm run build` passes with 0 errors, 0 warnings

## Context

### Files to Read First

```yaml
- file: research/ui-audit/design-audit.md
  why: Original audit — baseline for all before/after comparisons

- file: research/ui-audit/report.json
  why: Original Playwright run data — interaction success/failure counts

- file: docs/design-system/design-standards.md
  section: "8. Cards — Nested Component Surfaces"
  why: The governing rule for ghost vs surface on inner components

- file: tests/ui-audit.spec.ts
  why: The Playwright audit spec — understand what it already captures before modifying

- file: app/(dashboard)/audit/page.tsx
  why: Known nested surface violation — Card surface containing Table surface

- file: app/(dashboard)/changes/page.tsx
  why: Changes table — check for surface nesting

- file: app/(dashboard)/sources/page.tsx
  why: Sources table — check for surface nesting

- file: app/(dashboard)/changes/[id]/page.tsx
  why: Change detail — check for surface nesting in tabs/cards

- file: app/(dashboard)/library/[domain]/[slug]/page.tsx
  why: Library detail tabs — check for surface nesting

- file: components/
  why: Shared components that may render surfaced tables inside surfaced containers
```

### Current File Tree (relevant subset)

```bash
research/ui-audit/
  design-audit.md            # baseline — before PRP
  report.json                # original Playwright run data
  screenshots/               # before-PRP screenshots
    home-loaded.png
    home-final.png
    changes-loaded.png
    changes-final.png
    library-loaded.png
    library-final.png
    sources-loaded.png
    sources-final.png
    audit-loaded.png
    audit-final.png
    settings-loaded.png
    settings-final.png

tests/
  ui-audit.spec.ts           # Playwright audit spec

app/(dashboard)/
  home/page.tsx
  changes/page.tsx
  changes/[id]/page.tsx
  library/page.tsx
  library/[domain]/page.tsx
  library/[domain]/[slug]/page.tsx
  sources/page.tsx
  audit/page.tsx
  settings/page.tsx

components/                  # Shared Cedar components
```

### Files to Create or Modify

```bash
# NEW files
research/ui-audit/design-audit-delta.md        (+) delta audit — executive verdict + findings
research/ui-audit/screenshots/v2/              (+) post-PRP screenshot directory

# MODIFIED files (nested surface fixes only — no redesign)
app/(dashboard)/audit/page.tsx                 (M) Table.Root variant="surface" → "ghost"
app/(dashboard)/changes/page.tsx               (M) if Table.Root variant="surface" inside Card
app/(dashboard)/sources/page.tsx               (M) if Table.Root variant="surface" inside Card
app/(dashboard)/changes/[id]/page.tsx          (M) if any inner surface violations in tabs
app/(dashboard)/library/[domain]/[slug]/page.tsx  (M) if any inner surface violations in tabs
```

### Known Gotchas

```typescript
// The Playwright spec runs against production (cedar-beta.vercel.app).
// Post-fix screenshots must be taken locally against dev server since fixes
// haven't been deployed yet. Use the local BASE_URL override documented below.

// IMPORTANT: dev server must be started with:
//   env -u ANTHROPIC_API_KEY npx next dev --port 3000
// Without this, ANTHROPIC_API_KEY is empty and API calls fail.

// The nested surface rule (design-standards.md §8):
//   - Table inside Card → Table gets variant="ghost"
//   - Card inside Card (same visual layer) → inner Card gets variant="ghost"
//   - Exception: if the inner component intentionally creates a different
//     visual zone (e.g. a highlighted callout within a card), keep the surface.
//
// Quick test: removing inner surface should look cleaner without losing info.

// Screenshots save to research/ui-audit/screenshots/ by default.
// Post-fix screenshots should be saved with a v2- prefix or into a v2/ subdir
// so they can be referenced in the delta audit as "after" evidence.

// The delta audit must reference file paths for each finding, e.g.:
//   app/(dashboard)/audit/page.tsx:42 — Table.Root variant="surface" inside Card
// This makes the audit actionable for future sessions.
```

## Tasks (execute in order)

---

### Task 1: Re-run Playwright audit against production

**Action:** RUN (do not modify the spec)

Run the existing Playwright audit against production to capture the current post-PRP state.
Save screenshots with a `v2-` prefix so they don't overwrite the baseline.

```bash
# Temporarily modify OUT_DIR prefix or copy screenshots after run.
# Simplest approach: run the audit, then rename outputs.

npx playwright test tests/ui-audit.spec.ts --project=chromium

# After run completes, copy new screenshots to a v2 directory:
mkdir -p research/ui-audit/screenshots/v2
# Copy all screenshots captured in this run:
cp research/ui-audit/screenshots/home-loaded.png research/ui-audit/screenshots/v2/home-loaded.png
# ... (copy all touched-screen screenshots)
# Overwrite report.json with the new run's data (it's the current state report).
```

**What to capture at minimum (touched screens):**

For each of these routes, ensure a screenshot is saved to `v2/`:
- `/home` → `v2/home-loaded.png`, `v2/home-final.png`
- `/changes` → `v2/changes-loaded.png`, `v2/changes-final.png`
- `/changes/[id]` → `v2/changes-detail.png` (if data is live)
- `/library` → `v2/library-loaded.png`, `v2/library-domain.png`, `v2/library-final.png`
- `/settings` → `v2/settings-loaded.png`, `v2/settings-final.png`
- `/sources` → `v2/sources-loaded.png`, `v2/sources-final.png`
- `/audit` → `v2/audit-loaded.png`, `v2/audit-final.png`

---

### Task 2: Audit nested surface violations

**Action:** READ + ANALYZE (no code changes yet)

Read each of the following files and identify every instance where a component with its own
surface treatment is nested inside another surfaced container:

```typescript
// Pattern to look for:
// <Card variant="surface">        ← outer surface
//   <Table.Root variant="surface">  ← VIOLATION: inner surface inside outer
// </Card>

// Also flag:
// <Card variant="surface">
//   <Card variant="surface">  ← VIOLATION: card-in-card same visual purpose
// </Card>

// Files to check:
// 1. app/(dashboard)/audit/page.tsx        — known violation
// 2. app/(dashboard)/changes/page.tsx
// 3. app/(dashboard)/sources/page.tsx
// 4. app/(dashboard)/changes/[id]/page.tsx
// 5. app/(dashboard)/library/[domain]/[slug]/page.tsx
// 6. Any component in components/ that renders a Table inside a Card
```

Record every violation found:
- File path + line number
- Outer container variant
- Inner component and its current variant
- Recommended fix

---

### Task 3: Fix all nested surface violations

**File:** Each file identified in Task 2
**Action:** MODIFY
**Rule:** `<Table.Root variant="surface">` inside any `<Card>` → change to `variant="ghost"`

```typescript
// BEFORE (violation):
<Card variant="surface">
  <Table.Root variant="surface">
    ...
  </Table.Root>
</Card>

// AFTER (correct):
<Card variant="surface">
  <Table.Root variant="ghost">
    ...
  </Table.Root>
</Card>

// Same rule applies to nested Cards:
// BEFORE:
<Card variant="surface">
  <Card variant="surface">...</Card>
</Card>
// AFTER:
<Card variant="surface">
  <Card variant="ghost">...</Card>
</Card>

// Do NOT change:
// - Tables that stand alone (not inside a Card or other surfaced container)
// - Tables inside slide-over panels (also ghost per design-standards §8)
// - Tables inside Dialogs or Callouts — check the design standard first
```

Apply the minimal change — only `variant` prop, nothing else.

---

### Task 4: Build check after fixes

**Action:** RUN

```bash
npm run build
# Must pass with 0 errors, 0 warnings before proceeding
```

---

### Task 5: Capture post-fix screenshots

**Action:** RUN

Start the dev server and capture screenshots for every screen that was modified in Task 3.
Save to `research/ui-audit/screenshots/v2/` with a `post-fix-` prefix:

```bash
env -u ANTHROPIC_API_KEY npx next dev --port 3000

# Then use the preview or Playwright to capture:
# For each affected screen, capture:
#   v2/post-fix-audit.png
#   v2/post-fix-changes.png
#   (etc. for any other modified screens)
```

---

### Task 6: Write delta audit

**File:** `research/ui-audit/design-audit-delta.md`
**Action:** CREATE

Structure the delta audit exactly as specified below. Use the before screenshots
(root `research/ui-audit/screenshots/*.png`) and after screenshots
(`research/ui-audit/screenshots/v2/*.png`) as evidence. Reference file paths
and line numbers for any implementation finding.

```markdown
# Cedar UI Audit — Delta Report
**Baseline:** design-audit.md (March 23, 2026)
**Post-PRP:** core-dashboard-ux-normalization
**Delta date:** [today]

---

## 1. Executive Verdict

[2–4 sentences: did the PRP materially improve the primary user journey?
Overall verdict: significant improvement / partial improvement / no improvement / regression]

---

## 2. What Materially Improved

For each item, state: Fixed | Improved but still weak | Not fixed

### Primary Journey (Home → Changes → Change detail → Library)
- **Changes table row interaction** — [verdict + evidence: file path, screenshot ref]
- **Change detail h1** — [verdict + evidence]
- **Home activity feed summary visibility** — [verdict + evidence]

### Component Consistency
- **Section heading consistency** — [verdict + evidence]
- **AI trust pattern (badge + disclaimer)** — [verdict + evidence]
- **Shared filter pill consistency** — [verdict + evidence]
- **HashWithCopy affordance** — [verdict + evidence]

### Navigation & Wayfinding
- **nav/title consistency (Settings label, Sources h1)** — [verdict + evidence]

### Interaction Patterns
- **DomainCard interaction (no full-link wrapper)** — [verdict + evidence]
- **DomainCard hover (no green on heading)** — [verdict + evidence]

---

## 3. What Still Feels Inconsistent

[List items that improved but didn't fully resolve, with specific remaining gaps.
Reference the before/after screenshots as evidence.]

---

## 4. Regressions Introduced

[Any new issues introduced by the PRP that weren't in the baseline.
If none: "No regressions detected."]

---

## 5. Remaining Issues by Severity

### P0 (blocks core UX)
- [item] — [file path:line] — [description]

### P1 (high impact, primary path)
- [item] — [file path:line] — [description]

### P2 (noticeable, secondary path)
- [item] — [file path:line] — [description]

### Nested Surface Violations Fixed This Session
- [file path:line] — [description of what was fixed]

---

## 6. Recommendation for Next PRP

**Recommended title:** [title]

**Suggested scope:**
- [bullet list of what should be in scope]

**Next phase focus:** [FAQ | Sources/Audit | Settings refinement] — [1–2 sentence rationale]
```

**Evaluation criteria to explicitly address in sections 2–5:**
- Hierarchy and scanability
- Interaction clarity
- Trust/provenance signaling
- Component consistency
- Heading consistency
- Navigation clarity
- Information density
- Alignment with art direction
- Coherence of main path: Home → Changes → Change detail → Library

For each "fixed" verdict, cite the implementing file path.
For each "not fixed" verdict, cite the original audit finding (design-audit.md line).
Distinguish clearly: **Fixed** / **Improved but still weak** / **Not fixed**.

---

## Integration Points

```yaml
DATABASE:
  - none

INNGEST:
  - none

API ROUTES:
  - none

UI:
  - Nested surface fixes: audit, changes, sources, change detail, library detail tabs
  - No new pages or routes

ENV:
  - none
```

## Validation

### Build Check

```bash
npm run build
# 0 errors, 0 warnings required
```

### Visual Verification

```bash
# 1. Start dev server
env -u ANTHROPIC_API_KEY npx next dev --port 3000

# 2. Navigate to each fixed screen and verify:
#    /audit      — table rows no longer have double surface/border
#    /changes    — if fixed, table no longer double-surfaced
#    /sources    — if fixed, table no longer double-surfaced
#    /changes/[id] — if fixed, inner sections not double-surfaced

# 3. Confirm no visual regressions — tables should look cleaner,
#    not missing structure. Run the "quick test": removing inner
#    surface should look cleaner without losing information.
```

### Delta Audit Completeness Check

```
Verify design-audit-delta.md contains:
- [ ] Section 1: Executive verdict (2–4 sentences)
- [ ] Section 2: All 10 specific fix verdicts with evidence
- [ ] Section 3: Remaining inconsistencies
- [ ] Section 4: Regression check
- [ ] Section 5: P0/P1/P2 remaining issues
- [ ] Section 6: Next PRP recommendation with scope and focus
- [ ] Screenshot references (before: screenshots/X.png, after: screenshots/v2/X.png)
- [ ] File path citations for every finding
```

## Anti-Patterns

- ❌ Do not modify anything beyond nested surface `variant` props in Task 3 — this is a targeted compliance pass
- ❌ Do not redesign or reskin any component while "in the neighborhood"
- ❌ Do not add new components, helpers, or utilities
- ❌ Do not change layout, spacing, or typography — surface violations only
- ❌ Do not skip the build check before capturing post-fix screenshots
- ❌ Do not write vague verdicts ("looks better") — cite file paths and screenshots
- ❌ Do not commit changes unless the user asks
- ❌ Do not run the Playwright spec with modified BASE_URL against localhost without noting it in the report
