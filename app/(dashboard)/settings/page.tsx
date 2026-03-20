import Link from 'next/link'
import { createServerClient } from '../../../lib/db/client'
import { createBillingPortalSession } from '../../actions/billing'
import { getLayoutData } from '@/lib/layout-data'
import { Badge, Card, Box, Flex, Heading, Text, Button, Separator, Callout, TextField, Select } from '@radix-ui/themes'
import { capitalize } from '@/lib/format'
import { NotificationsForm } from '@/components/NotificationsForm'
import type { NotificationPreferences } from '@/app/actions/settings'

// ── Helpers ───────────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  const isIntelligence = tier.toLowerCase() === 'intelligence'
  return (
    <Badge
      variant="outline"
      className={
        isIntelligence
          ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800'
          : ''
      }
    >
      {capitalize(tier)}
    </Badge>
  )
}

function SubscriptionStatus({ status }: { status: string | null }) {
  const s = status ?? 'inactive'
  if (s === 'active' || s === 'trialing') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-400">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        {s === 'trialing' ? 'Trialing' : 'Active'}
      </span>
    )
  }
  if (s === 'past_due') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-yellow-700 dark:text-yellow-400">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        Past due
      </span>
    )
  }
  if (s === 'canceled') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 dark:text-red-400">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Canceled
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--gray-11)]">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gray-a6)]" />
      {s === 'inactive' ? 'No subscription' : capitalize(s)}
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
    <Flex direction="column" gap="6">
      {/* Header */}
      <Box>
        <Heading size="6" weight="bold">Settings</Heading>
        <Text size="2" color="gray" as="p" mt="1">Account, notifications, and billing</Text>
      </Box>

      {/* Admin role card — no practice/billing info */}
      {isAdmin && (
        <div className="grid grid-cols-1 gap-5 max-w-2xl">
          <Card>
            <Box px="4" pt="4" pb="3">
              <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                Account
              </Text>
            </Box>
            <Box p="4" pt="0">
              <Flex direction="column" gap="3">
                <Flex align="center" justify="between">
                  <Text size="2" color="gray">Email</Text>
                  <Text size="2" weight="medium">{user.email}</Text>
                </Flex>
                <Separator size="4" />
                <Flex align="center" justify="between">
                  <Text size="2" color="gray">Role</Text>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">
                    Admin
                  </Badge>
                </Flex>
              </Flex>
            </Box>
          </Card>
        </div>
      )}

      {/* Practice owner view */}
      {!isAdmin && !practice && (
        <Callout.Root className="max-w-lg">
          <Callout.Icon>
            <i className="ri-hospital-line text-base" />
          </Callout.Icon>
          <Callout.Text>
            No practice configured. Contact{' '}
            <a href="mailto:cedaradmin@gmail.com" className="underline font-medium">
              cedaradmin@gmail.com
            </a>{' '}
            to get set up.
          </Callout.Text>
        </Callout.Root>
      )}

      {!isAdmin && practice && (
        <div className="grid grid-cols-1 gap-5 max-w-2xl">
          {/* Practice Info */}
          <Card>
            <Box px="4" pt="4" pb="3">
              <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                Practice
              </Text>
            </Box>
            <Box p="4" pt="0">
              <Flex direction="column" gap="3">
                <Flex align="center" justify="between">
                  <Text size="2" color="gray">Name</Text>
                  <Text size="2" weight="medium">{practice.name}</Text>
                </Flex>
                <Separator size="4" />
                <Flex align="center" justify="between">
                  <Text size="2" color="gray">Owner Email</Text>
                  <Text size="2" weight="medium">{practice.owner_email}</Text>
                </Flex>
                <Separator size="4" />
                <Flex align="center" justify="between">
                  <Text size="2" color="gray">Plan</Text>
                  <TierBadge tier={practice.tier ?? 'monitor'} />
                </Flex>
                <Separator size="4" />
                <Flex align="center" justify="between">
                  <Text size="2" color="gray">Member Since</Text>
                  <Text size="2">
                    {new Date(practice.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </Text>
                </Flex>
              </Flex>
            </Box>
          </Card>

          {/* Subscription */}
          <Card id="billing">
            <Box px="4" pt="4" pb="3">
              <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                Subscription
              </Text>
            </Box>
            <Box p="4" pt="0">
              <Flex direction="column" gap="3">
                <Flex align="center" justify="between">
                  <Text size="2" color="gray">Status</Text>
                  <SubscriptionStatus status={practice.subscription_status} />
                </Flex>
                <Separator size="4" />
                <Flex align="center" justify="between">
                  <Text size="2" color="gray">Renewal</Text>
                  <Text size="2">{formatRenewal(practice.current_period_end)}</Text>
                </Flex>
                <Separator size="4" />
                <Flex align="center" justify="between">
                  <Text size="2" color="gray">Stripe Customer</Text>
                  <Text size="2" className="font-mono text-[var(--gray-11)]">{mask(practice.stripe_customer_id)}</Text>
                </Flex>
                <Separator size="4" />
                <Flex align="center" justify="between">
                  <Text size="2" color="gray">Stripe Subscription</Text>
                  <Text size="2" className="font-mono text-[var(--gray-11)]">{mask(practice.stripe_subscription_id)}</Text>
                </Flex>

                {/* Billing actions */}
                <Box pt="2">
                  {practice.stripe_customer_id ? (
                    <form action={createBillingPortalSession}>
                      <Button type="submit" variant="outline" size="1">
                        <i className="ri-bank-card-line" />
                        Manage Billing
                      </Button>
                    </form>
                  ) : (
                    <Button variant="outline" size="1" asChild>
                      <Link href="/pricing">
                        <i className="ri-arrow-up-circle-line" />
                        Upgrade Plan
                      </Link>
                    </Button>
                  )}
                </Box>
              </Flex>
            </Box>
          </Card>

          {/* Notifications */}
          <Card id="notifications">
            <Box px="4" pt="4" pb="3">
              <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                Notifications
              </Text>
            </Box>
            <Box p="4" pt="0">
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
            </Box>
          </Card>

          {/* Team Members */}
          <Card id="team">
            <Box px="4" pt="4" pb="3">
              <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                Team Members
              </Text>
            </Box>
            <Box p="4" pt="0">
              <Flex direction="column" gap="4">
                {/* Invite row */}
                <Box>
                  <Text size="2" weight="medium" as="p" mb="2">Invite a team member</Text>
                  <Flex gap="2">
                    <TextField.Root
                      type="email"
                      placeholder="colleague@practice.com"
                      style={{ flex: 1 }}
                    />
                    <Select.Root defaultValue="monitor">
                      <Select.Trigger className="w-32" />
                      <Select.Content>
                        <Select.Item value="monitor">Monitor</Select.Item>
                        <Select.Item value="intelligence">Intelligence</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    <Button variant="outline" size="1" disabled>
                      <i className="ri-mail-send-line" />
                      Invite
                    </Button>
                  </Flex>
                  <Text size="1" color="gray" as="p" mt="1">
                    Team invitations are available on the Intelligence plan.
                  </Text>
                </Box>
                <Separator size="4" />
                {/* Current members */}
                <Box>
                  <Text size="1" color="gray" as="p" mb="2">Current members</Text>
                  <Flex align="center" justify="between" py="2">
                    <Flex align="center" gap="2">
                      <Box
                        width="7"
                        height="7"
                        className="bg-[var(--accent-a3)] flex items-center justify-center shrink-0"
                      >
                        <i className="ri-user-line text-[var(--accent-9)] text-sm" />
                      </Box>
                      <Box>
                        <Text size="2" weight="medium" as="p">
                          {practice.owner_email}
                        </Text>
                        <Text size="1" color="gray" as="p">Owner</Text>
                      </Box>
                    </Flex>
                    <Badge variant="outline" className="text-xs">Owner</Badge>
                  </Flex>
                </Box>
              </Flex>
            </Box>
          </Card>

          {/* Jurisdictions */}
          <Card>
            <Box px="4" pt="4" pb="3">
              <Text size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                Jurisdictions
              </Text>
            </Box>
            <Box p="4" pt="0">
              <Flex align="center" gap="2">
                <i className="ri-map-pin-2-line text-[var(--accent-9)]" />
                <Text size="2" weight="medium">Florida (FL)</Text>
                <Text size="2" color="gray">— 10 sources monitored</Text>
              </Flex>
            </Box>
          </Card>
        </div>
      )}
    </Flex>
  )
}
