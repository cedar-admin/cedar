import Link from 'next/link'
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
  headingLevel?: 'h2' | 'h3' | 'h4'
  className?: string
}

export function DomainCard({
  domain,
  regulationCount,
  recentChangeCount,
  highestSeverity,
  headingLevel: Tag = 'h3',
}: DomainCardProps) {
  return (
    <div className="relative h-full border rounded p-4 transition-all hover:bg-gray-50">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <Tag className="text-base font-semibold">
            <Link
              href={`/library/${domain.slug}`}
              className="after:absolute after:inset-0 after:content-[''] hover:underline"
            >
              {domain.name}
            </Link>
          </Tag>
          {highestSeverity && (
            <SeverityBadge severity={highestSeverity} className="relative z-10" />
          )}
        </div>
        {domain.description && (
          <span className="text-sm line-clamp-2">
            {domain.description}
          </span>
        )}
        <div className="flex items-center gap-4">
          <span className="text-xs flex items-center gap-1">
            <span aria-hidden="true" />
            {regulationCount.toLocaleString()} regulations
          </span>
          {recentChangeCount > 0 && (
            <span className="text-xs flex items-center gap-1">
              <span aria-hidden="true" />
              {recentChangeCount} recent
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
