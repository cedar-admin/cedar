import { notFound } from 'next/navigation'
import { Badge, Box, Card, Flex, Heading, Table, Text } from '@radix-ui/themes'
import { getAllSlugs, getLibraryItem } from '../../_lib/nav-config'
import { DetailPage, ContentSection } from '../../_lib/DetailPage'
import { PreviewFrame } from '../../_lib/PreviewFrame'
import { SAMPLE_FILTER_PILLS, SAMPLE_REGULATIONS } from '../../_lib/demo-data'
import { FilterPills } from '@/components/FilterPills'
import { SectionHeading } from '@/components/SectionHeading'
import { SeverityBadge } from '@/components/SeverityBadge'
import { AuthorityBadge } from '@/components/AuthorityBadge'
import { AiBadge, AiDisclaimer } from '@/components/AiBadge'
import { timeAgo } from '@/lib/format'

export function generateStaticParams() {
  return getAllSlugs('patterns').map((slug) => ({ slug }))
}

export default async function PatternsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = getLibraryItem('patterns', slug)
  if (!item) notFound()

  if (slug === 'layout') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Every Cedar page is one of three layout types. Choose based on the page&rsquo;s primary purpose.
            Never mix types within a route. Consistent layout is what lets users build a reliable mental model
            of where to find information.
          </Text>
        </ContentSection>

        <ContentSection heading="Hard rules">
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="1">
              <Text as="p" size="2" weight="medium">Collection layout</Text>
              <Text as="p" size="2" color="gray">Routes: /changes, /sources, /library, /audit. Structure: page title + count badge → filter pills → table or card grid. <code className="font-mono text-xs">gap=&quot;6&quot;</code> between major sections. Container from SidebarShell (<code className="font-mono text-xs">max-w-5xl mx-auto</code>).</Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text as="p" size="2" weight="medium">Detail layout</Text>
              <Text as="p" size="2" color="gray">Routes: /changes/[id], /library/[slug]. Structure: breadcrumb → identity cluster → metadata cluster → tabbed content sections. No filter bar.</Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text as="p" size="2" weight="medium">Settings layout</Text>
              <Text as="p" size="2" color="gray">Routes: /settings, /admin/*. Structure: page title → stacked surface cards, one concern per card. Single column. <code className="font-mono text-xs">gap=&quot;6&quot;</code> between cards.</Text>
            </Flex>
          </Flex>
          <Text as="p" size="2" color="gray" mt="2">
            SidebarShell provides <code className="font-mono text-xs">max-w-5xl mx-auto</code> and{' '}
            <code className="font-mono text-xs">{'p={{ initial: "4", md: "6" }}'}</code> — never override the container width.
          </Text>
        </ContentSection>

        <ContentSection heading="Anatomy">
          <PreviewFrame size="full-width" label="Collection layout skeleton">
            <Flex direction="column" gap="4">
              <Flex align="center" gap="3">
                <Heading as="h2" size="6" weight="bold">Regulatory updates</Heading>
                <Badge color="gray" variant="outline">47</Badge>
              </Flex>
              <FilterPills pills={SAMPLE_FILTER_PILLS} />
              <Card variant="surface">
                <Table.Root variant="ghost">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Severity</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Source</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Detected</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {SAMPLE_REGULATIONS.map((reg) => (
                      <Table.Row key={reg.title} className="cursor-pointer hover:bg-[var(--cedar-interactive-hover)]">
                        <Table.Cell><Text as="span" size="2">{reg.title}</Text></Table.Cell>
                        <Table.Cell><SeverityBadge severity={reg.severity} /></Table.Cell>
                        <Table.Cell><Text as="span" size="2" color="gray">{reg.source}</Text></Table.Cell>
                        <Table.Cell><Text as="span" size="2" color="gray"><time dateTime={reg.date}>{timeAgo(reg.date)}</time></Text></Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Card>
            </Flex>
          </PreviewFrame>

          <PreviewFrame size="full-width" label="Detail layout skeleton">
            <Flex direction="column" gap="3">
              <Text as="span" size="2" color="gray">← Changes</Text>
              <Flex align="center" gap="2" wrap="wrap">
                <Heading as="h2" size="5" weight="bold">Telehealth prescribing requirements updated</Heading>
                <SeverityBadge severity="high" />
                <AuthorityBadge level="state_board_rule" />
                <AiBadge />
              </Flex>
              <Flex align="center" gap="4">
                <Text as="span" size="2" color="gray">FL Board of Medicine</Text>
                <Text as="span" size="2" color="gray">Detected Mar 20, 2026</Text>
              </Flex>
            </Flex>
          </PreviewFrame>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'collection-pages') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Every list view in Cedar — changes, sources, library, audit trail — uses this composition.
            The header orients users (where am I, how many items), the filter pills narrow results,
            and the table or card grid shows the data. Order and spacing are fixed.
          </Text>
        </ContentSection>

        <ContentSection heading="Hard rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">Row 1: <code className="font-mono text-xs">{'<Flex align="center" gap="3">'}</code> containing <code className="font-mono text-xs">Heading (h1, size 6, bold)</code> + count <code className="font-mono text-xs">Badge (gray, outline)</code></Text></li>
            <li><Text as="span" size="2" color="gray">Row 2: FilterPills — &ldquo;All&rdquo; first, then filters in logical order</Text></li>
            <li><Text as="span" size="2" color="gray"><code className="font-mono text-xs">gap=&quot;4&quot;</code> between the header row and the filter row; <code className="font-mono text-xs">gap=&quot;4&quot;</code> between filter row and data</Text></li>
            <li><Text as="span" size="2" color="gray">Heading text is the collection name — sentence case, no title case</Text></li>
            <li><Text as="span" size="2" color="gray">Count shows total items. When a filter is active, show filtered count</Text></li>
            <li><Text as="span" size="2" color="gray">This is a composition, not a standalone component — build it from primitives directly in each page</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Anatomy">
          <PreviewFrame size="full-width" label="Collection header composition">
            <Flex direction="column" gap="4">
              <Flex align="center" gap="3">
                <Heading as="h2" size="6" weight="bold">Regulatory updates</Heading>
                <Badge color="gray" variant="outline">47</Badge>
              </Flex>
              <FilterPills pills={SAMPLE_FILTER_PILLS} />
            </Flex>
          </PreviewFrame>

          <PreviewFrame size="full-width" label="Full collection page — header + filter + table">
            <Flex direction="column" gap="4">
              <Flex align="center" gap="3">
                <Heading as="h2" size="6" weight="bold">Regulatory updates</Heading>
                <Badge color="gray" variant="outline">47</Badge>
              </Flex>
              <FilterPills pills={SAMPLE_FILTER_PILLS} />
              <Card variant="surface">
                <Table.Root variant="ghost">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Severity</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Detected</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {SAMPLE_REGULATIONS.map((reg) => (
                      <Table.Row key={reg.title} className="cursor-pointer hover:bg-[var(--cedar-interactive-hover)]">
                        <Table.Cell>
                          <Flex align="center" gap="2">
                            <Text as="span" size="2">{reg.title}</Text>
                            <i className="ri-arrow-right-s-line text-[var(--cedar-text-muted)]" aria-hidden="true" />
                          </Flex>
                        </Table.Cell>
                        <Table.Cell><SeverityBadge severity={reg.severity} /></Table.Cell>
                        <Table.Cell><Text as="span" size="2" color="gray"><time dateTime={reg.date}>{timeAgo(reg.date)}</time></Text></Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Card>
            </Flex>
          </PreviewFrame>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'detail-pages') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Every item detail view — change detail, regulation detail — uses this metadata cluster composition.
            It orients the user immediately: what is this item, what is its status, where does it come from,
            and when was it detected. The cluster membership and order are fixed across all detail views.
          </Text>
        </ContentSection>

        <ContentSection heading="Hard rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray"><strong>Identity cluster (row 1):</strong> <code className="font-mono text-xs">Heading (h1)</code> → <code className="font-mono text-xs">SeverityBadge</code> → <code className="font-mono text-xs">AuthorityBadge</code> → <code className="font-mono text-xs">AiBadge</code> — in that order</Text></li>
            <li><Text as="span" size="2" color="gray"><strong>Source cluster (row 2):</strong> source name → effective date (<code className="font-mono text-xs">{'<time>'}</code>) → detected date (<code className="font-mono text-xs">{'<time>'}</code>)</Text></li>
            <li><Text as="span" size="2" color="gray">Cluster membership and order never change between views — only size and padding vary</Text></li>
            <li><Text as="span" size="2" color="gray">Max 4 items per cluster — never add a 5th badge to row 1</Text></li>
            <li><Text as="span" size="2" color="gray">AI summary card uses <code className="font-mono text-xs">SectionHeading + AiBadge</code> inline, <code className="font-mono text-xs">AiDisclaimer</code> as the last element</Text></li>
            <li><Text as="span" size="2" color="gray">Breadcrumb appears above the identity cluster — format: Collection name / Item title</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Anatomy">
          <PreviewFrame size="full-width" label="Identity + source clusters">
            <Flex direction="column" gap="3">
              <Flex align="center" gap="2" wrap="wrap">
                <Heading as="h2" size="5" weight="bold">Telehealth prescribing requirements updated</Heading>
                <SeverityBadge severity="high" />
                <AuthorityBadge level="state_board_rule" />
                <AiBadge />
              </Flex>
              <Flex align="center" gap="4" wrap="wrap">
                <Text as="span" size="2" color="gray">FL Board of Medicine</Text>
                <Text as="span" size="2" color="gray">
                  Effective <time dateTime="2026-04-01">Apr 1, 2026</time>
                </Text>
                <Text as="span" size="2" color="gray">
                  Detected <time dateTime="2026-03-20T14:30:00Z">Mar 20, 2026</time>
                </Text>
              </Flex>
            </Flex>
          </PreviewFrame>

          <PreviewFrame size="full-width" label="AI summary card — complete composition">
            <Card variant="surface">
              <Box p="4">
                <Flex align="center" gap="2" mb="3">
                  <SectionHeading as="h3" variant="card">AI summary</SectionHeading>
                  <AiBadge />
                </Flex>
                <Text as="p" size="2" color="gray" className="leading-relaxed">
                  This amendment updates telehealth prescribing requirements for Schedule III–V controlled
                  substances, requiring a prior in-person examination before remote prescribing. Practices
                  offering hormone optimization or weight management via telehealth are directly affected.
                </Text>
                <AiDisclaimer />
              </Box>
            </Card>
          </PreviewFrame>
        </ContentSection>

        <ContentSection heading="Notes">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            This page is <strong>candidate</strong> status. The cluster composition is stable and in use,
            but the canonical tabbed section order for detail views (summary, diff, metadata, audit) is still
            being confirmed. Promote to approved once that ordering is locked down.
          </Text>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'tables') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Use tables when users need to compare attributes across many items — changes, sources, audit events.
            Tables support sorting and filtering. Use a card grid when items are primarily browsed visually
            (regulation library domains).
          </Text>
        </ContentSection>

        <ContentSection heading="Hard rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray"><strong>Surface table</strong> (<code className="font-mono text-xs">variant=&quot;surface&quot;</code>): standalone table on a page background, not inside a card</Text></li>
            <li><Text as="span" size="2" color="gray"><strong>Ghost table</strong> (<code className="font-mono text-xs">variant=&quot;ghost&quot;</code>): table inside a Card — nested surface rule</Text></li>
            <li><Text as="span" size="2" color="gray"><strong>Clickable rows:</strong> <code className="font-mono text-xs">cursor-pointer</code> class, hover background <code className="font-mono text-xs">var(--cedar-interactive-hover)</code>, trailing chevron <code className="font-mono text-xs">ri-arrow-right-s-line</code>, <code className="font-mono text-xs">onClick</code> on the <code className="font-mono text-xs">{'<tr>'}</code></Text></li>
            <li><Text as="span" size="2" color="gray">Column order: identifier → status/severity → attributes → metadata → actions</Text></li>
            <li><Text as="span" size="2" color="gray">Max 5–7 visible columns — truncate or consolidate beyond that</Text></li>
            <li><Text as="span" size="2" color="gray"><code className="font-mono text-xs">size=&quot;2&quot;</code> standard; <code className="font-mono text-xs">size=&quot;1&quot;</code> compact for dense audit views</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Anatomy">
          <PreviewFrame size="full-width" label="Ghost table inside Card — clickable rows with chevron">
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
                      <Table.ColumnHeaderCell>Detected</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {SAMPLE_REGULATIONS.map((reg) => (
                      <Table.Row key={reg.title} className="cursor-pointer hover:bg-[var(--cedar-interactive-hover)]">
                        <Table.Cell>
                          <Flex align="center" gap="2">
                            <Text as="span" size="2">{reg.title}</Text>
                            <i className="ri-arrow-right-s-line text-[var(--cedar-text-muted)]" aria-hidden="true" />
                          </Flex>
                        </Table.Cell>
                        <Table.Cell><SeverityBadge severity={reg.severity} /></Table.Cell>
                        <Table.Cell><Text as="span" size="2" color="gray">{reg.source}</Text></Table.Cell>
                        <Table.Cell><Text as="span" size="2" color="gray"><time dateTime={reg.date}>{timeAgo(reg.date)}</time></Text></Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            </Card>
          </PreviewFrame>
        </ContentSection>

        <ContentSection heading="Forbidden patterns">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray"><code className="font-mono text-xs">variant=&quot;surface&quot;</code> inside Card — double borders and visual noise</Text></li>
            <li><Text as="span" size="2" color="gray">More than 7 columns — consolidate or move to a detail page</Text></li>
            <li><Text as="span" size="2" color="gray">Clickable row without a trailing chevron — users must be able to see that the row navigates</Text></li>
            <li><Text as="span" size="2" color="gray">Using a table for visually browsed items (e.g., domain cards) — use a card grid instead</Text></li>
          </ul>
        </ContentSection>
      </DetailPage>
    )
  }

  notFound()
}
