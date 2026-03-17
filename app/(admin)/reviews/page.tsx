import { createServerClient } from '../../../lib/db/client'
import ReviewActions from './ReviewActions'

const SEVERITY_STYLES: Record<string, { badge: string; dot: string }> = {
  critical:      { badge: 'bg-red-100 text-red-800 border-red-200',       dot: 'bg-red-500' },
  high:          { badge: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
  medium:        { badge: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' },
  low:           { badge: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-500' },
  informational: { badge: 'bg-blue-100 text-blue-700 border-blue-200',      dot: 'bg-blue-500' },
}

function SeverityBadge({ severity }: { severity: string }) {
  const s = SEVERITY_STYLES[severity?.toLowerCase()] ?? { badge: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : 'Unknown'}
    </span>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default async function ReviewQueuePage() {
  const supabase = createServerClient()

  const { data: pending, error } = await supabase
    .from('changes')
    .select(`
      id,
      severity,
      summary,
      jurisdiction,
      detected_at,
      source_id,
      sources ( name, url )
    `)
    .eq('review_status', 'pending')
    .order('detected_at', { ascending: false })

  const changes = (pending ?? []) as Array<{
    id: string
    severity: string | null
    summary: string | null
    jurisdiction: string | null
    detected_at: string
    source_id: string
    sources: { name: string; url: string } | null
  }>

  // Group by severity for SLA awareness
  const criticalCount = changes.filter(c => c.severity === 'critical').length
  const highCount = changes.filter(c => c.severity === 'high').length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Queue</h1>
          <p className="mt-1 text-sm text-gray-500">
            Changes requiring attorney review before delivery to practices
          </p>
        </div>
        <div className="flex items-center gap-3">
          {criticalCount > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 border border-red-200 text-sm font-semibold px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {criticalCount} Critical — 4h SLA
            </span>
          )}
          {highCount > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 border border-orange-200 text-sm font-semibold px-3 py-1 rounded-full">
              {highCount} High — 24h SLA
            </span>
          )}
          <span className="text-sm text-gray-500">
            {changes.length} pending
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700">
          Failed to load queue: {error.message}
        </div>
      )}

      {/* Empty state */}
      {changes.length === 0 && !error && (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Queue is clear</h3>
          <p className="text-sm text-gray-500">No changes are awaiting review. Check back after the next monitoring run.</p>
        </div>
      )}

      {/* Queue table */}
      {changes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3 w-28">Severity</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Source</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">AI Summary</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-28">Detected</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3 w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {changes.map((change) => {
                const sourceName = change.sources?.name ?? 'Unknown Source'
                const sourceUrl  = change.sources?.url  ?? '#'
                return (
                  <tr key={change.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <SeverityBadge severity={change.severity ?? 'unknown'} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{sourceName}</div>
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-blue-600 truncate block max-w-[200px]"
                      >
                        {sourceUrl}
                      </a>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-700 line-clamp-2 max-w-xl">
                        {change.summary ?? <span className="text-gray-400 italic">No summary available</span>}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{change.jurisdiction ?? 'FL'}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {timeAgo(change.detected_at)}
                    </td>
                    <td className="px-6 py-4">
                      <ReviewActions changeId={change.id} sourceName={sourceName} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Review rules reference */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg px-5 py-4">
        <p className="text-xs font-semibold text-amber-800 mb-1">Review Rules (configured in review_rules)</p>
        <p className="text-xs text-amber-700">
          <strong>Critical &amp; High</strong> → attorney review required before delivery.&nbsp;
          <strong>Medium, Low, Informational</strong> → auto-approved and delivered without review.
        </p>
      </div>
    </div>
  )
}
