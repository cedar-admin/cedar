import Link from 'next/link'
import { createServerClient } from '../../../lib/db/client'
import { Badge, Card, Box, Flex, Heading, Text, Button, Table } from '@radix-ui/themes'
import { SeverityBadge } from '@/components/SeverityBadge'
import { timeAgo, formatDate } from '@/lib/format'

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
          <Heading size="6" weight="bold">Audit Trail</Heading>
          <Text size="2" color="gray" as="p" mt="1">
            Tamper-evident, timestamped record of all detected changes and hash chain integrity
          </Text>
        </div>
        <Button variant="outline" size="1" asChild>
          <Link href="/audit/export" target="_blank" rel="noopener noreferrer">
            <i className="ri-download-line" />
            Export PDF
          </Link>
        </Button>
      </Flex>

      {/* Section 1: Chain Validation Runs */}
      <section>
        <Flex direction="column" gap="3">
          <h2 className="text-sm font-semibold text-[var(--gray-12)]">Chain Validation Runs</h2>
          {logs.length === 0 ? (
            <Card>
              <Box p="4">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <i className="ri-shield-check-line text-3xl text-[var(--gray-11)] opacity-40 mb-2" />
                  <p className="text-sm text-[var(--gray-11)]">
                    No validation runs yet. The weekly cron runs every Sunday at 3 AM UTC.
                  </p>
                </div>
              </Box>
            </Card>
          ) : (
            <Card>
              <Table.Root>
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
                      <Table.Cell className="text-sm text-[var(--gray-12)] whitespace-nowrap">
                        {formatDate(log.run_at)}
                      </Table.Cell>
                      <Table.Cell className="text-sm text-[var(--gray-11)] text-center">
                        {log.sources_checked}
                      </Table.Cell>
                      <Table.Cell className="text-center">
                        <span className="text-sm font-medium text-[var(--green-11)]">
                          {log.chains_valid}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="text-center">
                        {log.chains_broken > 0 ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800">
                            {log.chains_broken}
                          </Badge>
                        ) : (
                          <span className="text-sm text-[var(--gray-11)]">0</span>
                        )}
                      </Table.Cell>
                      <Table.Cell className="text-sm text-[var(--gray-11)] text-center">
                        {log.total_changes}
                      </Table.Cell>
                      <Table.Cell className="text-xs text-[var(--gray-11)] max-w-xs truncate">
                        {log.summary ?? '—'}
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
      <section>
        <Flex direction="column" gap="3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-[var(--gray-12)]">Change Audit Trail</h2>
            <span className="text-xs text-[var(--gray-11)]">most recent 50 records</span>
          </div>
          {changes.length === 0 ? (
            <Card>
              <Box p="4">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <i className="ri-list-check-3 text-3xl text-[var(--gray-11)] opacity-40 mb-2" />
                  <p className="text-sm text-[var(--gray-11)]">No changes with hash chain data yet.</p>
                </div>
              </Box>
            </Card>
          ) : (
            <Card>
              <Table.Root>
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
                      <Table.Cell className="text-sm font-mono text-[var(--gray-11)]">
                        #{c.chain_sequence}
                      </Table.Cell>
                      <Table.Cell className="text-sm text-[var(--gray-12)]">
                        {c.sources?.name ?? '—'}
                      </Table.Cell>
                      <Table.Cell>
                        <SeverityBadge severity={c.severity} />
                      </Table.Cell>
                      <Table.Cell>
                        <Link
                          href={`/changes/${c.id}`}
                          className="text-sm text-[var(--gray-12)] hover:text-primary line-clamp-1 transition-colors"
                        >
                          {c.summary ?? (
                            <span className="text-[var(--gray-11)] italic">No summary</span>
                          )}
                        </Link>
                      </Table.Cell>
                      <Table.Cell className="text-xs text-[var(--gray-11)] whitespace-nowrap">
                        {timeAgo(c.detected_at)}
                      </Table.Cell>
                      <Table.Cell className="text-xs font-mono text-[var(--gray-11)]">
                        {c.hash ? c.hash.slice(0, 12) + '…' : '—'}
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
