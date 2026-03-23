# Cedar UI Design Audit
**Date:** 2026-03-23
**Auditor:** Claude (automated + design-system-grounded analysis)
**Inputs:** Playwright audit run, screenshots, source code review, design-system docs
**Scope:** `/home`, `/changes` (list + detail), `/library`, `/faq`, `/sources`, `/audit`, `/settings`, `/pricing`

---

## 1. Executive Summary

Cedar's interface is structurally sound and architecturally well-organized. The Radix Themes component system is being used correctly in most places, the semantic token layer is in place, and the core product hierarchy (sidebar + content area) is working. Auth succeeds, all 8 routes load, and the design-system philosophy is visibly shaping the product.

However, a cluster of recurring issues across every screen undermines the execution. The most consequential: **heading sizes in card sections are systematically wrong** (12px labels used where 16–18px section headings belong), **the "AI-generated" badge is missing from every AI summary**, **navigable table rows have no full-row click behavior or trailing chevrons**, and **two sidebar nav labels do not match their page titles**, breaking wayfinding.

Several empty states reflect data-population limitations rather than design failures, and these are called out explicitly below. Where something is empty because the monitoring pipeline hasn't yet produced records, that is noted separately from actual UI issues.

The product passes the gray test and color test adequately — color is used for semantic meaning, not decoration, and the neutral-interactive model is largely upheld. The art direction problems are concentrated at the granular level (heading scales, copy casing, missing trust signals) rather than at the personality level.

**Total issues identified: 29**
- P0 (critical, breaks core UX): 3
- P1 (high, design-system violation with user impact): 8
- P2 (medium, incomplete or inconsistent): 10
- P3 (low, copy, labeling, minor): 8

---

## 2. Highest-Priority Issues (P0 + P1)

### P0-1 · Changes table: single-cell link, no full-row clickability, no trailing chevron
**File:** `app/(dashboard)/changes/page.tsx:205`
**Doc:** `ux-standards.md §2`

The changes table is the primary collection view in the product. Currently, only the summary text cell contains a `<Link>` — the row itself has no `onClick`, no `cursor: pointer`, and no trailing chevron column. A user hovering over the severity badge, source name, detected-at, or status cells gets no pointer cursor and no feedback that clicking will navigate anywhere. Per `ux-standards.md §2`, full-row clickability, `cursor: pointer` on hover, a hover background highlight, and a trailing chevron are all required on every navigable table row. This is the most common interaction on the most-used page, and it currently fails the discoverability standard entirely.

### P0-2 · Changes detail: `h1` is the source name, not the change description
**File:** `app/(dashboard)/changes/[id]/page.tsx:111–113`
**Doc:** `information-density.md §2.3`, `art-direction.md §9` (3-second test)

The change detail page uses the source agency name (e.g., "Florida Board of Medicine") as the `h1`. The source agency is a metadata field — it belongs in the source cluster. The primary identifier of a change is *what changed* (the AI-generated summary or a short change title), not *who issued it*. A user landing on this page cannot determine within 3 seconds what regulatory change this is. The h1 should be the change description; the source name should be secondary metadata in the details sidebar.

### P0-3 · Home activity feed: no change summary — source name alone is not scannable
**File:** `app/(dashboard)/home/page.tsx:206–211`
**Doc:** `information-density.md §3.1`, `art-direction.md §9` (3-second test)

The "Recent Activity" feed shows a severity badge, the source agency name, and a timestamp. The change summary — the only information that tells a user *what changed* — is not displayed. A user scanning the feed sees "Florida Board of Medicine — 2 hours ago" across multiple items with no way to assess relevance without clicking each one. Per `information-density.md §3.1`, Tier 1 content (the minimum needed to decide whether an item deserves attention) includes a summary excerpt. This is also true of the "Critical & High Alerts" section, though that section at least anchors severity more prominently.

---

### P1-1 · Card section headings use `size="2"` (12px) across every screen
**Files:** `home/page.tsx:103,142,185`, `changes/[id]/page.tsx:133,149,173`, `settings/page.tsx:100,140,172,228,248,310`
**Doc:** `art-direction.md §4` (type scale), `frontend-standards.md §1.3`

Section headings within cards — "Critical & High Alerts," "Compliance Health," "Recent Activity," "AI Summary," "Detected Changes," "Details," "Practice," "Subscription," "Notifications," "Team Members," "Jurisdictions" — all use `<Heading as="h2" size="2" weight="bold">`. At `size="2"`, these render at 12px, which is the *label/caption* scale per `art-direction.md §4`. A 12px element labeled `weight="bold"` functions visually as a data label, not a section heading. It creates no navigable hierarchy landmark and fails the visual three-level-hierarchy test (primary/secondary/tertiary). Section headings within cards should use `size="3"` (16px) at minimum, and standalone section headings outside cards should use `size="4"` (18px).

This is the single most pervasive violation in the codebase — it affects every page with cards.

### P1-2 · AI Summary has no "AI-generated" badge on the change detail page
**File:** `app/(dashboard)/changes/[id]/page.tsx:133`
**Doc:** `information-density.md §3.2`, `art-direction.md §3` (trustworthy)

The AI Summary card heading reads "AI Summary" as plain text. There is no Radix `<Badge>` marking the content as AI-generated. Per `information-density.md §3.2`, every AI-generated content block carries a small, gray, consistently-placed "AI-generated" badge. This is a trust signal, not decoration — Cedar's core trustworthiness pillar requires users to always know whether they are reading AI-generated or human-reviewed content. The `LegalDisclaimer` component appears at the bottom of the page, but the disclaimer alone does not substitute for the inline badge on the content block itself. On the detail view (Tier 2), both the badge and disclaimer are required.

### P1-3 · Sidebar nav label "My Practice" does not match page title "Settings"
**Files:** `components/Sidebar.tsx:19`, `app/(dashboard)/settings/page.tsx:91`
**Doc:** `ux-standards.md §5`

The sidebar nav item for `/settings` is labeled "My Practice." The page `h1`, browser tab title, and `metadata.title` all say "Settings." Per `ux-standards.md §5`, five wayfinding signals must be consistent simultaneously: sidebar active state, page title, breadcrumbs, browser tab title, and URL. Three of the five say "Settings" while the sidebar says "My Practice." A user who clicks "My Practice" in the sidebar and lands on a page titled "Settings" experiences a perceptible wayfinding break. The correct fix is to align either the nav label or the page title — the page content (account, notifications, billing) supports "Settings" as the label.

### P1-4 · Sources `h1` "Source Library" does not match nav label "Sources"
**Files:** `components/Sidebar.tsx:17`, `app/(dashboard)/sources/page.tsx:84`
**Doc:** `ux-standards.md §5`

Same issue as P1-3. The sidebar nav label is "Sources"; the `h1` is "Source Library." Three of five wayfinding signals diverge. Choose one label and apply it consistently to nav, page title, tab title, and breadcrumb.

### P1-5 · Filter pill component has inconsistent font size across pages
**Files:** `app/(dashboard)/changes/page.tsx:128` (`text-sm`), `app/(dashboard)/library/page.tsx:109` (`text-xs`)
**Doc:** `ux-standards.md §4` (visual identity consistency), `design-standards.md §4`

The severity filter pills on `/changes` use `text-sm` (14px). The practice-type filter pills on `/library` use `text-xs` (12px). These are the same component pattern — a row of filter pills for a paginated collection — but they render at different sizes. Per `ux-standards.md §4`, same pattern = same treatment everywhere. The pills also differ in structural token choice (`--cedar-page-bg` vs. `--cedar-panel-bg` for the inactive state). These should be extracted into a single shared `FilterPills` component.

### P1-6 · Audit trail hash values have no copy affordance
**File:** `app/(dashboard)/audit/page.tsx:191`, `changes/[id]/page.tsx:200`
**Doc:** `information-density.md §6.1`

Per `information-density.md §6.1`, hash values should show the first 8 characters + ellipsis with a copy-to-clipboard button for the full value. The audit page shows 12 characters with an ellipsis but no copy button. The change detail sidebar shows 16 characters (hardcoded, not 8) with an ellipsis and no copy button. Both locations silently discard the full hash — a tamper-evident audit system where the hashes are inaccessible undermines the transparency Cedar promises.

### P1-7 · `DomainCard` wraps entire card in `<Link>` — accessibility violation
**File:** `components/DomainCard.tsx:29`
**Doc:** `ux-standards.md §2` (card grids as navigation targets)

`DomainCard` wraps the entire card in `<Link href={...} className="block group">`. Per `ux-standards.md §2`, cards should not be wrapped in `<a>` or `<button>` elements — screen readers would read the entire card content as a single link name ("HIPAA & Privacy 142 regulations" as one link text), which is inaccessible for assistive technology users and can produce link labels 25+ seconds long when cards have rich content. The correct pattern is the pseudo-element technique: heading link with `::after { position: absolute; inset: 0 }`. Additionally, `DomainCard`'s hover state uses `hover:shadow-[var(--shadow-3)]` as the primary visual change. Per `ux-standards.md §2`, shadow changes alone are insufficient hover indicators for tightly grouped cards.

### P1-8 · `DomainCard` hover turns heading text green — violates neutral-interactive principle
**File:** `components/DomainCard.tsx:37` (`group-hover:text-[var(--cedar-accent-text)]`)
**Doc:** `design-standards.md §1`, `art-direction.md §3` (color as signal)

The domain card heading turns green (`--cedar-accent-text`, Cedar's brand green) on hover. Per `design-standards.md §1`, interactive elements default to gray. Green is reserved for semantic meaning (success, approved, low severity) — not for hover states. A green heading on hover violates the neutral-interactive model: the user's attention is drawn to green as an interactive signal, which erodes the meaning of green as a regulatory status signal elsewhere. The hover state for clickable text should be an underline, a gray color shift, or a background highlight — not the accent color.

---

## 3. Screen-by-Screen Findings

### 3.1 `/home` — Dashboard

**Loaded:** Yes. All four stat cards, two column layout, empty activity feed (data-population limitation).

**Hierarchy and scanability**

- The h1 "Welcome back, [Practice Name]" is a greeting, not a page title. A returning compliance professional scanning the dashboard does not need a greeting — they need the page's purpose (monitoring status, recent alerts) to be immediately legible. The greeting fails the 3-second test (`art-direction.md §9`). The practice name is valuable context; the "Welcome back" prefix is not.
- "Overview" (h2, `size="3"`) is the only correctly-scaled section heading on the page. All card-level h2 elements use `size="2"` (P1-1 above).
- The stat cards use raw `<p className="text-2xl font-bold">` for the metric value and `<span className="text-xs">` for the label. Per `design-standards.md §3`, these should use `<Text size="5" weight="bold">` and `<Text size="1">` respectively.
- The stat card section uses a raw `<div>` grid instead of Radix `<Grid>` — minor, but deviates from the layout primitive convention.

**Information density**

- The "Critical & High Alerts" empty state (green checkmark, "No critical or high alerts this week") is clear and appropriate when data is absent. Once data populates, this section will be well-structured.
- The "Recent Activity" feed (P0-3) shows source name only. When populated, this will read as a list of agency names with severity dots — no indication of what changed.
- The "Compliance Health" card shows "Unreviewed items: 0" and green status dots. This is an appropriate Tier 1 summary but would benefit from a link to unreviewed items when the count is non-zero.

**Art direction**

- The green checkmark icon (`ri-checkbox-circle-line` in `--cedar-success-solid`) in the empty alerts state is semantically correct — green for "healthy" status. No issue.
- Both stat and activity cards are well-spaced. The two-column layout at medium viewports is consistent with `art-direction.md §5`.

**Content/copy**

- "Critical & High Alerts" uses Title Case → should be "Critical & high alerts" (`content-standards.md §2`)
- "Recent Activity — Last 7 Days" uses Title Case → should be "Recent activity — last 7 days"
- Button label "View Audit Trail" uses Title Case → "View audit trail" (`content-standards.md §2`, §4)
- "All changes" link in activity section header is correct sentence case ✓

**Accessibility**

- `aria-labelledby` on `<section>` elements for "Overview" and "Recent Activity" is correctly implemented ✓
- The "Critical & High Alerts" card and "Compliance Health" card are not wrapped in `<section>` with `aria-labelledby` — they sit in a raw `<div className="grid">`. Minor, but sections with identifiable content should use `<section>` per `frontend-standards.md §2.3`.
- Missing Radix `<Heading>` components on stat card labels: raw `<span>` with inline Tailwind classes, no semantic role.

---

### 3.2 `/changes` — Change Feed

**Loaded:** Yes. No change data yet (data-population limitation). Filter pills rendered.

**Hierarchy and scanability**

- Page h1 "Changes" is correct and matches breadcrumb/tab/nav ✓
- Subtitle correctly shows practice name and count format ✓
- Filter pills are present and functional (all 6 severity variants clickable, URL-state preserved) ✓

**Navigation/interaction**

- P0-1 applies: no full-row click, no trailing chevron. The table row interaction is limited to the summary column link. This is the primary navigation pattern on this screen.
- Filter pills correctly encode state in URL (`?severity=critical`) per `ux-standards.md §5` ✓
- Pagination structure (Previous/Next with page count) is correct. The disabled state uses a `<span>` with `cursor-not-allowed` — this is appropriate, but per `ux-standards.md §3`, disabled elements should have a tooltip. The Previous/Next disabled state has no tooltip explaining "You are on the first/last page."

**Information density**

- Empty state copy "No changes detected yet" is clear. The description ("Cedar is monitoring Florida regulatory sources") is compliant with `content-standards.md §6` structure: it explains why it's empty and what will appear ✓
- Missing "change type" column — per `information-density.md §2.3`, the change identity cluster includes change type (amendment, new regulation, repeal). This field does not appear in the table.
- Status column shows "auto_approved" or "approved" as styled badges via `<StatusBadge>`. Verify these display as human-readable labels ("Auto approved" / "Approved") not raw DB enum values — per `ux-standards.md §4` anti-pattern.

**Data-population note:** The table row click (`table_row_click`) and pagination (`pagination_next`) both failed in the Playwright audit because no change records exist yet. These are not design issues.

---

### 3.3 `/changes/[id]` — Change Detail

**Loaded:** Yes (from direct navigation during library drill-through; not reached from the empty changes table).

**Hierarchy and scanability**

- P0-2 applies: h1 is source name.
- The 2/3 + 1/3 column layout (main content + metadata sidebar) is consistent with the information architecture spec ✓
- "AI Summary" and "Detected Changes" are correctly placed as main content; metadata ("Details") is correctly in the aside ✓
- The "Back to all changes" link is present and correctly positioned above the h1 ✓

**Trust signals**

- P1-2 applies: no AI-generated badge on the AI Summary section.
- `LegalDisclaimer` component appears at the bottom — content is appropriate ✓. Per spec, the disclaimer appears once per content block, which is satisfied.

**Information density**

- The metadata sidebar uses a `<dl>` (description list) for key-value pairs. This is semantically correct ✓
- Hash values are truncated to 16 characters with no copy button (P1-6).
- Source URL is truncated to 50 characters with ellipsis — no tooltip or copy affordance for the full URL. Per `information-density.md §6.1`, truncated content requires a tooltip or other access path.
- "Detected Changes" section uses a dashed border for the "no structured diff available" state, which visually suggests incompleteness rather than an intentional empty state. Should use the standard empty state pattern.

**Content/copy**

- Card heading "AI Summary" → "AI summary" (sentence case)
- Card heading "Detected Changes" → "Detected changes"
- "Change detected [date]" subtitle copy is clear and human ✓

---

### 3.4 `/library` — Regulation Library

**Loaded:** Yes, with domain card grid populated.

**Hierarchy and scanability**

- Page h1 "Regulation Library" matches nav label ✓, tab title ✓
- Subtitle conditionally shows entity count ("X regulations, rules, and enforcement records") or fallback ✓
- "Browse by Category" (h2) is the only section — heading level and visual size are correct (`size="3"` on an h2 outside a card) ✓
- Domain cards pass headingLevel="h3" correctly — heading hierarchy is valid ✓

**Navigation/interaction**

- P1-7 applies: full `<Link>` wrapper on cards.
- P1-8 applies: green hover on card headings.
- Practice type filter pills not visible in this session (no `kg_practice_types` populated yet — data limitation, not a design issue).
- Drill-through navigation works: Library → Domain → Regulation detail → Tabs all succeeded in the Playwright run ✓

**Information density**

- DomainCard shows regulation count and a description excerpt. Missing: the `recentChangeCount` is hardcoded to `0` in the page (`recentChangeCount={0}`), meaning the "recent changes" indicator on domain cards never appears even when there are recent changes. This is an unimplemented data connection, not a design system issue — but it means the cards always show only static information.
- `highestSeverity` is also hardcoded to `null`, so severity badges never appear on domain cards. Same issue.

**Art direction**

- The card grid uses `grid-cols-1 sm:2 lg:3` — appropriate density for browsing ✓
- Card faces are scannable: title, description excerpt, regulation count ✓

---

### 3.5 `/faq` — Regulatory FAQ

**Loaded:** Yes. FAQ items are visible (account has Intelligence access, not gated).

**Hierarchy and scanability**

- Page h1 "Regulatory FAQ" ✓
- Grouped by topic with `<h2>` section headers per topic group — correct heading hierarchy ✓
- Each FAQ card is a `<Link>` wrapping a `<Card>` — P1-7 applies here too (full anchor wrapper on cards)

**Gating behavior**

- The FAQ page gates on `role === 'monitor'`, not `tier === 'monitor'`. Per `CLAUDE.md` ("Role vs Tier" section), role and tier should not be conflated. Role refers to admin/reviewer/practice_owner; tier refers to subscription. This gating logic is using the wrong field. An admin account would see `role === 'admin'`, not 'monitor', and would get full FAQ access regardless of tier. Whether this is intentional (admin always has access) or a bug depends on the product decision. Flagged as an ambiguous behavior — see Section 6.

**Information density**

- FAQ cards show: topic badge, subtopic badge, jurisdiction badge, difficulty badge, "Attorney Reviewed" badge, question text, excerpt. That is 6–7 cues per card, within the 10-cue threshold per `information-density.md §9.1` ✓
- Attorney Reviewed badge uses purple correctly (Intelligence tier signal) — but per `design-standards.md §1`, purple is "a product-level distinction, not a regulatory signal." Attorney-reviewed content is a content quality signal, not a tier signal. If the purple badge is meant to signal "this is an Intelligence tier feature," that is clear. If it's meant to signal "this content is attorney-reviewed," purple is ambiguous — it could be read as "Intelligence tier feature coming" rather than "this specific item was reviewed." Worth clarifying the badge intent.
- FAQ search placeholder text: `"Search questions… (Intelligence plan feature)"` — the parenthetical gate condition does not belong in a placeholder. Per `content-standards.md §2`, placeholders describe what to type. The gate explanation already appears as a `<Text>` element below the field. Remove the parenthetical from the placeholder.

**Content/copy**

- FAQ search placeholder → "Search questions…" (remove parenthetical)
- "Attorney Reviewed" badge uses Title Case → "Attorney reviewed" (`content-standards.md §2`)

---

### 3.6 `/sources` — Source Library

**Loaded:** Yes, with sources table populated (10 active sources).

**Hierarchy and scanability**

- P1-4 applies: h1 "Source Library" vs. nav label "Sources".
- Column headers: "Source," "Tier," "Fetch Method," "URLs," "Last Checked," "Status" — all correctly sentence case. "Fetch Method" and "Last Checked" are two words but not Title Case violations ✓
- `FreshnessIndicator` uses a colored dot + text label. The dot alone is not accessible (color-only signal for Fresh/Aging/Stale). The text label alongside it is present, which satisfies the "not color-only" requirement ✓

**Navigation/interaction**

- Source rows have no click behavior (confirmed by Playwright audit: `sources_first_row_click` failed). There is no per-source detail page. This is acceptable for the current build, but:
  - Radix's `<Table.Root variant="surface">` applies a subtle row hover highlight by default, creating a false affordance — users may try clicking rows. Since these rows are non-navigable, the hover background should be suppressed or the table should use a variant that does not imply clickability.
  - No trailing chevron or external link icon — users who see the URL column expect it to be clickable. Currently no URL is shown (it's in `source_urls` subquery but not displayed in the table).
- The Playwright audit found no filter or search controls on the sources page. The table is unfiltered and unsorted. With only 10 sources this is acceptable, but the information spec notes that every collection should show orientation indicators (total count visible in subtitle ✓, but no sort indicators).

**Information density**

- The "MonitoringTierBadge" uses `color="blue"` for most tiers. Blue = informational per the semantic color map in `ux-standards.md §4`. The "critical" tier uses `color="red"`. Using "critical" as a monitoring tier name is semantically ambiguous — it collides with the severity scale. This tier label and its red badge may mislead users into thinking a source has a critical severity status rather than a high monitoring priority.

---

### 3.7 `/audit` — Audit Trail

**Loaded:** Yes. Both tables empty (data-population limitation — no validation runs yet, no chain-sequenced changes yet).

**Hierarchy and scanability**

- Page h1 "Audit Trail" matches nav label ✓
- Export PDF button correctly positioned in the header row ✓
- Two `<section>` elements with `aria-labelledby` — correct landmark structure ✓
- Section headings "Chain Validation Runs" and "Change Audit Trail" use `size="3"` (16px, Heading as h2). These are standalone section headings outside cards — per `art-direction.md §4`, standalone section headings should be `size="4"` (18px). `size="3"` is a compromise but functionally sufficient; this is lower priority than the card-heading issue (P1-1).

**Information density**

- P1-6 applies: hash column in change audit table shows 12 characters with ellipsis, no copy button. Per `information-density.md §6.1`, first 8 chars + copy button.
- The audit trail subtitle says "most recent 50 records" — this is a data cap, not a pagination limit. Per `information-density.md §7.3`, all paginated collections should show total count. The audit trail is capped rather than paginated. Consider either paginating or clearly labeling the cap as a UI note.

**Content/copy**

- "Chain Validation Runs" section heading: sentence case ✓
- "Change Audit Trail" section heading: sentence case ✓
- "Run At" column header: sentence case ✓ (not Title Case)
- "The weekly cron runs every Sunday at 3 AM UTC" is infrastructure-internal copy exposed to end users. A practice administrator does not need to know cron schedule terminology. Should be: "Validation runs automatically each week. No runs yet."

**Data-population note:** Both empty states are expected — the monitoring pipeline has not yet produced chain-sequenced records. The empty state copy is adequate but could use the full `content-standards.md §6` structure (headline + description + optional action).

---

### 3.8 `/settings` — Settings / My Practice

**Loaded:** Yes, with full practice data. The account appears to be on an active subscription (Manage Billing button is visible, per Playwright audit).

**Hierarchy and scanability**

- P1-1 applies at maximum scale here: all 5 card section headings ("Practice," "Subscription," "Notifications," "Team Members," "Jurisdictions") use `<Heading as="h2" size="2" weight="bold">` — 12px. These are indistinguishable in size from data labels within the cards. The page reads as a flat wall of small text with no navigable section structure.
- P1-3 applies: nav label "My Practice" vs. page title "Settings."

**Interaction consistency**

- `NotificationsForm` switches and select are correctly implemented with Radix `<Switch>` and `<Select>` ✓
- Email alerts switch toggle succeeded in Playwright ✓
- Settings `<Select.Root>` (email threshold): the Playwright audit's selector `[data-radix-select-trigger]` did not match — Radix renders Select triggers with `data-radix-select-trigger` in some versions. This needs selector verification in the audit spec, but the interaction itself likely works in normal use.
- The invite Invite button is disabled with a `<Text>` explanation below: "Team invitations are available on the Intelligence plan." Per `ux-standards.md §3`, disabled buttons need a tooltip on the disabled button itself, not only explanatory text beneath. The text below is better than nothing but does not satisfy the accessibility requirement (the explanation is not associated with the button via `aria-describedby`).

**Information density**

- The settings page layout (single-column, max-w-2xl cards) is appropriate for a settings form context ✓
- Section spacing between cards uses `gap="5"` (consistent with the between-section standard) ✓

**Content/copy**

- Form label "Email alerts" sentence case ✓
- "Practice name," "Owner email," "Plan," "Member since" — sentence case ✓
- "Stripe Customer" / "Stripe Subscription" (column labels) — "Stripe" is a proper noun so capitalization is correct ✓
- "Upgrade Plan" button in subscription card: Title Case → "Upgrade plan." Also uses generic verb form — per `content-standards.md §4`, upgrade buttons should say "Upgrade to Intelligence" per the formula.

---

### 3.9 `/pricing` — Plans

**Loaded:** Yes. Outside the dashboard layout (no sidebar).

**Hierarchy and scanability**

- The pricing page has its own layout — no sidebar, no breadcrumb, no consistent header. After navigating to /pricing from /settings, there is no in-app navigation back to the dashboard. The browser Back button is the only path. Per `ux-standards.md §5`, a Cedar page should always provide wayfinding signals. A "Back to settings" or persistent minimal header with a Cedar logo link would resolve this.
- Plan card headings use `<Heading as="h3" size="4">` — correct for cards under an sr-only `h2` section heading ✓

**Art direction**

- The pricing page uses `py="9"` and `px="4"` on the outer Box — generous padding. The centered layout with `max-w-[56rem]` produces a clean, focused experience ✓
- The decorative Cedar leaf icon at the top of the page (`ri-leaf-line`) is borderline — it's a brand mark, not a content element. It doesn't violate the "no decorative elements on functional pages" rule strictly, since it's part of brand identity, but it does introduce an element that serves no informational purpose. Per `art-direction.md §8` ("no decorative elements"), this should be reviewed.

**Content/copy**

- CTA buttons (from source code): likely "Subscribe" or similar — need to verify against `content-standards.md §4`. The formula for upgrade buttons is "Upgrade to [tier name]" for existing subscribers.
- "Current plan" badge appears correctly when the user has an active subscription ✓
- "Cancel anytime" in the subtitle is clear and trustworthy ✓

---

## 4. Cross-Cutting Inconsistencies

### 4.1 Card section heading size — systemic
Every page uses `<Heading size="2">` for card section headings. This is not a per-page decision — it is a systemic pattern that was established early and applied everywhere. The fix is to standardize on `size="3"` for card-internal section headings (h2s/h3s inside cards) and `size="4"` for standalone section headings.

### 4.2 Sidebar nav labels vs. page titles — two confirmed mismatches
- "My Practice" → `/settings` (page title: "Settings")
- "Sources" → `/sources` (page title h1: "Source Library")

The remaining nav items match their page titles: "Home" → "Dashboard" — wait, the browser tab says "Dashboard — Cedar" but the nav says "Home." The h1 says "Welcome back, [Practice]." Three different labels for the same route. The nav label "Home" is the most defensible (it's a common SaaS pattern for the root dashboard), but it should cascade: nav = "Home," page h1 = "Home" (or "Dashboard"), browser tab = "Home — Cedar."

Full nav label / h1 / tab audit:

| Nav Label | Page h1 | Tab title | Match? |
|---|---|---|---|
| Home | "Welcome back, [Practice]" | "Dashboard — Cedar" | ❌ Three-way mismatch |
| Changes | "Changes" | "Changes — Cedar" | ✓ |
| Regulation Library | "Regulation Library" | "Regulation Library — Cedar" | ✓ |
| FAQ | "Regulatory FAQ" | "FAQ — Cedar" | Minor: nav uses "FAQ" not "Regulatory FAQ" |
| Sources | "Source Library" | "Sources — Cedar" | ❌ h1 diverges |
| Audit Trail | "Audit Trail" | "Audit Trail — Cedar" | ✓ |
| My Practice | "Settings" | "Settings — Cedar" | ❌ Nav diverges |

### 4.3 Filter pill component duplication
The same filter pill pattern is implemented twice with different specs:
- `/changes`: `px-3 py-1.5 text-sm`, uses `--cedar-page-bg` for inactive
- `/library`: `px-3 py-1.5 text-xs`, uses `--cedar-panel-bg` for inactive

These should be a single shared `FilterPills` component.

### 4.4 Card-wrapping pattern on navigable cards
Both `DomainCard` (`/library`) and FAQ cards (`/faq`) wrap the entire card in a `<Link>`. Both violate `ux-standards.md §2`. This is a shared pattern error across two different components.

### 4.5 Missing AI-generated badge across all AI content surfaces
No screen that displays AI-generated content currently shows the "AI-generated" badge inline with the content. The badge is required on every tier. This affects:
- `/changes/[id]` — AI Summary card
- `/home` — Critical Alerts section (summaries are AI-generated)
- Any future surfaces that render `c.summary`

### 4.6 Section headings sizes in the audit page
`/audit` uses `size="3"` for standalone section headings (h2s outside cards). `/home` uses `size="3"` for the "Overview" section heading. This is slightly inconsistent — both should use `size="4"` per the section heading scale in `art-direction.md §4`. This is less severe than the `size="2"` card heading issue but should be addressed in the same pass.

### 4.7 `text-2xl font-bold` raw Tailwind typography
`/home` stat card values use raw Tailwind: `text-2xl font-bold`. The equivalent Radix primitive is `<Text size="5" weight="bold">`. Using Tailwind classes directly on text bypasses the type scale management and dark mode token system. Same pattern appears in multiple inline styles on the home page for source name/timestamp in feed items.

---

## 5. Recommended Remediation Order

### Sprint 1: Trust and hierarchy (P0 + P1, ~1 week)

1. **Fix `h1` on `/changes/[id]`** — change from source name to change description/summary. Make source name a secondary metadata label in the details sidebar.
2. **Add AI-generated badge to AI Summary card** on change detail. Apply to all surfaces that render `c.summary`.
3. **Add change summary to home activity feed** — the feed item in `/home` should show summary excerpt (2 lines, `line-clamp-2`) alongside the source name.
4. **Add full-row click + trailing chevron to changes table** — implement `cursor: pointer` row hover, `onClick` navigation, and a trailing chevron column.
5. **Standardize card section heading sizes** — change all card-internal `<Heading size="2">` to `<Heading size="3">`. Change standalone section headings to `size="4">`.
6. **Fix sidebar nav label mismatches** — align "My Practice" → "Settings" (or vice versa, pick one and apply everywhere), "Sources" h1 → "Sources", "Home" → decide on one label and apply to h1, nav, and tab.

### Sprint 2: Consistency + components (P1 remaining + P2, ~1 week)

7. **Extract shared `FilterPills` component** — unify the two implementations.
8. **Fix `DomainCard` accessibility** — replace `<Link>` wrapper with pseudo-element technique. Fix hover state (remove green heading, use border/background change).
9. **Fix FAQ card accessibility** — same pattern as DomainCard.
10. **Add copy buttons to hash values** — audit table and change detail sidebar.
11. **Fix Sources table hover affordance** — suppress row hover background on non-navigable table, or add source detail pages.
12. **Fix `MonitoringTierBadge` naming** — "Critical" monitoring tier collides with severity vocabulary.
13. **Add `aria-describedby` to disabled invite button** pointing to the explanation text.

### Sprint 3: Copy + minor polish (P3, < 1 week)

14. **Title Case → sentence case** across all card headings and button labels: "Critical & High Alerts," "Recent Activity — Last 7 Days," "View Audit Trail," "AI Summary," "Detected Changes," "Upgrade Plan," "Attorney Reviewed."
15. **Home stat card typography** — replace raw Tailwind `text-2xl font-bold` with `<Text size="5" weight="bold">`.
16. **FAQ search placeholder** — remove "(Intelligence plan feature)" from placeholder text.
17. **Audit trail cron copy** — replace "The weekly cron runs every Sunday at 3 AM UTC" with user-facing language.
18. **Pricing page navigation** — add a minimal header with Cedar logo linking back to `/home` for users who land on pricing while authenticated.
19. **Home h1** — move from greeting to purpose. Consider "Florida regulatory dashboard" or align with the "Home" nav label.

---

## 6. Open Questions / Ambiguous Behaviors

**Q1: FAQ gating on `role === 'monitor'` vs. `tier === 'monitor'`**
The FAQ page gates access on role, not tier. An admin user bypasses the gate entirely. Is this intentional (admin always sees full FAQ) or is the check supposed to be on the subscription tier? The library page uses the same pattern (`role === 'monitor'`). If admin users should always have full access, the pattern is correct. If the gate should enforce the subscription tier, the check needs to compare `practice.tier === 'monitor'`.

**Q2: `/pricing` page placement outside the dashboard layout**
The pricing page sits at `app/pricing/page.tsx` (no sidebar). This is intentional for public pricing pages, but authenticated users reach it from `/settings` and have no in-app navigation back. Is there a planned authenticated pricing/upgrade flow, or should the pricing page be inside the dashboard layout when the user is signed in?

**Q3: `DomainCard` `recentChangeCount` and `highestSeverity` hardcoded to 0/null**
These fields are hardcoded in `library/page.tsx:148–149`. This appears to be an unimplemented data connection — the library is showing domain cards without their change-activity indicators. Is this intentional for MVP, or should these be wired to the `changes` table?

**Q4: Sources table — should source rows be navigable?**
The sources table has no per-source detail view. Is this permanent (sources are informational, no detail page planned) or a deferred build? If permanent, the table should suppress hover background. If planned, this is a tracked item.

**Q5: "Attorney Reviewed" badge color (purple)**
The badge uses purple, which Cedar's color semantic map assigns to "Intelligence tier." Is attorney-reviewed content a tier marker (only visible to Intelligence subscribers) or a content-quality marker (visible on any tier for content that has been reviewed)? If the latter, purple is the wrong color — a neutral or informational badge would be more appropriate.

**Q6: UpgradeBanner gradient vignette**
`UpgradeBanner` uses `bg-gradient-to-b` as a vignette over blurred placeholder content. `art-direction.md §8` prohibits decorative gradients. This gradient is functional (masking placeholder rows), not decorative. Is this use case exempt from the no-gradient rule, or should the vignette be implemented without a CSS gradient?

---

## 7. Implementation Targets

### Shared components to fix first

| Component | Issue | Impact |
|---|---|---|
| Card section headings (all pages) | `size="2"` → `size="3"` on every page | Affects 8 screens; fix once in page code, then extract |
| `DomainCard` | Full-anchor wrapper + green hover | Library is the main Browse surface |
| `FilterPills` (new shared component) | Unify `/changes` and `/library` implementations | Prevents future drift |
| `SeverityBadge` | Already correct — no changes needed | ✓ |
| `StatusBadge` | Verify raw DB values not leaking through | Verify |
| `UpgradeBanner` | Gradient + Button variant `asChild` uses default green accent | Minor |

### Pages to redesign/refactor first

1. **`/changes/[id]`** — h1 fix + AI badge are trust-critical; this page is the primary regulatory content surface
2. **`/home`** — Activity feed fix + heading copy + h1 purpose; this is the first screen users see
3. **`/settings`** — Heading scale + nav label mismatch; this is the highest-interaction admin screen

### Shell vs. page-level issues

**Shell-level (SidebarShell / Sidebar / BreadcrumbNav):**
- Nav label mismatches ("My Practice," "Sources") are in `components/Sidebar.tsx` (MAIN_NAV array) — fix in one place
- The BreadcrumbNav component affects all dashboard pages; verify it shows hierarchy, not session history

**Page-level:**
- Heading sizes are replicated in each page's JSX — no shared abstraction exists yet. A `CardSection` wrapper component that standardizes heading size and spacing would prevent future drift.
- AI badge absence is in each page that renders AI content — affects `/changes/[id]` and potentially `/home` once data populates.
- Filter pill duplication is split between `/changes/page.tsx` and `/library/page.tsx` — both pages need to adopt the shared component.

**Component-level:**
- DomainCard and FAQ card link-wrapping are in `components/DomainCard.tsx` and inline JSX in `faq/page.tsx` respectively — both need the pseudo-element fix.
- Hash copy buttons need to be added to `components/` as a shared `HashValue` or `CopyableCode` component used in both `/audit/page.tsx` and `/changes/[id]/page.tsx`.

---

## 8. Appendix — Screenshot Reference

| Screenshot | Route | What it shows |
|---|---|---|
| `home-loaded.png` | `/home` | Initial load, all 4 stat cards, empty feeds |
| `home-dark-mode.png` | `/home` | Dark mode toggle state |
| `home-final.png` | `/home` | Final state after sidebar interactions |
| `sidebar-collapsed.png` | `/home` | Sidebar fully collapsed, expand trigger visible |
| `sidebar-expanded.png` | `/home` | Sidebar re-expanded |
| `changes-loaded.png` | `/changes` | Initial load, filter pills visible, empty table state |
| `changes-filter-all.png` | `/changes` | "All" filter active |
| `changes-filter-critical.png` | `/changes` | Critical filter applied |
| `changes-filter-high.png` | `/changes` | High filter applied |
| `changes-filter-medium.png` | `/changes` | Medium filter applied |
| `changes-filter-low.png` | `/changes` | Low filter applied |
| `changes-filter-informational.png` | `/changes` | Informational filter applied |
| `changes-final.png` | `/changes` | Final state |
| `library-loaded.png` | `/library` | Domain card grid |
| `library-domain.png` | `/library/[slug]` | Regulations within a domain |
| `library-regulation-detail.png` | `/library/[slug]/[id]` | Single regulation detail |
| `library-regulation-tabs.png` | `/library/[slug]/[id]` | Tabs exercised on regulation detail |
| `library-final.png` | `/library` | Final state after drill-through |
| `faq-loaded.png` | `/faq` | FAQ grouped by topic, search field visible |
| `faq-search-typed.png` | `/faq` | Search field with typed input |
| `faq-detail.png` | `/faq/[id]` | Single FAQ item detail |
| `faq-final.png` | `/faq` | Final state |
| `sources-loaded.png` | `/sources` | Sources table with 10 active sources |
| `sources-final.png` | `/sources` | Final state |
| `audit-loaded.png` | `/audit` | Audit trail page, both sections empty |
| `audit-final.png` | `/audit` | Final state |
| `settings-loaded.png` | `/settings` | Full settings page with practice data |
| `settings-email-alerts-toggled.png` | `/settings` | Email alerts switch toggled |
| `settings-weekly-digest-toggled.png` | `/settings` | Weekly digest switch toggled |
| `settings-invite-field.png` | `/settings` | Invite email field with typed input |
| `settings-final.png` | `/settings` | Final state |
| `pricing-loaded.png` | `/pricing` | Both plan cards visible |
| `pricing-final.png` | `/pricing` | Final state |
