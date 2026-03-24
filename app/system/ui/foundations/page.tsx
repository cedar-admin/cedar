import { Box, Card, Flex, Grid, Heading, Table, Text } from '@radix-ui/themes'
import { getLibraryGroup } from '../_lib/nav-config'
import { LibraryIndexCard } from '../_lib/LibraryIndexCard'
import { CedarTable } from '@/components/CedarTable'
import { AuthorityBadge } from '@/components/AuthorityBadge'
import { ConfidenceBadge } from '@/components/ConfidenceBadge'
import { SectionHeading } from '@/components/SectionHeading'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatusBadge } from '@/components/StatusBadge'

export default function FoundationsIndexPage() {
  const group = getLibraryGroup('foundations')
  if (!group) return null

  const hrefFor = (slug: string) => `${group.basePath}/${slug}`
  const items = Object.fromEntries(group.items.map((item) => [item.slug, item]))

  return (
    <Flex direction="column" gap="8">
      <Flex direction="column" gap="3">
        <Heading as="h1" size="6" weight="bold">Foundations</Heading>
        <Text as="p" size="3" color="gray" className="max-w-4xl leading-relaxed">
          Foundations define Cedar&rsquo;s base visual and structural rules: typography, semantic color,
          surfaces, spacing, and layout primitives. Start here when you need to know which value, size,
          or structural rule should govern a UI decision before you assemble higher-level components.
        </Text>
      </Flex>

      <Grid columns={{ initial: '1', md: '2' }} gap="5">
        <LibraryIndexCard
          href={hrefFor('typography')}
          label={items.typography.label}
          referenceId={items.typography.referenceId}
          description={items.typography.description}
          status={items.typography.status}
          preview={
            <Flex direction="column" gap="2">
              <Heading as="h2" size="5" weight="bold">Page title</Heading>
              <SectionHeading as="h3" variant="standalone">Section heading</SectionHeading>
              <Text as="p" size="2" color="gray">Body text and metadata should feel calm and highly legible.</Text>
            </Flex>
          }
        />

        <LibraryIndexCard
          href={hrefFor('semantic-color')}
          label={items['semantic-color'].label}
          referenceId={items['semantic-color'].referenceId}
          description={items['semantic-color'].description}
          status={items['semantic-color'].status}
          preview={
            <Flex wrap="wrap" gap="2">
              <SeverityBadge severity="high" />
              <StatusBadge status="pending_review" />
              <AuthorityBadge level="state_board_rule" />
              <ConfidenceBadge confidence={0.84} />
            </Flex>
          }
        />

        <LibraryIndexCard
          href={hrefFor('surfaces')}
          label={items.surfaces.label}
          referenceId={items.surfaces.referenceId}
          description={items.surfaces.description}
          status={items.surfaces.status}
          preview={
            <Card variant="surface">
              <Box px="4" pt="4" pb="2">
                <SectionHeading as="h3" variant="card">Nested surfaces</SectionHeading>
              </Box>
              <Box p="0">
                <CedarTable surface="nested" size="1">
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>
                        <Text as="span" size="2">Use ghost inside surfaced cards</Text>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </CedarTable>
              </Box>
            </Card>
          }
        />

        <LibraryIndexCard
          href={hrefFor('layout-primitives')}
          label={items['layout-primitives'].label}
          referenceId={items['layout-primitives'].referenceId}
          description={items['layout-primitives'].description}
          status={items['layout-primitives'].status}
          preview={
            <Flex direction="column" gap="3">
              <Flex gap="2">
                <Box className="h-10 flex-1 rounded-md bg-[var(--cedar-interactive-hover)]" />
                <Box className="h-10 w-20 rounded-md bg-[var(--cedar-interactive-selected)]" />
              </Flex>
              <Grid columns="2" gap="2">
                <Box className="h-12 rounded-md bg-[var(--cedar-interactive-hover)]" />
                <Box className="h-12 rounded-md bg-[var(--cedar-interactive-hover)]" />
              </Grid>
            </Flex>
          }
        />
      </Grid>
    </Flex>
  )
}
