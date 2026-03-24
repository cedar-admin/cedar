// Core types for the universal classification pipeline.

// Input: a kg_entities row enriched with source metadata.
// The caller (PRP-03 Inngest function) resolves source_id → sourceName
// before calling classify().
export interface ClassificationInput {
  id: string
  name: string
  description: string | null
  entity_type: string
  document_type: string | null
  jurisdiction: string
  source_id: string | null
  sourceName: string | null     // resolved from sources table by caller
  sourceJurisdiction: string | null  // from sources.jurisdiction
  metadata: Record<string, unknown> | null
  agencies: Array<{ name: string; slug?: string; [k: string]: unknown }> | null
  cfr_references: Array<{ title: number; part: number }> | null
  citation: string | null
  identifier: string | null
}

// A single domain assignment
export interface DomainAssignment {
  domainSlug: string
  domainId: string       // UUID from slug→UUID map
  confidence: number
  isPrimary: boolean
  assignedBy: string     // rule name
  ruleId: string         // classification_rules.id
  stage: 'rule' | 'keyword' | 'ml' | 'manual'  // must match kg_classification_log CHECK constraint
  matcherType: 'structural' | 'agency' | 'dataset'  // which matcher produced this — for traceability
}

// Authority level assignment
export interface AuthorityAssignment {
  level: string          // authority_level_enum value (e.g., 'federal_regulation')
  tier: string           // tier label from rule (e.g., 'binding_federal')
  confidence: number
  assignedBy: string     // rule name
  ruleId: string
}

// Complete classification result for one entity
export interface ClassificationResult {
  entityId: string
  filtered: boolean      // true if entity matched zero rules of any type
  domains: DomainAssignment[]
  authority: AuthorityAssignment | null
  domainCodes: string[]  // unique slugs for kg_entities.domain_codes
  stage: 'rule'          // Stage 1 = deterministic rule matching; matches kg_classification_log values
}

// A loaded rule from the database
export interface ClassificationRule {
  id: string
  name: string
  ruleType: 'structural' | 'agency' | 'dataset' | 'authority_level'
  stage: number
  jurisdiction: string
  domainCode: string | null
  secondaryDomainCodes: string[] | null
  ruleConfig: Record<string, unknown>
  confidenceThreshold: number
  priority: number
  aiRefinementNeeded: boolean
  notes: string | null
}

// Source metadata for authority/agency matching
export interface SourceInfo {
  id: string
  name: string
  jurisdiction: string
  fetchMethod: string
}

// Pre-loaded context — loaded once per pipeline run, reused across all entities
export interface ClassificationContext {
  rules: ClassificationRule[]
  allowlist: Set<string>                    // "title:part" keys
  domainMap: Record<string, string>         // slug → UUID
  sourceMap: Record<string, SourceInfo>     // source_id → source metadata
}
