export const SAMPLE_HASHES = {
  sha256: 'a1b2c3d4e5f67890abcdef1234567890a1b2c3d4e5f67890abcdef1234567890',
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

export const SAMPLE_REGULATIONS = [
  {
    title: 'Telehealth prescribing requirements updated',
    severity: 'high',
    date: '2026-03-20T14:30:00Z',
    source: 'FL Board of Medicine',
  },
  {
    title: 'Compounding pharmacy labeling standards',
    severity: 'medium',
    date: '2026-03-18T09:15:00Z',
    source: 'FL Board of Pharmacy',
  },
  {
    title: 'Patient record retention period extended',
    severity: 'low',
    date: '2026-03-15T11:00:00Z',
    source: 'FL Dept of Health',
  },
]
