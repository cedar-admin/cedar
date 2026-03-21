# Cedar UX & Interaction Standards

> **Purpose.** This document governs behavioral and interaction decisions — how the interface feels to use, what happens when a user interacts with something, and what consistency means across similar contexts. Read this before every frontend change alongside `design-standards.md` (visual decisions) and `frontend-standards.md` (structural/semantic decisions).
>
> **Audience.** An AI coding agent (Claude Code) that has perfect recall but zero intuition about what "feels right" to a human user. Every rule here is explicit about things a human designer would consider obvious.
>
> **When to consult.** Before building any new component, page, or interaction. Before modifying any existing interaction pattern. During code review of any frontend change.

---

## Document boundary map

| Concern | Governing document |
|---|---|
| Color tokens, component variants, spacing scale, typography, badge colors, button styles, animations | `design-standards.md` |
| Heading hierarchy, landmarks, ARIA attributes, keyboard focus management, responsive breakpoints | `frontend-standards.md` |
| **What happens when a user clicks, hovers, scrolls, filters, navigates, or waits — and how those behaviors stay consistent across pages** | **This document** |

---

## §1 Component purpose and intent

### Principle

Every component exists to serve a user task. The AI agent must identify that task before writing any code. Components built in isolation — without considering what the user is trying to accomplish, what page they are on, and what patterns already exist — produce inconsistency and confusion. Purpose is the single most important input to every interaction decision.

### The purpose questions

Before building anything, answer these four questions in order:

1. **What is the user trying to accomplish here?** Identify the primary task from this list: find a specific item, compare items across attributes, view or edit a single record, take action on one or more records, monitor status, or configure settings.
2. **What information do they need to accomplish it?** This determines information density. A monitoring dashboard needs high density. A settings form needs low density. A regulation detail view needs medium density with progressive disclosure.
3. **What action should they be able to take?** This determines which interactive affordances appear: navigation targets, selection checkboxes, action buttons, inline editing, or nothing (read-only).
4. **Does this pattern already exist in the codebase?** Search for every existing implementation of the same pattern before creating anything new. If a regulation-list page already exists, a new regulation-list page must match it exactly.

### Purpose drives component selection

| User task | Component | Cedar example |
|---|---|---|
| Browse a categorized library, visually scan self-contained items | Card grid | Regulation library organized by category |
| Compare structured data across many attributes, sort and filter | Data table | Admin user list, audit log, practice management |
| Scan a chronological or priority-ordered stream of items | Feed / list | Regulatory change feed, recent activity |
| Inspect all details of a single entity | Detail view (full-page or slide-over) | Individual regulation detail, change detail |
| Configure key-value settings | Settings form | Practice settings, account settings |
| Get a status overview with summary metrics | Dashboard | Home dashboard with metric cards and activity feed |

**Never use a card grid when comparison across multiple attributes is the primary task.** Cards force users to spatially reorient for every item, making comparison cognitively expensive. Use a table instead. Cards are for browsing self-contained items where visual scanning matters more than cross-item comparison.

**Never use a table when the primary task is browsing a library of categorized, self-contained items.** Tables reduce items to rows, stripping the visual identity that helps users browse. Use cards instead.

### Purpose drives information density

Match density to the page's purpose, not a universal aesthetic preference. Enterprise users develop spatial memory for dense interfaces — hiding information to achieve visual minimalism harms their efficiency. Progressive disclosure balances density with comprehension: show high-level snapshots first (dashboards and card faces), then drill into detail views.

- **High density**: Monitoring dashboards, audit logs, admin tables — users need many data points visible simultaneously
- **Medium density**: Collection/browse views, regulation detail — primary content prominent, secondary content accessible via progressive disclosure
- **Low density**: Settings forms, onboarding flows, confirmation dialogs — focused attention on a single task

### Anti-patterns

- Building a component without first identifying the user's task
- Choosing a card grid for data that users need to compare across attributes
- Choosing a table for content that users browse visually (image-heavy, categorized library items)
- Creating a new component pattern when an identical one already exists on another page
- Reducing information density for aesthetics in contexts where users need that information to do their job

---

## §2 Clickable collections and navigation targets

### Principle

When a collection of items serves as a navigation structure — users click items to drill into detail — every item in that collection must behave identically, and every collection of the same type across the entire application must use the same interaction pattern. Three different table pages with three different click-to-navigate patterns is the defining failure this section prevents.

### Table rows as navigation targets

**When a table row navigates to a detail view, follow all of these rules:**

1. **Full-row clickability.** The entire row is a single click target that navigates to the detail view. Do not limit the click target to a single cell or a link within a cell.
2. **Cursor.** `cursor: pointer` on the entire row on hover.
3. **Hover state.** Subtle background color change on the entire row. This serves double duty: scanning aid (helps users track across columns) and interactivity signal.
4. **Trailing chevron.** Place a right-pointing chevron (`›` or chevron icon) in the last column of every navigable row as a visual affordance that the row navigates somewhere. This chevron is a hint, not the sole click target.
5. **Accessible markup.** Use a semantic `<tr>` with an `onClick` handler. Place a visually hidden `<a>` or use `data-primary-link` on the primary link element inside the row so assistive technologies can discover the navigation target. Each row must have an accessible name derived from its primary identifier (first column content).
6. **Keyboard.** Rows are focusable. Enter activates navigation. See §12 for full keyboard patterns.

### Card grids as navigation targets

**When a card navigates to a detail view:**

1. **Full-card clickability.** Use the pseudo-element technique: the card's heading link gets a `::after` pseudo-element with `position: absolute; inset: 0` covering the entire card surface. This makes the full card clickable without wrapping everything in an `<a>` tag.
2. **Secondary actions.** Any secondary interactive elements (buttons, dropdowns) inside the card get `position: relative; z-index` above the pseudo-element overlay so they remain independently clickable.
3. **Hover state.** Subtle border color change or background highlight on the entire card. Do not use elevation/shadow changes as the sole hover indicator — shadows are indistinguishable when cards are tightly grouped.
4. **Cursor.** `cursor: pointer` on the entire card surface.
5. **Accessible name.** The heading link provides the accessible name. Do not wrap the entire card in `<a>` or `<button>` — screen readers would read the entire card content as a single link name, creating an inaccessible experience lasting 25+ seconds per card.

### Feed and list items as navigation targets

Apply the same full-surface clickability rules as cards. Each feed item that navigates to a detail view gets full-item click targeting, hover background change, `cursor: pointer`, and a trailing chevron or arrow affordance.

### Mixed-content rows: navigation plus secondary actions

When a row has both a primary navigation target AND secondary interactive elements (a status dropdown, an action button, a menu):

1. **Separate click targets spatially.** The primary click area (row body) navigates. Secondary controls occupy their own distinct click targets.
2. **Stop propagation.** Secondary interactive elements must call `event.stopPropagation()` to prevent the row's navigation handler from firing when the user clicks a secondary control.
3. **Visual separation.** Secondary controls should have visible boundaries (button styling, dropdown chrome) so users can distinguish them from the row's navigation surface.

### Selection plus navigation on the same collection

When a collection needs both "click to navigate" and "click to select for bulk actions":

1. **Checkbox column handles selection.** Place checkboxes in the first column. Clicking the checkbox selects the row. Clicking anywhere else on the row navigates to the detail view.
2. **Shift-click for range selection.** Support selecting a range of rows by holding Shift and clicking a second checkbox.
3. **Bulk action toolbar.** When one or more items are selected, display a toolbar above the collection showing the selection count and available bulk actions.
4. **Header checkbox states.** Empty (none selected), indeterminate/dash (some selected), checked (all on current page selected).
5. **Selection persistence.** Selection persists across pagination but resets when filter criteria change. Selection persists during text search.

### The consistency rule

**All collections of the same component type across the entire application must use the same interaction pattern.** If one table has full-row clickability with trailing chevrons, every navigable table must have full-row clickability with trailing chevrons. If one card grid uses full-card click targeting, every navigable card grid must do the same. No exceptions.

### Anti-patterns

- Different click behaviors on different table pages (one with row click, another with link-in-cell only)
- Wrapping an entire card or row in `<a>` or `<button>` (destroys semantics, catastrophic for screen readers)
- Using `cursor: pointer` on non-interactive elements (misleads users)
- Missing hover states on interactive rows or cards
- Mixing click-to-select and click-to-navigate on the same click target without spatial separation
- A "Select All" checkbox that includes disabled rows
- Navigable rows without any visual affordance (no chevron, no hover state)

---

## §3 Hover and active state consistency

### Principle

Hover and active states are the primary channel through which users discover what is interactive. Inconsistent hover behavior — some clickable things light up, others do not — teaches users to distrust the interface. Every interactive element must have a hover state. No non-interactive element should have a hover state that implies clickability.

### What gets a hover state

| Element type | Hover state | Cursor |
|---|---|---|
| Buttons (all variants) | Background/color shift per design-standards.md | `pointer` |
| Clickable table rows | Row background highlight | `pointer` |
| Clickable cards | Border color change or background highlight | `pointer` |
| Links | Underline or color change per design-standards.md | `pointer` |
| Feed/list items (navigable) | Background highlight | `pointer` |
| Dropdown triggers, select inputs | Border color change | `pointer` |
| Checkboxes, radio buttons, toggle switches | Highlight ring or border emphasis | `pointer` |
| Non-interactive table rows | Subtle background change (scanning aid only) | `default` |
| Static text, labels, headings | None | `default` |
| Disabled elements | No visual change | `not-allowed` |
| Informational tooltips (non-interactive) | None | `default` or `help` |

**Row hover is always enabled** — even for non-interactive tables. Row hover serves as a scanning aid that helps users visually track across columns. This is distinct from the `cursor: pointer` that indicates clickability.

### Hover coverage

Hover state must cover the full interactive surface, not a subset. A clickable card's hover state covers the entire card, not just the heading. A clickable row's hover state covers the entire row, not just one cell. A button's hover state covers the entire button, not just the text.

### Active and pressed states

Every element that has a hover state must also have an active/pressed state — a momentary visual change when the user clicks/taps before releasing. This confirms that the click registered. Active states are typically a slightly darker or more saturated version of the hover state.

### Nested interactive elements

When a secondary interactive element (button, dropdown) lives inside a hoverable container (card, row):

1. The container shows its hover state when the cursor is anywhere on the container.
2. When the cursor moves over the nested element, the nested element shows its own hover state. The container's hover state may remain visible or dim slightly — it must not disappear entirely.
3. The nested element handles its own cursor (typically `pointer`).
4. Click events on the nested element do not propagate to the container (see §2).

### Disabled state interaction

Disabled elements must be visually distinct (reduced opacity, `cursor: not-allowed`). **Disabled elements should display a tooltip explaining why they are disabled** (e.g., "You don't have permission to perform this action" or "Complete the required fields first"). Since native disabled elements do not fire hover events, wrap the disabled element in a `<span>` that can receive hover and show the tooltip. The tooltip must also be keyboard-accessible via focus on the wrapper.

### Anti-patterns

- Interactive elements without hover states
- `cursor: pointer` on non-interactive elements (informational tooltips, static text, decorative icons)
- Hover states that cover only part of the interactive surface (text-only hover on a full-card click target)
- Missing active/pressed states — click feels unresponsive
- Disabled elements with no explanation of why they are disabled
- Inconsistent cursor types: some clickable rows use `pointer`, others use `default`

---

## §4 Visual identity consistency

### Principle

When the same data element appears in different locations across the application, it must have identical visual treatment. A "Critical" severity badge must be the same color, the same shape, and the same label whether it appears in a table cell, a card, a detail view header, or a feed item. Users build recognition patterns — changing the visual identity of a concept between locations breaks recognition and erodes trust.

### The identity rule

**Same data = same presentation everywhere.** Specifically:

1. **Status badges** (Active, Inactive, Pending, etc.) use the same Badge component with the same `variant` and `color` props in every location they appear.
2. **Severity indicators** (Critical, High, Medium, Low) use the same color mapping and icon in every location.
3. **Role labels** (Admin, Staff, Viewer) use the same badge treatment everywhere.
4. **Category tags** use the same color and style everywhere.

### Semantic color mapping

Never choose a status color ad hoc. Use this fixed semantic mapping:

| Semantic meaning | Color token | Usage |
|---|---|---|
| Error, danger, critical | Red | Failed, rejected, expired, critical severity, destructive actions |
| Warning, caution | Yellow/amber | Pending review, expiring soon, medium severity |
| Success, healthy, active | Green | Completed, active, approved, low severity |
| Informational, in progress | Blue | In progress, informational notices, links |
| Neutral, draft, unknown | Gray | Draft, archived, not started, unknown status |

**Red is exclusively for danger and error.** Never use red for a non-destructive primary CTA. Never use green for an error state. Never use the same color for two semantically different statuses on the same page.

### Contextual size differences

Size and density may vary by context — a badge in a dense table cell may be smaller than the same badge in a detail view header. **When size changes, these must remain identical:**

- Color token (same semantic color)
- Shape (same border-radius, same fill mode)
- Icon (same icon, if present)
- Label text (same human-readable label)

The only things that may change are: font size, padding, and overall dimensions. Use a `size` prop (e.g., `"sm"` in tables, `"md"` in detail views) rather than creating a separate component.

### When visual variation IS appropriate

Variation is appropriate only when the underlying concept is genuinely different:

- A notification badge (numeric count on a nav item) is a different component from a status badge (semantic label on a record) — they may look different.
- Icon-only indicators in a dense summary view versus labeled badges in a detail view — the icon and color must still match, but the label may be omitted in the compact version.
- Different indicator types for different purposes: icon indicators for system health, shape indicators for workflow status — as long as each type is internally consistent.

**Variation is never appropriate** for the same status value rendered in two locations. If "Pending Review" is a yellow badge on the regulations list page, it must be a yellow badge on the regulation detail page, on the change feed, and on the dashboard.

### Anti-patterns

- Same status, different color in different locations
- Same role, different badge style on different pages
- Ad hoc color choices for new status values without consulting the semantic color map
- Creating a new badge component instead of reusing the existing one with a size prop
- Displaying a raw database value (PENDING_REVIEW) in one location and a formatted label (Pending Review) in another

---

## §5 Navigation and wayfinding

### Principle

Users must always know where they are, how they got there, and how to get back. In a SaaS platform with persistent sidebar navigation, wayfinding is achieved through the combination of sidebar active state, page title, breadcrumbs (when deep enough), and URL. Every navigation action must update all of these signals simultaneously.

### Back navigation decision framework

| Pattern | When to use | When to avoid |
|---|---|---|
| **Breadcrumbs** | Hierarchical IA with 3+ levels; users arrive via deep links; users need to orient within hierarchy | Flat structures (1-2 levels); linear flows |
| **Explicit back button** | Drill-down from list to detail view; slide-over panels where browser back may not work; contextual return (e.g., "Back to Regulations") | When breadcrumbs already serve the same purpose |
| **Browser back** | Standard page-to-page navigation at the same hierarchy level | SPAs without scroll restoration; modals and drawers that do not create history entries |

In Cedar's navigation model (persistent sidebar + page content), the sidebar handles top-level navigation. Breadcrumbs are needed when a user drills from a sidebar section into nested content (e.g., Regulations → Category → Individual Regulation). For list-to-detail navigation, use an explicit "Back to [List Name]" link above the page title.

### Breadcrumb rules

1. Show site hierarchy, never session history.
2. Include current page as the last item, visually distinguished and not linked.
3. Every item except the current page must be a clickable link to a real page.
4. Use `>` as separator.
5. Start with the section root, not the application root (the sidebar already provides top-level navigation).
6. Do not wrap across multiple lines. On mobile, show only the parent link.

### Slide-over panels vs. full-page navigation

| Container | Use for | Avoid for |
|---|---|---|
| **Slide-over panel** | Viewing a record's details while keeping the list visible; quick edits; sub-tasks that benefit from parent page context | Complex multi-step flows; tasks requiring the user's full attention; stacking more than 2 panels |
| **Full page** | Complex workflows; content requiring full attention; pages users may want to bookmark or share | Quick previews; maintaining context of the parent list |
| **Modal dialog** | Confirmations; destructive action warnings; single focused decisions | Complex forms; data comparison; multi-step wizards; error messages |

In Cedar: Regulation detail, change detail, and entity inspection views should open as slide-over panels when accessed from a list context, preserving the user's list position. Settings pages, admin management pages, and export workflows should be full pages.

**Never nest modals.** One modal should never trigger another modal. **Never put wizards or tabbed navigation inside modals.**

### Current location indicators

Five signals must be consistent at all times:

1. **Sidebar active state** — the current section is highlighted in the sidebar
2. **Page title** — descriptive, matches breadcrumb terminal item
3. **Breadcrumbs** — show hierarchical path (when applicable)
4. **Browser tab title** — unique and descriptive (e.g., "Regulation Detail — Cedar")
5. **URL** — human-readable, reflects the current state

### URL as UX

**Heuristic: if someone else clicking this URL should see the same state, it belongs in the URL.**

| URL component | Encode in URL | Cedar example |
|---|---|---|
| Path segments | Resource identity | `/regulations/reg-123`, `/admin/users` |
| Query parameters | Filters, sorting, pagination, search terms, tab state, view mode | `?status=active&sort=date&page=2` |
| Hash fragments | In-page anchors | `#section-requirements` |

**Do not encode in the URL:** Modal visibility, hover states, tooltip state, authentication tokens, ephemeral UI transitions.

**History management:** Use `pushState` for navigation actions (changing filters, pagination, navigating to a new view) so Back returns to the previous state. Use `replaceState` for refinements (search-as-you-type, debounced input) to avoid flooding browser history with every keystroke.

### Anti-patterns

- No visible indication of current location (user cannot tell which page they are on from a screenshot)
- Breadcrumbs that show session history instead of site hierarchy
- Slide-over panels without a clear close affordance (X button, Escape key, clicking the background "alley")
- URLs that do not update when filters, pagination, or tabs change (state lost on refresh or share)
- Using `pushState` for every keystroke of a search input (floods browser history)
- Nested modals
- Wizard flows inside modals

---

## §6 Information hierarchy and progressive disclosure

### Principle

Users should see the most important information first and access details on demand. Progressive disclosure reduces cognitive load for initial scanning while keeping advanced information accessible. The hierarchy must be consistent: what is "summary" and what is "detail" for a given entity type does not change between locations.

### Summary to detail pattern

Every entity in Cedar has two information tiers:

**Summary tier (card face, table row, feed item):**
- Primary identifier (regulation name, change title, user name)
- Key status indicator (active/inactive, severity, acknowledgment status)
- 1-2 critical metrics or attributes (effective date, category, practice)
- Primary affordance (navigation chevron, primary action button)

**Detail tier (slide-over panel, full page):**
- All summary tier content (never hide summary content in the detail view)
- Full attribute set, key-value metadata panels
- History, audit trail, activity log
- Secondary actions (export, archive, edit, admin controls)
- Related entities and cross-references

### Table column decisions

- **Always visible columns:** Primary identifier (first column, left-aligned), key status badge, most-referenced metric, action column or navigation chevron (last column)
- **Hideable columns:** Timestamps (unless the table's purpose is time-based auditing), secondary IDs, metadata fields, rarely-referenced attributes
- **Column order:** Primary identifier → status → most important attributes left to right → secondary attributes → actions (last)

### Empty states

Three distinct empty states require different treatments. Never conflate them:

| State | Messaging pattern | Action |
|---|---|---|
| **First use** (no data created yet) | Encouraging: "No regulations tracked yet. Add your first regulation to get started." | Primary CTA to create/add |
| **No filter results** (filters returned nothing) | Acknowledge the filter: "No regulations match your current filters." | "Clear filters" button |
| **Error loading** (system failure) | Explain: "Unable to load regulations. Please try again." | Retry button, support link |

**Never show "No records" while data is still loading.** This is the single most harmful empty-state anti-pattern in enterprise applications. Use a loading skeleton until the request completes, then show the appropriate empty state only after confirming no data exists.

### Loading states

1. **Skeleton screens** must match the final loaded layout exactly to prevent cumulative layout shift (CLS). Represent the visual hierarchy — do not create individual skeletons for every small element.
2. **Static elements that do not change** (page title, column headers) should render immediately, not as skeletons. Only use skeleton placeholders for dynamic content.
3. **Use `aria-busy="true"`** on the container element that is loading. Skeleton elements themselves are decorative and should be hidden from screen readers.
4. **Use wave/shimmer animation** (left-to-right) for skeleton screens — research shows this is perceived as shorter than pulsing opacity.
5. **Loading hierarchy:** Page-level progress bar (top of frame) → skeleton page (initial load) → inline spinner (component-level refresh) → subtle inline loading indicator (background data fetch).

### Truncated content

| Pattern | When to use |
|---|---|
| **Tooltip on hover/focus** | Table cells, badge labels, IDs — short text that should not disrupt layout |
| **Expand-in-place** ("Show more") | Descriptions, notes, long text that should remain in reading flow |
| **Click-to-detail** (navigate to detail view) | Rich content requiring full-page context; content users may want to bookmark |

All truncated text must remain available to screen readers via `aria-label` with the full text or an accessible tooltip that appears on focus (not just hover).

### Anti-patterns

- Card face showing all 15 attributes of an entity (no progressive disclosure)
- Detail view missing information that was visible on the summary card
- Skeleton screen that does not match the final layout (causes layout shift on load)
- "No records" message displayed during loading before request completes
- Truncated text with no mechanism to access the full content
- Inconsistent summary content: a regulation card shows severity on the browse page but not in the feed

---

## §7 Data formatting and display consistency

### Principle

Every piece of data displayed to the user must go through a shared formatting utility. No inline string manipulation. No ad-hoc `new Date().toLocaleDateString()` calls. No manual comma insertion. One formatting function, used everywhere, producing identical output for identical input. This is non-negotiable.

### Date and time formatting

**Context determines format:**

| Context | Format | Example |
|---|---|---|
| Activity feeds, change feed, notifications | Relative (< 7 days), absolute beyond | "5 hours ago" → "Mar 15, 2026" |
| Table columns | Absolute, short date or short datetime | "Mar 21, 2026" or "Mar 21, 2026, 2:32 PM" |
| Detail views, metadata panels | Absolute full datetime | "March 21, 2026, 2:32 PM EST" |
| Audit logs, compliance records | Absolute with timezone, unambiguous | "March 21, 2026, 14:32:35 UTC" |

**Relative time thresholds:**
- 0-59 seconds → "Just now"
- 1-59 minutes → "{n} minutes ago"
- 1-23 hours → "{n} hours ago"
- 1-6 days → "{n} days ago"
- 7+ days → absolute format per context

**Always** wrap dates in a `<time>` HTML element with an ISO 8601 `datetime` attribute. **Always** provide the absolute timestamp in a `title` attribute so it appears on hover. **Never** abbreviate month names in detail views — use "January" not "Jan". Abbreviations are acceptable in table columns where space is constrained.

### Number formatting

Use `Intl.NumberFormat` for all number formatting. Never insert commas manually.

- **Standard display:** `Intl.NumberFormat('en-US').format(n)` → "1,234"
- **Compact notation** (dashboards, cards): `Intl.NumberFormat('en-US', { notation: 'compact' }).format(n)` → "1.2K", "3.5M"
- **Currency:** `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)` → "$1,234.00"
- **Percentage:** `Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(n / 100)` → "85.3%"
- **Numeric table columns** must be right-aligned with consistent decimal places within the same column.

### Phone numbers

Use hyphens: `555-555-5555`. For international display: `+1 (555) 555-5555`. Store in E.164 format, display through a shared formatter. Never use inconsistent separators (periods, spaces) across pages.

### Hash and ID display

- **Short IDs** (≤ 12 characters): display in full with monospace font.
- **Long hashes** (UUIDs, SHA hashes): truncate to first 8 characters with ellipsis (`a1b2c3d4…`). Display in monospace font.
- **Copy-to-clipboard:** Always provide a copy icon button adjacent to any truncated ID or hash. On click: copy the full value, show "Copied!" confirmation via tooltip, announce via `aria-live="polite"`.
- **Full value access:** Show the full value in a tooltip on hover/focus. In detail views, show the full value.

### Status and enum values

**Raw database values must never be displayed to users.** Transform every enum through a shared mapping utility.

```
Raw DB Value         → Display Label
PENDING_REVIEW       → "Pending review"
IN_PROGRESS          → "In progress"
ACTIVE               → "Active"
AWAITING_APPROVAL    → "Awaiting approval"
```

Transformation rules: replace underscores with spaces, apply sentence case (capitalize first word only). Map each value to its semantic badge color per §4. This mapping lives in a single shared utility, not scattered across components.

### The shared utility rule

All formatting must flow through shared utility functions. These functions are the single source of truth:

- `formatDate(date, context)` — context determines format ('feed' | 'table' | 'detail' | 'audit')
- `formatNumber(n, style)` — style: 'standard' | 'compact' | 'currency' | 'percent'
- `formatPhoneNumber(phone)`
- `truncateHash(hash, visibleChars)`
- `truncateText(text, maxLength)`
- `formatEnumLabel(rawValue)` — raw DB value → human-readable label
- `formatRelativeTime(date)` — returns relative string with absolute fallback

**Before creating any new formatting function, search the codebase for existing ones.** If an existing function handles the formatting need, use it. If it needs modification, modify the shared utility — do not create a parallel function.

### Anti-patterns

- Inline `new Date().toLocaleDateString()` instead of the shared `formatDate` utility
- Manual comma insertion in numbers instead of `Intl.NumberFormat`
- Different date formats for the same context type on different pages
- Displaying `PENDING_REVIEW` or `pending_review` or `pendingReview` to users
- Creating a new formatting function when an identical one exists in `/utils/format`
- Truncating a hash to different lengths on different pages
- Relative timestamps without an accessible absolute time fallback

---

## §8 Feedback and system communication

### Principle

Every user action must produce visible, immediate feedback. Users should never wonder whether their action succeeded, failed, or is still processing. The feedback mechanism must match the severity and context of the action.

### Feedback type selection

| Feedback type | When to use | Duration |
|---|---|---|
| **Toast notification** | Success confirmations, background process completion, non-critical system messages | Auto-dismiss after 5 seconds; toasts with actions persist until dismissed |
| **Inline notification** | Field-level validation, form errors, section-specific feedback | Persists until resolved |
| **Banner** | Page-level warnings, system-wide alerts, persistent important information | Persists until dismissed or resolved |
| **Modal dialog** | Destructive action confirmations, blocking errors requiring user decision | Blocks until user acts |

**Toasts:** Keep messages to 3 words or fewer when possible ("Record saved", "Export started", "Change acknowledged"). Multiple toasts stack vertically, newest on top. **Never use toasts for error messages** — errors must persist and be visible near the error source. Use banners or inline notifications for errors.

### Error communication hierarchy

Escalation from least to most disruptive:

1. **Field-level inline.** Display error text adjacent to the field, triggered on blur (not on keystroke). Red text plus icon for accessibility. Keep visible while user corrects.
2. **Form-level summary.** On form submission failure, display a summary of all errors at the top of the form. Each error in the summary links to the corresponding field.
3. **Page-level banner.** System errors affecting the entire page. Full width, below page header.
4. **Toast.** Only for errors not tied to a specific UI element (network failures, background process errors).
5. **Modal.** Only for errors that completely block the workflow and require an immediate decision.

**Never show field validation errors before the user has attempted to interact with the field.** Premature validation is a hostile pattern. Validate on blur for individual fields, on submit for the full form.

### Destructive action confirmation escalation

| Severity | Pattern | Cedar example |
|---|---|---|
| **Low** (easily undone) | No confirmation — perform action, provide undo | Archiving a notification, removing a tag |
| **Medium** (undoable with effort) | Simple confirmation modal with danger-styled button | Removing a team member, revoking access |
| **High** (irreversible, data loss) | Confirmation modal + type-to-confirm input | Deleting a practice, purging audit records |

**Confirmation dialog rules:**
- Title and button label must name the specific action ("Delete Practice" not "Are you sure?")
- Describe what will be affected and that it cannot be undone
- Use descriptive action verbs on buttons ("Delete Practice" not "Yes")
- **Default focus on the non-destructive option** (Cancel/No) for safety
- Red/danger button styling only on the destructive action
- For type-to-confirm: the danger button is disabled until the user types the exact required string

### Optimistic updates vs. wait-for-server

- **Use optimistic updates for:** Toggle actions (acknowledge/unacknowledge), low-risk state changes where success rate is >99% and rollback is simple
- **Wait for server for:** Data creation, destructive actions, financial operations, actions with complex server-side validation, anything where a false positive would cause confusion
- **Enterprise B2B default: wait for server.** Be more conservative than consumer apps. Users expect data integrity in a compliance-focused tool. When in doubt, wait.
- Always implement rollback logic for optimistic updates. On failure: revert the UI state and show an error toast.

### Anti-patterns

- User clicks "Save" and nothing visible happens (no toast, no state change, no loading indicator)
- Error messages in toasts that auto-dismiss — user never sees the error
- Premature field validation (showing errors while the user is still typing)
- "Yes/No" buttons on confirmation dialogs instead of descriptive verbs
- Confirmation dialogs for routine, easily-undone actions (causes confirmation fatigue — users auto-click through)
- Red/danger button styling on non-destructive actions
- Default focus on the destructive button in a confirmation dialog
- Stacked/nested modals (one confirmation triggering another)

---

## §9 Sidebar and chrome behavior

### Principle

The sidebar and persistent chrome are the application's skeletal system — they provide orientation, navigation, and context. Chrome elements must appear and behave identically on every page, updating only to reflect the current location and notification state. Chrome visibility follows strict rules: visible during standard navigation, hidden only during explicitly immersive workflows.

### Sidebar structure

Cedar uses a persistent left sidebar. Follow these rules:

1. **Always visible on desktop** (≥ 1056px). Users may collapse to an icon-only rail, and this preference persists across sessions (stored in cookie or localStorage).
2. **Hidden on mobile** (< 768px). Revealed via hamburger icon as an overlay with semi-transparent backdrop. Clicking outside or navigating dismisses the overlay.
3. **Tablet** (768-1056px): collapsed to icon-only rail by default. Expands on hover or click.

### Active state

The current page's navigation item must be visually highlighted at all times. Use a left border indicator (2-4px), background color change, and bold text weight on the active item. The active state must update on every navigation — including client-side transitions. Use `aria-current="page"` on the active link.

### Navigation grouping and separators

Group navigation items by function with subtle horizontal separators (1px, muted color) between groups. Do not overuse separators — too many create visual noise. Groups should reflect the user's mental model, not the technical architecture.

### Badge and count indicators

- Display numeric badges on navigation items that have pending/unread counts (e.g., "5" on the Changes item for 5 unacknowledged changes).
- Use a small dot indicator (no number) for "new since last visit" states.
- **Keep counts current.** Stale counts erode trust. Update counts when the underlying data changes.
- **Use sparingly.** If every navigation item has a badge, nothing stands out. Reserve badges for items that genuinely need attention.

### Sidebar toggle visibility

The sidebar collapse/expand toggle should be visible at the bottom of the sidebar or in the sidebar header. It should not be visible when the sidebar is already in overlay mode (mobile). On desktop, collapsing the sidebar to a rail preserves icon-only navigation. The toggle icon should clearly indicate the action it will perform (collapse arrow when expanded, expand arrow when collapsed).

### When chrome should be hidden

Chrome is hidden only during: focused full-screen editing workflows (rich text editor), print/export preview modes, and onboarding tutorials. In all other contexts — including detail views, slide-over panels, and settings pages — the sidebar and header remain visible.

### Anti-patterns

- Sidebar active state not updating on client-side navigation
- Different sidebar layouts on different pages
- Badge counts that do not update in real-time (stale after performing the counted action)
- Unbounded user-generated content in the sidebar (long list of practice names)
- Sidebar disappearing on pages where navigation is still needed
- No visible collapse/expand toggle

---

## §10 Scroll and viewport behavior

### Principle

Scroll behavior determines whether users feel oriented or lost in data-dense pages. The scroll model must be predictable: users must always know what scrolls, what stays fixed, and where they are in a long page. Scroll position must be preserved across navigation.

### Page-level scroll model

Cedar uses fixed sidebar + scrolling content area. The sidebar is fixed below the header. The main content area scrolls independently. This is the standard enterprise SaaS scroll model for applications with persistent navigation.

### Sticky elements

| Element | Sticky behavior | Rationale |
|---|---|---|
| Table column headers | Sticky to top of content area scroll container | Users must identify columns when scrolling through many rows |
| Filter bars | Sticky below page title when present | Users need constant access to filters while scanning results |
| Page title with primary actions | Sticky to top of content area | Users need orientation and access to primary actions |
| Leftmost identifier column | Sticky to left edge during horizontal scroll | Users must identify rows when scrolling wide tables |

**Account for sticky element height in anchor link offsets.** Use `scroll-padding-top` on the scroll container set to the height of all stacked sticky elements. This prevents anchored content from hiding behind sticky elements.

**Do not stack too many sticky elements.** If sticky header + sticky filter bar + sticky table header consume more than one-third of the viewport height, reduce by collapsing or combining elements.

### Scroll restoration

When a user navigates from a list to a detail view and then returns (via Back button or explicit "Back to list" link), the list must restore to the scroll position the user left. Implementation:

1. Store scroll position in `sessionStorage` keyed by route.
2. Cache list data so it renders synchronously on back navigation.
3. Restore scroll position after content renders.
4. Use URL query parameters (`?page=3`) to encode list state so the correct page of data can be reconstructed.

### Pagination vs. infinite scroll

**For Cedar: use pagination for all collection views.** Pagination is nearly always better for task-oriented enterprise tools because:

- It provides landmarks — users can remember "it was on page 3"
- It enables the Back button to work correctly
- It preserves the footer (terms, support links)
- It gives users a sense of completion and control
- It makes URL sharing meaningful (`?page=4`)

**Pagination rules:**
- Always show total item count and current page: "Showing 21-40 of 234"
- Provide page size options (default + one larger option)
- Persist page number in URL query parameters
- "Load More" is acceptable as an alternative for feed/timeline views where sequential reading is the primary pattern, but still show progress ("Showing 36 of 120")

### Anti-patterns

- Full-page scroll with no fixed sidebar (user loses navigation context)
- Table headers that scroll away in long tables
- Losing scroll position when navigating back to a list (the most commonly reported navigation frustration in SPAs)
- Infinite scroll on admin data tables (users cannot find specific items, cannot bookmark positions)
- Multiple sticky elements consuming more than one-third of the viewport
- Anchor links that scroll content behind a sticky header

---

## §11 Filter and search interaction patterns

### Principle

Filters and search are how users manage information density on demand. Filter behavior must be predictable: users must always know which filters are active, how to clear them, and that their filter state persists across navigation and page refreshes.

### Filter application timing

| Pattern | When to use |
|---|---|
| **Immediate (live) filtering** | Single filter category; fast backend response; small datasets; user making one selection at a time |
| **Batch filtering ("Apply" button)** | Multiple filter categories selected together; slow backend response; complex filter combinations; user needs time to compose a filter set |

In Cedar: Use immediate filtering for single dropdowns and toggles (status filter, category filter). Use batch filtering when the filter UI presents multiple categories simultaneously in a filter panel.

### Active filter indication

1. Display each applied filter as a **removable chip/pill** below the filter bar. Each chip shows the filter category and value: "Status: Active".
2. Each chip has an X button to remove that individual filter.
3. When any filters are active, show a **"Clear all filters"** text button after the last chip.
4. Filters within the same category combine with OR ("Status: Active OR Pending"). Filters across categories combine with AND ("Status: Active AND Category: HIPAA").

### Filter persistence

**All active filters must be persisted in URL query parameters.** This ensures:
- Filtered views are shareable via URL
- Browser Back/Forward works correctly with filter state
- Page refresh preserves the filter state
- Filter usage is visible in analytics logs

Update the URL using `pushState` when a filter is applied or removed. Use `replaceState` for rapid successive changes (debounced search input).

### Zero-results vs. no-data-yet

These are different states. Never conflate them.

- **Zero results (filters applied):** "No regulations match your current filters." Show a "Clear all filters" button. The filter bar remains visible and active. Column headers or collection structure may remain visible.
- **No data yet (first use):** "No regulations tracked yet. Add your first regulation to get started." Show a CTA. No filter bar — there is nothing to filter.
- **Error state:** "Unable to load regulations." Show a retry button.

When filters are active and return zero results, **replace only the collection content** — the filter bar, column headers, and page structure remain. Do not replace the entire page with an empty state illustration.

### Search behavior

- **Debounce:** 200-300ms. Under 200ms wastes resources; over 300ms feels sluggish.
- **Minimum characters:** 2-3 characters before triggering search.
- **Clear button:** Show an X button inside the search input when text is present. Clearing returns to unfiltered state.
- **URL persistence:** Persist search terms in URL query parameters using `replaceState` (not `pushState` to avoid flooding history).
- **Cancel previous requests:** Use `AbortController` to cancel pending search requests when new input arrives.
- **Placeholder text:** "Filter by [attribute]" in sentence case.
- **Result highlighting:** Highlight matched terms in results when feasible.

### Anti-patterns

- Filters that reset on page navigation (user must re-apply after viewing a detail and returning)
- No visible indication of which filters are active
- "No results" message with no way to clear filters
- Search triggering on every keystroke without debounce
- Filters not persisted in URL (lost on refresh, not shareable)
- Conflating "no data yet" with "no filter results" (same message for both)
- Filter bar disappearing when no results are returned

---

## §12 Keyboard interaction patterns for collections

### Principle

Every interaction possible with a mouse must be possible with a keyboard. Collections (tables, card grids, feeds) are composite widgets — they should be a single Tab stop, with internal navigation managed by arrow keys. This prevents keyboard users from having to Tab through hundreds of cells to traverse a table.

### Table keyboard navigation

For tables with interactive content, use the WAI-ARIA grid pattern:

**Movement:**
- `→` / `←` — Move focus one cell right/left
- `↓` / `↑` — Move focus one cell down/up
- `Home` / `End` — Move focus to first/last cell in current row
- `Ctrl+Home` / `Ctrl+End` — Move focus to first cell of first row / last cell of last row
- `Page Down` / `Page Up` — Move focus down/up by one visible page of rows

**Actions:**
- `Enter` — Activate the focused cell's primary action (navigate if row is clickable, activate link/button if cell contains one)
- `Space` — Toggle selection on the current row (if selection is supported)
- `Tab` — Move focus OUT of the table to the next page element (not to the next cell)

**When to use grid vs. table role:** If each row has 0-2 interactive elements, use a standard `<table>` — all interactive elements participate in the normal Tab sequence. If rows are densely interactive (many controls per row) or the table has many rows, use `role="grid"` with managed focus. **Do not use `role="grid"` when a standard table suffices** — it adds complexity without benefit.

### Card grid keyboard navigation

- `Tab` moves focus into the card grid, landing on the first card.
- `→` / `←` — Move focus to next/previous card.
- `↓` / `↑` — Move focus to the card in the next/previous row (same column position).
- `Enter` — Activate the focused card's primary action (navigate to detail).
- `Tab` from within a card moves to the card's secondary interactive elements (if any), then to the next card.

### Feed/list keyboard navigation

Use the WAI-ARIA feed pattern:

- `Page Down` — Move focus to next article/item
- `Page Up` — Move focus to previous article/item
- `Ctrl+End` — Move focus past the feed
- `Ctrl+Home` — Move focus before the feed

Each feed item must have `role="article"`, `tabindex="0"`, `aria-posinset`, and `aria-setsize`.

### Focus management on data load

When data loads or updates:
- If the user had focus on a specific row/card and the data refreshes, maintain focus on the same logical item if it still exists.
- If the focused item was removed (by a filter change, deletion, or sort reorder), move focus to the nearest remaining item.
- After loading new data (pagination, filter change), move focus to the first item in the newly loaded set and announce the update via `aria-live="polite"` (e.g., "Showing 42 results").
- **Never move focus away from the user's current context unexpectedly.** Data loading in a different part of the page must not steal focus.

### Anti-patterns

- Every cell in a table individually reachable via Tab (hundreds of Tab presses to traverse)
- Arrow key navigation that wraps around (last cell → first cell) without user expectation
- No keyboard access to row-level actions (actions only available via mouse hover)
- Focus lost after data refresh (focus jumps to top of page or body)
- Using `role="grid"` for a simple display-only table with no interactive cells

---

## §13 Cross-page consistency enforcement

### Principle

The AI agent solves each component in isolation. This section exists to counteract that tendency. Every component, every page, every pattern must be evaluated in the context of the full application. The goal is that a user who has learned any one page can predict the behavior of every similar page without additional learning.

### Before building a new page

1. **Search the codebase** for every existing page with a similar purpose (another table page, another detail page, another settings form).
2. **Match its patterns exactly:** same layout structure, same component choices, same interaction behaviors, same column ordering conventions, same filter placement, same empty state treatment.
3. **If no similar page exists,** check whether the nearest analog in a different section (e.g., a different kind of table) establishes conventions you should follow.

### Before building a new component instance

Before building a new table, card grid, badge, data display, or any reusable pattern:

1. **Search for every existing instance** of that component type across the codebase.
2. **Compare props and configuration.** If the existing regulation table uses full-row click with trailing chevrons, the new admin user table must also use full-row click with trailing chevrons.
3. **Compare formatting.** If dates in existing tables use `formatDate(date, 'table')`, the new table must use the same call.
4. **Compare empty states, loading states, and error states.** These must follow the same pattern.

### The three consistency tests

**The adjacent page test.** Open the new page and an existing page with similar purpose side by side. Do they use the same layout, the same components, the same interaction patterns? If not, one of them is wrong — find out which and fix it.

**The return visit test.** A user uses page A for a week. Then they encounter page B (similar purpose, different section) for the first time. Can they use page B without learning anything new? If they have to discover a different click pattern, a different filter mechanism, or a different navigation model, the pages are inconsistent.

**The swap test.** Could you swap the content of page A into the layout/interaction pattern of page B without it feeling broken? If not, the pages have diverged in ways that are not justified by their different content.

### What must be identical across all pages of the same type

| Concern | Must match across all instances |
|---|---|
| Table interaction | Row clickability, hover behavior, chevron presence, cursor type |
| Card interaction | Click target model, hover state, affordance indicators |
| Badge appearance | Color, variant, shape for the same status/role/category value |
| Date formatting | Same format for same context type (table, detail, feed) |
| Empty states | Same message structure, same CTA placement |
| Loading states | Same skeleton approach, same placement |
| Filter behavior | Same application timing, same chip display, same clear mechanism |
| Navigation model | Same breadcrumb presence/absence, same back-link pattern |
| Error handling | Same error display mechanism, same escalation model |

### Anti-patterns

- Building a new table page without looking at existing table pages
- Using a card grid on one browse page and a table on another browse page for the same type of content
- Different date formats on different table pages
- A status badge that is blue on page A and green on page B for the same status value
- A detail view that opens as a slide-over from one list but as a full page from another list (for the same entity type)
- Creating a new utility function when an identical one exists

---

## §14 QA checklist — interaction and experience

Run through this checklist before every frontend commit. Every item must pass.

### Collections and navigation

- [ ] Every clickable row/card has a hover state covering its full surface
- [ ] Every clickable row/card uses `cursor: pointer`
- [ ] Every navigable table row has a trailing chevron in the last column
- [ ] Click behavior is identical across all tables of the same type in the application
- [ ] Click behavior is identical across all card grids of the same type
- [ ] Mixed-content rows properly separate navigation clicks from secondary action clicks (stopPropagation)
- [ ] Checkbox selection and row navigation coexist without conflict (where both are present)
- [ ] Bulk action toolbar appears when items are selected and disappears when selection is cleared

### Visual consistency

- [ ] Every status badge uses the same color/variant for the same value across all pages (search the codebase to verify)
- [ ] Every date uses `formatDate()` with the appropriate context parameter
- [ ] Every number uses `Intl.NumberFormat` via shared utility
- [ ] Every enum/status displays a human-readable label, never a raw database value
- [ ] No raw hex color codes — all colors reference design tokens
- [ ] Badge size may vary by context, but color and icon are identical

### Navigation and state

- [ ] The sidebar active state reflects the current page
- [ ] Breadcrumbs display correct hierarchy (when applicable)
- [ ] URL updates when filters, pagination, sort, or tab state changes
- [ ] Page refresh restores the same view state (filters, pagination, sort)
- [ ] Browser Back returns to previous state with scroll position preserved
- [ ] Slide-over panels close via X button, Escape key, and clicking the backdrop
- [ ] Browser tab title is unique and descriptive for the current page

### Feedback and communication

- [ ] Every user action produces visible feedback (toast, state change, loading indicator)
- [ ] Error messages appear near the error source, not in auto-dismissing toasts
- [ ] Destructive actions require confirmation with descriptive button labels
- [ ] Confirmation dialogs default focus to the non-destructive option
- [ ] Empty states are appropriate to context (first-use vs. no-results vs. error)
- [ ] "No results" message never appears while data is still loading

### Chrome and layout

- [ ] Sidebar is visible on all standard pages (not hidden unless in an immersive workflow)
- [ ] Sidebar collapse preference persists across sessions
- [ ] Sticky table headers remain visible during scroll
- [ ] Sticky elements do not overlap or obscure interactive content
- [ ] Layout does not shift when dynamic content loads (skeletons match final layout)
- [ ] Filter bar remains visible when zero results are returned

### Keyboard and accessibility

- [ ] All interactive elements reachable via keyboard
- [ ] Visible focus indicators on all focused elements
- [ ] Tables with interactive cells use appropriate grid or table role
- [ ] Modal dialogs trap focus and return focus to trigger on close
- [ ] Dynamic content updates (filter counts, toasts) announced via `aria-live`
- [ ] Disabled elements display an explanatory tooltip
- [ ] Truncated text is accessible via tooltip or `aria-label` with full text
- [ ] Live region containers exist in the DOM before content is injected

### Cross-page consistency

- [ ] Searched codebase for existing pages with similar purpose and matched patterns
- [ ] Searched codebase for existing instances of the same component type and matched configuration
- [ ] Passes the adjacent page test (side-by-side with similar pages, no unexplained differences)
- [ ] Passes the return visit test (user of similar page can use this page without new learning)
- [ ] All formatting goes through shared utilities — no new inline formatting functions
- [ ] No new component created when an existing component could be reused with props

---

*This document is versioned alongside the codebase. When a new pattern is established that is not covered here, add it. When a rule is found to be wrong, update it. This document is the source of truth for how Cedar's interface behaves.*
