# Cedar Classification Framework — Part 1, Session 8 of 8

# CFR-to-Domain Mapping Table: Exhaustive Part-Level Classification Rules

## Context

Cedar is an AI-powered regulatory monitoring platform for independent medical practices. This is **Session 8 of 8** — the final deliverable. Sessions 1-3 produced relevance filters. Sessions 4-7 produced the complete domain taxonomy. This session maps every relevant CFR structural position to one or more domains from that taxonomy.

This mapping table is the core lookup for **Stage 1 (rule-based classification)** of Cedar's classification pipeline. Every entity with a CFR reference gets classified by table lookup before any AI classification runs. Gaps in this table mean entities fall through to expensive AI stages.

The combined output of all 8 sessions will be read by Claude Opus to produce an engineering implementation plan.

### Prior Session Outputs

This session requires outputs from Sessions 2, 4, 5, 6, and 7. **Attach all five output files as file uploads alongside this prompt:**

- `02-part-level-filtering.md` (Session 2 — the complete part-level allowlist; every part listed here needs a mapping row)
- `04-taxonomy-L1-L2.md` (Session 4 — L1/L2 domain codes)
- `05-compounding-controlled-substances.md` (Session 5 — Compounding and Controlled Substances domain codes)
- `06-fda-telehealth.md` (Session 6 — FDA Regulation and Telehealth domain codes)
- `07-remaining-branches.md` (Session 7 — all remaining domain codes)

The research agent should read all five attached files to get the complete list of relevant CFR parts (from Session 2) and the complete set of domain codes at every level (from Sessions 4-7) needed to build the mapping table.

---

## Deliverable 1: CFR-to-Domain Mapping Table

Produce a mapping table with **one row for every relevant CFR part or tight part range** that shares a single classification. Do not skip rows. Do not abbreviate for brevity.

### Table Format

| CFR Title | Chapter | Subchapter | Part or Part Range | Specific Sections (if only partial part is relevant) | Primary Domain Code | Secondary Domain Code(s) | Relevance Score | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

### Column Definitions

- **CFR Title**: Number (e.g., 21, 42, 45)
- **Chapter**: Roman numeral (e.g., I, II, IV) or "—"
- **Subchapter**: Letter (e.g., A, B, C) or "—"
- **Part or Part Range**: Single part (e.g., "493") or tight range with same classification (e.g., "410-411")
- **Specific Sections**: If only certain sections within a part are relevant, list them (e.g., "1910.1030, 1910.1200"). Otherwise "All"
- **Primary Domain Code**: The most specific domain code from the taxonomy
- **Secondary Domain Code(s)**: Additional domains, comma-separated. Empty if single-domain.
- **Relevance Score** (0.0-1.0):
    - **1.0** = Definitionally within this domain (e.g., 45 CFR 164 Subpart E → `hipaa-privacy.privacy-rule`)
    - **0.9** = Very strong match
    - **0.7-0.8** = Strong match, occasional off-topic content within this part
    - **0.5-0.6** = Moderate match, content is split across domains
    - **Below 0.5** = Do not include; these entities should go to AI classification
- **Notes**: Flag ambiguity, special handling, or dynamic cross-classification rules (e.g., "Entities in this part mentioning telehealth should also map to `telehealth.*`")

### Granularity Rules

1. **One row per distinct classification target.** If Parts 410 and 411 both map to `medicare-billing.coverage.part-b`, they can share a row as "410-411". If Part 410 maps to `medicare-billing.coverage.part-b` and Part 414 maps to `medicare-billing.fee-schedules`, they need separate rows.
2. **Go to section level when parts are mixed.** For Part 1910, individual sections map to different domains (1910.1030 → bloodborne pathogens, 1910.1200 → hazard communication). These need separate rows at the section level.
3. **Every part from Session 2's allowlist must appear.** If a part doesn't cleanly map to any domain, include it with a note: "Requires AI classification — suggested domain: `[best guess]`"

---

### Section A: Title 21 — Food and Drugs

Map every relevant part from the Session 2 allowlist. Expected to be the largest section of the table.

**Chapter I (FDA):**

- Subchapter A: General provisions
- Subchapter B: Food (only dietary supplement parts)
- Subchapter C: Drugs — General (Parts 200-299)
- Subchapter D: Drugs for Human Use (Parts 300-399)
- Subchapter F: Biologics (Parts 600-699)
- Subchapter G: Cosmetics (Parts 700-799)
- Subchapter H: Medical Devices (Parts 800-899)
- Subchapter J: Radiological Health (Parts 1000-1099)

**Chapter II (DEA):**

- Every part in the 1300-1321 range

---

### Section B: Title 42 — Public Health

Map every relevant part. Expected to be the second-largest section.

**Chapter I (Public Health Service):**

- Part 2 (substance abuse records)
- Other relevant PHS parts

**Chapter IV (CMS):**

- Parts 400-403 (general provisions)
- Parts 405-426 (Medicare)
- Parts 430-456 (Medicaid)
- Parts 460-498 (special programs, conditions of participation, CLIA)
- Parts 510+ (additional programs)

**Chapter V (OIG):**

- Parts 1000-1008 (fraud, abuse, exclusions)

---

### Section C: Title 45 — Public Welfare (HIPAA)

Map Parts 160-164 at the subpart level:

- Part 160: General administrative requirements
- Part 162: Administrative requirements (transactions, code sets)
- Part 164 Subpart A: General provisions
- Part 164 Subpart C: Security standards
- Part 164 Subpart D: Breach notification
- Part 164 Subpart E: Privacy of individually identifiable health information

Also map Part 46 (human subjects) and any other relevant parts.

---

### Section D: Title 29 — Labor (OSHA)

Map at the section level for Part 1910:

- 1910.1030 (bloodborne pathogens)
- 1910.1200 (hazard communication)
- 1910.1096 (ionizing radiation)
- 1910.134 (respiratory protection)
- 1910.1020 (employee exposure records)
- Other relevant sections

Also map Part 1904 (recordkeeping) and ERISA parts.

---

### Section E: All Other Relevant Titles

Map every remaining relevant part from Titles 5, 15, 16, 20, 26, 27, 28, 34, 38, 40, 44, 47 (or whichever titles Sessions 1-2 identified as relevant/mixed).

---

## Deliverable 2: Agency-to-Domain Mapping Table

Map each agency from Session 3's relevance map to primary domains:

| Agency Name (exact Federal Register metadata name) | Primary Domain Code | Secondary Domain Code(s) | Notes |
| --- | --- | --- | --- |

---

## Deliverable 3: openFDA-to-Domain Mapping Table

Map each relevant openFDA dataset/category to domains:

| openFDA Dataset | Product Category or Filter | Primary Domain Code | Secondary Domain Code(s) | Notes |
| --- | --- | --- | --- | --- |

---

## Deliverable 4: Implementation Reference

Produce a summary that an implementation engineer can use to build the classification rules:

### Rule Count Summary

- Total CFR mapping rows: [count]
- Total agency mapping rows: [count]
- Total openFDA mapping rows: [count]
- Estimated coverage: what % of relevant entities can be classified by these rules alone (without AI)?

### SQL Seed Data Template

Show how a representative sample of 5-10 rows translates to INSERT statements for `classification_rules`:

```sql
-- Example: HIPAA Privacy Rule
INSERT INTO classification_rules (
  source_type, match_field, match_pattern,
  domain_code, secondary_domain_codes,
  relevance_score, rule_type, notes
) VALUES (
  'ecfr', 'cfr_reference', 'Title 45, Part 164, Subpart E',
  'hipaa-privacy.privacy-rule', NULL,
  1.0, 'structural', 'HIPAA Privacy Rule — definitional match'
);

-- Example: DEA Prescribing
INSERT INTO classification_rules (
  source_type, match_field, match_pattern,
  domain_code, secondary_domain_codes,
  relevance_score, rule_type, notes
) VALUES (
  'ecfr', 'cfr_reference', 'Title 21, Part 1306',
  'controlled-substances.prescribing', NULL,
  1.0, 'structural', 'DEA prescribing regulations'
);
```

### Gaps and AI Fallback

List any CFR parts or content areas where rule-based classification is insufficient and AI classification (Stage 2) will be needed. Describe what makes these areas ambiguous.

---

## Reference Material

- eCFR: https://www.ecfr.gov/ — verify part/section structure
- Federal Register API: https://www.federalregister.gov/api/v1/ — verify agency names
- openFDA: https://open.fda.gov/apis/ — verify dataset names and categories
- Cedar repo: https://github.com/cedar-admin/cedar — read `CLAUDE.md`, `supabase/migrations/` (022-027 for schema), `inngest/corpus-classify.ts` for existing rules