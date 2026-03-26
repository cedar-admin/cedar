// Assigns authority level to an entity by matching authority_level rules.
// Uses source type + document subtype to determine the legal weight
// of the regulatory content.
//
// Returns the authority_level_enum value for kg_entities.authority_level
// plus the tier label for display/sorting.

import type { ClassificationInput, ClassificationRule, AuthorityAssignment } from './types'

// authority_level_enum values (from migration 022)
type AuthorityLevelEnum =
  | 'federal_statute'
  | 'federal_regulation'
  | 'sub_regulatory_guidance'
  | 'national_coverage_determination'
  | 'local_coverage_determination'
  | 'state_statute'
  | 'state_board_rule'
  | 'professional_standard'

// Map (source_type, document_subtype) → authority_level_enum
// Derived from corpus-authority-classify.ts + P3-S4 research
const SOURCE_SUBTYPE_TO_ENUM: Record<string, AuthorityLevelEnum> = {
  'ecfr:codified_regulation':                    'federal_regulation',
  'federal_register:final_rule':                 'federal_regulation',
  'federal_register:interim_final_rule':         'federal_regulation',
  'federal_register:direct_final_rule':          'federal_regulation',
  'federal_register:proposed_rule':              'federal_regulation',
  'federal_register:anprm':                      'sub_regulatory_guidance',
  'federal_register:notice':                     'sub_regulatory_guidance',
  'federal_register:enforcement_report':         'sub_regulatory_guidance',
  'fda:guidance':                                'sub_regulatory_guidance',
  'fda:enforcement_report':                      'sub_regulatory_guidance',
  'fda:enforcement_action':                      'sub_regulatory_guidance',
  'cms:transmittal':                             'sub_regulatory_guidance',
  'cms:mln_matters':                             'sub_regulatory_guidance',
  'cms:notice':                                  'sub_regulatory_guidance',
  'oig:advisory_opinion':                        'sub_regulatory_guidance',
  'oig:compliance_guidance':                     'sub_regulatory_guidance',
  'oig:work_plan':                               'sub_regulatory_guidance',
  'dea:diversion_control':                       'federal_regulation',
  'dea:enforcement_report':                      'federal_regulation',
  'openfda:enforcement_report':                  'sub_regulatory_guidance',
  'openfda:enforcement_action':                  'sub_regulatory_guidance',
  'state_board:final_order':                     'state_board_rule',
  'state_board:meeting_minutes':                 'sub_regulatory_guidance',
  'state_board:rule':                            'state_board_rule',
  'state_legislature:enacted_bill':              'state_statute',
  'state_legislature:pending_bill':              'state_statute',
  'state_admin_register:final_rule':             'state_board_rule',
  'court:injunction':                            'federal_regulation',
  'court:decision':                              'sub_regulatory_guidance',
  'cdc:guideline':                               'professional_standard',
  'uspstf:recommendation':                       'professional_standard',
}

export function assignAuthority(
  entity: ClassificationInput,
  rules: ClassificationRule[]   // pre-filtered to ruleType='authority_level'
): AuthorityAssignment | null {
  // 1. Infer source_type from entity characteristics
  const sourceType = inferSourceType(entity)

  // 2. Infer document_subtype from entity.document_type + entity_type
  const documentSubtype = inferDocumentSubtype(entity)

  // 3. Match rules: find first matching rule (sorted by priority)
  for (const rule of rules) {
    const cfg = rule.ruleConfig
    const ruleSourceType = cfg.source_type as string | undefined
    const ruleDocSubtype = cfg.document_subtype as string | undefined

    if (!ruleSourceType) continue

    const sourceMatches = ruleSourceType === sourceType
    const subtypeMatches = !ruleDocSubtype || ruleDocSubtype === documentSubtype

    if (!sourceMatches || !subtypeMatches) continue

    // Found a matching rule — determine the enum value
    const tier = cfg.authority_level as string | undefined
    const confidence = typeof cfg.confidence === 'number' ? cfg.confidence : rule.confidenceThreshold

    // Look up enum value from our (source_type, document_subtype) map
    const enumKey = `${sourceType}:${documentSubtype}`
    const enumValue: AuthorityLevelEnum =
      SOURCE_SUBTYPE_TO_ENUM[enumKey] ??
      SOURCE_SUBTYPE_TO_ENUM[`${sourceType}:*`] ??
      'sub_regulatory_guidance'

    return {
      level: enumValue,
      tier: tier ?? 'informational',
      confidence,
      assignedBy: rule.name,
      ruleId: rule.id,
    }
  }

  // 4. No rule matched — fall back to heuristic mapping using source/entity metadata
  const enumKey = `${sourceType}:${documentSubtype}`
  const enumValue = SOURCE_SUBTYPE_TO_ENUM[enumKey]
  if (enumValue) {
    return {
      level: enumValue,
      tier: tierFromEnum(enumValue),
      confidence: 0.70,
      assignedBy: 'heuristic:source-doctype',
      ruleId: '',
    }
  }

  return null
}

// Infer Cedar source_type key from entity source name and characteristics
function inferSourceType(entity: ClassificationInput): string {
  const src = (entity.sourceName ?? '').toLowerCase()
  const docType = (entity.document_type ?? '').toLowerCase()
  const entType = (entity.entity_type ?? '').toLowerCase()

  if (src.includes('ecfr') || src.includes('electronic code of federal')) return 'ecfr'
  if (src.includes('federal register') || src.includes('fda federal register')) return 'federal_register'
  if (src.includes('openfda') || (src.includes('drug enforcement') && src.includes('open'))) return 'openfda'
  if (src.includes('dea diversion') || src.includes('diversion control')) return 'dea'
  if (src.includes('fda compounding') || src.includes('compounding guidance')) return 'fda'
  if (
    src.includes('fl board') || src.includes('board of medicine') ||
    src.includes('board of pharmacy') || src.includes('board of osteopathic') ||
    src.includes('mqa') || src.includes('medical quality assurance')
  ) return 'state_board'
  if (src.includes('fl administrative register') || src.includes('florida administrative')) {
    return 'state_admin_register'
  }
  if (src.includes('legislature') || src.includes('session law')) return 'state_legislature'
  if (src.includes('court') || src.includes('district court')) return 'court'
  if (src.includes('cdc') || src.includes('centers for disease control')) return 'cdc'
  if (src.includes('uspstf')) return 'uspstf'
  if (entType === 'enforcement_action' || docType === 'drug_enforcement' || docType === 'device_enforcement') {
    return 'openfda'
  }

  return 'federal_register'  // default for unrecognized federal sources
}

// Infer document_subtype from entity.document_type and entity_type
function inferDocumentSubtype(entity: ClassificationInput): string {
  const docType = (entity.document_type ?? '').toUpperCase()
  const entType = (entity.entity_type ?? '').toLowerCase()

  // Enforcement actions
  if (
    entType === 'enforcement_action' ||
    docType === 'WARNING_LETTER' ||
    docType === 'RECALL' ||
    docType === 'DRUG_ENFORCEMENT' ||
    docType === 'DEVICE_ENFORCEMENT'
  ) return 'enforcement_action'

  // FR document types
  if (docType === 'RULE' || docType === 'FINAL_RULE') return 'final_rule'
  if (docType === 'PROPOSED RULE' || docType === 'PROPOSED_RULE' || docType === 'PRORULE') return 'proposed_rule'
  if (docType === 'NOTICE') return 'notice'
  if (docType === 'ANPRM') return 'anprm'

  // eCFR
  if (docType === 'CFR_PART') return 'codified_regulation'

  // State-specific
  if (docType === 'FINAL_ORDER' || docType === 'ORDER') return 'final_order'
  if (docType === 'MEETING_MINUTES' || docType === 'MINUTES') return 'meeting_minutes'

  // Guidance documents (name-based)
  const name = (entity.name ?? '').toLowerCase()
  if (name.includes('guidance') && !name.includes('rule')) return 'guidance'
  if (name.includes('transmittal')) return 'transmittal'
  if (name.includes('advisory')) return 'notice'
  if (name.includes('mln') || name.includes('matters')) return 'mln_matters'

  // CFR citation in name → codified regulation
  if (/\d+\s+cfr\s+/i.test(entity.name ?? '')) return 'codified_regulation'

  return 'final_rule'  // default federal fallback
}

function tierFromEnum(level: AuthorityLevelEnum): string {
  switch (level) {
    case 'federal_statute':               return 'binding_federal'
    case 'federal_regulation':            return 'binding_federal'
    case 'sub_regulatory_guidance':       return 'influential'
    case 'national_coverage_determination': return 'operational'
    case 'local_coverage_determination':  return 'operational'
    case 'state_statute':                 return 'binding_state'
    case 'state_board_rule':              return 'binding_state'
    case 'professional_standard':         return 'informational'
  }
}
