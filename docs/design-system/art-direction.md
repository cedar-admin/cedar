# Cedar Art Direction

> **Purpose.** This document defines what Cedar should feel like. It translates Cedar's product identity — a regulatory intelligence platform for busy practice administrators — into concrete visual principles that an AI coding agent can evaluate against. Every subjective design judgment ("does this feel right?") should be answerable by checking this document.
>
> **Audience.** An AI coding agent (Claude Code) building Cedar's interface, and the human designer making taste-level decisions the agent can't.
>
> **When to consult.** When making a visual decision that the component specs don't resolve. When a screen is technically correct but feels wrong. When choosing between two valid approaches and needing a tiebreaker.

---

## Document boundary map

| Concern | Document |
|---|---|
| What Cedar should feel like, visual personality, design sensibility, reference directions, what to avoid | **This document** |
| Visual specs, tokens, component props, color system implementation | `design-standards.md` |
| Density parameters, chunking, grouping, progressive disclosure | `information-density.md` |
| Semantic HTML structure, heading hierarchy, landmarks, accessibility markup | `frontend-standards.md` |
| Interaction behavior, click/hover/scroll patterns | `ux-standards.md` |
| Copy, voice, terminology, string constants | `content-standards.md` |

---

## §1 The governing principle

**Simplify the interface, not the data.**

Cedar's users are practice administrators responsible for regulatory compliance at small medical practices. They check Cedar a few times per week. When they arrive, they need to know quickly: what changed, does it affect me, and what should I do about it. Then they leave.

Every visual decision serves this workflow. The interface stays out of the way so the regulatory information can be understood quickly and trusted completely. Cedar earns trust by being clear, consistent, and visually disciplined — by looking like a tool built by people who understand that regulatory compliance is serious work.

The corollary: Cedar never sacrifices information completeness for visual cleanliness. Hiding data to make a screen look better is a failure. Organizing data so a screen is both complete and easy to scan is the job.

---

## §2 Visual personality

Cedar's visual personality has four attributes. Every screen should express all four simultaneously. When they conflict, the list order is the priority order.

### Calm

The interface produces a feeling of quiet control. The user is not bombarded, rushed, or overwhelmed. Calm is achieved through:

- **Neutral interactive surfaces.** Buttons, nav items, form controls are gray. The baseline visual environment is muted.
- **Color only for meaning.** When color appears, it carries specific information (severity, status, compliance state). Color is never decorative.
- **Generous section spacing.** Sections breathe. Content groups are tight internally but separated clearly from each other.
- **Restrained motion.** Animation confirms actions and orients transitions. Animation never draws attention to itself.

Calm does not mean empty. A screen with 20 regulations listed in well-organized rows is calm. A screen with 3 regulations floating in whitespace is sparse, not calm.

### Structured

The interface communicates that information is organized, categorized, and under control. Structure is achieved through:

- **Consistent page anatomy.** Every page of the same type follows the same layout. Users develop spatial memory for where to find things.
- **Fixed metadata grouping.** The same fields appear in the same clusters in the same order everywhere. A severity badge is always in the identity cluster, never wandering to different positions on different pages.
- **Clear hierarchy.** Three levels of visual importance are distinguishable at a glance: primary content (headings, key data), secondary content (supporting metadata, descriptions), and tertiary content (timestamps, labels, captions).
- **Predictable patterns.** Tables behave like tables everywhere. Cards behave like cards everywhere. A user who has learned one page can predict the behavior of every similar page.

### Trustworthy

The interface communicates that the information it presents can be relied on. Trust is achieved through:

- **Source attribution.** Every piece of regulatory content links to its primary source. The live source link is always accessible.
- **Visible provenance.** AI-generated content is always labeled. Timestamps show when content was last updated. The user always knows what they're looking at and where it came from.
- **Consistency.** The same status badge looks identical on every page. The same severity color means the same thing everywhere. Visual inconsistency — even small things like a badge that's blue on one page and gray on another — communicates carelessness.
- **Precision.** Dates are formatted consistently. Numbers are formatted consistently. Regulatory citations use proper format. The interface handles the details that matter to professionals.

### Current

The interface feels like a modern professional tool, built with care, by people who understand contemporary software design. Current is achieved through:

- **Clean typography.** Geist's geometric precision gives Cedar a modern foundation. Tight weight discipline (Regular 400 and SemiBold 600 only for most contexts) keeps typography authoritative.
- **Refined surfaces.** Subtle translucent panel backgrounds, soft shadows, rounded corners (via Radix `radius="large"`) — the visual language of well-crafted software.
- **Responsive interaction.** Hover states respond immediately. Loading states use skeleton screens that match the final layout. Transitions are smooth and brief.

Current does not mean trendy. Cedar avoids visual trends that will date the interface. The look should feel appropriate in 2024 and still appropriate in 2028.

---

## §3 How color should feel

Cedar uses a **neutral-interactive, colorful-informational** model. This section describes the intended feel of that model. For implementation (tokens, Radix props, specific color values), see `design-standards.md`.

### The gray baseline

The default state of every interactive element is gray. Buttons, nav items, form inputs, toggles, links — all gray by default. This produces an environment where the eye is not drawn to chrome. The user's attention goes to content and to the colored signals within content.

Gray is not colorless. Radix's gray scale includes warm and cool variants at different steps. Cedar's gray should feel **neutral-warm** — closer to a warm paper tone than a cold steel tone. The warmth is subtle enough that it reads as neutral, but present enough that the interface doesn't feel clinical.

### Color as signal

When color appears in Cedar's UI, it means something. A user should be able to point to any colored element and answer "what does this color tell me?"

- **Red** signals danger, error, critical severity. Something requires urgent attention or an action has destructive consequences.
- **Amber** signals caution, pending states, medium severity. Something needs review or is approaching a threshold.
- **Green** signals success, active status, approved state, low severity. Something is healthy or confirmed.
- **Blue** signals information, context, in-progress states. Something is informational or actively being processed.
- **Purple** signals the Intelligence tier. It's a product-level distinction, not a regulatory signal.
- **Gray** signals neutral, routine, inactive, or unknown states. The default when no semantic signal is warranted.

If a new element needs color and doesn't fit these categories, the answer is gray — not a new color. The semantic color palette expands rarely and deliberately.

### Color restraint

The proportion of color on any Cedar screen should feel **sparse**. On a well-designed regulation list page, the dominant visual is gray text on light surfaces, with colored badges punctuating the rows. The badges stand out precisely because the surrounding environment is neutral.

A useful mental test: if you squint at a Cedar screen and see mostly gray with small pops of color, the balance is right. If you see a rainbow of competing signals, the balance is wrong.

---

## §4 How typography should feel

Cedar uses Geist, a geometric sans-serif designed for screen interfaces. Typography in Cedar should feel **precise and authoritative** — the visual equivalent of a well-structured briefing document.

### Weight discipline

Cedar uses two weights for the vast majority of text:

- **Regular (400)** for body text, descriptions, metadata values, table cells.
- **SemiBold (600)** for headings, labels, column headers, emphasized values.

Bold (700) is available but reserved for page titles (`<Heading size="6" weight="bold">`) and strong emphasis in content. Light and thin weights are not used — they reduce legibility at small sizes and communicate softness rather than authority.

Weight creates hierarchy. A SemiBold heading at 14px can outperform a Regular heading at 18px for drawing the eye. Prefer weight contrast over size contrast for distinguishing content levels within the same section.

### Type scale

Cedar's type scale is intentionally tight. The difference between heading and body is clear but not dramatic. This supports a dense, information-rich environment where headings organize content without dominating it.

| Role | Size | Weight | Element |
|---|---|---|---|
| Page title | 24px | Bold (700) | `<Heading size="6" weight="bold">` |
| Section heading | 18px | SemiBold (600) | `<Heading size="4" weight="medium">` |
| Card/row title | 14px | SemiBold (600) | `<Text size="2" weight="medium">` |
| Body text | 14px | Regular (400) | `<Text size="2">` |
| Reading text | 16px | Regular (400) | `<Text size="3">` |
| Labels, captions | 12px | Regular (400) or SemiBold (600) | `<Text size="1">` |
| Stat/metric values | 20px | Bold (700) | `<Text size="5" weight="bold">` |

The scale uses the **Major Second ratio (1.125)** — subtle increments that preserve hierarchy without wasting vertical space. The jump from 12px (labels) to 14px (body) to 16px (reading) to 18px (section heading) to 24px (page title) provides five clearly distinguishable levels.

### Tabular figures for data

All numeric data (dates, counts, IDs, metrics) uses tabular figures (`font-variant-numeric: tabular-nums`). This ensures digits align vertically in columns and data feels precise. Geist supports both proportional and tabular figure variants natively.

Full monospace (Geist Mono) is reserved for regulatory citation codes, technical identifiers, and any context where character-level alignment matters.

---

## §5 How surfaces and spacing should feel

### Surfaces

Cedar's surfaces are **quiet containers**. Cards, panels, and page regions exist to group content, not to draw attention. The surface treatment follows Radix Themes' `panelBackground="translucent"` setting — subtle translucency that gives depth without weight.

- **Cards** use `variant="surface"` — a subtle border with translucent background. Cards should feel like paper on a desk: present, organized, but not decorated.
- **Panels and slide-overs** use solid backgrounds (`--cedar-panel-bg-solid`) with soft shadows. They sit above the page but don't dominate it.
- **The page background** is a single, flat, muted tone. There are no gradients, patterns, or textures on page backgrounds.

The visual effect: content floats slightly above the background in organized groups. The elevation is subtle — just enough to distinguish content regions from the page surface.

### Spacing

Spacing in Cedar follows a two-rhythm pattern:

**Within a section** (related content), spacing is tight: 8–12px (Radix `gap="2"` to `gap="3"`). Metadata items in a cluster, form fields in a group, items in a list — these sit close together to communicate belonging.

**Between sections** (distinct content groups), spacing is generous: 24–32px (Radix `gap="5"` to `gap="6"`). The gap between a page title and the first content section, between a filter bar and the collection below it, between two card groups — these gaps are wide enough to clearly separate concepts.

This two-rhythm pattern produces the feel of a well-organized document: tight paragraphs, clear section breaks.

### Borders and dividers

Borders are structural, not decorative. Cedar uses borders to:
- Define card edges (subtle, `--cedar-border-subtle`)
- Separate table rows (subtle, single-pixel)
- Separate major page regions (the sidebar border, for instance)

Cedar avoids borders when whitespace alone provides sufficient separation. A group of cards in a grid does not need borders around the grid — the card edges and the gaps between them are enough. Section dividers within a page are rarely needed if spacing is correct.

The goal: structure should be felt, not seen. If removing a border changes nothing about how the user perceives the layout, the border is unnecessary.

---

## §6 How motion should feel

Animation in Cedar has one purpose: **confirming that something happened.** A panel slides in to show it opened. A toast fades in to confirm an action succeeded. A button shows a loading spinner to confirm the click registered. Animation orients the user about state changes.

Animation in Cedar never:
- Draws attention to itself
- Makes the user wait
- Adds personality or playfulness
- Entertains during idle time
- Activates on page load for elements that are simply appearing (no entrance animations on static content)

### Duration

Cedar's motion is **fast and functional**. Most transitions fall in the 150–250ms range. Nothing exceeds 350ms except full-panel slides. The interface should feel instantly responsive — animation smooths transitions, it doesn't slow them down.

### The removal test

For any animation in Cedar, apply this test: if the animation were removed and the state change happened instantly, would the user be confused about what changed? If yes, the animation is doing useful work — keep it. If no, the animation is decorative — remove it.

---

## §7 Reference directions

Cedar's visual sensibility draws primarily from **GitHub Primer** — the design system most aligned with Cedar's goals of restraint, hierarchy, and calm productivity.

### What Cedar borrows from Primer

- **Restraint as the primary design act.** Anything added dilutes everything else. Every element must earn its visual presence.
- **Functional color system.** Color is organized by function (danger, warning, success, informational), not by aesthetic preference.
- **Desktop-density orientation.** Interfaces favor compact, efficient layouts optimized for focused desktop work.
- **Invisible design.** The system aims to remove friction between the user and their work. The UI recedes so content leads.

### What Cedar borrows from IBM Carbon

- **Enterprise seriousness.** The visual tone communicates that this is a professional tool for consequential work. Carbon's question — "Have we removed everything gratuitous?" — is Cedar's constant self-test.
- **Structured density.** Carbon handles information-heavy layouts with discipline: consistent type scale, clear section hierarchy, defined density parameters per component.

### What Cedar borrows from Linear

- **The warm neutral.** Linear shifted from cool blue-gray to a warmer gray that "still feels crisp, but less saturated." Cedar occupies this same narrow band: warm enough to feel approachable, neutral enough to feel professional.
- **Subdued chrome.** Navigation and structural elements are dimmer than content. The sidebar, headers, and tab bars recede; the content area takes precedence.
- **"Structure should be felt, not seen."** Borders and dividers are minimized. Whitespace and grouping create structure without visible lines.

---

## §8 What Cedar avoids

These patterns are incompatible with Cedar's personality. If a design decision moves Cedar toward any of these, reverse course.

### Dashboard theater

Animated KPI counters, spinning progress wheels, real-time ticking numbers, data visualizations that prioritize spectacle over comprehension. Cedar's dashboard presents numbers clearly and statically. If a number changes, it updates — it does not animate.

### Health-tech warmth

Rounded illustrations, pastel color palettes, friendly mascots, wellness-adjacent branding, soft gradients. Cedar serves medical practices but is a regulatory compliance tool, not a health and wellness product. The visual language is professional and structured.

### Government-portal heaviness

Dense forms with no visual hierarchy, excessive field labels, institutional blue-and-gray palettes, disabled-looking interfaces, 1990s-era information architecture. Cedar handles government regulatory content, but the interface itself is modern and refined.

### SaaS decoration

Gradient backgrounds, floating decorative shapes, hero illustrations on dashboard pages, confetti on completions, gamification elements (streaks, badges, progress bars for engagement), marketing language woven into the product UI. Cedar's value comes from the information it provides, not from making the experience feel like a consumer app.

### Extreme minimalism

Empty screens with excessive whitespace, hiding navigation to achieve visual cleanliness, single-column layouts that waste horizontal space, detail views that require scrolling through empty space to reach content. Minimalism that hides information Cedar's users need is a functional failure, regardless of how clean it looks.

---

## §9 The feel test

When evaluating a Cedar screen, ask these questions in order. A screen that passes all five is correctly directed. A screen that fails any one needs revision.

1. **The 3-second test.** Can a returning user identify the screen's purpose and find the most important information within 3 seconds? If not, the hierarchy is unclear.

2. **The gray test.** View the screen in grayscale (browser devtools or OS accessibility setting). Is the information hierarchy still clear? Can you still distinguish primary, secondary, and tertiary content? If the hierarchy collapses without color, the structure is too dependent on color.

3. **The color test.** Point to every colored element on the screen. Can you articulate what each color communicates? If any color is decorative or ambiguous, it should be gray.

4. **The calm test.** After scanning the screen for 30 seconds, does it feel calmer and more organized than it did at first glance? A well-structured screen reveals its organization progressively. A poorly structured screen feels more overwhelming the longer you look at it.

5. **The trust test.** If a practice administrator saw this screen for the first time during a compliance audit, would they trust the information presented? Is the source clear? Is the provenance visible? Does the interface look like it was built with care?

---

## QA checklist — art direction

Run this checklist on any new or significantly modified screen.

- [ ] Interactive elements (buttons, nav items, form controls) are gray by default
- [ ] Color appears only on elements that carry semantic meaning (status, severity, compliance state)
- [ ] The screen uses no more than 3 semantic colors (plus gray) in the visible area
- [ ] Typography uses Regular (400) and SemiBold (600) weights; Bold (700) is limited to page titles and stat values
- [ ] The page has a clear three-level visual hierarchy (primary, secondary, tertiary content)
- [ ] Section spacing is generous (24–32px); within-section spacing is tight (8–12px)
- [ ] No decorative elements: no gradients, no illustrations on functional pages, no animated numbers
- [ ] Borders are structural only — removing a border that doesn't clarify layout improves the screen
- [ ] Animations serve state confirmation only — the removal test passes for every animation
- [ ] The screen passes the 3-second test (purpose and key information identifiable immediately)
- [ ] The screen passes the gray test (hierarchy holds without color)
- [ ] The screen passes the color test (every colored element has articulable meaning)
- [ ] The screen passes the calm test (feels more organized after 30 seconds, not more overwhelming)
- [ ] Chrome (sidebar, header, tab bar) is visually subordinate to content
- [ ] The screen avoids all five anti-pattern categories (dashboard theater, health-tech warmth, government-portal heaviness, SaaS decoration, extreme minimalism)
