// Corpus seed function — one-time bulk ingestion of the regulatory baseline.
// Triggered by event 'cedar/corpus.seed'.
// Re-runnable: upsert logic deduplicates on (identifier, source_id).

import { inngest } from './client'
import { createServerClient } from '../lib/db/client'
import { ingestECFR } from '../lib/corpus/ecfr-ingest'
import { ingestFederalRegister } from '../lib/corpus/federal-register-ingest'
import { ingestOpenFDA } from '../lib/corpus/openfda-ingest'

// Source names from 004_seed_sources.sql — look up by name, never hardcode IDs
const SOURCE_NAMES = {
  FEDERAL_REGISTER: 'FDA Federal Register',
  ECFR:             'eCFR Title 21 (Food & Drugs)',
  OPENFDA:          'openFDA Drug Enforcement Reports',
} as const

export const corpusSeed = inngest.createFunction(
  {
    id: 'corpus-seed',
    name: 'Corpus Seed — Initial Regulatory Baseline',
    retries: 1,
    concurrency: { limit: 1 },  // only one seed run at a time
  },
  { event: 'cedar/corpus.seed' },
  async ({ step, logger }) => {

    // ── Step 1: Look up source IDs ─────────────────────────────────────────
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

      logger.info(`[corpus-seed] Source IDs loaded: ${JSON.stringify(map)}`)
      return map
    })

    // ── Step 2: eCFR Title 21 ─────────────────────────────────────────────
    const ecfrStats = await step.run('ingest-ecfr', async () => {
      logger.info('[corpus-seed] Starting eCFR Title 21 ingestion...')
      const sourceId = sourceIds[SOURCE_NAMES.ECFR]
      const stats = await ingestECFR(sourceId)
      logger.info(`[corpus-seed] eCFR complete: ${stats.parts_ingested} parts`)
      if (stats.errors.length > 0) {
        logger.warn(`[corpus-seed] eCFR errors: ${stats.errors.join('; ')}`)
      }
      return stats
    })

    // ── Step 3: Federal Register (year-by-year internally) ────────────────
    const frStats = await step.run('ingest-federal-register', async () => {
      logger.info('[corpus-seed] Starting Federal Register ingestion...')
      const sourceId = sourceIds[SOURCE_NAMES.FEDERAL_REGISTER]
      const stats = await ingestFederalRegister(sourceId)
      logger.info(
        `[corpus-seed] Federal Register complete: ${stats.documents_ingested} docs — ${JSON.stringify(stats.by_type)}`
      )
      if (stats.errors.length > 0) {
        logger.warn(`[corpus-seed] FR errors: ${stats.errors.join('; ')}`)
      }
      return stats
    })

    // ── Step 4: openFDA enforcement actions ───────────────────────────────
    const openFDAStats = await step.run('ingest-openfda', async () => {
      logger.info('[corpus-seed] Starting openFDA enforcement ingestion...')
      const sourceId = sourceIds[SOURCE_NAMES.OPENFDA]
      const stats = await ingestOpenFDA(sourceId)
      logger.info(
        `[corpus-seed] openFDA complete: ${stats.actions_ingested} actions — ${JSON.stringify(stats.by_endpoint)}`
      )
      if (stats.errors.length > 0) {
        logger.warn(`[corpus-seed] openFDA errors: ${stats.errors.join('; ')}`)
      }
      return stats
    })

    // ── Step 5: Summary ───────────────────────────────────────────────────
    const summary = await step.run('summarize', async () => {
      const total =
        ecfrStats.parts_ingested +
        frStats.documents_ingested +
        openFDAStats.actions_ingested

      const allErrors = [
        ...ecfrStats.errors,
        ...frStats.errors,
        ...openFDAStats.errors,
      ]

      logger.info(`[corpus-seed] ===== CORPUS SEED COMPLETE =====`)
      logger.info(`[corpus-seed] eCFR parts:       ${ecfrStats.parts_ingested}`)
      logger.info(`[corpus-seed] FR documents:     ${frStats.documents_ingested}`)
      logger.info(`[corpus-seed] openFDA actions:  ${openFDAStats.actions_ingested}`)
      logger.info(`[corpus-seed] TOTAL:            ${total}`)
      logger.info(`[corpus-seed] Errors:           ${allErrors.length}`)
      if (allErrors.length > 0) {
        logger.warn(`[corpus-seed] Error list: ${allErrors.join('\n')}`)
      }

      return {
        total_entities: total,
        ecfr:           ecfrStats.parts_ingested,
        federal_register: frStats.documents_ingested,
        openfda:        openFDAStats.actions_ingested,
        fr_by_type:     frStats.by_type,
        openfda_by_endpoint: openFDAStats.by_endpoint,
        error_count:    allErrors.length,
      }
    })

    return summary
  }
)
