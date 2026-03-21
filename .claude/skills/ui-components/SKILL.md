# Skill: UI Component Creation (Cedar + Radix Themes)

> **Full reference:** `docs/design-system/design-standards.md` — read this before building any UI. It contains all component variants, color choices, token usage, badge specifications, and the quality checklist.
>
> **Token reference:** `.claude/skills/design-tokens/SKILL.md` — walk the decision tree when choosing how to apply a visual value.

## Before building any UI

1. Read `docs/design-system/design-standards.md`
2. Does a Radix Themes component cover this need? → Use it with props
3. Check `components/` for existing Cedar composite components
4. Check `lib/ui-constants.ts` for existing color/status mappings
5. Check `lib/format.ts` for existing formatting utilities

## Component routing

### Path A: Radix Themes component exists → use it

Import from `@radix-ui/themes`. Style through props — no className for visual styling.

```tsx
import { Button, Flex, Text, Heading, Card, Table, Badge, Dialog, Select, TextField } from "@radix-ui/themes"
```

**Available Radix Themes components:**
Button, IconButton, TextField, TextArea, Select, Checkbox, CheckboxGroup, RadioGroup, Switch, Slider, Dialog, AlertDialog, DropdownMenu, ContextMenu, Popover, HoverCard, Tooltip, Tabs, TabNav, Table, DataList, Badge, Callout, Card, Avatar, Separator, ScrollArea, Skeleton, Spinner, Progress, SegmentedControl, AspectRatio, Box, Flex, Grid, Container, Section, Heading, Text, Code, Blockquote, Em, Kbd, Link, Quote, Strong, Inset, Reset, Theme, Portal, Slot, AccessibleIcon, VisuallyHidden

### Path B: Radix Themes component does not exist → build custom

Use Radix Primitives + Tailwind + Cedar semantic tokens (`--cedar-*`). Currently needed for:

| Component | Source |
|-----------|--------|
| Accordion | `@radix-ui/react-accordion` |
| Sheet/SlideOver | `@radix-ui/react-dialog` (styled as side panel) |
| Sidebar | Custom layout component |
| Breadcrumb | Custom with `<Text>` and `<Link>` |
| Pagination | Custom with `<Button>` and `<IconButton>` |
| Command palette | `cmdk` package |
| Toast | `sonner` package |

Portalled custom components must wrap content in `<Theme>` from `@radix-ui/themes`.

### Path C: Pattern appears 3+ times → extract Cedar composite component

1. Build in `components/[name].tsx`
2. Use Radix Themes components as building blocks (styled via props)
3. Accept relevant props and pass them through
4. Name by what it is, never where it's used

Keep one-off patterns local in the feature directory.

## Interaction states checklist

Every component must handle all applicable states:

- [ ] Default (resting)
- [ ] Hover
- [ ] Focus-visible (use `--cedar-focus-ring` for custom components)
- [ ] Active / pressed
- [ ] Disabled (where applicable)
- [ ] Loading (for async actions — use `<Button loading>` or `<Spinner>`)
- [ ] Error (for form fields)
- [ ] Empty state (for data views)
- [ ] Exit animation (every animated entrance must have one)
