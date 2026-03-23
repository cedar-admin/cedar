# Cedar Classification Framework — Part 1, Session 8-A of 8
# CFR-to-Domain Mapping: Titles 21 and 42

## About This Session

**Context from prior research sessions has been pre-injected above this prompt by the orchestrator.**
The injected context contains:
- **Session 2-A output** — Part-level allowlist for Title 21 (all relevant FDA + DEA parts)
- **Session 2-B output** — Part-level allowlist for Title 42 (all relevant CMS, OIG, PHS parts)
- **Session 2-C output** — Part-level allowlists for Titles 45, 29, 26, 16 (for reference — do NOT map these here, they are for Session 8-B)
- **Session 2-D output** — Part-level allowlists for remaining Tier 3 titles (for reference only — do NOT map here)
- **Session 4 output** — L1/L2 domain taxonomy codes
- **Session 5-A output** — Compounding branch domain codes (L3-L6)
- **Session 5-B output** — Controlled Substances branch domain codes (L3-L6)
- **Session 6-A output** — FDA Regulation branch domain codes (L3-L6)
- **Session 6-B output** — Telehealth branch domain codes (L3-L6)
- **Session 7-A output** — HIPAA & Privacy + Medicare & Billing domain codes (L3-L4)
- **Session 7-B output** — Fraud/Compliance + Operations + Safety + Employment domain codes (L3-L4)

Read all injected outputs directly. The allowlists from Sessions 2-A and 2-B give you every CFR part
that must have a mapping row. The taxonomy from Sessions 4-7 gives you the domain codes to map to.

This is a **sub-session** (8-A of 8). Session 8 was split because the full CFR mapping + agency mapping +
implementation reference was too large for a single session. **This session maps Titles 21 and 42 only.**
Remaining titles are in Session 8-B. Agency mapping, openFDA mapping, and implementation reference are in Session 8-C.

---

## Cedar Platform Context

Cedar is an AI-powered regulatory monitoring platform for independent medical practices. This mapping
table is the core lookup for **Stage 1 (rule-based classification)** of Cedar's classification pipeline.
Every regulatory entity with a CFR reference gets classified by table lookup before any AI classification
runs. Gaps in this table mean entities fall through to expensive AI classification stages.

The classification pipeline works as follows:
1. **Stage 1 (rule-based):** Look up CFR reference → assign domain code from this table. Fast and cheap.
2. **Stage 2 (AI-assisted):** Entities without a CFR match, or with ambiguous matches, go to Claude for classification. Expensive.

Your goal: minimize Stage 2 fallthrough by providing comprehensive, accurate Stage 1 rules.

---

## Deliverable: CFR-to-Domain Mapping Table — Titles 21 and 42

Produce mapping rows for **every relevant CFR part** from Titles 21 and 42 that appears in the Session
2-A and 2-B allowlists. Do not skip rows. Do not abbreviate for brevity.

### Table Format

| CFR Title | Chapter | Subchapter | Part or Part Range | Specific Sections | Primary Domain Code | Secondary Domain Code(s) | Relevance Score | Notes |
|---|---|---|---|---|---|---|---|---|

### Column Definitions

- **CFR Title**: Number (21 or 42)
- **Chapter**: Roman numeral (I = FDA, II = DEA for Title 21; I = PHS, IV = CMS, V = OIG for Title 42) or "—"
- **Subchapter**: Letter designation (e.g., A, B, C, H) or "—"
- **Part or Part Range**: Single part (e.g., "493") or tight range with the same classification (e.g., "410-411"). Do not group parts with different classifications.
- **Specific Sections**: If only certain sections within a part are relevant, list them. Otherwise "All". Example: for 29 CFR 1910, you would list "1910.1030, 1910.1200" (but those are in Title 29, not here — same principle applies when a Title 21 or 42 part has mixed content).
- **Primary Domain Code**: The single most specific domain code from Sessions 4-7. Use dot-notation (e.g., `compounding.503a.patient-specific`). Choose the deepest applicable code — don't use L1 codes when an L3 code applies.
- **Secondary Domain Code(s)**: Additional domain codes if this part crosses domains, comma-separated. Empty if single-domain.
- **Relevance Score** (0.0–1.0):
  - **1.0** = Definitionally within this domain (e.g., 21 CFR Part 1306 → `controlled-substances.prescribing`)
  - **0.9** = Very strong match, minimal off-topic content
  - **0.7–0.8** = Strong match, some off-topic content within this part
  - **0.5–0.6** = Moderate match, content split across domains
  - **Below 0.5** = Do not include — these should go to AI classification
- **Notes**: Flag ambiguity, special handling, or dynamic rules (e.g., "Parts mentioning 'telehealth' should also map to `telehealth.*`")

### Granularity Rules

1. **One row per distinct classification target.** Parts with the same primary domain can share a row as a range (e.g., "1301-1305" if they all map to `controlled-substances.registration`). Parts with different primary domains need separate rows.
2. **Go to subpart or section level when a part has mixed content.** For example, 42 CFR Part 2 maps differently from 42 CFR Part 411 — give each its own row.
3. **Every part from the Session 2-A and 2-B allowlists must appear.** If a part doesn't cleanly map, include it with a Relevance Score of 0.5-0.6 and a note: "Ambiguous — suggested domain: `[best guess]` — recommend AI classification."
4. **Do not add parts not in the Session 2-A or 2-B allowlists** unless you identify an obvious omission that Session 2 missed (note these separately at the end).

---

## Section A: Title 21 — Food and Drugs

Map every relevant part from the Session 2-A allowlist. Title 21 is expected to be the largest section.

Use the Session 2-A allowlist as your primary source for which parts to include. Verify current part
structure at eCFR (https://www.ecfr.gov/).

**Key chapters and subchapters to cover:**

**Chapter I — FDA:**
- Subchapter A: General provisions (Parts 1-99) — administrative, import/export, generally low relevance to practices
- Subchapter B: Food (Parts 100-199) — only dietary supplement parts are relevant (Parts 101, 111, 190)
- Subchapter C: Drugs — General (Parts 200-299) — labeling, CGMPs for finished pharmaceuticals, NDAs, compounding
- Subchapter D: Drugs for Human Use (Parts 300-399) — specific drug applications, bioavailability, controlled substances (Parts 300-314)
- Subchapter F: Biologics (Parts 600-699) — BLAs, establishment standards, blood products, HCT/Ps (Part 1271 is in Subchapter L)
- Subchapter G: Cosmetics (Parts 700-799) — cosmetic ingredients, labeling, MoCRA implementation
- Subchapter H: Medical Devices (Parts 800-899) — device classification, 510(k), PMA, MDR, UDI, labeling
- Subchapter J: Radiological Health (Parts 1000-1099) — radiation-emitting electronic products (laser standards Part 1040)
- Subchapter L: Regulations Under Certain Other Acts (Parts 1270-1299) — HCT/Ps (Part 1271), online pharmacies (Part 1272)

**Chapter II — DEA:**
- Parts 1300-1321: All DEA regulations — registration, schedules, prescriptions, records, disposal, EPCS, import/export

---

## Section B: Title 42 — Public Health

Map every relevant part from the Session 2-B allowlist. Title 42 is expected to be the second-largest section.

**Key chapters to cover:**

**Chapter I — Public Health Service:**
- Part 2: Substance use disorder records (42 CFR Part 2) — maps to HIPAA/privacy with special note
- Other PHS parts on the allowlist (Parts 50-100 range — public health services, human subjects, conflict of interest, etc.)

**Chapter IV — CMS:**
- Parts 400-403: General Medicare/Medicaid provisions
- Parts 405-426: Medicare Part A and B coverage and payment — provider conditions, coverage rules, billing
- Parts 430-456: Medicaid — state plans, eligibility, provider requirements
- Parts 460-498: Special programs — PACE, CLIA (Part 493), conditions of participation, End Stage Renal Disease, home health, hospice
- Parts 510+: CMMI models, accountable care, other programs
- Note: CMS chapters are dense — use the Session 2-B allowlist to identify which parts were flagged as relevant

**Chapter V — OIG:**
- Parts 1000-1008: OIG exclusions (Part 1001), OIG advisory opinions, CMPs (Part 1003), fraud and abuse (Part 1008)

---

## End-of-Table Notes

After the mapping table, add a brief section:

**Omissions from Session 2-A/B Allowlists (if any):**
If you identify significant Title 21 or 42 parts not included in Session 2's allowlists that clearly
should be included, list them here with suggested domain codes. This flags gaps in the allowlist for
future review.

**Parts requiring dynamic cross-classification (beyond what the table captures):**
List any Title 21 or 42 parts where text content (not just CFR reference) should trigger additional
domain codes. Example: "21 CFR Part 330 (OTC monographs) — when a monograph mentions a specific OTC
product used in compounding contexts, also classify in `compounding.*`."

---

## Reference Material

- **eCFR Title 21:** https://www.ecfr.gov/current/title-21
- **eCFR Title 42:** https://www.ecfr.gov/current/title-42
- **Session 2-A output** (injected): Title 21 part-level allowlist
- **Session 2-B output** (injected): Title 42 part-level allowlist
- **Sessions 4-7 outputs** (injected): All domain codes
