# Cedar Classification Framework — Part 1, Session 6-A of 8
# Deep Taxonomy: FDA Regulation Branch (L3 through L6)

## About This Session

**Context from prior research sessions has been pre-injected above this prompt by the orchestrator.**
The injected context contains:
- **Session 4 output** — L1/L2 domain codes for all domains, including FDA Regulation
- **Session 5-A output** — Compounding branch taxonomy (L3-L6) with cross-classification triggers
- **Session 5-B output** — Controlled Substances branch taxonomy (L3-L6) with cross-classification triggers

Read all three injected outputs directly. Cross-classification triggers from Sessions 5-A and 5-B
that reference FDA domains must be made consistent here.

This is a **sub-session** (6-A of 8). Session 6 was split because FDA Regulation + Telehealth together
exceeded output quality thresholds. **This session covers FDA Regulation only.** Telehealth is Session 6-B.

---

## Cedar Platform Context

Cedar is an AI-powered regulatory monitoring platform for independent medical practices.

**Target practice types** (14 total):
Functional Medicine, Hormone Optimization/HRT, Compounding Pharmacy, Med Spa/Aesthetic Medicine,
Weight Management, Peptide Therapy, IV Therapy/Infusion, Regenerative Medicine, Telehealth,
Chiropractic, Integrative Medicine, Anti-Aging Medicine, Pain Management, Primary Care (DPC/Concierge).

**Platform purpose:** Cedar monitors federal and state regulatory sources, detects changes within hours,
classifies them through an AI pipeline, and delivers plain-language alerts. The FDA Regulation domain
is large and cuts across almost all practice types — drug approvals, device clearances, biologics
enforcement, dietary supplement guidance, and advertising rules all affect Cedar's target practices.

---

## Metadata Requirements

For **every node at every level (L3, L4, L5, L6)**, provide all of the following:

1. **Domain name** — practitioner-facing label
2. **Domain code** — dot-notation extending the L2 code from Session 4
3. **Description** — 1-2 sentences on what regulatory content belongs here and why it matters
4. **Classification signals**:
   - **CFR part/section ranges** — as specific as possible
   - **Agency/sub-agency names** — exact Federal Register names (e.g., "Food and Drug Administration", "Center for Drug Evaluation and Research", "Center for Devices and Radiological Health")
   - **Keyword phrases** — 5-15 per node, marked Strong / Moderate / Weak, with disambiguation notes
   - **Statutory references** — FD&C Act sections, PHSA sections, etc.
5. **Cross-classification triggers** — specific, implementable rules:
   > "If an entity classified in `[this domain code]` contains any of: [term list], also classify in `[target domain code]`"
6. **Practice-type relevance** — compact table (High / Medium / Low; omit None rows):

| Practice Type | Relevance |
|---|---|
| [practice] | [weight] |

---

## Deliverable: FDA Regulation Branch (L3 through L6)

Develop the **full FDA Regulation taxonomy** for Cedar. Use L1/L2 codes from Session 4.
Target: **50–70 total nodes** across all levels.

**Explicitly define every cross-classification trigger** that connects to:
- Session 5-A's Compounding branch (e.g., FDA warning letters about compounders, bulk drug list updates)
- Session 5-B's Controlled Substances branch (e.g., REMS for opioids, DEA-FDA coordination on scheduling)

### Required coverage areas:

**Drug Regulation**
- New Drug Applications (NDAs): approval process, supplemental applications (Type I, II, III CBE-0, CBE-30, PAS), withdrawal
- Abbreviated New Drug Applications (ANDAs): generic drug approval, Orange Book, paragraph IV certifications
- Biologics License Applications (BLAs): biological product approval pathway, differences from NDAs
- Biosimilar applications: 351(k) pathway, interchangeability designation, Purple Book
- Drug labeling requirements: professional (package insert) labeling, patient labeling (Medication Guides, Instructions for Use), carton/container labeling
- Over-the-counter (OTC) monograph reform: CARES Act OTC reform, administrative orders replacing old monograph system
- Drug safety communications: MedWatch alerts, FDA Drug Safety Communications, FAERS reports
- Risk Evaluation and Mitigation Strategies (REMS): what triggers REMS, ETASU (Elements to Assure Safe Use), REMS modification, REMS with shared systems
- Drug shortages: shortage notification requirements for manufacturers, FDA shortage list, clinical implications
- Orphan drug designations: Orphan Drug Act, designation criteria, benefits (7-year exclusivity, tax credits)
- Accelerated approval pathway: unmet medical need, surrogate endpoints, post-approval confirmatory trials, 2022 reforms
- Breakthrough therapy designation: criteria, FDA interaction expectations, not a guarantee of approval

**Device Regulation**
- Device classification: Class I (low risk, general controls), Class II (moderate risk, special controls), Class III (high risk, premarket approval)
- 510(k) premarket notification: substantial equivalence standard, predicate device selection, De Novo as alternative when no predicate
- Premarket Approval (PMA): for Class III devices, clinical evidence requirements, PMA supplement types
- De Novo classification: novel low-to-moderate risk devices without predicate, new regulatory pathway, special controls development
- Investigational Device Exemption (IDE): significant risk vs. non-significant risk, IRB oversight, IDE application contents
- Unique Device Identification (UDI) system: GUDID database, labeler requirements, device identifier vs. production identifier
- Medical Device Reporting (MDR): mandatory reporting by manufacturers, importers, device user facilities; reportable events (death, serious injury, malfunction); MedWatch 3500A
- Device recalls: Class I (most serious), Class II, Class III; corrections and removals; 21 CFR Part 806
- Device labeling: required elements, adequate directions for use, contraindications, intended use
- Software as a Medical Device (SaMD): FDA's Digital Health Center of Excellence, risk-based approach, predetermined change control plans, AI/ML-based SaMD guidance
- Laboratory Developed Tests (LDTs): FDA's assertion of authority, recent final rule on LDT regulation, CLIA vs FDA framework
- Laser products: 21 CFR Part 1040 performance standards, classification (Class I through IV), reporting requirements — **high relevance to med spas and aesthetic practices**
- Radiation-emitting electronic products: 21 CFR Parts 1000-1050, annual reports, accession numbers
- Aesthetic devices: RF (radiofrequency) devices, ultrasound devices, LED photobiomodulation, cryotherapy, IPL (intense pulsed light) — clearance status, intended use restrictions, off-label use considerations — **high relevance to med spas**

**Biologics Regulation**
- Platelet-Rich Plasma (PRP): FDA regulatory classification — when is PRP a drug vs. a procedure? FDA's position, enforcement discretion, same-day surgical exception
- Stem cell products: FDA enforcement on unapproved stem cell treatments, 21 CFR Part 1271 application, court cases (US v. US Stem Cell Clinic), warning letters
- Human Cells, Tissues, and Cellular and Tissue-Based Products (HCT/Ps): 21 CFR Part 1271 framework, tissue establishment registration, donor eligibility, current good tissue practice (cGTP)
- Section 361 vs. 351 products: 361 HCT/Ps (minimal manipulation, homologous use, no systemic effect) vs. 351 products (require BLA), the four criteria for 361 exemption
- Tissue establishment registration: Form FDA 3356, annual updates, who must register
- Regenerative Medicine Advanced Therapy (RMAT) designation: criteria, benefits, FDA interaction for regenerative therapies including cellular and gene therapies

**Dietary Supplement Regulation**
- DSHEA framework: dietary supplement definition, structure/function claims vs. disease claims, disclaimer requirements (21 U.S.C. § 343(r)(6))
- New Dietary Ingredient (NDI) notifications: 75-day review window, what qualifies as new, safety standard, FDA response options
- Supplement labeling: Supplement Facts panel, serving size, daily values, structure/function claims, required disclaimers
- Mandatory serious adverse event reporting: IND Safety Reports for supplements, 15-day reporting, retailer obligations
- cGMP for dietary supplements: 21 CFR Part 111, component testing, in-process testing, finished product specifications, personnel, equipment
- FDA enforcement against supplements with drug claims: warning letters, import alerts, injunctions for unapproved drugs marketed as supplements
- NAC (N-acetyl-cysteine) regulatory status: FDA's position on NAC as supplement (pre-existing drug exclusion issue), current status
- CBD/hemp product regulation: FDA's framework for CBD in foods and supplements, enforcement discretion, current guidance, state law divergence

**Cosmetic Regulation (MoCRA)**
- MoCRA overview: Modernization of Cosmetics Regulation Act, enacted December 29, 2022 (Consolidated Appropriations Act 2023, Division FF, Title III, Subtitle E), major expansion of FDA cosmetic authority
- Facility registration: required by December 29, 2023, biennial renewal, what triggers registration, small business exemptions
- Product listing: required for each cosmetic product, cosmetic ingredients (with INCI names), responsible person designation
- Adverse event reporting: new mandatory serious adverse event reporting (15 business days), records retention (6 years)
- Ingredient review and safety substantiation: responsible person must substantiate product safety, FDA authority to require substantiation
- Fragrance allergen labeling: FDA proposed rule, specific allergens to disclose, timeline
- Good manufacturing practice for cosmetics: FDA proposed GMP regulation for cosmetics, current status
- Recall authority: FDA can now mandate cosmetic recalls, previously voluntary
- Professional-use cosmetics: how MoCRA applies to cosmetics used in professional settings (med spas, salons), distinctions from over-the-counter retail
- Tattoo and permanent makeup pigments: color additives in tattoo inks, FDA enforcement authority, ingredient listing requirements under MoCRA

**FDA Advertising & Promotion**
- Direct-to-consumer (DTC) drug advertising: TV/print requirements, fair balance, major statement, brief summary alternative, FDA review process (Form FDA 2253)
- Professional promotion and detailing: labeling vs. promotional materials, appropriate use of journal articles, continuing medical education
- Off-label promotion enforcement: FDA's authority, constitutional limits (First Amendment cases), safe harbors for scientific exchange
- Social media and digital promotion: FDA guidance on character-space-limited platforms, presenting risk information online, third-party platforms
- Testimonials and endorsements: FTC Act overlap, FDA guidance on patient testimonials in drug/device promotion
- Comparative advertising: requirements for comparative claims, substantiation standards
- Fair balance requirement: presentation of risks comparable in prominence/readability to benefits
- Accelerated approval and promotion: restrictions on promoting accelerated approval drugs before confirmatory trial completion

**Clinical Trials**
- Investigational New Drug (IND) applications: required before human trials, IND types (commercial, research/non-commercial), safety reporting during trials
- Investigational Device Exemption (IDE): for significant risk device studies, IRB role, sponsor obligations
- Institutional Review Board (IRB) requirements: 21 CFR Part 56, IRB registration, review categories, continuing review
- Informed consent requirements for research: 21 CFR Part 50, required elements, exceptions, documentation
- Clinical trial registration: ClinicalTrials.gov (FDAAA Section 801), required and voluntary registration, results reporting
- Good Clinical Practice (GCP): ICH E6(R2), FDA regulations vs. international standards, inspection authority
- Expanded access / compassionate use: individual patient, intermediate-size population, widespread treatment protocols; emergency vs. non-emergency

**FDA Enforcement Actions**
- Warning letters: most common FDA enforcement tool, response requirements, public disclosure, effect on regulatory status
- Untitled letters: less formal than warning letters, used for less significant violations
- Import alerts: DWPE (detention without physical examination), how practices sourcing foreign-origin products are affected
- Consent decrees: court-ordered compliance agreements, remediation requirements, ongoing oversight
- Injunctions: temporary restraining orders, preliminary injunctions, permanent injunctions
- Seizures: civil seizure of violative products, Article of drug/device
- Criminal prosecutions: misdemeanor vs. felony under FD&C Act, Park doctrine (responsible corporate officer)
- Debarment: 21 U.S.C. § 335a, mandatory and permissive debarment, effect on regulatory submissions
- Civil money penalties: specific authority under FDCA, MoCRA, and other provisions; penalty amounts

---

## Cross-Classification Requirements

**Consistency with Sessions 5-A and 5-B:**
Review injected outputs for all cross-classification triggers pointing toward FDA domains. Ensure
every trigger defined in 5-A (e.g., compounding → FDA enforcement) and 5-B (e.g., CS scheduling →
FDA drug regulation) has a corresponding trigger here pointing back to those domains.

**Key cross-classification areas to define triggers for:**
- FDA compounding enforcement → `compounding.*` (warning letters, import alerts for compounders)
- REMS for opioids/controlled substances → `controlled-substances.prescribing.*`
- Bulk drug list updates → `compounding.503a.bulk-drug-sourcing`
- LDTs/CLIA → `medicare-billing.coverage.*` (Medicare coverage of lab tests)
- SaMD/RPM devices → `telehealth.*` (to be defined in 6-B)
- PRP/stem cells/HCT/Ps → `regenerative-medicine.*` and `biologics.*` (if those L2 codes exist from S4)
- Dietary supplement claims → `advertising-promotion.*`
- MoCRA cosmetics → aesthetics/med spa practice types specifically

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

Include L1/L2 as structural headers. Focus detailed metadata on L3+. Use L5/L6 where FDA regulatory
complexity genuinely warrants it (e.g., device classification tiers, REMS ETASU subtypes).

---

## Reference Material

- **21 CFR Parts 1-99:** Administrative, general
- **21 CFR Parts 200-899:** FDA drug, device, biologics, cosmetics regulations
- **21 CFR Part 1271:** HCT/Ps
- **21 CFR Parts 1000-1050:** Radiological health
- **FD&C Act (21 U.S.C. Chapter 9)**
- **Public Health Service Act Section 351** (biologics)
- **DSHEA (1994)** — Dietary Supplement Health and Education Act
- **MoCRA** — Consolidated Appropriations Act 2023, Division FF, Title III, Subtitle E
- **eCFR:** https://www.ecfr.gov/
- **FDA guidance documents:** https://www.fda.gov/regulatory-information/search-fda-guidance-documents
