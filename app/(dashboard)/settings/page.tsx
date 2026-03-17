import { withAuth } from '@workos-inc/authkit-nextjs'
import Link from 'next/link'
import { createServerClient } from '../../../lib/db/client'
import { createBillingPortalSession } from '../../actions/billing'

// ── Helpers ───────────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, string> = {
    monitor:      'bg-gray-100 text-gray-700 border-gray-200',
    intelligence: 'bg-purple-50 text-purple-700 border-purple-200',
  }
  const cls = map[tier.toLowerCase()] ?? map.monitor
  const label = tier.charAt(0).toUpperCase() + tier.slice(1)
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  )
}

function SubscriptionStatusBadge({ status }: { status: string | null }) {
  const s = status ?? 'inactive'
  if (s === 'active' || s === 'trialing') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        {s === 'trialing' ? 'Trialing' : 'Active'}
      </span>
    )
  }
  if (s === 'past_due') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-yellow-700">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        Past due
      </span>
    )
  }
  if (s === 'canceled') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Canceled
      </span>
    )
  }
  // inactive / unpaid / incomplete / unknown
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
      {s === 'inactive' ? 'No subscription' : s.charAt(0).toUpperCase() + s.slice(1)}
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
  const { user } = await withAuth({ ensureSignedIn: true })
  const supabase = createServerClient()

  const { data: practice } = await supabase
    .from('practices')
    .select('id, name, owner_email, tier, stripe_customer_id, stripe_subscription_id, subscription_status, current_period_end, created_at')
    .eq('owner_email', user.email)
    .maybeSingle()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Account, notifications, and billing</p>
      </div>

      {!practice && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center max-w-lg mx-auto">
          <p className="text-sm text-amber-800">
            No practice configured. Contact{' '}
            <a href="mailto:support@cedarlegal.io" className="underline">support@cedarlegal.io</a>{' '}
            to get set up.
          </p>
        </div>
      )}

      {practice && (
        <div className="grid grid-cols-1 gap-5 max-w-2xl">
          {/* Practice Info */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Practice</h2>
            <dl className="space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-500">Name</dt>
                <dd className="text-sm font-medium text-gray-900">{(practice as any).name}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-500">Owner Email</dt>
                <dd className="text-sm font-medium text-gray-900">{(practice as any).owner_email}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-500">Plan</dt>
                <dd><TierBadge tier={(practice as any).tier ?? 'monitor'} /></dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-500">Member Since</dt>
                <dd className="text-sm text-gray-700">
                  {new Date((practice as any).created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </dd>
              </div>
            </dl>
          </section>

          {/* Subscription */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Subscription</h2>
            <dl className="space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-500">Status</dt>
                <dd><SubscriptionStatusBadge status={(practice as any).subscription_status} /></dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-500">Renewal</dt>
                <dd className="text-sm text-gray-700">{formatRenewal((practice as any).current_period_end)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-500">Stripe Customer</dt>
                <dd className="text-sm font-mono text-gray-500">{mask((practice as any).stripe_customer_id)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-500">Stripe Subscription</dt>
                <dd className="text-sm font-mono text-gray-500">{mask((practice as any).stripe_subscription_id)}</dd>
              </div>
            </dl>

            {/* Billing actions */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              {(practice as any).stripe_customer_id ? (
                <form action={createBillingPortalSession}>
                  <button
                    type="submit"
                    className="text-sm font-medium text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Manage Billing
                  </button>
                </form>
              ) : (
                <Link
                  href="/pricing"
                  className="inline-block text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  Upgrade Plan
                </Link>
              )}
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Notifications</h2>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Email alerts enabled for <strong className="font-semibold ml-1">Critical</strong> and{' '}
                <strong className="font-semibold ml-1">High</strong> severity changes
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Medium, Low, and Informational changes auto-approved (no email)
              </li>
            </ul>
          </section>

          {/* Jurisdictions */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Jurisdictions</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-gray-900">Florida (FL)</span>
              <span className="text-xs text-gray-400 ml-1">— 10 sources monitored</span>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
