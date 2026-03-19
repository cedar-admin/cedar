'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

export interface LibraryEntity {
  id: string
  name: string
  description: string | null
  entity_type: string
  document_type: string | null
  jurisdiction: string
  status: string | null
  citation: string | null
  publication_date: string | null
  external_url: string | null
}

export interface LibraryFilters {
  type: string
  jurisdiction: string
  q: string
}

interface Props {
  entities: LibraryEntity[]
  total: number
  page: number
  totalPages: number
  from: number
  filters: LibraryFilters
  isGated: boolean
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  regulation:        'Regulation',
  proposed_rule:     'Proposed Rule',
  notice:            'Notice',
  enforcement_action: 'Enforcement Action',
}

const DOC_TYPE_LABELS: Record<string, string> = {
  CFR_PART:          'CFR Part',
  Rule:              'Rule',
  Notice:            'Notice',
  DRUG_ENFORCEMENT:  'Drug Enforcement',
  DEVICE_ENFORCEMENT: 'Device Enforcement',
}

const JURISDICTION_LABELS: Record<string, string> = {
  US: 'Federal',
  FL: 'Florida',
}

function buildUrl(filters: LibraryFilters, page: number) {
  const params = new URLSearchParams()
  if (filters.type)         params.set('type', filters.type)
  if (filters.jurisdiction) params.set('jurisdiction', filters.jurisdiction)
  if (filters.q)            params.set('q', filters.q)
  if (page > 1)             params.set('page', String(page))
  const qs = params.toString()
  return `/library${qs ? `?${qs}` : ''}`
}

export function LibraryBrowser({ entities, total, page, totalPages, from, filters, isGated }: Props) {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState(filters.q)

  const navigate = useCallback((next: Partial<LibraryFilters>) => {
    const merged = { ...filters, ...next }
    router.push(buildUrl(merged, 1))
  }, [filters, router])

  function submitSearch() {
    navigate({ q: searchInput.trim() })
  }

  const hasFilters = filters.type || filters.jurisdiction || filters.q

  return (
    <div className="space-y-6">
      {/* Search + filters */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base" />
            <Input
              placeholder="Search regulations, rules, notices…"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitSearch() }}
              disabled={isGated}
            />
          </div>
          <Button
            variant="outline"
            onClick={submitSearch}
            disabled={isGated}
            className="shrink-0"
          >
            Search
          </Button>
          {searchInput && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setSearchInput(''); navigate({ q: '' }) }}
              className="shrink-0 text-muted-foreground"
            >
              <i className="ri-close-line" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={filters.type || 'all'}
            onValueChange={(v) => navigate({ type: v === 'all' ? '' : v })}
            disabled={isGated}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="regulation">Regulation</SelectItem>
              <SelectItem value="notice">Notice</SelectItem>
              <SelectItem value="enforcement_action">Enforcement Action</SelectItem>
              <SelectItem value="proposed_rule">Proposed Rule</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.jurisdiction || 'all'}
            onValueChange={(v) => navigate({ jurisdiction: v === 'all' ? '' : v })}
            disabled={isGated}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Jurisdiction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All jurisdictions</SelectItem>
              <SelectItem value="US">Federal (US)</SelectItem>
              <SelectItem value="FL">Florida</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearchInput(''); navigate({ type: '', jurisdiction: '', q: '' }) }}
              className="text-muted-foreground hover:text-foreground"
            >
              <i className="ri-close-line mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {isGated
          ? 'Upgrade to access the Regulation Library'
          : `${total.toLocaleString()} result${total !== 1 ? 's' : ''}${hasFilters ? ' (filtered)' : ''}`}
      </p>

      {/* List */}
      {entities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <i className="ri-file-search-line text-3xl text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              {hasFilters ? 'No results match the current filters.' : 'No regulations found.'}
            </p>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearchInput(''); navigate({ type: '', jurisdiction: '', q: '' }) }}
                className="mt-3 text-muted-foreground"
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="divide-y divide-border border border-border rounded-md overflow-hidden">
          {entities.map((entity) => (
            <Link
              key={entity.id}
              href={`/library/${entity.id}`}
              className="flex items-start gap-4 px-4 py-4 bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {ENTITY_TYPE_LABELS[entity.entity_type] ?? entity.entity_type}
                  </Badge>
                  {entity.document_type && entity.document_type !== entity.entity_type && (
                    <Badge variant="secondary" className="text-xs">
                      {DOC_TYPE_LABELS[entity.document_type] ?? entity.document_type}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    {JURISDICTION_LABELS[entity.jurisdiction] ?? entity.jurisdiction}
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-foreground line-clamp-2">{entity.name}</p>
                {entity.citation && (
                  <p className="text-xs text-muted-foreground mt-0.5">{entity.citation}</p>
                )}
                {entity.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entity.description}</p>
                )}
              </div>
              {entity.publication_date && (
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">Published</p>
                  <p className="text-xs font-medium text-foreground">
                    {new Date(entity.publication_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(from + 1).toLocaleString()}–{Math.min(from + entities.length, total).toLocaleString()} of {total.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={buildUrl(filters, page - 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors"
              >
                <i className="ri-arrow-left-line" /> Previous
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md text-muted-foreground/50 cursor-not-allowed">
                <i className="ri-arrow-left-line" /> Previous
              </span>
            )}
            <span className="text-sm text-muted-foreground px-2">{page} / {totalPages}</span>
            {page < totalPages ? (
              <Link
                href={buildUrl(filters, page + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors"
              >
                Next <i className="ri-arrow-right-line" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md text-muted-foreground/50 cursor-not-allowed">
                Next <i className="ri-arrow-right-line" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
