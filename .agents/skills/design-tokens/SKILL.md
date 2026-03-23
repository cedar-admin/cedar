# Skill: Design Tokens (Cedar + Radix Themes)

> **Full reference:** `docs/design-system/design-standards.md` — read sections 4 (Styling Rules), 5 (Cedar Semantic Tokens), and 19 (Color System) for complete token definitions, usage examples, and forbidden patterns.
>
> **Token source of truth:** `app/globals.css` — all `--cedar-*` definitions and their Radix variable mappings live there.

## Token decision tree

When you need a visual value, walk this tree top to bottom:

1. **Color on a Radix Themes component?** → Use the `color` prop: `<Button color="gray" highContrast>`, `<Badge color="red">`. Cedar defaults to `color="gray"` for interactive elements — green is reserved for semantic use (approved states, success).

2. **Color on a custom Primitive-based component?** → Use **Cedar semantic tokens** via Tailwind: `bg-[var(--cedar-interactive-hover)]`, `text-[var(--cedar-text-primary)]`, `border-[var(--cedar-border-subtle)]`. Never use raw Radix step variables (`var(--gray-6)`) in component files.

3. **Spacing on a Radix Themes component?** → Use layout props: `<Flex gap="4" p="5">`, `<Box m="3">`. Scale is 1–9.

4. **Spacing on a custom component?** → Use Tailwind scale: `p-4`, `gap-6`, `space-y-4`. **Caution:** Radix and Tailwind scales diverge above step 4 — always verify the px value. (See design-standards.md §20 for the conversion table.)

5. **Typography?** → Use `<Heading size="6">` and `<Text size="2">`. Scale is 1–9.

6. **Border radius?** → Controlled globally by `<Theme radius="large">`. Override per-component with `radius` prop. Custom components: `var(--radius-3)`.

7. **Shadow?** → Radix provides `--shadow-1` through `--shadow-6`. Use in Tailwind: `shadow-[var(--shadow-3)]`.

8. **Focus ring?** → Radix Themes handles focus automatically. Custom components: `focus-visible:ring-2 focus-visible:ring-[var(--cedar-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cedar-focus-offset)]`.

9. **Animation?** → Use Cedar utility classes from globals.css (e.g., `.animate-panel-in-right`, `.animate-scale-in`, `.transition-interactive`). See design-standards.md §24 for the full animation library.

## Token category index

Quick lookup for which `--cedar-*` prefix to reach for. Consult `globals.css` for the full list of tokens and their current Radix variable mappings.

| Need | Token prefix | Example |
|------|-------------|---------|
| Text color | `--cedar-text-*` | `--cedar-text-primary`, `--cedar-text-muted` |
| Clickable element background | `--cedar-interactive-*` | `--cedar-interactive-hover`, `--cedar-interactive-selected` |
| Page/panel/card background | `--cedar-page-bg`, `--cedar-panel-*`, `--cedar-card-*` | `--cedar-panel-bg-solid` |
| Borders | `--cedar-border-*` | `--cedar-border-subtle`, `--cedar-border-strong` |
| Focus styling | `--cedar-focus-*` | `--cedar-focus-ring`, `--cedar-focus-offset` |
| Status colors | `--cedar-success-*`, `--cedar-warning-*`, `--cedar-error-*`, `--cedar-info-*` | `--cedar-error-text`, `--cedar-success-bg` |
| Disabled state | `--cedar-disabled-*` | `--cedar-disabled-text` |
| Brand green | `--cedar-accent-*` | `--cedar-accent-solid` |
| Overlay scrim | `--cedar-overlay` | — |

## Status colors on Radix Themes components

Use the `color` prop directly — Cedar tokens are for custom components only:

| Meaning | Radix color prop |
|---------|-----------------|
| Success | `color="green"` |
| Warning | `color="amber"` |
| Error | `color="red"` |
| Info | `color="blue"` |
| Neutral | `color="gray"` |
