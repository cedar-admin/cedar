import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '../../../../lib/db/client'
import type { DiffBlock } from '../../../../lib/changes/diff'
import { Card, Box, Flex, Heading, Text, Link as RadixLink } from '@radix-ui/themes'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { SectionHeading } from '@/components/SectionHeading'
import { AiBadge, AiDisclaimer } from '@/components/AiBadge'
import { HashWithCopy } from '@/components/HashWithCopy'
import { timeAgo } from '@/lib/format'

// ── Diff Viewer ───────────────────────────────────────────────────────────────

function DiffViewer({ blocks }: { blocks: DiffBlock[] }) {
  return (
    <div className="font-mono text-xs border border-[var(--cedar-border)] overflow-auto max-h-96 bg-[var(--cedar-surface)]">
      {blocks.map((block, i) => {
        const lines = block.content.split('\n')
        return lines.map((line, j) => {
          let rowCls = 'bg-[var(--cedar-surface)] text-[var(--cedar-text-secondary)]'
          let gutterCls = `text-[var(--cedar-text-secondary)] border-r border-[var(--cedar-border)]`
          let prefix = ' '
          if (block.type === 'added') {
            rowCls = 'bg-[var(--cedar-diff-added-bg)]'
            gutterCls = `text-[var(--cedar-diff-added-text)] border-r border-[var(--cedar-diff-added-border)]`
            prefix = '+'
          }
          if (block.type === 'removed') {
            rowCls = 'bg-[var(--cedar-diff-removed-bg)]'
            gutterCls = `text-[var(--cedar-diff-removed-text)] border-r border-[var(--cedar-diff-removed-border)]`
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
        className="inline-flex items-center gap-1.5 text-sm text-[var(--cedar-text-secondary)] hover:text-[var(--cedar-text-primary)] mb-6 transition-colors"
      >
        <i className="ri-arrow-left-line" aria-hidden="true" />
        All changes
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <SeverityBadge severity={c.severity} />
            <time dateTime={new Date(c.detected_at).toISOString()} className="text-sm text-[var(--cedar-text-secondary)]">
              {timeAgo(c.detected_at)}
            </time>
          </div>
          <Heading as="h1" size="6" weight="bold" className="leading-tight">
            {c.summary ?? 'Regulatory change detected'}
          </Heading>
          <Text size="2" color="gray" as="p" mt="1">
            {c.sources?.name ?? 'Unknown source'} &middot; Change detected{' '}
            <time dateTime={new Date(c.detected_at).toISOString()}>
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
        <div className="col-span-2">
          <Flex direction="column" gap="6">
            {/* AI Summary */}
            <Card variant="surface">
              <Box px="4" pt="4" pb="3">
                <Flex align="center" gap="2">
                  <SectionHeading as="h2">AI summary</SectionHeading>
                  <AiBadge />
                </Flex>
              </Box>
              <Box p="4">
                {c.summary ? (
                  <>
                    <Text as="p" size="2" className="leading-relaxed">{c.summary}</Text>
                    <AiDisclaimer />
                  </>
                ) : (
                  <Text as="p" size="2" color="gray" className="italic">
                    No AI summary available for this change.
                  </Text>
                )}
              </Box>
            </Card>

            {/* Diff Viewer */}
            <Card variant="surface">
              <Box px="4" pt="4" pb="3">
                <SectionHeading as="h2">Detected changes</SectionHeading>
              </Box>
              <Box p="4">
                {blocks && blocks.length > 0 ? (
                  <DiffViewer blocks={blocks} />
                ) : (
                  <div className="border border-dashed border-[var(--cedar-border)] p-8 text-center">
                    <Text as="p" size="2" color="gray">
                      Full text change detected &mdash; no structured diff available.
                    </Text>
                  </div>
                )}
              </Box>
            </Card>
          </Flex>
        </div>

        {/* Metadata sidebar */}
        <aside>
          <Flex direction="column" gap="4">
            <Card variant="surface">
              <Box px="4" pt="4" pb="3">
                <SectionHeading as="h2">Details</SectionHeading>
              </Box>
              <Box p="4">
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
                      <dd className="mt-0.5">
                        <HashWithCopy hash={c.hash} />
                      </dd>
                    </div>
                  )}
                  {c.sources?.url && (
                    <div>
                      <dt className="text-xs text-[var(--cedar-text-secondary)]">Source URL</dt>
                      <dd className="mt-0.5">
                        <RadixLink
                          href={c.sources.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          color="gray"
                          highContrast
                          underline="always"
                          className="text-xs break-all"
                        >
                          {c.sources.url.length > 50
                            ? c.sources.url.slice(0, 50) + '…'
                            : c.sources.url}
                        </RadixLink>
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
