import { createServerClient } from '@/lib/db/client'
import { getLayoutData } from '@/lib/layout-data'
import { UpgradeBanner } from '@/components/UpgradeBanner'
import { DomainCard } from '@/components/DomainCard'
import { EmptyState } from '@/components/EmptyState'
import { FilterPills } from '@/components/FilterPills'
import { Flex, Heading, Text, Box, Grid } from '@radix-ui/themes'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Regulation Library — Cedar' }

interface Props {
  searchParams: Promise<{ practice_type?: string }>
}

export default async function LibraryPage({ searchParams }: Props) {
  const { role } = await getLayoutData()
  const isGated = role === 'monitor'

  const { practice_type: practiceTypeSlug } = await searchParams

  if (isGated) {
    return (
      <Flex direction="column" gap="6">
        <Box>
          <Heading as="h1" size="6" weight="bold">Regulation Library</Heading>
          <Text size="2" color="gray" as="p" mt="1">
            Federal and Florida healthcare regulations
          </Text>
        </Box>
        <UpgradeBanner feature="Regulation Library" />
      </Flex>
    )
  }

  const supabase = createServerClient()

  // Fetch practice types for filter pills
  const { data: practiceTypes } = await supabase
    .from('kg_practice_types')
    .select('id, slug, display_name, sort_order')
    .eq('is_active', true)
    .order('sort_order')

  // Fetch active domains (depth 0 only — top-level categories)
  const { data: domains } = await supabase
    .from('kg_domains')
    .select('id, name, slug, description, color, depth, parent_id')
    .eq('is_active', true)
    .eq('depth', 0)
    .order('sort_order')

  // Get regulation counts per domain
  const domainStats: Record<string, { count: number }> = {}

  // When practice type filter is active, only show domains that map to that practice type
  let relevantDomainSlugs: Set<string> | null = null
  if (practiceTypeSlug) {
    const { data: domainMap } = await supabase
      .from('kg_domain_practice_type_map')
      .select('domain_slug')
      .eq('practice_type_slug', practiceTypeSlug)

    relevantDomainSlugs = new Set((domainMap ?? []).map((d) => d.domain_slug))
  }

  // Get entity counts per domain (top-level + children rolled up)
  const domainIds = (domains ?? []).map((d) => d.id)
  const { data: childDomains } = await supabase
    .from('kg_domains')
    .select('id, parent_id')
    .in('parent_id', domainIds)

  await Promise.all(
    (domains ?? []).map(async (domain) => {
      const childIds = (childDomains ?? [])
        .filter((c) => c.parent_id === domain.id)
        .map((c) => c.id)
      const idsToCount = [domain.id, ...childIds]
      const { count } = await supabase
        .from('kg_entity_domains')
        .select('entity_id', { count: 'exact', head: true })
        .in('domain_id', idsToCount)
      domainStats[domain.id] = { count: count ?? 0 }
    })
  )

  // Total entity count
  const { count: totalEntities } = await supabase
    .from('kg_entities')
    .select('id', { count: 'exact', head: true })

  return (
    <Flex direction="column" gap="6">
      <Box>
        <Heading as="h1" size="6" weight="bold">Regulation Library</Heading>
        <Text size="2" color="gray" as="p" mt="1">
          {totalEntities
            ? `${totalEntities.toLocaleString()} regulations, rules, and enforcement records`
            : 'Federal and Florida healthcare regulations'}
        </Text>
      </Box>

      {/* Practice type filter pills */}
      {(practiceTypes ?? []).length > 0 && (
        <FilterPills
          pills={[
            { label: 'All', href: '/library', isActive: !practiceTypeSlug },
            ...(practiceTypes ?? []).map((pt) => ({
              label: pt.display_name,
              href: `/library?practice_type=${pt.slug}`,
              isActive: practiceTypeSlug === pt.slug,
            })),
          ]}
        />
      )}

      {/* Domain card grid */}
      <section aria-labelledby="browse-heading">
        <Heading id="browse-heading" as="h2" size="3" weight="bold" mb="4">Browse by Category</Heading>
        {(domains ?? []).length > 0 ? (
          <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
            {(domains ?? []).map((domain) => {
              const stats = domainStats[domain.id]
              const count = stats?.count ?? 0
              if (relevantDomainSlugs && !relevantDomainSlugs.has(domain.slug)) return null
              return (
                <DomainCard
                  key={domain.id}
                  domain={domain}
                  regulationCount={count}
                  recentChangeCount={0}
                  highestSeverity={null}
                  headingLevel="h3"
                />
              )
            })}
          </Grid>
        ) : (
          <EmptyState
            icon="ri-book-2-line"
            title="No categories available"
            description="The regulation taxonomy has not been configured yet."
          />
        )}
      </section>
    </Flex>
  )
}
