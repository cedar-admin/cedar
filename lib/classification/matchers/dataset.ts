// Matches entities against dataset rules (openFDA endpoints, CMS datasets, etc.).
// Checks entity.document_type and entity.sourceName against
// rule_config.dataset_endpoint.
//
// This matcher runs for ALL entities. It primarily classifies openFDA
// content today, but the pattern extends to any dataset-oriented source.

import type { ClassificationInput, ClassificationRule, DomainAssignment } from '../types'

export function matchDataset(
  entity: ClassificationInput,
  rules: ClassificationRule[],    // pre-filtered to ruleType='dataset'
  domainMap: Record<string, string>
): DomainAssignment[] {
  const assignments: DomainAssignment[] = []

  // Normalize entity fields for matching
  const docTypeNorm = normalizeEndpoint(entity.document_type ?? '')
  const sourceNameNorm = normalizeEndpoint(entity.sourceName ?? '')

  for (const rule of rules) {
    const endpoint = rule.ruleConfig.dataset_endpoint as string | undefined
    if (!endpoint) continue

    // Normalize endpoint: "drug/enforcement" → "drug_enforcement"
    const endpointNorm = normalizeEndpoint(endpoint)
    if (!endpointNorm) continue

    const matched =
      // document_type match: "DRUG_ENFORCEMENT" matches "drug_enforcement"
      (docTypeNorm && docTypeNorm.includes(endpointNorm)) ||
      (docTypeNorm && endpointNorm.includes(docTypeNorm)) ||
      // sourceName match: "openFDA Drug Enforcement Reports" contains "drug_enforcement"
      (sourceNameNorm && sourceNameNorm.includes(endpointNorm)) ||
      // metadata endpoint marker if set by ingest
      checkMetadataEndpoint(entity.metadata, endpointNorm)

    if (!matched) continue

    const confidence = typeof rule.ruleConfig.confidence === 'number'
      ? rule.ruleConfig.confidence
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
        matcherType: 'dataset',
      })
    }
  }

  return assignments
}

// Normalize a string to a comparable form:
// "drug/enforcement" → "drug_enforcement"
// "DRUG_ENFORCEMENT" → "drug_enforcement"
// "openFDA Drug Enforcement Reports" → "openfda_drug_enforcement_reports"
function normalizeEndpoint(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

// Check entity.metadata for an openfda_endpoint or similar marker
function checkMetadataEndpoint(
  metadata: Record<string, unknown> | null,
  endpointNorm: string
): boolean {
  if (!metadata) return false
  const marker = metadata.openfda_endpoint ?? metadata.dataset_endpoint ?? metadata.endpoint
  if (typeof marker !== 'string') return false
  return normalizeEndpoint(marker).includes(endpointNorm)
}
