export const dynamic = 'force-dynamic'
export const metadata = { title: 'Plans — Cedar' }

import { withAuth } from '@workos-inc/authkit-nextjs'
import { createServerClient } from '../../lib/db/client'
import { getEnv } from '../../lib/env'
import { createCheckoutSession } from '../actions/billing'
import { Badge, Button, Card, Box, Flex, Heading, Text, Separator } from '@radix-ui/themes'

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
    <Box className="min-h-screen bg-[var(--cedar-page-bg)]" py="9" px="4">
      <Box style={{ maxWidth: '56rem', margin: '0 auto' }}>
        {/* Header */}
        <Flex direction="column" align="center" mb="9">
          <Box mb="4">
            <i className="ri-leaf-line text-[var(--cedar-brand-primary)] text-3xl" aria-hidden="true" />
          </Box>
          <Heading as="h1" size="7" weight="bold" mb="3">Cedar Plans</Heading>
          <Text color="gray" style={{ maxWidth: '36rem', textAlign: 'center' }}>
            Florida regulatory intelligence for medical practices. Cancel anytime.
          </Text>
        </Flex>

        {/* Plan cards */}
        <section aria-labelledby="plans-heading">
          <Heading as="h2" id="plans-heading" className="sr-only">Choose your plan</Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monitor */}
            <Card className={
              isActive && currentTier === 'monitor'
                ? 'border-[var(--cedar-interactive-focus)] ring-1 ring-[var(--cedar-interactive-focus)]'
                : ''
            }>
              <Box px="5" pt="5" pb="4">
                <Flex align="center" justify="between" mb="1">
                  <Heading as="h3" size="4" weight="bold">Monitor</Heading>
                  {isActive && currentTier === 'monitor' && (
                    <Badge variant="outline" color="green">
                      Current plan
                    </Badge>
                  )}
                </Flex>
                <Flex align="baseline" gap="1">
                  <Text size="8" weight="bold">$99</Text>
                  <Text color="gray" size="2">/month</Text>
                </Flex>
              </Box>
              <Box px="5" pb="5">
                <Flex direction="column" gap="6">
                  <ul className="space-y-2.5">
                    {FEATURES_MONITOR.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-[var(--cedar-text-primary)]">
                        <i className="ri-checkbox-circle-line text-[var(--cedar-accent-text)] mt-0.5 shrink-0" aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Separator size="4" />
                  <form action={createCheckoutSession.bind(null, env.STRIPE_MONITOR_PRICE_ID ?? '')}>
                    <Button
                      type="submit"
                      variant="classic"
                      color="gray"
                      highContrast
                      style={{ width: '100%' }}
                      disabled={isActive && currentTier === 'monitor'}
                    >
                      {isActive && currentTier === 'monitor' ? 'Current plan' : 'Subscribe to Monitor'}
                    </Button>
                  </form>
                </Flex>
              </Box>
            </Card>

            {/* Intelligence */}
            <Card className={
              isActive && currentTier === 'intelligence'
                ? 'border-[var(--cedar-interactive-focus)] ring-1 ring-[var(--cedar-interactive-focus)]'
                : ''
            }>
              <Box px="5" pt="5" pb="4">
                <Flex align="center" justify="between" mb="1">
                  <Heading as="h3" size="4" weight="bold">Intelligence</Heading>
                  <Flex align="center" gap="2">
                    <Badge variant="soft" color="gray">Most popular</Badge>
                    {isActive && currentTier === 'intelligence' && (
                      <Badge variant="outline" color="green">
                        Current plan
                      </Badge>
                    )}
                  </Flex>
                </Flex>
                <Flex align="baseline" gap="1">
                  <Text size="8" weight="bold">$199</Text>
                  <Text color="gray" size="2">/month</Text>
                </Flex>
              </Box>
              <Box px="5" pb="5">
                <Flex direction="column" gap="6">
                  <ul className="space-y-2.5">
                    {FEATURES_INTELLIGENCE.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-[var(--cedar-text-primary)]">
                        <i className="ri-checkbox-circle-line text-[var(--cedar-accent-text)] mt-0.5 shrink-0" aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Separator size="4" />
                  <form action={createCheckoutSession.bind(null, env.STRIPE_INTELLIGENCE_PRICE_ID ?? '')}>
                    <Button
                      type="submit"
                      variant="classic"
                      color="gray"
                      highContrast
                      style={{ width: '100%' }}
                      disabled={isActive && currentTier === 'intelligence'}
                    >
                      {isActive && currentTier === 'intelligence' ? 'Current plan' : 'Subscribe to Intelligence'}
                    </Button>
                  </form>
                </Flex>
              </Box>
            </Card>
          </div>
        </section>

        <Text size="1" color="gray" as="p" mt="8" style={{ textAlign: 'center' }}>
          All plans billed monthly. Cancel anytime from your account settings.
          Content is for informational purposes only and does not constitute legal advice.
        </Text>
      </Box>
    </Box>
  )
}
