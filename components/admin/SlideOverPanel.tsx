'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Badge, Button, Flex, Heading, IconButton, Text, Theme } from '@radix-ui/themes'
import { formatDate } from '@/lib/format'
import type { Database } from '@/lib/db/types'

type PracticeRow = Database['public']['Tables']['practices']['Row']

interface SlideOverPanelProps {
  practice: PracticeRow
  acknowledgedCount: number
  onClose: () => void
  onTierChanged: (id: string, newTier: string) => void
  onDeleted: (id: string) => void
}

// Internal confirmation step state type
type ConfirmStep = 'tier' | 'delete' | null

export function SlideOverPanel({
  practice,
  acknowledgedCount,
  onClose,
  onTierChanged,
  onDeleted,
}: SlideOverPanelProps) {
  const [confirmStep, setConfirmStep] = useState<ConfirmStep>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  // Run exit animation (200ms = --duration-base), then call the parent callback
  function startClose(cb: () => void) {
    setIsClosing(true)
    setTimeout(cb, 200)
  }

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
      startClose(() => onDeleted(practice.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIsLoading(false)
    }
  }

  return (
    <Dialog.Root open={true} onOpenChange={(open) => { if (!open) startClose(onClose) }}>
      <Dialog.Portal>
        <Theme>
          {/* Scrim */}
          <Dialog.Overlay
            className={`fixed inset-0 z-40 bg-[var(--cedar-overlay)] !m-0 ${
              isClosing ? 'animate-scrim-out' : 'animate-scrim-in'
            }`}
          />

          {/* Panel */}
          <Dialog.Content
            className={`fixed inset-y-0 right-0 z-50 w-[480px] max-w-full
              bg-[var(--cedar-page-bg)] border-l border-[var(--cedar-border-subtle)]
              shadow-[var(--shadow-6)] overflow-y-auto flex flex-col !m-0 focus:outline-none ${
              isClosing ? 'animate-panel-out-right' : 'animate-panel-in-right'
            }`}
            onEscapeKeyDown={() => startClose(onClose)}
            onInteractOutside={(e) => { e.preventDefault(); startClose(onClose) }}
            aria-describedby={undefined}
          >
            {/* Header */}
            <Flex align="center" justify="between" px="6" py="4" className="border-b border-[var(--cedar-border-subtle)] shrink-0">
              <Dialog.Title asChild>
                <Heading as="h2" size="3" weight="bold" className="truncate pr-4">
                  {practice.name}
                </Heading>
              </Dialog.Title>
              <Dialog.Close asChild>
                <IconButton
                  variant="ghost"
                  color="gray"
                  size="1"
                  type="button"
                  aria-label="Close panel"
                  onClick={() => startClose(onClose)}
                  className="shrink-0 h-8 w-8"
                >
                  <i className="ri-close-line text-xl" aria-hidden="true" />
                </IconButton>
              </Dialog.Close>
            </Flex>

            <div className="flex-1 px-6 py-6 space-y-6">
              {/* Profile section */}
              <section>
                <Heading as="h3" size="1" weight="bold" color="gray" className="uppercase tracking-wide mb-3">
                  Practice Profile
                </Heading>
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
                      <dt className="text-xs text-[var(--cedar-text-secondary)] w-40 shrink-0 pt-px">{label}</dt>
                      <dd className="text-sm text-[var(--cedar-text-primary)]">{value}</dd>
                    </div>
                  ))}
                  {/* Tier — as badge */}
                  <div className="flex items-center gap-2">
                    <dt className="text-xs text-[var(--cedar-text-secondary)] w-40 shrink-0">Tier</dt>
                    <dd><TierBadge tier={practice.tier} /></dd>
                  </div>
                  {/* Subscription status — as badge */}
                  <div className="flex items-center gap-2">
                    <dt className="text-xs text-[var(--cedar-text-secondary)] w-40 shrink-0">Subscription Status</dt>
                    <dd><SubscriptionBadge status={practice.subscription_status} /></dd>
                  </div>
                </dl>
              </section>

              {/* Stats section */}
              <section>
                <Heading as="h3" size="1" weight="bold" color="gray" className="uppercase tracking-wide mb-3">
                  Account Stats
                </Heading>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-[var(--cedar-border-subtle)] bg-[var(--cedar-interactive-hover)] px-4 py-3">
                    <p className="text-xs text-[var(--cedar-text-secondary)] mb-1">Changes Acknowledged</p>
                    <p className="text-xl font-semibold text-[var(--cedar-text-primary)]">{acknowledgedCount}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--cedar-border-subtle)] bg-[var(--cedar-interactive-hover)] px-4 py-3">
                    <p className="text-xs text-[var(--cedar-text-secondary)] mb-1">Account Age</p>
                    <p className="text-xl font-semibold text-[var(--cedar-text-primary)]">{accountAgeDays}d</p>
                  </div>
                </div>
              </section>

              {/* Admin actions section */}
              <section>
                <Heading as="h3" size="1" weight="bold" color="gray" className="uppercase tracking-wide mb-3">
                  Admin Actions
                </Heading>

                {error && (
                  <p className="text-xs text-[var(--cedar-error-solid)] mb-3">{error}</p>
                )}

                {/* Tier toggle */}
                <div className="rounded-lg border border-[var(--cedar-border-subtle)] p-4 space-y-3 mb-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--cedar-text-primary)]">Tier</p>
                    <p className="text-xs text-[var(--cedar-text-secondary)] mt-0.5">
                      Currently on <strong>{practice.tier}</strong> plan.
                      Switch to <strong>{targetTier}</strong>?
                    </p>
                  </div>
                  {confirmStep === 'tier' ? (
                    <Flex align="center" gap="2">
                      <Button
                        size="1"
                        variant="classic"
                        color="gray"
                        highContrast
                        type="button"
                        onClick={handleTierChange}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Updating…' : `Confirm → ${targetTier}`}
                      </Button>
                      <Button
                        size="1"
                        variant="ghost"
                        color="gray"
                        type="button"
                        onClick={() => setConfirmStep(null)}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </Flex>
                  ) : (
                    <Button
                      size="1"
                      variant="soft"
                      color="gray"
                      highContrast
                      type="button"
                      onClick={() => setConfirmStep('tier')}
                    >
                      Switch to {targetTier}
                    </Button>
                  )}
                </div>

                {/* Soft delete */}
                <div className="rounded-lg border border-[var(--cedar-error-border)] p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--cedar-error-solid)]">Delete Practice</p>
                    <p className="text-xs text-[var(--cedar-text-secondary)] mt-0.5">
                      Soft-deletes this practice and removes the WorkOS user account.
                      This cannot be undone from the UI.
                    </p>
                  </div>
                  {confirmStep === 'delete' ? (
                    <Flex align="center" gap="2">
                      <Button
                        size="1"
                        variant="solid"
                        color="red"
                        type="button"
                        onClick={handleDelete}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Deleting…' : 'Confirm Delete'}
                      </Button>
                      <Button
                        size="1"
                        variant="ghost"
                        color="gray"
                        type="button"
                        onClick={() => setConfirmStep(null)}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </Flex>
                  ) : (
                    <Button
                      size="1"
                      variant="soft"
                      color="red"
                      type="button"
                      onClick={() => setConfirmStep('delete')}
                    >
                      <i className="ri-delete-bin-line mr-1.5" aria-hidden="true" />
                      Delete Practice
                    </Button>
                  )}
                </div>
              </section>
            </div>
          </Dialog.Content>
        </Theme>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ── Local badge helpers ────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  const isIntelligence = tier.toLowerCase() === 'intelligence'
  const label = tier.charAt(0).toUpperCase() + tier.slice(1)
  return (
    <Badge
      variant="soft"
      color={isIntelligence ? 'purple' : 'gray'}
      size="1"
    >
      {label}
    </Badge>
  )
}

function SubscriptionBadge({ status }: { status: string | null }) {
  if (!status) return <Text as="span" size="1" color="gray">—</Text>
  const colorMap: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'gray'> = {
    active:   'green',
    trialing: 'blue',
    past_due: 'amber',
    unpaid:   'amber',
    canceled: 'red',
  }
  const color = colorMap[status] ?? 'gray'
  const label = status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return <Badge variant="soft" color={color} size="1">{label}</Badge>
}
