// Shared UI constants — single source of truth for severity, status, and tier styling.
// Import these in any page or component that needs severity/status display.

export const SEVERITY_CLASS: Record<string, string> = {
  critical:      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
  high:          'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800',
  medium:        'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800',
  low:           'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
  informational: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
}

export const SEVERITY_DOT: Record<string, string> = {
  critical:      'bg-red-500',
  high:          'bg-orange-500',
  medium:        'bg-yellow-500',
  low:           'bg-green-500',
  informational: 'bg-blue-500',
}

export const SEVERITY_ICON: Record<string, string> = {
  critical:      'ri-error-warning-fill text-red-500',
  high:          'ri-alert-fill text-orange-500',
  medium:        'ri-information-fill text-yellow-500',
  low:           'ri-checkbox-circle-fill text-green-500',
  informational: 'ri-information-line text-blue-500',
}

export const SEVERITIES = ['critical', 'high', 'medium', 'low', 'informational'] as const
export type Severity = (typeof SEVERITIES)[number]

export const STATUS_CLASS: Record<string, string> = {
  approved:      'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800',
  auto_approved: '',
  pending:       'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800',
  pending_review:'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800',
  rejected:      'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800',
  not_required:  '',
}

export const STATUS_LABEL: Record<string, string> = {
  approved:       'Approved',
  auto_approved:  'Auto-approved',
  pending:        'Pending',
  pending_review: 'Pending Review',
  rejected:       'Rejected',
  not_required:   'Not Required',
}

export const AUTHORITY_LEVEL_LABEL: Record<string, string> = {
  federal_statute:                'Federal Statute',
  federal_regulation:             'Federal Regulation',
  sub_regulatory_guidance:        'Sub-Regulatory Guidance',
  national_coverage_determination:'National Coverage Determination',
  local_coverage_determination:   'Local Coverage Determination',
  state_statute:                  'State Statute',
  state_board_rule:               'State Board Rule',
  professional_standard:          'Professional Standard',
}

export const AUTHORITY_LEVEL_CLASS: Record<string, string> = {
  federal_statute:                'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
  federal_regulation:             'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800',
  sub_regulatory_guidance:        'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800',
  national_coverage_determination:'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
  local_coverage_determination:   'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800',
  state_statute:                  'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800',
  state_board_rule:               'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-800',
  professional_standard:          'bg-muted text-muted-foreground border-border',
}

export const RELATIONSHIP_TYPE_LABEL: Record<string, string> = {
  amends:           'Amends',
  amended_by:       'Amended by',
  supersedes:       'Supersedes',
  superseded_by:    'Superseded by',
  implements:       'Implements',
  interprets:       'Interprets',
  cites:            'Cites',
  cited_by:         'Cited by',
  corrects:         'Corrects',
  part_of:          'Part of',
  has_legal_basis:  'Legal basis',
  conflicts_with:   'Conflicts with',
  related_to:       'Related to',
  delegates_to:     'Delegates to',
  enables:          'Enables',
  restricts:        'Restricts',
}
