# Cedar Classification Framework — Part 3, Session 2 of 7

# FL Legislative Activity & Board Minutes Classification

> **Orchestrator note**: This prompt expects the following upstream session outputs pre-injected as context:
> - `P1_S4` — Domain taxonomy (11 L1 domains, 55 L2 subdomains, ~320 L3-L6 nodes)
> - `P2_S1` — Pipeline architecture (jurisdiction-scoped schema, `CitationParser` interface, 5-stage pipeline spec)
> - `P3_S1` — FL state board rules mapping (FAC-to-domain tables, FL agency A-scores, FL-specific keywords, cross-classification patterns, federal reference detection patterns, FL citation parser spec)
>
> All outputs are in `research/outputs/`. Read them fully before proceeding.

---

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
