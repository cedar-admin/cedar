import type { ReactNode } from 'react'
import {
  AspectRatio,
  Avatar,
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Checkbox,
  CheckboxCards,
  CheckboxGroup,
  DataList,
  Flex,
  IconButton,
  Progress,
  Radio,
  RadioCards,
  RadioGroup,
  ScrollArea,
  SegmentedControl,
  Select,
  Separator,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Table,
  TabNav,
  Tabs,
  Text,
  TextArea,
  TextField,
  Tooltip,
} from '@radix-ui/themes'
import { CedarTable } from '@/components/CedarTable'
import type { VariantRegistryRow } from './VariantRegistry'

type PreviewSize = 'inline' | 'contained' | 'full-width'

export interface AtomExample {
  title: string
  size?: PreviewSize
  code?: string
  render: () => ReactNode
}

export interface AtomDoc {
  whenToUse: string
  hardRules?: string[]
  registry?: VariantRegistryRow[]
  examples: AtomExample[]
  notes?: string[]
}

export const ATOM_FAMILIES = [
  {
    label: 'Actions and navigation',
    slugs: ['buttons', 'dropdown-menu', 'context-menu', 'popover', 'hover-card', 'tabs', 'tab-nav', 'tooltip'],
  },
  {
    label: 'Inputs and selection',
    slugs: ['text-field', 'textarea', 'select', 'checkbox', 'checkbox-group', 'checkbox-cards', 'radio', 'radio-group', 'radio-cards', 'switch', 'segmented-control', 'slider'],
  },
  {
    label: 'Data and feedback',
    slugs: ['badges', 'callouts', 'tables', 'data-list', 'progress', 'scroll-area', 'skeleton', 'spinner'],
  },
  {
    label: 'Surfaces and overlays',
    slugs: ['cards', 'avatar', 'aspect-ratio', 'dialog', 'alert-dialog', 'separator'],
  },
]

function StaticMenuSurface({ title, items }: { title: string; items: string[] }) {
  return (
    <Card variant="surface" className="max-w-xs">
      <Box p="3">
        <Flex direction="column" gap="3">
          <Text as="span" size="1" weight="medium" className="uppercase tracking-[0.12em] text-[var(--cedar-text-muted)]">
            {title}
          </Text>
          <Flex direction="column" gap="1">
            {items.map((item) => (
              <Box
                key={item}
                className="rounded-md border border-[var(--cedar-border-subtle)] bg-[var(--cedar-interactive-hover)] px-3 py-2"
              >
                <Text as="span" size="2">
                  {item}
                </Text>
              </Box>
            ))}
          </Flex>
        </Flex>
      </Box>
    </Card>
  )
}

function StaticPopoverSurface({ title, body }: { title: string; body: string }) {
  return (
    <Flex direction="column" gap="3" className="max-w-sm">
      <Button variant="soft" color="gray">Open detail</Button>
      <Card variant="surface">
        <Box p="3">
          <Flex direction="column" gap="2">
            <Text as="span" size="2" weight="medium">
              {title}
            </Text>
            <Text as="p" size="2" color="gray">
              {body}
            </Text>
          </Flex>
        </Box>
      </Card>
    </Flex>
  )
}

function StaticModalSurface({
  eyebrow,
  title,
  body,
  destructive = false,
}: {
  eyebrow: string
  title: string
  body: string
  destructive?: boolean
}) {
  return (
    <Card variant="surface" className="max-w-md">
      <Box p="4">
        <Flex direction="column" gap="4">
          <Text as="span" size="1" weight="medium" className="uppercase tracking-[0.12em] text-[var(--cedar-text-muted)]">
            {eyebrow}
          </Text>
          <Flex direction="column" gap="2">
            <Text as="span" size="4" weight="bold">
              {title}
            </Text>
            <Text as="p" size="2" color="gray">
              {body}
            </Text>
          </Flex>
          <Flex justify="end" gap="2">
            <Button variant="soft" color="gray">Cancel</Button>
            <Button variant={destructive ? 'solid' : 'classic'} color={destructive ? 'red' : 'gray'} highContrast={!destructive}>
              {destructive ? 'Delete' : 'Continue'}
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Card>
  )
}

function tableSample() {
  return (
    <Card variant="surface">
      <CedarTable surface="nested" size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Severity</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell><Text as="span" size="2">Telehealth prescribing update</Text></Table.Cell>
            <Table.Cell><Badge variant="soft" color="amber">High</Badge></Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell><Text as="span" size="2">Compounding labeling revision</Text></Table.Cell>
            <Table.Cell><Badge variant="soft" color="green">Low</Badge></Table.Cell>
          </Table.Row>
        </Table.Body>
      </CedarTable>
    </Card>
  )
}

export const ATOM_DOCS: Record<string, AtomDoc> = {
  buttons: {
    whenToUse: 'Buttons are Cedar’s core action atoms. They should read as neutral controls first, with color reserved for semantic meaning and destructive moments.',
    hardRules: [
      'Primary actions use `variant="classic" color="gray" highContrast`.',
      'Secondary actions use `variant="soft" color="gray" highContrast`.',
      'Utility and icon actions use `variant="ghost" color="gray"`.',
      'High-stakes destructive actions are the one place `solid red` stays valid.',
    ],
    registry: [
      { code: 'BTN-CLASSIC', name: 'Primary button', purpose: 'Save, confirm, continue, create', contract: 'variant="classic" color="gray" highContrast' },
      { code: 'BTN-SOFT', name: 'Secondary button', purpose: 'Cancel, back, reset, supporting actions', contract: 'variant="soft" color="gray" highContrast' },
      { code: 'BTN-GHOST', name: 'Tertiary button', purpose: 'Quiet utility action', contract: 'variant="ghost" color="gray"' },
      { code: 'BTN-ICON', name: 'Icon button', purpose: 'Compact action with icon only', contract: 'IconButton variant="ghost" color="gray"' },
      { code: 'BTN-DESTRUCT', name: 'Destructive button', purpose: 'Delete, remove, dangerous confirmation', contract: 'variant="solid" color="red"' },
    ],
    examples: [
      {
        title: 'Action hierarchy',
        size: 'full-width',
        code: `<Flex gap="2">
  <Button variant="classic" color="gray" highContrast>Save changes</Button>
  <Button variant="soft" color="gray" highContrast>Cancel</Button>
  <Button variant="ghost" color="gray">Reset</Button>
</Flex>`,
        render: () => (
          <Flex gap="2" wrap="wrap">
            <Button variant="classic" color="gray" highContrast>Save changes</Button>
            <Button variant="soft" color="gray" highContrast>Cancel</Button>
            <Button variant="ghost" color="gray">Reset</Button>
          </Flex>
        ),
      },
      {
        title: 'Destructive and icon-only actions',
        size: 'full-width',
        code: `<Flex gap="2" align="center">
  <Button variant="soft" color="red">Remove source</Button>
  <Button variant="solid" color="red">Delete practice</Button>
  <IconButton variant="ghost" color="gray" aria-label="Close panel">
    <i className="ri-close-line" />
  </IconButton>
</Flex>`,
        render: () => (
          <Flex gap="2" wrap="wrap" align="center">
            <Button variant="soft" color="red">Remove source</Button>
            <Button variant="solid" color="red">Delete practice</Button>
            <IconButton variant="ghost" color="gray" aria-label="Close panel">
              <i className="ri-close-line" aria-hidden="true" />
            </IconButton>
          </Flex>
        ),
      },
    ],
  },
  badges: {
    whenToUse: 'Badge is the base semantic label atom. Cedar uses it directly for simple states and wraps it in named fragments when a domain meaning needs a stable contract.',
    registry: [
      { code: 'BDG-SOFT', name: 'Soft badge', purpose: 'Status, severity, review state', contract: 'variant="soft" color="<semantic>"' },
      { code: 'BDG-OUTLINE', name: 'Outline badge', purpose: 'Metadata labels, tiers, authority', contract: 'variant="outline" color="<semantic>"' },
    ],
    examples: [
      {
        title: 'Soft and outline badges',
        size: 'full-width',
        code: `<Flex gap="2" wrap="wrap">
  <Badge variant="soft" color="green">Approved</Badge>
  <Badge variant="soft" color="amber">Pending</Badge>
  <Badge variant="outline" color="gray">Monitor</Badge>
</Flex>`,
        render: () => (
          <Flex gap="2" wrap="wrap">
            <Badge variant="soft" color="green">Approved</Badge>
            <Badge variant="soft" color="amber">Pending</Badge>
            <Badge variant="soft" color="red">Critical</Badge>
            <Badge variant="outline" color="gray">Monitor</Badge>
          </Flex>
        ),
      },
    ],
  },
  cards: {
    whenToUse: 'Card is Cedar’s core containment atom. Use `surface` as the default, `classic` when you intentionally need more chrome, and `ghost` for inner grouping.',
    registry: [
      { code: 'CRD-SURFACE', name: 'Surface card', purpose: 'Default page section or module', contract: 'Card variant="surface"' },
      { code: 'CRD-CLASSIC', name: 'Classic card', purpose: 'More emphatic module chrome', contract: 'Card variant="classic"' },
      { code: 'CRD-GHOST', name: 'Ghost card', purpose: 'Nested surface inside another container', contract: 'Card variant="ghost"' },
    ],
    examples: [
      {
        title: 'Surface, classic, and ghost',
        size: 'full-width',
        code: `<Flex gap="3" wrap="wrap">
  <Card variant="surface"><Box p="4">Surface</Box></Card>
  <Card variant="classic"><Box p="4">Classic</Box></Card>
  <Card variant="ghost"><Box p="4">Ghost</Box></Card>
</Flex>`,
        render: () => (
          <Flex gap="3" wrap="wrap">
            <Card variant="surface"><Box p="4"><Text as="span" size="2">Surface</Text></Box></Card>
            <Card variant="classic"><Box p="4"><Text as="span" size="2">Classic</Text></Box></Card>
            <Card variant="ghost"><Box p="4"><Text as="span" size="2">Ghost</Text></Box></Card>
          </Flex>
        ),
      },
    ],
  },
  callouts: {
    whenToUse: 'Callout is the message atom for contextual information, warnings, and recoverable errors. It should be rare and carry real explanatory value.',
    registry: [
      { code: 'CAL-INFO', name: 'Informational callout', purpose: 'Context or system note', contract: 'Callout.Root color="blue"' },
      { code: 'CAL-WARN', name: 'Warning callout', purpose: 'Heads-up, degraded state, missing setup', contract: 'Callout.Root color="amber"' },
      { code: 'CAL-ERROR', name: 'Error callout', purpose: 'Failure or blocked state', contract: 'Callout.Root color="red"' },
    ],
    examples: [
      {
        title: 'Informational, warning, and error callouts',
        size: 'full-width',
        code: `<Flex direction="column" gap="3">
  <Callout.Root color="blue">...</Callout.Root>
  <Callout.Root color="amber">...</Callout.Root>
  <Callout.Root color="red">...</Callout.Root>
</Flex>`,
        render: () => (
          <Flex direction="column" gap="3">
            <Callout.Root color="blue">
              <Callout.Icon><i className="ri-information-line" aria-hidden="true" /></Callout.Icon>
              <Callout.Text>Coverage is currently limited to Florida sources.</Callout.Text>
            </Callout.Root>
            <Callout.Root color="amber">
              <Callout.Icon><i className="ri-alert-line" aria-hidden="true" /></Callout.Icon>
              <Callout.Text>One monitored source has not been checked in over seven days.</Callout.Text>
            </Callout.Root>
            <Callout.Root color="red">
              <Callout.Icon><i className="ri-error-warning-line" aria-hidden="true" /></Callout.Icon>
              <Callout.Text>We couldn’t load this review record. Try refreshing.</Callout.Text>
            </Callout.Root>
          </Flex>
        ),
      },
    ],
  },
  tables: {
    whenToUse: 'Table is Cedar’s base comparison atom. The CedarTable wrapper is the canonical contract because it handles nested-vs-standalone chrome consistently.',
    registry: [
      { code: 'TBL-STANDALONE', name: 'Standalone table', purpose: 'Primary page data region', contract: 'CedarTable surface="standalone"' },
      { code: 'TBL-NESTED', name: 'Nested table', purpose: 'Table inside a card surface', contract: 'CedarTable surface="nested"' },
    ],
    examples: [
      {
        title: 'Canonical nested table',
        size: 'full-width',
        code: `<Card variant="surface">
  <CedarTable surface="nested">
    <Table.Header>...</Table.Header>
    <Table.Body>...</Table.Body>
  </CedarTable>
</Card>`,
        render: tableSample,
      },
    ],
  },
  'text-field': {
    whenToUse: 'TextField is Cedar’s default single-line input atom for search, filtering, and short structured values.',
    registry: [
      { code: 'INP-TEXT', name: 'Default text field', purpose: 'Short text entry or search', contract: 'TextField.Root color="gray"' },
    ],
    examples: [
      {
        title: 'Search and short entry',
        size: 'contained',
        code: `<Flex direction="column" gap="3">
  <TextField.Root placeholder="Search regulations…" />
  <TextField.Root placeholder="Practice name" />
</Flex>`,
        render: () => (
          <Flex direction="column" gap="3" className="max-w-sm">
            <TextField.Root placeholder="Search regulations…" />
            <TextField.Root placeholder="Practice name" />
          </Flex>
        ),
      },
    ],
  },
  textarea: {
    whenToUse: 'Textarea is the longer-form text atom for notes, explanations, and multi-line human input.',
    registry: [
      { code: 'INP-TEXTAREA', name: 'Default textarea', purpose: 'Long-form note or explanation', contract: 'TextArea color="gray"' },
    ],
    examples: [
      {
        title: 'Long-form note field',
        size: 'contained',
        code: `<TextArea placeholder="Add reviewer notes…" />`,
        render: () => <TextArea placeholder="Add reviewer notes…" className="max-w-lg" />,
      },
    ],
  },
  select: {
    whenToUse: 'Select is Cedar’s triggered choice atom for compact bounded sets where the chosen value should be visible before opening the list.',
    registry: [
      { code: 'SEL-DEFAULT', name: 'Default select', purpose: 'One-of-many choice in filters or forms', contract: 'Select.Root + Select.Trigger + Select.Content' },
    ],
    examples: [
      {
        title: 'Default Cedar select',
        size: 'contained',
        code: `<Select.Root defaultValue="high">
  <Select.Trigger />
  <Select.Content>
    <Select.Item value="high">High and above</Select.Item>
  </Select.Content>
</Select.Root>`,
        render: () => (
          <Select.Root defaultValue="high">
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="critical">Critical only</Select.Item>
              <Select.Item value="high">High and above</Select.Item>
              <Select.Item value="medium">Medium and above</Select.Item>
            </Select.Content>
          </Select.Root>
        ),
      },
    ],
  },
  checkbox: {
    whenToUse: 'Checkbox is the atomic boolean choice when the choice stands alone and does not need a card or grouped wrapper.',
    registry: [
      { code: 'CHK-DEFAULT', name: 'Default checkbox', purpose: 'Single opt-in or setting', contract: 'Checkbox color="gray"' },
    ],
    examples: [
      {
        title: 'Single checkboxes',
        size: 'contained',
        code: `<Flex direction="column" gap="3">
  <label className="flex items-center gap-2">
    <Checkbox defaultChecked />
    <Text as="span">Email alerts</Text>
  </label>
</Flex>`,
        render: () => (
          <Flex direction="column" gap="3">
            <label className="flex items-center gap-2">
              <Checkbox defaultChecked />
              <Text as="span" size="2">Email alerts</Text>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox />
              <Text as="span" size="2">Push alerts</Text>
            </label>
          </Flex>
        ),
      },
    ],
  },
  'checkbox-cards': {
    whenToUse: 'Checkbox Cards are the multi-select atom for visually rich options where each choice needs more presence than a plain line item.',
    registry: [
      { code: 'CHK-CARD', name: 'Checkbox card', purpose: 'Multi-select with stronger affordance', contract: 'CheckboxCards.Root + CheckboxCards.Item' },
    ],
    examples: [
      {
        title: 'Card-based multi-select',
        size: 'contained',
        code: `<CheckboxCards.Root defaultValue={['next']}>
  <CheckboxCards.Item value="next">Next.js</CheckboxCards.Item>
  <CheckboxCards.Item value="remix">Remix</CheckboxCards.Item>
</CheckboxCards.Root>`,
        render: () => (
          <CheckboxCards.Root defaultValue={['federal', 'board']}>
            <CheckboxCards.Item value="federal">Federal</CheckboxCards.Item>
            <CheckboxCards.Item value="board">Board rules</CheckboxCards.Item>
            <CheckboxCards.Item value="guidance">Guidance</CheckboxCards.Item>
          </CheckboxCards.Root>
        ),
      },
    ],
  },
  'checkbox-group': {
    whenToUse: 'Checkbox Group is the multi-select atom for simple stacked options when card chrome would be excessive.',
    registry: [
      { code: 'CHK-GROUP', name: 'Checkbox group', purpose: 'Multi-select list', contract: 'CheckboxGroup.Root + CheckboxGroup.Item' },
    ],
    examples: [
      {
        title: 'Stacked multi-select',
        size: 'contained',
        code: `<CheckboxGroup.Root defaultValue={['email']}>
  <CheckboxGroup.Item value="email" />
  <CheckboxGroup.Item value="push" />
</CheckboxGroup.Root>`,
        render: () => (
          <CheckboxGroup.Root defaultValue={['email', 'digest']} name="delivery">
            <Flex direction="column" gap="3">
              <Flex align="center" gap="2">
                <CheckboxGroup.Item value="email" />
                <Text as="span" size="2">Email alerts</Text>
              </Flex>
              <Flex align="center" gap="2">
                <CheckboxGroup.Item value="push" />
                <Text as="span" size="2">Push alerts</Text>
              </Flex>
              <Flex align="center" gap="2">
                <CheckboxGroup.Item value="digest" />
                <Text as="span" size="2">Weekly digest</Text>
              </Flex>
            </Flex>
          </CheckboxGroup.Root>
        ),
      },
    ],
  },
  radio: {
    whenToUse: 'Radio is the single atomic control for mutually exclusive choices when the options are inline and short.',
    registry: [
      { code: 'RAD-DEFAULT', name: 'Default radio', purpose: 'Single mutually exclusive option', contract: 'Radio name="<group>" value="<value>"' },
    ],
    examples: [
      {
        title: 'Inline radio controls',
        size: 'contained',
        code: `<label className="flex items-center gap-2">
  <Radio name="density" value="comfortable" defaultChecked />
  <Text as="span">Comfortable</Text>
</label>`,
        render: () => (
          <Flex direction="column" gap="3">
            <label className="flex items-center gap-2">
              <Radio name="density" value="comfortable" defaultChecked />
              <Text as="span" size="2">Comfortable</Text>
            </label>
            <label className="flex items-center gap-2">
              <Radio name="density" value="compact" />
              <Text as="span" size="2">Compact</Text>
            </label>
          </Flex>
        ),
      },
    ],
  },
  'radio-group': {
    whenToUse: 'Radio Group is the grouped atom for mutually exclusive choices when the set needs a shared container and consistent spacing.',
    registry: [
      { code: 'RAD-GROUP', name: 'Radio group', purpose: 'Grouped one-of-many choice', contract: 'RadioGroup.Root + RadioGroup.Item' },
    ],
    examples: [
      {
        title: 'Grouped mutually exclusive options',
        size: 'contained',
        code: `<RadioGroup.Root defaultValue="monitor">
  <RadioGroup.Item value="monitor" />
  <RadioGroup.Item value="intelligence" />
</RadioGroup.Root>`,
        render: () => (
          <RadioGroup.Root defaultValue="monitor" name="plan">
            <Flex direction="column" gap="3">
              <Flex align="center" gap="2">
                <RadioGroup.Item value="monitor" />
                <Text as="span" size="2">Monitor</Text>
              </Flex>
              <Flex align="center" gap="2">
                <RadioGroup.Item value="intelligence" />
                <Text as="span" size="2">Intelligence</Text>
              </Flex>
            </Flex>
          </RadioGroup.Root>
        ),
      },
    ],
  },
  'radio-cards': {
    whenToUse: 'Radio Cards are the single-choice card atom for plans, modes, and prominent option sets where visual scannability matters.',
    registry: [
      { code: 'RAD-CARD', name: 'Radio card', purpose: 'Single-choice card set', contract: 'RadioCards.Root + RadioCards.Item' },
    ],
    examples: [
      {
        title: 'Card-based single choice',
        size: 'contained',
        code: `<RadioCards.Root defaultValue="monitor">
  <RadioCards.Item value="monitor">Monitor</RadioCards.Item>
  <RadioCards.Item value="intelligence">Intelligence</RadioCards.Item>
</RadioCards.Root>`,
        render: () => (
          <RadioCards.Root defaultValue="monitor">
            <RadioCards.Item value="monitor">Monitor</RadioCards.Item>
            <RadioCards.Item value="intelligence">Intelligence</RadioCards.Item>
          </RadioCards.Root>
        ),
      },
    ],
  },
  switch: {
    whenToUse: 'Switch is the immediate on/off atom for settings where the state changes directly without form submission.',
    registry: [
      { code: 'SWT-DEFAULT', name: 'Default switch', purpose: 'Immediate boolean preference', contract: 'Switch color="gray"' },
    ],
    examples: [
      {
        title: 'Settings toggle',
        size: 'contained',
        code: `<Flex align="center" justify="between">
  <Text as="span">Email alerts</Text>
  <Switch color="gray" defaultChecked />
</Flex>`,
        render: () => (
          <Flex align="center" justify="between" className="max-w-sm">
            <Text as="span" size="2">Email alerts</Text>
            <Switch color="gray" defaultChecked />
          </Flex>
        ),
      },
    ],
  },
  'segmented-control': {
    whenToUse: 'Segmented Control is the compact mutually exclusive atom for inline filtering and mode switching when the option set is very short.',
    registry: [
      { code: 'SEG-DEFAULT', name: 'Segmented control', purpose: 'Compact inline mode switch', contract: 'SegmentedControl.Root + SegmentItem' },
    ],
    examples: [
      {
        title: 'Inline segmented chooser',
        size: 'contained',
        code: `<SegmentedControl.Root defaultValue="all">
  <SegmentedControl.Item value="all">All</SegmentedControl.Item>
  <SegmentedControl.Item value="high">High</SegmentedControl.Item>
</SegmentedControl.Root>`,
        render: () => (
          <SegmentedControl.Root defaultValue="all">
            <SegmentedControl.Item value="all">All</SegmentedControl.Item>
            <SegmentedControl.Item value="high">High</SegmentedControl.Item>
            <SegmentedControl.Item value="critical">Critical</SegmentedControl.Item>
          </SegmentedControl.Root>
        ),
      },
    ],
  },
  tabs: {
    whenToUse: 'Tabs are the content-switching atom for co-equal sections inside a detail page or module. They are not a substitute for route navigation.',
    registry: [
      { code: 'TAB-SECTION', name: 'Content tabs', purpose: 'Switch co-equal in-page sections', contract: 'Tabs.Root + Tabs.List + Tabs.Trigger + Tabs.Content' },
    ],
    examples: [
      {
        title: 'Section tabs',
        size: 'full-width',
        code: `<Tabs.Root defaultValue="summary">
  <Tabs.List>
    <Tabs.Trigger value="summary">Summary</Tabs.Trigger>
    <Tabs.Trigger value="source">Source</Tabs.Trigger>
  </Tabs.List>
</Tabs.Root>`,
        render: () => (
          <Tabs.Root defaultValue="summary">
            <Tabs.List>
              <Tabs.Trigger value="summary">Summary</Tabs.Trigger>
              <Tabs.Trigger value="source">Source</Tabs.Trigger>
              <Tabs.Trigger value="history">History</Tabs.Trigger>
            </Tabs.List>
            <Box pt="4">
              <Text as="p" size="2" color="gray">
                Use tabs to switch between co-equal content regions inside the same page context.
              </Text>
            </Box>
          </Tabs.Root>
        ),
      },
    ],
  },
  'tab-nav': {
    whenToUse: 'Tab Nav is the route-navigation atom when you need tab-like navigation with stronger wayfinding than content tabs.',
    registry: [
      { code: 'TAB-NAV', name: 'Tab navigation', purpose: 'Switch routes or major subviews', contract: 'TabNav.Root + TabNav.Link' },
    ],
    examples: [
      {
        title: 'Nav-style tabs',
        size: 'full-width',
        code: `<TabNav.Root>
  <TabNav.Link href="#" active>Overview</TabNav.Link>
  <TabNav.Link href="#">Review</TabNav.Link>
</TabNav.Root>`,
        render: () => (
          <TabNav.Root>
            <TabNav.Link href="#" active>Overview</TabNav.Link>
            <TabNav.Link href="#">Review</TabNav.Link>
            <TabNav.Link href="#">History</TabNav.Link>
          </TabNav.Root>
        ),
      },
    ],
  },
  tooltip: {
    whenToUse: 'Tooltip is the supporting microcopy atom for icon-only actions and terse helper text. It should explain, not replace visible labels.',
    registry: [
      { code: 'TIP-DEFAULT', name: 'Default tooltip', purpose: 'Helper text for icon or compact action', contract: 'Tooltip content="<text>"' },
    ],
    examples: [
      {
        title: 'Tooltip on icon action',
        size: 'inline',
        code: `<Tooltip content="Copy hash">
  <IconButton variant="ghost" color="gray" aria-label="Copy hash">
    <i className="ri-file-copy-line" />
  </IconButton>
</Tooltip>`,
        render: () => (
          <Tooltip content="Copy hash">
            <IconButton variant="ghost" color="gray" aria-label="Copy hash">
              <i className="ri-file-copy-line" aria-hidden="true" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
  },
  avatar: {
    whenToUse: 'Avatar is the identity atom for people or practices when a visual identity marker improves scanning.',
    registry: [
      { code: 'AVT-DEFAULT', name: 'Default avatar', purpose: 'Compact identity marker', contract: 'Avatar fallback="<initials>"' },
    ],
    examples: [
      {
        title: 'Avatar sizes',
        size: 'inline',
        code: `<Flex gap="3" align="center">
  <Avatar fallback="CA" size="2" />
  <Avatar fallback="CA" size="3" />
</Flex>`,
        render: () => (
          <Flex gap="3" align="center">
            <Avatar fallback="CA" size="2" radius="full" />
            <Avatar fallback="CA" size="3" radius="full" />
            <Avatar fallback="CA" size="4" radius="full" />
          </Flex>
        ),
      },
    ],
  },
  'aspect-ratio': {
    whenToUse: 'Aspect Ratio is the media containment atom for screenshots, thumbnails, and visual previews that need stable proportion.',
    registry: [
      { code: 'ASP-16x9', name: 'Media frame', purpose: 'Stable screenshot or preview aspect ratio', contract: 'AspectRatio ratio={16 / 9}' },
    ],
    examples: [
      {
        title: '16:9 preview frame',
        size: 'contained',
        code: `<AspectRatio ratio={16 / 9}>
  <Box className="h-full rounded-lg bg-[var(--cedar-interactive-hover)]" />
</AspectRatio>`,
        render: () => (
          <AspectRatio ratio={16 / 9}>
            <Box className="flex h-full items-center justify-center rounded-lg border border-[var(--cedar-border-subtle)] bg-[var(--cedar-interactive-hover)]">
              <Text as="span" size="2" color="gray">16:9 preview</Text>
            </Box>
          </AspectRatio>
        ),
      },
    ],
  },
  'data-list': {
    whenToUse: 'Data List is the key/value metadata atom for short structured facts such as source, effective date, jurisdiction, or confidence.',
    registry: [
      { code: 'DLT-META', name: 'Metadata list', purpose: 'Short key/value cluster', contract: 'DataList.Root + Item + Label + Value' },
    ],
    examples: [
      {
        title: 'Key/value metadata',
        size: 'contained',
        code: `<DataList.Root>
  <DataList.Item>
    <DataList.Label>Source</DataList.Label>
    <DataList.Value>FL Board of Medicine</DataList.Value>
  </DataList.Item>
</DataList.Root>`,
        render: () => (
          <DataList.Root>
            <DataList.Item>
              <DataList.Label>Source</DataList.Label>
              <DataList.Value>FL Board of Medicine</DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label>Effective date</DataList.Label>
              <DataList.Value>March 20, 2026</DataList.Value>
            </DataList.Item>
          </DataList.Root>
        ),
      },
    ],
  },
  dialog: {
    whenToUse: 'Dialog is the modal atom for focused tasks that legitimately interrupt the current flow and need a bounded overlay surface.',
    registry: [
      { code: 'DLG-DEFAULT', name: 'Default dialog', purpose: 'Focused modal task or confirmation', contract: 'Dialog.Root + Dialog.Content + Dialog.Title' },
    ],
    examples: [
      {
        title: 'Dialog anatomy',
        size: 'contained',
        code: `<Dialog.Root>
  <Dialog.Trigger>
    <Button variant="soft" color="gray">Open dialog</Button>
  </Dialog.Trigger>
  <Dialog.Content maxWidth="420px">...</Dialog.Content>
</Dialog.Root>`,
        render: () => (
          <StaticModalSurface
            eyebrow="Dialog"
            title="Add monitored source"
            body="Use dialog for focused modal work that should temporarily interrupt the current context."
          />
        ),
      },
    ],
  },
  'alert-dialog': {
    whenToUse: 'Alert Dialog is the destructive confirmation atom reserved for irreversible actions where the user must deliberately confirm intent.',
    registry: [
      { code: 'ALT-DESTRUCT', name: 'Alert dialog', purpose: 'Irreversible or dangerous confirmation', contract: 'AlertDialog.Root + AlertDialog.Content' },
    ],
    examples: [
      {
        title: 'Destructive confirmation anatomy',
        size: 'contained',
        code: `<AlertDialog.Root>
  <AlertDialog.Trigger>
    <Button variant="soft" color="red">Delete practice</Button>
  </AlertDialog.Trigger>
  <AlertDialog.Content>...</AlertDialog.Content>
</AlertDialog.Root>`,
        render: () => (
          <StaticModalSurface
            eyebrow="Alert dialog"
            title="Delete practice?"
            body="Use alert dialog only for destructive or irreversible decisions that deserve a stronger interruption."
            destructive
          />
        ),
      },
    ],
  },
  'dropdown-menu': {
    whenToUse: 'Dropdown Menu is the secondary action-list atom for compact menus anchored to a trigger button or icon.',
    registry: [
      { code: 'MNU-DROPDOWN', name: 'Dropdown menu', purpose: 'Secondary action list', contract: 'DropdownMenu.Root + Trigger + Content + Item' },
    ],
    examples: [
      {
        title: 'Action menu anatomy',
        size: 'contained',
        code: `<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <IconButton variant="ghost" color="gray" aria-label="More actions">...</IconButton>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>...</DropdownMenu.Content>
</DropdownMenu.Root>`,
        render: () => <StaticMenuSurface title="Dropdown menu" items={['Inspect', 'Edit', 'Archive']} />,
      },
    ],
  },
  'context-menu': {
    whenToUse: 'Context Menu is the contextual action-list atom for row-level or region-level power-user actions, typically on right click.',
    registry: [
      { code: 'MNU-CONTEXT', name: 'Context menu', purpose: 'Contextual action list', contract: 'ContextMenu.Root + Trigger + Content + Item' },
    ],
    examples: [
      {
        title: 'Context menu anatomy',
        size: 'contained',
        code: `<ContextMenu.Root>
  <ContextMenu.Trigger>...</ContextMenu.Trigger>
  <ContextMenu.Content>...</ContextMenu.Content>
</ContextMenu.Root>`,
        render: () => <StaticMenuSurface title="Context menu" items={['Open change', 'Copy source link', 'Mark as reviewed']} />,
      },
    ],
  },
  popover: {
    whenToUse: 'Popover is the anchored floating-surface atom for lightweight supporting controls or details that should stay tied to a trigger.',
    registry: [
      { code: 'POP-DEFAULT', name: 'Default popover', purpose: 'Anchored supporting surface', contract: 'Popover.Root + Trigger + Content' },
    ],
    examples: [
      {
        title: 'Popover anatomy',
        size: 'contained',
        code: `<Popover.Root>
  <Popover.Trigger>
    <Button variant="soft" color="gray">Open detail</Button>
  </Popover.Trigger>
  <Popover.Content>...</Popover.Content>
</Popover.Root>`,
        render: () => (
          <StaticPopoverSurface
            title="Quick metadata"
            body="Use popover for anchored, lightweight detail that supports the current action without becoming a full panel."
          />
        ),
      },
    ],
  },
  'hover-card': {
    whenToUse: 'Hover Card is the preview atom for secondary context revealed on hover or focus, never for critical controls or required information.',
    registry: [
      { code: 'HOV-PREVIEW', name: 'Hover card', purpose: 'Secondary hover preview', contract: 'HoverCard.Root + Trigger + Content' },
    ],
    examples: [
      {
        title: 'Hover preview anatomy',
        size: 'contained',
        code: `<HoverCard.Root>
  <HoverCard.Trigger href="#">Hover me</HoverCard.Trigger>
  <HoverCard.Content>...</HoverCard.Content>
</HoverCard.Root>`,
        render: () => (
          <StaticPopoverSurface
            title="Source snapshot"
            body="Hover card is for secondary preview context only. If the information matters to task completion, move it into the visible layout."
          />
        ),
      },
    ],
  },
  progress: {
    whenToUse: 'Progress is the bounded-completion atom for pipelines, ingestion, onboarding, and other tasks with a measurable end state.',
    registry: [
      { code: 'PRG-DEFAULT', name: 'Progress bar', purpose: 'Bounded completion feedback', contract: 'Progress value={<0-100>}' },
    ],
    examples: [
      {
        title: 'Progress indicator',
        size: 'contained',
        code: `<Flex direction="column" gap="2">
  <Progress value={72} />
  <Text as="span" size="2" color="gray">72% complete</Text>
</Flex>`,
        render: () => (
          <Flex direction="column" gap="2" className="max-w-sm">
            <Progress value={72} />
            <Text as="span" size="2" color="gray">72% complete</Text>
          </Flex>
        ),
      },
    ],
  },
  'scroll-area': {
    whenToUse: 'Scroll Area is the contained-scroll atom for dense bounded content where the surrounding page layout should remain stable.',
    registry: [
      { code: 'SCR-DEFAULT', name: 'Contained scroll area', purpose: 'Bounded scrolling list or notes', contract: 'ScrollArea type="always" scrollbars="vertical"' },
    ],
    examples: [
      {
        title: 'Contained scrolling content',
        size: 'contained',
        code: `<ScrollArea type="always" scrollbars="vertical" className="h-24">
  <Box p="3">...</Box>
</ScrollArea>`,
        render: () => (
          <ScrollArea type="always" scrollbars="vertical" className="h-24 rounded-md border border-[var(--cedar-border-subtle)]">
            <Box p="3">
              <Flex direction="column" gap="3">
                <Text as="p" size="2">ScrollArea keeps dense supporting content bounded.</Text>
                <Text as="p" size="2">Use it when the region needs its own scroll behavior.</Text>
                <Text as="p" size="2">Do not use it to hide primary page content.</Text>
              </Flex>
            </Box>
          </ScrollArea>
        ),
      },
    ],
  },
  skeleton: {
    whenToUse: 'Skeleton is the loading placeholder atom when keeping layout structure visible is more helpful than a spinner alone.',
    registry: [
      { code: 'SKL-DEFAULT', name: 'Skeleton line/block', purpose: 'Preserve layout while loading', contract: 'Skeleton className="<shape>"' },
    ],
    examples: [
      {
        title: 'Skeleton placeholders',
        size: 'contained',
        code: `<Flex direction="column" gap="3">
  <Skeleton className="h-4 w-24 rounded" />
  <Skeleton className="h-16 w-full rounded-xl" />
</Flex>`,
        render: () => (
          <Flex direction="column" gap="3">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </Flex>
        ),
      },
    ],
  },
  slider: {
    whenToUse: 'Slider is the direct-manipulation numeric atom when approximate range selection is easier than text entry or a select menu.',
    registry: [
      { code: 'SLD-DEFAULT', name: 'Single-value slider', purpose: 'Quick range tuning', contract: 'Slider defaultValue={[<value>]}' },
    ],
    examples: [
      {
        title: 'Single-value slider',
        size: 'contained',
        code: `<Flex direction="column" gap="3">
  <Slider defaultValue={[68]} />
  <Text as="span" size="2" color="gray">Confidence threshold</Text>
</Flex>`,
        render: () => (
          <Flex direction="column" gap="3">
            <Slider defaultValue={[68]} />
            <Text as="span" size="2" color="gray">Confidence threshold</Text>
          </Flex>
        ),
      },
    ],
  },
  spinner: {
    whenToUse: 'Spinner is the lightweight loading atom for short-running async actions or inline waiting states.',
    registry: [
      { code: 'SPN-DEFAULT', name: 'Spinner', purpose: 'Short loading wait state', contract: 'Spinner size="<1|2|3>"' },
    ],
    examples: [
      {
        title: 'Inline loading indicator',
        size: 'inline',
        code: `<Flex align="center" gap="2">
  <Spinner />
  <Text as="span" size="2">Syncing…</Text>
</Flex>`,
        render: () => (
          <Flex align="center" gap="2">
            <Spinner />
            <Text as="span" size="2">Syncing…</Text>
          </Flex>
        ),
      },
    ],
  },
  separator: {
    whenToUse: 'Separator is the division atom for grouping related content without introducing another card or heading.',
    registry: [
      { code: 'SEP-H', name: 'Horizontal separator', purpose: 'Separate stacked regions', contract: 'Separator size="4"' },
      { code: 'SEP-V', name: 'Vertical separator', purpose: 'Separate inline regions', contract: 'Separator orientation="vertical" size="4"' },
    ],
    examples: [
      {
        title: 'Horizontal and vertical separators',
        size: 'full-width',
        code: `<Flex direction="column" gap="3">
  <Text as="span">Section A</Text>
  <Separator size="4" />
  <Flex align="center" gap="3">
    <Text as="span">Left</Text>
    <Separator orientation="vertical" size="4" />
    <Text as="span">Right</Text>
  </Flex>
</Flex>`,
        render: () => (
          <Flex direction="column" gap="3">
            <Text as="span" size="2">Section A</Text>
            <Separator size="4" />
            <Flex align="center" gap="3">
              <Text as="span" size="2">Left</Text>
              <Separator orientation="vertical" size="4" />
              <Text as="span" size="2">Right</Text>
            </Flex>
          </Flex>
        ),
      },
    ],
  },
}

export function getAtomDoc(slug: string) {
  return ATOM_DOCS[slug]
}

export function getAtomIndexPreview(slug: string) {
  const doc = ATOM_DOCS[slug]
  if (!doc) {
    return (
      <Badge variant="outline" color="gray">
        Cedar atom
      </Badge>
    )
  }

  return doc.examples[0]?.render()
}
