-- ============================================================================
-- Cedar Migration 024: Taxonomy Seed Data
-- ============================================================================

-- ── LEVEL 1: 10 Root Compliance Domains (depth=0) ────────────────────────

INSERT INTO kg_domains (slug, name, description, depth, domain_code, taxonomy_source, sort_order)
VALUES
  ('hipaa',             'HIPAA & Privacy',            'Health Insurance Portability and Accountability Act compliance', 0, 'HIPAA',    'cedar_internal', 10),
  ('medicare_medicaid', 'Medicare & Medicaid',         'CMS program billing, coverage, and fraud prevention requirements', 0, 'CMS',   'cedar_internal', 20),
  ('controlled_substances', 'Controlled Substances',   'DEA scheduling, PDMP, prescribing, dispensing requirements',    0, 'CS',      'cedar_internal', 30),
  ('fda',               'FDA Regulation',              'Food, Drug & Cosmetic Act, 503A/B compounding, labeling',       0, 'FDA',     'cedar_internal', 40),
  ('osha',              'OSHA & Workplace Safety',     'Occupational health, bloodborne pathogens, workplace standards', 0, 'OSHA',   'cedar_internal', 50),
  ('fraud_abuse',       'Fraud & Abuse',               'Anti-Kickback Statute, Stark Law, False Claims Act',            0, 'FR-ABUSE','cedar_internal', 60),
  ('licensing_cred',    'Licensing & Credentialing',   'State medical licensing, DEA registration, board requirements',  0, 'LIC',    'cedar_internal', 70),
  ('clinical_standards','Clinical Standards',          'Clinical practice guidelines, standard of care, accreditation', 0, 'CLIN',   'cedar_internal', 80),
  ('employment',        'Employment & HR',             'Labor law, provider contracts, non-compete, FMLA',              0, 'EMP',     'cedar_internal', 90),
  ('billing_coding',    'Billing & Coding',            'CPT/ICD-10 accuracy, payer rules, NSA, claim submission',       0, 'BILL',   'cedar_internal', 100)
ON CONFLICT (slug) DO NOTHING;

-- ── LEVEL 2: ~55 Regulatory Topics (depth=1) ─────────────────────────────

-- HIPAA L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('hipaa_privacy',         'Privacy Rule',               'PHI use, disclosure, patient rights, minimum necessary',       'HIPAA-PR',  10),
  ('hipaa_security',        'Security Rule',              'Administrative, physical, technical safeguards for ePHI',      'HIPAA-SEC', 20),
  ('hipaa_breach',          'Breach Notification',        'Breach assessment, 60-day notification, HHS reporting',        'HIPAA-BN',  30),
  ('hipaa_transactions',    'Transactions & Code Sets',   'EDI standards, 837/835/270/271, NPI usage requirements',       'HIPAA-TX',  40),
  ('hipaa_enforcement',     'HIPAA Enforcement',          'OCR investigations, civil monetary penalties, CAP',            'HIPAA-ENF', 50)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'hipaa'
ON CONFLICT (slug) DO NOTHING;

-- Medicare/Medicaid L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('cms_billing',           'CMS Billing Requirements',      'Part B billing, place of service, modifiers',               'CMS-BILL',  10),
  ('cms_coverage',          'Coverage & Medical Necessity',  'LCD/NCD, prior authorization, documentation',               'CMS-COV',   20),
  ('cms_fraud_prevention',  'Medicare Fraud Prevention',     'OIG exclusions, ZPIC/RAC audits, enrollment integrity',     'CMS-FRAUD', 30),
  ('cms_telehealth',        'CMS Telehealth Policy',         'Medicare telehealth coverage, originating site, modalities', 'CMS-TH',   40),
  ('cms_quality',           'Quality Reporting',             'MIPS, MACRA, quality measures, value-based care',           'CMS-QR',    50),
  ('medicaid_fl',           'Florida Medicaid',              'FL Medicaid managed care, provider enrollment, billing',    'FL-MCD',    60)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'medicare_medicaid'
ON CONFLICT (slug) DO NOTHING;

-- Controlled Substances L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('cs_dea_registration',   'DEA Registration',             'DEA Form 224, renewal, location-specific requirements',     'CS-DEA',    10),
  ('cs_scheduling',         'Scheduling & Classification',   'Schedule I-V criteria, rescheduling petitions, analogues',  'CS-SCHED',  20),
  ('cs_prescribing',        'Prescribing Requirements',      'Valid prescription, telehealth prescribing, Ryan Haight Act','CS-RX',    30),
  ('cs_dispensing',         'Dispensing & Recordkeeping',    'Inventory, DEA 222 forms, logbooks, theft reporting',       'CS-DISP',   40),
  ('cs_pdmp',               'PDMP Requirements',             'Florida E-FORCSE, mandatory check, reporting timelines',    'CS-PDMP',   50),
  ('cs_disposal',           'Disposal & Destruction',        'DEA take-back, on-site destruction, reverse distributor',  'CS-DISP2',  60)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'controlled_substances'
ON CONFLICT (slug) DO NOTHING;

-- FDA L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('fda_compounding',       'Drug Compounding',              '503A/503B, USP 795/797/800, outsourcing facility rules',   'FDA-COMP',  10),
  ('fda_drug_approval',     'Drug Approval & Labeling',      'NDA/ANDA, off-label use, promotional labeling rules',     'FDA-DRUG',  20),
  ('fda_enforcement',       'FDA Enforcement',               'Warning letters, import alerts, injunctions, recalls',    'FDA-ENF',   30),
  ('fda_biologics',         'Biologics & Biosimilars',       'BLA, biosimilar guidance, cell/gene therapy',             'FDA-BIO',   40),
  ('fda_devices',           'Medical Devices',               '510(k), PMA, device classification, UDI',                 'FDA-DEV',   50),
  ('fda_dietary_supplements','Dietary Supplements',          'DSHEA, structure/function claims, GMP',                   'FDA-SUPP',  60),
  ('fda_peptides',          'Peptides & Novel Therapies',    'BPC-157, ipamorelin, bulk drug list, regulatory status',  'FDA-PEPT',  70)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'fda'
ON CONFLICT (slug) DO NOTHING;

-- OSHA L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('osha_bloodborne',       'Bloodborne Pathogens',          'Exposure control plan, sharps safety, hep B vaccination', 'OSHA-BBP',  10),
  ('osha_hazcom',           'Hazard Communication',          'SDS, chemical labeling, employee training requirements',  'OSHA-HAZ',  20),
  ('osha_respiratory',      'Respiratory Protection',        'N95 fit testing, respirator program, COVID protocols',    'OSHA-RESP', 30),
  ('osha_general_industry', 'General Industry Standards',    'Walking surfaces, electrical safety, fire protection',    'OSHA-GEN',  40)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'osha'
ON CONFLICT (slug) DO NOTHING;

-- Fraud & Abuse L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('aks',                   'Anti-Kickback Statute',         'Safe harbors, referral fees, marketing arrangements',     'FR-AKS',   10),
  ('stark_law',             'Stark Law (Self-Referral)',      'Physician self-referral prohibitions, exceptions',       'FR-STARK',  20),
  ('false_claims',          'False Claims Act',              'Qui tam, overpayment return, 60-day rule, penalties',    'FR-FCA',    30),
  ('oig_compliance',        'OIG Compliance Program',        'Compliance guidance, exclusion screening, OIG hotline',  'FR-OIG',    40),
  ('transparency',          'Sunshine Act & Transparency',   'Open Payments reporting, pharma manufacturer rules',     'FR-TRANS',  50)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'fraud_abuse'
ON CONFLICT (slug) DO NOTHING;

-- Licensing & Credentialing L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('state_medical_license', 'State Medical Licensing',       'FL Board of Medicine, DO board, application, renewal, CE','LIC-MED',   10),
  ('nursing_license',       'Nursing Licensure',             'FL Board of Nursing, APRN protocols, collaborative agree','LIC-NUR',   20),
  ('pharmacy_license',      'Pharmacy Licensure',            'FL Board of Pharmacy, pharmacist-in-charge, permit types','LIC-PHARM', 30),
  ('facility_license',      'Facility Licensure',            'AHCA health care clinic, med spa registration, ASC',     'LIC-FAC',   40),
  ('scope_of_practice',     'Scope of Practice',             'NP/PA supervision, delegation, collaborative practice',  'LIC-SCOPE', 50),
  ('credentialing',         'Insurance Credentialing',       'Provider credentialing, CAQH, payer network enrollment', 'LIC-CRED',  60),
  ('cme_requirements',      'CME & CE Requirements',         'Continuing education hours, board-mandated topics',      'LIC-CME',   70)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'licensing_cred'
ON CONFLICT (slug) DO NOTHING;

-- Clinical Standards L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('standard_of_care',      'Standard of Care',              'Clinical guidelines, evidence-based protocols, liability','CLIN-SOC',  10),
  ('documentation',         'Clinical Documentation',        'Medical record requirements, retention, e-signature',    'CLIN-DOC',  20),
  ('informed_consent',      'Informed Consent',              'FL consent statutes, documentation requirements',        'CLIN-IC',   30),
  ('infection_control',     'Infection Control',             'Sterilization, disinfection, environmental services',    'CLIN-INF',  40),
  ('lab_requirements',      'Lab & Diagnostics',             'CLIA waiver, lab licensing, point-of-care testing',     'CLIN-LAB',  50),
  ('accreditation',         'Accreditation Standards',       'Joint Commission, AAAHC, AAAASF ambulatory surgery',    'CLIN-ACCR', 60)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'clinical_standards'
ON CONFLICT (slug) DO NOTHING;

-- Employment L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('employment_law',        'Employment Law',                'FLSA, ADA, Title VII, FL employment statutes',           'EMP-LAW',   10),
  ('provider_contracts',    'Provider Contracts',            'Employment vs. IC, restrictive covenants',               'EMP-CONT',  20),
  ('noncompete',            'Non-Compete Agreements',        'FL non-compete enforceability, FTC rule developments',   'EMP-NC',    30),
  ('fmla_leave',            'FMLA & Leave Policies',         'Family Medical Leave Act, FL-specific leave laws',       'EMP-FMLA',  40)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'employment'
ON CONFLICT (slug) DO NOTHING;

-- Billing & Coding L2
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 1, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('cpt_coding',            'CPT Coding',                    'Current Procedural Terminology, coding guidelines, updates','BILL-CPT', 10),
  ('icd10_coding',          'ICD-10 Diagnosis Coding',       'Diagnosis coding accuracy, specificity, HCC mapping',    'BILL-ICD',  20),
  ('fee_schedules',         'Fee Schedules',                 'Medicare physician fee schedule, RVU changes, locality',  'BILL-FEE', 30),
  ('prior_auth',            'Prior Authorization',           'Payer PA requirements, electronic PA, appeals process',  'BILL-PA',   40),
  ('no_surprises_act',      'Balance Billing & NSA',         'No Surprises Act, good faith estimates, balance billing ban','BILL-BB',50),
  ('cash_pay_practices',    'Cash-Pay & Concierge',          'DPC, membership fees, fee disclosure, price transparency','BILL-CASH', 60)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'billing_coding'
ON CONFLICT (slug) DO NOTHING;

-- ── LEVEL 3: ~50+ Specific Requirement Areas (depth=2) ───────────────────

-- HIPAA Privacy L3
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 2, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('hipaa_phi_deidentification','PHI De-identification',     'Safe Harbor & Expert Determination methods, test data',  'HIPAA-PR-DEID', 10),
  ('hipaa_minimum_necessary',   'Minimum Necessary Standard','Limiting PHI use to job function requirements',          'HIPAA-PR-MN',   20),
  ('hipaa_business_associates', 'Business Associate Agreements','BAA requirements, subcontractors, BAA templates',     'HIPAA-PR-BAA',  30),
  ('hipaa_patient_rights',      'Patient Rights',            'Access, amendment, accounting of disclosures, HIPAA Right of Access', 'HIPAA-PR-PAT', 40),
  ('hipaa_marketing',           'Marketing & Fundraising',   'Authorization requirements, treatment exception, TPO',  'HIPAA-PR-MKT',  50)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'hipaa_privacy'
ON CONFLICT (slug) DO NOTHING;

-- HIPAA Security L3
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 2, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('hipaa_risk_analysis',   'Risk Analysis & Management',   'Annual risk assessment, risk management plan, documentation','HIPAA-SEC-RA',  10),
  ('hipaa_access_controls', 'Access Controls',              'Unique user ID, emergency access, automatic logoff, encryption','HIPAA-SEC-AC', 20),
  ('hipaa_audit_controls',  'Audit Controls',               'Activity logging, review procedures, incident response',  'HIPAA-SEC-AUD', 30),
  ('hipaa_transmission',    'Transmission Security',        'Encryption in transit, VPN, TLS, email security',         'HIPAA-SEC-TX',  40),
  ('hipaa_workforce',       'Workforce Training & Sanctions','HIPAA training program, sanctions policy, background checks','HIPAA-SEC-WF', 50)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'hipaa_security'
ON CONFLICT (slug) DO NOTHING;

-- FDA Compounding L3
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 2, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('comp_503a',             '503A In-Office Compounding',   'Patient-specific compounding, valid Rx, DQSA requirements', 'FDA-COMP-503A',10),
  ('comp_503b',             '503B Outsourcing Facilities',  'FDA-registered OSFs, bulk drug substances, GMP inspection',  'FDA-COMP-503B',20),
  ('comp_usp_795',          'USP <795> Non-Sterile',        'Non-sterile compounding, BUD dating, personnel qualif.',     'FDA-COMP-795', 30),
  ('comp_usp_797',          'USP <797> Sterile',            'ISO classification, ISO 5/7/8, environmental monitoring',    'FDA-COMP-797', 40),
  ('comp_usp_800',          'USP <800> Hazardous Drugs',    'Hazardous drug handling, containment, C-PEC, engineering',  'FDA-COMP-800', 50),
  ('comp_bulk_drug',        'Bulk Drug Substances (503A)',   'FDA bulk drug list, nominated substances, 503A eligibility','FDA-COMP-BULK',60),
  ('comp_glp1_shortage',    'GLP-1 Compounding',            'Semaglutide/tirzepatide compounding during drug shortage',  'FDA-COMP-GLP1',70),
  ('comp_quality_systems',  'Compounding Quality Systems',  'CGMP equivalents, recall procedures, adverse event reporting','FDA-COMP-QS', 80)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'fda_compounding'
ON CONFLICT (slug) DO NOTHING;

-- Controlled Substances Prescribing L3
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 2, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('cs_rx_testosterone',    'Testosterone Prescribing',     'TRT protocols, lab requirements, age restrictions',         'CS-RX-TEST',  10),
  ('cs_rx_stimulants',      'Stimulant Prescribing',        'Adderall/Ritalin, ADHD diagnosis documentation',            'CS-RX-STIM',  20),
  ('cs_rx_benzodiazepines', 'Benzodiazepine Prescribing',   'Prescribing limits, co-prescribing restrictions, tapering', 'CS-RX-BENZO', 30),
  ('cs_rx_buprenorphine',   'Buprenorphine & MAT',          'MATE Act, waiver-free prescribing, OTP clinic requirements','CS-RX-BUP',   40),
  ('cs_rx_telehealth',      'Telemedicine CS Prescribing',  'Ryan Haight exceptions, DEA special registration',         'CS-RX-TH',    50)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'cs_prescribing'
ON CONFLICT (slug) DO NOTHING;

-- FDA Peptides L3
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 2, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('peptide_regulatory_status','Peptide Regulatory Status', 'Bulk drug list status, biologics vs drugs classification',  'FDA-PEPT-STAT',10),
  ('peptide_bpc157',          'BPC-157 Compliance',         'FDA guidance on BPC-157, research vs therapeutic use',      'FDA-PEPT-BPC', 20),
  ('peptide_ghrh',            'Ipamorelin & GHRH Peptides', 'Growth hormone secretagogues, compounding eligibility',     'FDA-PEPT-GHR', 30),
  ('peptide_nad',             'NAD+ & NAC Therapy',         'NAD+ IV infusion rules, NAC regulatory status changes',     'FDA-PEPT-NAD', 40),
  ('peptide_weight_loss',     'Weight Loss Peptide Therapies','Semaglutide, tirzepatide, liraglutide prescribing context','FDA-PEPT-WL',  50)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'fda_peptides'
ON CONFLICT (slug) DO NOTHING;

-- FL Medical Licensing L3
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 2, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('fl_med_license_app',    'FL Medical License Application','Initial MD/DO license, FCVS, primary source verification', 'LIC-MED-APP',  10),
  ('fl_med_license_renewal','FL License Renewal & CE',       'Biennial renewal, 40-hour CE, online CME tracking',        'LIC-MED-REN',  20),
  ('fl_med_discipline',     'FL Board Disciplinary Actions', 'Complaint process, probable cause, final orders, appeals', 'LIC-MED-DISC', 30),
  ('fl_cs_cert',            'CS Prescribing Certification',  'FL 3-hour CS course requirement, prescribing certificate', 'LIC-MED-CSC',  40),
  ('fl_telehealth_license', 'FL Telehealth Registration',    'Out-of-state provider telehealth registration, FS 456.47', 'LIC-MED-TH',   50)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'state_medical_license'
ON CONFLICT (slug) DO NOTHING;

-- Facility Licensing L3
INSERT INTO kg_domains (slug, name, description, parent_id, depth, domain_code, taxonomy_source, sort_order)
SELECT v.slug, v.name, v.description, kg_domains.id, 2, v.domain_code, 'cedar_internal', v.sort_order
FROM kg_domains,
(VALUES
  ('fl_hcc_license',        'FL Health Care Clinic License', 'AHCA HCC license, medical director requirement, inspection','LIC-FAC-HCC', 10),
  ('fl_medspa_regulation',  'Med Spa Regulation (FL)',       'Laser/IPL, medical director, scope, ownership restrictions','LIC-FAC-SPA', 20),
  ('fl_ambulatory_surgery', 'Ambulatory Surgery Center',     'AHCA ASC license, accreditation, QAPI, adverse reporting', 'LIC-FAC-ASC', 30),
  ('fl_clinic_ownership',   'FL Clinic Ownership Laws',      'Corporate practice of medicine, AMMA, anti-fee-splitting',  'LIC-FAC-OWN', 40)
) AS v(slug, name, description, domain_code, sort_order)
WHERE kg_domains.slug = 'facility_license'
ON CONFLICT (slug) DO NOTHING;

-- ── kg_practice_types seed — NUCC-relevant practices ─────────────────────

INSERT INTO kg_practice_types (nucc_code, slug, grouping, classification, specialization, display_name, is_cedar_target, sort_order)
VALUES
  ('207RE0101X', 'endocrinology',         'Allopathic & Osteopathic Physicians', 'Internal Medicine',  'Endocrinology, Diabetes & Metabolism', 'Endocrinology / Hormone Therapy', true, 10),
  (NULL,         'functional_medicine',   'Allopathic & Osteopathic Physicians', 'Internal Medicine',  'Integrative/Functional Medicine',       'Functional Medicine',             true, 20),
  (NULL,         'hormone_therapy_clinic','Ambulatory Health Care Facilities',   'Clinic/Center',      'Hormone Optimization',                  'Hormone Optimization Clinic',    true, 25),
  (NULL,         'med_spa',               'Ambulatory Health Care Facilities',   'Clinic/Center',      'Medical Aesthetic/Med Spa',             'Medical Spa (Med Spa)',           true, 30),
  (NULL,         'regenerative_medicine', 'Ambulatory Health Care Facilities',   'Clinic/Center',      'Regenerative Medicine',                 'Regenerative Medicine Clinic',   true, 40),
  (NULL,         'weight_management',     'Ambulatory Health Care Facilities',   'Clinic/Center',      'Medical Weight Management',             'Weight Management Clinic',        true, 50),
  (NULL,         'telehealth_practice',   'Ambulatory Health Care Facilities',   'Clinic/Center',      'Telehealth-Only Practice',              'Telehealth / Virtual Care',       true, 60),
  (NULL,         'iv_therapy',            'Ambulatory Health Care Facilities',   'Clinic/Center',      'IV Infusion Therapy',                   'IV Therapy Clinic',              true, 70),
  (NULL,         'peptide_therapy',       'Ambulatory Health Care Facilities',   'Clinic/Center',      'Peptide Therapy',                       'Peptide Therapy Clinic',         true, 80),
  ('333600000X', 'compounding_pharmacy',  'Pharmacy Service Providers',          'Pharmacy',           'Compounding Pharmacy',                  'Compounding Pharmacy (503A/B)',   true, 90),
  ('207N00000X', 'dermatology',           'Allopathic & Osteopathic Physicians', 'Dermatology',        NULL,                                    'Dermatology / Cosmetic',         true, 100),
  ('207Q00000X', 'family_medicine',       'Allopathic & Osteopathic Physicians', 'Family Medicine',    NULL,                                    'Family Medicine',                false, 110),
  ('207R00000X', 'internal_medicine',     'Allopathic & Osteopathic Physicians', 'Internal Medicine',  NULL,                                    'Internal Medicine',              false, 120),
  ('101200000X', 'chiropractor',          'Chiropractic Providers',              'Chiropractor',       NULL,                                    'Chiropractic',                   false, 130)
ON CONFLICT (slug) DO NOTHING;

-- ── kg_service_lines seed — clinical workflows ────────────────────────────

INSERT INTO kg_service_lines (slug, name, description, regulation_domains, is_cedar_target, sort_order)
VALUES
  ('hormone_optimization',  'Hormone Optimization',         'TRT, HRT, thyroid, adrenal hormone therapy',
    ARRAY['controlled_substances', 'cs_prescribing', 'cs_rx_testosterone', 'licensing_cred'], true, 10),
  ('compounding_services',  'Compounding Services',         '503A patient-specific compounding, sterile/non-sterile',
    ARRAY['fda_compounding', 'comp_503a', 'comp_usp_795', 'comp_usp_797', 'comp_usp_800'], true, 20),
  ('weight_management',     'Medical Weight Management',    'GLP-1 therapy, metabolic panels, lifestyle counseling',
    ARRAY['fda_compounding', 'comp_glp1_shortage', 'cms_billing'], true, 30),
  ('peptide_therapy',       'Peptide Therapy',              'Peptide injection protocols, research compounds, ipamorelin',
    ARRAY['fda_peptides', 'fda_compounding', 'controlled_substances'], true, 40),
  ('iv_infusion_therapy',   'IV Infusion Therapy',          'NAD+, vitamin C, glutathione, hydration infusions',
    ARRAY['clinical_standards', 'facility_license', 'billing_coding'], true, 50),
  ('aesthetic_services',    'Aesthetic & Med Spa',          'Botox, fillers, laser, body contouring, skin care',
    ARRAY['facility_license', 'fl_medspa_regulation', 'licensing_cred'], true, 60),
  ('telehealth_services',   'Telehealth / Virtual Care',    'Virtual consults, remote prescribing, multi-state care',
    ARRAY['cs_rx_telehealth', 'cms_telehealth', 'hipaa_security'], true, 70),
  ('preventive_wellness',   'Preventive & Functional Medicine','Functional labs, root cause protocols, longevity medicine',
    ARRAY['clinical_standards', 'billing_coding', 'cms_billing'], true, 80),
  ('mental_health_services','Mental Health Services',        'Psychiatry, therapy, medication management, ketamine',
    ARRAY['hipaa_privacy', 'cms_telehealth', 'licensing_cred'], false, 90),
  ('primary_care',          'Primary Care',                  'General primary care, acute visits, chronic disease',
    ARRAY['cms_billing', 'cms_coverage', 'clinical_standards'], false, 100)
ON CONFLICT (slug) DO NOTHING;
