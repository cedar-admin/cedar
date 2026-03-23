# Cedar Classification Framework — Part 2, Session 2 of 5

# Stage 3a: Keyword Classification Engine

> **Orchestrator note**: This prompt expects the following upstream session outputs pre-injected as context:
> - `P1_S3` — Non-CFR relevance signals (210 keyword phrases across 12 domains + 27 cross-domain, with signal strengths, homonym flags, disambiguation rules, and the composite scoring model defining K weight 0-0.40)
> - `P1_S4` — Domain taxonomy (11 L1 domains, 55 L2 subdomains with classification signals and practice-type relevance tables)
> - `P1_S7-C` — Cross-classification trigger table (187 inter-domain overlap triggers with keyword conditions and frequency ratings)
>
> All outputs are in `research/outputs/part1/`. Read them fully before proceeding.

---

## Platform Context

Cedar is a regulatory intelligence platform for independent Florida medical practices (14 practice types). Cedar's knowledge graph contains ~99,000 federal regulatory entities classified through a multi-stage pipeline into a domain taxonomy (11 L1, 55 L2, ~320 L3-L6 nodes).

### What P1 Already Produced — Your Ground Truth

**S3 Deliverable 2 provides 210 keyword phrases + 27 cross-domain specialty phrases** (237 total). Each phrase has: signal strength (Strong = 154 phrases, Moderate = 56, rest cross-domain), homonym risk flag (42 phrases), and disambiguation rules specifying required co-occurring context terms. These keywords are organized across 12 domain areas in S3, but those are S3's organizational labels — they need explicit mapping to the actual domain codes from S4's taxonomy.

**S3 Deliverable 5 defines the K (keyword) score component** of the composite model: K ranges from 0.00 to 0.40, with specific scoring rules for match patterns (2+ Strong = 0.40, 1 Strong = 0.30, cross-domain specialty = 0.35, etc.). This scoring logic is the specification — this session operationalizes it into matching code.

**S7-C provides 187 cross-classification triggers** with keyword conditions and frequency ratings. These triggers define when an entity classified in Domain A should also be tagged with Domain B. This is the multi-label routing logic for cross-classification.

### Role of Stage 3a in the Pipeline

Stage 3a serves two purposes in S3's decision tree:

1. **Add the K score**: For entities that passed through Stages 1-2 with partial scores (A + D), Stage 3a adds the keyword component to complete the composite score. S3's thresholds (≥0.60 relevant, 0.40-0.59 review, etc.) are then applied.

2. **Cross-classification**: For entities already classified by Stages 1-2 (primary domain assigned), Stage 3a detects additional domain membership using S7-C's 187 triggers. A CFR section classified as `controlled-substances` may also warrant `telehealth.prescribing` as a secondary domain.

### What This Session Produces

Engineering-ready specifications that operationalize S3's keyword library into:

1. **Keyword-to-domain mapping** — every S3 phrase mapped to specific S4 domain codes
2. **Matching engine** — regex patterns, text normalization, scoring functions implementing S3's K score rules
3. **Cross-classification logic** — S7-C's 187 triggers as executable rules
4. **Disambiguation engine** — S3's 42 homonym-risk phrases operationalized with context checking
5. **SQL seed data and Inngest function** — ready for PRP execution

---

## Research Objective 1: Map S3 Keywords to S4 Domain Codes

### 1A. Explicit Keyword-to-Domain Mapping

S3 organizes keywords by domain area labels ("Prescribing and controlled substances", "Compounding and pharmacy", etc.). These labels are descriptive — they don't match S4's domain codes. Create the explicit mapping.

For every one of the 237 keyword phrases from S3 (210 domain-specific + 27 cross-domain), produce a mapping record:

```typescript
interface KeywordDomainMapping {
  phrase: string;                    // Exact phrase from S3 Deliverable 2
  signal_strength: 'strong' | 'moderate';
  homonym_risk: boolean;
  primary_domain_code: string;       // S4 domain code (L2 or L3)
  secondary_domain_codes: string[];  // Additional S4 codes this keyword signals
  s3_domain_area: string;           // Original S3 area label for traceability
  k_score_contribution: number;      // Per S3's K scoring rules
  disambiguation_requires: string[]; // Context terms from S3 (empty if no homonym risk)
}
```

**Use S4's actual domain codes** (`controlled-substances.prescribing`, `compounding.503a`, `fda-regulation.devices`, etc.). When an S3 domain area maps to multiple S4 L2 subdomains, assign the most specific code. For cross-domain specialty phrases, assign all relevant codes — validate these against S7-C's documented inter-domain overlaps.

### 1B. Coverage Gap Analysis

After mapping, identify gaps:

- **Which S4 L2 subdomains have strong keyword coverage?** (5+ Strong-signal keywords)
- **Which L2 subdomains have weak or no coverage?** (< 2 keywords)
- **Which subdomains are adequately covered by Stages 1-2 structural/agency rules and don't need keywords?**

For underserved subdomains that lack Stage 1-2 coverage, propose additional keywords following S3's format (phrase, strength, homonym risk, disambiguation). Keep additions focused — S3's 237 phrases were carefully designed.

Produce a coverage summary:

| L2 Domain Code | S3 Keywords (Strong) | S3 Keywords (Moderate) | Stages 1-2 Coverage | Gap Assessment |
|---|---|---|---|---|

---

## Research Objective 2: Matching Engine

### 2A. Implement S3's K Score Calculation

S3 Deliverable 5 defines exact K scoring rules:

| Keyword Match Pattern | K Score |
|---|---|
| 2+ Strong keyword matches | 0.40 |
| 1 Strong keyword match | 0.30 |
| 1 Strong + 1 Moderate keyword match | 0.35 |
| 2+ Moderate keyword matches | 0.25 |
| 1 Moderate keyword match | 0.15 |
| 1 Moderate keyword with homonym risk (no disambiguation context) | 0.05 |
| Cross-domain specialty phrase match | 0.35 |
| No keyword matches | 0.00 |

Translate this into a TypeScript function:

```typescript
function calculateKScore(
  matches: KeywordMatch[],
  entity_text: string
): { k_score: number; matched_domains: DomainAssignment[]; match_details: KeywordMatch[] }
```

Define:
- How matches are counted per the table above (strongest pattern wins)
- How matches from different domains interact (entity matches "compounding pharmacy" Strong + "telehealth" Moderate = what K score?)
- How the function returns both the scalar K score (for composite calculation) and the domain assignments implied by the matches

### 2B. Text Matching Patterns

For the 237 keyword phrases, define the matching approach:

- **Multi-word phrase matching**: "controlled substance" must match as a phrase, not individual words. Define whether to use regex, compiled phrase sets, or full-text search.
- **Normalization**: Lowercasing, stripping punctuation, handling plurals (e.g., "controlled substance" should match "controlled substances"). Define the normalization pipeline — keep it minimal; S3's phrases are already precise.
- **Regex compilation**: Should the 237 phrases be pre-compiled into a single regex (fast but complex) or iterated (simple but potentially slower at 99K entities)?
- **Matching against what text**: Entity title + abstract/description concatenated? Or matched separately with different weights?

Produce:
- The text normalization specification
- The matching algorithm as TypeScript pseudocode
- Performance estimate for 99K entities × 237 phrases

### 2C. Per-Domain Keyword Clusters

For each of the 55 L2 subdomains, assemble the keyword cluster from the mapping in 1A:

```typescript
interface DomainKeywordCluster {
  domain_code: string;
  keywords: Array<{
    phrase: string;
    weight: number;       // S3 Strong = 0.8-1.0, Moderate = 0.5-0.7
    homonym_risk: boolean;
    context_terms: string[];
  }>;
  negative_keywords: string[];     // Terms that indicate a different subdomain
  match_threshold: number;         // Minimum score for assignment to this domain
}
```

Produce the complete cluster definition for every L2 subdomain. For negative keywords, focus on distinguishing confusable subdomains:
- `compounding.503a` vs `compounding.503b`: "outsourcing facility", "cGMP" are 503b signals
- `fda-regulation.drugs` vs `fda-regulation.devices`: "510(k)", "PMA" distinguish devices
- `controlled-substances.prescribing` vs `controlled-substances.scheduling`: "schedule II-V", "temporary scheduling" distinguish scheduling

### 2D. Domain Assignment from Keyword Matches

When the matching engine finds keyword hits across multiple domains, define the assignment logic:

1. For each domain cluster, calculate the cumulative weighted keyword score
2. Apply S3's K score rules to determine the overall K value
3. Assign domains where the cluster score exceeds the threshold
4. Rank by score: highest = primary candidate, others = secondary candidates
5. Cross-reference with Stages 1-2 partial signals: if Stage 2 assigned L1 = `fda-regulation`, keyword matches within that L1 get a boost for L2 refinement

---

## Research Objective 3: Cross-Classification Using S7-C

### 3A. Operationalize S7-C's 187 Triggers

S7-C provides 187 cross-classification triggers in a structured format. Each trigger specifies:
- Source domain (entity's current classification)
- Target domain (additional domain to assign)
- Trigger conditions (keyword/content patterns that activate the cross-classification)
- Frequency rating (how commonly this overlap occurs)

Translate these into executable rules:

```typescript
interface CrossClassificationTrigger {
  id: string;
  source_domain: string;     // Entity's primary domain code
  target_domain: string;     // Domain code to add as secondary
  trigger_keywords: string[];// Keywords that activate this trigger
  frequency: 'high' | 'medium' | 'low';
  confidence_discount: number; // Secondary assignment confidence = primary × this factor
}
```

Define:
- How the 187 triggers are stored (same `classification_rules` table with `rule_type = 'cross_classification'`? Separate table?)
- Runtime behavior: for each classified entity, check if its primary domain + entity text match any trigger → if yes, add secondary domain
- Confidence for secondary assignments: recommended discount factor based on trigger frequency (high frequency = 0.85 of primary confidence, low frequency = 0.65?)

### 3B. Cross-Classification Scope and Guards

Define guardrails:

- **Which entities get the cross-classification pass?** Recommendation: only entities with a confident primary classification (composite score ≥ 0.60 or structural match). Entities in the review zone get cross-classification at Stage 4 (AI classifier) instead.
- **Maximum secondary domains per entity**: cap at 3-4 to prevent noise
- **Minimum confidence for secondary**: below 0.50, don't add the secondary assignment
- **S7-C frequency as a filter**: should low-frequency triggers require a higher keyword match threshold?

---

## Research Objective 4: Disambiguation Engine

### 4A. Operationalize S3's Homonym Risk Handling

S3 flags 42 phrases with homonym risk and specifies disambiguation rules:
- Required co-occurring terms: agency identifiers (FDA, DEA, CMS, OSHA, FTC, HHS, ONC, OCR, SAMHSA, AHRQ) and healthcare context words (patient, clinical, medical, healthcare, physician, pharmacy, drug, device, hospital, practitioner, health plan)
- Domains with highest homonym concentration: Advertising & Marketing (8/14), Employment & Workplace Safety (6/12)

Define the disambiguation check:

```typescript
function disambiguate(
  keyword: KeywordPhrase,
  entity_text: string
): { confirmed: boolean; confidence_modifier: number }
```

1. Keyword matched in entity text
2. If `homonym_risk = false` → confirmed, full weight
3. If `homonym_risk = true`:
   a. Search entity text for required context terms from S3's disambiguation column
   b. If context found → confirmed, full weight
   c. If no context found → unconfirmed, reduce weight (K contribution drops to 0.05 per S3's rule for "1 Moderate with homonym risk, no disambiguation context")
   d. If contradicting context found (non-healthcare usage) → reject, zero weight

### 4B. High-Risk Domain Handling

For Advertising & Marketing (8/14 homonym risk) and Employment & Workplace Safety (6/12 homonym risk):
- S3 recommends these domains "require at least two confirming signals"
- Implement: for these domains, require either (a) 2+ keyword matches within the domain, or (b) 1 keyword match + relevant agency (FTC for advertising, OSHA for workplace)
- Entities classified solely into these domains via keyword should get `needs_review = true`

---

## Research Objective 5: Implementation Artifacts

### 5A. SQL Schema and Seed Data

Keyword rules are stored in the jurisdiction-scoped `classification_rules` table (schema defined in P2-S1, `rule_type = 'keyword'`):

Produce:
- INSERT statements for all 237 keyword rules with correct `jurisdiction = 'federal'`, `rule_type = 'keyword'`, domain code foreign keys, and `rule_config` JSONB containing signal strength, homonym risk, and disambiguation terms
- INSERT statements for all 187 cross-classification triggers from S7-C with `rule_type = 'cross_classification'`
- Disambiguation context terms stored in `rule_config` JSONB (not a separate table)

Show representative INSERTs for 5 domains (including one high-homonym domain), then define the pattern for the rest.

### 5B. Inngest Function Specification

```typescript
export const classifyByKeywords = inngest.createFunction(
  { id: 'cedar/classify-keywords', ... },
  { event: 'cedar/classify.stage3a' },
  async ({ event, step }) => {
    // 1. Load keyword rules for entity's jurisdiction
    // 2. Match entity text against keyword phrases
    // 3. Run disambiguation on homonym-risk matches
    // 4. Calculate K score per S3's rules
    // 5. Run cross-classification using S7-C triggers
    // 6. Return StageOutput with updated score_components.K and any new domain assignments
  }
);
```

Define: input event shape, concurrency settings, batch processing (how many entities per invocation), output format matching P2-S1's `StageOutput` interface, error handling, observability metrics.

### 5C. Configuration

```typescript
interface KeywordEngineConfig {
  // S3 K scoring parameters
  strong_strong_k: number;          // Default: 0.40 (2+ Strong matches)
  single_strong_k: number;          // Default: 0.30
  strong_moderate_k: number;        // Default: 0.35
  moderate_moderate_k: number;      // Default: 0.25
  single_moderate_k: number;        // Default: 0.15
  homonym_unconfirmed_k: number;    // Default: 0.05
  cross_domain_specialty_k: number; // Default: 0.35

  // Matching behavior
  case_sensitive: boolean;           // Default: false
  normalize_plurals: boolean;        // Default: true
  
  // Cross-classification
  max_secondary_domains: number;     // Default: 4
  min_secondary_confidence: number;  // Default: 0.50
  high_frequency_discount: number;   // Default: 0.85
  low_frequency_discount: number;    // Default: 0.65
  
  // High-risk domain handling
  high_risk_require_two_signals: boolean;  // Default: true
  high_risk_domains: string[];       // Default: ['advertising-marketing', 'business-operations']
  high_risk_force_review: boolean;   // Default: true
}
```

---

## Deliverable Checklist

Produce all of the following as a single structured markdown document:

- [ ] Complete keyword-to-domain mapping (all 237 S3 phrases → S4 domain codes)
- [ ] Coverage gap analysis table (55 L2 subdomains × keyword + structural coverage)
- [ ] New keyword proposals for underserved subdomains (if any)
- [ ] K score calculation function implementing S3 Deliverable 5's rules (TypeScript)
- [ ] Text matching specification (normalization, regex compilation, matching algorithm)
- [ ] Per-domain keyword cluster definitions for all 55 L2 subdomains
- [ ] Negative keyword sets for confusable subdomain pairs
- [ ] Domain assignment logic from keyword matches
- [ ] Cross-classification trigger schema (storing S7-C's 187 triggers)
- [ ] Cross-classification runtime logic with guardrails
- [ ] Disambiguation check function implementing S3's homonym risk rules
- [ ] High-risk domain handling for Advertising/Marketing and Employment/Safety
- [ ] SQL INSERT statements for keyword rules (representative set for 5 domains + pattern)
- [ ] SQL INSERT statements for cross-classification triggers (representative set + pattern)
- [ ] Inngest function specification
- [ ] `KeywordEngineConfig` with S3-derived defaults
- [ ] Estimated Stage 3a coverage: % of corpus receiving K score, % receiving cross-classification
