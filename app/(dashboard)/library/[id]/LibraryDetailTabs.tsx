'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { UserRole } from '@/lib/layout-data'

interface Entity {
  name: string
  description: string | null
  external_url: string | null
  citation: string | null
  publication_date: string | null
}

interface Props {
  entity: Entity
  role: UserRole
}

type Tab = 'summary' | 'live'

export function LibraryDetailTabs({ entity, role }: Props) {
  const [tab, setTab] = useState<Tab>('summary')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'live', label: 'Live Source' },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border mb-4">
        {tabs.map((t) => (
          <Button
            key={t.id}
            type="button"
            variant="ghost"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 h-auto rounded-none text-sm font-medium border-b-2 transition-interactive -mb-px ${
              tab === t.id
                ? 'border-primary text-foreground hover:bg-transparent'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-transparent'
            }`}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {/* Summary */}
      {tab === 'summary' && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 mb-4">
              <i className="ri-file-text-line text-muted-foreground text-base" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Document Summary
              </span>
              {role === 'intelligence' && (
                <span className="ml-auto inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
                  <i className="ri-shield-check-line" />
                  Attorney Reviewed
                </span>
              )}
            </div>
            {entity.description ? (
              <p className="text-sm text-foreground leading-relaxed">{entity.description}</p>
            ) : (
              <div className="border border-dashed border-border p-8 text-center space-y-2">
                <i className="ri-file-unknow-line text-2xl text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No summary available for this document.
                </p>
                <p className="text-xs text-muted-foreground">
                  AI-curated summaries will be generated as the intelligence pipeline processes this source.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Live Source */}
      {tab === 'live' && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 mb-4">
              <i className="ri-global-line text-muted-foreground text-base" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Live Source
              </span>
            </div>
            {entity.external_url ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  View the current live version of this document directly from the issuing agency.
                </p>
                <div className="flex items-center gap-2 p-3 bg-muted/40 border border-border text-xs text-muted-foreground font-mono break-all">
                  {entity.external_url}
                </div>
                <Button variant="outline" className="w-full sm:w-auto" asChild>
                  <a href={entity.external_url} target="_blank" rel="noopener noreferrer">
                    <i className="ri-external-link-line" />
                    Open in new tab
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground">
                  External link — Cedar does not control the content of agency websites.
                </p>
              </div>
            ) : (
              <div className="border border-dashed border-border p-8 text-center space-y-2">
                <i className="ri-link-unlink-line text-2xl text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No source URL available for this document.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
