# Cedar Classification Framework — Part 1, Session 6 of 8

# Deep Taxonomy Branches: FDA Regulation & Telehealth (L3 through L6)

## Context

Cedar is an AI-powered regulatory monitoring platform for independent medical practices. Target practice types: Functional Medicine, Hormone Optimization/HRT, Compounding Pharmacy, Med Spa/Aesthetic Medicine, Weight Management, Peptide Therapy, IV Therapy/Infusion, Regenerative Medicine, Telehealth, Chiropractic, Integrative Medicine, Anti-Aging Medicine, Pain Management, and Primary Care (DPC/Concierge).

This is **Session 6 of 8**. Session 4 produced the L1/L2 taxonomy structure. Session 5 developed the Compounding and Controlled Substances deep branches. This session develops the **L3 through L6 nodes** for the **FDA Regulation** and **Telehealth** branches.

The combined output of all 8 sessions will be read by Claude Opus to produce an engineering implementation plan.

### Sessions 4-5 Outputs

This session requires outputs from Sessions 4 and 5. **Attach both output files as file uploads alongside this prompt:**

- `04-taxonomy-L1-L2.md` (Session 4 — L1/L2 domain codes, descriptions, and Branch Depth Plan)
- `05-compounding-controlled-substances.md` (Session 5 — for cross-classification trigger consistency)

The research agent should read both attached files to get the FDA Regulation and Telehealth L1/L2 codes from Session 4, and any cross-classification triggers from Session 5 that reference FDA or Telehealth domains.

---

## Metadata Requirements

Same as Session 5. For **every node at every level (L3, L4, L5, L6)**, provide:

1. **Domain name** — practitioner-facing label
2. **Domain code** — dot-notation extending parent code
3. **Description** — 1-2 sentences
4. **Classification signals**: CFR part/section ranges, agency/sub-agency names, keyword phrases (5-15 per node, weighted, with homonym disambiguation), statutory references
5. **Cross-classification triggers** — specific, implementable rules
6. **Practice-type relevance** — compact table per node

---

## Deliverable 1: FDA Regulation Branch (L3 through L6)

Develop the full FDA Regulation taxonomy. Target: 50-70 total nodes across all levels in this branch.

### Key regulatory areas to cover:

**Drug Regulation**

- New Drug Applications (NDAs) — approval, supplemental applications, withdrawal
- Abbreviated New Drug Applications (ANDAs) — generic drug approvals
- Biologics License Applications (BLAs) — biological products
- Biosimilar applications — interchangeability designations
- Drug labeling requirements — professional labeling, patient labeling, Medication Guides
- Over-the-counter (OTC) drug regulation — OTC monograph reform
- Drug safety communications — MedWatch alerts, safety reviews
- Risk Evaluation and Mitigation Strategies (REMS) — ETASU requirements, REMS modifications
- Drug shortages — shortage notifications, allocation protocols
- Drug pricing transparency — relevant federal rules (Note: state-level is where most action is)
- Orphan drug designations
- Accelerated approval pathway
- Breakthrough therapy designation

**Device Regulation**

- Device classification (Class I, II, III)
- 510(k) premarket notification — clearance decisions, predicate device framework
- Premarket Approval (PMA) — for Class III devices
- De Novo classification — novel low-to-moderate risk devices
- Investigational Device Exemption (IDE)
- Unique Device Identification (UDI) system
- Medical Device Reporting (MDR) — mandatory adverse event reporting
- Device recalls — classifications (Class I, II, III), corrections and removals
- Device labeling — directions for use, contraindications, warnings
- Software as a Medical Device (SaMD) — relevant to digital health/telehealth
- Laboratory Developed Tests (LDTs) — FDA regulation of diagnostics
- Laser products — performance standards (21 CFR 1040) — relevant to med spas
- Radiation-emitting devices — performance standards for electronic products
- Aesthetic devices — RF devices, ultrasound devices, LED devices, cryotherapy devices (high relevance to med spas)

**Biologics Regulation**

- PRP (Platelet-Rich Plasma) — regulatory classification
- Stem cell products — FDA enforcement on unapproved uses
- Human Cells, Tissues, and Cellular and Tissue-Based Products (HCT/Ps) — 21 CFR Part 1271
- Section 361 vs 351 products (minimal manipulation vs more-than-minimal)
- Tissue establishment registration
- Regenerative medicine advanced therapy (RMAT) designation

**Dietary Supplement Regulation**

- DSHEA framework — structure/function claims vs drug claims
- New Dietary Ingredient (NDI) notifications
- Supplement labeling requirements
- Supplement adverse event reporting (mandatory serious AE reporting)
- cGMP for dietary supplements (21 CFR Part 111)
- FDA enforcement against supplements with drug claims
- NAC regulatory status (recent FDA guidance)
- CBD/hemp product regulation status

**Cosmetic Regulation (MoCRA)**

- Modernization of Cosmetics Regulation Act (MoCRA) — enacted December 2022
- Facility registration requirements
- Product listing requirements
- Adverse event reporting (new mandatory reporting)
- Ingredient review and safety substantiation
- Fragrance allergen labeling
- Good manufacturing practice requirements for cosmetics
- Recalls authority (new under MoCRA)
- Professional-use cosmetics (relevant to med spa treatments)
- Tattoo and permanent makeup pigments

**FDA Advertising & Promotion**

- Direct-to-consumer (DTC) drug advertising rules
- Professional promotion and detailing
- Off-label promotion enforcement
- Social media promotion guidance
- Testimonial and endorsement rules for medical products
- Comparative advertising requirements
- Fair balance requirement
- Pre-dissemination review (for certain products)

**Clinical Trials**

- Investigational New Drug (IND) applications
- IDE applications
- Institutional Review Board (IRB) requirements (cross-classification with HIPAA/research ethics)
- Informed consent requirements for research
- Clinical trial registration (ClinicalTrials.gov)
- Good Clinical Practice (GCP) requirements
- Expanded access / compassionate use

**FDA Enforcement Actions**

- Warning letters
- Untitled letters
- Import alerts
- Consent decrees
- Injunctions
- Seizures
- Criminal prosecutions
- Debarment
- Civil money penalties

---

## Deliverable 2: Telehealth Branch (L3 through L6)

Develop the full Telehealth taxonomy. Target: 30-45 total nodes across all levels in this branch.

### Key regulatory areas to cover:

**Prescribing via Telemedicine**

- Ryan Haight Act — in-person examination requirement
- Ryan Haight Act exceptions — seven statutory exceptions
- DEA telemedicine special registration (proposed/final rule status)
- Post-COVID telehealth flexibilities — DEA temporary rules and their expiration/extension timeline
- Controlled substance prescribing via telehealth (cross-classification with CS branch)
- Non-controlled substance prescribing via telehealth
- Prescribing based on questionnaire-only (restrictions)
- Prescribing for weight management via telehealth (high relevance — GLP-1 prescribing)
- Prescribing hormones via telehealth
- Audio-only vs audio-video requirements for prescribing

**State Licensure & Practice Authority**

- Interstate Medical Licensure Compact (IMLC)
- Nurse Licensure Compact (NLC)
- Psychology Interjurisdiction Compact (PSYPACT)
- Physical Therapy Licensure Compact
- State-by-state telehealth practice requirements (framework for classification)
- Practicing location vs patient location jurisdiction rules
- Telehealth-specific state licenses/registrations
- Corporate practice of medicine (telehealth implications)

**Telehealth Billing & Reimbursement**

- Medicare telehealth billing — place of service codes, modifiers (95, GT, FQ)
- Geographic and originating site restrictions (Medicare) — waivers and permanent changes
- Facility fee billing for telehealth
- Commercial payer telehealth policies (framework)
- State telehealth parity laws
- Remote Patient Monitoring (RPM) billing — CPT 99453-99458
- Remote Therapeutic Monitoring (RTM) billing — CPT 98975-98981
- Chronic Care Management (CCM) via telehealth
- Principal Care Management (PCM) via telehealth
- Audio-only billing codes and restrictions
- E/M code selection for telehealth visits

**Technology & Platform Requirements**

- HIPAA-compliant telehealth platforms (cross-classification with HIPAA)
- Business Associate Agreement requirements for platform vendors
- Encryption and security standards for telehealth
- Patient consent for telehealth (state-specific)
- Recording and documentation requirements
- Emergency protocols for telehealth encounters
- Bandwidth and technology standards

**Remote Patient Monitoring (RPM)**

- FDA regulation of RPM devices (cross-classification with FDA Device)
- RPM program setup requirements
- Patient eligibility for RPM
- Data collection and transmission standards
- Clinical staff requirements for RPM oversight
- RPM for chronic disease management
- Wearable device regulatory status

**Telehealth Modalities**

- Synchronous (live video) — regulation and billing
- Asynchronous (store-and-forward) — regulation and billing
- Audio-only — regulation, billing, and state-specific restrictions
- Remote monitoring — regulation and billing
- Mobile health (mHealth) apps — FDA regulation, FTC regulation

**Cross-State & Jurisdiction Issues**

- Where the patient is located determines applicable law (general principle)
- Multi-state practice compliance strategies
- Corporate structure for multi-state telehealth
- Malpractice insurance across state lines
- State telehealth registries

**Informed Consent for Telehealth**

- State-specific informed consent requirements
- Required disclosures (limitations, privacy, emergency protocols)
- Written vs verbal consent requirements
- Consent documentation and recordkeeping

---

## Output Format

Same tree structure as Session 5:

```
## L1: [Domain Name] (`domain-code`)

### L2: [Subdomain Name] (`domain-code.subdomain`)

#### L3: [Area Name] (`domain-code.subdomain.area`)
- Description: ...
- Classification signals: ...
- Cross-classification triggers: ...
- Practice-type relevance: ...

##### L4: [Specific Topic] (`domain-code.subdomain.area.topic`)
...
```

Include L1 and L2 as structural headers using codes from Session 4. Focus detailed metadata on L3+.

**Explicitly define every cross-classification trigger** that connects to Session 5's Compounding and Controlled Substances branches. These must be consistent with the triggers defined there.

---

## Reference Material

- 21 CFR Parts 200-899 (FDA drug, device, biologics, cosmetics regulations)
- 21 CFR Part 1271 (HCT/Ps)
- FD&C Act (21 U.S.C.)
- Ryan Haight Online Pharmacy Consumer Protection Act (21 U.S.C. § 829(e))
- MoCRA (Consolidated Appropriations Act 2023, Division FF, Title III, Subtitle E)
- DSHEA (Dietary Supplement Health and Education Act of 1994)
- eCFR: https://www.ecfr.gov/
- Cedar repo: https://github.com/cedar-admin/cedar