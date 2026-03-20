import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { SeverityBadge } from '@/components/SeverityBadge'

interface DomainCardProps {
  domain: {
    name: string
    slug: string
    description: string | null
    color: string | null
  }
  regulationCount: number
  recentChangeCount: number
  highestSeverity: string | null
  className?: string
}

export function DomainCard({
  domain,
  regulationCount,
  recentChangeCount,
  highestSeverity,
  className,
}: DomainCardProps) {
  return (
    <Link href={`/library/${domain.slug}`} className={`block group ${className ?? ''}`}>
      <Card className="h-full transition-interactive hover:shadow-md hover:border-primary/30">
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {domain.name}
            </h3>
            {highestSeverity && <SeverityBadge severity={highestSeverity} />}
          </div>
          {domain.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{domain.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <i className="ri-file-list-3-line" />
              {regulationCount.toLocaleString()} regulations
            </span>
            {recentChangeCount > 0 && (
              <span className="flex items-center gap-1 text-primary">
                <i className="ri-refresh-line" />
                {recentChangeCount} recent
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
