'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import type { Database } from '@/lib/db/types'

type PracticeRow = Database['public']['Tables']['practices']['Row']

interface PracticeSlideOverProps {
  practice: PracticeRow
  acknowledgedCount: number
  onClose: () => void
  onTierChanged: (id: string, newTier: string) => void
  onDeleted: (id: string) => void
}

// Internal confirmation step state type
type ConfirmStep = 'tier' | 'delete' | null

export function PracticeSlideOver({
  practice,
  acknowledgedCount,
  onClose,
  onTierChanged,
  onDeleted,
}: PracticeSlideOverProps) {
  const [confirmStep, setConfirmStep] = useState<ConfirmStep>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate account age in days
  const accountAgeDays = Math.floor(
    (Date.now() - new Date(practice.created_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  const targetTier = practice.tier === 'monitor' ? 'intelligence' : 'monitor'

  async function handleTierChange() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/practices/${practice.id}/tier`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: targetTier }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? 'Tier update failed')
      }
      onTierChanged(practice.id, targetTier)
      setConfirmStep(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/practices/${practice.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? 'Delete failed')
      }
      onDeleted(practice.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-40 bg-scrim animate-scrim-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-[480px] max-w-full bg-background border-l border-border shadow-xl overflow-y-auto flex flex-col animate-panel-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-foreground truncate pr-4">
            {practice.name}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground shrink-0 h-8 w-8"
            aria-label="Close panel"
          >
            <i className="ri-close-line text-xl" />
          </Button>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6">
          {/* Profile section */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Practice Profile
            </h3>
            <dl className="space-y-2">
              {[
                { label: 'Practice Name', value: practice.name },
                { label: 'Owner Name', value: practice.owner_name ?? '—' },
                { label: 'Owner Email', value: practice.owner_email },
                { label: 'Practice Type', value: practice.practice_type ?? '—' },
                { label: 'Phone', value: practice.phone ?? '—' },
                { label: 'State', value: 'FL' },
                { label: 'Stripe Customer ID', value: practice.stripe_customer_id ?? '—' },
                { label: 'Stripe Subscription ID', value: practice.stripe_subscription_id ?? '—' },
                { label: 'Current Period End', value: practice.current_period_end ? formatDate(practice.current_period_end) : '—' },
                { label: 'Created', value: formatDate(practice.created_at) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-2">
                  <dt className="text-xs text-muted-foreground w-40 shrink-0 pt-px">{label}</dt>
                  <dd className="text-sm text-foreground">{value}</dd>
                </div>
              ))}
              {/* Tier — as badge */}
              <div className="flex items-center gap-2">
                <dt className="text-xs text-muted-foreground w-40 shrink-0">Tier</dt>
                <dd><TierBadge tier={practice.tier} /></dd>
              </div>
              {/* Subscription status — as badge */}
              <div className="flex items-center gap-2">
                <dt className="text-xs text-muted-foreground w-40 shrink-0">Subscription Status</dt>
                <dd><SubscriptionBadge status={practice.subscription_status} /></dd>
              </div>
            </dl>
          </section>

          {/* Stats section */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Account Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Changes Acknowledged</p>
                <p className="text-xl font-semibold text-foreground">{acknowledgedCount}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Account Age</p>
                <p className="text-xl font-semibold text-foreground">{accountAgeDays}d</p>
              </div>
            </div>
          </section>

          {/* Admin actions section */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Admin Actions
            </h3>

            {error && (
              <p className="text-xs text-destructive mb-3">{error}</p>
            )}

            {/* Tier toggle */}
            <div className="rounded-lg border border-border p-4 space-y-3 mb-3">
              <div>
                <p className="text-sm font-medium text-foreground">Tier</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Currently on <strong>{practice.tier}</strong> plan.
                  Switch to <strong>{targetTier}</strong>?
                </p>
              </div>
              {confirmStep === 'tier' ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleTierChange}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating…' : `Confirm → ${targetTier}`}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmStep(null)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmStep('tier')}
                >
                  Switch to {targetTier}
                </Button>
              )}
            </div>

            {/* Soft delete */}
            <div className="rounded-lg border border-destructive/30 p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-destructive">Delete Practice</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Soft-deletes this practice and removes the WorkOS user account.
                  This cannot be undone from the UI.
                </p>
              </div>
              {confirmStep === 'delete' ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Deleting…' : 'Confirm Delete'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmStep(null)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => setConfirmStep('delete')}
                >
                  <i className="ri-delete-bin-line mr-1.5" />
                  Delete Practice
                </Button>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

// ── Local badge helpers ────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  const isIntelligence = tier.toLowerCase() === 'intelligence'
  const label = tier.charAt(0).toUpperCase() + tier.slice(1)
  return (
    <Badge
      variant="outline"
      className={
        isIntelligence
          ? 'text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800'
          : 'text-xs'
      }
    >
      {label}
    </Badge>
  )
}

function SubscriptionBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-muted-foreground">—</span>
  const styles: Record<string, string> = {
    active:   'text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
    trialing: 'text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
    past_due: 'text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    unpaid:   'text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    canceled: 'text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
  }
  const cls = styles[status] ?? 'text-xs text-muted-foreground'
  const label = status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return <Badge variant="outline" className={cls}>{label}</Badge>
}
