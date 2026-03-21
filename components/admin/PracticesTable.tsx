'use client'

import { useState, useMemo } from 'react'
import { Badge, Button, Card, Box, Flex, IconButton, Text, Select, Table } from '@radix-ui/themes'
import { formatDate } from '@/lib/format'
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
      <Flex direction="column" gap="6">
        {/* Filter bar — same pattern as LibraryBrowser */}
        <Flex align="center" gap="2" wrap="wrap">
          <Select.Root value={filters.tier || 'all'} onValueChange={(v) => set('tier', v)}>
            <Select.Trigger className="w-36" />
            <Select.Content>
              <Select.Item value="all">All tiers</Select.Item>
              <Select.Item value="monitor">Monitor</Select.Item>
              <Select.Item value="intelligence">Intelligence</Select.Item>
            </Select.Content>
          </Select.Root>

          <Select.Root value={filters.status || 'all'} onValueChange={(v) => set('status', v)}>
            <Select.Trigger className="w-40" />
            <Select.Content>
              <Select.Item value="all">All statuses</Select.Item>
              <Select.Item value="active">Active</Select.Item>
              <Select.Item value="trialing">Trialing</Select.Item>
              <Select.Item value="past_due">Past Due</Select.Item>
              <Select.Item value="canceled">Canceled</Select.Item>
              <Select.Item value="inactive">Inactive</Select.Item>
            </Select.Content>
          </Select.Root>

          <Select.Root value={filters.practiceType || 'all'} onValueChange={(v) => set('practiceType', v)}>
            <Select.Trigger className="w-44" />
            <Select.Content>
              <Select.Item value="all">All types</Select.Item>
              {practiceTypes.map((t) => (
                <Select.Item key={t} value={t}>
                  {t.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          {hasActiveFilters(filters) && (
            <Button
              variant="ghost"
              color="gray"
              size="1"
              type="button"
              onClick={clear}
              className="text-[var(--cedar-text-secondary)] hover:text-[var(--cedar-text-primary)]"
            >
              <i className="ri-close-line mr-1" aria-hidden="true" />
              Clear filters
            </Button>
          )}
        </Flex>

        {/* Count label */}
        <Text as="span" size="1" color="gray" className="-mt-2 block">
          {filtered.length} practice{filtered.length !== 1 ? 's' : ''}
          {hasActiveFilters(filters) ? ` (filtered from ${localPractices.length})` : ''}
        </Text>

        {/* Empty state */}
        {filtered.length === 0 && (
          <Card>
            <Box p="4">
              <Flex direction="column" align="center" justify="center" py="9" className="text-center">
                <i className="ri-filter-off-line text-3xl text-[var(--cedar-border-strong)] mb-2" aria-hidden="true" />
                <Text as="span" size="2" color="gray">No practices match the current filters.</Text>
                {hasActiveFilters(filters) && (
                  <Button variant="ghost" color="gray" size="1" type="button" onClick={clear} className="mt-3 text-[var(--cedar-text-secondary)]">
                    Clear filters
                  </Button>
                )}
              </Flex>
            </Box>
          </Card>
        )}

        {/* Table */}
        {filtered.length > 0 && (
          <Card>
            <Box px="4" pt="4" pb="3">
              <Text as="span" size="1" weight="bold" color="gray" className="uppercase tracking-wide">
                All Practices
              </Text>
            </Box>
            <Box p="0">
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Practice</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Owner</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Tier</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Phone</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filtered.map((p) => (
                    <Table.Row key={p.id}>
                      <Table.RowHeaderCell>
                        <Text as="span" size="2" weight="medium">{p.name}</Text>
                      </Table.RowHeaderCell>
                      <Table.Cell>
                        <Text as="span" size="2" className="block">{p.owner_name ?? '—'}</Text>
                        <Text as="span" size="1" color="gray">{p.owner_email}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text as="span" size="2" color="gray">{p.practice_type ?? '—'}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <TierBadge tier={p.tier} />
                      </Table.Cell>
                      <Table.Cell>
                        <SubscriptionBadge status={p.subscription_status} />
                      </Table.Cell>
                      <Table.Cell>
                        <Text as="span" size="2" color="gray">{p.phone ?? '—'}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text as="span" size="2" color="gray">
                          <time dateTime={p.created_at}>{formatDate(p.created_at)}</time>
                        </Text>
                      </Table.Cell>
                      <Table.Cell justify="end">
                        <IconButton
                          variant="ghost"
                          color="gray"
                          size="1"
                          type="button"
                          aria-label={`View ${p.name}`}
                          onClick={() => setSelectedPractice(p)}
                        >
                          <i className="ri-arrow-right-s-line" aria-hidden="true" />
                        </IconButton>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          </Card>
        )}
      </Flex>

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
