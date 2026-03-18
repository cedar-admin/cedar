import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { SeverityBadge } from '@/components/SeverityBadge'
import { timeAgo } from '@/lib/format'

export interface DataListItem {
  id: string
  href: string
  severity: string | null
  title: string
  subtitle?: string | null
  timestamp: string | null
  /** Optional trailing element (badge, status, etc.) */
  trailing?: React.ReactNode
}

interface DataListProps {
  items: DataListItem[]
  emptyIcon?: string
  emptyTitle?: string
  emptyDescription?: string
}

export function DataList({
  items,
  emptyIcon = 'ri-leaf-line',
  emptyTitle = 'No items',
  emptyDescription = 'Nothing to display yet.',
}: DataListProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <i className={`${emptyIcon} text-4xl text-muted-foreground/40 mb-3`} />
          <h2 className="text-base font-semibold text-foreground mb-1">{emptyTitle}</h2>
          <p className="text-sm text-muted-foreground max-w-sm">{emptyDescription}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              <SeverityBadge severity={item.severity} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground line-clamp-1">
                  {item.title || <span className="text-muted-foreground italic">No summary available</span>}
                </p>
                {item.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
                )}
              </div>
              {item.timestamp && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {timeAgo(item.timestamp)}
                </span>
              )}
              {item.trailing}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
