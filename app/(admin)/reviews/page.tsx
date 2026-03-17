import { createServerClient } from '../../../lib/db/client'
import ReviewActions from './ReviewActions'
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

// ── Severity ──────────────────────────────────────────────────────────────────

const SEVERITY_CLASS: Record<string, string> = {
  critical:      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
  high:          'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800',
  medium:        'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800',
  low:           'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
  informational: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
}

const SEVERITY_DOT: Record<string, string> = {
  critical:      'bg-red-500',
  high:          'bg-orange-500',
  medium:        'bg-yellow-500',
  low:           'bg-green-500',
  informational: 'bg-blue-500',
}

function SeverityBadge({ severity }: { severity: string }) {
  const key = severity?.toLowerCase() ?? ''
  const cls = SEVERITY_CLASS[key] ?? ''
  const dot = SEVERITY_DOT[key] ?? 'bg-muted-foreground/50'
  const label = severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : 'Unknown'
  return (
    <Badge variant="outline" className={`gap-1.5 font-semibold ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {label}
    </Badge>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ── Page ──────────────────────────────────────────────────────────────────────

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

  const criticalCount = changes.filter(c => c.severity === 'critical').length
  const highCount = changes.filter(c => c.severity === 'high').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Review Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Changes requiring attorney review before delivery to practices
          </p>
        </div>
        <div className="flex items-center gap-3">
          {criticalCount > 0 && (
            <Badge variant="outline" className="gap-1.5 bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              {criticalCount} Critical — 4h SLA
            </Badge>
          )}
          {highCount > 0 && (
            <Badge variant="outline" className="gap-1.5 bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800">
              {highCount} High — 24h SLA
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">{changes.length} pending</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <i className="ri-error-warning-line text-base" />
          <AlertDescription>Failed to load queue: {error.message}</AlertDescription>
        </Alert>
      )}

      {/* Empty state */}
      {changes.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
              <i className="ri-checkbox-circle-fill text-2xl text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Queue is clear</h3>
            <p className="text-sm text-muted-foreground">
              No changes are awaiting review. Check back after the next monitoring run.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Queue table */}
      {changes.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Severity</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>AI Summary</TableHead>
                  <TableHead className="w-28">Detected</TableHead>
                  <TableHead className="w-48 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changes.map((change) => {
                  const sourceName = change.sources?.name ?? 'Unknown Source'
                  const sourceUrl  = change.sources?.url  ?? '#'
                  return (
                    <TableRow key={change.id}>
                      <TableCell>
                        <SeverityBadge severity={change.severity ?? 'unknown'} />
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-foreground">{sourceName}</div>
                        <a
                          href={sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary truncate block max-w-[200px] transition-colors"
                        >
                          {sourceUrl}
                        </a>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground line-clamp-2 max-w-xl">
                          {change.summary ?? (
                            <span className="text-muted-foreground italic">No summary available</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {change.jurisdiction ?? 'FL'}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {timeAgo(change.detected_at)}
                      </TableCell>
                      <TableCell>
                        <ReviewActions changeId={change.id} sourceName={sourceName} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Review rules reference */}
      <Alert>
        <i className="ri-information-line text-base" />
        <AlertDescription>
          <strong className="font-semibold">Review Rules:</strong>{' '}
          <strong>Critical &amp; High</strong> → attorney review required before delivery.{' '}
          <strong>Medium, Low, Informational</strong> → auto-approved and delivered without review.
        </AlertDescription>
      </Alert>
    </div>
  )
}
