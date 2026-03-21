# Cedar Design Standards

> **Read this before writing any UI code.** This document defines how Cedar's interface is built — from architecture decisions down to specific variant and color choices for every component.

---

## 1. Design Philosophy

Cedar's UI follows a **neutral-interactive, colorful-informational** model. Interactive elements (buttons, toggles, nav links, form controls) are neutral gray by default. Color is reserved for communicating information — severity, status, roles, deadlines, success/error states.

This separation keeps the interface clean and professional, and lets color carry meaning wherever it appears. Green remains loaded as the theme accent for future use (CTAs, upsells, brand moments) but is currently treated as a semantic color (approved, success) alongside other Radix color scales.

### Core rules

- **Buttons and interactive controls:** Gray with `highContrast` by default. Color only for semantic purpose (red for destructive, green for success confirmation).
- **Badges and status indicators:** Specific Radix color per semantic meaning. Always via the `color` prop — never via className overrides.
- **Links:** Gray color, underline style. Visually distinct from body text through contrast and decoration.
- **Focus rings:** Gray. Overridden in `globals.css` to replace the default accent-colored focus ring.
- **No one-off custom colors.** Every color must resolve to either a Radix Themes `color` prop or a Cedar semantic token (`--cedar-*`). Hardcoded hex, rgb, hsl, oklch, or non-Radix Tailwind colors (`bg-green-500`) are forbidden in components.

---

## 2. Theme Configuration

```tsx
// providers.tsx
<Theme
  accentColor="green"       // Available for explicit use; not the default for interactive elements
  grayColor="gray"
  radius="large"
  scaling="100%"
  panelBackground="translucent"
>
```

The accent stays green so it's available when needed via `color="green"`. The behavioral shift happens at the component level: every interactive element explicitly sets `color="gray"` (and `highContrast` where appropriate) to opt out of the green accent default.

Focus rings are overridden to gray in `globals.css` so that all focus indicators remain neutral regardless of component color.

---

## 3. Component Architecture

Cedar uses **Radix Themes** as its primary component library and **Radix Primitives + Tailwind** for custom components that Themes doesn't cover.

### Decision framework

1. **Does a Radix Themes component exist for this?** → Use it. Style through props (`variant`, `size`, `color`, `highContrast`). Import from `@radix-ui/themes`.
2. **Does a Radix Primitive exist but no Themes component?** → Build with the Primitive + Tailwind, using **Cedar semantic tokens** (`--cedar-*`) for all visual properties.
3. **Neither exists?** → Build with standard HTML + Tailwind, using **Cedar semantic tokens** for all visual properties.

### Radix Themes components (use for standard UI)

Button, IconButton, TextField, TextArea, Select, Checkbox, CheckboxGroup, RadioGroup, Switch, Slider, Dialog, AlertDialog, DropdownMenu, ContextMenu, Popover, HoverCard, Tooltip, Tabs, TabNav, Table, DataList, Badge, Callout, Card, Avatar, Separator, ScrollArea, Skeleton, Spinner, Progress, SegmentedControl, AspectRatio

### Layout primitives (use instead of raw Tailwind flex/grid)

`<Flex>`, `<Box>`, `<Grid>`, `<Container>`, `<Section>` — use their props (`gap`, `p`, `direction`, `align`, `justify`, `wrap`) and responsive objects (`gap={{ initial: "2", md: "4" }}`).

### Typography components (use instead of raw HTML headings/paragraphs)

`<Heading>`, `<Text>`, `<Code>`, `<Blockquote>`, `<Em>`, `<Kbd>`, `<Link>`, `<Quote>`, `<Strong>` — use `size` (1–9), `weight`, `color`, `highContrast` props.

### Custom builds required (Radix Primitives + Tailwind + Cedar tokens)

Accordion, Sheet/SlideOver, Sidebar, Breadcrumb, Pagination, Command palette (cmdk), Toast (Sonner)

---

## 4. Styling Rules

### For Radix Themes components

- Style through **props** (`variant="soft"`, `size="2"`, `color="gray"`, `highContrast`) — this is the primary styling mechanism
- Use **layout props** on Themes components for spacing: `<Flex gap="4" p="5">`
- `className` on Themes components is OK for: margin overrides, positioning (`fixed`, `absolute`), custom widths, and anything Themes props don't cover
- Do **not** override Themes component color internals (backgrounds, borders, text colors) with Tailwind — use the component's `color` and `variant` props

### For custom Primitive-based components

- Style with **Tailwind classes** referencing **Cedar semantic tokens**: `bg-[var(--cedar-interactive-hover)]`, `border-[var(--cedar-border-subtle)]`, `text-[var(--cedar-text-primary)]`
- **Never reference raw Radix step variables** (`var(--gray-6)`, `var(--gray-12)`) directly in component files. Always use the corresponding `--cedar-*` token. Raw Radix variables are mapped to Cedar tokens in `globals.css` — that is the only place they appear.
- Cedar semantic tokens auto-swap in dark mode (they're built on Radix variables which swap automatically) — no `dark:` prefix needed
- For portalled content (custom modals/sheets), wrap with `<Theme>` from `@radix-ui/themes` to inherit all tokens

### Forbidden patterns

**Color violations:**
- `var(--gray-6)` in a component file — use `var(--cedar-border-subtle)` instead
- `var(--gray-12)` in a component file — use `var(--cedar-text-primary)` instead
- `var(--color-panel-solid)` in a component file — use `var(--cedar-panel-bg-solid)` instead
- `bg-green-500`, `text-red-600` — raw Tailwind color classes; use Cedar tokens or Radix `color` prop
- `text-[#ff0000]`, `bg-[rgb(0,128,0)]` — hardcoded hex, rgb, hsl, or oklch values
- `className="text-gray-500"` on a Radix Themes component — use the `color` prop instead
- Inline `style={{ color: 'red' }}` — use Radix `color="red"` prop or `var(--cedar-error-text)`
- `className` color overrides on Badge, Button, or IconButton when the `color` prop achieves the same result

**Dark mode violations:**
- `dark:bg-gray-800`, `dark:text-white` — Cedar tokens auto-swap via Radix Colors; `dark:` prefixes are unnecessary and create conflicts with the token system

**Component violations:**
- Raw HTML `<button>`, `<input>`, `<select>`, `<textarea>` — use Radix Themes `<Button>`, `<TextField>`, `<Select>`, `<TextArea>`
- `import { Dialog } from '@radix-ui/react-dialog'` when the component exists in Radix Themes — import from `@radix-ui/themes` first; only use individual Primitive packages for components Themes doesn't cover (Accordion, etc.)
- `className="rounded-lg"` on a Radix Themes component — use the `radius` prop
- Overriding Radix Themes component backgrounds/borders with Tailwind classes — use variant/color props instead

**Spacing violations:**
- `p-[13px]`, `mt-[7px]` — arbitrary pixel spacing; use Tailwind scale values that align with the Radix spacing scale
- `gap-4` on a `<Flex>` or `<Grid>` from `@radix-ui/themes` — use Radix layout props (`gap="4"`) on Themes layout components; Tailwind spacing is for custom components

**Focus violations:**
- `focus:ring-blue-500`, `focus:outline-green-400` — use `focus-visible:ring-[var(--cedar-focus-ring)]` for custom components; Radix Themes components handle focus automatically

**Utility violations:**
- Local `timeAgo()`, `formatDate()`, `capitalize()` functions — use shared utilities from `lib/format.ts`
- Local severity/status color maps — use shared mappings from `lib/ui-constants.ts`

---

## 5. Cedar Semantic Tokens

Cedar defines a semantic token layer in `globals.css` (inside `.radix-themes`) that maps design intent to Radix CSS variables. Custom Primitive-based components reference these tokens exclusively. When Cedar's design language changes, the token mappings in `globals.css` are updated in one place and every custom component follows automatically.

**Source of truth:** `app/globals.css` — all `--cedar-*` definitions live there and only there.

### Token categories

**Text** (`--cedar-text-*`): Controls all text color in custom components. Tokens: `primary`, `secondary`, `muted`, `contrast`, `link`, `link-hover`.

**Interactive** (`--cedar-interactive-*`): Background colors for interactive elements — nav items, list rows, clickable regions. Tokens: `bg` (transparent default), `hover`, `active`, `selected`.

**Surfaces & panels** (`--cedar-page-bg`, `--cedar-panel-bg`, `--cedar-panel-bg-solid`, `--cedar-surface-bg`, `--cedar-card-bg`, `--cedar-card-hover`): Background colors for structural regions.

**Borders** (`--cedar-border-*`): Three levels — `subtle` (dividers, cards), `interactive` (inputs), `strong` (emphasized/headers).

**Focus** (`--cedar-focus-*`): `ring` (focus ring color) and `offset` (gap between ring and element). Radix Themes components handle focus automatically — these tokens are for custom Primitive-based components only.

**Overlays** (`--cedar-overlay`): Scrim behind modals, slide-overs, dialogs.

**Status** (`--cedar-success-*`, `--cedar-warning-*`, `--cedar-error-*`, `--cedar-info-*`): Each status has four tokens — `bg`, `text`, `solid`, `border`. Use for custom status indicators that aren't Radix Themes components.

**Disabled** (`--cedar-disabled-*`): `bg`, `text`, `border` for disabled elements in custom components.

**Accent** (`--cedar-accent-*`): Brand green — `bg`, `text`, `solid`, `border`. Available but reserved for intentional use (approved badges, success states, future CTAs).

### Using tokens in custom components

```tsx
// Custom sidebar nav item
<button className="
  text-[var(--cedar-text-secondary)]
  hover:bg-[var(--cedar-interactive-hover)]
  hover:text-[var(--cedar-text-primary)]
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cedar-focus-ring)]
  transition-interactive
">

// Custom slide-over panel
<div className="
  bg-[var(--cedar-panel-bg-solid)]
  border-l border-[var(--cedar-border-subtle)]
  shadow-[var(--shadow-6)]
">

// Custom error state in a Primitive-based component
<div className="
  bg-[var(--cedar-error-bg)]
  border border-[var(--cedar-error-border)]
  text-[var(--cedar-error-text)]
">
```

### When to use tokens vs Radix props

| Building with... | Color method |
|---|---|
| Radix Themes component (Button, Badge, Card, etc.) | `variant`, `color`, `highContrast` props |
| Radix Primitive + Tailwind (Sidebar, Sheet, Accordion) | `--cedar-*` tokens via Tailwind classes |
| Mixed (custom wrapper containing Radix children) | Wrapper uses `--cedar-*` tokens; children use Radix props |
| Portalled custom component | Wrap in `<Theme>`, then use `--cedar-*` tokens |

---

## 6. Buttons & Interactive Elements

All buttons default to **gray with highContrast**. In light mode this renders as crisp black; in dark mode as bright white. The `classic` variant is used for primary actions — it has a subtle 3D pressed effect that distinguishes it from the flat `solid` variant.

| Use case | Component | Props |
|---|---|---|
| **Primary action** (save, submit, confirm) | `<Button>` | `variant="classic" color="gray" highContrast` |
| **Secondary action** (cancel, back, reset) | `<Button>` | `variant="soft" color="gray" highContrast` |
| **Tertiary / utility** (card actions, filters) | `<Button>` or `<IconButton>` | `variant="ghost" color="gray"` |
| **Destructive (low-stakes)** (remove item, clear) | `<Button>` | `variant="soft" color="red"` |
| **Destructive (high-stakes)** (delete account, in AlertDialog) | `<Button>` | `variant="solid" color="red"` |
| **Sign out** | `<Button>` | `variant="ghost" color="gray"` + `className="hover:text-[var(--cedar-error-text)]"` |
| **Theme toggle** | `<IconButton>` | `variant="ghost" color="gray"` |
| **Sidebar collapse/expand** | `<IconButton>` | `variant="ghost" color="gray"` |
| **Icon-only actions** (edit, delete, close) | `<IconButton>` | `variant="ghost" color="gray"` — add `aria-label` |

### Loading states

Use the Radix `loading` prop on Button for submissions: `<Button loading>Saving...</Button>`. For icon buttons, use `disabled` + adjacent `<Spinner size="1">`.

### Future accent reintroduction

To bring green (or any color) back on primary buttons: remove `color="gray" highContrast` — they will inherit the theme's `accentColor`. Or set `color="green"` explicitly on individual components.

---

## 7. Badges

All badges use the Radix `color` prop. **No manual className color overrides.** Radix handles light/dark adaptation automatically.

### Variant strategy

- **`soft`** — default for most badges. Tinted background with readable text. Use for severity, status, roles, service lines.
- **`outline`** — lighter visual weight. Use for metadata labels: authority levels, confidence scores, deadlines, relationship types.

### Severity

| Level | Props |
|---|---|
| Critical | `variant="soft" color="red"` |
| High | `variant="soft" color="orange"` |
| Medium | `variant="soft" color="amber"` |
| Low | `variant="soft" color="green"` |
| Informational | `variant="soft" color="blue"` |

No severity dot. The `soft` variant's tinted background carries the color signal.

### Status

| Status | Props | Icon |
|---|---|---|
| Approved / Reviewed | `variant="soft" color="green"` | `ri-shield-check-line` |
| Pending / Pending Review | `variant="soft" color="amber"` | — |
| Rejected | `variant="soft" color="red"` | — |
| Auto-approved / Not Required | `variant="soft" color="gray"` | `ri-robot-line` |

### Role & Tier

| Badge | Props |
|---|---|
| Admin | `variant="soft" color="amber"` |
| Intelligence tier | `variant="soft" color="purple"` |
| Monitor tier | `variant="soft" color="gray"` |

### Authority Level

| Authority | Props |
|---|---|
| Federal Statute | `variant="outline" color="red"` |
| Federal Regulation | `variant="outline" color="orange"` |
| Sub-Regulatory Guidance | `variant="outline" color="amber"` |
| National Coverage Determination | `variant="outline" color="blue"` |
| Local Coverage Determination | `variant="outline" color="cyan"` |
| State Statute | `variant="outline" color="purple"` |
| State Board Rule | `variant="outline" color="indigo"` |
| Professional Standard | `variant="outline" color="gray"` |

### Confidence

| Range | Props |
|---|---|
| > 80% | `variant="outline" color="green"` |
| 50–80% | `variant="outline" color="amber"` |
| < 50% | `variant="outline" color="red"` |

### Deadline

| Condition | Props |
|---|---|
| Urgent (≤ 7 days) | `variant="outline" color="red"` |
| Soon (≤ 30 days) | `variant="outline" color="amber"` |
| Passed / Normal | `variant="outline" color="gray"` |

### Other badges

| Badge | Props |
|---|---|
| "SOON" (disabled features) | `variant="soft" color="gray"` |
| Service line tags | `variant="soft" color="gray"` |
| Relationship type | `variant="outline" color="gray"` |
| Regulation type | `variant="soft" color="gray"` |

### Implementation: `ui-constants.ts`

Replace all `_CLASS` / `_DOT` mappings with `_COLOR` mappings that export Radix color names. Components use these via `color={SEVERITY_COLOR[key] as any}`. Remove `SEVERITY_CLASS`, `SEVERITY_DOT`, `STATUS_CLASS`, `AUTHORITY_LEVEL_CLASS`.

---

## 8. Cards

Default variant: **`surface`** — subtle border with translucent background.

| Use case | Props |
|---|---|
| Standard content card | `<Card variant="surface">` |
| Clickable/interactive card | `<Card variant="surface" asChild>` wrapping a link or button |
| Dashboard stat card | `<Card variant="surface" size="2">` |
| No-chrome inline grouping | `<Card variant="ghost">` |

Clickable cards: `className="hover:bg-[var(--cedar-card-hover)] transition-colors"`.

---

## 9. Tables

| Use case | Props |
|---|---|
| Data tables (default) | `<Table.Root variant="surface">` |
| Inline/embedded tables | `<Table.Root variant="ghost">` |

Size `2` for standard data tables. Size `1` for compact/dense views.

---

## 10. Form Controls

All form controls use gray as the default.

| Component | Default props |
|---|---|
| TextField | `variant="surface"` |
| TextArea | `variant="surface"` |
| Select | `variant="surface"` |
| Switch | `color="gray"` |
| Checkbox | `color="gray"` |
| RadioGroup | `color="gray"` |
| Slider | `color="gray"` |

### Error states

On validation errors, set `color="red"` on the field component and add `<Text size="1" color="red">` below.

### Sizing

Default `size="2"`. Use `size="3"` for prominent standalone forms. Use `size="1"` for compact/inline controls.

---

## 11. Links

```tsx
<Link href="/path" color="gray" highContrast underline="always">
  Link text
</Link>
```

For subtle links (breadcrumbs, back links): `underline="hover"`.

---

## 12. Tabs & Navigation

| Component | Props or tokens |
|---|---|
| Tabs (page sections) | `<Tabs.Root>` — inherits gray from theme context |
| TabNav | Same neutral treatment |
| Sidebar active link | `bg-[var(--cedar-interactive-selected)] text-[var(--cedar-text-primary)] font-medium` |
| Sidebar inactive link | `text-[var(--cedar-text-secondary)] hover:bg-[var(--cedar-interactive-hover)] hover:text-[var(--cedar-text-primary)]` |
| Sidebar disabled link | `text-[var(--cedar-text-muted)] cursor-not-allowed` |

---

## 13. Callouts

| Type | Props |
|---|---|
| Informational | `<Callout.Root color="blue">` |
| Warning | `<Callout.Root color="amber">` |
| Error | `<Callout.Root color="red">` |
| Success | `<Callout.Root color="green">` |
| Neutral/tip | `<Callout.Root color="gray">` |

---

## 14. Dialogs & AlertDialogs

| Element | Props |
|---|---|
| Dialog | Primary: `<Button variant="classic" color="gray" highContrast>`. Cancel: `<Button variant="soft" color="gray">`. |
| AlertDialog (destructive) | Confirm: `<Button variant="solid" color="red">`. Cancel: `<Button variant="soft" color="gray">`. |

Button placement: cancel left, action right.

---

## 15. Dropdown Menus & Context Menus

Standard items: no `color` override. Destructive items: `color="red"`.

---

## 16. Tooltips & Popovers

Use Radix Themes defaults. No overrides needed.

---

## 17. Progress, Skeleton, Spinner

| Component | Props |
|---|---|
| Progress bar | `<Progress color="gray">` |
| Skeleton | Default |
| Spinner | `size="1"` inline, `size="3"` page-level |

---

## 18. Separators

`<Separator>` uses Radix defaults. Custom separators: `border-[var(--cedar-border-subtle)]`.

---

## 19. Color System

Cedar uses **Radix Colors** with a custom green accent and neutral gray, defined in `globals.css`.

### The 12-step scale

| Steps | Purpose | Use for |
|-------|---------|---------|
| 1–2 | App/subtle backgrounds | Page backgrounds, card backgrounds |
| 3–5 | Interactive component backgrounds | Hover states, selected states, soft badges |
| 6–8 | Borders | Subtle (6), interactive (7), strong (8) |
| 9 | Solid backgrounds | Filled badges, solid buttons |
| 10 | Hovered solid backgrounds | Solid button hover |
| 11–12 | Text | Low-contrast (11), high-contrast (12) |

### Semantic color usage

| Meaning | Radix color |
|---------|-------------|
| Success / Approved | `green` |
| Warning / Pending | `amber` |
| Error / Destructive | `red` |
| Info | `blue` |
| Neutral / Default | `gray` |
| Premium tier | `purple` |
| Admin | `amber` |
| High urgency | `orange` |

### Available Radix color scales

Cedar primarily uses: **gray, red, orange, amber, green, blue, purple, indigo, cyan**. Full palette also includes: Gold, Bronze, Brown, Yellow, Tomato, Ruby, Crimson, Pink, Plum, Violet, Iris, Teal, Jade, Grass, Lime, Mint, Sky.

---

## 20. Spacing & Units

**Important:** Radix Themes and Tailwind use different numbering for the same pixel values. Radix `gap="5"` = 24px = Tailwind `gap-6`. Always verify the target pixel value when switching between systems, and avoid mixing Radix layout props with Tailwind spacing on the same element.

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

**Rule of thumb:** Radix Themes components use Radix props for spacing. Custom Primitive-based components use Tailwind classes for spacing. The pixel value column is the shared reference when converting between them.

**Standard patterns:** Page wrapper `gap="6"`, card padding `size="3"` or `p="4"`, section spacing `gap="6"` between / `gap="2"` within, form fields `gap="4"`.

### Unit selection

Choose CSS units based on what the value represents:

| Unit | Use for | Examples |
|------|---------|---------|
| `rem` | Font sizes, spacing in custom components | `text-sm` (0.875rem), `gap-4` (1rem). Scales with user's browser font-size preference. |
| `px` | Borders, outlines, box-shadows, fine details | `border`, `outline-2`, `ring-2`, `shadow-sm`. Fixed-size details that should remain crisp at any zoom level. |
| `%` | Relative sizing within a parent container | `w-full`, `max-w-[50%]`. Fluid proportional layouts. |
| `ch` | Text container max-widths | `max-w-prose` (~65ch). Character-count-based widths for readable line lengths. |
| `dvh` / `dvw` | Viewport-relative dimensions on mobile-aware layouts | `min-h-dvh` for full-height app shells. Dynamic viewport units account for mobile browser chrome. Prefer `dvh` over `vh`. |
| Radix scale values | Spacing and sizing on Radix Themes layout components | `gap="4"`, `p="5"`, `size="2"`. These map to the spacing table above. |

**Forbidden unit patterns:**
- `px` for font-size — breaks browser accessibility settings; use `rem` via Tailwind size classes
- `vh` / `vw` for layout dimensions — use `dvh` / `dvw` (dynamic viewport units account for mobile browser chrome)
- Arbitrary pixel values (`p-[13px]`, `mt-[7px]`) when a Tailwind scale value exists — use the scale

---

## 21. Typography

- Page title: `<Heading size="6" weight="bold">`
- Page subtitle: `<Text size="2" color="gray">`
- Section headers: `<Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">`
- Body text: `<Text size="2">`
- Labels/captions: `<Text size="1" color="gray">`
- Data values: `<Text size="2" weight="medium">` or `<Text size="5" weight="bold">` for stats

Font: Geist (via `--default-font-family` in globals.css).

---

## 22. Border Radius

Controlled globally by `<Theme radius="large">`. Override per-component via `radius` prop. Custom components: `var(--radius-3)` etc.

---

## 23. Shadows

| Context | Token |
|---------|-------|
| Cards | Built-in via `variant="surface"` |
| Dropdowns, popovers | Automatic |
| Modals, slide-overs | `var(--shadow-5)` or `var(--shadow-6)` |
| Custom elevated elements | `shadow-[var(--shadow-3)]` |

---

## 24. Motion & Animation

Duration tokens: `--duration-instant` (100ms) through `--duration-slower` (500ms). Easing: `--ease-standard`, `--ease-out`, `--ease-in`, `--ease-emphasized`, `--ease-spring`.

### Animation library

All animation utility classes are defined in `globals.css`. Entrance animations use `ease-out` (decelerate into place). Exit animations use `ease-in` (accelerate away). Every animated entrance MUST have a corresponding exit.

| Category | Entrance class | Exit class | Use for |
|----------|---------------|------------|---------|
| **Slide** | `.animate-slide-in-right` | `.animate-slide-out-right` | Simple positional — mobile nav, toasts |
| | `.animate-slide-in-left` | `.animate-slide-out-left` | Reverse direction panels |
| | `.animate-slide-in-bottom` | `.animate-slide-out-bottom` | Bottom sheets, action bars |
| **Panel** | `.animate-panel-in-right` | `.animate-panel-out-right` | Slide-overs, drawers (slide + opacity) |
| | `.animate-panel-in-left` | `.animate-panel-out-left` | Left-side drawers (slide + opacity) |
| **Scrim** | `.animate-scrim-in` | `.animate-scrim-out` | Overlay backdrop behind panels/dialogs |
| **Fade** | `.animate-fade-in` | `.animate-fade-out` | Opacity-only transitions |
| **Scale** | `.animate-scale-in` | `.animate-scale-out` | Dialogs, popovers, dropdown menus (fade + subtle scale) |

### Transition utilities

| Class | Properties | Use for |
|-------|-----------|---------|
| `.transition-interactive` | color, background-color, border-color, box-shadow, opacity | Hover/focus state changes |
| `.transition-transform` | transform, opacity | Sidebar expand/collapse |

### Common patterns

| Interaction | Classes |
|------------|---------|
| Slide-over panel | `.animate-panel-in-right` / `.animate-panel-out-right` + `.animate-scrim-in` / `.animate-scrim-out` |
| Sidebar | CSS transition with `--duration-base` and `--ease-standard` |
| Dialog | `.animate-scale-in` / `.animate-scale-out` + `.animate-scrim-in` / `.animate-scrim-out` |
| Bottom sheet | `.animate-slide-in-bottom` / `.animate-slide-out-bottom` + `.animate-scrim-in` / `.animate-scrim-out` |
| Hover/focus | `.transition-interactive` or `transition-colors` |

### Rules

- Only animate `transform` and `opacity` — these are GPU-composited and performant.
- `prefers-reduced-motion` kills all animation globally (handled in globals.css).

---

## 25. Dark Mode

- `next-themes` applies `.dark` to `<html>` → Radix Colors + Cedar tokens swap automatically
- Radix Themes components: no `dark:` prefixes needed
- Cedar tokens: auto-swap (built on Radix variables)
- Logo switching: use `.logo-light` / `.logo-dark` classes (defined in globals.css), controlled by `.dark` parent
- Test both modes for every new UI element

---

## 26. Icons

Remix Icon only: `<i className="ri-[name]-line" />` (outline) / `ri-[name]-fill` (filled). Prefer `-line` for chrome, `-fill` for active states. Icon-only buttons: `<IconButton variant="ghost" color="gray" aria-label="...">`. Size via `text-sm`, `text-base`, `text-lg`. Color via Cedar tokens.

---

## 27. Page Layout Patterns

```tsx
<Flex direction="column" gap="6">
  <Heading size="6" weight="bold">Page Title</Heading>
  <Text size="2" color="gray">Description</Text>
  {/* content */}
</Flex>

// Empty state
<Flex direction="column" align="center" justify="center" py="9">
  <i className="ri-filter-off-line text-3xl text-[var(--cedar-text-muted)]" />
  <Text size="2" color="gray" mt="2">No items found.</Text>
</Flex>
```

---

## 28. Interaction State Coverage

Every interactive element: default, hover, focus-visible, active, disabled, loading. Every data view: loading skeleton, empty state, error with retry. Destructive actions always require confirmation (`<AlertDialog>`).

---

## 29. Overlay & Fixed Element Isolation

Portals for fixed/overlay elements. Radix Themes overlays handle this automatically. Custom overlays: wrap in `<Theme>`. No parent `gap-*` inheritance. Test at multiple viewport sizes.

---

## 30. Focus Management & Keyboard Navigation

Radix Themes handles focus trapping/restoration automatically. Custom Primitive-based components must implement focus styling manually using Cedar focus tokens:

```tsx
// Custom focusable element
<button className="
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-[var(--cedar-focus-ring)]
  focus-visible:ring-offset-2
  focus-visible:ring-offset-[var(--cedar-focus-offset)]
">
```

`Escape` closes topmost overlay. All interactive elements must be Tab-reachable. The gray double-ring focus pattern is set globally in `globals.css` via the Radix `--focus-*` override.

---

## 31. Content Overflow & Truncation

Single-line: `<Text truncate>` or `truncate`. Multi-line: `line-clamp-2/3`. Scrollable panels: `overflow-y-auto` body + `shrink-0` header/footer. Tables: `overflow-x-auto`. Test with 2 and 200 items.

---

## 32. Responsive Behavior

Cedar is desktop-first and functional down to 768px. The primary users are practice administrators at desktop workstations; tablet is a supported secondary context; mobile is a future consideration.

### Breakpoints

| Breakpoint | Tailwind prefix | Pixel value | Context |
|---|---|---|---|
| Default (no prefix) | — | 0–767px | Narrow / mobile (baseline styles) |
| `md:` | `md` | 768px+ | Tablet — minimum supported width |
| `lg:` | `lg` | 1024px+ | Desktop — sidebar switches to inline |
| `xl:` | `xl` | 1280px+ | Wide desktop |
| `2xl:` | `2xl` | 1536px+ | Ultra-wide |

Radix Themes responsive props use the same breakpoints: `columns={{ initial: "1", md: "2", lg: "3" }}`.

### Sidebar responsive behavior

The sidebar is the primary responsive inflection point in the app:

| Breakpoint | Behavior |
|---|---|
| `lg:` (1024px+) | Sidebar renders inline, sharing horizontal space with `<main>`. Expand/collapse via `translateX` with `transition-transform`. |
| Below `lg:` | Sidebar renders as a fixed overlay with scrim. Opens via hamburger trigger. Requires focus trapping, Escape-to-close, and focus restoration (see `frontend-standards.md §13` and `§15.3`). |

### Layout adaptation patterns

| Pattern | Implementation |
|---|---|
| Card grids | Radix `<Grid columns={{ initial: "1", md: "2", lg: "3" }}>` |
| Page padding | Radix `<Box p={{ initial: "4", md: "6" }}>` |
| Side-by-side → stacked | `<Flex direction={{ initial: "column", md: "row" }}>` |
| Table → card list | Hide `<Table>` at `md:` breakpoint, show card layout below. Or use `overflow-x-auto` to allow horizontal scroll. |
| Typography scaling | Keep fixed sizes (Radix `size` prop handles readability). Reduce heading `size` props at `initial:` if needed for narrow viewports. |

### Testing checkpoints

Every UI change must be verified at these widths:

| Width | What it represents |
|---|---|
| **1440px** | Standard desktop — primary development target |
| **1024px** | Sidebar inline/overlay transition point |
| **768px** | Minimum supported width — nothing should break below this |

Test both sidebar states (expanded and collapsed) at 1024px and above. Test the overlay sidebar at widths below 1024px. Verify no horizontal overflow at any checkpoint.

---

## 33. Accessibility

WCAG via Radix Themes. APCA contrast via Radix Colors. `aria-label` on icon buttons. Labels on inputs. Color + text/icon pairing. `<Callout>` for alerts.

---

## 34. System Feedback Patterns

Form submission → button loading → toast. Delete → AlertDialog → loading → toast. Toggle → immediate visual. Navigation → skeleton. Filter → immediate + count.

---

## 35. Component Naming

Name by what it **is**, never where it's used. `SlideOverPanel`, not `PracticeSlideOver`.

---

## 36. Quality Checklist

- [ ] Radix Themes components styled via props only
- [ ] Buttons: `color="gray" highContrast` for primary/secondary
- [ ] Badges: `color` prop with Radix color name
- [ ] Custom components: `--cedar-*` tokens only — no raw Radix variables
- [ ] Custom focus: `focus-visible:ring-[var(--cedar-focus-ring)]`
- [ ] Dark mode tested
- [ ] All states: hover, focus, disabled, loading, error
- [ ] Animated entrances have exits
- [ ] Loading, empty, and error states for all data views
- [ ] Destructive actions confirmed via AlertDialog
- [ ] Focus trapped in overlays
- [ ] Truncation on long text
- [ ] Tested at 1440px, 1024px, and 768px
- [ ] Sidebar tested in both inline and overlay states
- [ ] `aria-label` on icon buttons
- [ ] No hardcoded colors anywhere
- [ ] No `dark:` prefixes — tokens auto-swap
- [ ] No raw Tailwind spacing on Radix Themes layout components
- [ ] No `px` for font sizes, no `vh`/`vw` (use `dvh`/`dvw`)
- [ ] Shared utilities used (`lib/format.ts`, `lib/ui-constants.ts`)

---

## 37. Shared Components & Utilities

Before building a new component, check for existing Cedar composites and shared utilities.

### Cedar composite components

| Component | File | Purpose |
|-----------|------|---------|
| SeverityBadge | `components/SeverityBadge.tsx` | Severity badge using `SEVERITY_COLOR` from `ui-constants.ts` via Radix `color` prop |
| StatusBadge | `components/StatusBadge.tsx` | Status badge using `STATUS_COLOR` via Radix `color` prop |
| EmptyState | `components/EmptyState.tsx` | Standard "no data" state — use for all empty views |
| DataList | `components/DataList.tsx` | Clickable list of items with severity indicator + timestamp |

### Shared utilities

| File | Exports | Rule |
|------|---------|------|
| `lib/ui-constants.ts` | `SEVERITY_COLOR`, `STATUS_COLOR`, `AUTHORITY_LEVEL_COLOR` | Single source of truth for color mappings. Exports Radix color names. Never create local color maps. |
| `lib/format.ts` | `timeAgo()`, `formatDate()`, `capitalize()` | Never define these locally — always import from here. |

---

## 38. File Locations

| What | Where |
|------|-------|
| All `--cedar-*` token definitions | `app/globals.css` |
| Design standards (this file) | `docs/design-system/design-standards.md` |
| Frontend structural standards | `docs/design-system/frontend-standards.md` |
| Design tokens skill (decision tree) | `.claude/skills/design-tokens/SKILL.md` |
| UI components skill (build checklist) | `.claude/skills/ui-components/SKILL.md` |
| Cedar composite components | `components/` |
| Shared utilities | `lib/utils.ts` |
| Format utilities | `lib/format.ts` |
| UI constants (color name mappings) | `lib/ui-constants.ts` |
