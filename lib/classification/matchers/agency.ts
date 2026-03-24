// Matches entities against agency rules.
// Checks entity.agencies array AND entity.sourceName for matches
// against rule_config.agency_slug.
//
// This matcher runs for ALL entities regardless of CFR citations.
// A FL Board of Medicine document with no CFR reference still matches
// agency rules if the source or agency metadata matches.

import type { ClassificationInput, ClassificationRule, DomainAssignment } from '../types'

// Translation layer: Cedar internal slug → patterns to match against entity text.
// Checks entity.agencies[].name, entity.agencies[].slug, and entity.sourceName.
// All comparisons are case-insensitive; any pattern match = hit.
const SLUG_TO_PATTERNS: Record<string, string[]> = {
  fda:        ['food and drug', 'fda'],
  cms:        ['centers for medicare', 'centers for medicaid', 'cms'],
  dea:        ['drug enforcement', 'dea'],
  osha:       ['occupational safety', 'osha'],
  oig:        ['inspector general', 'oig'],
  hhs_ocr:    ['office for civil rights', 'ocr'],
  cdc:        ['centers for disease control', 'cdc'],
  nrc:        ['nuclear regulatory', 'nrc'],
  epa:        ['environmental protection', 'epa'],
  dot_phmsa:  ['pipeline and hazardous', 'phmsa', 'hazardous materials'],
  eeoc:       ['equal employment', 'eeoc'],
  dol_whd:    ['wage and hour', 'whd', 'department of labor'],
  ftc:        ['federal trade', 'ftc'],
  hhs_onc:    ['health information technology', 'onc', 'national coordinator'],
  fcc:        ['federal communications', 'fcc'],
  hrsa:       ['health resources', 'hrsa'],
  samhsa:     ['substance abuse', 'samhsa'],
  cmmi:       ['innovation center', 'cmmi'],
  doj:        ['department of justice', 'doj'],
  irs:        ['internal revenue', 'irs'],
}

export function matchAgency(
  entity: ClassificationInput,
  rules: ClassificationRule[],    // pre-filtered to ruleType='agency'
  domainMap: Record<string, string>
): DomainAssignment[] {
  const assignments: DomainAssignment[] = []

  // Build searchable text corpus for this entity
  const agencyNames = (entity.agencies ?? []).map(a => (a.name ?? '').toLowerCase())
  const agencySlugs = (entity.agencies ?? []).map(a =>
    ((a.slug as string | undefined) ?? '').toLowerCase().replace(/-/g, ' ')
  )
  const sourceName = (entity.sourceName ?? '').toLowerCase()

  for (const rule of rules) {
    const agencySlug = rule.ruleConfig.agency_slug as string | undefined
    if (!agencySlug) continue

    const patterns = SLUG_TO_PATTERNS[agencySlug] ?? [agencySlug.replace(/_/g, ' ')]

    const matched = patterns.some(pattern => {
      const p = pattern.toLowerCase()
      return (
        agencyNames.some(n => n.includes(p)) ||
        agencySlugs.some(s => s.includes(p)) ||
        sourceName.includes(p)
      )
    })

    if (!matched) continue

    const confidence = typeof rule.ruleConfig.a_score === 'number'
      ? rule.ruleConfig.a_score
      : rule.confidenceThreshold

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
        matcherType: 'agency',
      })
    }
  }

  return assignments
}
