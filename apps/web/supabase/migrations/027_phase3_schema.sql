-- Migration: 027_phase3_schema.sql
-- Purpose: Phase 3 — domain-practice-type mapping table, seed data, and practice relevance summary materialized view
-- Tables affected: kg_domain_practice_type_map (create), mv_practice_relevance_summary (materialized view)
-- Special considerations: Security definer function for materialized view refresh; large seed data for domain-practice-type mappings

-- ── 1. kg_domain_practice_type_map ───────────────────────────────────────────
-- Maps domain slugs -> practice type slugs with relevance weights.
-- Drives the rule-based pass in corpus-practice-score.
-- applies_to_all_types = true: one sentinel row means "this domain applies to all 14 practice types."

create table if not exists public.kg_domain_practice_type_map (
  id                   uuid primary key default gen_random_uuid(),
  domain_slug          text not null,
  practice_type_slug   text not null,
  relevance_weight     numeric(4,3) not null default 0.80
    check (relevance_weight between 0 and 1),
  applies_to_all_types boolean not null default false,
  created_at           timestamptz not null default now(),
  unique (domain_slug, practice_type_slug)
);

comment on table public.kg_domain_practice_type_map is 'Maps regulatory domains to practice types with relevance weights for scoring pipeline.';

create index if not exists idx_domain_pt_map_domain
  on public.kg_domain_practice_type_map(domain_slug);
create index if not exists idx_domain_pt_map_all
  on public.kg_domain_practice_type_map(applies_to_all_types) where applies_to_all_types = true;

alter table public.kg_domain_practice_type_map enable row level security;

create policy "domain_pt_map_select_authenticated" on public.kg_domain_practice_type_map
  for select to authenticated using (true);
create policy "domain_pt_map_insert_admin" on public.kg_domain_practice_type_map
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "domain_pt_map_update_admin" on public.kg_domain_practice_type_map
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');
create policy "domain_pt_map_delete_admin" on public.kg_domain_practice_type_map
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── 2. Seed kg_domain_practice_type_map ──────────────────────────────────────

-- Cross-cutting domains (all practice types): use sentinel practice_type_slug
-- The scoring function fans these out to all 14 practice types at runtime.
insert into public.kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight, applies_to_all_types)
values
  ('hipaa',           '_all_types', 0.85, true),
  ('osha',            '_all_types', 0.80, true),
  ('licensing_cred',  '_all_types', 0.85, true),
  ('fraud_abuse',     '_all_types', 0.75, true)
on conflict (domain_slug, practice_type_slug) do nothing;

-- Controlled substances — prescribing practices
insert into public.kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
values
  ('controlled_substances',  'endocrinology',          0.90),
  ('controlled_substances',  'hormone_therapy_clinic', 0.90),
  ('controlled_substances',  'functional_medicine',    0.85),
  ('controlled_substances',  'peptide_therapy',        0.85),
  ('controlled_substances',  'weight_management',      0.80),
  ('controlled_substances',  'telehealth_practice',    0.80),
  ('controlled_substances',  'family_medicine',        0.85),
  ('controlled_substances',  'internal_medicine',      0.85),
  ('controlled_substances',  'compounding_pharmacy',   0.80),
  ('cs_prescribing',         'endocrinology',          0.95),
  ('cs_prescribing',         'hormone_therapy_clinic', 0.95),
  ('cs_prescribing',         'functional_medicine',    0.90),
  ('cs_prescribing',         'telehealth_practice',    0.90),
  ('cs_prescribing',         'weight_management',      0.85),
  ('cs_prescribing',         'family_medicine',        0.90),
  ('cs_prescribing',         'internal_medicine',      0.90),
  ('cs_prescribing',         'compounding_pharmacy',   0.80),
  ('cs_rx_testosterone',     'hormone_therapy_clinic', 0.98),
  ('cs_rx_testosterone',     'endocrinology',          0.98),
  ('cs_rx_testosterone',     'functional_medicine',    0.90),
  ('cs_rx_testosterone',     'regenerative_medicine',  0.85),
  ('cs_rx_testosterone',     'weight_management',      0.82),
  ('cs_rx_stimulants',       'functional_medicine',    0.88),
  ('cs_rx_stimulants',       'family_medicine',        0.88),
  ('cs_rx_stimulants',       'internal_medicine',      0.85),
  ('cs_rx_buprenorphine',    'functional_medicine',    0.85),
  ('cs_rx_buprenorphine',    'internal_medicine',      0.88),
  ('cs_rx_telehealth',       'telehealth_practice',    0.98),
  ('cs_rx_telehealth',       'functional_medicine',    0.88),
  ('cs_rx_telehealth',       'hormone_therapy_clinic', 0.85),
  ('cs_pdmp',                'endocrinology',          0.92),
  ('cs_pdmp',                'hormone_therapy_clinic', 0.92),
  ('cs_pdmp',                'functional_medicine',    0.88),
  ('cs_pdmp',                'telehealth_practice',    0.88),
  ('cs_pdmp',                'family_medicine',        0.88),
  ('cs_pdmp',                'compounding_pharmacy',   0.80),
  ('cs_dea_registration',    'endocrinology',          0.90),
  ('cs_dea_registration',    'hormone_therapy_clinic', 0.90),
  ('cs_dea_registration',    'functional_medicine',    0.88),
  ('cs_dea_registration',    'compounding_pharmacy',   0.88),
  ('cs_dea_registration',    'telehealth_practice',    0.85)
on conflict (domain_slug, practice_type_slug) do nothing;

-- FDA Compounding
insert into public.kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
values
  ('fda_compounding',        'compounding_pharmacy',   0.98),
  ('fda_compounding',        'hormone_therapy_clinic', 0.90),
  ('fda_compounding',        'weight_management',      0.90),
  ('fda_compounding',        'peptide_therapy',        0.90),
  ('fda_compounding',        'iv_therapy',             0.85),
  ('fda_compounding',        'functional_medicine',    0.80),
  ('fda_compounding',        'regenerative_medicine',  0.82),
  ('comp_503a',              'compounding_pharmacy',   0.98),
  ('comp_503a',              'hormone_therapy_clinic', 0.85),
  ('comp_503a',              'functional_medicine',    0.80),
  ('comp_503b',              'compounding_pharmacy',   0.98),
  ('comp_usp_795',           'compounding_pharmacy',   0.98),
  ('comp_usp_797',           'compounding_pharmacy',   0.98),
  ('comp_usp_797',           'iv_therapy',             0.90),
  ('comp_usp_797',           'hormone_therapy_clinic', 0.85),
  ('comp_usp_800',           'compounding_pharmacy',   0.98),
  ('comp_usp_800',           'iv_therapy',             0.88),
  ('comp_bulk_drug',         'compounding_pharmacy',   0.98),
  ('comp_bulk_drug',         'hormone_therapy_clinic', 0.88),
  ('comp_glp1_shortage',     'weight_management',      0.98),
  ('comp_glp1_shortage',     'compounding_pharmacy',   0.95),
  ('comp_glp1_shortage',     'functional_medicine',    0.85),
  ('comp_quality_systems',   'compounding_pharmacy',   0.95)
on conflict (domain_slug, practice_type_slug) do nothing;

-- FDA Peptides
insert into public.kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
values
  ('fda_peptides',              'peptide_therapy',        0.98),
  ('fda_peptides',              'hormone_therapy_clinic', 0.88),
  ('fda_peptides',              'functional_medicine',    0.85),
  ('fda_peptides',              'regenerative_medicine',  0.88),
  ('fda_peptides',              'weight_management',      0.85),
  ('fda_peptides',              'iv_therapy',             0.80),
  ('peptide_regulatory_status', 'peptide_therapy',        0.98),
  ('peptide_bpc157',            'peptide_therapy',        0.98),
  ('peptide_bpc157',            'regenerative_medicine',  0.90),
  ('peptide_ghrh',              'peptide_therapy',        0.98),
  ('peptide_ghrh',              'hormone_therapy_clinic', 0.88),
  ('peptide_nad',               'iv_therapy',             0.95),
  ('peptide_nad',               'functional_medicine',    0.88),
  ('peptide_nad',               'peptide_therapy',        0.92),
  ('peptide_weight_loss',       'weight_management',      0.95),
  ('peptide_weight_loss',       'compounding_pharmacy',   0.88)
on conflict (domain_slug, practice_type_slug) do nothing;

-- FDA general
insert into public.kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
values
  ('fda',                     'compounding_pharmacy',   0.85),
  ('fda',                     'weight_management',      0.80),
  ('fda',                     'peptide_therapy',        0.85),
  ('fda_drug_approval',       'compounding_pharmacy',   0.88),
  ('fda_enforcement',         'compounding_pharmacy',   0.90),
  ('fda_enforcement',         'hormone_therapy_clinic', 0.82),
  ('fda_dietary_supplements', 'functional_medicine',    0.85),
  ('fda_dietary_supplements', 'regenerative_medicine',  0.80)
on conflict (domain_slug, practice_type_slug) do nothing;

-- Medicare/Medicaid
insert into public.kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
values
  ('medicare_medicaid', 'family_medicine',        0.90),
  ('medicare_medicaid', 'internal_medicine',      0.90),
  ('medicare_medicaid', 'functional_medicine',    0.75),
  ('medicare_medicaid', 'endocrinology',          0.85),
  ('cms_billing',       'family_medicine',        0.92),
  ('cms_billing',       'internal_medicine',      0.92),
  ('cms_billing',       'functional_medicine',    0.78),
  ('cms_billing',       'endocrinology',          0.88),
  ('cms_telehealth',    'telehealth_practice',    0.98),
  ('cms_telehealth',    'functional_medicine',    0.85),
  ('cms_telehealth',    'hormone_therapy_clinic', 0.80),
  ('cms_coverage',      'family_medicine',        0.90),
  ('cms_coverage',      'internal_medicine',      0.90),
  ('medicaid_fl',       'family_medicine',        0.88),
  ('medicaid_fl',       'internal_medicine',      0.88)
on conflict (domain_slug, practice_type_slug) do nothing;

-- Licensing specializations
insert into public.kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
values
  ('state_medical_license', 'endocrinology',          0.90),
  ('state_medical_license', 'functional_medicine',    0.90),
  ('state_medical_license', 'hormone_therapy_clinic', 0.88),
  ('state_medical_license', 'family_medicine',        0.90),
  ('state_medical_license', 'internal_medicine',      0.90),
  ('state_medical_license', 'telehealth_practice',    0.88),
  ('state_medical_license', 'med_spa',                0.85),
  ('pharmacy_license',      'compounding_pharmacy',   0.98),
  ('facility_license',      'med_spa',                0.95),
  ('facility_license',      'iv_therapy',             0.90),
  ('facility_license',      'hormone_therapy_clinic', 0.85),
  ('facility_license',      'compounding_pharmacy',   0.90),
  ('scope_of_practice',     'telehealth_practice',    0.92),
  ('scope_of_practice',     'functional_medicine',    0.88),
  ('scope_of_practice',     'hormone_therapy_clinic', 0.85),
  ('fl_medspa_regulation',  'med_spa',                0.98),
  ('fl_medspa_regulation',  'dermatology',            0.92),
  ('fl_hcc_license',        'med_spa',                0.95),
  ('fl_hcc_license',        'hormone_therapy_clinic', 0.90),
  ('fl_hcc_license',        'iv_therapy',             0.90),
  ('fl_telehealth_license', 'telehealth_practice',    0.98),
  ('fl_cs_cert',            'endocrinology',          0.90),
  ('fl_cs_cert',            'hormone_therapy_clinic', 0.90),
  ('fl_cs_cert',            'functional_medicine',    0.88)
on conflict (domain_slug, practice_type_slug) do nothing;

-- OSHA specializations (injection/infusion-heavy practices have higher bloodborne exposure)
insert into public.kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
values
  ('osha_bloodborne', 'iv_therapy',             0.95),
  ('osha_bloodborne', 'hormone_therapy_clinic', 0.90),
  ('osha_bloodborne', 'compounding_pharmacy',   0.90),
  ('osha_bloodborne', 'peptide_therapy',        0.88),
  ('osha_hazcom',     'compounding_pharmacy',   0.92),
  ('osha_hazcom',     'iv_therapy',             0.85)
on conflict (domain_slug, practice_type_slug) do nothing;

-- Clinical Standards + Billing
insert into public.kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
values
  ('standard_of_care', 'endocrinology',          0.88),
  ('standard_of_care', 'functional_medicine',    0.85),
  ('standard_of_care', 'hormone_therapy_clinic', 0.85),
  ('infection_control','iv_therapy',             0.92),
  ('infection_control','compounding_pharmacy',   0.90),
  ('lab_requirements', 'functional_medicine',    0.88),
  ('lab_requirements', 'endocrinology',          0.88),
  ('billing_coding',   'family_medicine',        0.88),
  ('billing_coding',   'internal_medicine',      0.88),
  ('billing_coding',   'endocrinology',          0.82),
  ('cash_pay_practices','functional_medicine',   0.92),
  ('cash_pay_practices','hormone_therapy_clinic',0.88),
  ('cash_pay_practices','iv_therapy',            0.85),
  ('cash_pay_practices','med_spa',               0.88),
  ('cash_pay_practices','weight_management',     0.85)
on conflict (domain_slug, practice_type_slug) do nothing;

-- ── 3. mv_practice_relevance_summary ─────────────────────────────────────────
-- Pre-computed per-practice-type regulation counts and relevance distributions.
-- Refreshed after corpus-practice-score completes.
-- Filters at relevance_score >= 0.70 to exclude noise.

create materialized view if not exists public.mv_practice_relevance_summary as
select
  pt.id               as practice_type_id,
  pt.slug             as practice_type_slug,
  pt.display_name,
  pt.is_cedar_target,
  count(distinct epr.entity_id)                                                as total_regulations,
  count(distinct case when epr.relevance_score >= 0.90 then epr.entity_id end) as high_relevance_count,
  count(distinct case when epr.relevance_score >= 0.70
                       and epr.relevance_score <  0.90 then epr.entity_id end) as medium_relevance_count,
  round(avg(epr.relevance_score)::numeric, 3)                                  as avg_relevance_score
from public.kg_practice_types pt
left join public.kg_entity_practice_relevance epr
  on epr.practice_type_id = pt.id
  and epr.relevance_score >= 0.70
group by pt.id, pt.slug, pt.display_name, pt.is_cedar_target;

create unique index if not exists idx_mv_practice_relevance_summary
  on public.mv_practice_relevance_summary(practice_type_id);

-- security definer required: materialized view refresh requires owner privileges
create or replace function public.refresh_practice_relevance_summary()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  refresh materialized view concurrently public.mv_practice_relevance_summary;
end;
$$;
