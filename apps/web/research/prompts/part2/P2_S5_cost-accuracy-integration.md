# Cedar Classification Framework — Part 2, Session 5 of 5

# Cost Model, Accuracy Budget & Integration Reference

> **Orchestrator note**: This prompt expects the following outputs pre-injected as context:
> - `P1_S8-C` — Implementation reference (458 total rules, coverage: 85% eCFR structural, 75% FR agency, 95% openFDA dataset, 25% web by rules)
> - `P2_S1` — Pipeline architecture + Stages 1-2 specification (S3 decision tree implementation, jurisdiction-scoped schema, stage interfaces)
> - `P2_S2` — Stage 3a keyword engine specification (S3 keyword operationalization, S7-C cross-classification triggers)
> - `P2_S3` — Stage 3b embedding strategy (deferred optimization spec with activation criteria)
> - `P2_S4` — Stages 4-5 AI classifier + irrelevance confirmation (prompt templates, batching, confidence tiers, feedback loop)
>
> `P1_S8-C` is in `research/outputs/part1/`. P2 outputs are in `research/outputs/part2/`. Read all fully before proceeding.
>
> **This is the synthesis session.** Reference specific data structures, thresholds, coverage estimates, and configurations from P2-S1 through S4 — do not reinvent them. Anchor all cost and accuracy estimates to S8-C's published coverage numbers.

---

## Platform Context

Cedar is a regulatory intelligence platform for independent Florida medical practices (14 practice types). Cedar's knowledge graph contains ~99,000 federal regulatory entities classified through a five-stage pipeline into a domain taxonomy (11 L1, 55 L2, ~320 L3-L6, ~390 total).

### Ground Truth Numbers from P1

S8-C provides the coverage estimates that anchor this entire analysis:

| Source Type | Rule-Based Coverage | AI Fallback Needed |
|---|---|---|
| eCFR entities | **85%** by CFR structural rules | ~15% of eCFR volume |
| Federal Register | **75%** by agency rules | ~25% of FR volume |
| openFDA records | **95%** by dataset filters | ~5% of openFDA volume |
| Web content (future) | **25%** by rules | ~75% of web volume |

**Note**: S8-C provides coverage percentages but does not break down the 99K corpus by source type. The first task below is to derive the per-source entity counts from the actual `kg_entities` table (query `SELECT source_type, COUNT(*) FROM kg_entities GROUP BY source_type`), then apply S8-C's percentages to calculate per-stage volumes.

S8-C counts **458 total classification rules**: 414 CFR structural (113 Title 21, 62 Title 42, 239 other titles), 26 agency, 18 openFDA dataset.

The existing codebase has **22 rules** in `inngest/corpus-classify.ts`.

### What This Session Produces

1. **Cost model** — per-stage and total cost anchored to S8-C's numbers
2. **Accuracy budget** — per-stage accuracy, error concentration, weighted overall
3. **Error taxonomy** — classification error types with detection and mitigation
4. **Human review priority algorithm** — HITL bandwidth allocation
5. **Integration reference** — codebase connection points, PRP sequencing

---

## Research Objective 1: Cost Model

### 1A. Initial Corpus Classification (99K Entities)

Using S8-C's coverage percentages and P2-S1 through S4's specifications, produce the per-stage cost breakdown.

**Stage volume calculation**:

First, determine the per-source entity counts from P2-S1's analysis or by querying the actual corpus. Then apply S8-C's coverage percentages:

Stage 1 (Structural) processes all 99K. Using S8-C's coverage rates:
- eCFR: 85% classified structurally, remainder to Stage 2
- FR: documents with `cfr_references` field get structural classification — estimate what percentage of FR entities have this field populated (reference P2-S1's analysis). FR entities without CFR references fall through to Stage 2.
- openFDA: 95% classified by dataset filters, remainder to Stage 2

Stage 2 (Metadata) processes unclassified from Stage 1. Using S8-C's 75% FR agency coverage:
- Apply agency routing + document type scoring
- Calculate how many entities resolve at Stage 2 vs. pass to Stage 3a

Stage 3a (Keywords) processes: (a) unclassified entities for primary classification, (b) cross-classification pass on already-classified entities

Stage 4 (AI Classifier) processes: the "review" zone entities (composite score 0.40-0.59) + S8-A device refinement entities

Stage 5 (Irrelevance) processes: remaining unclassified + low-score entities

Fill in this table with precise calculations:

| Stage | Entities In | Classified Here | Pass Through | Cost/Entity | Total Cost | Time Estimate |
|---|---|---|---|---|---|---|
| 1: Structural | 99,000 | ? | ? | $0 | $0 | ? |
| 2: Metadata | ? | ? | ? | $0 | $0 | ? |
| 3a: Keywords | ? (primary) + ? (cross-class) | ? | ? | $0 | $0 | ? |
| 4: AI Classifier | ? | ? | ? | $? | $? | ? |
| 5: Irrelevance | ? | ? | N/A | $? | $? | ? |
| **Total** | | | | | **$?** | **?** |

**Stage 4 cost calculation (precise)**:
- Entity count reaching Stage 4 (from the volume cascade above)
- Tokens per entity (reference P2-S4's batch analysis: system prompt + taxonomy context + entity data + output)
- Batch size (reference P2-S4's recommendation)
- Calls needed = entities ÷ batch size
- Model pricing: look up current Anthropic API rates for the model P2-S4 recommended. Calculate: (input tokens × input price) + (output tokens × output price) per call
- Total Stage 4 cost

**S8-A AI-fallback refinement**: 12 flagged parts (9 device classification parts in the 862-884 range + Parts 250, 209, 4/70) × average entities per part = additional Stage 4 calls. Calculate separately since these need L3+ refinement with targeted taxonomy context.

### 1B. The 22 → 458 Rule Expansion ROI

Quantify the engineering investment justification:

| Metric | 22 Rules (Current) | 458 Rules (P1) | Delta |
|---|---|---|---|
| Stage 1 coverage (eCFR) | ? | ~85% | +? |
| Stage 2 coverage (FR agency) | ? | ~75% | +? |
| Entities reaching Stage 4 | ? | ~18,950 | -? |
| Stage 4 API cost (initial) | $? | $? | -$? |
| Monthly ongoing Stage 4 cost | $? | $? | -$? |

Estimate the current 22-rule coverage (likely ~30-40% of what 458 achieves) and calculate the cost savings from the expansion.

### 1C. Ongoing Daily Ingestion Cost

New entities from the daily pipeline (Federal Register, eCFR updates, openFDA):

| Daily Volume | Monthly Entities | Est. % to Stage 4 | Monthly Stage 4 Cost | Monthly Total |
|---|---|---|---|---|
| 50/day | 1,500 | ? | $? | $? |
| 100/day | 3,000 | ? | $? | $? |
| 200/day | 6,000 | ? | $? | $? |

The percentage reaching Stage 4 should be lower for daily ingestion than the initial corpus, because:
- New FR documents overwhelmingly come from the 6 High-relevance agencies (S3)
- eCFR updates are structural by definition
- The pipeline improves over time as corrections feed back

### 1D. Web Content Cost Projection

S8-C estimates only 25% of web content is classifiable by rules. When Cedar adds web-scraped sources (FDA guidance docs, state board notices, court filings):

- 75% of web entities will reach Stage 4
- At 50 new web entities/day: ~37 to Stage 4 = X additional monthly cost
- At 200 new web entities/day: ~150 to Stage 4 = X additional monthly cost

This projection justifies P2-S3's embedding strategy activation criteria — at what web content volume does activating Stage 3b (embeddings) break even against Stage 4 API costs?

### 1E. Cost Optimization Roadmap

Define actions at each spend level:

| Monthly Stage 4 Spend | Action |
|---|---|
| < $50 | No optimization needed. Focus on accuracy via HITL. |
| $50-200 | Optimize batch grouping (P2-S4). Switch to Haiku for clear-cut entities. |
| $200-500 | Evaluate Stage 3a keyword expansion for highest-volume Stage 4 domains. |
| $500-1000 | Activate P2-S3 embeddings for web content. Consider domain-specific fine-tune. |
| > $1000 | Fine-tune local classification model. Break-even analysis below. |

**Fine-tuning break-even**: At what monthly Stage 4 volume does fine-tuning a local model (compute + infrastructure + maintenance) become cheaper than Claude API calls? Factor in:
- Fine-tuning compute (one-time)
- Inference infrastructure (ongoing: Railway GPU or equivalent)
- Maintenance (periodic retraining as taxonomy evolves)
- Required training data (reference P2-S3's minimum per domain)

---

## Research Objective 2: Accuracy Budget

### 2A. Per-Stage Accuracy

Estimate accuracy based on each stage's method:

| Stage | Entities Classified | Accuracy (L1) | Accuracy (L2) | Accuracy (L3+) | Primary Error Mode |
|---|---|---|---|---|---|
| 1: Structural | ? | ~99% | ~95% | ~90% | Multi-domain CFR parts, S8-A device parts |
| 2: Metadata | ? | ~95% | ~80% | N/A (too coarse) | Broad agencies (HHS parent), missing sub-agency |
| 3a: Keywords | ? | ~90% | ~80% | ~70% | Homonym risk domains, over-classification |
| 4: AI Classifier | ? | ~92% | ~85% | ~80% | Novel entity types, taxonomy boundary ambiguity |
| 5: Irrelevance | ? | ~90% binary accuracy | N/A | N/A | Borderline entities |

Refine these estimates using the specific methods from P2-S1 through S4.

### 2B. Overall Weighted Accuracy

```
Overall accuracy = Σ (stage_volume × stage_accuracy) / total_corpus
```

Since the majority of entities are classified at Stages 1-2 (highest accuracy), the weighted average should be high. Calculate:

- **Before HITL review**: weighted accuracy after pipeline completion
- **After initial review round**: accuracy after reviewing the ~5-10% flagged items
- **Steady-state (3+ months)**: accuracy with continuous HITL corrections and prompt improvements

### 2C. Per-Domain Accuracy

Some domains are easier to classify:

| L1 Domain | Expected Accuracy | Primary Classification Stage | Notes |
|---|---|---|---|
| `controlled-substances` | High | Stage 1 (21 CFR 1300s) | Strong structural signals, unambiguous keywords |
| `compounding` | High | Stage 1 + 3a | 503A/503B terms are distinctive |
| `fda-regulation` | Moderate-high | Stage 1 + 4 | Large domain, device parts need AI refinement |
| `medicare-billing` | High | Stage 1 (42 CFR 400-600) | Strong structural signals |
| `hipaa-privacy` | High | Stage 1 (45 CFR 160-164) | Narrow CFR range, specific keywords |
| `telehealth` | Moderate | Stage 2 + 3a | Cross-cuts multiple agencies and CFR titles |
| `advertising-marketing` | Moderate | Stage 3a + 4 | High homonym risk, requires disambiguation |
| `clinical-operations` | Moderate | Stage 3a + 4 | Broad domain, overlaps with many others |
| `fraud-compliance` | Moderate-high | Stage 2 (OIG) + 3a | Strong agency signal for OIG content |
| `business-operations` | Moderate | Stage 2 + 3a | Multi-agency, high keyword ambiguity |
| `state-regulations` | Low (current) | Stage 4 | Minimal federal content; will improve with state sources |

Refine with specific coverage from each stage.

---

## Research Objective 3: Error Taxonomy

Define each error type with full specification:

### Error Type 1: Domain Confusion (Wrong L1)
- **Severity**: High
- **Frequency**: ~2-5% of Stage 2+3a classifications
- **Source stages**: Stage 2 (HHS → could be any of 6 subdomains), Stage 3a (keyword overlap)
- **Example**: HHS privacy guidance → `clinical-operations` instead of `hipaa-privacy`
- **Detection**: Cross-reference entity agency with assigned domain (FDA entity in non-FDA domain → flag)
- **Mitigation**: Agency-domain consistency check as post-classification validation

### Error Type 2: Subdomain Confusion (Right L1, Wrong L2/L3)
- **Severity**: Medium
- **Frequency**: ~8-15% of Stage 3a+4 classifications
- **Source stages**: Stage 3a (keyword overlap between subdomains), Stage 4 (taxonomy boundary ambiguity)
- **Example**: FDA drug enforcement → `fda-regulation.drugs` instead of `fda-regulation.enforcement`
- **Detection**: Confusion matrix tracking per P2-S4's specification
- **Mitigation**: Negative keywords in P2-S2's clusters; disambiguation examples in Stage 4 prompt

### Error Type 3: Missing Cross-Classification
- **Severity**: Medium
- **Frequency**: ~20-30% of multi-domain entities (per S7-C's 187 triggers)
- **Source stages**: Stage 3a (cross-classification recall is limited by keyword coverage)
- **Example**: Telehealth prescribing rule → classified as `telehealth.prescribing` but missing `controlled-substances.prescribing`
- **Detection**: Audit against S7-C triggers — flag entities in one side of a documented trigger pair but missing the other
- **Mitigation**: S7-C trigger integration in Stage 3a (P2-S2) and as few-shot examples in Stage 4 (P2-S4)

### Error Type 4: Over-Classification
- **Severity**: Low-medium
- **Frequency**: ~5-10%
- **Source stages**: Stage 3a (keyword greedy matching), Stage 4 (model caution)
- **Example**: General HHS rulemaking → 6+ domains when truly relevant to 2
- **Detection**: Flag entities with 4+ assignments; check whether secondaries add practice-type coverage
- **Mitigation**: P2-S2's max secondary domains cap; P2-S4's classification cap

### Error Type 5: Confidence Miscalibration
- **Severity**: High (bypasses review)
- **Frequency**: ~2-5% of high-confidence classifications
- **Source stages**: Stage 1 (multi-domain CFR parts at 1.0 confidence), Stage 4 (model overconfidence)
- **Detection**: QA sampling (P2-S4), confusion pattern detection
- **Mitigation**: Cap Stage 1 confidence at 0.95 for known multi-domain parts; Stage 4 confidence calibration

### Error Detection System

Define automated checks:
- **Confusion matrix**: updated after each HITL correction, tracked per domain pair
- **Agency-domain consistency**: post-classification validation (is this agency's content typically in this domain?)
- **S7-C trigger audit**: periodic check for missing cross-classifications
- **Over-classification alert**: entities with 4+ domains flagged for review
- **Confidence drift**: rolling average confidence per stage, alert on significant shifts

---

## Research Objective 4: Human Review Priority

### 4A. Priority Scoring

```
priority = w1 × (1 - confidence) + w2 × impact + w3 × confusion_risk + w4 × recency
```

Where:
- `confidence`: from Stage 4 AI classification (lower = higher priority)
- `impact`: count of practice types where assigned domain has relevance ≥ Medium (from S4's practice-type tables, max 14)
- `confusion_risk`: binary — model reported uncertainty OR domain is in a known confusion pair from the confusion matrix
- `recency`: time-decayed score favoring newer entities

Recommend specific weights (w1-w4) and normalization approach.

### 4B. Review Effort Estimates

Using the accuracy estimates from 2A:

| Target Accuracy | Reviews Needed (Initial) | Reviews Needed (Monthly) | Hours (2 min/entity) |
|---|---|---|---|
| 90% overall | ? | ? | ? |
| 95% overall | ? | ? | ? |
| 98% overall | ? | ? | ? |

### 4C. Diminishing Returns

At what point does additional review stop meaningfully improving accuracy? Estimate:
- First 500 reviews: correct systematic errors (high ROI)
- 500-2000: correct edge cases (moderate ROI)
- 2000+: mostly confirming correct classifications (low ROI)

Recommend the "good enough" review volume.

---

## Research Objective 5: Integration Reference

### 5A. Codebase Connection Points

| P2 Component | Existing Code | Integration |
|---|---|---|
| Pipeline orchestrator | `inngest/corpus-classify.ts` (22 rules) | Replace with multi-stage orchestrator implementing S3 decision tree |
| Classification rules | `classification_rules` table | Migrate schema to jurisdiction-scoped design, expand 22 → 458 rules |
| HITL routing | Module 6B review queue | Add priority scoring from 4A, connect Stage 4 low-confidence entities |
| Classification logging | `kg_classification_log` | Add columns per P2-S4's schema |
| Configuration | (new) | Create `classification_config` table per P2-S4 |
| Keyword engine | (new) | New Inngest function per P2-S2 |
| AI classifier | (new) | New Inngest function per P2-S4 |

For each: extension vs. replacement, migration steps, breaking changes, implementation order.

### 5B. PRP Sequencing

Recommended implementation order:

| PRP | Scope | Dependencies | Estimated Size |
|---|---|---|---|
| PRP-1: Schema | Jurisdiction-scoped `classification_rules`, config table, log extensions | None | Medium |
| PRP-2: Rule Seed | 458 rule INSERT statements, exclusion lists | PRP-1 | Small |
| PRP-3: Pipeline Orchestrator | Multi-stage Inngest function implementing S3 decision tree | PRP-1, PRP-2 | Large |
| PRP-4: Keyword Engine | Stage 3a matching, scoring, cross-classification | PRP-1, PRP-3 | Large |
| PRP-5: AI Classifier | Stage 4 Claude API integration, prompt management | PRP-1, PRP-3 | Medium |
| PRP-6: Irrelevance Check | Stage 5 batch confirmation | PRP-5 | Small |
| PRP-7: HITL Integration | Priority scoring, queue routing, correction tracking | PRP-1, PRP-3, PRP-5 | Medium |
| PRP-8: Monitoring | Error detection, confidence calibration, cost tracking | All above | Small |

For each: key files to create/modify, critical path dependencies.

### 5C. State Source Accommodation

Flag P2 decisions that need extension for state sources:

| Component | Federal Implementation | State Extension Needed |
|---|---|---|
| Citation parser | CFR format (`21 CFR 1306`) | Florida: `F.A.C. 64B8-9.003`, `F.S. §458.331` |
| Agency routing | 26 federal agencies | FL DBPR, FL Board of Medicine, etc. |
| Keyword rules | 237 federal phrases | Some shared, some state-specific (FL statute numbers) |
| Exclusion list | ~345 federal agencies | State agency exclusion lists |
| Pipeline config | Federal thresholds | Jurisdiction-specific threshold overrides |
| Rule loading | `WHERE jurisdiction = 'federal'` | `WHERE jurisdiction IN ('federal', 'FL')` |

P3's job: produce the state-specific rule sets. P2's architecture accommodates them.

### 5D. Monitoring Metrics

| Metric | Calculation | Alert Threshold | Action |
|---|---|---|---|
| Daily Stage 4 cost | Token usage × API price | > $X/day | Review Stage 3a coverage for gaps |
| Stage 4 volume | Entities/day reaching Stage 4 | > N/day (suggests rule degradation) | Check for new agency/source types |
| Avg confidence by stage | Mean confidence from `kg_classification_log` | Below threshold | Accuracy drift, review prompts |
| HITL queue depth | Unreviewed entities count | > M items | Staffing alert |
| Confusion pattern count | New A→B corrections above threshold | Any new pattern | Prompt improvement needed |
| Cross-classification coverage | % of S7-C triggers activated | < 50% | Stage 3a keyword coverage gap |
| Classification latency (p95) | Pipeline end-to-end time | > T seconds | Performance investigation |

Define specific numeric thresholds for each.

---

## Deliverable Checklist

Produce all of the following as a single structured markdown document:

- [ ] Initial corpus cost breakdown (per-stage, precise Stage 4 calculation with current API pricing)
- [ ] 22 → 458 rule expansion ROI table
- [ ] Ongoing daily ingestion cost table (50/100/200 entities/day)
- [ ] Web content cost projection
- [ ] Cost optimization roadmap by spend level
- [ ] Fine-tuning break-even analysis
- [ ] Per-stage accuracy estimates (L1, L2, L3+ levels)
- [ ] Overall weighted accuracy (before review, after review, steady-state)
- [ ] Per-domain accuracy table
- [ ] Complete error taxonomy (5 types with detection and mitigation)
- [ ] Error detection system specification
- [ ] HITL priority scoring formula with recommended weights
- [ ] Review effort estimates (90%/95%/98% targets)
- [ ] Diminishing returns analysis with recommendation
- [ ] Codebase integration mapping table
- [ ] PRP sequencing with dependencies and scope
- [ ] State source accommodation table
- [ ] Monitoring metrics with specific alert thresholds
