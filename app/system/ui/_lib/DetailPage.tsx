import type { ReactNode } from 'react'
import Link from 'next/link'
import { Badge, Flex, Heading, Text } from '@radix-ui/themes'
import type { LibraryNavItem, LibraryItemStatus } from './nav-config'

function StatusBadge({ status }: { status: LibraryItemStatus }) {
  if (status === 'approved') return <Badge color="green" variant="soft">Approved</Badge>
  if (status === 'candidate') return <Badge color="amber" variant="soft">Candidate</Badge>
  return <Badge color="blue" variant="soft">Experimental</Badge>
}

interface DetailPageProps {
  item: LibraryNavItem
  children: ReactNode
}

export function DetailPage({ item, children }: DetailPageProps) {
  const hasMetadata = (item.governingDocs && item.governingDocs.length > 0) ||
    (item.usedIn && item.usedIn.length > 0) ||
    (item.related && item.related.length > 0) ||
    (item.implementationFiles && item.implementationFiles.length > 0)

  return (
    <Flex direction="column" gap="6">
      {/* Page header */}
      <Flex direction="column" gap="2">
        <Flex align="center" gap="3" wrap="wrap">
          <Heading as="h1" size="6" weight="bold">{item.label}</Heading>
          <StatusBadge status={item.status} />
        </Flex>
        <Text as="p" size="1" className="font-mono text-[var(--cedar-text-muted)]">
          {item.referenceId}
        </Text>
        <Text as="p" size="2" color="gray">{item.description}</Text>

        {/* Metadata cluster */}
        {hasMetadata && (
          <Flex direction="column" gap="2" mt="2" className="border-t border-[var(--cedar-border-subtle)] pt-3">
            {item.implementationFiles && item.implementationFiles.length > 0 && (
              <Flex align="baseline" gap="3" wrap="wrap">
                <Text as="span" size="1" weight="medium" className="shrink-0 w-24 text-[var(--cedar-text-muted)] uppercase tracking-wide">Implements</Text>
                <Flex direction="column" gap="1">
                  {item.implementationFiles.map((file) => (
                    <Text key={file} as="span" size="1" className="font-mono text-[var(--cedar-text-secondary)]">
                      {file}
                    </Text>
                  ))}
                </Flex>
              </Flex>
            )}
            {item.usedIn && item.usedIn.length > 0 && (
              <Flex align="baseline" gap="3" wrap="wrap">
                <Text as="span" size="1" weight="medium" className="shrink-0 w-24 text-[var(--cedar-text-muted)] uppercase tracking-wide">Used in</Text>
                <Flex wrap="wrap" gap="2">
                  {item.usedIn.map((ref) => (
                    <Link key={ref.label} href={ref.href} className="text-xs text-[var(--cedar-text-secondary)] hover:text-[var(--cedar-text-primary)] underline underline-offset-2 decoration-[var(--cedar-border-subtle)]">
                      {ref.label}
                    </Link>
                  ))}
                </Flex>
              </Flex>
            )}
            {item.governingDocs && item.governingDocs.length > 0 && (
              <Flex align="baseline" gap="3" wrap="wrap">
                <Text as="span" size="1" weight="medium" className="shrink-0 w-24 text-[var(--cedar-text-muted)] uppercase tracking-wide">Docs</Text>
                <Flex wrap="wrap" gap="2">
                  {item.governingDocs.map((doc) => (
                    <Text key={doc.label} as="span" size="1" className="font-mono text-[var(--cedar-text-secondary)]">
                      {doc.file}
                    </Text>
                  ))}
                </Flex>
              </Flex>
            )}
            {item.related && item.related.length > 0 && (
              <Flex align="baseline" gap="3" wrap="wrap">
                <Text as="span" size="1" weight="medium" className="shrink-0 w-24 text-[var(--cedar-text-muted)] uppercase tracking-wide">Related</Text>
                <Flex wrap="wrap" gap="2">
                  {item.related.map((rel) => (
                    <Link key={rel.label} href={rel.href} className="text-xs text-[var(--cedar-text-secondary)] hover:text-[var(--cedar-text-primary)] underline underline-offset-2 decoration-[var(--cedar-border-subtle)]">
                      {rel.label}
                    </Link>
                  ))}
                </Flex>
              </Flex>
            )}
          </Flex>
        )}
      </Flex>

      {/* Page content */}
      {children}
    </Flex>
  )
}

export function ContentSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <Flex direction="column" gap="3">
      <Heading as="h2" size="4" weight="medium">{heading}</Heading>
      {children}
    </Flex>
  )
}
