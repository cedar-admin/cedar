'use client'

import { useRouter } from 'next/navigation'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { timeAgo } from '@/lib/format'
import Link from 'next/link'

interface ChangeTableRowProps {
  change: {
    id: string
    severity: string | null
    summary: string | null
    jurisdiction: string | null
    detected_at: string
    review_status: string
    sources: { name: string } | null
  }
}

export function ChangeTableRow({ change }: ChangeTableRowProps) {
  const router = useRouter()
  const href = `/changes/${change.id}`

  return (
    <tr
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => router.push(href)}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') router.push(href) }}
    >
      <td><SeverityBadge severity={change.severity} /></td>
      <td>
        <span className="text-sm font-medium">{change.sources?.name ?? 'Unknown Source'}</span>
        <span className="text-xs block mt-0.5">{change.jurisdiction ?? 'FL'}</span>
      </td>
      <td>
        <Link href={href} onClick={(e) => e.stopPropagation()}>
          <p className="text-sm line-clamp-2 hover:underline">
            {change.summary ?? (
              <span className="italic">No summary available</span>
            )}
          </p>
        </Link>
      </td>
      <td>
        <time dateTime={new Date(change.detected_at).toISOString()} className="text-sm whitespace-nowrap">
          {timeAgo(change.detected_at)}
        </time>
      </td>
      <td><StatusBadge status={change.review_status} /></td>
      <td className="w-8">
        <span aria-hidden="true">&rarr;</span>
      </td>
    </tr>
  )
}
