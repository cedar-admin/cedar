# Cedar Research — Part 3 Splinter Plan

## Architecture Overview

**7 sessions** across **3 execution waves**. 2 web-route sessions (FL-specific source verification), 5 API-route sessions (synthesis from P1/P2 outputs).

Total estimated output: ~90-100K tokens.

### Dependency Graph

```
Wave 1 (parallel):
  P3-S1  [WEB]  FL State Board Rules — FAC Mapping & State Scoring
  P3-S3  [API]  CMS Content & Professional Guidelines
  P3-S4  [API]  Authority Level Assignment

Wave 2 (parallel, after S1):
  P3-S2  [WEB]  FL Legislative Activity & Board Minutes
  P3-S5  [API]  50-State Normalization Framework
  P3-S6  [API]  New Entity Protocol, Taxonomy Evolution & Alerting

Wave 3 (after S4, S6):
  P3-S7  [API]  Cross-Cutting: Audit Extension, Metrics & Bulk Re-Classification
```

### Dependency Edges

| Session | Depends On (P3) | Depends On (P1/P2) |
|---------|-----------------|---------------------|
| P3-S1 | — | P1-S3, P1-S4, P2-S1, P2-S2 |
| P3-S2 | P3-S1 | P1-S4, P2-S1 |
| P3-S3 | — | P1-S3, P1-S4, P2-S1 |
| P3-S4 | — | P1-S4, P2-S1 |
| P3-S5 | P3-S1 | P2-S1, P2-S5 |
| P3-S6 | — | P1-S4, P2-S1, P2-S4, P2-S5 |
| P3-S7 | P3-S4, P3-S6 | P2-S4, P2-S5 |

---

## Context Budget

| Session | Upstream Inputs | Est. Input Tokens | Est. Output Tokens |
|---------|----------------|-------------------|-------------------|
| P3-S1 | P1-S3 (15K) + P1-S4 (23K) + P2-S1 (5K) + P2-S2 (15K) + prompt (5K) | ~63K | ~18K |
| P3-S2 | P1-S4 (23K) + P2-S1 (5K) + P3-S1 (~18K) + prompt (5K) | ~51K | ~14K |
| P3-S3 | P1-S3 (15K) + P1-S4 (23K) + P2-S1 (5K) + prompt (5K) | ~48K | ~15K |
| P3-S4 | P1-S4 (23K) + P2-S1 (5K) + prompt (4K) | ~32K | ~12K |
| P3-S5 | P2-S1 (5K) + P2-S5 (3.5K) + P3-S1 (~18K) + prompt (5K) | ~31K | ~14K |
| P3-S6 | P1-S4 (23K) + P2-S1 (5K) + P2-S4 (8K) + P2-S5 (3.5K) + prompt (5K) | ~44K | ~15K |
| P3-S7 | P2-S4 (8K) + P2-S5 (3.5K) + P3-S4 (~12K) + P3-S6 (~15K) + prompt (5K) | ~43K | ~12K |

All sessions well within the 120K context ceiling. No session at risk of hitting the 32K output cap.

---

## Session Design Rationale

### Why this split (and not the mega-prompt's RO structure)

The mega-prompt organizes by research objective (RO1-RO4). That structure doesn't map cleanly to sessions because:

1. **RO1 is 70% of the work** and contains six sub-sections (1A-1F) with different research modes — some need web verification, some are pure synthesis, and they have different upstream dependencies.

2. **RO3 and RO4 overlap heavily with P2 outputs.** Treating them as full research objectives overstates the remaining work. P2-S1 already built the pipeline, P2-S4 already built the audit trail, P2-S5 already built the metrics. P3 extends these, it doesn't rebuild them.

3. **RO1F (50-state normalization) is architecturally distinct** from the FL-specific sessions. It produces an abstraction layer and onboarding protocol — framework-level work that sits above any single state's implementation.

The session split follows the actual work topology: FL-specific source mapping (S1, S2) → non-FL federal source types (S3) → authority levels (S4, independent) → state expansion framework (S5) → runtime protocol (S6) → cross-cutting extensions (S7).

### What got scoped down

- **1C (Board Minutes NLP extraction)**: The mega-prompt asks for segmentation algorithms to parse unstructured meeting minutes into individual decisions. This is content extraction engineering — the classification research question is "given an extracted decision, how does it classify?" P3-S2 covers the classification strategy; the extraction approach is flagged as a PRP deliverable.

- **1F (per-state citation parsers)**: P2-S1 already designed the extensible `CitationParser` interface and the jurisdiction-scoped schema. P3-S5 designs the abstraction layer, normalization approach, and onboarding checklist. Implementing parsers for TX/CA/NY is engineering work that belongs in PRPs.

- **RO4 audit trail and metrics**: P2-S4 and P2-S5 already delivered these. P3-S7 extends them for non-federal sources and adds bulk re-classification (the one genuinely net-new deliverable in RO4).

---

## Manifest

```json
{
  "part": "P3",
  "description": "Non-Federal Source Classification, Authority Levels & Ingestion Protocol",
  "sessions": [
    {
      "id": "P3-S1",
      "title": "FL State Board Rules — FAC Mapping & State Scoring",
      "route": "web",
      "wave": 1,
      "depends_on": [],
      "context_inputs": ["P1-S3", "P1-S4", "P2-S1", "P2-S2"],
      "estimated_input_tokens": 63000,
      "estimated_output_tokens": 18000,
      "deliverables": [
        "Complete FAC chapter → Cedar domain mapping table (all monitored FL boards)",
        "FAC rule metadata field inventory (structured signals available per rule)",
        "FL agency A-scores for S3 scoring model",
        "FL-specific keyword additions with K-score assignments",
        "FL board cross-classification patterns",
        "Federal reference detection regex patterns for state rule text"
      ]
    },
    {
      "id": "P3-S2",
      "title": "FL Legislative Activity & Board Minutes Classification",
      "route": "web",
      "wave": 2,
      "depends_on": ["P3-S1"],
      "context_inputs": ["P1-S4", "P2-S1", "P3-S1"],
      "estimated_input_tokens": 51000,
      "estimated_output_tokens": 14000,
      "deliverables": [
        "FL legislative committee → domain mapping",
        "Bill subject code → domain mapping",
        "Bill structured metadata field inventory (classification signal assessment)",
        "Omnibus bill classification protocol",
        "Amendment tracking classification rules",
        "Board minutes decision type → domain mapping",
        "Board minutes entity granularity recommendation",
        "Board minutes format comparison across FL boards (extraction PRP input)",
        "Confidence calibration targets for unstructured sources"
      ]
    },
    {
      "id": "P3-S3",
      "title": "CMS Content & Professional Guidelines Classification",
      "route": "api",
      "wave": 1,
      "depends_on": [],
      "context_inputs": ["P1-S3", "P1-S4", "P2-S1"],
      "estimated_input_tokens": 48000,
      "estimated_output_tokens": 15000,
      "deliverables": [
        "CMS transmittal type classification rules",
        "CMS manual chapter → domain mapping",
        "NCD/LCD cross-classification approach (clinical + billing)",
        "LCD geographic scope tagging protocol",
        "CMS practice-type relevance scoring rules",
        "Professional association → domain mapping table",
        "Cross-reference enrichment approach for professional guidelines",
        "Authority level interplay rules for professional standards"
      ]
    },
    {
      "id": "P3-S4",
      "title": "Authority Level Assignment Rules",
      "route": "api",
      "wave": 1,
      "depends_on": [],
      "context_inputs": ["P1-S4", "P2-S1"],
      "estimated_input_tokens": 32000,
      "estimated_output_tokens": 12000,
      "deliverables": [
        "Complete source type × document type → authority level mapping table",
        "Exception rules for ambiguous source types",
        "Within-source authority level disambiguation logic",
        "Authority level hierarchy with conflict resolution rules",
        "Proposed entity provisional authority level protocol",
        "Authority level transition tracking (proposed → final)",
        "SQL seed data for authority_level enum and assignment rules"
      ]
    },
    {
      "id": "P3-S5",
      "title": "50-State Normalization Framework",
      "route": "api",
      "wave": 2,
      "depends_on": ["P3-S1"],
      "context_inputs": ["P2-S1", "P2-S5", "P3-S1"],
      "estimated_input_tokens": 31000,
      "estimated_output_tokens": 14000,
      "deliverables": [
        "Citation format abstraction layer design (extends P2-S1 CitationParser)",
        "State board name normalization approach and lookup table design",
        "State-specific entity jurisdiction tagging (extends P2-S1 jurisdiction column)",
        "State onboarding checklist (configuration work per new state)",
        "Effort estimation model for state expansion",
        "State accommodation table extension (expanding P2-S5's table)"
      ]
    },
    {
      "id": "P3-S6",
      "title": "New Entity Protocol, Taxonomy Evolution & Alerting",
      "route": "api",
      "wave": 2,
      "depends_on": [],
      "context_inputs": ["P1-S4", "P2-S1", "P2-S4", "P2-S5"],
      "estimated_input_tokens": 44000,
      "estimated_output_tokens": 15000,
      "deliverables": [
        "Real-time single-entity classification flow (extending P2-S1 pipeline)",
        "Pipeline short-circuit rules and latency targets",
        "Confidence-based routing to Library vs. HITL queue",
        "Taxonomy gap detection signals and response protocol",
        "Taxonomy versioning and backward compatibility design",
        "Re-classification trigger rules for taxonomy changes",
        "Alerting rules: confidence, anomaly, volume, conflict-based",
        "Alert format and recommended response for each rule type"
      ]
    },
    {
      "id": "P3-S7",
      "title": "Cross-Cutting: Audit Extension, Metrics & Bulk Re-Classification",
      "route": "api",
      "wave": 3,
      "depends_on": ["P3-S4", "P3-S6"],
      "context_inputs": ["P2-S4", "P2-S5", "P3-S4", "P3-S6"],
      "estimated_input_tokens": 43000,
      "estimated_output_tokens": 12000,
      "deliverables": [
        "Audit trail schema extensions for non-federal sources + authority levels",
        "Non-federal-specific monitoring metrics (extending P2-S5's 10 metrics)",
        "Bulk re-classification pipeline design",
        "Scope determination algorithm (which entities need re-classification)",
        "Conflict resolution rules (new vs. original vs. human-verified)",
        "Rate limiting strategy for bulk operations",
        "Indexing strategy and archival approach for audit trail at scale"
      ]
    }
  ]
}
```

---

## Session Prompts

---

### P3-S1: FL State Board Rules — FAC Mapping & State Scoring

**Route:** Web (deep research)
**Context injected by orchestrator:** P1-S3, P1-S4, P2-S1, P2-S2

```markdown
# P3-S1: Florida State Board Rules — FAC-to-Domain Mapping & State Scoring Extensions

## Your Role

You are a research agent extending Cedar's classification framework to Florida state board rules. Parts 1 and 2 produced a federal classification pipeline with a composite scoring model, domain taxonomy, keyword engine, and jurisdiction-extensible schema. Your job is to produce the FL-specific configuration that plugs into that existing architecture.

## Critical Context from Upstream Sessions

The following upstream session outputs are injected below this prompt. Reference them by session ID.

**P1-S3** contains the composite scoring model: `Score = A + K + D + B`. You will define FL-specific values for the A (agency) and K (keyword) components. The scoring framework itself is settled — you are populating state-specific values within it.

**P1-S4** contains the domain taxonomy: 11 L1 domains, 55 L2 subdomains, ~320 L3-L6 nodes. The `state-regulations` L1 domain already exists with L2 subdomains: `state-regulations.licensure`, `state-regulations.facility-permits`, `state-regulations.controlled-substances`, `state-regulations.scope-expansions`, `state-regulations.cpom`. Your FAC mappings must use these existing domain codes. If a mapping requires a domain that doesn't exist, flag it as a taxonomy gap — do not invent new domains.

**P2-S1** contains the jurisdiction-scoped `classification_rules` table with a `jurisdiction` column. Your FL rules register as `jurisdiction = 'FL'` entries. P2-S1 also defines the `CitationParser` interface — you will specify the FL-specific citation format that implements this interface.

**P2-S2** contains the keyword-to-domain mapping for 237 federal phrases. You will identify which of these apply to FL sources (most will), and define FL-specific keyword additions (phrases that appear in FL regulatory text but not in federal text).

## Research Objectives

### 1. FAC Chapter → Cedar Domain Mapping

Cedar monitors these Florida Administrative Code sources:

| Board / Agency | FAC Location |
|---|---|
| Board of Medicine | Chapter 64B8 |
| Board of Osteopathic Medicine | Chapter 64B15 |
| Board of Pharmacy | Chapter 64B16 |
| Board of Nursing | Chapter 64B9 |
| Board of Clinical Social Work, Marriage & Family Therapy, Mental Health Counseling | Chapter 64B4 |
| Board of Chiropractic Medicine | Chapter 64B2 |
| Board of Acupuncture | Chapter 64B1 |
| Department of Health (general) | Title 64 |
| Agency for Health Care Administration | Title 59A |

For each board/agency, produce a mapping table at the **rule/section level** where possible:

```
FAC Reference → Primary Cedar Domain (L2+) → Common Cross-Classifications
```

Example format:
```
64B8-9 (Standards of Practice) → clinical-operations.practice-standards → [state-regulations.licensure]
64B16-28 (Compounding) → compounding.pharmacy-standards → [state-regulations.licensure, fda-regulation.drug-approvals]
```

**Verify the actual FAC chapter/rule structure** at https://www.flrules.org/. The FAC numbering format is `Title-Chapter-Rule` (e.g., 64B8-9.003). Map at the chapter level (e.g., 64B8-9) as the structural rule, with notes on which specific rules within a chapter map to different domains.

**Verify the metadata fields exposed on individual FAC rules.** Specifically: do rules on flrules.org expose structured fields like statutory authority citations (e.g., "Rulemaking Authority: 458.309 FS"), law implemented references, effective dates, and rule history notes? If FAC rules consistently cite their enabling statute, that's a free classification signal — the statute reference links the rule to a specific regulatory domain. Document which structured metadata fields are available and how they can be used as classification signals alongside the chapter-level structural mapping.

For each mapping, indicate:
- **Signal reliability**: How confidently can we classify based on the FAC chapter alone? (High/Medium/Low)
- **What additional signal is needed**: If chapter-level mapping is insufficient (Medium/Low), specify what keyword or content signal refines the classification.

### 2. FL Agency A-Scores

Using P1-S3's agency scoring component (0-0.45 range), assign A-scores to each FL agency/board Cedar monitors:

| Agency / Board | A-Score | Rationale |
|---|---|---|
| FL Board of Medicine | ? | All output is healthcare-regulatory |
| FL Board of Pharmacy | ? | All output is healthcare-regulatory |
| ... | ... | ... |

FL boards are single-purpose healthcare regulators, so most should score High (0.45). Identify any exceptions — agencies that produce mixed content where some output is irrelevant to Cedar's target practices.

### 3. FL-Specific Keyword Additions

Review P2-S2's 237 keyword phrases. Identify:

**A) Federal keywords that apply unchanged to FL sources** — these need no modification, just confirmation that the K-score logic transfers.

**B) FL-specific keyword additions** — phrases that appear in FL regulatory text and carry classification signal, but don't appear in federal text. Examples might include:
- FL statute references (e.g., "chapter 456" = FL health professions general provisions)
- FL-specific regulatory concepts (e.g., "PDMP" in the FL prescription drug monitoring context)
- FL board-specific terminology

For each FL keyword addition, provide:
- The phrase
- Signal strength (Strong/Moderate/Weak per P1-S3's definitions)
- Target domain(s)
- Homonym risk flag if applicable

### 4. Cross-Classification Patterns for FL Boards

FL board rules frequently cross federal domains. Define the common cross-classification patterns:

- A Board of Medicine telehealth rule → `telehealth.*` + `state-regulations.licensure`
- A Board of Pharmacy compounding rule → `compounding.*` + `state-regulations.controlled-substances` (if it references controlled substances)
- etc.

For each pattern:
- Source board
- Primary domain assignment
- Cross-classification trigger (what in the rule text triggers the secondary domain?)
- Whether this pattern uses existing P1-S7-C cross-classification triggers or requires new FL-specific triggers

### 5. Federal Reference Detection in FL Rule Text

FL rules frequently reference federal regulations. Define regex patterns to detect:
- CFR citations in FL rule text (e.g., "21 CFR 1301" → link to `controlled-substances.registration`)
- USC citations (e.g., "42 U.S.C. § 1395" → Medicare)
- Federal Register citations
- Agency name references (e.g., "DEA", "FDA", "CMS")

When detected, the FL entity should inherit domain classifications from the referenced federal entity. Define the inheritance logic: does the FL entity get the federal entity's domains as cross-classifications, or does the reference just boost confidence in a domain assignment already suggested by other signals?

### 6. FL Citation Parser Specification

Define the FL-specific implementation of P2-S1's `CitationParser` interface:
- Input format: FAC citation strings (e.g., "64B8-9.003", "59A-4.110")
- Parsing logic: extract title, chapter, board identifier, rule number
- Output: structured citation object with jurisdiction='FL' and parsed components
- Edge cases: how FAC citations differ from CFR citations, what normalization is needed

## Deliverable Format

Produce a single structured markdown document with all six sections. Every mapping should be specific enough to translate directly into a `classification_rules` INSERT statement with `jurisdiction = 'FL'`. Include complete tables — no "etc." or "and similar" placeholders.
```

---

### P3-S2: FL Legislative Activity & Board Minutes Classification

**Route:** Web (deep research)
**Context injected by orchestrator:** P1-S4, P2-S1, P3-S1

```markdown
# P3-S2: Florida Legislative Activity & Board Minutes Classification

## Your Role

You are a research agent extending Cedar's classification framework to Florida legislative activity and board meeting minutes. P3-S1 (injected below) established the FL state board rule mappings. Your job is to produce classification strategies for the two remaining FL-specific source types: legislative bills/amendments and board meeting decisions.

## Critical Context from Upstream Sessions

**P1-S4** contains the domain taxonomy. Use its domain codes for all mappings.

**P2-S1** contains the classification pipeline and jurisdiction-scoped schema. Legislative and board minutes entities register as `jurisdiction = 'FL'` entries.

**P3-S1** contains the FL board rule mappings, agency scores, and cross-classification patterns. Board minutes come from the same FL boards mapped in P3-S1 — your board minutes classification should be consistent with P3-S1's board-level domain assignments.

## Research Objectives

### 1. Florida Legislative Committee → Domain Mapping

Cedar monitors Florida legislative session activity from the FL Senate and House.

**Verify the current committee structure** at https://www.myfloridahouse.gov/ and https://www.flsenate.gov/.

**Verify the structured data fields available on bills** through both sites. The classification strategy depends on what metadata is programmatically available — subject codes, committee assignments, related bill links, sponsor information, amendment document structure, fiscal impact notes. If the legislature's system exposes rich structured metadata, the classification approach is mostly deterministic rules. If the available metadata is sparse, the strategy shifts toward keyword and AI classification. Document what fields are available and their reliability as classification signals.

Produce a mapping table:

```
Committee Name → Primary Cedar Domain(s) → Notes
```

Cover all committees that produce healthcare-relevant legislation. Include both standing committees and relevant appropriations subcommittees.

For each committee:
- **Relevance level**: High (all output is healthcare-relevant), Medium (mixed output), Low (occasional healthcare bills)
- **Domain coverage**: Which Cedar domains does this committee's output typically map to?

### 2. Bill Subject Code → Domain Mapping

The Florida Legislature assigns subject matter codes to bills.

**Verify the current subject code taxonomy** used by the FL Legislature. Produce a mapping from healthcare-relevant subject codes to Cedar domains.

If subject codes are too broad to map directly to Cedar L2 domains, define what additional signal is needed (title keywords, bill text keywords, committee assignment).

### 3. The Omnibus Bill Problem

Define Cedar's approach to classifying multi-topic healthcare bills:

**Option A: Entity-level cross-classification** — The bill entity gets multiple domain assignments covering all topics in the bill.

**Option B: Section-level entities** — Each substantive section of an omnibus bill becomes a separate entity with its own classification.

**Option C: Hybrid** — The bill entity gets cross-classified, AND individual sections that introduce significant regulatory changes get flagged as sub-entities.

Evaluate each option against:
- Implementation complexity
- User experience (a practice owner searching "compounding" should find relevant bill sections)
- Accuracy (cross-classifying the whole bill is easier but less precise)
- Alignment with P2-S1's pipeline (which option integrates most cleanly?)

Recommend one approach with justification.

### 4. Amendment Tracking

When a bill is amended:
- Does the amendment entity inherit the bill's domain classification?
- Under what conditions would an amendment change the bill's classification? (e.g., amendment adds a telehealth section to a billing bill)
- How does Cedar link amendment entities to their parent bill entity?

Define the classification rules for amendments.

### 5. Pre-Regulatory Intelligence

Bills represent future regulation. Define how bill classification feeds Cedar's change detection:
- How should bill status (filed, committee, floor vote, enrolled, signed) affect what users see?
- Should bills appear in the Library, or in a separate "Legislative Watch" view?
- When a bill is signed into law and becomes a statute, how does the entity transition? (Does the bill entity get superseded by the statute entity, or do both persist with a link?)

### 6. Board Meeting Minutes — Classification Strategy

Board meeting minutes from FL boards are unstructured paragraph-form text containing decisions, motions, enforcement actions, license actions, and policy discussions.

**Entity granularity decision:**

Evaluate two approaches:
- **Document-level**: The entire meeting minutes document is one entity, cross-classified across all topics discussed.
- **Decision-level**: Each substantive agenda item / decision is a separate entity.

Recommend one, considering: implementation cost, classification accuracy, user search experience, and the fact that board minutes extraction is inherently imprecise.

**Decision type → domain mapping:**

Define how board decision types map to Cedar domains:

| Decision Type | Primary Domain | Cross-Classification Triggers |
|---|---|---|
| Enforcement action (prescribing violation) | ? | ? |
| License grant/denial | ? | ? |
| Rulemaking proposal | ? | ? |
| Policy interpretation | ? | ? |
| Waiver/exception | ? | ? |

Use P3-S1's board-to-domain mappings as the baseline: a Board of Pharmacy enforcement action about compounding maps to `compounding.*` + the enforcement-specific domain.

**Confidence calibration:**

Board minutes are Cedar's least structured source. Define:
- Realistic accuracy target at L2 (expectation: lower than the 80% target for other non-federal sources)
- Recommended confidence threshold for flagging items to HITL review
- Which board minutes classifications should always go to human review regardless of AI confidence?

### 7. Content Extraction Scope Note

The classification strategy above assumes that board minutes have been segmented into individual agenda items / decisions. **The extraction approach itself (NLP segmentation, topic identification) is out of scope for this research session** — it will be specified in an engineering PRP. This session defines: given an extracted segment, how does it classify?

However, note any observations about FL board minutes structure that would inform the extraction PRP (e.g., consistent agenda numbering, standard section headers like "DISCIPLINARY PROCEEDINGS", varying format across boards).

**Verify board minutes format across 2-3 different boards** (e.g., Board of Medicine, Board of Pharmacy, AHCA). Compare their structure: do they share consistent formatting conventions (numbered agenda items, standard section headers), or does each board use a substantially different format? If format varies significantly across boards, the extraction PRP will need per-board parsing strategies. Document the structural patterns you observe.

## Deliverable Format

Produce a single structured markdown document. Every mapping should be specific enough to translate into classification rules. Include complete committee lists and decision type tables — no placeholders. Where web verification reveals something unexpected (a committee name doesn't match any Cedar domain, a subject code system is too coarse), flag it explicitly.
```

---

### P3-S3: CMS Content & Professional Guidelines Classification

**Route:** API
**Context injected by orchestrator:** P1-S3, P1-S4, P2-S1

```markdown
# P3-S3: CMS Content & Professional Guidelines Classification

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
```

---

### P3-S4: Authority Level Assignment Rules

**Route:** API
**Context injected by orchestrator:** P1-S4, P2-S1

```markdown
# P3-S4: Authority Level Assignment Rules

## Your Role

You are a research agent defining deterministic rules for assigning authority levels to every entity type Cedar ingests. Authority level represents the legal weight of a regulatory entity — from binding federal statute down to voluntary professional standard.

## Critical Context from Upstream Sessions

**P1-S4** contains the domain taxonomy, which you'll reference for domain-specific exceptions.

**P2-S1** contains the pipeline architecture. Authority level assignment happens alongside domain classification in the pipeline. The `classification_rules` table can store authority level assignment rules.

## Cedar's Authority Level Enum

```sql
CREATE TYPE authority_level AS ENUM (
  'federal_statute',
  'federal_regulation',
  'sub_regulatory_guidance',
  'national_coverage_determination',
  'local_coverage_determination',
  'state_statute',
  'state_board_rule',
  'professional_standard'
);
```

## Research Objectives

### 1. Complete Source Type → Authority Level Mapping

For every source type Cedar ingests, define the default authority level and any exceptions.

**Federal Sources:**

| Source Type | Document Subtype | Default Authority Level | Exceptions / Notes |
|---|---|---|---|
| eCFR entries | — | federal_regulation | Some parts codify statutory text — identify which and how to detect |
| Federal Register | Final rules | federal_regulation | — |
| Federal Register | Proposed rules | ? | No current legal force — define handling |
| Federal Register | Notices | ? | Some notices have regulatory force (e.g., DEA scheduling), others are informational |
| Federal Register | Guidance documents | sub_regulatory_guidance | — |
| Federal Register | Presidential documents | ? | Executive orders vs. proclamations — different authority? |
| openFDA | Drug approvals | ? | Approval is an agency action — what level? |
| openFDA | Enforcement reports | ? | Reports vs. enforcement actions |
| openFDA | Adverse event data | ? | Data, no regulatory force — is this even classifiable as an authority level? |
| CMS transmittals | — | ? | Manual updates implementing regulations |
| CMS NCDs | — | national_coverage_determination | — |
| CMS LCDs | — | local_coverage_determination | — |
| CMS MLN articles | — | ? | Educational, no regulatory force |
| OIG advisory opinions | — | ? | Binding on the requestor, persuasive to others |
| OIG compliance guidance | — | ? | Guidance, not regulation |

**State Sources (Florida):**

| Source Type | Document Subtype | Default Authority Level | Exceptions / Notes |
|---|---|---|---|
| Florida Statutes | — | state_statute | — |
| Florida Administrative Code | — | state_board_rule | — |
| FL DOH guidance | — | ? | State-level sub-regulatory guidance |
| FL legislative bills | Not yet enacted | ? | Proposed legislation — no current force |
| Board meeting decisions | — | ? | Some decisions are binding administrative actions |

**Professional Sources:**

| Source Type | Document Subtype | Default Authority Level | Exceptions / Notes |
|---|---|---|---|
| AMA policy statements | — | professional_standard | — |
| Clinical practice guidelines | — | professional_standard | — |
| Accreditation standards (JCAHO, AAAHC) | — | ? | Quasi-regulatory — accreditation can be required for participation in programs |

Complete ALL rows in these tables. For every "?" cell, provide a definitive answer with reasoning.

### 2. Within-Source Authority Level Disambiguation

Some sources produce content at multiple authority levels. The Federal Register publishes regulations, guidance, and notices through the same channel. Define the disambiguation logic:

- What metadata field(s) distinguish authority levels within a single source?
- Can disambiguation be fully deterministic (rule-based), or does some content require AI classification of authority level?
- For FR documents: map FR document type codes to authority levels.
- For state sources: what distinguishes a binding board decision from a non-binding policy discussion?

### 3. Authority Level Hierarchy and Conflict Resolution

Define the explicit hierarchy:

```
federal_statute > federal_regulation > sub_regulatory_guidance
national_coverage_determination (parallel track — CMS-specific)
local_coverage_determination (parallel track — MAC-specific)
state_statute > state_board_rule
professional_standard (informational, no supersession)
```

**Conflict resolution rules:**

When a higher-authority source and a lower-authority source address the same topic:
- Federal regulation preempts conflicting state board rules (but state rules can be MORE restrictive)
- How does Cedar surface this relationship? Define the display logic:
  - Should Cedar show a "preemption" indicator?
  - Should Cedar show "this state rule is more restrictive than federal requirements"?
  - How is the "more restrictive" determination made? (Manual tagging? AI? Heuristic?)

### 4. Proposed Entity Protocol

Proposed rules, pending legislation, and draft guidance have no current legal force but signal upcoming changes. Define:

**A) Provisional authority levels:**

Add these to the enum or use a modifier field?
- `proposed_federal_regulation` (or `federal_regulation` + `status = 'proposed'`?)
- `pending_state_statute` (or `state_statute` + `status = 'pending'`?)

Recommend one approach: expand the enum vs. use a status modifier. Consider database simplicity, query ergonomics, and UI implications.

**B) Authority level transitions:**

When a proposed rule becomes final:
- Does the entity's authority level change in place, or does a new entity get created?
- How is the transition tracked in the audit trail?
- How are users notified? (Change detection alert: "This proposed rule is now final")

**C) Effective date handling:**

Some rules have future effective dates (final rule published today, effective in 90 days). How does Cedar handle the interim period? The rule is authoritative but not yet enforceable.

### 5. SQL Seed Data

Produce INSERT statements for:
- The authority_level enum (if not already in migrations — check P2-S1)
- A deterministic `authority_level_rules` table (or entries in `classification_rules`) that maps source_type + document_type → authority_level
- The hierarchy ordering (a numeric `hierarchy_rank` or similar for sorting/comparison)

## Deliverable Format

Produce a single structured markdown document. The mapping table in Section 1 must have zero "?" cells — every source type gets a definitive authority level. Include SQL seed data that a developer can run directly. Define edge cases explicitly (what happens with source types that don't cleanly map).
```

---

### P3-S5: 50-State Normalization Framework

**Route:** API
**Context injected by orchestrator:** P2-S1, P2-S5, P3-S1

```markdown
# P3-S5: 50-State Normalization Framework

## Your Role

You are a research agent designing Cedar's state expansion framework. Cedar currently operates in Florida. When Cedar adds a new state, the classification framework must adapt without redesigning the pipeline. Your job is to define the abstraction layer that makes this possible, and the onboarding checklist that makes it repeatable.

## Critical Context from Upstream Sessions

**P2-S1** contains the jurisdiction-scoped architecture:
- `classification_rules` table with `jurisdiction` column (federal, FL, CA, etc.)
- `CitationParser` interface — generic, with federal CFR as the first implementation
- Stage transition logic that applies jurisdiction-scoped rules

**P2-S5** contains the state source accommodation table mapping federal implementations to state extensions needed: citation parser formats, agency counts, keyword overlap, exclusion lists, config overrides, rule loading queries.

**P3-S1** contains Cedar's complete FL implementation: FAC-to-domain mappings, FL agency A-scores, FL-specific keywords, FL citation parser spec. This serves as the reference implementation — the "first state" that the normalization framework must generalize from.

## Research Objectives

### 1. Citation Format Abstraction Layer

State administrative codes use different citation formats:

| State | Format | Example |
|---|---|---|
| Florida | FAC Title.Chapter-Rule | 64B8-9.003 |
| Texas | TAC Title.Part.Chapter.Rule | 22 TAC §174.1 |
| California | CCR Title.Division.Chapter.Article.Section | 16 CCR §1399.540 |
| New York | NYCRR Title.Chapter.Subchapter.Part.Section | 10 NYCRR §405.2 |

Design the abstraction layer that extends P2-S1's `CitationParser` interface:

**A) Normalized citation object:**

Define the common output format that all state parsers produce. This object must contain enough information to:
- Route to the correct classification rules (`jurisdiction` + parsed structural components)
- Support domain mapping (the structural components map to domains)
- Display to users (human-readable citation string)

```typescript
interface NormalizedCitation {
  jurisdiction: string;         // 'FL', 'TX', 'CA', 'NY'
  raw: string;                  // original citation string
  // ... define the common fields
}
```

**B) Parser registration pattern:**

How do new state parsers register with the pipeline? Define:
- Where parser implementations live (per-state modules?)
- How the pipeline selects the correct parser for a given entity
- How citation patterns in entity text are detected and extracted (regex library?)

**C) Structural mapping portability:**

P3-S1 mapped FAC chapters → Cedar domains. When adding Texas, similar TAC → domain mappings are needed. Define:
- The configuration format for state-specific structural mappings
- How much of a state's structural mapping can be auto-generated vs. requires manual research
- The expected mapping granularity per state (chapter-level? section-level?)

### 2. State Board Name Normalization

Every state names its regulatory boards differently:

| Concept | Florida | Texas | California | New York |
|---|---|---|---|---|
| Medical licensing | Board of Medicine | Texas Medical Board | Medical Board of California | Office of Professional Medical Conduct |
| Pharmacy regulation | Board of Pharmacy | Texas State Board of Pharmacy | Board of Pharmacy | — (under Dept of Education) |

Define the normalization approach:

**A) Board name → Cedar concept mapping:**

Design a lookup table structure that maps arbitrary state board names to Cedar's standardized concepts. The concepts should align with Cedar's domain taxonomy — a "Board of Medicine" in any state maps to the same domain nodes.

**B) Board name detection:**

When ingesting a state source, how does Cedar identify which board produced it?
- Source URL patterns?
- Metadata fields?
- Board name appearing in document text?

Define the detection heuristics.

**C) New board discovery:**

Some states have regulatory bodies that don't exist in Florida (e.g., a "Board of Naturopathic Medicine" in states that license NDs). How does Cedar handle boards that don't map to any existing FL board? Flag as taxonomy gap? Auto-create a mapping to the nearest domain?

### 3. State-Specific Entity Tagging

P2-S1's schema includes a `jurisdiction` column on `classification_rules`. Entities themselves also need jurisdiction tagging.

Define:
- Where jurisdiction lives on the entity (a `jurisdiction` field on the `knowledge_graph_entities` table?)
- How jurisdiction is determined at ingestion time (from the source definition? from the citation parser output?)
- How jurisdiction interacts with search and filtering (users should be able to filter the Library by "Florida only" or "Federal + Florida")

### 4. State Onboarding Checklist

When Cedar adds a new state, define the complete checklist of configuration work:

**Per-state configuration items:**

For each item, specify:
- What it is
- Estimated effort (hours)
- Whether it can be automated or requires manual research
- Dependencies (what must be done before this item?)

Categories to cover:
- Citation parser implementation
- Admin code structural mapping (chapters → domains)
- Board/agency name normalization entries
- Agency A-scores
- State-specific keyword additions
- Cross-classification pattern identification
- Source URL registration (where to scrape)
- Authority level rule registration (state statute, state board rule, state guidance)

**Effort estimation model:**

Based on the FL implementation (P3-S1), estimate:
- Total hours to onboard a new state
- What percentage of the work transfers automatically from federal + FL configuration
- What percentage requires per-state manual research
- How does effort scale with the complexity of the state's regulatory structure?

### 5. State Accommodation Table Extension

P2-S5 produced a state accommodation table mapping federal implementations to state extensions. Extend it with the specific configuration objects and data structures defined in this session. The extended table should serve as the working specification for the "add a state" PRP.

## Deliverable Format

Produce a single structured markdown document. Include TypeScript interface definitions, configuration object schemas, and the complete onboarding checklist. The abstraction layer should be concrete enough for a developer to implement the `StateCitationParser` base class and the board normalization lookup.
```

---

### P3-S6: New Entity Protocol, Taxonomy Evolution & Alerting

**Route:** API
**Context injected by orchestrator:** P1-S4, P2-S1, P2-S4, P2-S5

```markdown
# P3-S6: New Entity Protocol, Taxonomy Evolution & Alerting

## Your Role

You are a research agent defining how Cedar handles ongoing operations: real-time entity classification, taxonomy evolution, and alerting. P2-S1 designed the batch classification pipeline for the initial corpus. Your job is to define the real-time single-entity flow, the taxonomy lifecycle, and the alert rules that keep classification quality high over time.

## Critical Context from Upstream Sessions

**P1-S4** contains the domain taxonomy (11 L1, 55 L2, ~320 L3-L6 nodes). Taxonomy evolution rules must preserve backward compatibility with this structure.

**P2-S1** contains the 5-stage classification pipeline: Structural → Metadata → Keywords+Embeddings → AI → Irrelevance Confirmation. The real-time flow is this pipeline running in single-entity mode.

**P2-S4** contains the AI classifier specification: prompt templates, confidence tiers (≥0.85 auto-accept, 0.60-0.84 accept with flag, <0.60 needs review), batch sizing, and the feedback/correction loop.

**P2-S5** contains 10 monitoring metrics with SQL, alert thresholds, and dashboard views.

## Research Objectives

### 1. Real-Time Single-Entity Classification Flow

When a new entity is ingested (from daily Federal Register pipeline, a scraping job, or manual entry), it needs classification within minutes.

**A) Pipeline adaptation for single-entity mode:**

The P2-S1 pipeline was designed for batch processing (initial 99K corpus). Define how it adapts for single entities:
- Which stages run? (All 5, or can some be skipped for single entities?)
- Should the pipeline short-circuit once a high-confidence classification is achieved at an early stage? (e.g., if Stage 1 structural match gives 0.90 confidence, skip Stages 2-4?)
- What's the latency budget? (Target: classified within N minutes of ingestion)
- How does single-entity AI classification differ from batch? (P2-S4 specifies batch size 3 for Haiku — single entity means batch size 1, higher per-entity cost)

**B) Relevance gate:**

Before running the full pipeline, new entities need a relevance check:
- Use P1-S3's allowlist/denylist as the first filter
- If the entity is from a known relevant source (e.g., FL Board of Medicine), skip the relevance gate?
- If the entity is from a mixed-relevance source (e.g., Federal Register), apply the S3 scoring model first?

Define the relevance gate logic as a decision tree.

**C) Confidence-based routing to user-facing views:**

Based on classification confidence (using P2-S4's tiers):
- ≥0.85: Entity appears in Library immediately with full domain classification
- 0.60-0.84: Entity appears in Library with a visual indicator (e.g., "Classification pending review"). Define what the indicator looks like and when it gets removed.
- <0.60: Entity enters the HITL review queue. Does it appear in the Library at all, or only after review?

Define the routing logic as implementable rules.

### 2. Taxonomy Gap Detection

When a new entity suggests a gap in the existing taxonomy:

**A) Detection signals:**

Define what indicates a taxonomy gap:
- Entity keyword-matches an L1/L2 domain but the AI classifier can't confidently assign an L3+ subdomain (confidence < threshold across all L3 candidates)
- AI classifier suggests a domain that doesn't exist in the taxonomy (detected how?)
- Cluster analysis: multiple recent entities classified to the same L2 parent with low L3 confidence (suggests a missing L3 node)
- Entity references a regulatory concept that has no taxonomy representation

For each signal, define the detection logic and the false positive rate expectation.

**B) Gap response protocol:**

When a gap is detected:

*Immediate* — Where does the entity go?
- Classify to the nearest parent domain (e.g., L2) with a `taxonomy_gap` flag
- Include the gap entity in Library under the parent domain
- What metadata is stored to support later re-classification?

*Short-term* — How is the gap surfaced?
- Admin panel alert with gap details
- Gap aggregation (if 5+ entities flag gaps in the same L2 area within a window, escalate)
- Define the alert format and routing

*Resolution* — How does the taxonomy get updated?
- Who can add new domains? (Admin only? Automated suggestion with admin approval?)
- Define the taxonomy modification workflow: propose new L3 node → review → approve → create → re-classify gap-flagged entities
- How do existing entities get re-evaluated when a new domain is added? (Re-run Stage 4 on entities classified to the parent domain?)

### 3. Taxonomy Evolution

Over time, regulatory areas emerge (AI regulation, genetic privacy, psychedelic therapy), merge, or split.

**A) Taxonomy versioning:**

Define how taxonomy changes are tracked:
- Timestamped migration files (like database migrations)?
- Version number on each domain node?
- A `taxonomy_changes` log table?

Recommend one approach. Include the schema for tracking changes.

**B) Backward compatibility:**

When a domain is renamed, merged, or split:
- *Rename*: All entities with the old domain code get the new code. Audit trail preserves the old code. Define the migration logic.
- *Merge*: Two domains become one. All entities from both source domains get the merged domain code. Define conflict resolution if entities had different confidence scores.
- *Split*: One domain becomes two. Entities need re-classification to determine which of the new domains they belong to. Define the re-classification scope (all entities in the split domain? or only those from a certain date range?).

**C) Triggering re-classification:**

When the taxonomy changes, define which entities need re-classification:
- Domain rename: no re-classification needed, just update domain codes
- Domain merge: no re-classification needed for the merge itself, but review entities from both sources for consistency
- Domain split: re-classify all entities in the split domain through Stages 3-4
- New domain added: re-classify entities flagged with `taxonomy_gap` in the parent area + entities in the parent domain with below-threshold confidence
- Domain retired: re-classify all entities in the retired domain

For each trigger, define the scope, the pipeline stages to re-run, and the expected volume.

### 4. Alerting Rules

Define rules that flag classification decisions for human review:

**A) Confidence-based alerts:**
- Trigger: Classification confidence below threshold (P2-S4's <0.60)
- Already handled by HITL routing — define any additional alerting beyond the review queue

**B) Anomaly-based alerts (novelty detection):**
- Trigger: Entity classified in a domain where that source type has never appeared before
- Example: An eCFR Part from Title 40 (EPA) suddenly classified in `compounding.*` — likely a classification error
- Detection logic: maintain a `source_type × domain` frequency matrix, alert when a new (source, domain) pair appears
- Define: how the matrix is built, how alerts are surfaced, recommended response

**C) Volume-based alerts:**
- Trigger: Spike in entities classified to a single domain within a time window
- Could indicate: classification bug (systematic misclassification) OR genuine regulatory burst (new rulemaking in an area)
- Detection logic: rolling window comparison (current week vs. trailing 4-week average), alert when volume exceeds N standard deviations
- Define: window size, threshold, how to distinguish bug vs. genuine burst

**D) Conflict-based alerts:**
- Trigger: New entity classified differently than a closely-related existing entity
- Example: Two sections of the same CFR part classified in different L1 domains
- Detection logic: entity similarity check (same source, adjacent citations) + domain comparison
- Define: what "closely related" means operationally, how conflicts are surfaced

For each alert type:
- Trigger condition (specific, implementable)
- Alert format (what information is included)
- Delivery (admin panel notification? email? dashboard metric?)
- Recommended response (what should the operator do?)

### 5. Extending P2-S5's Monitoring Metrics

P2-S5 defined 10 monitoring metrics. Identify which metrics need extension for:
- Non-federal source types (state board rules, legislative activity, board minutes)
- Real-time single-entity mode (vs. batch)
- Taxonomy evolution tracking

Define 3-5 additional metrics specific to the operational concerns in this session. For each: name, calculation SQL, alert threshold, dashboard display.

## Deliverable Format

Produce a single structured markdown document. The real-time flow should be a clear decision tree or flowchart description. Alerting rules should be specific enough to implement as Inngest functions. Taxonomy evolution schema should include SQL DDL.
```

---

### P3-S7: Cross-Cutting — Audit Extension, Metrics & Bulk Re-Classification

**Route:** API
**Context injected by orchestrator:** P2-S4, P2-S5, P3-S4, P3-S6

```markdown
# P3-S7: Cross-Cutting Concerns — Audit Extension, Metrics & Bulk Re-Classification

## Your Role

You are a research agent completing Cedar's classification framework with cross-cutting operational concerns. P2-S4 and P2-S5 established the audit trail schema and monitoring metrics for federal sources. P3-S4 defined authority levels. P3-S6 defined taxonomy evolution and alerting. Your job is to extend the audit trail for the full source landscape, define the complete metrics suite, and design the bulk re-classification pipeline.

## Critical Context from Upstream Sessions

**P2-S4** contains the `kg_classification_log` schema with: `ai_reasoning`, `confidence_scores`, `cross_domains`, correction tracking, confusion matrix analysis. This is the foundation — extend it, do not redesign it.

**P2-S5** contains 10 monitoring metrics with SQL queries, alert thresholds, and dashboard views. Add non-federal-specific and operational metrics.

**P3-S4** contains authority level assignment rules. The audit trail must track authority level assignments alongside domain classifications.

**P3-S6** contains taxonomy evolution design, alerting rules, and the real-time entity flow. Bulk re-classification is triggered by taxonomy changes (defined in P3-S6) — your job is to define the mechanics of running re-classification at scale.

## Research Objectives

### 1. Audit Trail Schema Extensions

P2-S4's `kg_classification_log` tracks domain classifications. Extend it for:

**A) Authority level audit:**
- When an entity's authority level is assigned, log it with the same rigor as domain classification
- Authority level changes (e.g., proposed → final) need their own audit entries
- Schema additions: what columns are needed beyond P2-S4's existing schema?

**B) Non-federal source audit:**
- State-source classifications may have different confidence profiles than federal sources
- Board minutes classifications (lowest-confidence source type) need clear audit trails showing why a classification was made
- Legislative bill classifications need audit entries that track how classification changes as the bill progresses

**C) Jurisdiction-aware audit queries:**

Extend P2-S4's query patterns for jurisdiction-scoped queries:
- "Show me all FL board rule classifications with confidence < 0.7"
- "Show me authority level transitions in the last 30 days"
- "Compare classification accuracy between federal and FL sources"

Provide SQL for each query pattern.

### 2. Complete Metrics Suite

P2-S5's 10 metrics + P3-S6's additional metrics cover most needs. Produce the consolidated, deduplicated metrics list:

**A) Reconcile P2-S5 and P3-S6 metrics** — some may overlap. Produce a single canonical list with no redundancy.

**B) Add remaining metrics:**

- Authority level distribution (% of entities at each authority level)
- Jurisdiction coverage (% of entities by jurisdiction — are state sources being classified at the same rate as federal?)
- Source type accuracy comparison (classification accuracy broken down by source type: eCFR vs. FR vs. FAC vs. board minutes)
- Taxonomy gap rate (number of `taxonomy_gap` flags per time period — should trend toward zero)
- Re-classification volume (entities re-classified per time period, by trigger type)

For each metric: name, calculation (SQL), alert threshold, dashboard display recommendation.

**C) Dashboard view consolidation:**

P2-S5 proposed dashboard views. Consolidate into a coherent admin dashboard layout that includes all metrics. Group by:
- Classification health (accuracy, confidence, coverage)
- Pipeline performance (latency, throughput, stage distribution)
- Operational alerts (gaps, anomalies, volume spikes)
- Authority level tracking

### 3. Bulk Re-Classification Pipeline

When classification rules change, the taxonomy evolves, or a systematic error is discovered, Cedar needs to re-classify entities in bulk.

**A) Scope determination algorithm:**

Given a trigger event, determine which entities need re-classification:

| Trigger | Scope | Estimated Volume |
|---|---|---|
| Domain split (P3-S6) | All entities in the split domain | Varies by domain |
| New domain added | `taxonomy_gap` entities in parent + low-confidence entities in parent | Typically small |
| Classification rule updated | All entities that were classified by the updated rule | Queryable from audit trail |
| Systematic error discovered | All entities matching the error pattern | Varies |
| State onboarding | All entities from the new state (initial classification) | Full state corpus |

For each trigger, define the SQL query that identifies affected entities.

**B) Re-classification pipeline design:**

Is bulk re-classification the same 5-stage pipeline, or a modified version?

- If re-classifying due to a domain split: only Stages 3-4 (keyword + AI) may be relevant — structural and metadata signals haven't changed
- If re-classifying due to a rule update: re-run only the stage that uses the updated rule
- If re-classifying due to a systematic error: full pipeline re-run

Define the decision matrix: trigger type → which stages to re-run.

**C) Conflict resolution:**

If re-classification produces a different result than the original:
- The newer classification wins by default
- EXCEPT: if the original classification was human-verified (has a HITL review entry), the human classification is preserved unless explicitly overridden
- Define: how to detect human-verified classifications in the audit trail, how to present conflicts to operators

**D) Rate limiting and resource management:**

Re-classifying 10K+ entities involves:
- Database reads (fetch entities and their current classifications)
- API calls (Stage 4 AI classification — the expensive step)
- Database writes (update classifications, write audit entries)

Define:
- Batch size for re-classification jobs
- API rate limiting (respect Claude API rate limits — P2-S4 defined Haiku batch size 3)
- Database write batching
- Progress tracking (how does an operator monitor a re-classification job?)
- Inngest function design: should bulk re-classification be one long-running function or a fan-out of individual entity re-classifications?

Recommend the Inngest architecture with specific function signatures and step patterns.

**E) Rollback:**

If a bulk re-classification produces worse results than the originals:
- Can the re-classification be rolled back?
- The audit trail should support this — define the rollback query (restore the previous classification for all entities re-classified in a specific job)
- Define the rollback decision criteria (how does an operator decide to rollback?)

### 4. Storage and Indexing Strategy

The audit trail will grow significantly:
- 99K entities × average 2 domain assignments × audit entry each = ~200K initial rows
- Ongoing: new entities + re-classifications + corrections add rows daily
- Non-federal sources add another dimension of volume

Define:
- Required indexes (which columns are queried most frequently?)
- Partitioning strategy (by date? by jurisdiction? by source type?)
- Archival approach (when can old audit entries be moved to cold storage?)
- Estimated storage growth rate

## Deliverable Format

Produce a single structured markdown document. Include SQL DDL for schema extensions, SQL queries for all metric calculations, and Inngest function pseudocode for the bulk re-classification pipeline. The scope determination queries in Section 3A must be executable SQL.
```

---

## Execution Notes

### Web Route Sessions (P3-S1, P3-S2)

These sessions need live verification of:

**P3-S1:**
- FAC chapter/rule structure at flrules.org
- Current FL board organization under DOH and AHCA
- Actual FAC numbering patterns for each board
- Structured metadata fields on individual FAC rules (statutory authority citations, law implemented references, effective dates, rule history) — these are potential free classification signals

**P3-S2:**
- Current FL legislative committee structure (Senate and House)
- FL bill subject code taxonomy (if it exists as a structured system)
- Structured data fields available on bills via myfloridahouse.gov and flsenate.gov (subject codes, committee assignments, related bill links, amendment document structure) — determines whether classification is rule-based or AI-dependent
- FL board meeting minutes format comparison across 2-3 boards (Board of Medicine, Board of Pharmacy, AHCA) — informs whether extraction PRP needs per-board parsing strategies

**Cross-check protocol for web sessions:** After deep research produces outputs, verify that all domain codes reference P1-S4's actual taxonomy nodes. If a web session discovers a FL regulatory concept that doesn't map to any existing taxonomy node, flag it as a taxonomy gap with a recommended new node placement — don't silently assign it to a wrong domain.

### API Route Sessions (P3-S3 through P3-S7)

Pure synthesis from upstream outputs. The orchestrator injects the specified context inputs. Each session prompt is self-contained — no external verification needed.

### Output Quality Checks

Before marking any session complete, verify:
1. All domain codes reference P1-S4's actual taxonomy nodes (no invented domains)
2. All scoring values fall within P1-S3's defined ranges (A: 0-0.45, K: 0-0.40, D: 0-0.15, B: 0-0.10)
3. All SQL references real table/column names from P2-S1's schema
4. All TypeScript extends real interfaces from P2-S1
5. No session redesigns what P2 already delivered — only extends
