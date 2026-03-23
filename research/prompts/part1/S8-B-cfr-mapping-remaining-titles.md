# Cedar Classification Framework — Part 1, Session 8-B of 8
# CFR-to-Domain Mapping: All Remaining Titles

## About This Session

**Context from prior research sessions has been pre-injected above this prompt by the orchestrator.**
The injected context contains:
- **Session 2-A output** — Title 21 allowlist (for reference only — do NOT re-map Title 21 here, it was done in Session 8-A)
- **Session 2-B output** — Title 42 allowlist (for reference only — Title 42 was mapped in Session 8-A)
- **Session 2-C output** — Part-level allowlists for Titles 45, 29, 26, 16
- **Session 2-D output** — Part-level allowlists for remaining Tier 3 titles
- **Session 4 output** — L1/L2 domain taxonomy codes
- **Session 5-A output** — Compounding branch domain codes (L3-L6)
- **Session 5-B output** — Controlled Substances branch domain codes (L3-L6)
- **Session 6-A output** — FDA Regulation branch domain codes (L3-L6)
- **Session 6-B output** — Telehealth branch domain codes (L3-L6)
- **Session 7-A output** — HIPAA & Privacy + Medicare & Billing domain codes (L3-L4)
- **Session 7-B output** — Fraud/Compliance + Operations + Safety + Employment domain codes (L3-L4)

Read all injected outputs. The allowlists from Sessions 2-C and 2-D give you the parts to map.
The taxonomy from Sessions 4-7 gives you the domain codes.

This is a **sub-session** (8-B of 8). **This session maps all CFR titles except 21 and 42** (which were
done in 8-A). Agency mapping, openFDA mapping, and implementation reference are in Session 8-C.

---

## Cedar Platform Context

Same as Session 8-A. This is Stage 1 (rule-based classification) of Cedar's classification pipeline.
Comprehensive CFR-to-domain mapping minimizes expensive AI classification fallthrough.

---

## Deliverable: CFR-to-Domain Mapping Table — All Remaining Titles

Map every relevant CFR part from the Session 2-C and 2-D allowlists for titles other than 21 and 42.

### Table Format (same as Session 8-A)

| CFR Title | Chapter | Subchapter | Part or Part Range | Specific Sections | Primary Domain Code | Secondary Domain Code(s) | Relevance Score | Notes |
|---|---|---|---|---|---|---|---|---|

### Column Definitions (same as Session 8-A)

- **CFR Title**: Number (45, 29, 26, 16, etc.)
- **Chapter**: Roman numeral or "—"
- **Subchapter**: Letter or "—"
- **Part or Part Range**: Single part or tight range with the same classification
- **Specific Sections**: List specific sections when a part has mixed content; otherwise "All"
- **Primary Domain Code**: Most specific applicable code from Sessions 4-7
- **Secondary Domain Code(s)**: Additional codes if cross-domain, comma-separated
- **Relevance Score** (0.0–1.0): 1.0 = definitional, 0.9 = very strong, 0.7-0.8 = strong, 0.5-0.6 = moderate, below 0.5 = omit
- **Notes**: Ambiguity, special handling, dynamic rules

---

## Section C: Title 45 — Public Welfare (HIPAA and Related)

Map at subpart level for HIPAA parts. Title 45 contains Cedar's highest-priority privacy regulations.

**Key parts to map (from Session 2-C allowlist):**

- **Part 46:** Human subjects protections (Common Rule) — research with human subjects, IRB requirements, informed consent → maps to clinical trials / FDA intersection
- **Part 160:** General administrative requirements — definitions, applicability, preemption of state law
- **Part 162:** Administrative requirements — HIPAA transactions (EDI), code sets, national identifiers (NPI, EIN) → maps to Medicare & Billing / practice operations
- **Part 164 Subpart A:** General provisions — definitions, scope
- **Part 164 Subpart C:** Security standards → `hipaa-privacy.security-rule`
- **Part 164 Subpart D:** Notification in case of breach → `hipaa-privacy.breach-notification`
- **Part 164 Subpart E:** Privacy of individually identifiable health information → `hipaa-privacy.privacy-rule`
- **Part 171:** Health information technology — information blocking (21st Century Cures Act) → `hipaa-privacy.information-blocking`

Also map any other Title 45 parts in the Session 2-C allowlist.

---

## Section D: Title 29 — Labor (OSHA, ERISA, FMLA)

Map at the **section level** for Part 1910 (individual sections have different domain codes).

**Key areas from Session 2-C allowlist:**

**Part 1910 — General Industry Standards (OSHA):**
Provide individual rows for each relevant section:
- § 1910.1030 (bloodborne pathogens)
- § 1910.1200 (hazard communication / GHS)
- § 1910.1096 (ionizing radiation)
- § 1910.134 (respiratory protection)
- § 1910.1020 (employee exposure and medical records)
- Any other sections on the Session 2-C allowlist

**Part 1904 — OSHA Recordkeeping:**
Single row for the entire part → `workplace-safety.osha.recordkeeping`

**ERISA parts (if on allowlist):**
Map to `employment-tax.*` or `medicare-billing.*` as appropriate (ERISA group health plan provisions)

**FMLA regulations (29 CFR Part 825, if on allowlist):**
Map to `employment-tax.employment.fmla`

---

## Section E: Title 26 — Internal Revenue (Healthcare Tax)

**Key parts from Session 2-C allowlist:**
- Healthcare tax regulations (Section 125 cafeteria plans, HSA, ACA employer mandate, COBRA, QBI) → `employment-tax.healthcare-tax.*`
- Excise tax on high-cost employer health plans (Cadillac tax) if applicable
- Tax-exempt organization requirements (501(c)(3) regulations) if on allowlist

---

## Section F: Title 16 — Commercial Practices (FTC)

**Key parts from Session 2-C allowlist:**
- FTC health claims regulations (dietary supplements, OTC drugs)
- FTC Safeguards Rule (data security for financial institutions — limited healthcare relevance but sometimes in allowlist)
- FTC endorsement and testimonial rules → `fda-regulation.advertising-promotion.*`

---

## Section G: All Remaining Tier 3 Titles (from Session 2-D)

Map every part from the Session 2-D allowlist. These are Tier 3 titles — lower overall healthcare
relevance, but specific parts may map cleanly to Cedar domains. Expected titles include some or all of:

- **Title 47 (FCC):** Telehealth technology standards, broadband accessibility → `telehealth.technology-platforms.*`
- **Title 28 (DOJ):** ADA regulations (Part 36 for public accommodations) → `employment-tax.employment.ada` or practice operations
- **Title 32 (Defense):** TRICARE regulations, military healthcare → `medicare-billing.*` (TRICARE administered similarly)
- **Title 38 (Veterans Affairs):** VA healthcare, VA telehealth programs → `telehealth.*` or `medicare-billing.*`
- **Title 20 (Social Security):** SSA disability determinations, Medicare enrollment → `medicare-billing.provider-enrollment.*`
- **Title 49 (Transportation):** DOT drug testing (CDL/safety-sensitive employees) → `controlled-substances.*`
- **Title 10 (Energy):** NRC radioactive materials, nuclear medicine → `workplace-safety.environmental.*`
- **Title 40 (EPA):** RCRA pharmaceutical waste disposal → `workplace-safety.environmental.pharmaceutical-waste`
- **Title 2 (Grants):** Federal grant administration (research grants) → `fda-regulation.clinical-trials.*`

**Important:** Only include parts that appear in Session 2-D's allowlist. Do not add parts Session 2
did not identify as relevant.

If Session 2-D's allowlist is unavailable or incomplete (due to P1_S2-D's blocked status at time of
review), note which titles could not be mapped and flag them for future completion once P1_S2-D is done.

---

## End-of-Table Notes

After the mapping table:

**Titles not covered in this session:** Remind readers that Titles 21 and 42 were mapped in Session 8-A.

**Parts not cleanly mappable (require AI classification):**
List any parts across all remaining titles that don't map cleanly to a domain code. These become
explicit AI fallback cases with suggested domain codes.

**Missing allowlist data (if Session 2-D was unavailable):**
Note which Tier 3 titles could not be mapped due to blocked P1_S2-D, and estimate which titles are
most important to prioritize when the block is resolved.

---

## Reference Material

- **eCFR:** https://www.ecfr.gov/ — verify current part structure for all titles
- **Title 45:** https://www.ecfr.gov/current/title-45
- **Title 29:** https://www.ecfr.gov/current/title-29
- **Title 26:** https://www.ecfr.gov/current/title-26
- **Session 2-C output** (injected): Title 45, 29, 26, 16 allowlists
- **Session 2-D output** (injected): Remaining Tier 3 title allowlists
- **Sessions 4-7 outputs** (injected): All domain codes
