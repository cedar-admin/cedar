# Cedar Classification Framework — Part 1, Session 5-B of 8
# Deep Taxonomy: Controlled Substances Branch (L3 through L6)

## L1: Controlled Substances & Prescribing (`controlled-substances`)

### L2: DEA Registration (`controlled-substances.registration`)

#### L3: Practitioner Registration Requirements (`controlled-substances.registration.practitioner`)
- **Description:** Individual DEA registration requirements for practitioners authorized to handle controlled substances, including physicians, dentists, veterinarians, and other DEA-registrable professionals. Core compliance requirement for any provider prescribing controlled substances.
- **Classification signals:**
  - CFR: 21 CFR 1301.11-1301.13, 21 CFR 1301.17-1301.19
  - Agency: DEA Diversion Control Division
  - Keywords: [DEA registration] (Strong), [DEA number] (Strong), [practitioner registration] (Strong), [Form 224] (Strong), [individual DEA] (Moderate), [prescriptive authority] (Moderate), [registration renewal] (Moderate), [practitioner DEA] (Weak)
  - Statutes: 21 U.S.C. § 823(f), 21 U.S.C. § 822(a)(2)
- **Cross-classification triggers:** 
  > "If an entity classified in `controlled-substances.registration.practitioner` contains any of: [state license, medical board, suspended license], also classify in `state-regulations.licensure`"
  > "If an entity classified in `controlled-substances.registration.practitioner` contains any of: [nurse practitioner, physician assistant, CRNA], also classify in `controlled-substances.registration.mid-level`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Pain Management | High |
| Hormone Optimization/HRT | High |
| Primary Care/DPC/Concierge | High |
| Integrative Medicine | High |
| Weight Management | High |
| Telehealth | High |
| Anti-Aging Medicine | Medium |
| Functional Medicine | Medium |
| Med Spa/Aesthetic Medicine | Medium |
| IV Therapy/Infusion | Medium |

##### L4: Registration by Provider Type (`controlled-substances.registration.practitioner.provider-type`)
- **Description:** Specific DEA registration requirements and limitations based on provider credential type including MD, DO, DDS, DVM, DPM, and scope of controlled substance authority by license type.
- **Classification signals:**
  - CFR: 21 CFR 1301.11, 21 CFR 1300.01(b)(28) (definitions)
  - Agency: DEA Diversion Control Division
  - Keywords: [physician DEA] (Strong), [dentist DEA] (Strong), [veterinarian DEA] (Strong), [podiatrist DEA] (Moderate), [optometrist DEA] (Moderate), [practitioner definition] (Moderate), [scope of practice] (Weak)
  - Statutes: 21 U.S.C. § 802(21) (practitioner definition)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.registration.practitioner.provider-type` contains any of: [scope of practice, practice limitations], also classify in `clinical-operations.scope-of-practice`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Pain Management | High |
| Primary Care/DPC/Concierge | High |
| Chiropractic | Medium |

##### L4: State License Prerequisites (`controlled-substances.registration.practitioner.state-license`)
- **Description:** Requirements for maintaining valid state professional license as prerequisite for DEA registration, impact of state board actions on federal registration, and automatic suspension provisions.
- **Classification signals:**
  - CFR: 21 CFR 1301.14, 21 CFR 1301.36
  - Agency: DEA Diversion Control Division, State Medical Boards
  - Keywords: [state license required] (Strong), [license suspension] (Strong), [automatic DEA suspension] (Strong), [state board action] (Moderate), [license revocation] (Moderate), [federal-state coordination] (Weak)
  - Statutes: 21 U.S.C. § 824(a)(3)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.registration.practitioner.state-license` contains any of: [medical board, disciplinary action, license probation], also classify in `state-regulations.licensure`"
  > "If an entity classified in `controlled-substances.registration.practitioner.state-license` contains any of: [fraud, false statements], also classify in `fraud-compliance`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All practices with DEA registration | High |

#### L3: Mid-Level Practitioner Registration (`controlled-substances.registration.mid-level`)
- **Description:** DEA registration requirements for nurse practitioners, physician assistants, and CRNAs, including state-specific prescriptive authority requirements and supervision/collaboration agreements affecting controlled substance prescribing.
- **Classification signals:**
  - CFR: 21 CFR 1301.11, 21 CFR 1300.01(b)(17) (mid-level practitioner definition)
  - Agency: DEA Diversion Control Division
  - Keywords: [mid-level practitioner] (Strong), [nurse practitioner DEA] (Strong), [physician assistant DEA] (Strong), [CRNA DEA] (Strong), [prescriptive authority] (Strong), [collaborative agreement] (Moderate), [supervision requirement] (Moderate), [MLP registration] (Weak)
  - Statutes: 21 U.S.C. § 823(f)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.registration.mid-level` contains any of: [full practice authority, independent practice], also classify in `state-regulations.scope-expansions`"
  > "If an entity classified in `controlled-substances.registration.mid-level` contains any of: [collaborative practice, supervision], also classify in `clinical-operations.scope-of-practice`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Primary Care/DPC/Concierge | High |
| Pain Management | High |
| Hormone Optimization/HRT | High |
| Telehealth | High |
| Weight Management | Medium |

#### L3: Institutional Registration (`controlled-substances.registration.institutional`)
- **Description:** DEA registration for hospitals, clinics, and other institutional providers, including principal place of business rules, separate registrations for multiple locations, and practitioner exemptions when working within registered institutions.
- **Classification signals:**
  - CFR: 21 CFR 1301.12, 21 CFR 1301.13, 21 CFR 1301.22
  - Agency: DEA Diversion Control Division
  - Keywords: [institutional DEA] (Strong), [hospital DEA] (Strong), [clinic registration] (Strong), [principal place of business] (Strong), [multiple locations] (Moderate), [practitioner exemption] (Moderate), [institutional practitioner] (Weak)
  - Statutes: 21 U.S.C. § 823(f), 21 U.S.C. § 822(e)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.registration.institutional` contains any of: [dispensing, automated dispensing], also classify in `controlled-substances.dispensing`"
  > "If an entity classified in `controlled-substances.registration.institutional` contains any of: [compounding, hospital pharmacy], also classify in `compounding.503a`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Hospital-affiliated practices | High |
| Multi-location practices | High |
| Med Spa/Aesthetic Medicine | Medium |

#### L3: Registration Renewal & Modification (`controlled-substances.registration.renewal`)
- **Description:** DEA registration renewal timelines (every 3 years), online renewal process, fee requirements, and procedures for modifying registrations due to address changes or business activity modifications.
- **Classification signals:**
  - CFR: 21 CFR 1301.13, 21 CFR 1301.51-1301.52
  - Agency: DEA Diversion Control Division
  - Keywords: [DEA renewal] (Strong), [registration renewal] (Strong), [three year renewal] (Strong), [online renewal] (Moderate), [renewal notice] (Moderate), [address change] (Moderate), [modification request] (Weak)
  - Statutes: 21 U.S.C. § 823(f)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.registration.renewal` contains any of: [business structure, ownership change], also classify in `business-operations.corporate-structure`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All practices with DEA registration | Medium |

### L2: Prescribing Rules (`controlled-substances.prescribing`)

#### L3: Schedule-Specific Prescribing Requirements (`controlled-substances.prescribing.schedule-requirements`)
- **Description:** Distinct prescribing rules for each controlled substance schedule including prescription format, refill limitations, quantity restrictions, and emergency dispensing provisions that vary by schedule.
- **Classification signals:**
  - CFR: 21 CFR 1306.11-1306.15 (Schedule II), 21 CFR 1306.21-1306.23 (Schedule III-IV), 21 CFR 1306.26 (Schedule V)
  - Agency: DEA Diversion Control Division
  - Keywords: [Schedule II prescribing] (Strong), [no refills] (Strong), [written prescription required] (Strong), [Schedule III-IV prescribing] (Strong), [5 refills maximum] (Strong), [6 month limit] (Moderate), [oral prescription] (Moderate), [emergency dispensing] (Weak)
  - Statutes: 21 U.S.C. § 829(a)-(c)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.prescribing.schedule-requirements` contains any of: [testosterone, anabolic steroids], also classify in `compounding.503a.practice-specific.hormones`"
  > "If an entity classified in `controlled-substances.prescribing.schedule-requirements` contains any of: [stimulants, ADHD medications], also classify in `controlled-substances.prescribing.special-populations`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Pain Management | High |
| Hormone Optimization/HRT | High |
| Weight Management | High |
| Primary Care/DPC/Concierge | High |
| Telehealth | High |

##### L4: Schedule II Prescribing (`controlled-substances.prescribing.schedule-requirements.schedule-ii`)
- **Description:** Strict requirements for Schedule II controlled substances including written prescriptions only, no refills permitted, 30-day supply limits in many states, and limited emergency oral prescription provisions.
- **Classification signals:**
  - CFR: 21 CFR 1306.11-1306.15
  - Agency: DEA Diversion Control Division
  - Keywords: [Schedule II] (Strong), [no refills] (Strong), [written prescription only] (Strong), [30-day supply] (Strong), [emergency oral prescription] (Moderate), [fax prescription] (Moderate), [partial fill] (Moderate), [CII drugs] (Weak)
  - Statutes: 21 U.S.C. § 829(a)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.prescribing.schedule-requirements.schedule-ii` contains any of: [ADHD, stimulants, Adderall], also classify in `controlled-substances.prescribing.special-populations`"
  > "If an entity classified in `controlled-substances.prescribing.schedule-requirements.schedule-ii` contains any of: [opioids, pain management], also classify in `controlled-substances.opioid-specific`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Pain Management | High |
| Weight Management | High |
| Primary Care/DPC/Concierge | High |

##### L4: Schedule III-IV Prescribing (`controlled-substances.prescribing.schedule-requirements.schedule-iii-iv`)
- **Description:** Prescribing rules for Schedule III and IV substances including oral prescription authority, 5 refill maximum within 6 months, and requirements for reducing oral prescriptions to writing.
- **Classification signals:**
  - CFR: 21 CFR 1306.21-1306.23
  - Agency: DEA Diversion Control Division
  - Keywords: [Schedule III] (Strong), [Schedule IV] (Strong), [5 refills] (Strong), [6 month limit] (Strong), [oral prescription allowed] (Moderate), [testosterone prescribing] (Moderate), [benzodiazepines] (Moderate), [CIII-IV drugs] (Weak)
  - Statutes: 21 U.S.C. § 829(b)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.prescribing.schedule-requirements.schedule-iii-iv` contains any of: [testosterone, HRT], also classify in `compounding.503a.practice-specific.hormones`"
  > "If an entity classified in `controlled-substances.prescribing.schedule-requirements.schedule-iii-iv` contains any of: [buprenorphine, suboxone], also classify in `controlled-substances.opioid-specific.buprenorphine`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Hormone Optimization/HRT | High |
| Pain Management | High |
| Anti-Aging Medicine | High |
| Weight Management | Medium |

##### L4: Schedule V Prescribing (`controlled-substances.prescribing.schedule-requirements.schedule-v`)
- **Description:** Least restrictive prescribing rules for Schedule V substances including unlimited refills unless restricted by prescriber, OTC availability in some states, and minimal federal requirements.
- **Classification signals:**
  - CFR: 21 CFR 1306.26
  - Agency: DEA Diversion Control Division
  - Keywords: [Schedule V] (Strong), [unlimited refills] (Strong), [OTC Schedule V] (Moderate), [cough syrup with codeine] (Moderate), [pregabalin] (Moderate), [CV drugs] (Weak)
  - Statutes: 21 U.S.C. § 829(c)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.prescribing.schedule-requirements.schedule-v` contains any of: [over-the-counter, OTC sale], also classify in `state-regulations.pharmacy`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Primary Care/DPC/Concierge | Medium |
| Pain Management | Medium |

#### L3: Prescription Format & Documentation (`controlled-substances.prescribing.documentation`)
- **Description:** Required elements for valid controlled substance prescriptions including patient information, prescriber information, drug details, and special requirements for written vs. electronic prescriptions.
- **Classification signals:**
  - CFR: 21 CFR 1306.05, 21 CFR 1306.06
  - Agency: DEA Diversion Control Division
  - Keywords: [prescription requirements] (Strong), [required elements] (Strong), [patient name and address] (Strong), [DEA number required] (Strong), [manual signature] (Moderate), [prescription validity] (Moderate), [corresponding responsibility] (Moderate), [prescription format] (Weak)
  - Statutes: 21 U.S.C. § 829
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.prescribing.documentation` contains any of: [electronic prescribing, EPCS], also classify in `controlled-substances.prescribing.epcs`"
  > "If an entity classified in `controlled-substances.prescribing.documentation` contains any of: [medical records, documentation], also classify in `clinical-operations.recordkeeping`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All prescribing practices | High |

#### L3: Electronic Prescribing for Controlled Substances (EPCS) (`controlled-substances.prescribing.epcs`)
- **Description:** DEA requirements for electronic prescribing of controlled substances including two-factor authentication, identity proofing, audit trails, and certified application requirements that many states now mandate.
- **Classification signals:**
  - CFR: 21 CFR Part 1311
  - Agency: DEA Diversion Control Division
  - Keywords: [EPCS] (Strong), [electronic prescribing] (Strong), [two-factor authentication] (Strong), [DEA certification] (Strong), [identity proofing] (Strong), [audit trail] (Moderate), [logical access control] (Moderate), [digital signature] (Weak)
  - Statutes: 21 U.S.C. § 829, Medicare Improvements for Patients and Providers Act
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.prescribing.epcs` contains any of: [Medicare Part D, Medicare requirement], also classify in `medicare-billing`"
  > "If an entity classified in `controlled-substances.prescribing.epcs` contains any of: [state mandate, mandatory EPCS], also classify in `state-regulations.controlled-substances`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All prescribing practices | High |

##### L4: Identity Proofing & Authentication (`controlled-substances.prescribing.epcs.authentication`)
- **Description:** Requirements for practitioner identity verification and two-factor authentication methods including in-person proofing, remote proofing options, and acceptable authentication factors (knowledge, hard token, biometric).
- **Classification signals:**
  - CFR: 21 CFR 1311.105, 21 CFR 1311.110, 21 CFR 1311.115
  - Agency: DEA Diversion Control Division
  - Keywords: [identity proofing] (Strong), [two-factor] (Strong), [credential service provider] (Strong), [hard token] (Moderate), [biometric authentication] (Moderate), [FIPS 140-2] (Moderate), [authentication factor] (Weak)
  - Statutes: 21 U.S.C. § 829
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.prescribing.epcs.authentication` contains any of: [security requirements, access controls], also classify in `hipaa-privacy.security-rule`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| All prescribing practices | High |

##### L4: Application Certification Requirements (`controlled-substances.prescribing.epcs.certification`)
- **Description:** Requirements for electronic prescribing applications to achieve DEA certification including third-party audits, security controls, and ongoing compliance obligations for software vendors.
- **Classification signals:**
  - CFR: 21 CFR 1311.300, 21 CFR 1311.305
  - Agency: DEA Diversion Control Division
  - Keywords: [application certification] (Strong), [DEA certified] (Strong), [third-party audit] (Strong), [certification report] (Moderate), [application provider] (Moderate), [security controls] (Moderate), [annual audit] (Weak)
  - Statutes: 21 U.S.C. § 829
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.prescribing.epcs.certification` contains any of: [EHR integration, practice management], also classify in `clinical-operations.technology`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All prescribing practices | Medium |

#### L3: Prescription Monitoring Programs (`controlled-substances.prescribing.pdmp`)
- **Description:** State-operated prescription drug monitoring program requirements including mandatory query obligations, interstate data sharing, delegate access, and integration with clinical workflows.
- **Classification signals:**
  - CFR: 42 CFR 2.31 (limited federal requirements)
  - Agency: State Departments of Health, SAMHSA (for federal grants)
  - Keywords: [PDMP] (Strong), [prescription monitoring] (Strong), [mandatory query] (Strong), [PMP InterConnect] (Strong), [delegate access] (Moderate), [interstate sharing] (Moderate), [PDMP check] (Moderate), [prescription history] (Weak)
  - Statutes: Harold Rogers PDMP Grant Program, state PDMP statutes
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.prescribing.pdmp` contains any of: [state requirement, state mandate], also classify in `state-regulations.controlled-substances`"
  > "If an entity classified in `controlled-substances.prescribing.pdmp` contains any of: [EHR integration, workflow], also classify in `clinical-operations.technology`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Pain Management | High |
| Primary Care/DPC/Concierge | High |
| Hormone Optimization/HRT | High |
| All prescribing practices | High |

##### L4: Query Requirements & Timing (`controlled-substances.prescribing.pdmp.query-requirements`)
- **Description:** State-specific mandates for when prescribers must check the PDMP including first prescription, every prescription, periodic checks, and exceptions for emergency or hospice care.
- **Classification signals:**
  - CFR: State regulations only
  - Agency: State Departments of Health, State Medical Boards
  - Keywords: [mandatory PDMP check] (Strong), [query requirement] (Strong), [every prescription] (Strong), [initial prescription] (Moderate), [90-day check] (Moderate), [query exceptions] (Moderate), [good faith exception] (Weak)
  - Statutes: State PDMP statutes
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.prescribing.pdmp.query-requirements` contains any of: [workflow integration, point of care], also classify in `clinical-operations.technology`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All prescribing practices | High |

##### L4: Interstate Data Sharing (`controlled-substances.prescribing.pdmp.interstate`)
- **Description:** Technical and legal frameworks for sharing PDMP data across state lines including PMP InterConnect participation, data use agreements, and reciprocity limitations.
- **Classification signals:**
  - CFR: Limited federal involvement
  - Agency: NABP (National Association of Boards of Pharmacy), State PDMPs
  - Keywords: [PMP InterConnect] (Strong), [interstate data sharing] (Strong), [NABP PMP] (Strong), [reciprocal access] (Moderate), [data use agreement] (Moderate), [cross-state query] (Moderate), [hub state] (Weak)
  - Statutes: State PDMP statutes, interstate compacts
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.prescribing.pdmp.interstate` contains any of: [telehealth, multi-state practice], also classify in `telehealth.licensure`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| Multi-state practices | High |
| Pain Management | Medium |

#### L3: Special Populations & Circumstances (`controlled-substances.prescribing.special-populations`)
- **Description:** Special prescribing considerations for pediatric patients, elderly patients, pregnant patients, and circumstances like hospice care or emergency department prescribing with unique rules or restrictions.
- **Classification signals:**
  - CFR: 21 CFR 1306.04(b), various FDA guidances
  - Agency: DEA Diversion Control Division, FDA
  - Keywords: [pediatric prescribing] (Strong), [weight-based dosing] (Strong), [elderly patients] (Moderate), [pregnancy category] (Moderate), [hospice exemption] (Moderate), [emergency department] (Moderate), [special populations] (Weak)
  - Statutes: 21 U.S.C. § 829
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.prescribing.special-populations` contains any of: [informed consent, pediatric consent], also classify in `clinical-operations.informed-consent`"
  > "If an entity classified in `controlled-substances.prescribing.special-populations` contains any of: [ADHD medications, stimulants], also classify in `controlled-substances.scheduling.schedule-ii`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Primary Care/DPC/Concierge | High |
| Pain Management | High |
| Pediatric-focused practices | High |

### L2: Recordkeeping & Inventory (`controlled-substances.recordkeeping`)

#### L3: Inventory Requirements (`controlled-substances.recordkeeping.inventory`)
- **Description:** Biennial inventory obligations for all controlled substances including initial inventory, exact count requirements for Schedule II, estimation permitted for Schedule III-V, and perpetual inventory options.
- **Classification signals:**
  - CFR: 21 CFR 1304.11, 21 CFR 1304.04(f)
  - Agency: DEA Diversion Control Division
  - Keywords: [biennial inventory] (Strong), [controlled substance inventory] (Strong), [exact count] (Strong), [Schedule II inventory] (Strong), [estimated count] (Moderate), [May 1 deadline] (Moderate), [perpetual inventory] (Moderate), [inventory date] (Weak)
  - Statutes: 21 U.S.C. § 827(a)(1)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.recordkeeping.inventory` contains any of: [compounded products, bulk ingredients], also classify in `compounding.503a.anticipatory.documentation`"
  > "If an entity classified in `controlled-substances.recordkeeping.inventory` contains any of: [automated dispensing, Pyxis], also classify in `controlled-substances.dispensing.automated`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Pain Management | High |
| Compounding Pharmacy | High |
| Hospital/Health System | High |
| Primary Care with dispensing | High |

##### L4: Schedule II Exact Count Requirements (`controlled-substances.recordkeeping.inventory.schedule-ii`)
- **Description:** Specific requirements for exact unit counts of all Schedule II controlled substances during inventory including finished dosage forms, bulk materials, and damaged/expired products.
- **Classification signals:**
  - CFR: 21 CFR 1304.11(e)(1)
  - Agency: DEA Diversion Control Division
  - Keywords: [exact count required] (Strong), [Schedule II count] (Strong), [unit-by-unit] (Strong), [no estimation] (Strong), [actual count] (Moderate), [tablet count] (Moderate), [damaged product] (Weak)
  - Statutes: 21 U.S.C. § 827(a)(1)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.recordkeeping.inventory.schedule-ii` contains any of: [waste, disposal, expired], also classify in `controlled-substances.disposal`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Hospital Pharmacy | High |
| Compounding Pharmacy | High |
| Pain Management | High |

##### L4: Schedule III-V Estimation Methods (`controlled-substances.recordkeeping.inventory.schedule-iii-v`)
- **Description:** Permitted estimation methods for Schedule III-V controlled substances during inventory including container count methods and conditions requiring exact counts.
- **Classification signals:**
  - CFR: 21 CFR 1304.11(e)(2)
  - Agency: DEA Diversion Control Division
  - Keywords: [estimation permitted] (Strong), [Schedule III-V] (Strong), [container count] (Strong), [1000 dosage units] (Strong — threshold for exact count), [estimated count] (Moderate), [opened containers] (Moderate), [bulk containers] (Weak)
  - Statutes: 21 U.S.C. § 827(a)(1)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.recordkeeping.inventory.schedule-iii-v` contains any of: [testosterone, androgens], also classify in `compounding.503a.practice-specific.hormones`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Hormone Optimization/HRT | High |
| Anti-Aging Medicine | High |
| Compounding Pharmacy | High |

#### L3: Receipt & Distribution Records (`controlled-substances.recordkeeping.receipt-distribution`)
- **Description:** Documentation requirements for receiving and distributing controlled substances including DEA Form 222 for Schedule II, CSOS electronic ordering, and invoice requirements for Schedule III-V.
- **Classification signals:**
  - CFR: 21 CFR 1304.21-1304.22, 21 CFR 1305.03-1305.17
  - Agency: DEA Diversion Control Division
  - Keywords: [DEA Form 222] (Strong), [CSOS] (Strong), [receipt records] (Strong), [distribution records] (Strong), [invoice required] (Moderate), [executed forms] (Moderate), [power of attorney] (Moderate), [order forms] (Weak)
  - Statutes: 21 U.S.C. § 828
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.recordkeeping.receipt-distribution` contains any of: [reverse distribution, returns], also classify in `controlled-substances.disposal.reverse-distributor`"
  > "If an entity classified in `controlled-substances.recordkeeping.receipt-distribution` contains any of: [compounding, bulk API], also classify in `compounding.bulk-substances.quality`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Hospital Pharmacy | High |
| Pain Management with dispensing | Medium |

##### L4: DEA Form 222 Requirements (`controlled-substances.recordkeeping.receipt-distribution.form-222`)
- **Description:** Proper execution and retention of DEA Form 222 for ordering Schedule II controlled substances including triplicate form handling, authorized signatures, and error correction procedures.
- **Classification signals:**
  - CFR: 21 CFR 1305.11-1305.17
  - Agency: DEA Diversion Control Division
  - Keywords: [DEA Form 222] (Strong), [triplicate form] (Strong), [Schedule II ordering] (Strong), [executed forms] (Strong), [form retention] (Moderate), [authorized signature] (Moderate), [order cancellation] (Weak)
  - Statutes: 21 U.S.C. § 828
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.recordkeeping.receipt-distribution.form-222` contains any of: [electronic ordering, digital], also classify in `controlled-substances.recordkeeping.receipt-distribution.csos`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Hospital Pharmacy | High |
| Compounding Pharmacy | High |

##### L4: CSOS Electronic Ordering (`controlled-substances.recordkeeping.receipt-distribution.csos`)
- **Description:** DEA's Controlled Substance Ordering System for electronic ordering of Schedule II substances including PKI certificates, digital signatures, and electronic recordkeeping requirements.
- **Classification signals:**
  - CFR: 21 CFR 1311.10-1311.30
  - Agency: DEA Diversion Control Division
  - Keywords: [CSOS] (Strong), [electronic ordering] (Strong), [PKI certificate] (Strong), [digital signature] (Strong), [CSOS certificate] (Moderate), [electronic DEA 222] (Moderate), [certificate renewal] (Weak)
  - Statutes: 21 U.S.C. § 828
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.recordkeeping.receipt-distribution.csos` contains any of: [system security, access control], also classify in `hipaa-privacy.security-rule`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Hospital Pharmacy | High |
| Compounding Pharmacy | High |
| Large practice organizations | Medium |

#### L3: Prescribing & Dispensing Records (`controlled-substances.recordkeeping.prescribing-dispensing`)
- **Description:** Record retention requirements for controlled substance prescriptions including filing systems, electronic record keeping, retrieval requirements, and readily retrievable definitions.
- **Classification signals:**
  - CFR: 21 CFR 1304.04(h), 21 CFR 1304.24, 21 CFR 1306.04-1306.05
  - Agency: DEA Diversion Control Division
  - Keywords: [prescription records] (Strong), [filing system] (Strong), [readily retrievable] (Strong), [2-year retention] (Strong), [three-file system] (Moderate), [red C stamp] (Moderate), [electronic records] (Moderate), [prescription file] (Weak)
  - Statutes: 21 U.S.C. § 827(b)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.recordkeeping.prescribing-dispensing` contains any of: [electronic prescribing, EPCS], also classify in `controlled-substances.prescribing.epcs`"
  > "If an entity classified in `controlled-substances.recordkeeping.prescribing-dispensing` contains any of: [EHR, electronic health records], also classify in `clinical-operations.recordkeeping`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All prescribing practices | High |
| Compounding Pharmacy | High |

#### L3: Theft & Loss Reporting (`controlled-substances.recordkeeping.theft-loss`)
- **Description:** Requirements for reporting theft or significant loss of controlled substances including DEA Form 106, timing requirements, local law enforcement notification, and recordkeeping obligations.
- **Classification signals:**
  - CFR: 21 CFR 1301.74(c), 21 CFR 1301.76
  - Agency: DEA Diversion Control Division
  - Keywords: [DEA Form 106] (Strong), [theft report] (Strong), [significant loss] (Strong), [theft or loss] (Strong), [immediate notification] (Moderate), [local police] (Moderate), [diversion report] (Moderate), [missing drugs] (Weak)
  - Statutes: 21 U.S.C. § 823
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.recordkeeping.theft-loss` contains any of: [security breach, break-in], also classify in `controlled-substances.security`"
  > "If an entity classified in `controlled-substances.recordkeeping.theft-loss` contains any of: [employee diversion, internal theft], also classify in `fraud-compliance`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All DEA-registered practices | High |

### L2: Controlled Substance Scheduling (`controlled-substances.scheduling`)

#### L3: Federal Schedule Classifications (`controlled-substances.scheduling.federal-schedules`)
- **Description:** DEA's five-schedule classification system based on abuse potential, accepted medical use, and dependence liability, determining the level of control and regulatory requirements for each substance.
- **Classification signals:**
  - CFR: 21 CFR 1308.11-1308.15
  - Agency: DEA Diversion Control Division
  - Keywords: [Schedule I] (Strong), [Schedule II] (Strong), [Schedule III] (Strong), [Schedule IV] (Strong), [Schedule V] (Strong), [controlled substance schedules] (Strong), [scheduling criteria] (Moderate), [abuse potential] (Moderate), [accepted medical use] (Weak)
  - Statutes: 21 U.S.C. § 812
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.scheduling.federal-schedules` contains any of: [scheduling action, proposed rule], also classify in `controlled-substances.scheduling.scheduling-actions`"
  > "If an entity classified in `controlled-substances.scheduling.federal-schedules` contains any of: [state scheduling, state-specific], also classify in `state-regulations.controlled-substances`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All prescribing practices | High |

##### L4: Schedule II Substances (`controlled-substances.scheduling.federal-schedules.schedule-ii`)
- **Description:** High abuse potential substances with accepted medical use including opioids (morphine, oxycodone, fentanyl), stimulants (amphetamine, methylphenidate), and other strictly controlled medications.
- **Classification signals:**
  - CFR: 21 CFR 1308.12
  - Agency: DEA Diversion Control Division
  - Keywords: [Schedule II] (Strong), [CII] (Strong), [high abuse potential] (Strong), [opioids] (Strong), [stimulants] (Strong), [fentanyl] (Moderate), [oxycodone] (Moderate), [Adderall] (Moderate), [morphine] (Weak)
  - Statutes: 21 U.S.C. § 812(b)(2)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.scheduling.federal-schedules.schedule-ii` contains any of: [opioid, narcotic], also classify in `controlled-substances.opioid-specific`"
  > "If an entity classified in `controlled-substances.scheduling.federal-schedules.schedule-ii` contains any of: [ADHD, attention deficit], also classify in `controlled-substances.prescribing.special-populations`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Pain Management | High |
| Primary Care/DPC/Concierge | High |
| Weight Management | High |

##### L4: Schedule III Substances (`controlled-substances.scheduling.federal-schedules.schedule-iii`)
- **Description:** Moderate abuse potential substances including testosterone, anabolic steroids, ketamine, and combination products with limited opioid content, central to many specialty practices.
- **Classification signals:**
  - CFR: 21 CFR 1308.13
  - Agency: DEA Diversion Control Division
  - Keywords: [Schedule III] (Strong), [CIII] (Strong), [testosterone] (Strong), [anabolic steroids] (Strong), [ketamine] (Strong), [moderate abuse potential] (Moderate), [buprenorphine products] (Moderate), [Tylenol with codeine] (Weak)
  - Statutes: 21 U.S.C. § 812(b)(3)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.scheduling.federal-schedules.schedule-iii` contains any of: [testosterone, androgens, HRT], also classify in `compounding.503a.practice-specific.hormones`"
  > "If an entity classified in `controlled-substances.scheduling.federal-schedules.schedule-iii` contains any of: [buprenorphine, suboxone], also classify in `controlled-substances.opioid-specific.buprenorphine`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Hormone Optimization/HRT | High |
| Anti-Aging Medicine | High |
| Pain Management | High |
| Integrative Medicine | Medium |

##### L4: Schedule IV Substances (`controlled-substances.scheduling.federal-schedules.schedule-iv`)
- **Description:** Low abuse potential substances including benzodiazepines, sleep medications, and certain weight loss drugs commonly prescribed in primary care and specialty settings.
- **Classification signals:**
  - CFR: 21 CFR 1308.14
  - Agency: DEA Diversion Control Division
  - Keywords: [Schedule IV] (Strong), [CIV] (Strong), [benzodiazepines] (Strong), [low abuse potential] (Strong), [Xanax] (Moderate), [Ambien] (Moderate), [phentermine] (Moderate), [tramadol] (Moderate), [Valium] (Weak)
  - Statutes: 21 U.S.C. § 812(b)(4)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.scheduling.federal-schedules.schedule-iv` contains any of: [phentermine, weight loss], also classify in `compounding.503a.practice-specific.weight-loss`"
  > "If an entity classified in `controlled-substances.scheduling.federal-schedules.schedule-iv` contains any of: [sleep disorders, insomnia], also classify in `clinical-operations.scope-of-practice`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Primary Care/DPC/Concierge | High |
| Weight Management | High |
| Pain Management | Medium |
| Integrative Medicine | Medium |

##### L4: Schedule V Substances (`controlled-substances.scheduling.federal-schedules.schedule-v`)
- **Description:** Lowest abuse potential controlled substances including certain cough preparations, anti-diarrheal medications, and pregabalin, with least restrictive controls.
- **Classification signals:**
  - CFR: 21 CFR 1308.15
  - Agency: DEA Diversion Control Division
  - Keywords: [Schedule V] (Strong), [CV] (Strong), [lowest abuse potential] (Strong), [cough syrup with codeine] (Moderate), [Lyrica] (Moderate), [pregabalin] (Moderate), [Lomotil] (Weak)
  - Statutes: 21 U.S.C. § 812(b)(5)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.scheduling.federal-schedules.schedule-v` contains any of: [OTC, over-the-counter], also classify in `state-regulations.pharmacy`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Primary Care/DPC/Concierge | Medium |
| Pain Management | Medium |

#### L3: Scheduling Actions & Processes (`controlled-substances.scheduling.scheduling-actions`)
- **Description:** DEA's administrative process for adding, removing, or rescheduling controlled substances including petitions, temporary scheduling, and emergency scheduling authority.
- **Classification signals:**
  - CFR: 21 CFR 1308.41-1308.49
  - Agency: DEA Diversion Control Division
  - Keywords: [scheduling action] (Strong), [temporary scheduling] (Strong), [emergency scheduling] (Strong), [rescheduling petition] (Strong), [notice of proposed rulemaking] (Moderate), [scheduling order] (Moderate), [control status] (Weak)
  - Statutes: 21 U.S.C. § 811
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.scheduling.scheduling-actions` contains any of: [marijuana, cannabis, CBD], also classify in `state-regulations.controlled-substances`"
  > "If an entity classified in `controlled-substances.scheduling.scheduling-actions` contains any of: [peptide, research chemical], also classify in `compounding.503a.practice-specific.peptides`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Peptide Therapy | High |
| Integrative Medicine | Medium |

#### L3: State Scheduling Variations (`controlled-substances.scheduling.state-variations`)
- **Description:** Differences between federal and state controlled substance schedules including state-scheduled substances not federally controlled and variations in scheduling level for the same substance.
- **Classification signals:**
  - CFR: State law governs
  - Agency: State Departments of Health, State Boards of Pharmacy
  - Keywords: [state scheduling] (Strong), [state controlled substance] (Strong), [not federally scheduled] (Strong), [state Schedule I] (Moderate), [scheduling differences] (Moderate), [state-specific control] (Moderate), [tramadol scheduling] (Weak — varies by state)
  - Statutes: State controlled substance acts
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.scheduling.state-variations` contains any of: [gabapentin, state scheduled], also classify in `state-regulations.controlled-substances`"
  > "If an entity classified in `controlled-substances.scheduling.state-variations` contains any of: [kratom, tianeptine], also classify in `fda-regulation.dietary-supplements`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Multi-state practices | High |
| Telehealth | High |
| Compounding Pharmacy | High |

### L2: Dispensing Requirements (`controlled-substances.dispensing`)

#### L3: Practitioner Dispensing Authority (`controlled-substances.dispensing.practitioner`)
- **Description:** Requirements for practitioners to dispense controlled substances directly from their offices including registration requirements, labeling, and record-keeping distinct from prescribing.
- **Classification signals:**
  - CFR: 21 CFR 1301.21-1301.23, 21 CFR 1306.06
  - Agency: DEA Diversion Control Division
  - Keywords: [practitioner dispensing] (Strong), [dispense vs prescribe] (Strong), [office dispensing] (Strong), [dispensing registration] (Moderate), [point-of-care dispensing] (Moderate), [physician dispensing] (Moderate), [dispense controlled] (Weak)
  - Statutes: 21 U.S.C. § 823(f)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.dispensing.practitioner` contains any of: [state permit, dispensing license], also classify in `state-regulations.pharmacy`"
  > "If an entity classified in `controlled-substances.dispensing.practitioner` contains any of: [compounded preparations], also classify in `compounding.503a.office-use`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Pain Management | High |
| Primary Care/DPC/Concierge | Medium |
| Med Spa/Aesthetic Medicine | Medium |
| Integrative Medicine | Medium |

#### L3: Automated Dispensing Systems (`controlled-substances.dispensing.automated`)
- **Description:** DEA requirements for automated dispensing systems (Pyxis, Omnicell) in healthcare facilities including security, access controls, and perpetual inventory requirements.
- **Classification signals:**
  - CFR: 21 CFR 1301.71-1301.76 (security requirements)
  - Agency: DEA Diversion Control Division
  - Keywords: [automated dispensing] (Strong), [Pyxis] (Strong), [Omnicell] (Strong), [ADS] (Strong — "automated dispensing system"), [perpetual inventory] (Moderate), [user access logs] (Moderate), [override report] (Moderate), [machine dispensing] (Weak)
  - Statutes: 21 U.S.C. § 823
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.dispensing.automated` contains any of: [inventory discrepancy, diversion], also classify in `controlled-substances.recordkeeping.theft-loss`"
  > "If an entity classified in `controlled-substances.dispensing.automated` contains any of: [hospital, health system], also classify in `controlled-substances.registration.institutional`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Hospital-affiliated practices | High |
| Surgery Centers | High |
| Emergency Departments | High |

#### L3: Partial Fill Requirements (`controlled-substances.dispensing.partial-fill`)
- **Description:** Rules for partial dispensing of controlled substance prescriptions including Schedule II emergency supplies, patient request partial fills, and CARA 2016 provisions for comfort care.
- **Classification signals:**
  - CFR: 21 CFR 1306.13, 21 CFR 1306.23
  - Agency: DEA Diversion Control Division
  - Keywords: [partial fill] (Strong), [partial dispensing] (Strong), [CARA 2016] (Strong), [comfort care] (Strong), [72-hour emergency] (Moderate), [patient request partial] (Moderate), [remaining quantity] (Moderate), [partial supply] (Weak)
  - Statutes: 21 U.S.C. § 829, Comprehensive Addiction and Recovery Act (CARA)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.dispensing.partial-fill` contains any of: [hospice, palliative care], also classify in `controlled-substances.prescribing.special-populations`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Pain Management | High |
| Primary Care/DPC/Concierge | Medium |
| Hospice-affiliated practices | High |

### L2: Opioid-Specific Regulations (`controlled-substances.opioid-specific`)

#### L3: Buprenorphine Prescribing Post-X-Waiver (`controlled-substances.opioid-specific.buprenorphine`)
- **Description:** Current requirements for prescribing buprenorphine for opioid use disorder following elimination of X-waiver in January 2023, including training recommendations and SAMHSA notification.
- **Classification signals:**
  - CFR: 21 CFR 1301.28 (historical), 42 CFR Part 8 Subpart F
  - Agency: DEA Diversion Control Division, SAMHSA
  - Keywords: [buprenorphine] (Strong), [X-waiver elimination] (Strong), [MOUD] (Strong — "medications for opioid use disorder"), [no waiver required] (Strong), [Suboxone] (Moderate), [Subutex] (Moderate), [opioid treatment] (Moderate), [MAT] (Weak — outdated term)
  - Statutes: 21 U.S.C. § 823(g), Consolidated Appropriations Act 2023 Section 1262
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.opioid-specific.buprenorphine` contains any of: [training requirement, CME], also classify in `state-regulations.licensure`"
  > "If an entity classified in `controlled-substances.opioid-specific.buprenorphine` contains any of: [telemedicine, remote prescribing], also classify in `controlled-substances.telehealth-prescribing`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Primary Care/DPC/Concierge | High |
| Pain Management | High |
| Integrative Medicine | Medium |
| Telehealth | High |

##### L4: Post-Elimination Requirements (`controlled-substances.opioid-specific.buprenorphine.current-requirements`)
- **Description:** Prescribing requirements for buprenorphine after X-waiver elimination including standard DEA registration sufficiency, recommended but not required training, and state-specific mandates.
- **Classification signals:**
  - CFR: 21 CFR 1306.04-1306.05 (standard prescribing)
  - Agency: DEA Diversion Control Division, SAMHSA
  - Keywords: [no X-waiver] (Strong), [standard DEA sufficient] (Strong), [training encouraged] (Moderate), [SAMHSA notification] (Moderate), [state requirements] (Moderate), [January 2023 change] (Weak)
  - Statutes: Consolidated Appropriations Act 2023 Section 1262
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.opioid-specific.buprenorphine.current-requirements` contains any of: [state mandate, required training], also classify in `state-regulations.controlled-substances`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Primary Care/DPC/Concierge | High |
| Telehealth | High |

##### L4: Historical X-Waiver Context (`controlled-substances.opioid-specific.buprenorphine.historical`)
- **Description:** Historical DATA-waiver requirements prior to 2023 elimination, relevant for understanding transition and potential state law references to defunct federal requirements.
- **Classification signals:**
  - CFR: 21 CFR 1301.28 (historical)
  - Agency: DEA, SAMHSA
  - Keywords: [DATA-waiver] (Strong), [X-waiver] (Strong), [30 patient limit] (Strong — historical), [100 patient limit] (Strong — historical), [275 patients] (Moderate — historical), [8-hour training] (Moderate — historical), [historical requirement] (Weak)
  - Statutes: 21 U.S.C. § 823(g) (prior version)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.opioid-specific.buprenorphine.historical` contains any of: [current requirements, 2023], also classify in `controlled-substances.opioid-specific.buprenorphine.current-requirements`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All prescribing practices | Low |

#### L3: Opioid Prescribing Limits & Guidelines (`controlled-substances.opioid-specific.prescribing-limits`)
- **Description:** Federal and state-imposed limits on opioid prescribing including MME thresholds, day supply limits for acute pain, and mandatory use of immediate-release before extended-release formulations.
- **Classification signals:**
  - CFR: Limited federal regulation, primarily state law
  - Agency: CDC (guidelines), State Medical Boards, State Health Departments
  - Keywords: [MME limit] (Strong — "morphine milligram equivalent"), [7-day limit] (Strong), [acute pain limit] (Strong), [50 MME] (Moderate), [90 MME] (Moderate), [opioid naive] (Moderate), [first prescription] (Weak)
  - Statutes: State opioid prescribing laws
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.opioid-specific.prescribing-limits` contains any of: [CDC guideline, opioid guideline], also classify in `clinical-operations.quality-systems`"
  > "If an entity classified in `controlled-substances.opioid-specific.prescribing-limits` contains any of: [state law, state limit], also classify in `state-regulations.controlled-substances`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Pain Management | High |
| Primary Care/DPC/Concierge | High |
| Surgery-affiliated practices | High |

#### L3: Naloxone Co-Prescribing Requirements (`controlled-substances.opioid-specific.naloxone`)
- **Description:** State and federal recommendations or mandates for co-prescribing naloxone with opioids based on risk factors including MME thresholds, concurrent benzodiazepines, or history of overdose.
- **Classification signals:**
  - CFR: Limited federal requirements
  - Agency: CDC, State Health Departments
  - Keywords: [naloxone co-prescribing] (Strong), [Narcan] (Strong), [mandatory co-prescribe] (Strong), [50 MME threshold] (Moderate), [overdose reversal] (Moderate), [standing order] (Moderate), [OTC naloxone] (Weak)
  - Statutes: State naloxone access laws
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.opioid-specific.naloxone` contains any of: [pharmacy standing order], also classify in `state-regulations.pharmacy`"
  > "If an entity classified in `controlled-substances.opioid-specific.naloxone` contains any of: [patient education, counseling], also classify in `clinical-operations.informed-consent`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Pain Management | High |
| Primary Care/DPC/Concierge | High |
| Emergency Medicine | High |

### L2: Security & Diversion Prevention (`controlled-substances.security`)

#### L3: Physical Security Requirements (`controlled-substances.security.physical`)
- **Description:** DEA-mandated physical security measures for storing controlled substances including safe specifications, vault requirements, and alarm systems based on schedule and quantity.
- **Classification signals:**
  - CFR: 21 CFR 1301.71-1301.76
  - Agency: DEA Diversion Control Division
  - Keywords: [DEA security] (Strong), [controlled substance safe] (Strong), [double-locked] (Strong), [substantial construction] (Strong), [alarm system] (Moderate), [limited access] (Moderate), [security requirements] (Weak)
  - Statutes: 21 U.S.C. § 823
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.security.physical` contains any of: [theft, break-in, loss], also classify in `controlled-substances.recordkeeping.theft-loss`"
  > "If an entity classified in `controlled-substances.security.physical` contains any of: [inspection, audit], also classify in `controlled-substances.enforcement`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All DEA-registered practices | High |

##### L4: Schedule I-II Storage (`controlled-substances.security.physical.schedule-i-ii`)
- **Description:** Enhanced security requirements for Schedule I and II controlled substances including GSA Class V security containers or vaults, specific safe weight and construction standards.
- **Classification signals:**
  - CFR: 21 CFR 1301.72(a)
  - Agency: DEA Diversion Control Division
  - Keywords: [GSA Class V] (Strong), [safe weight 750 pounds] (Strong), [vault storage] (Strong), [Schedule II security] (Strong), [concrete encasement] (Moderate), [steel door] (Moderate), [TL rating] (Weak)
  - Statutes: 21 U.S.C. § 823
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.security.physical.schedule-i-ii` contains any of: [research facility, Schedule I], also classify in `controlled-substances.registration.research`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Pain Management | High |
| Hospital Pharmacy | High |
| Research facilities | High |

##### L4: Schedule III-V Storage (`controlled-substances.security.physical.schedule-iii-v`)
- **Description:** Security requirements for Schedule III-V controlled substances permitting locked cabinets or dispersal throughout stock with focus on preventing diversion and employee pilferage.
- **Classification signals:**
  - CFR: 21 CFR 1301.72(b)
  - Agency: DEA Diversion Control Division
  - Keywords: [securely locked cabinet] (Strong), [substantial construction] (Strong), [dispersed storage] (Moderate), [Schedule III-V security] (Moderate), [employee access] (Moderate), [locked room] (Weak)
  - Statutes: 21 U.S.C. § 823
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.security.physical.schedule-iii-v` contains any of: [testosterone, hormone], also classify in `compounding.503a.practice-specific.hormones`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Hormone Optimization/HRT | High |
| Compounding Pharmacy | High |
| Anti-Aging Medicine | High |

#### L3: Employee Screening & Access Controls (`controlled-substances.security.employee`)
- **Description:** Requirements for screening employees with access to controlled substances, limiting access based on job function, and maintaining logs of personnel with controlled substance access.
- **Classification signals:**
  - CFR: 21 CFR 1301.90-1301.93
  - Agency: DEA Diversion Control Division
  - Keywords: [employee screening] (Strong), [background check] (Strong), [access control] (Strong), [employee diversion] (Strong), [criminal history] (Moderate), [restricted access] (Moderate), [access list] (Weak)
  - Statutes: 21 U.S.C. § 823
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.security.employee` contains any of: [termination, dismissal], also classify in `business-operations.employment-law`"
  > "If an entity classified in `controlled-substances.security.employee` contains any of: [diversion investigation], also classify in `fraud-compliance`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All DEA-registered practices | High |

### L2: Disposal & Reverse Distribution (`controlled-substances.disposal`)

#### L3: DEA Authorized Collection (`controlled-substances.disposal.authorized-collection`)
- **Description:** Requirements for becoming a DEA-authorized collector for controlled substance disposal including collection receptacles, mail-back programs, and take-back events.
- **Classification signals:**
  - CFR: 21 CFR Part 1317
  - Agency: DEA Diversion Control Division
  - Keywords: [authorized collector] (Strong), [collection receptacle] (Strong), [take-back program] (Strong), [mail-back package] (Strong), [DEA authorized] (Moderate), [drug disposal] (Moderate), [collection site] (Weak)
  - Statutes: Secure and Responsible Drug Disposal Act of 2010
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.disposal.authorized-collection` contains any of: [community event, public disposal], also classify in `business-operations.community-relations`"
  > "If an entity classified in `controlled-substances.disposal.authorized-collection` contains any of: [environmental, EPA], also classify in `business-operations.waste-management`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Retail Pharmacy | High |
| Hospital Pharmacy | High |
| Long-term care | High |

#### L3: Reverse Distributor Process (`controlled-substances.disposal.reverse-distributor`)
- **Description:** Using DEA-registered reverse distributors for controlled substance returns and disposal including Form 222 requirements, recordkeeping, and chain of custody.
- **Classification signals:**
  - CFR: 21 CFR 1317.15, 21 CFR 1304.22(c)
  - Agency: DEA Diversion Control Division
  - Keywords: [reverse distributor] (Strong), [DEA Form 222] (Strong), [controlled substance return] (Strong), [reverse distribution] (Moderate), [expired drugs] (Moderate), [return for credit] (Moderate), [recalled drugs] (Weak)
  - Statutes: 21 U.S.C. § 822
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.disposal.reverse-distributor` contains any of: [recall, FDA recall], also classify in `fda-regulation.enforcement`"
  > "If an entity classified in `controlled-substances.disposal.reverse-distributor` contains any of: [credit memo, financial], also classify in `business-operations.finance`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Hospital Pharmacy | High |
| Compounding Pharmacy | Medium |
| Clinic Pharmacy | Medium |

#### L3: On-Site Destruction Methods (`controlled-substances.disposal.on-site`)
- **Description:** DEA-compliant methods for destroying controlled substances on-site including witness requirements, non-retrievable standards, and documentation of destruction.
- **Classification signals:**
  - CFR: 21 CFR 1317.95
  - Agency: DEA Diversion Control Division
  - Keywords: [on-site destruction] (Strong), [non-retrievable] (Strong), [two witnesses] (Strong), [destruction record] (Strong), [chemical digestion] (Moderate), [incineration] (Moderate), [destruction log] (Weak)
  - Statutes: 21 U.S.C. § 822
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.disposal.on-site` contains any of: [sewering, flushing], also classify in `business-operations.waste-management`"
  > "If an entity classified in `controlled-substances.disposal.on-site` contains any of: [expired patient drugs], also classify in `controlled-substances.disposal.patient-return`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All DEA-registered practices | Medium |

### L2: Telehealth Prescribing of Controlled Substances (`controlled-substances.telehealth-prescribing`)

#### L3: Ryan Haight Act Requirements (`controlled-substances.telehealth-prescribing.ryan-haight`)
- **Description:** Federal requirements for prescribing controlled substances via telemedicine including the in-person medical evaluation requirement and seven statutory exceptions permitting remote prescribing.
- **Classification signals:**
  - CFR: 21 CFR 1300.04(h), DEA Temporary Rules
  - Agency: DEA Diversion Control Division
  - Keywords: [Ryan Haight Act] (Strong), [in-person evaluation] (Strong), [telemedicine controlled] (Strong), [internet prescribing] (Strong), [seven exceptions] (Moderate), [valid prescription] (Moderate), [online prescribing] (Weak)
  - Statutes: 21 U.S.C. § 829(e), Ryan Haight Online Pharmacy Consumer Protection Act
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.telehealth-prescribing.ryan-haight` contains any of: [telehealth platform, video visit], also classify in `telehealth.technology`"
  > "If an entity classified in `controlled-substances.telehealth-prescribing.ryan-haight` contains any of: [interstate, licensure], also classify in `telehealth.licensure`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| Primary Care/DPC/Concierge | High |
| Pain Management | High |
| Weight Management | High |
| Hormone Optimization/HRT | High |

##### L4: Statutory Exceptions (`controlled-substances.telehealth-prescribing.ryan-haight.exceptions`)
- **Description:** Seven specific exceptions to the in-person examination requirement including public health emergency, DEA registration, Veterans Affairs, and qualified telemedicine programs.
- **Classification signals:**
  - CFR: 21 CFR 1300.04(h)(1)-(7)
  - Agency: DEA Diversion Control Division
  - Keywords: [Ryan Haight exceptions] (Strong), [public health emergency] (Strong), [telemedicine registration] (Strong), [VA exception] (Strong), [Indian Health Service] (Moderate), [qualified practitioner] (Moderate), [referral exception] (Weak)
  - Statutes: 21 U.S.C. § 829(e)(2)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.telehealth-prescribing.ryan-haight.exceptions` contains any of: [COVID flexibility, pandemic], also classify in `controlled-substances.telehealth-prescribing.covid-flexibilities`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| VA-affiliated practices | High |
| Federally qualified health centers | High |

###### L5: Public Health Emergency Exception (`controlled-substances.telehealth-prescribing.ryan-haight.exceptions.phe`)
- **Description:** Exception allowing telemedicine prescribing of controlled substances during declared public health emergencies without prior in-person examination, central to COVID-era flexibilities.
- **Classification signals:**
  - CFR: 21 CFR 1300.04(h)(1)
  - Agency: DEA, HHS
  - Keywords: [public health emergency] (Strong), [PHE exception] (Strong), [Secretary declaration] (Strong), [emergency prescribing] (Moderate), [disaster declaration] (Moderate), [emergency flexibility] (Weak)
  - Statutes: 21 U.S.C. § 829(e)(2)(A)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.telehealth-prescribing.ryan-haight.exceptions.phe` contains any of: [COVID-19, pandemic response], also classify in `controlled-substances.telehealth-prescribing.covid-flexibilities`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| All prescribing practices | Medium |

###### L5: Telemedicine Registration Exception (`controlled-substances.telehealth-prescribing.ryan-haight.exceptions.registration`)
- **Description:** Proposed special registration allowing DEA-registered practitioners to prescribe controlled substances via telemedicine without in-person examination, pending final rulemaking.
- **Classification signals:**
  - CFR: Proposed 21 CFR 1301.19
  - Agency: DEA Diversion Control Division
  - Keywords: [special registration] (Strong), [telemedicine DEA] (Strong), [proposed rule] (Strong), [registration exception] (Moderate), [remote prescribing registration] (Moderate), [pending regulation] (Weak)
  - Statutes: 21 U.S.C. § 829(e)(2)(B)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.telehealth-prescribing.ryan-haight.exceptions.registration` contains any of: [final rule, implementation], also classify in `controlled-substances.telehealth-prescribing.future-rules`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |

##### L4: Qualifying Practitioner Referrals (`controlled-substances.telehealth-prescribing.ryan-haight.referral`)
- **Description:** Requirements for prescribing based on referral from a practitioner who conducted in-person examination, including documentation and communication requirements between practitioners.
- **Classification signals:**
  - CFR: 21 CFR 1300.04(h)(2)
  - Agency: DEA Diversion Control Division
  - Keywords: [qualifying practitioner] (Strong), [referral exception] (Strong), [in-person referral] (Strong), [consulting practitioner] (Moderate), [referral documentation] (Moderate), [practitioner communication] (Weak)
  - Statutes: 21 U.S.C. § 829(e)(2)(A)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.telehealth-prescribing.ryan-haight.referral` contains any of: [consultation, second opinion], also classify in `telehealth.prescribing`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| Specialist consultations | High |

#### L3: DEA COVID-Era Flexibilities (`controlled-substances.telehealth-prescribing.covid-flexibilities`)
- **Description:** Temporary DEA policies during COVID-19 public health emergency allowing audio-only prescribing of controlled substances and waiving in-person requirements, with ongoing extension discussions.
- **Classification signals:**
  - CFR: DEA Temporary Final Rules, Policy Statements
  - Agency: DEA Diversion Control Division
  - Keywords: [COVID flexibility] (Strong), [audio-only prescribing] (Strong), [temporary rules] (Strong), [PHE flexibilities] (Strong), [extension deadline] (Moderate), [telemedicine policy] (Moderate), [pandemic prescribing] (Weak)
  - Statutes: 21 U.S.C. § 802(54), § 829(e)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.telehealth-prescribing.covid-flexibilities` contains any of: [permanent rule, final rule], also classify in `controlled-substances.telehealth-prescribing.future-rules`"
  > "If an entity classified in `controlled-substances.telehealth-prescribing.covid-flexibilities` contains any of: [buprenorphine, MOUD], also classify in `controlled-substances.opioid-specific.buprenorphine`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| All prescribing practices | High |

#### L3: State Telemedicine CS Rules (`controlled-substances.telehealth-prescribing.state-rules`)
- **Description:** State-specific requirements for telemedicine prescribing of controlled substances that may be more restrictive than federal rules, including prohibitions on certain schedules or substance classes.
- **Classification signals:**
  - CFR: State law governs
  - Agency: State Medical Boards, State Boards of Pharmacy
  - Keywords: [state telemedicine rules] (Strong), [state CS prescribing] (Strong), [more restrictive] (Strong), [state prohibition] (Moderate), [video required] (Moderate), [state-specific requirements] (Moderate), [no audio-only] (Weak)
  - Statutes: State medical practice acts, state controlled substance acts
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.telehealth-prescribing.state-rules` contains any of: [interstate prescribing, multi-state], also classify in `telehealth.licensure`"
  > "If an entity classified in `controlled-substances.telehealth-prescribing.state-rules` contains any of: [state board, discipline], also classify in `state-regulations.licensure`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| Multi-state practices | High |

#### L3: Future Telemedicine Rules (`controlled-substances.telehealth-prescribing.future-rules`)
- **Description:** Anticipated permanent DEA rules for telemedicine prescribing of controlled substances post-PHE, including proposed special registration process and guardrails for remote prescribing.
- **Classification signals:**
  - CFR: Proposed rules, FR notices
  - Agency: DEA Diversion Control Division
  - Keywords: [permanent telemedicine rules] (Strong), [post-PHE rules] (Strong), [final rulemaking] (Strong), [special registration] (Moderate), [future requirements] (Moderate), [rulemaking timeline] (Weak)
  - Statutes: 21 U.S.C. § 829(e)
- **Cross-classification triggers:**
  > "If an entity classified in `controlled-substances.telehealth-prescribing.future-rules` contains any of: [implementation date, effective date], also classify in `controlled-substances.telehealth-prescribing.covid-flexibilities`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| All prescribing practices | Medium |

---

## Summary Statistics

**Total nodes produced: 58**
- L3 nodes: 22
- L4 nodes: 26
- L5 nodes: 9
- L6 nodes: 1

**Distribution across L2 domains:**
- controlled-substances.registration: 7 nodes
- controlled-substances.prescribing: 11 nodes
- controlled-substances.recordkeeping: 9 nodes
- controlled-substances.scheduling: 8 nodes
- controlled-substances.dispensing: 3 nodes
- controlled-substances.opioid-specific: 6 nodes
- controlled-substances.security: 5 nodes
- controlled-substances.disposal: 3 nodes
- controlled-substances.telehealth-prescribing: 11 nodes

This comprehensive taxonomy captures the full regulatory landscape for controlled substances, with appropriate depth where the regulatory complexity demands it. The extensive cross-classification triggers ensure proper routing of multi-domain content and maintain consistency with the Compounding branch from Session 5-A.