import { redirect } from 'next/navigation'
import Link from 'next/link'
import { withAuth } from '@workos-inc/authkit-nextjs'
import { createServerClient } from '../../../lib/db/client'
import { CedarTable } from '@/components/CedarTable'
import { SEVERITIES } from '@/lib/ui-constants'
import { FilterPills } from '@/components/FilterPills'
import { ChangeTableRow } from './ChangeTableRow'

export const metadata = { title: 'Changes — Cedar' }

const SEVERITY_ACTIVE_CLASS: Record<string, string> = {
  critical:      'bg-red-100 text-red-800 border-red-300',
  high:          'bg-orange-100 text-orange-800 border-orange-300',
  medium:        'bg-amber-100 text-amber-800 border-amber-300',
  low:           'bg-green-100 text-green-800 border-green-300',
  informational: 'bg-blue-100 text-blue-800 border-blue-300',
}

const PAGE_SIZE = 25

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
  const severity = SEVERITIES.includes(severityParam as (typeof SEVERITIES)[number]) ? severityParam : null

  let countQuery = supabase.from('changes').select('id', { count: 'exact', head: true }).in('review_status', ['auto_approved', 'approved']).eq('jurisdiction', 'FL')
  if (severity) countQuery = countQuery.eq('severity', severity)
  const { count: totalCount } = practice ? await countQuery : { count: 0 }

  const total = totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const from = (safePage - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  let dataQuery = supabase.from('changes').select('id, severity, summary, jurisdiction, detected_at, review_status, sources(name)').in('review_status', ['auto_approved', 'approved']).eq('jurisdiction', 'FL').order('detected_at', { ascending: false }).range(from, to)
  if (severity) dataQuery = dataQuery.eq('severity', severity)

  const { data, error } = practice ? await dataQuery : { data: null, error: null }

  const changes = (data ?? []) as Array<{ id: string; severity: string | null; summary: string | null; jurisdiction: string | null; detected_at: string; review_status: string; sources: { name: string } | null }>

  const allPill = { label: 'All', href: '/changes', isActive: !severity }
  const severityPills = SEVERITIES.map((s) => ({
    label: s.charAt(0).toUpperCase() + s.slice(1),
    href: `/changes?severity=${s}`,
    isActive: severity === s,
    activeClass: SEVERITY_ACTIVE_CLASS[s],
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Changes</h1>
          {practice ? (
            <p className="text-sm mt-1">{practice.name} &middot; {total.toLocaleString()} change{total !== 1 ? 's' : ''}</p>
          ) : (
            <p className="text-sm mt-1">Florida regulatory coverage</p>
          )}
        </div>
      </div>

      {!practice && (
        <div className="max-w-lg p-4 border rounded">
          <p className="text-sm">Your account is not linked to a practice. Contact <a href="mailto:cedaradmin@gmail.com" className="underline font-medium">cedaradmin@gmail.com</a> to get set up.</p>
        </div>
      )}

      {practice && (
        <>
          <FilterPills pills={[allPill, ...severityPills]} />

          {error && (
            <div className="p-4 border border-red-300 rounded">
              <p className="text-sm">Failed to load changes: {(error as { message: string }).message}</p>
            </div>
          )}

          {changes.length === 0 && !error && (
            <div className="border rounded p-4">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-4xl opacity-40 mb-3" aria-hidden="true" />
                <h2 className="text-base font-bold mb-1">No changes detected yet</h2>
                <p className="text-sm max-w-sm">Cedar is monitoring Florida regulatory sources. Detected changes will appear here after the next monitoring run.</p>
              </div>
            </div>
          )}

          {changes.length > 0 && (
            <div className="border rounded">
              <CedarTable surface="nested">
                <thead>
                  <tr>
                    <th className="w-36">Severity</th>
                    <th className="w-48">Source</th>
                    <th>Summary</th>
                    <th className="w-24">Detected</th>
                    <th className="w-28">Status</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {changes.map((change) => (
                    <ChangeTableRow key={change.id} change={change} />
                  ))}
                </tbody>
              </CedarTable>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm">Showing {from + 1}&ndash;{Math.min(to + 1, total)} of {total.toLocaleString()}</p>
              <div className="flex items-center gap-2">
                {safePage > 1 ? (
                  <Link href={`/changes?page=${safePage - 1}${severity ? `&severity=${severity}` : ''}`} aria-label="Go to previous page" className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded hover:bg-gray-50 transition-colors">&larr; Previous</Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded opacity-50 cursor-not-allowed">&larr; Previous</span>
                )}
                <span className="text-sm px-2">{safePage} / {totalPages}</span>
                {safePage < totalPages ? (
                  <Link href={`/changes?page=${safePage + 1}${severity ? `&severity=${severity}` : ''}`} aria-label="Go to next page" className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded hover:bg-gray-50 transition-colors">Next &rarr;</Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded opacity-50 cursor-not-allowed">Next &rarr;</span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
