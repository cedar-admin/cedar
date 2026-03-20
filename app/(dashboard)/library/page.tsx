import { createServerClient } from '@/lib/db/client'
import { getLayoutData } from '@/lib/layout-data'
import { UpgradeBanner } from '@/components/UpgradeBanner'
import { DomainCard } from '@/components/DomainCard'
import { EmptyState } from '@/components/EmptyState'
import Link from 'next/link'
import { Flex, Heading, Text, Box } from '@radix-ui/themes'

export const dynamic = 'force-dynamic'

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
          <Heading size="6" weight="bold">Regulation Library</Heading>
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
  // Use mv_corpus_facets which has domain-level doc counts
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

  // Get per-domain counts efficiently: one count query per top-level domain
  // For small number of domains (~10 L0), this is acceptable
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
        <Heading size="6" weight="bold">Regulation Library</Heading>
        <Text size="2" color="gray" as="p" mt="1">
          {totalEntities
            ? `${totalEntities.toLocaleString()} regulations, rules, and enforcement records`
            : 'Federal and Florida healthcare regulations'}
        </Text>
      </Box>

      {/* Practice type filter pills */}
      {(practiceTypes ?? []).length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/library"
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              !practiceTypeSlug
                ? 'bg-[var(--accent-9)] text-white border-[var(--accent-9)]'
                : 'bg-[var(--color-panel)] text-[var(--gray-11)] border-[var(--gray-6)] hover:border-[var(--accent-a6)] hover:text-[var(--gray-12)]'
            }`}
          >
            All
          </Link>
          {(practiceTypes ?? []).map((pt) => (
            <Link
              key={pt.id}
              href={`/library?practice_type=${pt.slug}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                practiceTypeSlug === pt.slug
                  ? 'bg-[var(--accent-9)] text-white border-[var(--accent-9)]'
                  : 'bg-[var(--color-panel)] text-[var(--gray-11)] border-[var(--gray-6)] hover:border-[var(--accent-a6)] hover:text-[var(--gray-12)]'
              }`}
            >
              {pt.display_name}
            </Link>
          ))}
        </div>
      )}

      {/* Domain card grid */}
      {(domains ?? []).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(domains ?? []).map((domain) => {
            const stats = domainStats[domain.id]
            const count = stats?.count ?? 0
            // When filtering by practice type, hide irrelevant domains
            if (relevantDomainSlugs && !relevantDomainSlugs.has(domain.slug)) return null
            return (
              <DomainCard
                key={domain.id}
                domain={domain}
                regulationCount={count}
                recentChangeCount={0}
                highestSeverity={null}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon="ri-book-2-line"
          title="No categories available"
          description="The regulation taxonomy has not been configured yet."
        />
      )}
    </Flex>
  )
}
