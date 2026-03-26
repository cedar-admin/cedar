# Session 8-C: Agency Mapping + openFDA Mapping + Implementation Reference

## Deliverable 1: Agency-to-Domain Mapping Table

| Agency Name (exact Federal Register metadata name) | Primary Domain Code | Secondary Domain Code(s) | Notes |
|---|---|---|---|
| Food and Drug Administration | fda-regulation | compounding, advertising-marketing | Top-level FDA catches general FDA content |
| Food and Drug Administration, Center for Drug Evaluation and Research | fda-regulation.drugs | compounding, controlled-substances | CDER owns drug approval, compounding guidance |
| Food and Drug Administration, Center for Biologics Evaluation and Research | fda-regulation.biologics | clinical-operations | CBER handles HCT/Ps, vaccines, blood products |
| Food and Drug Administration, Center for Devices and Radiological Health | fda-regulation.devices | telehealth.technology, clinical-operations | CDRH handles medical devices, software as medical device |
| Food and Drug Administration, Center for Tobacco Products | N/A | N/A | Skip - no relevance to medical practices |
| Food and Drug Administration, Center for Veterinary Medicine | N/A | N/A | Skip - veterinary only |
| Food and Drug Administration, Office of Regulatory Affairs | fda-regulation.enforcement | fraud-compliance | ORA handles inspections, warning letters |
| Food and Drug Administration, Office of Criminal Investigations | fraud-compliance | fda-regulation.enforcement | OCI handles criminal FDA violations |
| Centers for Medicare & Medicaid Services | medicare-billing | fraud-compliance, telehealth | CMS primary focus is Medicare/Medicaid |
| Office for Civil Rights | hipaa-privacy | clinical-operations | OCR enforces HIPAA |
| Office of the National Coordinator for Health Information Technology | hipaa-privacy.information-blocking | clinical-operations, telehealth.technology | ONC handles info blocking, EHR certification |
| Health Resources and Services Administration | business-operations | clinical-operations | HRSA handles 340B, FTCA, health center programs |
| Substance Abuse and Mental Health Services Administration | controlled-substances | clinical-operations, hipaa-privacy.part-2 | SAMHSA oversees OTPs, Part 2 |
| Office of Inspector General | fraud-compliance | medicare-billing | OIG handles exclusions, CMPs, advisory opinions |
| National Institutes of Health | clinical-operations | fda-regulation.clinical-trials | NIH research requirements |
| Agency for Healthcare Research and Quality | clinical-operations.quality-systems | clinical-operations.patient-safety | AHRQ quality initiatives |
| Drug Enforcement Administration | controlled-substances | telehealth.prescribing, compounding | DEA handles all controlled substance regulation |
| Federal Trade Commission | advertising-marketing.ftc-compliance | hipaa-privacy, business-operations | FTC handles deceptive advertising, data security |
| Occupational Safety and Health Administration | business-operations.osha-compliance | clinical-operations | OSHA workplace safety, bloodborne pathogens |
| Employment and Training Administration | business-operations.employment-law | N/A | DOL wage/hour enforcement |
| Employee Benefits Security Administration | business-operations.employee-benefits | hipaa-privacy | EBSA enforces ERISA, HIPAA for group health plans |
| Environmental Protection Agency | business-operations.waste-management | N/A | EPA handles medical waste, pharmaceutical disposal |
| Internal Revenue Service | business-operations.tax-compliance | business-operations.corporate-structure | IRS handles tax-exempt status, employment tax |
| Department of the Treasury | business-operations.tax-compliance | N/A | Treasury regulations on healthcare tax issues |
| Federal Communications Commission | advertising-marketing.tcpa-compliance | telehealth.technology | FCC handles TCPA, telehealth infrastructure |
| Department of Veterans Affairs | medicare-billing | clinical-operations | VA Community Care Network requirements |
| Department of Defense | medicare-billing | N/A | TRICARE/CHAMPUS regulations |
| Defense Health Agency | medicare-billing | telehealth | DHA manages TRICARE operations |
| Nuclear Regulatory Commission | clinical-operations | business-operations | NRC handles nuclear medicine materials |

## Deliverable 2: openFDA-to-Domain Mapping Table

| openFDA Dataset | Product Category or Filter | Primary Domain Code | Secondary Domain Code(s) | Notes |
|---|---|---|---|---|
| drug/nda | All NDAs | fda-regulation.drugs | compounding.drug-shortages | New drug approvals affect compounding when on shortage |
| drug/anda | Generic drugs | fda-regulation.drugs | compounding.drug-shortages | Generic approvals |
| drug/label | All drug labels | fda-regulation.drugs | advertising-marketing.drug-promotion | Package insert content |
| drug/enforcement | Compounding violations | compounding | fda-regulation.enforcement | Filter on "compounding" in reason_for_recall |
| drug/enforcement | Manufacturing violations | fda-regulation.drugs | fda-regulation.enforcement | Default for non-compounding |
| drug/event | All adverse events | fda-regulation.drugs | clinical-operations.patient-safety | FAERS database |
| drug/drugsfda | All approvals | fda-regulation.drugs | N/A | Historical approval data |
| device/510k | Aesthetic devices | fda-regulation.devices.aesthetic | advertising-marketing | Filter on product_code for aesthetic devices |
| device/510k | General medical devices | fda-regulation.devices | clinical-operations | Default classification |
| device/pma | High-risk devices | fda-regulation.devices | clinical-operations.patient-safety | Class III devices |
| device/classification | All classifications | fda-regulation.devices | N/A | Device classification database |
| device/enforcement | All device recalls | fda-regulation.devices | clinical-operations.patient-safety | Device safety issues |
| device/event | Aesthetic device events | fda-regulation.devices.aesthetic | fraud-compliance | Filter on aesthetic device codes |
| device/event | General device events | fda-regulation.devices | clinical-operations.patient-safety | MAUDE database |
| device/udi | All UDI records | fda-regulation.devices | N/A | Device identification |
| device/registration | All establishments | fda-regulation.devices | state-regulations.facility-permits | Manufacturing establishments |
| other/nsde | Drug codes | fda-regulation.drugs | compounding | National Drug Code directory |
| other/substance | Active ingredients | fda-regulation.drugs | compounding.bulk-substances | UNII substance data |

## Deliverable 3: Implementation Reference

### 3A. Rule Count Summary

| Rule Type | Count | Notes |
|---|---|---|
| CFR mapping rows (Title 21) | 113 | From Session 8-A |
| CFR mapping rows (Title 42) | 62 | From Session 8-A |
| CFR mapping rows (all other titles) | 239 | From Session 8-B (Titles 2, 10, 16, 20, 26, 28, 29, 32, 38, 40, 47, 49) |
| Agency mapping rows | 26 | From this session (excluding N/A agencies) |
| openFDA mapping rows | 18 | From this session |
| **Total rule-based classification rules** | **458** | |

**Estimated coverage:**
- eCFR entities (have explicit CFR references): ~85% coverable by CFR rules
- Federal Register documents (have agency metadata): ~75% coverable by agency rules
- openFDA API entities: ~95% coverable by openFDA rules
- Web scraped content (FDA guidance, state boards): ~25% coverable by rules (requires AI fallback)

### 3B. SQL Seed Data Template

```sql
-- CFR-based rules (Title 21)
INSERT INTO classification_rules (
  source_type, match_field, match_pattern, domain_code, secondary_domain_codes, relevance_score, rule_type, notes
) VALUES 
('ecfr', 'cfr_reference', '21 CFR 1306', 'controlled-substances.prescribing', '["telehealth.prescribing.ryan-haight"]', 1.0, 'structural', 'Core DEA prescribing requirements'),
('ecfr', 'cfr_reference', '21 CFR 211', 'fda-regulation.drugs', '["compounding.503b", "compounding.sterile"]', 1.0, 'structural', 'Drug cGMP - always check 503B applicability'),
('ecfr', 'cfr_reference', '21 CFR 1271', 'fda-regulation.biologics.hct-p', '["clinical-operations.scope-of-practice"]', 1.0, 'structural', '361 HCT/P regulations for regenerative medicine');

-- CFR-based rules (Title 42)
INSERT INTO classification_rules (
  source_type, match_field, match_pattern, domain_code, secondary_domain_codes, relevance_score, rule_type, notes
) VALUES 
('ecfr', 'cfr_reference', '42 CFR 2', 'hipaa-privacy.part-2', '["controlled-substances.mat-prescribing"]', 1.0, 'structural', 'Part 2 SUD confidentiality - more restrictive than HIPAA'),
('ecfr', 'cfr_reference', '42 CFR 493', 'clinical-operations.laboratory', '["state-regulations.facility-permits.clia"]', 1.0, 'structural', 'CLIA requirements for any in-office testing');

-- CFR-based rules (Other titles)
INSERT INTO classification_rules (
  source_type, match_field, match_pattern, domain_code, secondary_domain_codes, relevance_score, rule_type, notes
) VALUES 
('ecfr', 'cfr_reference', '29 CFR 1910.1030', 'business-operations.osha-compliance', NULL, 1.0, 'structural', 'Bloodborne pathogen standard'),
('ecfr', 'cfr_reference', '16 CFR 255', 'advertising-marketing.patient-testimonials', '["hipaa-privacy.privacy-rule"]', 1.0, 'structural', 'FTC endorsement guides');

-- Agency-based rules
INSERT INTO classification_rules (
  source_type, match_field, match_pattern, domain_code, secondary_domain_codes, relevance_score, rule_type, notes
) VALUES 
('federal_register', 'agency_name', 'Drug Enforcement Administration', 'controlled-substances', '["telehealth.prescribing", "compounding"]', 0.9, 'agency', 'DEA content defaults to controlled substances domain'),
('federal_register', 'agency_name', 'Centers for Medicare & Medicaid Services', 'medicare-billing', '["fraud-compliance", "telehealth"]', 0.9, 'agency', 'CMS content primarily Medicare/Medicaid');

-- openFDA dataset rules
INSERT INTO classification_rules (
  source_type, match_field, match_pattern, domain_code, secondary_domain_codes, relevance_score, rule_type, notes
) VALUES 
('openfda', 'dataset', 'drug/enforcement', 'fda-regulation.enforcement', '["compounding"]', 0.8, 'dataset', 'Check reason_for_recall for compounding-specific violations'),
('openfda', 'dataset', 'device/510k', 'fda-regulation.devices', '["fda-regulation.devices.aesthetic"]', 0.8, 'dataset', 'Filter on product_code for aesthetic device classification');

-- Rule with dynamic cross-classification
INSERT INTO classification_rules (
  source_type, match_field, match_pattern, domain_code, secondary_domain_codes, relevance_score, rule_type, notes
) VALUES 
('ecfr', 'cfr_reference', '42 CFR 410', 'medicare-billing.physician-services', '["telehealth.reimbursement"]', 0.9, 'structural', 'Check section number: 410.78-79 are telehealth-specific');
```

### 3C. Gaps Requiring AI Fallback

| Gap Description | Affected Source Types | Recommended AI Prompt Focus | Priority |
|---|---|---|---|
| Mixed-domain CFR parts that span multiple concepts | eCFR, Federal Register | "Analyze the specific section content to determine if this is primarily about [domain A] or [domain B]" | High |
| FDA guidance documents without CFR citations | Web scraped FDA.gov | "Identify the primary regulatory domain based on: product type mentioned, enforcement area, and intended audience" | High |
| State regulatory content with no federal analog | State board websites | "Map this state regulation to the closest federal domain equivalent, considering scope of practice and licensing requirements" | High |
| DEA policy statements and interpretations | DEA website, Federal Register | "Determine if this DEA content relates to: registration, prescribing, recordkeeping, scheduling, or enforcement" | Medium |
| Cross-domain enforcement actions (warning letters) | openFDA enforcement, FDA.gov | "Identify all domains affected by this enforcement action based on violations cited" | Medium |
| Emerging technology regulations (AI/ML, digital therapeutics) | FDA guidance, Federal Register | "Classify based on primary regulatory pathway: device (SaMD), drug (digital therapeutic), or clinical decision support" | Medium |
| Practice-specific billing guidance | CMS MLN Matters, MACs | "Determine if this billing guidance is specialty-specific or applies broadly to all practice types" | Low |
| Historical enforcement patterns | FDA warning letter archive | "Extract patterns from cited violations to identify primary and secondary domain relevance" | Low |