# Cedar Classification Framework — Part 2, Session 1 of 5

# Pipeline Architecture + Stages 1-2: Deterministic Classification

> **Orchestrator note**: This prompt expects the following upstream session outputs pre-injected as context:
> - `P1_S2-F` — Consolidated CFR allowlist summary (contains production-ready `RELEVANT_PARTS` Python dict mapping all 15 relevant titles to their part numbers)
> - `P1_S3` — Non-CFR relevance signals (complete scoring model: `Score = A + K + D + B`, agency tiers, document type classifier, threshold recommendations, 5-step decision tree)
> - `P1_S8-A` — CFR-to-domain mapping for Titles 21 and 42 (flags 12 parts total requiring AI fallback: 9 device classification parts in the 862-884 range, plus Parts 250, 209, and 4/70 for drug-specific, state interface, and combination product ambiguity)
> - `P1_S8-B` — CFR-to-domain mapping for remaining 13 relevant titles
> - `P1_S8-C` — Implementation reference (458 total classification rules, coverage estimates: 85% eCFR structural, 75% FR agency, 95% openFDA dataset, 25% web content by rules)
>
> All outputs are in `research/outputs/part1/`. Read them fully before proceeding.

---

## Platform Context

Cedar is a regulatory intelligence platform for independent Florida medical practices — med spas, hormone optimization clinics, compounding pharmacies, telehealth providers, weight management practices, and similar specialty practices (14 practice types total). Cedar monitors 71+ regulatory sources and maintains a PostgreSQL knowledge graph on Supabase containing ~99,000 entities ingested from three federal government APIs: eCFR, Federal Register, and openFDA.

These entities need classification into a domain taxonomy (11 L1 domains, 55 L2 subdomains, ~320 nodes at L3-L6, ~390 total) using a multi-stage pipeline that maximizes accuracy while minimizing cost.

### What P1 Already Designed — Your Ground Truth

**S3 delivers a complete classification pipeline design.** The composite scoring model (`Score = A + K + D + B` with weights: agency 0-0.45, keyword 0-0.40, doc type 0-0.15, bonus 0-0.10), threshold recommendations (0.50 for calibration, 0.60 for production), and a 5-step decision tree are the pipeline logic. This session translates that design into running code — Inngest functions, SQL schema, TypeScript interfaces — without redesigning it.

**S8-C counts 458 total classification rules** across three categories: 414 CFR structural mapping rows (113 Title 21, 62 Title 42, 239 other titles), 26 agency mapping rows, and 18 openFDA dataset mapping rows. These rules power Stages 1-2.

**S2-F contains a production-ready `RELEVANT_PARTS` Python dict** mapping all 15 relevant CFR titles to their relevant part numbers. This is the Stage 1 seed data — the lookup table is already defined; this session specifies how to store and query it.

**S8-A flags 12 parts across Title 21 as requiring AI fallback** — 9 device classification parts (862, 864, 866, 868, 870, 874, 876, 882, 884), plus Parts 250, 209, and 4/70 (drug-specific, state interface, and combination product ambiguity). The device parts are the largest cluster. Stage 1 should classify these to L1/L2 structurally but flag them for Stage 4 refinement at L3+.

### Current State of Implementation

Cedar already has:
- **22 classification rules** in `inngest/corpus-classify.ts` (a subset of the 458 identified in P1)
- **HITL review queue** (Module 6B) for human verification
- **Database schema**: `kg_entities`, `kg_domains` (hierarchical), `kg_entity_domains` (many-to-many with `relevance_score`, `classified_by`, `is_primary`), `kg_classification_log` (audit trail), `classification_rules` (configurable, JSONB `rule_config`)

### Critical Architecture Requirement: 50-State Expansion

Cedar launches in Florida but the domain taxonomy is already jurisdiction-agnostic (`state-regulations` L1 domain with L2 nodes are scaffolded). The pipeline architecture must treat **structural classification rules as a generic interface** — CFR part matching is one implementation for federal content, Florida Administrative Code matching is another for state content. Both produce the same domain code outputs.

Design the schema so rule sets are scoped by jurisdiction (`federal`, `FL`, `CA`, etc.) and the pipeline loads the relevant rule sets based on source jurisdiction. State sources will register their own rule sets (agency mappings, structural rules, keywords) without changing core pipeline code.

### What This Session Produces

Engineering-ready specifications that translate S3's decision tree into:

1. **Pipeline architecture** — Inngest function chain implementing S3's 5-step decision tree, with jurisdiction-scoped rule loading
2. **Stage 1 specification** — CFR structural classification using S2-F's `RELEVANT_PARTS` and S8-A/B's mapping rows
3. **Stage 2 specification** — Metadata classification using S8-C's 26 agency rows and S3's document type classifier
4. **Jurisdiction-scoped schema** — `classification_rules` table supporting federal + future state rule sets
5. **Coverage validation** — confirm per-stage estimates against S8-C's published numbers

---

## Research Objective 1: Pipeline Architecture

### 1A. Translate S3's Decision Tree into an Inngest Pipeline

S3 Deliverable 5 defines this exact decision tree:

```
1. Does document have CFR references?
   → YES: Route to CFR pipeline (Sessions 1-2). Done.
   → NO: Continue.

2. Is the agency on the exclusion list?
   → YES: Check keywords. If K ≥ 0.40 AND D ≥ 0.10, flag for review. Otherwise, exclude.
   → NO: Continue.

3. Calculate composite score: S = A + K + D + B

4. S ≥ 0.60 → RELEVANT. Classify by practice type. Include in feed.
   S 0.40-0.59 → REVIEW. Apply secondary filters. Flag for calibration.
   S 0.20-0.39 → LOW PRIORITY. Store but do not surface.
   S < 0.20 → IRRELEVANT. Exclude.

5. For openFDA records: Skip composite scoring. Apply dataset-specific
   field filters from Deliverable 4. Classify by practice type based on
   product/device characteristics.
```

This maps to pipeline stages:

- **Step 1** → Stage 1 (Structural Classification): CFR reference parsing + domain lookup
- **Steps 2-3** → Stage 2 (Metadata): Agency exclusion + A score + D score
- **K component of Step 3** → Stage 3a (Keywords, P2-S2): Adds K score to partial A+D
- **Step 4 thresholds** → Stage transition: route to RELEVANT / REVIEW / LOW PRIORITY / IRRELEVANT
- **Step 5** → openFDA branch: separate path using dataset-specific filters from S3 Deliverable 4
- **REVIEW zone entities** → Stage 4 (AI classifier, P2-S4): ~15-25% that escape rules
- **IRRELEVANT candidates** → Stage 5 (P2-S4): lightweight confirmation

Translate this into Inngest functions. Produce:

- **ASCII data flow diagram** showing entity routing through all stages, including the openFDA branch and the S3 decision tree steps mapped to stages
- **Inngest orchestrator function** (TypeScript signature): receives entity/batch, determines jurisdiction, loads rule set, routes through stages
- **Per-stage Inngest functions** (TypeScript signatures): each receives entity + accumulated `StageOutput`, returns updated output
- **Stage transition function** (TypeScript): evaluates S3's thresholds after each stage and decides next routing

Key design decisions to address:
- S3's Step 2 exclusion check references K (keywords), which isn't calculated until Stage 3a. Design: Stage 2 flags excluded-agency entities as "pending exclusion check" → Stage 3a calculates K → transition logic applies S3 Rule 2 (if K ≥ 0.40 AND D ≥ 0.10, override exclusion for review).
- Some entities may resolve at Stage 2 alone: if A + D ≥ 0.60 with clear single-domain agency mapping, classification is complete without keywords. Define when early resolution is appropriate vs. when keyword cross-classification should still run.
- Batch vs. real-time: initial 99K corpus runs as batch (Inngest bulk trigger); daily 50-200 entities run per-entity or small-batch.

### 1B. Jurisdiction-Scoped Rule Loading

Design rule loading for 50-state expansion:

```typescript
interface RuleSet {
  jurisdiction: string;  // 'federal' | 'FL' | 'CA' | etc.
  structural_rules: StructuralRule[];
  agency_rules: AgencyRule[];
  exclusion_rules: string[];         // Agency slugs to exclude
  dataset_rules: DatasetRule[];      // openFDA or state-specific dataset filters
}
```

Define:
- How the pipeline determines an entity's jurisdiction (from source metadata)
- How rule sets are loaded (cached per jurisdiction on function startup? queried per batch?)
- How federal rules and state rules interact (state entity gets state rules + relevant federal cross-references?)
- The generic `StructuralRule` interface that CFR matching and state admin code matching both implement

### 1C. TypeScript Interfaces

Define interfaces all stages share. The `score_components` field must match S3's scoring model exactly:

```typescript
interface StageOutput {
  entity_id: string;
  stage: 'structural' | 'metadata' | 'keyword' | 'embedding' | 'ai' | 'irrelevance';
  score_components: {
    A: number;  // Agency signal: 0, 0.05, 0.10, 0.15, 0.25, or 0.45 per S3
    K: number;  // Keyword signal: 0-0.40 per S3
    D: number;  // Document type signal: 0-0.15 per S3
    B: number;  // Bonus modifiers: 0-0.10 per S3
  };
  composite_score: number;  // A + K + D + B, capped at 1.0
  classifications: DomainAssignment[];
  s3_tier: 'relevant' | 'review' | 'low_priority' | 'irrelevant' | 'pending';
  needs_review: boolean;
  review_reason?: string;
  partial_signals: PartialSignal[];
}
```

Complete `DomainAssignment`, `PartialSignal`, `ClassificationResult`, `PipelineConfig`, and all supporting types.

### 1D. PipelineConfig

S3's thresholds become configurable defaults:

```typescript
interface PipelineConfig {
  // S3 threshold values
  relevant_threshold: number;      // Default: 0.60 (production), 0.50 (calibration)
  review_threshold: number;        // Default: 0.40
  low_priority_threshold: number;  // Default: 0.20
  
  // S3 agency scores
  high_agency_score: number;       // Default: 0.45
  medium_agency_score: number;     // Default: 0.25
  low_agency_score: number;        // Default: 0.10
  // ... etc.
}
```

Complete this interface. Include all S3 scoring parameters, stage enable/disable flags, batch sizes, HITL routing rules, and jurisdiction-specific overrides. Specify storage (database table for runtime tuning).

### 1E. Jurisdiction-Scoped Classification Rules Table

Redesign `classification_rules` to support 458 federal rules + future state rules:

```sql
CREATE TABLE classification_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction text NOT NULL DEFAULT 'federal',
  rule_type text NOT NULL,  -- 'structural', 'agency', 'dataset', 'keyword', 'exclusion'
  -- ... complete the schema
);
```

Requirements:
- Express all 458 P1 rules (reference S8-C's SQL seed template for structure)
- Index by `jurisdiction + rule_type` for efficient loading
- Foreign key to `kg_domains` for target domain
- `priority` for precedence ordering
- `is_active` for runtime enable/disable
- `rule_config` JSONB flexible enough for CFR part ranges, agency slug matching, openFDA field filters, and future state admin code matching
- Support for S8-A's 12 AI-fallback parts (9 device + 3 other) via an `ai_refinement_needed` flag

---

## Research Objective 2: Stage 1 — Structural Classification

### 2A. CFR Citation Parser

Design a jurisdiction-aware citation parser interface:

```typescript
interface CitationParser {
  jurisdiction: string;
  parse(raw: string): ParsedCitation | null;
}
```

For the federal implementation, handle: `21 CFR 1306`, `21 CFR Part 1306`, `21 CFR §1306.04`, `Title 21, Chapter II, Part 1306`, and malformed variants. Output: `{ title: number, part: number, section?: number }`.

Define the interface so a Florida parser (`F.A.C. 64B8-9.003`) can implement the same contract.

### 2B. Lookup Algorithm Using S2-F

S2-F's `RELEVANT_PARTS` dict is the lookup table. Define the algorithm:

1. Parse citation → extract title + part
2. Look up in `classification_rules` WHERE `jurisdiction = 'federal'` AND `rule_type = 'structural'` AND title/part match
3. If match: assign domain from rule, confidence = 1.0 (deterministic)
4. If title is relevant but part is not in the allowlist: entity is in an irrelevant CFR section → tag as low priority
5. If title is irrelevant (not in the 15): likely irrelevant → tag as low priority
6. If citation can't be parsed: proceed to Stage 2

Special handling for S8-A's 12 AI-fallback parts: the 9 device classification parts (862, 864, 866, 868, 870, 874, 876, 882, 884) are classified at `fda-regulation.devices` (L2) but set `ai_refinement_needed = true` for L3+ resolution at Stage 4. Parts 250, 209, and 4/70 are similarly flagged for their respective L2 domains.

### 2C. Federal Register CFR Inheritance

FR documents have `cfr_references` listing amended CFR sections:
- Extract title/part from each reference
- Look up each in the structural rules
- If multiple domains: primary = domain with most references, others = secondary
- If no parseable references: proceed to Stage 2

### 2D. openFDA Structural Classification

Per S3 Rule 3, openFDA records bypass composite scoring entirely. Using S8-C's 18 dataset mapping rows:
- Route by dataset endpoint → primary domain
- Apply record-level field filters from S3 Deliverable 4 (pharm_class, route, advisory_committee, product_code, etc.)
- A score = 0.45 (always High, all openFDA = FDA)
- Output same `StageOutput` structure for consistency

### 2E. Coverage Validation

Validate against S8-C's estimates:
- 85% of eCFR entities classifiable by structural rules → how many of the 414 CFR rows produce single-domain assignments?
- 95% of openFDA by dataset filters → validated by the 18 dataset rules
- FR documents: coverage depends on `cfr_references` field completeness. What percentage of FR entities in the corpus have this field populated?

---

## Research Objective 3: Stage 2 — Metadata Classification

### 3A. Agency Routing (A Score)

Translate S8-C's 26 agency mapping rows into `classification_rules` INSERT statements:

- Each agency gets its S3 tier score as the `A` value: High = 0.45, Medium = 0.25, Low = 0.10, Borderline = 0.05, Unknown = 0.15
- Sub-agency disambiguation: when FR metadata includes sub-agency (FDA CDER vs. CDRH), route to L2 domain code; parent-only → route to L1
- ~345 excluded agencies from S3: stored as exclusion rules (`rule_type = 'exclusion'`), implementing S3 decision tree Step 2

Produce the complete set of INSERT statements for all 26 agency rules.

### 3B. Document Type Scoring (D Score)

Translate S3 Deliverable 3 into a TypeScript scoring function:

- Input: FR document's `type` field (enum: RULE, PRORULE, NOTICE, PRESDOCU) and `action` field (free text)
- Output: `D` score per S3's tables
- Implementation: `type` for primary categorization, `action` for subtype via contains-matching (S3 emphasizes: action is free text, use contains-matching)
- S3's exclusion floor: meeting notices, grants, nominations → D = 0.00 → per S3 Rule 4, exclude unless K ≥ 0.40

### 3C. Bonus Modifiers (B Score)

Implement S3's five bonus modifiers:
- Significant rule (EO 12866): +0.05
- Multiple healthcare agencies: +0.05
- Health-and-public-welfare FR section: +0.03
- CFR reference to relevant title/part: +0.10 (override to full relevance — this connects back to Stage 1)
- Active comment period: +0.02

Define how each modifier is detected from entity metadata.

### 3D. Partial Score and Early Resolution

After Stage 2, entity has A + D + B. Define:
- When A + D + B ≥ 0.60 with clear domain mapping → early resolution (classify without waiting for K)
- When A + D + B < 0.60 → proceed to Stage 3a for K
- Per S3 Rule 2: excluded-agency entities are flagged "pending exclusion" for re-evaluation after Stage 3a adds K

---

## Deliverable Checklist

Produce all of the following as a single structured markdown document:

- [ ] ASCII data flow diagram implementing S3's 5-step decision tree as staged pipeline
- [ ] Inngest function signatures for orchestrator and per-stage functions
- [ ] Stage transition logic implementing S3's score thresholds (TypeScript)
- [ ] Jurisdiction-scoped `classification_rules` table (`CREATE TABLE` with all columns, indexes, constraints)
- [ ] `PipelineConfig` interface with S3's thresholds and scores as defaults
- [ ] `StageOutput` and all supporting TypeScript interfaces matching S3's scoring model
- [ ] Jurisdiction-aware citation parser interface with federal CFR implementation
- [ ] CFR lookup algorithm using S2-F's `RELEVANT_PARTS`
- [ ] S8-A AI-fallback part handling (9 device parts + 3 other → L2 classification + refinement flag)
- [ ] Agency routing INSERT statements (26 rows from S8-C, scored per S3)
- [ ] Document type scoring function implementing S3 Deliverable 3
- [ ] Bonus modifier detection logic implementing S3's 5 modifiers
- [ ] openFDA routing implementing S3 Rule 3 and S8-C's 18 dataset rows
- [ ] Score accumulation across stages
- [ ] Early resolution vs. Stage 3a handoff logic
- [ ] Jurisdiction-aware rule loading design for 50-state expansion
- [ ] Coverage validation against S8-C's published estimates
