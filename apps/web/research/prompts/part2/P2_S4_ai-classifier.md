# Cedar Classification Framework — Part 2, Session 4 of 5

# Stages 4-5: AI Classifier + Irrelevance Confirmation

> **Orchestrator note**: This prompt expects the following outputs pre-injected as context:
> - `P1_S4` — Domain taxonomy (11 L1 domains, 55 L2 subdomains, ~320 L3-L6 nodes with descriptions and classification signals)
> - `P1_S7-C` — Cross-classification trigger table (187 inter-domain overlap triggers with keyword conditions and frequency ratings)
> - `P2_S1` — Pipeline architecture + Stages 1-2 specification (stage interfaces, TypeScript types, S3 threshold implementation, jurisdiction-scoped schema)
>
> `P1_S4` and `P1_S7-C` are in `research/outputs/part1/`. `P2_S1` is in `research/outputs/part2/`. Read all fully before proceeding.

---

## Platform Context

Cedar is a regulatory intelligence platform for independent Florida medical practices (14 practice types). Cedar's knowledge graph contains ~99,000 federal regulatory entities classified through a multi-stage pipeline. The pipeline's deterministic stages (structural, metadata, keyword) resolve 75-85% of the corpus. Stages 4-5 handle the remainder.

### What Reaches Stage 4

Based on P2-S1's coverage analysis and S8-C's published estimates:

- **~5,000-15,000 entities** (5-15% of 99K) land in S3's "review" zone (composite score 0.40-0.59) after Stages 1-3a and need AI classification to resolve
- **S8-A's 12 AI-fallback parts** (9 device classification parts in the 862-884 range, plus Parts 250, 209, and 4/70) are structurally classified to their L2 domains by Stage 1 but flagged `ai_refinement_needed = true` for L3+ classification — Stage 4 handles the refinement
- **~75% of future web-scraped content** (FDA guidance docs, state board notices, court filings) will need AI classification per S8-C's 25% rule-based coverage estimate for web content
- Entities from medium/low relevance agencies where metadata alone was insufficient and keywords were inconclusive

### What P1 Provides for This Session

**S7-C's 187 cross-classification triggers** serve as training signal for the AI classifier. Each trigger documents a real inter-domain overlap with the content patterns that indicate it. These should be used as:
- Few-shot examples in the classification prompt (showing the model what multi-domain classification looks like)
- Validation reference (if the AI classifies an entity into Domain A, check S7-C for known A→B triggers to prompt for secondary domains)

**S4's ~390 total taxonomy nodes** (~320 at L3-L6 plus the 66 L1-L2 nodes) are too large for any single API call. The pruning strategy must select relevant branches based on partial signals from Stages 1-3a while keeping context manageable.

### What This Session Produces

Engineering-ready specifications for:

1. **Stage 4 prompt templates** — system + user messages with `{{taxonomy_context}}` runtime placeholder, few-shot examples drawn from S7-C
2. **Taxonomy pruning strategy** — branch selection based on partial signals, handling ~390 nodes
3. **S8-A AI-fallback part refinement** — specific handling for the 12 flagged parts (9 device + 3 other)
4. **Batching and model selection** — cost-optimized batch design
5. **Confidence tiers and HITL routing** — thresholds integrated with Module 6B
6. **Reasoning logging and feedback loop** — correction tracking, confusion pattern detection
7. **Stage 5 irrelevance confirmation** — lightweight batch check
8. **Inngest functions** for both stages

---

## Research Objective 1: Stage 4 Prompt Design

### 1A. System Prompt Template

Design the system prompt for Claude API classification calls. The prompt must:
- Establish the classification task using Cedar's domain taxonomy
- Include the runtime-injected taxonomy context via `{{taxonomy_context}}`
- Define the output JSON schema
- Calibrate confidence expectations
- Instruct the model to check for cross-domain membership (referencing S7-C's trigger patterns)

```
You are a regulatory classification engine for Cedar, a healthcare regulatory 
intelligence platform serving 14 types of independent medical practices.

Your task: classify regulatory entities into Cedar's domain taxonomy and assign 
practice-type relevance scores.

## Domain Taxonomy (relevant branches)
{{taxonomy_context}}

## Classification Instructions

For each entity:
1. Assign the primary domain code — the single most specific L2 or L3 code 
   from the taxonomy above
2. Check for secondary domain assignments — regulatory content frequently 
   spans multiple domains. Common cross-domain patterns include:
{{cross_classification_examples}}
3. Assign a confidence score (0.0-1.0) for each assignment:
   - 0.90-1.00: Unambiguous match to a specific domain
   - 0.70-0.89: Strong match with minor uncertainty about specificity level
   - 0.50-0.69: Probable match; a similar entity could reasonably go elsewhere
   - Below 0.50: Uncertain; flag for human review
4. Provide chain-of-thought reasoning explaining your classification logic
5. If the entity appears irrelevant to healthcare practice compliance, say so

{{partial_signals_context}}

## Output Format
Return valid JSON matching this schema:
{{output_schema}}
```

**Complete the full system prompt.** Key requirements:
- `{{taxonomy_context}}` is populated at runtime — include a format specification showing the model what to expect (hierarchical markdown with domain codes, descriptions, and classification signals from S4)
- `{{cross_classification_examples}}` is populated from S7-C's 187 triggers — include the top 10-15 highest-frequency triggers as few-shot examples showing multi-domain patterns
- `{{partial_signals_context}}` contains signals from Stages 1-3a (e.g., "Stage 2 identified agency: FDA. Stage 3a keyword match: 'compounding' (strong), '503A' (strong). Partial composite score: 0.55.")
- Include 2-3 concrete classification examples using real S4 domain codes

### 1B. User Message Template

Design the per-entity user message:

```
Classify this regulatory entity:

Title: {{entity_title}}
Source: {{entity_source_type}}
Citation: {{entity_citation}}
Description: {{entity_description}}
Agency: {{entity_agency}}
Document Type: {{entity_doc_type}}

Prior signals from pipeline stages:
{{partial_signals_formatted}}
```

Define:
- Which entity fields to include (and maximum token budget per field — truncation strategy for long descriptions)
- How partial signals from Stages 1-3a are formatted as actionable context
- Whether to include S3's partial composite score (A + D + K) to give the model a starting point

### 1C. Output JSON Schema

```json
{
  "classifications": [
    {
      "domain_code": "compounding.503a",
      "is_primary": true,
      "confidence": 0.92,
      "taxonomy_level": "L2",
      "reasoning": "..."
    }
  ],
  "irrelevant": false,
  "irrelevance_confidence": null,
  "uncertainty_flag": false,
  "notes": null
}
```

Define validation rules:
- `domain_code` must exist in the taxonomy (validate against `kg_domains` at runtime)
- `confidence` must be 0.0-1.0
- Maximum classifications per entity (cap at 5?)
- When `irrelevant = true`, entity routes to Stage 5 for confirmation

### 1D. Few-Shot Examples from S7-C

Select 10-15 of S7-C's highest-frequency cross-classification triggers and format them as classification examples:

```
Example: A DEA rulemaking extending telemedicine prescribing flexibilities for 
controlled substances would be classified as:
- Primary: controlled-substances.prescribing (0.88) — core prescribing regulation
- Secondary: telehealth.prescribing (0.82) — directly affects telemedicine prescribing
This is a common cross-classification pattern (high frequency per S7-C trigger #XX).
```

Produce 5 complete examples using real domain codes, covering:
1. A clear single-domain entity (high confidence)
2. A multi-domain entity using a high-frequency S7-C trigger
3. An S8-A device part entity needing L3+ refinement
4. An ambiguous entity where the model should express uncertainty
5. A borderline-irrelevant entity

### 1E. S8-A AI-Fallback Part Refinement

S8-A flags 12 parts requiring AI fallback across four categories: 9 device classification parts (862, 864, 866, 868, 870, 874, 876, 882, 884), plus Parts 250, 209, and 4/70. The device parts are the largest cluster — classified to `fda-regulation.devices` by Stage 1 but needing L3+ refinement. The other 3 parts similarly need L3+ refinement within their respective L2 domains. Design the Stage 4 handling:

- These entities arrive with `ai_refinement_needed = true` and a primary L2 domain already assigned
- For device parts, the taxonomy context should include the full `fda-regulation.devices` L3-L6 subtree
- The prompt should instruct: "This entity is already classified at L2. Your task is to assign the most specific L3+ subcode based on the entity content."
- Define whether these use the same prompt template (with modified instructions) or a separate device-refinement template

---

## Research Objective 2: Taxonomy Context Management

### 2A. Pruning Strategy

The full taxonomy has ~390 nodes. Each API call gets a pruned subset. Define the pruning algorithm:

**Inputs** (available from Stages 1-3a):
- Partial domain signals (L1 or L2 candidates from agency routing, keyword matches)
- Entity metadata (agency, document type, source)
- S3's partial composite score components (A, K, D)

**Algorithm**:
```
1. If partial_signals include L1 hints:
   → Include those L1 branches fully (all L2, L3+ descendants)
2. If agency maps to known domains (from S8-C):
   → Include those branches
3. Always include a minimum of 3 L1 branches (prevent tunnel vision)
4. For included branches: show L1 descriptions + all L2 codes with descriptions + L3 codes (without deep descriptions)
5. For excluded branches: show only L1 code + one-line description (allow "escape hatch" if model thinks the entity belongs in an unprovided branch)
```

Refine this. Define:
- How to select the 3 minimum branches when no partial signals exist
- How deep to go (L3 descriptions? L4 codes only?)
- Token budget per branch (estimated)
- Total taxonomy context target: under 3,000 tokens for typical pruned context

### 2B. Taxonomy Context Format

Define the exact markdown format injected as `{{taxonomy_context}}`:

```markdown
### controlled-substances — Controlled Substances & Prescribing
DEA registration, prescribing rules, PDMP, telemedicine prescribing, Ryan Haight Act.
  - controlled-substances.registration — DEA registration requirements
  - controlled-substances.prescribing — Prescription requirements for controlled substances
  - controlled-substances.recordkeeping — Inventory, dispensing records, theft reporting
  - controlled-substances.scheduling — Federal scheduling actions (Schedule I-V)
  - controlled-substances.dispensing — Office dispensing requirements

### compounding — Compounding & Pharmacy Operations [summary only]
FDA compounding under 503A/503B, sterile compounding, bulk drug substances.
```

Estimate tokens per L1 branch (fully included vs. summary only).

### 2C. Fallback Handling

If the model's best classification is a domain in a "summary only" branch:
- Model should indicate: "Best match appears to be in [domain] which was provided in summary form"
- Pipeline response: re-run with expanded taxonomy including that branch
- Define maximum re-runs (1 retry with expanded context, then route to HITL if still unresolved)

---

## Research Objective 3: Batching and Model Selection

### 3A. Model Selection

Evaluate for the classification task:

- **Claude Haiku (latest)**: Cheaper, faster. Sufficient for domain classification?
- **Claude Sonnet (latest)**: More expensive, higher accuracy. When warranted?

Recommend:
- Default model for standard classification
- Escalation model for re-runs and device part refinement
- Cost per entity for each (input + output tokens at current Anthropic pricing — look up current rates)

### 3B. Batch Size

Calculate the optimal batch size:

| Component | Tokens (estimated) |
|---|---|
| System prompt (fixed) | ~800 |
| Taxonomy context (variable, typical) | ~2,500 |
| Cross-classification examples (fixed) | ~1,000 |
| Per-entity input | ~300-500 |
| Per-entity output | ~200-400 |

At batch size N:
- Total input = 800 + 2,500 + 1,000 + (N × 400) = 4,300 + 400N
- Total output = N × 300

Evaluate quality and cost at N = 1, 3, 5, 10. Recommend with reasoning.

### 3C. Batch Grouping

Group entities to share taxonomy context:
- Same partial L1 signal → same pruned taxonomy → share the system prompt
- Reduces per-entity cost since taxonomy context is amortized across the batch
- Define the grouping logic and expected cost savings

### 3D. Error Handling

Define behavior when:
- API call fails (timeout, rate limit) → retry with exponential backoff, max 3 retries
- Malformed JSON response → parse fallback, retry single entity
- Invalid domain code returned → reject classification, log error, route to HITL
- All classifications below confidence threshold → route to Stage 5
- Output truncated → reduce batch size, retry

---

## Research Objective 4: Confidence Tiers and HITL Integration

### 4A. Confidence Tiers

| Tier | Range | Action | HITL Behavior |
|---|---|---|---|
| High | ≥ X | Auto-accept | Sampled for quality (Y% sample rate) |
| Medium | Z to X | Accept with flag | Queued for eventual review |
| Low | < Z | Needs review | Not authoritative until reviewed |

Recommend X and Z values. Consider:
- S3's production threshold is 0.60 for composite score — should AI confidence thresholds align?
- Calibration process: initial thresholds → review first 500 Stage 4 entities → adjust

### 4B. HITL Queue Integration

Cedar's Module 6B review queue exists. Define:

- **Queue entry format**: entity ID, AI classification, confidence, reasoning, partial signals, timestamp
- **Priority scoring**: `priority = f(confidence, impact, confusion_risk, recency)` where:
  - `impact` = count of practice types where assigned domain has relevance ≥ Medium (from S4 tables)
  - `confusion_risk` = model reported uncertainty or domain is in a known confusion pair
- **Review outcomes**: Confirmed / Corrected / Deferred (to attorney review)
- Storage: corrections recorded in `kg_classification_log` preserving original AI classification

### 4C. Sampling High-Confidence Classifications

Even auto-accepted classifications need quality monitoring:
- Sample rate: 3-5% of high-confidence Stage 4 classifications routed to review queue as "QA sample"
- Lower priority than low-confidence items but ensures ongoing calibration
- Sampling results feed confidence threshold adjustment

---

## Research Objective 5: Reasoning Logging and Feedback Loop

### 5A. Classification Log Schema

Extend `kg_classification_log` for Stage 4 entries:

```sql
ALTER TABLE kg_classification_log ADD COLUMN IF NOT EXISTS ...
```

The log must support queries:
- "All entities where AI was torn between Domain A and Domain B"
- "All corrections in the last 30 days grouped by original→corrected domain pair"
- "AI accuracy rate per domain over time"
- "Entities classified using prompt version X"

Define column additions, JSON structure for `reasoning` field, and query-supporting indexes.

### 5B. Reasoning JSON Structure

```json
{
  "model": "claude-sonnet-4-20250514",
  "prompt_version": "v1.0",
  "taxonomy_branches_included": ["controlled-substances", "compounding", "fda-regulation"],
  "partial_signals": [
    { "stage": "metadata", "signal": "agency:FDA", "score_component": "A", "value": 0.45 }
  ],
  "chain_of_thought": "The entity describes...",
  "alternatives_considered": [
    { "domain_code": "fda-regulation.enforcement", "confidence": 0.68, "reason": "..." }
  ],
  "s7c_triggers_checked": ["trigger_42", "trigger_87"],
  "tokens_used": { "input": 2340, "output": 450 }
}
```

Refine: what's essential for debugging? What's nice-to-have? Include `s7c_triggers_checked` to track which cross-classification triggers the model was shown.

### 5C. Correction Storage and Pattern Detection

When a reviewer corrects a classification:

```typescript
interface ClassificationCorrection {
  entity_id: string;
  original_domain: string;
  corrected_domain: string;
  corrected_by: string;
  correction_type: 'domain_change' | 'confidence_adjustment' | 'add_secondary' | 'remove_secondary';
  correction_reason?: string;
}
```

**Confusion pattern detection**: Track a confusion matrix. When the same domain pair (A→B correction) accumulates N+ times:
- Alert: "AI has been corrected from A to B N times. Possible prompt improvement needed."
- Suggested action: add disambiguation instruction to the prompt for the confused domain pair
- Define the trigger threshold N (recommend 5)
- Define where alerts surface (admin panel)

### 5D. Active Learning

- **High-value review targets**: entities near decision boundaries, in high-confusion domains, or in underrepresented domains
- **Confidence recalibration**: after M corrections, recompute whether thresholds X and Z are still appropriate
- **Prompt versioning**: version the prompt template. Track accuracy per version. When a new version deploys, compare accuracy over a 100-entity window.

---

## Research Objective 6: Tunability Interface

### 6A. Configuration Parameters

List every adjustable parameter:

| Parameter | Type | Default | Storage | Description |
|---|---|---|---|---|
| `stage4_model` | string | (recommend) | `classification_config` | Claude model for Stage 4 |
| `stage4_batch_size` | number | (recommend) | `classification_config` | Entities per API call |
| `high_confidence_threshold` | number | (recommend) | `classification_config` | Auto-accept boundary |
| `low_confidence_threshold` | number | (recommend) | `classification_config` | Needs-review boundary |
| `prompt_version` | string | `v1.0` | `classification_config` | Active prompt template |
| `taxonomy_min_branches` | number | 3 | `classification_config` | Minimum L1 branches in context |
| `taxonomy_max_depth` | string | `L3` | `classification_config` | Deepest level in context |
| `max_retries` | number | 3 | `classification_config` | API retry count |
| `qa_sample_rate` | number | 0.05 | `classification_config` | High-confidence sampling rate |
| `confusion_alert_threshold` | number | 5 | `classification_config` | Corrections before alert |
| ... | ... | ... | ... | ... |

Complete this table with all parameters from the prompt templates, thresholds, batching, HITL routing, and feedback loop.

### 6B. Configuration Table

```sql
CREATE TABLE classification_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by text
);
```

Define the complete schema and representative INSERT statements for all default values.

---

## Research Objective 7: Stage 5 — Irrelevance Confirmation

### 7A. Irrelevance Check Prompt

Design a lightweight batch prompt:

```
You are reviewing regulatory entities that could not be classified into Cedar's 
healthcare practice domain taxonomy. Determine if each entity is genuinely 
irrelevant to independent medical practice compliance.

Cedar's domain taxonomy covers: controlled substances, compounding, FDA drug/device 
regulation, Medicare billing, HIPAA privacy, telehealth, advertising/marketing, 
clinical operations, fraud/compliance, business operations, and state licensing.

For each entity, respond:
- relevant: true/false
- confidence: 0.0-1.0
- brief_reason: one sentence
```

This is a binary check, intentionally simpler than Stage 4. Define:
- Batch size (larger than Stage 4 — 20-30 entities per call?)
- Model (Haiku for cost efficiency?)
- Whether to include minimal taxonomy context (just the 11 L1 domain names)

### 7B. Tagging Schema

```sql
-- Option: special domain code for irrelevant entities
-- Option: flag column on kg_entities
-- Option: entry in kg_entity_domains with domain_code = 'irrelevant'
```

Recommend an approach. Requirements:
- Irrelevant entities are never deleted (may become relevant if Cedar's scope expands)
- Irrelevance confidence is recorded
- Entities can be re-evaluated

### 7C. Uncertain Entities

Entities neither confidently classified nor confidently irrelevant:
- Tag as `uncertain`, route to HITL with low priority
- Periodic re-evaluation: when prompt templates are updated, re-run uncertain entities
- Define the re-evaluation trigger (prompt version change? monthly cron? manual?)

### 7D. Inngest Functions

Define Inngest function specifications for both Stage 4 and Stage 5:

```typescript
export const classifyByAI = inngest.createFunction(
  { id: 'cedar/classify-ai', ... },
  { event: 'cedar/classify.stage4' },
  async ({ event, step }) => { ... }
);

export const confirmIrrelevance = inngest.createFunction(
  { id: 'cedar/classify-irrelevance', ... },
  { event: 'cedar/classify.stage5' },
  async ({ event, step }) => { ... }
);
```

For each: function configuration, input event shape, processing logic, output format (conforming to P2-S1's `StageOutput`), error handling, rate limiting (Anthropic API limits), observability metrics.

---

## Deliverable Checklist

Produce all of the following as a single structured markdown document:

- [ ] Complete Stage 4 system prompt template with `{{variable}}` placeholders
- [ ] User message template with partial signal formatting
- [ ] Output JSON schema with validation rules
- [ ] 5 few-shot classification examples (using real S4 domain codes and S7-C trigger patterns)
- [ ] S8-A device part refinement handling specification
- [ ] Taxonomy pruning algorithm (pseudocode)
- [ ] Taxonomy context format with token estimates
- [ ] Fallback handling for out-of-context domain matches
- [ ] Model selection recommendation with per-entity cost calculation
- [ ] Batch size recommendation with token economics
- [ ] Batch grouping strategy
- [ ] Error handling specification
- [ ] Confidence tier thresholds with calibration process
- [ ] HITL queue integration spec (entry format, priority scoring)
- [ ] QA sampling specification
- [ ] `kg_classification_log` schema additions (SQL)
- [ ] Reasoning JSON structure
- [ ] Correction storage and confusion pattern detection specification
- [ ] Active learning integration plan
- [ ] Complete tunability parameter table
- [ ] `classification_config` table SQL with default INSERTs
- [ ] Stage 5 irrelevance prompt template
- [ ] Irrelevance tagging schema
- [ ] Uncertain entity handling
- [ ] Inngest function specifications for Stages 4 and 5
