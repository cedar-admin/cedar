// Corpus ingestion: openFDA enforcement actions
// Paginates drug/enforcement and device/enforcement endpoints.
// Max skip is 25,000 per openFDA docs — uses limit=1000, iterates pages.

import { fetchOpenFDAPaginated } from '../fetchers/gov-apis'
import { trackCost } from '../cost-tracker'
import { upsertEntities, type KGEntityInsert } from './shared'

export interface OpenFDAIngestStats {
  actions_ingested: number
  by_endpoint: Record<string, number>
  errors: string[]
}

// ── Config ────────────────────────────────────────────────────────────────

const LIMIT = 1000
const MAX_SKIP = 25_000  // openFDA hard limit

// ── openFDA response types ────────────────────────────────────────────────

interface OpenFDAMeta {
  results: {
    total: number
    skip:  number
    limit: number
  }
}

interface DrugEnforcementRecord {
  recall_number:        string
  product_description?: string
  reason_for_recall?:   string
  status?:              string
  report_date?:         string
  distribution_pattern?: string
  classification?:      string
  recalling_firm?:      string
  voluntary_mandated?:  string
  [key: string]:        unknown
}

interface DeviceEnforcementRecord {
  recall_number?:       string
  product_description?: string
  reason_for_recall?:   string
  status?:              string
  recall_initiation_date?: string
  distribution_pattern?: string
  classification?:      string
  recalling_firm?:      string
  voluntary_mandated?:  string
  [key: string]:        unknown
}

interface OpenFDAResponse {
  meta:    OpenFDAMeta
  results: Record<string, unknown>[]
}

// ── Paginate one endpoint ─────────────────────────────────────────────────

async function paginateEndpoint(
  endpoint: string,
  search: string | undefined,
  sourceId: string,
  documentType: string
): Promise<{ entities: KGEntityInsert[]; errors: string[] }> {
  const entities: KGEntityInsert[] = []
  const errors: string[] = []
  let skip = 0
  let total: number | null = null

  do {
    let raw: string
    try {
      raw = await fetchOpenFDAPaginated({ endpoint, search, limit: LIMIT, skip: skip > 0 ? skip : undefined })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`${endpoint} skip=${skip}: ${msg}`)
      break
    }

    await trackCost({
      service: 'gov_api',
      operation: 'corpus.openfda',
      cost_usd: 0,
      context: { endpoint, skip, source_id: sourceId },
    })

    let parsed: OpenFDAResponse
    try {
      parsed = JSON.parse(raw) as OpenFDAResponse
    } catch {
      errors.push(`${endpoint} skip=${skip}: JSON parse failed`)
      break
    }

    const results = parsed.results ?? []
    if (total === null) total = parsed.meta?.results?.total ?? 0
    if (results.length === 0) break

    for (const record of results) {
      if (endpoint.startsWith('drug/')) {
        const r = record as DrugEnforcementRecord
        if (!r.recall_number) continue

        const isFL = r.distribution_pattern?.toLowerCase().includes('florida') ?? false
        const rawDate = r.report_date

        entities.push({
          name:            (r.product_description ?? r.recall_number).slice(0, 200),
          description:     r.reason_for_recall ?? undefined,
          entity_type:     'enforcement_action',
          jurisdiction:    isFL ? 'FL' : 'US',
          status:          r.status?.toLowerCase() ?? 'unknown',
          identifier:      r.recall_number,
          source_id:       sourceId,
          publication_date: rawDate
            ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
            : undefined,
          document_type:   documentType,
          external_url:    undefined,
          metadata:        record,  // FULL API response
        })
      } else {
        // device/enforcement
        const r = record as DeviceEnforcementRecord
        if (!r.recall_number) continue

        const isFL = r.distribution_pattern?.toLowerCase().includes('florida') ?? false
        const rawDate = r.recall_initiation_date

        entities.push({
          name:            (r.product_description ?? r.recall_number).slice(0, 200),
          description:     r.reason_for_recall ?? undefined,
          entity_type:     'enforcement_action',
          jurisdiction:    isFL ? 'FL' : 'US',
          status:          r.status?.toLowerCase() ?? 'unknown',
          identifier:      `device-${r.recall_number}`,
          source_id:       sourceId,
          publication_date: rawDate
            ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
            : undefined,
          document_type:   documentType,
          external_url:    undefined,
          metadata:        record,  // FULL API response
        })
      }
    }

    console.log(
      `[openfda-ingest] ${endpoint} skip=${skip} — ${results.length} records (total: ${total})`
    )

    skip += LIMIT
  } while (skip <= Math.min(total ?? 0, MAX_SKIP) - LIMIT + LIMIT)
  // Loop until we've fetched all records or hit the skip limit

  return { entities, errors }
}

// ── Main ingestion function ───────────────────────────────────────────────

export async function ingestOpenFDA(sourceId: string): Promise<OpenFDAIngestStats> {
  const byEndpoint: Record<string, number> = {}
  const allErrors: string[] = []
  let totalIngested = 0

  // ── Drug enforcement ──────────────────────────────────────────────────
  console.log('[openfda-ingest] Fetching drug/enforcement...')
  const { entities: drugEntities, errors: drugErrors } = await paginateEndpoint(
    'drug/enforcement',
    undefined,           // no search filter — pull all records
    sourceId,
    'DRUG_ENFORCEMENT'
  )
  allErrors.push(...drugErrors)

  if (drugEntities.length > 0) {
    const drugResult = await upsertEntities(drugEntities)
    allErrors.push(...drugResult.errors)
    byEndpoint['drug/enforcement'] = drugResult.upserted
    totalIngested += drugResult.upserted
    console.log(`[openfda-ingest] Drug enforcement: upserted ${drugResult.upserted}`)
  }

  // ── Device enforcement ────────────────────────────────────────────────
  console.log('[openfda-ingest] Fetching device/enforcement...')
  const { entities: deviceEntities, errors: deviceErrors } = await paginateEndpoint(
    'device/enforcement',
    undefined,
    sourceId,
    'DEVICE_ENFORCEMENT'
  )
  allErrors.push(...deviceErrors)

  if (deviceEntities.length > 0) {
    const deviceResult = await upsertEntities(deviceEntities)
    allErrors.push(...deviceResult.errors)
    byEndpoint['device/enforcement'] = deviceResult.upserted
    totalIngested += deviceResult.upserted
    console.log(`[openfda-ingest] Device enforcement: upserted ${deviceResult.upserted}`)
  }

  return {
    actions_ingested: totalIngested,
    by_endpoint:      byEndpoint,
    errors:           allErrors,
  }
}
