import type { Metadata } from 'next'
import Link from 'next/link'
import { createServerClient } from '../../../lib/db/client'
import { Badge, Callout, Card, Box, Flex, Heading, Text } from '@radix-ui/themes'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { timeAgo } from '@/lib/format'

export const metadata: Metadata = { title: 'Review Queue — Cedar Admin' }

// ── Types ────────────────────────────────────────────────────────────────────

type FilterTab = 'pending' | 'approved' | 'rejected' | 'all'

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{ filter?: string }>
}

export default async function ReviewQueuePage({ searchParams }: Props) {
  const sp = await searchParams
  const filter: FilterTab =
    sp.filter === 'approved' || sp.filter === 'rejected' || sp.filter === 'all'
      ? sp.filter
      : 'pending'

  const supabase = createServerClient()

  let query = supabase
    .from('changes')
    .select(`
      id,
      severity,
      summary,
      jurisdiction,
      detected_at,
      review_status,
      source_id,
      sources ( name, url )
    `)
    .order('detected_at', { ascending: false })

  if (filter !== 'all') {
    query = query.eq('review_status', filter)
  }

  const { data: rows, error } = await query

  const changes = (rows ?? []) as Array<{
    id: string
    severity: string | null
    summary: string | null
    jurisdiction: string | null
    detected_at: string
    review_status: string
    source_id: string
    sources: { name: string; url: string } | null
  }>

  // SLA counters (only relevant for pending view)
  const criticalCount = filter === 'pending' ? changes.filter(c => c.severity === 'critical').length : 0
  const highCount = filter === 'pending' ? changes.filter(c => c.severity === 'high').length : 0

  return (
    <Flex direction="column" gap="6">
      {/* Header */}
      <Flex align="center" justify="between">
        <div>
          <Heading as="h1" size="6" weight="bold">Review Queue</Heading>
          <Text as="span" size="2" color="gray" className="mt-1 block">
            Changes requiring attorney review before delivery to practices
          </Text>
        </div>
        <Flex align="center" gap="3">
          {criticalCount > 0 && (
            <Badge color="red" variant="soft" className="gap-1.5">
              <span className="w-1.5 h-1.5 bg-[var(--cedar-status-dot-error)] rounded-full animate-pulse" aria-hidden="true" />
              {criticalCount} Critical — 4h SLA
            </Badge>
          )}
          {highCount > 0 && (
            <Badge color="orange" variant="soft" className="gap-1.5">
              {highCount} High — 24h SLA
            </Badge>
          )}
        </Flex>
      </Flex>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--cedar-border-subtle)]">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === 'pending' ? '/reviews' : `/reviews?filter=${tab.value}`}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              filter === tab.value
                ? 'border-[var(--cedar-interactive-focus)] text-[var(--cedar-text-primary)]'
                : 'border-transparent text-[var(--cedar-text-secondary)] hover:text-[var(--cedar-text-primary)] hover:border-[var(--cedar-border-subtle)]'
            }`}
          >
            {tab.label}
            {filter === tab.value && (
              <span className="ml-2 text-xs text-[var(--cedar-text-secondary)]">({changes.length})</span>
            )}
          </Link>
        ))}
      </div>

      {error && (
        <Callout.Root color="red">
          <Callout.Icon><i className="ri-error-warning-line text-base" aria-hidden="true" /></Callout.Icon>
          <Callout.Text>Failed to load queue: {error.message}</Callout.Text>
        </Callout.Root>
      )}

      {/* Empty state */}
      {changes.length === 0 && !error && (
        <Card>
          <Box p="4">
            <Flex direction="column" align="center" justify="center" py="9" className="text-center">
              <div className="w-12 h-12 bg-[var(--cedar-success-bg)] flex items-center justify-center mx-auto mb-4">
                <i className="ri-checkbox-circle-fill text-2xl text-[var(--cedar-success-text)]" aria-hidden="true" />
              </div>
              <Text as="span" size="3" weight="bold" className="mb-1 block">
                {filter === 'pending' ? 'Queue is clear' : `No ${filter} changes`}
              </Text>
              <Text as="span" size="2" color="gray">
                {filter === 'pending'
                  ? 'No changes are awaiting review. Check back after the next monitoring run.'
                  : `No changes with status "${filter}" found.`}
              </Text>
            </Flex>
          </Box>
        </Card>
      )}

      {/* Queue list — each row links to detail page */}
      {changes.length > 0 && (
        <Card>
          <Box p="0">
            <div className="divide-y divide-[var(--cedar-border-subtle)]">
              {changes.map((change) => {
                const sourceName = change.sources?.name ?? 'Unknown Source'
                return (
                  <Link
                    key={change.id}
                    href={`/reviews/${change.id}`}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--cedar-card-hover)] transition-colors"
                  >
                    <SeverityBadge severity={change.severity} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--cedar-text-primary)] line-clamp-1">
                        {change.summary ?? (
                          <span className="text-[var(--cedar-text-secondary)] italic">No summary available</span>
                        )}
                      </p>
                      <p className="text-xs text-[var(--cedar-text-secondary)] mt-0.5">
                        {sourceName} · {change.jurisdiction ?? 'FL'}
                      </p>
                    </div>
                    {filter === 'all' && (
                      <StatusBadge status={change.review_status} />
                    )}
                    <span className="text-xs text-[var(--cedar-text-secondary)] shrink-0">
                      <time dateTime={change.detected_at}>{timeAgo(change.detected_at)}</time>
                    </span>
                    <i className="ri-arrow-right-s-line text-[var(--cedar-text-secondary)]" aria-hidden="true" />
                  </Link>
                )
              })}
            </div>
          </Box>
        </Card>
      )}

      {/* Review rules reference */}
      <Callout.Root>
        <Callout.Icon><i className="ri-information-line text-base" aria-hidden="true" /></Callout.Icon>
        <Callout.Text>
          <strong className="font-semibold">Review Rules:</strong>{' '}
          <strong>Critical &amp; High</strong> → attorney review required before delivery.{' '}
          <strong>Medium, Low, Informational</strong> → auto-approved and delivered without review.
        </Callout.Text>
      </Callout.Root>
    </Flex>
  )
}
