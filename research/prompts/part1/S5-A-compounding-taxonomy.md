# Cedar Classification Framework — Part 1, Session 5-A of 8
# Deep Taxonomy: Compounding Branch (L3 through L6)

## About This Session

**Context from prior research sessions has been pre-injected above this prompt by the orchestrator.**
The injected context contains the Session 4 output (Domain Taxonomy L1/L2 Structure), which includes
the L1/L2 domain codes, descriptions, classification signals, and the Branch Depth Plan for all domains.
Read that context directly — do not search for it externally. All L1/L2 codes you need are in the
injected context.

This is a **sub-session** (5-A of 8). The original Session 5 was split because two full deep branches
(Compounding + Controlled Substances) would exceed output quality thresholds in a single session.
**This session covers the Compounding branch only.** Controlled Substances is Session 5-B.

---

## Cedar Platform Context

Cedar is an AI-powered regulatory monitoring platform for independent medical practices.

**Target practice types** (14 total):
Functional Medicine, Hormone Optimization/HRT, Compounding Pharmacy, Med Spa/Aesthetic Medicine,
Weight Management, Peptide Therapy, IV Therapy/Infusion, Regenerative Medicine, Telehealth,
Chiropractic, Integrative Medicine, Anti-Aging Medicine, Pain Management, Primary Care (DPC/Concierge).

**Platform purpose:** Cedar monitors federal and state regulatory sources, detects changes within hours
of publication, classifies them through an AI intelligence pipeline, and delivers plain-language alerts.
The classification taxonomy is the core of the pipeline — it determines what domain(s) each regulatory
entity belongs to, which practices it's relevant for, and how it gets routed for alerts and display.

**Current phase:** Building the classification engine for Florida-first deployment, expanding state-by-state.
The taxonomy starts with federal regulatory domains (this Part 1 work) and adds state-specific scaffolding later.

---

## Metadata Requirements

For **every node at every level (L3, L4, L5, L6)**, provide all of the following:

1. **Domain name** — practitioner-facing label (clear, plain English)
2. **Domain code** — dot-notation extending the parent L2 code from Session 4 (e.g., `compounding.503a.patient-specific`)
3. **Description** — 1-2 sentences: what regulatory content belongs in this node, and why it matters to practices
4. **Classification signals**:
   - **CFR part/section ranges** — as specific as possible (e.g., "21 CFR 503A(a)" or "21 CFR 211.94")
   - **Agency/sub-agency names** — which agencies produce content classified here (use exact Federal Register agency names)
   - **Keyword phrases** — 5-15 weighted phrases per node. Mark each: Strong / Moderate / Weak. Add disambiguation notes for homonyms (e.g., "sterile" is also used in non-compounding contexts — signal weight drops without accompanying "compounding" or "USP" term)
   - **Statutory references** — specific sections of federal statutes (e.g., "FD&C Act Section 503A(a)(1)")
5. **Cross-classification triggers** — specific, implementable rules in this format:
   > "If an entity classified in `[this domain code]` contains any of: [term list], also classify in `[target domain code]`"
6. **Practice-type relevance** — compact table showing which of Cedar's 14 practice types this node is relevant to, at what weight:

| Practice Type | Relevance |
|---|---|
| Compounding Pharmacy | High |
| [other types] | [weight] |

Use High / Medium / Low / None. Only list practice types where relevance is Medium or higher (omit None rows for brevity — but include a note if ALL 14 types are relevant).

---

## Deliverable: Compounding Branch (L3 through L6)

Develop the **full Compounding taxonomy** for Cedar. Use the L1 and L2 codes from Session 4's output
(injected above) as the root of each code path. Target: **40–60 total nodes** across all levels.

Organize the tree as you see fit — the areas below are required content, not a required tree structure.
You may create intermediate nodes, merge thin areas, or split dense areas as the regulatory structure demands.

### Required coverage areas:

**503A Traditional Compounding**
- Patient-specific compounding requirements (valid prescription, prescriber-patient relationship)
- Anticipatory compounding: limits on quantity, restrictions on commercially available copies
- Bulk drug substance sourcing: FDA bulk drug list (Category 1 positive list, Category 2 nominated, Category 3 withdrawn/not evaluated)
- Prohibition on essentially copying a commercially available product
- Compounding from bulk vs. from manufactured (FDA-approved) starting materials
- Office use compounding: restrictions under 503A, state-dependent permissions
- Memorandum of Understanding (MOU) between states and FDA: interstate distribution limits, reporting obligations

**503B Outsourcing Facilities**
- Registration and reporting requirements with FDA
- Current Good Manufacturing Practice (cGMP) requirements (21 CFR Parts 210-211 applied to outsourcing)
- Adverse event reporting requirements for outsourcing facilities
- Drug supply chain and tracing requirements
- FDA inspection authority and frequency
- Labeling requirements specific to outsourcing facility products

**USP Standards**
- USP Chapter <795>: nonsterile compounding — process, equipment, BUD defaults, quality systems
- USP Chapter <797>: sterile compounding — 2023 revision significance, Category 1 vs Category 2 CSPs, facility requirements, testing
- USP Chapter <800>: hazardous drug handling — containment, PPE, CSTD, engineering controls, HD list
- USP Chapter <825>: radiopharmaceuticals (relevant to nuclear medicine-adjacent practices)
- Beyond-Use Dating (BUD): stability testing, default BUDs for nonsterile vs sterile, extended BUD with testing, dating for hazardous drugs
- Environmental monitoring and testing: viable and nonviable particle counts, alert/action levels
- Personnel training and competency: initial, ongoing, documentation, aseptic technique assessments

**Sterile Compounding Specifics**
- Cleanroom classifications: ISO 5, 7, 8 — what each means, where required
- Garbing and aseptic technique: donning order, gowning competency, aseptic manipulations
- Media fill testing: process simulation, acceptance criteria, frequency
- Endotoxin testing: LAL test, limits by product type
- Sterility testing: direct inoculation vs membrane filtration, when required
- Primary Engineering Controls (PECs): LAFW (Laminar Airflow Workbenches), BSC (Biological Safety Cabinets), CACI (Compounding Aseptic Containment Isolators), CACI vs CAI distinction
- Secondary Engineering Controls (SECs): buffer rooms, ante-rooms, pass-throughs, pressure differentials

**Ingredient Sourcing & Quality**
- Bulk drug substance quality standards: USP, NF, ACS, or certificate of analysis required
- FDA bulk drug substances list: understanding positive list vs nominated list dynamics
- Certificate of Analysis (CoA) requirements: what must be on a CoA, supplier verification
- Supplier qualification: vendor audits, approved vendor lists, documentation
- Component testing requirements: identity testing, purity thresholds

**FDA Enforcement (Compounding-Specific)**
- Warning letters specific to compounding: insanitary conditions, cGMP violations, unapproved drugs
- Import alerts: what triggers them, how they affect outsourcing facilities
- Consent decrees in compounding context
- Compounding risk alerts: voluntary recalls, market withdrawals
- Section 503B registration revocations and suspensions

**State Board of Pharmacy (Compounding)**
- State-specific compounding permits and licenses: beyond standard pharmacy license
- Pharmacist-in-charge (PIC) requirements: qualifications, responsibilities, one PIC per location
- State inspection requirements: frequency, what inspectors look for, common deficiencies
- Continuing education for compounding: state CE requirements beyond base pharmacy CE
- Compounding for prescriber administration (office use): varies by state — note as primarily state-regulated

**Practice-Specific Compounding Applications**
- Hormone compounding / BHRT: testosterone, estradiol, progesterone, DHEA compounding; FDA's position on BHRT; practitioner guidelines
- Peptide compounding: BPC-157, TB-500, PT-141, CJC-1295 — FDA enforcement status, bulk drug list status, recent enforcement actions
- IV compounding: total parenteral nutrition (TPN), IV push medications, compatibility, hospital vs clinic use
- Dermatological compounding: topical pain, scar, skin lightening formulations; med spa applications
- Pain management compounding: topical analgesics, ketamine compounds, LDN (low-dose naltrexone)
- Weight management compounding: semaglutide and tirzepatide compounding controversy, FDA shortage designation, 503A vs 503B for GLP-1 analogs, recent FDA enforcement activity

---

## Output Format

Organize as a navigable tree using markdown heading levels:

```
## L1: [Domain Name] (`domain-code`)

### L2: [Subdomain Name] (`domain-code.subdomain`)

#### L3: [Area Name] (`domain-code.subdomain.area`)
- **Description:** ...
- **Classification signals:**
  - CFR: ...
  - Agency: ...
  - Keywords: [term] (Strong), [term] (Moderate), [term] (Weak) — [disambiguation if needed]
  - Statutes: ...
- **Cross-classification triggers:** ...
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | ... | ... |

##### L4: [Specific Topic] (`domain-code.subdomain.area.topic`)
- **Description:** ...
[same fields as L3]
```

Include L1 and L2 as headers for structural context (use codes from Session 4 output), but focus
the detailed metadata on L3 and deeper nodes.

Go to L5 or L6 where the regulatory content genuinely warrants that depth — e.g., the sterile
compounding cleanroom and PEC distinctions, or the specific USP chapter sub-requirements that
generate distinct regulatory documents. Do not add depth just to hit a node count target.

---

## Reference Material

Verify current regulatory text at these sources:

- **eCFR:** https://www.ecfr.gov/ — 21 CFR Parts 1, 4, 111, 200-299, 300-399, 600-699, 1271
- **FD&C Act Sections 503A and 503B** (21 U.S.C. §§ 353a, 353b)
- **USP Compounding Standards:** Chapters <795>, <797>, <800>, <825>
- **FDA Compounding guidance documents:** https://www.fda.gov/drugs/human-drug-compounding
- **DEA regulations for compounding:** 21 CFR Parts 1300-1321 (where compounding intersects with controlled substances — flag for cross-classification to Controlled Substances branch)
- **Cedar repo context:** See injected Session 4 output for L1/L2 taxonomy codes

---

## Cross-Classification Note

The Controlled Substances branch (Session 5-B) will need to reference the Compounding branch for
cross-classification consistency. When you define cross-classification triggers that point *toward*
the Controlled Substances branch (e.g., "entities mentioning compound + Schedule II drug should also
classify in `controlled-substances.*`"), define them precisely here so Session 5-B can reference them
for consistency.
