import { Badge, Box, Card, Flex, Grid, Heading, Table, Text } from '@radix-ui/themes'
import { getLibraryGroup } from '../_lib/nav-config'
import { LibraryIndexCard } from '../_lib/LibraryIndexCard'
import { SAMPLE_FILTER_PILLS, SAMPLE_REGULATIONS } from '../_lib/demo-data'
import { AiBadge } from '@/components/AiBadge'
import { AuthorityBadge } from '@/components/AuthorityBadge'
import { CedarTable } from '@/components/CedarTable'
import { FilterPills } from '@/components/FilterPills'
import { SectionHeading } from '@/components/SectionHeading'
import { SeverityBadge } from '@/components/SeverityBadge'

export default function PatternsIndexPage() {
  const group = getLibraryGroup('patterns')
  if (!group) return null

  const hrefFor = (slug: string) => `${group.basePath}/${slug}`
  const items = Object.fromEntries(group.items.map((item) => [item.slug, item]))

  return (
    <Flex direction="column" gap="8">
      <Flex direction="column" gap="3">
        <Heading as="h1" size="6" weight="bold">UI patterns</Heading>
        <Text as="p" size="3" color="gray" className="max-w-4xl leading-relaxed">
          UI patterns define how Cedar assembles atoms and fragments into complete working sections and page types.
          This is the layer to consult when you are shaping a route, a workflow, or a reusable multi-part composition.
        </Text>
      </Flex>

      <Grid columns={{ initial: '1', md: '2' }} gap="5">
        <LibraryIndexCard
          href={hrefFor('layout')}
          label={items.layout.label}
          referenceId={items.layout.referenceId}
          description={items.layout.description}
          status={items.layout.status}
          preview={
            <Flex direction="column" gap="3">
              <Text as="span" size="2" color="gray">Collection • Detail • Settings</Text>
              <Flex gap="2">
                <Box className="h-16 flex-1 rounded-md bg-[var(--cedar-interactive-hover)]" />
                <Box className="h-16 flex-1 rounded-md bg-[var(--cedar-interactive-selected)]" />
                <Box className="h-16 flex-1 rounded-md bg-[var(--cedar-interactive-hover)]" />
              </Flex>
            </Flex>
          }
        />

        <LibraryIndexCard
          href={hrefFor('collection-pages')}
          label={items['collection-pages'].label}
          referenceId={items['collection-pages'].referenceId}
          description={items['collection-pages'].description}
          status={items['collection-pages'].status}
          preview={
            <Flex direction="column" gap="3">
              <Flex align="center" gap="2">
                <Heading as="h3" size="4" weight="medium">Regulatory updates</Heading>
                <Badge variant="outline" color="gray">47</Badge>
              </Flex>
              <FilterPills pills={SAMPLE_FILTER_PILLS} />
            </Flex>
          }
        />

        <LibraryIndexCard
          href={hrefFor('detail-pages')}
          label={items['detail-pages'].label}
          referenceId={items['detail-pages'].referenceId}
          description={items['detail-pages'].description}
          status={items['detail-pages'].status}
          preview={
            <Flex direction="column" gap="3">
              <Flex align="center" gap="2" wrap="wrap">
                <Text as="span" size="2">Telehealth prescribing requirements updated</Text>
                <SeverityBadge severity="high" />
                <AuthorityBadge level="state_board_rule" />
                <AiBadge />
              </Flex>
              <Text as="span" size="2" color="gray">FL Board of Medicine • Detected Mar 20, 2026</Text>
            </Flex>
          }
        />

        <LibraryIndexCard
          href={hrefFor('settings-pages')}
          label={items['settings-pages'].label}
          referenceId={items['settings-pages'].referenceId}
          description={items['settings-pages'].description}
          status={items['settings-pages'].status}
          preview={
            <Flex direction="column" gap="3">
              <Card variant="surface"><Box p="3"><SectionHeading as="h3" variant="card">Notifications</SectionHeading></Box></Card>
              <Card variant="surface"><Box p="3"><SectionHeading as="h3" variant="card">Billing</SectionHeading></Box></Card>
            </Flex>
          }
        />

        <LibraryIndexCard
          href={hrefFor('tables')}
          label={items.tables.label}
          referenceId={items.tables.referenceId}
          description={items.tables.description}
          status={items.tables.status}
          preview={
            <Card variant="surface">
              <CedarTable surface="nested" size="1">
                <Table.Body>
                  {SAMPLE_REGULATIONS.slice(0, 2).map((reg) => (
                    <Table.Row key={reg.title}>
                      <Table.Cell><Text as="span" size="2">{reg.title}</Text></Table.Cell>
                      <Table.Cell><SeverityBadge severity={reg.severity} /></Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </CedarTable>
            </Card>
          }
        />

        <LibraryIndexCard
          href={hrefFor('review-workflow')}
          label={items['review-workflow'].label}
          referenceId={items['review-workflow'].referenceId}
          description={items['review-workflow'].description}
          status={items['review-workflow'].status}
          preview={
            <Flex gap="3">
              <Card variant="surface" className="flex-1">
                <Box p="3">
                  <SectionHeading as="h3" variant="card">Queue</SectionHeading>
                </Box>
              </Card>
              <Card variant="surface" className="flex-1">
                <Box p="3">
                  <SectionHeading as="h3" variant="card">Decision</SectionHeading>
                </Box>
              </Card>
            </Flex>
          }
        />
      </Grid>
    </Flex>
  )
}
