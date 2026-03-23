# Part 1, Session 2-D: Part-Level Allowlists for Tier 3 Titles Group 1

## About This Session

**Context from prior research sessions has been pre-injected above this prompt by the orchestrator.**
The injected context contains the **Session 1 output** (CFR title classification — which titles are
relevant/mixed/irrelevant, with chapter-level boundaries).

This is a **sub-session** (2-D within Session 2). The original Session 2-D was split because 9 Tier 3
titles plus consolidated deliverables exceeded output quality thresholds. **This session covers 5 titles:**
Titles 40 (EPA), 47 (FCC), 28 (DOJ), 32 (DoD), 38 (VA). Titles 20, 49, 10, 2 are in Session 2-E.
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

## Deliverable: Part-Level Allowlists for 5 Tier 3 Titles

### Title 40 (Protection of Environment)

Session 1 identified two relevant subchapters out of ~15.

**Chapter I (EPA):**

- **Subchapter I (Solid Wastes, Parts 239-299):** Session 1 marked RELEVANT. Map key parts:
    - Part 260: Hazardous waste management system — general
    - Part 261: Identification and listing of hazardous waste — **defines which pharmaceutical/chemical wastes are hazardous**
    - Part 262: Standards applicable to generators of hazardous waste — **generator status, manifesting, accumulation**
    - Part 263: Standards for transporters
    - Part 264: Standards for TSDFs (treatment, storage, disposal facilities)
    - Part 265: Interim status standards for TSDFs
    - Part 266: Standards for management of specific hazardous wastes — **Subpart P: Hazardous Waste Pharmaceuticals Rule**
    - Part 268: Land disposal restrictions
    - Part 270: EPA-administered permit programs
    - Part 273: Standards for universal waste — **batteries, mercury thermometers, pharmaceutical waste**
    - Part 274-299: Any remaining parts
    - Identify which parts apply to medical practice waste generators vs. only to waste management facilities.
- **Subchapter J (Superfund/EPCRA, Parts 300-399):** Session 1 marked RELEVANT. Map key parts:
    - Part 355: Emergency planning and notification (EPCRA Section 302-304)
    - Part 370: Hazardous chemical reporting: community right-to-know (EPCRA Section 311-312) — **chemical inventory for compounding pharmacies**
    - Part 372: Toxic chemical release reporting (TRI) — likely irrelevant for medical practices
    - Other parts in range
- **All other subchapters (A-H, K-U):** Session 1 marked IRRELEVANT. Confirm with brief listing.

**Chapters IV, VII, VIII, IX:** Session 1 marked IRRELEVANT. Confirm.

### Title 47 (Telecommunication)

**Chapter I (FCC):**

- **Subchapter A (General, Parts 0-19):** Session 1 marked AMBIGUOUS. Resolve:
    - Parts 6-7: Accessibility for persons with disabilities — relevant for telehealth platform compliance?
    - Other parts in range
- **Subchapter B (Common Carrier, Parts 20-69):** Session 1 marked RELEVANT. Map key parts:
    - Part 52: Numbering (number portability) — marginally relevant for practice phone systems
    - Part 54: Universal Service — **Subpart G: Rural Health Care Program** subsidizes broadband for rural providers
    - Part 64: Miscellaneous rules relating to common carriers — **Section 64.1200 (TCPA implementation) directly regulates robocalls, autodialed calls, prerecorded messages, text messages for patient outreach**
    - Part 68: Connection of terminal equipment to the telephone network
    - Other parts in range
- **Subchapters C-D and beyond:** Session 1 marked IRRELEVANT. Confirm.

**Chapters II-V:** Session 1 marked IRRELEVANT. Confirm.

### Title 28 (Judicial Administration)

**Chapter I (DOJ, Parts 0-299):**

- Part 35: ADA Title II (state/local government services) — relevant for government-affiliated practices
- Part 36: ADA Title III (public accommodations) — **directly mandates accessibility for medical offices, patient communications, telehealth platforms**
- Part 85: Civil monetary penalties adjustments (False Claims Act, other)
- All other parts (FOIA, foreign agents, prisons, classified info): IRRELEVANT

**Chapters III, V-IX, XI:** IRRELEVANT. Confirm briefly.

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

---

## Output Guidelines

- Resolve all AMBIGUOUS classifications into definitive RELEVANT or IRRELEVANT with reasoning
- For each relevant part, tag which of Cedar's 14 practice types are affected
- False negatives (excluding relevant content) are worse than false positives — when in doubt, include
- Produce the table for each title with full part-level detail

## Verification Requirement

Use the eCFR website to verify part-level structure for each title:

- https://www.ecfr.gov/current/title-40
- https://www.ecfr.gov/current/title-47
- https://www.ecfr.gov/current/title-28
- https://www.ecfr.gov/current/title-32
- https://www.ecfr.gov/current/title-38

### Reference Material

- eCFR website: https://www.ecfr.gov/
- Session 1 output (injected above): CFR title classification with chapter-level boundaries
