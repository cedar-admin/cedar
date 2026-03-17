import { redirect } from 'next/navigation'
import Link from 'next/link'
import { withAuth } from '@workos-inc/authkit-nextjs'
import { createServerClient } from '../../../lib/db/client'

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25

const SEVERITY_STYLES: Record<string, { badge: string; dot: string }> = {
  critical:      { badge: 'bg-red-100 text-red-800 border-red-200',        dot: 'bg-red-500' },
  high:          { badge: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
  medium:        { badge: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' },
  low:           { badge: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-500' },
  informational: { badge: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
}

const SEVERITIES = ['critical', 'high', 'medium', 'low', 'informational'] as const

// ── Helper components ──────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string | null }) {
  const key = severity?.toLowerCase() ?? ''
  const s = SEVERITY_STYLES[key] ?? { badge: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : 'Unknown'}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved') {
    return (
      <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
        Approved
      </span>
    )
  }
  return (
    <span className="text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
      Auto-approved
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

function NoPracticeGate() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-10 text-center max-w-lg mx-auto mt-16">
      <div className="text-3xl mb-3">🏥</div>
      <h2 className="text-base font-semibold text-amber-900 mb-1">No practice configured</h2>
      <p className="text-sm text-amber-700">
        Your account is not linked to a practice. Contact{' '}
        <a href="mailto:support@cedarlegal.io" className="underline">support@cedarlegal.io</a>{' '}
        to get set up.
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{ page?: string; severity?: string }>
}

export default async function ChangesPage({ searchParams }: Props) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  let userEmail: string
  try {
    const { user } = await withAuth({ ensureSignedIn: true })
    userEmail = user.email
  } catch {
    redirect('/sign-in')
  }

  const supabase = createServerClient()

  // ── Practice resolution ─────────────────────────────────────────────────────
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

  // ── Queries ─────────────────────────────────────────────────────────────────
  let countQuery = supabase
    .from('changes')
    .select('id', { count: 'exact', head: true })
    .in('review_status', ['auto_approved', 'approved'])
    .eq('jurisdiction', 'FL')
  if (severity) countQuery = countQuery.eq('severity', severity)
  const { count: totalCount } = await countQuery

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

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Regulatory Changes</h1>
          {practice ? (
            <p className="text-sm text-gray-500 mt-0.5">
              {practice.name} &middot; {total.toLocaleString()} change{total !== 1 ? 's' : ''}
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-0.5">Florida regulatory coverage</p>
          )}
        </div>
      </div>

      {/* Practice gate */}
      {!practice && <NoPracticeGate />}

      {practice && (
        <>
          {/* Severity filter */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <Link
              href="/changes"
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                !severity
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              All
            </Link>
            {SEVERITIES.map((s) => {
              const style = SEVERITY_STYLES[s]
              const active = severity === s
              return (
                <Link
                  key={s}
                  href={`/changes?severity=${s}${page > 1 ? `&page=${page}` : ''}`}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    active
                      ? `${style.badge} border-current`
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Link>
              )
            })}
          </div>

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700">
              Failed to load changes: {(error as { message: string }).message}
            </div>
          )}

          {/* Empty state */}
          {changes.length === 0 && !error && (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
              <div className="text-4xl mb-3">🪵</div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">No changes detected yet</h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Cedar is monitoring Florida regulatory sources. Detected changes will appear here
                after the next monitoring run.
              </p>
            </div>
          )}

          {/* Table */}
          {changes.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3 w-32">Severity</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-48">Source</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Summary</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-24">Detected</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-32">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {changes.map((change) => (
                    <tr key={change.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <SeverityBadge severity={change.severity} />
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {change.sources?.name ?? 'Unknown Source'}
                        </span>
                        <span className="block text-xs text-gray-400 mt-0.5">{change.jurisdiction ?? 'FL'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <Link href={`/changes/${change.id}`} className="group">
                          <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {change.summary ?? <span className="text-gray-400 italic">No summary available</span>}
                          </p>
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {timeAgo(change.detected_at)}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={change.review_status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Showing {from + 1}&ndash;{Math.min(to + 1, total)} of {total.toLocaleString()}
              </p>
              <div className="flex items-center gap-2">
                {safePage > 1 ? (
                  <Link
                    href={`/changes?page=${safePage - 1}${severity ? `&severity=${severity}` : ''}`}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    &larr; Previous
                  </Link>
                ) : (
                  <span className="px-3 py-1.5 text-sm border border-gray-100 rounded-lg text-gray-300 cursor-not-allowed">
                    &larr; Previous
                  </span>
                )}
                <span className="text-sm text-gray-600 px-2">
                  Page {safePage} of {totalPages}
                </span>
                {safePage < totalPages ? (
                  <Link
                    href={`/changes?page=${safePage + 1}${severity ? `&severity=${severity}` : ''}`}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Next &rarr;
                  </Link>
                ) : (
                  <span className="px-3 py-1.5 text-sm border border-gray-100 rounded-lg text-gray-300 cursor-not-allowed">
                    Next &rarr;
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
