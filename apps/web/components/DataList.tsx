import Link from 'next/link'
import { SeverityBadge } from '@/components/SeverityBadge'
import { timeAgo } from '@/lib/format'

export interface DataListItem {
  id: string
  href: string
  severity: string | null
  title: string
  subtitle?: string | null
  timestamp: string | null
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
  emptyIcon = '',
  emptyTitle = 'No items',
  emptyDescription = 'Nothing to display yet.',
}: DataListProps) {
  if (items.length === 0) {
    return (
      <div className="border rounded">
        <div className="flex flex-col items-center justify-center py-9 text-center">
          <span className="text-4xl mb-3" aria-hidden="true" />
          <span className="text-base font-medium mb-1">{emptyTitle}</span>
          <span className="text-sm max-w-sm">{emptyDescription}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded">
      <div className="p-0">
        <div className="divide-y">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <SeverityBadge severity={item.severity} />
              <div className="flex-1 min-w-0">
                <span className="text-sm line-clamp-1">
                  {item.title || <span className="italic">No summary available</span>}
                </span>
                {item.subtitle && (
                  <span className="text-xs mt-0.5">{item.subtitle}</span>
                )}
              </div>
              {item.timestamp && (
                <span className="text-xs shrink-0">
                  {timeAgo(item.timestamp)}
                </span>
              )}
              {item.trailing}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
