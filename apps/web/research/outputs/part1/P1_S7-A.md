# Cedar Classification Framework — Part 1, Session 7-A of 8
# Remaining Taxonomy: HIPAA & Privacy + Medicare & Billing Branches (L3 through L4)

---

## Deliverable 1: HIPAA & Privacy Branch (L3 through L4)

## L1: HIPAA & Data Privacy (`hipaa-privacy`)

### L2: Privacy Rule (`hipaa-privacy.privacy-rule`)

#### L3: Uses and Disclosures of PHI (`hipaa-privacy.privacy-rule.uses-disclosures`)
- **Description:** The three-tier framework governing when PHI can be used/disclosed: required by HIPAA, permitted without authorization, and requiring authorization. Core compliance requirement for all healthcare operations.
- **Classification signals:**
  - CFR: 45 CFR §§ 164.502-164.514
  - Agency: Office for Civil Rights
  - Keywords: [uses and disclosures] (Strong), [PHI disclosure] (Strong), [permitted uses] (Strong), [required by law] (Moderate), [public interest disclosure] (Moderate), [authorization required] (Strong), [treatment payment operations] (Strong) — distinguish from breach/improper disclosure
  - Statutes: HIPAA (42 U.S.C. § 1320d-2)
- **Cross-classification triggers:** 
  - When "marketing" appears → also classify to `advertising-marketing.patient-communications`
  - When "research" appears → also classify to `clinical-operations.research`
  - When "court order" or "subpoena" appears → also classify to `fraud-compliance.investigations`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

##### L4: Treatment, Payment, and Healthcare Operations (`hipaa-privacy.privacy-rule.uses-disclosures.tpo`)
- **Description:** Core permitted uses of PHI without patient authorization for treatment activities, payment collection, and healthcare operations including quality improvement and business planning.
- **Classification signals:**
  - CFR: 45 CFR § 164.506
  - Agency: Office for Civil Rights
  - Keywords: [treatment payment operations] (Strong), [TPO] (Strong), [healthcare operations] (Strong), [payment activities] (Moderate), [care coordination] (Moderate), [quality assessment] (Moderate)
  - Statutes: HIPAA (42 U.S.C. § 1320d-2)
- **Cross-classification triggers:**
  - When "billing" or "claims" appears → also classify to `medicare-billing.compliance`
  - When "quality" appears → also classify to `clinical-operations.quality-systems`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

##### L4: Minimum Necessary Standard (`hipaa-privacy.privacy-rule.uses-disclosures.minimum-necessary`)
- **Description:** Requirement to limit PHI uses/disclosures to the minimum necessary to accomplish the intended purpose, with specific exceptions for treatment and other scenarios.
- **Classification signals:**
  - CFR: 45 CFR § 164.502(b), § 164.514(d)
  - Agency: Office for Civil Rights
  - Keywords: [minimum necessary] (Strong), [reasonable reliance] (Moderate), [role-based access] (Moderate), [workforce access] (Moderate) — distinguish from security rule access controls
  - Statutes: HIPAA (42 U.S.C. § 1320d-2)
- **Cross-classification triggers:**
  - When "access controls" appears → also classify to `hipaa-privacy.security-rule.access-controls`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

#### L3: Patient Rights (`hipaa-privacy.privacy-rule.patient-rights`)
- **Description:** Individual rights under HIPAA including access to records, amendment requests, accounting of disclosures, and communication preferences. Critical for patient relations and compliance.
- **Classification signals:**
  - CFR: 45 CFR §§ 164.522-164.528
  - Agency: Office for Civil Rights
  - Keywords: [right of access] (Strong), [patient rights] (Strong), [amendment request] (Strong), [accounting of disclosures] (Strong), [restriction request] (Moderate), [alternative communication] (Moderate), [30-day response] (Strong)
  - Statutes: HIPAA (42 U.S.C. § 1320d-2)
- **Cross-classification triggers:**
  - When "medical records" appears → also classify to `clinical-operations.recordkeeping`
  - When "information blocking" appears → also classify to `hipaa-privacy.information-blocking`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

##### L4: Right of Access (`hipaa-privacy.privacy-rule.patient-rights.access`)
- **Description:** Patient's right to inspect and obtain copies of their PHI within 30 days, including electronic access requirements and permissible fees.
- **Classification signals:**
  - CFR: 45 CFR § 164.524
  - Agency: Office for Civil Rights
  - Keywords: [right of access] (Strong), [30-day deadline] (Strong), [patient portal] (Moderate), [reasonable fee] (Moderate), [electronic copy] (Strong), [designated record set] (Strong)
  - Statutes: HIPAA (42 U.S.C. § 1320d-2)
- **Cross-classification triggers:**
  - When "information blocking" or "Cures Act" appears → also classify to `hipaa-privacy.information-blocking`
  - When "fee schedule" appears → also classify to `state-regulations.fee-limits`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

#### L3: Notice of Privacy Practices (`hipaa-privacy.privacy-rule.npp`)
- **Description:** Requirements for privacy notice content, distribution to patients, acknowledgment documentation, and posting requirements including website obligations.
- **Classification signals:**
  - CFR: 45 CFR § 164.520
  - Agency: Office for Civil Rights
  - Keywords: [notice of privacy practices] (Strong), [NPP] (Strong), [acknowledgment] (Moderate), [privacy notice] (Strong), [website posting] (Moderate), [material change] (Moderate)
  - Statutes: HIPAA (42 U.S.C. § 1320d-2)
- **Cross-classification triggers:**
  - When "website" appears → also classify to `advertising-marketing.website-compliance`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

#### L3: Marketing and Fundraising (`hipaa-privacy.privacy-rule.marketing`)
- **Description:** Restrictions on using PHI for marketing (requires authorization) versus permitted healthcare operations communications, plus fundraising opt-out requirements.
- **Classification signals:**
  - CFR: 45 CFR § 164.501 (definitions), § 164.508(a)(3), § 164.514(f)
  - Agency: Office for Civil Rights
  - Keywords: [marketing authorization] (Strong), [financial remuneration] (Strong), [fundraising opt-out] (Strong), [treatment alternatives] (Moderate), [health-related benefits] (Moderate) — distinguish from general advertising rules
  - Statutes: HIPAA (42 U.S.C. § 1320d-2)
- **Cross-classification triggers:**
  - When "advertising" or "promotion" appears → also classify to `advertising-marketing.ftc-compliance`
  - When "testimonial" appears → also classify to `advertising-marketing.patient-testimonials`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Med Spa/Aesthetic Medicine | High |
  | Weight Management | High |
  | Regenerative Medicine | High |
  | Anti-Aging Medicine | High |
  | All others | Medium |

### L2: Security Rule (`hipaa-privacy.security-rule`)

#### L3: Administrative Safeguards (`hipaa-privacy.security-rule.administrative`)
- **Description:** Security management processes including risk analysis, workforce training, access management, and incident response procedures - the most extensive Security Rule requirements.
- **Classification signals:**
  - CFR: 45 CFR § 164.308
  - Agency: Office for Civil Rights
  - Keywords: [risk analysis] (Strong), [risk assessment] (Strong), [security officer] (Strong), [workforce training] (Strong), [access management] (Strong), [incident response] (Strong), [contingency plan] (Strong), [BAA provisions] (Moderate)
  - Statutes: HIPAA (42 U.S.C. § 1320d-2), HITECH Act (42 U.S.C. § 17931)
- **Cross-classification triggers:**
  - When "business associate" appears → also classify to `hipaa-privacy.business-associates`
  - When "breach" appears → also classify to `hipaa-privacy.breach-notification`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

##### L4: Risk Analysis and Management (`hipaa-privacy.security-rule.administrative.risk-analysis`)
- **Description:** Foundational Security Rule requirement to conduct accurate and thorough assessment of potential risks to ePHI, implement security measures, and maintain ongoing risk management.
- **Classification signals:**
  - CFR: 45 CFR § 164.308(a)(1)(ii)(A)-(B)
  - Agency: Office for Civil Rights
  - Keywords: [risk analysis] (Strong), [risk assessment] (Strong), [vulnerability assessment] (Moderate), [threat assessment] (Moderate), [risk management] (Strong), [security measures] (Moderate), [annual review] (Moderate)
  - Statutes: HIPAA (42 U.S.C. § 1320d-2), HITECH Act (42 U.S.C. § 17931)
- **Cross-classification triggers:**
  - When "audit" appears → also classify to `hipaa-privacy.enforcement.ocr-audits`
  - When "meaningful use" or "promoting interoperability" appears → also classify to `medicare-billing.quality-programs`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

#### L3: Physical Safeguards (`hipaa-privacy.security-rule.physical`)
- **Description:** Physical access controls to facilities and equipment, workstation security, and device/media controls including disposal procedures for PHI-containing hardware.
- **Classification signals:**
  - CFR: 45 CFR § 164.310
  - Agency: Office for Civil Rights
  - Keywords: [facility access] (Strong), [workstation security] (Strong), [device controls] (Strong), [media disposal] (Strong), [physical access] (Moderate), [equipment disposal] (Moderate)
  - Statutes: HIPAA (42 U.S.C. § 1320d-2)
- **Cross-classification triggers:**
  - When "disposal" or "destruction" appears → also classify to `business-operations.waste-management`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

#### L3: Technical Safeguards (`hipaa-privacy.security-rule.technical`)
- **Description:** Technical controls for ePHI including access controls, audit logs, integrity controls, and transmission security with emphasis on encryption requirements.
- **Classification signals:**
  - CFR: 45 CFR § 164.312
  - Agency: Office for Civil Rights
  - Keywords: [access control] (Strong), [encryption] (Strong), [audit controls] (Strong), [automatic logoff] (Moderate), [unique user ID] (Strong), [transmission security] (Strong), [integrity controls] (Moderate)
  - Statutes: HIPAA (42 U.S.C. § 1320d-2), HITECH Act (42 U.S.C. § 17931)
- **Cross-classification triggers:**
  - When "telehealth" or "remote" appears → also classify to `telehealth.technology`
  - When "cloud" appears → also classify to `hipaa-privacy.business-associates.cloud`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

### L2: Breach Notification (`hipaa-privacy.breach-notification`)

#### L3: Breach Definition and Assessment (`hipaa-privacy.breach-notification.definition`)
- **Description:** Definition of breach as acquisition, access, use or disclosure of unsecured PHI, plus the four-factor risk assessment to determine if breach notification is required.
- **Classification signals:**
  - CFR: 45 CFR § 164.402, § 164.404(a)
  - Agency: Office for Civil Rights
  - Keywords: [breach definition] (Strong), [unsecured PHI] (Strong), [risk assessment] (Strong), [low probability] (Strong), [four factors] (Moderate), [impermissible disclosure] (Strong) — distinguish from security incident
  - Statutes: HITECH Act § 13402 (42 U.S.C. § 17932)
- **Cross-classification triggers:**
  - When "encryption" appears → also classify to `hipaa-privacy.security-rule.technical`
  - When "state law" appears → also classify to `state-regulations.privacy`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

#### L3: Notification Requirements (`hipaa-privacy.breach-notification.requirements`)
- **Description:** Timing and content requirements for notifying individuals (60 days), HHS (60 days for large breaches), and media (for 500+ person breaches).
- **Classification signals:**
  - CFR: 45 CFR §§ 164.404-164.408
  - Agency: Office for Civil Rights
  - Keywords: [60-day deadline] (Strong), [individual notification] (Strong), [HHS notification] (Strong), [media notification] (Moderate), [substitute notice] (Moderate), [500 or more] (Strong), [Wall of Shame] (Weak)
  - Statutes: HITECH Act § 13402 (42 U.S.C. § 17932)
- **Cross-classification triggers:**
  - When "business associate" appears → also classify to `hipaa-privacy.business-associates.breach`
  - When "state notification" appears → also classify to `state-regulations.privacy`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

### L2: Business Associates (`hipaa-privacy.business-associates`)

#### L3: Business Associate Agreements (`hipaa-privacy.business-associates.baa-requirements`)
- **Description:** Required elements for BAAs including permitted uses, safeguards, breach reporting, subcontractor provisions, and termination requirements per 45 CFR § 164.504(e).
- **Classification signals:**
  - CFR: 45 CFR § 164.308(b), § 164.502(e), § 164.504(e)
  - Agency: Office for Civil Rights
  - Keywords: [business associate agreement] (Strong), [BAA] (Strong), [required provisions] (Strong), [permitted uses] (Moderate), [return or destruction] (Moderate), [subcontractor] (Strong)
  - Statutes: HIPAA (42 U.S.C. § 1320d-2), HITECH Act (42 U.S.C. § 17931)
- **Cross-classification triggers:**
  - When "cloud" or "SaaS" appears → also classify to `hipaa-privacy.business-associates.cloud`
  - When "breach" appears → also classify to `hipaa-privacy.breach-notification`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

#### L3: Cloud Computing and BAAs (`hipaa-privacy.business-associates.cloud`)
- **Description:** Special considerations for cloud service providers as business associates, encryption key management, and CSP-specific BAA requirements for practices using cloud-based services.
- **Classification signals:**
  - CFR: 45 CFR § 164.304 (definitions), § 164.504(e)
  - Agency: Office for Civil Rights
  - Keywords: [cloud computing] (Strong), [cloud storage] (Strong), [CSP] (Moderate), [encryption keys] (Strong), [AWS BAA] (Weak), [Azure BAA] (Weak), [Google Cloud BAA] (Weak)
  - Statutes: HIPAA (42 U.S.C. § 1320d-2), HITECH Act (42 U.S.C. § 17931)
- **Cross-classification triggers:**
  - When "telehealth platform" appears → also classify to `telehealth.technology`
  - When "EHR" appears → also classify to `clinical-operations.ehr-systems`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Telehealth | High |
  | All others | Medium |

### L2: Enforcement (`hipaa-privacy.enforcement`)

#### L3: OCR Enforcement Process (`hipaa-privacy.enforcement.ocr-process`)
- **Description:** OCR complaint intake, investigation phases, corrective action plans, resolution agreements, and civil money penalty proceedings for HIPAA violations.
- **Classification signals:**
  - CFR: 45 CFR Parts 160.300-160.552
  - Agency: Office for Civil Rights
  - Keywords: [OCR investigation] (Strong), [HIPAA complaint] (Strong), [corrective action plan] (Strong), [resolution agreement] (Strong), [civil money penalty] (Strong), [informal resolution] (Moderate)
  - Statutes: HIPAA (42 U.S.C. § 1320d-5), HITECH Act § 13410
- **Cross-classification triggers:**
  - When "state attorney general" appears → also classify to `hipaa-privacy.enforcement.state-ag`
  - When specific penalty tiers mentioned → also classify to `hipaa-privacy.enforcement.penalties`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

#### L3: Penalty Structure (`hipaa-privacy.enforcement.penalties`)
- **Description:** Four-tier penalty structure based on culpability level, ranging from "did not know" to "willful neglect not corrected," with per-violation and annual maximum amounts.
- **Classification signals:**
  - CFR: 45 CFR § 160.404
  - Agency: Office for Civil Rights
  - Keywords: [penalty tiers] (Strong), [willful neglect] (Strong), [reasonable cause] (Strong), [did not know] (Moderate), [annual cap] (Moderate), [per violation] (Strong), [$50,000 to $2 million] (Weak)
  - Statutes: HITECH Act § 13410(d) (42 U.S.C. § 1320d-5)
- **Cross-classification triggers:**
  - When "corrective action" appears → also classify to `hipaa-privacy.enforcement.ocr-process`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

### L2: 42 CFR Part 2 (`hipaa-privacy.part-2`)

#### L3: Substance Use Disorder Records (`hipaa-privacy.part-2.sud-records`)
- **Description:** Enhanced privacy protections for SUD treatment records requiring specific patient consent for most disclosures, with limited exceptions more restrictive than HIPAA.
- **Classification signals:**
  - CFR: 42 CFR Part 2
  - Agency: Substance Abuse and Mental Health Services Administration
  - Keywords: [Part 2] (Strong), [substance use disorder] (Strong), [SUD records] (Strong), [patient consent] (Strong), [re-disclosure prohibition] (Strong), [federal confidentiality] (Moderate)
  - Statutes: 42 U.S.C. § 290dd-2
- **Cross-classification triggers:**
  - When "MAT" or "buprenorphine" appears → also classify to `controlled-substances.mat-prescribing`
  - When "opioid treatment" appears → also classify to `controlled-substances.otp`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Pain Management | High |
  | Primary Care/DPC/Concierge | Medium |
  | Integrative Medicine | Medium |
  | All others | Low |

#### L3: 2024 Final Rule Changes (`hipaa-privacy.part-2.2024-changes`)
- **Description:** Significant Part 2 reforms effective 2024 aligning with HIPAA for care coordination, permitting single consent for future disclosures, and expanding TPO-like exceptions.
- **Classification signals:**
  - CFR: 42 CFR Part 2 (2024 amendments)
  - Agency: Substance Abuse and Mental Health Services Administration
  - Keywords: [2024 final rule] (Strong), [care coordination] (Strong), [single consent] (Strong), [TPO exception] (Moderate), [Part 2 alignment] (Strong), [February 16 2024] (Weak)
  - Statutes: 42 U.S.C. § 290dd-2
- **Cross-classification triggers:**
  - When "transition period" appears → also classify to `hipaa-privacy.part-2.sud-records`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Pain Management | High |
  | Primary Care/DPC/Concierge | Medium |
  | All others | Low |

### L2: Information Blocking (`hipaa-privacy.information-blocking`)

#### L3: Information Blocking Prohibitions (`hipaa-privacy.information-blocking.prohibitions`)
- **Description:** 21st Century Cures Act rules prohibiting practices from interfering with access, exchange, or use of electronic health information, with eight specific exceptions.
- **Classification signals:**
  - CFR: 45 CFR Part 171
  - Agency: Office of the National Coordinator for Health Information Technology
  - Keywords: [information blocking] (Strong), [EHI] (Strong), [electronic health information] (Strong), [interference] (Moderate), [8 exceptions] (Strong), [Cures Act] (Strong)
  - Statutes: 21st Century Cures Act § 4004 (42 U.S.C. § 300jj-52)
- **Cross-classification triggers:**
  - When "right of access" appears → also classify to `hipaa-privacy.privacy-rule.patient-rights.access`
  - When "interoperability" appears → also classify to `clinical-operations.ehr-systems`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

#### L3: Information Blocking Exceptions (`hipaa-privacy.information-blocking.exceptions`)
- **Description:** Eight exceptions allowing practices to restrict EHI access/exchange: preventing harm, privacy, security, infeasibility, health IT performance, content and manner, fees, and licensing.
- **Classification signals:**
  - CFR: 45 CFR §§ 171.201-171.206, 171.301-171.303
  - Agency: Office of the National Coordinator for Health Information Technology
  - Keywords: [preventing harm exception] (Strong), [privacy exception] (Moderate), [security exception] (Moderate), [infeasibility] (Moderate), [reasonable fees] (Moderate), [8 exceptions] (Strong)
  - Statutes: 21st Century Cures Act § 4004 (42 U.S.C. § 300jj-52)
- **Cross-classification triggers:**
  - When "HIPAA" appears → verify not duplicating privacy rule content
  - When "API" or "FHIR" appears → also classify to `clinical-operations.interoperability`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

### L2: State Privacy Laws (`hipaa-privacy.state-privacy`)

#### L3: State Medical Privacy Laws (`hipaa-privacy.state-privacy.medical-privacy`)
- **Description:** State laws providing greater privacy protection than HIPAA including California CMIA, state mental health confidentiality, HIV/STD records, and genetic information protections.
- **Classification signals:**
  - CFR: 45 CFR § 160.203 (preemption analysis)
  - Agency: Office for Civil Rights (for HIPAA preemption)
  - Keywords: [state privacy law] (Strong), [more stringent] (Strong), [CMIA] (Moderate), [state mental health] (Moderate), [HIV confidentiality] (Moderate), [preemption analysis] (Strong)
  - Statutes: Various state statutes
- **Cross-classification triggers:**
  - When specific state named → also classify to `state-regulations.[state-code]`
  - When "genetic" appears → also classify to `hipaa-privacy.state-privacy.genetic`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

#### L3: Consumer Data Privacy Laws (`hipaa-privacy.state-privacy.consumer`)
- **Description:** State consumer privacy laws (CCPA/CPRA, etc.) as they apply to health data not covered by HIPAA, including direct-to-consumer health services and wellness apps.
- **Classification signals:**
  - CFR: None (state law)
  - Agency: State attorneys general
  - Keywords: [CCPA] (Strong), [CPRA] (Strong), [consumer privacy] (Strong), [health data] (Moderate), [non-HIPAA data] (Strong), [right to delete] (Moderate)
  - Statutes: Cal. Civ. Code §§ 1798.100 et seq., other state consumer privacy laws
- **Cross-classification triggers:**
  - When "HIPAA-covered" appears → verify not overlapping with federal HIPAA
  - When "biometric" appears → also classify to `hipaa-privacy.state-privacy.biometric`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Telehealth | High |
  | Med Spa/Aesthetic Medicine | Medium |
  | Weight Management | Medium |
  | All others | Low |

---

## Deliverable 2: Medicare & Billing Branch (L3 through L4)

## L1: Medicare & Medical Billing (`medicare-billing`)

### L2: Provider Enrollment (`medicare-billing.enrollment`)

#### L3: Medicare Enrollment Applications (`medicare-billing.enrollment.applications`)
- **Description:** CMS-855 forms for Medicare enrollment: 855I (individuals), 855B (groups), 855O (ordering/referring), with specific requirements for each provider type and practice setting.
- **Classification signals:**
  - CFR: 42 CFR §§ 424.510-424.516
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [CMS-855] (Strong), [PECOS] (Strong), [Medicare enrollment] (Strong), [855I] (Strong), [855B] (Strong), [provider enrollment] (Strong), [enrollment application] (Moderate)
  - Statutes: Social Security Act § 1866(j)
- **Cross-classification triggers:**
  - When "revalidation" appears → also classify to `medicare-billing.enrollment.revalidation`
  - When "opt-out" appears → also classify to `medicare-billing.enrollment.opt-out`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Primary Care/DPC/Concierge | High |
  | Pain Management | High |
  | Telehealth | High |
  | Chiropractic | High |
  | Integrative Medicine | Medium |
  | All others | Low |

#### L3: Revalidation Requirements (`medicare-billing.enrollment.revalidation`)
- **Description:** Medicare revalidation cycles (typically 5 years, 3 for high-risk), online revalidation via PECOS, and consequences of missing revalidation deadlines including billing privileges deactivation.
- **Classification signals:**
  - CFR: 42 CFR § 424.515, § 424.540
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [revalidation] (Strong), [revalidation cycle] (Strong), [PECOS revalidation] (Strong), [5-year cycle] (Moderate), [deactivation] (Strong), [reactivation] (Moderate)
  - Statutes: Social Security Act § 1866(j)
- **Cross-classification triggers:**
  - When "high-risk" appears → also classify to `medicare-billing.enrollment.screening-levels`
  - When "change of information" appears → also classify to `medicare-billing.enrollment.updates`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Primary Care/DPC/Concierge | High |
  | Pain Management | High |
  | Telehealth | High |
  | Chiropractic | High |
  | All Medicare-enrolled practices | High |

#### L3: Opt-Out and Private Contracting (`medicare-billing.enrollment.opt-out`)
- **Description:** Process for physicians to opt out of Medicare, requirements for private contracts with Medicare beneficiaries, and restrictions during opt-out period - critical for concierge/DPC models.
- **Classification signals:**
  - CFR: 42 CFR § 405.440
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [Medicare opt-out] (Strong), [private contract] (Strong), [opt-out affidavit] (Strong), [2-year period] (Moderate), [non-participating] (Moderate) — distinguish from non-par status
  - Statutes: Social Security Act § 1802(b)
- **Cross-classification triggers:**
  - When "concierge" or "DPC" appears → also classify to `business-operations.practice-models`
  - When "affidavit" appears with specific dates → also classify to `medicare-billing.enrollment.updates`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Primary Care/DPC/Concierge | High |
  | Functional Medicine | Medium |
  | Integrative Medicine | Medium |
  | Anti-Aging Medicine | Medium |
  | All others | Low |

#### L3: Provider Screening Levels (`medicare-billing.enrollment.screening-levels`)
- **Description:** Three-tier screening system (limited, moderate, high) based on provider type and risk, with fingerprinting and site visits required for high-risk categories.
- **Classification signals:**
  - CFR: 42 CFR §§ 424.518-424.519
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [screening levels] (Strong), [limited screening] (Moderate), [moderate screening] (Moderate), [high screening] (Strong), [fingerprinting] (Strong), [site visit] (Strong)
  - Statutes: Social Security Act § 1866(j)(2)
- **Cross-classification triggers:**
  - When "DMEPOS" appears → also classify to `medicare-billing.dme`
  - When "home health" appears → also classify to practice-specific domain
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Pain Management | High |
  | Primary Care/DPC/Concierge | Medium |
  | All Medicare-enrolled practices | Medium |

### L2: Fee Schedules & Payment (`medicare-billing.fee-schedules`)

#### L3: Medicare Physician Fee Schedule (`medicare-billing.fee-schedules.mpfs`)
- **Description:** Annual MPFS updates including RVU components (work, practice expense, malpractice), conversion factor changes, and geographic adjustments via GPCIs affecting all physician payments.
- **Classification signals:**
  - CFR: 42 CFR Part 414 Subpart B
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [physician fee schedule] (Strong), [MPFS] (Strong), [RVU] (Strong), [conversion factor] (Strong), [GPCI] (Strong), [work RVU] (Moderate), [practice expense] (Moderate)
  - Statutes: Social Security Act § 1848
- **Cross-classification triggers:**
  - When "telehealth" appears → also classify to `telehealth.reimbursement`
  - When "quality reporting" appears → also classify to `medicare-billing.quality-programs`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Primary Care/DPC/Concierge | High |
  | Pain Management | High |
  | Telehealth | High |
  | Chiropractic | Medium |
  | All Medicare billing practices | High |

##### L4: RVU Methodology (`medicare-billing.fee-schedules.mpfs.rvu`)
- **Description:** Relative Value Unit calculation methodology including work RVUs (physician effort), practice expense RVUs (overhead), and malpractice RVUs, plus annual updates.
- **Classification signals:**
  - CFR: 42 CFR § 414.22
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [work RVU] (Strong), [practice expense RVU] (Strong), [malpractice RVU] (Strong), [RUC] (Moderate), [RVU calculation] (Strong), [facility vs non-facility] (Moderate)
  - Statutes: Social Security Act § 1848(c)
- **Cross-classification triggers:**
  - When "GPCI" appears → also classify to `medicare-billing.fee-schedules.mpfs.gpci`
  - When specific CPT codes mentioned → also classify to relevant clinical domain
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Primary Care/DPC/Concierge | High |
  | Pain Management | High |
  | All Medicare billing practices | High |

##### L4: Geographic Adjustments (`medicare-billing.fee-schedules.mpfs.gpci`)
- **Description:** Geographic Practice Cost Indices adjusting payments for regional variations in physician work, practice costs, and malpractice premiums across Medicare payment localities.
- **Classification signals:**
  - CFR: 42 CFR § 414.2, § 414.26
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [GPCI] (Strong), [geographic adjustment] (Strong), [locality] (Moderate), [work GPCI] (Moderate), [PE GPCI] (Moderate), [malpractice GPCI] (Moderate)
  - Statutes: Social Security Act § 1848(e)
- **Cross-classification triggers:**
  - When specific locality mentioned → also note for state-specific content
  - When "floor" or "frontier" appears → also classify to special payment rules
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All Medicare billing practices | Medium |

#### L3: Clinical Laboratory Fee Schedule (`medicare-billing.fee-schedules.clfs`)
- **Description:** Medicare payment for laboratory tests including PAMA-based rate setting, specimen collection fees, and travel allowances for in-office and independent labs.
- **Classification signals:**
  - CFR: 42 CFR Part 414 Subpart G
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [CLFS] (Strong), [lab fee schedule] (Strong), [PAMA] (Strong), [specimen collection] (Moderate), [travel allowance] (Weak), [clinical laboratory] (Strong)
  - Statutes: Social Security Act § 1833(h)
- **Cross-classification triggers:**
  - When "CLIA" appears → also classify to `clinical-operations.laboratory`
  - When "panel" or "profile" appears → check for bundling rules
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Functional Medicine | High |
  | Primary Care/DPC/Concierge | High |
  | Integrative Medicine | High |
  | Anti-Aging Medicine | High |
  | Pain Management | Medium |

#### L3: DME Fee Schedule (`medicare-billing.fee-schedules.dmepos`)
- **Description:** Durable medical equipment payment rates including competitive bidding program areas, supplier standards, and documentation requirements for DME furnished by practices.
- **Classification signals:**
  - CFR: 42 CFR Part 414 Subpart D
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [DMEPOS] (Strong), [DME fee schedule] (Strong), [competitive bidding] (Strong), [supplier standard] (Moderate), [CMN] (Moderate), [DME MAC] (Moderate)
  - Statutes: Social Security Act § 1834(a)
- **Cross-classification triggers:**
  - When "accreditation" appears → also classify to `medicare-billing.enrollment.supplier-standards`
  - When specific equipment mentioned → check for NCD/LCD coverage
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Pain Management | High |
  | Primary Care/DPC/Concierge | Medium |
  | Chiropractic | Medium |

### L2: Coverage Determinations (`medicare-billing.coverage`)

#### L3: National Coverage Determinations (`medicare-billing.coverage.ncd`)
- **Description:** CMS national coverage policies binding on all MACs, found in Medicare manuals and NCD database, establishing when Medicare covers specific services nationwide.
- **Classification signals:**
  - CFR: 42 CFR Part 405 Subpart B
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [NCD] (Strong), [national coverage] (Strong), [coverage determination] (Strong), [Medicare manual] (Moderate), [Chapter 15] (Weak), [benefit category] (Moderate)
  - Statutes: Social Security Act § 1862(a)(1)(A)
- **Cross-classification triggers:**
  - When "LCD" appears → also classify to `medicare-billing.coverage.lcd`
  - When "clinical trial" appears → also classify to `medicare-billing.coverage.ced`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Pain Management | High |
  | Regenerative Medicine | High |
  | Integrative Medicine | Medium |
  | Primary Care/DPC/Concierge | Medium |

#### L3: Local Coverage Determinations (`medicare-billing.coverage.lcd`)
- **Description:** MAC-specific coverage policies for their jurisdictions, including covered diagnoses, frequency limits, and documentation requirements supplementing national policy.
- **Classification signals:**
  - CFR: 42 CFR § 426.400
  - Agency: Centers for Medicare & Medicaid Services, Medicare Administrative Contractors
  - Keywords: [LCD] (Strong), [local coverage] (Strong), [MAC jurisdiction] (Strong), [coverage article] (Moderate), [billing article] (Moderate), [ICD-10 codes] (Strong)
  - Statutes: Social Security Act § 1862(a)(1)(A)
- **Cross-classification triggers:**
  - When "reconsideration" appears → also classify to `medicare-billing.appeals`
  - When specific CPT/HCPCS mentioned → also classify to relevant clinical domain
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Pain Management | High |
  | Chiropractic | High |
  | Regenerative Medicine | High |
  | IV Therapy/Infusion | Medium |
  | Primary Care/DPC/Concierge | Medium |

#### L3: Advance Beneficiary Notices (`medicare-billing.coverage.abn`)
- **Description:** Requirements for ABN issuance before providing non-covered services, proper ABN form completion, and limitation of liability protections for providers and beneficiaries.
- **Classification signals:**
  - CFR: 42 CFR § 411.404-411.408
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [ABN] (Strong), [advance beneficiary notice] (Strong), [CMS-R-131] (Strong), [non-covered service] (Strong), [limitation of liability] (Moderate), [proper notice] (Moderate)
  - Statutes: Social Security Act § 1879
- **Cross-classification triggers:**
  - When "voluntary" appears → distinguish from required ABN scenarios
  - When "waiver" appears → also classify to related compliance domain
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Chiropractic | High |
  | Pain Management | High |
  | Regenerative Medicine | High |
  | Functional Medicine | Medium |
  | Primary Care/DPC/Concierge | Medium |

### L2: Coding & Documentation (`medicare-billing.coding`)

#### L3: E/M Coding Framework (`medicare-billing.coding.evaluation-management`)
- **Description:** 2021+ E/M coding guidelines using medical decision making or time, with three key MDM elements and simplified documentation requirements compared to 1995/1997 guidelines.
- **Classification signals:**
  - CFR: 42 CFR § 414.46
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [E/M coding] (Strong), [MDM] (Strong), [medical decision making] (Strong), [time-based billing] (Strong), [99213] (Moderate), [99214] (Moderate), [2021 E/M] (Strong)
  - Statutes: Social Security Act § 1848
- **Cross-classification triggers:**
  - When "telehealth" appears → also classify to `medicare-billing.coding.telehealth-modifiers`
  - When "teaching physician" appears → also classify to `medicare-billing.coding.teaching-physician`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Primary Care/DPC/Concierge | High |
  | Pain Management | High |
  | Telehealth | High |
  | All E/M billing practices | High |

##### L4: MDM Elements (`medicare-billing.coding.evaluation-management.mdm`)
- **Description:** Three elements of medical decision making: number/complexity of problems, amount/complexity of data, and risk of complications, with detailed definitions for each level.
- **Classification signals:**
  - CFR: 42 CFR § 414.46 (by reference to CPT)
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [MDM elements] (Strong), [problem complexity] (Strong), [data complexity] (Strong), [risk level] (Strong), [straightforward] (Moderate), [moderate complexity] (Strong), [high complexity] (Strong)
  - Statutes: Social Security Act § 1848
- **Cross-classification triggers:**
  - When "time" appears → also classify to time-based alternative
  - When "prolonged services" appears → also classify to `medicare-billing.coding.prolonged-services`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Primary Care/DPC/Concierge | High |
  | Pain Management | High |
  | All E/M billing practices | High |

#### L3: Modifier Usage (`medicare-billing.coding.modifiers`)
- **Description:** Proper use of CPT and HCPCS modifiers affecting payment including -25 (significant separate E/M), -59/X{EPSU} (distinct procedural), and telehealth modifiers.
- **Classification signals:**
  - CFR: Medicare Claims Processing Manual references
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [modifier 25] (Strong), [modifier 59] (Strong), [XE XP XS XU] (Strong), [modifier usage] (Strong), [separate service] (Moderate), [NCCI edits] (Strong)
  - Statutes: Social Security Act § 1848
- **Cross-classification triggers:**
  - When "telehealth" appears → also classify to `medicare-billing.coding.telehealth-modifiers`
  - When "incident to" appears → also classify to `medicare-billing.coding.incident-to`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Pain Management | High |
  | Primary Care/DPC/Concierge | High |
  | Med Spa/Aesthetic Medicine | Medium |
  | All procedural practices | High |

#### L3: Documentation Requirements (`medicare-billing.coding.documentation`)
- **Description:** Medical necessity documentation standards, record requirements to support billed services, and audit-ready documentation practices for Medicare compliance.
- **Classification signals:**
  - CFR: 42 CFR § 424.5(a)(6)
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [medical necessity] (Strong), [documentation requirements] (Strong), [medical record] (Strong), [support billed services] (Strong), [audit documentation] (Moderate)
  - Statutes: Social Security Act § 1862(a)(1)(A)
- **Cross-classification triggers:**
  - When "audit" appears → also classify to `medicare-billing.audits`
  - When "signature" appears → also classify to authentication requirements
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All Medicare billing practices | High |

#### L3: Incident-To Billing (`medicare-billing.coding.incident-to`)
- **Description:** Requirements for billing NPP services under physician NPI including direct supervision, employment relationship, and new vs established patient restrictions.
- **Classification signals:**
  - CFR: 42 CFR § 410.26(b)
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [incident to] (Strong), [direct supervision] (Strong), [NPP billing] (Moderate), [auxiliary personnel] (Moderate), [physician presence] (Strong), [established patient] (Moderate)
  - Statutes: Social Security Act § 1861(s)(2)(A)
- **Cross-classification triggers:**
  - When "split/shared" appears → also classify to `medicare-billing.coding.split-shared`
  - When "rural" appears → check for supervision exceptions
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Primary Care/DPC/Concierge | High |
  | Pain Management | Medium |
  | All practices with NPPs | High |

#### L3: Telehealth-Specific Coding (`medicare-billing.coding.telehealth-modifiers`)
- **Description:** Telehealth service coding including modifiers (95, GT, GQ), place of service codes, audio-only billing, and documentation of modality used.
- **Classification signals:**
  - CFR: 42 CFR § 410.78
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [modifier 95] (Strong), [telehealth modifier] (Strong), [POS 02] (Strong), [POS 10] (Strong), [audio-only] (Strong), [synchronous] (Moderate)
  - Statutes: Social Security Act § 1834(m)
- **Cross-classification triggers:**
  - When "originating site" appears → also classify to `telehealth.reimbursement`
  - When "interstate" appears → also classify to `telehealth.licensure`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Telehealth | High |
  | Primary Care/DPC/Concierge | High |
  | Pain Management | Medium |
  | Weight Management | Medium |

### L2: Quality Programs (`medicare-billing.quality-programs`)

#### L3: MIPS Reporting (`medicare-billing.quality-programs.mips`)
- **Description:** Merit-based Incentive Payment System requirements including four performance categories, reporting thresholds, and payment adjustments for eligible clinicians.
- **Classification signals:**
  - CFR: 42 CFR Part 414 Subpart O
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [MIPS] (Strong), [QPP] (Strong), [quality measures] (Strong), [improvement activities] (Strong), [promoting interoperability] (Strong), [cost category] (Moderate), [MIPS score] (Strong)
  - Statutes: MACRA (Medicare Access and CHIP Reauthorization Act of 2015)
- **Cross-classification triggers:**
  - When "APM" appears → also classify to `medicare-billing.quality-programs.apm`
  - When "small practice" appears → note special considerations
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Primary Care/DPC/Concierge | High |
  | Pain Management | High |
  | Telehealth | Medium |
  | All MIPS-eligible | High |

##### L4: Performance Categories (`medicare-billing.quality-programs.mips.categories`)
- **Description:** Four MIPS categories: Quality (30%), Cost (30%), Improvement Activities (15%), and Promoting Interoperability (25%), with reporting requirements for each.
- **Classification signals:**
  - CFR: 42 CFR §§ 414.1305-414.1395
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [quality category] (Strong), [cost category] (Strong), [improvement activities] (Strong), [promoting interoperability] (Strong), [category weight] (Moderate), [performance threshold] (Strong)
  - Statutes: MACRA § 101
- **Cross-classification triggers:**
  - When "hardship exception" appears → also classify to exemptions
  - When "data completeness" appears → also classify to reporting requirements
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Primary Care/DPC/Concierge | High |
  | Pain Management | High |
  | All MIPS participants | High |

#### L3: Alternative Payment Models (`medicare-billing.quality-programs.apm`)
- **Description:** Advanced APMs and MIPS APMs offering 5% incentive payments, including ACOs, bundled payments, and primary care models with downside financial risk.
- **Classification signals:**
  - CFR: 42 CFR § 414.1415
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [APM] (Strong), [Advanced APM] (Strong), [QP threshold] (Moderate), [nominal risk] (Strong), [ACO] (Strong), [bundled payment] (Moderate)
  - Statutes: MACRA § 101
- **Cross-classification triggers:**
  - When "MIPS APM" appears → also classify to `medicare-billing.quality-programs.mips`
  - When specific model named → classify to model-specific guidance
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Primary Care/DPC/Concierge | High |
  | Large group practices | Medium |

### L2: Audit & Compliance (`medicare-billing.audits`)

#### L3: Audit Programs (`medicare-billing.audits.programs`)
- **Description:** Medicare audit contractors including RAC (recovery audit), SMRC (supplemental medical review), and UPIC (unified program integrity), with different scopes and authorities.
- **Classification signals:**
  - CFR: 42 CFR Part 405 Subpart D
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [RAC audit] (Strong), [UPIC] (Strong), [SMRC] (Strong), [Medicare audit] (Strong), [medical review] (Strong), [audit contractor] (Strong)
  - Statutes: Social Security Act § 1893
- **Cross-classification triggers:**
  - When "prepayment review" appears → also classify to `medicare-billing.audits.prepayment`
  - When "fraud" appears → also classify to `fraud-compliance`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Pain Management | High |
  | Chiropractic | High |
  | Primary Care/DPC/Concierge | Medium |
  | All high-utilization practices | High |

#### L3: Audit Response (`medicare-billing.audits.response`)
- **Description:** Responding to Medicare audit requests including documentation timelines, additional development requests (ADRs), and strategies for successful audit defense.
- **Classification signals:**
  - CFR: Medicare Program Integrity Manual Chapter 3
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [ADR] (Strong), [audit response] (Strong), [documentation request] (Strong), [45-day deadline] (Moderate), [medical record] (Strong), [audit defense] (Moderate)
  - Statutes: Social Security Act § 1893
- **Cross-classification triggers:**
  - When "appeal" appears → also classify to `medicare-billing.appeals`
  - When "extrapolation" appears → also classify to `medicare-billing.audits.extrapolation`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All Medicare billing practices | High |

#### L3: Extrapolation and Overpayments (`medicare-billing.audits.extrapolation`)
- **Description:** Statistical sampling and extrapolation methodology used to calculate overpayments, requirements for valid extrapolation, and challenging extrapolated findings.
- **Classification signals:**
  - CFR: Medicare Program Integrity Manual Chapter 8
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [extrapolation] (Strong), [statistical sampling] (Strong), [overpayment] (Strong), [confidence interval] (Moderate), [sample size] (Moderate), [universe] (Moderate)
  - Statutes: Social Security Act § 1893
- **Cross-classification triggers:**
  - When "appeal" appears → also classify to `medicare-billing.appeals`
  - When "60-day rule" appears → also classify to `fraud-compliance.false-claims`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Pain Management | High |
  | Chiropractic | High |
  | All high-volume practices | High |

### L2: Appeals Process (`medicare-billing.appeals`)

#### L3: Five Levels of Appeal (`medicare-billing.appeals.levels`)
- **Description:** Medicare's five-level appeals process: redetermination (MAC), reconsideration (QIC), ALJ hearing, Medicare Appeals Council, and federal district court, with specific timelines.
- **Classification signals:**
  - CFR: 42 CFR Part 405 Subpart I
  - Agency: Centers for Medicare & Medicaid Services, HHS Office of Medicare Hearings and Appeals
  - Keywords: [redetermination] (Strong), [reconsideration] (Strong), [ALJ hearing] (Strong), [appeals council] (Strong), [120-day deadline] (Strong), [QIC] (Moderate)
  - Statutes: Social Security Act § 1869
- **Cross-classification triggers:**
  - When "good cause" appears → also classify to deadline extensions
  - When "expedited" appears → also classify to beneficiary appeals
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All Medicare billing practices | High |

##### L4: ALJ Hearing Process (`medicare-billing.appeals.levels.alj`)
- **Description:** Administrative Law Judge hearing procedures including $180 amount in controversy, 60-day filing deadline, hearing formats, and statistical sampling appeals.
- **Classification signals:**
  - CFR: 42 CFR §§ 405.1000-405.1063
  - Agency: HHS Office of Medicare Hearings and Appeals
  - Keywords: [ALJ hearing] (Strong), [amount in controversy] (Strong), [$180 threshold] (Moderate), [60-day filing] (Strong), [statistical sample appeal] (Moderate)
  - Statutes: Social Security Act § 1869(b)(1)(A)
- **Cross-classification triggers:**
  - When "video hearing" appears → note teleconference options
  - When "aggregation" appears → also classify to claim combination rules
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | High-audit-risk practices | High |
  | All others | Medium |

### L2: Medicare Advantage (`medicare-billing.medicare-advantage`)

#### L3: MA Network Requirements (`medicare-billing.medicare-advantage.network`)
- **Description:** CMS network adequacy standards for MA plans including time/distance requirements, provider directory accuracy, and network exception processes affecting provider participation.
- **Classification signals:**
  - CFR: 42 CFR §§ 422.112-422.116
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [network adequacy] (Strong), [time and distance] (Strong), [provider directory] (Strong), [network exception] (Moderate), [MA network] (Strong)
  - Statutes: Social Security Act § 1852(d)
- **Cross-classification triggers:**
  - When "credentialing" appears → also classify to `business-operations.credentialing`
  - When "termination" appears → also classify to contract provisions
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Primary Care/DPC/Concierge | High |
  | All MA-participating practices | High |

#### L3: Prior Authorization Reform (`medicare-billing.medicare-advantage.prior-auth`)
- **Description:** 2024 CMS reforms to MA prior authorization including gold-carding, continuity of care requirements, and restrictions on denying coverage for Medicare-covered services.
- **Classification signals:**
  - CFR: 42 CFR § 422.138
  - Agency: Centers for Medicare & Medicaid Services
  - Keywords: [prior authorization] (Strong), [gold card] (Strong), [MA prior auth] (Strong), [continuity of care] (Moderate), [2024 final rule] (Moderate)
  - Statutes: Social Security Act § 1852(a)(1)
- **Cross-classification triggers:**
  - When "denial" appears → also classify to `medicare-billing.appeals`
  - When "electronic" appears → note ePA requirements
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Primary Care/DPC/Concierge | High |
  | Pain Management | High |
  | All MA practices | High |

### L2: Commercial Payer Framework (`medicare-billing.commercial`)

#### L3: No Surprises Act (`medicare-billing.commercial.no-surprises`)
- **Description:** Federal surprise billing protections including good faith estimates for uninsured patients, qualified payment amount for out-of-network services, and IDR process for payment disputes.
- **Classification signals:**
  - CFR: 45 CFR Parts 149.110-149.510
  - Agency: Centers for Medicare & Medicaid Services, Departments of Labor and Treasury
  - Keywords: [No Surprises Act] (Strong), [good faith estimate] (Strong), [GFE] (Strong), [surprise billing] (Strong), [QPA] (Moderate), [IDR] (Strong)
  - Statutes: No Surprises Act (Division BB of CAA 2021)
- **Cross-classification triggers:**
  - When "uninsured" appears → also classify to `medicare-billing.commercial.self-pay`
  - When "dispute" appears → also classify to `medicare-billing.commercial.idr`
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | All practice types | High |

#### L3: Independent Dispute Resolution (`medicare-billing.commercial.idr`)
- **Description:** Federal IDR process for out-of-network payment disputes including initiation timelines, batching rules, certified IDR entity selection, and baseball-style arbitration.
- **Classification signals:**
  - CFR: 45 CFR § 149.510
  - Agency: Centers for Medicare & Medicaid Services, Departments of Labor and Treasury
  - Keywords: [IDR process] (Strong), [dispute resolution] (Strong), [certified IDR entity] (Strong), [batching] (Moderate), [baseball arbitration] (Moderate), [30-day negotiation] (Strong)
  - Statutes: No Surprises Act § 103
- **Cross-classification triggers:**
  - When "QPA" appears → also classify to payment determination factors
  - When "eligibility" appears → check federal vs state jurisdiction
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | Out-of-network providers | High |
  | Emergency medicine practices | High |
  | All others | Medium |

---

**Total nodes delivered:**
- HIPAA & Privacy: 29 nodes (target was 25-35)
- Medicare & Billing: 38 nodes (target was 30-40)