import { createServerClient } from '@/lib/db/client'
import { getLayoutData } from '@/lib/layout-data'
import { UpgradeBanner } from '@/components/UpgradeBanner'
import { LibraryBrowser, type LibraryEntity, type LibraryFilters } from '@/components/LibraryBrowser'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50
const VALID_TYPES = ['regulation', 'proposed_rule', 'notice', 'enforcement_action']
const VALID_JURISDICTIONS = ['US', 'FL']

interface Props {
  searchParams: Promise<{ page?: string; type?: string; jurisdiction?: string; q?: string }>
}

export default async function LibraryPage({ searchParams }: Props) {
  const { role } = await getLayoutData()
  const isGated = role === 'monitor'

  const { page: pageParam, type: typeParam, jurisdiction: jurParam, q: qParam } = await searchParams

  const page    = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const type    = VALID_TYPES.includes(typeParam ?? '') ? typeParam! : ''
  const jurisdiction = VALID_JURISDICTIONS.includes(jurParam ?? '') ? jurParam! : ''
  const q       = (qParam ?? '').trim().slice(0, 100)

  const filters: LibraryFilters = { type, jurisdiction, q }

  let entities: LibraryEntity[] = []
  let total = 0
  let totalPages = 1
  let safePage = 1

  if (!isGated) {
    const supabase = createServerClient()

    // Count with filters
    let countQ = supabase
      .from('kg_entities')
      .select('id', { count: 'exact', head: true })
    if (type)         countQ = countQ.eq('entity_type', type)
    if (jurisdiction) countQ = countQ.eq('jurisdiction', jurisdiction)
    if (q)            countQ = countQ.ilike('name', `%${q}%`)

    const { count } = await countQ
    total      = count ?? 0
    totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    safePage   = Math.min(page, totalPages)

    const from = (safePage - 1) * PAGE_SIZE
    const to   = from + PAGE_SIZE - 1

    // Fetch page
    let dataQ = supabase
      .from('kg_entities')
      .select('id, name, description, entity_type, document_type, jurisdiction, status, citation, publication_date, external_url')
      .order('publication_date', { ascending: false, nullsFirst: false })
      .range(from, to)
    if (type)         dataQ = dataQ.eq('entity_type', type)
    if (jurisdiction) dataQ = dataQ.eq('jurisdiction', jurisdiction)
    if (q)            dataQ = dataQ.ilike('name', `%${q}%`)

    const { data } = await dataQ
    entities = (data ?? []) as LibraryEntity[]
  }

  const from = (safePage - 1) * PAGE_SIZE

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Regulation Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {!isGated && total > 0
            ? `${total.toLocaleString()} regulations, rules, and enforcement records`
            : 'Federal and Florida healthcare regulations'}
        </p>
      </div>

      {isGated && <UpgradeBanner feature="Regulation Library" />}

      <LibraryBrowser
        entities={entities}
        total={total}
        page={safePage}
        totalPages={totalPages}
        from={from}
        filters={filters}
        isGated={isGated}
      />
    </div>
  )
}
