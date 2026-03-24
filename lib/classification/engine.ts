// Main entry point for classification.
// Runs ALL matchers against the entity, deduplicates, assigns authority.
//
// PURE FUNCTION — all data comes via parameters. No DB calls, no side effects.

import type {
  ClassificationInput,
  ClassificationResult,
  ClassificationContext,
  DomainAssignment,
} from './types'
import { matchStructural } from './matchers/structural'
import { matchAgency } from './matchers/agency'
import { matchDataset } from './matchers/dataset'
import { assignAuthority } from './authority'

export function classify(
  entity: ClassificationInput,
  context: ClassificationContext
): ClassificationResult {
  // 1. PARTITION RULES BY TYPE
  const structuralRules = context.rules.filter(r => r.ruleType === 'structural')
  const agencyRules = context.rules.filter(r => r.ruleType === 'agency')
  const datasetRules = context.rules.filter(r => r.ruleType === 'dataset')
  const authorityRules = context.rules.filter(r => r.ruleType === 'authority_level')

  // 2. RUN ALL MATCHERS — each returns DomainAssignment[]
  //    Structural: gates through allowlist internally
  //    Agency: runs against agencies array + sourceName
  //    Dataset: runs against document_type + sourceName
  const structuralDomains = matchStructural(entity, structuralRules, context.allowlist, context.domainMap)
  const agencyDomains = matchAgency(entity, agencyRules, context.domainMap)
  const datasetDomains = matchDataset(entity, datasetRules, context.domainMap)

  // 3. MERGE + DEDUPLICATE
  //    Combine all assignments. If multiple rules assign the same domain slug,
  //    keep the one with highest confidence.
  //    Mark the first domain as isPrimary=true, rest as false.
  const allDomains = deduplicateDomains([
    ...structuralDomains,
    ...agencyDomains,
    ...datasetDomains,
  ])

  // 4. AUTHORITY LEVEL
  const authority = assignAuthority(entity, authorityRules)

  // 5. ASSEMBLE RESULT
  const domainCodes = [...new Set(allDomains.map(d => d.domainSlug))]

  return {
    entityId: entity.id,
    filtered: allDomains.length === 0 && authority === null,
    domains: allDomains,
    authority,
    domainCodes,
    stage: 'rule',
  }
}

// Deduplicate domain assignments by slug — keep highest confidence per slug.
// First entry overall gets isPrimary=true.
function deduplicateDomains(assignments: DomainAssignment[]): DomainAssignment[] {
  // Group by domainSlug, keep highest confidence per slug
  const bySlug = new Map<string, DomainAssignment>()

  for (const a of assignments) {
    const existing = bySlug.get(a.domainSlug)
    if (!existing || a.confidence > existing.confidence) {
      bySlug.set(a.domainSlug, a)
    }
  }

  // Convert to array, mark isPrimary on first entry
  const result = Array.from(bySlug.values())
  for (let i = 0; i < result.length; i++) {
    result[i] = { ...result[i], isPrimary: i === 0 }
  }

  return result
}

// Re-export context loader and types for convenience
export { loadClassificationContext } from './rules'
export type {
  ClassificationInput,
  ClassificationResult,
  ClassificationContext,
  ClassificationRule,
  DomainAssignment,
  AuthorityAssignment,
  SourceInfo,
} from './types'
