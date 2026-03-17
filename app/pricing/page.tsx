export const dynamic = 'force-dynamic'

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

  // Auth is optional on the pricing page — show current plan if signed in
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
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">Cedar Plans</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Florida regulatory intelligence for medical practices. Cancel anytime.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monitor */}
          <div className={`bg-white rounded-2xl border p-8 flex flex-col ${
            isActive && currentTier === 'monitor' ? 'border-blue-300 ring-1 ring-blue-300' : 'border-gray-200'
          }`}>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold text-gray-900">Monitor</h2>
                {isActive && currentTier === 'monitor' && (
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    Current plan
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">$99</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {FEATURES_MONITOR.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <form action={createCheckoutSession.bind(null, env.STRIPE_MONITOR_PRICE_ID)}>
              <button
                type="submit"
                disabled={isActive && currentTier === 'monitor'}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-gray-900 text-white hover:bg-gray-800"
              >
                {isActive && currentTier === 'monitor' ? 'Current plan' : 'Subscribe to Monitor'}
              </button>
            </form>
          </div>

          {/* Intelligence */}
          <div className={`bg-white rounded-2xl border p-8 flex flex-col ${
            isActive && currentTier === 'intelligence' ? 'border-purple-300 ring-1 ring-purple-300' : 'border-gray-200'
          }`}>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold text-gray-900">Intelligence</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                    Most popular
                  </span>
                  {isActive && currentTier === 'intelligence' && (
                    <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      Current plan
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">$199</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {FEATURES_INTELLIGENCE.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <form action={createCheckoutSession.bind(null, env.STRIPE_INTELLIGENCE_PRICE_ID)}>
              <button
                type="submit"
                disabled={isActive && currentTier === 'intelligence'}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-purple-700 text-white hover:bg-purple-800"
              >
                {isActive && currentTier === 'intelligence' ? 'Current plan' : 'Subscribe to Intelligence'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          All plans billed monthly. Cancel anytime from your account settings.
          Content is for informational purposes only and does not constitute legal advice.
        </p>
      </div>
    </div>
  )
}
