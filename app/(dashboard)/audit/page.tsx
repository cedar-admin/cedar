import Link from 'next/link'
import { createServerClient } from '../../../lib/db/client'

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

const SEVERITY_STYLES: Record<string, string> = {
  critical:      'bg-red-100 text-red-700',
  high:          'bg-orange-100 text-orange-700',
  medium:        'bg-yellow-100 text-yellow-700',
  low:           'bg-green-100 text-green-700',
  informational: 'bg-blue-100 text-blue-700',
}

function SeverityPill({ severity }: { severity: string | null }) {
  const key = severity?.toLowerCase() ?? ''
  const cls = SEVERITY_STYLES[key] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : '—'}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AuditPage() {
  const supabase = createServerClient()

  // Parallel queries
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Audit Trail</h1>
          <p className="text-gray-500 text-sm mt-1">
            Tamper-evident, timestamped record of all detected changes and hash chain integrity
          </p>
        </div>
        <Link
          href="/audit/export"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export PDF
        </Link>
      </div>

      {/* Section 1: Chain Validation Runs */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Chain Validation Runs</h2>
        {logs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400">No validation runs yet. The weekly cron runs every Sunday at 3 AM UTC.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Run At</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-24">Sources</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-24">Valid</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-24">Broken</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-24">Changes</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {formatDate(log.run_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">{log.sources_checked}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-green-700">{log.chains_valid}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {log.chains_broken > 0 ? (
                        <span className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          {log.chains_broken}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">{log.total_changes}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                      {log.summary ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Section 2: Audit Trail */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Change Audit Trail
          <span className="ml-2 text-xs font-normal text-gray-400">(most recent 50 records)</span>
        </h2>
        {changes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400">No changes with hash chain data yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3 w-20">Seq #</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-40">Source</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-24">Severity</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Summary</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-24">Detected</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-32">Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {changes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm font-mono text-gray-400">
                      #{c.chain_sequence}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {c.sources?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <SeverityPill severity={c.severity} />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/changes/${c.id}`} className="text-sm text-gray-700 hover:text-blue-600 line-clamp-1 transition-colors">
                        {c.summary ?? <span className="text-gray-400 italic">No summary</span>}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {timeAgo(c.detected_at)}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-400">
                      {c.hash ? c.hash.slice(0, 12) + '…' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
