// Populates authority_level + issuing_agency on kg_entities.
// Pass 1: Deterministic rule-based (source name, document_type, entity_type).
// Pass 2: Claude API ML fallback for entities rule-pass could not classify (returns null).
// Event: 'cedar/corpus.authority-classify'
// Re-runnable: UPSERT overwrites previous rule/ml values; manual entries preserved.
// Claude batch size: 15 entities per API call.

import Anthropic from '@anthropic-ai/sdk'
import { inngest } from './client'
import { createServerClient } from '../lib/db/client'
import { trackCost, calculateClaudeCost } from '../lib/cost-tracker'

const MODEL = 'claude-sonnet-4-5-20250929'
const RULE_BATCH_SIZE = 1000
const ML_BATCH_SIZE   = 15

type AuthorityLevel =
  | 'federal_statute' | 'federal_regulation' | 'sub_regulatory_guidance'
  | 'national_coverage_determination' | 'local_coverage_determination'
  | 'state_statute' | 'state_board_rule' | 'professional_standard'

const VALID_AUTHORITY_LEVELS: AuthorityLevel[] = [
  'federal_statute', 'federal_regulation', 'sub_regulatory_guidance',
  'national_coverage_determination', 'local_coverage_determination',
  'state_statute', 'state_board_rule', 'professional_standard',
]

interface EntityForAuth {
  id: string
  document_type: string | null
  entity_type: string
  name: string
  source_name: string | null
  metadata: Record<string, unknown> | null
}

// ── Rule-based classifier ───────────────────────────────────────────────────
function classifyAuthorityByRule(e: EntityForAuth): { level: AuthorityLevel; agency: string } | null {
  const src       = (e.source_name ?? '').toLowerCase()
  const docType   = (e.document_type ?? '').toUpperCase()
  const entType   = (e.entity_type ?? '').toLowerCase()
  const name      = (e.name ?? '').toLowerCase()

  // Entity-type overrides
  if (entType === 'enforcement_action' || docType === 'WARNING_LETTER' || docType === 'RECALL') {
    return { level: 'sub_regulatory_guidance', agency: 'FDA' }
  }

  // FL State Boards → state_board_rule
  if (src.includes('fl board') || src.includes('board of medicine') ||
      src.includes('board of pharmacy') || src.includes('board of osteopathic') ||
      src.includes('mqa') || src.includes('fl administrative register') ||
      src.includes('florida administrative')) {
    return { level: 'state_board_rule', agency: 'FL-BOARD' }
  }

  // FDA Compounding Guidance → sub_regulatory_guidance
  if (src.includes('fda compounding guidance') || src.includes('compounding guidance')) {
    return { level: 'sub_regulatory_guidance', agency: 'FDA' }
  }

  // openFDA Drug Enforcement → sub_regulatory_guidance
  if (src.includes('openfda') || (src.includes('drug enforcement') && src.includes('open'))) {
    return { level: 'sub_regulatory_guidance', agency: 'FDA' }
  }

  // eCFR → federal_regulation
  if (src.includes('ecfr') || src.includes('electronic code of federal')) {
    return { level: 'federal_regulation', agency: detectFederalAgency(src, name) }
  }

  // DEA Diversion Control → federal_regulation
  if (src.includes('dea diversion') || src.includes('diversion control')) {
    return { level: 'federal_regulation', agency: 'DEA' }
  }

  // Federal Register — doc type determines level
  if (src.includes('federal register') || src.includes('fda federal')) {
    if (docType === 'RULE' || docType === 'PROPOSED_RULE' || docType === 'FINAL_RULE') {
      return { level: 'federal_regulation', agency: detectFederalAgency(src, name) }
    }
    if (docType === 'NOTICE') {
      return { level: 'sub_regulatory_guidance', agency: detectFederalAgency(src, name) }
    }
    // FR with unknown type — default federal_regulation
    return { level: 'federal_regulation', agency: detectFederalAgency(src, name) }
  }

  // Name-based fallbacks
  if (name.includes(' guidance') || name.includes('advisory') || name.includes('transmittal')) {
    return { level: 'sub_regulatory_guidance', agency: detectFederalAgency(src, name) }
  }
  if (/\d+ cfr /i.test(e.name ?? '')) {
    return { level: 'federal_regulation', agency: detectFederalAgency(src, name) }
  }

  return null
}

function detectFederalAgency(src: string, name: string): string {
  if (src.includes('dea') || name.includes('dea'))        return 'DEA'
  if (src.includes('fda') || name.includes('fda') || name.includes('21 cfr'))    return 'FDA'
  if (src.includes('cms') || name.includes('42 cfr') || name.includes('medicare')) return 'CMS'
  if (src.includes('hhs') || name.includes('45 cfr') || name.includes('hipaa'))   return 'HHS'
  if (src.includes('osha') || name.includes('29 cfr'))    return 'OSHA'
  return 'FEDERAL'
}

// ── Claude ML classifier ────────────────────────────────────────────────────
interface MLAuthResult {
  entity_id: string
  authority_level: AuthorityLevel | null
  issuing_agency: string
  confidence: number
}

async function classifyAuthorityWithClaude(
  entities: EntityForAuth[],
  logger: { warn: (m: string) => void; info: (m: string) => void }
): Promise<MLAuthResult[]> {
  const client = new Anthropic()

  const entityList = entities.map((e, i) => ({
    index: i,
    id: e.id,
    name: e.name,
    description: (e.metadata as { description?: string } | null)?.description ?? null,
    document_type: e.document_type,
    entity_type: e.entity_type,
    source_name: e.source_name,
  }))

  const prompt = `You are classifying healthcare regulatory entities for Cedar, a regulatory intelligence platform for independent medical practices.

For each entity below, determine its authority_level and issuing_agency.

authority_level must be exactly one of:
- federal_statute (a US statute enacted by Congress)
- federal_regulation (a CFR regulation or published Federal Register rule)
- sub_regulatory_guidance (FDA guidance, CMS transmittal, advisory, notice, enforcement action)
- national_coverage_determination (CMS national coverage decision)
- local_coverage_determination (MAC local coverage decision)
- state_statute (a state law enacted by a state legislature)
- state_board_rule (a state board administrative rule, board order, or board guidance)
- professional_standard (accreditation standard, USP chapter, clinical guideline)

issuing_agency: short code like 'FDA', 'DEA', 'CMS', 'HHS', 'OSHA', 'FL-BOARD', 'USP', 'FEDERAL', etc.

Respond ONLY with a JSON array. No prose, no markdown. Example:
[{"index":0,"authority_level":"federal_regulation","issuing_agency":"FDA","confidence":0.92}]

Entities:
${JSON.stringify(entityList, null, 2)}`

  let response
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })
  } catch (err) {
    logger.warn(`[authority-classify] Claude API error: ${(err as Error).message}`)
    return []
  }

  // Track cost
  const tokensIn  = response.usage.input_tokens
  const tokensOut = response.usage.output_tokens
  await trackCost({
    service: 'claude',
    operation: 'corpus_authority_classify',
    cost_usd: calculateClaudeCost(tokensIn, tokensOut),
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    context: { entity_count: entities.length },
  })

  const raw = response.content[0]?.type === 'text' ? response.content[0].text : ''
  let parsed: Array<{ index: number; authority_level: string; issuing_agency: string; confidence: number }> = []
  try {
    parsed = JSON.parse(raw.trim())
  } catch {
    logger.warn(`[authority-classify] Claude JSON parse failed. Raw: ${raw.slice(0, 200)}`)
    return []
  }

  return parsed.map(r => {
    const entity = entities[r.index]
    if (!entity) return null
    const level = VALID_AUTHORITY_LEVELS.includes(r.authority_level as AuthorityLevel)
      ? r.authority_level as AuthorityLevel
      : null
    return { entity_id: entity.id, authority_level: level, issuing_agency: r.issuing_agency ?? 'UNKNOWN', confidence: r.confidence ?? 0.7 }
  }).filter(Boolean) as MLAuthResult[]
}

// ── Main function ───────────────────────────────────────────────────────────
export const corpusAuthorityClassify = inngest.createFunction(
  {
    id: 'corpus-authority-classify',
    name: 'Corpus Authority Classify — Populate authority_level on kg_entities',
    retries: 1,
    concurrency: { limit: 1 },
    timeouts: { finish: '2h' },
  },
  { event: 'cedar/corpus.authority-classify' },
  async ({ step, logger, runId }) => {

    // Step 1: Load source ID → name map
    const sourceMap = await step.run('load-source-map', async () => {
      const supabase = createServerClient()
      const { data, error } = await supabase.from('sources').select('id, name')
      if (error) throw new Error(`Source map load failed: ${error.message}`)
      const map: Record<string, string> = {}
      for (const s of data ?? []) map[s.id] = s.name
      return map
    })

    // Step 2: Count total entities
    const totalCount = await step.run('count-entities', async () => {
      const supabase = createServerClient()
      const { count, error } = await supabase.from('kg_entities').select('id', { count: 'exact', head: true })
      if (error) throw new Error(`Count failed: ${error.message}`)
      logger.info(`[authority-classify] ${count} total entities`)
      return count ?? 0
    })

    // ── PASS 1: Rule-based classification ──────────────────────────────────
    const totalBatches = Math.ceil(totalCount / RULE_BATCH_SIZE)
    const unclassifiedIds: string[] = []
    let ruleClassified = 0

    for (let i = 0; i < totalBatches; i++) {
      const batchResult = await step.run(`rule-pass-batch-${i}`, async () => {
        const supabase = createServerClient()

        const { data: entities, error } = await supabase
          .from('kg_entities')
          .select('id, document_type, entity_type, name, metadata, source_id')
          .range(i * RULE_BATCH_SIZE, i * RULE_BATCH_SIZE + RULE_BATCH_SIZE - 1)
        if (error) throw new Error(`Batch ${i} fetch failed: ${error.message}`)
        if (!entities?.length) return { classified: 0, unclassified: [] as string[] }

        // Fetch existing manual entries to protect them
        const entityIds = entities.map(e => e.id)
        const { data: manualEntries } = await supabase
          .from('kg_classification_log')
          .select('entity_id')
          .in('entity_id', entityIds)
          .eq('stage', 'manual')
        const manualIds = new Set((manualEntries ?? []).map(r => r.entity_id))

        const updates: Array<{ id: string; authority_level: string; issuing_agency: string }> = []
        const logRows: Array<{
          entity_id: string; stage: string; confidence: number
          classified_by: string; needs_review: boolean; run_id: string
        }> = []
        const missed: string[] = []

        for (const entity of entities) {
          if (manualIds.has(entity.id)) continue  // preserve manual entries

          const mapped: EntityForAuth = {
            id: entity.id,
            document_type: entity.document_type,
            entity_type: entity.entity_type,
            name: entity.name,
            source_name: sourceMap[entity.source_id ?? ''] ?? null,
            metadata: entity.metadata as Record<string, unknown> | null,
          }
          const result = classifyAuthorityByRule(mapped)

          if (result) {
            updates.push({ id: entity.id, authority_level: result.level, issuing_agency: result.agency })
            logRows.push({
              entity_id: entity.id, stage: 'rule', confidence: 0.95,
              classified_by: 'rule:source-doctype', needs_review: false,
              run_id: runId ?? 'unknown',
            })
          } else {
            missed.push(entity.id)
          }
        }

        if (updates.length > 0) {
          const { error: upsertErr } = await supabase
            .from('kg_entities')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .upsert(updates.map(u => ({ id: u.id, authority_level: u.authority_level, issuing_agency: u.issuing_agency })) as any,
              { onConflict: 'id' })
          if (upsertErr) logger.warn(`[authority-classify] Rule batch ${i} upsert warn: ${upsertErr.message}`)
        }
        if (logRows.length > 0) {
          const { error: logErr } = await supabase.from('kg_classification_log').insert(logRows)
          if (logErr) logger.warn(`[authority-classify] Rule batch ${i} log warn: ${logErr.message}`)
        }

        return { classified: updates.length, unclassified: missed }
      })

      ruleClassified += batchResult.classified
      unclassifiedIds.push(...batchResult.unclassified)
      logger.info(`[authority-classify] Rule batch ${i + 1}/${totalBatches} — ${batchResult.classified} classified, ${batchResult.unclassified.length} to ML`)
    }

    logger.info(`[authority-classify] Rule pass done — ${ruleClassified} classified, ${unclassifiedIds.length} going to ML pass`)

    // ── PASS 2: ML fallback for unclassified entities ──────────────────────
    if (unclassifiedIds.length === 0) {
      logger.info('[authority-classify] No entities need ML pass')
      return { ruleClassified, mlClassified: 0 }
    }

    // Fetch full entity data for unclassified IDs
    const mlEntityData: EntityForAuth[] = []
    const ML_FETCH_BATCH = 500

    for (let j = 0; j < unclassifiedIds.length; j += ML_FETCH_BATCH) {
      const fetchResult = await step.run(`ml-fetch-${j}`, async () => {
        const supabase = createServerClient()
        const ids = unclassifiedIds.slice(j, j + ML_FETCH_BATCH)
        const { data, error } = await supabase
          .from('kg_entities')
          .select('id, document_type, entity_type, name, metadata, source_id')
          .in('id', ids)
        if (error) throw new Error(`ML entity fetch failed: ${error.message}`)
        return (data ?? []).map(e => ({
          id: e.id,
          document_type: e.document_type,
          entity_type: e.entity_type,
          name: e.name,
          source_name: sourceMap[e.source_id ?? ''] ?? null,
          metadata: e.metadata as Record<string, unknown> | null,
        }))
      })
      mlEntityData.push(...fetchResult)
    }

    let mlClassified = 0
    const mlTotalBatches = Math.ceil(mlEntityData.length / ML_BATCH_SIZE)

    for (let k = 0; k < mlTotalBatches; k++) {
      const mlStats = await step.run(`ml-classify-batch-${k}`, async () => {
        const supabase = createServerClient()
        const batch = mlEntityData.slice(k * ML_BATCH_SIZE, k * ML_BATCH_SIZE + ML_BATCH_SIZE)

        const results = await classifyAuthorityWithClaude(batch, logger)
        if (!results.length) return 0

        const updates = results
          .filter(r => r.authority_level !== null)
          .map(r => ({ id: r.entity_id, authority_level: r.authority_level as string, issuing_agency: r.issuing_agency }))

        if (updates.length > 0) {
          const { error: upsertErr } = await supabase
            .from('kg_entities')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .upsert(updates as any, { onConflict: 'id' })
          if (upsertErr) logger.warn(`[authority-classify] ML batch ${k} upsert warn: ${upsertErr.message}`)
        }

        // Log ML classifications
        const logRows = results.map(r => ({
          entity_id: r.entity_id,
          stage: 'ml',
          confidence: r.confidence,
          classified_by: 'claude-sonnet-4-5-20250929',
          needs_review: r.confidence < 0.70,
          review_reason: r.confidence < 0.70 ? `ML confidence ${r.confidence} below 0.70 threshold` : null,
          run_id: runId ?? 'unknown',
        }))
        const { error: logErr } = await supabase.from('kg_classification_log').insert(logRows)
        if (logErr) logger.warn(`[authority-classify] ML batch ${k} log warn: ${logErr.message}`)

        return updates.length
      })

      mlClassified += mlStats
      logger.info(`[authority-classify] ML batch ${k + 1}/${mlTotalBatches} — ${mlStats} classified`)
    }

    logger.info(`[authority-classify] Done — rule: ${ruleClassified}, ML: ${mlClassified}`)
    return { ruleClassified, mlClassified }
  }
)
