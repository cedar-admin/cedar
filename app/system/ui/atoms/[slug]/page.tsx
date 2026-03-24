import { notFound } from 'next/navigation'
import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Flex,
  IconButton,
  Select,
  Switch,
  Table,
  Tabs,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes'
import { getAllSlugs, getLibraryItem } from '../../_lib/nav-config'
import { DetailPage, ContentSection } from '../../_lib/DetailPage'
import { ExampleBlock } from '../../_lib/ExampleBlock'
import { SAMPLE_COPY, SAMPLE_REGULATIONS } from '../../_lib/demo-data'
import { CedarTable } from '@/components/CedarTable'

export function generateStaticParams() {
  return getAllSlugs('atoms').map((slug) => ({ slug }))
}

export default async function AtomsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = getLibraryItem('atoms', slug)
  if (!item) notFound()

  if (slug === 'buttons') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray">
            Buttons are Cedar&rsquo;s primary action primitive. Primary actions use the Radix
            <code className="font-mono text-xs">classic</code> variant, not <code className="font-mono text-xs">solid</code>.
            Interactive elements stay gray by default unless the action is semantically destructive.
          </Text>
        </ContentSection>

        <ContentSection heading="Hard rules">
          <ul className="ml-4 flex list-disc flex-col gap-2">
            <li><Text as="span" size="2" color="gray">Primary action: <code className="font-mono text-xs">variant=&quot;classic&quot; color=&quot;gray&quot; highContrast</code></Text></li>
            <li><Text as="span" size="2" color="gray">Secondary action: <code className="font-mono text-xs">variant=&quot;soft&quot; color=&quot;gray&quot;</code></Text></li>
            <li><Text as="span" size="2" color="gray">Utility/icon action: <code className="font-mono text-xs">variant=&quot;ghost&quot; color=&quot;gray&quot;</code></Text></li>
            <li><Text as="span" size="2" color="gray">Destructive high-stakes action stays red and uses <code className="font-mono text-xs">solid</code></Text></li>
            <li><Text as="span" size="2" color="gray">Do not use green or accent-colored primary buttons in Cedar product UI</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Examples">
          <ExampleBlock
            title="Action hierarchy"
            size="full-width"
            code={`<Flex gap="2">
  <Button variant="classic" color="gray" highContrast>Save changes</Button>
  <Button variant="soft" color="gray">Cancel</Button>
  <Button variant="ghost" color="gray">Reset</Button>
</Flex>`}
          >
            <Flex gap="2" wrap="wrap">
              <Button variant="classic" color="gray" highContrast>Save changes</Button>
              <Button variant="soft" color="gray">Cancel</Button>
              <Button variant="ghost" color="gray">Reset</Button>
            </Flex>
          </ExampleBlock>

          <ExampleBlock
            title="Destructive and icon-only actions"
            size="full-width"
            code={`<Flex gap="2" align="center">
  <Button variant="soft" color="red">Remove source</Button>
  <Button variant="solid" color="red">Delete practice</Button>
  <IconButton variant="ghost" color="gray" aria-label="Close panel">
    <i className="ri-close-line" />
  </IconButton>
</Flex>`}
          >
            <Flex gap="2" wrap="wrap" align="center">
              <Button variant="soft" color="red">Remove source</Button>
              <Button variant="solid" color="red">Delete practice</Button>
              <IconButton variant="ghost" color="gray" aria-label="Close panel">
                <i className="ri-close-line" aria-hidden="true" />
              </IconButton>
            </Flex>
          </ExampleBlock>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'badges') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray">
            Raw Radix badges are for simple labels and secondary status. When the meaning is domain-specific,
            Cedar wraps them in named fragments like <code className="font-mono text-xs">SeverityBadge</code>.
          </Text>
        </ContentSection>

        <ContentSection heading="Examples">
          <ExampleBlock
            title="Outline badges for secondary labeling"
            size="full-width"
            code={`<Flex gap="2" wrap="wrap">
  <Badge variant="outline" color="gray">Monitor</Badge>
  <Badge variant="outline" color="purple">Intelligence</Badge>
  <Badge variant="outline" color="amber">Admin</Badge>
</Flex>`}
          >
            <Flex gap="2" wrap="wrap">
              <Badge variant="outline" color="gray">Monitor</Badge>
              <Badge variant="outline" color="purple">Intelligence</Badge>
              <Badge variant="outline" color="amber">Admin</Badge>
            </Flex>
          </ExampleBlock>

          <ExampleBlock
            title="Soft badges for simple inline states"
            size="full-width"
            code={`<Flex gap="2" wrap="wrap">
  <Badge variant="soft" color="green">Approved</Badge>
  <Badge variant="soft" color="amber">Pending</Badge>
  <Badge variant="soft" color="blue">In progress</Badge>
</Flex>`}
          >
            <Flex gap="2" wrap="wrap">
              <Badge variant="soft" color="green">Approved</Badge>
              <Badge variant="soft" color="amber">Pending</Badge>
              <Badge variant="soft" color="blue">In progress</Badge>
            </Flex>
          </ExampleBlock>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'cards') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray">
            Cards are Cedar&rsquo;s default containment primitive. Use <code className="font-mono text-xs">surface</code>
            as the default. Use <code className="font-mono text-xs">classic</code> only when you need stronger chrome;
            use <code className="font-mono text-xs">ghost</code> for inner surfaces.
          </Text>
        </ContentSection>

        <ContentSection heading="Examples">
          <ExampleBlock
            title="Surface, classic, and ghost"
            size="full-width"
            code={`<Flex gap="3" wrap="wrap">
  <Card variant="surface"><Box p="4">Surface</Box></Card>
  <Card variant="classic"><Box p="4">Classic</Box></Card>
  <Card variant="ghost"><Box p="4">Ghost</Box></Card>
</Flex>`}
          >
            <Flex gap="3" wrap="wrap">
              <Card variant="surface"><Box p="4"><Text as="span" size="2">Surface</Text></Box></Card>
              <Card variant="classic"><Box p="4"><Text as="span" size="2">Classic</Text></Box></Card>
              <Card variant="ghost"><Box p="4"><Text as="span" size="2">Ghost</Text></Box></Card>
            </Flex>
          </ExampleBlock>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'callouts') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray">
            Callouts surface contextual information, warnings, and errors. They should be rare, targeted,
            and written in plain language.
          </Text>
        </ContentSection>

        <ContentSection heading="Examples">
          <ExampleBlock
            title="Information, warning, and error"
            size="full-width"
            code={`<Flex direction="column" gap="3">
  <Callout.Root color="blue">...</Callout.Root>
  <Callout.Root color="amber">...</Callout.Root>
  <Callout.Root color="red">...</Callout.Root>
</Flex>`}
          >
            <Flex direction="column" gap="3">
              <Callout.Root color="blue">
                <Callout.Icon><i className="ri-information-line" aria-hidden="true" /></Callout.Icon>
                <Callout.Text>Coverage is currently limited to Florida sources.</Callout.Text>
              </Callout.Root>
              <Callout.Root color="amber">
                <Callout.Icon><i className="ri-alert-line" aria-hidden="true" /></Callout.Icon>
                <Callout.Text>One monitored source has not been fetched in over 7 days.</Callout.Text>
              </Callout.Root>
              <Callout.Root color="red">
                <Callout.Icon><i className="ri-error-warning-line" aria-hidden="true" /></Callout.Icon>
                <Callout.Text>We couldn&rsquo;t load this review record. Try refreshing.</Callout.Text>
              </Callout.Root>
            </Flex>
          </ExampleBlock>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'tables') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray">
            Tables are the base atomic surface for comparison. Cedar then layers row behavior through
            a wrapper so nested tables do not pick up a second border.
          </Text>
        </ContentSection>

        <ContentSection heading="Structure">
          <Text as="p" size="2" color="gray">
            Cedar uses the Radix table structure directly: <code className="font-mono text-xs">Table.Root</code>,
            <code className="font-mono text-xs">Table.Header</code>, <code className="font-mono text-xs">Table.Row</code>,
            <code className="font-mono text-xs">Table.ColumnHeaderCell</code>, and <code className="font-mono text-xs">Table.Cell</code>.
            The wrapper decides whether the root is <code className="font-mono text-xs">surface</code> or <code className="font-mono text-xs">ghost</code>.
          </Text>
        </ContentSection>

        <ContentSection heading="Examples">
          <ExampleBlock
            title="Canonical nested table inside a card"
            size="full-width"
            code={`<Card variant="surface">
  <CedarTable surface="nested">
    <Table.Header>...</Table.Header>
    <Table.Body>...</Table.Body>
  </CedarTable>
</Card>`}
          >
            <Card variant="surface">
              <CedarTable surface="nested">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Severity</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Source</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {SAMPLE_REGULATIONS.map((row) => (
                    <Table.Row key={row.title}>
                      <Table.Cell><Text as="span" size="2">{row.title}</Text></Table.Cell>
                      <Table.Cell><Badge variant="soft" color="amber">{row.severity}</Badge></Table.Cell>
                      <Table.Cell><Text as="span" size="2" color="gray">{row.source}</Text></Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </CedarTable>
            </Card>
          </ExampleBlock>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'form-controls') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray">
            Cedar forms are built from Radix form atoms with gray interactive styling. Labels stay explicit,
            helper copy stays close, and controls align to a single density.
          </Text>
        </ContentSection>

        <ContentSection heading="Examples">
          <ExampleBlock
            title="TextField, Select, and Switch"
            size="full-width"
            code={`<Flex direction="column" gap="4">
  <TextField.Root placeholder="Search regulations…" />
  <Select.Root defaultValue="high">...</Select.Root>
  <Switch color="gray" defaultChecked />
</Flex>`}
          >
            <Flex direction="column" gap="4" className="max-w-sm">
              <TextField.Root placeholder="Search regulations…" />
              <Select.Root defaultValue="high">
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="critical">Critical only</Select.Item>
                  <Select.Item value="high">High and above</Select.Item>
                </Select.Content>
              </Select.Root>
              <Flex align="center" justify="between">
                <Text as="span" size="2">Email alerts</Text>
                <Switch color="gray" defaultChecked />
              </Flex>
            </Flex>
          </ExampleBlock>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'tabs-and-tooltips') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray">
            Tabs partition stable content types on detail views. Tooltips clarify icon-only actions or dense metadata
            without becoming a dumping ground for extra UI.
          </Text>
        </ContentSection>

        <ContentSection heading="Examples">
          <ExampleBlock
            title="Detail-view tabs"
            size="full-width"
            code={`<Tabs.Root defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="source">Source text</Tabs.Trigger>
    <Tabs.Trigger value="history">History</Tabs.Trigger>
  </Tabs.List>
</Tabs.Root>`}
          >
            <Tabs.Root defaultValue="overview">
              <Tabs.List>
                <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
                <Tabs.Trigger value="source">Source text</Tabs.Trigger>
                <Tabs.Trigger value="history">History</Tabs.Trigger>
              </Tabs.List>
              <Box pt="4">
                <Text as="p" size="2" color="gray">{SAMPLE_COPY.aiSummary}</Text>
              </Box>
            </Tabs.Root>
          </ExampleBlock>

          <ExampleBlock
            title="Tooltip on an icon-only action"
            size="inline"
            code={`<Tooltip content="Copy hash">
  <IconButton variant="ghost" color="gray" aria-label="Copy hash">
    <i className="ri-file-copy-line" />
  </IconButton>
</Tooltip>`}
          >
            <Tooltip content="Copy hash">
              <IconButton variant="ghost" color="gray" aria-label="Copy hash">
                <i className="ri-file-copy-line" aria-hidden="true" />
              </IconButton>
            </Tooltip>
          </ExampleBlock>
        </ContentSection>
      </DetailPage>
    )
  }

  notFound()
}
