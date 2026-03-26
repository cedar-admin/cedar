# Cedar Design System — Authoring Guide

How to add components, write documentation, and maintain the design system. Written for human developers and AI coding agents alike.

## Architecture in 60 Seconds

The design system has two layers:

**Component packages** (`packages/ui/` and `packages/ui-patterns/`) hold the actual React components. `ui` holds atoms — the building blocks (Button, Badge, Dialog, Table). `ui-patterns` holds fragments — composed components assembled from atoms (ConfirmationModal, PageContainer, MetricCard). Your production app and the docs app both import from these packages.

**The docs app** (`apps/design-system/`) documents the components. It contains MDX files (the written documentation), example components (the live demos), and a registry that wires them together for in-browser previews with code display. The docs app references components — it never houses them.

When you add a component, you touch both layers: build it in a package, then document it in the app.

## Understanding the Existing Code

`packages/ui/` has two component systems from its Supabase heritage:

**Legacy components** in `src/components/` (47 files) — the original Supabase UI library. These use a `type` prop for variants (e.g., `<Button type="primary">`), have richer built-in features (loading states, icons), and are still used in production.

**Shadcn components** in `src/components/shadcn/ui/` (49 files) — the newer system based on shadcn/ui conventions. These use a `variant` prop, are thinner wrappers around Radix primitives, and use `cn` for class merging. Components with visual variants also use `cva` for variant management, and most use `React.forwardRef` for ref forwarding.

When both systems have the same component (Button, Alert, Accordion, Checkbox), the shadcn version is exported with a `_Shadcn_` suffix to avoid naming collisions:

```tsx
// From packages/ui/index.tsx:
export * from './src/components/Button'                    // Legacy Button
export { Button as Button_Shadcn_ } from './src/components/shadcn/ui/button'  // Shadcn Button
```

This means `import { Button } from 'ui'` gives you the legacy version, and `import { Button_Shadcn_ } from 'ui'` gives you the shadcn version. Components that exist only in the shadcn system (Badge, Card, ScrollArea) export without the suffix.

**For new Cedar components:** Place them in `src/components/shadcn/ui/` and follow the shadcn pattern. Since your new components won't have legacy collisions, they export without the `_Shadcn_` suffix.

## Running the Docs App

```bash
# From repo root
pnpm run dev:design-system

# Or directly
cd apps/design-system
pnpm dev:full
```

`dev:full` starts both the Next.js server (port 3003) and the contentlayer2 MDX watcher. Open `http://localhost:3003/design-system`.

## Adding an Atom Component

Atoms live in `packages/ui/`. These are low-level, reusable building blocks: buttons, badges, inputs, dialogs, selects.

### 1. Create the component file

Place it at `packages/ui/src/components/shadcn/ui/<component-name>.tsx`.

Follow the existing pattern:

```tsx
// packages/ui/src/components/shadcn/ui/compliance-badge.tsx
'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '../../../lib/utils/cn'

const complianceBadgeVariants = cva(
  // Base classes shared by all variants
  'inline-flex items-center gap-1 rounded-full font-medium text-xs px-2.5 py-0.5',
  {
    variants: {
      status: {
        approved: 'bg-brand bg-opacity-10 text-brand-600 border border-brand-500',
        pending: 'bg-warning bg-opacity-10 text-warning border border-warning-500',
        flagged: 'bg-destructive bg-opacity-10 text-destructive-600 border border-destructive-500',
        inactive: 'bg-surface-75 text-foreground-light border border-strong',
      },
    },
    defaultVariants: {
      status: 'inactive',
    },
  }
)

export interface ComplianceBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof complianceBadgeVariants> {}

const ComplianceBadge = React.forwardRef<HTMLDivElement, ComplianceBadgeProps>(
  ({ className, status = 'inactive', children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(complianceBadgeVariants({ status }), className)} {...props}>
        {children}
      </div>
    )
  }
)
ComplianceBadge.displayName = 'ComplianceBadge'

export { ComplianceBadge, complianceBadgeVariants }
```

**Key conventions:**
- Add `'use client'` at the top of any component that uses hooks, event handlers, or browser APIs. Most UI components need this in Next.js App Router.
- Use `cn` (from `packages/ui/src/lib/utils/cn.ts`) for merging classNames. It wraps `clsx` + `tailwind-merge`.
- Use `React.forwardRef` so the component can receive refs (needed for tooltips, popovers, and testing). Most shadcn components follow this pattern. Some thin wrappers around third-party libraries (Calendar, Drawer, Sonner) skip it — if your component fully delegates to another library, it's optional.
- Accept `className` as a prop and merge it with `cn()` so consumers can extend styles.
- Use `cva` from `class-variance-authority` when your component has named visual variants (sizes, states, types). Components that wrap Radix primitives without adding new variants (Accordion, Dialog, Tabs) just use `cn()` directly.
- Export the variants function (e.g., `complianceBadgeVariants`) alongside the component when consumers might need to apply the component's styles to other elements — like `buttonVariants` for styling links as buttons. If the component is only used directly, just export the component.
- Use the semantic Tailwind classes from the theme (see "Semantic Color Reference" below) so the component automatically respects dark mode, light mode, and all themes.

### 2. Export from the package

Add one line to `packages/ui/index.tsx`:

```tsx
export * from './src/components/shadcn/ui/compliance-badge'
```

The component is now importable as `import { ComplianceBadge } from 'ui'` in any workspace app.

### 3. Create example components

Each example demonstrates one focused usage pattern. Place them in `apps/design-system/registry/default/example/`:

```tsx
// registry/default/example/compliance-badge-demo.tsx
import { ComplianceBadge } from 'ui'

export default function ComplianceBadgeDemo() {
  return <ComplianceBadge status="approved">FDA Cleared</ComplianceBadge>
}
```

```tsx
// registry/default/example/compliance-badge-states.tsx
import { ComplianceBadge } from 'ui'

export default function ComplianceBadgeStates() {
  return (
    <div className="flex gap-3">
      <ComplianceBadge status="approved">Approved</ComplianceBadge>
      <ComplianceBadge status="pending">Pending Review</ComplianceBadge>
      <ComplianceBadge status="flagged">Flagged</ComplianceBadge>
      <ComplianceBadge status="inactive">Inactive</ComplianceBadge>
    </div>
  )
}
```

**Rules for examples:**
- One default export per file.
- Import components from `'ui'` (atoms) or `'ui-patterns/...'` (fragments).
- Each file demonstrates exactly one concept (default usage, size variants, state variants, composition pattern).
- Keep them minimal — the example is the documentation. No extraneous markup.
- Name pattern: `<component>-<variant>.tsx` (e.g., `button-demo.tsx`, `button-sizes.tsx`, `button-destructive.tsx`).

### 4. Register the examples

Add entries to `apps/design-system/registry/examples.ts`:

```tsx
{
  name: 'compliance-badge-demo',
  type: 'components:example',
  registryDependencies: ['compliance-badge'],
  files: ['example/compliance-badge-demo.tsx'],
},
{
  name: 'compliance-badge-states',
  type: 'components:example',
  registryDependencies: ['compliance-badge'],
  files: ['example/compliance-badge-states.tsx'],
},
```

The `name` must exactly match the filename without `.tsx`. The `files` path is relative to `registry/default/`.

### 5. Write the MDX documentation

Create `apps/design-system/content/docs/components/compliance-badge.mdx`:

```mdx
---
title: Compliance Badge
description: Displays the regulatory compliance status of a medical procedure or product.
component: true
---

Compliance Badge communicates regulatory status at a glance. Place it alongside
procedure names, product listings, or document headers where practitioners need
to quickly assess compliance standing.

<ComponentPreview name="compliance-badge-demo" peekCode />

## Usage

```tsx
import { ComplianceBadge } from 'ui'
```

```tsx
<ComplianceBadge status="approved">FDA Cleared</ComplianceBadge>
```

## Examples

### States

Use the `status` prop to indicate the current compliance state.

<ComponentPreview name="compliance-badge-states" peekCode />

## Accessibility

Status is communicated through both color and text label, ensuring
color-blind users can distinguish compliance states.
```

**MDX frontmatter fields:**
- `title` (required): Component name as it appears in the page heading.
- `description` (required): One-line description shown in metadata.
- `component: true`: Marks this as a component doc (affects page layout).
- `featured: true`: (optional) Promotes the component in the docs homepage.
- `toc: true`: (optional, default true) Enables the "On This Page" sidebar.

**Available MDX components:**
- `<ComponentPreview name="..." />` — Renders a live component with expandable source code. Add `peekCode` to show the first few lines of code by default. Add `wide` for full-width previews.
- `<ComponentSource name="..." />` — Shows only the source code (no live preview).
- `<Admonition type="note" title="...">` — Callout boxes. Types: `note`, `tip`, `warning`, `destructive`.
- `<CodeFragment name="..." />` — Inline code snippets from registry.

### 6. Add to the sidebar navigation

Edit `apps/design-system/config/docs.ts`. Find the "Atom Components" section and add an entry:

```tsx
{
  title: 'Compliance Badge',
  href: '/docs/components/compliance-badge',
  items: [],
},
```

The section has `sortOrder: 'alphabetical'`, so insertion order doesn't matter — it sorts automatically.

### 7. Rebuild the registry

The registry consists of two files that must stay in sync:

- `__registry__/index.tsx` — Contains React.lazy imports for **runtime rendering** of live component previews. Auto-generated by the build script.
- `__registry__/files.json` — A lightweight JSON index mapping component names to source file paths, used at **build time** by the MDX rehype plugin to inject source code into documentation pages. Currently maintained manually.

**Generate `index.tsx`:**
```bash
cd apps/design-system
pnpm build:registry
```

**Update `files.json`:** Add an entry for each new example component. The format is:
```json
{
  "default": {
    "compliance-badge-demo": {
      "files": ["registry/default/example/compliance-badge-demo.tsx"]
    },
    "compliance-badge-states": {
      "files": ["registry/default/example/compliance-badge-states.tsx"]
    }
  }
}
```

For fragments, the file path points to the ui-patterns source:
```json
{
  "default": {
    "ComplianceStatusCard": {
      "files": ["registry/default//ComplianceStatusCard/index.tsx"]
    }
  }
}
```

If you only update `index.tsx` without updating `files.json`, live previews will work but the "View code" source display will be missing. If you only update `files.json` without rebuilding `index.tsx`, the source code will show but the live preview will show a "Component not found" error.

**Done.** Your component page now renders with live previews, code display, sidebar navigation, and table of contents.

---

## Adding a Fragment Component

Fragments live in `packages/ui-patterns/`. These are composed components built from atoms — modals, page layouts, data display patterns, form assemblies.

### 1. Create the component

Place it in `packages/ui-patterns/src/<ComponentName>/`:

```
packages/ui-patterns/src/
  ComplianceStatusCard/
    index.tsx          ← Main component
    ComplianceStatusCard.tsx  ← (optional) If you want to split logic
```

Fragment components import from `'ui'` for their atoms:

```tsx
// packages/ui-patterns/src/ComplianceStatusCard/index.tsx

import { ComplianceBadge, Card, cn } from 'ui'

interface ComplianceStatusCardProps {
  title: string
  status: 'approved' | 'pending' | 'flagged' | 'inactive'
  lastReviewed?: string
  className?: string
}

export function ComplianceStatusCard({
  title,
  status,
  lastReviewed,
  className,
}: ComplianceStatusCardProps) {
  return (
    <Card className={cn('p-4 flex items-center justify-between', className)}>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {lastReviewed && (
          <p className="text-xs text-foreground-light">Reviewed {lastReviewed}</p>
        )}
      </div>
      <ComplianceBadge status={status}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </ComplianceBadge>
    </Card>
  )
}
```

### 2. Export from the package

Add a subpath export to `packages/ui-patterns/package.json` in the `"exports"` map:

```json
"./ComplianceStatusCard": {
  "import": "./src/ComplianceStatusCard/index.tsx",
  "types": "./src/ComplianceStatusCard/index.tsx"
}
```

The component is now importable as `import { ComplianceStatusCard } from 'ui-patterns/ComplianceStatusCard'`.

### 3. Register the fragment

Add to `apps/design-system/registry/fragments.ts`:

```tsx
{
  name: 'ComplianceStatusCard',
  type: 'components:fragment',
  files: ['/ComplianceStatusCard/index.tsx'],
  optionalPath: '/ComplianceStatusCard',
},
```

The `optionalPath` tells the build script to look in `packages/ui-patterns/src/ComplianceStatusCard/`.

### 4. Create examples, write MDX, add to sidebar

Follow the same steps 3–7 as atoms. The only differences:

- Examples import from `'ui-patterns/ComplianceStatusCard'` instead of `'ui'`.
- The MDX file goes in `content/docs/fragments/` instead of `content/docs/components/`.
- The sidebar entry goes in the "Fragment Components" section of `config/docs.ts`.

---

## Modifying an Existing Component

### Adding a new variant

1. Edit the component in `packages/ui/`. If the component uses `cva`, add the variant to its variants config. If it uses plain Tailwind classes, add the new styling logic with `cn()`.
2. Create a new example in `registry/default/example/` demonstrating the variant.
3. Register the example in `registry/examples.ts`.
4. Add the example to `__registry__/files.json`.
5. Add a `<ComponentPreview>` in the existing MDX file under a new heading.
6. Rebuild the registry: `pnpm build:registry`.

### Changing an existing variant's appearance

1. Edit the component's Tailwind classes in `packages/ui/`. Every app consuming the component picks up the change immediately in dev mode.
2. The docs app shows the updated appearance automatically — no documentation changes needed unless the API changed.

### Renaming or removing a component

1. Update the component file and its export in `packages/ui/index.tsx`.
2. Update all example components that import it.
3. Update the MDX documentation.
4. Update `config/docs.ts` if the title or href changed.
5. Update `__registry__/files.json` (rename keys or remove entries).
6. Rebuild the registry.

---

## Semantic Color Reference

Use these Tailwind classes for colors. They resolve to CSS custom properties that adapt per theme (dark, light, classic-dark). Using raw hex values or non-semantic Tailwind colors (e.g., `text-gray-500`) bypasses the theme and breaks in other modes.

### Text

| Class | Use for |
|-------|---------|
| `text-foreground` | Primary text, headings |
| `text-foreground-light` | Secondary text, descriptions, metadata |
| `text-foreground-lighter` | Tertiary text, placeholder-weight content |
| `text-foreground-muted` | Disabled or de-emphasized text |
| `text-brand-600` | Brand-colored text (links, active states) |
| `text-destructive-600` | Error or destructive-action text |
| `text-warning` | Warning text |

### Backgrounds

| Class | Use for |
|-------|---------|
| `bg-background` | Page-level background |
| `bg-surface-75` | Subtle card/section background |
| `bg-surface-200` | Elevated surface (hover states, active cards) |
| `bg-overlay` | Overlay/modal backgrounds (often used with opacity: `bg-overlay/50`) |
| `bg-brand` | Brand-colored backgrounds (use with `bg-opacity-10` for tints) |
| `bg-destructive` | Error backgrounds (use with `bg-opacity-10` for tints) |
| `bg-warning` | Warning backgrounds (use with `bg-opacity-10` for tints) |

### Borders

| Class | Use for |
|-------|---------|
| `border-default` | Standard borders |
| `border-strong` | Emphasized borders |
| `border-control` | Form input borders |
| `border-brand-500` | Brand-accent borders |
| `border-destructive-500` | Error borders |
| `border-warning-500` | Warning borders |

**Pattern for status colors:** pair `bg-<status> bg-opacity-10` with `text-<status>-600` and `border-<status>-500`. This creates the tinted badge/alert look used throughout the system.

---

## Documentation Writing Conventions

### Structure

Every component doc follows this order:

1. **Opening paragraph** — What this component does and when to use it. Be direct and prescriptive.
2. **Primary preview** — `<ComponentPreview name="...-demo" peekCode />` showing the default state.
3. **Usage section** — Import statement and minimal code example.
4. **Examples section** — One subsection per variant/pattern, each with its own `<ComponentPreview>`.
5. **Accessibility section** — Keyboard behavior, screen reader considerations, ARIA attributes.

### Voice

- Write in present tense, imperative mood: "Use ComplianceBadge to indicate..." rather than "ComplianceBadge can be used to..."
- Be prescriptive about when to use (and when to choose something else): "If the action requires typed confirmation, use Text Confirm Dialog instead."
- Keep descriptions to one or two sentences per concept.
- State directly what the component does. (see Cedar's style preferences)

### Cross-references

Link to related components using relative markdown paths:

```mdx
See [Button](../components/button) for the underlying action element.
Use [Alert Dialog](../components/alert-dialog) for simple confirmations.
See [Modality](../ui-patterns/modality) for guidance on choosing the right pattern.
```

---

## File Checklist

When adding a new component, confirm each of these files exists:

**For atoms:**
- [ ] `packages/ui/src/components/shadcn/ui/<name>.tsx` — The component
- [ ] `packages/ui/index.tsx` — Export line added
- [ ] `apps/design-system/registry/default/example/<name>-demo.tsx` — Primary example
- [ ] `apps/design-system/registry/default/example/<name>-<variant>.tsx` — One per variant
- [ ] `apps/design-system/registry/examples.ts` — Registry entries added
- [ ] `apps/design-system/content/docs/components/<name>.mdx` — MDX documentation
- [ ] `apps/design-system/config/docs.ts` — Sidebar entry added
- [ ] `apps/design-system/__registry__/files.json` — Entries added for each example
- [ ] Registry rebuilt: `cd apps/design-system && pnpm build:registry`

**For fragments:**
- [ ] `packages/ui-patterns/src/<Name>/index.tsx` — The component
- [ ] `packages/ui-patterns/package.json` — Subpath export added to `"exports"` map
- [ ] `apps/design-system/registry/default/example/<name>-demo.tsx` — Primary example
- [ ] `apps/design-system/registry/fragments.ts` — Fragment entry added
- [ ] `apps/design-system/registry/examples.ts` — Example entries added
- [ ] `apps/design-system/content/docs/fragments/<name>.mdx` — MDX documentation
- [ ] `apps/design-system/config/docs.ts` — Sidebar entry added
- [ ] `apps/design-system/__registry__/files.json` — Entries added for fragment and each example
- [ ] Registry rebuilt: `cd apps/design-system && pnpm build:registry`

---

## For AI Coding Agents

If you are an AI agent tasked with creating or modifying a Cedar design system component, follow the step-by-step procedures above. Key things to remember:

- Components go in **packages** (`packages/ui/` or `packages/ui-patterns/`). Documentation goes in the **docs app** (`apps/design-system/`). These are separate directories with separate concerns.
- New atom components go in `packages/ui/src/components/shadcn/ui/`. They export from `packages/ui/index.tsx` without the `_Shadcn_` suffix (that suffix exists only for legacy collision avoidance on pre-existing components).
- Add `'use client'` at the top of component files that use hooks, event handlers, or browser APIs.
- Every example component needs a **registry entry** in `registry/examples.ts` (or `registry/fragments.ts`). The name in the registry must exactly match the filename without the `.tsx` extension.
- Every example component also needs an entry in `__registry__/files.json`. This is a separate file from `__registry__/index.tsx`. The JSON index maps component names to file paths for source code display. The `index.tsx` handles runtime rendering. Both must be updated.
- After adding examples, **rebuild the registry** with `pnpm build:registry` from `apps/design-system/`. This regenerates `index.tsx`. You must update `files.json` manually.
- Use **semantic Tailwind classes** (`text-foreground`, `bg-surface-75`, `border-default`) for all colors. Check the "Semantic Color Reference" section. Raw hex values or non-semantic Tailwind colors (`text-gray-500`) will break across themes.
- Use `React.forwardRef` and accept a `className` prop merged with `cn()` for most components. Thin wrappers around third-party libraries that fully delegate rendering can skip `forwardRef`.
- Use `cva` when a component has named visual variants (sizes, states, types). Simple wrapper components that just add classes to Radix primitives can use `cn()` directly.
- The `<ComponentPreview name="..." />` tag in MDX is case-sensitive and must exactly match the registry entry name.
- When writing MDX frontmatter, `title` and `description` are required. Add `component: true` for all component pages.
- The `packages/ui/` codebase has two systems (legacy in `src/components/` and shadcn in `src/components/shadcn/ui/`). When browsing existing code, check which system a component belongs to before modifying it. New components always go in the shadcn directory.
- Run the file checklist at the end to confirm nothing was missed.
