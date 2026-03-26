import Link from 'next/link'
import { ConfidenceBadge } from '@/components/ConfidenceBadge'
import { RELATIONSHIP_TYPE_LABEL } from '@/lib/ui-constants'

interface RelationshipCardProps {
  relationship: {
    rel_type: string | null
    confidence: number | null
    effective_date: string | null
    fr_citation: string | null
    target: {
      id: string
      name: string
      entity_type: string | null
      citation: string | null
    }
  }
  domainSlug?: string
}

export function RelationshipCard({ relationship, domainSlug }: RelationshipCardProps) {
  const typeLabel = relationship.rel_type
    ? RELATIONSHIP_TYPE_LABEL[relationship.rel_type] ?? relationship.rel_type.replace(/_/g, ' ')
    : 'Related'

  const href = domainSlug
    ? `/library/${domainSlug}/${relationship.target.id}`
    : `/library/${relationship.target.id}`

  return (
    <Link href={href} className="block group">
      <div className="border rounded p-4 transition-all hover:shadow-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex px-2 py-0.5 text-xs rounded border shrink-0">
              {typeLabel}
            </span>
            <ConfidenceBadge confidence={relationship.confidence} />
          </div>
          <span className="text-sm font-medium group-hover:underline line-clamp-2">
            {relationship.target.name}
          </span>
          {relationship.target.citation && (
            <span className="text-xs">{relationship.target.citation}</span>
          )}
          {relationship.fr_citation && (
            <span className="text-xs">FR: {relationship.fr_citation}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
