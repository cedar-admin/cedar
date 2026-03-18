import Link from 'next/link'
import { createServerClient } from '../../../lib/db/client'
import { createBillingPortalSession } from '../../actions/billing'
import { getLayoutData } from '@/lib/layout-data'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Account, notifications, and billing</p>
      </div>

      {/* Admin role card — no practice/billing info */}
      {isAdmin && (
        <div className="grid grid-cols-1 gap-5 max-w-2xl">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium text-foreground">{user.email}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">
                  Admin
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Practice owner view */}
      {!isAdmin && !practice && (
        <Alert className="max-w-lg">
          <i className="ri-hospital-line text-base" />
          <AlertDescription>
            No practice configured. Contact{' '}
            <a href="mailto:cedaradmin@gmail.com" className="underline font-medium">
              cedaradmin@gmail.com
            </a>{' '}
            to get set up.
          </AlertDescription>
        </Alert>
      )}

      {!isAdmin && practice && (
        <div className="grid grid-cols-1 gap-5 max-w-2xl">
          {/* Practice Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Practice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium text-foreground">{practice.name}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Owner Email</span>
                <span className="text-sm font-medium text-foreground">{practice.owner_email}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <TierBadge tier={practice.tier ?? 'monitor'} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="text-sm text-foreground">
                  {new Date(practice.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card id="billing">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <SubscriptionStatus status={practice.subscription_status} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Renewal</span>
                <span className="text-sm text-foreground">{formatRenewal(practice.current_period_end)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stripe Customer</span>
                <span className="text-sm font-mono text-muted-foreground">{mask(practice.stripe_customer_id)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stripe Subscription</span>
                <span className="text-sm font-mono text-muted-foreground">{mask(practice.stripe_subscription_id)}</span>
              </div>

              {/* Billing actions */}
              <div className="pt-2">
                {practice.stripe_customer_id ? (
                  <form action={createBillingPortalSession}>
                    <Button type="submit" variant="outline" size="sm">
                      <i className="ri-bank-card-line" />
                      Manage Billing
                    </Button>
                  </form>
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/pricing">
                      <i className="ri-arrow-up-circle-line" />
                      Upgrade Plan
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card id="notifications">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card id="team">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Invite row */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Invite a team member</p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="colleague@practice.com"
                    className="flex-1"
                  />
                  <Select defaultValue="monitor">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monitor">Monitor</SelectItem>
                      <SelectItem value="intelligence">Intelligence</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" disabled>
                    <i className="ri-mail-send-line" />
                    Invite
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Team invitations are available on the Intelligence plan.
                </p>
              </div>
              <Separator />
              {/* Current members */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Current members</p>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-primary/10 flex items-center justify-center shrink-0">
                      <i className="ri-user-line text-primary text-sm" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {practice.owner_email}
                      </p>
                      <p className="text-xs text-muted-foreground">Owner</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Owner</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jurisdictions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Jurisdictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2.5">
                <i className="ri-map-pin-2-line text-primary" />
                <span className="text-sm font-medium text-foreground">Florida (FL)</span>
                <span className="text-xs text-muted-foreground">— 10 sources monitored</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
