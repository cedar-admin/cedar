import Link from 'next/link'
import { AuthorityBadge } from '@/components/AuthorityBadge'
import { ConfidenceBadge } from '@/components/ConfidenceBadge'
import { DeadlineChip } from '@/components/DeadlineChip'
import { ServiceLineTag } from '@/components/ServiceLineTag'
import { capitalize } from '@/lib/format'
import { cn } from '@/lib/utils'

interface RegulationRowProps {
  entity: {
    id: string
    name: string
    citation: string | null
    entity_type: string | null
    document_type: string | null
    jurisdiction: string | null
    status: string | null
    authority_level: string | null
    publication_date: string | null
    effective_date: string | null
    comment_close_date: string | null
    classification_confidence: number | null
    description: string | null
  }
  domainSlug: string
  serviceTags?: string[]
  className?: string
}

export function RegulationRow({ entity, domainSlug, serviceTags, className }: RegulationRowProps) {
  return (
    <Link
      href={`/library/${domainSlug}/${entity.id}`}
      className={cn('block px-4 py-3 hover:bg-gray-50 transition-colors', className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="text-sm font-medium line-clamp-2">{entity.name}</span>
          {entity.citation && (
            <span className="text-xs">{entity.citation}</span>
          )}
          {entity.description && (
            <span className="text-xs line-clamp-2">{entity.description}</span>
          )}
          <div className="flex flex-wrap items-center gap-1 mt-1">
            {entity.entity_type && (
              <span className="inline-flex px-2 py-0.5 text-xs rounded">
                {capitalize(entity.entity_type.replace(/_/g, ' '))}
              </span>
            )}
            <AuthorityBadge level={entity.authority_level} />
            <ConfidenceBadge confidence={entity.classification_confidence} />
            <DeadlineChip date={entity.comment_close_date} label="Closes" />
            {serviceTags?.map((tag) => (
              <ServiceLineTag key={tag} name={tag} />
            ))}
          </div>
        </div>
        <div className="shrink-0 text-right">
          {entity.publication_date && (
            <span className="text-xs">
              <time>{new Date(entity.publication_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</time>
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
