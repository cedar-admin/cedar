import type { Metadata } from 'next'
import { createServerClient } from '../../../lib/db/client'
import { Callout, Card, Box, Flex, Heading, Text } from '@radix-ui/themes'
import { PracticesTable } from '@/components/admin/PracticesTable'
import type { Database } from '@/lib/db/types'

export const metadata: Metadata = { title: 'Practices — Cedar Admin' }

export const dynamic = 'force-dynamic'

type PracticeRow = Database['public']['Tables']['practices']['Row']

export default async function PracticesPage() {
  const supabase = createServerClient()

  // Fetch active (non-deleted) practices
  const { data: rows, error } = await supabase
    .from('practices')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const practices = (rows ?? []) as PracticeRow[]

  // Fetch acknowledgment counts for all practices
  const { data: ackRows } = await supabase
    .from('practice_acknowledgments')
    .select('practice_id')

  // Build practice_id → count map
  const ackCounts: Record<string, number> = {}
  for (const row of ackRows ?? []) {
    ackCounts[row.practice_id] = (ackCounts[row.practice_id] ?? 0) + 1
  }

  return (
    <Flex direction="column" gap="6">
      {/* Header */}
      <div>
        <Heading as="h1" size="6" weight="bold">Practices</Heading>
        <Text as="span" size="2" color="gray" className="mt-1 block">
          All registered practices — {practices.length} active
        </Text>
      </div>

      {/* Error state */}
      {error && (
        <Callout.Root color="red">
          <Callout.Icon><i className="ri-error-warning-line text-base" aria-hidden="true" /></Callout.Icon>
          <Callout.Text>Failed to load practices: {error.message}</Callout.Text>
        </Callout.Root>
      )}

      {/* Empty state (no practices at all) */}
      {practices.length === 0 && !error && (
        <Card>
          <Box p="4">
            <Flex direction="column" align="center" justify="center" py="9" className="text-center">
              <i className="ri-building-line text-3xl text-[var(--cedar-text-secondary)] mb-2" aria-hidden="true" />
              <Text as="span" size="2" color="gray">No practices registered yet.</Text>
            </Flex>
          </Box>
        </Card>
      )}

      {/* Table + filter bar (client component) */}
      {practices.length > 0 && (
        <PracticesTable practices={practices} ackCounts={ackCounts} />
      )}
    </Flex>
  )
}
