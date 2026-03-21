import { redirect } from 'next/navigation'
import Link from 'next/link'
import { withAuth } from '@workos-inc/authkit-nextjs'
import { createServerClient } from '../../../lib/db/client'
import { Card, Box, Flex, Heading, Text, Callout, Table } from '@radix-ui/themes'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { SEVERITIES } from '@/lib/ui-constants'
import { timeAgo } from '@/lib/format'

export const metadata = { title: 'Changes — Cedar' }

// Severity-specific active classes using Cedar semantic tokens where possible,
// with severity-specific colors for informational purposes (these ARE intentional
// color-coding, not interactive state — so raw Radix vars are used via Cedar's
// pattern for semantic color differentiation in informational pills)
const SEVERITY_ACTIVE_CLASS: Record<string, string> = {
  critical:      'bg-[var(--cedar-error-bg)] text-[var(--cedar-error-text)] border-[var(--cedar-error-border)]',
  high:          'bg-[var(--orange-a3)] text-[var(--orange-11)] border-[var(--orange-6)]',
  medium:        'bg-[var(--cedar-warning-bg)] text-[var(--cedar-warning-text)] border-[var(--cedar-warning-border)]',
  low:           'bg-[var(--cedar-success-bg)] text-[var(--cedar-success-text)] border-[var(--cedar-success-border)]',
  informational: 'bg-[var(--cedar-info-bg)] text-[var(--cedar-info-text)] border-[var(--cedar-info-border)]',
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25

// ── Page ──────────────────────────────────────────────────────────────────────

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
  const severity = SEVERITIES.includes(severityParam as (typeof SEVERITIES)[number])
    ? severityParam
    : null

  let countQuery = supabase
    .from('changes')
    .select('id', { count: 'exact', head: true })
    .in('review_status', ['auto_approved', 'approved'])
    .eq('jurisdiction', 'FL')
  if (severity) countQuery = countQuery.eq('severity', severity)
  const { count: totalCount } = practice ? await countQuery : { count: 0 }

  const total = totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const from = (safePage - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  let dataQuery = supabase
    .from('changes')
    .select('id, severity, summary, jurisdiction, detected_at, review_status, sources(name)')
    .in('review_status', ['auto_approved', 'approved'])
    .eq('jurisdiction', 'FL')
    .order('detected_at', { ascending: false })
    .range(from, to)
  if (severity) dataQuery = dataQuery.eq('severity', severity)

  const { data, error } = practice ? await dataQuery : { data: null, error: null }

  const changes = (data ?? []) as Array<{
    id: string
    severity: string | null
    summary: string | null
    jurisdiction: string | null
    detected_at: string
    review_status: string
    sources: { name: string } | null
  }>

  return (
    <Flex direction="column" gap="6">
      {/* Header */}
      <Flex align="center" justify="between">
        <div>
          <Heading as="h1" size="6" weight="bold">Changes</Heading>
          {practice ? (
            <Text size="2" color="gray" as="p" mt="1">
              {practice.name} &middot; {total.toLocaleString()} change{total !== 1 ? 's' : ''}
            </Text>
          ) : (
            <Text size="2" color="gray" as="p" mt="1">Florida regulatory coverage</Text>
          )}
        </div>
      </Flex>

      {/* Practice gate */}
      {!practice && (
        <Callout.Root color="gray" className="max-w-lg">
          <Callout.Icon><i className="ri-hospital-line text-base" aria-hidden="true" /></Callout.Icon>
          <Callout.Text>
            Your account is not linked to a practice. Contact{' '}
            <a href="mailto:cedaradmin@gmail.com" className="underline font-medium">cedaradmin@gmail.com</a>{' '}
            to get set up.
          </Callout.Text>
        </Callout.Root>
      )}

      {practice && (
        <>
          {/* Severity filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/changes"
              className={`px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${
                !severity
                  ? 'bg-[var(--cedar-filter-active-bg)] text-[var(--cedar-filter-active-text)] border-[var(--cedar-filter-active-border)]'
                  : 'bg-[var(--cedar-page-bg)] text-[var(--cedar-text-secondary)] border-[var(--cedar-border)] hover:border-[var(--cedar-border-strong)] hover:text-[var(--cedar-text-primary)]'
              }`}
            >
              All
            </Link>
            {SEVERITIES.map((s) => {
              const active = severity === s
              return (
                <Link
                  key={s}
                  href={`/changes?severity=${s}${page > 1 ? `&page=${page}` : ''}`}
                  className={`px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${
                    active
                      ? SEVERITY_ACTIVE_CLASS[s]
                      : 'bg-[var(--cedar-page-bg)] text-[var(--cedar-text-secondary)] border-[var(--cedar-border)] hover:border-[var(--cedar-border-strong)] hover:text-[var(--cedar-text-primary)]'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Link>
              )
            })}
          </div>

          {/* Error state */}
          {error && (
            <Callout.Root color="red">
              <Callout.Icon><i className="ri-error-warning-line text-base" aria-hidden="true" /></Callout.Icon>
              <Callout.Text>
                Failed to load changes: {(error as { message: string }).message}
              </Callout.Text>
            </Callout.Root>
          )}

          {/* Empty state */}
          {changes.length === 0 && !error && (
            <Card variant="surface">
              <Box p="4">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <i className="ri-leaf-line text-4xl text-[var(--cedar-text-secondary)] opacity-40 mb-3" aria-hidden="true" />
                  <Heading as="h2" size="3" weight="bold" mb="1">No changes detected yet</Heading>
                  <Text as="p" size="2" color="gray" className="max-w-sm">
                    Cedar is monitoring Florida regulatory sources. Detected changes will appear here
                    after the next monitoring run.
                  </Text>
                </div>
              </Box>
            </Card>
          )}

          {/* Table */}
          {changes.length > 0 && (
            <Card variant="surface">
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell className="w-36">Severity</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="w-48">Source</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Summary</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="w-24">Detected</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="w-28">Status</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {changes.map((change) => (
                    <Table.Row key={change.id}>
                      <Table.Cell>
                        <SeverityBadge severity={change.severity} />
                      </Table.Cell>
                      <Table.Cell>
                        <Text as="span" size="2" weight="medium">{change.sources?.name ?? 'Unknown Source'}</Text>
                        <Text as="span" size="1" color="gray" className="block mt-0.5">
                          {change.jurisdiction ?? 'FL'}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Link href={`/changes/${change.id}`} className="group">
                          <Text as="p" size="2" className="line-clamp-2 group-hover:underline transition-colors">
                            {change.summary ?? (
                              <Text as="span" color="gray" className="italic">No summary available</Text>
                            )}
                          </Text>
                        </Link>
                      </Table.Cell>
                      <Table.Cell>
                        <time dateTime={new Date(change.detected_at).toISOString()} className="text-sm text-[var(--cedar-text-secondary)] whitespace-nowrap">
                          {timeAgo(change.detected_at)}
                        </time>
                      </Table.Cell>
                      <Table.Cell>
                        <StatusBadge status={change.review_status} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Text as="p" size="2" color="gray">
                Showing {from + 1}&ndash;{Math.min(to + 1, total)} of {total.toLocaleString()}
              </Text>
              <div className="flex items-center gap-2">
                {safePage > 1 ? (
                  <Link
                    href={`/changes?page=${safePage - 1}${severity ? `&severity=${severity}` : ''}`}
                    aria-label="Go to previous page"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-[var(--cedar-border)] rounded-md hover:bg-[var(--cedar-interactive-hover)] transition-colors"
                  >
                    <i className="ri-arrow-left-line" aria-hidden="true" /> Previous
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-[var(--cedar-border)] rounded-md text-[var(--cedar-disabled-text)] cursor-not-allowed">
                    <i className="ri-arrow-left-line" aria-hidden="true" /> Previous
                  </span>
                )}
                <Text as="span" size="2" color="gray" className="px-2">
                  {safePage} / {totalPages}
                </Text>
                {safePage < totalPages ? (
                  <Link
                    href={`/changes?page=${safePage + 1}${severity ? `&severity=${severity}` : ''}`}
                    aria-label="Go to next page"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-[var(--cedar-border)] rounded-md hover:bg-[var(--cedar-interactive-hover)] transition-colors"
                  >
                    Next <i className="ri-arrow-right-line" aria-hidden="true" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-[var(--cedar-border)] rounded-md text-[var(--cedar-disabled-text)] cursor-not-allowed">
                    Next <i className="ri-arrow-right-line" aria-hidden="true" />
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </Flex>
  )
}
