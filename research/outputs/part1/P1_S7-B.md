# Cedar Classification Framework — Part 1, Session 7-B of 8
# Remaining Taxonomy: Fraud/Compliance + Operations + Workplace Safety + Employment/Tax Branches (L3–L4)

## L1: Fraud, Compliance & Enforcement (`fraud-compliance`)

### L2: Anti-Kickback (`fraud-compliance.anti-kickback`)

#### L3: Safe Harbors (`fraud-compliance.anti-kickback.safe-harbors`)
- **Description:** Statutory and regulatory exceptions protecting specific payment arrangements from AKS prosecution when all conditions are met. Critical for structuring compliant financial relationships in healthcare.
- **Classification signals:**
  - CFR: 42 CFR § 1001.952
  - Agency: HHS Office of Inspector General (OIG)
  - Keywords: [safe harbor] (Strong), [personal services] (Strong), [space rental] (Strong), [equipment lease] (Strong), [fair market value] (Moderate) — distinguish from Stark FMV, [one year term] (Moderate), [aggregate compensation] (Moderate), [commercially reasonable] (Weak) — context-dependent
  - Statutes: 42 U.S.C. § 1320a-7b(b)(3)
- **Cross-classification triggers:** When "management services agreement" appears → also classify under `business-operations.corporate-structure`; when "EHR donation" appears → also classify under `hipaa-privacy.security-rule`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Functional Medicine | Medium |
  | Hormone Optimization/HRT | Medium |
  | Compounding Pharmacy | Medium |
  | Med Spa/Aesthetic Medicine | High |
  | Weight Management | Medium |
  | Peptide Therapy | Medium |
  | IV Therapy/Infusion | Medium |
  | Regenerative Medicine | High |
  | Telehealth | Medium |
  | Chiropractic | Medium |
  | Integrative Medicine | Medium |
  | Anti-Aging Medicine | Medium |
  | Pain Management | High |
  | Primary Care/DPC/Concierge | Medium |

##### L4: Personal Services Arrangements (`fraud-compliance.anti-kickback.safe-harbors.personal-services`)
- **Description:** Safe harbor for independent contractor and employment relationships in healthcare, requiring written agreements with aggregate compensation set in advance for at least one year.
- **Classification signals:**
  - CFR: 42 CFR § 1001.952(d)
  - Agency: HHS OIG
  - Keywords: [personal services agreement] (Strong), [independent contractor physician] (Strong), [medical director] (Strong), [aggregate compensation] (Strong), [set in advance] (Moderate), [one year term] (Moderate), [signed writing] (Weak) — common requirement
  - Statutes: 42 U.S.C. § 1320a-7b(b)(3)(B)
- **Cross-classification triggers:** When discussing physician employment → also classify under `business-operations.employment-law`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Med Spa/Aesthetic Medicine | High |
  | Pain Management | High |
  | Primary Care/DPC/Concierge | High |
  | Telehealth | Medium |

#### L3: Advisory Opinions (`fraud-compliance.anti-kickback.advisory-opinions`)
- **Description:** OIG's formal process for healthcare entities to obtain binding guidance on whether proposed arrangements implicate the AKS. Opinions bind only the requestor but provide valuable industry guidance.
- **Classification signals:**
  - CFR: 42 CFR Part 1008
  - Agency: HHS OIG
  - Keywords: [OIG advisory opinion] (Strong), [AKS advisory opinion] (Strong), [requestor] (Moderate), [binding effect] (Moderate), [good faith disclosure] (Moderate), [arrangement review] (Weak) — generic term
  - Statutes: 42 U.S.C. § 1320a-7d(b)
- **Cross-classification triggers:** Referenced advisory opinions on specific topics trigger classification to those operational areas
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Med Spa/Aesthetic Medicine | Medium |
  | Regenerative Medicine | Medium |
  | Pain Management | High |

#### L3: Prohibited Conduct (`fraud-compliance.anti-kickback.prohibited-conduct`)
- **Description:** Core AKS prohibition against remuneration to induce or reward referrals for federal healthcare program services. One-purpose rule means violation if even one purpose is to induce referrals.
- **Classification signals:**
  - CFR: 42 CFR § 1001.951
  - Agency: HHS OIG, Department of Justice (DOJ)
  - Keywords: [remuneration] (Strong), [induce referrals] (Strong), [one purpose test] (Strong), [federal healthcare program] (Strong), [kickback] (Moderate) — colloquial term, [referral fee] (Moderate), [quid pro quo] (Weak) — requires context
  - Statutes: 42 U.S.C. § 1320a-7b(b)(1)-(2)
- **Cross-classification triggers:** When marketing payments discussed → also classify under `advertising-marketing.ftc-compliance`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | Medium |

### L2: Stark Law (`fraud-compliance.stark-law`)

#### L3: Designated Health Services (`fraud-compliance.stark-law.dhs`)
- **Description:** Eleven categories of health services subject to Stark Law self-referral prohibitions when physician has financial relationship with entity. Understanding DHS scope critical for compliance.
- **Classification signals:**
  - CFR: 42 CFR § 411.351
  - Agency: Centers for Medicare & Medicaid Services (CMS)
  - Keywords: [designated health services] (Strong), [DHS] (Strong), [clinical laboratory] (Strong), [physical therapy] (Strong), [radiology] (Strong), [DME] (Moderate) — durable medical equipment, [parenteral nutrients] (Moderate), [home health] (Weak) — depends on context
  - Statutes: 42 U.S.C. § 1395nn(h)(6)
- **Cross-classification triggers:** Specific DHS categories trigger relevant operational classifications (e.g., lab → `clinical-operations.laboratory`)
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Functional Medicine | Medium |
  | IV Therapy/Infusion | High |
  | Pain Management | High |
  | Primary Care/DPC/Concierge | Medium |

#### L3: In-Office Ancillary Services Exception (`fraud-compliance.stark-law.ioas`)
- **Description:** Key Stark exception allowing physicians to refer DHS performed in same building or centralized location by group practice. Essential for practices offering labs, imaging, or dispensing medications.
- **Classification signals:**
  - CFR: 42 CFR § 411.355(b)
  - Agency: CMS
  - Keywords: [in-office ancillary] (Strong), [IOAS] (Strong), [same building] (Strong), [centralized building] (Moderate), [direct supervision] (Moderate), [group practice] (Moderate), [ancillary services] (Weak) — needs IOAS context
  - Statutes: 42 U.S.C. § 1395nn(b)(2)
- **Cross-classification triggers:** When physician dispensing mentioned → also classify under `controlled-substances.dispensing` or `compounding.dispensing`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Functional Medicine | High |
  | Hormone Optimization/HRT | High |
  | Weight Management | High |
  | Pain Management | High |
  | Primary Care/DPC/Concierge | High |

### L2: False Claims Act (`fraud-compliance.false-claims`)

#### L3: Qui Tam Whistleblower Provisions (`fraud-compliance.false-claims.qui-tam`)
- **Description:** FCA provisions allowing private individuals (relators) to file suit on behalf of government for false claims, potentially receiving 15-30% of recovery. Major source of healthcare enforcement actions.
- **Classification signals:**
  - CFR: 31 CFR Part 3730
  - Agency: DOJ Civil Division, U.S. Attorney's Offices
  - Keywords: [qui tam] (Strong), [relator] (Strong), [whistleblower] (Strong), [original source] (Strong), [first to file] (Moderate), [government intervention] (Moderate), [relator share] (Moderate), [seal period] (Weak) — procedural term
  - Statutes: 31 U.S.C. § 3730
- **Cross-classification triggers:** When discussing internal reporting → also classify under `fraud-compliance.compliance-programs`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Compounding Pharmacy | High |
  | Pain Management | High |
  | Primary Care/DPC/Concierge | Medium |

#### L3: Knowledge Standard (`fraud-compliance.false-claims.knowledge`)
- **Description:** FCA's scienter requirement encompassing actual knowledge, deliberate ignorance, or reckless disregard of truth/falsity. No specific intent to defraud required for liability.
- **Classification signals:**
  - CFR: 31 CFR § 3729(b)(1)
  - Agency: DOJ
  - Keywords: [actual knowledge] (Strong), [deliberate ignorance] (Strong), [reckless disregard] (Strong), [knowingly] (Strong), [specific intent] (Moderate) — noting lack thereof, [should have known] (Weak) — imprecise standard
  - Statutes: 31 U.S.C. § 3729(b)(1)(A)
- **Cross-classification triggers:** When discussing billing errors → also classify under `medicare-billing.compliance`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | Medium |

### L2: OIG Exclusions (`fraud-compliance.exclusions`)

#### L3: Mandatory Exclusions (`fraud-compliance.exclusions.mandatory`)
- **Description:** Convictions triggering automatic OIG exclusion from federal healthcare programs with no discretion. Includes program-related crimes, patient abuse, controlled substance felonies, and healthcare fraud felonies.
- **Classification signals:**
  - CFR: 42 CFR § 1001.101-102
  - Agency: HHS OIG
  - Keywords: [mandatory exclusion] (Strong), [program-related crime] (Strong), [patient abuse] (Strong), [controlled substance felony] (Strong), [healthcare fraud conviction] (Strong), [five year minimum] (Moderate), [automatic exclusion] (Moderate)
  - Statutes: 42 U.S.C. § 1320a-7(a)
- **Cross-classification triggers:** Controlled substance convictions → also classify under `controlled-substances.enforcement`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

#### L3: Exclusion Screening (`fraud-compliance.exclusions.screening`)
- **Description:** Required screening of employees, contractors, and vendors against OIG's LEIE and GSA's SAM databases. Employing excluded individuals results in CMPs and potential program exclusion.
- **Classification signals:**
  - CFR: 42 CFR § 1001.1901
  - Agency: HHS OIG
  - Keywords: [LEIE] (Strong), [exclusion screening] (Strong), [SAM database] (Strong), [monthly screening] (Moderate), [excluded provider] (Strong), [employment screening] (Moderate), [vendor screening] (Weak) — context-dependent
  - Statutes: 42 U.S.C. § 1320a-7
- **Cross-classification triggers:** When discussing hiring → also classify under `business-operations.employment-law`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

### L2: Compliance Programs (`fraud-compliance.compliance-programs`)

#### L3: Seven Elements (`fraud-compliance.compliance-programs.seven-elements`)
- **Description:** OIG-recommended framework for effective compliance programs: standards/procedures, compliance officer, training, communication, enforcement, auditing/monitoring, and response/corrective action.
- **Classification signals:**
  - CFR: Referenced in OIG guidance documents
  - Agency: HHS OIG
  - Keywords: [seven elements] (Strong), [compliance program] (Strong), [written standards] (Strong), [compliance officer] (Strong), [training and education] (Moderate), [auditing monitoring] (Moderate), [corrective action] (Moderate), [effective compliance] (Weak) — vague term
  - Statutes: U.S. Sentencing Guidelines Chapter 8
- **Cross-classification triggers:** Training requirements → also classify under `business-operations.employment-law`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Compounding Pharmacy | High |
  | Pain Management | High |
  | Primary Care/DPC/Concierge | Medium |

## L1: State & Professional Licensing (`state-regulations`)

### L2: Licensure (`state-regulations.licensure`)

#### L3: Physician Licensure (`state-regulations.licensure.physician`)
- **Description:** State medical board requirements for physician licensure including examination, endorsement, and maintenance. Primarily state-regulated — federal content limited; state administrative code mapping will be added when state sources are ingested.
- **Classification signals:**
  - CFR: Limited federal references
  - Agency: Federation of State Medical Boards (FSMB), State medical boards
  - Keywords: [medical license] (Strong), [physician license] (Strong), [USMLE] (Strong), [board certification] (Moderate), [license by endorsement] (Strong), [IMLC] (Strong) — Interstate Medical Licensure Compact, [temporary license] (Moderate)
  - Statutes: State Medical Practice Acts
- **Cross-classification triggers:** IMLC mentioned → also classify under `telehealth.licensure`; DEA registration prerequisites → also classify under `controlled-substances.registration`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

#### L3: Advanced Practice Provider Licensure (`state-regulations.licensure.app`)
- **Description:** State licensing for NPs, PAs, CRNAs including scope of practice, collaborative agreements, and prescriptive authority. Primarily state-regulated — federal content limited; state administrative code mapping will be added when state sources are ingested.
- **Classification signals:**
  - CFR: Limited federal references
  - Agency: State nursing boards, State PA boards
  - Keywords: [nurse practitioner license] (Strong), [PA license] (Strong), [CRNA license] (Strong), [collaborative agreement] (Strong), [supervisory agreement] (Moderate), [prescriptive authority] (Strong), [FPA state] (Strong) — full practice authority
  - Statutes: State Nurse Practice Acts, State PA Practice Acts
- **Cross-classification triggers:** Prescriptive authority → also classify under relevant prescribing domains
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types except Chiropractic | High |

#### L3: License Renewal & CE (`state-regulations.licensure.renewal`)
- **Description:** State-specific continuing education requirements, renewal cycles, and maintenance of licensure obligations. Primarily state-regulated — federal content limited; state administrative code mapping will be added when state sources are ingested.
- **Classification signals:**
  - CFR: None
  - Agency: State professional boards
  - Keywords: [CME requirements] (Strong), [license renewal] (Strong), [continuing education] (Strong), [CE categories] (Moderate), [renewal cycle] (Moderate), [late renewal] (Weak) — procedural
  - Statutes: State professional practice acts
- **Cross-classification triggers:** Specific CE topics may trigger relevant operational classifications
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

#### L3: Board Disciplinary Actions (`state-regulations.licensure.disciplinary`)
- **Description:** State board complaint processes, investigations, sanctions, and reporting requirements including NPDB reporting. Primarily state-regulated — federal content limited; state administrative code mapping will be added when state sources are ingested.
- **Classification signals:**
  - CFR: 45 CFR Part 60 (NPDB)
  - Agency: State professional boards, HRSA (for NPDB)
  - Keywords: [board discipline] (Strong), [license suspension] (Strong), [license revocation] (Strong), [consent agreement] (Strong), [NPDB report] (Strong), [peer review] (Moderate), [impaired practitioner] (Moderate)
  - Statutes: State medical practice acts, Healthcare Quality Improvement Act
- **Cross-classification triggers:** Criminal convictions → also classify under relevant criminal domains
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

### L2: Facility Permits (`state-regulations.facility-permits`)

#### L3: Medical Facility Licensing (`state-regulations.facility-permits.medical`)
- **Description:** State requirements for medical practice facility licenses, office registration, and practice site permits. Primarily state-regulated — federal content limited; state administrative code mapping will be added when state sources are ingested.
- **Classification signals:**
  - CFR: Limited CMS references for certain facility types
  - Agency: State departments of health
  - Keywords: [facility license] (Strong), [medical office permit] (Strong), [practice registration] (Moderate), [certificate of need] (Strong), [health permit] (Moderate), [practice site] (Weak) — too general
  - Statutes: State health facility licensing acts
- **Cross-classification triggers:** Specific facility types trigger relevant operational areas (e.g., surgery center → surgical requirements)
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Med Spa/Aesthetic Medicine | High |
  | IV Therapy/Infusion | High |
  | Regenerative Medicine | High |
  | Pain Management | Medium |

#### L3: CLIA Laboratory Certification (`state-regulations.facility-permits.clia`)
- **Description:** Federal CLIA requirements for office laboratories performing testing on human specimens, including waived test certificates and proficiency testing.
- **Classification signals:**
  - CFR: 42 CFR Part 493
  - Agency: CMS, State agencies
  - Keywords: [CLIA certificate] (Strong), [certificate of waiver] (Strong), [waived tests] (Strong), [proficiency testing] (Strong), [laboratory director] (Strong), [point of care testing] (Moderate), [POCT] (Moderate)
  - Statutes: Clinical Laboratory Improvement Amendments of 1988
- **Cross-classification triggers:** Always classify under `clinical-operations.laboratory`; billing implications → `medicare-billing`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Functional Medicine | High |
  | Hormone Optimization/HRT | High |
  | Primary Care/DPC/Concierge | High |

#### L3: Office-Based Surgery Permits (`state-regulations.facility-permits.obs`)
- **Description:** State permits and accreditation requirements for office-based surgical procedures including anesthesia standards. Primarily state-regulated — federal content limited; state administrative code mapping will be added when state sources are ingested.
- **Classification signals:**
  - CFR: Limited references
  - Agency: State health departments, State medical boards
  - Keywords: [office surgery permit] (Strong), [OBS registration] (Strong), [office-based surgery] (Strong), [anesthesia permit] (Strong), [Level I/II/III] (Moderate) — sedation levels, [adverse event reporting] (Moderate)
  - Statutes: State office-based surgery regulations
- **Cross-classification triggers:** Accreditation requirements → also classify under relevant accreditation domain
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Med Spa/Aesthetic Medicine | High |
  | Regenerative Medicine | Medium |
  | Pain Management | Medium |

### L2: Corporate Practice of Medicine (`state-regulations.cpom`)

#### L3: CPOM Prohibitions (`state-regulations.cpom.prohibitions`)
- **Description:** State laws prohibiting non-physicians from owning medical practices or employing physicians, with significant state variation. Primarily state-regulated — federal content limited; state administrative code mapping will be added when state sources are ingested.
- **Classification signals:**
  - CFR: None
  - Agency: State medical boards, State attorneys general
  - Keywords: [corporate practice of medicine] (Strong), [CPOM] (Strong), [lay ownership] (Strong), [fee splitting] (Strong), [physician employment] (Moderate), [professional corporation] (Moderate), [medical practice ownership] (Weak) — needs context
  - Statutes: State CPOM doctrines (common law and statutory)
- **Cross-classification triggers:** Always cross-classify with `business-operations.corporate-structure`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Med Spa/Aesthetic Medicine | High |
  | Telehealth | High |
  | All other practice types | Medium |

#### L3: Management Services Organizations (`state-regulations.cpom.mso`)
- **Description:** Permissible MSO structures allowing non-clinical administrative support while maintaining physician autonomy over medical decisions. Primarily state-regulated — federal content limited; state administrative code mapping will be added when state sources are ingested.
- **Classification signals:**
  - CFR: None
  - Agency: State medical boards
  - Keywords: [management services organization] (Strong), [MSO] (Strong), [management agreement] (Strong), [administrative services] (Moderate), [non-clinical services] (Moderate), [physician autonomy] (Moderate), [friendly PC] (Weak) — colloquial term
  - Statutes: State CPOM exceptions and guidance
- **Cross-classification triggers:** Fee arrangements → also classify under `fraud-compliance.anti-kickback`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Med Spa/Aesthetic Medicine | High |
  | Telehealth | High |
  | Regenerative Medicine | Medium |

### L2: Scope Expansions (`state-regulations.scope-expansions`)

#### L3: Full Practice Authority (`state-regulations.scope-expansions.fpa`)
- **Description:** State laws granting nurse practitioners independent practice without physician collaboration/supervision requirements. Primarily state-regulated — federal content limited; state administrative code mapping will be added when state sources are ingested.
- **Classification signals:**
  - CFR: None
  - Agency: State nursing boards
  - Keywords: [full practice authority] (Strong), [FPA] (Strong), [independent practice] (Strong), [no supervision required] (Strong), [nurse practitioner autonomy] (Moderate), [APRN independence] (Moderate)
  - Statutes: State nurse practice acts
- **Cross-classification triggers:** Prescriptive authority aspects → also classify under relevant prescribing domains
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Primary Care/DPC/Concierge | High |
  | Telehealth | High |
  | All other practice types | Medium |

## L1: Business Operations & Workplace Safety (`business-operations`)

### L2: OSHA Compliance (`business-operations.osha-compliance`)

#### L3: Bloodborne Pathogens (`business-operations.osha-compliance.bloodborne`)
- **Description:** OSHA requirements for protecting healthcare workers from bloodborne pathogen exposure including exposure control plans, universal precautions, and post-exposure protocols.
- **Classification signals:**
  - CFR: 29 CFR § 1910.1030
  - Agency: Occupational Safety and Health Administration (OSHA)
  - Keywords: [bloodborne pathogens] (Strong), [exposure control plan] (Strong), [universal precautions] (Strong), [sharps injury] (Strong), [needlestick] (Strong), [hepatitis B vaccination] (Moderate), [post-exposure] (Moderate), [BBP training] (Weak) — abbreviation
  - Statutes: Occupational Safety and Health Act § 5(a)(1)
- **Cross-classification triggers:** Sharps disposal → also classify under `business-operations.waste-management`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Compounding Pharmacy | High |
  | Med Spa/Aesthetic Medicine | High |
  | IV Therapy/Infusion | High |
  | Regenerative Medicine | High |
  | Pain Management | High |
  | Primary Care/DPC/Concierge | High |

#### L3: Hazard Communication (`business-operations.osha-compliance.hazcom`)
- **Description:** Requirements for chemical hazard communication including Safety Data Sheets, labeling per GHS standards, and employee training on hazardous chemicals used in healthcare.
- **Classification signals:**
  - CFR: 29 CFR § 1910.1200
  - Agency: OSHA
  - Keywords: [hazard communication] (Strong), [HazCom] (Strong), [safety data sheet] (Strong), [SDS] (Strong), [GHS labeling] (Strong), [chemical inventory] (Moderate), [hazardous chemical] (Moderate), [right to know] (Weak) — state law term
  - Statutes: Occupational Safety and Health Act
- **Cross-classification triggers:** Compounding chemicals → also classify under `compounding.sterile` or `compounding.503a`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Compounding Pharmacy | High |
  | Med Spa/Aesthetic Medicine | Medium |
  | IV Therapy/Infusion | Medium |

#### L3: Recordkeeping & Reporting (`business-operations.osha-compliance.recordkeeping`)
- **Description:** OSHA injury and illness recordkeeping requirements including Form 300 logs, annual summary posting, and severe injury reporting obligations.
- **Classification signals:**
  - CFR: 29 CFR Part 1904
  - Agency: OSHA
  - Keywords: [OSHA 300 log] (Strong), [injury recordkeeping] (Strong), [300A summary] (Strong), [severe injury reporting] (Strong), [work-related injury] (Moderate), [days away from work] (Moderate), [recordable injury] (Weak) — technical definition
  - Statutes: Occupational Safety and Health Act
- **Cross-classification triggers:** Workers' compensation claims → also classify under `business-operations.employment-law`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | Medium |

### L2: Waste Management (`business-operations.waste-management`)

#### L3: Medical Waste Disposal (`business-operations.waste-management.medical`)
- **Description:** Requirements for proper segregation, storage, and disposal of regulated medical waste including sharps, blood products, and pathological waste. Primarily state-regulated — federal content limited; state administrative code mapping will be added when state sources are ingested.
- **Classification signals:**
  - CFR: 49 CFR § 173.134 (DOT shipping)
  - Agency: State environmental agencies, DOT
  - Keywords: [regulated medical waste] (Strong), [RMW] (Strong), [red bag waste] (Strong), [sharps container] (Strong), [biohazard] (Moderate), [manifest requirements] (Moderate), [autoclave] (Weak) — one treatment method
  - Statutes: State medical waste regulations
- **Cross-classification triggers:** OSHA bloodborne requirements → also classify under `business-operations.osha-compliance.bloodborne`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Med Spa/Aesthetic Medicine | High |
  | IV Therapy/Infusion | High |
  | Regenerative Medicine | High |
  | Primary Care/DPC/Concierge | Medium |

#### L3: Pharmaceutical Waste (`business-operations.waste-management.pharmaceutical`)
- **Description:** EPA requirements for disposal of hazardous pharmaceutical waste under RCRA, including P-list and U-list drugs, with special rules for healthcare facilities.
- **Classification signals:**
  - CFR: 40 CFR Part 266 Subpart P
  - Agency: Environmental Protection Agency (EPA)
  - Keywords: [pharmaceutical waste] (Strong), [P-list] (Strong), [U-list] (Strong), [RCRA waste] (Strong), [hazardous waste pharmaceutical] (Strong), [reverse distributor] (Moderate), [DEA disposal] (Moderate) — for controlled substances
  - Statutes: Resource Conservation and Recovery Act (RCRA)
- **Cross-classification triggers:** Controlled substance disposal → also classify under `controlled-substances.recordkeeping`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Compounding Pharmacy | High |
  | Hormone Optimization/HRT | Medium |
  | Pain Management | Medium |

### L2: Employment Law (`business-operations.employment-law`)

#### L3: Healthcare Worker Classification (`business-operations.employment-law.classification`)
- **Description:** Proper classification of healthcare workers as employees vs. independent contractors, including IRS tests and state ABC tests, critical for locum tenens and part-time physicians.
- **Classification signals:**
  - CFR: 26 CFR § 31.3121(d)-1 (IRS employee definition)
  - Agency: Internal Revenue Service (IRS), Department of Labor (DOL)
  - Keywords: [1099 vs W-2] (Strong), [independent contractor] (Strong), [employee classification] (Strong), [locum tenens] (Strong), [IRS 20-factor test] (Moderate), [ABC test] (Moderate), [misclassification] (Moderate), [control test] (Weak) — one factor
  - Statutes: Fair Labor Standards Act, Internal Revenue Code
- **Cross-classification triggers:** Tax implications → also classify under `business-operations.tax-compliance`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

#### L3: FMLA in Healthcare (`business-operations.employment-law.fmla`)
- **Description:** Family and Medical Leave Act requirements specific to healthcare employers including serious health condition certifications and healthcare provider definitions.
- **Classification signals:**
  - CFR: 29 CFR Part 825
  - Agency: DOL Wage and Hour Division
  - Keywords: [FMLA leave] (Strong), [serious health condition] (Strong), [healthcare provider certification] (Strong), [intermittent leave] (Moderate), [12 weeks] (Moderate), [job restoration] (Moderate), [FMLA retaliation] (Weak) — enforcement issue
  - Statutes: 29 U.S.C. §§ 2601-2654
- **Cross-classification triggers:** ADA overlap for medical conditions → also classify under ADA node
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | Medium |

#### L3: Healthcare Wage & Hour (`business-operations.employment-law.wage-hour`)
- **Description:** FLSA requirements for healthcare including exemptions for physicians, on-call pay, and working time calculations specific to medical practices.
- **Classification signals:**
  - CFR: 29 CFR Parts 541, 778, 785
  - Agency: DOL Wage and Hour Division
  - Keywords: [learned professional exemption] (Strong), [physician exemption] (Strong), [on-call pay] (Strong), [compensable time] (Moderate), [8 and 80] (Moderate) — healthcare exception, [overtime] (Moderate), [minimum wage] (Weak) — rarely applies to physicians
  - Statutes: Fair Labor Standards Act
- **Cross-classification triggers:** Independent contractor issues → classify under classification node
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | Medium |

### L2: Tax Compliance (`business-operations.tax-compliance`)

#### L3: Section 199A for Medical Practices (`business-operations.tax-compliance.qbi`)
- **Description:** Qualified Business Income deduction for medical practice owners, including SSTB limitations and wage/basis thresholds affecting physician-owned practices.
- **Classification signals:**
  - CFR: 26 CFR § 1.199A
  - Agency: IRS
  - Keywords: [QBI deduction] (Strong), [Section 199A] (Strong), [specified service trade] (Strong), [SSTB] (Strong), [medical practice deduction] (Moderate), [wage limitation] (Moderate), [taxable income threshold] (Moderate), [20 percent deduction] (Weak) — oversimplified
  - Statutes: 26 U.S.C. § 199A
- **Cross-classification triggers:** Entity structure impacts → also classify under `business-operations.corporate-structure`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

#### L3: Healthcare Fringe Benefits (`business-operations.tax-compliance.benefits`)
- **Description:** Tax treatment of healthcare employee benefits including Section 125 cafeteria plans, HSAs, and healthcare FSAs with nondiscrimination testing requirements.
- **Classification signals:**
  - CFR: 26 CFR §§ 1.125, 1.223
  - Agency: IRS
  - Keywords: [cafeteria plan] (Strong), [Section 125] (Strong), [HSA] (Strong), [healthcare FSA] (Strong), [nondiscrimination testing] (Moderate), [salary reduction] (Moderate), [use or lose] (Weak) — FSA feature only
  - Statutes: 26 U.S.C. §§ 125, 223
- **Cross-classification triggers:** ACA requirements → also classify under ACA employer mandate if applicable
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | Medium |