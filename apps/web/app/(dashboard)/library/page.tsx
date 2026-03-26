import { createServerClient } from '@/lib/db/client'
import { getLayoutData } from '@/lib/layout-data'
import { UpgradeBanner } from '@/components/UpgradeBanner'
import { DomainCard } from '@/components/DomainCard'
import { EmptyState } from '@/components/EmptyState'
import { PracticeTypeSelect } from '@/components/PracticeTypeSelect'

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
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Regulation Library</h1>
          <p className="text-sm mt-1">
            Federal and Florida healthcare regulations
          </p>
        </div>
        <UpgradeBanner feature="Regulation Library" />
      </div>
    )
  }

  const supabase = createServerClient()

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

  const { data: allDomains } = await supabase
    .from('kg_domains')
    .select('id, name, slug, description, color, depth, parent_id, sort_order')
    .eq('is_active', true)
    .order('sort_order')

  const rootDomains = (allDomains ?? []).filter(
    (d) => d.depth === 0 && d.parent_id === null,
  )

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

  const allDomainIds = (allDomains ?? []).map((d) => d.id)
  const { data: entityDomainRows } = await supabase
    .from('kg_entity_domains')
    .select('domain_id, entity_id')
    .in('domain_id', allDomainIds)

  const rootEntitySets = new Map<string, Set<string>>()
  for (const row of entityDomainRows ?? []) {
    const rootId = domainToRoot.get(row.domain_id)
    if (!rootId) continue
    if (!rootEntitySets.has(rootId)) rootEntitySets.set(rootId, new Set())
    rootEntitySets.get(rootId)!.add(row.entity_id)
  }

  const { count: totalEntities } = await supabase
    .from('kg_entities')
    .select('id', { count: 'exact', head: true })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Regulation Library</h1>
        <p className="text-sm mt-1">
          {totalEntities
            ? `${totalEntities.toLocaleString()} regulations, rules, and enforcement records`
            : 'Federal and Florida healthcare regulations'}
        </p>
      </div>

      {(practiceTypes ?? []).length > 0 && (
        <PracticeTypeSelect
          practiceTypes={practiceTypes ?? []}
          selected={practiceTypeSlug}
        />
      )}

      <section aria-labelledby="browse-heading">
        <h2 id="browse-heading" className="text-base font-bold mb-4">Browse by Category</h2>
        {rootDomains.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>
        ) : (
          <EmptyState
            icon=""
            title="No categories available"
            description="The regulation taxonomy has not been configured yet."
          />
        )}
      </section>
    </div>
  )
}
