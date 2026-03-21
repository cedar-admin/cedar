import { createServerClient } from '../../../lib/db/client'
import { withAuth } from '@workos-inc/authkit-nextjs'
import Link from 'next/link'
import { Card, Box, Flex, Heading, Text, Button, Separator } from '@radix-ui/themes'
import { SeverityBadge } from '@/components/SeverityBadge'
import { timeAgo } from '@/lib/format'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dashboard — Cedar' }

export default async function HomePage() {
  const { user } = await withAuth({ ensureSignedIn: true })
  const supabase = createServerClient()

  // Practice
  const { data: practice } = await supabase
    .from('practices')
    .select('name, tier')
    .eq('owner_email', user.email)
    .maybeSingle()

  const practiceName = practice?.name ?? 'Your Practice'

  // Stats
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3_600_000).toISOString()

  const [
    { count: weekCount },
    { count: criticalUnreviewed },
    { count: sourcesCount },
    { data: recentChanges },
    { data: lastFetch },
  ] = await Promise.all([
    supabase.from('changes').select('*', { count: 'exact', head: true })
      .gte('detected_at', sevenDaysAgo),
    supabase.from('changes').select('*', { count: 'exact', head: true })
      .in('severity', ['critical', 'high'])
      .eq('review_status', 'pending'),
    supabase.from('sources').select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase.from('changes')
      .select('id, severity, summary, detected_at, sources(name)')
      .gte('detected_at', sevenDaysAgo)
      .order('detected_at', { ascending: false })
      .limit(10),
    supabase.from('source_urls')
      .select('last_fetched_at')
      .not('last_fetched_at', 'is', null)
      .order('last_fetched_at', { ascending: false })
      .limit(1),
  ])

  const criticalAlerts = (recentChanges ?? []).filter(
    (c) => c.severity === 'critical' || c.severity === 'high'
  ).slice(0, 3)

  const lastScan = (lastFetch as any)?.[0]?.last_fetched_at ?? null

  const STATS = [
    { label: 'Changes this week', value: weekCount ?? 0,       icon: 'ri-pulse-line' },
    { label: 'Critical unreviewed', value: criticalUnreviewed ?? 0, icon: 'ri-alarm-warning-line', urgent: (criticalUnreviewed ?? 0) > 0 },
    { label: 'Sources monitored', value: sourcesCount ?? 10,   icon: 'ri-database-2-line' },
    { label: 'Last scan',          value: lastScan ? timeAgo(lastScan) : '—', icon: 'ri-time-line', isText: true },
  ]

  return (
    <Flex direction="column" gap="6">
      {/* Header */}
      <div>
        <Heading as="h1" size="6" weight="bold">
          Welcome back{practiceName ? `, ${practiceName}` : ''}
        </Heading>
        <Text size="2" color="gray" as="p" mt="1">
          Florida regulatory intelligence dashboard
        </Text>
      </div>

      {/* Stats bar */}
      <section aria-labelledby="overview-heading">
        <Heading id="overview-heading" as="h2" size="3" weight="bold" mb="4">Overview</Heading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <Card key={s.label} variant="surface">
              <Box p="4">
                <div className="flex items-center gap-2 mb-2">
                  <i className={`${s.icon} text-sm ${s.urgent ? 'text-[var(--cedar-status-dot-error)]' : 'text-[var(--cedar-text-secondary)]'}`} aria-hidden="true" />
                  <span className="text-xs text-[var(--cedar-text-secondary)]">{s.label}</span>
                </div>
                <p className={`text-2xl font-bold ${s.urgent ? 'text-[var(--cedar-status-dot-error)]' : 'text-[var(--cedar-text-primary)]'}`}>
                  {s.value}
                </p>
              </Box>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Critical & High alerts */}
        <Card className="md:col-span-2" variant="surface">
          <Box px="4" pt="4" pb="3">
            <Flex align="center" justify="between">
              <Heading as="h2" size="2" weight="bold">Critical &amp; High Alerts</Heading>
              <Button variant="ghost" color="gray" size="1" asChild>
                <Link href="/changes?severity=critical">
                  View all <i className="ri-arrow-right-line" aria-hidden="true" />
                </Link>
              </Button>
            </Flex>
          </Box>
          <Box p="4">
            {criticalAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <i className="ri-checkbox-circle-line text-3xl text-[var(--cedar-success-solid)] mb-2" aria-hidden="true" />
                <Text as="p" size="2" color="gray">No critical or high alerts this week</Text>
              </div>
            ) : (
              <div className="divide-y divide-[var(--cedar-border)]">
                {criticalAlerts.map((c) => {
                  const src = c.sources as { name: string } | null
                  return (
                    <Link key={c.id} href={`/changes/${c.id}`} className="flex items-start gap-3 px-1 py-3 hover:bg-[var(--cedar-interactive-hover)] transition-colors">
                      <SeverityBadge severity={c.severity} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--cedar-text-secondary)]">{src?.name ?? '—'}</p>
                        <p className="text-sm text-[var(--cedar-text-primary)] line-clamp-1 mt-0.5">
                          {c.summary ?? 'No summary available'}
                        </p>
                      </div>
                      <time dateTime={new Date(c.detected_at).toISOString()} className="text-xs text-[var(--cedar-text-secondary)] shrink-0">{timeAgo(c.detected_at)}</time>
                    </Link>
                  )
                })}
              </div>
            )}
          </Box>
        </Card>

        {/* Compliance health */}
        <Card variant="surface">
          <Box px="4" pt="4" pb="3">
            <Heading as="h2" size="2" weight="bold">Compliance Health</Heading>
          </Box>
          <Box p="4">
            <Flex direction="column" gap="4">
              <div className="flex items-center justify-between">
                <Text as="span" size="2" color="gray">Unreviewed items</Text>
                <Text as="span" size="2" weight="bold" color={(criticalUnreviewed ?? 0) > 0 ? 'red' : undefined}>
                  {criticalUnreviewed ?? 0}
                </Text>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Text as="span" size="2" color="gray">Audit trail</Text>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--cedar-status-dot-success)]" aria-hidden="true" />
                  <Text as="span" size="2" color="green">Active</Text>
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Text as="span" size="2" color="gray">Monitoring</Text>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--cedar-status-dot-success)]" aria-hidden="true" />
                  <Text as="span" size="2" color="green">{sourcesCount ?? 10} sources</Text>
                </span>
              </div>
              <Separator />
              <Button variant="soft" color="gray" highContrast size="1" className="w-full" asChild>
                <Link href="/audit">
                  <i className="ri-shield-check-line" aria-hidden="true" />
                  View Audit Trail
                </Link>
              </Button>
            </Flex>
          </Box>
        </Card>
      </div>

      {/* Recent activity feed */}
      <section aria-labelledby="activity-heading">
        <Card variant="surface">
          <Box px="4" pt="4" pb="3">
            <Flex align="center" justify="between">
              <Heading id="activity-heading" as="h2" size="2" weight="bold">Recent Activity — Last 7 Days</Heading>
              <Button variant="ghost" color="gray" size="1" asChild>
                <Link href="/changes">
                  All changes <i className="ri-arrow-right-line" aria-hidden="true" />
                </Link>
              </Button>
            </Flex>
          </Box>
          <Box p="4">
            {!recentChanges || recentChanges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <i className="ri-leaf-line text-3xl text-[var(--cedar-text-secondary)] opacity-40 mb-2" aria-hidden="true" />
                <Text as="p" size="2" color="gray">
                  No changes detected this week. Cedar is monitoring Florida regulatory sources.
                </Text>
              </div>
            ) : (
              <div className="divide-y divide-[var(--cedar-border)]">
                {recentChanges.map((c) => {
                  const src = c.sources as { name: string } | null
                  return (
                    <Link key={c.id} href={`/changes/${c.id}`} className="flex items-center gap-3 py-3 hover:bg-[var(--cedar-interactive-hover)] transition-colors px-1">
                      <SeverityBadge severity={c.severity} />
                      <Text as="span" size="2" className="flex-1 truncate">
                        {src?.name ?? '—'}
                      </Text>
                      <time dateTime={new Date(c.detected_at).toISOString()} className="text-xs text-[var(--cedar-text-secondary)] shrink-0">{timeAgo(c.detected_at)}</time>
                    </Link>
                  )
                })}
              </div>
            )}
          </Box>
        </Card>
      </section>
    </Flex>
  )
}
