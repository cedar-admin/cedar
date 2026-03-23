'use client'

import { useRouter } from 'next/navigation'
import { Table, Text } from '@radix-ui/themes'
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
    <Table.Row
      className="cursor-pointer hover:bg-[var(--cedar-interactive-hover)] transition-colors"
      onClick={() => router.push(href)}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') router.push(href) }}
    >
      <Table.Cell><SeverityBadge severity={change.severity} /></Table.Cell>
      <Table.Cell>
        <Text as="span" size="2" weight="medium">{change.sources?.name ?? 'Unknown Source'}</Text>
        <Text as="span" size="1" color="gray" className="block mt-0.5">{change.jurisdiction ?? 'FL'}</Text>
      </Table.Cell>
      <Table.Cell>
        <Link
          href={href}
          onClick={(e) => e.stopPropagation()}
        >
          <Text as="p" size="2" className="line-clamp-2 hover:underline">
            {change.summary ?? (
              <Text as="span" color="gray" className="italic">No summary available</Text>
            )}
          </Text>
        </Link>
      </Table.Cell>
      <Table.Cell>
        <time dateTime={new Date(change.detected_at).toISOString()} className="text-sm text-[var(--cedar-text-secondary)] whitespace-nowrap">
          {timeAgo(change.detected_at)}
        </time>
      </Table.Cell>
      <Table.Cell><StatusBadge status={change.review_status} /></Table.Cell>
      <Table.Cell className="w-8">
        <i className="ri-arrow-right-s-line text-[var(--cedar-text-secondary)]" aria-hidden="true" />
      </Table.Cell>
    </Table.Row>
  )
}
