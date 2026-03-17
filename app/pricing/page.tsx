export const dynamic = 'force-dynamic'

import { withAuth } from '@workos-inc/authkit-nextjs'
import { createServerClient } from '../../lib/db/client'
import { getEnv } from '../../lib/env'
import { createCheckoutSession } from '../actions/billing'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

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
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <i className="ri-leaf-line text-primary text-3xl" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-3">Cedar Plans</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Florida regulatory intelligence for medical practices. Cancel anytime.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monitor */}
          <Card className={
            isActive && currentTier === 'monitor'
              ? 'border-primary ring-1 ring-primary'
              : ''
          }>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold text-foreground">Monitor</h2>
                {isActive && currentTier === 'monitor' && (
                  <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                    Current plan
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">$99</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-2.5">
                {FEATURES_MONITOR.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <i className="ri-checkbox-circle-line text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Separator />
              <form action={createCheckoutSession.bind(null, env.STRIPE_MONITOR_PRICE_ID)}>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isActive && currentTier === 'monitor'}
                >
                  {isActive && currentTier === 'monitor' ? 'Current plan' : 'Subscribe to Monitor'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Intelligence */}
          <Card className={
            isActive && currentTier === 'intelligence'
              ? 'border-primary ring-1 ring-primary'
              : ''
          }>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold text-foreground">Intelligence</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Most popular</Badge>
                  {isActive && currentTier === 'intelligence' && (
                    <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                      Current plan
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">$199</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-2.5">
                {FEATURES_INTELLIGENCE.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <i className="ri-checkbox-circle-line text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Separator />
              <form action={createCheckoutSession.bind(null, env.STRIPE_INTELLIGENCE_PRICE_ID)}>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isActive && currentTier === 'intelligence'}
                >
                  {isActive && currentTier === 'intelligence' ? 'Current plan' : 'Subscribe to Intelligence'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          All plans billed monthly. Cancel anytime from your account settings.
          Content is for informational purposes only and does not constitute legal advice.
        </p>
      </div>
    </div>
  )
}
