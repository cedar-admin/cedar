import type { ReactNode } from 'react'
import Link from 'next/link'
import { Badge, Box, Card, Flex, Heading, Text } from '@radix-ui/themes'
import type { LibraryItemStatus } from './nav-config'

function StatusBadge({ status }: { status: LibraryItemStatus }) {
  if (status === 'approved') return <Badge color="green" variant="soft">Approved</Badge>
  if (status === 'candidate') return <Badge color="amber" variant="soft">Candidate</Badge>
  return <Badge color="blue" variant="soft">Experimental</Badge>
}

interface LibraryIndexCardProps {
  href: string
  label: string
  referenceId: string
  description: string
  status: LibraryItemStatus
  preview: ReactNode
}

export function LibraryIndexCard({
  href,
  label,
  referenceId,
  description,
  status,
  preview,
}: LibraryIndexCardProps) {
  return (
    <Card variant="surface" className="h-full">
      <Box p="5">
        <Flex direction="column" gap="4">
          <Flex align="center" justify="between" gap="3" wrap="wrap">
            <Text as="span" size="1" className="font-mono text-[var(--cedar-text-muted)]">
              {referenceId}
            </Text>
            <StatusBadge status={status} />
          </Flex>

          <Box className="pointer-events-none rounded-xl border border-[var(--cedar-border-subtle)] bg-[var(--cedar-page-bg)] p-4">
            {preview}
          </Box>

          <Flex direction="column" gap="2">
            <Heading as="h2" size="4" weight="medium">
              {label}
            </Heading>
            <Text as="p" size="2" color="gray" className="leading-relaxed">
              {description}
            </Text>
          </Flex>

          <Link
            href={href}
            className="text-sm font-medium text-[var(--cedar-text-primary)] underline underline-offset-4 decoration-[var(--cedar-border-subtle)] hover:decoration-[var(--cedar-text-primary)]"
          >
            Open page
          </Link>
        </Flex>
      </Box>
    </Card>
  )
}
