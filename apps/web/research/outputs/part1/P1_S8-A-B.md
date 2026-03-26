# Title 21 DEA Regulations and Title 42 Public Health Mapping

## Deliverable 1: Title 21 Chapter II (DEA) CFR-to-Domain Mapping

### DEA Regulations (21 CFR Parts 1300-1321)

| CFR Part | Part Title | Primary Domain | Secondary Domain(s) | Relevance Score | Notes |
|---|---|---|---|---|---|
| 21 CFR 1300 | Definitions | controlled-substances | — | High | Core DEA definitions |
| 21 CFR 1301 | Registration of Manufacturers, Distributors, and Dispensers | controlled-substances.registration | controlled-substances.registration.practitioner, controlled-substances.registration.institutional | High | Individual and institutional DEA registration |
| 21 CFR 1302 | Labeling and Packaging Requirements | controlled-substances.dispensing | compounding.503a | Medium | Dispensing container requirements |
| 21 CFR 1303 | Quotas | controlled-substances | — | Low | Manufacturing quotas (not practice-relevant) |
| 21 CFR 1304 | Records and Reports | controlled-substances.recordkeeping | controlled-substances.recordkeeping.inventory, controlled-substances.recordkeeping.receipt-distribution | High | Core recordkeeping requirements |
| 21 CFR 1305 | Orders for Schedule I and II | controlled-substances.recordkeeping.receipt-distribution | controlled-substances.recordkeeping.receipt-distribution.form-222, controlled-substances.recordkeeping.receipt-distribution.csos | High | DEA Form 222 and CSOS |
| 21 CFR 1306 | Prescriptions | controlled-substances.prescribing | controlled-substances.prescribing.documentation, controlled-substances.prescribing.schedule-requirements | High | Core prescribing requirements |
| 21 CFR 1307 | Miscellaneous | controlled-substances.dispensing | controlled-substances.disposal | Medium | Dispensing to researchers, disposal |
| 21 CFR 1308 | Schedules | controlled-substances.scheduling | controlled-substances.scheduling.federal-schedules | High | Schedule I-V listings |
| 21 CFR 1309 | Registration of Manufacturers, Distributors, and Dispensers | controlled-substances.registration | — | Low | Duplicate of 1301 |
| 21 CFR 1310 | Listed Chemicals | controlled-substances | — | Low | Precursor chemicals (not practice-relevant) |
| 21 CFR 1311 | Digital Certificates | controlled-substances.prescribing.epcs | controlled-substances.prescribing.epcs.authentication, controlled-substances.prescribing.epcs.certification | High | EPCS requirements |
| 21 CFR 1312 | Importation and Exportation | controlled-substances | — | Low | Import/export (not practice-relevant) |
| 21 CFR 1313 | Importation and Exportation of List I and List II Chemicals | controlled-substances | — | Low | Chemical import/export (not practice-relevant) |
| 21 CFR 1314 | Retail Sale of Ephedrine Products | controlled-substances | — | Low | OTC pseudoephedrine (limited practice relevance) |
| 21 CFR 1315 | Importation, Exportation, Transshipment | controlled-substances | — | Low | International commerce (not practice-relevant) |
| 21 CFR 1316 | Administrative Functions, Practices, and Procedures | controlled-substances.enforcement | fraud-compliance | Medium | DEA enforcement procedures |
| 21 CFR 1317 | Disposal | controlled-substances.disposal | controlled-substances.disposal.authorized-collection, controlled-substances.disposal.reverse-distributor | High | Disposal regulations |
| 21 CFR 1318 | Controls to Satisfy Security Requirements | controlled-substances.security | controlled-substances.security.physical, controlled-substances.security.employee | High | Physical security requirements |
| 21 CFR 1319 | [Reserved] | — | — | — | — |
| 21 CFR 1320 | [Reserved] | — | — | — | — |
| 21 CFR 1321 | [Reserved] | — | — | — | — |

### Key Subparts within DEA Regulations

#### 21 CFR 1301 Subparts
- **Subpart A** - General: controlled-substances.registration
- **Subpart B** - Persons Required to Register: controlled-substances.registration.practitioner
- **Subpart C** - Application Process: controlled-substances.registration
- **Subpart D** - Security: controlled-substances.security.physical
- **Subpart E** - Records: controlled-substances.recordkeeping
- **Subpart F** - Modification/Termination: controlled-substances.registration.renewal

#### 21 CFR 1306 Subparts
- **Subpart A** - General: controlled-substances.prescribing
- **Subpart B** - Schedule II: controlled-substances.prescribing.schedule-requirements.schedule-ii
- **Subpart C** - Schedule III-V: controlled-substances.prescribing.schedule-requirements.schedule-iii-iv
- **Subpart D** - Filling Prescriptions: controlled-substances.dispensing

## Deliverable 2: Title 42 Public Health CFR-to-Domain Mapping

### Title 42 Chapter I — Public Health Service (Parts 1-99)

| CFR Part | Part Title | Primary Domain | Secondary Domain(s) | Relevance Score | Notes |
|---|---|---|---|---|---|
| 42 CFR 1 | [Reserved] | — | — | — | — |
| 42 CFR 2 | Confidentiality of Substance Use Disorder Records | hipaa-privacy.part-2 | hipaa-privacy.part-2.sud-records, controlled-substances.mat-prescribing | High | **SPECIAL HANDLING** - Part 2 requirements |
| 42 CFR 3 | Patient Safety Organizations | clinical-operations.patient-safety | clinical-operations.quality-systems | Medium | PSO protections |
| 42 CFR 4 | [Reserved] | — | — | — | — |
| 42 CFR 5 | Designation of Health Professional Shortage Areas | medicare-billing | state-regulations.facility-permits | Low | HPSA designations |
| 42 CFR 6-7 | [Reserved] | — | — | — | — |
| 42 CFR 8 | Certification of OTPs and MAT | controlled-substances.otp | controlled-substances.mat-prescribing, controlled-substances.opioid-specific.buprenorphine | High | Opioid treatment programs |
| 42 CFR 9 | [Reserved] | — | — | — | — |
| 42 CFR 10 | 340B Drug Pricing Program | business-operations.finance | medicare-billing | Low | 340B eligibility |
| 42 CFR 11 | Clinical Trials Registration | fda-regulation.clinical-trials | clinical-operations.research | Low | ClinicalTrials.gov |
| 42 CFR 12-49 | [Various public health programs] | — | — | Low | Not practice-relevant |
| 42 CFR 50 | Policies on Research Misconduct | clinical-operations.research | fraud-compliance | Low | Research integrity |
| 42 CFR 51-58 | [Various grant programs] | — | — | Low | Not practice-relevant |
| 42 CFR 59 | Family Planning Grants | clinical-operations | — | Low | Title X compliance |
| 42 CFR 60 | National Practitioner Data Bank | state-regulations.licensure | fraud-compliance.exclusions | High | NPDB reporting |
| 42 CFR 61 | [Reserved] | — | — | — | — |
| 42 CFR 62-69 | [Various fellowship/training programs] | — | — | Low | Not practice-relevant |
| 42 CFR 70 | Interstate Quarantine | — | — | Low | Communicable diseases |
| 42 CFR 71 | Foreign Quarantine | — | — | Low | Not practice-relevant |
| 42 CFR 72 | Interstate Shipment of Etiologic Agents | clinical-operations.laboratory | business-operations.shipping | Low | Lab specimen shipping |
| 42 CFR 73 | Select Agents and Toxins | — | — | Low | Bioterrorism agents |
| 42 CFR 74-92 | [Various grant/administrative sections] | — | — | Low | Not practice-relevant |
| 42 CFR 93 | Health Care Fraud and Abuse | fraud-compliance | fraud-compliance.false-claims | Medium | Whistleblower procedures |
| 42 CFR 94-99 | [Various other sections] | — | — | Low | Not practice-relevant |

### Title 42 Chapter IV — Centers for Medicare & Medicaid Services (Parts 400-600)

| CFR Part | Part Title | Primary Domain | Secondary Domain(s) | Relevance Score | Notes |
|---|---|---|---|---|---|
| 42 CFR 400 | General CMS Provisions | medicare-billing | — | Medium | Medicare definitions |
| 42 CFR 401 | Claims Development | medicare-billing | — | Low | Claims processing |
| 42 CFR 402 | Civil Money Penalties | fraud-compliance | medicare-billing.compliance | High | CMP procedures |
| 42 CFR 403 | Special Programs | medicare-billing | — | Low | Demo programs |
| 42 CFR 404 | [Reserved] | — | — | — | — |
| 42 CFR 405 | Federal Health Insurance | medicare-billing | medicare-billing.appeals | High | Medicare procedures |
| 42 CFR 406-408 | [Medicare eligibility] | medicare-billing | — | Low | Beneficiary eligibility |
| 42 CFR 409 | Hospital Insurance Benefits | medicare-billing.coverage | — | Low | Part A benefits |
| 42 CFR 410 | Supplementary Medical Insurance | medicare-billing.physician-services | medicare-billing.coverage | High | Part B covered services |
| 42 CFR 411 | Exclusions from Coverage | medicare-billing.coverage | fraud-compliance.stark-law | High | Stark Law provisions |
| 42 CFR 412 | Prospective Payment Systems | medicare-billing | — | Low | Hospital PPS |
| 42 CFR 413 | Cost Reports | medicare-billing | — | Low | Cost reporting |
| 42 CFR 414 | Payment for Part B Services | medicare-billing.fee-schedules.mpfs | medicare-billing.quality-programs | High | Physician fee schedule |
| 42 CFR 415 | Services by Residents | medicare-billing.coding.teaching-physician | — | Medium | Teaching physician rules |
| 42 CFR 416 | Ambulatory Surgery Services | medicare-billing | state-regulations.facility-permits | Medium | ASC conditions |
| 42 CFR 417 | HMOs and CMPs | medicare-billing.medicare-advantage | — | Low | MA predecessor |
| 42 CFR 418 | Hospice Care | medicare-billing.coverage | controlled-substances.opioid-specific | Medium | Hospice CoPs |
| 42 CFR 419 | OPPS | medicare-billing | — | Low | Hospital outpatient |
| 42 CFR 420 | Program Integrity | fraud-compliance | medicare-billing.audits | High | PSCs, ZPICs |
| 42 CFR 421 | Medicare Contracting | medicare-billing | — | Low | MACs |
| 42 CFR 422 | Medicare Advantage | medicare-billing.medicare-advantage | medicare-billing.medicare-advantage.prior-auth | High | MA requirements |
| 42 CFR 423 | Medicare Part D | medicare-billing | controlled-substances.prescribing | Medium | Part D drugs |
| 42 CFR 424 | Conditions for Payment | medicare-billing.enrollment | medicare-billing.compliance | High | Enrollment/ordering |
| 42 CFR 425 | Medicare Shared Savings | medicare-billing.quality-programs.apm | — | Medium | ACOs |
| 42 CFR 426-430 | [Various Medicare processes] | medicare-billing | — | Low | Administrative |
| 42 CFR 431-456 | Medicaid Program | medicare-billing | state-regulations | Medium | State Medicaid |
| 42 CFR 457-499 | [CHIP and other programs] | — | — | Low | Not practice-relevant |
| 42 CFR 475-499 | [Various state programs] | — | — | Low | State-administered |
| 42 CFR 482 | Hospital CoPs | clinical-operations | — | Low | Hospital standards |
| 42 CFR 483 | Long Term Care | — | — | Low | Nursing homes |
| 42 CFR 484 | Home Health Services | medicare-billing | — | Low | HHA conditions |
| 42 CFR 485 | Specialized Providers | medicare-billing | clinical-operations | Medium | RHC/FQHC |
| 42 CFR 486 | Portable X-ray | medicare-billing | — | Low | Mobile X-ray |
| 42 CFR 488 | Survey/Certification | state-regulations.facility-permits | — | Low | State survey |
| 42 CFR 489 | Provider Agreements | medicare-billing | medicare-billing.enrollment | Medium | Provider agreements |
| 42 CFR 491 | Rural Health Clinics | medicare-billing | clinical-operations | Medium | RHC certification |
| 42 CFR 493 | Laboratory Requirements | clinical-operations.laboratory | state-regulations.facility-permits.clia | High | **SPECIAL HANDLING** - CLIA |
| 42 CFR 494 | ESRD Facilities | — | — | Low | Dialysis centers |
| 42 CFR 495 | EHR Incentive Programs | medicare-billing.quality-programs | clinical-operations.ehr-systems | Low | Meaningful use (ended) |
| 42 CFR 498 | Appeals | medicare-billing.appeals | — | Medium | Provider appeals |
| 42 CFR 510-512 | CMS Innovation Models | medicare-billing.quality-programs.apm | — | Medium | CMMI models |

### Title 42 Chapter V — Office of Inspector General (Parts 1000-1008)

| CFR Part | Part Title | Primary Domain | Secondary Domain(s) | Relevance Score | Notes |
|---|---|---|---|---|---|
| 42 CFR 1000 | [Reserved] | — | — | — | — |
| 42 CFR 1001 | Program Exclusions | fraud-compliance.exclusions | fraud-compliance.exclusions.mandatory | High | OIG exclusions |
| 42 CFR 1002 | [Reserved] | — | — | — | — |
| 42 CFR 1003 | Civil Money Penalties | fraud-compliance | medicare-billing.compliance | High | CMP authorities |
| 42 CFR 1004 | Kickback Information | fraud-compliance.anti-kickback | fraud-compliance.anti-kickback.advisory-opinions | High | Advisory opinions |
| 42 CFR 1005 | State Fraud Control | fraud-compliance | — | Low | State MCFUs |
| 42 CFR 1006 | Investigational Exclusions | fraud-compliance | — | Low | Research fraud |
| 42 CFR 1007 | Fraud and Abuse Waivers | fraud-compliance | medicare-billing.quality-programs.apm | Medium | APM waivers |
| 42 CFR 1008 | Advisory Opinions | fraud-compliance.anti-kickback.advisory-opinions | fraud-compliance.stark-law | High | OIG advisory opinions |

## Deliverable 3: Special Handling Notes

### 42 CFR Part 2 - Substance Use Disorder Records

**Critical Requirements:**
- More restrictive than HIPAA in most circumstances
- Requires specific patient consent for most disclosures
- Applies to "Part 2 programs" (federally assisted SUD treatment)
- 2024 changes aligned some provisions with HIPAA but maintained heightened protections

**Cross-Domain Triggers:**
- Always triggers: hipaa-privacy.part-2
- If MAT/buprenorphine present: controlled-substances.mat-prescribing
- If OTP mentioned: controlled-substances.otp
- If general SUD treatment: clinical-operations.informed-consent

**Practice Impact:**
- High for: Pain Management (treating SUD patients)
- Medium for: Primary Care (MAT services)
- Low for: Most specialty practices unless providing SUD treatment

### 42 CFR Part 493 - CLIA

**Critical Requirements:**
- Applies to ANY facility performing tests on human specimens
- Includes waived tests (glucose, pregnancy tests, etc.)
- Certificate required before testing begins
- Three levels: Waived, Moderate Complexity, High Complexity

**Cross-Domain Triggers:**
- Primary: clinical-operations.laboratory
- Always check: state-regulations.facility-permits.clia (state agencies often administer)
- If billing Medicare: medicare-billing (requires CLIA for lab billing)
- Quality programs: clinical-operations.quality-systems (proficiency testing)

**Practice Impact:**
- High for: FM, HRT, IM, AA, PC (in-office testing)
- Medium for: WM, PT, IV, RM, PM (occasional testing)
- Low for: MS, TH, CH (minimal testing)

## Deliverable 4: Cross-Domain Classification Triggers

### Title 21 Chapter II (DEA) Triggers

| Source CFR | Target Domain | Trigger Keywords |
|---|---|---|
| 21 CFR 1301 (Registration) | state-regulations.licensure | "state license", "professional license", "revoked", "suspended" |
| 21 CFR 1301 (Registration) | telehealth.licensure | "telemedicine", "remote prescribing", "interstate" |
| 21 CFR 1304 (Records) | compounding.503a | "compounded", "bulk ingredients", "finished dosage" |
| 21 CFR 1306 (Prescriptions) | telehealth.prescribing.ryan-haight | "internet", "online", "telemedicine", "remote" |
| 21 CFR 1306 (Prescriptions) | compounding.503a.patient-specific | "patient-specific", "compounded preparation" |
| 21 CFR 1308 (Schedules) | compounding.503a.practice-specific.hormones | "testosterone", "anabolic steroids" |
| 21 CFR 1311 (EPCS) | clinical-operations.ehr-systems | "electronic health record", "e-prescribing system" |
| 21 CFR 1311 (EPCS) | hipaa-privacy.security-rule | "authentication", "access control", "audit log" |
| 21 CFR 1316 (Enforcement) | fraud-compliance.exclusions | "surrender", "revocation", "debarment" |
| 21 CFR 1317 (Disposal) | business-operations.waste-management | "reverse distributor", "destruction", "DEA-authorized collector" |

### Title 42 Public Health Triggers

| Source CFR | Target Domain | Trigger Keywords |
|---|---|---|
| 42 CFR 2 (Part 2) | controlled-substances.mat-prescribing | "medication-assisted treatment", "MAT", "buprenorphine" |
| 42 CFR 8 (OTP) | hipaa-privacy.part-2 | "confidentiality", "patient records", "disclosure" |
| 42 CFR 60 (NPDB) | fraud-compliance.exclusions | "adverse action", "malpractice", "licensure action" |
| 42 CFR 410 (Part B) | telehealth.reimbursement.medicare | "telehealth", "telecommunications", "remote" |
| 42 CFR 411 (Stark) | business-operations.corporate-structure | "financial relationship", "ownership", "investment" |
| 42 CFR 414 (MPFS) | telehealth.reimbursement | "telehealth services", "facility fee", "originating site" |
| 42 CFR 420 (Program Integrity) | fraud-compliance.audits | "ZPIC", "UPIC", "RAC", "prepayment review" |
| 42 CFR 424 (Enrollment) | state-regulations.licensure | "state licensure", "license verification" |
| 42 CFR 493 (CLIA) | business-operations.corporate-structure | "laboratory director", "ownership", "multiple locations" |
| 42 CFR 1001 (Exclusions) | controlled-substances.enforcement | "controlled substance conviction", "DEA revocation" |

### Cross-Title Integration Points

| Scenario | Title 21 CFR | Title 42 CFR | Integration Point |
|---|---|---|---|
| MAT Prescribing | 1301 (DEA reg), 1306 (prescribing) | Part 8 (OTP cert), Part 2 (confidentiality) | Buprenorphine prescribing in OTP |
| Telemedicine CS | 1306 (prescribing), 1311 (EPCS) | 410 (Part B), 414 (telehealth payment) | Telehealth controlled substance prescribing |
| Provider Exclusion | 1301 (DEA reg), 1316 (enforcement) | 1001 (OIG exclusion), 424 (enrollment) | Excluded provider cannot have DEA |
| Compounding CS | 1304 (records), 1306 (prescriptions) | 493 (CLIA if testing) | Compounded controlled substances |
| Hospice Prescribing | 1306 (prescriptions) | 418 (hospice CoPs) | Controlled substances in hospice |

### Practice-Type Specific Trigger Patterns

**Pain Management:**
- Title 21: Heavy focus on Parts 1301, 1304, 1306, 1311 (all DEA prescribing)
- Title 42: Parts 2 (SUD patients), 8 (OTP referrals), 418 (hospice)
- Integration: Controlled substance prescribing + Part 2 confidentiality

**Compounding Pharmacy:**
- Title 21: Parts 1301 (if DEA), 1304 (CS records), 1306 (CS prescriptions)
- Title 42: Part 493 (if any testing), various Medicare billing parts
- Integration: DEA recordkeeping for compounded controlled substances

**Telehealth:**
- Title 21: Parts 1306 (Ryan Haight), 1311 (EPCS requirements)
- Title 42: Parts 410, 414 (Medicare telehealth), 424 (enrollment across states)
- Integration: Interstate controlled substance prescribing

**Primary Care/DPC:**
- Title 21: Standard DEA prescribing (1301, 1306)
- Title 42: Heavy Medicare (410, 414, 424), Part 493 (CLIA for in-office labs)
- Integration: Full spectrum from controlled substances to Medicare billing