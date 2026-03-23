# Cedar Information Density

> **Purpose.** This document defines how Cedar presents dense regulatory information clearly. It establishes Cedar's density parameters, chunking rules, metadata grouping patterns, and progressive disclosure approach. Every layout and component decision about "how much to show" is governed here.
>
> **Audience.** An AI coding agent (Claude Code) building Cedar's interface. Every rule is specific enough to implement without subjective judgment.
>
> **When to consult.** Before building any page, component, or view that displays regulatory data, metadata clusters, or collections of items.

---

## Document boundary map

| Concern | Document |
|---|---|
| Visual specs, tokens, component props, color system | `design-standards.md` |
| Semantic HTML structure, heading hierarchy, landmarks, accessibility markup | `frontend-standards.md` |
| Interaction behavior, click/hover/scroll patterns, navigation consistency | `ux-standards.md` |
| Copy, voice, terminology, string constants | `content-standards.md` |
| Visual personality, feel, reference directions, what to avoid | `art-direction.md` |
| **Density parameters, chunking, grouping, progressive disclosure, truncation decisions, collection consumption** | **`information-density.md`** |

When in doubt: if the question is how much to show, how to group it, when to hide or reveal it, or which collection format best supports comprehension, this document governs.

---

## §1 Cedar's density model

### 1.1 One density, well-defined

Cedar ships one density level. There are no user-selectable compact/comfortable modes, no density toggles, no per-page overrides. One set of parameters, applied consistently, tuned for practice administrators who check in a few times per week and need to scan, understand, and move on.

This density sits at the comfortable end of enterprise data display — closer to GitHub's issue lists than Bloomberg's terminal. The goal is fast orientation on brief visits: a user opening Cedar should know within seconds what needs attention, what's changed, and what's routine.

### 1.2 Density parameters

These values define Cedar's single density level. They apply everywhere unless a specific exception is documented in this section.

| Element | Value | Rationale |
|---|---|---|
| Table row height | **48px** | Carbon's Large default. Comfortable for weekly check-ins; accommodates badges and metadata without truncation. |
| Table cell horizontal padding | **16px** | Carbon standard. Consistent across all table contexts. |
| Card padding | **16px** (Radix `size="3"` or `p="4"`) | Enough breathing room for scan-oriented browse views. |
| Section spacing (between sections) | **32px** (Radix `gap="6"`) | Clear separation between conceptual groups. |
| Spacing within a section | **8–12px** (Radix `gap="2"` to `gap="3"`) | Tight grouping within related content. |
| Page wrapper spacing | **32px** (Radix `gap="6"`) | Between page title area and first content section. |
| Body text size | **14px** (`<Text size="2">`) | Cedar's standard for UI text, labels, table cells, metadata. |
| Reading text size | **16px** (`<Text size="3">`) | Full regulatory text in reader mode, AI-generated summaries. |
| Label/caption size | **12px** (`<Text size="1">`) | Column headers, field labels, timestamps, secondary metadata. |
| Line height (UI text) | **1.4** | Scannable density without cramping. |
| Line height (reading text) | **1.6** | Comfortable sustained reading for regulation full text. |
| Maximum reading line length | **65ch** (`max-w-[65ch]`) | Optimized for comprehension on brief visits. |

### 1.3 The density principle

**Tight components, generous section breaks.** Elements within a logical group sit close together (8–12px gaps). Groups are separated by clear whitespace (32px). This produces the visual rhythm of density-with-structure: a regulation card's metadata cluster feels compact and scannable, but the space between that card and the next section prevents the page from becoming a wall of data.

This is Material Design's layout equilibrium principle applied to Cedar: component-level density paired with section-level breathing room.

---

## §2 Metadata chunking

### 2.1 The cluster rule

Visual clusters contain **3–4 items maximum**. This is derived from Cowan's working memory research (4±1 items without rehearsal) applied to scan-oriented UI. When a user glances at a regulation, they should absorb one cluster's meaning before moving to the next.

Separate clusters with whitespace (16–24px gap between clusters within the same region) or a subtle border. Each cluster should have a clear purpose that a user could articulate: "this cluster tells me what it is," "this cluster tells me where it comes from."

### 2.2 Cedar's regulation metadata clusters

Every regulation in Cedar carries six core metadata fields. These are organized into two clusters of three:

**Identity cluster** (what is this, does it matter):
- Regulation title
- Severity badge
- Compliance status

**Source cluster** (where does this come from, when):
- Source agency
- Authority level
- Effective date

Service line applicability appears as tag-style chips below or beside the identity cluster — it's a filtering/categorization aid, visually distinct from the two core metadata clusters.

This two-cluster model applies everywhere a regulation's metadata appears: table rows, card faces, detail view headers, feed items. The clusters may be arranged horizontally (detail view headers) or vertically (card faces, narrow layouts), but the grouping and order remain fixed.

### 2.3 Change record metadata clusters

When displaying a regulatory change (an update detected by Cedar), the metadata shifts:

**Change identity cluster**:
- Change title (what changed)
- Severity badge
- Change type (amendment, new regulation, repeal)

**Timing cluster**:
- Date detected
- Effective date of the change
- Source agency

The AI-generated summary sits below these clusters as body content, not as metadata.

### 2.4 Chunking rules

1. **A cluster never exceeds 4 items.** If a fifth item is needed, create a new cluster.
2. **Clusters have stable membership.** The same fields appear in the same cluster everywhere. Severity is always in the identity cluster. Effective date is always in the source cluster. Moving fields between clusters across pages is a consistency violation.
3. **Clusters have consistent internal order.** Title is always first in the identity cluster. Source agency is always first in the source cluster. Order is fixed across all contexts.
4. **Badges and chips count as items.** A severity badge is one item. Two service line tags are one item (the tag group, not individual tags).
5. **Null fields in clusters display as an em dash (—)**, not blank space. The cluster structure remains stable even when data is missing. See `content-standards.md` §11 for null display rules.

---

## §3 Information hierarchy: summary first, source second, detail third

### 3.1 The three-tier model

Every entity in Cedar (regulation, change, source) is presented through a consistent three-tier information hierarchy:

**Tier 1 — Summary.** The minimum information needed to decide whether this item deserves attention. Visible on card faces, table rows, and feed items. Contains the identity cluster, source cluster, and a one-line description or AI-generated summary excerpt.

**Tier 2 — Context.** The information needed to understand the item fully. Visible on detail views (regulation detail page, change detail panel). Contains the full AI-generated summary, the metadata clusters expanded with additional fields, related regulations, and amendment history.

**Tier 3 — Source.** The original regulatory text and primary source material. Visible in the reader view tab of a regulation detail page, or via the external link to the live source. This tier is always available but never forced — users access it when they need to verify or read the full text.

### 3.2 Tier assignment rules

1. **Tier 1 content is never hidden behind interaction.** It is always visible in the collection view without clicking, expanding, or hovering.
2. **Tier 2 content is one click away.** Clicking a regulation in a collection opens its detail view, where all Tier 2 content is immediately visible (no further expansion required for the active tab).
3. **Tier 3 content is two interactions away.** A user navigates to the detail view (click 1), then switches to the source tab (click 2).
4. **Tiers are additive.** The detail view includes all Tier 1 content plus Tier 2 content. The source view includes orientation metadata from Tier 1 (title, severity) alongside the source text. A lower tier never hides information from a higher tier.
5. **AI-generated content carries its badge and disclaimer at every tier.** The "AI-generated" label is Tier 1 information — it appears on summaries in collection views, not only on detail pages.

---

## §4 Tables, cards, and lists

### 4.1 When to use each

| Pattern | Use when | Cedar examples |
|---|---|---|
| **Table** | Users need to compare the same attributes across many items. Sorting and filtering are primary interactions. | Admin user list, audit log, source management, enforcement actions |
| **Card grid** | Users are browsing categorized, self-contained items. Visual scanning and discovery matter more than cross-item comparison. | Regulation library category view, dashboard section panels |
| **Feed / list** | Users are scanning a chronological or priority-ordered stream. Each item is consumed individually, not compared. | Regulatory change feed, activity log |

### 4.2 Decision test

Ask: "Does the user need to compare attribute X of item A with attribute X of item B?" If yes, use a table — cards force users to hold values in memory across spatial gaps. If the user is browsing, discovering, or scanning self-contained items, use cards or a list.

### 4.3 Table density rules

- **Always visible columns**: Primary identifier (first column), key status badge, most-referenced attribute, navigation affordance (last column). These columns never hide at any viewport width.
- **Column order**: Primary identifier → status → attributes in order of decision relevance → secondary metadata → actions/navigation. This order is consistent across all tables in Cedar.
- **Row content**: Each row displays Tier 1 information only. Tier 2 content is accessed by clicking the row (navigating to detail view or opening a slide-over panel).
- **Maximum columns**: Aim for 5–7 visible columns. Beyond 7, the table becomes difficult to scan at a glance. Move lower-priority columns behind a column customization control or into the detail view.

### 4.4 Card density rules

- **Card face content**: Identity cluster + one supporting detail (a summary excerpt or a key metric). Cards should be scannable in under 3 seconds.
- **Card action**: One primary action per card (typically navigation to detail view via full-card click). Secondary actions (bookmark, share) are visually subordinate or accessible via a menu.
- **Grid layout**: Cards in a grid share identical height within each row. Use consistent card structure — every card in a grid shows the same fields in the same positions.

---

## §5 Progressive disclosure

### 5.1 Cedar's primary disclosure pattern: tabs on detail views

The regulation detail page uses **tabs** to organize distinct content categories. Each tab is a self-contained view, not a nested layer of progressive disclosure. The user selects which lens they want, and that tab's content is fully visible without further expansion.

This is the correct pattern for Cedar because:
- Each tab contains a genuinely different content type (AI summary, change history, full source text, metadata)
- Users choose which perspective they need based on their task, not based on depth of interest
- Tabs preserve orientation — the regulation header with identity cluster metadata remains visible across all tabs
- Tab count is small and stable (no more than 5 tabs per view)

### 5.2 Tabs rules

1. **Maximum 5 tabs.** Beyond 5, the tab bar becomes difficult to scan and tabs begin truncating on smaller viewports.
2. **Tab labels are short and scannable.** One or two words: "Summary," "Changes," "Source," "Reference," "Details." Follow `content-standards.md` sentence case rules.
3. **The default tab is the one most users need most often.** For regulation detail, that is the Summary tab.
4. **Tab state is encoded in the URL** as a query parameter (`?tab=changes`) so users can bookmark or share a specific view.
5. **Switching tabs does not lose state.** If a user scrolls within the Source tab, switches to Summary, and returns to Source, scroll position is preserved.

### 5.3 When to use expandable sections within a tab

Within a single tab, use collapsible sections when:
- The tab contains multiple distinct subsections that vary in relevance by user
- Some content is populated and some is empty — collapse empty sections to reduce visual noise
- The content within the tab would exceed 3 full viewport heights if fully expanded

When using collapsible sections:
- **Allow multiple sections open simultaneously.** Auto-collapse (only one section open at a time) prevents comparison and frustrates expert users.
- **Default state**: Sections with content are expanded. Sections that are empty or rarely needed are collapsed.
- **Section headers include a content indicator** when collapsed: a count ("3 amendments"), a date ("Last updated Mar 15"), or a status badge. This is information scent — the user can assess whether to expand without clicking.
- **Provide Expand All / Collapse All controls** when there are 4 or more collapsible sections.

### 5.4 What is never hidden

These elements are always visible, regardless of tab state, scroll position, or section collapse:

- Regulation title
- Severity badge
- Compliance status
- AI-generated badge (on any AI content)
- The tab bar itself
- Navigation back to the collection view

---

## §6 Truncation decisions

### 6.1 When to truncate vs. expand vs. navigate

| Content type | Pattern | Implementation |
|---|---|---|
| Table cell text that overflows | **Truncate with tooltip.** Single-line truncation with full text on hover/focus. | `<Text truncate>` + `title` attribute or Radix `<Tooltip>` |
| Card description or summary excerpt | **Truncate with navigate.** Show 2–3 lines, clicking the card navigates to the full detail view. | `line-clamp-2` or `line-clamp-3` on the description element |
| Long regulatory text within a reading view | **Full display with section navigation.** No truncation — use a table of contents and scroll-spy instead. | Persistent sidebar TOC for documents with 5+ sections |
| Metadata values that overflow (long agency names, long regulation titles) | **Truncate with tooltip.** | `<Text truncate>` + tooltip |
| AI-generated summaries in collection views | **Truncate with navigate.** Show the first sentence or 120 characters, whichever is shorter. | `line-clamp-2` + full text on the detail view Summary tab |
| Hash values, IDs, citation numbers | **Truncate with copy.** Show first 8 characters + ellipsis, with a copy button for the full value. | Custom truncation + copy-to-clipboard |

### 6.2 Truncation rules

1. **All truncated text is accessible.** Full text is available via tooltip (on hover and focus), `aria-label`, or navigation to a detail view. Truncation never permanently hides content.
2. **Truncation length is consistent per context.** If AI summaries truncate at 2 lines in the change feed, they truncate at 2 lines in every collection view. Context-specific truncation lengths are defined once and reused.
3. **Truncation uses the ellipsis character (…)**, not three periods.
4. **Never truncate status badges, severity indicators, or dates.** These are decision-critical and must always display in full.

---

## §7 Collection consumption: pagination

### 7.1 Pagination as the default

All collection views in Cedar use **pagination**. Cedar does not use infinite scroll or load-more patterns.

Pagination is correct for Cedar because:
- Users check in briefly and need to orient quickly — page numbers provide landmarks ("it was on page 3")
- Filtered and sorted views are shareable via URL (`?page=2&sort=date`)
- Browser back/forward works correctly with paginated state
- Users can reach the footer (legal disclaimers, support links)
- The total scope of results is always visible

### 7.2 Pagination parameters

| Parameter | Value |
|---|---|
| Default page size | **20 items** |
| Page size options | None for MVP. One default page size. |
| Position | Below the collection, right-aligned |
| Format | "Page 1 of 12" with previous/next controls and first/last page jumps |

### 7.3 Collection orientation indicators

Every paginated collection displays:

1. **Total count**: "142 regulations" (always visible, even when unfiltered)
2. **Filtered count** (when filters are active): "Showing 23 of 142 regulations"
3. **Current page position**: "Page 2 of 8"
4. **Active filters** displayed as removable chips below the filter bar
5. **Sort indicator** on the active sort column header

### 7.4 Scroll restoration

When a user navigates from a collection to a detail view and returns (via back button or explicit "Back to [collection]" link), the collection restores to the exact scroll position and page the user left. This is implemented via:
- Page number persisted in URL query parameters
- Scroll position stored in `sessionStorage` keyed by route
- List data cached so it renders without a loading flash on return

---

## §8 Long-form regulatory text

### 8.1 Reading mode parameters

When displaying full regulatory text (the Source tab on a regulation detail page), Cedar switches to reading-optimized parameters:

| Parameter | Value | Rationale |
|---|---|---|
| Font size | **16px** (`<Text size="3">`) | Comfortable for sustained reading |
| Line height | **1.6** | WCAG-recommended for body text readability |
| Line length | **65ch** (`max-w-[65ch]`) | Comprehension-optimized; avoids fatigue from wide lines |
| Paragraph spacing | **1em** (16px at 16px font size) | Clear paragraph separation without excessive gaps |
| Section heading size | **18px** (`<Heading size="4">`) | Distinct from body without dramatic scale jump |

### 8.2 Section navigation

| Document length | Navigation pattern |
|---|---|
| Fewer than 5 sections | Sticky section headers only. No dedicated navigation. |
| 5–15 sections | Floating table of contents that appears on hover at the left margin. Active section highlighted via scroll-spy. |
| 15+ sections | Persistent sidebar table of contents with scroll-spy highlighting. Hierarchical display matching the regulatory document's own section structure. |

### 8.3 Inline metadata in regulatory text

Effective dates, amendment markers, and cross-references within regulatory text use **marginal placement over inline interruption**:

- **Effective dates and version indicators**: Displayed as a subtle banner above the section they apply to, not inline within paragraph text.
- **Cross-references to other regulations**: Rendered as standard hyperlinks within the text. Clicking opens the referenced regulation's detail page (or a tooltip preview if the reference is to a specific section).
- **Amendment history**: Placed at the end of each section, not inline. Collapsed by default with a "Show amendment history" toggle.

---

## §9 Cognitive load guardrails

### 9.1 The 10-cue threshold

Research shows decision quality degrades when users face more than approximately 10 simultaneous information cues. Cedar's primary dashboard and collection views stay at or below this threshold for the initial scan.

**Counting cues on a regulation card (Tier 1):**
- Title (1)
- Severity badge (2)
- Compliance status (3)
- Source agency (4)
- Authority level (5)
- Effective date (6)
- Service line tags (7)
- Summary excerpt (8)

Eight cues. This is within the threshold. Adding more Tier 1 fields to a card face requires removing an existing one or moving the new field to Tier 2.

### 9.2 AI-generated content load management

Every AI-generated content block carries a badge and disclaimer. These are trust signals, not noise — but they consume visual attention. To manage this load:

- The "AI-generated" badge is small, gray, and positioned consistently (top-right of the content block or inline with the section header). It does not compete with severity or status badges for attention.
- The inline disclaimer appears once per content block, at the bottom, in muted text. It is not repeated for every paragraph within the same block.
- On collection views (card faces, table rows), the AI badge appears but the full disclaimer does not. The disclaimer appears on the detail view where the full summary is read.

### 9.3 Anti-patterns

- **Showing everything equally.** If all information has the same visual weight, nothing stands out and the user must read everything to find what matters. Use the three-tier hierarchy to create clear priority.
- **Alert uniformity.** Treating minor procedural updates and major compliance requirements with the same visual treatment. Severity badges exist to prevent this — enforce their use on every change and regulation.
- **Metadata sprawl.** Scattering related metadata across distant parts of the screen. Users should never need to remember a value from one region while scanning another. Keep clusters tight and co-located.
- **Hiding populated fields.** Collapsing sections that contain data the user is likely to need. Default to expanded for populated sections, collapsed for empty ones.
- **Premature density reduction.** Hiding information to make a screen look cleaner when users need that information to do their job. Density is acceptable when grouping is strong.

---

## QA checklist — information density

Run this checklist on any page, component, or view that displays regulatory data.

- [ ] Metadata clusters contain 3–4 items maximum
- [ ] Identity cluster fields (title, severity, status) are in consistent order across all views
- [ ] Source cluster fields (agency, authority, effective date) are in consistent order across all views
- [ ] Tier 1 content is visible without any interaction (no clicks, hovers, or expansions required)
- [ ] Tier 2 content is reachable in one click
- [ ] Tier 3 content is reachable in two interactions
- [ ] Higher tiers include all content from lower tiers (detail view includes everything from collection view)
- [ ] Table rows show Tier 1 only; Tier 2 is on the detail view
- [ ] Card faces are scannable in under 3 seconds
- [ ] No collection view exceeds 10 simultaneous information cues per item
- [ ] AI-generated badge is visible on all AI content at every tier
- [ ] Truncated text has a tooltip, `aria-label`, or navigation path to the full content
- [ ] Null metadata fields display as "—", not blank space
- [ ] Pagination is present on all collections with URL-persisted page state
- [ ] Collection orientation indicators are present (total count, filtered count, page position)
- [ ] Section spacing is 32px between sections, 8–12px within sections
- [ ] Reading mode text uses 16px size, 1.6 line height, and 65ch max width
- [ ] Collapsible sections allow multiple sections open simultaneously
- [ ] Collapsed section headers include a content indicator (count, date, or status)
