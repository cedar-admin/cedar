# Cedar Classification Framework — Part 1, Session 4 of 8

# Domain Taxonomy: Level 1 and Level 2 Structure with Full Metadata

## Context

Cedar is an AI-powered regulatory monitoring platform for independent medical practices in Florida (expanding to all 50 states). Target practice types: Functional Medicine, Hormone Optimization/HRT, Compounding Pharmacy, Med Spa/Aesthetic Medicine, Weight Management, Peptide Therapy, IV Therapy/Infusion, Regenerative Medicine, Telehealth, Chiropractic, Integrative Medicine, Anti-Aging Medicine, Pain Management, and Primary Care (DPC/Concierge).

Cedar has a PostgreSQL knowledge graph with `kg_domains` (hierarchical taxonomy via `parent_domain_id`, supports arbitrary depth), `kg_entity_domains` (many-to-many classification with `relevance_score` and `classified_by`), and `kg_practice_types` (14 NUCC-based practice types).

This is **Session 4 of 8**. Sessions 1-3 produced relevance filters (CFR allowlists and non-CFR signals). This session designs the **top two levels** of the domain taxonomy — the L1 domains visible on Cedar's Library home screen and the L2 subdomains that appear when you drill into any L1. Later sessions (5-7) develop L3+ branches.

The combined output of all 8 sessions will be read by Claude Opus to produce an engineering implementation plan. The taxonomy must be designed so that the domain codes are stable — L3+ development in Sessions 5-7 extends the tree without changing L1/L2 codes.

### Sessions 1-3 Outputs

This session requires the outputs from Sessions 1, 2, and 3. **Attach all three output files as file uploads alongside this prompt:**

- `01-title-classification.md` (Session 1 — which CFR titles are relevant/mixed)
- `02-part-level-filtering.md` (Session 2 — part-level allowlist for mixed titles)
- `03-non-cfr-signals.md` (Session 3 — agency signals, keyword clusters, openFDA map)

The research agent should read all three attached files to ground the taxonomy design in the actual content that exists in Cedar's corpus.

---

## Taxonomy Design Requirements

### Structural Rules

1. **Practice-owner mental model**: Categories use language that practice owners think in. "Controlled Substances" is the right label. "21 CFR Chapter II Subchapter D" is wrong.
2. **Cross-classification support**: A single entity can belong to multiple domains. The taxonomy identifies where cross-classification is common.
3. **State-agnostic structure**: Must work for all 50 states. State-specific content slots into the same tree — "Telehealth > State Licensure Requirements" applies everywhere, the entities underneath are state-specific.
4. **State-expansion scaffolding**: The taxonomy currently classifies federal content, but Cedar will expand to ingest state-level regulatory sources (state medical boards, boards of pharmacy, state administrative codes, state legislation) across all 50 states. The taxonomy must include domain nodes for regulatory areas that are primarily or exclusively state-governed, even though this research won't populate them with federal content. Key state-governed areas that need scaffolding nodes include: scope of practice by provider type, state facility licensing, state-specific controlled substance schedules, state compounding permits, state telehealth practice requirements, state privacy laws exceeding HIPAA, state advertising restrictions, state corporate practice of medicine rules, and state board disciplinary processes. These nodes should be created with descriptions and classification signal placeholders noting "primarily state-regulated — federal content limited."
5. **Future-proof**: Accommodate source types Cedar hasn't ingested yet — board meeting minutes, professional association guidelines, insurance carrier policies, accreditation standards.
6. **Stable codes**: L1 and L2 codes defined here will be referenced by all subsequent sessions. They must be well-considered and unlikely to need renaming.

### Target Sizes

| Level | Target Count |
| --- | --- |
| L1 | 10-12 domains |
| L2 | 50-80 subdomains (5-8 per L1 on average, with variation) |

---

## Deliverable 1: Level 1 Domains

Produce 10-12 top-level domains. For **each L1 domain**, provide:

### 1. Domain Name

The practitioner-facing label as it would appear in Cedar's Library UI.

### 2. Domain Code

Machine-readable slug, lowercase, hyphenated. Examples: `controlled-substances`, `hipaa-privacy`, `fda-regulation`, `medicare-billing`.

### 3. Description

2-3 sentences explaining the scope of this domain — what types of regulatory content belong here.

### 4. Classification Signals

- **CFR title/chapter ranges** that primarily feed this domain
- **Key agencies** that produce content for this domain
- **High-level keyword themes** (detailed keyword clusters will come in L3+ sessions)
- **Statutory anchors** — the key federal statutes that create this regulatory area (e.g., Controlled Substances Act → `controlled-substances`; HIPAA → `hipaa-privacy`; Social Security Act Title XVIII → `medicare-billing`)

### 5. Cross-Classification Notes

Which other L1 domains does this one frequently overlap with? Describe the overlap pattern at a high level. (Specific cross-classification triggers come at L3+ in Sessions 5-7.)

### 6. Practice-Type Relevance

For **each of Cedar's 14 practice types**, assign a relevance weight:

- **High**: Core regulatory area for this practice type (they need to monitor this actively)
- **Medium**: Frequently relevant (they should be aware of changes)
- **Low**: Occasionally relevant (nice to have visibility)
- **None**: Not relevant to this practice type

Present this as a compact table per L1 domain:

| Practice Type | Relevance |
| --- | --- |
| Functional Medicine | High |
| Hormone Optimization/HRT | High |
| Compounding Pharmacy | Medium |
| ... | ... |

### 7. Estimated Entity Volume

Rough estimate of what percentage of the relevant corpus (post-filtering) would land in this L1 domain. This helps prioritize which branches need the most granular taxonomy.

---

## Deliverable 2: Level 2 Subdomains

For **each L1 domain**, produce its L2 subdomains (targeting 5-8 per L1, more for complex domains). For each L2 subdomain, provide:

### 1. Domain Name

Practitioner-facing label.

### 2. Domain Code

Dot-notation extending the L1 code. Examples: `controlled-substances.prescribing`, `controlled-substances.registration`, `controlled-substances.scheduling`.

### 3. Description

1-2 sentences on scope.

### 4. Classification Signals

- **CFR part ranges** (more specific than L1)
- **Agencies/sub-agencies** specific to this subdomain
- **Key keyword phrases** (5-10 high-signal phrases per L2)
- **Statutory references** specific to this subdomain

### 5. Cross-Classification Notes

Specific overlaps with L2 domains in other L1 branches. Example: `controlled-substances.prescribing` overlaps with `telehealth.prescribing` when content involves telemedicine prescribing of controlled substances.

### 6. Practice-Type Relevance

Same compact table format as L1 — which practice types care about this specific subdomain?

### 7. Depth Indicator

Flag how deep this L2 branch needs to go:

- **Deep (L4-L5)**: High-activity area needing granular taxonomy. Sessions 5-7 will develop these.
- **Standard (L3-L4)**: Moderate depth needed.
- **Shallow (L3 only)**: A few L3 nodes will suffice.

---

## Deliverable 3: Branch Depth Plan

Produce a summary table showing which L2 branches need deep development and which are shallow:

| L2 Domain Code | Depth Indicator | Estimated L3+ Node Count | Assigned Session |
| --- | --- | --- | --- |
| `controlled-substances.prescribing` | Deep (L5) | 15-20 | Session 5 |
| `compounding.503a` | Deep (L5) | 12-15 | Session 5 |
| `fda-regulation.drugs` | Deep (L5) | 15-20 | Session 6 |
| `telehealth.prescribing` | Deep (L4) | 8-12 | Session 6 |
| `hipaa-privacy.privacy-rule` | Standard (L4) | 6-10 | Session 7 |
| `workplace-safety.osha` | Shallow (L3) | 4-6 | Session 7 |
| ... | ... | ... | ... |

Assign each L2 branch to one of Sessions 5, 6, or 7, balancing the workload across sessions. The assignment should consider:

- **Session 5**: Compounding + Controlled Substances deep branches (highest priority for Cedar's users)
- **Session 6**: FDA Regulation + Telehealth deep branches
- **Session 7**: All remaining branches (HIPAA, Medicare/Billing, Operations, Workplace Safety, etc.)

---

## Reference Material

- Cedar repo: https://github.com/cedar-admin/cedar — read `CLAUDE.md` and `docs/architecture/data-architecture-research.md`
- eCFR API: https://www.ecfr.gov/api/versioner/v1/
- NUCC Healthcare Provider Taxonomy: https://www.nucc.org/