// Populates kg_entity_practice_relevance.
// Pass 1 (rule): entities with kg_entity_domains entries → domain-practice-type map lookup.
// Pass 2 (ML):   entities with NO domain assignments → Claude determines practice type relevance.
// Also: entities where rule pass produced 0 practice rows → ML fallback.
// Event: 'cedar/corpus.practice-score'
// Re-runnable: UPSERT preserves manual entries; overwrites rule/ml.

import Anthropic from '@anthropic-ai/sdk'
import { inngest } from './client'
import { createServerClient } from '../lib/db/client'
import { trackCost, calculateClaudeCost } from '../lib/cost-tracker'

const MODEL         = 'claude-sonnet-4-5-20250929'
const RULE_BATCH    = 200   // entities per rule-pass batch (join with entity_domains is expensive)
const ML_BATCH_SIZE = 15    // entities per Claude API call

// Practice type slugs from migration 024 (all 14)
const ALL_PRACTICE_SLUGS = [
  'endocrinology', 'functional_medicine', 'hormone_therapy_clinic', 'med_spa',
  'regenerative_medicine', 'weight_management', 'telehealth_practice', 'iv_therapy',
  'peptide_therapy', 'compounding_pharmacy', 'dermatology', 'family_medicine',
  'internal_medicine', 'chiropractor',
]

// ── ML classifier ───────────────────────────────────────────────────────────
interface MLPracticeResult {
  entity_id: string
  scores: Array<{ practice_type_slug: string; relevance_score: number }>
}

async function scorePracticeWithClaude(
  entities: Array<{ id: string; name: string; description: string | null; document_type: string | null; source_name: string | null; cfr_refs: string | null; assigned_domains: string[] }>,
  logger: { warn: (m: string) => void }
): Promise<MLPracticeResult[]> {
  const client = new Anthropic()

  const prompt = `You are scoring healthcare regulatory entities for relevance to independent medical practice types.

Context: Cedar is a compliance intelligence platform for independent medical practices (functional medicine, hormone therapy, compounding pharmacy, med spa, weight management, IV therapy, etc.) in Florida.

Practice types (use exactly these slugs):
${ALL_PRACTICE_SLUGS.join(', ')}

Each entity includes its already-classified regulatory domains (assigned_domains) as context.
Use these domain classifications to inform your relevance scoring.

For each entity, return only practice types with relevance_score >= 0.60.
Scoring guide:
- 0.90-1.00: This regulation directly governs this practice type's core workflow
- 0.75-0.89: This regulation has significant compliance implications for this practice type
- 0.60-0.74: Some relevance but not central to this practice type

Note: scores below 0.70 will be flagged for human review — only include if genuinely relevant.

Respond ONLY with a JSON array. No prose, no markdown:
[{"index":0,"scores":[{"practice_type_slug":"hormone_therapy_clinic","relevance_score":0.95},...]}]

Entities:
${JSON.stringify(entities.map((e, i) => ({
  index: i, id: e.id, name: e.name,
  description: e.description?.slice(0, 300) ?? null,
  document_type: e.document_type, source_name: e.source_name, cfr_refs: e.cfr_refs,
  assigned_domains: e.assigned_domains,
})), null, 2)}`

  let response
  try {
    response = await client.messages.create({
      model: MODEL, max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })
  } catch (err) {
    logger.warn(`[practice-score] Claude API error: ${(err as Error).message}`)
    return []
  }

  await trackCost({
    service: 'claude',
    operation: 'corpus_practice_score',
    cost_usd: calculateClaudeCost(response.usage.input_tokens, response.usage.output_tokens),
    tokens_in: response.usage.input_tokens,
    tokens_out: response.usage.output_tokens,
    context: { entity_count: entities.length },
  })

  const raw = response.content[0]?.type === 'text' ? response.content[0].text : ''
  let parsed: Array<{ index: number; scores: Array<{ practice_type_slug: string; relevance_score: number }> }> = []
  try {
    parsed = JSON.parse(raw.trim())
  } catch {
    logger.warn(`[practice-score] Claude JSON parse failed. Raw: ${raw.slice(0, 200)}`)
    return []
  }

  return parsed.map(r => ({
    entity_id: entities[r.index]?.id ?? '',
    scores: (r.scores ?? []).filter(s => ALL_PRACTICE_SLUGS.includes(s.practice_type_slug) && s.relevance_score >= 0.60),
  })).filter(r => r.entity_id && r.scores.length > 0)
}

export const corpusPracticeScore = inngest.createFunction(
  {
    id: 'corpus-practice-score',
    name: 'Corpus Practice Score — Populate kg_entity_practice_relevance',
    retries: 1,
    concurrency: { limit: 1 },
    timeouts: { finish: '4h' },
  },
  { event: 'cedar/corpus.practice-score' },
  async ({ step, logger, runId }) => {

    // Step 1: Load lookup maps
    const { domainMap, practiceMap, sourceMap } = await step.run('load-maps', async () => {
      const supabase = createServerClient()
      const [{ data: domains }, { data: practices }, { data: sources }] = await Promise.all([
        supabase.from('kg_domains').select('id, slug'),
        supabase.from('kg_practice_types').select('id, slug'),
        supabase.from('sources').select('id, name'),
      ])
      const domainMap: Record<string, string> = {}
      const practiceMap: Record<string, string> = {}
      const sourceMap: Record<string, string> = {}
      for (const d of domains ?? []) domainMap[d.slug] = d.id
      for (const p of practices ?? []) practiceMap[p.slug] = p.id
      for (const s of sources ?? []) sourceMap[s.id] = s.name
      return { domainMap, practiceMap, sourceMap }
    })

    const allPracticeTypeIds = Object.values(practiceMap)

    // Step 2: Load domain-practice-type mapping from DB
    const rawMappings = await step.run('load-domain-practice-map', async () => {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('kg_domain_practice_type_map')
        .select('domain_slug, practice_type_slug, relevance_weight, applies_to_all_types')
      if (error) throw new Error(`Domain-practice map failed: ${error.message}`)
      return data ?? []
    })

    // Build domainId → [{practiceTypeId, weight}] lookup (fan out all_types entries)
    const domainIdToPractices: Record<string, Array<{ practiceTypeId: string; weight: number }>> = {}
    for (const row of rawMappings) {
      const domainId = domainMap[row.domain_slug]
      if (!domainId) continue
      if (!domainIdToPractices[domainId]) domainIdToPractices[domainId] = []

      if (row.applies_to_all_types) {
        for (const ptId of allPracticeTypeIds) {
          domainIdToPractices[domainId].push({ practiceTypeId: ptId, weight: row.relevance_weight })
        }
      } else {
        const ptId = practiceMap[row.practice_type_slug]
        if (ptId) domainIdToPractices[domainId].push({ practiceTypeId: ptId, weight: row.relevance_weight })
      }
    }

    // Step 3: Check corpus-classify ran (warn if empty)
    const classifiedCount = await step.run('check-entity-domains', async () => {
      const supabase = createServerClient()
      const { count } = await supabase.from('kg_entity_domains').select('entity_id', { count: 'exact', head: true })
      return count ?? 0
    })
    if (classifiedCount === 0) {
      logger.warn('[practice-score] kg_entity_domains is empty — run corpus-classify first. Proceeding with ML-only pass.')
    }

    // Step 4: Count total entities for batching
    const entityCount = await step.run('count-entities', async () => {
      const supabase = createServerClient()
      const { count } = await supabase.from('kg_entities').select('id', { count: 'exact', head: true })
      return count ?? 0
    })

    // ── PASS 1: Rule-based scoring ──────────────────────────────────────────
    const totalBatches = Math.ceil(entityCount / RULE_BATCH)
    let ruleScored = 0
    let ruleRelevanceRows = 0
    const noScoreIds: string[] = []  // entities that got 0 practice type assignments from rules

    for (let i = 0; i < totalBatches; i++) {
      const stats = await step.run(`rule-score-batch-${i}`, async () => {
        const supabase = createServerClient()

        const { data: entityBatch, error: entityErr } = await supabase
          .from('kg_entities')
          .select('id, source_id')
          .range(i * RULE_BATCH, i * RULE_BATCH + RULE_BATCH - 1)
        if (entityErr) throw new Error(`Entity batch ${i}: ${entityErr.message}`)
        if (!entityBatch?.length) return { scored: 0, rows: 0, missed: [] as string[] }

        const entityIds = entityBatch.map(e => e.id)

        // Protect manual entries
        const { data: manualEntries } = await supabase
          .from('kg_entity_practice_relevance')
          .select('entity_id')
          .in('entity_id', entityIds)
          .eq('classified_by', 'manual')
        const manualIds = new Set((manualEntries ?? []).map(r => r.entity_id))

        // Fetch domain assignments
        const { data: domainAssignments, error: domErr } = await supabase
          .from('kg_entity_domains')
          .select('entity_id, domain_id, relevance_score')
          .in('entity_id', entityIds)
        if (domErr) throw new Error(`Domain fetch batch ${i}: ${domErr.message}`)

        // Group by entity
        const entityDomains: Record<string, Array<{ domainId: string; score: number }>> = {}
        for (const da of domainAssignments ?? []) {
          if (!entityDomains[da.entity_id]) entityDomains[da.entity_id] = []
          entityDomains[da.entity_id].push({ domainId: da.domain_id, score: da.relevance_score ?? 0.8 })
        }

        const relevanceRows: Array<{
          entity_id: string; practice_type_id: string; relevance_score: number
          classified_by: string; classified_at: string
        }> = []
        const missed: string[] = []

        for (const { id: entityId } of entityBatch) {
          if (manualIds.has(entityId)) continue
          const domains = entityDomains[entityId] ?? []
          if (!domains.length) { missed.push(entityId); continue }

          const practiceScores: Record<string, number> = {}
          for (const { domainId, score: entityDomainScore } of domains) {
            for (const { practiceTypeId, weight } of (domainIdToPractices[domainId] ?? [])) {
              const combined = Math.round(weight * entityDomainScore * 1000) / 1000
              if (!practiceScores[practiceTypeId] || combined > practiceScores[practiceTypeId]) {
                practiceScores[practiceTypeId] = combined
              }
            }
          }

          if (Object.keys(practiceScores).length === 0) { missed.push(entityId); continue }

          for (const [ptId, score] of Object.entries(practiceScores)) {
            if (score < 0.50) continue
            relevanceRows.push({
              entity_id: entityId, practice_type_id: ptId,
              relevance_score: score, classified_by: 'rule:domain-practice-map',
              classified_at: new Date().toISOString(),
            })
          }

          if (!Object.keys(practiceScores).some(k => practiceScores[k] >= 0.50)) {
            missed.push(entityId)
          }
        }

        if (relevanceRows.length > 0) {
          const { error: upsertErr } = await supabase
            .from('kg_entity_practice_relevance')
            .upsert(relevanceRows, { onConflict: 'entity_id,practice_type_id' })
          if (upsertErr) logger.warn(`[practice-score] Rule batch ${i} upsert warn: ${upsertErr.message}`)
        }

        return { scored: entityBatch.length, rows: relevanceRows.length, missed }
      })

      ruleScored += stats.scored
      ruleRelevanceRows += stats.rows
      noScoreIds.push(...stats.missed)
      logger.info(`[practice-score] Rule batch ${i + 1}/${totalBatches} — ${stats.rows} rows, ${stats.missed.length} to ML`)
    }

    logger.info(`[practice-score] Rule pass done — ${ruleRelevanceRows} rows written, ${noScoreIds.length} entities to ML`)

    // ── PASS 2: ML for unscored entities ────────────────────────────────────
    let mlRelevanceRows = 0

    if (noScoreIds.length > 0) {
      // Build domain ID → slug map for including domain context in Claude prompt
      const domainIdToSlugForML: Record<string, string> = {}
      for (const [slug, id] of Object.entries(domainMap)) domainIdToSlugForML[id] = slug

      // Fetch full entity data + existing domain classifications (context for Claude)
      const ML_FETCH_CHUNK = 500
      const mlEntities: Array<{ id: string; name: string; description: string | null; document_type: string | null; source_name: string | null; cfr_refs: string | null; assigned_domains: string[] }> = []

      for (let j = 0; j < noScoreIds.length; j += ML_FETCH_CHUNK) {
        const fetched = await step.run(`ml-fetch-entities-${j}`, async () => {
          const supabase = createServerClient()
          const ids = noScoreIds.slice(j, j + ML_FETCH_CHUNK)

          // Fetch entity details and their existing domain assignments in parallel
          const [{ data: entities }, { data: domainAssignments }] = await Promise.all([
            supabase.from('kg_entities')
              .select('id, name, description, document_type, source_id, cfr_references')
              .in('id', ids),
            supabase.from('kg_entity_domains')
              .select('entity_id, domain_id')
              .in('entity_id', ids),
          ])

          const entityDomainIds: Record<string, string[]> = {}
          for (const da of domainAssignments ?? []) {
            if (!entityDomainIds[da.entity_id]) entityDomainIds[da.entity_id] = []
            entityDomainIds[da.entity_id].push(da.domain_id)
          }

          return (entities ?? []).map(e => ({
            id: e.id,
            name: e.name,
            description: e.description,
            document_type: e.document_type,
            source_name: sourceMap[e.source_id ?? ''] ?? null,
            cfr_refs: e.cfr_references ? JSON.stringify(e.cfr_references).slice(0, 100) : null,
            // Domain slugs already assigned — pass as context to Claude for better scoring
            assigned_domains: (entityDomainIds[e.id] ?? [])
              .map(id => domainIdToSlugForML[id])
              .filter(Boolean),
          }))
        })
        mlEntities.push(...fetched)
      }

      const mlTotalBatches = Math.ceil(mlEntities.length / ML_BATCH_SIZE)

      for (let k = 0; k < mlTotalBatches; k++) {
        const mlStats = await step.run(`ml-score-batch-${k}`, async () => {
          const supabase = createServerClient()
          const batch = mlEntities.slice(k * ML_BATCH_SIZE, k * ML_BATCH_SIZE + ML_BATCH_SIZE)

          const results = await scorePracticeWithClaude(batch, logger)
          if (!results.length) return 0

          const relevanceRows: Array<{
            entity_id: string; practice_type_id: string; relevance_score: number
            classified_by: string; classified_at: string
          }> = []
          const logRows: Array<{
            entity_id: string; stage: string; confidence: number
            classified_by: string; needs_review: boolean; review_reason: string | null; run_id: string
          }> = []

          for (const r of results) {
            for (const { practice_type_slug, relevance_score } of r.scores) {
              const ptId = practiceMap[practice_type_slug]
              if (!ptId) continue
              relevanceRows.push({
                entity_id: r.entity_id, practice_type_id: ptId,
                relevance_score, classified_by: 'claude-sonnet-4-5-20250929',
                classified_at: new Date().toISOString(),
              })
            }
            // needs_review=true if any score is below 0.70 (not authoritative — flag for human review)
            const minScore = Math.min(...r.scores.map(s => s.relevance_score))
            logRows.push({
              entity_id: r.entity_id, stage: 'ml', confidence: minScore,
              classified_by: 'claude-sonnet-4-5-20250929',
              needs_review: minScore < 0.70,
              review_reason: minScore < 0.70 ? `ML score ${minScore} below 0.70 threshold` : null,
              run_id: runId ?? 'unknown',
            })
          }

          if (relevanceRows.length > 0) {
            const { error: upsertErr } = await supabase
              .from('kg_entity_practice_relevance')
              .upsert(relevanceRows, { onConflict: 'entity_id,practice_type_id' })
            if (upsertErr) logger.warn(`[practice-score] ML batch ${k} upsert warn: ${upsertErr.message}`)
          }
          if (logRows.length > 0) {
            await supabase.from('kg_classification_log').insert(logRows)
          }

          return relevanceRows.length
        })

        mlRelevanceRows += mlStats
        logger.info(`[practice-score] ML batch ${k + 1}/${mlTotalBatches} — ${mlStats} rows`)
      }
    }

    // Step N: Refresh materialized views
    await step.run('refresh-views', async () => {
      const supabase = createServerClient()
      const [r1, r2] = await Promise.all([
        supabase.rpc('refresh_corpus_facets'),
        supabase.rpc('refresh_practice_relevance_summary'),
      ])
      if (r1.error) logger.warn(`[practice-score] Facets refresh: ${r1.error.message}`)
      if (r2.error) logger.warn(`[practice-score] Summary refresh: ${r2.error.message}`)
    })

    logger.info(`[practice-score] Done — rule: ${ruleRelevanceRows} rows, ML: ${mlRelevanceRows} rows`)
    return { ruleRelevanceRows, mlRelevanceRows }
  }
)
