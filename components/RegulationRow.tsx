import Link from 'next/link'
import { Badge, Flex, Text } from '@radix-ui/themes'
import { AuthorityBadge } from '@/components/AuthorityBadge'
import { ConfidenceBadge } from '@/components/ConfidenceBadge'
import { DeadlineChip } from '@/components/DeadlineChip'
import { ServiceLineTag } from '@/components/ServiceLineTag'
import { capitalize } from '@/lib/format'
import { cn } from '@/lib/utils'

interface RegulationRowProps {
  entity: {
    id: string
    name: string
    citation: string | null
    entity_type: string | null
    document_type: string | null
    jurisdiction: string | null
    status: string | null
    authority_level: string | null
    publication_date: string | null
    effective_date: string | null
    comment_close_date: string | null
    classification_confidence: number | null
    description: string | null
  }
  domainSlug: string
  serviceTags?: string[]
  className?: string
}

export function RegulationRow({ entity, domainSlug, serviceTags, className }: RegulationRowProps) {
  return (
    <Link
      href={`/library/${domainSlug}/${entity.id}`}
      className={cn('block px-4 py-3 hover:bg-[var(--gray-a2)] transition-colors', className)}
    >
      <Flex align="start" justify="between" gap="3">
        <Flex direction="column" gap="1" className="min-w-0 flex-1">
          <Text size="2" weight="medium" className="line-clamp-2 text-[var(--gray-12)]">{entity.name}</Text>
          {entity.citation && (
            <Text size="1" color="gray">{entity.citation}</Text>
          )}
          {entity.description && (
            <Text size="1" color="gray" className="line-clamp-2">{entity.description}</Text>
          )}
          <Flex wrap="wrap" align="center" gap="1" mt="1">
            {entity.entity_type && (
              <Badge variant="soft" size="1">
                {capitalize(entity.entity_type.replace(/_/g, ' '))}
              </Badge>
            )}
            <AuthorityBadge level={entity.authority_level} />
            <ConfidenceBadge confidence={entity.classification_confidence} />
            <DeadlineChip date={entity.comment_close_date} label="Closes" />
            {serviceTags?.map((tag) => (
              <ServiceLineTag key={tag} name={tag} />
            ))}
          </Flex>
        </Flex>
        <div className="shrink-0 text-right">
          {entity.publication_date && (
            <Text size="1" color="gray">
              <time>{new Date(entity.publication_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</time>
            </Text>
          )}
        </div>
      </Flex>
    </Link>
  )
}
