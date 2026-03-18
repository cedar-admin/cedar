'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { UserRole } from '@/lib/layout-data'

interface Reg {
  title: string
  cedarSummary: string
  sourceUrl: string
  citationCode: string
  lastUpdated: string
}

interface Props {
  reg: Reg
  role: UserRole
}

type Tab = 'summary' | 'source' | 'live'

// Very minimal markdown renderer — bold, headings, bullets
function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    if (line.startsWith('**') && line.endsWith('**') && line.slice(2, -2).length > 0) {
      // Standalone bold line treated as subheading
      elements.push(
        <h4 key={key++} className="text-sm font-semibold text-foreground mt-4 mb-1">
          {line.slice(2, -2)}
        </h4>
      )
    } else if (line.startsWith('- ')) {
      // Bullet
      const content = line.slice(2)
      // Handle **bold** within bullet
      const parts = content.split(/(\*\*[^*]+\*\*)/)
      elements.push(
        <li key={key++} className="text-sm text-foreground ml-4 mb-1 list-disc">
          {parts.map((p, i) =>
            p.startsWith('**') && p.endsWith('**') ? (
              <strong key={i}>{p.slice(2, -2)}</strong>
            ) : (
              p
            )
          )}
        </li>
      )
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-1" />)
    } else {
      // Regular paragraph — handle inline bold
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      elements.push(
        <p key={key++} className="text-sm text-foreground leading-relaxed">
          {parts.map((p, i) =>
            p.startsWith('**') && p.endsWith('**') ? (
              <strong key={i}>{p.slice(2, -2)}</strong>
            ) : (
              p
            )
          )}
        </p>
      )
    }
  }

  return <div className="space-y-0.5">{elements}</div>
}

export function LibraryDetailTabs({ reg, role }: Props) {
  const [tab, setTab] = useState<Tab>('summary')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border mb-4">
        {(['summary', 'source', 'live'] as Tab[]).map((t) => {
          const labels: Record<Tab, string> = {
            summary: 'Cedar Summary',
            source: 'Source File',
            live: 'Live Source',
          }
          return (
            <Button
              key={t}
              type="button"
              variant="ghost"
              onClick={() => setTab(t)}
              className={`px-4 py-2 h-auto rounded-none text-sm font-medium border-b-2 transition-interactive -mb-px ${
                tab === t
                  ? 'border-primary text-foreground hover:bg-transparent'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-transparent'
              }`}
            >
              {labels[t]}
            </Button>
          )
        })}
      </div>

      {/* Cedar Summary */}
      {tab === 'summary' && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 mb-4">
              <i className="ri-robot-2-line text-primary text-base" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                AI-Curated Summary
              </span>
              {role === 'intelligence' && (
                <span className="ml-auto inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
                  <i className="ri-shield-check-line" />
                  Attorney Reviewed
                </span>
              )}
            </div>
            {renderMarkdown(reg.cedarSummary)}
          </CardContent>
        </Card>
      )}

      {/* Source File */}
      {tab === 'source' && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 mb-4">
              <i className="ri-file-text-line text-muted-foreground text-base" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Source Document
              </span>
            </div>
            <div className="border border-dashed border-border p-8 text-center space-y-2">
              <i className="ri-file-download-line text-2xl text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Full source document not yet fetched for this regulation.
              </p>
              <p className="text-xs text-muted-foreground">
                Source documents are cached automatically when the pipeline runs. Check back after
                the next scheduled fetch.
              </p>
            </div>
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
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                View the current live version of this regulation directly from the issuing agency.
              </p>
              <div className="flex items-center gap-2 p-3 bg-muted/40 border border-border text-xs text-muted-foreground font-mono break-all">
                {reg.sourceUrl}
              </div>
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <a href={reg.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <i className="ri-external-link-line" />
                  Open in new tab
                </a>
              </Button>
              <p className="text-xs text-muted-foreground">
                External link — Cedar does not control the content of agency websites.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
