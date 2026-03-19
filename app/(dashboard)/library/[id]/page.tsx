import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LegalDisclaimer } from '@/components/LegalDisclaimer'
import { getLayoutData } from '@/lib/layout-data'
import { createServerClient } from '@/lib/db/client'
import { LibraryDetailTabs } from './LibraryDetailTabs'

const ENTITY_TYPE_LABELS: Record<string, string> = {
  regulation:         'Regulation',
  proposed_rule:      'Proposed Rule',
  notice:             'Notice',
  enforcement_action: 'Enforcement Action',
}

const DOC_TYPE_LABELS: Record<string, string> = {
  CFR_PART:           'CFR Part',
  Rule:               'Rule',
  Notice:             'Notice',
  DRUG_ENFORCEMENT:   'Drug Enforcement',
  DEVICE_ENFORCEMENT: 'Device Enforcement',
}

const JURISDICTION_LABELS: Record<string, string> = {
  US: 'Federal',
  FL: 'Florida',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function LibraryDetailPage({ params }: Props) {
  const { id } = await params
  const { role } = await getLayoutData()
  const supabase = createServerClient()

  const { data: entity } = await supabase
    .from('kg_entities')
    .select('id, name, description, entity_type, document_type, jurisdiction, status, citation, publication_date, effective_date, external_url, source_id')
    .eq('id', id)
    .maybeSingle()

  if (!entity) notFound()

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <Link
        href="/library"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <i className="ri-arrow-left-line" />
        Regulation Library
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {ENTITY_TYPE_LABELS[entity.entity_type] ?? entity.entity_type}
          </Badge>
          {entity.document_type && (
            <Badge variant="secondary" className="text-xs">
              {DOC_TYPE_LABELS[entity.document_type] ?? entity.document_type}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {JURISDICTION_LABELS[entity.jurisdiction] ?? entity.jurisdiction}
          </Badge>
          {entity.status && (
            <Badge
              variant="outline"
              className="text-xs text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800"
            >
              {entity.status.charAt(0).toUpperCase() + entity.status.slice(1)}
            </Badge>
          )}
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">{entity.name}</h1>
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          {entity.citation && (
            <span className="font-medium text-foreground">{entity.citation}</span>
          )}
          {entity.effective_date && (
            <>
              <span>·</span>
              <span>
                Effective{' '}
                {new Date(entity.effective_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
              </span>
            </>
          )}
          {entity.publication_date && (
            <>
              <span>·</span>
              <span>
                Published{' '}
                {new Date(entity.publication_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2">
          <LibraryDetailTabs entity={entity} role={role} />
          <LegalDisclaimer />
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Metadata */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium text-foreground text-right">
                  {ENTITY_TYPE_LABELS[entity.entity_type] ?? entity.entity_type}
                </span>
              </div>
              {entity.document_type && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Document</span>
                  <span className="font-medium text-foreground text-right">
                    {DOC_TYPE_LABELS[entity.document_type] ?? entity.document_type}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jurisdiction</span>
                <span className="font-medium text-foreground">
                  {JURISDICTION_LABELS[entity.jurisdiction] ?? entity.jurisdiction}
                </span>
              </div>
              {entity.status && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium text-foreground">
                    {entity.status.charAt(0).toUpperCase() + entity.status.slice(1)}
                  </span>
                </div>
              )}
              {entity.citation && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Citation</span>
                  <span className="font-medium text-foreground text-right ml-2 break-all">
                    {entity.citation}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Source link */}
          {entity.external_url && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={entity.external_url} target="_blank" rel="noopener noreferrer">
                    <i className="ri-external-link-line" />
                    View Live Source
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  )
}
