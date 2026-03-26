import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/db/client'
import { getLayoutData } from '@/lib/layout-data'
import { UpgradeBanner } from '@/components/UpgradeBanner'
import { LegalDisclaimer } from '@/components/LegalDisclaimer'
import { AuthorityBadge } from '@/components/AuthorityBadge'
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
      <div className="flex flex-col gap-6">
        <UpgradeBanner feature="Regulation Library" />
      </div>
    )
  }

  const { slug, id } = await params
  const supabase = createServerClient()

  const { data: entity } = await supabase
    .from('kg_entities')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!entity) return notFound()

  const { data: domain } = await supabase
    .from('kg_domains')
    .select('id, name, slug, parent_id')
    .eq('slug', slug)
    .maybeSingle()

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

  const [
    { data: classificationLog },
    { data: versions },
    { data: outgoingRels },
    { data: incomingRels },
    { data: serviceLineRows },
    { data: domainAssignments },
    { data: practiceRelevance },
  ] = await Promise.all([
    supabase.from('kg_classification_log').select('*').eq('entity_id', id).order('classified_at', { ascending: false }),
    supabase.from('kg_entity_versions').select('*').eq('entity_id', id).order('version_date', { ascending: false, nullsFirst: false }),
    supabase.from('kg_relationships').select('id, rel_type, relationship_type, confidence, effective_date, end_date, fr_citation, notes, target_entity_id').eq('source_entity_id', id),
    supabase.from('kg_relationships').select('id, rel_type, relationship_type, confidence, effective_date, end_date, fr_citation, notes, source_entity_id').eq('target_entity_id', id),
    supabase.from('kg_service_line_regulations').select('*, service_line:kg_service_lines(name, slug)').eq('entity_id', id),
    supabase.from('kg_entity_domains').select('*, domain:kg_domains(name, slug)').eq('entity_id', id),
    supabase.from('kg_entity_practice_relevance').select('*, practice_type:kg_practice_types(display_name, slug)').eq('entity_id', id),
  ])

  const outTargetIds = (outgoingRels ?? []).map((r) => r.target_entity_id)
  const inSourceIds = (incomingRels ?? []).map((r) => r.source_entity_id)
  const relEntityIds = [...new Set([...outTargetIds, ...inSourceIds])]

  let relEntities: Record<string, { id: string; name: string; entity_type: string; citation: string | null }> = {}
  if (relEntityIds.length > 0) {
    const { data: relEntityData } = await supabase.from('kg_entities').select('id, name, entity_type, citation').in('id', relEntityIds)
    for (const e of relEntityData ?? []) {
      relEntities[e.id] = e
    }
  }

  const outgoing = (outgoingRels ?? []).map((r) => ({
    ...r,
    target: relEntities[r.target_entity_id] ?? { id: r.target_entity_id, name: 'Unknown entity', entity_type: '', citation: null },
  }))

  const incoming = (incomingRels ?? []).map((r) => ({
    ...r,
    target: relEntities[r.source_entity_id] ?? { id: r.source_entity_id, name: 'Unknown entity', entity_type: '', citation: null },
    rel_type: r.rel_type,
  }))

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
            <span aria-current="page" className="font-medium truncate max-w-xs">{entity.name}</span>
          </li>
        </ol>
      </nav>

      {/* Back link */}
      <Link href={`/library/${slug}`} className="inline-flex items-center gap-1.5 text-sm hover:underline transition-colors">
        &larr; Back to {domain?.name ?? 'category'}
      </Link>

      {/* Badge row */}
      <div className="flex flex-wrap items-center gap-2">
        {entity.entity_type && (
          <span className="inline-flex px-2 py-0.5 text-xs rounded">{capitalize(entity.entity_type.replace(/_/g, ' '))}</span>
        )}
        {entity.document_type && (
          <span className="inline-flex px-2 py-0.5 text-xs rounded border">{entity.document_type.replace(/_/g, ' ')}</span>
        )}
        <span className="inline-flex px-2 py-0.5 text-xs rounded border">{entity.jurisdiction}</span>
        <AuthorityBadge level={entity.authority_level} />
        {entity.status && (
          <span className="inline-flex px-2 py-0.5 text-xs rounded border">{capitalize(entity.status)}</span>
        )}
      </div>

      {/* Entity name */}
      <h1 className="text-2xl font-bold">{entity.name}</h1>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-4">
        {entity.citation && (
          <span className="text-sm flex items-center gap-1">
            {entity.citation}
          </span>
        )}
        {entity.effective_date && (
          <span className="text-sm flex items-center gap-1">
            Effective:{' '}
            <time dateTime={entity.effective_date}>
              {new Date(entity.effective_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
            </time>
          </span>
        )}
        {entity.publication_date && (
          <span className="text-sm flex items-center gap-1">
            Published:{' '}
            <time dateTime={entity.publication_date}>
              {new Date(entity.publication_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
            </time>
          </span>
        )}
      </div>

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
    </div>
  )
}
