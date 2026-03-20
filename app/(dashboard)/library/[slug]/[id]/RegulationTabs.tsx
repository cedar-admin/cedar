'use client'

import { useState } from 'react'
import { Button, Card, Box, Flex, Text, Badge } from '@radix-ui/themes'
import { ContentReader } from '@/components/ContentReader'
import { RelationshipCard } from '@/components/RelationshipCard'
import { ConfidenceBadge } from '@/components/ConfidenceBadge'
import { AuthorityBadge } from '@/components/AuthorityBadge'
import { ServiceLineTag } from '@/components/ServiceLineTag'
import { EmptyState } from '@/components/EmptyState'
import { capitalize, formatDate } from '@/lib/format'
import { RELATIONSHIP_TYPE_LABEL } from '@/lib/ui-constants'
import type { Json } from '@/lib/db/types'

const TABS = ['Overview', 'Reader', 'Timeline', 'Related'] as const
type Tab = (typeof TABS)[number]

interface Entity {
  id: string
  name: string
  description: string | null
  entity_type: string
  document_type: string | null
  jurisdiction: string
  status: string | null
  citation: string | null
  authority_level: string | null
  issuing_agency: string | null
  publication_date: string | null
  effective_date: string | null
  comment_close_date: string | null
  classification_confidence: number | null
  external_url: string | null
}

interface ClassificationEntry {
  id: string
  entity_id: string
  domain_id: string | null
  stage: string | null
  confidence: number | null
  classified_at: string
  classified_by: string | null
  needs_review: boolean | null
  review_reason: string | null
  run_id: string | null
  rule_id: string | null
}

interface Version {
  id: string
  entity_id: string
  version_number: number
  version_date: string | null
  content_snapshot: string | null
  content_hash: string | null
  change_summary: string | null
  fr_document_number: string | null
  snapshot: Json
  created_at: string
}

interface Relationship {
  id: string
  rel_type: string | null
  relationship_type: string
  confidence: number | null
  effective_date: string | null
  end_date: string | null
  fr_citation: string | null
  notes: string | null
  target: {
    id: string
    name: string
    entity_type: string
    citation: string | null
  }
}

interface ServiceLine {
  service_line: { name: string; slug: string } | null
  relevance_score: number | null
  regulation_role: string | null
}

interface DomainAssignment {
  domain: { name: string; slug: string } | null
  confidence: number | null
  is_primary: boolean | null
  relevance_score: number | null
}

interface PracticeRelevance {
  practice_type: { display_name: string; slug: string } | null
  relevance_score: number | null
}

interface RegulationTabsProps {
  entity: Entity
  classificationLog: ClassificationEntry[]
  versions: Version[]
  outgoingRelationships: Relationship[]
  incomingRelationships: Relationship[]
  serviceLines: ServiceLine[]
  domains: DomainAssignment[]
  practiceRelevance: PracticeRelevance[]
  domainSlug: string
}

export function RegulationTabs({
  entity,
  classificationLog,
  versions,
  outgoingRelationships,
  incomingRelationships,
  serviceLines,
  domains,
  practiceRelevance,
  domainSlug,
}: RegulationTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-[var(--gray-6)] mb-6">
        {TABS.map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 h-auto rounded-none text-sm font-medium border-b-2 -mb-px transition-interactive ${
              activeTab === tab
                ? 'border-[var(--accent-9)] text-[var(--gray-12)] hover:bg-transparent'
                : 'border-transparent text-[var(--gray-11)] hover:text-[var(--gray-12)] hover:bg-transparent'
            }`}
          >
            {tab}
            {tab === 'Related' && (outgoingRelationships.length + incomingRelationships.length) > 0 && (
              <Badge variant="soft" className="ml-1.5 text-xs px-1.5 py-0">
                {outgoingRelationships.length + incomingRelationships.length}
              </Badge>
            )}
            {tab === 'Timeline' && versions.length > 0 && (
              <Badge variant="soft" className="ml-1.5 text-xs px-1.5 py-0">
                {versions.length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Overview' && (
        <OverviewTab
          entity={entity}
          classificationLog={classificationLog}
          serviceLines={serviceLines}
          domains={domains}
          practiceRelevance={practiceRelevance}
        />
      )}
      {activeTab === 'Reader' && (
        <ReaderTab entity={entity} versions={versions} />
      )}
      {activeTab === 'Timeline' && (
        <TimelineTab versions={versions} classificationLog={classificationLog} />
      )}
      {activeTab === 'Related' && (
        <RelatedTab
          outgoing={outgoingRelationships}
          incoming={incomingRelationships}
          domainSlug={domainSlug}
        />
      )}
    </div>
  )
}

/* ── Overview Tab ────────────────────────────────────────── */

function OverviewTab({
  entity,
  classificationLog,
  serviceLines,
  domains,
  practiceRelevance,
}: {
  entity: Entity
  classificationLog: ClassificationEntry[]
  serviceLines: ServiceLine[]
  domains: DomainAssignment[]
  practiceRelevance: PracticeRelevance[]
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Summary */}
        <Card>
          <Box px="4" pt="4" pb="3">
            <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
              Summary
            </Text>
          </Box>
          <Box p="4" pt="0">
            {entity.description ? (
              <Text size="2" as="p" className="leading-relaxed whitespace-pre-wrap">
                {entity.description}
              </Text>
            ) : (
              <Text size="2" color="gray" as="p">No summary available.</Text>
            )}
          </Box>
        </Card>

        {/* Classification audit trail */}
        {classificationLog.length > 0 && (
          <Card>
            <Box px="4" pt="4" pb="3">
              <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                Classification Audit Trail
              </Text>
            </Box>
            <Box p="4" pt="0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--gray-6)] text-left">
                      <th className="pb-2 pr-4 font-medium text-[var(--gray-11)]">Date</th>
                      <th className="pb-2 pr-4 font-medium text-[var(--gray-11)]">Stage</th>
                      <th className="pb-2 pr-4 font-medium text-[var(--gray-11)]">Confidence</th>
                      <th className="pb-2 pr-4 font-medium text-[var(--gray-11)]">Classified By</th>
                      <th className="pb-2 font-medium text-[var(--gray-11)]">Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--gray-6)]">
                    {classificationLog.map((entry) => (
                      <tr key={entry.id}>
                        <td className="py-2 pr-4 text-xs text-[var(--gray-11)]">
                          {formatDate(entry.classified_at)}
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant="outline" className="text-xs">
                            {entry.stage ?? 'unknown'}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4">
                          <ConfidenceBadge confidence={entry.confidence} />
                        </td>
                        <td className="py-2 pr-4 text-xs text-[var(--gray-11)]">
                          {entry.classified_by ?? '—'}
                        </td>
                        <td className="py-2">
                          {entry.needs_review ? (
                            <Badge variant="outline" className="text-xs text-yellow-700 border-yellow-200 dark:text-yellow-400 dark:border-yellow-800">
                              Needs review
                            </Badge>
                          ) : (
                            <span className="text-xs text-[var(--gray-11)]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Box>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Key details */}
        <Card>
          <Box px="4" pt="4" pb="3">
            <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
              Key Details
            </Text>
          </Box>
          <Box p="4" pt="0">
            <Flex direction="column" gap="3">
              <DetailRow label="Authority" value={<AuthorityBadge level={entity.authority_level} />} />
              <DetailRow label="Jurisdiction" value={entity.jurisdiction} />
              {entity.issuing_agency && <DetailRow label="Agency" value={entity.issuing_agency} />}
              {entity.status && <DetailRow label="Status" value={capitalize(entity.status)} />}
              {entity.citation && <DetailRow label="Citation" value={entity.citation} />}
              {entity.effective_date && (
                <DetailRow
                  label="Effective"
                  value={new Date(entity.effective_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                />
              )}
              {entity.publication_date && (
                <DetailRow
                  label="Published"
                  value={new Date(entity.publication_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                />
              )}
              {entity.classification_confidence != null && (
                <DetailRow
                  label="Confidence"
                  value={<ConfidenceBadge confidence={entity.classification_confidence} />}
                />
              )}
            </Flex>
          </Box>
        </Card>

        {/* Domains */}
        {domains.length > 0 && (
          <Card>
            <Box px="4" pt="4" pb="3">
              <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                Categories
              </Text>
            </Box>
            <Box p="4" pt="0">
              <Flex wrap="wrap" gap="1">
                {domains.map((d, i) => (
                  <Badge key={i} variant={d.is_primary ? 'solid' : 'outline'} className="text-xs">
                    {d.domain?.name ?? 'Unknown'}
                  </Badge>
                ))}
              </Flex>
            </Box>
          </Card>
        )}

        {/* Practice types */}
        {practiceRelevance.length > 0 && (
          <Card>
            <Box px="4" pt="4" pb="3">
              <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                Relevant Practice Types
              </Text>
            </Box>
            <Box p="4" pt="0">
              <Flex direction="column" gap="1">
                {practiceRelevance.map((pr, i) => (
                  <Flex key={i} align="center" justify="between">
                    <Text size="1">{pr.practice_type?.display_name ?? 'Unknown'}</Text>
                    {pr.relevance_score != null && (
                      <Text size="1" color="gray">{Math.round(pr.relevance_score * 100)}%</Text>
                    )}
                  </Flex>
                ))}
              </Flex>
            </Box>
          </Card>
        )}

        {/* Service lines */}
        {serviceLines.length > 0 && (
          <Card>
            <Box px="4" pt="4" pb="3">
              <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                Service Lines
              </Text>
            </Box>
            <Box p="4" pt="0">
              <Flex wrap="wrap" gap="1">
                {serviceLines.map((sl, i) => (
                  <ServiceLineTag key={i} name={sl.service_line?.name ?? 'Unknown'} />
                ))}
              </Flex>
            </Box>
          </Card>
        )}

        {/* Source link */}
        {entity.external_url && (
          <Card>
            <Box px="4" pt="4" pb="3">
              <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                Original Source
              </Text>
            </Box>
            <Box p="4" pt="0">
              <a
                href={entity.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[var(--accent-9)] hover:underline"
              >
                <i className="ri-external-link-line" />
                View on .gov
              </a>
            </Box>
          </Card>
        )}
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Flex align="center" justify="between">
      <Text size="2" color="gray">{label}</Text>
      <Text size="2" weight="medium" className="text-right">{value ?? '—'}</Text>
    </Flex>
  )
}

/* ── Reader Tab ──────────────────────────────────────────── */

function ReaderTab({
  entity,
  versions,
}: {
  entity: Entity
  versions: Version[]
}) {
  const latestContent = versions.find((v) => v.content_snapshot)?.content_snapshot ?? null

  if (!latestContent && entity.external_url) {
    return (
      <Flex direction="column" align="center" justify="center" py="9" className="text-center space-y-4">
        <i className="ri-file-text-line text-3xl text-[var(--gray-a6)]" />
        <Text size="2" color="gray">
          No content snapshot available for this regulation.
        </Text>
        <a
          href={entity.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--accent-9)] hover:underline"
        >
          <i className="ri-external-link-line" />
          View original source
        </a>
      </Flex>
    )
  }

  return <ContentReader content={latestContent} title={entity.name} />
}

/* ── Timeline Tab ────────────────────────────────────────── */

function TimelineTab({
  versions,
  classificationLog,
}: {
  versions: Version[]
  classificationLog: ClassificationEntry[]
}) {
  // Merge versions and classification events into a single timeline
  type TimelineEvent = {
    date: string
    type: 'version' | 'classification'
    version?: Version
    classification?: ClassificationEntry
  }

  const events: TimelineEvent[] = [
    ...versions.map((v) => ({
      date: v.version_date ?? v.created_at,
      type: 'version' as const,
      version: v,
    })),
    ...classificationLog.map((c) => ({
      date: c.classified_at,
      type: 'classification' as const,
      classification: c,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (events.length === 0) {
    return (
      <EmptyState
        icon="ri-time-line"
        title="No history"
        description="No version history or classification events recorded yet."
      />
    )
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-2 top-2 bottom-2 w-px bg-[var(--gray-6)]" />

      <Flex direction="column" gap="6">
        {events.map((event, i) => (
          <div key={i} className="relative">
            {/* Dot */}
            <div
              className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-[var(--color-background)] ${
                event.type === 'version' ? 'bg-[var(--accent-9)]' : 'bg-[var(--gray-a6)]'
              }`}
            />

            <Flex direction="column" gap="1">
              <Text size="1" color="gray">
                {formatDate(event.date)}
              </Text>

              {event.type === 'version' && event.version && (
                <Box>
                  <Text size="2" weight="medium" as="p">
                    Version {event.version.version_number}
                  </Text>
                  {event.version.change_summary && (
                    <Text size="2" color="gray" as="p" mt="1">
                      {event.version.change_summary}
                    </Text>
                  )}
                  {event.version.fr_document_number && (
                    <Text size="1" color="gray" as="p" mt="1">
                      FR Doc: {event.version.fr_document_number}
                    </Text>
                  )}
                </Box>
              )}

              {event.type === 'classification' && event.classification && (
                <Flex align="center" gap="2">
                  <Badge variant="outline" className="text-xs">
                    {event.classification.stage ?? 'classified'}
                  </Badge>
                  <ConfidenceBadge confidence={event.classification.confidence} />
                  <Text size="1" color="gray">
                    by {event.classification.classified_by ?? 'system'}
                  </Text>
                </Flex>
              )}
            </Flex>
          </div>
        ))}
      </Flex>
    </div>
  )
}

/* ── Related Tab ─────────────────────────────────────────── */

function RelatedTab({
  outgoing,
  incoming,
  domainSlug,
}: {
  outgoing: Relationship[]
  incoming: Relationship[]
  domainSlug: string
}) {
  if (outgoing.length === 0 && incoming.length === 0) {
    return (
      <EmptyState
        icon="ri-links-line"
        title="No relationships"
        description="No related regulations have been identified yet."
      />
    )
  }

  // Group by relationship type
  const groupByType = (rels: Relationship[]) => {
    const groups: Record<string, Relationship[]> = {}
    for (const rel of rels) {
      const key = rel.rel_type ?? rel.relationship_type ?? 'related_to'
      if (!groups[key]) groups[key] = []
      groups[key].push(rel)
    }
    return groups
  }

  const outGroups = groupByType(outgoing)
  const inGroups = groupByType(incoming)

  return (
    <Flex direction="column" gap="8">
      {outgoing.length > 0 && (
        <Flex direction="column" gap="4">
          <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
            Outgoing — This regulation affects
          </Text>
          {Object.entries(outGroups).map(([type, rels]) => (
            <Flex key={type} direction="column" gap="2">
              <Text size="2" weight="medium">
                {RELATIONSHIP_TYPE_LABEL[type] ?? type.replace(/_/g, ' ')} ({rels.length})
              </Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rels.map((rel) => (
                  <RelationshipCard key={rel.id} relationship={rel} domainSlug={domainSlug} />
                ))}
              </div>
            </Flex>
          ))}
        </Flex>
      )}

      {incoming.length > 0 && (
        <Flex direction="column" gap="4">
          <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
            Incoming — Affected by
          </Text>
          {Object.entries(inGroups).map(([type, rels]) => (
            <Flex key={type} direction="column" gap="2">
              <Text size="2" weight="medium">
                {RELATIONSHIP_TYPE_LABEL[type] ?? type.replace(/_/g, ' ')} ({rels.length})
              </Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rels.map((rel) => (
                  <RelationshipCard key={rel.id} relationship={rel} domainSlug={domainSlug} />
                ))}
              </div>
            </Flex>
          ))}
        </Flex>
      )}
    </Flex>
  )
}
