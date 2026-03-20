# Skill: Design Tokens (Radix Themes)

## Token decision tree

When you need a visual value:

1. **Color on a Radix Themes component?** → Use the `color` prop: `<Button color="green">`, `<Badge color="red">`. For the accent color, omit the prop (it defaults to the theme accent).

2. **Color on a custom component?** → Use Radix CSS variables: `bg-[var(--accent-9)]`, `text-[var(--gray-12)]`, `border-[var(--gray-6)]`. These swap automatically in dark mode.

3. **Spacing on a Radix Themes component?** → Use layout props: `<Flex gap="4" p="5">`, `<Box m="3">`. Scale is 1–9.

4. **Spacing on a custom component?** → Use Tailwind scale: `p-4`, `gap-6`, `space-y-4`. Or reference Radix tokens: `var(--space-4)`.

5. **Typography?** → Use `<Heading size="6">` and `<Text size="2">`. Scale is 1–9.

6. **Border radius?** → Controlled globally by `<Theme radius="large">`. Override per-component with `radius` prop. Custom components: `var(--radius-3)`.

7. **Shadow?** → Radix provides `--shadow-1` through `--shadow-6`. Use in Tailwind: `shadow-[var(--shadow-3)]`.

8. **Animation?** → Use Cedar's custom classes from globals.css: `.animate-panel-in-right`, `.transition-interactive`. Duration tokens: `--duration-fast` through `--duration-slower`.

## Color scale reference (12 steps)

| Steps | Purpose | Example usage |
|-------|---------|--------------|
| 1–2 | Backgrounds | `var(--accent-1)`, `var(--gray-2)` |
| 3–5 | Interactive backgrounds | `var(--accent-3)` for hover, `var(--accent-5)` for active |
| 6–8 | Borders | `var(--gray-6)` for subtle, `var(--accent-8)` for strong |
| 9 | Solid backgrounds | `var(--accent-9)` for primary buttons |
| 10 | Hovered solid | `var(--accent-10)` |
| 11–12 | Text | `var(--gray-11)` muted, `var(--gray-12)` high-contrast |

## Semantic color shortcuts

- `var(--color-background)` — page background
- `var(--color-surface)` — surface overlay
- `var(--color-panel-solid)` — solid panel background
- `var(--color-panel-translucent)` — frosted panel background
- `var(--color-overlay)` — scrim/overlay behind modals

## Status colors (always available regardless of accent)

- Success: `color="green"` or `var(--green-9)`
- Warning: `color="amber"` or `var(--amber-9)`
- Error: `color="red"` or `var(--red-9)`
- Info: `color="blue"` or `var(--blue-9)`

## Forbidden patterns

- `bg-green-500` — raw Tailwind color (won't adapt to dark mode). Use `bg-[var(--accent-9)]`
- `text-[#ff0000]` — hardcoded hex
- `p-[13px]` — arbitrary spacing
- Inline `style={{ color: 'red' }}` — use Radix `color="red"` prop or `var(--red-9)`
- Overriding Radix Themes component backgrounds/borders with Tailwind classes — use props instead
