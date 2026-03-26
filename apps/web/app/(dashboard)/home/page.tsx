import { createServerClient } from '../../../lib/db/client'
import { withAuth } from '@workos-inc/authkit-nextjs'
import Link from 'next/link'
import { SeverityBadge } from '@/components/SeverityBadge'
import { SectionHeading } from '@/components/SectionHeading'
import { AiBadge } from '@/components/AiBadge'
import { timeAgo } from '@/lib/format'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dashboard — Cedar' }

export default async function HomePage() {
  const { user } = await withAuth({ ensureSignedIn: true })
  const supabase = createServerClient()

  const { data: practice } = await supabase
    .from('practices')
    .select('name, tier')
    .eq('owner_email', user.email)
    .maybeSingle()

  const practiceName = practice?.name ?? 'Your Practice'

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
    { label: 'Changes this week', value: weekCount ?? 0,       icon: '' },
    { label: 'Critical unreviewed', value: criticalUnreviewed ?? 0, icon: '', urgent: (criticalUnreviewed ?? 0) > 0 },
    { label: 'Sources monitored', value: sourcesCount ?? 10,   icon: '' },
    { label: 'Last scan',          value: lastScan ? timeAgo(lastScan) : '—', icon: '', isText: true },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back{practiceName ? `, ${practiceName}` : ''}
        </h1>
        <p className="text-sm mt-1">
          Florida regulatory intelligence dashboard
        </p>
      </div>

      {/* Stats bar */}
      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="text-base font-bold mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="border rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs">{s.label}</span>
              </div>
              <span className={`text-xl font-bold ${s.urgent ? 'text-red-600' : ''}`}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Critical & High alerts */}
        <div className="md:col-span-2 border rounded">
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <SectionHeading as="h2">Critical &amp; high alerts</SectionHeading>
              <Link href="/changes?severity=critical" className="text-sm">
                View all &rarr;
              </Link>
            </div>
          </div>
          <div className="p-4">
            {criticalAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-3xl mb-2" aria-hidden="true">✓</span>
                <p className="text-sm">No critical or high alerts this week</p>
              </div>
            ) : (
              <div className="divide-y">
                {criticalAlerts.map((c) => {
                  const src = c.sources as { name: string } | null
                  return (
                    <Link key={c.id} href={`/changes/${c.id}`} className="flex items-start gap-3 px-1 py-3 hover:bg-gray-50 transition-colors">
                      <SeverityBadge severity={c.severity} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate">{src?.name ?? '—'}</p>
                        <p className="text-sm line-clamp-1 mt-0.5">
                          {c.summary ?? 'No summary available'}
                        </p>
                      </div>
                      <time dateTime={new Date(c.detected_at).toISOString()} className="text-xs shrink-0">{timeAgo(c.detected_at)}</time>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Compliance health */}
        <div className="border rounded">
          <div className="px-4 pt-4 pb-3">
            <SectionHeading as="h2">Compliance health</SectionHeading>
          </div>
          <div className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Unreviewed items</span>
                <span className={`text-sm font-bold ${(criticalUnreviewed ?? 0) > 0 ? 'text-red-600' : ''}`}>
                  {criticalUnreviewed ?? 0}
                </span>
              </div>
              <hr />
              <div className="flex items-center justify-between">
                <span className="text-sm">Audit trail</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden="true" />
                  <span className="text-sm text-green-700">Active</span>
                </span>
              </div>
              <hr />
              <div className="flex items-center justify-between">
                <span className="text-sm">Monitoring</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden="true" />
                  <span className="text-sm text-green-700">{sourcesCount ?? 10} sources</span>
                </span>
              </div>
              <hr />
              <Link href="/audit" className="w-full px-3 py-1 text-sm border rounded text-center block">
                View audit trail
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity feed */}
      <section aria-labelledby="activity-heading">
        <div className="border rounded">
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <SectionHeading id="activity-heading" as="h2">Recent activity — last 7 days</SectionHeading>
              <Link href="/changes" className="text-sm">
                All changes &rarr;
              </Link>
            </div>
          </div>
          <div className="p-4">
            {!recentChanges || recentChanges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-3xl opacity-40 mb-2" aria-hidden="true" />
                <p className="text-sm">
                  No changes detected this week. Cedar is monitoring Florida regulatory sources.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {recentChanges.map((c) => {
                  const src = c.sources as { name: string } | null
                  return (
                    <Link key={c.id} href={`/changes/${c.id}`} className="flex items-center gap-3 py-3 hover:bg-gray-50 transition-colors px-1">
                      <SeverityBadge severity={c.severity} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate">{src?.name ?? '—'}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-sm line-clamp-1 flex-1">
                            {c.summary ?? (
                              <span className="italic">No summary available</span>
                            )}
                          </p>
                          {c.summary && <AiBadge />}
                        </div>
                      </div>
                      <time dateTime={new Date(c.detected_at).toISOString()} className="text-xs shrink-0">{timeAgo(c.detected_at)}</time>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
