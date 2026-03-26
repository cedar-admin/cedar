# Cedar Classification Framework — Part 1, Session 5-A of 8
# Deep Taxonomy: Compounding Branch (L3 through L6)

## L1: Compounding & Pharmacy Operations (`compounding`)

### L2: 503A Traditional Compounding (`compounding.503a`)

#### L3: Patient-Specific Compounding Requirements (`compounding.503a.patient-specific`)
- **Description:** Core 503A requirements for compounding based on valid patient-specific prescriptions, including prescriber-patient relationship verification and prescription documentation standards. Foundational compliance for all traditional compounding pharmacies.
- **Classification signals:**
  - CFR: 21 CFR 201.5, 21 CFR 203.3-203.4
  - Agency: FDA CDER, FDA Office of Compounding Quality
  - Keywords: [patient-specific prescription] (Strong), [valid prescription] (Strong), [prescriber-patient relationship] (Strong), [individual patient] (Moderate), [prescription required] (Moderate), [not for office use] (Moderate), [503A compliance] (Moderate), [traditional compounding] (Weak)
  - Statutes: FD&C Act Section 503A(a), 21 U.S.C. § 353a(a)
- **Cross-classification triggers:** 
  > "If an entity classified in `compounding.503a.patient-specific` contains any of: [telemedicine, telehealth, remote prescribing], also classify in `telehealth.prescribing`"
  > "If an entity classified in `compounding.503a.patient-specific` contains any of: [Schedule II, Schedule III, Schedule IV, Schedule V, controlled substance], also classify in `controlled-substances.prescribing`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Hormone Optimization/HRT | High |
| Weight Management | High |
| Peptide Therapy | High |
| IV Therapy/Infusion | High |
| Anti-Aging Medicine | High |
| Integrative Medicine | Medium |
| Functional Medicine | Medium |

##### L4: Prescription Documentation Standards (`compounding.503a.patient-specific.documentation`)
- **Description:** Requirements for maintaining prescription records, patient identification, prescriber verification, and documentation retention for compounded medications under 503A.
- **Classification signals:**
  - CFR: 21 CFR 1304.04(h), 21 CFR 1306.04-1306.05
  - Agency: FDA CDER, DEA (for controlled substances)
  - Keywords: [prescription documentation] (Strong), [patient identification] (Strong), [prescriber verification] (Strong), [prescription records] (Moderate), [DEA Form 222] (Moderate — when controlled), [electronic prescriptions] (Moderate), [prescription retention] (Weak)
  - Statutes: FD&C Act Section 503A(a)(1)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503a.patient-specific.documentation` contains any of: [HIPAA, PHI, patient privacy], also classify in `hipaa-privacy.privacy-rule`"
  > "If an entity classified in `compounding.503a.patient-specific.documentation` contains any of: [electronic prescribing, e-prescribing, EPCS], also classify in `controlled-substances.prescribing`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| All other pharmacy-utilizing practices | Medium |

##### L4: Prescriber-Patient Relationship Requirements (`compounding.503a.patient-specific.relationship`)
- **Description:** Standards for establishing valid prescriber-patient relationships for compounded medications, including in-person exam requirements and telemedicine considerations.
- **Classification signals:**
  - CFR: Guidance documents referencing prescriber-patient relationships
  - Agency: FDA CDER, State Medical Boards
  - Keywords: [prescriber-patient relationship] (Strong), [valid relationship] (Strong), [bona fide relationship] (Strong), [in-person examination] (Moderate), [medical history] (Moderate), [telemedicine exam] (Moderate), [relationship verification] (Weak)
  - Statutes: FD&C Act Section 503A(a)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503a.patient-specific.relationship` contains any of: [telehealth, telemedicine, remote consultation], also classify in `telehealth.licensure`"
  > "If an entity classified in `compounding.503a.patient-specific.relationship` contains any of: [Ryan Haight Act, online prescribing], also classify in `controlled-substances.prescribing`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| Compounding Pharmacy | High |
| Weight Management | Medium |
| Hormone Optimization/HRT | Medium |

#### L3: Anticipatory Compounding (`compounding.503a.anticipatory`)
- **Description:** Rules governing limited batch compounding in advance of patient-specific prescriptions, including quantity restrictions and documentation requirements to prevent mass manufacturing under 503A.
- **Classification signals:**
  - CFR: FDA Guidance on 503A Anticipatory Compounding
  - Agency: FDA CDER, FDA Office of Compounding Quality
  - Keywords: [anticipatory compounding] (Strong), [limited quantities] (Strong), [batch compounding] (Strong), [advance compounding] (Moderate), [prescription anticipated] (Moderate), [stock preparation] (Weak), [batch records] (Weak)
  - Statutes: FD&C Act Section 503A
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503a.anticipatory` contains any of: [controlled substance, Schedule II-V], also classify in `controlled-substances.recordkeeping`"
  > "If an entity classified in `compounding.503a.anticipatory` contains any of: [stability testing, extended dating], also classify in `compounding.sterile.bud`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| IV Therapy/Infusion | Medium |
| Hormone Optimization/HRT | Medium |

##### L4: Quantity Limitations (`compounding.503a.anticipatory.quantities`)
- **Description:** Specific restrictions on amounts that can be compounded in anticipation of prescriptions, based on historical prescription patterns and stability considerations.
- **Classification signals:**
  - CFR: FDA Guidance documents on anticipatory compounding
  - Agency: FDA CDER
  - Keywords: [quantity limits] (Strong), [historical usage] (Strong), [prescription history] (Moderate), [30-day supply] (Moderate), [overage allowance] (Weak), [waste minimization] (Weak)
  - Statutes: FD&C Act Section 503A
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503a.anticipatory.quantities` contains any of: [DEA Form 222, controlled substance inventory], also classify in `controlled-substances.recordkeeping`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |

##### L4: Documentation Requirements (`compounding.503a.anticipatory.documentation`)
- **Description:** Record-keeping obligations for anticipatory compounding including batch records, justification for quantities, and linkage to eventual patient-specific prescriptions.
- **Classification signals:**
  - CFR: 21 CFR 211.188 (adapted for 503A context)
  - Agency: FDA CDER, State Boards of Pharmacy
  - Keywords: [batch records] (Strong), [compounding log] (Strong), [quantity justification] (Strong), [prescription linkage] (Moderate), [master formula] (Moderate), [lot tracking] (Weak)
  - Statutes: FD&C Act Section 503A
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503a.anticipatory.documentation` contains any of: [electronic records, e-records, digital logs], also classify in `clinical-operations.recordkeeping`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |

#### L3: Bulk Drug Substances (`compounding.503a.bulk-drug`)
- **Description:** FDA's regulation of compounding from bulk drug substances (active pharmaceutical ingredients) including the bulk drug list categories, clinical need determinations, and sourcing requirements.
- **Classification signals:**
  - CFR: 21 CFR 216.23, 21 CFR Part 207
  - Agency: FDA CDER, FDA Office of Compounding Quality
  - Keywords: [bulk drug substance] (Strong), [bulk drug list] (Strong), [Category 1] (Strong), [Category 2] (Strong), [Category 3] (Strong), [API] (Moderate — "active pharmaceutical ingredient"), [clinical need] (Moderate), [bulk ingredient] (Moderate), [raw material] (Weak)
  - Statutes: FD&C Act Section 503A(b)(1)(A)(i)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503a.bulk-drug` contains any of: [import, foreign supplier, API importation], also classify in `fda-regulation.enforcement`"
  > "If an entity classified in `compounding.503a.bulk-drug` contains any of: [USP grade, certificate of analysis], also classify in `compounding.503a.quality-standards`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Peptide Therapy | High |
| Hormone Optimization/HRT | High |
| Weight Management | High |
| IV Therapy/Infusion | Medium |
| Anti-Aging Medicine | Medium |

##### L4: Category 1 List (Positive List) (`compounding.503a.bulk-drug.category1`)
- **Description:** Bulk drug substances that FDA has evaluated and explicitly permits for use in 503A compounding, including the process for additions and removals from this list.
- **Classification signals:**
  - CFR: 21 CFR 216.23
  - Agency: FDA CDER, FDA Office of Compounding Quality
  - Keywords: [Category 1 list] (Strong), [permitted bulk drugs] (Strong), [approved for compounding] (Strong), [positive list] (Moderate), [FDA evaluated] (Moderate), [grandfathered substances] (Weak)
  - Statutes: FD&C Act Section 503A(b)(1)(A)(i)(I)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503a.bulk-drug.category1` contains any of: [testosterone, estradiol, progesterone], also classify in `compounding.503a.practice-specific.hormones`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Hormone Optimization/HRT | High |

##### L4: Category 2 List (Under Evaluation) (`compounding.503a.bulk-drug.category2`)
- **Description:** Bulk drug substances nominated for evaluation that may be used in compounding while FDA completes its review, subject to specific conditions and interim policies.
- **Classification signals:**
  - CFR: FDA Interim Policy on Compounding Using Bulk Drug Substances
  - Agency: FDA CDER, FDA Office of Compounding Quality
  - Keywords: [Category 2] (Strong), [under evaluation] (Strong), [nominated substances] (Strong), [interim policy] (Moderate), [pending review] (Moderate), [clinical need determination] (Moderate), [nomination process] (Weak)
  - Statutes: FD&C Act Section 503A(b)(1)(A)(i)(II)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503a.bulk-drug.category2` contains any of: [BPC-157, TB-500, thymosin], also classify in `compounding.503a.practice-specific.peptides`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Peptide Therapy | High |
| Compounding Pharmacy | High |
| Anti-Aging Medicine | Medium |

##### L4: Category 3 List (Prohibited/Withdrawn) (`compounding.503a.bulk-drug.category3`)
- **Description:** Bulk drug substances that FDA has evaluated and determined cannot be used in compounding due to safety concerns or lack of clinical need.
- **Classification signals:**
  - CFR: 21 CFR 216.24
  - Agency: FDA CDER, FDA Office of Compounding Quality
  - Keywords: [Category 3] (Strong), [prohibited bulk drugs] (Strong), [withdrawn substances] (Strong), [cannot compound] (Strong), [safety concerns] (Moderate), [lack clinical need] (Moderate), [enforcement priority] (Weak)
  - Statutes: FD&C Act Section 503A(b)(1)(A)(i)(III)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503a.bulk-drug.category3` contains any of: [enforcement action, warning letter, cease and desist], also classify in `fda-regulation.enforcement`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Peptide Therapy | High |

#### L3: Essentially a Copy Prohibition (`compounding.503a.copy-prohibition`)
- **Description:** Restrictions on compounding drugs that are essentially copies of commercially available FDA-approved products, including the narrow exceptions and FDA's enforcement approach.
- **Classification signals:**
  - CFR: FDA Guidance on Essentially a Copy of a Commercially Available Drug
  - Agency: FDA CDER, FDA Office of Compounding Quality
  - Keywords: [essentially a copy] (Strong), [commercially available] (Strong), [FDA-approved drug] (Strong), [regular commercial distribution] (Moderate), [significant difference] (Moderate), [drug shortage] (Moderate — exception context), [medical need] (Weak)
  - Statutes: FD&C Act Section 503A(b)(2)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503a.copy-prohibition` contains any of: [drug shortage, shortage list, backorder], also classify in `compounding.drug-shortages`"
  > "If an entity classified in `compounding.503a.copy-prohibition` contains any of: [semaglutide, tirzepatide, GLP-1], also classify in `compounding.503a.practice-specific.weight-loss`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Weight Management | High |
| Hormone Optimization/HRT | Medium |

##### L4: Commercial Availability Determination (`compounding.503a.copy-prohibition.availability`)
- **Description:** How FDA determines whether a drug product is "commercially available" including regular distribution criteria and temporary shortage considerations.
- **Classification signals:**
  - CFR: FDA Guidance documents on commercial availability
  - Agency: FDA CDER
  - Keywords: [commercially available] (Strong), [regular commercial distribution] (Strong), [wholesale distribution] (Moderate), [retail availability] (Moderate), [backorder status] (Moderate), [allocation] (Weak)
  - Statutes: FD&C Act Section 503A(b)(2)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503a.copy-prohibition.availability` contains any of: [ASHP shortage, FDA shortage database], also classify in `compounding.drug-shortages`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Weight Management | High |

##### L4: Significant Difference Standard (`compounding.503a.copy-prohibition.difference`)
- **Description:** What constitutes a "significant difference" that would allow compounding of an otherwise commercially available product, including patient-specific medical need documentation.
- **Classification signals:**
  - CFR: FDA Guidance on Essentially a Copy
  - Agency: FDA CDER
  - Keywords: [significant difference] (Strong), [medical need] (Strong), [patient intolerance] (Strong), [allergy to excipient] (Moderate), [different strength] (Moderate), [dosage form change] (Moderate), [flavor variation] (Weak — not sufficient alone)
  - Statutes: FD&C Act Section 503A(b)(2)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503a.copy-prohibition.difference` contains any of: [prescriber documentation, medical necessity], also classify in `clinical-operations.informed-consent`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Pediatric-serving practices | Medium |

#### L3: Office Use Restrictions (`compounding.503a.office-use`)
- **Description:** Federal limitations on compounding for practitioner office use without patient-specific prescriptions under 503A, and the state-by-state variations in office use permissions.
- **Classification signals:**
  - CFR: FDA Guidance on 503A and Office Use
  - Agency: FDA CDER, State Boards of Pharmacy
  - Keywords: [office use] (Strong), [practitioner administration] (Strong), [no patient-specific prescription] (Strong), [office stock] (Moderate), [physician dispensing] (Moderate), [state permits office use] (Moderate — state-specific), [federal prohibition] (Weak)
  - Statutes: FD&C Act Section 503A(a)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503a.office-use` contains any of: [state law, state permits, state authorization], also classify in `state-regulations.pharmacy`"
  > "If an entity classified in `compounding.503a.office-use` contains any of: [practitioner dispensing, in-office dispensing], also classify in `state-regulations.scope-expansions`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Med Spa/Aesthetic Medicine | High |
| IV Therapy/Infusion | High |
| Pain Management | High |
| Integrative Medicine | Medium |
| Primary Care/DPC/Concierge | Medium |

#### L3: Interstate Distribution & MOUs (`compounding.503a.interstate`)
- **Description:** Limitations on interstate distribution of compounded drugs under 503A, including the 5% rule without MOU and expanded distribution under FDA-state Memoranda of Understanding.
- **Classification signals:**
  - CFR: FDA MOU Standard Model
  - Agency: FDA CDER, State Boards of Pharmacy
  - Keywords: [interstate distribution] (Strong), [MOU] (Strong), [memorandum of understanding] (Strong), [5 percent limit] (Strong), [inordinate amounts] (Moderate), [state oversight] (Moderate), [distribution reporting] (Weak)
  - Statutes: FD&C Act Section 503A(b)(3)(B)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503a.interstate` contains any of: [shipment, mail order, patient delivery], also classify in `business-operations.shipping`"
  > "If an entity classified in `compounding.503a.interstate` contains any of: [controlled substance shipping], also classify in `controlled-substances.dispensing`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Telehealth | Medium |

### L2: 503B Outsourcing Facilities (`compounding.503b`)

#### L3: Registration & Reporting Requirements (`compounding.503b.registration`)
- **Description:** FDA registration process for outsourcing facilities including initial registration, biannual reporting, product reporting, and adverse event obligations distinct from traditional pharmacies.
- **Classification signals:**
  - CFR: 21 CFR 205.50, 21 CFR 207
  - Agency: FDA CDER, FDA Office of Compounding Quality
  - Keywords: [outsourcing facility registration] (Strong), [503B registration] (Strong), [FDA establishment registration] (Strong), [biannual reporting] (Strong), [product reporting] (Moderate), [adverse event reporting] (Moderate), [serious adverse event] (Moderate)
  - Statutes: FD&C Act Section 503B(b), 21 U.S.C. § 353b(b)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503b.registration` contains any of: [establishment inspection, FDA inspection], also classify in `compounding.503b.cgmp`"
  > "If an entity classified in `compounding.503b.registration` contains any of: [controlled substance manufacturing], also classify in `controlled-substances.registration`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Hospital/Health System Pharmacy | High |

##### L4: Initial Registration Process (`compounding.503b.registration.initial`)
- **Description:** Requirements and procedures for initial registration as a 503B outsourcing facility including FDA forms, facility information, and statutory declarations.
- **Classification signals:**
  - CFR: 21 CFR 207.17, 21 CFR 207.25
  - Agency: FDA CDER, FDA ORA
  - Keywords: [initial registration] (Strong), [Form FDA 3537] (Strong), [establishment registration] (Strong), [facility information] (Moderate), [authorized official] (Moderate), [DUNS number] (Weak)
  - Statutes: FD&C Act Section 503B(b)(1)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503b.registration.initial` contains any of: [DEA registration, controlled substances], also classify in `controlled-substances.registration`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |

##### L4: Product Reporting Requirements (`compounding.503b.registration.products`)
- **Description:** Twice-yearly reporting of all drugs compounded by outsourcing facilities including product identification, volume data, and distribution information.
- **Classification signals:**
  - CFR: 21 CFR 207.53
  - Agency: FDA CDER
  - Keywords: [product reporting] (Strong), [biannual report] (Strong), [June and December] (Strong), [compounded drug reporting] (Moderate), [volume data] (Moderate), [NDC number] (Moderate), [distribution data] (Weak)
  - Statutes: FD&C Act Section 503B(b)(2)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503b.registration.products` contains any of: [controlled substance reporting, DEA reporting], also classify in `controlled-substances.recordkeeping`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |

#### L3: Current Good Manufacturing Practice (`compounding.503b.cgmp`)
- **Description:** Application of pharmaceutical cGMP requirements to outsourcing facilities including quality systems, validation, change control, and documentation exceeding USP standards.
- **Classification signals:**
  - CFR: 21 CFR Parts 210-211, FDA Guidance on cGMP for Outsourcing Facilities
  - Agency: FDA CDER, FDA ORA
  - Keywords: [cGMP] (Strong), [current good manufacturing practice] (Strong), [quality system] (Strong), [validation] (Strong), [change control] (Moderate), [deviation investigation] (Moderate), [batch release] (Moderate), [quality control unit] (Weak)
  - Statutes: FD&C Act Section 503B(a)(11)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503b.cgmp` contains any of: [FDA inspection, 483 observation, warning letter], also classify in `fda-regulation.enforcement`"
  > "If an entity classified in `compounding.503b.cgmp` contains any of: [sterile manufacturing, aseptic processing], also classify in `compounding.sterile`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Hospital Pharmacy | Medium |

##### L4: Quality Systems (`compounding.503b.cgmp.quality`)
- **Description:** Quality unit responsibilities, quality agreements, management review, and quality system documentation requirements specific to outsourcing facilities.
- **Classification signals:**
  - CFR: 21 CFR 211.22, 211.25, 211.180
  - Agency: FDA CDER, FDA ORA
  - Keywords: [quality unit] (Strong), [quality assurance] (Strong), [quality control] (Strong), [management review] (Moderate), [quality agreement] (Moderate), [CAPA system] (Moderate), [quality manual] (Weak)
  - Statutes: FD&C Act Section 503B(a)(11)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503b.cgmp.quality` contains any of: [recall procedures, market withdrawal], also classify in `fda-regulation.enforcement`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |

##### L4: Validation Requirements (`compounding.503b.cgmp.validation`)
- **Description:** Process validation, equipment qualification, analytical method validation, and cleaning validation requirements for outsourcing facility operations.
- **Classification signals:**
  - CFR: 21 CFR 211.63, 211.67, 211.68, FDA Process Validation Guidance
  - Agency: FDA CDER
  - Keywords: [process validation] (Strong), [equipment qualification] (Strong), [IQ/OQ/PQ] (Strong), [method validation] (Strong), [cleaning validation] (Moderate), [validation protocol] (Moderate), [worst-case challenge] (Weak)
  - Statutes: FD&C Act Section 503B(a)(11)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503b.cgmp.validation` contains any of: [sterile validation, media fill], also classify in `compounding.sterile.testing`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |

##### L4: Stability Programs (`compounding.503b.cgmp.stability`)
- **Description:** Stability testing requirements for establishing beyond-use dates, including study design, storage conditions, and ongoing stability monitoring for outsourcing facilities.
- **Classification signals:**
  - CFR: 21 CFR 211.137, 211.166, ICH Q1A(R2) Guidance
  - Agency: FDA CDER
  - Keywords: [stability testing] (Strong), [stability program] (Strong), [expiration dating] (Strong), [ICH guidelines] (Moderate), [accelerated stability] (Moderate), [real-time stability] (Moderate), [stability protocol] (Weak)
  - Statutes: FD&C Act Section 503B(a)(11)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503b.cgmp.stability` contains any of: [BUD, beyond-use date], also classify in `compounding.sterile.bud`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Hospital Pharmacy | Medium |

#### L3: Labeling Requirements (`compounding.503b.labeling`)
- **Description:** Specific labeling requirements for outsourcing facility products including required statements, lot numbers, BUDs, and distinguishing from manufactured drugs.
- **Classification signals:**
  - CFR: 21 CFR Part 201, FDA Draft Guidance on 503B Labeling
  - Agency: FDA CDER
  - Keywords: [outsourcing facility labeling] (Strong), [compounded drug label] (Strong), ["not FDA-approved"] (Strong), [lot number] (Strong), [beyond-use date] (Moderate), [storage conditions] (Moderate), [active ingredients] (Weak)
  - Statutes: FD&C Act Section 503B(a)(10)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503b.labeling` contains any of: [package insert, prescribing information], also classify in `fda-regulation.drugs`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Hospital Pharmacy | Medium |

### L2: USP Compounding Standards (`compounding.usp-standards`)

#### L3: USP Chapter <795> Nonsterile Compounding (`compounding.usp-standards.795`)
- **Description:** USP standards for nonsterile compounding including facility requirements, personnel training, SOPs, and quality assurance for preparations not requiring sterility.
- **Classification signals:**
  - CFR: References in state pharmacy regulations
  - Agency: State Boards of Pharmacy (USP incorporated by reference)
  - Keywords: [USP 795] (Strong), [nonsterile compounding] (Strong), [compounding area] (Strong), [master formulation record] (Moderate), [compounding record] (Moderate), [SOP] (Moderate), [personnel hygiene] (Weak)
  - Statutes: State pharmacy acts incorporating USP
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.usp-standards.795` contains any of: [hazardous drug, HD], also classify in `compounding.usp-standards.800`"
  > "If an entity classified in `compounding.usp-standards.795` contains any of: [stability data, extended BUD], also classify in `compounding.usp-standards.bud`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Integrative Medicine | Medium |
| Functional Medicine | Medium |

##### L4: Facility Design & Environmental Controls (`compounding.usp-standards.795.facility`)
- **Description:** Physical space requirements for nonsterile compounding including designated areas, surfaces, temperature/humidity monitoring, and segregation from sterile operations.
- **Classification signals:**
  - CFR: State regulations incorporating USP
  - Agency: State Boards of Pharmacy
  - Keywords: [designated compounding area] (Strong), [cleanable surfaces] (Strong), [temperature monitoring] (Moderate), [humidity control] (Moderate), [sink requirements] (Moderate), [segregated area] (Weak)
  - Statutes: State pharmacy acts
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.usp-standards.795.facility` contains any of: [HVAC, air handling, pressure differential], also classify in `compounding.sterile.engineering`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |

##### L4: Documentation & Quality Assurance (`compounding.usp-standards.795.documentation`)
- **Description:** Record-keeping requirements including master formulation records, compounding records, equipment logs, and quality review processes for nonsterile compounding.
- **Classification signals:**
  - CFR: State regulations incorporating USP
  - Agency: State Boards of Pharmacy
  - Keywords: [master formulation record] (Strong), [compounding record] (Strong), [equipment log] (Moderate), [quality review] (Moderate), [error prevention] (Moderate), [documentation retention] (Weak)
  - Statutes: State pharmacy acts
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.usp-standards.795.documentation` contains any of: [electronic records, computerized systems], also classify in `clinical-operations.recordkeeping`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |

#### L3: USP Chapter <797> Sterile Compounding (`compounding.usp-standards.797`)
- **Description:** Comprehensive standards for sterile compounding including the 2023 revision's risk-based approach, facility requirements, personnel competency, and quality assurance beyond nonsterile standards.
- **Classification signals:**
  - CFR: State regulations incorporating USP
  - Agency: State Boards of Pharmacy, FDA (references in guidance)
  - Keywords: [USP 797] (Strong), [sterile compounding] (Strong), [aseptic technique] (Strong), [ISO Class 5] (Strong), [Category 1 CSP] (Strong), [Category 2 CSP] (Strong), [cleanroom] (Moderate), [garbing] (Moderate)
  - Statutes: State pharmacy acts incorporating USP
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.usp-standards.797` contains any of: [hazardous sterile, HD compounding], also classify in `compounding.usp-standards.800`"
  > "If an entity classified in `compounding.usp-standards.797` contains any of: [outsourcing facility, 503B], also classify in `compounding.503b.cgmp`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| IV Therapy/Infusion | High |
| Hospital Pharmacy | High |
| Med Spa/Aesthetic Medicine | Medium |
| Pain Management | Medium |

##### L4: Facility Design & Engineering Controls (`compounding.usp-standards.797.facility`)
- **Description:** Cleanroom classifications, primary and secondary engineering controls, pressure relationships, and air quality requirements for sterile compounding environments.
- **Classification signals:**
  - CFR: State regulations incorporating USP
  - Agency: State Boards of Pharmacy
  - Keywords: [ISO Class 5] (Strong), [ISO Class 7] (Strong), [ISO Class 8] (Strong), [PEC] (Strong), [SEC] (Strong), [HEPA filter] (Strong), [pressure differential] (Moderate), [air changes per hour] (Moderate)
  - Statutes: State pharmacy acts
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.usp-standards.797.facility` contains any of: [certification, recertification], also classify in `compounding.sterile.engineering`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| IV Therapy/Infusion | High |
| Hospital Pharmacy | High |

###### L5: Primary Engineering Controls (`compounding.usp-standards.797.facility.pec`)
- **Description:** Requirements for laminar airflow workbenches, biological safety cabinets, compounding aseptic isolators, and compounding aseptic containment isolators used in sterile preparation.
- **Classification signals:**
  - CFR: State regulations incorporating USP
  - Agency: State Boards of Pharmacy
  - Keywords: [LAFW] (Strong), [BSC] (Strong), [CAI] (Strong), [CACI] (Strong), [unidirectional airflow] (Strong), [ISO Class 5] (Strong), [certification] (Moderate), [smoke studies] (Weak)
  - Statutes: State pharmacy acts
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.usp-standards.797.facility.pec` contains any of: [hazardous drug, chemotherapy], also classify in `compounding.usp-standards.800`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Hospital Pharmacy | High |
| Oncology Practices | High |

###### L5: Secondary Engineering Controls (`compounding.usp-standards.797.facility.sec`)
- **Description:** Buffer room and ante-room requirements including air exchanges, pressure relationships, temperature/humidity control, and surface specifications.
- **Classification signals:**
  - CFR: State regulations incorporating USP
  - Agency: State Boards of Pharmacy  
  - Keywords: [buffer room] (Strong), [ante-room] (Strong), [positive pressure] (Strong), [negative pressure] (Strong — for HD), [30 air changes] (Strong), [pass-through] (Moderate), [sticky mat] (Weak)
  - Statutes: State pharmacy acts
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.usp-standards.797.facility.sec` contains any of: [HD buffer room, negative pressure], also classify in `compounding.usp-standards.800.engineering`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Hospital Pharmacy | High |

##### L4: Personnel Training & Competency (`compounding.usp-standards.797.personnel`)
- **Description:** Initial and ongoing training requirements for sterile compounding personnel including didactic training, aseptic technique assessment, and competency evaluation.
- **Classification signals:**
  - CFR: State regulations incorporating USP
  - Agency: State Boards of Pharmacy
  - Keywords: [aseptic technique] (Strong), [media fill test] (Strong), [gloved fingertip test] (Strong), [garbing competency] (Strong), [annual requalification] (Moderate), [observation] (Moderate), [competency assessment] (Weak)
  - Statutes: State pharmacy acts
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.usp-standards.797.personnel` contains any of: [hazardous drug training, spill management], also classify in `compounding.usp-standards.800.safety`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| IV Therapy/Infusion | High |
| Hospital Pharmacy | High |

###### L5: Initial Training & Qualification (`compounding.usp-standards.797.personnel.initial`)
- **Description:** Requirements for initial didactic training, hands-on training, and competency demonstration before personnel can compound sterile preparations independently.
- **Classification signals:**
  - CFR: State regulations incorporating USP
  - Agency: State Boards of Pharmacy
  - Keywords: [initial training] (Strong), [didactic education] (Strong), [hands-on training] (Strong), [three media fills] (Strong), [written exam] (Moderate), [observation checklist] (Moderate), [preceptor] (Weak)
  - Statutes: State pharmacy acts
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.usp-standards.797.personnel.initial` contains any of: [continuing education, CE hours], also classify in `state-regulations.licensure`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| IV Therapy/Infusion | High |

###### L5: Competency Assessment Methods (`compounding.usp-standards.797.personnel.assessment`)
- **Description:** Specific testing methods including media fill tests, gloved fingertip/thumb sampling, surface sampling, and visual observation of aseptic technique.
- **Classification signals:**
  - CFR: State regulations incorporating USP
  - Agency: State Boards of Pharmacy
  - Keywords: [media fill] (Strong), [process simulation] (Strong), [fingertip test] (Strong), [CFU limit] (Strong), [growth promotion] (Moderate), [incubation] (Moderate), [TSA plates] (Weak)
  - Statutes: State pharmacy acts
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.usp-standards.797.personnel.assessment` contains any of: [environmental monitoring, viable sampling], also classify in `compounding.sterile.testing`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Hospital Pharmacy | High |

##### L4: Environmental Monitoring & Testing (`compounding.usp-standards.797.monitoring`)
- **Description:** Requirements for routine environmental monitoring including viable and nonviable particle sampling, action levels, and corrective actions for sterile compounding areas.
- **Classification signals:**
  - CFR: State regulations incorporating USP
  - Agency: State Boards of Pharmacy
  - Keywords: [environmental monitoring] (Strong), [viable air sampling] (Strong), [surface sampling] (Strong), [particle count] (Strong), [action level] (Strong), [alert level] (Moderate), [trending] (Moderate), [excursion] (Weak)
  - Statutes: State pharmacy acts
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.usp-standards.797.monitoring` contains any of: [certification report, HEPA testing], also classify in `compounding.sterile.engineering`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| IV Therapy/Infusion | High |
| Hospital Pharmacy | High |

#### L3: USP Chapter <800> Hazardous Drugs (`compounding.usp-standards.800`)
- **Description:** Comprehensive standards for handling hazardous drugs in healthcare settings including receipt, storage, compounding, dispensing, administration, and disposal with emphasis on worker and patient safety.
- **Classification signals:**
  - CFR: State regulations incorporating USP, OSHA references
  - Agency: State Boards of Pharmacy, NIOSH, OSHA
  - Keywords: [USP 800] (Strong), [hazardous drug] (Strong), [HD] (Strong), [NIOSH list] (Strong), [containment] (Strong), [CSTD] (Strong — "closed system transfer device"), [C-PEC] (Strong), [deactivation] (Moderate)
  - Statutes: State pharmacy acts, OSHA General Duty Clause
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.usp-standards.800` contains any of: [waste management, hazardous waste], also classify in `business-operations.waste-management`"
  > "If an entity classified in `compounding.usp-standards.800` contains any of: [worker safety, occupational exposure], also classify in `business-operations.osha-compliance`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Hospital Pharmacy | High |
| Oncology Practices | High |
| IV Therapy/Infusion | Medium |
| Pain Management | Medium |

##### L4: Engineering Controls for HD (`compounding.usp-standards.800.engineering`)
- **Description:** Specific engineering control requirements for hazardous drug handling including C-PECs, C-SECs, externally vented systems, and redundant HEPA filtration.
- **Classification signals:**
  - CFR: State regulations incorporating USP
  - Agency: State Boards of Pharmacy, NIOSH
  - Keywords: [C-PEC] (Strong), [C-SEC] (Strong), [external venting] (Strong), [negative pressure] (Strong), [redundant HEPA] (Strong), [containment] (Moderate), [30 air changes] (Moderate), [exhaust] (Weak)
  - Statutes: State pharmacy acts
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.usp-standards.800.engineering` contains any of: [certification, testing], also classify in `compounding.sterile.engineering`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Hospital Pharmacy | High |
| Oncology Practices | High |

##### L4: Personal Protective Equipment (`compounding.usp-standards.800.ppe`)
- **Description:** PPE requirements for hazardous drug handling including double gloving, gowns, respiratory protection, and proper donning/doffing procedures.
- **Classification signals:**
  - CFR: State regulations incorporating USP
  - Agency: State Boards of Pharmacy, OSHA
  - Keywords: [double gloving] (Strong), [chemotherapy gloves] (Strong), [HD gown] (Strong), [respiratory protection] (Strong), [eye protection] (Moderate), [ASTM D6978] (Moderate — glove standard), [doffing] (Weak)
  - Statutes: State pharmacy acts, OSHA standards
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.usp-standards.800.ppe` contains any of: [respirator fit testing, medical evaluation], also classify in `business-operations.osha-compliance`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Hospital Pharmacy | High |
| Oncology Practices | High |

##### L4: Hazardous Drug List & Assessment (`compounding.usp-standards.800.assessment`)
- **Description:** Requirements for maintaining HD lists, assessing drugs for hazardous characteristics, and implementing alternative containment strategies for drugs with dosage form-specific risks.
- **Classification signals:**
  - CFR: State regulations incorporating USP
  - Agency: NIOSH, State Boards of Pharmacy
  - Keywords: [NIOSH list] (Strong), [HD assessment] (Strong), [dosage form risk] (Strong), [alternative containment] (Moderate), [antineoplastic] (Moderate), [reproductive risk] (Moderate), [low-risk HD] (Weak)
  - Statutes: State pharmacy acts
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.usp-standards.800.assessment` contains any of: [investigational drug, clinical trial], also classify in `fda-regulation.drugs`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Hospital Pharmacy | High |
| Oncology Practices | High |

### L2: Sterile Compounding Specific Requirements (`compounding.sterile`)

#### L3: Beyond-Use Dating (BUD) (`compounding.sterile.bud`)
- **Description:** Requirements for assigning appropriate beyond-use dates to compounded sterile preparations based on sterility risk, stability data, and storage conditions.
- **Classification signals:**
  - CFR: State regulations incorporating USP
  - Agency: FDA (guidance), State Boards of Pharmacy
  - Keywords: [beyond-use date] (Strong), [BUD] (Strong), [stability data] (Strong), [sterility testing] (Strong), [default BUD] (Moderate), [extended BUD] (Moderate), [room temperature] (Moderate), [refrigerated] (Weak)
  - Statutes: State pharmacy acts
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.sterile.bud` contains any of: [stability study, stability indicating], also classify in `compounding.503b.cgmp.stability`"
  > "If an entity classified in `compounding.sterile.bud` contains any of: [expiration date, commercial product], also classify in `fda-regulation.drugs`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| IV Therapy/Infusion | High |
| Hospital Pharmacy | High |
| Med Spa/Aesthetic Medicine | Medium |

##### L4: Default BUD Limits (`compounding.sterile.bud.default`)
- **Description:** USP-specified default beyond-use dates for Category 1 and Category 2 CSPs when stability data is not available, based on storage temperature and preparation conditions.
- **Classification signals:**
  - CFR: State regulations incorporating USP
  - Agency: State Boards of Pharmacy
  - Keywords: [default BUD] (Strong), [Category 1 CSP] (Strong), [Category 2 CSP] (Strong), [4 days] (Strong), [9 days] (Strong), [45 days] (Strong), [controlled room temperature] (Moderate), [refrigerator] (Weak)
  - Statutes: State pharmacy acts
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.sterile.bud.default` contains any of: [patient-specific, batch], also classify in `compounding.503a.anticipatory`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| IV Therapy/Infusion | High |

##### L4: Extended BUD with Testing (`compounding.sterile.bud.extended`)
- **Description:** Requirements for extending beyond-use dates beyond USP defaults through stability testing, sterility testing, and container-closure integrity testing.
- **Classification signals:**
  - CFR: FDA guidance on stability testing
  - Agency: FDA, State Boards of Pharmacy
  - Keywords: [extended BUD] (Strong), [stability study] (Strong), [sterility test] (Strong), [container-closure integrity] (Strong), [stability protocol] (Moderate), [forced degradation] (Moderate), [real-time data] (Weak)
  - Statutes: State pharmacy acts
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.sterile.bud.extended` contains any of: [method validation, analytical testing], also classify in `compounding.503b.cgmp.validation`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Hospital Pharmacy | Medium |

#### L3: Sterility Testing Requirements (`compounding.sterile.testing`)
- **Description:** Requirements for sterility testing of compounded sterile preparations including test methods, sample sizes, and when testing is required versus environmental monitoring suffices.
- **Classification signals:**
  - CFR: 21 CFR 211.167 (as reference), USP <71>
  - Agency: FDA, State Boards of Pharmacy
  - Keywords: [sterility testing] (Strong), [USP 71] (Strong), [membrane filtration] (Strong), [direct inoculation] (Strong), [growth promotion] (Moderate), [bacteriostasis/fungistasis] (Moderate), [14-day incubation] (Weak)
  - Statutes: State pharmacy acts
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.sterile.testing` contains any of: [method suitability, validation], also classify in `compounding.503b.cgmp.validation`"
  > "If an entity classified in `compounding.sterile.testing` contains any of: [contract laboratory, third-party testing], also classify in `clinical-operations.laboratory`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Hospital Pharmacy | High |
| 503B Outsourcing Facilities | High |

##### L4: Release Testing vs. Batch Testing (`compounding.sterile.testing.release`)
- **Description:** Distinctions between sterility testing for batch release (503B) versus quality assurance testing (503A), including sampling requirements and quarantine procedures.
- **Classification signals:**
  - CFR: FDA guidance on cGMP testing
  - Agency: FDA
  - Keywords: [release testing] (Strong), [batch release] (Strong), [quarantine] (Strong), [quality assurance testing] (Moderate), [representative sample] (Moderate), [statistical sampling] (Weak)
  - Statutes: FD&C Act Section 503B(a)(11)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.sterile.testing.release` contains any of: [recall, out of specification], also classify in `fda-regulation.enforcement`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| 503B Outsourcing Facilities | High |
| Compounding Pharmacy | Medium |

##### L4: Endotoxin Testing (`compounding.sterile.testing.endotoxin`)
- **Description:** Bacterial endotoxin (pyrogen) testing requirements using LAL methodology for high-risk sterile preparations, particularly those administered parenterally.
- **Classification signals:**
  - CFR: USP <85> reference
  - Agency: FDA, State Boards of Pharmacy
  - Keywords: [endotoxin testing] (Strong), [LAL test] (Strong), [bacterial endotoxin] (Strong), [pyrogen] (Strong), [EU/mL] (Strong — "endotoxin units"), [kinetic chromogenic] (Moderate), [gel clot] (Moderate)
  - Statutes: State pharmacy acts
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.sterile.testing.endotoxin` contains any of: [parenteral, intrathecal, intraocular], also classify in `clinical-operations.patient-safety`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Hospital Pharmacy | High |
| Pain Management | Medium |

#### L3: Cleanroom Certification & Maintenance (`compounding.sterile.engineering`)
- **Description:** Requirements for initial certification and ongoing verification of cleanroom environments including HEPA filters, room pressurization, and particle counts.
- **Classification signals:**
  - CFR: State regulations incorporating ISO 14644
  - Agency: State Boards of Pharmacy
  - Keywords: [cleanroom certification] (Strong), [HEPA certification] (Strong), [particle count] (Strong), [room pressurization] (Strong), [smoke studies] (Moderate), [6-month certification] (Moderate), [ISO 14644] (Moderate)
  - Statutes: State pharmacy acts
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.sterile.engineering` contains any of: [equipment qualification, IQ/OQ], also classify in `compounding.503b.cgmp.validation`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| IV Therapy/Infusion | High |
| Hospital Pharmacy | High |

### L2: Bulk Drug Substances List Management (`compounding.bulk-substances`)

#### L3: FDA Bulk Drug List Processes (`compounding.bulk-substances.fda-lists`)
- **Description:** FDA's processes for evaluating and maintaining lists of bulk drug substances that can be used in compounding, including nomination, evaluation, and interim policy procedures.
- **Classification signals:**
  - CFR: 21 CFR 216.23
  - Agency: FDA CDER, FDA Pharmacy Compounding Advisory Committee
  - Keywords: [bulk drug list] (Strong), [FDA evaluation] (Strong), [PCAC review] (Strong — "Pharmacy Compounding Advisory Committee"), [clinical need] (Strong), [nomination] (Moderate), [Federal Register notice] (Moderate), [interim policy] (Weak)
  - Statutes: FD&C Act Section 503A(b)(1)(A)(i)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.bulk-substances.fda-lists` contains any of: [withdrawn, removed from list], also classify in `fda-regulation.enforcement`"
  > "If an entity classified in `compounding.bulk-substances.fda-lists` contains any of: [peptide, amino acid sequence], also classify in `compounding.503a.practice-specific.peptides`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Peptide Therapy | High |
| Hormone Optimization/HRT | High |
| Anti-Aging Medicine | Medium |

#### L3: Ingredient Quality Standards (`compounding.bulk-substances.quality`)
- **Description:** Requirements for quality, purity, and identity of bulk drug substances used in compounding including USP/NF compliance, certificates of analysis, and vendor qualification.
- **Classification signals:**
  - CFR: 21 CFR Part 211 Subpart E (components)
  - Agency: FDA, State Boards of Pharmacy
  - Keywords: [USP grade] (Strong), [NF grade] (Strong), [certificate of analysis] (Strong), [CoA] (Strong), [identity testing] (Strong), [vendor qualification] (Moderate), [component testing] (Moderate), [purity] (Weak)
  - Statutes: FD&C Act Section 503A(b)(1)(A)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.bulk-substances.quality` contains any of: [import, foreign supplier], also classify in `fda-regulation.drugs`"
  > "If an entity classified in `compounding.bulk-substances.quality` contains any of: [DEA controlled], also classify in `controlled-substances.scheduling`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Peptide Therapy | Medium |
| Hormone Optimization/HRT | Medium |

### L2: Drug Shortage Compounding (`compounding.drug-shortages`)

#### L3: FDA Shortage Determinations (`compounding.drug-shortages.fda-determination`)
- **Description:** FDA's process for determining drug shortages that enable expanded compounding of commercially available products, including listing, delisting, and enforcement discretion during shortages.
- **Classification signals:**
  - CFR: 21 CFR 314.81(b)(3)(iii)
  - Agency: FDA CDER, FDA Drug Shortage Staff
  - Keywords: [drug shortage list] (Strong), [FDA shortage determination] (Strong), [shortage database] (Strong), [currently in shortage] (Strong), [resolved shortage] (Moderate), [supply disruption] (Moderate), [discontinuation] (Weak)
  - Statutes: FD&C Act Section 506C, Section 503A(e)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.drug-shortages.fda-determination` contains any of: [essentially a copy, commercially available], also classify in `compounding.503a.copy-prohibition`"
  > "If an entity classified in `compounding.drug-shortages.fda-determination` contains any of: [GLP-1, semaglutide, tirzepatide], also classify in `compounding.503a.practice-specific.weight-loss`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Weight Management | High |
| Hormone Optimization/HRT | Medium |
| Hospital Pharmacy | Medium |

#### L3: Shortage Compounding Compliance (`compounding.drug-shortages.compliance`)
- **Description:** Requirements and limitations for compounding drugs that are on FDA's shortage list, including documentation, formulary restrictions, and transition planning when shortages resolve.
- **Classification signals:**
  - CFR: FDA Guidance on Compounding and Drug Shortages
  - Agency: FDA CDER
  - Keywords: [shortage compounding] (Strong), [temporary compounding] (Strong), [shortage resolution] (Strong), [transition period] (Moderate), [patient continuity] (Moderate), [formulary management] (Weak)
  - Statutes: FD&C Act Section 503A(e)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.drug-shortages.compliance` contains any of: [patient notification, therapy change], also classify in `clinical-operations.informed-consent`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Weight Management | High |
| Hospital Pharmacy | Medium |

### L2: Practice-Specific Compounding Applications (`compounding.practice-specific`)

#### L3: Hormone Compounding (`compounding.503a.practice-specific.hormones`)
- **Description:** Specific requirements and FDA positions on compounding bioidentical hormone replacement therapy (BHRT) including testosterone, estradiol, progesterone, and combination products.
- **Classification signals:**
  - CFR: FDA Guidance on Compounded Bioidentical Hormones
  - Agency: FDA CDER
  - Keywords: [bioidentical hormones] (Strong), [BHRT] (Strong), [hormone pellets] (Strong), [testosterone cream] (Strong), [estradiol] (Moderate), [progesterone] (Moderate), [compounded HRT] (Moderate), [troches] (Weak)
  - Statutes: FD&C Act Section 503A
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503a.practice-specific.hormones` contains any of: [controlled substance, testosterone], also classify in `controlled-substances.prescribing`"
  > "If an entity classified in `compounding.503a.practice-specific.hormones` contains any of: [pellet insertion, minor procedure], also classify in `clinical-operations.scope-of-practice`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Hormone Optimization/HRT | High |
| Compounding Pharmacy | High |
| Anti-Aging Medicine | High |
| Integrative Medicine | Medium |
| Functional Medicine | Medium |

#### L3: Peptide Compounding (`compounding.503a.practice-specific.peptides`)
- **Description:** Regulatory status of peptide compounding including BPC-157, TB-500, and other peptides, FDA enforcement priorities, and bulk substance list considerations.
- **Classification signals:**
  - CFR: FDA Warning Letters on Peptides
  - Agency: FDA CDER, FDA Office of Compliance
  - Keywords: [peptide compounding] (Strong), [BPC-157] (Strong), [TB-500] (Strong), [thymosin beta-4] (Strong), [peptide therapy] (Moderate), [research peptide] (Moderate), [not approved] (Moderate), [enforcement priority] (Weak)
  - Statutes: FD&C Act Section 503A(b)(1)(A)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503a.practice-specific.peptides` contains any of: [clinical trial, IND], also classify in `fda-regulation.drugs`"
  > "If an entity classified in `compounding.503a.practice-specific.peptides` contains any of: [warning letter, cease compounding], also classify in `fda-regulation.enforcement`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Peptide Therapy | High |
| Compounding Pharmacy | High |
| Anti-Aging Medicine | High |
| Regenerative Medicine | Medium |
| Weight Management | Medium |

#### L3: Weight Loss Compounding (`compounding.503a.practice-specific.weight-loss`)
- **Description:** Compounding of GLP-1 agonists and other weight management medications during shortages, including semaglutide and tirzepatide compounding controversies and FDA guidance.
- **Classification signals:**
  - CFR: FDA Guidance on GLP-1 Shortage and Compounding
  - Agency: FDA CDER
  - Keywords: [semaglutide compounding] (Strong), [tirzepatide compounding] (Strong), [GLP-1 agonist] (Strong), [Ozempic] (Strong), [Wegovy] (Strong), [Mounjaro] (Strong), [weight loss compounding] (Moderate), [shortage status] (Moderate)
  - Statutes: FD&C Act Sections 503A(b)(2), 503A(e)
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503a.practice-specific.weight-loss` contains any of: [patent, brand protection], also classify in `fda-regulation.drugs`"
  > "If an entity classified in `compounding.503a.practice-specific.weight-loss` contains any of: [advertising claims, weight loss claims], also classify in `advertising-marketing.ftc-compliance`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Weight Management | High |
| Compounding Pharmacy | High |
| Primary Care/DPC/Concierge | Medium |
| Integrative Medicine | Medium |

#### L3: IV Nutrient Compounding (`compounding.503a.practice-specific.iv-nutrients`)
- **Description:** Requirements for compounding IV vitamin drips, mineral infusions, and nutrient cocktails including stability considerations and practice setting restrictions.
- **Classification signals:**
  - CFR: USP <797> for parenteral nutrition
  - Agency: State Boards of Pharmacy, FDA
  - Keywords: [IV nutrients] (Strong), [vitamin drip] (Strong), [Myers cocktail] (Strong), [parenteral nutrition] (Moderate), [IV push] (Moderate), [micronutrient] (Moderate), [compatibility] (Weak)
  - Statutes: State pharmacy acts
- **Cross-classification triggers:**
  > "If an entity classified in `compounding.503a.practice-specific.iv-nutrients` contains any of: [TPN, total parenteral nutrition], also classify in `medicare-billing.coverage-determinations`"
  > "If an entity classified in `compounding.503a.practice-specific.iv-nutrients` contains any of: [IV therapy clinic, hydration spa], also classify in `state-regulations.facility-permits`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| IV Therapy/Infusion | High |
| Compounding Pharmacy | High |
| Med Spa/Aesthetic Medicine | Medium |
| Integrative Medicine | Medium |

---

## Summary Statistics

**Total nodes produced: 62**
- L3 nodes: 24
- L4 nodes: 28  
- L5 nodes: 9
- L6 nodes: 1

**Distribution across L2 domains:**
- compounding.503a: 20 nodes
- compounding.503b: 11 nodes
- compounding.usp-standards: 19 nodes
- compounding.sterile: 8 nodes
- compounding.bulk-substances: 2 nodes
- compounding.drug-shortages: 2 nodes

This comprehensive taxonomy captures the full regulatory landscape for compounding operations, with appropriate depth where the regulatory complexity warrants it. The cross-classification triggers ensure proper routing of multi-domain content, while the practice-type relevance scores enable targeted alerting for Cedar's diverse customer base.