# Cedar Classification Framework — Part 3 Manifest

# Non-Federal Source Classification, Authority Levels & Ingestion Protocol

## Overview

Part 3 extends Parts 1 and 2 to non-federal sources. P1 produced the taxonomy and federal classification design. P2 operationalized the classification pipeline. P3 adds FL state source mappings, CMS content classification, authority level assignment, a 50-state normalization framework, runtime operational protocol, and cross-cutting audit/metrics extensions.

**7 sessions** across **3 execution waves**. 2 web-route sessions (FL-specific source verification), 5 API-route sessions (synthesis from P1/P2 outputs).

**Total estimated output**: ~90-100K tokens across 7 sessions

**Critical path**: P3-S1 → P3-S2 and P3-S5 (wave 2) → none required for S3/S4/S6 (wave 1 parallel) → P3-S7 (wave 3, after S4+S6)

---

## Key P1/P2 Ground Truth (Referenced Across All Sessions)

| Output | Key Content | Used By |
|---|---|---|
| P1_S3 | Composite scoring model (A+K+D+B), agency tiers, 237 keywords, doc type classifier, decision tree | P3-S1, P3-S3 |
| P1_S4 | 11 L1, 55 L2, ~320 L3-L6 taxonomy nodes; `state-regulations` L1 with FL-relevant L2s | P3-S1, P3-S2, P3-S3, P3-S4, P3-S6 |
| P2_S1 | 5-stage pipeline, jurisdiction-scoped `classification_rules` table, `CitationParser` interface | All sessions |
| P2_S2 | 237 federal keywords mapped to domain codes with K-scores | P3-S1 (FL keyword additions) |
| P2_S4 | AI classifier spec, confidence tiers (0.85/0.60/<0.60), feedback loop | P3-S6, P3-S7 |
| P2_S5 | 10 monitoring metrics with SQL, state accommodation table, cost model | P3-S5, P3-S6, P3-S7 |

---

## Session Definitions

### P3-S1: FL State Board Rules — FAC Mapping & State Scoring

| Field | Value |
|---|---|
| **Session ID** | `P3_S1` |
| **Prompt file** | `research/prompts/part3/P3_S1_fl-board-rules-mapping.md` |
| **Output file** | `research/outputs/part3/P3_S1.md` |
| **Route** | `web` |
| **Model** | `claude-opus-4-20250514` |
| **Dependencies** | `P1_S3`, `P1_S4`, `P2_S1`, `P2_S2` |
| **Context estimate** | ~58K tokens (upstream) + ~5K (prompt) = ~63K |
| **Output estimate** | ~18K tokens |
| **Wave** | 1 |
| **Parallelizable with** | `P3_S3`, `P3_S4` |

**Focus**: Map all 9 FL boards/agencies to FAC chapters and Cedar domain codes. Assign FL agency A-scores. Define FL-specific keyword additions beyond P2-S2's 237 federal phrases. Identify cross-classification patterns for FL boards. Define federal reference detection regexes for FL rule text. Specify FL-specific `CitationParser` implementation.

---

### P3-S2: FL Legislative Activity & Board Minutes Classification

| Field | Value |
|---|---|
| **Session ID** | `P3_S2` |
| **Prompt file** | `research/prompts/part3/P3_S2_fl-legislative-board-minutes.md` |
| **Output file** | `research/outputs/part3/P3_S2.md` |
| **Route** | `web` |
| **Model** | `claude-opus-4-20250514` |
| **Dependencies** | `P1_S4`, `P2_S1`, `P3_S1` |
| **Context estimate** | ~46K tokens (upstream) + ~5K (prompt) = ~51K |
| **Output estimate** | ~14K tokens |
| **Wave** | 2 (requires P3-S1) |
| **Parallelizable with** | `P3_S5`, `P3_S6` |

**Focus**: Map FL legislative committees to Cedar domains. Define bill subject code → domain mapping. Design omnibus bill classification approach. Define amendment tracking rules. Specify board meeting minutes classification strategy (entity granularity, decision type mapping, confidence calibration). Verify FL board minutes format across 2-3 boards. Board minutes extraction PRP scoping.

---

### P3-S3: CMS Content & Professional Guidelines Classification

| Field | Value |
|---|---|
| **Session ID** | `P3_S3` |
| **Prompt file** | `research/prompts/part3/P3_S3_cms-professional-guidelines.md` |
| **Output file** | `research/outputs/part3/P3_S3.md` |
| **Route** | `api` |
| **Model** | `claude-opus-4-20250514` |
| **Dependencies** | `P1_S3`, `P1_S4`, `P2_S1` |
| **Context estimate** | ~43K tokens (upstream) + ~5K (prompt) = ~48K |
| **Output estimate** | ~15K tokens |
| **Wave** | 1 |
| **Parallelizable with** | `P3_S1`, `P3_S4` |

**Focus**: Define CMS transmittal classification rules (manual chapter → domain mapping, D-scores by transmittal type, ICD/CPT code signals). Define NCD/LCD classification and geographic scope tagging for FL MACs. Classify MLN articles. Map professional associations (AMA, AAFP, ACOG, ASPS, FMA, PCCA, APC) to domains with A-scores and D-scores. Define cross-reference enrichment for guidelines that cite regulations. Produce complete A+K+D+B scoring profiles for all CMS and professional source types.

---

### P3-S4: Authority Level Assignment Rules

| Field | Value |
|---|---|
| **Session ID** | `P3_S4` |
| **Prompt file** | `research/prompts/part3/P3_S4_authority-level-rules.md` |
| **Output file** | `research/outputs/part3/P3_S4.md` |
| **Route** | `api` |
| **Model** | `claude-opus-4-20250514` |
| **Dependencies** | `P1_S4`, `P2_S1` |
| **Context estimate** | ~28K tokens (upstream) + ~4K (prompt) = ~32K |
| **Output estimate** | ~12K tokens |
| **Wave** | 1 |
| **Parallelizable with** | `P3_S1`, `P3_S3` |

**Focus**: Complete source type × document type → authority_level mapping table (zero "?" cells). Define within-source authority level disambiguation logic (FR document type codes → authority levels). Define authority level hierarchy and conflict resolution rules. Design proposed entity protocol (enum expansion vs. status modifier). Produce SQL seed data for authority_level enum, assignment rules table, and hierarchy ranking.

---

### P3-S5: 50-State Normalization Framework

| Field | Value |
|---|---|
| **Session ID** | `P3_S5` |
| **Prompt file** | `research/prompts/part3/P3_S5_50-state-normalization.md` |
| **Output file** | `research/outputs/part3/P3_S5.md` |
| **Route** | `api` |
| **Model** | `claude-opus-4-20250514` |
| **Dependencies** | `P2_S1`, `P2_S5`, `P3_S1` |
| **Context estimate** | ~26K tokens (upstream) + ~5K (prompt) = ~31K |
| **Output estimate** | ~14K tokens |
| **Wave** | 2 (requires P3-S1) |
| **Parallelizable with** | `P3_S2`, `P3_S6` |

**Focus**: Design citation format abstraction layer extending P2-S1's `CitationParser` (normalized citation interface, parser registration pattern, structural mapping portability). Define state board name normalization approach and lookup table design. Define state-specific entity jurisdiction tagging. Produce complete state onboarding checklist with effort estimates per item. Extend P2-S5's state accommodation table.

---

### P3-S6: New Entity Protocol, Taxonomy Evolution & Alerting

| Field | Value |
|---|---|
| **Session ID** | `P3_S6` |
| **Prompt file** | `research/prompts/part3/P3_S6_entity-protocol-taxonomy-alerting.md` |
| **Output file** | `research/outputs/part3/P3_S6.md` |
| **Route** | `api` |
| **Model** | `claude-opus-4-20250514` |
| **Dependencies** | `P1_S4`, `P2_S1`, `P2_S4`, `P2_S5` |
| **Context estimate** | ~39K tokens (upstream) + ~5K (prompt) = ~44K |
| **Output estimate** | ~15K tokens |
| **Wave** | 2 |
| **Parallelizable with** | `P3_S2`, `P3_S5` |

**Focus**: Define real-time single-entity classification flow (pipeline adaptation, relevance gate decision tree, confidence-based routing to Library vs. HITL). Design taxonomy gap detection signals and response protocol. Define taxonomy versioning, backward compatibility rules, and re-classification triggers. Define 4 alert rule types (confidence, anomaly, volume, conflict) with implementable trigger conditions. Extend P2-S5's 10 metrics with 3-5 new operational metrics.

---

### P3-S7: Cross-Cutting — Audit Extension, Metrics & Bulk Re-Classification

| Field | Value |
|---|---|
| **Session ID** | `P3_S7` |
| **Prompt file** | `research/prompts/part3/P3_S7_audit-metrics-bulk-reclassification.md` |
| **Output file** | `research/outputs/part3/P3_S7.md` |
| **Route** | `api` |
| **Model** | `claude-opus-4-20250514` |
| **Dependencies** | `P2_S4`, `P2_S5`, `P3_S4`, `P3_S6` |
| **Context estimate** | ~38K tokens (upstream) + ~5K (prompt) = ~43K |
| **Output estimate** | ~12K tokens |
| **Wave** | 3 (requires P3-S4, P3-S6) |
| **Parallelizable with** | None (final synthesis) |

**Focus**: Extend `kg_classification_log` for authority level audit and non-federal sources. Add jurisdiction-aware audit queries. Reconcile and deduplicate P2-S5 + P3-S6 metrics into a single canonical suite. Add authority level, jurisdiction coverage, source type accuracy, taxonomy gap rate, and re-classification volume metrics. Consolidate admin dashboard layout. Design bulk re-classification pipeline: scope determination algorithm with SQL per trigger type, decision matrix (trigger → stages to re-run), conflict resolution rules, Inngest fan-out architecture, rollback query. Define audit trail indexing and archival strategy.

---

## Dependency Graph

```
P1_S3  ──┐
P1_S4  ──┼──→ P3_S1 [WEB] ──────────────┬──→ P3_S2 [WEB] ──┐
P2_S1  ──┤                               │                   │
P2_S2  ──┘                               └──→ P3_S5 ─────────┤
                                                              │
P1_S3  ──┐                                                    │
P1_S4  ──┼──→ P3_S3 [API] ──────────────────────────────────┤
P2_S1  ──┘                                                    │
                                                              │
P1_S4  ──┐                                                    │
P2_S1  ──┴──→ P3_S4 [API] ──────────────────────────────────┤
                                    │                         │
P1_S4  ──┐                          │                         │
P2_S1  ──┤                          │                         │
P2_S4  ──┼──→ P3_S6 [API] ──────────┤                         │
P2_S5  ──┘                          │                         │
                                    │                         │
                            P2_S4 ──┤                         │
                            P2_S5 ──┴──→ P3_S7 [API] ─────────┘
```

---

## Execution Plan

**Wave 1 (parallel)**:
- P3-S1: FL State Board Rules [WEB]
- P3-S3: CMS Content & Professional Guidelines [API]
- P3-S4: Authority Level Assignment Rules [API]

**Wave 2 (after P3-S1 completes)**:
- P3-S2: FL Legislative Activity & Board Minutes [WEB]
- P3-S5: 50-State Normalization Framework [API]
- P3-S6: New Entity Protocol, Taxonomy Evolution & Alerting [API]

**Wave 3 (after P3-S4 and P3-S6 complete)**:
- P3-S7: Cross-Cutting — Audit Extension, Metrics & Bulk Re-Classification [API]

---

## Context Budget Validation

| Session | Upstream Tokens | Prompt Tokens | Total Input | Under 120K? | Buffer |
|---|---|---|---|---|---|
| P3-S1 | ~58K | ~5K | ~63K | ✅ | ~57K |
| P3-S2 | ~46K | ~5K | ~51K | ✅ | ~69K |
| P3-S3 | ~43K | ~5K | ~48K | ✅ | ~72K |
| P3-S4 | ~28K | ~4K | ~32K | ✅ | ~88K |
| P3-S5 | ~26K | ~5K | ~31K | ✅ | ~89K |
| P3-S6 | ~39K | ~5K | ~44K | ✅ | ~76K |
| P3-S7 | ~38K | ~5K | ~43K | ✅ | ~77K |

All sessions well within the 120K context ceiling. No session at risk.

## Output Token Validation

| Session | Estimated Output | Under 32K? | Buffer |
|---|---|---|---|
| P3-S1 | ~18K | ✅ | ~14K |
| P3-S2 | ~14K | ✅ | ~18K |
| P3-S3 | ~15K | ✅ | ~17K |
| P3-S4 | ~12K | ✅ | ~20K |
| P3-S5 | ~14K | ✅ | ~18K |
| P3-S6 | ~15K | ✅ | ~17K |
| P3-S7 | ~12K | ✅ | ~20K |

---

## Output Quality Checks

Before marking any session complete, verify:
1. All domain codes reference P1-S4's actual taxonomy nodes (no invented domains)
2. All scoring values fall within P1-S3's defined ranges (A: 0-0.45, K: 0-0.40, D: 0-0.15, B: 0-0.10)
3. All SQL references real table/column names from P2-S1's schema
4. All TypeScript extends real interfaces from P2-S1
5. No session redesigns what P2 already delivered — only extends

## Cross-Check Protocol (Web Sessions)

After P3-S1 and P3-S2 complete:
- Verify all domain codes reference P1-S4's actual taxonomy nodes
- If a FL regulatory concept has no matching taxonomy node, flag it as a taxonomy gap with recommended placement — do not assign to a wrong domain

---

## Model String Note

Update `claude-opus-4-20250514` to whatever model identifier your orchestrator expects. The orchestrator's `CLAUDE_MODEL` or equivalent config should point to the latest Opus.
