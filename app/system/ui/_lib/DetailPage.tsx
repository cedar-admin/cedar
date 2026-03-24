import { Badge, Flex, Heading, Text } from '@radix-ui/themes'
import type { LibraryNavItem, LibraryItemStatus } from './nav-config'

function StatusBadge({ status }: { status: LibraryItemStatus }) {
  if (status === 'approved') return <Badge color="green" variant="soft">Approved</Badge>
  if (status === 'candidate') return <Badge color="amber" variant="soft">Candidate</Badge>
  return <Badge color="blue" variant="soft">Experimental</Badge>
}

interface DetailPageProps {
  item: LibraryNavItem
  children: React.ReactNode
}

export function DetailPage({ item, children }: DetailPageProps) {
  return (
    <Flex direction="column" gap="6">
      {/* Header */}
      <Flex direction="column" gap="2">
        <Flex align="center" gap="3" wrap="wrap">
          <Heading as="h1" size="6" weight="bold">{item.label}</Heading>
          <StatusBadge status={item.status} />
        </Flex>
        <Text as="p" size="2" color="gray">{item.description}</Text>
        {item.filePath && (
          <Text as="p" size="1" className="font-mono text-[var(--cedar-text-muted)]">
            {item.filePath}
          </Text>
        )}
      </Flex>

      {/* Page content */}
      {children}
    </Flex>
  )
}

export function ContentSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Flex direction="column" gap="3">
      <Heading as="h2" size="4" weight="medium">{heading}</Heading>
      {children}
    </Flex>
  )
}
