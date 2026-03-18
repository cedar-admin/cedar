'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/format'
import { PracticeSlideOver } from '@/components/admin/PracticeSlideOver'
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
      <div className="space-y-6">
        {/* Filter bar — same pattern as LibraryBrowser */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filters.tier || 'all'} onValueChange={(v) => set('tier', v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tiers</SelectItem>
              <SelectItem value="monitor">Monitor</SelectItem>
              <SelectItem value="intelligence">Intelligence</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status || 'all'} onValueChange={(v) => set('status', v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trialing">Trialing</SelectItem>
              <SelectItem value="past_due">Past Due</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.practiceType || 'all'} onValueChange={(v) => set('practiceType', v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Practice Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {practiceTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters(filters) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-muted-foreground hover:text-foreground"
            >
              <i className="ri-close-line mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        {/* Count label */}
        <p className="text-xs text-muted-foreground -mt-2">
          {filtered.length} practice{filtered.length !== 1 ? 's' : ''}
          {hasActiveFilters(filters) ? ` (filtered from ${localPractices.length})` : ''}
        </p>

        {/* Empty state */}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <i className="ri-filter-off-line text-3xl text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No practices match the current filters.</p>
              {hasActiveFilters(filters) && (
                <Button variant="ghost" size="sm" onClick={clear} className="mt-3 text-muted-foreground">
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Table */}
        {filtered.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                All Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Practice</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow
                      key={p.id}
                      onClick={() => setSelectedPractice(p)}
                      className="cursor-pointer hover:bg-muted/30"
                    >
                      <TableCell>
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground">{p.owner_name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{p.owner_email}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.practice_type ?? '—'}
                      </TableCell>
                      <TableCell>
                        <TierBadge tier={p.tier} />
                      </TableCell>
                      <TableCell>
                        <SubscriptionBadge status={p.subscription_status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.phone ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(p.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Slide-over — rendered outside table div so it's not clipped */}
      {selectedPractice && (
        <PracticeSlideOver
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
