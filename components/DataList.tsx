import Link from 'next/link'
import { Card, Flex, Text, Box } from '@radix-ui/themes'
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
  emptyIcon = 'ri-leaf-line',
  emptyTitle = 'No items',
  emptyDescription = 'Nothing to display yet.',
}: DataListProps) {
  if (items.length === 0) {
    return (
      <Card>
        <Flex direction="column" align="center" justify="center" py="9" className="text-center">
          <i className={`${emptyIcon} text-4xl text-[var(--cedar-text-muted)] mb-3`} />
          <Text as="span" size="3" weight="medium" mb="1">{emptyTitle}</Text>
          <Text as="span" size="2" color="gray" className="max-w-sm">{emptyDescription}</Text>
        </Flex>
      </Card>
    )
  }

  return (
    <Card>
      <Box p="0">
        <div className="divide-y divide-[var(--gray-6)]">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--gray-a2)] transition-colors"
            >
              <SeverityBadge severity={item.severity} />
              <div className="flex-1 min-w-0">
                <Text as="span" size="2" className="line-clamp-1 text-[var(--gray-12)]">
                  {item.title || <span className="text-[var(--gray-9)] italic">No summary available</span>}
                </Text>
                {item.subtitle && (
                  <Text as="span" size="1" color="gray" className="mt-0.5">{item.subtitle}</Text>
                )}
              </div>
              {item.timestamp && (
                <Text as="span" size="1" color="gray" className="shrink-0">
                  {timeAgo(item.timestamp)}
                </Text>
              )}
              {item.trailing}
            </Link>
          ))}
        </div>
      </Box>
    </Card>
  )
}
