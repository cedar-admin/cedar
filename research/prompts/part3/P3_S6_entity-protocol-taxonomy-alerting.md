# Cedar Classification Framework — Part 3, Session 6 of 7

# New Entity Protocol, Taxonomy Evolution & Alerting

> **Orchestrator note**: This prompt expects the following upstream session outputs pre-injected as context:
> - `P1_S4` — Domain taxonomy (11 L1 domains, 55 L2 subdomains, ~320 L3-L6 nodes — taxonomy evolution rules must preserve backward compatibility with this structure)
> - `P2_S1` — Pipeline architecture (5-stage pipeline: Structural → Metadata → Keywords+Embeddings → AI → Irrelevance Confirmation; jurisdiction-scoped schema)
> - `P2_S4` — AI classifier specification (prompt templates, confidence tiers: ≥0.85 auto-accept, 0.60-0.84 accept with flag, <0.60 needs review; batch sizing; feedback/correction loop)
> - `P2_S5` — Cost model + accuracy budget + integration reference (10 monitoring metrics with SQL, alert thresholds, dashboard views)
>
> All outputs are in `research/outputs/`. Read them fully before proceeding.

---

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
