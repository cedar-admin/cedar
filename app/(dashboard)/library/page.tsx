import { createServerClient } from '@/lib/db/client'
import { getLayoutData } from '@/lib/layout-data'
import { UpgradeBanner } from '@/components/UpgradeBanner'
import { DomainCard } from '@/components/DomainCard'
import { EmptyState } from '@/components/EmptyState'
import { PracticeTypeSelect } from '@/components/PracticeTypeSelect'
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

  // ── Query 1: practice types + practice type filter map ────────────────────
  const [{ data: practiceTypes }, practiceTypeDomainMap] = await Promise.all([
    supabase
      .from('kg_practice_types')
      .select('id, slug, display_name, sort_order')
      .eq('is_active', true)
      .order('sort_order'),
    practiceTypeSlug
      ? supabase
          .from('kg_domain_practice_type_map')
          .select('domain_slug')
          .eq('practice_type_slug', practiceTypeSlug)
      : Promise.resolve({ data: null }),
  ])

  const relevantDomainSlugs: Set<string> | null = practiceTypeDomainMap.data
    ? new Set(practiceTypeDomainMap.data.map((d) => d.domain_slug))
    : null

  // ── Query 2: all domains (root + children) in one pass ────────────────────
  // Fetch every active domain so we can roll child counts up to L1 parents.
  // Guard against duplicate root rows: only rows where parent_id IS NULL count
  // as L1 cards — depth=0 alone is insufficient if the seed ran more than once.
  const { data: allDomains } = await supabase
    .from('kg_domains')
    .select('id, name, slug, description, color, depth, parent_id, sort_order')
    .eq('is_active', true)
    .order('sort_order')

  const rootDomains = (allDomains ?? []).filter(
    (d) => d.depth === 0 && d.parent_id === null,
  )

  // Build a map: domain_id → root ancestor id (for count rollup)
  const domainToRoot = new Map<string, string>()
  const rootById = new Map<string, (typeof rootDomains)[0]>()
  for (const d of rootDomains) {
    rootById.set(d.id, d)
    domainToRoot.set(d.id, d.id)
  }
  for (const d of allDomains ?? []) {
    if (d.parent_id && rootById.has(d.parent_id)) {
      domainToRoot.set(d.id, d.parent_id)
    }
  }

  // ── Query 3: entity counts per domain — one round trip ───────────────────
  // Pull all entity_domain rows grouped by domain_id from the DB via RPC-style
  // query. Supabase doesn't expose raw GROUP BY on the client, so we fetch
  // entity counts using a single aggregate-friendly call per root domain IDs
  // by getting all kg_entity_domains rows and grouping in JS.
  // This replaces the previous N individual count queries.
  const allDomainIds = (allDomains ?? []).map((d) => d.id)
  const { data: entityDomainRows } = await supabase
    .from('kg_entity_domains')
    .select('domain_id, entity_id')
    .in('domain_id', allDomainIds)

  // Roll up: count unique entity_ids per root ancestor
  const rootEntitySets = new Map<string, Set<string>>()
  for (const row of entityDomainRows ?? []) {
    const rootId = domainToRoot.get(row.domain_id)
    if (!rootId) continue
    if (!rootEntitySets.has(rootId)) rootEntitySets.set(rootId, new Set())
    rootEntitySets.get(rootId)!.add(row.entity_id)
  }

  // ── Query 4 (lightweight): total entity count ─────────────────────────────
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

      {/* Practice type filter — Select dropdown */}
      {(practiceTypes ?? []).length > 0 && (
        <PracticeTypeSelect
          practiceTypes={practiceTypes ?? []}
          selected={practiceTypeSlug}
        />
      )}

      {/* Domain card grid */}
      <section aria-labelledby="browse-heading">
        <Heading id="browse-heading" as="h2" size="3" weight="bold" mb="4">Browse by Category</Heading>
        {rootDomains.length > 0 ? (
          <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
            {rootDomains.map((domain) => {
              if (relevantDomainSlugs && !relevantDomainSlugs.has(domain.slug)) return null
              const count = rootEntitySets.get(domain.id)?.size ?? 0
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
