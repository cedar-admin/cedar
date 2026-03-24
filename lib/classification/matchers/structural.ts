// Matches entities against structural rules using CFR citations.
// Applies the cfr_allowlist as a gate: only citations present in the
// allowlist are eligible for structural matching.
//
// Returns domain assignments from matched structural rules.
// Returns empty array if entity has no CFR citations or none are in allowlist.
// This is fine — other matchers (agency, dataset) may still match.

import type { ClassificationInput, ClassificationRule, DomainAssignment } from '../types'

export function matchStructural(
  entity: ClassificationInput,
  rules: ClassificationRule[],    // pre-filtered to ruleType='structural'
  allowlist: Set<string>,
  domainMap: Record<string, string>
): DomainAssignment[] {
  // 1. Extract (title, part) pairs from entity
  const citations = extractCitations(entity)
  if (citations.length === 0) return []

  // 2. Filter through allowlist
  const allowedCitations = citations.filter(c => allowlist.has(`${c.title}:${c.part}`))
  if (allowedCitations.length === 0) return []

  const assignments: DomainAssignment[] = []

  // 3. For each surviving (title, part), find matching rules
  for (const citation of allowedCitations) {
    for (const rule of rules) {
      const cfg = rule.ruleConfig
      const ruleTitle = typeof cfg.title === 'number' ? cfg.title : null
      const rulePart = typeof cfg.part === 'number' ? cfg.part : null
      if (ruleTitle === null || rulePart === null) continue
      if (ruleTitle !== citation.title || rulePart !== citation.part) continue

      const confidence = typeof cfg.confidence === 'number' ? cfg.confidence : rule.confidenceThreshold

      // 4. Build DomainAssignment for domain_code + secondary_domain_codes
      const slugs: string[] = []
      if (rule.domainCode) slugs.push(rule.domainCode)
      if (rule.secondaryDomainCodes) slugs.push(...rule.secondaryDomainCodes)

      for (const slug of slugs) {
        const domainId = domainMap[slug]
        if (!domainId) continue
        assignments.push({
          domainSlug: slug,
          domainId,
          confidence,
          isPrimary: false,   // set by engine after deduplication
          assignedBy: rule.name,
          ruleId: rule.id,
          stage: 'rule',
          matcherType: 'structural',
        })
      }
    }
  }

  return assignments
}

// Extract (title, part) pairs from entity using all available fields
function extractCitations(entity: ClassificationInput): Array<{ title: number; part: number }> {
  const found: Array<{ title: number; part: number }> = []
  const seen = new Set<string>()

  function addIfNew(title: number, part: number) {
    const key = `${title}:${part}`
    if (!seen.has(key) && !isNaN(title) && !isNaN(part)) {
      seen.add(key)
      found.push({ title, part })
    }
  }

  // Pattern A: metadata.title_number + metadata.part_number (eCFR entities)
  if (entity.metadata) {
    const titleNum = entity.metadata.title_number
    const partNum = entity.metadata.part_number
    if (typeof titleNum === 'number' && (typeof partNum === 'number' || typeof partNum === 'string')) {
      const part = typeof partNum === 'string' ? parseInt(partNum, 10) : partNum
      addIfNew(titleNum, part)
    }
  }

  // Pattern B: cfr_references array (Federal Register entities)
  if (entity.cfr_references) {
    for (const ref of entity.cfr_references) {
      if (typeof ref.title === 'number' && typeof ref.part === 'number') {
        addIfNew(ref.title, ref.part)
      }
    }
  }

  // Pattern C: parse from citation string as fallback (e.g., "Title 21 CFR Part 1306")
  if (entity.citation) {
    const matches = entity.citation.matchAll(/\b(?:title\s+)?(\d+)\s+cfr\s+(?:part\s+)?(\d+)/gi)
    for (const m of matches) {
      addIfNew(parseInt(m[1], 10), parseInt(m[2], 10))
    }
  }

  return found
}
