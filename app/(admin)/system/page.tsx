import type { Metadata } from 'next'
import { createServerClient } from '../../../lib/db/client'
import TriggerButton from './TriggerButton'
import SeedCorpusButton from './SeedCorpusButton'
import { Badge, Callout, Card, Box, Flex, Heading, Text, Table, Separator } from '@radix-ui/themes'
import { CedarTable } from '@/components/CedarTable'
import { SEVERITY_COLOR } from '@/lib/ui-constants'
import { timeAgo } from '@/lib/format'

export const metadata: Metadata = {
  title: 'System Health — Cedar Admin',
}

// ── Env var check ────────────────────────────────────────────────────────────

const ENV_VARS = [
  { key: 'ANTHROPIC_API_KEY',    label: 'Anthropic API',    required: true  },
  { key: 'RESEND_API_KEY',       label: 'Resend Email',     required: true  },
  { key: 'INNGEST_SIGNING_KEY',  label: 'Inngest Signing',  required: true  },
  { key: 'INNGEST_EVENT_KEY',    label: 'Inngest Events',   required: true  },
  { key: 'OXYLABS_USERNAME',     label: 'Oxylabs Username', required: false },
  { key: 'OXYLABS_PASSWORD',     label: 'Oxylabs Password', required: false },
  { key: 'BROWSERBASE_API_KEY',  label: 'BrowserBase',      required: false },
  { key: 'ADMIN_SECRET',         label: 'Admin Secret',     required: true  },
]

function EnvRow({ keyName, label, required }: { keyName: string; label: string; required: boolean }) {
  const isSet = !!process.env[keyName]
  return (
    <Flex align="center" justify="between" py="2">
      <Flex align="center" gap="2">
        <span className="text-sm font-mono text-[var(--cedar-text-primary)]">{keyName}</span>
        <Text as="span" size="1" color="gray">{label}</Text>
        {required && !isSet && (
          <Badge variant="outline" color="red" size="1">
            Required
          </Badge>
        )}
      </Flex>
      {isSet ? (
        <span className="flex items-center gap-1 text-xs text-[var(--cedar-success-text)] font-medium">
          <i className="ri-checkbox-circle-fill" aria-hidden="true" /> Set
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs text-[var(--cedar-text-secondary)]">
          <i className="ri-close-circle-line" aria-hidden="true" /> Not set
        </span>
      )}
    </Flex>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic'

export default async function SystemPage() {
  const supabase = createServerClient()

  // Source status
  const { data: sources } = await supabase
    .from('sources')
    .select(`
      id,
      name,
      fetch_method,
      is_active,
      source_urls (
        id,
        last_fetched_at,
        last_fetch_method
      )
    `)
    .order('name')

  // Change counts per source
  const { data: changeCounts } = await supabase
    .from('changes')
    .select('source_id')

  const countBySource = (changeCounts ?? []).reduce<Record<string, number>>((acc, c) => {
    acc[c.source_id] = (acc[c.source_id] ?? 0) + 1
    return acc
  }, {})

  // Recent changes
  const { data: recentChanges } = await supabase
    .from('changes')
    .select('id, severity, detected_at, sources(name)')
    .order('detected_at', { ascending: false })
    .limit(5)

  // Check required env vars
  const missingRequired = ENV_VARS.filter(v => v.required && !process.env[v.key])

  return (
    <Flex direction="column" gap="6">
      {/* Header */}
      <Flex align="center" justify="between">
        <div>
          <Heading as="h1" size="6" weight="bold">System Health</Heading>
          <Text as="span" size="2" color="gray" className="mt-1 block">
            Environment status, source monitoring, and manual trigger controls
          </Text>
        </div>
        <Flex align="center" gap="2">
          <SeedCorpusButton />
          <TriggerButton label="Run All Sources" />
        </Flex>
      </Flex>

      {missingRequired.length > 0 && (
        <Callout.Root color="red">
          <Callout.Icon><i className="ri-error-warning-line text-base" aria-hidden="true" /></Callout.Icon>
          <Callout.Text>
            <strong>{missingRequired.length} required env var{missingRequired.length !== 1 ? 's' : ''} not set:</strong>{' '}
            {missingRequired.map(v => v.key).join(', ')}
          </Callout.Text>
        </Callout.Root>
      )}

      {/* Environment Variables */}
      <Card>
        <Box px="4" pt="4" pb="3">
          <Heading as="h2" size="1" weight="bold" color="gray" className="uppercase tracking-wide">
            Environment Variables
          </Heading>
        </Box>
        <Box px="4" pb="4">
          <div className="divide-y divide-[var(--cedar-border-subtle)]">
            {ENV_VARS.map((v) => (
              <EnvRow key={v.key} keyName={v.key} label={v.label} required={v.required} />
            ))}
          </div>
        </Box>
      </Card>

      {/* Sources */}
      <Card>
        <Box px="4" pt="4" pb="3">
          <Heading as="h2" size="1" weight="bold" color="gray" className="uppercase tracking-wide">
            Sources ({sources?.length ?? 0})
          </Heading>
        </Box>
        <Box p="0">
          <CedarTable surface="nested">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Source</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Method</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Last Fetched</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Changes</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell justify="end">Trigger</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {(sources ?? []).map((source) => {
                const urls = (source.source_urls ?? []) as Array<{
                  id: string
                  last_fetched_at: string | null
                  last_fetch_method: string | null
                }>
                const lastFetch = urls
                  .map(u => u.last_fetched_at)
                  .filter(Boolean)
                  .sort()
                  .at(-1) ?? null
                const actualMethod = urls.find(u => u.last_fetch_method)?.last_fetch_method ?? null
                const changes = countBySource[source.id] ?? 0

                return (
                  <Table.Row key={source.id}>
                    <Table.Cell>
                      <Flex align="center" gap="2">
                        <span className={`w-1.5 h-1.5 rounded-full ${source.is_active ? 'bg-[var(--cedar-status-dot-success)]' : 'bg-[var(--cedar-border-strong)]'}`} aria-hidden="true" />
                        <Text as="span" size="2" weight="medium">{source.name}</Text>
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant="outline" className="text-xs font-mono">
                        {actualMethod ?? source.fetch_method}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Text as="span" size="2" color="gray">
                        <time dateTime={lastFetch ?? ''}>{timeAgo(lastFetch)}</time>
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text as="span" size="2" color="gray">{changes}</Text>
                    </Table.Cell>
                    <Table.Cell justify="end">
                      <TriggerButton label="Run" sourceId={source.id} />
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </CedarTable>
        </Box>
      </Card>

      {/* Recent Changes */}
      <Card>
        <Box px="4" pt="4" pb="3">
          <Heading as="h2" size="1" weight="bold" color="gray" className="uppercase tracking-wide">
            Recent Changes
          </Heading>
        </Box>
        <Box px="4" pb="4">
          {!recentChanges || recentChanges.length === 0 ? (
            <Text as="span" size="2" color="gray" className="italic py-4 text-center block">
              No changes recorded yet
            </Text>
          ) : (
            <Flex direction="column" gap="3">
              {recentChanges.map((c) => {
                const src = c.sources as { name: string } | null
                const color = (SEVERITY_COLOR[c.severity ?? ''] ?? 'gray') as any
                return (
                  <Flex key={c.id} align="center" justify="between">
                    <Flex align="center" gap="3">
                      <Badge color={color} variant="soft" size="1">
                        {c.severity ?? 'unknown'}
                      </Badge>
                      <Text as="span" size="2">{src?.name ?? '—'}</Text>
                    </Flex>
                    <Text as="span" size="1" color="gray">
                      <time dateTime={c.detected_at}>{timeAgo(c.detected_at)}</time>
                    </Text>
                  </Flex>
                )
              })}
            </Flex>
          )}
          <Separator size="4" className="mt-4 mb-3" />
          <Text as="span" size="1" color="gray">
            Total changes: <strong>{Object.values(countBySource).reduce((a, b) => a + b, 0)}</strong>
          </Text>
        </Box>
      </Card>
    </Flex>
  )
}
