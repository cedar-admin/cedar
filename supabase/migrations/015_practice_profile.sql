-- Cedar: Add practice profile fields collected during onboarding
ALTER TABLE practices
  ADD COLUMN owner_name    TEXT,
  ADD COLUMN practice_type TEXT
    CHECK (practice_type IN (
      'medical_practice', 'pharmacy', 'dental', 'mental_health',
      'physical_therapy', 'chiropractic', 'optometry', 'other'
    )),
  ADD COLUMN phone TEXT;
