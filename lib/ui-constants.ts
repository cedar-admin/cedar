// Shared UI constants — single source of truth for severity, status, and tier styling.
// Uses Radix CSS variables that auto-swap in dark mode (no dark: prefixes needed).

export const SEVERITY_CLASS: Record<string, string> = {
  critical:      'bg-[var(--red-a3)] text-[var(--red-11)] border-[var(--red-6)]',
  high:          'bg-[var(--orange-a3)] text-[var(--orange-11)] border-[var(--orange-6)]',
  medium:        'bg-[var(--amber-a3)] text-[var(--amber-11)] border-[var(--amber-6)]',
  low:           'bg-[var(--green-a3)] text-[var(--green-11)] border-[var(--green-6)]',
  informational: 'bg-[var(--blue-a3)] text-[var(--blue-11)] border-[var(--blue-6)]',
}

export const SEVERITY_DOT: Record<string, string> = {
  critical:      'bg-[var(--red-9)]',
  high:          'bg-[var(--orange-9)]',
  medium:        'bg-[var(--amber-9)]',
  low:           'bg-[var(--green-9)]',
  informational: 'bg-[var(--blue-9)]',
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

export const STATUS_CLASS: Record<string, string> = {
  approved:       'text-[var(--green-11)] bg-[var(--green-a3)] border-[var(--green-6)]',
  auto_approved:  '',
  pending:        'text-[var(--amber-11)] bg-[var(--amber-a3)] border-[var(--amber-6)]',
  pending_review: 'text-[var(--amber-11)] bg-[var(--amber-a3)] border-[var(--amber-6)]',
  rejected:       'text-[var(--red-11)] bg-[var(--red-a3)] border-[var(--red-6)]',
  not_required:   '',
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
  federal_statute:                'bg-[var(--red-a3)] text-[var(--red-11)] border-[var(--red-6)]',
  federal_regulation:             'bg-[var(--orange-a3)] text-[var(--orange-11)] border-[var(--orange-6)]',
  sub_regulatory_guidance:        'bg-[var(--amber-a3)] text-[var(--amber-11)] border-[var(--amber-6)]',
  national_coverage_determination:'bg-[var(--blue-a3)] text-[var(--blue-11)] border-[var(--blue-6)]',
  local_coverage_determination:   'bg-[var(--cyan-a3)] text-[var(--cyan-11)] border-[var(--cyan-6)]',
  state_statute:                  'bg-[var(--purple-a3)] text-[var(--purple-11)] border-[var(--purple-6)]',
  state_board_rule:               'bg-[var(--indigo-a3)] text-[var(--indigo-11)] border-[var(--indigo-6)]',
  professional_standard:          'bg-[var(--gray-a3)] text-[var(--gray-11)] border-[var(--gray-6)]',
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
