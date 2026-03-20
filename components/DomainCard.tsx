import Link from 'next/link'
import { Card, Box, Flex, Text, Heading } from '@radix-ui/themes'
import { SeverityBadge } from '@/components/SeverityBadge'
import { cn } from '@/lib/utils'

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
    <Link href={`/library/${domain.slug}`} className={cn('block group', className)}>
      <Card className="h-full transition-interactive hover:shadow-[var(--shadow-3)]">
        <Box p="4">
          <Flex direction="column" gap="3">
            <Flex align="start" justify="between" gap="2">
              <Heading size="3" className="group-hover:text-[var(--accent-11)] transition-colors line-clamp-2">
                {domain.name}
              </Heading>
              {highestSeverity && <SeverityBadge severity={highestSeverity} />}
            </Flex>
            {domain.description && (
              <Text size="2" color="gray" className="line-clamp-2">{domain.description}</Text>
            )}
            <Flex align="center" gap="4">
              <Text size="1" color="gray" className="flex items-center gap-1">
                <i className="ri-file-list-3-line" />
                {regulationCount.toLocaleString()} regulations
              </Text>
              {recentChangeCount > 0 && (
                <Text size="1" className="flex items-center gap-1 text-[var(--accent-11)]">
                  <i className="ri-refresh-line" />
                  {recentChangeCount} recent
                </Text>
              )}
            </Flex>
          </Flex>
        </Box>
      </Card>
    </Link>
  )
}
