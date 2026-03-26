import { createServerClient } from '../../../lib/db/client'
import { CedarTable } from '@/components/CedarTable'
import { timeAgo } from '@/lib/format'

export const metadata = { title: 'Sources — Cedar' }

// ── Helpers ───────────────────────────────────────────────────────────────────

function MonitoringTierBadge({ tier }: { tier: string | null }) {
  return (
    <span className="inline-flex px-2 py-0.5 text-xs rounded border font-medium">
      {tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Standard'}
    </span>
  )
}

function FreshnessIndicator({ lastFetchedAt }: { lastFetchedAt: string | null }) {
  if (!lastFetchedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-300" aria-hidden="true" />
        Never checked
      </span>
    )
  }
  const ageH = (Date.now() - new Date(lastFetchedAt).getTime()) / 3_600_000
  let dotColor = 'bg-gray-300'
  let label = 'Stale'
  if (ageH < 25)       { dotColor = 'bg-green-500'; label = 'Fresh' }
  else if (ageH < 168) { dotColor = 'bg-yellow-500'; label = 'Aging' }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Sources</h1>
        <p className="text-sm mt-1">
          {sources.length} active source{sources.length !== 1 ? 's' : ''} &mdash; Florida regulatory coverage
        </p>
      </div>

      {error && (
        <div className="p-4 border border-red-300 rounded">
          <p className="text-sm">Failed to load sources: {error.message}</p>
        </div>
      )}

      {sources.length === 0 && !error ? (
        <div className="border rounded p-4">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-3xl opacity-40 mb-2" aria-hidden="true" />
            <p className="text-sm">No active sources found.</p>
          </div>
        </div>
      ) : (
        <div className="border rounded">
          <CedarTable surface="nested">
            <thead>
              <tr>
                <th>Source</th>
                <th className="w-28">Tier</th>
                <th className="w-36">Fetch Method</th>
                <th className="w-16 text-center">URLs</th>
                <th className="w-28">Last Checked</th>
                <th className="w-28">Status</th>
              </tr>
            </thead>
            <tbody>
              {withMeta.map((source) => (
                <tr key={source.id}>
                  <td>
                    <span className="text-sm font-medium">{source.name}</span>
                    <span className="text-xs block mt-0.5">
                      {source.jurisdiction ?? 'FL'}
                    </span>
                  </td>
                  <td>
                    <MonitoringTierBadge tier={source.tier} />
                  </td>
                  <td>
                    <span className="text-sm">{source.fetchMethod}</span>
                  </td>
                  <td className="text-center">
                    <span className="text-sm">{source.urlCount}</span>
                  </td>
                  <td>
                    {source.latestFetchedAt ? (
                      <time dateTime={new Date(source.latestFetchedAt).toISOString()} className="text-sm whitespace-nowrap">
                        {timeAgo(source.latestFetchedAt)}
                      </time>
                    ) : (
                      <span className="text-sm">—</span>
                    )}
                  </td>
                  <td>
                    <FreshnessIndicator lastFetchedAt={source.latestFetchedAt} />
                  </td>
                </tr>
              ))}
            </tbody>
          </CedarTable>
        </div>
      )}
    </div>
  )
}
