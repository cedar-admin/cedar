# Part 1, Session 2-E: Part-Level Allowlists for Tier 3 Titles Group 2

## About This Session

**Context from prior research sessions has been pre-injected above this prompt by the orchestrator.**
The injected context contains the **Session 1 output** (CFR title classification — which titles are
relevant/mixed/irrelevant, with chapter-level boundaries).

This is a **sub-session** (2-E within Session 2). The original Session 2-D was split because 9 Tier 3
titles plus consolidated deliverables exceeded output quality thresholds. **This session covers 4 titles:**
Titles 20 (SSA), 49 (DOT), 10 (NRC), 2 (Grants). Titles 40, 47, 28, 32, 38 are in Session 2-D.
The consolidated summary is in Session 2-F.

---

## Cedar Platform Context

Cedar is an AI-powered regulatory intelligence SaaS platform for independent medical practices in
Florida (expanding to all 50 states). Target practice types: Functional Medicine, Hormone Optimization/HRT,
Compounding Pharmacy, Med Spa/Aesthetic Medicine, Weight Management, Peptide Therapy, IV Therapy/Infusion,
Regenerative Medicine, Telehealth, Chiropractic, Integrative Medicine, Anti-Aging Medicine, Pain Management,
and Primary Care (DPC/Concierge).

Cedar has ~99K unclassified entities from eCFR, Federal Register, and openFDA APIs. Session 1 classified
all 50 CFR titles and provided chapter-level boundaries. This session drills down to part-level for
Tier 3 titles — titles with mixed relevance where only specific parts matter to Cedar's practices.

The combined output of all 8 Part 1 sessions will be read by Claude Opus to produce an engineering
implementation plan for Cedar's classification pipeline.

---

## Table Format (same for all titles)

| Chapter | Subchapter | Part Range | Part Description | Relevant? | Relevance Level | Cedar Practice Types Affected | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |

---

## Deliverable: Part-Level Allowlists for 4 Tier 3 Titles

### Title 20 (Employees' Benefits)

**Chapter III (SSA, Parts 400-499):**

- Part 404: Federal old-age, survivors, and disability insurance — **disability determination rules relevant for practices performing disability evaluations**
- Part 416: Supplemental security income
- Part 498: Civil monetary penalties, assessments, exclusions
- Other parts in range

**Chapter V (Employment and Training Administration):**

- Unemployment insurance (all employers) — identify specific parts
- H-1B visa programs — identify specific parts relevant to physician immigration

**All other chapters:** IRRELEVANT. Confirm.

### Title 49 (Transportation)

**Parts 171-180 (Hazardous Materials Regulations):**

- Part 171: General information, regulations, and definitions
- Part 172: Hazardous materials table, markings, labeling, placarding
- Part 173: Shippers — general requirements — **Section 173.197: Regulated medical waste packaging**
- Part 177: Carriage by public highway
- Part 178: Shipping container specifications
- Other parts in range
- Identify which parts directly impose obligations on medical practice waste shippers.

**Part 382 and Part 40:** DOT drug and alcohol testing programs for safety-sensitive employees. Relevant
if practices employ CDL holders or have employees subject to DOT testing requirements.

**All other parts:** IRRELEVANT. Confirm briefly.

### Title 10 (Energy)

**Chapter I (NRC):**

- Part 19: Notices, instructions, and reports to workers
- Part 20: Standards for protection against radiation — **dose limits, monitoring, waste disposal for radioactive materials**
- Part 30: Rules of general applicability to domestic licensing of byproduct material
- Part 35: Medical use of byproduct material — **licensing, authorized users, radiation safety officers**
- Other parts if relevant to medical radiation use
- Note: Florida is an NRC Agreement State.

**All other parts:** IRRELEVANT. Confirm briefly.

### Title 2 (Grants and Agreements)

- Part 200: Uniform Administrative Requirements, Cost Principles, and Audit Requirements for Federal Awards (Uniform Guidance) — relevant only if practice receives federal grants
- Chapter III (HHS) specific provisions
- All other chapters: IRRELEVANT

---

## Output Guidelines

- Resolve all AMBIGUOUS classifications into definitive RELEVANT or IRRELEVANT with reasoning
- For each relevant part, tag which of Cedar's 14 practice types are affected
- False negatives (excluding relevant content) are worse than false positives — when in doubt, include
- Produce the table for each title with full part-level detail

## Verification Requirement

Use the eCFR website to verify part-level structure for each title:

- https://www.ecfr.gov/current/title-20
- https://www.ecfr.gov/current/title-49
- https://www.ecfr.gov/current/title-10
- https://www.ecfr.gov/current/title-2

### Reference Material

- eCFR website: https://www.ecfr.gov/
- Session 1 output (injected above): CFR title classification with chapter-level boundaries
