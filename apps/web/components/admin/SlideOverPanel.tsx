'use client'

import { useState } from 'react'

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
    <div>
      {/* Scrim */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 ${
          isClosing ? 'animate-scrim-out' : 'animate-scrim-in'
        }`}
        onClick={() => startClose(onClose)}
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-[480px] max-w-full
          bg-white border-l shadow-lg overflow-y-auto flex flex-col focus:outline-none ${
          isClosing ? 'animate-panel-out-right' : 'animate-panel-in-right'
        }`}
        role="dialog"
        aria-describedby={undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="truncate pr-4 font-bold">
            {practice.name}
          </h2>
          <button
            type="button"
            aria-label="Close panel"
            onClick={() => startClose(onClose)}
            className="shrink-0 h-8 w-8"
          >
            <span aria-hidden="true">X</span>
          </button>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6">
          {/* Profile section */}
          <section>
            <h3 className="uppercase tracking-wide mb-3 text-sm font-bold">
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
                  <dt className="text-xs w-40 shrink-0 pt-px">{label}</dt>
                  <dd className="text-sm">{value}</dd>
                </div>
              ))}
              {/* Tier — as badge */}
              <div className="flex items-center gap-2">
                <dt className="text-xs w-40 shrink-0">Tier</dt>
                <dd><TierBadge tier={practice.tier} /></dd>
              </div>
              {/* Subscription status — as badge */}
              <div className="flex items-center gap-2">
                <dt className="text-xs w-40 shrink-0">Subscription Status</dt>
                <dd><SubscriptionBadge status={practice.subscription_status} /></dd>
              </div>
            </dl>
          </section>

          {/* Stats section */}
          <section>
            <h3 className="uppercase tracking-wide mb-3 text-sm font-bold">
              Account Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border px-4 py-3">
                <p className="text-xs mb-1">Changes Acknowledged</p>
                <p className="text-xl font-semibold">{acknowledgedCount}</p>
              </div>
              <div className="rounded-lg border px-4 py-3">
                <p className="text-xs mb-1">Account Age</p>
                <p className="text-xl font-semibold">{accountAgeDays}d</p>
              </div>
            </div>
          </section>

          {/* Admin actions section */}
          <section>
            <h3 className="uppercase tracking-wide mb-3 text-sm font-bold">
              Admin Actions
            </h3>

            {error && (
              <p className="text-xs text-red-600 mb-3">{error}</p>
            )}

            {/* Tier toggle */}
            <div className="rounded-lg border p-4 space-y-3 mb-3">
              <div>
                <p className="text-sm font-medium">Tier</p>
                <p className="text-xs mt-0.5">
                  Currently on <strong>{practice.tier}</strong> plan.
                  Switch to <strong>{targetTier}</strong>?
                </p>
              </div>
              {confirmStep === 'tier' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTierChange}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm border rounded"
                  >
                    {isLoading ? 'Updating…' : `Confirm → ${targetTier}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmStep(null)}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmStep('tier')}
                  className="px-3 py-1 text-sm border rounded"
                >
                  Switch to {targetTier}
                </button>
              )}
            </div>

            {/* Soft delete */}
            <div className="rounded-lg border border-red-300 p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-red-600">Delete Practice</p>
                <p className="text-xs mt-0.5">
                  Soft-deletes this practice and removes the WorkOS user account.
                  This cannot be undone from the UI.
                </p>
              </div>
              {confirmStep === 'delete' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded"
                  >
                    {isLoading ? 'Deleting…' : 'Confirm Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmStep(null)}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmStep('delete')}
                  className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded"
                >
                  <span aria-hidden="true" /> Delete Practice
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

// ── Local badge helpers ────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  const label = tier.charAt(0).toUpperCase() + tier.slice(1)
  return (
    <span className="inline-flex px-2 py-0.5 text-xs rounded">
      {label}
    </span>
  )
}

function SubscriptionBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs">—</span>
  const label = status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return <span className="inline-flex px-2 py-0.5 text-xs rounded">{label}</span>
}
