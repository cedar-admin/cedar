import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '../../../../lib/db/client'
import type { DiffBlock } from '../../../../lib/changes/diff'
import { Card, Box, Flex, Heading, Text } from '@radix-ui/themes'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { timeAgo } from '@/lib/format'
import ReviewActions from '../ReviewActions'

// ── Metadata ──────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = createServerClient()
  const { data } = await supabase
    .from('changes')
    .select('sources(name)')
    .eq('id', id)
    .single()
  const sourceName = (data?.sources as { name: string } | null)?.name ?? 'Change'
  return { title: `${sourceName} — Cedar Admin` }
}

// ── Diff Viewer ───────────────────────────────────────────────────────────────

function DiffViewer({ blocks }: { blocks: DiffBlock[] }) {
  return (
    <div className="font-mono text-xs border border-[var(--cedar-border-subtle)] overflow-auto max-h-96 bg-[var(--cedar-card-hover)]">
      {blocks.map((block, i) => {
        const lines = block.content.split('\n')
        return lines.map((line, j) => {
          let rowCls = 'bg-transparent text-[var(--cedar-text-secondary)]'
          let gutterCls = 'text-[var(--cedar-text-secondary)] border-r border-[var(--cedar-border-subtle)]'
          let prefix = ' '
          if (block.type === 'added') {
            rowCls = 'bg-[var(--cedar-diff-added-bg)]'
            gutterCls = 'text-[var(--cedar-diff-added-text)] border-r border-[var(--cedar-diff-added-border)]'
            prefix = '+'
          }
          if (block.type === 'removed') {
            rowCls = 'bg-[var(--cedar-diff-removed-bg)]'
            gutterCls = 'text-[var(--cedar-diff-removed-text)] border-r border-[var(--cedar-diff-removed-border)]'
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
        className="inline-flex items-center gap-1.5 text-sm text-[var(--cedar-text-secondary)] hover:text-[var(--cedar-text-primary)] mb-6 transition-colors"
      >
        <i className="ri-arrow-left-line" aria-hidden="true" />
        Review Queue
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-1">
          <Flex align="center" gap="3" mb="2">
            <SeverityBadge severity={c.severity} />
            <StatusBadge status={c.review_status} />
            <Text as="span" size="2" color="gray">{timeAgo(c.detected_at)}</Text>
          </Flex>
          <Heading as="h1" size="5" weight="bold">
            {c.sources?.name ?? 'Unknown Source'}
          </Heading>
          <Text as="span" size="2" color="gray" className="mt-0.5 block">
            Change detected{' '}
            <time dateTime={c.detected_at}>
              {new Date(c.detected_at).toLocaleString('en-US', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </time>
          </Text>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* AI Summary */}
          <Card>
            <Box px="4" pt="4" pb="3">
              <Heading as="h2" size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                AI Summary
              </Heading>
            </Box>
            <Box px="4" pb="4">
              {c.summary ? (
                <Text as="span" size="2" className="leading-relaxed block">{c.summary}</Text>
              ) : (
                <Text as="span" size="2" color="gray" className="italic">
                  No AI summary available for this change.
                </Text>
              )}
            </Box>
          </Card>

          {/* Diff Viewer */}
          <Card>
            <Box px="4" pt="4" pb="3">
              <Heading as="h2" size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                Detected Changes
              </Heading>
            </Box>
            <Box px="4" pb="4">
              {blocks && blocks.length > 0 ? (
                <DiffViewer blocks={blocks} />
              ) : (
                <div className="border border-dashed border-[var(--cedar-border-subtle)] p-8 text-center">
                  <Text as="span" size="2" color="gray">
                    Full text change detected &mdash; no structured diff available.
                  </Text>
                </div>
              )}
            </Box>
          </Card>

          {/* Review Actions — only show for pending changes */}
          {isPending && (
            <Card>
              <Box px="4" pt="4" pb="3">
                <Heading as="h2" size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                  Review Decision
                </Heading>
              </Box>
              <Box px="4" pb="4">
                <ReviewActions changeId={c.id} sourceName={c.sources?.name ?? 'Unknown Source'} />
              </Box>
            </Card>
          )}
        </div>

        {/* Metadata sidebar */}
        <aside className="flex flex-col gap-4">
          <Card>
            <Box px="4" pt="4" pb="3">
              <Heading as="h2" size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                Details
              </Heading>
            </Box>
            <Box px="4" pb="4">
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-[var(--cedar-text-secondary)]">Jurisdiction</dt>
                  <dd className="text-sm font-medium text-[var(--cedar-text-primary)] mt-0.5">
                    {c.jurisdiction ?? 'FL'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--cedar-text-secondary)]">Review Status</dt>
                  <dd className="mt-0.5">
                    <StatusBadge status={c.review_status} />
                  </dd>
                </div>
                {reviewedBy && (
                  <div>
                    <dt className="text-xs text-[var(--cedar-text-secondary)]">Reviewed By</dt>
                    <dd className="text-sm text-[var(--cedar-text-primary)] mt-0.5">{reviewedBy}</dd>
                  </div>
                )}
                {reviewedAt && (
                  <div>
                    <dt className="text-xs text-[var(--cedar-text-secondary)]">Reviewed At</dt>
                    <dd className="text-sm text-[var(--cedar-text-primary)] mt-0.5">
                      <time dateTime={reviewedAt}>
                        {new Date(reviewedAt).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </time>
                    </dd>
                  </div>
                )}
                {reviewNotes && (
                  <div>
                    <dt className="text-xs text-[var(--cedar-text-secondary)]">Review Notes</dt>
                    <dd className="text-sm text-[var(--cedar-text-primary)] mt-0.5">{reviewNotes}</dd>
                  </div>
                )}
                {c.chain_sequence !== null && (
                  <div>
                    <dt className="text-xs text-[var(--cedar-text-secondary)]">Chain Sequence</dt>
                    <dd className="text-sm font-medium text-[var(--cedar-text-primary)] mt-0.5">
                      #{c.chain_sequence}
                    </dd>
                  </div>
                )}
                {c.hash && (
                  <div>
                    <dt className="text-xs text-[var(--cedar-text-secondary)]">Content Hash</dt>
                    <dd className="text-xs font-mono text-[var(--cedar-text-secondary)] mt-0.5 break-all">
                      {c.hash.slice(0, 16)}&hellip;
                    </dd>
                  </div>
                )}
                {c.sources?.url && (
                  <div>
                    <dt className="text-xs text-[var(--cedar-text-secondary)]">Source URL</dt>
                    <dd className="mt-0.5">
                      <a
                        href={c.sources.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--cedar-interactive-focus)] underline break-all transition-colors"
                      >
                        {c.sources.url.length > 50
                          ? c.sources.url.slice(0, 50) + '…'
                          : c.sources.url}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </Box>
          </Card>
        </aside>
      </div>
    </div>
  )
}
