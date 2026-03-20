# Skill: UI Component Creation (Radix Themes)

## Before building any UI

1. Read `docs/design-system/design-standards.md` for patterns and principles
2. Determine: does a Radix Themes component cover this need?
3. Check `components/` for existing Cedar composite components

## Component decision framework

### Use a Radix Themes component (default path)
If the component exists in Radix Themes, use it directly. Import from `@radix-ui/themes`:

```tsx
import { Button, Flex, Text, Heading, Card, Table, Badge, Dialog, Select, TextField } from "@radix-ui/themes"
```

Style through props — no className for visual styling:
```tsx
<Button variant="soft" size="2" color="green">Save</Button>
<Badge variant="outline" color="red">Critical</Badge>
<TextField.Root placeholder="Search..." size="2" />
```

**Available Radix Themes components:**
Button, IconButton, TextField, TextArea, Select, Checkbox, CheckboxGroup, RadioGroup, Switch, Slider, Dialog, AlertDialog, DropdownMenu, ContextMenu, Popover, HoverCard, Tooltip, Tabs, TabNav, Table, DataList, Badge, Callout, Card, Avatar, Separator, ScrollArea, Skeleton, Spinner, Progress, SegmentedControl, AspectRatio, Box, Flex, Grid, Container, Section, Heading, Text, Code, Blockquote, Em, Kbd, Link, Quote, Strong, Inset, Reset, Theme, Portal, Slot, AccessibleIcon, VisuallyHidden

### Build with Radix Primitives + Tailwind (custom path)
When Radix Themes doesn't have the component. Currently needed for:
- Accordion → `@radix-ui/react-accordion`
- Sheet/SlideOver → `@radix-ui/react-dialog` (styled as side panel)
- Sidebar → custom layout component
- Breadcrumb → custom with `<Text>` and `<Link>`
- Pagination → custom with `<Button>` and `<IconButton>`
- Command palette → `cmdk` package
- Toast → `sonner` package

Style with Tailwind referencing Radix CSS variables:
```tsx
<div className="bg-[var(--color-panel-solid)] border border-[var(--gray-6)] rounded-[var(--radius-3)] p-4 shadow-[var(--shadow-4)]">
  <p className="text-[var(--gray-12)]">Custom content</p>
</div>
```

For portalled content, wrap with `<Theme>`:
```tsx
<Dialog.Portal>
  <Theme>
    <Dialog.Overlay className="fixed inset-0 bg-[var(--color-overlay)]" />
    <Dialog.Content>...</Dialog.Content>
  </Theme>
</Dialog.Portal>
```

### Creating a new Cedar composite component
When a pattern appears **3+ times** across the app:
1. Build in `components/[name].tsx`
2. Use Radix Themes components as building blocks
3. Accept relevant props and pass them through
4. Name by what it is, never where it's used

### Keep one-off
Unique to a single page with complex business logic → keep local in the feature directory.

## Layout patterns

Use Radix layout primitives for structure:
```tsx
// Page layout
<Flex direction="column" gap="6">
  <Heading size="6" weight="bold">Title</Heading>
  <Text size="2" color="gray">Subtitle</Text>
  {/* Content */}
</Flex>

// Grid layout
<Grid columns={{ initial: "1", md: "2" }} gap="4">
  <Card>...</Card>
  <Card>...</Card>
</Grid>

// Data display
<DataList.Root>
  <DataList.Item>
    <DataList.Label>Name</DataList.Label>
    <DataList.Value>Cedar Health</DataList.Value>
  </DataList.Item>
</DataList.Root>
```

## Icons
- Remix Icon only: `<i className="ri-[name]-line" />`
- Icon-only buttons: `<IconButton variant="ghost" size="2"><i className="ri-close-line" /></IconButton>`
- Size via Tailwind: `text-sm`, `text-base`, `text-lg`
- Color via Radix tokens: `text-[var(--gray-11)]`

## Interaction states checklist
Every component must handle:
- [ ] Hover state
- [ ] Focus-visible state
- [ ] Disabled state (where applicable)
- [ ] Loading state (for async actions — use `<Button loading>` or `<Spinner>`)
- [ ] Error state (for form fields)
- [ ] Empty state (for data views)
- [ ] Exit animation (if it has an entrance animation)
