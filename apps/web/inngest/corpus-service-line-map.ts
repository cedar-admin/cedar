// Populates kg_service_line_regulations.
// Pass 1 (rule): per service line, finds entities in its regulation_domains via kg_entity_domains.
// Pass 2 (ML):   entities with high practice type relevance (>= 0.80) but no service line
//                mapping → Claude determines which service lines apply and with what role.
// Event: 'cedar/corpus.service-line-map'
// Re-runnable: UPSERT preserves manual entries.

import Anthropic from '@anthropic-ai/sdk'
import { inngest } from './client'
import { createServerClient } from '../lib/db/client'
import { trackCost, calculateClaudeCost } from '../lib/cost-tracker'

const MODEL         = 'claude-sonnet-4-5-20250929'
const ML_BATCH_SIZE = 15

// Domain slug prefix → regulation_role (most specific first)
const DOMAIN_ROLE_RULES: Array<{ prefix: string; role: string }> = [
  { prefix: 'cs_rx_',            role: 'prescribing' },
  { prefix: 'cs_prescribing',    role: 'prescribing' },
  { prefix: 'cs_pdmp',           role: 'prescribing' },
  { prefix: 'cs_dea',            role: 'prescribing' },
  { prefix: 'cs_scheduling',     role: 'prescribing' },
  { prefix: 'controlled_sub',    role: 'prescribing' },
  { prefix: 'comp_',             role: 'dispensing' },
  { prefix: 'fda_compounding',   role: 'dispensing' },
  { prefix: 'pharmacy_license',  role: 'dispensing' },
  { prefix: 'cms_billing',       role: 'billing' },
  { prefix: 'billing_coding',    role: 'billing' },
  { prefix: 'cpt_',              role: 'billing' },
  { prefix: 'icd10_',            role: 'billing' },
  { prefix: 'fee_',              role: 'billing' },
  { prefix: 'prior_auth',        role: 'billing' },
  { prefix: 'cash_pay',          role: 'billing' },
  { prefix: 'osha',              role: 'safety' },
  { prefix: 'infection_',        role: 'safety' },
  { prefix: 'scope_of_practice', role: 'scope_of_practice' },
  { prefix: 'state_medical',     role: 'scope_of_practice' },
  { prefix: 'nursing_',          role: 'scope_of_practice' },
  { prefix: 'fl_telehealth',     role: 'scope_of_practice' },
  { prefix: 'facility_',         role: 'scope_of_practice' },
  { prefix: 'fl_med',            role: 'scope_of_practice' },
  { prefix: 'fl_hcc',            role: 'scope_of_practice' },
  { prefix: 'fl_medspa',         role: 'scope_of_practice' },
]

function roleForDomain(slug: string): string {
  for (const { prefix, role } of DOMAIN_ROLE_RULES) {
    if (slug.startsWith(prefix)) return role
  }
  return 'general'
}

// ── ML classifier ───────────────────────────────────────────────────────────
interface MLServiceLineResult {
  entity_id: string
  mappings: Array<{ service_line_slug: string; regulation_role: string; relevance_score: number }>
}

async function mapServiceLinesWithClaude(
  entities: Array<{ id: string; name: string; description: string | null; document_type: string | null; source_name: string | null; assigned_domains: string[] }>,
  serviceLines: Array<{ id: string; slug: string; name: string }>,
  logger: { warn: (m: string) => void }
): Promise<MLServiceLineResult[]> {
  const client = new Anthropic()
  const slList = serviceLines.map(sl => `${sl.slug}: ${sl.name}`).join('\n')

  const prompt = `You are mapping healthcare regulatory entities to clinical service lines for Cedar, a compliance platform for independent medical practices.

Context: These entities were not matched by rule-based mapping. Each includes assigned_domains (regulatory domains already classified) as context for your mapping.

Service lines (use exactly these slugs):
${slList}

regulation_role must be one of: prescribing, dispensing, billing, safety, scope_of_practice, general

For each entity, return only service lines with relevance_score >= 0.65.
Note: scores below 0.70 will be flagged for human review — only include if genuinely applicable.

Respond ONLY with a JSON array. No prose, no markdown:
[{"index":0,"mappings":[{"service_line_slug":"hormone_optimization","regulation_role":"prescribing","relevance_score":0.92}]}]

Entities:
${JSON.stringify(entities.map((e, i) => ({
  index: i, id: e.id, name: e.name,
  description: e.description?.slice(0, 300) ?? null,
  document_type: e.document_type, source_name: e.source_name,
  assigned_domains: e.assigned_domains,
})), null, 2)}`

  let response
  try {
    response = await client.messages.create({
      model: MODEL, max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })
  } catch (err) {
    logger.warn(`[service-line-map] Claude API error: ${(err as Error).message}`)
    return []
  }

  await trackCost({
    service: 'claude',
    operation: 'corpus_service_line_map',
    cost_usd: calculateClaudeCost(response.usage.input_tokens, response.usage.output_tokens),
    tokens_in: response.usage.input_tokens,
    tokens_out: response.usage.output_tokens,
    context: { entity_count: entities.length },
  })

  const raw = response.content[0]?.type === 'text' ? response.content[0].text : ''
  let parsed: Array<{ index: number; mappings: Array<{ service_line_slug: string; regulation_role: string; relevance_score: number }> }> = []
  try {
    parsed = JSON.parse(raw.trim())
  } catch {
    logger.warn(`[service-line-map] Claude JSON parse failed. Raw: ${raw.slice(0, 200)}`)
    return []
  }

  const slugSet = new Set(serviceLines.map(sl => sl.slug))
  const validRoles = new Set(['prescribing','dispensing','billing','safety','scope_of_practice','general'])

  return parsed.map(r => ({
    entity_id: entities[r.index]?.id ?? '',
    mappings: (r.mappings ?? []).filter(m =>
      slugSet.has(m.service_line_slug) &&
      validRoles.has(m.regulation_role) &&
      m.relevance_score >= 0.65
    ),
  })).filter(r => r.entity_id && r.mappings.length > 0)
}

export const corpusServiceLineMap = inngest.createFunction(
  {
    id: 'corpus-service-line-map',
    name: 'Corpus Service Line Map — Populate kg_service_line_regulations',
    retries: 1,
    concurrency: { limit: 1 },
    timeouts: { finish: '2h' },
  },
  { event: 'cedar/corpus.service-line-map' },
  async ({ step, logger, runId }) => {

    // Step 1: Load service lines + domain map
    const { serviceLines, domainMap, sourceMap } = await step.run('load-maps', async () => {
      const supabase = createServerClient()
      const [{ data: sls }, { data: domains }, { data: sources }] = await Promise.all([
        supabase.from('kg_service_lines').select('id, slug, name, regulation_domains').eq('is_active', true),
        supabase.from('kg_domains').select('id, slug'),
        supabase.from('sources').select('id, name'),
      ])
      const domainMap: Record<string, string> = {}
      for (const d of domains ?? []) domainMap[d.slug] = d.id
      const sourceMap: Record<string, string> = {}
      for (const s of sources ?? []) sourceMap[s.id] = s.name
      return { serviceLines: sls ?? [], domainMap, sourceMap }
    })

    // ── PASS 1: Rule-based mapping via regulation_domains ──────────────────
    const mappedEntityIds = new Set<string>()
    let ruleRows = 0

    for (const sl of serviceLines) {
      const rowCount = await step.run(`rule-map-${sl.slug}`, async () => {
        const supabase = createServerClient()
        const domainSlugs: string[] = (sl.regulation_domains as string[] | null) ?? []
        if (!domainSlugs.length) return 0

        const domainIds = domainSlugs.map(s => domainMap[s]).filter(Boolean)
        if (!domainIds.length) return 0

        // Protect manual entries
        const { data: existingManual } = await supabase
          .from('kg_service_line_regulations')
          .select('entity_id')
          .eq('service_line_id', sl.id)
          .eq('classified_by', 'manual')
        const manualIds = new Set((existingManual ?? []).map(r => r.entity_id))

        const { data: assignments, error } = await supabase
          .from('kg_entity_domains')
          .select('entity_id, domain_id, relevance_score')
          .in('domain_id', domainIds)
        if (error) throw new Error(`${sl.slug} domain fetch: ${error.message}`)
        if (!assignments?.length) return 0

        // Best score per entity (may match multiple domains)
        const entityBest: Record<string, { score: number; domainId: string }> = {}
        for (const a of assignments) {
          const score = a.relevance_score ?? 0.8
          if (!entityBest[a.entity_id] || score > entityBest[a.entity_id].score) {
            entityBest[a.entity_id] = { score, domainId: a.domain_id }
          }
        }

        // Build rows, skip manual entries
        // Resolve domainId → slug inline using domainMap (invert lookup)
        const domainIdToSlug: Record<string, string> = {}
        for (const [slug, id] of Object.entries(domainMap)) domainIdToSlug[id] = slug

        const rows = Object.entries(entityBest)
          .filter(([entityId]) => !manualIds.has(entityId))
          .map(([entityId, { score, domainId }]) => ({
            service_line_id: sl.id,
            entity_id:       entityId,
            regulation_role: roleForDomain(domainIdToSlug[domainId] ?? ''),
            relevance_score: score,
            classified_by:   'rule:regulation-domains',
            classified_at:   new Date().toISOString(),
          }))

        // Insert in 1000-row chunks
        for (let j = 0; j < rows.length; j += 1000) {
          const chunk = rows.slice(j, j + 1000)
          const { error: upsertErr } = await supabase
            .from('kg_service_line_regulations')
            .upsert(chunk, { onConflict: 'service_line_id,entity_id' })
          if (upsertErr) logger.warn(`[service-line-map] ${sl.slug} chunk ${j} warn: ${upsertErr.message}`)
        }

        for (const id of Object.keys(entityBest)) mappedEntityIds.add(id)
        return rows.length
      })

      ruleRows += rowCount
      logger.info(`[service-line-map] Rule: ${sl.slug} → ${rowCount} rows`)
    }

    logger.info(`[service-line-map] Rule pass done — ${ruleRows} rows, ${mappedEntityIds.size} entities covered`)

    // ── PASS 2: ML for high-relevance entities not yet mapped to any service line ──
    // Find entities with practice relevance >= 0.80 that have no service line mapping
    const unmappedHighRelevance = await step.run('find-unmapped-entities', async () => {
      const supabase = createServerClient()
      // Entities with high practice relevance
      const { data: relevant } = await supabase
        .from('kg_entity_practice_relevance')
        .select('entity_id')
        .gte('relevance_score', 0.80)
      const relevantIds = (relevant ?? []).map(r => r.entity_id)
      if (!relevantIds.length) return []

      // Entities already mapped to at least one service line
      const { data: mapped } = await supabase
        .from('kg_service_line_regulations')
        .select('entity_id')
        .in('entity_id', relevantIds)
      const mappedIdsSet = new Set((mapped ?? []).map(r => r.entity_id))

      return relevantIds.filter(id => !mappedIdsSet.has(id))
    })

    logger.info(`[service-line-map] ${unmappedHighRelevance.length} high-relevance entities without service line mapping → ML pass`)

    let mlRows = 0

    if (unmappedHighRelevance.length > 0) {
      // Build service line lookup for ML prompt
      const slForML = serviceLines.map(sl => ({ id: sl.id, slug: sl.slug, name: sl.name }))
      const slIdFromSlug: Record<string, string> = {}
      for (const sl of serviceLines) slIdFromSlug[sl.slug] = sl.id

      // Build domain ID → slug map for ML context
      const domainIdToSlugSL: Record<string, string> = {}
      for (const [slug, id] of Object.entries(domainMap)) domainIdToSlugSL[id] = slug

      // Fetch entity details + domain classifications as context for Claude
      const ML_FETCH_CHUNK = 500
      const mlEntities: Array<{ id: string; name: string; description: string | null; document_type: string | null; source_name: string | null; assigned_domains: string[] }> = []

      for (let j = 0; j < unmappedHighRelevance.length; j += ML_FETCH_CHUNK) {
        const fetched = await step.run(`ml-fetch-unmapped-${j}`, async () => {
          const supabase = createServerClient()
          const ids = unmappedHighRelevance.slice(j, j + ML_FETCH_CHUNK)

          const [{ data: entities }, { data: domainAssignments }] = await Promise.all([
            supabase.from('kg_entities')
              .select('id, name, description, document_type, source_id')
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
            id: e.id, name: e.name, description: e.description,
            document_type: e.document_type,
            source_name: sourceMap[e.source_id ?? ''] ?? null,
            assigned_domains: (entityDomainIds[e.id] ?? [])
              .map(id => domainIdToSlugSL[id]).filter(Boolean),
          }))
        })
        mlEntities.push(...fetched)
      }

      const mlTotalBatches = Math.ceil(mlEntities.length / ML_BATCH_SIZE)

      for (let k = 0; k < mlTotalBatches; k++) {
        const mlStats = await step.run(`ml-map-batch-${k}`, async () => {
          const supabase = createServerClient()
          const batch = mlEntities.slice(k * ML_BATCH_SIZE, k * ML_BATCH_SIZE + ML_BATCH_SIZE)

          const results = await mapServiceLinesWithClaude(batch, slForML, logger)
          if (!results.length) return 0

          const rows: Array<{
            service_line_id: string; entity_id: string; regulation_role: string
            relevance_score: number; classified_by: string; classified_at: string
          }> = []
          const logRows: Array<{
            entity_id: string; stage: string; confidence: number
            classified_by: string; needs_review: boolean; review_reason: string | null; run_id: string
          }> = []

          for (const r of results) {
            for (const m of r.mappings) {
              const slId = slIdFromSlug[m.service_line_slug]
              if (!slId) continue
              rows.push({
                service_line_id: slId,
                entity_id: r.entity_id,
                regulation_role: m.regulation_role,
                relevance_score: m.relevance_score,
                classified_by: 'claude-sonnet-4-5-20250929',
                classified_at: new Date().toISOString(),
              })
            }
            // needs_review=true if any mapping score is below 0.70
            const minScore = Math.min(...r.mappings.map(m => m.relevance_score))
            logRows.push({
              entity_id: r.entity_id, stage: 'ml', confidence: minScore,
              classified_by: 'claude-sonnet-4-5-20250929',
              needs_review: minScore < 0.70,
              review_reason: minScore < 0.70 ? `ML score ${minScore} below 0.70 threshold` : null,
              run_id: runId ?? 'unknown',
            })
          }

          if (rows.length > 0) {
            const { error: upsertErr } = await supabase
              .from('kg_service_line_regulations')
              .upsert(rows, { onConflict: 'service_line_id,entity_id' })
            if (upsertErr) logger.warn(`[service-line-map] ML batch ${k} upsert warn: ${upsertErr.message}`)
          }
          if (logRows.length > 0) {
            await supabase.from('kg_classification_log').insert(logRows)
          }

          return rows.length
        })

        mlRows += mlStats
        logger.info(`[service-line-map] ML batch ${k + 1}/${mlTotalBatches} — ${mlStats} rows`)
      }
    }

    logger.info(`[service-line-map] Done — rule: ${ruleRows} rows, ML: ${mlRows} rows`)
    return { ruleRows, mlRows, serviceLineCount: serviceLines.length }
  }
)
