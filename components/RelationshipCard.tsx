import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
      <Card className="transition-interactive hover:shadow-md hover:border-primary/30">
        <CardContent className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs shrink-0">
              {typeLabel}
            </Badge>
            <ConfidenceBadge confidence={relationship.confidence} />
          </div>
          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {relationship.target.name}
          </p>
          {relationship.target.citation && (
            <p className="text-xs text-muted-foreground">{relationship.target.citation}</p>
          )}
          {relationship.fr_citation && (
            <p className="text-xs text-muted-foreground">FR: {relationship.fr_citation}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
