# Cedar Design Standards

> **Read this before writing any UI code.** This document defines how Cedar's interface is built.
> For the complete token list, see `specs/tokens/token-reference.md`.

---

## 1. Token-First Development

Every visual value in Cedar comes from the design token system defined in `globals.css`. There are three tiers:

1. **Primitives** (`@theme { }`) — raw values that generate Tailwind utility classes
2. **Semantics** (`:root` / `.dark`) — purpose-driven aliases that swap between themes
3. **Bridge** (`@theme inline { }`) — maps CSS variables to Tailwind utilities

**The rule:** Components reference semantic tokens via Tailwind classes (`bg-primary`, `text-muted-foreground`, `rounded-lg`). Raw values (hex codes, pixel numbers, oklch values) exist only inside `globals.css` primitive definitions.

### When you need a new token
1. Check `specs/tokens/token-reference.md` — an existing token likely covers your need
2. If a token is within ±2px or ±1 shade, use it
3. If you genuinely need a new token and it will be used in 3+ places, add it to `globals.css` under the appropriate tier and update `token-reference.md`
4. If it's a one-off adjustment, use Tailwind's opacity modifier (`bg-primary/10`) or a scale step (`gap-3` instead of inventing a 13px gap)

---

## 2. Spacing

Cedar uses a **4px base grid**. Most spacing lands on 8px multiples; 4px increments serve as fine-tuning half-steps.

**Standard patterns:**
- Page outer wrapper: `space-y-6` (24px vertical rhythm)
- Card internal padding: `p-4` or `p-6`
- Section spacing: `space-y-6` between sections, `space-y-2` or `space-y-3` within
- Inline element gaps: `gap-2` (tight), `gap-3` (standard), `gap-4` (spacious)
- Form field spacing: `space-y-4`
- Badge/tag gaps: `gap-1.5` or `gap-2`

**If spacing feels wrong:** Move to the adjacent step in the scale (±4px). Never introduce arbitrary values.

---

## 3. Typography

All type sizes use fluid `clamp()` functions — they scale automatically between mobile and desktop. Use Tailwind's standard size classes.

**Standard patterns:**
- Page title: `text-2xl font-semibold text-foreground`
- Page subtitle: `text-sm text-muted-foreground`
- Section headers: `text-xs font-semibold text-muted-foreground uppercase tracking-wide`
- Body text: `text-sm text-foreground`
- Labels/captions: `text-xs text-muted-foreground`
- Data values: `text-sm font-medium text-foreground` or `text-xl font-semibold` for stats
- Button text: inherits from Button component variants (don't override)

**Font weights:** `font-normal` (400), `font-medium` (500), `font-semibold` (600), `font-bold` (700). Prefer `font-medium` for labels and `font-semibold` for headings. Use `font-bold` sparingly.

---

## 4. Border Radius

All radii derive from a single `--radius` base value (currently `0.45rem`). Changing this one value updates every radius in the app.

**Standard assignments:**
- Buttons: `rounded-md` (the Button component handles this)
- Cards: `rounded-lg` or `rounded-xl`
- Badges: `rounded-md` (inherits from Badge component)
- Inputs: `rounded-md` (inherits from Input component)
- Avatars/icons: `rounded-full`
- Modals/dialogs: `rounded-xl`
- Stat boxes inside cards: `rounded-lg`

### Nested border radius (concentric curves)
When a child element sits visually inside a rounded parent and their corners should align concentrically:

```
inner radius = max(0, outer radius − padding)
```

Apply in practice:
```html
<!-- Card with image that has concentric corners -->
<div class="rounded-xl p-4">
  <img class="rounded-[max(0px,calc(var(--radius-xl)-1rem))]" />
</div>
```

Or use the `.radius-nested` utility (set `--parent-radius` and `--parent-padding` on the container).

**Buttons, badges, and independent elements inside cards use their own radius** — they are visually separate, so concentric math does not apply.

---

## 5. Motion & Animation

Cedar's motion system uses shared keyframes and timing tokens so identical interactions feel identical everywhere.

### Transition hierarchy
1. **CSS transitions** (80% of cases): hovers, focus states, color changes → use `transition-interactive` or Tailwind's `transition-colors`
2. **Keyframe animations** (15%): panel slides, fades, entrances → use Cedar's animation utility classes
3. **Motion.dev** (5%): layout animations, complex orchestrations → only when CSS can't do it

### Animation class reference

| Interaction | Class(es) |
|------------|-----------|
| Slide-over panel enter (from right) | `.animate-panel-in-right` on panel, `.animate-scrim-in` on overlay |
| Slide-over panel exit (to right) | `.animate-panel-out-right` on panel, `.animate-scrim-out` on overlay |
| Sidebar expand (from left) | CSS transition on width (`transition-all` with `--duration-base` and `--ease-standard`) |
| Sidebar collapse (to left) | Same CSS transition (content reflows continuously during resize) |
| Dialog/modal enter | `.animate-scale-in` |
| Dialog/modal exit | `.animate-scale-out` |
| Tooltip/popover appear | `.animate-fade-in` |
| Toast notification | `.animate-fade-in` (enter), `.animate-fade-out` (exit) |
| Hover/focus on interactive elements | `.transition-interactive` or `transition-colors` |
| List item stagger | Apply `--stagger-base` delay per item via style attribute |

### Motion completeness rule
**Every animated entrance MUST have a corresponding animated exit.** Never snap-remove an element that animated in. Implementation pattern for overlay elements:

1. Track an `isClosing` state alongside the `open` state
2. When closing: set `isClosing = true`, apply the exit animation class
3. Listen for `animationend`, then unmount the element and reset state
4. The scrim and panel must animate out together

### Sidebar vs overlay panels
The sidebar is a **flex layout sibling** — it shares space with main content, which reflows when the sidebar collapses. Use CSS transitions on width. Overlay panels (slide-overs, modals) are **fixed positioned layers** — they float above content with a scrim. Use keyframe animations.

### Principles
- Entering elements use `ease-out` (deceleration). Exiting use `ease-in` (acceleration).
- Only animate `transform` and `opacity` — these are GPU-composited and maintain 60fps.
- Desktop animations should feel snappy (150–300ms). Reserve 400ms+ for large-scale motion.
- The `prefers-reduced-motion` safety net in globals.css kills all animation for users who need it.

---

## 6. Shadows

| Context | Class |
|---------|-------|
| Default cards | `shadow-sm` |
| Elevated/floating cards | `shadow-md` |
| Dropdowns, popovers | `shadow-md` |
| Modals, slide-over panels | `shadow-lg` or `shadow-xl` |
| Inputs (focus) | via `ring` system, no shadow |

---

## 7. Z-Index

Use the z-index token scale exclusively. Never use arbitrary z-index values.

| Layer | Token | Value |
|-------|-------|-------|
| Default content | `z-base` | 0 |
| Dropdowns | `z-dropdown` | 10 |
| Sticky headers | `z-sticky` | 20 |
| Scrim overlays | `z-scrim` | 40 |
| Panels/modals | `z-panel` | 50 |
| Toasts | `z-toast` | 60 |
| Tooltips | `z-tooltip` | 70 |

---

## 8. Component Decision Framework

### Use an existing component
Always check `src/components/ui/` first. These shadcn/ui primitives are the building blocks:
- Button, Input, Select, Switch, Badge, Card, Dialog, Alert, Separator, Tabs, etc.

Use them with their variant props. Never recreate their functionality.

### Extend with a variant
If an existing component almost works but needs a visual variant (e.g., a "warning" button), add a variant to its CVA config rather than creating a new component.

### Create a new component
When a pattern will appear **3+ times** across the app. Before implementing:
1. Write a spec in `specs/components/[name].md` using the 8-section template
2. Build the component in `src/components/ui/` or `src/components/` (for Cedar-specific composites)
3. Use CVA for variants, `cn()` for class merging
4. Document in token-reference.md if it introduces new tokens

### Keep it one-off
If a UI element is unique to a single page and has complex business logic, keep it local in the feature directory. Revisit when/if it recurs.

### Component naming
Name components by **what they are**, never by **where they're used**. A panel that slides in from the right is `SlideOverPanel`, not `PracticeSlideOver`. A status indicator is `StatusBadge`, not `ChangeStatusBadge`. The component's props and the calling code determine context — the component itself stays generic and reusable.

---

## 9. Dark Mode

- All semantic tokens have both `:root` (light) and `.dark` (dark) values
- Using semantic Tailwind classes (`bg-background`, `text-foreground`, `border-border`) handles dark mode automatically
- The `dark:` prefix is needed ONLY for colors that don't have semantic tokens (e.g., `bg-green-50 dark:bg-green-950` for status badges)
- Test both modes for every new UI element

---

## 10. Icons

Cedar uses **Remix Icon** exclusively:
```html
<i className="ri-[name]-line text-base" />    <!-- outline style -->
<i className="ri-[name]-fill text-base" />    <!-- filled style -->
```
- Prefer `-line` (outline) variants for UI chrome
- Use `-fill` for active/selected states
- Size via Tailwind text classes: `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`
- Color via text color classes: `text-muted-foreground`, `text-primary`, etc.

---

## 11. Page Layout Patterns

These are the established patterns. Follow them for consistency.

```
Outer wrapper:       <div className="space-y-6">
Page title:          <h1 className="text-2xl font-semibold text-foreground">
Page subtitle:       <p className="text-sm text-muted-foreground mt-1">
Section header:      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
Empty state:         py-12, icon text-3xl text-muted-foreground/40 mb-2
Back link:           inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6
```

---

## 12. Interaction State Coverage

Every interactive element must account for ALL of its possible states. Never ship a component with only its default and hover states.

### Required states per element type

**Buttons:**
- Default, hover, focus-visible (ring), active (pressed), disabled (reduced opacity + `pointer-events-none`), loading (spinner or text change, disable click during load)

**Inputs / form fields:**
- Default, focus (ring), filled, error (red border + error message below), disabled, placeholder, read-only

**Links / clickable rows:**
- Default, hover (color change or background), focus-visible (ring), active, visited (where semantically appropriate)

**Toggles / switches:**
- Off, on, hover (both states), focus-visible, disabled (both states)

**Cards / list items that are clickable:**
- Default, hover (`bg-muted/30` or similar subtle shift), focus-visible, active/selected (if applicable)

### Loading states
Every async action needs a loading indicator. Patterns:
- **Button submissions:** Change button text to "Saving…" / "Deleting…" and disable the button
- **Page data fetching:** Skeleton screens (pulsing `bg-muted animate-pulse` blocks matching the layout shape)
- **Inline updates:** Spinner icon (`ri-loader-4-line animate-spin`) next to the element being updated
- Never leave the user without feedback after they click something

### Empty states
Every data-driven view (tables, lists, feeds) must handle the empty case:
- Icon: `text-3xl text-muted-foreground/40 mb-2`
- Message: `text-sm text-muted-foreground`
- Optional action: a button or link to resolve the empty state (e.g., "Add your first practice")
- Use the shared `EmptyState` component from `components/EmptyState.tsx`

### Error states
- Form validation: red border on the field + error message below in `text-xs text-destructive`
- API errors: toast notification via Sonner, or inline error message depending on context
- Failed data loads: show an error state in the content area with a retry option
- Never fail silently — the user must know something went wrong

---

## 13. Overlay & Fixed Element Isolation

Fixed-position elements (scrims, modals, slide-over panels, toasts) must be **immune to parent layout styles**.

### Rules
- Fixed/overlay elements must render at the **top level of the component tree** or use a React portal. They must never be children of elements with `space-y-*`, `gap-*`, `overflow-hidden`, or `padding` that would affect their positioning.
- If an overlay must live inside a parent with spacing utilities for code organization reasons, apply `!m-0` to override inherited margin.
- Scrims use `fixed inset-0` — they must stretch to the absolute edges of the viewport with zero gaps.
- Test overlays at multiple viewport sizes to confirm full coverage.

### Stacking order
When multiple overlays can coexist (e.g., a toast appearing while a panel is open), follow the z-index scale strictly. Higher layers must not be clipped by lower layers.

---

## 14. Focus Management & Keyboard Navigation

### Focus trapping
Modal dialogs and slide-over panels must trap focus — Tab and Shift+Tab cycle through focusable elements within the overlay only. Radix UI primitives handle this automatically when used correctly.

### Focus restoration
When a modal or panel closes, return focus to the element that triggered it. Radix `Dialog` and `Popover` handle this. Custom overlays like `SlideOverPanel` must implement it manually.

### Keyboard shortcuts
- `Escape` closes the topmost overlay (panel, modal, dropdown)
- All interactive elements must be reachable via Tab
- Custom keyboard shortcuts must not conflict with browser defaults

### Visible focus indicators
- Use the `ring` system (`outline-ring/50` is already set globally)
- Focus indicators must be visible in both light and dark mode
- Never remove focus outlines (`outline-none`) without providing an alternative visible indicator

---

## 15. Content Overflow & Truncation

### Text overflow
- Single-line labels that may exceed their container: `truncate` (adds `overflow-hidden text-ellipsis whitespace-nowrap`)
- Multi-line descriptions that may be long: `line-clamp-2` or `line-clamp-3`
- Never let text overflow its container and break layout

### Scrollable areas
- Panel bodies: `overflow-y-auto` on the scrollable section, with header/footer pinned via `shrink-0`
- Tables with many columns: `overflow-x-auto` on the table wrapper
- Always test with realistic data volumes — 2 items and 200 items should both look right

### Long data values
- Email addresses, URLs, IDs: apply `break-all` or `truncate` depending on context
- Names: `truncate` with a `title` attribute showing the full value on hover
- Numbers: never truncate — use smaller text size if needed

---

## 16. Responsive Behavior

Cedar is a desktop-first SaaS product, but all UI must remain functional down to tablet widths (768px).

### Approach
- Use Tailwind's responsive prefixes (`md:`, `lg:`) for layout changes
- The sidebar collapses at narrow widths — main content should fill available space
- Tables: use `overflow-x-auto` wrapper; consider stacked card layouts for mobile
- Modals/panels: `max-w-full` ensures they never overflow the viewport

### Testing
- Test at: 1440px (desktop), 1024px (laptop), 768px (tablet)
- Critical: the sidebar + main content must not horizontally overflow at any width

---

## 17. Accessibility Baseline

### Color contrast
- Body text on backgrounds: minimum 4.5:1 contrast ratio (WCAG AA)
- Large text (18px+ or 14px+ bold): minimum 3:1
- Interactive elements (buttons, links): minimum 3:1 against adjacent colors
- Never convey meaning through color alone — pair with icons or text labels

### ARIA and semantics
- Every icon-only button: `aria-label` describing the action
- Form inputs: associated `<label>` or `aria-label`
- Status badges conveying meaning: include text, don't rely on color alone
- Dynamic content updates: use `aria-live` regions for toast notifications
- Decorative icons: `aria-hidden="true"`

### Touch/click targets
- Minimum interactive element size: `h-9` (36px) — enforced by shadcn/ui Button `size="sm"`
- Adequate spacing between adjacent clickable elements to prevent mis-taps

---

## 18. System Feedback Patterns

Every user action must produce clear, immediate feedback.

| Action type | Feedback pattern |
|------------|-----------------|
| Form submission | Button shows loading state → success toast or error message |
| Delete action | Confirmation step (inline or dialog) → loading → success toast |
| Toggle/switch | Immediate visual state change + optional toast for server confirmation |
| Navigation | Instant route change; skeleton loading for data |
| Filter/search | Results update immediately; show count ("3 results") |
| Copy to clipboard | Brief toast: "Copied" |
| Background process | Toast or inline indicator when complete |

### Confirmation patterns
- **Destructive actions** (delete, remove, cancel subscription): always require a confirmation step. Use inline confirmation (expand to show Confirm/Cancel buttons) for low-severity, or a Dialog for high-severity.
- **Non-destructive actions** (save, update, toggle): proceed immediately, show success feedback.

---

## 19. Quality Checklist

Before considering any UI work complete, verify:

**Visual consistency:**
- [ ] All colors from semantic tokens (no hardcoded values)
- [ ] All spacing from Tailwind scale (no arbitrary pixel values)
- [ ] Border radius from token scale
- [ ] Shadows from token scale
- [ ] Correct z-index from scale
- [ ] `node scripts/token-audit.js` passes with zero errors

**Interaction completeness:**
- [ ] All interactive states implemented (hover, focus, active, disabled, loading, error)
- [ ] Every entrance animation has a corresponding exit animation
- [ ] Loading states for all async operations
- [ ] Empty states for all data-driven views
- [ ] Error states with recovery path (retry or clear guidance)
- [ ] Confirmation step for all destructive actions

**Overlay integrity:**
- [ ] Fixed elements not affected by parent spacing/overflow
- [ ] Scrims extend to full viewport edges
- [ ] Focus trapped inside modals/panels
- [ ] Focus returns to trigger on close
- [ ] Escape key closes topmost overlay

**Content resilience:**
- [ ] Long text truncated or wrapped appropriately
- [ ] Tested with minimal data (0-1 items) and realistic volumes (50+ items)
- [ ] No horizontal overflow at 768px width

**Dark mode:**
- [ ] Tested in both light and dark themes
- [ ] All custom colors have `dark:` variants where needed
- [ ] Sufficient contrast in both modes

**Accessibility:**
- [ ] Icon-only buttons have `aria-label`
- [ ] Form inputs have labels
- [ ] Color meaning paired with text/icon
- [ ] Keyboard navigable (Tab, Escape, Enter)

---

## 20. File Locations

| What | Where |
|------|-------|
| Design tokens (source of truth) | `app/globals.css` |
| Token reference (lookup) | `specs/tokens/token-reference.md` |
| Component specs | `specs/components/[name].md` |
| shadcn/ui primitives | `src/components/ui/` |
| Cedar composite components | `src/components/` |
| Shared utilities (cn, etc.) | `src/lib/utils.ts` |
| Format utilities | `src/lib/format.ts` |
| UI constants (severity, status) | `src/lib/ui-constants.ts` |
