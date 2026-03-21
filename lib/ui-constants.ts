// Shared UI constants — single source of truth for severity, status, and tier styling.
// Uses Radix color name strings for the `color` prop on Badge/Button components.

export const SEVERITY_COLOR: Record<string, string> = {
  critical:      'red',
  high:          'orange',
  medium:        'amber',
  low:           'green',
  informational: 'blue',
}

export const SEVERITY_ICON: Record<string, string> = {
  critical:      'ri-error-warning-fill text-[var(--red-9)]',
  high:          'ri-alert-fill text-[var(--orange-9)]',
  medium:        'ri-information-fill text-[var(--amber-9)]',
  low:           'ri-checkbox-circle-fill text-[var(--green-9)]',
  informational: 'ri-information-line text-[var(--blue-9)]',
}

export const SEVERITIES = ['critical', 'high', 'medium', 'low', 'informational'] as const
export type Severity = (typeof SEVERITIES)[number]

export const STATUS_COLOR: Record<string, string> = {
  approved:       'green',
  auto_approved:  'gray',
  pending:        'amber',
  pending_review: 'amber',
  rejected:       'red',
  not_required:   'gray',
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

export const AUTHORITY_LEVEL_COLOR: Record<string, string> = {
  federal_statute:                 'red',
  federal_regulation:              'orange',
  sub_regulatory_guidance:         'amber',
  national_coverage_determination: 'blue',
  local_coverage_determination:    'cyan',
  state_statute:                   'purple',
  state_board_rule:                'indigo',
  professional_standard:           'gray',
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
