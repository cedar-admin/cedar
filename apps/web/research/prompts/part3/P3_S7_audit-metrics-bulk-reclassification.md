# Cedar Classification Framework — Part 3, Session 7 of 7

# Cross-Cutting Concerns — Audit Extension, Metrics & Bulk Re-Classification

> **Orchestrator note**: This prompt expects the following upstream session outputs pre-injected as context:
> - `P2_S4` — AI classifier specification (`kg_classification_log` schema with `ai_reasoning`, `confidence_scores`, `cross_domains`, correction tracking, confusion matrix analysis)
> - `P2_S5` — Cost model + accuracy budget + integration reference (10 monitoring metrics with SQL queries, alert thresholds, dashboard views)
> - `P3_S4` — Authority level assignment rules (complete source type → authority level mapping, hierarchy, conflict resolution, proposed entity protocol, SQL seed data)
> - `P3_S6` — New entity protocol, taxonomy evolution & alerting (taxonomy evolution design, re-classification triggers, alerting rules, real-time entity flow)
>
> All outputs are in `research/outputs/`. Read them fully before proceeding.

---

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
