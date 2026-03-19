// Rule-based classification of kg_entities → kg_entity_domains + kg_classification_log
// Event: 'cedar/corpus.classify'
// Re-runnable: uses ON CONFLICT DO UPDATE for idempotency
// Processes in batches of 500 to stay within memory limits

import { inngest } from './client'
import { createServerClient } from '../lib/db/client'

const BATCH_SIZE = 500
const CONFIDENCE_THRESHOLD = 0.85

interface EntityRow {
  id: string
  name: string
  description: string | null
  entity_type: string
  document_type: string | null
  source_id: string | null
  metadata: Record<string, unknown> | null
  agencies: Array<{ name: string; slug?: string }> | null
  cfr_references: Array<{ title: number; part: number }> | null
}

interface Rule {
  id: string
  name: string
  domains: string[]   // domain slugs
  relevance: number   // 0–1
  test: (e: EntityRow) => boolean
}

// ── Rule helpers ───────────────────────────────────────────────────────────
function hasCFRPart(e: EntityRow, title: number, part: number): boolean {
  return (e.cfr_references ?? []).some(r => r.title === title && r.part === part)
}
function hasCFRRange(e: EntityRow, title: number, min: number, max: number): boolean {
  return (e.cfr_references ?? []).some(r => r.title === title && r.part >= min && r.part <= max)
}
function matchesKeywords(e: EntityRow, keywords: string[]): boolean {
  const text = `${e.name} ${e.description ?? ''}`.toLowerCase()
  return keywords.some(k => text.includes(k.toLowerCase()))
}
function hasAgency(e: EntityRow, names: string[]): boolean {
  return (e.agencies ?? []).some(a =>
    names.some(n => (a.name ?? '').toLowerCase().includes(n.toLowerCase()))
  )
}

// ── Classification rules ───────────────────────────────────────────────────
// Rule priorities: most specific first (high relevance), broad last (lower relevance)
const RULES: Rule[] = [
  // CFR Title 21 ranges
  { id: 'ecfr-t21-p216',    name: 'eCFR 21 CFR 216 → 503A compounding',
    domains: ['fda_compounding', 'comp_503a'], relevance: 0.95,
    test: e => hasCFRPart(e, 21, 216) },
  { id: 'ecfr-t21-p1300',   name: 'eCFR 21 CFR 1300–1322 → controlled substances',
    domains: ['controlled_substances', 'cs_scheduling', 'cs_dispensing'], relevance: 0.95,
    test: e => hasCFRRange(e, 21, 1300, 1322) },
  { id: 'ecfr-t21-p600',    name: 'eCFR 21 CFR 600–799 → biologics',
    domains: ['fda_biologics'], relevance: 0.90,
    test: e => hasCFRRange(e, 21, 600, 799) },
  { id: 'ecfr-t21-p210',    name: 'eCFR 21 CFR 210–211 → drug manufacturing',
    domains: ['fda', 'fda_drug_approval'], relevance: 0.88,
    test: e => hasCFRRange(e, 21, 210, 211) },
  { id: 'ecfr-t45',         name: 'CFR Title 45 → HIPAA',
    domains: ['hipaa'], relevance: 0.92,
    test: e => hasCFRRange(e, 45, 160, 199) },
  { id: 'ecfr-t42-400',     name: 'CFR Title 42 Part 400+ → Medicare/Medicaid',
    domains: ['medicare_medicaid'], relevance: 0.90,
    test: e => hasCFRRange(e, 42, 400, 999) },
  { id: 'ecfr-t29',         name: 'CFR Title 29 → OSHA',
    domains: ['osha'], relevance: 0.92,
    test: e => hasCFRRange(e, 29, 1900, 1999) },

  // Agency-based
  { id: 'agency-dea',       name: 'Agency: DEA → controlled substances',
    domains: ['controlled_substances'], relevance: 0.90,
    test: e => hasAgency(e, ['Drug Enforcement', 'DEA']) },
  { id: 'agency-cms',       name: 'Agency: CMS → medicare/medicaid',
    domains: ['medicare_medicaid'], relevance: 0.90,
    test: e => hasAgency(e, ['Centers for Medicare', 'Centers for Medicaid', 'CMS']) },
  { id: 'agency-ocr',       name: 'Agency: OCR → HIPAA',
    domains: ['hipaa'], relevance: 0.92,
    test: e => hasAgency(e, ['Office for Civil Rights', 'OCR']) },
  { id: 'agency-osha',      name: 'Agency: OSHA → workplace safety',
    domains: ['osha'], relevance: 0.92,
    test: e => hasAgency(e, ['Occupational Safety', 'OSHA']) },
  { id: 'agency-oig',       name: 'Agency: OIG → fraud & abuse',
    domains: ['fraud_abuse', 'oig_compliance'], relevance: 0.88,
    test: e => hasAgency(e, ['Office of Inspector General', 'OIG']) },

  // Keyword-based (lower specificity, lower relevance)
  { id: 'kw-glp1',          name: 'Keywords: GLP-1 → compounding + weight management',
    domains: ['fda_compounding', 'comp_glp1_shortage'], relevance: 0.95,
    test: e => matchesKeywords(e, ['semaglutide', 'tirzepatide', 'GLP-1', 'Ozempic', 'Mounjaro', 'Wegovy']) },
  { id: 'kw-compounding',   name: 'Keywords: compounding → fda_compounding',
    domains: ['fda_compounding'], relevance: 0.85,
    test: e => matchesKeywords(e, ['compounding', '503A', '503B', 'USP 795', 'USP 797', 'USP 800', 'outsourcing facility']) },
  { id: 'kw-controlled',    name: 'Keywords: controlled substances',
    domains: ['controlled_substances'], relevance: 0.85,
    test: e => matchesKeywords(e, ['schedule II', 'schedule III', 'schedule IV', 'controlled substance', 'PDMP', 'buprenorphine']) },
  { id: 'kw-hipaa',         name: 'Keywords: HIPAA → hipaa',
    domains: ['hipaa'], relevance: 0.90,
    test: e => matchesKeywords(e, ['HIPAA', 'PHI', 'protected health information', 'covered entity', 'business associate', 'ePHI']) },
  { id: 'kw-telehealth',    name: 'Keywords: telehealth',
    domains: ['cms_telehealth', 'cs_rx_telehealth'], relevance: 0.85,
    test: e => matchesKeywords(e, ['telehealth', 'telemedicine', 'remote prescribing', 'Ryan Haight']) },
  { id: 'kw-peptides',      name: 'Keywords: peptides → fda_peptides',
    domains: ['fda_peptides'], relevance: 0.88,
    test: e => matchesKeywords(e, ['BPC-157', 'ipamorelin', 'peptide therapy', 'growth hormone secretagogue', 'NAD+']) },
  { id: 'kw-billing',       name: 'Keywords: billing/coding',
    domains: ['billing_coding'], relevance: 0.78,
    test: e => matchesKeywords(e, ['CPT code', 'ICD-10', 'fee schedule', 'relative value unit', 'prior authorization']) },
  { id: 'kw-fl-board',      name: 'Keywords: FL board → licensing_cred',
    domains: ['licensing_cred', 'state_medical_license'], relevance: 0.88,
    test: e => matchesKeywords(e, ['Board of Medicine', 'Board of Pharmacy', 'Board of Osteopathic', 'MQA', 'medical quality assurance']) },
  { id: 'kw-testosterone',  name: 'Keywords: testosterone prescribing',
    domains: ['controlled_substances', 'cs_rx_testosterone'], relevance: 0.90,
    test: e => matchesKeywords(e, ['testosterone', 'TRT', 'hormone replacement', 'anabolic steroid']) },
  { id: 'doc-enforcement',  name: 'Doc type: enforcement → fraud_abuse',
    domains: ['fraud_abuse'], relevance: 0.75,
    test: e => e.entity_type === 'enforcement_action' || e.document_type === 'RECALL' || e.document_type === 'WARNING_LETTER' },
]

// ── Main function ──────────────────────────────────────────────────────────
export const corpusClassify = inngest.createFunction(
  {
    id: 'corpus-classify',
    name: 'Corpus Classify — Rule-Based Domain Classification',
    retries: 1,
    concurrency: { limit: 1 },
    timeouts: { finish: '1h' },
  },
  { event: 'cedar/corpus.classify' },
  async ({ step, logger, runId }) => {

    // Step 1: Load domain slug → UUID map
    const domainMap = await step.run('load-domain-map', async () => {
      const supabase = createServerClient()
      const { data, error } = await supabase.from('kg_domains').select('id, slug')
      if (error) throw new Error(`Domain load failed: ${error.message}`)
      const map: Record<string, string> = {}
      for (const d of data ?? []) map[d.slug] = d.id
      logger.info(`[corpus-classify] ${Object.keys(map).length} domains loaded`)
      return map
    })

    // Step 2: Count entities
    const totalCount = await step.run('count-entities', async () => {
      const supabase = createServerClient()
      const { count, error } = await supabase
        .from('kg_entities')
        .select('id', { count: 'exact', head: true })
      if (error) throw new Error(`Count failed: ${error.message}`)
      logger.info(`[corpus-classify] ${count} entities to classify`)
      return count ?? 0
    })

    // Step 3: Batch classification
    const totalBatches = Math.ceil(totalCount / BATCH_SIZE)
    let totalClassified = 0
    let totalAssignments = 0

    for (let i = 0; i < totalBatches; i++) {
      const stats = await step.run(`classify-batch-${i}`, async () => {
        const supabase = createServerClient()

        const { data: entities, error } = await supabase
          .from('kg_entities')
          .select('id, name, description, entity_type, document_type, source_id, metadata, agencies, cfr_references')
          .range(i * BATCH_SIZE, i * BATCH_SIZE + BATCH_SIZE - 1)

        if (error) throw new Error(`Batch ${i} fetch failed: ${error.message}`)
        if (!entities?.length) return { classified: 0, assignments: 0 }

        const domainRows: Array<{
          entity_id: string; domain_id: string; relevance_score: number
          confidence: number; classified_by: string; is_primary: boolean; assigned_by: string
        }> = []
        const logRows: Array<{
          entity_id: string; domain_id: string; stage: string; confidence: number
          classified_by: string; needs_review: boolean; review_reason: string | null; run_id: string
        }> = []

        for (const entity of entities as EntityRow[]) {
          let isPrimary = true
          for (const rule of RULES) {
            if (!rule.test(entity)) continue
            for (const domainSlug of rule.domains) {
              const domainId = domainMap[domainSlug]
              if (!domainId) continue
              const needsReview = rule.relevance < CONFIDENCE_THRESHOLD
              domainRows.push({
                entity_id: entity.id, domain_id: domainId,
                relevance_score: rule.relevance, confidence: rule.relevance,
                classified_by: rule.id, is_primary: isPrimary, assigned_by: `rule:${rule.id}`,
              })
              logRows.push({
                entity_id: entity.id, domain_id: domainId, stage: 'rule',
                confidence: rule.relevance, classified_by: rule.id,
                needs_review: needsReview,
                review_reason: needsReview ? `Confidence ${rule.relevance} below threshold ${CONFIDENCE_THRESHOLD}` : null,
                run_id: runId ?? 'unknown',
              })
              isPrimary = false
            }
          }
        }

        if (domainRows.length > 0) {
          const { error: upsertErr } = await supabase
            .from('kg_entity_domains')
            .upsert(domainRows, { onConflict: 'entity_id,domain_id' })
          if (upsertErr) logger.warn(`[corpus-classify] Batch ${i} upsert warn: ${upsertErr.message}`)
        }
        if (logRows.length > 0) {
          const { error: logErr } = await supabase.from('kg_classification_log').insert(logRows)
          if (logErr) logger.warn(`[corpus-classify] Batch ${i} log warn: ${logErr.message}`)
        }

        return { classified: entities.length, assignments: domainRows.length }
      })

      totalClassified += stats.classified
      totalAssignments += stats.assignments
      logger.info(`[corpus-classify] Batch ${i + 1}/${totalBatches} — ${stats.classified} entities, ${stats.assignments} assignments`)
    }

    // Step 4: Refresh materialized view
    await step.run('refresh-facets', async () => {
      const supabase = createServerClient()
      const { error } = await supabase.rpc('refresh_corpus_facets')
      if (error) logger.warn(`[corpus-classify] Facet refresh warn: ${error.message}`)
      else logger.info('[corpus-classify] mv_corpus_facets refreshed')
    })

    logger.info(`[corpus-classify] Done — ${totalClassified} entities, ${totalAssignments} assignments`)
    return { totalClassified, totalAssignments, totalBatches }
  }
)
