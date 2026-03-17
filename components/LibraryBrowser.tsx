'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface Regulation {
  id: string
  title: string
  agency: string
  topic: string
  subtopic: string
  status: string
  jurisdiction: string
  lastUpdated: string
  summary: string
}

interface Filters {
  agency: string
  topic: string
  jurisdiction: string
  status: string
}

const EMPTY_FILTERS: Filters = { agency: '', topic: '', jurisdiction: '', status: '' }

function hasActiveFilters(f: Filters) {
  return Object.values(f).some(Boolean)
}

export function LibraryBrowser({
  regulations,
  isGated,
}: {
  regulations: Regulation[]
  isGated: boolean
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)

  const filtered = useMemo(() => {
    return regulations.filter((r) => {
      if (filters.agency      && r.agency.toLowerCase()       !== filters.agency)       return false
      if (filters.topic       && r.topic.toLowerCase()        !== filters.topic)        return false
      if (filters.jurisdiction && r.jurisdiction.toLowerCase() !== filters.jurisdiction) return false
      if (filters.status      && r.status.toLowerCase()       !== filters.status)       return false
      return true
    })
  }, [regulations, filters])

  function set(key: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value === 'all' ? '' : value }))
  }

  function clear() {
    setFilters(EMPTY_FILTERS)
  }

  return (
    <div className="space-y-6">
      {/* Chat bar (shell) */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <i className="ri-search-ai-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base" />
          <Input
            placeholder="Ask a regulatory question… (Intelligence plan feature)"
            className="pl-9"
            disabled={isGated}
          />
        </div>
        <Button variant="outline" size="icon" disabled className="shrink-0">
          <i className="ri-send-plane-line" />
        </Button>
      </div>
      {isGated && (
        <p className="text-xs text-muted-foreground -mt-4">
          <i className="ri-lock-2-line mr-1" />
          AI Q&amp;A is available on the Intelligence plan.
        </p>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={filters.agency || 'all'} onValueChange={(v) => set('agency', v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Agency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All agencies</SelectItem>
            <SelectItem value="fda">FDA</SelectItem>
            <SelectItem value="dea">DEA</SelectItem>
            <SelectItem value="fl doh">FL DOH</SelectItem>
            <SelectItem value="fl board of medicine">FL Board of Medicine</SelectItem>
            <SelectItem value="fl board of pharmacy">FL Board of Pharmacy</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.topic || 'all'} onValueChange={(v) => set('topic', v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All topics</SelectItem>
            <SelectItem value="compounding">Compounding</SelectItem>
            <SelectItem value="telehealth">Telehealth</SelectItem>
            <SelectItem value="prescribing">Prescribing</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="medical practice">Medical Practice</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.jurisdiction || 'all'} onValueChange={(v) => set('jurisdiction', v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Jurisdiction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="federal">Federal</SelectItem>
            <SelectItem value="florida">Florida</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status || 'all'} onValueChange={(v) => set('status', v)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="superseded">Superseded</SelectItem>
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

      {/* Results */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          {hasActiveFilters(filters) ? ` (filtered from ${regulations.length})` : ''}
        </p>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <i className="ri-filter-off-line text-3xl text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No regulations match the current filters.</p>
              <Button variant="ghost" size="sm" onClick={clear} className="mt-3 text-muted-foreground">
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="divide-y divide-border border border-border rounded-md overflow-hidden">
            {filtered.map((reg) => (
              <Link key={reg.id} href={`/library/${reg.id}`} className="flex items-start gap-4 px-4 py-4 bg-card hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge variant="outline" className="text-xs">{reg.agency}</Badge>
                    <Badge variant="secondary" className="text-xs">{reg.topic}</Badge>
                    <Badge variant="outline" className="text-xs text-muted-foreground">{reg.jurisdiction}</Badge>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{reg.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{reg.summary}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">Updated</p>
                  <p className="text-xs font-medium text-foreground">
                    {new Date(reg.lastUpdated).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
