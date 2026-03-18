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

Apply this in practice:
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
| Sidebar expand (from left) | `.animate-panel-in-left` |
| Sidebar collapse (to left) | `.animate-panel-out-left` |
| Dialog/modal enter | `.animate-scale-in` |
| Dialog/modal exit | `.animate-scale-out` |
| Tooltip/popover appear | `.animate-fade-in` |
| Toast notification | `.animate-fade-in` (enter), `.animate-fade-out` (exit) |
| Hover/focus on interactive elements | `.transition-interactive` or `transition-colors duration-fast` |
| List item stagger | Apply `--stagger-base` delay per item via style attribute |

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

## 12. File Locations

| What | Where |
|------|-------|
| Design tokens (source of truth) | `src/styles/globals.css` |
| Token reference (lookup) | `specs/tokens/token-reference.md` |
| Component specs | `specs/components/[name].md` |
| shadcn/ui primitives | `src/components/ui/` |
| Cedar composite components | `src/components/` |
| Shared utilities (cn, etc.) | `src/lib/utils.ts` |
| Format utilities | `src/lib/format.ts` |
| UI constants (severity, status) | `src/lib/ui-constants.ts` |
