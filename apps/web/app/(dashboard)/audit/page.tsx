import Link from 'next/link'
import { createServerClient } from '../../../lib/db/client'
import { CedarTable } from '@/components/CedarTable'
import { SeverityBadge } from '@/components/SeverityBadge'
import { HashWithCopy } from '@/components/HashWithCopy'
import { timeAgo, formatDate } from '@/lib/format'

export const metadata = { title: 'Audit Trail — Cedar' }

export default async function AuditPage() {
  const supabase = createServerClient()
  const [{ data: validationLogs }, { data: auditChanges }] = await Promise.all([
    supabase.from('validation_log').select('id, run_at, run_type, sources_checked, chains_valid, chains_broken, total_changes, summary').order('run_at', { ascending: false }).limit(10),
    supabase.from('changes').select('id, severity, summary, detected_at, review_status, chain_sequence, hash, sources(name)').not('chain_sequence', 'is', null).order('chain_sequence', { ascending: false }).limit(50),
  ])

  const logs = (validationLogs ?? []) as Array<{ id: string; run_at: string; run_type: string; sources_checked: number; chains_valid: number; chains_broken: number; total_changes: number; summary: string | null }>
  const changes = (auditChanges ?? []) as Array<{ id: string; severity: string | null; summary: string | null; detected_at: string; review_status: string; chain_sequence: number | null; hash: string | null; sources: { name: string } | null }>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Trail</h1>
          <p className="text-sm mt-1">Tamper-evident, timestamped record of all detected changes and hash chain integrity</p>
        </div>
        <Link href="/audit/export" target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-sm border rounded">Export PDF</Link>
      </div>

      <section aria-labelledby="validation-heading">
        <div className="flex flex-col gap-3">
          <h2 id="validation-heading" className="text-base font-bold">Chain Validation Runs</h2>
          {logs.length === 0 ? (
            <div className="border rounded p-4">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-3xl opacity-40 mb-2" aria-hidden="true" />
                <p className="text-sm">No validation runs yet. The weekly cron runs every Sunday at 3 AM UTC.</p>
              </div>
            </div>
          ) : (
            <div className="border rounded">
              <CedarTable surface="nested">
                <thead><tr><th>Run At</th><th className="w-24 text-center">Sources</th><th className="w-24 text-center">Valid</th><th className="w-24 text-center">Broken</th><th className="w-24 text-center">Changes</th><th>Summary</th></tr></thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td><time dateTime={new Date(log.run_at).toISOString()} className="text-sm whitespace-nowrap">{formatDate(log.run_at)}</time></td>
                      <td className="text-center"><span className="text-sm">{log.sources_checked}</span></td>
                      <td className="text-center"><span className="text-sm font-medium text-green-700">{log.chains_valid}</span></td>
                      <td className="text-center">{log.chains_broken > 0 ? <span className="inline-flex px-2 py-0.5 text-xs rounded border border-red-300 text-red-700">{log.chains_broken}</span> : <span className="text-sm">0</span>}</td>
                      <td className="text-center"><span className="text-sm">{log.total_changes}</span></td>
                      <td><span className="text-xs max-w-xs truncate block">{log.summary ?? '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </CedarTable>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="changes-heading">
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <h2 id="changes-heading" className="text-base font-bold">Change Audit Trail</h2>
            <span className="text-xs">most recent 50 records</span>
          </div>
          {changes.length === 0 ? (
            <div className="border rounded p-4">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-3xl opacity-40 mb-2" aria-hidden="true" />
                <p className="text-sm">No changes with hash chain data yet.</p>
              </div>
            </div>
          ) : (
            <div className="border rounded">
              <CedarTable surface="nested">
                <thead><tr><th className="w-20">Seq #</th><th className="w-40">Source</th><th className="w-28">Severity</th><th>Summary</th><th className="w-24">Detected</th><th className="w-32">Hash</th></tr></thead>
                <tbody>
                  {changes.map((c) => (
                    <tr key={c.id}>
                      <td className="font-mono"><span className="text-sm">#{c.chain_sequence}</span></td>
                      <td><span className="text-sm">{c.sources?.name ?? '—'}</span></td>
                      <td><SeverityBadge severity={c.severity} /></td>
                      <td><Link href={`/changes/${c.id}`} className="text-sm hover:underline line-clamp-1 transition-colors">{c.summary ?? <span className="italic">No summary</span>}</Link></td>
                      <td><time dateTime={new Date(c.detected_at).toISOString()} className="text-xs whitespace-nowrap">{timeAgo(c.detected_at)}</time></td>
                      <td>{c.hash ? <HashWithCopy hash={c.hash} /> : <span className="text-xs">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </CedarTable>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
