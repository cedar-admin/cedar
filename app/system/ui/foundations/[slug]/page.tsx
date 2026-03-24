import { notFound } from 'next/navigation'
import { Badge, Box, Card, Flex, Heading, Table, Text } from '@radix-ui/themes'
import { getAllSlugs, getLibraryItem } from '../../_lib/nav-config'
import { DetailPage, ContentSection } from '../../_lib/DetailPage'
import { PreviewFrame } from '../../_lib/PreviewFrame'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { AuthorityBadge } from '@/components/AuthorityBadge'
import { ConfidenceBadge } from '@/components/ConfidenceBadge'
import { SectionHeading } from '@/components/SectionHeading'

export function generateStaticParams() {
  return getAllSlugs('foundations').map((slug) => ({ slug }))
}

export default async function FoundationsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = getLibraryItem('foundations', slug)
  if (!item) notFound()

  if (slug === 'typography') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Every text element in Cedar uses these scales. No arbitrary font sizes or ad-hoc weights.
            When you need to display text, pick the correct Radix{' '}
            <code className="font-mono text-xs">{'<Heading>'}</code> or{' '}
            <code className="font-mono text-xs">{'<Text>'}</code> size and weight from this reference.
          </Text>
        </ContentSection>

        <ContentSection heading="Hard rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">Every <code className="font-mono text-xs">{'<Heading>'}</code> must have an explicit <code className="font-mono text-xs">as</code> prop (<code className="font-mono text-xs">h1</code>–<code className="font-mono text-xs">h4</code>) matching semantic hierarchy</Text></li>
            <li><Text as="span" size="2" color="gray">Each page has exactly one <code className="font-mono text-xs">h1</code>. Section headings use <code className="font-mono text-xs">h2</code>. Card headings use <code className="font-mono text-xs">h3</code> or <code className="font-mono text-xs">h4</code></Text></li>
            <li><Text as="span" size="2" color="gray"><code className="font-mono text-xs">{'<Text>'}</code> inside inline elements requires <code className="font-mono text-xs">as=&quot;span&quot;</code> to prevent block-level nesting violations</Text></li>
            <li><Text as="span" size="2" color="gray">Bold (700) is reserved for page titles and numeric stat values only — not section headings</Text></li>
            <li><Text as="span" size="2" color="gray">Section headings use <code className="font-mono text-xs">size=&quot;4&quot; weight=&quot;medium&quot;</code> — never <code className="font-mono text-xs">weight=&quot;bold&quot;</code></Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Anatomy">
          <PreviewFrame size="full-width" label="Heading scale">
            <Flex direction="column" gap="3">
              <Flex align="baseline" gap="4">
                <Heading as="h2" size="6" weight="bold">Page title</Heading>
                <Text as="span" size="1" color="gray">size=&quot;6&quot; weight=&quot;bold&quot; — 24px — one per page, h1</Text>
              </Flex>
              <Flex align="baseline" gap="4">
                <Heading as="h2" size="4" weight="medium">Section heading</Heading>
                <Text as="span" size="1" color="gray">size=&quot;4&quot; weight=&quot;medium&quot; — 16px — use SectionHeading component</Text>
              </Flex>
              <Flex align="baseline" gap="4">
                <Heading as="h3" size="3" weight="medium">Card section heading</Heading>
                <Text as="span" size="1" color="gray">size=&quot;3&quot; weight=&quot;medium&quot; — 14px — use SectionHeading variant=&quot;card&quot;</Text>
              </Flex>
            </Flex>
          </PreviewFrame>

          <PreviewFrame size="full-width" label="Text scale">
            <Flex direction="column" gap="3">
              <Flex align="baseline" gap="4">
                <Text as="span" size="3">Reading text</Text>
                <Text as="span" size="1" color="gray">size=&quot;3&quot; — 16px — long-form body copy</Text>
              </Flex>
              <Flex align="baseline" gap="4">
                <Text as="span" size="2">Body text</Text>
                <Text as="span" size="1" color="gray">size=&quot;2&quot; — 14px — default for most UI text</Text>
              </Flex>
              <Flex align="baseline" gap="4">
                <Text as="span" size="1" color="gray">Caption / metadata</Text>
                <Text as="span" size="1" color="gray">size=&quot;1&quot; — 12px — dates, IDs, file paths</Text>
              </Flex>
            </Flex>
          </PreviewFrame>

          <PreviewFrame size="inline" label="Metric value (stat cards)">
            <Flex direction="column" align="start" gap="1">
              <Text as="span" size="1" color="gray">Total regulations</Text>
              <Text as="span" size="5" weight="bold">1,247</Text>
            </Flex>
          </PreviewFrame>

          <PreviewFrame size="inline" label="Weights in context">
            <Text as="span" size="2">Regular (400) — paragraph body</Text>
            <Text as="span" size="2" weight="medium">Medium (500) — section label</Text>
            <Text as="span" size="2" weight="bold">Bold (700) — page title / stat value only</Text>
          </PreviewFrame>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'semantic-color') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Cedar separates color by purpose: <strong>gray for interaction</strong> (buttons, focus rings, selected states),{' '}
            <strong>color for information</strong> (severity, review status, authority level, confidence).
            Use color to communicate meaning, never to make something more prominent or attractive.
          </Text>
        </ContentSection>

        <ContentSection heading="Hard rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">All badge colors flow through <code className="font-mono text-xs">lib/ui-constants.ts</code> — never hardcode a badge color in a component</Text></li>
            <li><Text as="span" size="2" color="gray">Same data always renders the same color. &ldquo;High&rdquo; severity is always orange, everywhere</Text></li>
            <li><Text as="span" size="2" color="gray">Use the named badge components (<code className="font-mono text-xs">SeverityBadge</code>, <code className="font-mono text-xs">StatusBadge</code>, etc.) — never a one-off Radix <code className="font-mono text-xs">{'<Badge color="...">'}</code></Text></li>
            <li><Text as="span" size="2" color="gray">Never apply <code className="font-mono text-xs">color</code> to buttons — buttons are always gray</Text></li>
            <li><Text as="span" size="2" color="gray">Never use <code className="font-mono text-xs">highContrast</code> on badges — soft is standard, outline for secondary tiers</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Anatomy">
          <PreviewFrame size="full-width" label="Severity (SeverityBadge) — soft variant">
            <Flex wrap="wrap" gap="2" align="center">
              <SeverityBadge severity="critical" />
              <SeverityBadge severity="high" />
              <SeverityBadge severity="medium" />
              <SeverityBadge severity="low" />
              <SeverityBadge severity="informational" />
            </Flex>
          </PreviewFrame>

          <PreviewFrame size="full-width" label="Review status (StatusBadge) — soft variant">
            <Flex wrap="wrap" gap="2" align="center">
              <StatusBadge status="approved" />
              <StatusBadge status="auto_approved" />
              <StatusBadge status="pending" />
              <StatusBadge status="pending_review" />
              <StatusBadge status="rejected" />
              <StatusBadge status="not_required" />
            </Flex>
          </PreviewFrame>

          <PreviewFrame size="full-width" label="Authority level (AuthorityBadge) — outline variant for secondary context">
            <Flex wrap="wrap" gap="2" align="center">
              <AuthorityBadge level="federal_statute" />
              <AuthorityBadge level="federal_regulation" />
              <AuthorityBadge level="state_statute" />
              <AuthorityBadge level="state_board_rule" />
            </Flex>
          </PreviewFrame>

          <PreviewFrame size="inline" label="Role / tier (Radix Badge direct — outline)">
            <Badge color="amber" variant="outline">Admin</Badge>
            <Badge color="purple" variant="outline">Intelligence</Badge>
            <Badge color="gray" variant="outline">Monitor</Badge>
          </PreviewFrame>

          <PreviewFrame size="inline" label="AI confidence (ConfidenceBadge)">
            <ConfidenceBadge confidence={0.92} />
            <ConfidenceBadge confidence={0.67} />
            <ConfidenceBadge confidence={0.35} />
          </PreviewFrame>
        </ContentSection>

        <ContentSection heading="When Radix Badge is used directly">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Role and tier badges have no named component — use Radix <code className="font-mono text-xs">{'<Badge>'}</code> directly
            with <code className="font-mono text-xs">variant=&quot;outline&quot;</code>. This signals secondary context.
            All other badge types use their named components. If a new badge type is introduced, add it to{' '}
            <code className="font-mono text-xs">lib/ui-constants.ts</code> and create a named component before using it.
          </Text>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'surfaces') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Cards contain related content. Tables display comparable row data. The surface variant
            controls visual depth. Spacing follows a consistent rhythm — gap tokens, not ad-hoc pixel values.
            These three decisions (container, depth, spacing) need to be consistent across every Cedar page.
          </Text>
        </ContentSection>

        <ContentSection heading="Hard rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray"><strong>Nested surface rule:</strong> an inner component uses <code className="font-mono text-xs">variant=&quot;ghost&quot;</code> when inside another surfaced component. A table inside a card must be ghost, not surface</Text></li>
            <li><Text as="span" size="2" color="gray">Quick test: if removing the inner surface looks cleaner without losing information, use ghost</Text></li>
            <li><Text as="span" size="2" color="gray">Default card is <code className="font-mono text-xs">variant=&quot;surface&quot;</code> — never <code className="font-mono text-xs">variant=&quot;classic&quot;</code> without a specific reason</Text></li>
            <li><Text as="span" size="2" color="gray">Section spacing is always <code className="font-mono text-xs">gap=&quot;6&quot;</code> between major page sections</Text></li>
            <li><Text as="span" size="2" color="gray">Card internal padding is <code className="font-mono text-xs">p=&quot;4&quot;</code> standard, <code className="font-mono text-xs">p=&quot;3&quot;</code> compact</Text></li>
            <li><Text as="span" size="2" color="gray">Never use custom background colors on cards — use the surface/ghost/classic variants</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Anatomy">
          <PreviewFrame size="full-width" label="Standard card (variant=&quot;surface&quot;)">
            <Card variant="surface">
              <Box p="4">
                <Text as="p" size="2" color="gray">A standard surface card for containing related content. Default for all Cedar cards.</Text>
              </Box>
            </Card>
          </PreviewFrame>

          <PreviewFrame size="full-width" label="Nested surface rule — table inside card (table uses variant=&quot;ghost&quot;)">
            <Card variant="surface">
              <Box px="4" pt="4" pb="2">
                <SectionHeading as="h3" variant="card">Recent changes</SectionHeading>
              </Box>
              <Box p="0">
                <Table.Root variant="ghost">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Severity</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Source</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell><Text as="span" size="2">Telehealth prescribing requirements</Text></Table.Cell>
                      <Table.Cell><SeverityBadge severity="high" /></Table.Cell>
                      <Table.Cell><Text as="span" size="2" color="gray">FL Board of Medicine</Text></Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell><Text as="span" size="2">Compounding labeling standards</Text></Table.Cell>
                      <Table.Cell><SeverityBadge severity="medium" /></Table.Cell>
                      <Table.Cell><Text as="span" size="2" color="gray">FL Board of Pharmacy</Text></Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table.Root>
              </Box>
            </Card>
          </PreviewFrame>

          <PreviewFrame size="contained" label="Stat card (size=&quot;2&quot;, p=&quot;4&quot;)">
            <Card size="2">
              <Box p="4">
                <Text as="p" size="1" color="gray">Total regulations</Text>
                <Text as="p" size="5" weight="bold" mt="1">1,247</Text>
              </Box>
            </Card>
          </PreviewFrame>

          <PreviewFrame size="full-width" label="Section spacing — gap=&quot;6&quot; between major sections">
            <Flex direction="column" gap="6">
              <Flex direction="column" gap="3">
                <SectionHeading as="h2" variant="standalone">Section A</SectionHeading>
                <Text as="p" size="2" color="gray">Content in section A. gap=&quot;6&quot; separates this from the next section.</Text>
              </Flex>
              <Flex direction="column" gap="3">
                <SectionHeading as="h2" variant="standalone">Section B</SectionHeading>
                <Text as="p" size="2" color="gray">Content in section B. gap=&quot;3&quot; separates heading from body within a section.</Text>
              </Flex>
            </Flex>
          </PreviewFrame>
        </ContentSection>

        <ContentSection heading="Forbidden patterns">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray"><code className="font-mono text-xs">Table.Root variant=&quot;surface&quot;</code> inside <code className="font-mono text-xs">Card variant=&quot;surface&quot;</code> — double borders, visual noise</Text></li>
            <li><Text as="span" size="2" color="gray">Custom background colors on cards via <code className="font-mono text-xs">className</code></Text></li>
            <li><Text as="span" size="2" color="gray">Ad-hoc margin or padding values — use Radix gap/p/m tokens</Text></li>
          </ul>
        </ContentSection>
      </DetailPage>
    )
  }

  notFound()
}
