import Link from 'next/link'
import { Card, Box, Flex, Text, Badge } from '@radix-ui/themes'
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
      <Card variant="surface" className="transition-interactive hover:shadow-[var(--shadow-3)]">
        <Box p="4">
          <Flex direction="column" gap="1">
            <Flex align="center" gap="2">
              <Badge variant="outline" size="1" className="shrink-0">
                {typeLabel}
              </Badge>
              <ConfidenceBadge confidence={relationship.confidence} />
            </Flex>
            <Text as="span" size="2" weight="medium"
              className="group-hover:text-[var(--cedar-accent-text)] transition-colors line-clamp-2 text-[var(--cedar-text-primary)]">
              {relationship.target.name}
            </Text>
            {relationship.target.citation && (
              <Text as="span" size="1" color="gray">{relationship.target.citation}</Text>
            )}
            {relationship.fr_citation && (
              <Text as="span" size="1" color="gray">FR: {relationship.fr_citation}</Text>
            )}
          </Flex>
        </Box>
      </Card>
    </Link>
  )
}
