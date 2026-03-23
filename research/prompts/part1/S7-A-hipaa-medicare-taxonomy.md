# Cedar Classification Framework — Part 1, Session 7-A of 8
# Remaining Taxonomy: HIPAA & Privacy + Medicare & Billing Branches (L3 through L4)

## About This Session

**Context from prior research sessions has been pre-injected above this prompt by the orchestrator.**
The injected context contains the **Session 4 output** — the L1/L2 domain codes for all domains,
including HIPAA & Privacy and Medicare & Billing.

Read the injected context directly to get the L1/L2 codes for these branches.

This is a **sub-session** (7-A of 8). The original Session 7 covered six branches plus a cross-classification
master table — too much for a single session. Session 7-A covers two branches:
- **HIPAA & Privacy** (target: 25-35 nodes)
- **Medicare & Billing** (target: 30-40 nodes)

These two branches have minimal cross-classification with the S5/S6 content at L3 and below (though they
will appear in the master cross-classification table in Session 7-C). **You do not need Sessions 5-A,
5-B, 6-A, or 6-B to complete this session.**

---

## Cedar Platform Context

Cedar is an AI-powered regulatory monitoring platform for independent medical practices.

**Target practice types** (14 total):
Functional Medicine, Hormone Optimization/HRT, Compounding Pharmacy, Med Spa/Aesthetic Medicine,
Weight Management, Peptide Therapy, IV Therapy/Infusion, Regenerative Medicine, Telehealth,
Chiropractic, Integrative Medicine, Anti-Aging Medicine, Pain Management, Primary Care (DPC/Concierge).

**Platform purpose:** Monitors regulatory sources, classifies changes through an AI pipeline, delivers
plain-language alerts. HIPAA and Medicare/billing regulations generate a continuous stream of regulatory
activity — OCR guidance, CMS final rules, MAC LCD updates, audit program announcements — that Cedar
practices need to track.

---

## Metadata Requirements

For **every node at every level (L3, L4)**, provide all of the following:

1. **Domain name** — practitioner-facing label
2. **Domain code** — dot-notation extending the L2 code from Session 4
3. **Description** — 1-2 sentences on what regulatory content belongs here and why it matters
4. **Classification signals**:
   - **CFR part/section ranges** — as specific as possible
   - **Agency/sub-agency names** — exact Federal Register names (e.g., "Office for Civil Rights", "Centers for Medicare & Medicaid Services")
   - **Keyword phrases** — 5-10 per node, marked Strong / Moderate / Weak, with disambiguation notes
   - **Statutory references** — HIPAA (42 U.S.C. § 1320d et seq.), HITECH (42 U.S.C. § 17931), Social Security Act sections, etc.
5. **Cross-classification triggers** — specific, implementable rules
6. **Practice-type relevance** — compact table (High / Medium / Low; omit None rows):

| Practice Type | Relevance |
|---|---|
| [practice] | [weight] |

---

## Deliverable 1: HIPAA & Privacy Branch (L3 through L4)

Target: **25–35 nodes** across L3 and L4. These branches are shallower than the Session 5-6 branches
(most will land at L3 with selected L4 nodes for areas of high regulatory density).

### Required coverage areas:

**Privacy Rule**
- Uses and disclosures of PHI: permitted uses (required by law, public interest), required uses, authorized uses — the three-tier framework
- Treatment, payment, and healthcare operations (TPO): the core permitted uses, what each covers, minimum necessary exception for TPO
- Patient rights: right of access (45 CFR § 164.524), amendment (§ 164.526), accounting of disclosures (§ 164.528), restriction requests (§ 164.522), alternative communication (§ 164.522(b))
- Notice of Privacy Practices (NPP): required elements, distribution requirements, website posting, updates
- Minimum necessary standard: application to uses/disclosures, reasonable reliance standard, exceptions (treatment, individual, legally required)
- Personal representatives: who qualifies, when covered entity must treat as individual, mental health exception
- De-identification: Safe Harbor method (18 identifiers), Expert Determination method, re-identification risk
- Marketing and fundraising restrictions: what requires authorization vs. what is permitted healthcare operations
- Research uses of PHI: waiver of authorization requirements, limited data set with DUA, decedent research exception

**Security Rule**
- Administrative safeguards: security management process (risk analysis + risk management), assigned security responsibility, workforce security, access management, security awareness training, security incident procedures, contingency planning, evaluation, BAA provisions
- Physical safeguards: facility access controls, workstation use and security, device and media controls
- Technical safeguards: access control (unique user IDs, emergency access, automatic logoff, encryption/decryption), audit controls, integrity controls, transmission security
- Organizational requirements: BAAs, group health plan requirements, hybrid entities
- Risk analysis and risk management: the foundational Security Rule obligation — what constitutes an adequate risk analysis, documentation requirements, ongoing risk management

**Breach Notification**
- Definition of breach: unsecured PHI, impermissible use/disclosure, risk assessment to rebut presumption, low probability standard
- Individual notification: timing (60-day from discovery), required content, written notice, substitute notice
- HHS notification: small breaches (annual log, submit by March 1), large breaches (500+ — submit within 60 days), Wall of Shame
- Media notification: state or jurisdiction breaches affecting 500+ — prominent media outlet notice
- Business associate breach obligations: BA to CE notification (60 days from discovery), delay for law enforcement
- State breach notification laws: all 50 states have laws, interaction with federal HIPAA requirements, stricter standards

**Business Associates**
- Business Associate Agreement required elements: 45 CFR § 164.308(b), permitted uses, required safeguards, subcontractor provisions, HIPAA obligations, breach reporting, return/destruction
- Subcontractor requirements: downstream BAAs, BA-to-BA agreements, direct liability
- Business associate direct liability under HITECH: which HIPAA requirements apply directly to BAs
- Cloud computing and BAAs: when cloud providers are BAs, CSP-specific BAA considerations, encryption key management
- Common BA categories for practices: EHR vendors, billing companies, transcription services, IT support, cloud storage — high-frequency in practice settings

**Enforcement & Penalties**
- OCR enforcement process: complaint filing, investigation phases, informal resolution vs. formal hearing
- Penalty tiers: four tiers based on culpability (did not know; reasonable cause; willful neglect corrected; willful neglect not corrected) — dollar amounts per violation, annual caps
- Corrective Action Plans (CAPs): what they require, monitoring obligations, CAP as resolution agreement alternative
- State attorney general enforcement: HITECH grant of authority, concurrent enforcement with OCR
- OIG and CMS coordination: when enforcement overlaps

**42 CFR Part 2 — Substance Use Disorder Records**
- Patient consent requirements: more restrictive than HIPAA — specific consent required for each disclosure, purpose limitation
- Re-disclosure prohibition: recipients cannot re-disclose without new consent
- 2024 Final Rule: significant alignment with HIPAA (care coordination exception, single consent option), effective date, transition period
- Application to MAT/MOUD practices: practices prescribing buprenorphine, operating OTPs — higher compliance burden

**Information Blocking (21st Century Cures Act)**
- ONC information blocking rules: 45 CFR Part 171, what constitutes information blocking, who is subject (actors: HIT developers, networks/HIEs, healthcare providers)
- Eight exceptions to information blocking: preventing harm, privacy, security, infeasibility, health IT performance, content and manner, fees, licensing
- Application to healthcare providers: smaller practices' obligations, EHR access and export requirements
- Electronic Health Information (EHI) definition: all EHI, not just records subject to HIPAA right of access
- Penalties for information blocking: up to $1 million per violation for developers/networks; disincentives for providers
- Interoperability requirements: USCDI standards, FHIR API requirements

**State Privacy Laws**
- Framework for state-specific privacy requirements: the "more protective than HIPAA" standard, preemption analysis
- States with more protective laws: California (CMIA), New York, Texas, Florida (limited HIPAA equivalent) — note as state-expansion scaffolding
- State consumer privacy laws: CCPA/CPRA application to healthcare data, "consumer health data" vs. HIPAA-covered data, state AG enforcement
- State genetic information privacy laws: GINA vs. state genetic laws, direct-to-consumer genetic testing
- State biometric information privacy: BIPA (Illinois), Texas, Washington — relevant to facial recognition, fingerprint-based authentication in practices

---

## Deliverable 2: Medicare & Billing Branch (L3 through L4)

Target: **30–40 nodes** across L3 and L4.

### Required coverage areas:

**Provider Enrollment**
- Medicare enrollment applications: CMS-855I (individual), CMS-855B (group), CMS-855O (ordering/referring), CMS-855A (institutional), CMS-855S (DMEPOS suppliers)
- PECOS (Provider Enrollment, Chain, and Ownership System): online enrollment, updating information, practice location changes
- Revalidation requirements: cycles (5 years for most, 3 years for high-risk), revalidation triggers, consequences of non-response
- Medicare enrollment for mid-level providers: NP, PA, CRNA enrollment requirements, reassignment of benefits
- Opt-out and private contracting: opt-out affidavit process, private contract requirements, impact on billing (relevant to DPC/concierge practices)
- Provider screening levels: limited (low-risk), moderate (additional screening), high (fingerprinting, site visits) — which specialties at which level
- Change of information reporting: what changes require CMS notification, reporting timeframes

**Fee Schedules & Payment**
- Medicare Physician Fee Schedule (MPFS): annual rule, RVU methodology (work, PE, malpractice), conversion factor, annual update
- Outpatient Prospective Payment System (OPPS): APC groups, hospital outpatient department billing, status indicators
- Ambulatory Surgical Center (ASC) payment system: ASC-covered procedures, payment rates, addendum AA/BB
- Clinical Laboratory Fee Schedule (CLFS): applicable for in-office labs, specimen collection, PAMA reform
- Durable Medical Equipment (DME) fee schedule: DMEPOS competitive bidding, bid amounts, supplier requirements
- Geographic Practice Cost Indices (GPCIs): locality adjustments to MPFS, how to apply GPCIs

**Coverage Determinations**
- National Coverage Determinations (NCDs): CMS national coverage decisions, how to find and interpret, effective dates
- Local Coverage Determinations (LCDs): MAC-specific coverage rules, geographic applicability, how practices look up applicable LCD
- Local Coverage Articles (LCAs): billing and coding articles, ICD-10 codes required, frequency limitations
- Coverage with Evidence Development (CED): CMS coverage for promising technologies with ongoing clinical evidence
- Medicare Benefit Policy Manual: key chapters affecting practices (Chapter 15 for covered services, Chapter 12 for physicians/NPPs)
- Experimental/investigational exclusion: Section 1862(a)(1)(A) exclusion, how CMS defines not reasonable and necessary

**Coding & Documentation**
- E/M coding (2021+ framework): AMA/CMS convergence, MDM-based and time-based selection, 3 levels of MDM (straightforward, low, moderate, high), required documentation elements
- Modifier usage: key modifiers (25 = significant separate E/M, 59/XE/XP/XS/XU = distinct procedural service, 95 = synchronous telehealth, GT = via interactive audio and video, FQ = audio-only)
- Prolonged services coding: CPT 99417 and CMS G-codes, after the total time threshold
- Documentation requirements for medical necessity: what must be in the record, "reasonable and necessary" standard
- ABN (Advance Beneficiary Notice of Noncoverage): required before providing non-covered services, CMS-R-131 form, limitation of liability
- Split/shared visit rules: 2024+ changes, substantive portion (>50% of time), billing under supervising physician vs. NPP
- Incident-to billing requirements: direct supervision requirement, new patient restrictions, incident-to under group practice
- Teaching physician rules: physical presence requirement for E/M, GPAM attestation option, primary care exception

**Audit & Recovery Programs**
- Recovery Audit Contractor (RAC) program: automated vs. complex reviews, look-back period, claim limits per audit cycle
- Unified Program Integrity Contractor (UPIC): replaced ZPIC, comprehensive fraud/waste/abuse investigation, referral to law enforcement
- Supplemental Medical Review Contractor (SMRC): CMS-requested medical reviews, nationwide scope
- Targeted Probe and Educate (TPE): MAC-administered, 3-probe reviews before escalation, documentation education focus
- Medicare audit appeals process: 5 levels (redetermination → qualified independent contractor → ALJ → MAC → federal court), timelines, success rates
- Extrapolation methodology: when CMS can extrapolate overpayments, sample size requirements, how to challenge
- Prepayment review: when MAC places provider on prepayment review, requesting relief

**Medicare Advantage**
- MA plan network requirements: CMS network adequacy standards, time/distance requirements, provider directory
- Prior authorization in MA: CMS rules on PA requirements, gold-carding, continuity of care requirements, recent CMS reforms
- Dual-eligible programs: Medicare-Medicaid coordination, D-SNPs, FIDE-SNPs, Low Income Subsidy
- Risk adjustment and documentation: HCC coding, diagnosis documentation requirements, retrospective review

**Medicaid**
- Provider enrollment for Medicaid: state-specific processes, NPI requirements, CMS Medicaid enrollment rules
- State Medicaid plan requirements relevant to practices: service coverage, reimbursement rates, prior authorization
- Medicaid managed care: MCO/MLTSS requirements, encounter data reporting, quality withhold
- Medicaid billing distinctions: crossover claims, Medicare/Medicaid coordination, Medicaid as payer of last resort

**Commercial Payer Rules (Framework)**
- No Surprises Act and Good Faith Estimates: surprise billing protections, GFE requirements for uninsured/self-pay, IDR process
- Independent Dispute Resolution (IDR) process: initiating IDR, certified IDR entities, batching rules, baseball arbitration methodology
- Credentialing requirements: CAQH ProView, primary source verification, credentialing timelines, panel closures
- Payer contract provisions: termination clauses, fee schedule disputes, prompt pay requirements, balanced billing restrictions

---

## Output Format

```
## L1: [Domain Name] (`domain-code`)

### L2: [Subdomain Name] (`domain-code.subdomain`)

#### L3: [Area Name] (`domain-code.subdomain.area`)
- **Description:** ...
- **Classification signals:**
  - CFR: ...
  - Agency: ...
  - Keywords: [term] (Strong), [term] (Moderate), [term] (Weak) — [disambiguation note]
  - Statutes: ...
- **Cross-classification triggers:** ...
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | ... | ... |

##### L4: [Specific Topic] (`domain-code.subdomain.area.topic`)
[same fields]
```

Include L1/L2 as structural headers. Focus detailed metadata on L3+.

---

## Reference Material

- **45 CFR Parts 160-164:** HIPAA regulations
- **42 CFR Part 2:** Substance use disorder records
- **45 CFR Part 171:** Information blocking
- **42 CFR Chapter IV (CMS):** Parts 400-499 (Medicare)
- **HIPAA:** 42 U.S.C. § 1320d et seq.
- **HITECH Act:** 42 U.S.C. § 17931 et seq.
- **Social Security Act §§ 1832, 1834, 1842, 1848, 1862:** Medicare coverage and payment
- **No Surprises Act:** Division BB of Consolidated Appropriations Act 2021
- **eCFR:** https://www.ecfr.gov/
- **CMS:** https://www.cms.gov/
- **OCR:** https://www.hhs.gov/hipaa/
