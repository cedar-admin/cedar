'use client'

import { useState } from 'react'
import { ContentReader } from '@/components/ContentReader'
import { CedarTable } from '@/components/CedarTable'
import { RelationshipCard } from '@/components/RelationshipCard'
import { ConfidenceBadge } from '@/components/ConfidenceBadge'
import { AuthorityBadge } from '@/components/AuthorityBadge'
import { ServiceLineTag } from '@/components/ServiceLineTag'
import { EmptyState } from '@/components/EmptyState'
import { capitalize, formatDate } from '@/lib/format'
import { RELATIONSHIP_TYPE_LABEL } from '@/lib/ui-constants'
import type { Json } from '@/lib/db/types'

interface Entity {
  id: string; name: string; description: string | null; entity_type: string; document_type: string | null
  jurisdiction: string; status: string | null; citation: string | null; authority_level: string | null
  issuing_agency: string | null; publication_date: string | null; effective_date: string | null
  comment_close_date: string | null; classification_confidence: number | null; external_url: string | null
}
interface ClassificationEntry { id: string; entity_id: string; domain_id: string | null; stage: string | null; confidence: number | null; classified_at: string; classified_by: string | null; needs_review: boolean | null; review_reason: string | null; run_id: string | null; rule_id: string | null }
interface Version { id: string; entity_id: string; version_number: number; version_date: string | null; content_snapshot: string | null; content_hash: string | null; change_summary: string | null; fr_document_number: string | null; snapshot: Json; created_at: string }
interface Relationship { id: string; rel_type: string | null; relationship_type: string; confidence: number | null; effective_date: string | null; end_date: string | null; fr_citation: string | null; notes: string | null; target: { id: string; name: string; entity_type: string; citation: string | null } }
interface ServiceLine { service_line: { name: string; slug: string } | null; relevance_score: number | null; regulation_role: string | null }
interface DomainAssignment { domain: { name: string; slug: string } | null; confidence: number | null; is_primary: boolean | null; relevance_score: number | null }
interface PracticeRelevance { practice_type: { display_name: string; slug: string } | null; relevance_score: number | null }

interface RegulationTabsProps {
  entity: Entity; classificationLog: ClassificationEntry[]; versions: Version[]
  outgoingRelationships: Relationship[]; incomingRelationships: Relationship[]
  serviceLines: ServiceLine[]; domains: DomainAssignment[]; practiceRelevance: PracticeRelevance[]; domainSlug: string
}

export function RegulationTabs({ entity, classificationLog, versions, outgoingRelationships, incomingRelationships, serviceLines, domains, practiceRelevance, domainSlug }: RegulationTabsProps) {
  const [tab, setTab] = useState('overview')
  const relCount = outgoingRelationships.length + incomingRelationships.length
  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'reader', label: 'Reader' },
    { value: 'timeline', label: `Timeline${versions.length > 0 ? ` (${versions.length})` : ''}` },
    { value: 'related', label: `Related${relCount > 0 ? ` (${relCount})` : ''}` },
  ]

  return (
    <div>
      <div className="flex gap-4 border-b mb-4">
        {tabs.map((t) => (
          <button key={t.value} type="button" onClick={() => setTab(t.value)}
            className={`pb-2 text-sm font-medium border-b-2 -mb-px ${tab === t.value ? 'border-current' : 'border-transparent'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {tab === 'overview' && <OverviewTab entity={entity} classificationLog={classificationLog} serviceLines={serviceLines} domains={domains} practiceRelevance={practiceRelevance} />}
        {tab === 'reader' && <ReaderTab entity={entity} versions={versions} />}
        {tab === 'timeline' && <TimelineTab versions={versions} classificationLog={classificationLog} />}
        {tab === 'related' && <RelatedTab outgoing={outgoingRelationships} incoming={incomingRelationships} domainSlug={domainSlug} />}
      </div>
    </div>
  )
}

function OverviewTab({ entity, classificationLog, serviceLines, domains, practiceRelevance }: { entity: Entity; classificationLog: ClassificationEntry[]; serviceLines: ServiceLine[]; domains: DomainAssignment[]; practiceRelevance: PracticeRelevance[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="border rounded">
          <div className="px-4 pt-4 pb-3"><h2 className="text-sm font-bold">Summary</h2></div>
          <div className="p-4 pt-0">
            {entity.description ? <p className="text-sm leading-relaxed whitespace-pre-wrap">{entity.description}</p> : <p className="text-sm">No summary available.</p>}
          </div>
        </div>
        {classificationLog.length > 0 && (
          <div className="border rounded">
            <div className="px-4 pt-4 pb-3"><h2 className="text-sm font-bold">Classification Audit Trail</h2></div>
            <div className="p-4 pt-0">
              <CedarTable surface="nested">
                <thead><tr><th>Date</th><th>Stage</th><th>Confidence</th><th>Classified By</th><th>Review</th></tr></thead>
                <tbody>
                  {classificationLog.map((entry) => (
                    <tr key={entry.id}>
                      <td><time dateTime={new Date(entry.classified_at).toISOString()} className="text-xs">{formatDate(entry.classified_at)}</time></td>
                      <td><span className="inline-flex px-2 py-0.5 text-xs rounded border">{entry.stage ?? 'unknown'}</span></td>
                      <td><ConfidenceBadge confidence={entry.confidence} /></td>
                      <td><span className="text-xs">{entry.classified_by ?? '—'}</span></td>
                      <td>{entry.needs_review ? <span className="inline-flex px-2 py-0.5 text-xs rounded border">Needs review</span> : <span className="text-xs">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </CedarTable>
            </div>
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div className="border rounded">
          <div className="px-4 pt-4 pb-3"><h2 className="text-sm font-bold">Key Details</h2></div>
          <div className="p-4 pt-0">
            <div className="flex flex-col gap-3">
              <DetailRow label="Authority" value={<AuthorityBadge level={entity.authority_level} />} />
              <DetailRow label="Jurisdiction" value={entity.jurisdiction} />
              {entity.issuing_agency && <DetailRow label="Agency" value={entity.issuing_agency} />}
              {entity.status && <DetailRow label="Status" value={capitalize(entity.status)} />}
              {entity.citation && <DetailRow label="Citation" value={entity.citation} />}
              {entity.effective_date && <DetailRow label="Effective" value={<time dateTime={entity.effective_date}>{new Date(entity.effective_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</time>} />}
              {entity.publication_date && <DetailRow label="Published" value={<time dateTime={entity.publication_date}>{new Date(entity.publication_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</time>} />}
              {entity.classification_confidence != null && <DetailRow label="Confidence" value={<ConfidenceBadge confidence={entity.classification_confidence} />} />}
            </div>
          </div>
        </div>
        {domains.length > 0 && (
          <div className="border rounded">
            <div className="px-4 pt-4 pb-3"><h2 className="text-sm font-bold">Categories</h2></div>
            <div className="p-4 pt-0">
              <div className="flex flex-wrap gap-1">
                {domains.map((d, i) => <span key={i} className={`inline-flex px-2 py-0.5 text-xs rounded ${d.is_primary ? 'font-bold' : 'border'}`}>{d.domain?.name ?? 'Unknown'}</span>)}
              </div>
            </div>
          </div>
        )}
        {practiceRelevance.length > 0 && (
          <div className="border rounded">
            <div className="px-4 pt-4 pb-3"><h2 className="text-sm font-bold">Relevant Practice Types</h2></div>
            <div className="p-4 pt-0">
              <div className="flex flex-col gap-1">
                {practiceRelevance.map((pr, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs">{pr.practice_type?.display_name ?? 'Unknown'}</span>
                    {pr.relevance_score != null && <span className="text-xs">{Math.round(pr.relevance_score * 100)}%</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {serviceLines.length > 0 && (
          <div className="border rounded">
            <div className="px-4 pt-4 pb-3"><h2 className="text-sm font-bold">Service Lines</h2></div>
            <div className="p-4 pt-0">
              <div className="flex flex-wrap gap-1">{serviceLines.map((sl, i) => <ServiceLineTag key={i} name={sl.service_line?.name ?? 'Unknown'} />)}</div>
            </div>
          </div>
        )}
        {entity.external_url && (
          <div className="border rounded">
            <div className="px-4 pt-4 pb-3"><h2 className="text-sm font-bold">Original Source</h2></div>
            <div className="p-4 pt-0">
              <a href={entity.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm hover:underline">View on .gov</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (<div className="flex items-center justify-between"><span className="text-sm">{label}</span><span className="text-sm font-medium text-right">{value ?? '—'}</span></div>)
}

function ReaderTab({ entity, versions }: { entity: Entity; versions: Version[] }) {
  const latestContent = versions.find((v) => v.content_snapshot)?.content_snapshot ?? null
  if (!latestContent && entity.external_url) {
    return (
      <div className="flex flex-col items-center justify-center py-9 text-center space-y-4">
        <span className="text-3xl opacity-40" aria-hidden="true" />
        <span className="text-sm">No content snapshot available for this regulation.</span>
        <a href={entity.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm hover:underline">View original source</a>
      </div>
    )
  }
  return <ContentReader content={latestContent} title={entity.name} />
}

function TimelineTab({ versions, classificationLog }: { versions: Version[]; classificationLog: ClassificationEntry[] }) {
  type TimelineEvent = { date: string; type: 'version' | 'classification'; version?: Version; classification?: ClassificationEntry }
  const events: TimelineEvent[] = [
    ...versions.map((v) => ({ date: v.version_date ?? v.created_at, type: 'version' as const, version: v })),
    ...classificationLog.map((c) => ({ date: c.classified_at, type: 'classification' as const, classification: c })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (events.length === 0) return <EmptyState icon="" title="No history" description="No version history or classification events recorded yet." />

  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-300" />
      <div className="flex flex-col gap-6">
        {events.map((event, i) => (
          <div key={i} className="relative">
            <div className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-white ${event.type === 'version' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className="flex flex-col gap-1">
              <time dateTime={new Date(event.date).toISOString()}><span className="text-xs">{formatDate(event.date)}</span></time>
              {event.type === 'version' && event.version && (
                <div>
                  <p className="text-sm font-medium">Version {event.version.version_number}</p>
                  {event.version.change_summary && <p className="text-sm mt-1">{event.version.change_summary}</p>}
                  {event.version.fr_document_number && <p className="text-xs mt-1">FR Doc: {event.version.fr_document_number}</p>}
                </div>
              )}
              {event.type === 'classification' && event.classification && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex px-2 py-0.5 text-xs rounded border">{event.classification.stage ?? 'classified'}</span>
                  <ConfidenceBadge confidence={event.classification.confidence} />
                  <span className="text-xs">by {event.classification.classified_by ?? 'system'}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RelatedTab({ outgoing, incoming, domainSlug }: { outgoing: Relationship[]; incoming: Relationship[]; domainSlug: string }) {
  if (outgoing.length === 0 && incoming.length === 0) return <EmptyState icon="" title="No relationships" description="No related regulations have been identified yet." />
  const groupByType = (rels: Relationship[]) => {
    const groups: Record<string, Relationship[]> = {}
    for (const rel of rels) { const key = rel.rel_type ?? rel.relationship_type ?? 'related_to'; if (!groups[key]) groups[key] = []; groups[key].push(rel) }
    return groups
  }
  const outGroups = groupByType(outgoing)
  const inGroups = groupByType(incoming)

  return (
    <div className="flex flex-col gap-8">
      {outgoing.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold">Outgoing — This regulation affects</h2>
          {Object.entries(outGroups).map(([type, rels]) => (
            <div key={type} className="flex flex-col gap-2">
              <h3 className="text-sm font-bold">{RELATIONSHIP_TYPE_LABEL[type] ?? type.replace(/_/g, ' ')} ({rels.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{rels.map((rel) => <RelationshipCard key={rel.id} relationship={rel} domainSlug={domainSlug} />)}</div>
            </div>
          ))}
        </div>
      )}
      {incoming.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold">Incoming — Affected by</h2>
          {Object.entries(inGroups).map(([type, rels]) => (
            <div key={type} className="flex flex-col gap-2">
              <h3 className="text-sm font-bold">{RELATIONSHIP_TYPE_LABEL[type] ?? type.replace(/_/g, ' ')} ({rels.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{rels.map((rel) => <RelationshipCard key={rel.id} relationship={rel} domainSlug={domainSlug} />)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
