# Cedar Classification Framework — Part 1, Session 7-B of 8
# Remaining Taxonomy: Fraud/Compliance + Operations + Workplace Safety + Employment/Tax Branches (L3–L4)

## About This Session

**Context from prior research sessions has been pre-injected above this prompt by the orchestrator.**
The injected context contains the **Session 4 output** — the L1/L2 domain codes for all domains,
including Fraud/Abuse, Practice Operations, Workplace Safety, and Employment/Tax.

Read the injected context directly to get the L1/L2 codes for these branches.

This is a **sub-session** (7-B of 8). The original Session 7 covered six branches plus a master table —
too much for a single session. Session 7-B covers four branches:
- **Fraud, Abuse & Compliance** (target: 15-20 nodes)
- **Practice Operations & Licensing** (target: 15-25 nodes) — heavily state-regulated; includes state-expansion scaffolding
- **Workplace Safety & Environmental** (target: 8-12 nodes)
- **Employment & Tax** (target: 8-12 nodes)

These four branches have minimal cross-classification with the S5/S6 content at L3 (the master cross-
classification table in Session 7-C will consolidate everything). **You do not need Sessions 5-A, 5-B,
6-A, or 6-B to complete this session.**

---

## Cedar Platform Context

Cedar is an AI-powered regulatory monitoring platform for independent medical practices.

**Target practice types** (14 total):
Functional Medicine, Hormone Optimization/HRT, Compounding Pharmacy, Med Spa/Aesthetic Medicine,
Weight Management, Peptide Therapy, IV Therapy/Infusion, Regenerative Medicine, Telehealth,
Chiropractic, Integrative Medicine, Anti-Aging Medicine, Pain Management, Primary Care (DPC/Concierge).

**Platform purpose:** Monitors regulatory sources, classifies changes through an AI pipeline, delivers
plain-language alerts. Fraud/compliance alerts (OIG exclusions, AKS safe harbor updates) and operational
alerts (state licensing board actions, OSHA updates) are important to Cedar's independent practice audience.

---

## Metadata Requirements

For **every node at every level (L3, L4)**, provide all of the following:

1. **Domain name** — practitioner-facing label
2. **Domain code** — dot-notation extending the L2 code from Session 4
3. **Description** — 1-2 sentences on what regulatory content belongs here and why it matters
4. **Classification signals**:
   - **CFR part/section ranges** — as specific as possible
   - **Agency/sub-agency names** — exact Federal Register names
   - **Keyword phrases** — 5-10 per node, marked Strong / Moderate / Weak, with disambiguation notes
   - **Statutory references** — AKS (42 U.S.C. § 1320a-7b(b)), Stark (42 U.S.C. § 1395nn), FCA (31 U.S.C. §§ 3729-3733), etc.
5. **Cross-classification triggers** — specific, implementable rules
6. **Practice-type relevance** — compact table (High / Medium / Low; omit None rows):

| Practice Type | Relevance |
|---|---|
| [practice] | [weight] |

---

## Deliverable 1: Fraud, Abuse & Compliance Branch (L3 through L4)

Target: **15–20 nodes**.

### Required coverage areas:

**Anti-Kickback Statute (AKS)**
- Prohibited conduct: remuneration intended to induce or reward referrals for federal healthcare program items/services — broad definition, one-purpose rule
- Safe harbors applicable to independent practices: personal services and management contracts, space rental, equipment rental, employee, group purchasing organizations, EHR donations (sunset status), cybersecurity technology donations, warranties, discount safe harbor
- OIG advisory opinions: how to request, binding effect only on requestor, usefulness as guidance for similar arrangements
- Penalties: criminal (felony — up to 10 years), civil (CMPs up to $100K per violation, program exclusion), Civil False Claims Act liability

**Stark Law (Physician Self-Referral)**
- Prohibited referrals: physician referring designated health services (DHS) to entities with which physician has financial relationship — when is it a prohibited referral?
- Designated Health Services (DHS): 11 categories — clinical lab, PT, OT, speech-language, radiology/imaging, radiation therapy, DME/prosthetics, parenteral/enteral nutrients, home health, outpatient prescription drugs, inpatient/outpatient hospital services
- Exceptions applicable to practices: in-office ancillary services (IOAS) exception (key for physician-dispensed drugs, labs), personal services, fair market value, group practice definition, recruitment
- Self-disclosure protocol: Stark Law Self-Disclosure Protocol, voluntary disclosure vs. government identification, settlement range
- 2021 Final Rules: value-based care exceptions, direct supervision changes, fair market value definition updates, group practice requirements

**False Claims Act**
- Qui tam / whistleblower provisions: relator rights, government election to intervene, relator share (15-30%), first-to-file rule
- Implied certification theory: certification of compliance as condition of payment, materiality standard post-*Escobar*
- Knowledge standard: actual knowledge, deliberate ignorance, reckless disregard — what counts as "knowingly"
- Damages and penalties: treble damages, per-claim penalty ($13,000-$27,000 adjusted), the "original source" rule for qui tam relators

**OIG Exclusions**
- Mandatory exclusion bases: conviction for healthcare fraud, patient abuse, controlled substance felony, other specified crimes — OIG has no discretion
- Permissive exclusion bases: misdemeanor healthcare fraud, obstruction, excessive claims, unnecessary services, license revocation — OIG has discretion
- Screening requirements: LEIE and SAM.gov checks required for all providers, contractors, employees (not just physicians) — monthly checks recommended
- Reinstatement process: request after exclusion period, OIG assessment, early reinstatement for permissive exclusions
- Consequences of employing/contracting with excluded individual: CMPs up to $20,000 per item/service, program exclusion

**Compliance Programs**
- OIG compliance program guidance: applicable to individual and small group practices (2000 OIG guidance document)
- Seven elements of an effective compliance program: written standards/policies, compliance officer/committee, training/education, communication lines, enforcement/discipline, auditing/monitoring, response/corrective action
- Compliance officer role: independence requirements, reporting structure, qualifications
- Internal monitoring and auditing: claim auditing requirements, frequency, corrective action process

**State-Level Fraud & Abuse**
- State anti-kickback laws: states with own AKS laws, differences from federal (e.g., Florida's patient brokering statute § 817.505), non-federal program applicability
- State false claims acts: qui tam provisions in state FCAs, Medicaid fraud focus, state AG authority
- Medicaid fraud control units (MFCUs): state units investigating Medicaid fraud, referral process
- State compliance mandates: states requiring compliance programs for licensed facilities or Medicaid providers

---

## Deliverable 2: Practice Operations & Licensing Branch (L3 through L4)

Target: **15–25 nodes**.

**IMPORTANT — State-expansion scaffolding instruction:**
This branch is where state-level regulation is heaviest. Most professional licensing, facility licensing,
scope of practice, and corporate structure rules are state-governed with limited federal content.
Create taxonomy nodes for all areas listed below with full metadata. For nodes that are primarily
state-regulated, add this note in the Description:
> "Primarily state-regulated — federal content limited; state administrative code mapping will be added
> when state sources are ingested."
These nodes serve as scaffolding for Cedar's 50-state expansion. The classification signals should still
include whatever federal signals exist (e.g., CMS CoP references for CLIA, DEA state license prerequisite).

### Required coverage areas:

**Professional Licensing**
- Physician licensing requirements: state medical board authority, licensure by endorsement vs. examination, temporary licenses, IMLC pathway (cross-classification trigger with Telehealth branch)
- NP/PA/CRNA licensing and collaborative practice: FPA (full practice authority) vs. supervised practice states, collaborative practice agreements, scope of practice regulations
- Scope of practice disputes: legislative activity, state attorney general opinions, scope expansions/restrictions
- License renewal and continuing education: state-specific CE requirements, license renewal cycles, CE category requirements
- Board disciplinary actions framework: complaint process, investigation, consent agreements, license revocation/suspension, national practitioner databank (NPDB) reporting

**Facility Licensing**
- State facility licensing requirements: which state agency licenses medical practices, specific requirements by practice type (office-based surgery, pain management, etc.)
- CLIA (Clinical Laboratory Improvement Amendments): certificate types (waiver, PPM, accreditation, compliance), PT requirements, QC standards — cross-classification with Medicare & Billing
- Ambulatory surgery center (ASC) licensing: state survey and certification, Medicare ASC conditions for coverage
- Office-based surgery regulations: state anesthesia standards, permit requirements, incident reporting
- Pharmacy permits for physician dispensing: in-office dispensing permit requirements by state
- Radiation machine registration: state radiation control program registration for X-ray, fluoroscopy, CT, laser (note state-regulated but flag crossover with FDA radiation-emitting device standards)

**Corporate Structure**
- Professional corporations (PCs) and PLLCs: state requirements for physician ownership of medical practices, shareholder restrictions
- Corporate practice of medicine (CPOM) doctrine: what it prohibits, which states have strict CPOM, MSO exception, carve-outs (employment exceptions)
- Management Services Organizations (MSOs): legitimate MSO structure, MSO-physician relationship, fee arrangements that avoid fee-splitting
- Fee splitting prohibitions: state-specific fee splitting laws, application to management fees, referral fees, percentage-based arrangements
- Multi-state corporate compliance: navigating CPOM in multi-state operations, where to incorporate, registered agent requirements

**Accreditation**
- AAAHC (Accreditation Association for Ambulatory Health Care): accreditation standards, Medicare deemed status, survey process
- Joint Commission ambulatory care: ambulatory care accreditation, office-based surgery certification, primary care medical home
- State-specific accreditation requirements: states mandating accreditation for specific facility types
- CMS deemed status: how accreditation organizations achieve deemed status from CMS, implications for provider enrollment

---

## Deliverable 3: Workplace Safety & Environmental Branch (L3)

Target: **8–12 nodes**. These branches are shallower — most nodes land at L3.

### OSHA / Workplace Safety

- Bloodborne pathogens standard (29 CFR § 1910.1030): exposure control plan, exposure determination, universal precautions, engineering controls, PPE, hepatitis B vaccination, post-exposure evaluation, training, recordkeeping
- Hazard communication (29 CFR § 1910.1200): SDS (Safety Data Sheets), chemical labeling (GHS), written HazCom program, employee training — especially relevant for compounding pharmacies handling hazardous chemicals
- Ionizing radiation (29 CFR § 1910.1096): practices with X-ray, fluoroscopy, radiation-based devices — exposure limits, dosimetry, posting requirements
- Respiratory protection (29 CFR § 1910.134): when required (including for hazardous drug handling), fit testing, medical evaluation, written program
- OSHA recordkeeping and reporting (29 CFR Part 1904): OSHA 300 log, 300A summary posting, 301 incident reports, severe injury reporting (hospitalization, amputation, eye loss)
- OSHA General Duty Clause (Section 5(a)(1)): recognizing and abating hazards not covered by specific standards — frequently cited in healthcare inspections
- OSHA ergonomics: voluntary ergonomics guidelines for healthcare, MSI prevention, patient handling programs

### Environmental / Medical Waste

- Medical waste disposal: state-regulated medical (infectious) waste programs — note as primarily state-regulated with OSHA/EPA crossover
- Sharps disposal: state laws on sharps containers, mail-back programs, community drop-off — patient-generated sharps
- Pharmaceutical waste (EPA/RCRA): hazardous pharmaceutical wastes (P-list, U-list, characteristic waste), DEA-permitted disposal vs. EPA disposal, Hazardous Waste Pharmaceutical Rule (40 CFR Part 266 Subpart P)
- Hazardous waste generator requirements: generator categories (VSQG, SQG, LQG), manifest requirements, storage limits, training
- Mercury-containing device disposal: OSHA/EPA requirements for mercury spill response, fluorescent lamp disposal, state restrictions on mercury devices
- Radioactive waste: for practices with nuclear medicine capability — NRC licensing requirements, waste disposal options

---

## Deliverable 4: Employment & Tax Branch (L3)

Target: **8–12 nodes**. Shallower branches landing at L3.

### Employment

- FMLA for healthcare workers: leave entitlement, intermittent leave, healthcare provider certifications, employer notice obligations, FMLA paperwork requirements
- ADA accommodation in medical practice settings: interactive process, documentation requests, what is undue hardship in a small practice context, telehealth accommodation implications
- Anti-discrimination (Title VII and state equivalents): protected classes, harassment policies, reporting procedures, documentation requirements for termination
- Wage and hour for healthcare-specific roles: FLSA exemptions for healthcare employees, fluctuating workweek method, on-call pay, working time definition for healthcare
- Non-compete agreements: FTC rule status (current court challenge status), state non-compete laws (Florida § 542.335), healthcare-specific enforceability, physician-specific restrictions
- Worker classification (1099 vs W-2): IRS common law test, state ABC tests, locum tenens arrangements, medical directors, independent contractor physicians — high-risk area for practices

### Healthcare Tax

- Section 125 cafeteria plans and FSAs: plan document requirements, nondiscrimination testing, eligible benefits, healthcare FSA limits
- HSA administration: eligibility requirements (HDHP coverage), contribution limits, employer HSA contributions, qualified medical expenses
- ACA employer mandate: Applicable Large Employer (ALE) determination (50+ FTEs), employer shared responsibility payment, Form 1095-C reporting
- Tax-exempt organization compliance: 501(c)(3) requirements for nonprofit practices, community benefit standard, excess benefit transactions (intermediate sanctions)
- QBI deduction for practice owners: Section 199A, specified service trade or business (SSTB) determination for medical practices, wage limitation, cooperative arrangements
- Retirement plan requirements: 401(k) safe harbor, SEP-IRA for small practices, SIMPLE IRA, defined benefit options — healthcare-specific benefit design considerations

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
[same fields, where applicable — not all L3 nodes need L4 children]
```

---

## Reference Material

- **Anti-Kickback Statute:** 42 U.S.C. § 1320a-7b(b); 42 CFR Part 1001 (OIG exclusions)
- **Stark Law:** 42 U.S.C. § 1395nn; 42 CFR Part 411 Subparts E-J
- **False Claims Act:** 31 U.S.C. §§ 3729-3733
- **OIG Exclusions:** 42 CFR Part 1001
- **29 CFR Part 1910:** OSHA general industry standards
- **29 CFR Part 1904:** OSHA recordkeeping
- **40 CFR Part 266 Subpart P:** Hazardous Waste Pharmaceuticals Rule
- **26 U.S.C. § 125:** Cafeteria plans; § 223: HSAs; § 199A: QBI deduction
- **29 U.S.C. §§ 2601-2654:** FMLA
- **Florida-specific notes:** Florida Statutes § 817.505 (patient brokering), § 542.335 (non-competes) — flag as state-regulated
- **eCFR:** https://www.ecfr.gov/
- **OIG:** https://oig.hhs.gov/
