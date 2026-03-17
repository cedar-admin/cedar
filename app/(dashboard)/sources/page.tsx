import { createServerClient } from '../../../lib/db/client'

// ── Helpers ───────────────────────────────────────────────────────────────────

const TIER_STYLES: Record<string, string> = {
  critical: 'bg-red-50 text-red-700 border border-red-200',
  standard: 'bg-blue-50 text-blue-700 border border-blue-200',
  low:      'bg-gray-50 text-gray-600 border border-gray-200',
}

function TierBadge({ tier }: { tier: string | null }) {
  const key = tier?.toLowerCase() ?? 'standard'
  const cls = TIER_STYLES[key] ?? TIER_STYLES.standard
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Standard'}
    </span>
  )
}

function StatusDot({ lastFetchedAt }: { lastFetchedAt: string | null }) {
  if (!lastFetchedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
        Never checked
      </span>
    )
  }
  const ageMs = Date.now() - new Date(lastFetchedAt).getTime()
  const ageH  = ageMs / 3_600_000
  let dotColor = 'bg-gray-300'
  let label    = 'Stale'
  if (ageH < 25)      { dotColor = 'bg-green-500'; label = 'Fresh' }
  else if (ageH < 168) { dotColor = 'bg-yellow-400'; label = 'Aging' }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  )
}

function timeAgo(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
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

  // For status dot and "last checked": use the most recently fetched URL per source
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Source Library</h1>
        <p className="text-gray-500 text-sm mt-1">
          {sources.length} active source{sources.length !== 1 ? 's' : ''} &mdash; Florida regulatory coverage
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700">
          Failed to load sources: {error.message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Source</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-24">Tier</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-36">Fetch Method</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-16">URLs</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-28">Last Checked</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-28">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {withMeta.map((source) => (
              <tr key={source.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{source.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{source.jurisdiction ?? 'FL'}</div>
                </td>
                <td className="px-4 py-4">
                  <TierBadge tier={source.tier} />
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">{source.fetchMethod}</td>
                <td className="px-4 py-4 text-sm text-gray-500 text-center">{source.urlCount}</td>
                <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {timeAgo(source.latestFetchedAt)}
                </td>
                <td className="px-4 py-4">
                  <StatusDot lastFetchedAt={source.latestFetchedAt} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sources.length === 0 && !error && (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-400">No active sources found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
