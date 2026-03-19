// Daily Federal Register poll — ingests new RULE/PROPOSED_RULE documents and links
// them to existing CFR entities via 'amends' and 'corrects' relationships.
// Cron: 7:00 AM ET on business days (12:00 UTC, Mon–Fri)
// Event: 'cedar/corpus.fr-daily-poll' (also triggerable manually from Inngest dashboard)

import { inngest } from './client'
import { createServerClient } from '../lib/db/client'
import { searchFederalRegister } from '../lib/fetchers/gov-apis'
import { trackCost } from '../lib/cost-tracker'
import { upsertEntities, type KGEntityInsert } from '../lib/corpus/shared'
import { createRelationships, matchCFREntitiesToRefs } from '../lib/corpus/relationship-linker'

// CFR titles covering healthcare, pharma, DEA, labor (OSHA), social services (HHS/CMS)
const CFR_TITLES = [21, 29, 42, 45]
const FR_TYPES   = ['RULE', 'PROPOSED_RULE']
const PER_PAGE   = 1000

const FR_SOURCE_NAME = 'FDA Federal Register'

// FR API fields needed for entity creation + relationship linking
const FIELDS = [
  'document_number', 'title', 'abstract', 'type', 'publication_date',
  'effective_on', 'html_url', 'pdf_url', 'citation', 'comments_close_on',
  'agencies', 'cfr_references', 'correction_of', 'docket_ids',
  'regulation_id_numbers', 'significant',
]

const TYPE_TO_ENTITY: Record<string, string> = {
  'Rule': 'regulation', 'RULE': 'regulation',
  'Proposed Rule': 'proposed_rule', 'PROPOSED_RULE': 'proposed_rule',
}
const TYPE_TO_STATUS: Record<string, string> = {
  'Rule': 'active', 'RULE': 'active',
  'Proposed Rule': 'proposed', 'PROPOSED_RULE': 'proposed',
}

export const frDailyPoll = inngest.createFunction(
  {
    id: 'fr-daily-poll',
    name: 'FR Daily Poll — Federal Register New Documents',
    retries: 2,
    concurrency: { limit: 1 },
    timeouts: { finish: '30m' },
  },
  [
    { event: 'cedar/corpus.fr-daily-poll' },
    { cron: '0 12 * * 1-5' },  // 7:00 AM ET weekdays
  ],
  async ({ step, logger, runId }) => {

    // ── Step 1: Load last poll date from system_config ─────────────────────
    const lastPollDate = await step.run('load-last-poll-date', async () => {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'fr_last_poll_date')
        .single()
      if (error) throw new Error(`system_config read failed: ${error.message}`)
      return data?.value ?? new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
    })

    logger.info(`[fr-daily-poll] Polling for FR docs published since ${lastPollDate}`)

    // ── Step 2: Load source ID ─────────────────────────────────────────────
    const sourceId = await step.run('load-source-id', async () => {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('sources')
        .select('id')
        .eq('name', FR_SOURCE_NAME)
        .single()
      if (error || !data) throw new Error(`Source '${FR_SOURCE_NAME}' not found`)
      return data.id as string
    })

    // ── Step 3: Fetch new FR documents ─────────────────────────────────────
    // Paginate through FR API filtering by CFR titles 21, 29, 42, 45 and date >= lastPollDate
    const fetchedDocs = await step.run('fetch-fr-documents', async () => {
      const today = new Date().toISOString().split('T')[0]
      const docs: Array<Record<string, unknown>> = []
      let page = 1
      let totalPages = 1

      do {
        const raw = await searchFederalRegister({
          agencies: [],          // empty = all agencies (filter by CFR title instead)
          types: FR_TYPES,
          dateGte: lastPollDate,
          dateLte: today,
          cfrTitles: CFR_TITLES,
          perPage: PER_PAGE,
          page,
          fields: FIELDS,
        })

        await trackCost({
          service: 'gov_api',
          operation: 'fr_daily_poll',
          cost_usd: 0,
          context: { page, lastPollDate, run_id: runId },
        })

        const parsed = JSON.parse(raw) as { count: number; total_pages: number; results: unknown[] }
        totalPages = parsed.total_pages ?? 1
        docs.push(...(parsed.results as Array<Record<string, unknown>>))
        logger.info(`[fr-daily-poll] Page ${page}/${totalPages} — ${parsed.results?.length ?? 0} docs`)
        page++
      } while (page <= totalPages)

      logger.info(`[fr-daily-poll] Fetched ${docs.length} total docs since ${lastPollDate}`)
      return docs
    })

    if (fetchedDocs.length === 0) {
      logger.info('[fr-daily-poll] No new documents — skipping relationship linking')
      return { documents: 0, relationships: 0 }
    }

    // ── Step 4: Upsert FR documents as kg_entities ─────────────────────────
    const upsertedIds = await step.run('upsert-fr-entities', async () => {
      const entities: KGEntityInsert[] = fetchedDocs
        .filter(doc => doc.document_number)
        .map(doc => ({
          name:              String(doc.title ?? doc.document_number),
          description:       doc.abstract as string | undefined,
          entity_type:       TYPE_TO_ENTITY[doc.type as string] ?? 'notice',
          jurisdiction:      'US',
          status:            TYPE_TO_STATUS[doc.type as string] ?? 'active',
          identifier:        String(doc.document_number),
          source_id:         sourceId,
          publication_date:  doc.publication_date as string | undefined,
          effective_date:    doc.effective_on as string | undefined,
          document_type:     String(doc.type),
          citation:          doc.citation as string | undefined,
          pdf_url:           doc.pdf_url as string | undefined,
          external_url:      doc.html_url as string | undefined,
          comment_close_date: doc.comments_close_on as string | undefined,
          agencies:          Array.isArray(doc.agencies) ? doc.agencies : undefined,
          cfr_references:    Array.isArray(doc.cfr_references) ? doc.cfr_references : undefined,
          metadata:          doc,
        }))

      const result = await upsertEntities(entities)
      if (result.errors.length > 0) {
        logger.warn(`[fr-daily-poll] Upsert errors: ${result.errors.join('; ')}`)
      }
      logger.info(`[fr-daily-poll] Upserted ${result.upserted} entities`)
      return result.upserted
    })

    // ── Step 5: Create 'amends' and 'corrects' relationships ───────────────
    const relationshipStats = await step.run('create-relationships', async () => {
      const supabase = createServerClient()
      const relRows: Parameters<typeof createRelationships>[0] = []

      for (const doc of fetchedDocs) {
        if (!doc.document_number) continue

        // Look up this doc's entity ID
        const { data: frEntity } = await supabase
          .from('kg_entities')
          .select('id')
          .eq('identifier', String(doc.document_number))
          .eq('source_id', sourceId)
          .single()

        if (!frEntity) continue
        const frEntityId = frEntity.id as string

        // 'amends' relationships via cfr_references
        const cfrRefs = Array.isArray(doc.cfr_references)
          ? (doc.cfr_references as Array<{ title: number; part: number }>)
          : []

        if (cfrRefs.length > 0) {
          const cfrMap = await matchCFREntitiesToRefs(cfrRefs)
          for (const targetId of cfrMap.values()) {
            relRows.push({
              source_entity_id:  frEntityId,
              target_entity_id:  targetId,
              relationship_type: 'amends',
              rel_type:          'amends',
              effective_date:    doc.effective_on as string | undefined,
              provenance:        'api_cfr_references',
              fr_citation:       doc.citation as string | undefined,
              confidence:        1.0,
            })
          }
        }

        // 'corrects' relationship via correction_of field
        if (doc.correction_of && typeof doc.correction_of === 'object') {
          const correctedDocNum = (doc.correction_of as { document_number?: string }).document_number
          if (correctedDocNum) {
            const { data: correctedEntity } = await supabase
              .from('kg_entities')
              .select('id')
              .eq('identifier', correctedDocNum)
              .eq('source_id', sourceId)
              .single()

            if (correctedEntity) {
              relRows.push({
                source_entity_id:  frEntityId,
                target_entity_id:  correctedEntity.id as string,
                relationship_type: 'corrects',
                rel_type:          'corrects',
                provenance:        'api_correction_of',
                fr_citation:       doc.citation as string | undefined,
                confidence:        1.0,
              })
            }
          }
        }
      }

      const result = await createRelationships(relRows)
      if (result.errors.length > 0) {
        logger.warn(`[fr-daily-poll] Relationship errors: ${result.errors.join('; ')}`)
      }
      logger.info(`[fr-daily-poll] Created ${result.linked} relationships`)
      return { linked: result.linked, attempted: relRows.length }
    })

    // ── Step 6: Update last poll date ──────────────────────────────────────
    await step.run('update-poll-date', async () => {
      const supabase = createServerClient()
      const today = new Date().toISOString().split('T')[0]
      const { error } = await supabase
        .from('system_config')
        .update({ value: today })
        .eq('key', 'fr_last_poll_date')
      if (error) logger.warn(`[fr-daily-poll] Failed to update poll date: ${error.message}`)
      else logger.info(`[fr-daily-poll] Poll date updated to ${today}`)
    })

    logger.info(`[fr-daily-poll] Done — ${upsertedIds} entities, ${relationshipStats.linked} relationships`)
    return {
      documents:     upsertedIds,
      relationships: relationshipStats.linked,
    }
  }
)
