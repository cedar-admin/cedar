export const SAMPLE_HASHES = {
  sha256: 'a1b2c3d4e5f67890abcdef1234567890a1b2c3d4e5f67890abcdef1234567890',
}

export const SAMPLE_COPY = {
  aiSummary:
    'This amendment updates telehealth prescribing requirements for Schedule III–V controlled substances, requiring a prior in-person examination before remote prescribing. Practices offering hormone optimization or weight management via telehealth are directly affected.',
}

export const SAMPLE_DOMAIN = {
  name: 'Board of Medicine',
  slug: 'board-of-medicine',
  description: 'Florida Board of Medicine rules, orders, and disciplinary actions affecting licensed physicians.',
  color: null,
}

export const SAMPLE_FILTER_PILLS = [
  { label: 'All', href: '#', isActive: true },
  { label: 'Critical', href: '#', isActive: false },
  { label: 'High', href: '#', isActive: false },
  { label: 'Medium', href: '#', isActive: false },
]

export const SAMPLE_SOURCE_FILTERS = [
  { label: 'All', href: '#', isActive: true },
  { label: 'Board of Medicine', href: '#', isActive: false },
  { label: 'Board of Pharmacy', href: '#', isActive: false },
  { label: 'DOH', href: '#', isActive: false },
]

export const SAMPLE_REGULATIONS = [
  {
    title: 'Telehealth prescribing requirements updated',
    severity: 'high',
    date: '2026-03-20T14:30:00Z',
    source: 'FL Board of Medicine',
    authority: 'state_board_rule',
  },
  {
    title: 'Compounding pharmacy labeling standards',
    severity: 'medium',
    date: '2026-03-18T09:15:00Z',
    source: 'FL Board of Pharmacy',
    authority: 'state_board_rule',
  },
  {
    title: 'Patient record retention period extended',
    severity: 'low',
    date: '2026-03-15T11:00:00Z',
    source: 'FL Dept of Health',
    authority: 'state_statute',
  },
]

export const SAMPLE_LIBRARY_ROWS = [
  {
    id: 'reg-001',
    title: '64B8-9.009 Standards for Telehealth Prescribing',
    summary: 'Board rule governing telehealth prescribing conditions for licensed physicians.',
    source: 'FL Board of Medicine',
    updatedAt: '2026-03-20T14:30:00Z',
    authorityLevel: 'state_board_rule',
  },
  {
    id: 'reg-002',
    title: '64B16-27.797 Compounding Labeling Requirements',
    summary: 'Board rule governing labeling standards for compounded products.',
    source: 'FL Board of Pharmacy',
    updatedAt: '2026-03-18T09:15:00Z',
    authorityLevel: 'state_board_rule',
  },
]
