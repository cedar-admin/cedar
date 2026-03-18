import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '../../../../lib/db/client'
import type { DiffBlock } from '../../../../lib/changes/diff'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { timeAgo } from '@/lib/format'
import ReviewActions from '../ReviewActions'

// ── Diff Viewer ───────────────────────────────────────────────────────────────

function DiffViewer({ blocks }: { blocks: DiffBlock[] }) {
  return (
    <div className="font-mono text-xs border border-border overflow-auto max-h-96 bg-card">
      {blocks.map((block, i) => {
        const lines = block.content.split('\n')
        return lines.map((line, j) => {
          let rowCls = 'bg-card text-muted-foreground'
          let gutterCls = 'text-muted-foreground border-r border-border'
          let prefix = ' '
          if (block.type === 'added') {
            rowCls = 'bg-green-50 dark:bg-green-950/40'
            gutterCls = 'text-green-600 dark:text-green-400 border-r border-green-200 dark:border-green-800'
            prefix = '+'
          }
          if (block.type === 'removed') {
            rowCls = 'bg-red-50 dark:bg-red-950/40'
            gutterCls = 'text-red-600 dark:text-red-400 border-r border-red-200 dark:border-red-800'
            prefix = '-'
          }
          return (
            <div key={`${i}-${j}`} className={`flex ${rowCls}`}>
              <span className={`select-none w-6 shrink-0 text-center opacity-70 ${gutterCls}`}>
                {prefix}
              </span>
              <span className={`px-3 py-0.5 whitespace-pre-wrap break-all ${rowCls}`}>
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

export default async function ReviewDetailPage({ params }: Props) {
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

  // HITL columns from migration 016 — not yet in generated types
  const raw = change as Record<string, unknown>
  const reviewedBy = raw.reviewed_by as string | null ?? null
  const reviewedAt = raw.reviewed_at as string | null ?? null
  const reviewNotes = raw.review_notes as string | null ?? null

  const blocks = Array.isArray(c.normalized_diff) ? c.normalized_diff as DiffBlock[] : null
  const isPending = c.review_status === 'pending'

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <Link
        href="/reviews"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <i className="ri-arrow-left-line" />
        Review Queue
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <SeverityBadge severity={c.severity} />
            <StatusBadge status={c.review_status} />
            <span className="text-sm text-muted-foreground">{timeAgo(c.detected_at)}</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            {c.sources?.name ?? 'Unknown Source'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {c.summary ? (
                <p className="text-sm text-foreground leading-relaxed">{c.summary}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No AI summary available for this change.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Diff Viewer */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Detected Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {blocks && blocks.length > 0 ? (
                <DiffViewer blocks={blocks} />
              ) : (
                <div className="border border-dashed border-border p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Full text change detected &mdash; no structured diff available.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Actions — only show for pending changes */}
          {isPending && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Review Decision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewActions changeId={c.id} sourceName={c.sources?.name ?? 'Unknown Source'} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Metadata sidebar */}
        <aside className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Jurisdiction</dt>
                  <dd className="text-sm font-medium text-foreground mt-0.5">
                    {c.jurisdiction ?? 'FL'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Review Status</dt>
                  <dd className="mt-0.5">
                    <StatusBadge status={c.review_status} />
                  </dd>
                </div>
                {reviewedBy && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Reviewed By</dt>
                    <dd className="text-sm text-foreground mt-0.5">{reviewedBy}</dd>
                  </div>
                )}
                {reviewedAt && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Reviewed At</dt>
                    <dd className="text-sm text-foreground mt-0.5">
                      {new Date(reviewedAt).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </dd>
                  </div>
                )}
                {reviewNotes && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Review Notes</dt>
                    <dd className="text-sm text-foreground mt-0.5">{reviewNotes}</dd>
                  </div>
                )}
                {c.chain_sequence !== null && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Chain Sequence</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">
                      #{c.chain_sequence}
                    </dd>
                  </div>
                )}
                {c.hash && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Content Hash</dt>
                    <dd className="text-xs font-mono text-muted-foreground mt-0.5 break-all">
                      {c.hash.slice(0, 16)}&hellip;
                    </dd>
                  </div>
                )}
                {c.sources?.url && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Source URL</dt>
                    <dd className="mt-0.5">
                      <a
                        href={c.sources.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:text-primary/80 underline break-all transition-colors"
                      >
                        {c.sources.url.length > 50
                          ? c.sources.url.slice(0, 50) + '…'
                          : c.sources.url}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
