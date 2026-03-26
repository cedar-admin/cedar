export const dynamic = 'force-dynamic'
export const metadata = { title: 'Plans — Cedar' }

import { withAuth } from '@workos-inc/authkit-nextjs'
import { createServerClient } from '../../lib/db/client'
import { getEnv } from '../../lib/env'
import { createCheckoutSession } from '../actions/billing'

const FEATURES_MONITOR = [
  'Regulatory change feed (FL)',
  'Email alerts for Critical & High',
  'Tamper-evident audit trail',
  'Source library (10 sources)',
]

const FEATURES_INTELLIGENCE = [
  'Everything in Monitor',
  'Conversational Q&A',
  'Knowledge graph',
  'Attorney-reviewed content',
  'Weekly digest',
  'Push notifications',
]

export default async function PricingPage() {
  const env = getEnv()

  let currentTier: string | null = null
  let currentStatus: string | null = null
  try {
    const { user } = await withAuth({ ensureSignedIn: false })
    if (user) {
      const supabase = createServerClient()
      const { data: practice } = await supabase
        .from('practices')
        .select('tier, subscription_status')
        .eq('owner_email', user.email)
        .maybeSingle()
      currentTier = (practice as any)?.tier ?? null
      currentStatus = (practice as any)?.subscription_status ?? null
    }
  } catch {
    // Not signed in — show plain pricing page
  }

  const isActive = currentStatus === 'active' || currentStatus === 'trialing'

  return (
    <div className="min-h-screen py-9 px-4">
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        {/* Header */}
        <div className="flex flex-col items-center mb-9">
          <div className="mb-4">
            <span className="text-3xl" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Cedar Plans</h1>
          <span style={{ maxWidth: '36rem', textAlign: 'center' }}>
            Florida regulatory intelligence for medical practices. Cancel anytime.
          </span>
        </div>

        {/* Plan cards */}
        <section aria-labelledby="plans-heading">
          <h2 id="plans-heading" className="sr-only">Choose your plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monitor */}
            <div className={`border rounded ${
              isActive && currentTier === 'monitor'
                ? 'border-blue-500 ring-1 ring-blue-500'
                : ''
            }`}>
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold">Monitor</h3>
                  {isActive && currentTier === 'monitor' && (
                    <span className="inline-flex px-2 py-0.5 text-xs rounded border border-green-500 text-green-700">
                      Current plan
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">$99</span>
                  <span className="text-sm">/month</span>
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="flex flex-col gap-6">
                  <ul className="space-y-2.5">
                    {FEATURES_MONITOR.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 shrink-0" aria-hidden="true">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <hr />
                  <form action={createCheckoutSession.bind(null, env.STRIPE_MONITOR_PRICE_ID ?? '')}>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 border rounded text-sm font-medium"
                      disabled={isActive && currentTier === 'monitor'}
                    >
                      {isActive && currentTier === 'monitor' ? 'Current plan' : 'Subscribe to Monitor'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Intelligence */}
            <div className={`border rounded ${
              isActive && currentTier === 'intelligence'
                ? 'border-blue-500 ring-1 ring-blue-500'
                : ''
            }`}>
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold">Intelligence</h3>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex px-2 py-0.5 text-xs rounded">Most popular</span>
                    {isActive && currentTier === 'intelligence' && (
                      <span className="inline-flex px-2 py-0.5 text-xs rounded border border-green-500 text-green-700">
                        Current plan
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">$199</span>
                  <span className="text-sm">/month</span>
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="flex flex-col gap-6">
                  <ul className="space-y-2.5">
                    {FEATURES_INTELLIGENCE.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 shrink-0" aria-hidden="true">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <hr />
                  <form action={createCheckoutSession.bind(null, env.STRIPE_INTELLIGENCE_PRICE_ID ?? '')}>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 border rounded text-sm font-medium"
                      disabled={isActive && currentTier === 'intelligence'}
                    >
                      {isActive && currentTier === 'intelligence' ? 'Current plan' : 'Subscribe to Intelligence'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        <p className="text-xs mt-8" style={{ textAlign: 'center' }}>
          All plans billed monthly. Cancel anytime from your account settings.
          Content is for informational purposes only and does not constitute legal advice.
        </p>
      </div>
    </div>
  )
}
