# Cedar Classification Framework — Part 1, Session 6-A of 8
# Deep Taxonomy: FDA Regulation Branch (L3 through L6)

## L1: FDA Drug & Device Regulation (`fda-regulation`)

### L2: Drug Products (`fda-regulation.drugs`)

#### L3: New Drug Applications (NDAs) (`fda-regulation.drugs.nda`)
- **Description:** FDA approval process for new pharmaceutical products including initial NDAs, supplemental applications, and post-approval requirements affecting prescribing and dispensing practices.
- **Classification signals:**
  - CFR: 21 CFR Parts 314.1-314.170, 21 CFR Part 201 (labeling)
  - Agency: Food and Drug Administration, Center for Drug Evaluation and Research (CDER)
  - Keywords: [new drug application] (Strong), [NDA] (Strong), [505(b)(1)] (Strong), [drug approval] (Strong), [supplemental NDA] (Moderate), [labeling changes] (Moderate), [ANDA suitability] (Weak)
  - Statutes: FD&C Act Section 505(b), 21 U.S.C. § 355(b)
- **Cross-classification triggers:** 
  > "If an entity classified in `fda-regulation.drugs.nda` contains any of: [REMS, risk evaluation], also classify in `fda-regulation.drugs.rems`"
  > "If an entity classified in `fda-regulation.drugs.nda` contains any of: [opioid, controlled substance], also classify in `controlled-substances.scheduling`"
  > "If an entity classified in `fda-regulation.drugs.nda` contains any of: [compounding, 503A, 503B], also classify in `compounding.503a.copy-prohibition`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Primary Care/DPC/Concierge | High |
| Pain Management | High |
| Weight Management | Medium |
| Compounding Pharmacy | Medium |

##### L4: Supplemental Applications (`fda-regulation.drugs.nda.supplements`)
- **Description:** Types of post-approval changes requiring FDA notification or approval including major changes (PAS), moderate changes (CBE-30), and minor changes (annual report).
- **Classification signals:**
  - CFR: 21 CFR 314.70, 314.71, 314.97
  - Agency: Food and Drug Administration, CDER
  - Keywords: [prior approval supplement] (Strong), [PAS] (Strong), [CBE-0] (Strong), [CBE-30] (Strong), [changes being effected] (Moderate), [annual report] (Moderate), [Type III DMF] (Weak)
  - Statutes: FD&C Act Section 505(b), 21 U.S.C. § 355(b)
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.drugs.nda.supplements` contains any of: [labeling change, medication guide], also classify in `fda-regulation.drugs.labeling`"
  > "If an entity classified in `fda-regulation.drugs.nda.supplements` contains any of: [manufacturing change, CMC], also classify in `compounding.503b.cgmp`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | Medium |

##### L4: Accelerated Approval (`fda-regulation.drugs.nda.accelerated`)
- **Description:** Expedited pathway for drugs treating serious conditions with unmet medical need, based on surrogate endpoints, requiring post-market confirmatory trials.
- **Classification signals:**
  - CFR: 21 CFR Part 314 Subpart H, 21 CFR Part 601 Subpart E
  - Agency: Food and Drug Administration, CDER, CBER
  - Keywords: [accelerated approval] (Strong), [subpart H] (Strong), [surrogate endpoint] (Strong), [confirmatory trial] (Strong), [unmet medical need] (Moderate), [provisional approval] (Moderate), [withdrawal proceedings] (Weak)
  - Statutes: FD&C Act Section 506(c), FDASIA Section 901
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.drugs.nda.accelerated` contains any of: [promotional restrictions, marketing limitations], also classify in `advertising-marketing.drug-promotion`"
  > "If an entity classified in `fda-regulation.drugs.nda.accelerated` contains any of: [Aduhelm, Makena], also classify in `medicare-billing.coverage-determinations`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Primary Care/DPC/Concierge | Medium |
| Compounding Pharmacy | Low |

#### L3: Generic Drugs & ANDAs (`fda-regulation.drugs.generics`)
- **Description:** Abbreviated approval pathway for generic drugs demonstrating bioequivalence to reference listed drugs, Orange Book listings, and patent certification requirements.
- **Classification signals:**
  - CFR: 21 CFR Part 314 Subpart C (314.92-314.99), 21 CFR Part 320
  - Agency: Food and Drug Administration, Office of Generic Drugs
  - Keywords: [ANDA] (Strong), [generic drug] (Strong), [bioequivalence] (Strong), [Orange Book] (Strong), [paragraph IV] (Moderate), [505(j)] (Moderate), [reference listed drug] (Moderate), [therapeutic equivalence] (Weak)
  - Statutes: FD&C Act Section 505(j), Hatch-Waxman Act
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.drugs.generics` contains any of: [authorized generic, AG], also classify in `fda-regulation.drugs.labeling`"
  > "If an entity classified in `fda-regulation.drugs.generics` contains any of: [drug shortage, discontinuation], also classify in `compounding.drug-shortages`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Primary Care/DPC/Concierge | Medium |

#### L3: Drug Labeling Requirements (`fda-regulation.drugs.labeling`)
- **Description:** Comprehensive requirements for prescription drug labeling including prescribing information, medication guides, patient package inserts, and container labels.
- **Classification signals:**
  - CFR: 21 CFR Part 201, 21 CFR 208, 21 CFR 310.501-310.509
  - Agency: Food and Drug Administration, CDER
  - Keywords: [prescribing information] (Strong), [medication guide] (Strong), [package insert] (Strong), [black box warning] (Strong), [contraindications] (Moderate), [adverse reactions] (Moderate), [PLR format] (Moderate), [highlights section] (Weak)
  - Statutes: FD&C Act Section 502, 21 U.S.C. § 352
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.drugs.labeling` contains any of: [REMS, medication guide REMS], also classify in `fda-regulation.drugs.rems`"
  > "If an entity classified in `fda-regulation.drugs.labeling` contains any of: [promotional labeling, advertising], also classify in `advertising-marketing.drug-promotion`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All prescribing practices | High |

##### L4: Medication Guides (`fda-regulation.drugs.labeling.med-guides`)
- **Description:** FDA-required patient labeling for specific drugs with serious risks, distributed at dispensing to ensure patients understand key safety information.
- **Classification signals:**
  - CFR: 21 CFR Part 208
  - Agency: Food and Drug Administration, CDER
  - Keywords: [medication guide] (Strong), [patient labeling] (Strong), [FDA-approved patient information] (Strong), [dispensing requirement] (Moderate), [serious risk] (Moderate), [patient counseling] (Weak)
  - Statutes: FD&C Act Section 505(b)
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.drugs.labeling.med-guides` contains any of: [opioid medication guide], also classify in `controlled-substances.opioid-specific`"
  > "If an entity classified in `fda-regulation.drugs.labeling.med-guides` contains any of: [pharmacy dispensing], also classify in `state-regulations.pharmacy`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All prescribing practices | High |
| Compounding Pharmacy | High |

#### L3: REMS Programs (`fda-regulation.drugs.rems`)
- **Description:** Risk Evaluation and Mitigation Strategies requiring special safety measures beyond standard labeling for drugs with serious risks, potentially restricting distribution or requiring special certification.
- **Classification signals:**
  - CFR: 21 CFR 314.520, 21 CFR 601.2
  - Agency: Food and Drug Administration, CDER, Office of Surveillance and Epidemiology
  - Keywords: [REMS] (Strong), [ETASU] (Strong), [risk evaluation and mitigation] (Strong), [restricted distribution] (Strong), [prescriber certification] (Moderate), [patient registry] (Moderate), [shared system REMS] (Moderate), [REMS modification] (Weak)
  - Statutes: FD&C Act Section 505-1, 21 U.S.C. § 355-1
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.drugs.rems` contains any of: [opioid REMS, TIRF REMS], also classify in `controlled-substances.opioid-specific`"
  > "If an entity classified in `fda-regulation.drugs.rems` contains any of: [clozapine, isotretinoin], also classify in `clinical-operations.quality-systems`"
  > "If an entity classified in `fda-regulation.drugs.rems` contains any of: [pharmacy certification], also classify in `state-regulations.pharmacy`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Pain Management | High |
| Primary Care/DPC/Concierge | High |
| Compounding Pharmacy | Medium |
| Weight Management | Medium |

##### L4: REMS with ETASU (`fda-regulation.drugs.rems.etasu`)
- **Description:** Elements to Assure Safe Use requiring healthcare provider certification, patient enrollment, specialized pharmacies, or monitoring to access high-risk medications.
- **Classification signals:**
  - CFR: 21 CFR 314.520(a)(1)
  - Agency: Food and Drug Administration, CDER
  - Keywords: [ETASU] (Strong), [elements to assure safe use] (Strong), [prescriber certification] (Strong), [patient enrollment] (Strong), [specialty pharmacy] (Moderate), [laboratory monitoring] (Moderate), [safe use conditions] (Weak)
  - Statutes: FD&C Act Section 505-1(f)
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.drugs.rems.etasu` contains any of: [TIRF REMS, opioid], also classify in `controlled-substances.prescribing.documentation`"
  > "If an entity classified in `fda-regulation.drugs.rems.etasu` contains any of: [iPLEDGE, pregnancy], also classify in `clinical-operations.informed-consent`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Pain Management | High |
| Primary Care/DPC/Concierge | Medium |

##### L4: Shared System REMS (`fda-regulation.drugs.rems.shared`)
- **Description:** REMS programs covering multiple drugs in a class with similar risks, administered through a single system for efficiency and consistency.
- **Classification signals:**
  - CFR: 21 CFR 314.520
  - Agency: Food and Drug Administration, CDER
  - Keywords: [shared system REMS] (Strong), [class REMS] (Strong), [TIRF REMS] (Strong — for opioids), [single shared system] (Moderate), [REMS integration] (Moderate), [class-wide requirements] (Weak)
  - Statutes: FD&C Act Section 505-1(i)
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.drugs.rems.shared` contains any of: [opioid class, TIRF], also classify in `controlled-substances.opioid-specific`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Pain Management | High |

#### L3: Drug Shortages (`fda-regulation.drugs.shortages`)
- **Description:** Manufacturer notification requirements for drug discontinuations or interruptions, FDA shortage list maintenance, and implications for compounding during shortages.
- **Classification signals:**
  - CFR: 21 CFR 314.81(b)(3)(iii), 21 CFR 600.82
  - Agency: Food and Drug Administration, CDER Drug Shortage Staff
  - Keywords: [drug shortage] (Strong), [discontinuation notice] (Strong), [FDA shortage list] (Strong), [supply interruption] (Strong), [6-month notification] (Moderate), [shortage mitigation] (Moderate), [allocation] (Weak)
  - Statutes: FD&C Act Section 506C, FDASIA Title X
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.drugs.shortages` contains any of: [compounding during shortage, 503A], also classify in `compounding.drug-shortages`"
  > "If an entity classified in `fda-regulation.drugs.shortages` contains any of: [semaglutide, tirzepatide, GLP-1], also classify in `compounding.503a.practice-specific.weight-loss`"
  > "If an entity classified in `fda-regulation.drugs.shortages` contains any of: [controlled substance shortage], also classify in `controlled-substances.dispensing`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Weight Management | High |
| Hospital-affiliated practices | High |

### L2: Medical Devices (`fda-regulation.devices`)

#### L3: Device Classification & Controls (`fda-regulation.devices.classification`)
- **Description:** FDA's risk-based classification system determining regulatory requirements from Class I (low risk) through Class III (high risk), establishing the control framework for each device type.
- **Classification signals:**
  - CFR: 21 CFR Part 860, 21 CFR Parts 862-892 (classification regulations)
  - Agency: Food and Drug Administration, Center for Devices and Radiological Health (CDRH)
  - Keywords: [Class I device] (Strong), [Class II device] (Strong), [Class III device] (Strong), [general controls] (Strong), [special controls] (Strong), [classification panel] (Moderate), [exempt device] (Moderate), [risk-based classification] (Weak)
  - Statutes: FD&C Act Section 513, Medical Device Amendments of 1976
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.devices.classification` contains any of: [aesthetic device, laser, RF], also classify in `fda-regulation.devices.aesthetic`"
  > "If an entity classified in `fda-regulation.devices.classification` contains any of: [software, AI, machine learning], also classify in `fda-regulation.devices.software`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Med Spa/Aesthetic Medicine | High |
| Regenerative Medicine | High |
| Pain Management | Medium |
| Chiropractic | Medium |

##### L4: Class II Special Controls (`fda-regulation.devices.classification.class-ii`)
- **Description:** Performance standards, postmarket surveillance, patient registries, and guidance documents serving as special controls for moderate-risk devices.
- **Classification signals:**
  - CFR: 21 CFR 861.1(b), device-specific regulations in 21 CFR 862-892
  - Agency: Food and Drug Administration, CDRH
  - Keywords: [special controls] (Strong), [Class II] (Strong), [performance standards] (Strong), [guidance document] (Moderate), [design controls] (Moderate), [postmarket surveillance] (Moderate), [patient registry] (Weak)
  - Statutes: FD&C Act Section 514(a)(1)(B)
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.devices.classification.class-ii` contains any of: [510(k), substantial equivalence], also classify in `fda-regulation.devices.510k`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Med Spa/Aesthetic Medicine | High |
| Regenerative Medicine | Medium |

#### L3: 510(k) Clearance (`fda-regulation.devices.510k`)
- **Description:** Premarket notification demonstrating substantial equivalence to legally marketed predicate devices, the primary pathway for Class II device clearance.
- **Classification signals:**
  - CFR: 21 CFR Part 807 Subpart E, 21 CFR 814.39
  - Agency: Food and Drug Administration, CDRH
  - Keywords: [510(k)] (Strong), [premarket notification] (Strong), [substantial equivalence] (Strong), [predicate device] (Strong), [traditional 510(k)] (Moderate), [special 510(k)] (Moderate), [abbreviated 510(k)] (Moderate), [SE determination] (Weak)
  - Statutes: FD&C Act Section 510(k), 21 U.S.C. § 360(k)
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.devices.510k` contains any of: [De Novo, no predicate], also classify in `fda-regulation.devices.de-novo`"
  > "If an entity classified in `fda-regulation.devices.510k` contains any of: [aesthetic indication, cosmetic], also classify in `fda-regulation.devices.aesthetic`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Med Spa/Aesthetic Medicine | High |
| Regenerative Medicine | High |
| Pain Management | Medium |

#### L3: Software as Medical Device (SaMD) (`fda-regulation.devices.software`)
- **Description:** Regulatory framework for medical device software including AI/ML-based devices, predetermined change control plans, and Digital Health Center of Excellence programs.
- **Classification signals:**
  - CFR: 21 CFR 820.30(g), 21 CFR Part 11
  - Agency: Food and Drug Administration, CDRH, Digital Health Center of Excellence
  - Keywords: [SaMD] (Strong), [software as medical device] (Strong), [AI/ML] (Strong), [predetermined change control] (Strong), [continuous learning] (Moderate), [locked algorithm] (Moderate), [clinical decision support] (Moderate), [digital therapeutic] (Weak)
  - Statutes: FD&C Act Section 520(o), 21st Century Cures Act Section 3060
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.devices.software` contains any of: [telehealth, remote monitoring], also classify in `telehealth.technology`"
  > "If an entity classified in `fda-regulation.devices.software` contains any of: [clinical decision support, CDS], also classify in `clinical-operations.technology`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| Primary Care/DPC/Concierge | Medium |
| Functional Medicine | Medium |

##### L4: AI/ML-Based Devices (`fda-regulation.devices.software.ai-ml`)
- **Description:** Evolving regulatory approach for artificial intelligence and machine learning medical devices including continuous learning systems and algorithm updates.
- **Classification signals:**
  - CFR: FDA Guidance "Proposed Regulatory Framework for Modifications to AI/ML-Based SaMD"
  - Agency: Food and Drug Administration, CDRH, Digital Health Center of Excellence
  - Keywords: [artificial intelligence] (Strong), [machine learning] (Strong), [continuous learning] (Strong), [algorithm change protocol] (Strong), [SaMD Pre-Cert] (Moderate), [good machine learning practice] (Moderate), [model update] (Weak)
  - Statutes: FD&C Act Section 515C (breakthrough devices)
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.devices.software.ai-ml` contains any of: [diagnostic AI, screening], also classify in `clinical-operations.laboratory`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| Primary Care/DPC/Concierge | Medium |

#### L3: Aesthetic Medical Devices (`fda-regulation.devices.aesthetic`)
- **Description:** Clearance and regulation of devices for aesthetic indications including lasers, RF devices, cryolipolysis, injectables delivery systems, with particular attention to intended use limitations.
- **Classification signals:**
  - CFR: 21 CFR 878.5400 (IPL), 21 CFR 878.4810 (laser), 21 CFR Part 1040 (laser products)
  - Agency: Food and Drug Administration, CDRH, Division of Surgical Devices
  - Keywords: [aesthetic device] (Strong), [cosmetic indication] (Strong), [laser hair removal] (Strong), [RF microneedling] (Strong), [IPL] (Moderate), [body contouring] (Moderate), [skin tightening] (Moderate), [wrinkle reduction] (Weak)
  - Statutes: FD&C Act Sections 201(h), 510(k)
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.devices.aesthetic` contains any of: [off-label use, unapproved indication], also classify in `advertising-marketing.ftc-compliance`"
  > "If an entity classified in `fda-regulation.devices.aesthetic` contains any of: [adverse event, burn, scarring], also classify in `fda-regulation.devices.mdr`"
  > "If an entity classified in `fda-regulation.devices.aesthetic` contains any of: [professional use only], also classify in `clinical-operations.scope-of-practice`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Med Spa/Aesthetic Medicine | High |
| Anti-Aging Medicine | High |
| Integrative Medicine | Medium |

##### L4: Laser & Light-Based Devices (`fda-regulation.devices.aesthetic.laser`)
- **Description:** FDA regulation of therapeutic and aesthetic lasers including classification levels, performance standards, and professional use requirements under radiological health regulations.
- **Classification signals:**
  - CFR: 21 CFR Part 1040.10-1040.11, 21 CFR 878.4810
  - Agency: Food and Drug Administration, CDRH
  - Keywords: [laser classification] (Strong), [Class IV laser] (Strong), [laser safety] (Strong), [wavelength specification] (Strong), [fluence] (Moderate), [pulse duration] (Moderate), [laser hazard] (Moderate), [protective eyewear] (Weak)
  - Statutes: FD&C Act Section 531-542 (Electronic Product Radiation Control)
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.devices.aesthetic.laser` contains any of: [operator training, certification], also classify in `state-regulations.scope-expansions`"
  > "If an entity classified in `fda-regulation.devices.aesthetic.laser` contains any of: [treatment protocol, parameters], also classify in `clinical-operations.quality-systems`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Med Spa/Aesthetic Medicine | High |
| Anti-Aging Medicine | Medium |

##### L4: Injectable Device Systems (`fda-regulation.devices.aesthetic.injectable`)
- **Description:** Devices for delivering aesthetic injectables including microneedling systems, injection assist devices, and combination product considerations with drugs/biologics.
- **Classification signals:**
  - CFR: 21 CFR 878.4430 (injector), 21 CFR 878.4800 (needle)
  - Agency: Food and Drug Administration, CDRH, Office of Combination Products
  - Keywords: [injection device] (Strong), [microneedling] (Strong), [dermal filler device] (Strong), [combination product] (Moderate), [needle-free injector] (Moderate), [pen injector] (Moderate), [auto-injector] (Weak)
  - Statutes: FD&C Act Section 503(g) (combination products)
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.devices.aesthetic.injectable` contains any of: [dermal filler, hyaluronic acid], also classify in `fda-regulation.devices.implants`"
  > "If an entity classified in `fda-regulation.devices.aesthetic.injectable` contains any of: [PRP system, centrifuge], also classify in `fda-regulation.biologics.hct-p`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Med Spa/Aesthetic Medicine | High |
| Anti-Aging Medicine | High |

#### L3: Medical Device Reporting (MDR) (`fda-regulation.devices.mdr`)
- **Description:** Mandatory adverse event reporting for device manufacturers, importers, and user facilities including death, serious injury, and malfunction reports.
- **Classification signals:**
  - CFR: 21 CFR Part 803
  - Agency: Food and Drug Administration, CDRH, Office of Surveillance and Biometrics
  - Keywords: [MDR] (Strong), [medical device reporting] (Strong), [serious injury] (Strong), [malfunction] (Strong), [Form 3500A] (Strong), [5-day report] (Moderate), [30-day report] (Moderate), [user facility] (Weak)
  - Statutes: FD&C Act Section 519, Safe Medical Devices Act
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.devices.mdr` contains any of: [patient death, serious adverse event], also classify in `clinical-operations.patient-safety`"
  > "If an entity classified in `fda-regulation.devices.mdr` contains any of: [recall, correction], also classify in `fda-regulation.enforcement`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Med Spa/Aesthetic Medicine | High |
| Hospital-affiliated practices | High |
| Pain Management | Medium |

### L2: Biologics & HCT/Ps (`fda-regulation.biologics`)

#### L3: Human Cells, Tissues, and Cellular and Tissue-Based Products (`fda-regulation.biologics.hct-p`)
- **Description:** Regulatory framework under 21 CFR Part 1271 distinguishing minimally manipulated 361 products from 351 products requiring premarket approval, critical for regenerative medicine practices.
- **Classification signals:**
  - CFR: 21 CFR Part 1271, 21 CFR Part 600-680 (biologics)
  - Agency: Food and Drug Administration, Center for Biologics Evaluation and Research (CBER), Office of Tissues and Advanced Therapies
  - Keywords: [HCT/P] (Strong), [361 product] (Strong), [351 product] (Strong), [minimal manipulation] (Strong), [homologous use] (Strong), [same surgical procedure] (Moderate), [structural tissue] (Moderate), [RMAT designation] (Weak)
  - Statutes: Public Health Service Act Section 351, Section 361; FD&C Act
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.biologics.hct-p` contains any of: [stem cells, adipose], also classify in `fda-regulation.biologics.stem-cells`"
  > "If an entity classified in `fda-regulation.biologics.hct-p` contains any of: [PRP, platelet rich plasma], also classify in `fda-regulation.biologics.prp`"
  > "If an entity classified in `fda-regulation.biologics.hct-p` contains any of: [warning letter, enforcement], also classify in `fda-regulation.enforcement`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Regenerative Medicine | High |
| Anti-Aging Medicine | High |
| Pain Management | High |
| Med Spa/Aesthetic Medicine | Medium |

##### L4: 361 HCT/P Criteria (`fda-regulation.biologics.hct-p.361-criteria`)
- **Description:** Four criteria determining whether an HCT/P qualifies for regulation solely under Section 361: minimal manipulation, homologous use, not combined with other articles, and no systemic effect.
- **Classification signals:**
  - CFR: 21 CFR 1271.3(f), 1271.10(a)
  - Agency: Food and Drug Administration, CBER, OTAT
  - Keywords: [361 criteria] (Strong), [minimal manipulation] (Strong), [homologous use] (Strong), [same surgical procedure exception] (Strong), [autologous use] (Moderate), [structural function] (Moderate), [metabolic activity] (Moderate), [adipose tissue] (Weak)
  - Statutes: Public Health Service Act Section 361
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.biologics.hct-p.361-criteria` contains any of: [more than minimal, enzyme digestion], also classify in `fda-regulation.biologics.hct-p.351-products`"
  > "If an entity classified in `fda-regulation.biologics.hct-p.361-criteria` contains any of: [non-homologous, different function], also classify in `fda-regulation.enforcement`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Regenerative Medicine | High |
| Anti-Aging Medicine | High |

###### L5: Minimal Manipulation Standards (`fda-regulation.biologics.hct-p.361-criteria.minimal`)
- **Description:** FDA's interpretation of processing that does not alter the relevant biological characteristics of tissue, differing for structural vs. cellular/nonstructural tissues.
- **Classification signals:**
  - CFR: 21 CFR 1271.3(f)
  - Agency: Food and Drug Administration, CBER
  - Keywords: [minimal manipulation] (Strong), [structural tissue] (Strong), [cellular tissue] (Strong), [processing] (Strong), [enzymatic digestion] (Moderate), [mechanical disruption] (Moderate), [original characteristics] (Weak)
  - Statutes: Public Health Service Act Section 361
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.biologics.hct-p.361-criteria.minimal` contains any of: [collagenase, enzyme], also classify in `fda-regulation.biologics.hct-p.351-products`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Regenerative Medicine | High |

###### L5: Homologous Use Determination (`fda-regulation.biologics.hct-p.361-criteria.homologous`)
- **Description:** Requirement that HCT/P perform same basic function in recipient as in donor, FDA's narrow interpretation affecting many regenerative applications.
- **Classification signals:**
  - CFR: 21 CFR 1271.3(c)
  - Agency: Food and Drug Administration, CBER
  - Keywords: [homologous use] (Strong), [same basic function] (Strong), [repair replacement reconstruction] (Strong), [cushioning] (Moderate — for adipose), [structural support] (Moderate), [non-homologous] (Moderate), [metabolic function] (Weak)
  - Statutes: Public Health Service Act Section 361
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.biologics.hct-p.361-criteria.homologous` contains any of: [different function, new indication], also classify in `fda-regulation.enforcement`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Regenerative Medicine | High |

##### L4: 351 Product Requirements (`fda-regulation.biologics.hct-p.351-products`)
- **Description:** HCT/Ps failing to meet all 361 criteria requiring BLA approval, clinical trials, and full biologics regulatory pathway including IND studies.
- **Classification signals:**
  - CFR: 21 CFR Part 600-680, 21 CFR 1271.20
  - Agency: Food and Drug Administration, CBER
  - Keywords: [351 product] (Strong), [BLA required] (Strong), [biologics license] (Strong), [clinical trials required] (Strong), [IND] (Moderate), [premarket approval] (Moderate), [unapproved new drug] (Weak)
  - Statutes: Public Health Service Act Section 351
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.biologics.hct-p.351-products` contains any of: [RMAT, regenerative medicine advanced therapy], also classify in `fda-regulation.biologics.rmat`"
  > "If an entity classified in `fda-regulation.biologics.hct-p.351-products` contains any of: [clinical trial, study], also classify in `fda-regulation.clinical-trials`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Regenerative Medicine | High |
| Clinical research sites | High |

#### L3: Platelet-Rich Plasma (PRP) (`fda-regulation.biologics.prp`)
- **Description:** FDA's regulatory position on PRP including when it qualifies as 361 HCT/P (same surgical procedure) versus requiring approval, affecting point-of-care systems and preparation methods.
- **Classification signals:**
  - CFR: 21 CFR 1271.15(b), FDA Guidance "Regulatory Considerations for Human Cells, Tissues, and Cellular and Tissue-Based Products"
  - Agency: Food and Drug Administration, CBER
  - Keywords: [platelet rich plasma] (Strong), [PRP] (Strong), [blood product] (Strong), [same surgical procedure] (Strong), [point of care] (Moderate), [autologous blood] (Moderate), [centrifuge system] (Moderate), [PRP kit] (Weak)
  - Statutes: Public Health Service Act Section 361
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.biologics.prp` contains any of: [510(k), cleared device], also classify in `fda-regulation.devices.510k`"
  > "If an entity classified in `fda-regulation.biologics.prp` contains any of: [more than minimal manipulation], also classify in `fda-regulation.biologics.hct-p.351-products`"
  > "If an entity classified in `fda-regulation.biologics.prp` contains any of: [aesthetic use, cosmetic], also classify in `fda-regulation.devices.aesthetic`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Regenerative Medicine | High |
| Med Spa/Aesthetic Medicine | High |
| Anti-Aging Medicine | High |
| Pain Management | High |

#### L3: Stem Cell & Regenerative Enforcement (`fda-regulation.biologics.stem-cells`)
- **Description:** FDA's enforcement priorities against unapproved stem cell treatments, court victories establishing jurisdiction, and ongoing warning letter campaigns against non-compliant clinics.
- **Classification signals:**
  - CFR: 21 CFR Part 1271, 21 CFR Part 312 (IND requirements)
  - Agency: Food and Drug Administration, CBER, Office of Compliance and Biologics Quality
  - Keywords: [stem cell] (Strong), [unapproved treatment] (Strong), [FDA enforcement] (Strong), [warning letter] (Strong), [US Stem Cell decision] (Moderate), [SVF] (Moderate — stromal vascular fraction), [adipose cells] (Moderate), [cord blood] (Weak)
  - Statutes: Public Health Service Act Section 351, FD&C Act Section 502(a)
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.biologics.stem-cells` contains any of: [permanent injunction, consent decree], also classify in `fda-regulation.enforcement`"
  > "If an entity classified in `fda-regulation.biologics.stem-cells` contains any of: [patient harm, adverse event], also classify in `clinical-operations.patient-safety`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Regenerative Medicine | High |
| Anti-Aging Medicine | High |
| Integrative Medicine | Medium |

### L2: Dietary Supplements (`fda-regulation.dietary-supplements`)

#### L3: DSHEA Framework (`fda-regulation.dietary-supplements.dshea`)
- **Description:** Core regulatory structure under Dietary Supplement Health and Education Act distinguishing supplements from drugs, defining permissible claims, and establishing safety standards.
- **Classification signals:**
  - CFR: 21 CFR Part 101.93-101.95, 21 CFR Part 111, 21 CFR 190.6
  - Agency: Food and Drug Administration, Center for Food Safety and Applied Nutrition (CFSAN)
  - Keywords: [DSHEA] (Strong), [dietary supplement] (Strong), [structure function claim] (Strong), [disease claim] (Strong), [dietary ingredient] (Moderate), [supplement facts] (Moderate), [third party literature] (Moderate), [food additive] (Weak)
  - Statutes: Dietary Supplement Health and Education Act of 1994, FD&C Act Section 201(ff)
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.dietary-supplements.dshea` contains any of: [disease treatment, therapeutic claim], also classify in `fda-regulation.enforcement`"
  > "If an entity classified in `fda-regulation.dietary-supplements.dshea` contains any of: [testimonial, endorsement], also classify in `advertising-marketing.patient-testimonials`"
  > "If an entity classified in `fda-regulation.dietary-supplements.dshea` contains any of: [CBD, hemp], also classify in `fda-regulation.dietary-supplements.cbd`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Functional Medicine | High |
| Integrative Medicine | High |
| Anti-Aging Medicine | High |
| Weight Management | High |
| Chiropractic | Medium |

##### L4: Structure/Function Claims (`fda-regulation.dietary-supplements.dshea.claims`)
- **Description:** Permissible claims about supplement effects on body structure or function, requiring substantiation and FDA disclaimer, distinguished from prohibited disease claims.
- **Classification signals:**
  - CFR: 21 CFR 101.93
  - Agency: Food and Drug Administration, CFSAN
  - Keywords: [structure function] (Strong), [maintains supports promotes] (Strong), [FDA disclaimer] (Strong), [substantiation] (Strong), [disease claim] (Moderate), [health claim] (Moderate), [nutrient deficiency] (Moderate), [implied claim] (Weak)
  - Statutes: FD&C Act Section 403(r)(6)
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.dietary-supplements.dshea.claims` contains any of: [treats cures prevents], also classify in `fda-regulation.enforcement`"
  > "If an entity classified in `fda-regulation.dietary-supplements.dshea.claims` contains any of: [weight loss, fat burning], also classify in `advertising-marketing.ftc-compliance`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Functional Medicine | High |
| Integrative Medicine | High |
| Weight Management | High |

#### L3: New Dietary Ingredients (NDI) (`fda-regulation.dietary-supplements.ndi`)
- **Description:** Pre-market notification requirements for dietary ingredients not marketed before October 15, 1994, including safety data submission and FDA's 75-day review period.
- **Classification signals:**
  - CFR: 21 CFR 190.6, 21 CFR 101.93
  - Agency: Food and Drug Administration, CFSAN, Office of Dietary Supplement Programs
  - Keywords: [NDI] (Strong), [new dietary ingredient] (Strong), [75-day notification] (Strong), [pre-1994] (Strong), [grandfathered ingredient] (Moderate), [safety data] (Moderate), [NDIN] (Moderate), [acknowledgment letter] (Weak)
  - Statutes: FD&C Act Section 413, DSHEA Section 8
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.dietary-supplements.ndi` contains any of: [objection letter, inadequate], also classify in `fda-regulation.enforcement`"
  > "If an entity classified in `fda-regulation.dietary-supplements.ndi` contains any of: [NAC, N-acetylcysteine], also classify in `fda-regulation.dietary-supplements.exclusions`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Functional Medicine | High |
| Integrative Medicine | High |
| Anti-Aging Medicine | Medium |

#### L3: CBD & Hemp Products (`fda-regulation.dietary-supplements.cbd`)
- **Description:** FDA's position on CBD as excluded from dietary supplement definition due to prior drug investigations, current enforcement discretion, and evolving regulatory framework.
- **Classification signals:**
  - CFR: FD&C Act Section 201(ff)(3)(B) exclusion clause
  - Agency: Food and Drug Administration, CFSAN, Office of Dietary Supplement Programs
  - Keywords: [CBD] (Strong), [cannabidiol] (Strong), [hemp extract] (Strong), [drug preclusion] (Strong), [Epidiolex] (Moderate), [enforcement discretion] (Moderate), [full spectrum] (Moderate), [THC content] (Weak)
  - Statutes: FD&C Act Section 201(ff)(3)(B), 2018 Farm Bill
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.dietary-supplements.cbd` contains any of: [warning letter, cease and desist], also classify in `fda-regulation.enforcement`"
  > "If an entity classified in `fda-regulation.dietary-supplements.cbd` contains any of: [state law, legal CBD], also classify in `state-regulations.controlled-substances`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Integrative Medicine | High |
| Functional Medicine | High |
| Pain Management | Medium |
| Chiropractic | Medium |

### L2: Cosmetics (MoCRA) (`fda-regulation.cosmetics`)

#### L3: MoCRA Registration & Listing (`fda-regulation.cosmetics.registration`)
- **Description:** New mandatory facility registration and product listing requirements under Modernization of Cosmetics Regulation Act, transforming previously voluntary cosmetic regulation.
- **Classification signals:**
  - CFR: 21 CFR Part 710 (facility registration), 21 CFR Part 720 (product listing)
  - Agency: Food and Drug Administration, CFSAN, Office of Cosmetics and Colors
  - Keywords: [MoCRA] (Strong), [facility registration] (Strong), [product listing] (Strong), [cosmetic manufacturer] (Strong), [responsible person] (Moderate), [INCI name] (Moderate), [professional use exemption] (Moderate), [small business] (Weak)
  - Statutes: FD&C Act Chapter VI (as amended by MoCRA), Consolidated Appropriations Act 2023
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.cosmetics.registration` contains any of: [cosmeceutical, drug-cosmetic], also classify in `fda-regulation.drugs`"
  > "If an entity classified in `fda-regulation.cosmetics.registration` contains any of: [professional use only], also classify in `clinical-operations.scope-of-practice`"
  > "If an entity classified in `fda-regulation.cosmetics.registration` contains any of: [med spa, aesthetic practice], also classify in `state-regulations.facility-permits`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Med Spa/Aesthetic Medicine | High |
| Anti-Aging Medicine | Medium |
| Integrative Medicine | Medium |

#### L3: Cosmetic Safety & Adverse Events (`fda-regulation.cosmetics.safety`)
- **Description:** MoCRA's new mandatory serious adverse event reporting, safety substantiation requirements, and recordkeeping obligations for cosmetic products.
- **Classification signals:**
  - CFR: 21 CFR Part 760 (proposed — adverse event reporting)
  - Agency: Food and Drug Administration, CFSAN
  - Keywords: [serious adverse event] (Strong), [15-day reporting] (Strong), [safety substantiation] (Strong), [cosmetic SAE] (Strong), [6-year retention] (Moderate), [FDA portal] (Moderate), [health hazard] (Moderate), [MedWatch cosmetic] (Weak)
  - Statutes: FD&C Act Section 604 (as added by MoCRA)
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.cosmetics.safety` contains any of: [recall, mandatory recall], also classify in `fda-regulation.enforcement`"
  > "If an entity classified in `fda-regulation.cosmetics.safety` contains any of: [GMP, manufacturing], also classify in `fda-regulation.cosmetics.gmp`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Med Spa/Aesthetic Medicine | High |
| Compounding Pharmacy | Medium |

#### L3: Professional Use Cosmetics (`fda-regulation.cosmetics.professional`)
- **Description:** Special considerations for cosmetics distributed solely to licensed professionals including labeling modifications and potential exemptions from certain MoCRA requirements.
- **Classification signals:**
  - CFR: 21 CFR Part 701 (labeling), MoCRA implementation guidance
  - Agency: Food and Drug Administration, CFSAN
  - Keywords: [professional use only] (Strong), [licensed professional] (Strong), [salon distribution] (Strong), [not for retail sale] (Moderate), [professional labeling] (Moderate), [practitioner cosmetic] (Moderate), [chemical peel] (Weak)
  - Statutes: FD&C Act Section 602 (cosmetic labeling)
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.cosmetics.professional` contains any of: [medical spa, aesthetic clinic], also classify in `clinical-operations.scope-of-practice`"
  > "If an entity classified in `fda-regulation.cosmetics.professional` contains any of: [compounded cosmetic], also classify in `compounding.503a`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Med Spa/Aesthetic Medicine | High |
| Anti-Aging Medicine | Medium |

### L2: Clinical Trials (`fda-regulation.clinical-trials`)

#### L3: Investigational New Drug (IND) (`fda-regulation.clinical-trials.ind`)
- **Description:** Requirements for conducting clinical trials of investigational drugs including IND application contents, safety reporting, and protocol amendments.
- **Classification signals:**
  - CFR: 21 CFR Part 312
  - Agency: Food and Drug Administration, CDER, Office of New Drugs
  - Keywords: [IND] (Strong), [investigational new drug] (Strong), [clinical hold] (Strong), [IND safety report] (Strong), [protocol amendment] (Moderate), [Form 1571] (Moderate), [30-day safety review] (Moderate), [phase 1] (Weak)
  - Statutes: FD&C Act Section 505(i)
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.clinical-trials.ind` contains any of: [informed consent, human subjects], also classify in `fda-regulation.clinical-trials.informed-consent`"
  > "If an entity classified in `fda-regulation.clinical-trials.ind` contains any of: [expanded access, compassionate use], also classify in `fda-regulation.clinical-trials.expanded-access`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Clinical research practices | High |
| Academic medical centers | High |

#### L3: Good Clinical Practice (GCP) (`fda-regulation.clinical-trials.gcp`)
- **Description:** Standards for design, conduct, monitoring, and reporting of clinical trials ensuring data integrity and subject protection, incorporating ICH guidelines.
- **Classification signals:**
  - CFR: 21 CFR Part 312.50-312.70, ICH E6(R2)
  - Agency: Food and Drug Administration, Office of Good Clinical Practice
  - Keywords: [GCP] (Strong), [good clinical practice] (Strong), [ICH E6] (Strong), [clinical trial monitoring] (Strong), [essential documents] (Moderate), [protocol deviation] (Moderate), [source documents] (Moderate), [ALCOA] (Weak)
  - Statutes: FD&C Act Section 505(i)
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.clinical-trials.gcp` contains any of: [data integrity, ALCOA+], also classify in `clinical-operations.recordkeeping`"
  > "If an entity classified in `fda-regulation.clinical-trials.gcp` contains any of: [IRB, ethics committee], also classify in `fda-regulation.clinical-trials.irb`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Clinical research practices | High |

### L2: FDA Enforcement (`fda-regulation.enforcement`)

#### L3: Warning Letters (`fda-regulation.enforcement.warning-letters`)
- **Description:** FDA's principal enforcement tool notifying firms of significant violations requiring prompt correction, creating public record and affecting regulatory standing.
- **Classification signals:**
  - CFR: FDA Regulatory Procedures Manual Chapter 4
  - Agency: Food and Drug Administration, Office of Regulatory Affairs
  - Keywords: [warning letter] (Strong), [FDA violation] (Strong), [15-day response] (Strong), [close-out letter] (Strong), [regulatory meeting] (Moderate), [corrective action] (Moderate), [CAPA plan] (Moderate), [public disclosure] (Weak)
  - Statutes: FD&C Act Section 301 et seq.
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.enforcement.warning-letters` contains any of: [compounding, 503A, 503B], also classify in `compounding.503a` or `compounding.503b`"
  > "If an entity classified in `fda-regulation.enforcement.warning-letters` contains any of: [stem cell, regenerative], also classify in `fda-regulation.biologics.stem-cells`"
  > "If an entity classified in `fda-regulation.enforcement.warning-letters` contains any of: [advertising, promotion], also classify in `advertising-marketing.ftc-compliance`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Regenerative Medicine | High |
| Med Spa/Aesthetic Medicine | Medium |
| Peptide Therapy | High |

#### L3: Import Alerts & Detentions (`fda-regulation.enforcement.import-alerts`)
- **Description:** FDA's ability to detain imported products without physical examination based on past violations, affecting practices sourcing foreign drugs, devices, or ingredients.
- **Classification signals:**
  - CFR: 21 CFR Part 1.83, 21 CFR Part 1.94-1.95
  - Agency: Food and Drug Administration, Office of Regulatory Affairs, Division of Import Operations
  - Keywords: [import alert] (Strong), [DWPE] (Strong — detention without physical examination), [red list] (Strong), [automatic detention] (Strong), [foreign supplier] (Moderate), [import refusal] (Moderate), [appearance rate] (Moderate), [removal petition] (Weak)
  - Statutes: FD&C Act Section 801
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.enforcement.import-alerts` contains any of: [bulk API, pharmaceutical ingredient], also classify in `compounding.bulk-substances.quality`"
  > "If an entity classified in `fda-regulation.enforcement.import-alerts` contains any of: [peptide, research chemical], also classify in `compounding.503a.practice-specific.peptides`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| Peptide Therapy | High |
| Anti-Aging Medicine | Medium |

#### L3: Consent Decrees & Injunctions (`fda-regulation.enforcement.consent-decrees`)
- **Description:** Court-ordered agreements requiring comprehensive remediation and ongoing FDA oversight, representing most severe enforcement short of criminal prosecution.
- **Classification signals:**
  - CFR: FDA Regulatory Procedures Manual Chapter 6
  - Agency: Food and Drug Administration, Office of Chief Counsel
  - Keywords: [consent decree] (Strong), [permanent injunction] (Strong), [preliminary injunction] (Strong), [TRO] (Strong — temporary restraining order), [disgorgement] (Moderate), [third party expert] (Moderate), [remediation plan] (Moderate), [court oversight] (Weak)
  - Statutes: FD&C Act Section 302, 21 U.S.C. § 332
- **Cross-classification triggers:**
  > "If an entity classified in `fda-regulation.enforcement.consent-decrees` contains any of: [US Stem Cell, regenerative clinic], also classify in `fda-regulation.biologics.stem-cells`"
  > "If an entity classified in `fda-regulation.enforcement.consent-decrees` contains any of: [compounding, sterile], also classify in `compounding.503b`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Regenerative Medicine | High |
| Compounding Pharmacy | High |

---

## Summary Statistics

**Total nodes produced: 62**
- L3 nodes: 26
- L4 nodes: 24
- L5 nodes: 10
- L6 nodes: 2

**Distribution across L2 domains:**
- fda-regulation.drugs: 12 nodes
- fda-regulation.devices: 14 nodes
- fda-regulation.biologics: 11 nodes
- fda-regulation.dietary-supplements: 8 nodes
- fda-regulation.cosmetics: 3 nodes
- fda-regulation.clinical-trials: 5 nodes
- fda-regulation.enforcement: 9 nodes

This comprehensive FDA Regulation taxonomy captures the full scope of FDA oversight affecting Cedar's target practice types, with extensive cross-classification triggers ensuring consistency with the Compounding and Controlled Substances branches from Sessions 5-A and 5-B. The depth appropriately reflects the complexity of FDA's regulatory framework, particularly in areas like biologics/HCT/Ps and medical devices that are central to regenerative medicine and aesthetic practices.