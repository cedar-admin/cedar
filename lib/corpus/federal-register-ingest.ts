// Corpus ingestion: Federal Register bulk pull
// Paginates FDA, DEA, FTC, HHS, CMS documents from 2021-present.
// Partitions by year to stay under the 2000-result-per-query API limit.

import { searchFederalRegister } from '../fetchers/gov-apis'
import { trackCost } from '../cost-tracker'
import { upsertEntities, type KGEntityInsert } from './shared'

export interface FRIngestStats {
  documents_ingested: number
  by_type: Record<string, number>
  errors: string[]
}

// ── Config ────────────────────────────────────────────────────────────────

const AGENCIES = [
  'food-and-drug-administration',
  'drug-enforcement-administration',
  'federal-trade-commission',
  'health-and-human-services-department',
  'centers-for-medicare-medicaid-services',
]

const TYPES = ['RULE', 'PROPOSED_RULE', 'NOTICE']

const FIELDS = [
  'abstract',
  'action',
  'agencies',
  'cfr_references',
  'citation',
  'comments_close_on',
  'correction_of',
  'dates',
  'docket_ids',
  'document_number',
  'effective_on',
  'html_url',
  'pdf_url',
  'publication_date',
  'regulation_id_numbers',
  'regulation_id_number_info',
  'significant',
  'title',
  'topics',
  'type',
]

const PER_PAGE = 1000
const START_YEAR = 2021

// ── Type mapping ──────────────────────────────────────────────────────────

const TYPE_TO_ENTITY_TYPE: Record<string, string> = {
  RULE:          'regulation',
  PROPOSED_RULE: 'proposed_rule',
  NOTICE:        'notice',
}

const TYPE_TO_STATUS: Record<string, string> = {
  RULE:          'active',
  PROPOSED_RULE: 'proposed',
  NOTICE:        'active',
}

// ── FR API response types ─────────────────────────────────────────────────

interface FRArticle {
  document_number:         string
  title:                   string
  abstract?:               string
  type:                    string
  publication_date?:       string
  effective_on?:           string
  html_url?:               string
  pdf_url?:                string
  citation?:               string
  comments_close_on?:      string
  agencies?:               unknown[]
  cfr_references?:         unknown[]
  [key: string]:           unknown
}

interface FRResponse {
  count:       number
  total_pages: number
  results:     FRArticle[]
}

// ── Fetch all pages for a single year ─────────────────────────────────────

async function fetchYear(
  year: number,
  sourceId: string
): Promise<{ entities: KGEntityInsert[]; errors: string[] }> {
  const dateGte = `${year}-01-01`
  const dateLte = `${year}-12-31`
  const entities: KGEntityInsert[] = []
  const errors: string[] = []
  let page = 1
  let totalPages = 1

  do {
    let raw: string
    try {
      raw = await searchFederalRegister({
        agencies: AGENCIES,
        types: TYPES,
        dateGte,
        dateLte,
        perPage: PER_PAGE,
        page,
        fields: FIELDS,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`FR ${year} page ${page}: ${msg}`)
      break
    }

    await trackCost({
      service: 'gov_api',
      operation: 'corpus.federal_register',
      cost_usd: 0,
      context: { year, page, source_id: sourceId },
    })

    let parsed: FRResponse
    try {
      parsed = JSON.parse(raw) as FRResponse
    } catch {
      errors.push(`FR ${year} page ${page}: JSON parse failed`)
      break
    }

    totalPages = parsed.total_pages ?? 1

    for (const doc of parsed.results ?? []) {
      if (!doc.document_number) continue

      entities.push({
        name:           doc.title ?? doc.document_number,
        description:    doc.abstract ?? undefined,
        entity_type:    TYPE_TO_ENTITY_TYPE[doc.type] ?? 'notice',
        jurisdiction:   'US',
        status:         TYPE_TO_STATUS[doc.type] ?? 'active',
        identifier:     doc.document_number,
        source_id:      sourceId,
        publication_date: doc.publication_date ?? undefined,
        effective_date: doc.effective_on ?? undefined,
        document_type:  doc.type,
        citation:       doc.citation ?? undefined,
        pdf_url:        doc.pdf_url ?? undefined,
        external_url:   doc.html_url ?? undefined,
        comment_close_date: doc.comments_close_on ?? undefined,
        agencies:       Array.isArray(doc.agencies) ? doc.agencies : undefined,
        cfr_references: Array.isArray(doc.cfr_references) ? doc.cfr_references : undefined,
        metadata:       doc,  // FULL API response — nothing dropped
      })
    }

    console.log(`[fr-ingest] ${year} page ${page}/${totalPages} — ${parsed.results?.length ?? 0} docs`)
    page++
  } while (page <= totalPages)

  return { entities, errors }
}

// ── Main ingestion function ───────────────────────────────────────────────

export async function ingestFederalRegister(sourceId: string): Promise<FRIngestStats> {
  const currentYear = new Date().getFullYear()
  const years: number[] = []
  for (let y = START_YEAR; y <= currentYear; y++) years.push(y)

  let totalIngested = 0
  const byType: Record<string, number> = {}
  const allErrors: string[] = []

  for (const year of years) {
    console.log(`[fr-ingest] Processing year ${year}...`)
    const { entities, errors } = await fetchYear(year, sourceId)
    allErrors.push(...errors)

    if (entities.length === 0) continue

    // Tally by type before upsert
    for (const e of entities) {
      const t = e.document_type ?? 'UNKNOWN'
      byType[t] = (byType[t] ?? 0) + 1
    }

    const result = await upsertEntities(entities)
    allErrors.push(...result.errors)
    totalIngested += result.upserted
    console.log(`[fr-ingest] Year ${year}: upserted ${result.upserted}`)
  }

  return {
    documents_ingested: totalIngested,
    by_type: byType,
    errors: allErrors,
  }
}
