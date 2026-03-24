# Cedar Classification Framework — Part 3, Session 1 of 7

# FL State Board Rules — FAC Mapping & State Scoring

> **Orchestrator note**: This prompt expects the following upstream session outputs pre-injected as context:
> - `P1_S3` — Non-CFR relevance signals (composite scoring model: `Score = A + K + D + B`, agency tiers, keyword definitions, document type classifier, decision tree, thresholds)
> - `P1_S4` — Domain taxonomy (11 L1 domains, 55 L2 subdomains, ~320 L3-L6 nodes with classification signals)
> - `P2_S1` — Pipeline architecture (jurisdiction-scoped `classification_rules` table, `CitationParser` interface, 5-stage pipeline spec)
> - `P2_S2` — Keyword classification engine (237 federal keyword phrases mapped to domain codes with K-scores)
>
> All outputs are in `research/outputs/part1/` and `research/outputs/part2/`. Read them fully before proceeding.

---

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
