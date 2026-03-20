# Cedar Design Standards

> **Read this before writing any UI code.** This document defines how Cedar's interface is built.

---

## 1. Component Architecture

Cedar uses **Radix Themes** as its primary component library and **Radix Primitives + Tailwind** for custom components that Themes doesn't cover.

### Decision framework
1. **Does a Radix Themes component exist for this?** → Use it. Style through props (`variant`, `size`, `color`, `highContrast`). Import from `@radix-ui/themes`.
2. **Does a Radix Primitive exist but no Themes component?** → Build with the Primitive + Tailwind, using Radix Themes CSS variables for colors (`var(--accent-9)`, `var(--gray-6)`, `var(--color-panel-solid)`).
3. **Neither exists?** → Build with standard HTML + Tailwind, referencing Radix Themes CSS variables for visual consistency.

### Radix Themes components (use these for standard UI)
Button, IconButton, TextField, TextArea, Select, Checkbox, CheckboxGroup, RadioGroup, Switch, Slider, Dialog, AlertDialog, DropdownMenu, ContextMenu, Popover, HoverCard, Tooltip, Tabs, TabNav, Table, DataList, Badge, Callout, Card, Avatar, Separator, ScrollArea, Skeleton, Spinner, Progress, SegmentedControl, AspectRatio

### Layout primitives (use instead of raw Tailwind flex/grid)
`<Flex>`, `<Box>`, `<Grid>`, `<Container>`, `<Section>` — use their props (`gap`, `p`, `direction`, `align`, `justify`, `wrap`) and responsive objects (`gap={{ initial: "2", md: "4" }}`).

### Typography components (use instead of raw HTML headings/paragraphs)
`<Heading>`, `<Text>`, `<Code>`, `<Blockquote>`, `<Em>`, `<Kbd>`, `<Link>`, `<Quote>`, `<Strong>` — use `size` (1–9), `weight`, `color`, `highContrast` props.

### Custom builds required (Radix Primitives + Tailwind)
Accordion, Sheet/SlideOver, Sidebar, Breadcrumb, Pagination, Command palette (cmdk), Toast (Sonner)

---

## 2. Styling Rules

### For Radix Themes components
- Style through **props** (`variant="soft"`, `size="2"`, `color="green"`) — this is the primary styling mechanism
- Use **layout props** on Themes components for spacing: `<Flex gap="4" p="5">` — these reference the Radix spacing scale
- `className` on Themes components is OK for: margin overrides (`className="mt-4"`), positioning (`fixed`, `absolute`), custom widths, and anything Themes props don't cover
- Do **not** override Themes component internals (backgrounds, borders, typography) with Tailwind — use the component's props or build a custom component instead

### For custom Primitive-based components
- Style with **Tailwind classes** referencing **Radix Themes CSS variables**: `bg-[var(--accent-9)]`, `border-[var(--gray-6)]`, `text-[var(--gray-12)]`, `bg-[var(--color-panel-solid)]`
- These variables swap automatically in dark mode — no `dark:` prefix needed
- For portalled content (custom modals/sheets), wrap with `<Theme>` from `@radix-ui/themes` to inherit tokens

### Forbidden patterns
- Hardcoded hex, rgb, hsl, or oklch values in components
- Tailwind color classes that don't reference Radix tokens (e.g., `bg-green-500` — use `bg-[var(--accent-9)]` instead)
- Inline `style={{ }}` for colors or spacing (use for dynamic values only, like stagger delays or computed positions)
- Raw HTML `<button>`, `<input>`, `<select>`, `<textarea>` — use Radix Themes components

---

## 3. Color System

Cedar uses **Radix Colors** with a custom green accent and neutral gray, defined in `globals.css`. Both light and dark variants are provided — dark mode works automatically.

### The 12-step scale
| Steps | Purpose | Use for |
|-------|---------|---------|
| 1–2 | App/subtle backgrounds | Page backgrounds, card backgrounds |
| 3–5 | Interactive component backgrounds | Hover states, selected states, soft badges |
| 6–8 | Borders | Subtle borders (6), interactive borders (7), strong borders (8) |
| 9 | Solid backgrounds | Primary buttons, filled badges |
| 10 | Hovered solid backgrounds | Primary button hover state |
| 11–12 | Text | Low-contrast text (11), high-contrast text (12) |

### Accessing colors
- On Radix Themes components: `color="green"` prop
- On custom components: `var(--accent-1)` through `var(--accent-12)`, `var(--gray-1)` through `var(--gray-12)`
- Alpha variants: `var(--accent-a1)` through `var(--accent-a12)` — transparent versions for overlays
- Semantic shortcuts: `var(--color-background)`, `var(--color-surface)`, `var(--color-overlay)`, `var(--color-panel-solid)`, `var(--color-panel-translucent)`

### Status colors
Use named Radix color scales for status indicators:
- Success: `color="green"` or `var(--green-9)`
- Warning: `color="amber"` or `var(--amber-9)`
- Error/destructive: `color="red"` or `var(--red-9)`
- Info: `color="blue"` or `var(--blue-9)`

---

## 4. Spacing

Radix Themes provides a 9-step spacing scale. Use layout primitive props for Themes components, Tailwind for custom components.

| Step | Value | Themes prop | Tailwind |
|------|-------|-------------|----------|
| 1 | 4px | `gap="1"`, `p="1"` | `gap-1`, `p-1` |
| 2 | 8px | `gap="2"`, `p="2"` | `gap-2`, `p-2` |
| 3 | 12px | `gap="3"`, `p="3"` | `gap-3`, `p-3` |
| 4 | 16px | `gap="4"`, `p="4"` | `gap-4`, `p-4` |
| 5 | 24px | `gap="5"`, `p="5"` | `gap-6`, `p-6` |
| 6 | 32px | `gap="6"`, `p="6"` | `gap-8`, `p-8` |
| 7 | 40px | `gap="7"`, `p="7"` | `gap-10`, `p-10` |
| 8 | 48px | `gap="8"`, `p="8"` | `gap-12`, `p-12` |
| 9 | 64px | `gap="9"`, `p="9"` | `gap-16`, `p-16` |

**Standard patterns:**
- Page outer wrapper: `<Flex direction="column" gap="6">`
- Card internal padding: `<Card size="3">` or `<Box p="4">`
- Section spacing: `gap="6"` between sections, `gap="2"` within
- Form field spacing: `<Flex direction="column" gap="4">`

---

## 5. Typography

Use Radix Themes typography components with their `size` prop (1–9 scale).

**Standard patterns:**
- Page title: `<Heading size="6" weight="bold">`
- Page subtitle: `<Text size="2" color="gray">`
- Section headers: `<Text size="1" weight="bold" color="gray">` with `className="uppercase tracking-wide"`
- Body text: `<Text size="2">`
- Labels/captions: `<Text size="1" color="gray">`
- Data values: `<Text size="2" weight="medium">` or `<Text size="5" weight="bold">` for stats

Font: Geist (overridden via `--default-font-family` in globals.css).

---

## 6. Border Radius

Controlled globally by `<Theme radius="large">`. Individual components accept a `radius` prop to override. The global setting produces consistent radius across all Themes components automatically.

Radix Themes radius scale: `--radius-1` through `--radius-6`, derived from the theme's `radius` setting.

For custom Primitive-based components, reference `var(--radius-3)` or similar tokens.

---

## 7. Shadows

Radix Themes provides `--shadow-1` through `--shadow-6`. These auto-adapt in dark mode.

| Context | Token |
|---------|-------|
| Cards | `var(--shadow-2)` or Card component's built-in shadow |
| Dropdowns, popovers | Handled by Themes components automatically |
| Modals, slide-over panels | `var(--shadow-5)` or `var(--shadow-6)` |
| Custom elevated elements | `shadow-[var(--shadow-3)]` in Tailwind |

---

## 8. Motion & Animation

Cedar's motion system uses custom keyframes and timing tokens defined in `globals.css`. Radix Themes does not provide motion tokens — Cedar defines its own.

### Duration tokens
| Token | Value | Use for |
|-------|-------|---------|
| `--duration-instant` | 100ms | Toggles, color changes |
| `--duration-fast` | 150ms | Hovers, tooltips |
| `--duration-base` | 200ms | Standard transitions |
| `--duration-moderate` | 300ms | Panels, drawers |
| `--duration-slow` | 400ms | Large-scale entrances |
| `--duration-slower` | 500ms | Complex orchestrations |

### Easing tokens
| Token | Use for |
|-------|---------|
| `--ease-standard` | Default for most transitions |
| `--ease-out` | Elements entering |
| `--ease-in` | Elements exiting |
| `--ease-emphasized` | Attention-grabbing (slight overshoot) |
| `--ease-spring` | Playful interactions |

### Animation classes (defined in globals.css)
| Interaction | Class(es) |
|------------|-----------|
| Slide-over panel enter | `.animate-panel-in-right` on panel, `.animate-scrim-in` on overlay |
| Slide-over panel exit | `.animate-panel-out-right` on panel, `.animate-scrim-out` on overlay |
| Sidebar expand/collapse | CSS transition on width with `--duration-base` and `--ease-standard` |
| Dialog/modal enter | `.animate-scale-in` |
| Dialog/modal exit | `.animate-scale-out` |
| Hover/focus | `.transition-interactive` or Tailwind `transition-colors` |

### Motion completeness rule
**Every animated entrance MUST have a corresponding animated exit.** Implementation pattern:
1. Track an `isClosing` state alongside the `open` state
2. When closing: set `isClosing = true`, apply exit animation class
3. Listen for `animationend`, then unmount and reset state

### Principles
- Entering = `ease-out`, exiting = `ease-in`
- Only animate `transform` and `opacity` (GPU-composited, 60fps)
- Desktop: 150–300ms. Reserve 400ms+ for large-scale motion.
- `prefers-reduced-motion` safety net in globals.css kills all animation automatically.

---

## 9. Dark Mode

Radix Themes handles dark mode automatically through the color token system.

- `next-themes` applies `.dark` to `<html>` → Radix Colors swap all 12-step scales
- Radix Themes components adapt automatically — no `dark:` prefixes needed
- Custom Primitive-based components: use `var(--accent-*)` and `var(--gray-*)` tokens — they swap automatically
- Avoid raw Tailwind color classes (`bg-green-500`) on custom components — use `bg-[var(--accent-9)]` instead so dark mode works
- Test both modes for every new UI element

---

## 10. Icons

Cedar uses **Remix Icon** exclusively:
```html
<i className="ri-[name]-line" />   <!-- outline -->
<i className="ri-[name]-fill" />   <!-- filled -->
```
- Prefer `-line` for UI chrome, `-fill` for active/selected states
- Wrap icon-only buttons with Radix `<IconButton>`: `<IconButton variant="ghost" size="2"><i className="ri-settings-3-line" /></IconButton>`
- Size icons via Tailwind text classes: `text-sm`, `text-base`, `text-lg`
- Color via Radix token references: `text-[var(--gray-11)]`, `text-[var(--accent-11)]`

---

## 11. Page Layout Patterns

Use Radix Themes layout primitives for structure:

```tsx
// Page wrapper
<Flex direction="column" gap="6">

// Page title
<Heading size="6" weight="bold">Page Title</Heading>

// Page subtitle
<Text size="2" color="gray">Description text</Text>

// Section header
<Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">Section</Text>

// Empty state
<Flex direction="column" align="center" justify="center" py="9">
  <i className="ri-filter-off-line text-3xl text-[var(--gray-a8)]" />
  <Text size="2" color="gray" mt="2">No items found.</Text>
</Flex>
```

---

## 12. Interaction State Coverage

Every interactive element must account for ALL of its possible states.

**Buttons:** Default, hover, focus-visible, active, disabled, loading (use Radix `<Button loading>` prop or swap text to "Saving…")

**Inputs:** Default, focus, filled, error (red border + error message), disabled, placeholder

**Clickable rows/cards:** Default, hover (subtle background shift), focus-visible

**Toggles:** Off, on, hover (both), focus-visible, disabled (both)

### Loading states
- **Button submissions:** Use Radix Button's `loading` prop or `disabled` + text change
- **Page data fetching:** Use Radix `<Skeleton>` wrapping content placeholders
- **Inline updates:** Use Radix `<Spinner size="1">` next to the element
- Never leave the user without feedback after they click something

### Empty states
Every data-driven view must handle the empty case with an icon, message, and optional action.

### Error states
- Form validation: `color="red"` on the field + `<Text size="1" color="red">` message below
- API errors: toast via Sonner
- Failed data loads: error state with retry option

---

## 13. Overlay & Fixed Element Isolation

- Fixed/overlay elements must render at the top level or use portals
- Radix Themes overlays (Dialog, Popover, DropdownMenu, etc.) handle portals automatically
- Custom overlays built with Primitives must wrap portalled content in `<Theme>`
- Overlays must never inherit parent `gap-*` or spacing
- Test overlays at multiple viewport sizes

---

## 14. Focus Management & Keyboard Navigation

- Radix Themes components handle focus trapping and restoration automatically
- Custom overlays must implement focus trapping manually or use Radix Dialog Primitive
- `Escape` closes the topmost overlay
- All interactive elements reachable via Tab
- Visible focus indicators in both light and dark mode

---

## 15. Content Overflow & Truncation

- Single-line overflow: use Radix `<Text truncate>` or Tailwind `truncate`
- Multi-line: Tailwind `line-clamp-2` or `line-clamp-3`
- Scrollable panels: `overflow-y-auto` on body, `shrink-0` on header/footer
- Tables: `overflow-x-auto` wrapper
- Test with 2 items and 200 items

---

## 16. Responsive Behavior

Desktop-first SaaS, functional down to 768px.

- Radix Themes supports responsive props: `<Grid columns={{ initial: "1", md: "2" }}>`
- Tailwind responsive prefixes (`md:`, `lg:`) for custom components
- Test at 1440px, 1024px, 768px

---

## 17. Accessibility

- Radix Themes components are WCAG-compliant by default (WAI-ARIA patterns built in)
- Radix Colors guarantee APCA contrast (step 11 = Lc 60, step 12 = Lc 90)
- Icon-only buttons: `aria-label` on `<IconButton>`
- Form inputs: associated labels
- Color meaning paired with text/icon
- `<Callout>` for alerts (accessible by default)

---

## 18. System Feedback Patterns

| Action type | Feedback pattern |
|------------|-----------------|
| Form submission | Button loading state → success toast or error |
| Delete action | Confirmation (inline or AlertDialog) → loading → toast |
| Toggle/switch | Immediate visual change + optional toast |
| Navigation | Route change; Skeleton loading for data |
| Filter/search | Immediate update; show result count |

**Destructive actions** always require confirmation. Use `<AlertDialog>` for high-severity.

---

## 19. Component Naming

Name components by **what they are**, never by **where they're used**. A slide-over panel is `SlideOverPanel`, not `PracticeSlideOver`. Props and calling code determine context.

---

## 20. Quality Checklist

Before considering any UI work complete:

- [ ] All standard UI uses Radix Themes components (no raw HTML for covered elements)
- [ ] Custom components reference Radix CSS variables for colors (no hardcoded values)
- [ ] Dark mode tested — both themes look correct
- [ ] All interactive states implemented (hover, focus, disabled, loading, error)
- [ ] Every entrance animation has a corresponding exit animation
- [ ] Loading states for all async operations (use Skeleton, Spinner, or button loading)
- [ ] Empty states for all data views
- [ ] Error states with recovery path
- [ ] Confirmation step for all destructive actions
- [ ] Overlays not affected by parent spacing
- [ ] Focus trapped in modals/panels
- [ ] Long text truncated appropriately
- [ ] Tested at 1440px and 768px width
- [ ] Icon-only buttons have `aria-label`

---

## 21. File Locations

| What | Where |
|------|-------|
| Design tokens + custom colors | `app/globals.css` |
| Design standards (this file) | `docs/design-system/design-standards.md` |
| Component specs | `specs/components/[name].md` |
| Cedar composite components | `components/` |
| Shared utilities (cn, etc.) | `lib/utils.ts` |
| Format utilities | `lib/format.ts` |
| UI constants | `lib/ui-constants.ts` |
