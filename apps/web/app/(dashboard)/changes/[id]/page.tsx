import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '../../../../lib/db/client'
import type { DiffBlock } from '../../../../lib/changes/diff'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { SectionHeading } from '@/components/SectionHeading'
import { AiBadge, AiDisclaimer } from '@/components/AiBadge'
import { HashWithCopy } from '@/components/HashWithCopy'
import { timeAgo } from '@/lib/format'

function DiffViewer({ blocks }: { blocks: DiffBlock[] }) {
  return (
    <div className="font-mono text-xs border overflow-auto max-h-96">
      {blocks.map((block, i) => {
        const lines = block.content.split('\n')
        return lines.map((line, j) => {
          let rowCls = ''
          let prefix = ' '
          if (block.type === 'added') { rowCls = 'bg-green-50'; prefix = '+' }
          if (block.type === 'removed') { rowCls = 'bg-red-50'; prefix = '-' }
          return (
            <div key={`${i}-${j}`} className={`flex ${rowCls}`}>
              <span className="select-none w-6 shrink-0 text-center opacity-70 border-r">{prefix}</span>
              <span className={`px-3 py-0.5 whitespace-pre-wrap break-all ${rowCls}`}>{line}</span>
            </div>
          )
        })
      })}
    </div>
  )
}

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = createServerClient()
  const { data } = await supabase.from('changes').select('summary, sources(name)').eq('id', id).single()
  const src = (data?.sources as { name: string } | null)?.name ?? 'Change'
  return { title: `${src} — Cedar` }
}

export default async function ChangeDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = createServerClient()

  const { data: change, error } = await supabase.from('changes').select('*, sources(name, url)').eq('id', id).single()
  if (error || !change) notFound()

  const c = change as { id: string; severity: string | null; summary: string | null; jurisdiction: string | null; detected_at: string; review_status: string; chain_sequence: number | null; hash: string | null; normalized_diff: DiffBlock[] | null; sources: { name: string; url: string } | null }
  const blocks = Array.isArray(c.normalized_diff) ? c.normalized_diff as DiffBlock[] : null

  return (
    <div className="max-w-4xl">
      <Link href="/changes" className="inline-flex items-center gap-1.5 text-sm hover:underline mb-6 transition-colors">&larr; All changes</Link>

      <div className="flex items-start gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <SeverityBadge severity={c.severity} />
            <time dateTime={new Date(c.detected_at).toISOString()} className="text-sm">{timeAgo(c.detected_at)}</time>
          </div>
          <h1 className="text-2xl font-bold leading-tight">{c.summary ?? 'Regulatory change detected'}</h1>
          <p className="text-sm mt-1">{c.sources?.name ?? 'Unknown source'} &middot; Change detected <time dateTime={new Date(c.detected_at).toISOString()}>{new Date(c.detected_at).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</time></p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="flex flex-col gap-6">
            <div className="border rounded">
              <div className="px-4 pt-4 pb-3"><div className="flex items-center gap-2"><SectionHeading as="h2">AI summary</SectionHeading><AiBadge /></div></div>
              <div className="p-4">{c.summary ? (<><p className="text-sm leading-relaxed">{c.summary}</p><AiDisclaimer /></>) : (<p className="text-sm italic">No AI summary available for this change.</p>)}</div>
            </div>
            <div className="border rounded">
              <div className="px-4 pt-4 pb-3"><SectionHeading as="h2">Detected changes</SectionHeading></div>
              <div className="p-4">{blocks && blocks.length > 0 ? <DiffViewer blocks={blocks} /> : (<div className="border border-dashed p-8 text-center"><p className="text-sm">Full text change detected &mdash; no structured diff available.</p></div>)}</div>
            </div>
          </div>
        </div>
        <aside>
          <div className="flex flex-col gap-4">
            <div className="border rounded">
              <div className="px-4 pt-4 pb-3"><SectionHeading as="h2">Details</SectionHeading></div>
              <div className="p-4">
                <dl className="space-y-3">
                  <div><dt className="text-xs">Jurisdiction</dt><dd className="text-sm font-medium mt-0.5">{c.jurisdiction ?? 'FL'}</dd></div>
                  <div><dt className="text-xs">Review Status</dt><dd className="mt-0.5"><StatusBadge status={c.review_status} /></dd></div>
                  {c.chain_sequence !== null && <div><dt className="text-xs">Chain Sequence</dt><dd className="text-sm font-medium mt-0.5">#{c.chain_sequence}</dd></div>}
                  {c.hash && <div><dt className="text-xs">Content Hash</dt><dd className="mt-0.5"><HashWithCopy hash={c.hash} /></dd></div>}
                  {c.sources?.url && <div><dt className="text-xs">Source URL</dt><dd className="mt-0.5"><a href={c.sources.url} target="_blank" rel="noopener noreferrer" className="text-xs underline break-all">{c.sources.url.length > 50 ? c.sources.url.slice(0, 50) + '…' : c.sources.url}</a></dd></div>}
                </dl>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
