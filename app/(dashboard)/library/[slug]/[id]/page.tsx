import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/db/client'
import { getLayoutData } from '@/lib/layout-data'
import { UpgradeBanner } from '@/components/UpgradeBanner'
import { LegalDisclaimer } from '@/components/LegalDisclaimer'
import { AuthorityBadge } from '@/components/AuthorityBadge'
import { Badge, Flex, Box, Heading, Text } from '@radix-ui/themes'
import { capitalize } from '@/lib/format'
import { RegulationTabs } from './RegulationTabs'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string; id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = createServerClient()
  const { data } = await supabase.from('kg_entities').select('name').eq('id', id).maybeSingle()
  return { title: data ? `${data.name} — Cedar` : 'Regulation — Cedar' }
}

export default async function RegulationDetailPage({ params }: Props) {
  const { role } = await getLayoutData()
  const isGated = role === 'monitor'

  if (isGated) {
    return (
      <Flex direction="column" gap="6">
        <UpgradeBanner feature="Regulation Library" />
      </Flex>
    )
  }

  const { slug, id } = await params
  const supabase = createServerClient()

  // Fetch entity
  const { data: entity } = await supabase
    .from('kg_entities')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!entity) return notFound()

  // Resolve domain for breadcrumb
  const { data: domain } = await supabase
    .from('kg_domains')
    .select('id, name, slug, parent_id')
    .eq('slug', slug)
    .maybeSingle()

  // Build breadcrumb
  const breadcrumbs: { label: string; href: string }[] = [
    { label: 'Library', href: '/library' },
  ]
  if (domain) {
    if (domain.parent_id) {
      const { data: parent } = await supabase
        .from('kg_domains')
        .select('name, slug')
        .eq('id', domain.parent_id)
        .maybeSingle()
      if (parent) {
        breadcrumbs.push({ label: parent.name, href: `/library/${parent.slug}` })
      }
    }
    breadcrumbs.push({ label: domain.name, href: `/library/${domain.slug}` })
  }

  // Fetch all tab data in parallel
  const [
    { data: classificationLog },
    { data: versions },
    { data: outgoingRels },
    { data: incomingRels },
    { data: serviceLineRows },
    { data: domainAssignments },
    { data: practiceRelevance },
  ] = await Promise.all([
    supabase
      .from('kg_classification_log')
      .select('*')
      .eq('entity_id', id)
      .order('classified_at', { ascending: false }),
    supabase
      .from('kg_entity_versions')
      .select('*')
      .eq('entity_id', id)
      .order('version_date', { ascending: false, nullsFirst: false }),
    supabase
      .from('kg_relationships')
      .select('id, rel_type, relationship_type, confidence, effective_date, end_date, fr_citation, notes, target_entity_id')
      .eq('source_entity_id', id),
    supabase
      .from('kg_relationships')
      .select('id, rel_type, relationship_type, confidence, effective_date, end_date, fr_citation, notes, source_entity_id')
      .eq('target_entity_id', id),
    supabase
      .from('kg_service_line_regulations')
      .select('*, service_line:kg_service_lines(name, slug)')
      .eq('entity_id', id),
    supabase
      .from('kg_entity_domains')
      .select('*, domain:kg_domains(name, slug)')
      .eq('entity_id', id),
    supabase
      .from('kg_entity_practice_relevance')
      .select('*, practice_type:kg_practice_types(display_name, slug)')
      .eq('entity_id', id),
  ])

  // Resolve target/source entity names for relationships
  const outTargetIds = (outgoingRels ?? []).map((r) => r.target_entity_id)
  const inSourceIds = (incomingRels ?? []).map((r) => r.source_entity_id)
  const relEntityIds = [...new Set([...outTargetIds, ...inSourceIds])]

  let relEntities: Record<string, { id: string; name: string; entity_type: string; citation: string | null }> = {}
  if (relEntityIds.length > 0) {
    const { data: relEntityData } = await supabase
      .from('kg_entities')
      .select('id, name, entity_type, citation')
      .in('id', relEntityIds)
    for (const e of relEntityData ?? []) {
      relEntities[e.id] = e
    }
  }

  const outgoing = (outgoingRels ?? []).map((r) => ({
    ...r,
    target: relEntities[r.target_entity_id] ?? {
      id: r.target_entity_id,
      name: 'Unknown entity',
      entity_type: '',
      citation: null,
    },
  }))

  const incoming = (incomingRels ?? []).map((r) => ({
    ...r,
    target: relEntities[r.source_entity_id] ?? {
      id: r.source_entity_id,
      name: 'Unknown entity',
      entity_type: '',
      citation: null,
    },
    rel_type: r.rel_type,
  }))

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
            <span aria-current="page" className="text-[var(--cedar-text-primary)] font-medium truncate max-w-xs">{entity.name}</span>
          </li>
        </ol>
      </nav>

      {/* Back link */}
      <Link
        href={`/library/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--cedar-text-secondary)] hover:text-[var(--cedar-text-primary)] transition-colors"
      >
        <i className="ri-arrow-left-line" aria-hidden="true" />
        Back to {domain?.name ?? 'category'}
      </Link>

      {/* Badge row */}
      <Flex wrap="wrap" align="center" gap="2">
        {entity.entity_type && (
          <Badge variant="soft" color="gray">{capitalize(entity.entity_type.replace(/_/g, ' '))}</Badge>
        )}
        {entity.document_type && (
          <Badge variant="outline" color="gray">{entity.document_type.replace(/_/g, ' ')}</Badge>
        )}
        <Badge variant="outline" color="gray">{entity.jurisdiction}</Badge>
        <AuthorityBadge level={entity.authority_level} />
        {entity.status && (
          <Badge variant="outline" color="gray">{capitalize(entity.status)}</Badge>
        )}
      </Flex>

      {/* Entity name */}
      <Heading size="6" weight="bold" as="h1">{entity.name}</Heading>

      {/* Metadata row */}
      <Flex wrap="wrap" align="center" gap="4">
        {entity.citation && (
          <Text size="2" color="gray" className="flex items-center gap-1">
            <i className="ri-file-text-line" aria-hidden="true" />
            {entity.citation}
          </Text>
        )}
        {entity.effective_date && (
          <Text size="2" color="gray" className="flex items-center gap-1">
            <i className="ri-calendar-check-line" aria-hidden="true" />
            Effective:{' '}
            <time dateTime={entity.effective_date}>
              {new Date(entity.effective_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
            </time>
          </Text>
        )}
        {entity.publication_date && (
          <Text size="2" color="gray" className="flex items-center gap-1">
            <i className="ri-calendar-line" aria-hidden="true" />
            Published:{' '}
            <time dateTime={entity.publication_date}>
              {new Date(entity.publication_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
            </time>
          </Text>
        )}
      </Flex>

      {/* Tabs */}
      <RegulationTabs
        entity={entity}
        classificationLog={classificationLog ?? []}
        versions={versions ?? []}
        outgoingRelationships={outgoing}
        incomingRelationships={incoming}
        serviceLines={serviceLineRows ?? []}
        domains={domainAssignments ?? []}
        practiceRelevance={practiceRelevance ?? []}
        domainSlug={slug}
      />

      <LegalDisclaimer />
    </Flex>
  )
}
