# Cedar Classification Framework — Part 1, Session 5 of 8

# Deep Taxonomy Branches: Compounding & Controlled Substances (L3 through L6)

## Context

Cedar is an AI-powered regulatory monitoring platform for independent medical practices. Target practice types: Functional Medicine, Hormone Optimization/HRT, Compounding Pharmacy, Med Spa/Aesthetic Medicine, Weight Management, Peptide Therapy, IV Therapy/Infusion, Regenerative Medicine, Telehealth, Chiropractic, Integrative Medicine, Anti-Aging Medicine, Pain Management, and Primary Care (DPC/Concierge).

This is **Session 5 of 8**. Session 4 produced the L1 and L2 taxonomy structure with domain codes. This session develops the **L3 through L6 nodes** for the **Compounding** and **Controlled Substances** branches — Cedar's two highest-priority regulatory domains for its target users.

The combined output of all 8 sessions will be read by Claude Opus to produce an engineering implementation plan.

### Session 4 Output

This session requires the output from Session 4 (Taxonomy L1/L2). **Attach the Session 4 output file (`04-taxonomy-L1-L2.md`) as a file upload alongside this prompt.** The research agent should read the attached file to get the L1/L2 domain codes, descriptions, classification signals, and the Branch Depth Plan for the Compounding and Controlled Substances branches.

---

## Metadata Requirements

For **every node at every level (L3, L4, L5, L6)**, provide all of the following:

1. **Domain name** — practitioner-facing label
2. **Domain code** — dot-notation extending parent code (e.g., `compounding.503a.sterile.beyond-use-dating`)
3. **Description** — 1-2 sentences on what belongs in this node
4. **Classification signals**:
    - **CFR part/section ranges** — as specific as possible (e.g., "21 CFR 211.94" for container/closure systems)
    - **Agency/sub-agency** names producing content for this node
    - **Keyword phrases** — 5-15 weighted phrases per node. Include signal strength (Strong/Moderate/Weak). Address homonyms with disambiguation notes.
    - **Statutory references** — specific sections of federal statutes (e.g., "FD&C Act Section 503A(a)")
5. **Cross-classification triggers** — specific, implementable rules. Format: "If an entity classified in `[this domain]` contains any of these terms: [term list], also classify in `[target domain]`"
6. **Practice-type relevance** — which of Cedar's 14 practice types at what weight (High/Medium/Low/None). Use compact table format.

---

## Deliverable 1: Compounding Branch (L3 through L6)

Develop the full Compounding taxonomy. Target: 40-60 total nodes across all levels in this branch.

### Key regulatory areas to cover (organize as you see fit):

**503A Traditional Compounding**

- Patient-specific compounding requirements
- Prescriber-patient relationship requirement
- Anticipatory compounding limits
- Bulk drug substance sourcing (FDA bulk drug list)
- Essentially a copy of a commercially available product (prohibition)
- Compounding from bulk vs. manufactured starting materials
- Office use compounding (state-dependent)
- Memorandum of Understanding (MOU) between states and FDA

**503B Outsourcing Facilities**

- Registration and reporting requirements
- Current Good Manufacturing Practice (cGMP) requirements
- Adverse event reporting
- Drug supply chain requirements
- FDA inspection framework
- Labeling requirements for outsourcing facilities

**USP Standards**

- USP Chapter 795 (non-sterile compounding)
- USP Chapter 797 (sterile compounding) — the 2023 revisions are significant
- USP Chapter 800 (hazardous drug handling)
- USP Chapter 825 (radiopharmaceuticals) — relevant to some practices
- Beyond-Use Dating (BUD) — stability testing, default BUDs, extended BUDs
- Environmental monitoring and testing requirements
- Personnel training and competency

**Sterile Compounding Specifics**

- Cleanroom classifications (ISO 5, 7, 8)
- Garbing and aseptic technique requirements
- Media fill testing
- Endotoxin testing
- Sterility testing
- Primary Engineering Controls (PECs) — laminar airflow workbenches, biological safety cabinets, CACIs
- Secondary Engineering Controls (SECs) — buffer rooms, ante rooms

**Ingredient Sourcing & Quality**

- Bulk drug substance quality standards
- FDA's bulk drug substances list (positive list)
- Certificate of Analysis requirements
- Supplier qualification
- Component testing requirements

**FDA Enforcement**

- Warning letters
- Import alerts
- Consent decrees
- Compounding risk alerts
- Insanitary conditions findings

**State Board of Pharmacy**

- State-specific compounding permits/licenses
- Pharmacist-in-charge requirements
- Inspection requirements
- Continuing education for compounding
- Compounding for prescriber administration (varies by state)

**Practice-Specific Compounding**

- Hormone compounding (BHRT) — high relevance to HRT practices
- Peptide compounding — high relevance to peptide therapy practices
- IV compounding — high relevance to IV therapy practices
- Dermatological compounding — relevant to med spas
- Pain management compounding — relevant to pain management practices
- Weight management compounding (e.g., tirzepatide, semaglutide compounding controversy)

---

## Deliverable 2: Controlled Substances Branch (L3 through L6)

Develop the full Controlled Substances taxonomy. Target: 40-60 total nodes across all levels in this branch.

### Key regulatory areas to cover:

**DEA Registration**

- Practitioner registration (individual DEA numbers)
- Mid-level practitioner registration (NP, PA, CRNA)
- Institutional registration
- Registration renewal and modification
- State license prerequisite
- Multiple location registrations
- DEA number validation

**Prescribing**

- Prescribing authority by provider type (physician, NP, PA, CRNA — varies by state/federal)
- Schedule-specific prescribing rules (Schedule II vs III-V)
- Prescription requirements (form, content, refills, quantities)
- Oral prescriptions for controlled substances
- Emergency dispensing
- Corresponding responsibility (pharmacist duty)
- Prescribing to self or family members

**E-Prescribing (EPCS)**

- EPCS mandates (federal and state)
- Identity proofing requirements
- Two-factor authentication requirements
- Certified e-prescribing applications
- Audit trail requirements
- Medicare Part D EPCS mandate

**PDMP (Prescription Drug Monitoring Programs)**

- State PDMP query requirements (mandatory vs voluntary)
- Interstate data sharing (PMP InterConnect)
- Delegate access provisions
- Prescriber obligations
- Dispenser obligations

**Schedule Classifications**

- Schedule I through V definitions and criteria
- Scheduling actions (additions, removals, reschedulings)
- Temporary scheduling (emergency scheduling authority)
- State-level scheduling that differs from federal

**Dispensing**

- Dispensing at point of care (physician dispensing)
- Dispensing vs prescribing distinction
- State dispensing permits
- Labeling requirements for dispensed controlled substances
- Automated dispensing systems

**Opioid-Specific Regulations**

- Medication-Assisted Treatment (MAT) / Medications for Opioid Use Disorder (MOUD)
- X-waiver history and current status (elimination of X-waiver requirement)
- Buprenorphine prescribing
- Methadone treatment regulations
- Opioid prescribing limits (morphine milligram equivalent thresholds)
- Naloxone co-prescribing requirements

**Recordkeeping & Inventory**

- Biennial inventory requirements
- Ongoing recordkeeping (receipt, dispensing, administration)
- DEA Form 222 (Schedule I and II ordering)
- CSOS (Controlled Substance Ordering System)
- Records retention periods

**Security & Storage**

- Physical security requirements by schedule
- Safe/vault specifications
- Employee access controls
- Theft/loss reporting (DEA Form 106)

**Disposal & Reverse Distribution**

- Take-back programs
- Reverse distribution
- In-house destruction methods
- DEA-authorized collectors
- Environmental disposal considerations

**Telehealth Prescribing of Controlled Substances**

- Ryan Haight Act requirements (in-person exam requirement)
- Ryan Haight Act exceptions (telemedicine practice, DEA special registration)
- Post-COVID telehealth flexibilities (DEA rulemaking timeline)
- Audio-only vs audio-video for controlled substance prescribing
- State-specific telehealth CS prescribing rules
- (Cross-classification with Telehealth branch — define triggers)

---

## Output Format

Organize as a navigable tree using markdown heading levels:

```
## L1: [Domain Name] (`domain-code`)

### L2: [Subdomain Name] (`domain-code.subdomain`)

#### L3: [Area Name] (`domain-code.subdomain.area`)
- Description: ...
- Classification signals: ...
- Cross-classification triggers: ...
- Practice-type relevance: ...

##### L4: [Specific Topic] (`domain-code.subdomain.area.topic`)
- Description: ...
- Classification signals: ...
- Cross-classification triggers: ...
- Practice-type relevance: ...
```

Include L1 and L2 as headers for structural context (using codes from Session 4) but focus the detailed metadata on L3+.

---

## Reference Material

- 21 CFR Chapter II (DEA regulations): Parts 1301-1321
- 21 CFR Parts 200-299, 300-399 (FDA drug regulations including compounding)
- FD&C Act Sections 503A and 503B (compounding statutory authority)
- Controlled Substances Act (21 U.S.C. §§ 801-971)
- USP Compounding Standards: Chapters 795, 797, 800
- eCFR: https://www.ecfr.gov/
- Cedar repo: https://github.com/cedar-admin/cedar