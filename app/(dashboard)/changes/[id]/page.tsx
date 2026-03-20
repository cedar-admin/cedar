import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '../../../../lib/db/client'
import type { DiffBlock } from '../../../../lib/changes/diff'
import { Card, Box, Flex, Heading, Text } from '@radix-ui/themes'
import { LegalDisclaimer } from '@/components/LegalDisclaimer'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { timeAgo } from '@/lib/format'

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
        className="inline-flex items-center gap-1.5 text-sm text-[var(--gray-11)] hover:text-[var(--gray-12)] mb-6 transition-colors"
      >
        <i className="ri-arrow-left-line" />
        All changes
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <SeverityBadge severity={c.severity} />
            <span className="text-sm text-[var(--gray-11)]">{timeAgo(c.detected_at)}</span>
          </div>
          <Heading size="5" weight="bold">
            {c.sources?.name ?? 'Unknown Source'}
          </Heading>
          <Text size="2" color="gray" as="p" mt="1">
            Change detected {new Date(c.detected_at).toLocaleString('en-US', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </Text>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2">
          <Flex direction="column" gap="6">
            {/* AI Summary */}
            <Card>
              <Box px="4" pt="4" pb="3">
                <Flex align="center" justify="between">
                  <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                    AI Summary
                  </Text>
                </Flex>
              </Box>
              <Box p="4">
                {c.summary ? (
                  <p className="text-sm text-[var(--gray-12)] leading-relaxed">{c.summary}</p>
                ) : (
                  <p className="text-sm text-[var(--gray-11)] italic">
                    No AI summary available for this change.
                  </p>
                )}
              </Box>
            </Card>

            {/* Diff Viewer */}
            <Card>
              <Box px="4" pt="4" pb="3">
                <Flex align="center" justify="between">
                  <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                    Detected Changes
                  </Text>
                </Flex>
              </Box>
              <Box p="4">
                {blocks && blocks.length > 0 ? (
                  <DiffViewer blocks={blocks} />
                ) : (
                  <div className="border border-dashed border-border p-8 text-center">
                    <p className="text-sm text-[var(--gray-11)]">
                      Full text change detected &mdash; no structured diff available.
                    </p>
                  </div>
                )}
              </Box>
            </Card>

            <LegalDisclaimer />
          </Flex>
        </div>

        {/* Metadata sidebar */}
        <aside>
          <Flex direction="column" gap="4">
            <Card>
              <Box px="4" pt="4" pb="3">
                <Flex align="center" justify="between">
                  <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                    Details
                  </Text>
                </Flex>
              </Box>
              <Box p="4">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs text-[var(--gray-11)]">Jurisdiction</dt>
                    <dd className="text-sm font-medium text-[var(--gray-12)] mt-0.5">
                      {c.jurisdiction ?? 'FL'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--gray-11)]">Review Status</dt>
                    <dd className="mt-0.5">
                      <StatusBadge status={c.review_status} />
                    </dd>
                  </div>
                  {c.chain_sequence !== null && (
                    <div>
                      <dt className="text-xs text-[var(--gray-11)]">Chain Sequence</dt>
                      <dd className="text-sm font-medium text-[var(--gray-12)] mt-0.5">
                        #{c.chain_sequence}
                      </dd>
                    </div>
                  )}
                  {c.hash && (
                    <div>
                      <dt className="text-xs text-[var(--gray-11)]">Content Hash</dt>
                      <dd className="text-xs font-mono text-[var(--gray-11)] mt-0.5 break-all">
                        {c.hash.slice(0, 16)}&hellip;
                      </dd>
                    </div>
                  )}
                  {c.sources?.url && (
                    <div>
                      <dt className="text-xs text-[var(--gray-11)]">Source URL</dt>
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
              </Box>
            </Card>
          </Flex>
        </aside>
      </div>
    </div>
  )
}
