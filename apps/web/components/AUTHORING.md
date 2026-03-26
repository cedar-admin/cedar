# Cedar App Components — Authoring Guide

How to build Cedar-specific components on top of the shared design system.

This guide is for components in `apps/web/components/`.

For shared design system atoms and fragments, see:
- `apps/design-system/AUTHORING.md`

---

## Purpose

Cedar has two UI layers:

- **Design system layer**: reusable atoms and fragments in `packages/ui/` and `packages/ui-patterns/`
- **Application layer**: Cedar-specific components in `apps/web/components/`

Design system components are the reusable legos.

Cedar app components are the assembled product pieces that express Cedar concepts like:
- regulatory severity
- authority level
- practice tier
- review state
- regulation library navigation
- Cedar routing

Examples:
- Design system: `Button`, `Card`, `Table`, `PageHeader`
- Cedar app: `SeverityBadge`, `StatusBadge`, `DomainCard`, `RegulationRow`

---

## Decision Tree

Before building anything, decide where it belongs.

### Put it in `packages/ui` when:

- it is a reusable primitive
- it does not need Cedar domain knowledge
- it could be reused across multiple app features or future apps
- it introduces a new shared visual variant or API

Examples:
- new `Badge` variant
- new `Button` size
- reusable `Dialog` pattern

### Put it in `packages/ui-patterns` when:

- it is a reusable composed fragment
- it combines multiple atoms into a generic pattern
- it still does not depend on Cedar business logic

Examples:
- `PageHeader`
- `PageContainer`
- reusable filter or layout fragment

### Put it in `apps/web/components` when:

- it knows about Cedar terminology or Cedar data fields
- it knows Cedar routes
- it maps Cedar business states to labels, colors, or behavior
- it is only useful inside the Cedar app

Examples:
- `AuthorityBadge`
- `RegulationRow`
- `LibraryCategoryNav`
- `SidebarShell`

When in doubt, start more specific. It is easier to generalize later than to prematurely create a fake shared abstraction.

---

## Layering Rules

Use this stack:

1. `ui` atoms
2. `ui-patterns` fragments when helpful
3. Cedar app components
4. page routes in `app/`

Typical shape:

- page fetches data
- page passes props into Cedar components
- Cedar components compose `ui` and `ui-patterns`
- small Cedar leaf components support larger Cedar components

Examples:

- `Badge` -> `AuthorityBadge` -> `RegulationRow` -> `library/[slug]/page.tsx`
- `Table` -> `SeverityBadge` + `StatusBadge` -> `ChangeTableRow` -> `changes/page.tsx`

Do not pull Cedar business logic down into the design system.

Do not put generic shared primitives in `apps/web/components` unless they are truly Cedar-specific.

---

## Import Conventions

### Design system atoms

Import from `ui`:

```tsx
import { Badge, Button, Card, Table } from 'ui'
```

### Design system fragments

Import from `ui-patterns/<ComponentName>`:

```tsx
import { PageContainer } from 'ui-patterns/PageContainer'
import { PageHeader } from 'ui-patterns/PageHeader'
```

### Cedar app components

Import from the Cedar barrel when available:

```tsx
import { RegulationRow, SeverityBadge } from '@/components'
```

If a component is mid-build and not yet exported, local path imports are acceptable temporarily, but export it before finishing.

---

## Barrel Exports

The Cedar barrel file is:

- `apps/web/components/index.ts`

After creating a new Cedar app component:

1. export it from `apps/web/components/index.ts`
2. add a short JSDoc description
3. prefer using the barrel from app routes and sibling Cedar components

This keeps the Cedar component inventory discoverable.

---

## Data Wiring

This is the most important rule:

**Cedar components usually do not fetch their own initial data.**

Instead:

1. the page, layout, or feature-level parent fetches data
2. it transforms the result into clean props
3. it passes those props into Cedar components

### Default rule

- pages and feature containers own data fetching
- Cedar components own presentation and Cedar-specific meaning
- Cedar leaf components usually render props only

### Server reads

For initial page loads, fetch in server routes using the appropriate data client and pass the results down.

Examples:
- `app/(dashboard)/changes/page.tsx`
- `app/(dashboard)/library/[slug]/page.tsx`
- `app/(dashboard)/settings/page.tsx`

### Client interactivity

If a component needs interaction:

- give it initial props from the parent
- handle writes through server actions or API routes
- use browser-side data access only when the interaction truly requires it

Example:
- `NotificationsForm` receives `initial` props, then saves via a server action

### Reconnecting a lost data source

If a component’s query or parent data flow gets removed:

1. define the component’s required props clearly
2. find the parent route that renders it
3. recreate the parent query there
4. map the raw DB/API result into component props
5. keep the visual component focused on rendering

For example, `RegulationRow` should not own the query for `kg_entities`. The route that renders the regulation list should.

---

## Supabase Usage

Follow the repo rules in `AGENTS.md` and the Supabase prompts under `docs/supabase-prompts/`.

High-level rule:

- use user-safe reads in pages/components rendering app data
- use service role only in Inngest functions and API routes that require it
- do not move privileged access into Cedar leaf components

If a Cedar component needs Supabase-connected behavior, prefer:

- parent fetch for reads
- server actions / route handlers for writes

---

## Styling Rules

### Use design-system language

Cedar app components should use shared design-system primitives and semantic classes whenever possible.

Prefer:
- `bg-surface-75`
- `bg-surface-100`
- `text-foreground`
- `text-foreground-light`
- `border-default`
- `border-strong`

Avoid hardcoded visual values when a semantic token exists:
- avoid raw hex colors
- avoid `text-gray-500`
- avoid arbitrary border colors for normal UI

### Custom styles are still allowed

Custom Cedar components often need custom layout styling.

That is fine for:
- split panes
- PDF viewers
- sticky toolbars
- custom scroll regions
- complex responsive layouts

The rule is:

- use semantic tokens for visual design
- use custom layout classes for feature-specific structure

### Wrapper rule

Do not create a Cedar wrapper around every primitive.

Use `ui` directly when:
- the primitive is generic
- the page only needs it once
- no Cedar-specific meaning is being added

Create a Cedar wrapper when:
- Cedar business logic is involved
- the same composition repeats
- Cedar routes, labels, or state mapping are embedded

---

## Naming Rules

Prefer feature-specific names over fake-generic names.

Good:
- `LibraryCategoryNav`
- `LibraryCategoryListItem`
- `RegulationRow`
- `PracticeTierBadge`

Avoid broad names unless the abstraction is proven:
- `CategoryListItem`
- `DataCard`
- `DetailPanel`

Start specific. Generalize later only if the component is reused cleanly in multiple places.

---

## Component Types

Useful internal vocabulary:

- **Cedar component**: any app-specific component in `apps/web/components`
- **subcomponent**: a Cedar component that mainly supports a larger Cedar component
- **leaf component**: a small end-point component with no Cedar children below it

Examples:
- `RegulationRow` is a Cedar component
- `AuthorityBadge` is a Cedar component and often a leaf component
- `LibraryCategoryListItem` may be a subcomponent of `LibraryCategoryNav`

Deep nesting is fine if each component has a clear responsibility.

---

## Server vs Client

Add `'use client'` only when needed.

Use a client component when the component uses:
- hooks
- browser APIs
- event handlers
- router hooks
- transitions
- interactive state

Keep components server-safe when they only render props.

This reduces hydration cost and keeps data flow simpler.

---

## Recommended Build Workflow

When building a new Cedar component:

1. Identify the Cedar concept
2. Check `apps/web/components/index.ts` for an existing component
3. Check `packages/ui` and `packages/ui-patterns` for reusable building blocks
4. Decide whether to use primitives directly or create supporting Cedar leaf components
5. Define a clean typed prop interface
6. Build the component in `apps/web/components/`
7. Export it from the barrel
8. Wire data in the parent route or feature container
9. Preview it in the real Cedar page or a temporary app preview route

---

## Previewing Components

Unlike the design system docs app, Cedar app components are usually previewed in the Cedar app itself.

Typical workflow:

1. build the component in `apps/web/components`
2. use it in the real page that owns it
3. run the web app locally
4. inspect it in context

Use temporary preview routes only when the target page is too noisy for iteration.

---

## Checklist

Before finishing a new Cedar app component, confirm:

- [ ] it belongs in `apps/web/components`, not the shared design system
- [ ] it composes `ui` / `ui-patterns` appropriately
- [ ] its props are typed and focused
- [ ] initial data is fetched by a parent, not by the leaf component
- [ ] it uses semantic design-system tokens where possible
- [ ] `'use client'` is only present if required
- [ ] it is exported from `apps/web/components/index.ts`
- [ ] it has been previewed in the Cedar app

---

## Examples In This Repo

Useful references:

- `apps/web/components/RegulationRow.tsx`
- `apps/web/components/DomainCard.tsx`
- `apps/web/components/SeverityBadge.tsx`
- `apps/web/components/StatusBadge.tsx`
- `apps/web/components/SidebarShell.tsx`
- `apps/web/components/NotificationsForm.tsx`
- `apps/web/app/(dashboard)/library/[slug]/page.tsx`
- `apps/web/app/(dashboard)/changes/page.tsx`
- `apps/web/app/(dashboard)/settings/page.tsx`

---

## Rule Of Thumb

Use the design system for the language of the interface.

Use Cedar app components for the meaning of the product.
