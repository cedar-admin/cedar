import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '../../../../lib/db/client'
import type { DiffBlock } from '../../../../lib/changes/diff'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { timeAgo } from '@/lib/format'
import ReviewActions from '../ReviewActions'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = createServerClient()
  const { data } = await supabase.from('changes').select('sources(name)').eq('id', id).single()
  const sourceName = (data?.sources as { name: string } | null)?.name ?? 'Change'
  return { title: `${sourceName} — Cedar Admin` }
}

function DiffViewer({ blocks }: { blocks: DiffBlock[] }) {
  return (
    <div className="font-mono text-xs border overflow-auto max-h-96">
      {blocks.map((block, i) => {
        const lines = block.content.split('\n')
        return lines.map((line, j) => {
          let rowCls = ''; let prefix = ' '
          if (block.type === 'added') { rowCls = 'bg-green-50'; prefix = '+' }
          if (block.type === 'removed') { rowCls = 'bg-red-50'; prefix = '-' }
          return (<div key={`${i}-${j}`} className={`flex ${rowCls}`}><span className="select-none w-6 shrink-0 text-center opacity-70 border-r">{prefix}</span><span className={`px-3 py-0.5 whitespace-pre-wrap break-all ${rowCls}`}>{line}</span></div>)
        })
      })}
    </div>
  )
}

export default async function ReviewDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = createServerClient()
  const { data: change, error } = await supabase.from('changes').select('*, sources(name, url)').eq('id', id).single()
  if (error || !change) notFound()

  const c = change as { id: string; severity: string | null; summary: string | null; jurisdiction: string | null; detected_at: string; review_status: string; chain_sequence: number | null; hash: string | null; normalized_diff: DiffBlock[] | null; sources: { name: string; url: string } | null }
  const raw = change as Record<string, unknown>
  const reviewedBy = raw.reviewed_by as string | null ?? null
  const reviewedAt = raw.reviewed_at as string | null ?? null
  const reviewNotes = raw.review_notes as string | null ?? null
  const blocks = Array.isArray(c.normalized_diff) ? c.normalized_diff as DiffBlock[] : null
  const isPending = c.review_status === 'pending'

  return (
    <div className="max-w-4xl">
      <Link href="/reviews" className="inline-flex items-center gap-1.5 text-sm hover:underline mb-6 transition-colors">&larr; Review Queue</Link>

      <div className="flex items-start gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2"><SeverityBadge severity={c.severity} /><StatusBadge status={c.review_status} /><span className="text-sm">{timeAgo(c.detected_at)}</span></div>
          <h1 className="text-xl font-bold">{c.sources?.name ?? 'Unknown Source'}</h1>
          <span className="text-sm mt-0.5 block">Change detected <time dateTime={c.detected_at}>{new Date(c.detected_at).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</time></span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <div className="border rounded">
            <div className="px-4 pt-4 pb-3"><h2 className="text-xs font-bold uppercase tracking-wide">AI Summary</h2></div>
            <div className="px-4 pb-4">{c.summary ? <span className="text-sm leading-relaxed block">{c.summary}</span> : <span className="text-sm italic">No AI summary available for this change.</span>}</div>
          </div>
          <div className="border rounded">
            <div className="px-4 pt-4 pb-3"><h2 className="text-xs font-bold uppercase tracking-wide">Detected Changes</h2></div>
            <div className="px-4 pb-4">{blocks && blocks.length > 0 ? <DiffViewer blocks={blocks} /> : <div className="border border-dashed p-8 text-center"><span className="text-sm">Full text change detected &mdash; no structured diff available.</span></div>}</div>
          </div>
          {isPending && (
            <div className="border rounded">
              <div className="px-4 pt-4 pb-3"><h2 className="text-xs font-bold uppercase tracking-wide">Review Decision</h2></div>
              <div className="px-4 pb-4"><ReviewActions changeId={c.id} sourceName={c.sources?.name ?? 'Unknown Source'} /></div>
            </div>
          )}
        </div>
        <aside className="flex flex-col gap-4">
          <div className="border rounded">
            <div className="px-4 pt-4 pb-3"><h2 className="text-xs font-bold uppercase tracking-wide">Details</h2></div>
            <div className="px-4 pb-4">
              <dl className="space-y-3">
                <div><dt className="text-xs">Jurisdiction</dt><dd className="text-sm font-medium mt-0.5">{c.jurisdiction ?? 'FL'}</dd></div>
                <div><dt className="text-xs">Review Status</dt><dd className="mt-0.5"><StatusBadge status={c.review_status} /></dd></div>
                {reviewedBy && <div><dt className="text-xs">Reviewed By</dt><dd className="text-sm mt-0.5">{reviewedBy}</dd></div>}
                {reviewedAt && <div><dt className="text-xs">Reviewed At</dt><dd className="text-sm mt-0.5"><time dateTime={reviewedAt}>{new Date(reviewedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</time></dd></div>}
                {reviewNotes && <div><dt className="text-xs">Review Notes</dt><dd className="text-sm mt-0.5">{reviewNotes}</dd></div>}
                {c.chain_sequence !== null && <div><dt className="text-xs">Chain Sequence</dt><dd className="text-sm font-medium mt-0.5">#{c.chain_sequence}</dd></div>}
                {c.hash && <div><dt className="text-xs">Content Hash</dt><dd className="text-xs font-mono mt-0.5 break-all">{c.hash.slice(0, 16)}&hellip;</dd></div>}
                {c.sources?.url && <div><dt className="text-xs">Source URL</dt><dd className="mt-0.5"><a href={c.sources.url} target="_blank" rel="noopener noreferrer" className="text-xs underline break-all transition-colors">{c.sources.url.length > 50 ? c.sources.url.slice(0, 50) + '…' : c.sources.url}</a></dd></div>}
              </dl>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
