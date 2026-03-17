import { redirect } from 'next/navigation'
import Link from 'next/link'
import { withAuth } from '@workos-inc/authkit-nextjs'
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

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25

const SEVERITY_CLASS: Record<string, string> = {
  critical:      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
  high:          'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800',
  medium:        'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800',
  low:           'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
  informational: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
}

const SEVERITY_ICON: Record<string, string> = {
  critical:      'ri-error-warning-fill text-red-500',
  high:          'ri-alert-fill text-orange-500',
  medium:        'ri-information-fill text-yellow-500',
  low:           'ri-checkbox-circle-fill text-green-500',
  informational: 'ri-information-line text-blue-500',
}

const SEVERITIES = ['critical', 'high', 'medium', 'low', 'informational'] as const

// ── Helper components ──────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string | null }) {
  const key = severity?.toLowerCase() ?? ''
  const cls = SEVERITY_CLASS[key] ?? 'bg-muted text-muted-foreground border-border'
  const icon = SEVERITY_ICON[key] ?? 'ri-circle-line text-muted-foreground'
  const label = severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : 'Unknown'
  return (
    <Badge variant="outline" className={`gap-1.5 font-medium ${cls}`}>
      <i className={`text-xs ${icon}`} />
      {label}
    </Badge>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved') {
    return (
      <Badge variant="outline" className="gap-1.5 text-green-700 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950">
        <i className="ri-shield-check-line text-xs" />
        Reviewed
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="gap-1.5">
      <i className="ri-robot-line text-xs" />
      Auto
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

interface Props {
  searchParams: Promise<{ page?: string; severity?: string }>
}

export default async function ChangesPage({ searchParams }: Props) {
  let userEmail: string
  try {
    const { user } = await withAuth({ ensureSignedIn: true })
    userEmail = user.email
  } catch {
    redirect('/sign-in')
  }

  const supabase = createServerClient()

  const { data: practice } = await supabase
    .from('practices')
    .select('id, name, tier')
    .eq('owner_email', userEmail)
    .maybeSingle()

  const { page: pageParam, severity: severityParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const severity = SEVERITIES.includes(severityParam as (typeof SEVERITIES)[number])
    ? severityParam
    : null

  let countQuery = supabase
    .from('changes')
    .select('id', { count: 'exact', head: true })
    .in('review_status', ['auto_approved', 'approved'])
    .eq('jurisdiction', 'FL')
  if (severity) countQuery = countQuery.eq('severity', severity)
  const { count: totalCount } = practice ? await countQuery : { count: 0 }

  const total = totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const from = (safePage - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  let dataQuery = supabase
    .from('changes')
    .select('id, severity, summary, jurisdiction, detected_at, review_status, sources(name)')
    .in('review_status', ['auto_approved', 'approved'])
    .eq('jurisdiction', 'FL')
    .order('detected_at', { ascending: false })
    .range(from, to)
  if (severity) dataQuery = dataQuery.eq('severity', severity)

  const { data, error } = practice ? await dataQuery : { data: null, error: null }

  const changes = (data ?? []) as Array<{
    id: string
    severity: string | null
    summary: string | null
    jurisdiction: string | null
    detected_at: string
    review_status: string
    sources: { name: string } | null
  }>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Regulatory Changes</h1>
          {practice ? (
            <p className="text-sm text-muted-foreground mt-0.5">
              {practice.name} &middot; {total.toLocaleString()} change{total !== 1 ? 's' : ''}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-0.5">Florida regulatory coverage</p>
          )}
        </div>
      </div>

      {/* Practice gate */}
      {!practice && (
        <Alert className="max-w-lg">
          <i className="ri-hospital-line text-base" />
          <AlertDescription>
            Your account is not linked to a practice. Contact{' '}
            <a href="mailto:cedaradmin@gmail.com" className="underline font-medium">cedaradmin@gmail.com</a>{' '}
            to get set up.
          </AlertDescription>
        </Alert>
      )}

      {practice && (
        <>
          {/* Severity filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/changes"
              className={`px-3 py-1.5 text-sm font-medium border transition-colors ${
                !severity
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground'
              }`}
            >
              All
            </Link>
            {SEVERITIES.map((s) => {
              const active = severity === s
              return (
                <Link
                  key={s}
                  href={`/changes?severity=${s}${page > 1 ? `&page=${page}` : ''}`}
                  className={`px-3 py-1.5 text-sm font-medium border transition-colors ${
                    active
                      ? SEVERITY_CLASS[s]
                      : 'bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Link>
              )
            })}
          </div>

          {/* Error state */}
          {error && (
            <Alert variant="destructive">
              <i className="ri-error-warning-line text-base" />
              <AlertDescription>
                Failed to load changes: {(error as { message: string }).message}
              </AlertDescription>
            </Alert>
          )}

          {/* Empty state */}
          {changes.length === 0 && !error && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <i className="ri-leaf-line text-4xl text-muted-foreground/40 mb-3" />
                <h2 className="text-base font-semibold text-foreground mb-1">No changes detected yet</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Cedar is monitoring Florida regulatory sources. Detected changes will appear here
                  after the next monitoring run.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Table */}
          {changes.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-36">Severity</TableHead>
                      <TableHead className="w-48">Source</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead className="w-24">Detected</TableHead>
                      <TableHead className="w-28">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {changes.map((change) => (
                      <TableRow key={change.id}>
                        <TableCell>
                          <SeverityBadge severity={change.severity} />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-foreground">
                            {change.sources?.name ?? 'Unknown Source'}
                          </span>
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            {change.jurisdiction ?? 'FL'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link href={`/changes/${change.id}`} className="group">
                            <p className="text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                              {change.summary ?? (
                                <span className="text-muted-foreground italic">No summary available</span>
                              )}
                            </p>
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {timeAgo(change.detected_at)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={change.review_status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {from + 1}&ndash;{Math.min(to + 1, total)} of {total.toLocaleString()}
              </p>
              <div className="flex items-center gap-2">
                {safePage > 1 ? (
                  <Link
                    href={`/changes?page=${safePage - 1}${severity ? `&severity=${severity}` : ''}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors"
                  >
                    <i className="ri-arrow-left-line" /> Previous
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md text-muted-foreground/50 cursor-not-allowed">
                    <i className="ri-arrow-left-line" /> Previous
                  </span>
                )}
                <span className="text-sm text-muted-foreground px-2">
                  {safePage} / {totalPages}
                </span>
                {safePage < totalPages ? (
                  <Link
                    href={`/changes?page=${safePage + 1}${severity ? `&severity=${severity}` : ''}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors"
                  >
                    Next <i className="ri-arrow-right-line" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md text-muted-foreground/50 cursor-not-allowed">
                    Next <i className="ri-arrow-right-line" />
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
