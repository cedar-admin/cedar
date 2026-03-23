# Cedar Classification Framework — Part 1, Session 8-C of 8
# Agency Mapping + openFDA Mapping + Implementation Reference

## About This Session

**Context from prior research sessions has been pre-injected above this prompt by the orchestrator.**
The injected context contains:
- **Session 8-A output** — CFR-to-domain mapping table for Titles 21 and 42
- **Session 8-B output** — CFR-to-domain mapping table for all remaining titles
- **Session 4 output** — L1/L2 domain taxonomy codes (for domain code reference)

Read all three injected outputs. Sessions 8-A and 8-B give you the complete CFR mapping context.
Session 4 gives you the L1/L2 taxonomy codes as anchors.

This is the **final sub-session** (8-C of 8) and the **final session of Part 1** overall.
Sessions 8-A and 8-B mapped CFR references to domain codes. This session produces three
non-CFR deliverables that complete the classification rules:
1. Agency-to-domain mapping table
2. openFDA-to-domain mapping table
3. Implementation reference (rule counts, SQL templates, gaps)

Do not research new regulatory content. This is a synthesis session — the information needed is
in the injected context plus your knowledge of which agencies produce which content types.

---

## Cedar Platform Context

Cedar ingests regulatory content from multiple source types:
- **eCFR / Federal Register**: entities have explicit CFR references → classified by Session 8-A/8-B tables
- **Federal Register notices and rules**: entities have `agencies` metadata → classified by Agency table (Deliverable 1)
- **openFDA API endpoints**: entities have dataset-specific structure → classified by openFDA table (Deliverable 2)
- **Web scraped content** (FDA guidance pages, DEA, state boards): mixed signal classification → primarily uses keywords + agency + CFR signals from the taxonomy sessions

The agency and openFDA mapping tables enable classification of entities that have clear agency provenance
but no CFR structural reference (e.g., a Federal Register notice from FDA with no CFR citation still maps
to `fda-regulation.*` if it's from CDER or CDRH).

---

## Deliverable 1: Agency-to-Domain Mapping Table

Map each federal agency (and relevant sub-agencies) to primary domain codes.

Use the **exact agency names as they appear in Federal Register metadata** and the openFDA API
(the `agency_names` field in Federal Register API responses). These names must be exact strings
because the classification engine does string matching.

### Table Format

| Agency Name (exact Federal Register metadata name) | Primary Domain Code | Secondary Domain Code(s) | Notes |
|---|---|---|---|

### Coverage Requirements

Include all agencies relevant to Cedar's practice types. Expected agencies include (verify names against
Federal Register API and add any not listed here):

**FDA agencies/sub-agencies:**
- Food and Drug Administration (top-level)
- Food and Drug Administration, Center for Drug Evaluation and Research (CDER)
- Food and Drug Administration, Center for Biologics Evaluation and Research (CBER)
- Food and Drug Administration, Center for Devices and Radiological Health (CDRH)
- Food and Drug Administration, Center for Tobacco Products (CTP) — low relevance
- Food and Drug Administration, Center for Veterinary Medicine (CVM) — low relevance
- Food and Drug Administration, Office of Regulatory Affairs (ORA)
- Food and Drug Administration, Office of Criminal Investigations (OCI)

**CMS and HHS:**
- Centers for Medicare and Medicaid Services (CMS)
- Office for Civil Rights (HHS) — HIPAA enforcement
- Office of the National Coordinator for Health Information Technology (ONC)
- Health Resources and Services Administration (HRSA)
- Substance Abuse and Mental Health Services Administration (SAMHSA)
- Office of Inspector General (HHS) — OIG fraud/abuse
- National Institutes of Health (NIH)
- Agency for Healthcare Research and Quality (AHRQ)

**DEA:**
- Drug Enforcement Administration (DEA)

**FTC:**
- Federal Trade Commission (FTC)

**OSHA/DOL:**
- Occupational Safety and Health Administration (OSHA)
- Employment and Training Administration (ETA) — FMLA, wage/hour
- Employee Benefits Security Administration (EBSA) — ERISA

**EPA:**
- Environmental Protection Agency (EPA)

**IRS/Treasury:**
- Internal Revenue Service (IRS)
- Department of the Treasury

**Other relevant agencies:**
- Federal Communications Commission (FCC) — telehealth technology
- Department of Veterans Affairs (VA)
- Department of Defense (DoD) / Defense Health Agency (TRICARE)
- Nuclear Regulatory Commission (NRC)

For each agency:
- **Primary Domain Code**: The domain that gets the highest volume of that agency's content
- **Secondary Domain Code(s)**: Up to 3 secondary domains the agency commonly touches
- **Notes**: Exceptions or special handling (e.g., "FDA-CDRH content mentioning 'software' should also classify in `telehealth.technology.*`")

---

## Deliverable 2: openFDA-to-Domain Mapping Table

Map each relevant openFDA API dataset (endpoint) and its product categories to domain codes.

### Table Format

| openFDA Dataset | Product Category or Filter | Primary Domain Code | Secondary Domain Code(s) | Notes |
|---|---|---|---|---|

### Column Definitions

- **openFDA Dataset**: The API endpoint name (e.g., `drug/nda`, `device/510k`, `drug/enforcement`)
- **Product Category or Filter**: If the dataset spans multiple domains, use specific product types or filters (e.g., for `drug/enforcement` — compounding violations vs. manufacturing violations)
- **Primary Domain Code**: Most specific applicable domain code
- **Secondary Domain Code(s)**: Additional domains
- **Notes**: Special classification logic or filter conditions

### openFDA Endpoints to Cover

Verify current endpoint list at https://open.fda.gov/apis/ and map each relevant dataset:

**Drug endpoints:**
- `drug/nda` — New Drug Applications
- `drug/anda` — Abbreviated NDAs (generic drugs)
- `drug/label` — Drug labeling (package inserts)
- `drug/enforcement` — Drug recalls and market withdrawals
- `drug/event` — Adverse drug events (FAERS)
- `drug/drugsfda` — Drugs@FDA (approval history)
- `drug/shortage` — Drug shortages (if available)
- `drug/rems` — REMS (if available as structured endpoint)

**Device endpoints:**
- `device/510k` — 510(k) clearances
- `device/pma` — PMA approvals
- `device/de_novo` — De Novo classifications
- `device/classification` — Device classification database
- `device/enforcement` — Device recalls
- `device/event` — Medical device adverse events (MAUDE)
- `device/udi` — Device UDI database
- `device/recall` — Device recalls (alternative endpoint)
- `device/registration` — Device establishment registrations

**Other endpoints:**
- `food/enforcement` — Food recalls (low relevance to practices)
- `other/nsde` — National Drug Code directory
- `other/substance` — Substance data
- `tobacco/problem` — Tobacco adverse events (low relevance)

For each endpoint:
- Map to the most specific applicable domain code from the taxonomy
- Note when the same endpoint needs different primary codes depending on content (e.g., `device/event` for aesthetic devices → `fda-regulation.device-regulation.aesthetic-devices` with High practice relevance, vs. general medical devices → `fda-regulation.device-regulation`)

---

## Deliverable 3: Implementation Reference

Provide a practical reference for the engineer building the `classification_rules` table.

### 3A. Rule Count Summary

Provide an aggregate count across Sessions 8-A, 8-B, and this session:

| Rule Type | Count | Notes |
|---|---|---|
| CFR mapping rows (Title 21) | [from 8-A] | |
| CFR mapping rows (Title 42) | [from 8-A] | |
| CFR mapping rows (all other titles) | [from 8-B] | |
| Agency mapping rows | [from this session] | |
| openFDA mapping rows | [from this session] | |
| **Total rule-based classification rules** | | |

**Estimated coverage:** What percentage of Cedar's regulatory entities can be classified by these
rules alone (Stage 1), without AI classification (Stage 2)?

Provide a reasoning-based estimate broken down by source type:
- eCFR entities (have explicit CFR references): ~X% coverable by CFR rules
- Federal Register documents (have agency metadata): ~X% coverable by agency rules
- openFDA API entities: ~X% coverable by openFDA rules
- Web scraped content (FDA guidance, state boards): ~X% coverable by rules (likely lowest)

### 3B. SQL Seed Data Template

Show how **10–15 representative mapping rows** translate to `INSERT` statements for Cedar's
`classification_rules` database table.

Use the following table schema (read from Cedar's existing migrations — check the injected context
or use this schema, whichever is more specific):

```sql
-- classification_rules table (approximate schema)
INSERT INTO classification_rules (
  source_type,      -- 'ecfr' | 'federal_register' | 'openfda' | 'agency'
  match_field,      -- 'cfr_reference' | 'agency_name' | 'dataset' | 'keyword'
  match_pattern,    -- the value to match against (CFR reference string, agency name, etc.)
  domain_code,      -- primary domain code
  secondary_domain_codes,  -- JSONB array of secondary codes, or NULL
  relevance_score,  -- 0.0-1.0
  rule_type,        -- 'structural' | 'agency' | 'dataset' | 'keyword'
  notes             -- optional notes
) VALUES (
  ...
);
```

Include representative examples from:
- At least 3 CFR-based rules (Title 21, Title 42, and one other title)
- At least 2 agency-based rules
- At least 2 openFDA dataset rules
- At least 1 rule with secondary domain codes
- At least 1 rule with a dynamic cross-classification note

### 3C. Gaps Requiring AI Fallback (Stage 2)

List the content areas where rule-based classification is **insufficient** and AI classification
(Stage 2 using Claude) will be needed:

| Gap Description | Affected Source Types | Recommended AI Prompt Focus | Priority |
|---|---|---|---|

**Categories of gaps to cover:**
1. **Mixed-domain parts:** CFR parts that genuinely span multiple domains (e.g., 42 CFR Part 1 covers both Medicare and Medicaid billing concepts)
2. **Context-dependent classification:** Parts/agencies where the correct domain code depends on the document's subject matter, not just its structural position
3. **Emerging regulatory areas:** Areas not yet codified in CFR (FDA guidance documents on novel technologies, DEA policy statements)
4. **State regulatory content:** All state board rules, state administrative codes — no CFR reference, agency-based rules may not exist
5. **Cross-classification that requires semantic understanding:** Entities that are structurally in one domain but functionally relevant to another (e.g., a CMS telehealth billing rule that also affects controlled substance prescribing via telehealth)
6. **Historical and enforcement content:** FDA warning letters and consent decrees — structure varies widely

For each gap, indicate:
- Which Cedar source types are most affected
- What the recommended AI prompt focus should be (what to ask Claude to determine)
- Priority: High (affects >20% of daily ingest volume), Medium (5-20%), Low (<5%)

---

## Output Format

```markdown
# Session 8-C: Agency Mapping + openFDA Mapping + Implementation Reference

## Deliverable 1: Agency-to-Domain Mapping Table
[table]

## Deliverable 2: openFDA-to-Domain Mapping Table
[table]

## Deliverable 3: Implementation Reference

### 3A. Rule Count Summary
[table]

### 3B. SQL Seed Data Template
[SQL blocks]

### 3C. Gaps Requiring AI Fallback
[table]
```

---

## Reference Material

- **Federal Register API** (for exact agency name strings): https://www.federalregister.gov/api/v1/agencies.json
- **openFDA API reference** (for endpoint names and fields): https://open.fda.gov/apis/
- **Sessions 8-A and 8-B** (injected): Complete CFR mapping tables — use for rule counts
- **Session 4** (injected): L1/L2 taxonomy codes
