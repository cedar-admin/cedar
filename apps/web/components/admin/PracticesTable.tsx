'use client'

import { useState, useMemo } from 'react'
import { formatDate } from '@/lib/format'
import { CedarTable } from '@/components/CedarTable'
import { SlideOverPanel } from '@/components/admin/SlideOverPanel'
import type { Database } from '@/lib/db/types'

type PracticeRow = Database['public']['Tables']['practices']['Row']

interface PracticesTableProps {
  practices: PracticeRow[]
  ackCounts: Record<string, number>
}

interface Filters {
  tier: string
  status: string
  practiceType: string
}

const EMPTY_FILTERS: Filters = { tier: '', status: '', practiceType: '' }

function hasActiveFilters(f: Filters) {
  return Object.values(f).some(Boolean)
}

export function PracticesTable({ practices, ackCounts }: PracticesTableProps) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [selectedPractice, setSelectedPractice] = useState<PracticeRow | null>(null)
  // Local copy of practices for optimistic UI updates (tier change, deletion)
  const [localPractices, setLocalPractices] = useState<PracticeRow[]>(practices)

  // Derive unique practice types from data (for filter dropdown)
  const practiceTypes = useMemo(() => {
    const types = new Set<string>()
    for (const p of localPractices) {
      if (p.practice_type) types.add(p.practice_type)
    }
    return Array.from(types).sort()
  }, [localPractices])

  // Apply filters
  const filtered = useMemo(() => {
    return localPractices.filter((p) => {
      if (filters.tier && p.tier !== filters.tier) return false
      if (filters.status && p.subscription_status !== filters.status) return false
      if (filters.practiceType && p.practice_type !== filters.practiceType) return false
      return true
    })
  }, [localPractices, filters])

  function set(key: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value === 'all' ? '' : value }))
  }

  function clear() {
    setFilters(EMPTY_FILTERS)
  }

  // Called from slide-over after successful tier change
  function handleTierChanged(id: string, newTier: string) {
    setLocalPractices((prev) =>
      prev.map((p) => p.id === id ? { ...p, tier: newTier } : p)
    )
    setSelectedPractice((prev) => prev?.id === id ? { ...prev, tier: newTier } : prev)
  }

  // Called from slide-over after successful delete
  function handleDeleted(id: string) {
    setLocalPractices((prev) => prev.filter((p) => p.id !== id))
    setSelectedPractice(null)
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <select className="w-36 border rounded px-2 py-1 text-sm" value={filters.tier || 'all'} onChange={(e) => set('tier', e.target.value)}>
            <option value="all">All tiers</option>
            <option value="monitor">Monitor</option>
            <option value="intelligence">Intelligence</option>
          </select>

          <select className="w-40 border rounded px-2 py-1 text-sm" value={filters.status || 'all'} onChange={(e) => set('status', e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="past_due">Past Due</option>
            <option value="canceled">Canceled</option>
            <option value="inactive">Inactive</option>
          </select>

          <select className="w-44 border rounded px-2 py-1 text-sm" value={filters.practiceType || 'all'} onChange={(e) => set('practiceType', e.target.value)}>
            <option value="all">All types</option>
            {practiceTypes.map((t) => (
              <option key={t} value={t}>
                {t.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>

          {hasActiveFilters(filters) && (
            <button
              type="button"
              onClick={clear}
              className="text-sm"
            >
              <span aria-hidden="true" /> Clear filters
            </button>
          )}
        </div>

        {/* Count label */}
        <span className="text-xs -mt-2 block">
          {filtered.length} practice{filtered.length !== 1 ? 's' : ''}
          {hasActiveFilters(filters) ? ` (filtered from ${localPractices.length})` : ''}
        </span>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="border rounded p-4">
            <div className="flex flex-col items-center justify-center py-9 text-center">
              <span className="text-3xl mb-2" aria-hidden="true" />
              <span className="text-sm">No practices match the current filters.</span>
              {hasActiveFilters(filters) && (
                <button type="button" onClick={clear} className="mt-3 text-sm">
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        {filtered.length > 0 && (
          <div className="border rounded">
            <div className="px-4 pt-4 pb-3">
              <span className="text-xs font-bold uppercase tracking-wide">
                All Practices
              </span>
            </div>
            <div className="p-0">
              <CedarTable surface="nested">
                <thead>
                  <tr>
                    <th>Practice</th>
                    <th>Owner</th>
                    <th>Type</th>
                    <th>Tier</th>
                    <th>Status</th>
                    <th>Phone</th>
                    <th>Created</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <th scope="row">
                        <span className="text-sm font-medium">{p.name}</span>
                      </th>
                      <td>
                        <span className="text-sm block">{p.owner_name ?? '—'}</span>
                        <span className="text-xs">{p.owner_email}</span>
                      </td>
                      <td>
                        <span className="text-sm">{p.practice_type ?? '—'}</span>
                      </td>
                      <td>
                        <TierBadge tier={p.tier} />
                      </td>
                      <td>
                        <SubscriptionBadge status={p.subscription_status} />
                      </td>
                      <td>
                        <span className="text-sm">{p.phone ?? '—'}</span>
                      </td>
                      <td>
                        <span className="text-sm">
                          <time dateTime={p.created_at}>{formatDate(p.created_at)}</time>
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          aria-label={`View ${p.name}`}
                          onClick={() => setSelectedPractice(p)}
                          className="text-sm"
                        >
                          <span aria-hidden="true">&rarr;</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </CedarTable>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over — rendered outside table div so it's not clipped */}
      {selectedPractice && (
        <SlideOverPanel
          practice={selectedPractice}
          acknowledgedCount={ackCounts[selectedPractice.id] ?? 0}
          onClose={() => setSelectedPractice(null)}
          onTierChanged={handleTierChanged}
          onDeleted={handleDeleted}
        />
      )}
    </>
  )
}

// ── Badge helpers ─────────────────────────────────────────────────────────────

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
