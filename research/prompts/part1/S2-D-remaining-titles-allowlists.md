# Part 1, Session 2, Run 4: Part-Level Allowlists for Tier 3 Titles + Consolidated Summary

## Context

Cedar is an AI-powered regulatory intelligence SaaS platform for independent medical practices in Florida (expanding to all 50 states). Target practice types: Functional Medicine, Hormone Optimization/HRT, Compounding Pharmacy, Med Spa/Aesthetic Medicine, Weight Management, Peptide Therapy, IV Therapy/Infusion, Regenerative Medicine, Telehealth, Chiropractic, Integrative Medicine, Anti-Aging Medicine, Pain Management, and Primary Care (DPC/Concierge).

Cedar has ~99K unclassified entities from eCFR, Federal Register, and openFDA APIs. This is **Run 4 of 4** within Session 2 (of 8 total sessions). Session 1 classified all 50 CFR titles and provided chapter-level boundaries. **The Session 1 output is attached as a file upload — read it first.**

**Additionally, attach the outputs from Runs 1–3 as file uploads.** This run covers the remaining Tier 3 titles and produces the consolidated summary that requires data from all previous runs.

The combined output of all 8 sessions will be read by Claude Opus to produce an engineering implementation plan for Cedar's classification pipeline.

---

## Table Format (same for all titles)

| Chapter | Subchapter | Part Range | Part Description | Relevant? | Relevance Level | Cedar Practice Types Affected | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |

---

## Deliverable 1: Part-Level Allowlists for Tier 3 Mixed Titles

### Title 40 (Protection of Environment)

Session 1 identified two relevant subchapters out of ~15.

**Chapter I (EPA):**

- **Subchapter I (Solid Wastes, Parts 239–299):** Session 1 marked RELEVANT. Map key parts:
    - Part 260: Hazardous waste management system — general
    - Part 261: Identification and listing of hazardous waste — **defines which pharmaceutical/chemical wastes are hazardous**
    - Part 262: Standards applicable to generators of hazardous waste — **generator status, manifesting, accumulation**
    - Part 263: Standards for transporters
    - Part 264: Standards for TSDFs (treatment, storage, disposal facilities)
    - Part 265: Interim status standards for TSDFs
    - Part 266: Standards for management of specific hazardous wastes
    - Part 268: Land disposal restrictions
    - Part 270: EPA-administered permit programs
    - Part 273: Standards for universal waste — **batteries, mercury thermometers, pharmaceutical waste**
    - Part 274–299: Any remaining parts
    - Identify which parts apply to medical practice waste generators vs. only to waste management facilities.
- **Subchapter J (Superfund/EPCRA, Parts 300–399):** Session 1 marked RELEVANT. Map key parts:
    - Part 355: Emergency planning and notification (EPCRA §302–304)
    - Part 370: Hazardous chemical reporting: community right-to-know (EPCRA §311–312) — **chemical inventory for compounding pharmacies**
    - Part 372: Toxic chemical release reporting (TRI) — likely irrelevant for medical practices
    - Other parts in range
- **All other subchapters (A–H, K–U):** Session 1 marked IRRELEVANT. Confirm with brief listing.

**Chapters IV, VII, VIII, IX:** Session 1 marked IRRELEVANT. Confirm.

### Title 47 (Telecommunication)

**Chapter I (FCC):**

- **Subchapter A (General, Parts 0–19):** Session 1 marked AMBIGUOUS. Resolve:
    - Parts 6–7: Accessibility for persons with disabilities — relevant for telehealth platform compliance?
    - Other parts in range
- **Subchapter B (Common Carrier, Parts 20–69):** Session 1 marked RELEVANT. Map key parts:
    - Part 52: Numbering (number portability) — marginally relevant for practice phone systems
    - Part 54: Universal Service — **Subpart G: Rural Health Care Program** subsidizes broadband for rural providers
    - Part 64: Miscellaneous rules relating to common carriers — **§64.1200 (TCPA implementation) directly regulates robocalls, autodialed calls, prerecorded messages, text messages for patient outreach**
    - Part 68: Connection of terminal equipment to the telephone network
    - Other parts in range
- **Subchapters C–D and beyond:** Session 1 marked IRRELEVANT. Confirm.

**Chapters II–V:** Session 1 marked IRRELEVANT. Confirm.

### Title 28 (Judicial Administration)

**Chapter I (DOJ, Parts 0–299):**

- Part 35: ADA Title II (state/local government services) — relevant for government-affiliated practices
- Part 36: ADA Title III (public accommodations) — **directly mandates accessibility for medical offices, patient communications, telehealth platforms**
- Part 85: Civil monetary penalties adjustments (False Claims Act, other)
- All other parts (FOIA, foreign agents, prisons, classified info): IRRELEVANT

**Chapters III, V–IX, XI:** IRRELEVANT. Confirm briefly.

### Title 32 (National Defense)

**Part 199 (TRICARE/CHAMPUS):** Sole relevant content per Session 1. Map subparts:

- Subpart A: General provisions
- Subpart B: Provider participation/reimbursement
- Subpart C: Coverage
- Subpart D: Administration
- Identify which subparts are directly relevant to independent practice participation.

**All other parts:** IRRELEVANT. Confirm with brief listing of chapter structure.

### Title 38 (Pensions, Bonuses, and Veterans' Relief)

**Chapter I:**

- Part 2: Supplemental privacy rules for veteran patient records
- Part 17: VA healthcare delivery, **Veterans Community Care Program (MISSION Act)** — authorizes veterans to receive care from private providers
    - Map subparts if granular enough to distinguish community care provisions from VA-internal rules.
- All other parts in Chapter I: IRRELEVANT

**Chapter II (Armed Forces Retirement Home):** IRRELEVANT. Confirm.

### Title 20 (Employees' Benefits)

**Chapter III (SSA, Parts 400–499):**

- Part 404: Federal old-age, survivors, and disability insurance — **disability determination rules relevant for practices performing disability evaluations**
- Part 416: Supplemental security income
- Part 498: Civil monetary penalties, assessments, exclusions
- Other parts in range

**Chapter V (Employment and Training Administration):**

- Unemployment insurance (all employers) — identify specific parts
- H-1B visa programs — identify specific parts relevant to physician immigration

**All other chapters:** IRRELEVANT. Confirm.

### Title 49 (Transportation)

**Parts 171–180 (Hazardous Materials Regulations):**

- Part 171: General information, regulations, and definitions
- Part 172: Hazardous materials table, markings, labeling, placarding
- Part 173: Shippers — general requirements — **§173.197: Regulated medical waste packaging**
- Part 177: Carriage by public highway
- Part 178: Shipping container specifications
- Other parts in range
- Identify which parts directly impose obligations on medical practice waste shippers.

**All other parts:** IRRELEVANT. Confirm briefly.

### Title 10 (Energy)

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

## Deliverable 2: Consolidated Summary Table

Using data from Runs 1–3 (attached) plus this run's analysis, produce:

### Summary Table

| CFR Title | Classification | Total Parts in Title (approx) | Relevant Parts Count | Key Regulatory Areas for Cedar |
| --- | --- | --- | --- | --- |

Include all 50 titles (35 IRRELEVANT + 15 MIXED with part counts).

### Revised Filtering Estimate

Update the Session 1 estimate with part-level precision:

- Total relevant parts across all 15 mixed titles
- Estimated percentage of the 99K entities that survive both title-level AND part-level filtering
- Breakdown by source type:
    - **eCFR entities**: How many survive?
    - **Federal Register entities**: How many survive? (Note: FR documents should also be filterable by issuing agency — FDA, CMS, OSHA, FTC, DEA, OIG documents are retained regardless of title mapping)
    - **openFDA entities**: All presumed relevant (0% elimination from this source)
- Comparison to Session 1's original estimate of ~20,000–29,000 surviving entities

### Engineering-Ready Allowlist

Produce a flat list suitable for direct implementation:

```
RELEVANT_PARTS = {
    "title_21": [11, 50, 54, 56, 201, 202, ...],
    "title_42": [2, 3, 8, 10, 11, 400, 401, ...],
    "title_45": [46, 92, 144, 146, 147, 148, 149, 150, 160, 162, 164, 170, 171, 180, ...],
    ...
}
```

This dictionary will be consumed by the Opus engineering agent to build Cedar's classification pipeline.

---

## Verification Requirement

Use the eCFR website to verify part-level structure for each title:

- https://www.ecfr.gov/current/title-40
- https://www.ecfr.gov/current/title-47
- https://www.ecfr.gov/current/title-28
- https://www.ecfr.gov/current/title-32
- https://www.ecfr.gov/current/title-38
- https://www.ecfr.gov/current/title-20
- https://www.ecfr.gov/current/title-49
- https://www.ecfr.gov/current/title-10
- https://www.ecfr.gov/current/title-2

### Output Guidelines

- Resolve all AMBIGUOUS classifications into definitive RELEVANT or IRRELEVANT with reasoning
- For each relevant part, tag which of Cedar's 14 practice types are affected
- False negatives (excluding relevant content) are worse than false positives — when in doubt, include
- The consolidated summary and engineering-ready allowlist are the most critical outputs of this run — they synthesize all of Session 2
- Produce the Tier 3 title tables first, then the consolidated deliverables

### Reference Material

- eCFR website: https://www.ecfr.gov/
- Cedar repo: https://github.com/cedar-admin/cedar