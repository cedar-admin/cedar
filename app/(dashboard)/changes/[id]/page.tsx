import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '../../../../lib/db/client'
import type { DiffBlock } from '../../../../lib/changes/diff'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LegalDisclaimer } from '@/components/LegalDisclaimer'

// ── Severity helpers ───────────────────────────────────────────────────────────

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

function SeverityBadge({ severity }: { severity: string | null }) {
  const key = severity?.toLowerCase() ?? ''
  const cls = SEVERITY_CLASS[key] ?? ''
  const dot = SEVERITY_DOT[key] ?? 'bg-muted-foreground/50'
  const label = severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : 'Unknown'
  return (
    <Badge variant="outline" className={`gap-1.5 text-sm px-3 py-1 font-semibold ${cls}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
      {label}
    </Badge>
  )
}

const STATUS_CLASS: Record<string, string> = {
  approved:      'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800',
  auto_approved: '',
  pending:       'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800',
  rejected:      'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800',
}

const STATUS_LABEL: Record<string, string> = {
  approved:      'Approved',
  auto_approved: 'Auto-approved',
  pending:       'Pending',
  rejected:      'Rejected',
}

function ReviewStatusBadge({ status }: { status: string }) {
  const cls = STATUS_CLASS[status] ?? ''
  const label = STATUS_LABEL[status] ?? status
  return (
    <Badge variant="outline" className={cls}>
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
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <i className="ri-arrow-left-line" />
        All changes
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <SeverityBadge severity={c.severity} />
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

          <LegalDisclaimer />
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
                    <ReviewStatusBadge status={c.review_status} />
                  </dd>
                </div>
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
