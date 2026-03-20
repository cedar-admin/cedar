import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/db/client'
import { getLayoutData } from '@/lib/layout-data'
import { UpgradeBanner } from '@/components/UpgradeBanner'
import { RegulationRow } from '@/components/RegulationRow'
import { EmptyState } from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

export default async function CategoryDetailPage({ params, searchParams }: Props) {
  const { role } = await getLayoutData()
  const isGated = role === 'monitor'

  if (isGated) {
    return (
      <div className="space-y-6">
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

  // Resolve domain from slug
  const { data: domain } = await supabase
    .from('kg_domains')
    .select('id, name, slug, description, depth, parent_id, color')
    .eq('slug', slug)
    .maybeSingle()

  if (!domain) return notFound()

  // Build breadcrumb chain
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

  // Get child domain IDs (include entities from sub-categories)
  const { data: childDomains } = await supabase
    .from('kg_domains')
    .select('id')
    .eq('parent_id', domain.id)

  // Also get grandchild domains
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

  // Parse search/filter params
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const q = (qParam ?? '').trim().slice(0, 200)
  const sort = sortParam ?? 'date'
  const typeFilter = typeParam ?? ''
  const statusFilter = statusParam ?? ''

  // Get entity IDs in this domain tree
  const { data: entityDomainRows } = await supabase
    .from('kg_entity_domains')
    .select('entity_id')
    .in('domain_id', domainIds)

  const entityIds = [...new Set((entityDomainRows ?? []).map((r) => r.entity_id))]

  // Build entity query
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

  // Determine sort order
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

  // Build filter URL helper
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

  // Sub-domains for navigation
  const { data: subDomains } = await supabase
    .from('kg_domains')
    .select('id, name, slug, description')
    .eq('parent_id', domain.id)
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <i className="ri-arrow-right-s-line text-xs" />}
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          </span>
        ))}
        <i className="ri-arrow-right-s-line text-xs" />
        <span className="text-foreground font-medium truncate">{domain.name}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{domain.name}</h1>
        {domain.description && (
          <p className="text-sm text-muted-foreground mt-1">{domain.description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          {totalCount.toLocaleString()} regulation{totalCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Sub-domains navigation (if this domain has children) */}
      {(subDomains ?? []).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(subDomains ?? []).map((sub) => (
            <Link key={sub.id} href={`/library/${sub.slug}`}>
              <Badge
                variant="outline"
                className="text-xs hover:border-primary/50 hover:text-foreground transition-colors cursor-pointer"
              >
                {sub.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="flex-1" action={`/library/${slug}`}>
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Search regulations..."
              className="pl-9"
            />
          </div>
          {typeFilter && <input type="hidden" name="type" value={typeFilter} />}
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          {sort !== 'date' && <input type="hidden" name="sort" value={sort} />}
        </form>
        <div className="flex gap-2">
          <Link href={buildUrl({ sort: sort === 'name' ? 'date' : 'name', page: '1' })}>
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <i className={sort === 'name' ? 'ri-sort-alpha-asc' : 'ri-sort-number-desc'} />
              {sort === 'name' ? 'A-Z' : 'Newest'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Active filter indicators */}
      {(q || typeFilter || statusFilter) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{totalCount} results</span>
          {q && (
            <Badge variant="secondary" className="text-xs gap-1">
              &quot;{q}&quot;
              <Link href={buildUrl({ q: '', page: '1' })} className="hover:text-foreground">
                <i className="ri-close-line" />
              </Link>
            </Badge>
          )}
          <Link
            href={`/library/${slug}`}
            className="text-xs text-primary hover:underline"
          >
            Clear all
          </Link>
        </div>
      )}

      {/* Entity list */}
      {(entities ?? []).length > 0 ? (
        <div className="divide-y divide-border border border-border rounded-md overflow-hidden">
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
          icon="ri-file-search-line"
          title="No regulations found"
          description={q ? 'Try adjusting your search or filters.' : 'No entities have been classified into this category yet.'}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {from + 1}–{Math.min(from + PAGE_SIZE, totalCount)} of{' '}
            {totalCount.toLocaleString()}
          </p>
          <div className="flex gap-2">
            {safePage > 1 && (
              <Link href={buildUrl({ page: String(safePage - 1) })}>
                <Button variant="outline" size="sm">
                  Previous
                </Button>
              </Link>
            )}
            {safePage < totalPages && (
              <Link href={buildUrl({ page: String(safePage + 1) })}>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
