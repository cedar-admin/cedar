import Link from 'next/link'
import { AuthorityBadge } from '@/components/AuthorityBadge'
import { ConfidenceBadge } from '@/components/ConfidenceBadge'
import { DeadlineChip } from '@/components/DeadlineChip'
import { ServiceLineTag } from '@/components/ServiceLineTag'
import { Badge } from '@/components/ui/badge'
import { capitalize } from '@/lib/format'

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
      className={`block px-4 py-3 hover:bg-muted/30 transition-colors ${className ?? ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <h4 className="text-sm font-medium text-foreground line-clamp-2">{entity.name}</h4>
          {entity.citation && (
            <p className="text-xs text-muted-foreground">{entity.citation}</p>
          )}
          {entity.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{entity.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {entity.entity_type && (
              <Badge variant="secondary" className="text-xs">
                {capitalize(entity.entity_type.replace(/_/g, ' '))}
              </Badge>
            )}
            <AuthorityBadge level={entity.authority_level} />
            <ConfidenceBadge confidence={entity.classification_confidence} />
            <DeadlineChip date={entity.comment_close_date} label="Closes" />
            {serviceTags?.map((tag) => (
              <ServiceLineTag key={tag} name={tag} />
            ))}
          </div>
        </div>
        <div className="shrink-0 text-right text-xs text-muted-foreground">
          {entity.publication_date && (
            <time>{new Date(entity.publication_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</time>
          )}
        </div>
      </div>
    </Link>
  )
}
