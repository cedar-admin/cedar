# Title 45 HIPAA and Privacy Regulations Mapping

## Complete CFR-to-Domain Mapping Table

| CFR Part | Part Title | Subpart | Subpart Title | Domain Code | Practice Relevance |
|----------|------------|---------|---------------|-------------|-------------------|
| 45 CFR Part 46 | Protection of Human Subjects | A | Basic HHS Policy for Protection of Human Research Subjects | fda-regulation.clinical-trials | Low |
| 45 CFR Part 46 | Protection of Human Subjects | B | Additional Protections for Pregnant Women, Human Fetuses and Neonates | fda-regulation.clinical-trials | Low |
| 45 CFR Part 46 | Protection of Human Subjects | C | Additional Protections for Prisoners | fda-regulation.clinical-trials | Low |
| 45 CFR Part 46 | Protection of Human Subjects | D | Additional Protections for Children | fda-regulation.clinical-trials | Low |
| 45 CFR Part 60 | National Practitioner Data Bank | — | — | fraud-compliance.exclusions | Medium |
| 45 CFR Part 80 | Nondiscrimination Under Programs Receiving Federal Financial Assistance Through the Department of Health and Human Services | — | — | business-operations.civil-rights | Medium |
| 45 CFR Part 84 | Nondiscrimination on the Basis of Handicap | — | — | business-operations.civil-rights | Medium |
| 45 CFR Part 88 | Protecting Statutory Conscience Rights | — | — | clinical-operations.scope-of-practice | Low |
| 45 CFR Part 92 | Nondiscrimination on the Basis of Race, Color, National Origin, Sex, Age, or Disability | — | — | business-operations.civil-rights | Medium |
| 45 CFR Part 102 | Countermeasures Injury Compensation Program | — | — | clinical-operations.patient-safety | Low |
| 45 CFR Part 144 | Requirements Relating to Health Insurance Coverage | — | — | business-operations.insurance | Low |
| 45 CFR Part 146 | Requirements for the Group Health Insurance Market | — | — | business-operations.insurance | Low |
| 45 CFR Part 147 | Health Insurance Reform Requirements | — | — | business-operations.insurance | Low |
| 45 CFR Part 148 | Requirements for the Individual Health Insurance Market | — | — | business-operations.insurance | Low |
| 45 CFR Part 149 | Requirements Related to Surprise Billing | A | General Provisions | medicare-billing.commercial.no-surprises | High |
| 45 CFR Part 149 | Requirements Related to Surprise Billing | B | Independent Dispute Resolution Process | medicare-billing.commercial.idr | Medium |
| 45 CFR Part 149 | Requirements Related to Surprise Billing | E | Transparency Requirements | medicare-billing.commercial.no-surprises | Medium |
| 45 CFR Part 149 | Requirements Related to Surprise Billing | F | Good Faith Estimates | medicare-billing.commercial.self-pay | High |
| 45 CFR Part 150 | CMS Enforcement in Group and Individual Insurance Markets | — | — | business-operations.insurance | Low |
| 45 CFR Part 160 | HIPAA General Administrative Requirements | A | General Provisions | hipaa-privacy.administrative | High |
| 45 CFR Part 160 | HIPAA General Administrative Requirements | B | Preemption of State Law | hipaa-privacy.state-privacy | High |
| 45 CFR Part 160 | HIPAA General Administrative Requirements | C | Compliance and Investigations | hipaa-privacy.enforcement.ocr-process | High |
| 45 CFR Part 160 | HIPAA General Administrative Requirements | D | Imposition of Civil Money Penalties | hipaa-privacy.enforcement.penalties | High |
| 45 CFR Part 160 | HIPAA General Administrative Requirements | E | Procedures for Hearings | hipaa-privacy.enforcement.ocr-process | Medium |
| 45 CFR Part 162 | HIPAA Administrative Simplification | A | General Provisions | hipaa-privacy.administrative | Low |
| 45 CFR Part 162 | HIPAA Administrative Simplification | D | Standard Unique Health Identifier for Health Care Providers | business-operations.credentialing | Low |
| 45 CFR Part 162 | HIPAA Administrative Simplification | F | Standard Unique Health Identifier for Health Plans | business-operations.insurance | Low |
| 45 CFR Part 162 | HIPAA Administrative Simplification | I | Transactions | medicare-billing.compliance | Low |
| 45 CFR Part 162 | HIPAA Administrative Simplification | J | Code Sets | medicare-billing.coding | Low |
| 45 CFR Part 162 | HIPAA Administrative Simplification | K | Health Care Claims or Equivalent Encounter Information | medicare-billing.compliance | Low |
| 45 CFR Part 164 | HIPAA Security and Privacy | A | General Provisions | hipaa-privacy.administrative | High |
| 45 CFR Part 164 | HIPAA Security and Privacy | C | Security Standards | hipaa-privacy.security-rule | High |
| 45 CFR Part 164 | HIPAA Security and Privacy | D | Notification in the Case of Breach | hipaa-privacy.breach-notification | High |
| 45 CFR Part 164 | HIPAA Security and Privacy | E | Privacy of Individually Identifiable Health Information | hipaa-privacy.privacy-rule | High |
| 45 CFR Part 170 | Health Information Technology Standards | — | — | clinical-operations.ehr-systems | Medium |
| 45 CFR Part 171 | Information Blocking | — | — | hipaa-privacy.information-blocking | High |
| 45 CFR Part 180 | Hospital Price Transparency | — | — | business-operations.financial-policies | Low |
| 45 CFR Part 182 | Health Insurance Issuer Price Transparency | — | — | business-operations.financial-policies | Low |
| 45 CFR Part 184 | Pharmacy Benefit Manager Standards | — | — | business-operations.insurance | Low |

## Key HIPAA Subpart Mappings Detail

### 45 CFR Part 164 Subpart C - Security Standards
- **§164.302-304**: Administrative Safeguards → `hipaa-privacy.security-rule.administrative`
- **§164.306**: Security Standards General Rules → `hipaa-privacy.security-rule`
- **§164.308**: Administrative Safeguards → `hipaa-privacy.security-rule.administrative`
- **§164.310**: Physical Safeguards → `hipaa-privacy.security-rule.physical`
- **§164.312**: Technical Safeguards → `hipaa-privacy.security-rule.technical`
- **§164.314**: Organizational Requirements → `hipaa-privacy.business-associates`
- **§164.316**: Policies and Procedures → `hipaa-privacy.security-rule`
- **§164.318**: Compliance Dates → `hipaa-privacy.security-rule`

### 45 CFR Part 164 Subpart D - Breach Notification
- **§164.400-402**: Definitions and Applicability → `hipaa-privacy.breach-notification.definition`
- **§164.404**: Notification to Individuals → `hipaa-privacy.breach-notification.requirements`
- **§164.406**: Notification to Media → `hipaa-privacy.breach-notification.requirements`
- **§164.408**: Notification to Secretary → `hipaa-privacy.breach-notification.requirements`
- **§164.410**: Business Associate Notifications → `hipaa-privacy.business-associates.breach`
- **§164.412**: Law Enforcement Delay → `hipaa-privacy.breach-notification.requirements`
- **§164.414**: Administrative Requirements → `hipaa-privacy.breach-notification`

### 45 CFR Part 164 Subpart E - Privacy Rule
- **§164.500-501**: General, Definitions → `hipaa-privacy.privacy-rule`
- **§164.502**: Uses and Disclosures General → `hipaa-privacy.privacy-rule.uses-disclosures`
- **§164.504**: Organizational Requirements → `hipaa-privacy.business-associates.baa-requirements`
- **§164.506**: Treatment, Payment, Operations → `hipaa-privacy.privacy-rule.uses-disclosures.tpo`
- **§164.508**: Authorization Required → `hipaa-privacy.privacy-rule.uses-disclosures`
- **§164.510**: Opportunity to Agree/Object → `hipaa-privacy.privacy-rule.uses-disclosures`
- **§164.512**: Other Permitted Uses → `hipaa-privacy.privacy-rule.uses-disclosures`
- **§164.514**: Other Requirements → `hipaa-privacy.privacy-rule.uses-disclosures.minimum-necessary`
- **§164.520**: Notice of Privacy Practices → `hipaa-privacy.privacy-rule.npp`
- **§164.522-528**: Individual Rights → `hipaa-privacy.privacy-rule.patient-rights`
- **§164.524**: Access Rights → `hipaa-privacy.privacy-rule.patient-rights.access`
- **§164.526**: Amendment Rights → `hipaa-privacy.privacy-rule.patient-rights`
- **§164.528**: Accounting of Disclosures → `hipaa-privacy.privacy-rule.patient-rights`
- **§164.530**: Administrative Requirements → `hipaa-privacy.privacy-rule`
- **§164.532**: Transition Provisions → `hipaa-privacy.privacy-rule`
- **§164.534**: Compliance Dates → `hipaa-privacy.privacy-rule`

## Practice Relevance Notes

### Universal High Relevance (All Practice Types)
- Parts 160, 164: HIPAA compliance is mandatory for all covered entities
- Part 171: Information blocking affects all practices using certified EHR technology

### Variable Relevance
- Part 149 (No Surprises Act): Higher for practices with non-participating provider status or out-of-network services
- Part 60 (NPDB): Higher for practices with hospital privileges or credentialing needs
- Parts 80, 84, 92 (Civil Rights): Higher for practices accepting federal funding

### Limited Relevance
- Part 46 (Human Subjects Research): Only relevant for practices conducting clinical research
- Part 88 (Conscience Rights): Relevant for specific procedures/services
- Part 102 (CICP): Only relevant during declared countermeasure programs

## Cross-Domain Trigger Patterns

1. **HIPAA Security → Technology**
   - Part 164 Subpart C triggers `telehealth.technology.hipaa-platforms` for telehealth implementations
   - Part 164 Subpart C triggers `clinical-operations.ehr-systems` for EHR security requirements

2. **HIPAA Privacy → Operations**
   - Part 164 Subpart E triggers `advertising-marketing.patient-testimonials` for marketing authorizations
   - Part 164 Subpart E triggers `clinical-operations.recordkeeping` for retention requirements

3. **Information Blocking → Interoperability**
   - Part 171 triggers `clinical-operations.interoperability` for API access requirements
   - Part 171 triggers `hipaa-privacy.privacy-rule.patient-rights.access` for patient data access

4. **No Surprises Act → Billing**
   - Part 149 triggers `business-operations.financial-policies` for good faith estimate processes
   - Part 149 triggers `clinical-operations.informed-consent` for advance notification requirements