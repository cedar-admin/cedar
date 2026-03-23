# Cedar Classification Framework — Part 2 Manifest

# Classification Pipeline Design

## Overview

Part 2 transforms Part 1's research outputs (taxonomy, rules, signals, mappings) into an implementable classification pipeline specification. P1 produced the design (S3's scoring model and decision tree, S8-C's 458 rules, S7-C's 187 cross-classification triggers). P2 operationalizes that design into engineering artifacts.

All 5 sessions run via API route (pure synthesis, no web verification needed).

**Total estimated output**: ~108K tokens across 5 sessions
**Critical path**: P2-S1 → P2-S4 → P2-S5
**Parallel track**: P2-S1, P2-S2, P2-S3 can run concurrently

---

## Key P1 Ground Truth (Referenced Across All Sessions)

| P1 Output | Key Content | Used By |
|---|---|---|
| S2-F | `RELEVANT_PARTS` Python dict (15 titles → part numbers) | P2-S1 (Stage 1 seed data) |
| S3 | Composite scoring model (A+K+D+B), 210+27 keywords, agency tiers, doc type classifier, decision tree, thresholds (0.50→0.60) | P2-S1 (pipeline logic), P2-S2 (keywords), P2-S5 (thresholds) |
| S4 | 11 L1, 55 L2, ~320 L3-L6 taxonomy nodes (~390 total) with classification signals | P2-S2, P2-S3, P2-S4 (taxonomy reference) |
| S7-C | 187 cross-classification triggers with conditions and frequencies | P2-S2 (cross-class logic), P2-S4 (few-shot examples) |
| S8-A | 12 AI-fallback parts: 9 device (862-884 range) + Parts 250, 209, 4/70 | P2-S1 (Stage 1 flagging), P2-S4 (refinement) |
| S8-C | 458 rules total, coverage: 85% eCFR, 75% FR, 95% openFDA, 25% web | P2-S1 (rule count), P2-S5 (cost anchoring) |

---

## Session Definitions

### P2-S1: Pipeline Architecture + Stages 1-2 (Deterministic Classification)

| Field | Value |
|---|---|
| **Session ID** | `P2_S1` |
| **Prompt file** | `research/prompts/part2/P2_S1_pipeline-architecture.md` |
| **Output file** | `research/outputs/part2/P2_S1.md` |
| **Route** | `api` |
| **Model** | `claude-opus-4-20250514` |
| **Dependencies** | `P1_S2-F`, `P1_S3`, `P1_S8-A`, `P1_S8-B`, `P1_S8-C` |
| **Context estimate** | ~60K tokens (upstream) + ~4K (prompt) = ~64K |
| **Output estimate** | ~25K tokens |
| **Parallelizable with** | `P2_S2`, `P2_S3` |

**Focus**: Translate S3's decision tree into Inngest pipeline. Implement S2-F's `RELEVANT_PARTS` as Stage 1 seed data. Implement S8-C's 26 agency rows and S3's document type classifier as Stage 2. Design jurisdiction-scoped `classification_rules` schema for 50-state expansion. Handle S8-A's 12 AI-fallback parts (9 device + 3 other).

---

### P2-S2: Stage 3a — Keyword Classification Engine

| Field | Value |
|---|---|
| **Session ID** | `P2_S2` |
| **Prompt file** | `research/prompts/part2/P2_S2_keyword-engine.md` |
| **Output file** | `research/outputs/part2/P2_S2.md` |
| **Route** | `api` |
| **Model** | `claude-opus-4-20250514` |
| **Dependencies** | `P1_S3`, `P1_S4`, `P1_S7-C` |
| **Context estimate** | ~61K tokens (S3 ~15K + S4 ~23K + S7-C ~23K) + ~3K (prompt) = ~64K |
| **Output estimate** | ~22K tokens |
| **Parallelizable with** | `P2_S1`, `P2_S3` |

**Focus**: Map S3's 237 keywords to S4's domain codes. Implement S3's K score rules as matching functions. Operationalize S7-C's 187 cross-classification triggers. Build disambiguation engine for S3's 42 homonym-risk phrases. Produce SQL seed data and Inngest function.

---

### P2-S3: Stage 3b — Semantic Embedding Strategy (Deferred)

| Field | Value |
|---|---|
| **Session ID** | `P2_S3` |
| **Prompt file** | `research/prompts/part2/P2_S3_embedding-strategy.md` |
| **Output file** | `research/outputs/part2/P2_S3.md` |
| **Route** | `api` |
| **Model** | `claude-opus-4-20250514` |
| **Dependencies** | `P1_S4` |
| **Context estimate** | ~23K tokens (upstream) + ~3K (prompt) = ~26K |
| **Output estimate** | ~17K tokens |
| **Parallelizable with** | `P2_S1`, `P2_S2` |

**Focus**: Shelf-ready embedding spec. Model evaluation, deployment architecture, pgvector configuration, activation decision criteria with specific measurable thresholds tied to Stage 4 cost.

---

### P2-S4: Stages 4-5 — AI Classifier + Irrelevance Confirmation

| Field | Value |
|---|---|
| **Session ID** | `P2_S4` |
| **Prompt file** | `research/prompts/part2/P2_S4_ai-classifier.md` |
| **Output file** | `research/outputs/part2/P2_S4.md` |
| **Route** | `api` |
| **Model** | `claude-opus-4-20250514` |
| **Dependencies** | `P1_S4`, `P1_S7-C`, `P2_S1` |
| **Context estimate** | ~71K tokens (S4 ~23K + S7-C ~23K + P2-S1 ~25K) + ~4K (prompt) = ~75K |
| **Output estimate** | ~25K tokens |
| **Parallelizable with** | None (requires P2-S1) |

**Focus**: AI classifier for ~15-25% escaping rules. Use S7-C's 187 triggers as few-shot cross-classification examples. Handle S8-A AI-fallback part refinement (9 device + 3 other). Taxonomy pruning for ~390 nodes. Confidence tiers, HITL integration, feedback loop, tunability.

**NOTE**: Context increased from prior estimate due to S7-C addition (~23K). Total ~75K is well within 120K limit.

---

### P2-S5: Cost Model + Accuracy Budget + Integration Reference

| Field | Value |
|---|---|
| **Session ID** | `P2_S5` |
| **Prompt file** | `research/prompts/part2/P2_S5_cost-accuracy-integration.md` |
| **Output file** | `research/outputs/part2/P2_S5.md` |
| **Route** | `api` |
| **Model** | `claude-opus-4-20250514` |
| **Dependencies** | `P1_S8-C`, `P2_S1`, `P2_S2`, `P2_S3`, `P2_S4` |
| **Context estimate** | ~100K tokens (S8-C ~10K + P2-S1 ~25K + P2-S2 ~22K + P2-S3 ~17K + P2-S4 ~25K) + ~3K (prompt) = ~102K |
| **Output estimate** | ~20K tokens |
| **Parallelizable with** | None (final synthesis) |

**Focus**: Anchor cost model to S8-C's exact coverage numbers (85%/75%/95%/25%). Calculate 22→458 rule expansion ROI. Per-stage accuracy, error taxonomy, HITL priority algorithm, PRP sequencing, state source flags, monitoring metrics.

---

## Dependency Graph

```
P1_S2-F ──┐
P1_S3  ───┤
P1_S8-A ──┼──→ P2_S1 ──────────────────────────┐
P1_S8-B ──┤                                     │
P1_S8-C ──┤                                     │
          │                                     ├──→ P2_S4 ──┐
P1_S3  ───┤                                     │    ↑        │
P1_S4  ───┼──→ P2_S2 ──────────────────────────┤    │        │
P1_S7-C ──┼─────────────────────────────────────┘    │        │
          │                                     │    │        │
          └──→ P2_S3 ──────────────────────────┤    │        │
                                                │    │        │
P1_S8-C ────────────────────────────────────────┼────┘        │
                                                │             │
                                                └──→ P2_S5 ←─┘
```

Note: P2-S4 now depends on P1_S7-C directly (for few-shot examples) in addition to P1_S4 and P2_S1.

## Execution Plan

**Wave 1 (parallel)**:
- P2-S1: Pipeline Architecture + Stages 1-2
- P2-S2: Keyword Engine
- P2-S3: Embedding Strategy

**Wave 2 (after S1 completes)**:
- P2-S4: AI Classifier + Irrelevance Confirmation

**Wave 3 (after all complete)**:
- P2-S5: Cost Model + Accuracy Budget + Integration Reference

---

## Context Budget Validation

| Session | Upstream Tokens | Prompt Tokens | Total Input | Under 120K? | Buffer |
|---|---|---|---|---|---|
| P2-S1 | ~60K | ~4K | ~64K | ✅ | ~56K |
| P2-S2 | ~61K | ~3K | ~64K | ✅ | ~56K |
| P2-S3 | ~23K | ~3K | ~26K | ✅ | ~94K |
| P2-S4 | ~71K | ~4K | ~75K | ✅ | ~45K |
| P2-S5 | ~99K | ~3K | ~102K | ✅ | ~18K |

P2-S4's context increased from ~52K to ~75K with S7-C addition — still comfortable.
P2-S5 remains the tightest at ~102K. If it exceeds threshold at runtime, splinter into S5-A (Cost Model) and S5-B (Accuracy + Integration).

## Output Token Validation

| Session | Estimated Output | Under 32K? | Buffer |
|---|---|---|---|
| P2-S1 | ~25K | ✅ | ~7K |
| P2-S2 | ~22K | ✅ | ~10K |
| P2-S3 | ~17K | ✅ | ~15K |
| P2-S4 | ~25K | ✅ | ~7K |
| P2-S5 | ~20K | ✅ | ~12K |

---

## Model String Note

Update `claude-opus-4-20250514` to whatever model identifier your orchestrator expects. The orchestrator's `CLAUDE_MODEL` or equivalent config should point to the latest Opus.
