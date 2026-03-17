import { createServerClient } from '../../../lib/db/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ── Helpers ───────────────────────────────────────────────────────────────────

function MonitoringTierBadge({ tier }: { tier: string | null }) {
  const key = tier?.toLowerCase() ?? 'standard'
  const cls =
    key === 'critical'
      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800'
      : key === 'low'
      ? ''
      : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800'
  return (
    <Badge variant="outline" className={`font-medium ${cls}`}>
      {tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Standard'}
    </Badge>
  )
}

function FreshnessIndicator({ lastFetchedAt }: { lastFetchedAt: string | null }) {
  if (!lastFetchedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
        Never checked
      </span>
    )
  }
  const ageH = (Date.now() - new Date(lastFetchedAt).getTime()) / 3_600_000
  let dotColor = 'bg-muted-foreground/30'
  let label = 'Stale'
  if (ageH < 25)       { dotColor = 'bg-green-500'; label = 'Fresh' }
  else if (ageH < 168) { dotColor = 'bg-yellow-400'; label = 'Aging' }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Source Library</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {sources.length} active source{sources.length !== 1 ? 's' : ''} &mdash; Florida regulatory coverage
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <i className="ri-error-warning-line text-base" />
          <AlertDescription>
            Failed to load sources: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {sources.length === 0 && !error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <i className="ri-database-2-line text-3xl text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No active sources found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="w-28">Tier</TableHead>
                  <TableHead className="w-36">Fetch Method</TableHead>
                  <TableHead className="w-16 text-center">URLs</TableHead>
                  <TableHead className="w-28">Last Checked</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withMeta.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell>
                      <div className="text-sm font-medium text-foreground">{source.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {source.jurisdiction ?? 'FL'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <MonitoringTierBadge tier={source.tier} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {source.fetchMethod}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground text-center">
                      {source.urlCount}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {timeAgo(source.latestFetchedAt)}
                    </TableCell>
                    <TableCell>
                      <FreshnessIndicator lastFetchedAt={source.latestFetchedAt} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
