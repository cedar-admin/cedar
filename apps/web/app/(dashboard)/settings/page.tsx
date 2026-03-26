import Link from 'next/link'
import { createServerClient } from '../../../lib/db/client'
import { createBillingPortalSession } from '../../actions/billing'
import { getLayoutData } from '@/lib/layout-data'
import { capitalize } from '@/lib/format'
import { NotificationsForm } from '@/components/NotificationsForm'
import { SectionHeading } from '@/components/SectionHeading'
import type { NotificationPreferences } from '@/app/actions/settings'

export const metadata = { title: 'Settings — Cedar' }

// ── Helpers ───────────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  return (
    <span className="inline-flex px-2 py-0.5 text-xs rounded border">
      {capitalize(tier)}
    </span>
  )
}

function SubscriptionStatus({ status }: { status: string | null }) {
  const s = status ?? 'inactive'
  if (s === 'active' || s === 'trialing') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden="true" />
        <span className="text-sm font-medium text-green-700">
          {s === 'trialing' ? 'Trialing' : 'Active'}
        </span>
      </span>
    )
  }
  if (s === 'past_due') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" aria-hidden="true" />
        <span className="text-sm font-medium text-yellow-700">Past due</span>
      </span>
    )
  }
  if (s === 'canceled') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true" />
        <span className="text-sm font-medium text-red-700">Canceled</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 opacity-40" aria-hidden="true" />
      <span className="text-sm font-medium">
        {s === 'inactive' ? 'No subscription' : capitalize(s)}
      </span>
    </span>
  )
}

function mask(val: string | null, keep = 8): string {
  if (!val) return '—'
  if (val.length <= keep) return val
  return '\u2022\u2022\u2022\u2022\u2022' + val.slice(-keep)
}

function formatRenewal(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (d < new Date()) return 'Expired'
  return 'Renews ' + d.toLocaleDateString('en-US', { dateStyle: 'medium' })
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SettingsPage() {
  const { user, role } = await getLayoutData()
  const isAdmin = role === 'admin'

  const supabase = createServerClient()
  const { data: practice } = await supabase
    .from('practices')
    .select('id, name, owner_email, tier, stripe_customer_id, stripe_subscription_id, subscription_status, current_period_end, created_at, notification_preferences')
    .eq('owner_email', user.email)
    .maybeSingle()

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm mt-1">Account, notifications, and billing</p>
      </div>

      {/* Admin role card */}
      {isAdmin && (
        <div className="grid grid-cols-1 gap-5 max-w-2xl">
          <div className="border rounded">
            <div className="px-4 pt-4 pb-3">
              <SectionHeading as="h2">Account</SectionHeading>
            </div>
            <div className="p-4 pt-0">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email</span>
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                <hr />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Role</span>
                  <span className="inline-flex px-2 py-0.5 text-xs rounded border border-orange-400 text-orange-700">Admin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Practice owner view */}
      {!isAdmin && !practice && (
        <div className="max-w-lg p-4 border rounded">
          <p className="text-sm">
            No practice configured. Contact{' '}
            <a href="mailto:cedaradmin@gmail.com" className="underline font-medium">
              cedaradmin@gmail.com
            </a>{' '}
            to get set up.
          </p>
        </div>
      )}

      {!isAdmin && practice && (
        <div className="grid grid-cols-1 gap-5 max-w-2xl">
          {/* Practice Info */}
          <div className="border rounded">
            <div className="px-4 pt-4 pb-3">
              <SectionHeading as="h2">Practice</SectionHeading>
            </div>
            <div className="p-4 pt-0">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Name</span>
                  <span className="text-sm font-medium">{practice.name}</span>
                </div>
                <hr />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Owner Email</span>
                  <span className="text-sm font-medium">{practice.owner_email}</span>
                </div>
                <hr />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Plan</span>
                  <TierBadge tier={practice.tier ?? 'monitor'} />
                </div>
                <hr />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Member Since</span>
                  <time dateTime={new Date(practice.created_at).toISOString()}>
                    <span className="text-sm">
                      {new Date(practice.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </span>
                  </time>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="border rounded" id="billing">
            <div className="px-4 pt-4 pb-3">
              <SectionHeading as="h2">Subscription</SectionHeading>
            </div>
            <div className="p-4 pt-0">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <SubscriptionStatus status={practice.subscription_status} />
                </div>
                <hr />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Renewal</span>
                  {practice.current_period_end ? (
                    <time dateTime={new Date(practice.current_period_end).toISOString()}>
                      <span className="text-sm">{formatRenewal(practice.current_period_end)}</span>
                    </time>
                  ) : (
                    <span className="text-sm">—</span>
                  )}
                </div>
                <hr />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stripe Customer</span>
                  <span className="text-sm font-mono">{mask(practice.stripe_customer_id)}</span>
                </div>
                <hr />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stripe Subscription</span>
                  <span className="text-sm font-mono">{mask(practice.stripe_subscription_id)}</span>
                </div>

                {/* Billing actions */}
                <div className="pt-2">
                  {practice.stripe_customer_id ? (
                    <form action={createBillingPortalSession}>
                      <button type="submit" className="px-3 py-1 text-sm border rounded">
                        Manage Billing
                      </button>
                    </form>
                  ) : (
                    <Link href="/pricing" className="px-3 py-1 text-sm border rounded inline-block">
                      Upgrade Plan
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="border rounded" id="notifications">
            <div className="px-4 pt-4 pb-3">
              <SectionHeading as="h2">Notifications</SectionHeading>
            </div>
            <div className="p-4 pt-0">
              {(() => {
                const rawPrefs = practice.notification_preferences as Record<string, unknown> | null
                const initialPrefs: NotificationPreferences = {
                  email_alerts:    typeof rawPrefs?.email_alerts === 'boolean'   ? rawPrefs.email_alerts   : true,
                  email_threshold: ['critical','high','medium','all'].includes(rawPrefs?.email_threshold as string)
                                     ? (rawPrefs!.email_threshold as NotificationPreferences['email_threshold'])
                                     : 'high',
                  weekly_digest:   typeof rawPrefs?.weekly_digest === 'boolean'  ? rawPrefs.weekly_digest  : false,
                }
                return <NotificationsForm initial={initialPrefs} />
              })()}
            </div>
          </div>

          {/* Team Members */}
          <div className="border rounded" id="team">
            <div className="px-4 pt-4 pb-3">
              <SectionHeading as="h2">Team members</SectionHeading>
            </div>
            <div className="p-4 pt-0">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Invite a team member</p>
                  <div className="flex gap-2">
                    <label htmlFor="invite-email" className="sr-only">Invite email</label>
                    <input
                      id="invite-email"
                      type="email"
                      placeholder="colleague@practice.com"
                      className="flex-1 border rounded px-3 py-2 text-sm"
                    />
                    <label htmlFor="invite-role" className="sr-only">Role</label>
                    <select id="invite-role" defaultValue="monitor" className="w-32 border rounded px-2 py-1 text-sm">
                      <option value="monitor">Monitor</option>
                      <option value="intelligence">Intelligence</option>
                    </select>
                    <button type="button" disabled className="px-3 py-1 text-sm border rounded opacity-50">
                      Invite
                    </button>
                  </div>
                  <p className="text-xs mt-1">
                    Team invitations are available on the Intelligence plan.
                  </p>
                </div>
                <hr />
                <div>
                  <p className="text-xs mb-2">Current members</p>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 flex items-center justify-center shrink-0">
                        <span className="text-sm" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {practice.owner_email}
                        </p>
                        <p className="text-xs">Owner</p>
                      </div>
                    </div>
                    <span className="inline-flex px-2 py-0.5 text-xs rounded border">Owner</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Jurisdictions */}
          <div className="border rounded">
            <div className="px-4 pt-4 pb-3">
              <SectionHeading as="h2">Jurisdictions</SectionHeading>
            </div>
            <div className="p-4 pt-0">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" />
                <span className="text-sm font-medium">Florida (FL)</span>
                <span className="text-sm">— 10 sources monitored</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
