import Link from 'next/link'
import { Card, Box, Flex, Text, Heading } from '@radix-ui/themes'
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
  headingLevel = 'h3',
}: DomainCardProps) {
  return (
    <Card variant="surface" className="relative h-full transition-interactive hover:bg-[var(--cedar-interactive-hover)]">
      <Box p="4">
        <Flex direction="column" gap="3">
          <Flex align="start" justify="between" gap="2">
            <Heading as={headingLevel} size="3">
              <Link
                href={`/library/${domain.slug}`}
                className="after:absolute after:inset-0 after:content-[''] hover:underline"
              >
                {domain.name}
              </Link>
            </Heading>
            {highestSeverity && (
              <SeverityBadge severity={highestSeverity} className="relative z-10" />
            )}
          </Flex>
          {domain.description && (
            <Text as="span" size="2" color="gray" className="line-clamp-2">
              {domain.description}
            </Text>
          )}
          <Flex align="center" gap="4">
            <Text as="span" size="1" color="gray" className="flex items-center gap-1">
              <i className="ri-file-list-3-line" aria-hidden="true" />
              {regulationCount.toLocaleString()} regulations
            </Text>
            {recentChangeCount > 0 && (
              <Text as="span" size="1" color="gray" className="flex items-center gap-1">
                <i className="ri-refresh-line" aria-hidden="true" />
                {recentChangeCount} recent
              </Text>
            )}
          </Flex>
        </Flex>
      </Box>
    </Card>
  )
}
