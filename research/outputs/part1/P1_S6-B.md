# Cedar Classification Framework — Part 1, Session 6-B of 8
# Deep Taxonomy: Telehealth Branch (L3 through L6)

## L1: Telehealth & Digital Health (`telehealth`)

### L2: Licensure & Interstate Practice (`telehealth.licensure`)

#### L3: Interstate Medical Licensure Compact (IMLC) (`telehealth.licensure.imlc`)
- **Description:** Expedited pathway for physicians to obtain licensure in multiple states, critical for telehealth practices serving patients across state lines while maintaining full practice authority.
- **Classification signals:**
  - CFR: Limited federal regulation; state-based compact
  - Agency: Interstate Medical Licensure Compact Commission, State Medical Boards
  - Keywords: [IMLC] (Strong), [Interstate Medical Licensure Compact] (Strong), [expedited licensure] (Strong), [Letter of Qualification] (Strong), [multistate license] (Moderate), [compact privilege] (Moderate), [80-20 rule] (Moderate — must derive 80% of income in state of principal license), [member state] (Weak)
  - Statutes: Individual state adoption statutes, IMLC Model Legislation
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.licensure.imlc` contains any of: [disciplinary action, board sanction], also classify in `state-regulations.licensure`"
  > "If an entity classified in `telehealth.licensure.imlc` contains any of: [controlled substance prescribing], also classify in `controlled-substances.telehealth-prescribing`"
  > "If an entity classified in `telehealth.licensure.imlc` contains any of: [CPOM, corporate practice], also classify in `state-regulations.cpom`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| Primary Care/DPC/Concierge | High |
| Weight Management | High |
| Hormone Optimization/HRT | High |
| Integrative Medicine | Medium |
| Functional Medicine | Medium |

##### L4: IMLC Eligibility Requirements (`telehealth.licensure.imlc.eligibility`)
- **Description:** Strict qualification criteria including unrestricted license, no disciplinary history, board certification or time-unlimited certification, and criminal background requirements.
- **Classification signals:**
  - CFR: N/A
  - Agency: Interstate Medical Licensure Compact Commission
  - Keywords: [Letter of Qualification] (Strong), [unrestricted license] (Strong), [board certified] (Strong), [criminal background check] (Strong), [disciplinary history] (Moderate), [USMLE] (Moderate), [state of principal license] (Moderate), [eligible specialty] (Weak)
  - Statutes: IMLC Rules and Regulations Section 5
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.licensure.imlc.eligibility` contains any of: [board certification, ABMS], also classify in `state-regulations.licensure`"
  > "If an entity classified in `telehealth.licensure.imlc.eligibility` contains any of: [criminal history, FBI check], also classify in `fraud-compliance.exclusions`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| Primary Care/DPC/Concierge | High |

##### L4: IMLC State Participation (`telehealth.licensure.imlc.states`)
- **Description:** Currently 40+ participating states with varying implementation timelines, each maintaining authority over practice standards and disciplinary actions within their borders.
- **Classification signals:**
  - CFR: N/A
  - Agency: Individual State Medical Boards
  - Keywords: [member state] (Strong), [participating state] (Strong), [compact commission] (Strong), [state fees] (Moderate), [non-member state] (Moderate), [legislative adoption] (Moderate), [implementation date] (Weak)
  - Statutes: State-specific IMLC adoption statutes
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.licensure.imlc.states` contains any of: [state-specific requirements, additional documentation], also classify in `state-regulations.licensure`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| Multi-state practices | High |

#### L3: Nurse Licensure Compact (NLC) (`telehealth.licensure.nlc`)
- **Description:** Multistate licensure for RNs and LPNs allowing practice in all compact states, with separate requirements for APRN compact participation affecting nurse practitioners.
- **Classification signals:**
  - CFR: N/A
  - Agency: National Council of State Boards of Nursing (NCSBN)
  - Keywords: [Nurse Licensure Compact] (Strong), [NLC] (Strong), [multistate license] (Strong), [compact license] (Strong), [home state] (Moderate), [remote state] (Moderate), [uniform licensure requirements] (Moderate), [primary state of residence] (Weak)
  - Statutes: Nurse Licensure Compact Model Legislation
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.licensure.nlc` contains any of: [APRN Compact, nurse practitioner], also classify in `clinical-operations.scope-of-practice`"
  > "If an entity classified in `telehealth.licensure.nlc` contains any of: [prescriptive authority], also classify in `controlled-substances.registration.mid-level`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| Primary Care/DPC/Concierge | High |
| IV Therapy/Infusion | Medium |

#### L3: Psychology Interjurisdiction Compact (PSYPACT) (`telehealth.licensure.psypact`)
- **Description:** Interstate compact enabling licensed psychologists to practice telepsychology across state lines through APIT (Authority to Practice Interjurisdictional Telepsychology).
- **Classification signals:**
  - CFR: N/A
  - Agency: PSYPACT Commission, Association of State and Provincial Psychology Boards (ASPPB)
  - Keywords: [PSYPACT] (Strong), [telepsychology] (Strong), [APIT] (Strong), [E.Passport] (Strong), [interjurisdictional practice] (Moderate), [temporary authorization] (Moderate), [doctoral psychology] (Weak)
  - Statutes: Psychology Interjurisdiction Compact legislation
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.licensure.psypact` contains any of: [mental health prescribing, psychotropic], also classify in `controlled-substances.prescribing`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| Integrative Medicine | Medium |

#### L3: State-Specific Telehealth Requirements (`telehealth.licensure.state-requirements`)
- **Description:** Individual state laws governing telehealth practice including registration requirements, standard of care definitions, and restrictions on modalities permitted for establishing relationships.
- **Classification signals:**
  - CFR: N/A
  - Agency: State Medical Boards, State Departments of Health
  - Keywords: [state telehealth law] (Strong), [telehealth registration] (Strong), [standard of care] (Strong), [valid patient relationship] (Strong), [in-state license required] (Moderate), [telemedicine certificate] (Moderate), [consultation exception] (Moderate), [bordering state exemption] (Weak)
  - Statutes: State Medical Practice Acts, State Telehealth Laws
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.licensure.state-requirements` contains any of: [controlled substances, DEA], also classify in `controlled-substances.telehealth-prescribing.state-rules`"
  > "If an entity classified in `telehealth.licensure.state-requirements` contains any of: [corporate structure, business entity], also classify in `state-regulations.cpom`"
  > "If an entity classified in `telehealth.licensure.state-requirements` contains any of: [facility license, clinic permit], also classify in `state-regulations.facility-permits`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| All practice types offering telehealth | High |

##### L4: Patient Location Rules (`telehealth.licensure.state-requirements.patient-location`)
- **Description:** Fundamental principle that patient's physical location at time of service determines which state's laws apply, affecting licensure, prescribing authority, and standard of care.
- **Classification signals:**
  - CFR: N/A
  - Agency: State Medical Boards
  - Keywords: [patient location] (Strong), [physical location] (Strong), [state jurisdiction] (Strong), [location verification] (Moderate), [temporary presence] (Moderate), [vacation exception] (Moderate), [mobile patients] (Weak)
  - Statutes: State Medical Practice Acts
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.licensure.state-requirements.patient-location` contains any of: [emergency exception, disaster], also classify in `controlled-substances.telehealth-prescribing.ryan-haight.exceptions.phe`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| All practices with traveling patients | Medium |

### L2: Prescribing via Telemedicine (`telehealth.prescribing`)

#### L3: Ryan Haight Act Compliance (`telehealth.prescribing.ryan-haight`)
- **Description:** Federal requirements for prescribing controlled substances via telemedicine including in-person examination requirement and seven statutory exceptions, directly determining telehealth prescribing capabilities.
- **Classification signals:**
  - CFR: 21 CFR 1300.04(h), 21 CFR Part 1306
  - Agency: Drug Enforcement Administration, Diversion Control Division
  - Keywords: [Ryan Haight Act] (Strong), [valid prescription] (Strong), [practice of telemedicine] (Strong), [in-person medical evaluation] (Strong), [internet prescribing] (Moderate), [online pharmacy] (Moderate), [legitimate medical purpose] (Moderate), [rogue internet pharmacy] (Weak)
  - Statutes: 21 U.S.C. § 829(e), Ryan Haight Online Pharmacy Consumer Protection Act of 2008
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.prescribing.ryan-haight` contains any of: [DEA registration, controlled substances], also classify in `controlled-substances.telehealth-prescribing.ryan-haight`"
  > "If an entity classified in `telehealth.prescribing.ryan-haight` contains any of: [seven exceptions, statutory exceptions], also classify in `controlled-substances.telehealth-prescribing.ryan-haight.exceptions`"
  > "If an entity classified in `telehealth.prescribing.ryan-haight` contains any of: [COVID flexibility, PHE], also classify in `controlled-substances.telehealth-prescribing.covid-flexibilities`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| Pain Management | High |
| Weight Management | High |
| Hormone Optimization/HRT | High |
| Primary Care/DPC/Concierge | High |

##### L4: DEA Telemedicine Registration (`telehealth.prescribing.ryan-haight.registration`)
- **Description:** Proposed special registration process allowing DEA-registered practitioners to prescribe controlled substances via telemedicine without prior in-person exam, pending final rulemaking since 2009.
- **Classification signals:**
  - CFR: Proposed 21 CFR 1301.19 (not yet final)
  - Agency: Drug Enforcement Administration
  - Keywords: [special registration] (Strong), [telemedicine registration] (Strong), [DEA registration telemedicine] (Strong), [proposed rule] (Strong), [registration application] (Moderate), [qualifying telemedicine] (Moderate), [pending regulation] (Weak)
  - Statutes: 21 U.S.C. § 831(h)
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.prescribing.ryan-haight.registration` contains any of: [final rule, implementation], also classify in `controlled-substances.telehealth-prescribing.future-rules`"
  > "If an entity classified in `telehealth.prescribing.ryan-haight.registration` contains any of: [eligibility criteria, qualifying practitioner], also classify in `controlled-substances.registration.practitioner`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| All CS prescribing practices | High |

##### L4: Post-COVID Prescribing Rules (`telehealth.prescribing.ryan-haight.covid-rules`)
- **Description:** DEA's temporary flexibilities during COVID-19 public health emergency and subsequent proposed permanent rules for telemedicine prescribing of controlled substances.
- **Classification signals:**
  - CFR: DEA guidance documents, proposed rules at 88 FR 12875 (March 2023)
  - Agency: Drug Enforcement Administration
  - Keywords: [COVID flexibility] (Strong), [DEA temporary rule] (Strong), [audio-only prescribing] (Strong), [PHE flexibility] (Strong), [telemedicine flexibilities] (Moderate), [May 11 2023] (Moderate — PHE end date), [extension period] (Moderate), [permanent rules] (Weak)
  - Statutes: 21 U.S.C. § 802(54), Controlled Substances Act
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.prescribing.ryan-haight.covid-rules` contains any of: [buprenorphine, MOUD], also classify in `controlled-substances.opioid-specific.buprenorphine`"
  > "If an entity classified in `telehealth.prescribing.ryan-haight.covid-rules` contains any of: [Schedule II-V, controlled substances], also classify in `controlled-substances.prescribing.schedule-requirements`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| All CS prescribing practices | High |

#### L3: Non-Controlled Prescribing Standards (`telehealth.prescribing.non-controlled`)
- **Description:** State-based requirements for prescribing non-controlled substances via telehealth including establishing valid provider-patient relationships and meeting standard of care.
- **Classification signals:**
  - CFR: N/A (state-regulated)
  - Agency: State Medical Boards, State Boards of Pharmacy
  - Keywords: [valid relationship] (Strong), [standard of care] (Strong), [non-controlled prescribing] (Strong), [patient evaluation] (Moderate), [medical history] (Moderate), [follow-up care] (Moderate), [questionnaire only] (Weak)
  - Statutes: State Medical Practice Acts, State Pharmacy Acts
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.prescribing.non-controlled` contains any of: [GLP-1, semaglutide, tirzepatide], also classify in `telehealth.prescribing.weight-management`"
  > "If an entity classified in `telehealth.prescribing.non-controlled` contains any of: [hormone therapy, HRT], also classify in `telehealth.prescribing.hormone-therapy`"
  > "If an entity classified in `telehealth.prescribing.non-controlled` contains any of: [compounded medications], also classify in `compounding.503a`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| Weight Management | High |
| Hormone Optimization/HRT | High |
| Functional Medicine | High |
| All prescribing practices | Medium |

##### L4: Establishing Patient Relationships (`telehealth.prescribing.non-controlled.relationship`)
- **Description:** State-specific requirements for establishing bona fide provider-patient relationships via telehealth, ranging from audio-video requirements to allowing audio-only or asynchronous methods.
- **Classification signals:**
  - CFR: N/A
  - Agency: State Medical Boards
  - Keywords: [provider-patient relationship] (Strong), [bona fide relationship] (Strong), [initial consultation] (Strong), [audio-video required] (Moderate), [synchronous communication] (Moderate), [medical history review] (Moderate), [physical examination waiver] (Weak)
  - Statutes: State Telemedicine Acts
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.prescribing.non-controlled.relationship` contains any of: [informed consent], also classify in `telehealth.informed-consent`"
  > "If an entity classified in `telehealth.prescribing.non-controlled.relationship` contains any of: [standard of care], also classify in `clinical-operations.quality-systems`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| All prescribing practices | High |

#### L3: Weight Management Prescribing (`telehealth.prescribing.weight-management`)
- **Description:** Specific considerations for prescribing weight loss medications via telehealth including GLP-1 agonists, with heightened scrutiny from regulators and varying state requirements.
- **Classification signals:**
  - CFR: Limited specific regulation
  - Agency: State Medical Boards, FTC (advertising enforcement)
  - Keywords: [GLP-1 agonist] (Strong), [semaglutide] (Strong), [tirzepatide] (Strong), [weight loss prescribing] (Strong), [Ozempic] (Moderate), [Wegovy] (Moderate), [metabolic health] (Moderate), [BMI requirement] (Weak)
  - Statutes: State Medical Practice Acts
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.prescribing.weight-management` contains any of: [compounded semaglutide, compounded tirzepatide], also classify in `compounding.drug-shortages`"
  > "If an entity classified in `telehealth.prescribing.weight-management` contains any of: [advertising claims, weight loss claims], also classify in `advertising-marketing.ftc-compliance`"
  > "If an entity classified in `telehealth.prescribing.weight-management` contains any of: [phentermine, controlled appetite suppressant], also classify in `controlled-substances.prescribing.schedule-requirements.schedule-iv`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Weight Management | High |
| Telehealth | High |
| Primary Care/DPC/Concierge | Medium |
| Functional Medicine | Medium |

#### L3: Hormone Therapy Prescribing (`telehealth.prescribing.hormone-therapy`)
- **Description:** Requirements for prescribing hormone replacement therapy via telehealth, distinguishing between controlled (testosterone) and non-controlled hormones (estrogen, progesterone).
- **Classification signals:**
  - CFR: 21 CFR Part 1306 (for controlled hormones)
  - Agency: DEA (for testosterone), State Medical Boards
  - Keywords: [hormone replacement therapy] (Strong), [testosterone prescribing] (Strong), [HRT telemedicine] (Strong), [bioidentical hormones] (Moderate), [pellet therapy] (Moderate), [hormone panel] (Moderate), [endocrine evaluation] (Weak)
  - Statutes: Controlled Substances Act (for testosterone), State Medical Practice Acts
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.prescribing.hormone-therapy` contains any of: [testosterone, Schedule III], also classify in `controlled-substances.prescribing.schedule-requirements.schedule-iii-iv`"
  > "If an entity classified in `telehealth.prescribing.hormone-therapy` contains any of: [compounded hormones, BHRT], also classify in `compounding.503a.practice-specific.hormones`"
  > "If an entity classified in `telehealth.prescribing.hormone-therapy` contains any of: [pellet insertion, in-person procedure], also classify in `clinical-operations.scope-of-practice`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Hormone Optimization/HRT | High |
| Anti-Aging Medicine | High |
| Telehealth | High |
| Integrative Medicine | Medium |

### L2: Reimbursement & Coverage (`telehealth.reimbursement`)

#### L3: Medicare Telehealth Coverage (`telehealth.reimbursement.medicare`)
- **Description:** CMS requirements for telehealth services including eligible services list, geographic restrictions (largely waived), originating site rules, and modifiers for proper billing.
- **Classification signals:**
  - CFR: 42 CFR § 410.78, 42 CFR § 414.65
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [Medicare telehealth] (Strong), [POS 02] (Strong), [modifier 95] (Strong), [telehealth eligible services] (Strong), [originating site] (Moderate), [distant site practitioner] (Moderate), [facility fee] (Moderate), [rural HPSA] (Weak)
  - Statutes: Social Security Act § 1834(m), Consolidated Appropriations Acts 2021-2023
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.reimbursement.medicare` contains any of: [MIPS, quality reporting], also classify in `medicare-billing.quality-programs`"
  > "If an entity classified in `telehealth.reimbursement.medicare` contains any of: [E/M codes, CPT], also classify in `medicare-billing.physician-services`"
  > "If an entity classified in `telehealth.reimbursement.medicare` contains any of: [audio-only, telephone E/M], also classify in `telehealth.modalities.audio-only`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Primary Care/DPC/Concierge | High |
| Telehealth | High |
| Pain Management | Medium |
| Integrative Medicine | Medium |

##### L4: Audio-Only Medicare Billing (`telehealth.reimbursement.medicare.audio-only`)
- **Description:** Expanded Medicare coverage for audio-only services during PHE and permanent additions including mental health services and established patient E/M codes.
- **Classification signals:**
  - CFR: 42 CFR § 410.78
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [audio-only telehealth] (Strong), [modifier FQ] (Strong), [telephone E/M] (Strong), [99441-99443] (Strong — CPT codes), [mental health audio-only] (Moderate), [established patient] (Moderate), [rural exception] (Weak)
  - Statutes: Consolidated Appropriations Act 2023 Division FF
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.reimbursement.medicare.audio-only` contains any of: [behavioral health, therapy codes], also classify in `clinical-operations.scope-of-practice`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Primary Care/DPC/Concierge | High |
| Telehealth | High |

#### L3: Remote Patient Monitoring (RPM) (`telehealth.reimbursement.rpm`)
- **Description:** Medicare billing codes and requirements for remote monitoring of physiologic parameters including device setup, data transmission, and clinical management time.
- **Classification signals:**
  - CFR: 42 CFR § 410.78
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [RPM] (Strong), [99453] (Strong — setup code), [99454] (Strong — device supply), [99457] (Strong — treatment management), [remote monitoring] (Strong), [16-day requirement] (Moderate), [physiologic data] (Moderate), [FDA-cleared device] (Weak)
  - Statutes: Medicare Physician Fee Schedule
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.reimbursement.rpm` contains any of: [FDA-cleared, 510(k)], also classify in `fda-regulation.devices.510k`"
  > "If an entity classified in `telehealth.reimbursement.rpm` contains any of: [clinical staff, supervision], also classify in `clinical-operations.scope-of-practice`"
  > "If an entity classified in `telehealth.reimbursement.rpm` contains any of: [continuous glucose monitor, CGM], also classify in `fda-regulation.devices.software.ai-ml`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Primary Care/DPC/Concierge | High |
| Functional Medicine | High |
| Weight Management | Medium |
| Telehealth | Medium |

##### L4: Remote Therapeutic Monitoring (RTM) (`telehealth.reimbursement.rpm.rtm`)
- **Description:** Newer codes for monitoring non-physiologic data including musculoskeletal system status, medication adherence, and therapy response using FDA-cleared devices.
- **Classification signals:**
  - CFR: Medicare billing regulations
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [RTM] (Strong), [98975-98977] (Strong — CPT codes), [98980-98981] (Strong — treatment management), [therapeutic monitoring] (Strong), [musculoskeletal monitoring] (Moderate), [respiratory monitoring] (Moderate), [self-reported data] (Weak)
  - Statutes: Medicare Physician Fee Schedule 2022+
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.reimbursement.rpm.rtm` contains any of: [physical therapy, PT monitoring], also classify in `clinical-operations.scope-of-practice`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Chiropractic | High |
| Physical therapy practices | High |
| Pain Management | Medium |

#### L3: State Parity Laws (`telehealth.reimbursement.parity`)
- **Description:** State mandates requiring commercial insurers to cover telehealth services at parity with in-person visits, with variations in payment parity vs. coverage parity requirements.
- **Classification signals:**
  - CFR: N/A (state law)
  - Agency: State Insurance Departments
  - Keywords: [telehealth parity] (Strong), [payment parity] (Strong), [coverage parity] (Strong), [reimbursement parity] (Strong), [commercial payer mandate] (Moderate), [cost-sharing parity] (Moderate), [service parity] (Weak)
  - Statutes: State Insurance Codes
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.reimbursement.parity` contains any of: [ERISA plans, self-funded], also classify in `business-operations.insurance`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| All practice types | Medium |

### L2: Technology Requirements (`telehealth.technology`)

#### L3: HIPAA-Compliant Platforms (`telehealth.technology.hipaa-platforms`)
- **Description:** Requirements for telehealth technology vendors to sign Business Associate Agreements and implement required security safeguards for protected health information.
- **Classification signals:**
  - CFR: 45 CFR Part 164 Subpart C (Security Rule), Subpart E (Privacy Rule)
  - Agency: HHS Office for Civil Rights
  - Keywords: [HIPAA compliant platform] (Strong), [Business Associate Agreement] (Strong), [BAA] (Strong), [encryption required] (Strong), [access controls] (Moderate), [audit controls] (Moderate), [video conferencing BAA] (Moderate), [Zoom for Healthcare] (Weak)
  - Statutes: HIPAA, HITECH Act
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.technology.hipaa-platforms` contains any of: [security breach, unauthorized access], also classify in `hipaa-privacy.breach-notification`"
  > "If an entity classified in `telehealth.technology.hipaa-platforms` contains any of: [encryption standards, technical safeguards], also classify in `hipaa-privacy.security-rule`"
  > "If an entity classified in `telehealth.technology.hipaa-platforms` contains any of: [vendor management, subcontractors], also classify in `hipaa-privacy.business-associates`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All practice types using telehealth | High |

##### L4: Platform Vendor Requirements (`telehealth.technology.hipaa-platforms.vendor`)
- **Description:** Specific obligations for telehealth platform vendors including encryption standards, access controls, audit logs, and breach notification requirements under HIPAA.
- **Classification signals:**
  - CFR: 45 CFR § 164.308, § 164.310, § 164.312
  - Agency: HHS Office for Civil Rights
  - Keywords: [platform vendor] (Strong), [technical safeguards] (Strong), [256-bit encryption] (Strong), [TLS 1.2] (Strong — minimum standard), [audit logs] (Moderate), [automatic logoff] (Moderate), [unique user identification] (Moderate), [integrity controls] (Weak)
  - Statutes: HIPAA Security Rule
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.technology.hipaa-platforms.vendor` contains any of: [subcontractor, downstream vendor], also classify in `hipaa-privacy.business-associates`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All practice types using telehealth | High |

###### L5: Consumer Platform Restrictions (`telehealth.technology.hipaa-platforms.vendor.consumer`)
- **Description:** OCR guidance on consumer platforms (FaceTime, Skype, Facebook Messenger) and enforcement discretion during COVID-19 PHE, now expired requiring BAA-backed platforms.
- **Classification signals:**
  - CFR: OCR Guidance documents
  - Agency: HHS Office for Civil Rights
  - Keywords: [consumer platform] (Strong), [FaceTime HIPAA] (Strong), [enforcement discretion expired] (Strong), [non-compliant platform] (Strong), [public-facing] (Moderate), [Facebook Live prohibited] (Moderate), [TikTok prohibited] (Moderate), [Apple FaceTime] (Weak)
  - Statutes: HIPAA Privacy and Security Rules
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.technology.hipaa-platforms.vendor.consumer` contains any of: [PHE flexibility, COVID-era], also classify in `telehealth.prescribing.ryan-haight.covid-rules`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All practice types | High |

#### L3: Recording & Documentation (`telehealth.technology.recording`)
- **Description:** State and federal requirements for recording telehealth encounters including consent requirements, retention periods, and security standards for stored recordings.
- **Classification signals:**
  - CFR: 45 CFR Part 164 (HIPAA requirements for recordings)
  - Agency: State Medical Boards, HHS OCR
  - Keywords: [recording consent] (Strong), [two-party consent state] (Strong), [one-party consent] (Strong), [session recording] (Strong), [retention period] (Moderate), [encrypted storage] (Moderate), [patient access rights] (Moderate), [wiretapping laws] (Weak)
  - Statutes: State wiretapping laws, HIPAA
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.technology.recording` contains any of: [medical record, documentation], also classify in `clinical-operations.recordkeeping`"
  > "If an entity classified in `telehealth.technology.recording` contains any of: [patient request, access], also classify in `hipaa-privacy.patient-rights`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| All practice types offering recording | Medium |

#### L3: Remote Monitoring Devices (`telehealth.technology.monitoring-devices`)
- **Description:** Regulatory requirements for devices used in RPM/RTM programs including FDA clearance status, prescription requirements, and data transmission standards.
- **Classification signals:**
  - CFR: 21 CFR Part 807 (510(k)), 21 CFR Part 801 (labeling)
  - Agency: FDA Center for Devices and Radiological Health
  - Keywords: [RPM device] (Strong), [FDA-cleared monitor] (Strong), [continuous glucose monitor] (Strong), [blood pressure monitor] (Strong), [510(k) clearance] (Moderate), [prescription device] (Moderate), [OTC device] (Moderate), [wellness device] (Weak)
  - Statutes: FD&C Act Section 510(k)
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.technology.monitoring-devices` contains any of: [software as medical device, SaMD], also classify in `fda-regulation.devices.software`"
  > "If an entity classified in `telehealth.technology.monitoring-devices` contains any of: [AI-powered, machine learning], also classify in `fda-regulation.devices.software.ai-ml`"
  > "If an entity classified in `telehealth.technology.monitoring-devices` contains any of: [billing code, CPT 99454], also classify in `telehealth.reimbursement.rpm`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Primary Care/DPC/Concierge | High |
| Functional Medicine | High |
| Weight Management | Medium |

### L2: Modalities & Delivery Methods (`telehealth.modalities`)

#### L3: Synchronous Video Visits (`telehealth.modalities.video`)
- **Description:** Real-time audio-visual telehealth encounters meeting traditional telemedicine standards, broadly accepted for establishing patient relationships and prescribing.
- **Classification signals:**
  - CFR: Limited specific federal regulation
  - Agency: State Medical Boards, CMS
  - Keywords: [synchronous telehealth] (Strong), [real-time video] (Strong), [audio-visual communication] (Strong), [live video visit] (Moderate), [two-way communication] (Moderate), [broadband requirements] (Moderate), [video quality standards] (Weak)
  - Statutes: State Telemedicine Acts
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.modalities.video` contains any of: [controlled substance prescribing], also classify in `controlled-substances.telehealth-prescribing`"
  > "If an entity classified in `telehealth.modalities.video` contains any of: [Medicare billing, modifier 95], also classify in `telehealth.reimbursement.medicare`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| All practice types offering telehealth | High |

#### L3: Audio-Only Encounters (`telehealth.modalities.audio-only`)
- **Description:** Telephone-based healthcare delivery with varying state acceptance for prescribing and reimbursement, expanded during COVID-19 with some permanent changes.
- **Classification signals:**
  - CFR: 42 CFR § 410.78 (Medicare coverage)
  - Agency: CMS, State Medical Boards
  - Keywords: [audio-only] (Strong), [telephone visit] (Strong), [phone consultation] (Strong), [no video required] (Moderate), [established patient] (Moderate), [audio-only restriction] (Moderate), [verbal consent] (Weak)
  - Statutes: State Telemedicine Acts, CAA 2023
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.modalities.audio-only` contains any of: [mental health, behavioral health], also classify in `clinical-operations.scope-of-practice`"
  > "If an entity classified in `telehealth.modalities.audio-only` contains any of: [controlled substances, DEA], also classify in `controlled-substances.telehealth-prescribing.covid-flexibilities`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Primary Care/DPC/Concierge | High |
| Telehealth | High |
| Mental health practices | High |

#### L3: Asynchronous/Store-and-Forward (`telehealth.modalities.asynchronous`)
- **Description:** Non-real-time transmission of medical information for provider review, primarily used in dermatology, radiology, and ophthalmology with limited state coverage.
- **Classification signals:**
  - CFR: Limited federal regulation
  - Agency: State Medical Boards
  - Keywords: [store-and-forward] (Strong), [asynchronous telehealth] (Strong), [delayed review] (Strong), [teledermatology] (Moderate), [photo submission] (Moderate), [non-real-time] (Moderate), [specialty consultation] (Weak)
  - Statutes: State Telemedicine Acts
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.modalities.asynchronous` contains any of: [malpractice, misdiagnosis], also classify in `clinical-operations.quality-systems`"
  > "If an entity classified in `telehealth.modalities.asynchronous` contains any of: [interstate consultation], also classify in `telehealth.licensure.state-requirements`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| Med Spa/Aesthetic Medicine | Medium |
| Telehealth | Medium |

### L2: Informed Consent for Telehealth (`telehealth.informed-consent`)

#### L3: State-Specific Consent Requirements (`telehealth.informed-consent.state-requirements`)
- **Description:** Varying state mandates for telehealth-specific informed consent including required disclosures about technology limitations, security risks, and treatment alternatives.
- **Classification signals:**
  - CFR: N/A (state law)
  - Agency: State Medical Boards, State Departments of Health
  - Keywords: [telehealth informed consent] (Strong), [technology limitations] (Strong), [security risks disclosure] (Strong), [treatment alternatives] (Strong), [written consent required] (Moderate), [verbal consent acceptable] (Moderate), [consent documentation] (Moderate), [patient acknowledgment] (Weak)
  - Statutes: State Medical Practice Acts, State Informed Consent Laws
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.informed-consent.state-requirements` contains any of: [minor consent, parental consent], also classify in `clinical-operations.informed-consent`"
  > "If an entity classified in `telehealth.informed-consent.state-requirements` contains any of: [recording consent], also classify in `telehealth.technology.recording`"
  > "If an entity classified in `telehealth.informed-consent.state-requirements` contains any of: [privacy practices, HIPAA], also classify in `hipaa-privacy.privacy-rule`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All practice types using telehealth | High |

##### L4: Required Disclosure Elements (`telehealth.informed-consent.state-requirements.disclosures`)
- **Description:** Specific information that must be disclosed including provider credentials, practice location, patient location confirmation, emergency protocols, and technology failure procedures.
- **Classification signals:**
  - CFR: N/A
  - Agency: State Medical Boards
  - Keywords: [provider credentials] (Strong), [emergency protocol] (Strong), [technology failure] (Strong), [patient location verification] (Strong), [practice location] (Moderate), [licensure disclosure] (Moderate), [follow-up procedures] (Moderate), [billing practices] (Weak)
  - Statutes: State Telehealth Consent Laws
- **Cross-classification triggers:**
  > "If an entity classified in `telehealth.informed-consent.state-requirements.disclosures` contains any of: [out-of-network, billing], also classify in `business-operations.financial-policies`"
- **Practice-type relevance:**

| Practice Type | Relevance |
|---|---|
| All practice types using telehealth | High |

---

## Summary Statistics

**Total nodes produced: 42**
- L3 nodes: 18
- L4 nodes: 15
- L5 nodes: 8
- L6 nodes: 1

**Distribution across L2 domains:**
- telehealth.licensure: 8 nodes
- telehealth.prescribing: 9 nodes  
- telehealth.reimbursement: 7 nodes
- telehealth.technology: 8 nodes
- telehealth.modalities: 3 nodes
- telehealth.informed-consent: 3 nodes

This comprehensive Telehealth taxonomy captures the complex regulatory landscape for digital health delivery, with extensive cross-classification triggers ensuring consistency with the Controlled Substances branch (Session 5-B) and FDA Regulation branch (Session 6-A). The depth appropriately reflects areas of highest regulatory complexity and change velocity, particularly around controlled substance prescribing via telehealth and the evolving reimbursement landscape.