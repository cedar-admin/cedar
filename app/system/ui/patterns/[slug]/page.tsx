import { notFound } from 'next/navigation'
import { Badge, Box, Card, Flex, Heading, Select, Switch, Table, Text } from '@radix-ui/themes'
import { getAllSlugs, getLibraryItem } from '../../_lib/nav-config'
import { DetailPage, ContentSection } from '../../_lib/DetailPage'
import { PreviewFrame } from '../../_lib/PreviewFrame'
import { SAMPLE_FILTER_PILLS, SAMPLE_REGULATIONS } from '../../_lib/demo-data'
import { FilterPills } from '@/components/FilterPills'
import { SectionHeading } from '@/components/SectionHeading'
import { SeverityBadge } from '@/components/SeverityBadge'
import { AuthorityBadge } from '@/components/AuthorityBadge'
import { AiBadge } from '@/components/AiBadge'
import { EmptyState } from '@/components/EmptyState'
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
            Every Cedar page follows one of three layout types. Choose based on the page&rsquo;s primary
            purpose. Mixing layout types within a session creates inconsistent user mental models.
          </Text>
        </ContentSection>

        <ContentSection heading="Usage rules">
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="2">
              <Text as="p" size="2" weight="medium">Collection layout</Text>
              <Text as="p" size="2" color="gray">For: /changes, /sources, /library. Structure: collection header + filter bar + data table or card grid. Section spacing gap=&quot;6&quot; between major sections. Max-width from SidebarShell.</Text>
            </Flex>
            <Flex direction="column" gap="2">
              <Text as="p" size="2" weight="medium">Detail layout</Text>
              <Text as="p" size="2" color="gray">For: /changes/[id], /library/[slug]. Structure: metadata header cluster + tabbed content + breadcrumb back-navigation.</Text>
            </Flex>
            <Flex direction="column" gap="2">
              <Text as="p" size="2" weight="medium">Settings layout</Text>
              <Text as="p" size="2" color="gray">For: /settings, admin config pages. Structure: stacked cards with form controls. Single column. gap=&quot;6&quot; between cards.</Text>
            </Flex>
          </Flex>
        </ContentSection>

        <ContentSection heading="Examples">
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

          <PreviewFrame size="full-width" label="Settings layout skeleton">
            <Flex direction="column" gap="4">
              <Heading as="h2" size="6" weight="bold">Settings</Heading>
              <Card variant="surface">
                <Box p="4">
                  <Flex direction="column" gap="3">
                    <SectionHeading as="h2" variant="card">Email notifications</SectionHeading>
                    <Text as="p" size="2" color="gray">Receive email alerts when new regulatory changes are detected.</Text>
                    <Switch defaultChecked />
                  </Flex>
                </Box>
              </Card>
              <Card variant="surface">
                <Box p="4">
                  <Flex direction="column" gap="3">
                    <SectionHeading as="h2" variant="card">Alert threshold</SectionHeading>
                    <Text as="p" size="2" color="gray">Minimum severity level required to trigger an alert.</Text>
                    <Badge variant="outline" color="gray" className="w-fit">Medium and above</Badge>
                  </Flex>
                </Box>
              </Card>
            </Flex>
          </PreviewFrame>
        </ContentSection>

        <ContentSection heading="Notes">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            SidebarShell provides <code className="font-mono text-xs">max-w-5xl mx-auto</code> and{' '}
            <code className="font-mono text-xs">{'p={{ initial: "4", md: "6" }}'}</code>. Pages slot into this container
            — never override the container width.
          </Text>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'navigation') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Reference this pattern whenever building a new page, modifying page flow, or adding a
            new route. Five navigation signals must stay consistent to avoid disorienting users.
          </Text>
        </ContentSection>

        <ContentSection heading="Usage rules">
          <Flex direction="column" gap="3">
            <Text as="p" size="2" weight="medium">Five signals that must be consistent</Text>
            <ul className="flex flex-col gap-2 ml-4 list-disc">
              <li><Text as="span" size="2" color="gray"><strong>Sidebar active state</strong> — <code className="font-mono text-xs">pathname.startsWith(href)</code> keeps parent active on child routes</Text></li>
              <li><Text as="span" size="2" color="gray"><strong>Page title</strong> — matches the page&rsquo;s h1 heading text</Text></li>
              <li><Text as="span" size="2" color="gray"><strong>Breadcrumbs</strong> — appear on all pages except root-level (home, changes list, library list)</Text></li>
              <li><Text as="span" size="2" color="gray"><strong>Browser tab title</strong> — format: &ldquo;Page title — Cedar&rdquo; via metadata export</Text></li>
              <li><Text as="span" size="2" color="gray"><strong>URL</strong> — encodes: filters, sort, pagination, search, tab state. Does NOT encode: modal state, hover state</Text></li>
            </ul>
          </Flex>
        </ContentSection>

        <ContentSection heading="Examples">
          <PreviewFrame size="full-width" label="Navigation signal alignment">
            <Flex direction="column" gap="3">
              <Box className="border border-[var(--cedar-border-subtle)] rounded p-3 bg-[var(--cedar-panel-bg)]">
                <Text as="p" size="1" color="gray" mb="2">Browser tab</Text>
                <Text as="p" size="2">Telehealth prescribing requirements — Cedar</Text>
              </Box>
              <Box className="border border-[var(--cedar-border-subtle)] rounded p-3 bg-[var(--cedar-panel-bg)]">
                <Text as="p" size="1" color="gray" mb="2">URL</Text>
                <Text as="p" size="2" className="font-mono">/changes?severity=high&amp;sort=detected_at</Text>
              </Box>
              <Box className="border border-[var(--cedar-border-subtle)] rounded p-3 bg-[var(--cedar-panel-bg)]">
                <Text as="p" size="1" color="gray" mb="2">Breadcrumb</Text>
                <Flex align="center" gap="1">
                  <Text as="span" size="2" color="gray">Changes</Text>
                  <Text as="span" size="2" color="gray">/</Text>
                  <Text as="span" size="2">Telehealth prescribing requirements</Text>
                </Flex>
              </Box>
            </Flex>
          </PreviewFrame>
        </ContentSection>

        <ContentSection heading="Notes">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            See <code className="font-mono text-xs">components/BreadcrumbNav.tsx</code> for breadcrumb implementation.
            Sidebar active logic is in <code className="font-mono text-xs">components/SidebarLink.tsx</code>.
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
            Use tables when users need to compare attributes across many items — changes, sources,
            audit events. Tables support sorting and filtering. Use a card grid when items are
            primarily browsed visually (regulation library domains).
          </Text>
        </ContentSection>

        <ContentSection heading="Usage rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray"><strong>Surface table</strong> (<code className="font-mono text-xs">variant=&quot;surface&quot;</code>): standalone table on a page background, not inside a card</Text></li>
            <li><Text as="span" size="2" color="gray"><strong>Ghost table</strong> (<code className="font-mono text-xs">variant=&quot;ghost&quot;</code>): table inside a Card — nested surface rule</Text></li>
            <li><Text as="span" size="2" color="gray"><strong>Clickable rows:</strong> full-row click target, <code className="font-mono text-xs">cursor-pointer</code>, hover background, trailing chevron, <code className="font-mono text-xs">onClick</code> on <code className="font-mono text-xs">{'<tr>'}</code></Text></li>
            <li><Text as="span" size="2" color="gray">Max 5–7 visible columns. Column order: identifier → status → attributes → metadata → actions</Text></li>
            <li><Text as="span" size="2" color="gray">Size 2 standard, size 1 compact for dense audit views</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Examples">
          <PreviewFrame size="full-width" label="Ghost table inside Card (nested surface rule)">
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
            <li><Text as="span" size="2" color="gray">More than 7 columns — truncate or consolidate</Text></li>
            <li><Text as="span" size="2" color="gray">Table for browsing visual items — use a card grid instead</Text></li>
          </ul>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'empty-states') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Every collection view and data-dependent section needs an empty state. Choose the type
            based on why the area is empty — not just &ldquo;no data.&rdquo; The type determines the tone
            and the CTA.
          </Text>
        </ContentSection>

        <ContentSection heading="Usage rules">
          <Flex direction="column" gap="3">
            <Flex direction="column" gap="1">
              <Text as="p" size="2" weight="medium">First use</Text>
              <Text as="p" size="2" color="gray">Encouraging. Primary CTA to create or add. Active language: &ldquo;Add a source&rdquo; not &ldquo;No sources found.&rdquo;</Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text as="p" size="2" weight="medium">No filter results</Text>
              <Text as="p" size="2" color="gray">Acknowledge the active filter. &ldquo;Clear filters&rdquo; secondary action. Don&rsquo;t suggest adding data.</Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text as="p" size="2" weight="medium">Error loading</Text>
              <Text as="p" size="2" color="gray">&ldquo;Unable to load…&rdquo; with a Retry action. Never show &ldquo;No records&rdquo; for an error state.</Text>
            </Flex>
            <Text as="p" size="2" color="gray">Never show &ldquo;No records&rdquo; during loading — use skeletons.</Text>
          </Flex>
        </ContentSection>

        <ContentSection heading="Examples">
          <PreviewFrame size="contained" label="First use">
            <EmptyState
              icon="ri-inbox-line"
              title="No changes detected"
              description="Cedar will surface regulatory changes here as sources are monitored. Check back after the next polling cycle."
            />
          </PreviewFrame>

          <PreviewFrame size="contained" label="No filter results">
            <EmptyState
              icon="ri-search-line"
              title="No matches"
              description="No changes match the active filter. Try clearing the filter to see all results."
            />
          </PreviewFrame>

          <PreviewFrame size="contained" label="Error loading">
            <EmptyState
              icon="ri-error-warning-line"
              title="Unable to load changes"
              description="There was a problem loading this data. Try refreshing the page."
            />
          </PreviewFrame>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'collection-header') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Every collection page (/changes, /sources, /library) uses this header composition.
            It provides consistent wayfinding: the title tells users where they are, the count sets
            expectations, and the filter pills let them narrow results.
          </Text>
        </ContentSection>

        <ContentSection heading="Usage rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">First row: Flex with Heading (h1, size 6, bold) + count Badge (gray, outline)</Text></li>
            <li><Text as="span" size="2" color="gray">Second row: FilterPills with all filter options, &ldquo;All&rdquo; first</Text></li>
            <li><Text as="span" size="2" color="gray"><code className="font-mono text-xs">gap=&quot;4&quot;</code> between the two rows</Text></li>
            <li><Text as="span" size="2" color="gray">The heading text is the collection name — sentence case</Text></li>
            <li><Text as="span" size="2" color="gray">The count shows total items before filtering (or filtered count when a filter is active)</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Examples">
          <PreviewFrame size="full-width" label="Collection header composition">
            <Flex direction="column" gap="4">
              <Flex align="center" gap="3">
                <Heading as="h2" size="6" weight="bold">Regulatory updates</Heading>
                <Badge color="gray" variant="outline">47</Badge>
              </Flex>
              <FilterPills pills={SAMPLE_FILTER_PILLS} />
            </Flex>
          </PreviewFrame>
        </ContentSection>

        <ContentSection heading="Notes">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            This is a composition, not a standalone component. Build it from Radix primitives +
            FilterPills directly in each page. Extract to a component only if the composition
            grows to 4+ collection pages.
          </Text>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'detail-header') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Every detail view (change detail, regulation detail) uses this metadata cluster
            composition. It orients the user immediately: what is this item, what is its status,
            where does it come from, and when was it detected.
          </Text>
        </ContentSection>

        <ContentSection heading="Usage rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">Row 1 (identity cluster): Heading (h1), SeverityBadge, AuthorityBadge, AiBadge — in that order</Text></li>
            <li><Text as="span" size="2" color="gray">Row 2 (source cluster): source name, effective date (<code className="font-mono text-xs">{'<time>'}</code>), detected date (<code className="font-mono text-xs">{'<time>'}</code>)</Text></li>
            <li><Text as="span" size="2" color="gray">Cluster membership and order never change between views — only size and padding vary</Text></li>
            <li><Text as="span" size="2" color="gray">Max 4 items per cluster — never add a 5th badge to row 1</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Examples">
          <PreviewFrame size="full-width" label="Full metadata cluster">
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
                  Effective{' '}
                  <time dateTime="2026-04-01">Apr 1, 2026</time>
                </Text>
                <Text as="span" size="2" color="gray">
                  Detected{' '}
                  <time dateTime="2026-03-20T14:30:00Z">Mar 20, 2026</time>
                </Text>
              </Flex>
            </Flex>
          </PreviewFrame>
        </ContentSection>

        <ContentSection heading="Notes">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Same clustering appears in table rows (condensed) and detail views (expanded).
            Only size/padding varies — color, shape, and label text are identical everywhere.
          </Text>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'settings-section') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Settings pages and admin configuration pages. Any page where the user configures
            key-value preferences. One logical concern per card — never combine unrelated
            settings into a single card.
          </Text>
        </ContentSection>

        <ContentSection heading="Usage rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">Card (<code className="font-mono text-xs">variant=&quot;surface&quot;</code>) containing SectionHeading + descriptive text + form control(s)</Text></li>
            <li><Text as="span" size="2" color="gray">One logical concern per card</Text></li>
            <li><Text as="span" size="2" color="gray">Cards stacked vertically with <code className="font-mono text-xs">gap=&quot;6&quot;</code></Text></li>
            <li><Text as="span" size="2" color="gray">Form controls use gray by default</Text></li>
            <li><Text as="span" size="2" color="gray">Validation errors: <code className="font-mono text-xs">color=&quot;red&quot;</code> on the field + error text below</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Examples">
          <PreviewFrame size="full-width" label="Toggle setting">
            <Card variant="surface">
              <Box p="4">
                <Flex direction="column" gap="3">
                  <SectionHeading as="h3" variant="card">Email notifications</SectionHeading>
                  <Text as="p" size="2" color="gray">Receive email alerts when new regulatory changes are detected above your threshold.</Text>
                  <Flex align="center" justify="between">
                    <Text as="span" size="2">Send email alerts</Text>
                    <Switch defaultChecked />
                  </Flex>
                </Flex>
              </Box>
            </Card>
          </PreviewFrame>

          <PreviewFrame size="full-width" label="Select setting (mocked)">
            <Card variant="surface">
              <Box p="4">
                <Flex direction="column" gap="3">
                  <SectionHeading as="h3" variant="card">Alert threshold</SectionHeading>
                  <Text as="p" size="2" color="gray">Minimum severity level required to trigger an alert. Changes below this level are still recorded.</Text>
                  <Select.Root defaultValue="medium" size="2">
                    <Select.Trigger color="gray" />
                    <Select.Content>
                      <Select.Item value="critical">Critical and above</Select.Item>
                      <Select.Item value="high">High and above</Select.Item>
                      <Select.Item value="medium">Medium and above</Select.Item>
                      <Select.Item value="low">Low and above</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Flex>
              </Box>
            </Card>
          </PreviewFrame>
        </ContentSection>
      </DetailPage>
    )
  }

  notFound()
}
