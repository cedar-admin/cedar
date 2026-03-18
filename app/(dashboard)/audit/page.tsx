import Link from 'next/link'
import { createServerClient } from '../../../lib/db/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Audit Trail</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tamper-evident, timestamped record of all detected changes and hash chain integrity
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/audit/export" target="_blank" rel="noopener noreferrer">
            <i className="ri-download-line" />
            Export PDF
          </Link>
        </Button>
      </div>

      {/* Section 1: Chain Validation Runs */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Chain Validation Runs</h2>
        {logs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <i className="ri-shield-check-line text-3xl text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                No validation runs yet. The weekly cron runs every Sunday at 3 AM UTC.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Run At</TableHead>
                    <TableHead className="w-24 text-center">Sources</TableHead>
                    <TableHead className="w-24 text-center">Valid</TableHead>
                    <TableHead className="w-24 text-center">Broken</TableHead>
                    <TableHead className="w-24 text-center">Changes</TableHead>
                    <TableHead>Summary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-foreground whitespace-nowrap">
                        {formatDate(log.run_at)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground text-center">
                        {log.sources_checked}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                          {log.chains_valid}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {log.chains_broken > 0 ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800">
                            {log.chains_broken}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground text-center">
                        {log.total_changes}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {log.summary ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Section 2: Audit Trail */}
      <section className="space-y-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold text-foreground">Change Audit Trail</h2>
          <span className="text-xs text-muted-foreground">most recent 50 records</span>
        </div>
        {changes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <i className="ri-list-check-3 text-3xl text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No changes with hash chain data yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Seq #</TableHead>
                    <TableHead className="w-40">Source</TableHead>
                    <TableHead className="w-28">Severity</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead className="w-24">Detected</TableHead>
                    <TableHead className="w-32">Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changes.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        #{c.chain_sequence}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {c.sources?.name ?? '—'}
                      </TableCell>
                      <TableCell>
                        <SeverityBadge severity={c.severity} />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/changes/${c.id}`}
                          className="text-sm text-foreground hover:text-primary line-clamp-1 transition-colors"
                        >
                          {c.summary ?? (
                            <span className="text-muted-foreground italic">No summary</span>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {timeAgo(c.detected_at)}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {c.hash ? c.hash.slice(0, 12) + '…' : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
