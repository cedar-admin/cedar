// Load everything the engine needs into a ClassificationContext.
// Called ONCE per pipeline run, then passed to classify() for each entity.

import { createServerClient } from '../db/client'
import type { ClassificationRule, ClassificationContext, SourceInfo } from './types'

export async function loadClassificationContext(
  jurisdiction: string = 'federal'
): Promise<ClassificationContext> {
  const supabase = createServerClient()

  const [rules, allowlist, domainMap, sourceMap] = await Promise.all([
    loadRules(supabase, jurisdiction),
    loadAllowlist(supabase),
    loadDomainMap(supabase),
    loadSourceMap(supabase),
  ])

  return { rules, allowlist, domainMap, sourceMap }
}

type SupabaseClient = ReturnType<typeof createServerClient>

// Load all active rules for this jurisdiction.
// Federal rules always apply regardless of jurisdiction parameter.
// When jurisdiction='FL', load both federal and FL rules.
async function loadRules(
  supabase: SupabaseClient,
  jurisdiction: string
): Promise<ClassificationRule[]> {
  const { data, error } = await supabase
    .from('classification_rules')
    .select(
      'id, name, rule_type, stage, jurisdiction, domain_code, secondary_domain_codes, rule_config, confidence_threshold, priority, ai_refinement_needed, notes'
    )
    .eq('is_active', true)
    .or(`jurisdiction.eq.federal,jurisdiction.eq.${jurisdiction}`)
    .order('priority', { ascending: true })

  if (error) throw new Error(`Classification rules load failed: ${error.message}`)

  return (data ?? []).map(r => ({
    id: r.id,
    name: r.name,
    ruleType: r.rule_type as ClassificationRule['ruleType'],
    stage: r.stage,
    jurisdiction: r.jurisdiction,
    domainCode: r.domain_code ?? null,
    secondaryDomainCodes: r.secondary_domain_codes ?? null,
    ruleConfig: (r.rule_config as Record<string, unknown>) ?? {},
    confidenceThreshold: Number(r.confidence_threshold),
    priority: r.priority,
    aiRefinementNeeded: r.ai_refinement_needed,
    notes: r.notes ?? null,
  }))
}

// Build allowlist: Set<"title:part">
async function loadAllowlist(supabase: SupabaseClient): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('cfr_allowlist')
    .select('title_number, part_number')

  if (error) throw new Error(`CFR allowlist load failed: ${error.message}`)

  return new Set((data ?? []).map(r => `${r.title_number}:${r.part_number}`))
}

// Build domain slug → UUID map
async function loadDomainMap(supabase: SupabaseClient): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('kg_domains')
    .select('id, slug')

  if (error) throw new Error(`Domain map load failed: ${error.message}`)

  const map: Record<string, string> = {}
  for (const d of data ?? []) map[d.slug] = d.id
  return map
}

// Build source_id → source metadata map
async function loadSourceMap(supabase: SupabaseClient): Promise<Record<string, SourceInfo>> {
  const { data, error } = await supabase
    .from('sources')
    .select('id, name, jurisdiction, fetch_method')
    .eq('is_active', true)

  if (error) throw new Error(`Source map load failed: ${error.message}`)

  const map: Record<string, SourceInfo> = {}
  for (const s of data ?? []) {
    map[s.id] = {
      id: s.id,
      name: s.name,
      jurisdiction: s.jurisdiction,
      fetchMethod: s.fetch_method,
    }
  }
  return map
}
