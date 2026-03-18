import Link from 'next/link'
import { createServerClient } from '../../../lib/db/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { SEVERITY_CLASS, SEVERITY_DOT } from '@/lib/ui-constants'
import { timeAgo } from '@/lib/format'

// ── Types ────────────────────────────────────────────────────────────────────

type FilterTab = 'pending' | 'approved' | 'rejected' | 'all'

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{ filter?: string }>
}

export default async function ReviewQueuePage({ searchParams }: Props) {
  const sp = await searchParams
  const filter: FilterTab =
    sp.filter === 'approved' || sp.filter === 'rejected' || sp.filter === 'all'
      ? sp.filter
      : 'pending'

  const supabase = createServerClient()

  let query = supabase
    .from('changes')
    .select(`
      id,
      severity,
      summary,
      jurisdiction,
      detected_at,
      review_status,
      source_id,
      sources ( name, url )
    `)
    .order('detected_at', { ascending: false })

  if (filter !== 'all') {
    query = query.eq('review_status', filter)
  }

  const { data: rows, error } = await query

  const changes = (rows ?? []) as Array<{
    id: string
    severity: string | null
    summary: string | null
    jurisdiction: string | null
    detected_at: string
    review_status: string
    source_id: string
    sources: { name: string; url: string } | null
  }>

  // SLA counters (only relevant for pending view)
  const criticalCount = filter === 'pending' ? changes.filter(c => c.severity === 'critical').length : 0
  const highCount = filter === 'pending' ? changes.filter(c => c.severity === 'high').length : 0

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
            <Badge variant="outline" className={`gap-1.5 ${SEVERITY_CLASS['critical']}`}>
              <span className={`w-1.5 h-1.5 ${SEVERITY_DOT['critical']} rounded-full animate-pulse`} />
              {criticalCount} Critical — 4h SLA
            </Badge>
          )}
          {highCount > 0 && (
            <Badge variant="outline" className={`gap-1.5 ${SEVERITY_CLASS['high']}`}>
              {highCount} High — 24h SLA
            </Badge>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === 'pending' ? '/reviews' : `/reviews?filter=${tab.value}`}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              filter === tab.value
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
            }`}
          >
            {tab.label}
            {filter === tab.value && (
              <span className="ml-2 text-xs text-muted-foreground">({changes.length})</span>
            )}
          </Link>
        ))}
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
            <h3 className="text-base font-semibold text-foreground mb-1">
              {filter === 'pending' ? 'Queue is clear' : `No ${filter} changes`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {filter === 'pending'
                ? 'No changes are awaiting review. Check back after the next monitoring run.'
                : `No changes with status "${filter}" found.`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Queue list — each row links to detail page */}
      {changes.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {changes.map((change) => {
                const sourceName = change.sources?.name ?? 'Unknown Source'
                return (
                  <Link
                    key={change.id}
                    href={`/reviews/${change.id}`}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <SeverityBadge severity={change.severity} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {change.summary ?? (
                          <span className="text-muted-foreground italic">No summary available</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sourceName} · {change.jurisdiction ?? 'FL'}
                      </p>
                    </div>
                    {filter === 'all' && (
                      <StatusBadge status={change.review_status} />
                    )}
                    <span className="text-xs text-muted-foreground shrink-0">
                      {timeAgo(change.detected_at)}
                    </span>
                    <i className="ri-arrow-right-s-line text-muted-foreground/50" />
                  </Link>
                )
              })}
            </div>
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
