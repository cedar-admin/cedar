// Classified corpus seed — fetch, filter (allowlist), classify, store.
// Event: 'cedar/corpus.classified-seed'
// Re-runnable: upsert logic on entities + domain assignments.
// Uses PRP-02 classification engine for inline classification after each batch.
//
// Pipeline per source: fetch → filter → build → upsert → classify → write results
// Each eCFR title is one Inngest step (independently retriable).
// FR and openFDA are single steps each.

import { inngest } from './client'
import { createServerClient } from '../lib/db/client'
import { loadClassificationContext, classify } from '../lib/classification/engine'
import type { ClassificationResult } from '../lib/classification/types'
import { ingestECFRTitle } from '../lib/corpus/classified-ecfr-ingest'
import { upsertEntities, type KGEntityInsert } from '../lib/corpus/shared'
import { searchFederalRegister, fetchOpenFDAPaginated } from '../lib/fetchers/gov-apis'
import { trackCost } from '../lib/cost-tracker'

// ── Constants ────────────────────────────────────────────────────────────────

const ECFR_TITLES = [2, 10, 16, 20, 21, 26, 28, 29, 32, 38, 40, 42, 45, 47, 49]

const SOURCE_NAMES = {
  ECFR:    'eCFR Title 21 (Food & Drugs)',
  FR:      'FDA Federal Register',
  OPENFDA: 'openFDA Drug Enforcement Reports',
} as const

const FR_AGENCIES = [
  'food-and-drug-administration',
  'drug-enforcement-administration',
  'federal-trade-commission',
  'health-and-human-services-department',
  'centers-for-medicare-medicaid-services',
]

const FR_FIELDS = [
  'abstract', 'action', 'agencies', 'cfr_references', 'citation',
  'comments_close_on', 'correction_of', 'dates', 'docket_ids',
  'document_number', 'effective_on', 'html_url', 'pdf_url',
  'publication_date', 'regulation_id_numbers', 'regulation_id_number_info',
  'significant', 'title', 'topics', 'type',
]

const FR_PER_PAGE = 1000
const FR_START_YEAR = 2021

const OPENFDA_LIMIT = 1000
const OPENFDA_MAX_SKIP = 25_000

// ── Types ────────────────────────────────────────────────────────────────────

interface OpenFDAEndpointConfig {
  endpoint: string
  documentType: string
  entityType: string
  search?: string   // date filter for high-volume endpoints
}

interface ClassifiableEntity {
  id: string
  name: string
  description: string | null
  entity_type: string
  document_type: string | null
  jurisdiction: string
  source_id: string | null
  metadata: Record<string, unknown> | null
  agencies: Array<{ name: string; slug?: string; [k: string]: unknown }> | null
  cfr_references: Array<{ title: number; part: number }> | null
  citation: string | null
  identifier: string | null
}

interface FRArticle {
  document_number: string
  title: string
  abstract?: string
  type: string
  publication_date?: string
  effective_on?: string
  html_url?: string
  pdf_url?: string
  citation?: string
  comments_close_on?: string
  agencies?: unknown[]
  cfr_references?: unknown[]
  [key: string]: unknown
}

interface FRResponse {
  count: number
  total_pages: number
  results: FRArticle[]
}

interface OpenFDAResponse {
  meta: { results: { total: number; skip: number; limit: number } }
  results: Record<string, unknown>[]
}

// ── FR type mappings ─────────────────────────────────────────────────────────

const FR_ENTITY_TYPE: Record<string, string> = {
  'Rule': 'regulation', 'Proposed Rule': 'proposed_rule', 'Notice': 'notice',
  'RULE': 'regulation', 'PROPOSED_RULE': 'proposed_rule', 'NOTICE': 'notice',
}

const FR_STATUS: Record<string, string> = {
  'Rule': 'active', 'Proposed Rule': 'proposed', 'Notice': 'active',
  'RULE': 'active', 'PROPOSED_RULE': 'proposed', 'NOTICE': 'active',
}

// ── Helper: formatOpenFDADate ─────────────────────────────────────────────────

function formatOpenFDADate(raw?: string): string | undefined {
  if (!raw || raw.length !== 8) return undefined
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
}

// ── Helper: buildOpenFDAEntity ────────────────────────────────────────────────
// Builds a KGEntityInsert from a raw openFDA API record.
// Returns null if the record lacks a usable identifier.

function buildOpenFDAEntity(
  record: Record<string, unknown>,
  config: OpenFDAEndpointConfig,
  sourceId: string
): KGEntityInsert | null {
  const ep = config.endpoint
  const str = (v: unknown): string | undefined =>
    typeof v === 'string' && v ? v : undefined

  let identifier: string | null = null
  let name: string | undefined
  let description: string | undefined
  let date: string | undefined
  let isFL = false

  if (ep === 'drug/enforcement') {
    const num = str(record.recall_number)
    if (!num) return null
    identifier = num  // same as old corpus-seed — enables upsert of existing entities
    name = (str(record.product_description) ?? num).slice(0, 200)
    description = str(record.reason_for_recall)
    date = formatOpenFDADate(str(record.report_date))
    isFL = (str(record.distribution_pattern) ?? '').toLowerCase().includes('florida')

  } else if (ep === 'drug/event') {
    const id = str(record.safetyreportid)
    if (!id) return null
    identifier = `drug-event-${id}`
    name = `Drug Adverse Event Report ${id}`
    date = formatOpenFDADate(str(record.receivedate))

  } else if (ep === 'drug/label') {
    const setId = str(record.set_id) ?? str(record.id)
    if (!setId) return null
    identifier = `drug-label-${setId}`
    const openfda = (record.openfda as Record<string, unknown>) ?? {}
    const brands = (openfda.brand_name as string[]) ?? []
    name = (brands[0] ? `${brands[0]} Drug Label` : `Drug Label ${setId}`).slice(0, 200)
    date = formatOpenFDADate(str(record.effective_time))

  } else if (ep === 'drug/ndc') {
    const ndc = str(record.product_ndc)
    if (!ndc) return null
    identifier = `drug-ndc-${ndc}`
    name = (str(record.brand_name) ?? str(record.generic_name) ?? ndc).slice(0, 200)

  } else if (ep === 'drug/drugsfda') {
    const openfda = (record.openfda as Record<string, unknown>) ?? {}
    const appNums = (openfda.application_number as string[]) ?? []
    const appNum = appNums[0] ?? str(record.application_number)
    if (!appNum) return null
    identifier = `drug-drugsfda-${appNum}`
    name = `Drug Application ${appNum}`

  } else if (ep === 'device/enforcement') {
    const num = str(record.recall_number)
    if (!num) return null
    identifier = `device-${num}`  // same as old corpus-seed
    name = (str(record.product_description) ?? num).slice(0, 200)
    description = str(record.reason_for_recall)
    const rawDate = str(record.recall_initiation_date)
    date = rawDate && rawDate.length === 8
      ? `${rawDate.slice(0,4)}-${rawDate.slice(4,6)}-${rawDate.slice(6,8)}`
      : undefined
    isFL = (str(record.distribution_pattern) ?? '').toLowerCase().includes('florida')

  } else if (ep === 'device/event') {
    const num = str(record.report_number)
    if (!num) return null
    identifier = `device-event-${num}`
    name = `Device Adverse Event ${num}`
    date = formatOpenFDADate(str(record.date_received))

  } else if (ep === 'device/recall') {
    const num = str(record.recall_number) ?? str(record.res_event_number)
    if (!num) return null
    identifier = `device-recall-${num}`
    name = (str(record.product_description) ?? num).slice(0, 200)
    description = str(record.reason_for_recall)

  } else if (ep === 'device/510k') {
    const kNum = str(record.k_number)
    if (!kNum) return null
    identifier = `device-510k-${kNum}`
    name = (str(record.device_name) ?? `510(k) Clearance ${kNum}`).slice(0, 200)
    description = str(record.decision_description)

  } else if (ep === 'device/pma') {
    const pmaNum = str(record.pma_number)
    if (!pmaNum) return null
    identifier = `device-pma-${pmaNum}`
    name = (str(record.trade_name) ?? str(record.generic_name) ?? `PMA ${pmaNum}`).slice(0, 200)

  } else if (ep === 'device/registrationlisting') {
    const reg = (record.registration as Record<string, unknown>) ?? {}
    const feiNum = str(reg.fei_number)
    if (!feiNum) return null
    identifier = `device-reg-${feiNum}`
    name = (str(reg.name) ?? `Device Registration ${feiNum}`).slice(0, 200)

  } else if (ep === 'device/udi') {
    const di = str(record.di)
    if (!di) return null
    identifier = `device-udi-${di}`
    name = (str(record.device_description) ?? `Device UDI ${di}`).slice(0, 200)

  } else if (ep === 'food/enforcement') {
    const num = str(record.recall_number)
    if (!num) return null
    identifier = `food-enforcement-${num}`
    name = (str(record.product_description) ?? num).slice(0, 200)
    description = str(record.reason_for_recall)
    date = formatOpenFDADate(str(record.report_date))
    isFL = (str(record.distribution_pattern) ?? '').toLowerCase().includes('florida')

  } else if (ep === 'food/event') {
    const num = str(record.report_number)
    if (!num) return null
    identifier = `food-event-${num}`
    name = `Food Adverse Event ${num}`

  } else if (ep === 'other/nsde') {
    const ndc = str(record.package_ndc)
    if (!ndc) return null
    identifier = `nsde-${ndc}`
    name = (str(record.proprietary_name) ?? str(record.nonproprietary_name) ?? `NSDE ${ndc}`).slice(0, 200)
  }

  if (!identifier) return null

  return {
    name:           name ?? identifier,
    description:    description?.slice(0, 1000),
    entity_type:    config.entityType,
    jurisdiction:   isFL ? 'FL' : 'US',
    status:         'active',
    identifier,
    source_id:      sourceId,
    document_type:  config.documentType,
    publication_date: date,
    metadata:       record,
  }
}

// ── Helper: fetchEntitiesByIdentifiers ────────────────────────────────────────
// Batch-fetches entities by identifier to get their UUIDs after upsert.
// Batches in groups of 200 to stay within URL length limits.

async function fetchEntitiesByIdentifiers(
  supabase: ReturnType<typeof createServerClient>,
  identifiers: string[],
  sourceId: string
): Promise<ClassifiableEntity[]> {
  const BATCH = 200
  const results: ClassifiableEntity[] = []

  for (let i = 0; i < identifiers.length; i += BATCH) {
    const chunk = identifiers.slice(i, i + BATCH)
    const { data, error } = await supabase
      .from('kg_entities')
      .select('id, name, description, entity_type, document_type, jurisdiction, source_id, metadata, agencies, cfr_references, citation, identifier')
      .in('identifier', chunk)
      .eq('source_id', sourceId)

    if (!error && data) results.push(...(data as ClassifiableEntity[]))
  }

  return results
}

// ── Helper: writeClassificationResultsBatch ───────────────────────────────────
// Writes classification results for a batch of entities to all three destinations:
//   1. kg_entity_domains (upsert domain assignments)
//   2. kg_classification_log (audit trail)
//   3. kg_entities (denormalized domain_codes, classification_stage, authority_level)

type SupabaseClient = ReturnType<typeof createServerClient>

async function writeClassificationResultsBatch(
  supabase: SupabaseClient,
  pairs: Array<{ entity: ClassifiableEntity; result: ClassificationResult }>,
  runId: string,
  warnFn: (msg: string) => void
): Promise<{ classified: number; unclassified: number }> {
  const domainRows: Array<{
    entity_id: string; domain_id: string; relevance_score: number
    confidence: number; classified_by: string; is_primary: boolean; assigned_by: string
  }> = []
  const logRows: Array<{
    entity_id: string; domain_id?: string; stage: string; confidence: number
    classified_by: string; needs_review: boolean; review_reason: string | null; run_id: string
  }> = []
  const entityUpdates: Array<{
    id: string; domain_codes: string[]; classification_stage: string; authority_level?: string
  }> = []
  const unclassifiedLog: Array<{
    entity_id: string; stage: string; confidence: number; classified_by: string
    needs_review: boolean; review_reason: string; run_id: string
  }> = []

  let classified = 0
  let unclassified = 0

  for (const { entity, result } of pairs) {
    if (result.filtered) {
      // No rules matched — flag for HITL
      unclassifiedLog.push({
        entity_id:     entity.id,
        stage:         'rule',
        confidence:    0,
        classified_by: 'classified-seed',
        needs_review:  true,
        review_reason: 'No classification rules matched — requires Stage 2/4 or manual classification',
        run_id:        runId,
      })
      // Still update classification_stage so we don't re-process in future passes
      entityUpdates.push({
        id:                   entity.id,
        domain_codes:         [],
        classification_stage: 'unclassified',
      })
      unclassified++
      continue
    }

    classified++

    // kg_entity_domains rows
    for (const assignment of result.domains) {
      domainRows.push({
        entity_id:      entity.id,
        domain_id:      assignment.domainId,
        relevance_score: assignment.confidence,
        confidence:     assignment.confidence,
        classified_by:  assignment.assignedBy,
        is_primary:     assignment.isPrimary,
        assigned_by:    `rule:${assignment.assignedBy}`,
      })
      logRows.push({
        entity_id:     entity.id,
        domain_id:     assignment.domainId,
        stage:         'rule',
        confidence:    assignment.confidence,
        classified_by: assignment.assignedBy,
        needs_review:  assignment.confidence < 0.85,
        review_reason: assignment.confidence < 0.85
          ? `Confidence ${assignment.confidence} below 0.85 threshold`
          : null,
        run_id: runId,
      })
    }

    // kg_entities denormalized update
    const update: { id: string; domain_codes: string[]; classification_stage: string; authority_level?: string } = {
      id:                   entity.id,
      domain_codes:         result.domainCodes,
      classification_stage: 'structural',
    }
    if (result.authority?.level) {
      update.authority_level = result.authority.level
    }
    entityUpdates.push(update)
  }

  // Write kg_entity_domains (upsert batches of 200)
  for (let i = 0; i < domainRows.length; i += 200) {
    const batch = domainRows.slice(i, i + 200)
    const { error } = await supabase
      .from('kg_entity_domains')
      .upsert(batch, { onConflict: 'entity_id,domain_id' })
    if (error) warnFn(`[classified-seed] kg_entity_domains upsert warn: ${error.message}`)
  }

  // Write kg_classification_log (insert batches of 200)
  for (let i = 0; i < logRows.length; i += 200) {
    const batch = logRows.slice(i, i + 200)
    const { error } = await supabase.from('kg_classification_log').insert(batch)
    if (error) warnFn(`[classified-seed] kg_classification_log insert warn: ${error.message}`)
  }

  // Write unclassified log entries
  if (unclassifiedLog.length > 0) {
    const { error } = await supabase.from('kg_classification_log').insert(unclassifiedLog)
    if (error) warnFn(`[classified-seed] unclassified log insert warn: ${error.message}`)
  }

  // Update kg_entities denormalized columns (upsert batches of 200)
  for (let i = 0; i < entityUpdates.length; i += 200) {
    const batch = entityUpdates.slice(i, i + 200)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from('kg_entities').upsert(batch as any, { onConflict: 'id' })
    if (error) warnFn(`[classified-seed] kg_entities update warn: ${error.message}`)
  }

  return { classified, unclassified }
}

// ── Main Inngest function ─────────────────────────────────────────────────────

export const classifiedSeed = inngest.createFunction(
  {
    id:          'classified-seed',
    name:        'Classified Corpus Seed — Filtered + Classified Regulatory Baseline',
    retries:     1,
    concurrency: { limit: 1 },
    timeouts:    { finish: '2h' },
  },
  { event: 'cedar/corpus.classified-seed' },
  async ({ step, logger, runId }) => {

    // ── Step 1: Load source IDs ───────────────────────────────────────────────
    const sourceIds = await step.run('load-source-ids', async () => {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('sources')
        .select('id, name')
        .in('name', Object.values(SOURCE_NAMES))

      if (error) throw new Error(`Failed to load source IDs: ${error.message}`)

      const map: Record<string, string> = {}
      for (const s of data ?? []) map[s.name] = s.id

      const missing = Object.values(SOURCE_NAMES).filter(n => !map[n])
      if (missing.length > 0) {
        throw new Error(`Source IDs not found for: ${missing.join(', ')}`)
      }

      logger.info(`[classified-seed] Source IDs loaded: ${JSON.stringify(map)}`)
      return {
        ecfr:    map[SOURCE_NAMES.ECFR],
        fr:      map[SOURCE_NAMES.FR],
        openfda: map[SOURCE_NAMES.OPENFDA],
      }
    })

    // ── Step 2: Load allowlist as serializable array ──────────────────────────
    // ClassificationContext contains a Set (not JSON-serializable).
    // Load allowlist as string array here; convert to Set inside each step.
    const allowlistArray = await step.run('load-allowlist', async () => {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('cfr_allowlist')
        .select('title_number, part_number')

      if (error) throw new Error(`Allowlist load failed: ${error.message}`)
      const arr = (data ?? []).map(r => `${r.title_number}:${r.part_number}`)
      logger.info(`[classified-seed] Allowlist loaded: ${arr.length} entries`)
      return arr
    })

    // ── Steps 3–17: eCFR titles (one step per title) ──────────────────────────
    let totalEcfrIngested = 0
    let totalEcfrClassified = 0

    for (const title of ECFR_TITLES) {
      const stats = await step.run(`ecfr-title-${title}`, async () => {
        const allowlist = new Set(allowlistArray)
        const supabase = createServerClient()

        // 1. Fetch structure and filter to allowlist parts
        const ingestResult = await ingestECFRTitle(title, sourceIds.ecfr, allowlist)

        if (ingestResult.errors.length > 0) {
          logger.warn(`[classified-seed] eCFR title ${title} errors: ${ingestResult.errors.join('; ')}`)
        }
        if (ingestResult.entities.length === 0) {
          logger.info(`[classified-seed] eCFR title ${title}: 0 parts after filter (total in title: ${ingestResult.totalPartsInTitle})`)
          return { title, ingested: 0, classified: 0, unclassified: 0, errors: ingestResult.errors }
        }

        // 2. Upsert entities
        const upsertResult = await upsertEntities(ingestResult.entities)
        if (upsertResult.errors.length > 0) {
          logger.warn(`[classified-seed] eCFR title ${title} upsert errors: ${upsertResult.errors.join('; ')}`)
        }

        // 3. Load classification context (fresh — cannot pass between steps)
        const context = await loadClassificationContext('federal')

        // 4. Fetch upserted entities back to get their UUIDs
        const identifiers = ingestResult.entities.map(e => e.identifier)
        const dbEntities = await fetchEntitiesByIdentifiers(supabase, identifiers, sourceIds.ecfr)

        // 5. Classify each entity and write results
        const pairs: Array<{ entity: ClassifiableEntity; result: ClassificationResult }> = []
        const source = context.sourceMap[sourceIds.ecfr]

        for (const entity of dbEntities) {
          const input = {
            ...entity,
            sourceName:         source?.name ?? null,
            sourceJurisdiction: source?.jurisdiction ?? null,
          }
          const classResult = classify(input, context)
          pairs.push({ entity, result: classResult })
        }

        const writeStats = await writeClassificationResultsBatch(
          supabase,
          pairs,
          runId ?? 'classified-seed',
          (msg) => logger.warn(msg)
        )

        return {
          title,
          ingested:      upsertResult.upserted,
          classified:    writeStats.classified,
          unclassified:  writeStats.unclassified,
          errors:        [...ingestResult.errors, ...upsertResult.errors],
        }
      })

      totalEcfrIngested   += stats.ingested
      totalEcfrClassified += stats.classified
      logger.info(
        `[classified-seed] eCFR title ${stats.title}: ` +
        `${stats.ingested} ingested, ${stats.classified} classified, ` +
        `${stats.unclassified} unclassified`
      )
    }

    // ── Step 18: Federal Register ─────────────────────────────────────────────
    // Paginates year-by-year (2021-present) using the 5 existing agencies
    // PLUS cfrTitles filter to narrow to healthcare-relevant documents.
    const frStats = await step.run('ingest-fr', async () => {
      const supabase = createServerClient()
      const currentYear = new Date().getFullYear()
      const allEntities: KGEntityInsert[] = []
      const allErrors: string[] = []
      const byType: Record<string, number> = {}

      for (let year = FR_START_YEAR; year <= currentYear; year++) {
        const dateGte = `${year}-01-01`
        const dateLte = `${year}-12-31`
        let page = 1
        let totalPages = 1

        do {
          let raw: string
          try {
            raw = await searchFederalRegister({
              agencies:   FR_AGENCIES,
              types:      ['RULE', 'PROPOSED_RULE', 'NOTICE'],
              dateGte,
              dateLte,
              cfrTitles:  ECFR_TITLES,
              perPage:    FR_PER_PAGE,
              page,
              fields:     FR_FIELDS,
            })
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            allErrors.push(`FR ${year} page ${page}: ${msg}`)
            break
          }

          await trackCost({
            service:   'gov_api',
            operation: 'corpus.federal_register',
            cost_usd:  0,
            context:   { year, page, source_id: sourceIds.fr },
          })

          let parsed: FRResponse
          try {
            parsed = JSON.parse(raw) as FRResponse
          } catch {
            allErrors.push(`FR ${year} page ${page}: JSON parse failed`)
            break
          }

          totalPages = parsed.total_pages ?? 1
          for (const doc of parsed.results ?? []) {
            if (!doc.document_number) continue
            const docType = doc.type ?? 'NOTICE'
            byType[docType] = (byType[docType] ?? 0) + 1
            allEntities.push({
              name:             doc.title ?? doc.document_number,
              description:      doc.abstract,
              entity_type:      FR_ENTITY_TYPE[docType] ?? 'notice',
              jurisdiction:     'US',
              status:           FR_STATUS[docType] ?? 'active',
              identifier:       doc.document_number,
              source_id:        sourceIds.fr,
              publication_date: doc.publication_date,
              effective_date:   doc.effective_on,
              document_type:    docType,
              citation:         doc.citation,
              pdf_url:          doc.pdf_url,
              external_url:     doc.html_url,
              comment_close_date: doc.comments_close_on,
              agencies:         Array.isArray(doc.agencies) ? doc.agencies : undefined,
              cfr_references:   Array.isArray(doc.cfr_references) ? doc.cfr_references : undefined,
              metadata:         doc,
            })
          }

          logger.info(`[classified-seed] FR ${year} page ${page}/${totalPages} — ${parsed.results?.length ?? 0} docs`)
          page++
        } while (page <= totalPages)
      }

      // Upsert all FR entities
      let totalUpserted = 0
      const UPSERT_BATCH = 500
      for (let i = 0; i < allEntities.length; i += UPSERT_BATCH) {
        const batch = allEntities.slice(i, i + UPSERT_BATCH)
        const result = await upsertEntities(batch)
        totalUpserted += result.upserted
        allErrors.push(...result.errors)
      }

      // Load classification context (once for all FR entities)
      const context = await loadClassificationContext('federal')
      const source = context.sourceMap[sourceIds.fr]

      // Fetch back entities in batches and classify
      const identifiers = allEntities.map(e => e.identifier)
      let classified = 0
      let unclassified = 0

      const CLASSIFY_BATCH = 500
      for (let i = 0; i < identifiers.length; i += CLASSIFY_BATCH) {
        const chunk = identifiers.slice(i, i + CLASSIFY_BATCH)
        const dbEntities = await fetchEntitiesByIdentifiers(supabase, chunk, sourceIds.fr)

        const pairs: Array<{ entity: ClassifiableEntity; result: ClassificationResult }> = []
        for (const entity of dbEntities) {
          const input = {
            ...entity,
            sourceName:         source?.name ?? null,
            sourceJurisdiction: source?.jurisdiction ?? null,
          }
          const classResult = classify(input, context)
          pairs.push({ entity, result: classResult })
        }

        const writeStats = await writeClassificationResultsBatch(
          supabase, pairs, runId ?? 'classified-seed',
          (msg) => logger.warn(msg)
        )
        classified   += writeStats.classified
        unclassified += writeStats.unclassified
      }

      logger.info(`[classified-seed] FR complete: ${totalUpserted} ingested, ${classified} classified, ${unclassified} unclassified`)
      return { ingested: totalUpserted, classified, unclassified, by_type: byType, errors: allErrors }
    })

    // ── Step 19: openFDA (all 15 relevant endpoints) ──────────────────────────
    const openfdaStats = await step.run('ingest-openfda', async () => {
      const supabase = createServerClient()
      const threeYearsAgo = (() => {
        const d = new Date()
        d.setFullYear(d.getFullYear() - 3)
        return d.toISOString().slice(0, 10).replace(/-/g, '')
      })()

      const ENDPOINTS: OpenFDAEndpointConfig[] = [
        { endpoint: 'drug/enforcement',         documentType: 'DRUG_ENFORCEMENT',       entityType: 'enforcement_action' },
        { endpoint: 'drug/event',                documentType: 'DRUG_ADVERSE_EVENT',     entityType: 'enforcement_action', search: `receivedate:[${threeYearsAgo}+TO+*]` },
        { endpoint: 'drug/label',                documentType: 'DRUG_LABEL',             entityType: 'regulation',         search: `effective_time:[${threeYearsAgo}+TO+*]` },
        { endpoint: 'drug/ndc',                  documentType: 'DRUG_NDC',               entityType: 'regulation' },
        { endpoint: 'drug/drugsfda',             documentType: 'DRUG_APPLICATION',       entityType: 'regulation' },
        { endpoint: 'device/enforcement',        documentType: 'DEVICE_ENFORCEMENT',     entityType: 'enforcement_action' },
        { endpoint: 'device/event',              documentType: 'DEVICE_ADVERSE_EVENT',   entityType: 'enforcement_action', search: `date_received:[${threeYearsAgo}+TO+*]` },
        { endpoint: 'device/recall',             documentType: 'DEVICE_RECALL',          entityType: 'enforcement_action' },
        { endpoint: 'device/510k',               documentType: 'DEVICE_510K',            entityType: 'regulation' },
        { endpoint: 'device/pma',                documentType: 'DEVICE_PMA',             entityType: 'regulation' },
        { endpoint: 'device/registrationlisting', documentType: 'DEVICE_REGISTRATION',  entityType: 'regulation' },
        { endpoint: 'device/udi',                documentType: 'DEVICE_UDI',             entityType: 'regulation' },
        { endpoint: 'food/enforcement',          documentType: 'FOOD_ENFORCEMENT',       entityType: 'enforcement_action' },
        { endpoint: 'food/event',                documentType: 'FOOD_ADVERSE_EVENT',     entityType: 'enforcement_action' },
        { endpoint: 'other/nsde',                documentType: 'DRUG_NSDE',              entityType: 'regulation' },
      ]

      // Load context once for all openFDA entities
      const context = await loadClassificationContext('federal')

      let totalIngested    = 0
      let totalClassified  = 0
      let totalUnclassified = 0
      const byEndpoint: Record<string, number> = {}
      const allErrors: string[] = []

      for (const cfg of ENDPOINTS) {
        const endpointEntities: KGEntityInsert[] = []
        const endpointErrors: string[] = []
        let skip = 0
        let total: number | null = null

        do {
          let raw: string
          try {
            raw = await fetchOpenFDAPaginated({
              endpoint: cfg.endpoint,
              search:   cfg.search,
              limit:    OPENFDA_LIMIT,
              skip:     skip > 0 ? skip : undefined,
            })
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            endpointErrors.push(`${cfg.endpoint} skip=${skip}: ${msg}`)
            break
          }

          await trackCost({
            service:   'gov_api',
            operation: 'corpus.openfda',
            cost_usd:  0,
            context:   { endpoint: cfg.endpoint, skip, source_id: sourceIds.openfda },
          })

          let parsed: OpenFDAResponse
          try {
            parsed = JSON.parse(raw) as OpenFDAResponse
          } catch {
            endpointErrors.push(`${cfg.endpoint} skip=${skip}: JSON parse failed`)
            break
          }

          const records = parsed.results ?? []
          if (total === null) total = parsed.meta?.results?.total ?? 0
          if (records.length === 0) break

          for (const record of records) {
            const entity = buildOpenFDAEntity(record, cfg, sourceIds.openfda)
            if (entity) endpointEntities.push(entity)
          }

          skip += OPENFDA_LIMIT
        } while (skip <= Math.min(total ?? 0, OPENFDA_MAX_SKIP) - OPENFDA_LIMIT + OPENFDA_LIMIT)

        allErrors.push(...endpointErrors)

        if (endpointEntities.length === 0) {
          logger.info(`[classified-seed] openFDA ${cfg.endpoint}: 0 entities`)
          continue
        }

        // Upsert entities for this endpoint
        const upsertResult = await upsertEntities(endpointEntities)
        allErrors.push(...upsertResult.errors)
        byEndpoint[cfg.endpoint] = upsertResult.upserted
        totalIngested += upsertResult.upserted

        // Fetch back and classify
        const identifiers = endpointEntities.map(e => e.identifier)
        const dbEntities = await fetchEntitiesByIdentifiers(supabase, identifiers, sourceIds.openfda)

        const source = context.sourceMap[sourceIds.openfda]
        const pairs: Array<{ entity: ClassifiableEntity; result: ClassificationResult }> = []
        for (const entity of dbEntities) {
          const input = {
            ...entity,
            sourceName:         source?.name ?? null,
            sourceJurisdiction: source?.jurisdiction ?? null,
          }
          const classResult = classify(input, context)
          pairs.push({ entity, result: classResult })
        }

        const writeStats = await writeClassificationResultsBatch(
          supabase, pairs, runId ?? 'classified-seed',
          (msg) => logger.warn(msg)
        )
        totalClassified   += writeStats.classified
        totalUnclassified += writeStats.unclassified

        logger.info(
          `[classified-seed] openFDA ${cfg.endpoint}: ` +
          `${upsertResult.upserted} ingested, ${writeStats.classified} classified`
        )
      }

      return {
        ingested:     totalIngested,
        classified:   totalClassified,
        unclassified: totalUnclassified,
        by_endpoint:  byEndpoint,
        errors:       allErrors,
      }
    })

    // ── Step 20: Refresh materialized view ────────────────────────────────────
    await step.run('refresh-facets', async () => {
      const supabase = createServerClient()
      const { error } = await supabase.rpc('refresh_corpus_facets')
      if (error) logger.warn(`[classified-seed] Facet refresh: ${error.message}`)
      else logger.info('[classified-seed] mv_corpus_facets refreshed')
    })

    // ── Step 21: Summary ──────────────────────────────────────────────────────
    return await step.run('summarize', async () => {
      const totalIngested   = totalEcfrIngested   + frStats.ingested   + openfdaStats.ingested
      const totalClassified = totalEcfrClassified + frStats.classified + openfdaStats.classified
      const totalUnclassified = (frStats.unclassified ?? 0) + (openfdaStats.unclassified ?? 0)

      const summary = {
        ecfr_ingested:       totalEcfrIngested,
        ecfr_classified:     totalEcfrClassified,
        fr_ingested:         frStats.ingested,
        fr_classified:       frStats.classified,
        openfda_ingested:    openfdaStats.ingested,
        openfda_classified:  openfdaStats.classified,
        total_ingested:      totalIngested,
        total_classified:    totalClassified,
        total_unclassified:  totalUnclassified,
      }

      logger.info(`[classified-seed] ===== COMPLETE =====`)
      logger.info(`[classified-seed] ${JSON.stringify(summary, null, 2)}`)
      return summary
    })
  }
)
