import { createServerClient } from '../../../lib/db/client'
import { withAuth } from '@workos-inc/authkit-nextjs'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SeverityBadge } from '@/components/SeverityBadge'
import { SEVERITY_CLASS } from '@/lib/ui-constants'
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome back{practiceName ? `, ${practiceName}` : ''}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Florida regulatory intelligence dashboard
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <i className={`${s.icon} text-sm ${s.urgent ? 'text-destructive' : 'text-muted-foreground'}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold ${s.urgent ? 'text-destructive' : 'text-foreground'}`}>
                {s.isText ? s.value : s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Critical & High alerts */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Critical &amp; High Alerts
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/changes?severity=critical">
                  View all <i className="ri-arrow-right-line" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {criticalAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <i className="ri-checkbox-circle-line text-3xl text-green-500 dark:text-green-400 mb-2" />
                <p className="text-sm text-muted-foreground">No critical or high alerts this week</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {criticalAlerts.map((c) => {
                  const src = c.sources as { name: string } | null
                  return (
                    <Link key={c.id} href={`/changes/${c.id}`} className="flex items-start gap-3 px-1 py-3 hover:bg-muted/40 transition-colors">
                      <SeverityBadge severity={c.severity} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">{src?.name ?? '—'}</p>
                        <p className="text-sm text-foreground line-clamp-1 mt-0.5">
                          {c.summary ?? 'No summary available'}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{timeAgo(c.detected_at)}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Compliance Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Unreviewed items</span>
              <span className={`text-sm font-semibold ${(criticalUnreviewed ?? 0) > 0 ? 'text-destructive' : 'text-foreground'}`}>
                {criticalUnreviewed ?? 0}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Audit trail</span>
              <span className="flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Active
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monitoring</span>
              <span className="flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {sourcesCount ?? 10} sources
              </span>
            </div>
            <Separator />
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/audit">
                <i className="ri-shield-check-line" />
                View Audit Trail
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity feed */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Recent Activity — Last 7 Days
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/changes">
                All changes <i className="ri-arrow-right-line" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!recentChanges || recentChanges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <i className="ri-leaf-line text-3xl text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                No changes detected this week. Cedar is monitoring Florida regulatory sources.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentChanges.map((c) => {
                const src = c.sources as { name: string } | null
                return (
                  <Link key={c.id} href={`/changes/${c.id}`} className="flex items-center gap-3 py-3 hover:bg-muted/30 transition-colors px-1">
                    <SeverityBadge severity={c.severity} />
                    <span className="text-sm text-foreground flex-1 truncate">
                      {src?.name ?? '—'}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">{timeAgo(c.detected_at)}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
