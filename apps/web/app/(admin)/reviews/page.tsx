import type { Metadata } from 'next'
import Link from 'next/link'
import { createServerClient } from '../../../lib/db/client'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { timeAgo } from '@/lib/format'

export const metadata: Metadata = { title: 'Review Queue — Cedar Admin' }

type FilterTab = 'pending' | 'approved' | 'rejected' | 'all'
const TABS: { value: FilterTab; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
]

interface Props { searchParams: Promise<{ filter?: string }> }

export default async function ReviewQueuePage({ searchParams }: Props) {
  const sp = await searchParams
  const filter: FilterTab = sp.filter === 'approved' || sp.filter === 'rejected' || sp.filter === 'all' ? sp.filter : 'pending'
  const supabase = createServerClient()

  let query = supabase.from('changes').select('id, severity, summary, jurisdiction, detected_at, review_status, source_id, sources(name, url)').order('detected_at', { ascending: false })
  if (filter !== 'all') query = query.eq('review_status', filter)
  const { data: rows, error } = await query

  const changes = (rows ?? []) as Array<{ id: string; severity: string | null; summary: string | null; jurisdiction: string | null; detected_at: string; review_status: string; source_id: string; sources: { name: string; url: string } | null }>
  const criticalCount = filter === 'pending' ? changes.filter(c => c.severity === 'critical').length : 0
  const highCount = filter === 'pending' ? changes.filter(c => c.severity === 'high').length : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Review Queue</h1>
          <span className="text-sm mt-1 block">Changes requiring attorney review before delivery to practices</span>
        </div>
        <div className="flex items-center gap-3">
          {criticalCount > 0 && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />{criticalCount} Critical — 4h SLA</span>}
          {highCount > 0 && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded">{highCount} High — 24h SLA</span>}
        </div>
      </div>

      <div className="flex items-center gap-1 border-b">
        {TABS.map((tab) => (
          <Link key={tab.value} href={tab.value === 'pending' ? '/reviews' : `/reviews?filter=${tab.value}`}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${filter === tab.value ? 'border-current' : 'border-transparent'}`}>
            {tab.label}{filter === tab.value && <span className="ml-2 text-xs">({changes.length})</span>}
          </Link>
        ))}
      </div>

      {error && <div className="p-4 border border-red-300 rounded"><p className="text-sm">Failed to load queue: {error.message}</p></div>}

      {changes.length === 0 && !error && (
        <div className="border rounded p-4">
          <div className="flex flex-col items-center justify-center py-9 text-center">
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4"><span className="text-2xl">✓</span></div>
            <span className="text-base font-bold mb-1 block">{filter === 'pending' ? 'Queue is clear' : `No ${filter} changes`}</span>
            <span className="text-sm">{filter === 'pending' ? 'No changes are awaiting review. Check back after the next monitoring run.' : `No changes with status "${filter}" found.`}</span>
          </div>
        </div>
      )}

      {changes.length > 0 && (
        <div className="border rounded">
          <div className="p-0">
            <div className="divide-y">
              {changes.map((change) => (
                <Link key={change.id} href={`/reviews/${change.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <SeverityBadge severity={change.severity} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{change.summary ?? <span className="italic">No summary available</span>}</p>
                    <p className="text-xs mt-0.5">{change.sources?.name ?? 'Unknown Source'} · {change.jurisdiction ?? 'FL'}</p>
                  </div>
                  {filter === 'all' && <StatusBadge status={change.review_status} />}
                  <span className="text-xs shrink-0"><time dateTime={change.detected_at}>{timeAgo(change.detected_at)}</time></span>
                  <span aria-hidden="true">&rsaquo;</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border rounded">
        <p className="text-sm"><strong className="font-semibold">Review Rules:</strong> <strong>Critical &amp; High</strong> → attorney review required before delivery. <strong>Medium, Low, Informational</strong> → auto-approved and delivered without review.</p>
      </div>
    </div>
  )
}
