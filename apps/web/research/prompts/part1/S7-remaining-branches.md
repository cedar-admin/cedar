# Cedar Classification Framework — Part 1, Session 7 of 8

# Remaining Taxonomy Branches: L3+ for All Non-Deep Domains

## Context

Cedar is an AI-powered regulatory monitoring platform for independent medical practices. Target practice types: Functional Medicine, Hormone Optimization/HRT, Compounding Pharmacy, Med Spa/Aesthetic Medicine, Weight Management, Peptide Therapy, IV Therapy/Infusion, Regenerative Medicine, Telehealth, Chiropractic, Integrative Medicine, Anti-Aging Medicine, Pain Management, and Primary Care (DPC/Concierge).

This is **Session 7 of 8**. Sessions 4-6 produced the L1/L2 structure and the deep branches (Compounding, Controlled Substances, FDA Regulation, Telehealth). This session completes the taxonomy by developing **L3 and L4 nodes** for all remaining L1 domains.

These branches are typically shallower than the Session 5-6 branches — most will land at L3 with occasional L4 nodes. The total node count should be moderate.

The combined output of all 8 sessions will be read by Claude Opus to produce an engineering implementation plan.

### Sessions 4-6 Outputs

This session requires outputs from Sessions 4, 5, and 6. **Attach all three output files as file uploads alongside this prompt:**

- `04-taxonomy-L1-L2.md` (Session 4 — full L1/L2 taxonomy and Branch Depth Plan)
- `05-compounding-controlled-substances.md` (Session 5 — cross-classification triggers to reference)
- `06-fda-telehealth.md` (Session 6 — cross-classification triggers to reference)

The research agent should read all three attached files to get the remaining L1/L2 branches assigned to this session from the Branch Depth Plan, and all cross-classification triggers from Sessions 5-6 that reference domains in this session's branches.

---

## Metadata Requirements

Same as Sessions 5-6. For **every node at every level**, provide:

1. **Domain name** — practitioner-facing label
2. **Domain code** — dot-notation extending parent code
3. **Description** — 1-2 sentences
4. **Classification signals**: CFR part/section ranges, agency/sub-agency names, keyword phrases (5-10 per node, weighted), statutory references
5. **Cross-classification triggers** — specific, implementable rules
6. **Practice-type relevance** — compact table per node

---

## Deliverable 1: HIPAA & Privacy Branch (L3 through L4)

Target: 25-35 nodes.

### Key areas to cover:

**Privacy Rule**

- Uses and disclosures of PHI (permitted, required, authorized)
- Treatment, payment, and healthcare operations (TPO) — the core permitted uses
- Patient rights (access, amendment, accounting of disclosures, restriction requests)
- Notice of Privacy Practices (NPP)
- Minimum necessary standard
- Personal representatives
- De-identification standards (Safe Harbor, Expert Determination)
- Marketing and fundraising restrictions
- Research uses of PHI (cross-classification with FDA clinical trials)

**Security Rule**

- Administrative safeguards (security management process, workforce security, access management, training, incident procedures, contingency planning, evaluation)
- Physical safeguards (facility access, workstation use/security, device/media controls)
- Technical safeguards (access control, audit controls, integrity controls, transmission security)
- Organizational requirements (BAAs, group health plan requirements)
- Risk analysis and risk management (core compliance obligation)

**Breach Notification**

- Definition of breach (unsecured PHI, risk assessment)
- Individual notification requirements (timing, content, method)
- HHS notification requirements (breach log, annual reporting for <500; 60-day reporting for 500+)
- Media notification (breaches affecting 500+ in a state)
- Business associate breach obligations
- State breach notification laws (interaction with HIPAA)

**Business Associates**

- Business Associate Agreement (BAA) requirements
- Subcontractor requirements (downstream BAAs)
- Business associate direct liability under HITECH
- Cloud computing and BAAs
- Common business associate categories for practices

**Enforcement & Penalties**

- OCR enforcement process (complaint, investigation, resolution)
- Penalty tiers (four tiers based on culpability)
- Corrective Action Plans
- State attorney general enforcement authority
- Private right of action (limited to state AG suits)

**42 CFR Part 2 — Substance Abuse Records**

- Patient consent requirements (more restrictive than HIPAA)
- Re-disclosure prohibition
- 2024 final rule aligning Part 2 with HIPAA (significant change)
- Application to MAT/MOUD prescribing practices

**Information Blocking (21st Century Cures Act)**

- ONC information blocking rules
- Eight exceptions to information blocking
- Application to healthcare providers
- EHI (Electronic Health Information) definition
- Penalties for information blocking
- Interoperability requirements

**State Privacy Laws**

- Framework for classifying state-specific privacy requirements
- States with more stringent laws than HIPAA (California, Texas, New York, etc.)
- State consumer privacy laws (CCPA/CPRA) — application to healthcare data
- State genetic information privacy laws
- State biometric information privacy laws (relevant to some practice types)

---

## Deliverable 2: Medicare & Billing Branch (L3 through L4)

Target: 30-40 nodes.

### Key areas to cover:

**Provider Enrollment**

- Medicare enrollment applications (CMS-855 forms — I, B, O, A, S)
- PECOS (Provider Enrollment, Chain, and Ownership System)
- Revalidation requirements and cycles
- Medicare enrollment for mid-level providers
- Opt-out and private contracting (important for DPC/concierge)
- Provider enrollment screening levels (limited, moderate, high)
- Change of information reporting requirements

**Fee Schedules & Payment**

- Medicare Physician Fee Schedule (MPFS) — annual updates, RVU methodology
- Outpatient Prospective Payment System (OPPS)
- Ambulatory Surgical Center (ASC) payment system
- Clinical Laboratory Fee Schedule
- Durable Medical Equipment (DME) fee schedule — relevant to practices selling devices
- Conversion factor updates
- Geographic Practice Cost Indices (GPCIs)

**Coverage Determinations**

- National Coverage Determinations (NCDs)
- Local Coverage Determinations (LCDs) — Medicare Administrative Contractors (MACs)
- Local Coverage Articles (LCAs)
- Coverage with Evidence Development (CED)
- Medicare Benefit Policy Manual — key chapters for practices
- Experimental/investigational exclusion criteria

**Coding & Documentation**

- E/M coding updates (2021+ framework, medical decision making, time-based)
- Modifier usage — 25, 59/XE/XP/XS/XU, 95, GT, FQ, GQ, etc.
- Prolonged services coding
- Documentation requirements for medical necessity
- Signature requirements
- ABN (Advance Beneficiary Notice) requirements
- Split/shared visit rules (2024+ changes)
- Incident-to billing requirements
- Teaching physician rules

**Audit & Recovery Programs**

- Recovery Audit Contractor (RAC) program
- Unified Program Integrity Contractor (UPIC) — replaced ZPIC
- Supplemental Medical Review Contractor (SMRC)
- Targeted Probe and Educate (TPE) program
- Medicare audit process and appeals (five levels)
- Extrapolation methodology
- Prepayment review

**Medicare Advantage**

- MA plan network requirements
- Prior authorization (MA vs traditional Medicare)
- Dual-eligible programs
- Risk adjustment and documentation requirements

**Medicaid**

- Provider enrollment for Medicaid
- State Medicaid plan requirements relevant to practices
- Medicaid managed care
- Medicaid billing distinctions from Medicare

**Commercial Payer Rules (Framework)**

- No-Surprises Act / Good Faith Estimates (relevant to out-of-network practices)
- Independent Dispute Resolution (IDR) process
- Credentialing requirements
- Payer contract provisions framework

---

## Deliverable 3: Fraud, Abuse & Compliance Branch (L3 through L4)

Target: 15-20 nodes.

### Key areas to cover:

**Anti-Kickback Statute (AKS)**

- Prohibited conduct (remuneration for referrals)
- Safe harbors — applicable to independent practices (personal services, space rental, employee, group purchasing, EHR donations, cybersecurity donations)
- OIG advisory opinions
- Penalties (criminal and civil)

**Stark Law (Physician Self-Referral)**

- Prohibited referrals for designated health services (DHS)
- Exceptions — applicable to independent practices (in-office ancillary services, personal services, fair market value, group practice)
- Self-disclosure protocol
- Recent reforms (2021 final rules)

**False Claims Act**

- Qui tam / whistleblower provisions
- Implied certification theory
- Knowledge standard
- Damages and penalties

**OIG Exclusions**

- Mandatory and permissive exclusion bases
- Exclusion screening requirements
- Reinstatement process
- SAM.gov and LEIE database checks

**Compliance Programs**

- OIG compliance program guidance for individual and small group practices
- Seven elements of an effective compliance program
- Compliance officer role
- Internal monitoring and auditing

**State-Level Fraud & Abuse**

- State anti-kickback and self-referral laws
- State false claims acts
- Medicaid fraud control units
- State compliance requirements

---

## Deliverable 4: Practice Operations & Licensing Branch (L3 through L4)

Target: 15-25 nodes.

**IMPORTANT — State-expansion scaffolding:** This branch is where state-level regulation is heaviest. Most professional licensing, facility licensing, scope of practice, and corporate structure rules are state-governed with limited federal content. Create taxonomy nodes for all areas listed below with full metadata (domain codes, descriptions, practice-type relevance), even where the classification signals are primarily state-level. For these nodes, note "primarily state-regulated — federal content limited; state administrative code mapping will be added when state sources are ingested." These nodes serve as scaffolding for Cedar's 50-state expansion.

### Key areas to cover:

**Professional Licensing**

- Physician licensing requirements (state medical boards)
- NP/PA/CRNA licensing and collaborative practice requirements
- Scope of practice (varies by state and provider type)
- License renewal and continuing education
- Interstate licensure compacts (cross-classification with Telehealth)
- Board disciplinary actions framework

**Facility Licensing**

- State facility licensing requirements for medical practices
- Clinical laboratory licensing (CLIA — cross-classification with Medicare)
- Ambulatory surgery center licensing
- Office-based surgery requirements
- Pharmacy permits for physician dispensing
- Radiation machine registration

**Corporate Structure**

- Professional corporations / PLLCs
- Corporate practice of medicine doctrine
- Management Services Organization (MSO) structures
- Fee splitting prohibitions
- Multi-state corporate compliance

**Accreditation**

- AAAHC (Accreditation Association for Ambulatory Health Care)
- Joint Commission ambulatory care accreditation
- State-specific accreditation requirements
- CMS deemed status

---

## Deliverable 5: Workplace Safety & Environmental Branch (L3)

Target: 8-12 nodes. These branches are shallower.

### OSHA / Workplace Safety

- Bloodborne pathogens (1910.1030) — exposure control plan, post-exposure evaluation
- Hazard communication (1910.1200) — SDS, labeling, training
- Ionizing radiation (1910.1096)
- Respiratory protection (1910.134)
- Recordkeeping and reporting (Part 1904)
- General duty clause obligations
- Ergonomics (voluntary guidelines for healthcare)

### Environmental / Medical Waste

- Medical waste disposal (state-regulated, framework)
- Sharps disposal
- Pharmaceutical waste (EPA/RCRA requirements)
- Hazardous waste generator requirements
- Mercury-containing device disposal
- Radioactive waste (for practices with nuclear medicine)

---

## Deliverable 6: Employment & Tax Branch (L3)

Target: 8-12 nodes.

### Employment

- FMLA for healthcare workers
- ADA accommodation in medical practice settings
- Anti-discrimination (Title VII, state equivalents)
- Wage and hour for healthcare-specific roles
- Non-compete agreements (FTC rule status, state laws)
- Worker classification (employee vs independent contractor — relevant to locum tenens, 1099 relationships)
- State-specific employment requirements for medical practices

### Healthcare Tax

- Section 125 cafeteria plans
- HSA administration
- ACA employer mandate (applicable large employer determinations)
- Tax-exempt organization compliance (for nonprofit practices)
- QBI deduction for practice owners
- Retirement plan requirements (healthcare-specific considerations)

---

## Deliverable 7: Cross-Classification Master Table

After developing all branches, produce a comprehensive cross-classification table that consolidates every trigger across the full taxonomy (Sessions 5, 6, and 7):

| Source Domain Code | Target Domain Code | Trigger Condition | Frequency (High/Medium/Low) |
| --- | --- | --- | --- |

This table should capture every cross-classification trigger defined across all taxonomy sessions. It becomes the implementable reference for the classification pipeline's multi-domain assignment logic.

---

## Output Format

Same tree structure as Sessions 5-6. Include L1 and L2 headers for context using codes from Session 4. Focus detailed metadata on L3+ nodes.

---

## Reference Material

- 45 CFR Parts 160-164 (HIPAA)
- 42 CFR Part 2 (substance abuse records)
- 42 CFR Chapter IV (CMS regulations)
- 42 CFR Chapter V (OIG)
- 29 CFR Part 1910 (OSHA)
- Anti-Kickback Statute (42 U.S.C. § 1320a-7b(b))
- Stark Law (42 U.S.C. § 1395nn)
- False Claims Act (31 U.S.C. §§ 3729-3733)
- eCFR: https://www.ecfr.gov/
- Cedar repo: https://github.com/cedar-admin/cedar