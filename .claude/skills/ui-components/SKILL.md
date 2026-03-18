# Skill: UI Component Creation

## Before building any UI

1. Read `docs/design-system/design-standards.md` for patterns and principles
2. Read `specs/tokens/token-reference.md` for available tokens
3. Check `src/components/ui/` for existing components that cover your need
4. If building a component that already has a spec in `specs/components/`, follow it

## Creating a new reusable component

### Decision: reusable or one-off?
- **3+ uses across the app** → create in `src/components/ui/` (primitives) or `src/components/` (composites)
- **1-2 uses, complex business logic** → keep local in the feature directory
- **Existing component almost works** → extend it with a new CVA variant

### Implementation checklist
1. Write a spec in `specs/components/[name].md` first (use the 8-section template below)
2. Use CVA for variants:
   ```tsx
   import { cva, type VariantProps } from "class-variance-authority"
   import { cn } from "@/lib/utils"
   ```
3. Accept `className` prop and merge with `cn()`
4. Support `asChild` via Radix `Slot` when polymorphism is needed
5. Export the variants config for external composition
6. All colors via semantic tokens — no raw hex/rgb/oklch
7. All spacing via Tailwind scale — no arbitrary pixel values
8. Test both light and dark mode

### 8-section component spec template

```markdown
# [Component Name]

## Metadata
- Location: `src/components/ui/[name].tsx`
- Dependencies: [Radix primitives, if any]
- Added: [date]

## Overview
When to use this component and what problem it solves.

## Anatomy
The parts that make up this component (root, trigger, content, etc.)

## Tokens Used
List of design tokens this component references.

## Props / API
| Prop | Type | Default | Description |
|------|------|---------|-------------|

## States
Visual states: default, hover, focus, active, disabled, loading, error.

## Code Example
A complete usage example.

## Cross-References
Related components and patterns.
```

## Styling rules

### Colors
- Use semantic classes: `bg-background`, `text-foreground`, `border-border`, etc.
- For opacity variants: `bg-primary/10`, `text-muted-foreground/60`
- For status colors that need light/dark variants: use explicit `dark:` prefix
  ```tsx
  className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
  ```

### Spacing
- Use Tailwind scale: `p-4`, `gap-2`, `space-y-6`, `mt-1`
- Never use arbitrary values like `p-[13px]`

### Radius
- Use token classes: `rounded-md`, `rounded-lg`, `rounded-xl`
- For nested radius: `rounded-[max(0px,calc(var(--radius-xl)-1rem))]`
- Buttons/badges use their own radius (via component defaults)

### Motion
- Interactive hover/focus: `transition-interactive` or `transition-colors`
- Panel slides: use `.animate-panel-in-right`, `.animate-panel-in-left`, etc.
- Dialogs: use `.animate-scale-in` / `.animate-scale-out`
- Duration tokens: reference `--duration-fast`, `--duration-base`, `--duration-moderate`

### Icons
- Remix Icon only: `<i className="ri-[name]-line" />`
- Size via text class: `text-sm`, `text-base`, `text-lg`
- Color via text color class
