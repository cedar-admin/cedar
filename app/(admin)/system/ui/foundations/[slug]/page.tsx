import { notFound } from 'next/navigation'
import { Badge, Box, Button, Card, Flex, Heading, Table, Text } from '@radix-ui/themes'
import { getAllSlugs, getLibraryItem } from '../../_lib/nav-config'
import { DetailPage, ContentSection } from '../../_lib/DetailPage'
import { PreviewFrame } from '../../_lib/PreviewFrame'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { AuthorityBadge } from '@/components/AuthorityBadge'
import { ConfidenceBadge } from '@/components/ConfidenceBadge'

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
            Every text element in Cedar uses these scales. No arbitrary font sizes. When you need to
            display text, choose the correct Radix <code className="font-mono text-xs">{'<Heading>'}</code> or{' '}
            <code className="font-mono text-xs">{'<Text>'}</code> size and weight from this scale.
          </Text>
        </ContentSection>

        <ContentSection heading="Usage rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">Every <code className="font-mono text-xs">{'<Heading>'}</code> must have an explicit <code className="font-mono text-xs">as</code> prop (<code className="font-mono text-xs">h1</code>–<code className="font-mono text-xs">h4</code>) matching semantic hierarchy</Text></li>
            <li><Text as="span" size="2" color="gray">Two weights for most text: regular (400) and semibold (600). Bold (700) reserved for page titles and stat values only</Text></li>
            <li><Text as="span" size="2" color="gray"><code className="font-mono text-xs">{'<Text>'}</code> inside inline elements requires <code className="font-mono text-xs">as=&quot;span&quot;</code> to avoid block-level nesting violations</Text></li>
            <li><Text as="span" size="2" color="gray">Each page has exactly one <code className="font-mono text-xs">h1</code>. Section headings use <code className="font-mono text-xs">h2</code>. Card headings use <code className="font-mono text-xs">h3</code> or <code className="font-mono text-xs">h4</code></Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Examples">
          <PreviewFrame size="full-width" label="Heading scale">
            <Flex direction="column" gap="3">
              <Flex align="baseline" gap="4">
                <Heading as="h1" size="6" weight="bold">Page title</Heading>
                <Text as="span" size="1" color="gray">size=&quot;6&quot; weight=&quot;bold&quot; — 24px</Text>
              </Flex>
              <Flex align="baseline" gap="4">
                <Heading as="h2" size="5" weight="bold">Section heading</Heading>
                <Text as="span" size="1" color="gray">size=&quot;5&quot; weight=&quot;bold&quot; — 20px</Text>
              </Flex>
              <Flex align="baseline" gap="4">
                <Heading as="h3" size="4" weight="medium">Card title</Heading>
                <Text as="span" size="1" color="gray">size=&quot;4&quot; weight=&quot;medium&quot; — 16px</Text>
              </Flex>
              <Flex align="baseline" gap="4">
                <Heading as="h4" size="3" weight="medium">Subsection</Heading>
                <Text as="span" size="1" color="gray">size=&quot;3&quot; weight=&quot;medium&quot; — 14px</Text>
              </Flex>
            </Flex>
          </PreviewFrame>

          <PreviewFrame size="full-width" label="Text scale">
            <Flex direction="column" gap="3">
              <Flex align="baseline" gap="4">
                <Text as="span" size="3">Reading text — 16px</Text>
                <Text as="span" size="1" color="gray">size=&quot;3&quot;</Text>
              </Flex>
              <Flex align="baseline" gap="4">
                <Text as="span" size="2">Body text — 14px</Text>
                <Text as="span" size="1" color="gray">size=&quot;2&quot;</Text>
              </Flex>
              <Flex align="baseline" gap="4">
                <Text as="span" size="1" color="gray">Caption — 12px</Text>
                <Text as="span" size="1" color="gray">size=&quot;1&quot;</Text>
              </Flex>
            </Flex>
          </PreviewFrame>

          <PreviewFrame size="inline" label="Weights">
            <Text as="span" size="2">Regular (400)</Text>
            <Text as="span" size="2" weight="medium">Medium (500)</Text>
            <Text as="span" size="2" weight="bold">Bold (700)</Text>
          </PreviewFrame>
        </ContentSection>

        <ContentSection heading="Notes">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Complete rules in <code className="font-mono text-xs">docs/design-system/design-standards.md</code>.
            Semantic heading hierarchy rules in <code className="font-mono text-xs">docs/design-system/frontend-standards.md</code>.
          </Text>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'buttons') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Choose button variant by action weight, not by visual preference. Every button has a
            defined role. Mixing variants based on aesthetics undermines the visual hierarchy that
            guides users to the primary action.
          </Text>
        </ContentSection>

        <ContentSection heading="Usage rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray"><strong>Primary (solid):</strong> Main page action. One per viewport. Triggers the key outcome the page exists for</Text></li>
            <li><Text as="span" size="2" color="gray"><strong>Secondary (soft):</strong> Supporting actions alongside primary. Multiple permitted</Text></li>
            <li><Text as="span" size="2" color="gray"><strong>Tertiary (ghost/outline):</strong> Utility actions, low visual weight. Navigation, cancel, secondary filters</Text></li>
            <li><Text as="span" size="2" color="gray"><strong>Destructive:</strong> High-stakes irreversible actions. Always inside <code className="font-mono text-xs">AlertDialog</code>. Solid red confirm + soft gray cancel</Text></li>
            <li><Text as="span" size="2" color="gray">Loading state uses Radix <code className="font-mono text-xs">loading</code> prop — never custom-style loading</Text></li>
            <li><Text as="span" size="2" color="gray">Never apply custom <code className="font-mono text-xs">color</code> to buttons. Gray for interactive is the Cedar rule</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Examples">
          <PreviewFrame size="inline" label="Variants">
            <Flex align="center" gap="3" wrap="wrap">
              <Flex direction="column" align="center" gap="1">
                <Button variant="solid" color="gray">Save changes</Button>
                <Text as="span" size="1" color="gray">Primary</Text>
              </Flex>
              <Flex direction="column" align="center" gap="1">
                <Button variant="soft" color="gray">Export</Button>
                <Text as="span" size="1" color="gray">Secondary</Text>
              </Flex>
              <Flex direction="column" align="center" gap="1">
                <Button variant="ghost" color="gray">Cancel</Button>
                <Text as="span" size="1" color="gray">Tertiary</Text>
              </Flex>
              <Flex direction="column" align="center" gap="1">
                <Button variant="solid" color="red">Delete</Button>
                <Text as="span" size="1" color="gray">Destructive confirm</Text>
              </Flex>
              <Flex direction="column" align="center" gap="1">
                <Button variant="soft" color="gray">Cancel</Button>
                <Text as="span" size="1" color="gray">Destructive cancel</Text>
              </Flex>
            </Flex>
          </PreviewFrame>

          <PreviewFrame size="inline" label="Sizes">
            <Button variant="solid" color="gray" size="1">Small</Button>
            <Button variant="solid" color="gray" size="2">Medium (default)</Button>
            <Button variant="solid" color="gray" size="3">Large</Button>
          </PreviewFrame>
        </ContentSection>

        <ContentSection heading="Forbidden patterns">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">Custom color on buttons (<code className="font-mono text-xs">color=&quot;blue&quot;</code>, etc.) — violates the neutral-interactive rule</Text></li>
            <li><Text as="span" size="2" color="gray">More than one <code className="font-mono text-xs">solid</code> button per viewport</Text></li>
            <li><Text as="span" size="2" color="gray">Destructive action without <code className="font-mono text-xs">AlertDialog</code> confirmation</Text></li>
            <li><Text as="span" size="2" color="gray">Custom loading spinner — use Radix <code className="font-mono text-xs">loading</code> prop</Text></li>
          </ul>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'badges') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Badges convey categorical status. Use <code className="font-mono text-xs">variant=&quot;soft&quot;</code> for
            primary classifications (severity, review status). Use <code className="font-mono text-xs">variant=&quot;outline&quot;</code> for
            secondary or supporting information (authority level, confidence, role).
          </Text>
        </ContentSection>

        <ContentSection heading="Usage rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">All badge colors flow through <code className="font-mono text-xs">lib/ui-constants.ts</code> — never hardcode badge colors</Text></li>
            <li><Text as="span" size="2" color="gray">Never use <code className="font-mono text-xs">className</code> overrides on Radix Badge to change color — edit the constants</Text></li>
            <li><Text as="span" size="2" color="gray">Same data always renders the same badge. A &ldquo;high&rdquo; severity is always orange, everywhere</Text></li>
            <li><Text as="span" size="2" color="gray">Individual badge components (SeverityBadge, StatusBadge, etc.) are the canonical way to render these values — never build a one-off badge</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Examples">
          <PreviewFrame size="full-width" label="Severity badges (SeverityBadge)">
            <Flex wrap="wrap" gap="2">
              <SeverityBadge severity="critical" />
              <SeverityBadge severity="high" />
              <SeverityBadge severity="medium" />
              <SeverityBadge severity="low" />
              <SeverityBadge severity="informational" />
            </Flex>
          </PreviewFrame>

          <PreviewFrame size="full-width" label="Review status badges (StatusBadge)">
            <Flex wrap="wrap" gap="2">
              <StatusBadge status="approved" />
              <StatusBadge status="auto_approved" />
              <StatusBadge status="pending" />
              <StatusBadge status="pending_review" />
              <StatusBadge status="rejected" />
              <StatusBadge status="not_required" />
            </Flex>
          </PreviewFrame>

          <PreviewFrame size="full-width" label="Authority level badges (AuthorityBadge)">
            <Flex wrap="wrap" gap="2">
              <AuthorityBadge level="federal_statute" />
              <AuthorityBadge level="federal_regulation" />
              <AuthorityBadge level="state_statute" />
              <AuthorityBadge level="state_board_rule" />
            </Flex>
          </PreviewFrame>

          <PreviewFrame size="inline" label="Role / tier badges (Radix Badge direct)">
            <Badge color="amber" variant="outline">Admin</Badge>
            <Badge color="purple" variant="outline">Intelligence</Badge>
            <Badge color="gray" variant="outline">Monitor</Badge>
          </PreviewFrame>

          <PreviewFrame size="inline" label="Confidence badges (ConfidenceBadge)">
            <ConfidenceBadge confidence={0.92} />
            <ConfidenceBadge confidence={0.67} />
            <ConfidenceBadge confidence={0.35} />
          </PreviewFrame>
        </ContentSection>

        <ContentSection heading="Notes">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Individual component pages for each badge type (SeverityBadge, StatusBadge, etc.) are
            planned for v2. For now, all badge documentation lives on this page.
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
            Cards provide visual containment for related content. Tables display comparable data in
            rows and columns. The surface variant controls depth — a surfaced component has a visible
            background; a ghost component is transparent.
          </Text>
        </ContentSection>

        <ContentSection heading="Usage rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">Default card variant is <code className="font-mono text-xs">variant=&quot;surface&quot;</code></Text></li>
            <li><Text as="span" size="2" color="gray"><strong>Nested surface rule:</strong> inner component uses <code className="font-mono text-xs">variant=&quot;ghost&quot;</code> when inside another surfaced component. A table inside a card must be ghost, not surface</Text></li>
            <li><Text as="span" size="2" color="gray">Quick test: if removing the inner surface looks cleaner without losing information, use ghost</Text></li>
            <li><Text as="span" size="2" color="gray">Clickable cards add <code className="font-mono text-xs">asChild</code> + hover token — never a border color change</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Examples">
          <PreviewFrame size="full-width" label="Standard card (variant=&quot;surface&quot;)">
            <Card variant="surface">
              <Box p="4">
                <Text as="p" size="2" color="gray">A standard surface card for containing related content.</Text>
              </Box>
            </Card>
          </PreviewFrame>

          <PreviewFrame size="full-width" label="Nested surface rule: table inside card (table uses variant=&quot;ghost&quot;)">
            <Card variant="surface">
              <Box px="4" pt="4" pb="2">
                <Heading as="h3" size="3" weight="medium">Recent activity</Heading>
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

          <PreviewFrame size="contained" label="Stat card (size=&quot;2&quot;)">
            <Card size="2">
              <Box p="4">
                <Text as="p" size="1" color="gray">Total regulations</Text>
                <Text as="p" size="5" weight="bold" mt="1">1,247</Text>
              </Box>
            </Card>
          </PreviewFrame>
        </ContentSection>

        <ContentSection heading="Forbidden patterns">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray"><code className="font-mono text-xs">Table.Root variant=&quot;surface&quot;</code> inside <code className="font-mono text-xs">Card variant=&quot;surface&quot;</code> — double borders, visual noise</Text></li>
            <li><Text as="span" size="2" color="gray">Custom background colors on cards — use the surface/ghost/classic variants</Text></li>
            <li><Text as="span" size="2" color="gray">Border-based click affordance on cards — use hover token instead</Text></li>
          </ul>
        </ContentSection>
      </DetailPage>
    )
  }

  notFound()
}
