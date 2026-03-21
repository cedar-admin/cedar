# Frontend Structural Standards

> **Purpose:** This document governs semantic HTML structure — heading hierarchy, landmarks, accessibility markup, document outline, and SEO patterns. It complements the design system (`docs/design-system/design-standards.md`), which governs visual styling (colors, spacing, component variants, tokens). Both documents must be followed on every frontend change.
>
> **When to read this document:** Before creating new pages, modifying layouts, changing component hierarchy, adding interactive elements, or restructuring any template markup.

---

## §1 · Heading Hierarchy

### 1.1 One `<h1>` Per Page

Every routed page (`page.tsx`) must contain exactly one `<h1>`. This is the page title and the root of the document outline. Layouts (`layout.tsx`) must never render an `<h1>` — only pages do.

### 1.2 The `as` Prop Is Mandatory on `<Heading>`

Radix Themes `<Heading>` renders as `<h1>` by default. Relying on this default produces invalid heading structure across cards, panels, and nested content. **Every `<Heading>` must have an explicit `as` prop.**

**Cross-reference:** For visual sizing (`size`, `weight`, `color`), follow `design-standards.md §21`. For the semantic level (`as`), follow the rules in this section. Both must be set on every usage.

```tsx
// ✅ Correct — as from this document, size/weight from design standards
<Heading as="h1" size="6" weight="bold">Regulation Library</Heading>

// ❌ Forbidden — missing as prop, defaults to h1
<Heading size="6" weight="bold">Regulation Library</Heading>

// ❌ Forbidden — missing visual props
<Heading as="h2">Source Categories</Heading>
```

### 1.3 Determining the Correct Level

Follow this decision sequence:

1. **Page title** → `h1`
2. **Major content sections** directly under the page title → `h2`
3. **Subsections** within an `h2` section → `h3`
4. **Items within a subsection** (card titles in a grid, table group headers, panel headers) → one level deeper than their parent section heading
5. **Deeply nested content** (accordion items within a card, modal section headers) → continue incrementing, maximum `h6`

**The heading level reflects document structure, never visual size.** A card title that looks small may still be an `h3` if it sits within an `h2` section. Use the `size` prop from the design system to control visual appearance independently.

### 1.4 Context-Specific Rules

| Context | Heading Level | Rationale |
|---|---|---|
| Page title | `h1` | One per page, always |
| Dashboard section (e.g., "Recent Changes") | `h2` | Top-level content division |
| Card title within a dashboard section | `h3` | Nested inside `h2` section |
| Modal/dialog title | `h2` | Modals create their own context; `h2` keeps outline flat and scannable |
| Sidebar navigation title | `h2` (within `<nav>`) | Independent landmark, starts at `h2` |
| Slide-over panel title | `h2` | Independent overlay context |
| Accordion item title within a card | `h4` | Card title is `h3`, accordion items nest under it |
| Empty state title | Same level as sibling content | Replaces content, inherits the same heading level |

### 1.5 Cards in Grids

When rendering a grid of cards (e.g., regulation categories, source tiles), every card title shares the same heading level — the level appropriate for that position in the hierarchy.

```tsx
// ✅ Correct — category grid under an h2 section
<Heading as="h2" size="5" weight="bold">Browse by Category</Heading>
<Grid>
  <Card>
    <Heading as="h3" size="3" weight="medium">Licensing & Scope</Heading>
  </Card>
  <Card>
    <Heading as="h3" size="3" weight="medium">Telehealth</Heading>
  </Card>
</Grid>

// ❌ Forbidden — every card title renders as h1
<Grid>
  <Card>
    <Heading size="3">Licensing & Scope</Heading>
  </Card>
  <Card>
    <Heading size="3">Telehealth</Heading>
  </Card>
</Grid>
```

---

## §2 · Landmark Elements

### 2.1 Required Landmarks

Every page must be reachable within this landmark structure:

| Landmark | Element | Location | Notes |
|---|---|---|---|
| Banner | `<header>` | Root layout | Page-level header/topbar; one per page |
| Navigation | `<nav>` | Sidebar, topbar nav | Label with `aria-label` when multiple `<nav>` exist |
| Main | `<main>` | Root layout | One per page; wraps the page content slot |
| Complementary | `<aside>` | Slide-over panels, secondary sidebars | Always label with `aria-label` |
| Content Info | `<footer>` | Root layout (if present) | Page-level footer |

### 2.2 App Router Layout Structure

The root layout (`app/layout.tsx`) provides the page-level landmarks. Nested layouts and pages slot their content into `<main>`.

```tsx
// ✅ Root layout structure
<html lang="en">
  <body>
    <Theme>
      <header>{/* topbar */}</header>
      <div className="app-shell">
        <nav aria-label="Main navigation">{/* sidebar */}</nav>
        <main id="main-content">
          {children} {/* pages render here */}
        </main>
      </div>
    </Theme>
  </body>
</html>

// ✅ Page component — no duplicate landmarks
export default function LibraryPage() {
  return (
    <div className="page-container">
      <Heading as="h1" size="6" weight="bold">Regulation Library</Heading>
      <section aria-labelledby="categories-heading">
        <Heading as="h2" size="5" id="categories-heading">Categories</Heading>
        {/* content */}
      </section>
    </div>
  );
}

// ❌ Forbidden — page re-wraps in <main>
export default function LibraryPage() {
  return (
    <main> {/* duplicate main landmark */}
      <Heading as="h1" size="6" weight="bold">Regulation Library</Heading>
    </main>
  );
}
```

### 2.3 When to Use Landmarks vs `<div>` / `<Box>`

Use a landmark when the region has **independent, identifiable content** that a screen reader user would want to jump to. Use `<div>` or Radix `<Box>` for purely visual grouping (layout wrappers, spacing containers, card bodies).

```tsx
// ✅ Meaningful section with identifiable content
<section aria-labelledby="recent-changes">
  <Heading as="h2" id="recent-changes" size="5">Recent Changes</Heading>
  {/* change feed */}
</section>

// ✅ Visual grouping — no semantic meaning
<Box className="grid grid-cols-3 gap-4">
  {/* card grid */}
</Box>

// ❌ Overuse — wrapping a single card in a <section>
<section>
  <Card>{/* single card content */}</Card>
</section>
```

### 2.4 Labeling Multiple Landmarks

When the page contains multiple instances of the same landmark type, each must have a unique accessible label.

```tsx
// ✅ Two <nav> landmarks, each labeled
<nav aria-label="Main navigation">{/* sidebar */}</nav>
<nav aria-label="Breadcrumb">{/* breadcrumbs */}</nav>

// ❌ Two unlabeled <nav> elements — screen readers can't distinguish them
<nav>{/* sidebar */}</nav>
<nav>{/* breadcrumbs */}</nav>
```

---

## §3 · Document Outline

### 3.1 Outline Validation

When the heading hierarchy is extracted from any page, it must produce a logical, navigable outline with no skipped levels.

```
✅ Valid outline:
h1 Regulation Library
  h2 Browse by Category
    h3 Licensing & Scope
    h3 Telehealth
    h3 Prescribing Standards
  h2 Recently Updated

❌ Invalid outline (skipped level):
h1 Regulation Library
  h3 Licensing & Scope    ← skipped h2
  h3 Telehealth
```

### 3.2 Skip Navigation

The root layout must include a skip-nav link as the first focusable element, targeting `#main-content`.

```tsx
// ✅ Skip nav — first element inside <body>
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black"
>
  Skip to main content
</a>
```

### 3.3 Visually Hidden Content

Use Tailwind's `sr-only` class for content that should be available to screen readers but hidden visually. Use this for skip links, icon-only button labels, and supplementary landmark labels.

```tsx
// ✅ Icon-only button with accessible label
<button aria-label="Close panel">
  <RiCloseLine aria-hidden="true" />
</button>

// ✅ Alternative: visually hidden text
<button>
  <RiCloseLine aria-hidden="true" />
  <span className="sr-only">Close panel</span>
</button>
```

---

## §4 · Radix `<Text>` Nesting Rules

### 4.1 The Core Rule

Radix Themes `<Text>` renders as `<p>` by default. Nesting a `<p>` inside another `<p>`, a `<label>`, a `<button>`, or any inline context produces invalid HTML.

**Decision rule:** If the `<Text>` is a block-level standalone paragraph, use the default. If it appears inside any other element, use `as="span"`.

### 4.2 Contexts Requiring `as="span"`

| Parent Context | Rule |
|---|---|
| Inside another `<Text>` | `as="span"` required |
| Inside `<label>` | `as="span"` required |
| Inside `<button>` or `<Button>` | `as="span"` required |
| Inside `<a>` or `<Link>` | `as="span"` required |
| Inside `<Heading>` | `as="span"` required |
| Inside a `<Badge>` or `<Tag>` | `as="span"` required |
| Inside table cells (`<td>`, `<th>`) | `as="span"` required |
| Inside list items (`<li>`) containing other block elements | `as="span"` required |
| Standalone block paragraph | Default `<p>` is fine |

```tsx
// ✅ Standalone paragraph — default is fine
<Text size="2" color="gray">
  This regulation was last updated on March 15, 2026.
</Text>

// ✅ Inside a label — must be span
<label>
  <Text as="span" size="2" weight="medium">Practice Name</Text>
  <input type="text" />
</label>

// ✅ Nested inside another Text
<Text size="2">
  Updated by <Text as="span" weight="bold">Dr. Martinez</Text> on March 15.
</Text>

// ❌ Nested <p> inside <p> — invalid HTML
<Text size="2">
  Updated by <Text weight="bold">Dr. Martinez</Text> on March 15.
</Text>

// ❌ <p> inside a button — invalid HTML
<Button>
  <Text size="2">Save Changes</Text>
</Button>

// ✅ Correct button content
<Button>
  <Text as="span" size="2">Save Changes</Text>
</Button>
```

---

## §5 · Lists and Data Structures

### 5.1 Choosing the Right Structure

| Content Type | Element | When to Use |
|---|---|---|
| Unordered collection | `<ul>` + `<li>` | Navigation items, tag lists, feature lists, card grids (when semantically a list) |
| Ordered sequence | `<ol>` + `<li>` | Steps, ranked items, numbered procedures |
| Key-value pairs | `<dl>` + `<dt>/<dd>` | Regulation metadata, entity details, configuration summaries |
| Tabular key-value display | Radix `<DataList>` | Structured metadata display within Radix-themed UI |
| Tabular data with rows/columns | `<Table>` | Comparison data, user lists, audit logs |

### 5.2 Navigation Lists

Navigation menus must use `<nav>` wrapping a `<ul>`.

```tsx
// ✅ Navigation list
<nav aria-label="Main navigation">
  <ul className="flex flex-col gap-1">
    <li><Link href="/library">Library</Link></li>
    <li><Link href="/changes">Changes</Link></li>
    <li><Link href="/tasks">Tasks</Link></li>
  </ul>
</nav>

// ❌ Navigation without list structure
<nav aria-label="Main navigation">
  <div className="flex flex-col gap-1">
    <Link href="/library">Library</Link>
    <Link href="/changes">Changes</Link>
  </div>
</nav>
```

### 5.3 Definition Lists for Metadata

Use `<dl>` for key-value displays like regulation metadata panels.

```tsx
// ✅ Regulation metadata
<dl className="grid grid-cols-2 gap-2">
  <dt className="text-gray-500 text-sm">Effective Date</dt>
  <dd className="text-sm font-medium">January 1, 2026</dd>
  <dt className="text-gray-500 text-sm">Source Agency</dt>
  <dd className="text-sm font-medium">Florida Board of Medicine</dd>
</dl>
```

### 5.4 The `<time>` Element for Dates

Cedar surfaces dates throughout the UI: effective dates, last-updated timestamps, crawl times, change feed entries. All machine-readable dates must use the `<time>` element with a `datetime` attribute. This enables assistive technology to parse dates correctly and supports future structured data extraction.

```tsx
// ✅ Date with <time> element
<Text as="span" size="2" color="gray">
  Effective <time dateTime="2026-01-01">January 1, 2026</time>
</Text>

// ✅ Timestamp in a change feed entry
<Text as="span" size="1" color="gray">
  Updated <time dateTime="2026-03-15T14:30:00Z">March 15, 2026 at 2:30 PM</time>
</Text>

// ❌ Date rendered as plain text — no machine-readable format
<Text as="span" size="2" color="gray">Effective January 1, 2026</Text>
```

**Rule:** Every visible date or timestamp in the UI must be wrapped in `<time datetime="...">`. The `datetime` attribute uses ISO 8601 format (`YYYY-MM-DD` for dates, `YYYY-MM-DDTHH:mm:ssZ` for timestamps).

---

## §6 · Interactive Element Semantics

### 6.1 Links vs Buttons

| Intent | Element | Rule |
|---|---|---|
| Navigate to a URL/route | `<a>` (or Next.js `<Link>`) | Must have an `href` |
| Trigger an in-page action | `<button>` | Must have `type="button"` (unless submitting a form, then `type="submit"`) |
| Toggle UI state | `<button>` | Use `aria-expanded`, `aria-pressed` as appropriate |

### 6.2 The `asChild` Pattern

Radix components that accept `asChild` delegate rendering to the child element. This preserves correct semantics when combining Radix functionality with semantic elements.

```tsx
// ✅ Radix Button wrapping a Next.js Link
<Button asChild>
  <Link href="/library">Go to Library</Link>
</Button>

// ✅ Radix DropdownMenu.Trigger as a button
<DropdownMenu.Trigger asChild>
  <button type="button" aria-label="More options">
    <RiMore2Fill aria-hidden="true" />
  </button>
</DropdownMenu.Trigger>
```

### 6.3 Forbidden Interactive Patterns

```tsx
// ❌ div with click handler — not keyboard accessible, no role
<div onClick={handleClick}>Click me</div>

// ❌ Anchor without href — not navigable
<a onClick={handleClick}>Do something</a>

// ❌ Anchor used for an action (no destination)
<a href="#" onClick={(e) => { e.preventDefault(); doAction(); }}>Delete</a>

// ✅ Button for actions
<button type="button" onClick={handleClick}>Click me</button>

// ✅ Anchor for navigation
<Link href="/settings">Settings</Link>
```

---

## §7 · Images and Media

### 7.1 Alt Text Requirements

Every `<img>` (or Next.js `<Image>`) must have an `alt` attribute.

| Image Type | Alt Text Rule |
|---|---|
| Informative (conveys content) | Descriptive alt text: `alt="Florida Board of Medicine logo"` |
| Decorative (purely visual) | Empty alt: `alt=""` and `aria-hidden="true"` |
| Complex (charts, diagrams) | Brief alt + extended description via `aria-describedby` or `<figcaption>` |

### 7.2 Figure and Caption

Use `<figure>` and `<figcaption>` for images that need visible captions or attribution.

```tsx
// ✅ Image with caption
<figure>
  <Image src="/screenshots/dashboard.png" alt="Cedar dashboard showing regulation change feed" />
  <figcaption>
    <Text as="span" size="1" color="gray">The Cedar dashboard displays real-time regulatory changes.</Text>
  </figcaption>
</figure>
```

### 7.3 Icons

Icons used alongside text are decorative and must be hidden from assistive technology. Icons used alone (icon-only buttons) require an accessible label.

```tsx
// ✅ Icon with text — icon is decorative
<button type="button">
  <RiFilterLine aria-hidden="true" />
  <Text as="span" size="2">Filter</Text>
</button>

// ✅ Icon-only button — button needs a label
<button type="button" aria-label="Filter regulations">
  <RiFilterLine aria-hidden="true" />
</button>

// ❌ Icon-only button without label
<button type="button">
  <RiFilterLine />
</button>
```

### 7.4 Image Dimensions and CLS Prevention

Every image must have explicit `width` and `height` attributes to prevent Cumulative Layout Shift (CLS). Use Next.js `<Image>` as the default — it requires dimensions and handles `srcset`, lazy loading, and format optimization automatically. Use bare `<img>` only when `<Image>` is technically incompatible (e.g., SVG sprites, dynamically generated data URIs).

```tsx
// ✅ Next.js Image with explicit dimensions
<Image
  src="/logos/florida-bom.png"
  alt="Florida Board of Medicine logo"
  width={120}
  height={40}
/>

// ✅ Fill mode for responsive containers (still prevents CLS via the parent)
<div className="relative w-full aspect-video">
  <Image
    src="/screenshots/dashboard.png"
    alt="Cedar dashboard"
    fill
    className="object-cover"
  />
</div>

// ❌ Bare <img> without dimensions — causes layout shift
<img src="/logos/florida-bom.png" alt="Florida Board of Medicine logo" />

// ❌ Bare <img> when Next.js <Image> would work — misses optimization
<img src="/logos/florida-bom.png" alt="Florida Board of Medicine logo" width={120} height={40} />
```

---

## §8 · Forms

### 8.1 Label Association

Every form input must have a programmatically associated label. Use `htmlFor` on `<label>` or wrap the input inside the `<label>`.

```tsx
// ✅ Explicit association
<label htmlFor="practice-name">
  <Text as="span" size="2" weight="medium">Practice Name</Text>
</label>
<input id="practice-name" type="text" />

// ✅ Implicit association (wrapping)
<label>
  <Text as="span" size="2" weight="medium">Practice Name</Text>
  <input type="text" />
</label>

// ❌ No label association
<Text size="2" weight="medium">Practice Name</Text>
<input type="text" />
```

### 8.2 Field Groups

Related form fields must be wrapped in `<fieldset>` with a `<legend>`.

```tsx
// ✅ Grouped fields
<fieldset>
  <legend>
    <Text as="span" size="2" weight="bold">Contact Information</Text>
  </legend>
  <label htmlFor="email">
    <Text as="span" size="2">Email</Text>
  </label>
  <input id="email" type="email" />
  <label htmlFor="phone">
    <Text as="span" size="2">Phone</Text>
  </label>
  <input id="phone" type="tel" />
</fieldset>
```

### 8.3 Error Messages

Error messages must be linked to their input via `aria-describedby` and marked with `role="alert"` or `aria-live="polite"` for dynamic errors.

```tsx
// ✅ Error linked to input
<label htmlFor="email">
  <Text as="span" size="2">Email</Text>
</label>
<input
  id="email"
  type="email"
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && (
  <Text as="span" size="1" color="red" id="email-error" role="alert">
    {error}
  </Text>
)}
```

### 8.4 Required Fields

Required fields must be marked both visually and programmatically. Use the `required` attribute and `aria-required="true"` together.

```tsx
// ✅ Required field — both attributes set
<label htmlFor="practice-name">
  <Text as="span" size="2" weight="medium">
    Practice Name <Text as="span" size="1" color="red" aria-hidden="true">*</Text>
  </Text>
</label>
<input
  id="practice-name"
  type="text"
  required
  aria-required="true"
/>
```

### 8.5 Placeholders

Placeholders are supplementary hints — they show example input or formatting guidance. They must never serve as the field's label, because placeholder text disappears on focus and is often low-contrast.

```tsx
// ✅ Placeholder as formatting hint alongside a label
<label htmlFor="phone">
  <Text as="span" size="2">Phone Number</Text>
</label>
<input id="phone" type="tel" placeholder="(555) 123-4567" />

// ❌ Placeholder used as the label — no <label> element
<input type="tel" placeholder="Phone Number" />
```

### 8.6 Input Types

Use the most specific HTML input type for each field. This enables mobile keyboard optimization, built-in browser validation, and autofill support.

| Data | Input Type | Autocomplete Attribute |
|---|---|---|
| Email address | `type="email"` | `autocomplete="email"` |
| Phone number | `type="tel"` | `autocomplete="tel"` |
| URL | `type="url"` | `autocomplete="url"` |
| Password | `type="password"` | `autocomplete="current-password"` or `"new-password"` |
| Search | `type="search"` | — |
| Date | `type="date"` | — |
| Number | `type="number"` | — |

### 8.7 Form Submission

Forms that perform server actions or mutations should use `<form>` with `action` (Server Actions) or `onSubmit`. The submit button must have `type="submit"`.

---

## §9 · Tables

### 9.1 When to Use Tables

Use `<Table>` (Radix) or semantic `<table>` for data that has a row-column relationship — user lists, audit logs, regulation change history, source management. Use card layouts or description lists for single-entity detail views.

### 9.2 Required Table Structure

```tsx
// ✅ Properly structured table
<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.RowHeaderCell>Dr. Martinez</Table.RowHeaderCell>
      <Table.Cell>Admin</Table.Cell>
      <Table.Cell>Active</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table.Root>
```

### 9.3 Table Rules

- Always include `<Table.Header>` with `<Table.ColumnHeaderCell>` elements
- Use `<Table.RowHeaderCell>` for the first cell in each row when it identifies the row (e.g., user name, regulation title)
- Add `<caption>` (or `aria-label` on `<Table.Root>`) when the table's purpose isn't clear from surrounding context
- Empty tables must show an empty state message — never render an empty `<Table.Body>`

---

## §10 · Meta and SEO

### 10.1 Page Metadata Pattern

Every page must export a `metadata` object (or `generateMetadata` function) following Next.js conventions.

```tsx
// ✅ Static metadata
export const metadata: Metadata = {
  title: "Regulation Library — Cedar",
  description: "Browse Florida healthcare regulations by category, agency, and service line.",
};

// ✅ Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const regulation = await getRegulation(params.id);
  return {
    title: `${regulation.title} — Cedar`,
    description: regulation.summary?.slice(0, 160),
  };
}
```

### 10.2 Title Pattern

All page titles follow the format: **`Page Name — Cedar`**

| Page | Title |
|---|---|
| Library | `Regulation Library — Cedar` |
| Specific regulation | `{Regulation Title} — Cedar` |
| Admin users | `User Management — Cedar Admin` |
| Dashboard | `Dashboard — Cedar` |

### 10.3 Open Graph Tags

Include Open Graph tags on all public-facing pages. Admin pages (`app/(admin)/`) can omit them.

```tsx
export const metadata: Metadata = {
  title: "Regulation Library — Cedar",
  openGraph: {
    title: "Regulation Library — Cedar",
    description: "Browse Florida healthcare regulations by category.",
    siteName: "Cedar",
    type: "website",
  },
};
```

### 10.4 Canonical URLs

Set canonical URLs on pages that might be reached through multiple paths (e.g., filtered views, paginated lists).

```tsx
export const metadata: Metadata = {
  alternates: {
    canonical: "https://cedarstandard.com/library",
  },
};
```

### 10.5 Structured Data

For regulation detail pages, consider JSON-LD structured data using `schema.org/Legislation` or `schema.org/GovernmentService` types. Implement via a `<script type="application/ld+json">` tag in the page component. This is a progressive enhancement — implement on regulation detail pages first, expand later.

---

## §11 · ARIA Patterns

### 11.1 When to Use ARIA

ARIA supplements native HTML semantics. Prefer native HTML elements (a correct `<button>` over `role="button"` on a `<div>`). Use ARIA when native elements don't fully express the interaction:

| Pattern | ARIA Attributes |
|---|---|
| Expandable section | `aria-expanded="true/false"` on the trigger |
| Tab panel | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` |
| Dialog/modal | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Live updates | `aria-live="polite"` for non-urgent, `aria-live="assertive"` for urgent |
| Loading states | `aria-busy="true"` on the container |
| Current page in nav | `aria-current="page"` on the active link |

### 11.2 Navigation Active State

The sidebar navigation must mark the current page.

```tsx
// ✅ Current page indicator
<Link
  href="/library"
  aria-current={pathname === "/library" ? "page" : undefined}
>
  <Text as="span" size="2">Library</Text>
</Link>
```

---

## §12 · Forbidden Patterns

This is a consolidated checklist. Claude Code must verify none of these patterns exist in any structural change before committing.

### Heading Violations
- ❌ `<Heading>` without an explicit `as` prop
- ❌ `<Heading as="h1">` used anywhere other than the page title
- ❌ Multiple `<Heading as="h1">` on a single page
- ❌ Skipped heading levels (e.g., `h1` → `h3` with no `h2`)
- ❌ Heading used purely for visual styling with no structural meaning (use `<Text>` with size/weight instead)
- ❌ `<Heading>` missing visual props (`size`, `weight`) — see `design-standards.md §21`

### Text Nesting Violations
- ❌ `<Text>` nested inside `<Text>` without `as="span"`
- ❌ `<Text>` inside `<label>`, `<button>`, `<Button>`, `<a>`, `<Link>`, `<Badge>`, `<Heading>`, `<td>`, `<th>` without `as="span"`

### Landmark Violations
- ❌ `<main>` inside a page component (root layout provides it)
- ❌ Multiple `<main>` elements on a page
- ❌ Multiple `<nav>` elements without unique `aria-label`
- ❌ `<section>` without `aria-labelledby` or `aria-label`
- ❌ `<header>` or `<footer>` inside `<main>` without being scoped to an `<article>` or `<section>`

### Interactive Element Violations
- ❌ `<div onClick={...}>` as an interactive element
- ❌ `<a>` without an `href`
- ❌ `<a href="#">` with `preventDefault` (use `<button>` instead)
- ❌ `<button>` without `type` attribute (always specify `type="button"` or `type="submit"`)
- ❌ Icon-only `<button>` without `aria-label`

### Image and Icon Violations
- ❌ `<img>` or `<Image>` without `alt` attribute
- ❌ `<Image>` without explicit `width` and `height` (or `fill` with a sized parent)
- ❌ Bare `<img>` used when Next.js `<Image>` would work
- ❌ Decorative icon missing `aria-hidden="true"`
- ❌ Icon used as the sole content of a button without `aria-label` on the button

### Form Violations
- ❌ `<input>` without an associated `<label>` (via `htmlFor` or wrapping)
- ❌ Placeholder text used as the field's only label
- ❌ Required field missing `required` and `aria-required="true"` attributes
- ❌ Error message not linked to input via `aria-describedby`
- ❌ Related form fields without `<fieldset>` and `<legend>` grouping
- ❌ Generic `type="text"` used when a specific type exists (`email`, `tel`, `url`, `search`, `date`)

### Table Violations
- ❌ `<Table>` without `<Table.Header>` / `<Table.ColumnHeaderCell>`
- ❌ Empty `<Table.Body>` with no empty state
- ❌ Data presented in a table that has no row-column relationship (use a list or card layout instead)

### Date and Time Violations
- ❌ Visible date or timestamp rendered as plain text without a `<time>` element
- ❌ `<time>` element missing the `datetime` attribute

### Keyboard & Focus Violations
- ❌ Focus outline removed without a visible replacement (`outline-none` without `focus-visible:` alternative)
- ❌ Positive `tabindex` value (`tabindex="1"` or higher)
- ❌ Modal, dialog, or overlay that does not trap focus
- ❌ Overlay that does not close on `Escape` key
- ❌ Overlay that does not return focus to the trigger element on close

### Motion Violations
- ❌ CSS animation or transition without a `prefers-reduced-motion` override (global or component-level)
- ❌ Missing global `prefers-reduced-motion: reduce` media query in `globals.css`

### Responsive Structure Violations
- ❌ Missing viewport meta tag in root layout metadata
- ❌ Interactive element with touch target smaller than 44×44px
- ❌ CSS visual reordering (`order`, `row-reverse`) that creates a confusing keyboard tab sequence
- ❌ Sidebar overlay mode missing focus trapping, Escape-to-close, or focus restoration
- ❌ Landmark element (`<nav>`, `<main>`, `<aside>`) that changes or disappears at a breakpoint

### Meta / SEO Violations
- ❌ Page missing `metadata` export or `generateMetadata`
- ❌ Page title that doesn't follow the `Page Name — Cedar` format
- ❌ Missing `lang="en"` on `<html>` element (root layout)

### Navigation Violations
- ❌ Navigation menu without `<nav>` + `<ul>` + `<li>` structure
- ❌ Active navigation link missing `aria-current="page"`
- ❌ Missing skip-nav link as the first focusable element

---

## §13 · Keyboard & Focus Management

### 13.1 Focus Order

Interactive elements must receive focus in a logical order that matches the visual reading flow (left-to-right, top-to-bottom). CSS layout changes (`order`, `flex-direction: row-reverse`, grid placement) must never create a mismatch between visual order and DOM/tab order.

### 13.2 Visible Focus Indicators

Every interactive element must have a visible focus indicator with at least 3:1 contrast ratio against the surrounding background. Tailwind's default `focus-visible:` ring is acceptable. Focus outlines must never be removed without a replacement.

```tsx
// ✅ Visible focus with Tailwind
<button
  type="button"
  className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
>
  Save
</button>

// ❌ Focus outline removed — keyboard users can't see where they are
<button type="button" className="outline-none">Save</button>
```

### 13.3 `tabindex` Rules

| Value | Usage |
|---|---|
| `tabindex="0"` | Adds a non-interactive element to the tab order. Use sparingly and only when no semantic alternative exists. |
| `tabindex="-1"` | Removes from tab order but allows programmatic focus (e.g., `element.focus()`). Use for focus targets like `#main-content`. |
| `tabindex="1"` or higher | **Forbidden.** Positive values disrupt the natural tab order. |

### 13.4 Focus Trapping in Overlays

Modals, dialogs, and the mobile sidebar overlay must trap focus — Tab and Shift+Tab cycle through focusable elements within the overlay and cannot escape to the content behind it. Radix `Dialog` and `AlertDialog` handle this automatically. Custom overlays (like Cedar's sidebar in overlay mode) must implement trapping manually or use a library.

```tsx
// ✅ Radix Dialog — focus trapping is built in
<Dialog.Root>
  <Dialog.Trigger asChild>
    <button type="button">Open</button>
  </Dialog.Trigger>
  <Dialog.Content>
    {/* Focus is trapped here automatically */}
    <Dialog.Close asChild>
      <button type="button" aria-label="Close">
        <RiCloseLine aria-hidden="true" />
      </button>
    </Dialog.Close>
  </Dialog.Content>
</Dialog.Root>
```

### 13.5 Focus Restoration

When a modal, dialog, slide-over, or dropdown closes, focus must return to the element that triggered it. Radix primitives handle this automatically. Custom overlays must store a reference to the trigger and call `.focus()` on close.

```tsx
// ✅ Manual focus restoration for custom overlay
const triggerRef = useRef<HTMLButtonElement>(null);

function closePanel() {
  setIsOpen(false);
  triggerRef.current?.focus(); // return focus to trigger
}

<button ref={triggerRef} type="button" onClick={() => setIsOpen(true)}>
  Open Panel
</button>
```

### 13.6 Escape Key

All overlays (modals, slide-overs, dropdowns, popovers) must close on `Escape` key press. Radix primitives handle this. Custom overlays must add a `keydown` listener.

---

## §14 · Motion & Reduced Motion

### 14.1 The Rule

All CSS transitions, animations, and transform-based motion must respect the `prefers-reduced-motion` user preference. This is a WCAG 2.2 AA requirement.

### 14.2 Global Reduced Motion Override

The root stylesheet (`globals.css`) must include a global reduced-motion media query. Individual components can refine this, but the global rule ensures nothing is missed.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 14.3 Animation Duration Guidelines

| Type | Duration Range |
|---|---|
| Micro-interactions (button press, toggle, checkbox) | 100–200ms |
| Panel slides, expand/collapse, fade in/out | 200–350ms |
| Page transitions, large layout shifts | 300–500ms |

Use `ease-out` for elements entering the viewport, `ease-in` for elements leaving, and `ease-in-out` for elements changing position. Avoid `linear` easing for UI motion.

### 14.4 Cedar-Specific Motion

The sidebar `translateX` animation and any future expand/collapse patterns in the change feed, accordion, or filter panels must all obey the reduced-motion query. When `prefers-reduced-motion: reduce` is active, these elements should appear/disappear instantly with no sliding or fading.

---

## §15 · Responsive Structure

> **Scope:** This section covers the structural and accessibility constraints that responsive layouts must satisfy. Breakpoint values, grid configurations, spacing adjustments, and fluid typography are governed by the design system (`design-standards.md`).

### 15.1 Viewport Meta Tag

The root layout must include the viewport meta tag. Omitting it breaks every responsive pattern downstream.

```tsx
// ✅ In app/layout.tsx metadata export
export const metadata: Metadata = {
  viewport: "width=device-width, initial-scale=1",
  // ... other metadata
};
```

> **Note:** In Next.js 14+, viewport configuration uses a separate `viewport` export. Follow the pattern established in the codebase.

### 15.2 Touch Target Minimums

All interactive elements must have a minimum touch target size of **44×44px** (WCAG 2.2 AA, Success Criterion 2.5.8). This applies to buttons, links, icon buttons, filter chips, table row actions, and any tappable element.

```tsx
// ✅ Icon button meets minimum target size
<button
  type="button"
  aria-label="Close"
  className="flex items-center justify-center w-11 h-11" // 44px × 44px
>
  <RiCloseLine aria-hidden="true" className="w-5 h-5" />
</button>

// ❌ Icon button too small — fails touch target requirement
<button
  type="button"
  aria-label="Close"
  className="flex items-center justify-center w-6 h-6" // 24px × 24px
>
  <RiCloseLine aria-hidden="true" className="w-4 h-4" />
</button>
```

When the visual element is smaller than 44px (e.g., a compact icon), use padding to expand the touch target while keeping the visual appearance compact.

### 15.3 Landmark Consistency Across Breakpoints

Landmarks must remain semantically correct at every breakpoint. Cedar's sidebar is a `<nav>` on desktop (shared real estate with main content) and a `<nav>` in overlay mode on tablet/mobile (fixed position with scrim). The element stays `<nav>` in both states — the responsive change is purely visual.

When the sidebar is in overlay mode:

- It must trap focus (§13.4)
- It must close on `Escape` (§13.6)
- It must return focus to the trigger on close (§13.5)
- The scrim/backdrop must have `aria-hidden="true"`

```tsx
// ✅ Sidebar remains <nav> in both modes — overlay adds focus trapping
<nav
  aria-label="Main navigation"
  className={cn(
    "lg:translate-x-0 lg:relative",           // desktop: inline
    isOpen ? "translate-x-0" : "-translate-x-full", // mobile: overlay
    "fixed lg:static inset-y-0 left-0 z-40"
  )}
>
  {/* navigation content */}
</nav>

{/* Scrim — decorative backdrop, hidden from assistive tech */}
{isOpen && (
  <div
    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
    aria-hidden="true"
    onClick={closeSidebar}
  />
)}
```

### 15.4 DOM Order and Visual Reordering

When CSS reorders elements visually across breakpoints (via `order`, `flex-direction: row-reverse`, or grid placement), the DOM order must still produce a logical keyboard navigation sequence. Screen readers and keyboard users follow DOM order, not visual order.

**Test:** Tab through the page at each major breakpoint. If the focus sequence feels disorienting or jumps unexpectedly, the DOM order needs adjustment.

```tsx
// ✅ DOM order matches logical reading order at all breakpoints
<div className="flex flex-col lg:flex-row">
  <div className="lg:order-2">{/* main content — visually right on desktop */}</div>
  <div className="lg:order-1">{/* sidebar — visually left on desktop */}</div>
</div>
// ⚠️ Acceptable only if sidebar and main both have internal focus management.
// If sidebar has no focusable elements, this is fine. If both have interactive
// elements, verify the tab sequence makes sense at every breakpoint.
```

### 15.5 Prefer Next.js `<Image>` Over Bare `<img>`

Next.js `<Image>` generates `srcset` with responsive breakpoints, lazy-loads below-fold images, and serves modern formats (WebP/AVIF) automatically. Use it as the default for all raster images. This rule reinforces §7.4 — explicit dimensions on `<Image>` prevent CLS, and the built-in responsive behavior eliminates the need for manual `srcset` configuration.

---

## §16 · Integration Notes

### 16.1 Relationship to Design Standards

| Concern | Governed By |
|---|---|
| Color tokens, spacing, typography sizing | `design-standards.md` |
| Component variants, visual props (`size`, `weight`, `color`) | `design-standards.md` |
| Breakpoint values, grid configurations, fluid typography | `design-standards.md` |
| Heading semantic level (`as` prop) | This document |
| Landmark structure, document outline | This document |
| Accessibility markup, ARIA patterns | This document |
| `<Text>` nesting behavior (`as="span"`) | This document |
| Keyboard focus management, focus trapping | This document |
| Reduced motion requirements | This document |
| Touch target minimums, responsive structural constraints | This document |

When a Radix component needs both visual and structural configuration (like `<Heading>`), apply rules from both documents:

```tsx
// ✅ Both documents applied
<Heading
  as="h2"           // §1 of this document — semantic level
  size="5"          // design-standards.md §21 — visual size
  weight="bold"     // design-standards.md §21 — visual weight
>
  Recent Changes
</Heading>
```

### 16.2 Route Group Structure

Cedar uses two route groups:

- `app/(dashboard)/` — User-facing application (Library, Changes, Tasks, Calendar, Home)
- `app/(admin)/` — Admin panel (User management, Source management, HITL review)

Each route group may have its own layout. The root layout (`app/layout.tsx`) provides the top-level landmarks (`<html>`, `<body>`, skip-nav). Route group layouts provide group-specific UI (sidebar variant, navigation structure) and slot into the root layout's `<main>`.
