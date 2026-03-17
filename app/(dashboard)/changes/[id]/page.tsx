import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '../../../../lib/db/client'
import type { DiffBlock } from '../../../../lib/changes/diff'

// ── Helpers ───────────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<string, { badge: string; dot: string }> = {
  critical:      { badge: 'bg-red-100 text-red-800 border-red-200',        dot: 'bg-red-500' },
  high:          { badge: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
  medium:        { badge: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' },
  low:           { badge: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-500' },
  informational: { badge: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
}

function SeverityBadge({ severity }: { severity: string | null }) {
  const key = severity?.toLowerCase() ?? ''
  const s = SEVERITY_STYLES[key] ?? { badge: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${s.badge}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      {severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : 'Unknown'}
    </span>
  )
}

function ReviewStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved:     'text-green-700 bg-green-50 border-green-200',
    auto_approved: 'text-gray-600 bg-gray-50 border-gray-200',
    pending:      'text-amber-700 bg-amber-50 border-amber-200',
    rejected:     'text-red-700 bg-red-50 border-red-200',
  }
  const cls = map[status] ?? 'text-gray-600 bg-gray-50 border-gray-200'
  const label = status === 'auto_approved' ? 'Auto-approved' : status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span className={`inline-block text-xs font-medium border px-2 py-0.5 rounded-full ${cls}`}>
      {label}
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

// ── Diff Viewer ───────────────────────────────────────────────────────────────

function DiffViewer({ blocks }: { blocks: DiffBlock[] }) {
  return (
    <div className="font-mono text-xs rounded-lg border border-gray-200 overflow-auto max-h-96 bg-white">
      {blocks.map((block, i) => {
        const lines = block.content.split('\n')
        return lines.map((line, j) => {
          let bg = 'bg-white'
          let text = 'text-gray-600'
          let prefix = ' '
          if (block.type === 'added')   { bg = 'bg-green-50'; text = 'text-green-800'; prefix = '+' }
          if (block.type === 'removed') { bg = 'bg-red-50';   text = 'text-red-800';   prefix = '-' }
          return (
            <div key={`${i}-${j}`} className={`flex ${bg}`}>
              <span className={`select-none w-6 shrink-0 text-center ${text} opacity-60 border-r border-gray-100`}>
                {prefix}
              </span>
              <span className={`px-3 py-0.5 whitespace-pre-wrap break-all ${text}`}>
                {line}
              </span>
            </div>
          )
        })
      })}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>
}

export default async function ChangeDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = createServerClient()

  const { data: change, error } = await supabase
    .from('changes')
    .select('*, sources(name, url)')
    .eq('id', id)
    .single()

  if (error || !change) {
    notFound()
  }

  const c = change as {
    id: string
    severity: string | null
    summary: string | null
    jurisdiction: string | null
    detected_at: string
    review_status: string
    chain_sequence: number | null
    hash: string | null
    normalized_diff: DiffBlock[] | null
    sources: { name: string; url: string } | null
  }

  const blocks = Array.isArray(c.normalized_diff) ? c.normalized_diff as DiffBlock[] : null

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <Link
        href="/changes"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        All changes
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <SeverityBadge severity={c.severity} />
            <span className="text-sm text-gray-500">{timeAgo(c.detected_at)}</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            {c.sources?.name ?? 'Unknown Source'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Change detected {new Date(c.detected_at).toLocaleString('en-US', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2 space-y-6">
          {/* AI Summary */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">AI Summary</h2>
            {c.summary ? (
              <p className="text-sm text-gray-800 leading-relaxed">{c.summary}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">No AI summary available for this change.</p>
            )}
          </section>

          {/* Diff Viewer */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Detected Changes</h2>
            {blocks && blocks.length > 0 ? (
              <DiffViewer blocks={blocks} />
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">
                <p className="text-sm text-gray-500">Full text change detected &mdash; no structured diff available.</p>
              </div>
            )}
          </section>

          {/* Disclaimer */}
          <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong className="font-semibold">Not legal advice.</strong> This summary was generated by AI and may not reflect the full scope or legal effect of the regulatory change.
              Consult a licensed attorney before acting on any regulatory change.
            </p>
          </div>
        </div>

        {/* Metadata sidebar */}
        <aside className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-400">Jurisdiction</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">{c.jurisdiction ?? 'FL'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Review Status</dt>
                <dd className="mt-0.5">
                  <ReviewStatusBadge status={c.review_status} />
                </dd>
              </div>
              {c.chain_sequence !== null && (
                <div>
                  <dt className="text-xs text-gray-400">Chain Sequence</dt>
                  <dd className="text-sm font-medium text-gray-900 mt-0.5">#{c.chain_sequence}</dd>
                </div>
              )}
              {c.hash && (
                <div>
                  <dt className="text-xs text-gray-400">Content Hash</dt>
                  <dd className="text-xs font-mono text-gray-500 mt-0.5 break-all">{c.hash.slice(0, 16)}&hellip;</dd>
                </div>
              )}
              {c.sources?.url && (
                <div>
                  <dt className="text-xs text-gray-400">Source URL</dt>
                  <dd className="mt-0.5">
                    <a
                      href={c.sources.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {c.sources.url.length > 50 ? c.sources.url.slice(0, 50) + '…' : c.sources.url}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}
