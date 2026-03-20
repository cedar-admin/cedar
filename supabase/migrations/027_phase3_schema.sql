-- ============================================================================
-- Cedar Migration 027: Phase 3 — Domain-Practice-Type Map + Practice Summary View
-- ============================================================================

-- ── 1. kg_domain_practice_type_map ───────────────────────────────────────────
-- Maps domain slugs → practice type slugs with relevance weights.
-- Drives the rule-based pass in corpus-practice-score.
-- applies_to_all_types = true: one sentinel row means "this domain applies to all 14 practice types."

CREATE TABLE IF NOT EXISTS kg_domain_practice_type_map (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_slug          TEXT NOT NULL,
  practice_type_slug   TEXT NOT NULL,
  relevance_weight     NUMERIC(4,3) NOT NULL DEFAULT 0.80
    CHECK (relevance_weight BETWEEN 0 AND 1),
  applies_to_all_types BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (domain_slug, practice_type_slug)
);

CREATE INDEX IF NOT EXISTS idx_domain_pt_map_domain
  ON kg_domain_practice_type_map(domain_slug);
CREATE INDEX IF NOT EXISTS idx_domain_pt_map_all
  ON kg_domain_practice_type_map(applies_to_all_types) WHERE applies_to_all_types = true;

ALTER TABLE kg_domain_practice_type_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "domain_pt_map_read" ON kg_domain_practice_type_map
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "domain_pt_map_admin" ON kg_domain_practice_type_map
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ── 2. Seed kg_domain_practice_type_map ──────────────────────────────────────

-- Cross-cutting domains (all practice types): use sentinel practice_type_slug
-- The scoring function fans these out to all 14 practice types at runtime.
INSERT INTO kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight, applies_to_all_types)
VALUES
  ('hipaa',           '_all_types', 0.85, true),
  ('osha',            '_all_types', 0.80, true),
  ('licensing_cred',  '_all_types', 0.85, true),
  ('fraud_abuse',     '_all_types', 0.75, true)
ON CONFLICT (domain_slug, practice_type_slug) DO NOTHING;

-- Controlled substances — prescribing practices
INSERT INTO kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
VALUES
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
ON CONFLICT (domain_slug, practice_type_slug) DO NOTHING;

-- FDA Compounding
INSERT INTO kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
VALUES
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
ON CONFLICT (domain_slug, practice_type_slug) DO NOTHING;

-- FDA Peptides
INSERT INTO kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
VALUES
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
ON CONFLICT (domain_slug, practice_type_slug) DO NOTHING;

-- FDA general
INSERT INTO kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
VALUES
  ('fda',                     'compounding_pharmacy',   0.85),
  ('fda',                     'weight_management',      0.80),
  ('fda',                     'peptide_therapy',        0.85),
  ('fda_drug_approval',       'compounding_pharmacy',   0.88),
  ('fda_enforcement',         'compounding_pharmacy',   0.90),
  ('fda_enforcement',         'hormone_therapy_clinic', 0.82),
  ('fda_dietary_supplements', 'functional_medicine',    0.85),
  ('fda_dietary_supplements', 'regenerative_medicine',  0.80)
ON CONFLICT (domain_slug, practice_type_slug) DO NOTHING;

-- Medicare/Medicaid
INSERT INTO kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
VALUES
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
ON CONFLICT (domain_slug, practice_type_slug) DO NOTHING;

-- Licensing specializations
INSERT INTO kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
VALUES
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
ON CONFLICT (domain_slug, practice_type_slug) DO NOTHING;

-- OSHA specializations (injection/infusion-heavy practices have higher bloodborne exposure)
INSERT INTO kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
VALUES
  ('osha_bloodborne', 'iv_therapy',             0.95),
  ('osha_bloodborne', 'hormone_therapy_clinic', 0.90),
  ('osha_bloodborne', 'compounding_pharmacy',   0.90),
  ('osha_bloodborne', 'peptide_therapy',        0.88),
  ('osha_hazcom',     'compounding_pharmacy',   0.92),
  ('osha_hazcom',     'iv_therapy',             0.85)
ON CONFLICT (domain_slug, practice_type_slug) DO NOTHING;

-- Clinical Standards + Billing
INSERT INTO kg_domain_practice_type_map (domain_slug, practice_type_slug, relevance_weight)
VALUES
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
ON CONFLICT (domain_slug, practice_type_slug) DO NOTHING;

-- ── 3. mv_practice_relevance_summary ─────────────────────────────────────────
-- Pre-computed per-practice-type regulation counts and relevance distributions.
-- Refreshed after corpus-practice-score completes.
-- Filters at relevance_score >= 0.70 to exclude noise.

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_practice_relevance_summary AS
SELECT
  pt.id               AS practice_type_id,
  pt.slug             AS practice_type_slug,
  pt.display_name,
  pt.is_cedar_target,
  COUNT(DISTINCT epr.entity_id)                                                AS total_regulations,
  COUNT(DISTINCT CASE WHEN epr.relevance_score >= 0.90 THEN epr.entity_id END) AS high_relevance_count,
  COUNT(DISTINCT CASE WHEN epr.relevance_score >= 0.70
                       AND epr.relevance_score <  0.90 THEN epr.entity_id END) AS medium_relevance_count,
  ROUND(AVG(epr.relevance_score)::NUMERIC, 3)                                  AS avg_relevance_score
FROM kg_practice_types pt
LEFT JOIN kg_entity_practice_relevance epr
  ON epr.practice_type_id = pt.id
  AND epr.relevance_score >= 0.70
GROUP BY pt.id, pt.slug, pt.display_name, pt.is_cedar_target;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_practice_relevance_summary
  ON mv_practice_relevance_summary(practice_type_id);

CREATE OR REPLACE FUNCTION refresh_practice_relevance_summary()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_practice_relevance_summary;
END;
$$;
