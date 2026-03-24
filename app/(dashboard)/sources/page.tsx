import { createServerClient } from '../../../lib/db/client'
import { Badge, Card, Box, Flex, Heading, Text, Callout, Table } from '@radix-ui/themes'
import { timeAgo } from '@/lib/format'

export const metadata = { title: 'Sources — Cedar' }

// ── Helpers ───────────────────────────────────────────────────────────────────

function MonitoringTierBadge({ tier }: { tier: string | null }) {
  const key = tier?.toLowerCase() ?? 'standard'
  const color = key === 'critical' ? 'red' : key === 'low' ? 'gray' : 'blue'
  return (
    <Badge variant="outline" color={color as 'red' | 'gray' | 'blue'} className="font-medium">
      {tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Standard'}
    </Badge>
  )
}

function FreshnessIndicator({ lastFetchedAt }: { lastFetchedAt: string | null }) {
  if (!lastFetchedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-[var(--cedar-text-secondary)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--cedar-text-secondary)] opacity-30" aria-hidden="true" />
        Never checked
      </span>
    )
  }
  const ageH = (Date.now() - new Date(lastFetchedAt).getTime()) / 3_600_000
  let dotColor = 'bg-[var(--cedar-text-secondary)] opacity-30'
  let label = 'Stale'
  if (ageH < 25)       { dotColor = 'bg-[var(--cedar-status-dot-success)]'; label = 'Fresh' }
  else if (ageH < 168) { dotColor = 'bg-[var(--cedar-status-dot-warning)]'; label = 'Aging' }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--cedar-text-secondary)]">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      {label}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SourcesPage() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('sources')
    .select('id, name, tier, is_active, jurisdiction, source_urls(url, last_fetched_at, last_fetch_method)')
    .eq('is_active', true)
    .order('name')

  const sources = (data ?? []) as Array<{
    id: string
    name: string
    tier: string | null
    is_active: boolean
    jurisdiction: string | null
    source_urls: Array<{
      url: string
      last_fetched_at: string | null
      last_fetch_method: string | null
    }>
  }>

  const withMeta = sources.map((s) => {
    const urls = s.source_urls ?? []
    const latestFetch = urls
      .filter(u => u.last_fetched_at)
      .sort((a, b) => new Date(b.last_fetched_at!).getTime() - new Date(a.last_fetched_at!).getTime())[0]
    const fetchMethods = [...new Set(urls.map(u => u.last_fetch_method).filter(Boolean))]
    return {
      ...s,
      latestFetchedAt: latestFetch?.last_fetched_at ?? null,
      urlCount: urls.length,
      fetchMethod: fetchMethods.join(', ') || '—',
    }
  })

  return (
    <Flex direction="column" gap="6">
      {/* Header */}
      <div>
        <Heading as="h1" size="6" weight="bold">Sources</Heading>
        <Text size="2" color="gray" as="p" mt="1">
          {sources.length} active source{sources.length !== 1 ? 's' : ''} &mdash; Florida regulatory coverage
        </Text>
      </div>

      {error && (
        <Callout.Root color="red">
          <Callout.Icon><i className="ri-error-warning-line text-base" aria-hidden="true" /></Callout.Icon>
          <Callout.Text>
            Failed to load sources: {error.message}
          </Callout.Text>
        </Callout.Root>
      )}

      {sources.length === 0 && !error ? (
        <Card variant="surface">
          <Box p="4">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <i className="ri-database-2-line text-3xl text-[var(--cedar-text-secondary)] opacity-40 mb-2" aria-hidden="true" />
              <Text as="p" size="2" color="gray">No active sources found.</Text>
            </div>
          </Box>
        </Card>
      ) : (
        <Card variant="surface">
          <Table.Root variant="ghost">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Source</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="w-28">Tier</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="w-36">Fetch Method</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="w-16 text-center">URLs</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="w-28">Last Checked</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="w-28">Status</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {withMeta.map((source) => (
                <Table.Row key={source.id}>
                  <Table.Cell>
                    <Text as="span" size="2" weight="medium">{source.name}</Text>
                    <Text as="span" size="1" color="gray" className="block mt-0.5">
                      {source.jurisdiction ?? 'FL'}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <MonitoringTierBadge tier={source.tier} />
                  </Table.Cell>
                  <Table.Cell>
                    <Text as="span" size="2" color="gray">{source.fetchMethod}</Text>
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    <Text as="span" size="2" color="gray">{source.urlCount}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    {source.latestFetchedAt ? (
                      <time dateTime={new Date(source.latestFetchedAt).toISOString()} className="text-sm text-[var(--cedar-text-secondary)] whitespace-nowrap">
                        {timeAgo(source.latestFetchedAt)}
                      </time>
                    ) : (
                      <Text as="span" size="2" color="gray">—</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <FreshnessIndicator lastFetchedAt={source.latestFetchedAt} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card>
      )}
    </Flex>
  )
}
