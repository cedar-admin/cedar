import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/db/client'
import { getLayoutData } from '@/lib/layout-data'
import { UpgradeBanner } from '@/components/UpgradeBanner'
import { RegulationRow } from '@/components/RegulationRow'
import { EmptyState } from '@/components/EmptyState'
import { Badge, Button, TextField, Flex, Box, Heading, Text, Link as RadixLink } from '@radix-ui/themes'

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
      <Flex direction="column" gap="6">
        <UpgradeBanner feature="Regulation Library" />
      </Flex>
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
    <Flex direction="column" gap="6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-[var(--cedar-text-secondary)]">
          {breadcrumbs.map((crumb, i) => (
            <li key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && <i className="ri-arrow-right-s-line text-xs" aria-hidden="true" />}
              <Link href={crumb.href} className="hover:text-[var(--cedar-text-primary)] transition-colors">
                {crumb.label}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <i className="ri-arrow-right-s-line text-xs" aria-hidden="true" />
            <span aria-current="page" className="text-[var(--cedar-text-primary)] font-medium truncate">{domain.name}</span>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <Box>
        <Heading as="h1" size="6" weight="bold">{domain.name}</Heading>
        {domain.description && (
          <Text size="2" color="gray" as="p" mt="1">{domain.description}</Text>
        )}
        <Text size="1" color="gray" as="p" mt="2">
          {totalCount.toLocaleString()} regulation{totalCount !== 1 ? 's' : ''}
        </Text>
      </Box>

      {/* Sub-domains navigation (if this domain has children) */}
      {(subDomains ?? []).length > 0 && (
        <Flex wrap="wrap" gap="2">
          {(subDomains ?? []).map((sub) => (
            <Link key={sub.id} href={`/library/${sub.slug}`}>
              <Badge variant="outline" color="gray" className="text-xs cursor-pointer">
                {sub.name}
              </Badge>
            </Link>
          ))}
        </Flex>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="flex-1" action={`/library/${slug}`}>
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cedar-text-secondary)]" style={{ zIndex: 1 }} aria-hidden="true" />
            <label htmlFor="regulation-search" className="sr-only">Search regulations</label>
            <TextField.Root
              id="regulation-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search regulations..."
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
          {typeFilter && <input type="hidden" name="type" value={typeFilter} />}
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          {sort !== 'date' && <input type="hidden" name="sort" value={sort} />}
        </form>
        <Flex gap="2">
          <Link href={buildUrl({ sort: sort === 'name' ? 'date' : 'name', page: '1' })}>
            <Button variant="soft" color="gray" highContrast size="1" className="text-xs gap-1">
              <i className={sort === 'name' ? 'ri-sort-alpha-asc' : 'ri-sort-number-desc'} aria-hidden="true" />
              {sort === 'name' ? 'A-Z' : 'Newest'}
            </Button>
          </Link>
        </Flex>
      </div>

      {/* Active filter indicators */}
      {(q || typeFilter || statusFilter) && (
        <Flex align="center" gap="2">
          <Text size="1" color="gray">{totalCount} results</Text>
          {q && (
            <Badge variant="soft" color="gray" size="1">
              &quot;{q}&quot;
              <Link href={buildUrl({ q: '', page: '1' })} className="ml-1">
                <i className="ri-close-line" aria-hidden="true" />
              </Link>
            </Badge>
          )}
          <RadixLink
            href={`/library/${slug}`}
            color="gray"
            highContrast
            underline="always"
            asChild
          >
            <Link href={`/library/${slug}`}>Clear all</Link>
          </RadixLink>
        </Flex>
      )}

      {/* Entity list */}
      {(entities ?? []).length > 0 ? (
        <div className="divide-y divide-[var(--cedar-border)] border border-[var(--cedar-border)] rounded-md overflow-hidden">
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
        <Flex align="center" justify="between">
          <Text size="1" color="gray">
            Showing {from + 1}–{Math.min(from + PAGE_SIZE, totalCount)} of{' '}
            {totalCount.toLocaleString()}
          </Text>
          <Flex gap="2">
            {safePage > 1 && (
              <Link href={buildUrl({ page: String(safePage - 1) })}>
                <Button variant="soft" color="gray" highContrast size="1">
                  Previous
                </Button>
              </Link>
            )}
            {safePage < totalPages && (
              <Link href={buildUrl({ page: String(safePage + 1) })}>
                <Button variant="soft" color="gray" highContrast size="1">
                  Next
                </Button>
              </Link>
            )}
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}
