import { createServerClient } from '../../../lib/db/client'
import { withAuth } from '@workos-inc/authkit-nextjs'
import Link from 'next/link'
import { Card, Box, Flex, Heading, Text, Button, Separator } from '@radix-ui/themes'
import { SeverityBadge } from '@/components/SeverityBadge'
import { timeAgo } from '@/lib/format'

export const dynamic = 'force-dynamic'

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
        <Heading size="6" weight="bold">
          Welcome back{practiceName ? `, ${practiceName}` : ''}
        </Heading>
        <Text size="2" color="gray" as="p" mt="1">
          Florida regulatory intelligence dashboard
        </Text>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <Card key={s.label}>
            <Box p="4">
              <div className="flex items-center gap-2 mb-2">
                <i className={`${s.icon} text-sm ${s.urgent ? 'text-[var(--red-9)]' : 'text-[var(--gray-11)]'}`} />
                <span className="text-xs text-[var(--gray-11)]">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold ${s.urgent ? 'text-[var(--red-9)]' : 'text-[var(--gray-12)]'}`}>
                {s.isText ? s.value : s.value}
              </p>
            </Box>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Critical & High alerts */}
        <Card className="md:col-span-2">
          <Box px="4" pt="4" pb="3">
            <Flex align="center" justify="between">
              <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                Critical &amp; High Alerts
              </Text>
              <Button variant="ghost" size="1" asChild>
                <Link href="/changes?severity=critical">
                  View all <i className="ri-arrow-right-line" />
                </Link>
              </Button>
            </Flex>
          </Box>
          <Box p="4">
            {criticalAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <i className="ri-checkbox-circle-line text-3xl text-[var(--green-9)] mb-2" />
                <p className="text-sm text-[var(--gray-11)]">No critical or high alerts this week</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--gray-6)]">
                {criticalAlerts.map((c) => {
                  const src = c.sources as { name: string } | null
                  return (
                    <Link key={c.id} href={`/changes/${c.id}`} className="flex items-start gap-3 px-1 py-3 hover:bg-[var(--gray-a2)] transition-colors">
                      <SeverityBadge severity={c.severity} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--gray-11)]">{src?.name ?? '—'}</p>
                        <p className="text-sm text-[var(--gray-12)] line-clamp-1 mt-0.5">
                          {c.summary ?? 'No summary available'}
                        </p>
                      </div>
                      <span className="text-xs text-[var(--gray-11)] shrink-0">{timeAgo(c.detected_at)}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </Box>
        </Card>

        {/* Compliance health */}
        <Card>
          <Box px="4" pt="4" pb="3">
            <Flex align="center" justify="between">
              <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                Compliance Health
              </Text>
            </Flex>
          </Box>
          <Box p="4">
            <Flex direction="column" gap="4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--gray-11)]">Unreviewed items</span>
                <span className={`text-sm font-semibold ${(criticalUnreviewed ?? 0) > 0 ? 'text-[var(--red-9)]' : 'text-[var(--gray-12)]'}`}>
                  {criticalUnreviewed ?? 0}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--gray-11)]">Audit trail</span>
                <span className="flex items-center gap-1.5 text-sm text-[var(--green-11)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--green-9)]" />
                  Active
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--gray-11)]">Monitoring</span>
                <span className="flex items-center gap-1.5 text-sm text-[var(--green-11)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--green-9)]" />
                  {sourcesCount ?? 10} sources
                </span>
              </div>
              <Separator />
              <Button variant="outline" size="1" className="w-full" asChild>
                <Link href="/audit">
                  <i className="ri-shield-check-line" />
                  View Audit Trail
                </Link>
              </Button>
            </Flex>
          </Box>
        </Card>
      </div>

      {/* Recent activity feed */}
      <Card>
        <Box px="4" pt="4" pb="3">
          <Flex align="center" justify="between">
            <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
              Recent Activity — Last 7 Days
            </Text>
            <Button variant="ghost" size="1" asChild>
              <Link href="/changes">
                All changes <i className="ri-arrow-right-line" />
              </Link>
            </Button>
          </Flex>
        </Box>
        <Box p="4">
          {!recentChanges || recentChanges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <i className="ri-leaf-line text-3xl text-[var(--gray-11)] opacity-40 mb-2" />
              <p className="text-sm text-[var(--gray-11)]">
                No changes detected this week. Cedar is monitoring Florida regulatory sources.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--gray-6)]">
              {recentChanges.map((c) => {
                const src = c.sources as { name: string } | null
                return (
                  <Link key={c.id} href={`/changes/${c.id}`} className="flex items-center gap-3 py-3 hover:bg-[var(--gray-a2)] transition-colors px-1">
                    <SeverityBadge severity={c.severity} />
                    <span className="text-sm text-[var(--gray-12)] flex-1 truncate">
                      {src?.name ?? '—'}
                    </span>
                    <span className="text-xs text-[var(--gray-11)] shrink-0">{timeAgo(c.detected_at)}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </Box>
      </Card>
    </Flex>
  )
}
