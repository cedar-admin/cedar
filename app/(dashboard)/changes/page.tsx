import { redirect } from 'next/navigation'
import Link from 'next/link'
import { withAuth } from '@workos-inc/authkit-nextjs'
import { createServerClient } from '../../../lib/db/client'
import { Card, Box, Flex, Heading, Text, Callout, Table } from '@radix-ui/themes'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { SEVERITY_CLASS, SEVERITIES } from '@/lib/ui-constants'
import { timeAgo } from '@/lib/format'

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
          <Heading size="6" weight="bold">Regulatory Changes</Heading>
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
          <Callout.Icon><i className="ri-hospital-line text-base" /></Callout.Icon>
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
              className={`px-3 py-1.5 text-sm font-medium border transition-colors ${
                !severity
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground'
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
                  className={`px-3 py-1.5 text-sm font-medium border transition-colors ${
                    active
                      ? SEVERITY_CLASS[s]
                      : 'bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground'
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
              <Callout.Icon><i className="ri-error-warning-line text-base" /></Callout.Icon>
              <Callout.Text>
                Failed to load changes: {(error as { message: string }).message}
              </Callout.Text>
            </Callout.Root>
          )}

          {/* Empty state */}
          {changes.length === 0 && !error && (
            <Card>
              <Box p="4">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <i className="ri-leaf-line text-4xl text-[var(--gray-11)] opacity-40 mb-3" />
                  <h2 className="text-base font-semibold text-[var(--gray-12)] mb-1">No changes detected yet</h2>
                  <p className="text-sm text-[var(--gray-11)] max-w-sm">
                    Cedar is monitoring Florida regulatory sources. Detected changes will appear here
                    after the next monitoring run.
                  </p>
                </div>
              </Box>
            </Card>
          )}

          {/* Table */}
          {changes.length > 0 && (
            <Card>
              <Table.Root>
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
                        <span className="text-sm font-medium text-[var(--gray-12)]">
                          {change.sources?.name ?? 'Unknown Source'}
                        </span>
                        <span className="block text-xs text-[var(--gray-11)] mt-0.5">
                          {change.jurisdiction ?? 'FL'}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <Link href={`/changes/${change.id}`} className="group">
                          <p className="text-sm text-[var(--gray-12)] line-clamp-2 group-hover:text-primary transition-colors">
                            {change.summary ?? (
                              <span className="text-[var(--gray-11)] italic">No summary available</span>
                            )}
                          </p>
                        </Link>
                      </Table.Cell>
                      <Table.Cell className="text-sm text-[var(--gray-11)] whitespace-nowrap">
                        {timeAgo(change.detected_at)}
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
              <p className="text-sm text-[var(--gray-11)]">
                Showing {from + 1}&ndash;{Math.min(to + 1, total)} of {total.toLocaleString()}
              </p>
              <div className="flex items-center gap-2">
                {safePage > 1 ? (
                  <Link
                    href={`/changes?page=${safePage - 1}${severity ? `&severity=${severity}` : ''}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors"
                  >
                    <i className="ri-arrow-left-line" /> Previous
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md text-muted-foreground/50 cursor-not-allowed">
                    <i className="ri-arrow-left-line" /> Previous
                  </span>
                )}
                <span className="text-sm text-[var(--gray-11)] px-2">
                  {safePage} / {totalPages}
                </span>
                {safePage < totalPages ? (
                  <Link
                    href={`/changes?page=${safePage + 1}${severity ? `&severity=${severity}` : ''}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors"
                  >
                    Next <i className="ri-arrow-right-line" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md text-muted-foreground/50 cursor-not-allowed">
                    Next <i className="ri-arrow-right-line" />
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
