-- Migration: 015_practice_profile.sql
-- Purpose: Add practice profile fields (owner_name, practice_type, phone) for onboarding
-- Tables affected: practices
-- Special considerations: None

-- Cedar: Add practice profile fields collected during onboarding
alter table public.practices
  add column owner_name    text,
  add column practice_type text
    check (practice_type in (
      'medical_practice', 'pharmacy', 'dental', 'mental_health',
      'physical_therapy', 'chiropractic', 'optometry', 'other'
    )),
  add column phone text;
