# Cedar Design Token Reference

> **This is the authoritative list of available tokens.** Use these in all UI code. Never use raw values.

## Colors (semantic — theme-aware)

| Token | Tailwind Class | Purpose |
|-------|---------------|---------|
| `--background` | `bg-background` | Page background |
| `--foreground` | `text-foreground` | Primary text |
| `--card` | `bg-card` | Card surfaces |
| `--card-foreground` | `text-card-foreground` | Card text |
| `--popover` | `bg-popover` | Popover/dropdown surfaces |
| `--popover-foreground` | `text-popover-foreground` | Popover text |
| `--primary` | `bg-primary`, `text-primary` | Brand actions, links |
| `--primary-foreground` | `text-primary-foreground` | Text on primary bg |
| `--secondary` | `bg-secondary` | Secondary buttons/surfaces |
| `--secondary-foreground` | `text-secondary-foreground` | Text on secondary bg |
| `--muted` | `bg-muted` | Subdued backgrounds |
| `--muted-foreground` | `text-muted-foreground` | Subdued text, labels |
| `--accent` | `bg-accent` | Hover states, highlights |
| `--accent-foreground` | `text-accent-foreground` | Text on accent bg |
| `--destructive` | `bg-destructive`, `text-destructive` | Errors, delete actions |
| `--border` | `border-border` | Default borders |
| `--input` | `border-input` | Form input borders |
| `--ring` | `ring-ring` | Focus rings |
| `--scrim` | `bg-scrim` | Overlay behind panels/modals |

### Chart colors
`--chart-1` through `--chart-5` — leaf green ramp from light to dark.

### Sidebar colors
`--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring`

### Using opacity modifiers
Tailwind's `/` syntax works: `bg-primary/10`, `text-muted-foreground/60`, `border-border/50`

---

## Spacing (4px base grid)

| Token | Value | Tailwind |
|-------|-------|---------|
| `--spacing-0` | 0px | `p-0`, `m-0`, `gap-0` |
| `--spacing-px` | 1px | `p-px` |
| `--spacing-0_5` | 2px | `p-0.5` |
| `--spacing-1` | 4px | `p-1`, `gap-1` |
| `--spacing-1_5` | 6px | `p-1.5` |
| `--spacing-2` | 8px | `p-2`, `gap-2` |
| `--spacing-2_5` | 10px | `p-2.5` |
| `--spacing-3` | 12px | `p-3`, `gap-3` |
| `--spacing-3_5` | 14px | `p-3.5` |
| `--spacing-4` | 16px | `p-4`, `gap-4` |
| `--spacing-5` | 20px | `p-5` |
| `--spacing-6` | 24px | `p-6`, `gap-6` |
| `--spacing-8` | 32px | `p-8` |
| `--spacing-10` | 40px | `p-10` |
| `--spacing-12` | 48px | `p-12` |
| `--spacing-16` | 64px | `p-16` |
| `--spacing-20` | 80px | `p-20` |
| `--spacing-24` | 96px | `p-24` |

**Rule:** Always use the token scale. If something feels off, move to the adjacent step (±4px). Never introduce arbitrary pixel values.

---

## Typography (fluid clamp)

| Token | Range | Tailwind |
|-------|-------|---------|
| `--font-size-2xs` | 10→11px | `text-2xs` |
| `--font-size-xs` | 12→13px | `text-xs` |
| `--font-size-sm` | 13→14px | `text-sm` |
| `--font-size-base` | 14→15px | `text-base` |
| `--font-size-lg` | 16→18px | `text-lg` |
| `--font-size-xl` | 18→21px | `text-xl` |
| `--font-size-2xl` | 22→27px | `text-2xl` |
| `--font-size-3xl` | 28→36px | `text-3xl` |

**Rule:** Use Tailwind's `text-*` classes. All sizes are fluid by default — they scale smoothly between mobile and desktop.

---

## Border Radius

| Token | Multiplier | Tailwind |
|-------|-----------|---------|
| `--radius-sm` | base × 0.6 | `rounded-sm` |
| `--radius-md` | base × 0.8 | `rounded-md` |
| `--radius-lg` | base × 1.0 | `rounded-lg` |
| `--radius-xl` | base × 1.4 | `rounded-xl` |
| `--radius-2xl` | base × 1.8 | `rounded-2xl` |
| `--radius-3xl` | base × 2.2 | `rounded-3xl` |
| `--radius-4xl` | base × 2.6 | `rounded-4xl` |
| `--radius-full` | 9999px | `rounded-full` |

**Base value:** `--radius: 0.45rem` (in `:root`). Change this one value to adjust all radii app-wide.

### Nested border radius
When a child element is visually nested inside a rounded parent (e.g., image inside a card):
```
inner radius = outer radius − padding gap
```
Use the `.radius-nested` utility class, or calculate inline:
```html
<div class="rounded-xl p-4">
  <img class="rounded-[max(0px,calc(var(--radius-xl)-1rem))]" />
</div>
```

**Buttons and pills are exempt** — they use their own radius regardless of container.

---

## Shadows

| Token | Tailwind | Use for |
|-------|---------|---------|
| `--shadow-xs` | `shadow-xs` | Subtle depth on inputs |
| `--shadow-sm` | `shadow-sm` | Cards, dropdowns |
| `--shadow-md` | `shadow-md` | Elevated cards, tooltips |
| `--shadow-lg` | `shadow-lg` | Modals, slide-over panels |
| `--shadow-xl` | `shadow-xl` | Toast notifications |

---

## Motion

### Durations
| Token | Value | Use for |
|-------|-------|---------|
| `--duration-instant` | 100ms | Toggles, color changes |
| `--duration-fast` | 150ms | Hovers, tooltips, small feedback |
| `--duration-base` | 200ms | Standard transitions |
| `--duration-moderate` | 300ms | Panels, drawers, page transitions |
| `--duration-slow` | 400ms | Large-scale entrances |
| `--duration-slower` | 500ms | Complex orchestrations |

### Easing curves
| Token | Use for |
|-------|---------|
| `--ease-standard` | Default for most transitions |
| `--ease-emphasized` | Slight overshoot — attention-grabbing |
| `--ease-in` | Elements exiting the viewport |
| `--ease-out` | Elements entering the viewport |
| `--ease-spring` | Playful interactions (toggles, likes) |

### Stagger delays
| Token | Value | Use for |
|-------|-------|---------|
| `--stagger-fast` | 30ms | Dense lists (>10 items) |
| `--stagger-base` | 50ms | Standard lists |
| `--stagger-slow` | 80ms | Cards, prominent items |

### Animation utility classes
| Class | Effect |
|-------|--------|
| `.animate-panel-in-right` | Slide-over panel entering from right |
| `.animate-panel-out-right` | Slide-over panel exiting to right |
| `.animate-panel-in-left` | Sidebar/panel entering from left |
| `.animate-panel-out-left` | Sidebar/panel exiting to left |
| `.animate-scrim-in` | Overlay fade in |
| `.animate-scrim-out` | Overlay fade out |
| `.animate-fade-in` | Generic fade in |
| `.animate-fade-out` | Generic fade out |
| `.animate-scale-in` | Dialog/popover entrance |
| `.animate-scale-out` | Dialog/popover exit |
| `.transition-interactive` | Hover/focus transitions for buttons, links |
| `.transition-transform` | Transform + opacity transitions |

### Motion rules
- Only animate `transform` and `opacity` (GPU-composited, 60fps)
- Entering elements use `--ease-out`; exiting use `--ease-in`
- Always include `prefers-reduced-motion` support — the global safety net in globals.css handles this, but use `motion-safe:` prefix for animated Tailwind classes

---

## Z-Index

| Token | Value | Use for |
|-------|-------|---------|
| `--z-base` | 0 | Default stacking |
| `--z-dropdown` | 10 | Select menus, dropdowns |
| `--z-sticky` | 20 | Sticky headers |
| `--z-overlay` | 30 | Overlapping content |
| `--z-scrim` | 40 | Scrim behind panels |
| `--z-panel` | 50 | Slide-over panels, modals |
| `--z-toast` | 60 | Toast notifications |
| `--z-tooltip` | 70 | Tooltips |
| `--z-max` | 9999 | Emergency override only |

---

## Layout

| Token | Value | Use for |
|-------|-------|---------|
| `--width-sidebar` | 240px | Sidebar width |
| `--width-panel` | 480px | Slide-over panel width |
| `--width-content-max` | 1152px | Max content container |
