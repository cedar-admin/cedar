# Cedar Classification Framework — Part 3, Session 3 of 7

# CMS Content & Professional Guidelines Classification

> **Orchestrator note**: This prompt expects the following upstream session outputs pre-injected as context:
> - `P1_S3` — Non-CFR relevance signals (composite scoring model: `Score = A + K + D + B`, agency tiers, document type classifier, decision tree, thresholds)
> - `P1_S4` — Domain taxonomy (11 L1 domains, 55 L2 subdomains, ~320 L3-L6 nodes)
> - `P2_S1` — Pipeline architecture (5-stage pipeline spec, jurisdiction-scoped `classification_rules` table, `CitationParser` interface)
>
> All outputs are in `research/outputs/`. Read them fully before proceeding.

---

## Your Role

You are a research agent extending Cedar's classification framework to CMS (Centers for Medicare & Medicaid Services) content and professional association guidelines. These are federal/national sources that lack the clean structural signals of eCFR or Federal Register content.

## Critical Context from Upstream Sessions

**P1-S3** contains the composite scoring model (A + K + D + B). CMS and professional associations need A-scores and D-scores assigned. The scoring framework is settled — you are populating values.

**P1-S4** contains the domain taxonomy. The relevant L1 domains for this session are primarily `medicare-billing.*` and `clinical-operations.*`, with cross-classification into domain-specific L1s.

**P2-S1** contains the classification pipeline. CMS and professional guideline entities run through the same 5-stage pipeline. Your classification rules register alongside existing federal rules.

## Research Objectives

### 1. CMS Transmittals

CMS transmittals are changes to Medicare manuals. They carry structural metadata: transmittal number, manual name, manual chapter, effective date, and implementation date.

**Define classification rules for CMS transmittals:**

**A) Manual chapter → domain mapping:**

Map CMS manual chapters to Cedar domains. At minimum cover:
- Medicare Benefit Policy Manual (chapters relevant to Cedar's practice types)
- Medicare Claims Processing Manual
- Medicare Program Integrity Manual
- Medicare State Operations Manual

Format: `Manual Name + Chapter → Primary Cedar Domain → Cross-Classification Domains`

**B) Transmittal type scoring:**
- Recurring update (annual fee schedule, code updates) → D-score?
- New policy → D-score?
- Clarification/correction → D-score?

**C) ICD/CPT code signals:**
When a transmittal references specific ICD or CPT codes, those codes can signal the clinical domain. Define the approach:
- Maintain a lookup table of CPT code ranges → Cedar clinical domains?
- Use the code reference as a keyword signal?
- What's the cost/benefit of building CPT → domain mapping vs. relying on AI classification?

### 2. National Coverage Determinations (NCDs) & Local Coverage Determinations (LCDs)

**NCDs:**
- Each NCD covers a specific medical service/procedure.
- NCDs contain clinical criteria (indications, contraindications) AND billing rules (coverage conditions, documentation requirements).
- Define the cross-classification approach: does each NCD get classified in both `clinical-operations.*` and `medicare-billing.*`? Or is the primary domain `medicare-billing.coverage` with cross-classification into the relevant clinical domain?

**LCDs:**
- LCDs are MAC-specific. Florida's MACs: Palmetto GBA (Part A/HH/Hospice), First Coast Service Options (Part B).
- LCDs have the same dual nature as NCDs (clinical + billing).
- Additional dimension: geographic scope. Define how Cedar tags LCD jurisdiction:
  - A `mac_jurisdiction` field on the entity?
  - Using the existing `jurisdiction` column from P2-S1 with values like `FL-MAC-PALMETTO`, `FL-MAC-FCSO`?
  - Or `jurisdiction = 'FL'` with a separate `mac` field?

Recommend one approach that aligns with P2-S1's jurisdiction schema.

**Practice-type relevance for NCDs/LCDs:**
CMS coverage content varies heavily by practice type. An NCD about chiropractic manipulation is high-relevance for chiropractors, irrelevant for med spas.

Define the practice-type relevance scoring approach:
- Can relevance be determined from the NCD/LCD title and covered service alone?
- Should Cedar maintain a mapping of NCD/LCD IDs to practice types?
- How does this interact with the practice_type_relevance tables from P1-S4?

### 3. Medicare Learning Network (MLN) Articles

MLN articles are educational/informational content from CMS. They explain billing rules, coverage policies, and compliance requirements in plain language.

- What authority level? (They have no regulatory force — they're educational)
- How do they classify differently from transmittals and NCDs?
- Should MLN articles be linked to the NCD/LCD they explain?

### 4. Professional Association Guidelines

Cedar monitors or will monitor guidelines from these organizations:

| Organization | Primary Coverage |
|---|---|
| AMA | CPT updates, policy statements, ethical opinions |
| AAFP | Clinical guidelines for primary care / DPC |
| ACOG | Reproductive health guidelines |
| ASPS | Aesthetic procedure standards |
| FMA (Florida Medical Association) | State-level medical policy |
| PCCA | Compounding standards |
| APC (Alliance for Pharmacy Compounding) | Compounding advocacy, standards |

**A) Organization → domain mapping:**

For each organization, define:
- Primary domain(s) they address
- A-score (how much of their output is relevant to Cedar's scope?)
- Expected document types (clinical guidelines, position statements, practice advisories, CPT updates)

**B) D-score by document type:**

Professional association content has different authority levels:
- Clinical practice guidelines → strongest signal
- Position statements → moderate signal
- Educational materials → weaker signal
- Press releases → minimal signal

Map document types to D-scores within P1-S3's 0-0.15 range.

**C) Cross-reference enrichment:**

When a professional guideline references specific regulations (e.g., AMA guidelines citing HIPAA, PCCA standards citing USP chapters), the guideline should inherit domain classifications from the referenced source.

Define the detection approach:
- What citation patterns appear in professional guidelines?
- Is this the same federal reference detection as P3-S1 defined for FL rules, or does it need different patterns?
- How does inherited classification interact with the guideline's own classification?

### 5. Scoring Model Integration

For both CMS content and professional guidelines, produce complete scoring profiles that plug into P1-S3's `A + K + D + B` model:

```
Source Type → Default A-Score, D-Score → Bonus Conditions → Effective Score Range
```

This ensures these source types run through the same scoring pipeline as federal sources.

## Deliverable Format

Produce a single structured markdown document. Include complete mapping tables. Every rule should translate to a `classification_rules` INSERT statement. For CMS content, if you reference specific manual chapter numbers, verify them against your knowledge of CMS manual organization.
