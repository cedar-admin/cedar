import Link from 'next/link'
import { createServerClient } from '../../../lib/db/client'
import { Badge, Card, Box, Flex, Heading, Text, Button, Table } from '@radix-ui/themes'
import { SeverityBadge } from '@/components/SeverityBadge'
import { timeAgo, formatDate } from '@/lib/format'

export const metadata = { title: 'Audit Trail — Cedar' }

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AuditPage() {
  const supabase = createServerClient()

  const [{ data: validationLogs }, { data: auditChanges }] = await Promise.all([
    supabase
      .from('validation_log')
      .select('id, run_at, run_type, sources_checked, chains_valid, chains_broken, total_changes, summary')
      .order('run_at', { ascending: false })
      .limit(10),
    supabase
      .from('changes')
      .select('id, severity, summary, detected_at, review_status, chain_sequence, hash, sources(name)')
      .not('chain_sequence', 'is', null)
      .order('chain_sequence', { ascending: false })
      .limit(50),
  ])

  const logs = (validationLogs ?? []) as Array<{
    id: string
    run_at: string
    run_type: string
    sources_checked: number
    chains_valid: number
    chains_broken: number
    total_changes: number
    summary: string | null
  }>

  const changes = (auditChanges ?? []) as Array<{
    id: string
    severity: string | null
    summary: string | null
    detected_at: string
    review_status: string
    chain_sequence: number | null
    hash: string | null
    sources: { name: string } | null
  }>

  return (
    <Flex direction="column" gap="6">
      {/* Header */}
      <Flex align="center" justify="between">
        <div>
          <Heading as="h1" size="6" weight="bold">Audit Trail</Heading>
          <Text size="2" color="gray" as="p" mt="1">
            Tamper-evident, timestamped record of all detected changes and hash chain integrity
          </Text>
        </div>
        <Button variant="soft" color="gray" highContrast size="1" asChild>
          <Link href="/audit/export" target="_blank" rel="noopener noreferrer">
            <i className="ri-download-line" aria-hidden="true" />
            Export PDF
          </Link>
        </Button>
      </Flex>

      {/* Section 1: Chain Validation Runs */}
      <section aria-labelledby="validation-heading">
        <Flex direction="column" gap="3">
          <Heading id="validation-heading" as="h2" size="3" weight="bold">Chain Validation Runs</Heading>
          {logs.length === 0 ? (
            <Card variant="surface">
              <Box p="4">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <i className="ri-shield-check-line text-3xl text-[var(--cedar-text-secondary)] opacity-40 mb-2" aria-hidden="true" />
                  <Text as="p" size="2" color="gray">
                    No validation runs yet. The weekly cron runs every Sunday at 3 AM UTC.
                  </Text>
                </div>
              </Box>
            </Card>
          ) : (
            <Card variant="surface">
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Run At</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="w-24 text-center">Sources</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="w-24 text-center">Valid</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="w-24 text-center">Broken</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="w-24 text-center">Changes</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Summary</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {logs.map((log) => (
                    <Table.Row key={log.id}>
                      <Table.Cell>
                        <time dateTime={new Date(log.run_at).toISOString()} className="text-sm whitespace-nowrap">
                          {formatDate(log.run_at)}
                        </time>
                      </Table.Cell>
                      <Table.Cell className="text-center">
                        <Text as="span" size="2" color="gray">{log.sources_checked}</Text>
                      </Table.Cell>
                      <Table.Cell className="text-center">
                        <Text as="span" size="2" weight="medium" color="green">{log.chains_valid}</Text>
                      </Table.Cell>
                      <Table.Cell className="text-center">
                        {log.chains_broken > 0 ? (
                          <Badge variant="outline" color="red">{log.chains_broken}</Badge>
                        ) : (
                          <Text as="span" size="2" color="gray">0</Text>
                        )}
                      </Table.Cell>
                      <Table.Cell className="text-center">
                        <Text as="span" size="2" color="gray">{log.total_changes}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text as="span" size="1" color="gray" className="max-w-xs truncate block">
                          {log.summary ?? '—'}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Card>
          )}
        </Flex>
      </section>

      {/* Section 2: Audit Trail */}
      <section aria-labelledby="changes-heading">
        <Flex direction="column" gap="3">
          <Flex align="baseline" gap="2">
            <Heading id="changes-heading" as="h2" size="3" weight="bold">Change Audit Trail</Heading>
            <Text as="span" size="1" color="gray">most recent 50 records</Text>
          </Flex>
          {changes.length === 0 ? (
            <Card variant="surface">
              <Box p="4">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <i className="ri-list-check-3 text-3xl text-[var(--cedar-text-secondary)] opacity-40 mb-2" aria-hidden="true" />
                  <Text as="p" size="2" color="gray">No changes with hash chain data yet.</Text>
                </div>
              </Box>
            </Card>
          ) : (
            <Card variant="surface">
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell className="w-20">Seq #</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="w-40">Source</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="w-28">Severity</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Summary</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="w-24">Detected</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="w-32">Hash</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {changes.map((c) => (
                    <Table.Row key={c.id}>
                      <Table.Cell className="font-mono">
                        <Text as="span" size="2" color="gray">#{c.chain_sequence}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text as="span" size="2">{c.sources?.name ?? '—'}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <SeverityBadge severity={c.severity} />
                      </Table.Cell>
                      <Table.Cell>
                        <Link
                          href={`/changes/${c.id}`}
                          className="text-sm text-[var(--cedar-text-primary)] hover:underline line-clamp-1 transition-colors"
                        >
                          {c.summary ?? (
                            <span className="text-[var(--cedar-text-secondary)] italic">No summary</span>
                          )}
                        </Link>
                      </Table.Cell>
                      <Table.Cell>
                        <time dateTime={new Date(c.detected_at).toISOString()} className="text-xs text-[var(--cedar-text-secondary)] whitespace-nowrap">
                          {timeAgo(c.detected_at)}
                        </time>
                      </Table.Cell>
                      <Table.Cell className="font-mono">
                        <Text as="span" size="1" color="gray">
                          {c.hash ? c.hash.slice(0, 12) + '…' : '—'}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Card>
          )}
        </Flex>
      </section>
    </Flex>
  )
}
