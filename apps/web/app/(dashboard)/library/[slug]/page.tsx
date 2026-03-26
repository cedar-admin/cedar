import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/db/client'
import { getLayoutData } from '@/lib/layout-data'
import { UpgradeBanner } from '@/components/UpgradeBanner'
import { RegulationRow } from '@/components/RegulationRow'
import { EmptyState } from '@/components/EmptyState'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    page?: string
    q?: string
    sort?: string
    type?: string
    status?: string
  }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = createServerClient()
  const { data: domain } = await supabase.from('kg_domains').select('name').eq('slug', slug).maybeSingle()
  return { title: domain ? `${domain.name} — Cedar` : 'Regulation Library — Cedar' }
}

export default async function CategoryDetailPage({ params, searchParams }: Props) {
  const { role } = await getLayoutData()
  const isGated = role === 'monitor'

  if (isGated) {
    return (
      <div className="flex flex-col gap-6">
        <UpgradeBanner feature="Regulation Library" />
      </div>
    )
  }

  const { slug } = await params
  const {
    page: pageParam,
    q: qParam,
    sort: sortParam,
    type: typeParam,
    status: statusParam,
  } = await searchParams

  const supabase = createServerClient()

  const { data: domain } = await supabase
    .from('kg_domains')
    .select('id, name, slug, description, depth, parent_id, color')
    .eq('slug', slug)
    .maybeSingle()

  if (!domain) return notFound()

  const breadcrumbs: { label: string; href: string }[] = [
    { label: 'Library', href: '/library' },
  ]

  if (domain.parent_id) {
    const { data: parent } = await supabase
      .from('kg_domains')
      .select('name, slug, parent_id')
      .eq('id', domain.parent_id)
      .maybeSingle()

    if (parent?.parent_id) {
      const { data: grandparent } = await supabase
        .from('kg_domains')
        .select('name, slug')
        .eq('id', parent.parent_id)
        .maybeSingle()
      if (grandparent) {
        breadcrumbs.push({ label: grandparent.name, href: `/library/${grandparent.slug}` })
      }
    }
    if (parent) {
      breadcrumbs.push({ label: parent.name, href: `/library/${parent.slug}` })
    }
  }

  const { data: childDomains } = await supabase
    .from('kg_domains')
    .select('id')
    .eq('parent_id', domain.id)

  const childIds = (childDomains ?? []).map((c) => c.id)
  let grandchildIds: string[] = []
  if (childIds.length > 0) {
    const { data: grandchildren } = await supabase
      .from('kg_domains')
      .select('id')
      .in('parent_id', childIds)
    grandchildIds = (grandchildren ?? []).map((g) => g.id)
  }

  const domainIds = [domain.id, ...childIds, ...grandchildIds]

  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const q = (qParam ?? '').trim().slice(0, 200)
  const sort = sortParam ?? 'date'
  const typeFilter = typeParam ?? ''
  const statusFilter = statusParam ?? ''

  const { data: entityDomainRows } = await supabase
    .from('kg_entity_domains')
    .select('entity_id')
    .in('domain_id', domainIds)

  const entityIds = [...new Set((entityDomainRows ?? []).map((r) => r.entity_id))]

  let countQuery = supabase
    .from('kg_entities')
    .select('id', { count: 'exact', head: true })
    .in('id', entityIds.length > 0 ? entityIds : ['00000000-0000-0000-0000-000000000000'])

  if (q) countQuery = countQuery.textSearch('search_vector', q, { type: 'websearch' })
  if (typeFilter) countQuery = countQuery.eq('entity_type', typeFilter)
  if (statusFilter) countQuery = countQuery.eq('status', statusFilter)

  const { count: total } = await countQuery
  const totalCount = total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const from = (safePage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const orderCol = sort === 'name' ? 'name' : 'publication_date'
  const ascending = sort === 'name'

  let dataQuery = supabase
    .from('kg_entities')
    .select(
      'id, name, description, entity_type, document_type, jurisdiction, status, citation, authority_level, publication_date, effective_date, comment_close_date, classification_confidence, external_url'
    )
    .in('id', entityIds.length > 0 ? entityIds : ['00000000-0000-0000-0000-000000000000'])
    .order(orderCol, { ascending, nullsFirst: false })
    .range(from, to)

  if (q) dataQuery = dataQuery.textSearch('search_vector', q, { type: 'websearch' })
  if (typeFilter) dataQuery = dataQuery.eq('entity_type', typeFilter)
  if (statusFilter) dataQuery = dataQuery.eq('status', statusFilter)

  const { data: entities } = await dataQuery

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams()
    const vals = { page: String(safePage), q, sort, type: typeFilter, status: statusFilter, ...overrides }
    for (const [k, v] of Object.entries(vals)) {
      if (v && v !== '1' && k !== 'page') params.set(k, v)
      if (k === 'page' && v !== '1') params.set(k, v)
    }
    const qs = params.toString()
    return `/library/${slug}${qs ? `?${qs}` : ''}`
  }

  const { data: subDomains } = await supabase
    .from('kg_domains')
    .select('id, name, slug, description')
    .eq('parent_id', domain.id)
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <li key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-xs" aria-hidden="true">&rsaquo;</span>}
              <Link href={crumb.href} className="hover:underline transition-colors">
                {crumb.label}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span className="text-xs" aria-hidden="true">&rsaquo;</span>
            <span aria-current="page" className="font-medium truncate">{domain.name}</span>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{domain.name}</h1>
        {domain.description && (
          <p className="text-sm mt-1">{domain.description}</p>
        )}
        <p className="text-xs mt-2">
          {totalCount.toLocaleString()} regulation{totalCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Sub-domains navigation */}
      {(subDomains ?? []).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(subDomains ?? []).map((sub) => (
            <Link key={sub.id} href={`/library/${sub.slug}`}>
              <span className="inline-flex px-2 py-0.5 text-xs rounded border cursor-pointer">
                {sub.name}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="flex-1" action={`/library/${slug}`}>
          <div className="relative">
            <label htmlFor="regulation-search" className="sr-only">Search regulations</label>
            <input
              id="regulation-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search regulations..."
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          {typeFilter && <input type="hidden" name="type" value={typeFilter} />}
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          {sort !== 'date' && <input type="hidden" name="sort" value={sort} />}
        </form>
        <div className="flex gap-2">
          <Link href={buildUrl({ sort: sort === 'name' ? 'date' : 'name', page: '1' })}>
            <button type="button" className="px-3 py-1 text-xs border rounded">
              {sort === 'name' ? 'A-Z' : 'Newest'}
            </button>
          </Link>
        </div>
      </div>

      {/* Active filter indicators */}
      {(q || typeFilter || statusFilter) && (
        <div className="flex items-center gap-2">
          <span className="text-xs">{totalCount} results</span>
          {q && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs rounded border">
              &quot;{q}&quot;
              <Link href={buildUrl({ q: '', page: '1' })} className="ml-1">
                x
              </Link>
            </span>
          )}
          <Link href={`/library/${slug}`} className="text-xs underline">
            Clear all
          </Link>
        </div>
      )}

      {/* Entity list */}
      {(entities ?? []).length > 0 ? (
        <div className="divide-y border rounded overflow-hidden">
          {(entities ?? []).map((entity) => (
            <RegulationRow
              key={entity.id}
              entity={entity}
              domainSlug={slug}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon=""
          title="No regulations found"
          description={q ? 'Try adjusting your search or filters.' : 'No entities have been classified into this category yet.'}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs">
            Showing {from + 1}–{Math.min(from + PAGE_SIZE, totalCount)} of{' '}
            {totalCount.toLocaleString()}
          </span>
          <div className="flex gap-2">
            {safePage > 1 && (
              <Link href={buildUrl({ page: String(safePage - 1) })}>
                <button type="button" className="px-3 py-1 text-sm border rounded">
                  Previous
                </button>
              </Link>
            )}
            {safePage < totalPages && (
              <Link href={buildUrl({ page: String(safePage + 1) })}>
                <button type="button" className="px-3 py-1 text-sm border rounded">
                  Next
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
