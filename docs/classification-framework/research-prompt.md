# Cedar Classification Framework — Deep Research Prompt

## Context for the Research Agent

Cedar is an AI-powered regulatory monitoring platform for independent medical practices in Florida (expanding to all 50 states). The platform monitors 71+ regulatory sources across federal agencies, Florida state boards, and legislative activity. The target users are practice owners running functional medicine, hormone therapy, compounding pharmacy, med spa, weight management, peptide therapy, IV therapy, regenerative medicine, telehealth, and chiropractic practices.

Cedar has a PostgreSQL knowledge graph on Supabase containing ~99K entities ingested from three federal government APIs (eCFR, Federal Register, openFDA). These entities are completely unclassified. The existing schema includes:

- `kg_entities` — individual regulations, rules, guidance docs, board decisions
- `kg_domains` — hierarchical taxonomy (self-referential via `parent_domain_id`, supports arbitrary depth)
- `kg_entity_domains` — many-to-many classification with `relevance_score` and `classified_by`
- `kg_practice_types` — NUCC-based practice type codes (14 seeded)
- `kg_entity_practice_relevance` — maps entities to practice types with relevance scores
- `kg_classification_log` — audit trail tracking rule-based, ML, and manual classifications
- `classification_rules` — currently 22 basic rules (CFR range matching, agency name matching)

The current 22 rules are insufficient. They use blunt pattern matching and would produce ~40-60% accuracy. We need a comprehensive classification framework that achieves **90%+ accuracy before human review** on the federal corpus. For non-federal sources (state board rules, board minutes, legislative activity), the target is 80%+ with clear identification of which entities need human verification. Every classification decision must be transparent, auditable, and tunable — no black boxes.

## Research Objectives

### 1. Relevance Filtering — The $0 Gate

Before any classification, Cedar needs to determine which of the 99K entities are relevant to independent medical practices. The current corpus includes entities about national parks, maritime law, agriculture, housing, environmental protection, and other domains that are completely irrelevant.

Research and define:

- **Inclusion criteria**: Which CFR titles, chapters, and part ranges contain regulations relevant to healthcare practices? Build a comprehensive allowlist. For example: Title 21 (Food and Drugs), Title 42 (Public Health), Title 45 (Public Welfare — HIPAA), Title 29 (Labor — OSHA), specific parts of Title 26 (Tax — healthcare tax provisions). Be exhaustive.
- **Exclusion criteria**: Which CFR titles and parts are definitively irrelevant? Build an explicit denylist.
- **Gray zone handling**: Some titles contain a mix (e.g., Title 21 has both pharmaceutical regulations and food safety rules — only pharmaceutical matters). Define part-level inclusion/exclusion for mixed titles.
- **Non-CFR relevance signals**: For Federal Register documents and openFDA records that don't have clean CFR references, what metadata signals indicate healthcare practice relevance? (Agency name, keywords in title, regulatory action type, etc.)
- **Expected filtering rate**: What percentage of the 99K entities should survive the relevance gate? Estimate based on the CFR title distribution of a typical eCFR bulk download.

### 2. Domain Taxonomy — The Full Tree

Design a hierarchical domain taxonomy for healthcare regulatory content. This taxonomy populates `kg_domains` and drives the Library navigation.

Requirements:

- **Asymmetric depth**: Some domains need 4-5 levels, others only 2-3. The taxonomy should go as deep as the content requires, not forced into uniform depth.
- **Practice-owner mental model**: Categories should use language that practice owners actually think in. "Controlled Substances" is the right label, not "21 CFR Chapter II Subchapter D." Practitioners search by concept, not by regulatory address.
- **Cross-classification support**: A single entity can belong to multiple domains (e.g., "DEA prescribing rules for telehealth" belongs in both Controlled Substances and Telehealth). The taxonomy should identify where cross-classification is common and define rules for it.
- **State-agnostic structure**: The taxonomy must work for all 50 states, not just Florida. State-specific content slots into the same domain tree — "Telehealth > State Licensure Requirements" applies to every state, the entities underneath are state-specific.
- **Future-proof**: The taxonomy should accommodate source types Cedar hasn't ingested yet — board meeting minutes, professional association guidelines, insurance carrier policies, accreditation standards.

For each domain at every level, provide:

- **Domain name** (practitioner-facing label)
- **Domain code** (machine-readable slug, e.g., `controlled-substances.prescribing.pdmp`)
- **Description** (1-2 sentences explaining what belongs here)
- **Classification signals** — the specific indicators that place an entity in this domain:
  - CFR title/chapter/part ranges (primary signal for federal regulations)
  - Agency/sub-agency names
  - Keyword clusters (weighted phrases, not single words)
  - Document type patterns
  - Statutory references (e.g., Section 503A of the FD&C Act → Compounding)
- **Cross-classification triggers** — when an entity in this domain should ALSO appear in another domain
- **Practice-type relevance** — which practice types (from Cedar's 14 NUCC-based types) care about this domain, and at what weight (high/medium/low)

Target: 10-12 Level 1 domains, 50-80 Level 2, 200-400 Level 3, and deeper levels where warranted. The Compounding, Controlled Substances, FDA Regulation, and Telehealth branches should be the deepest since they're highest-activity for Cedar's target users. **Hard cap: 6 levels maximum.** Most branches will land at 3-4. If a classification path feels like it needs 7+, the taxonomy is too granular and should flatten. The UI renders deeper trees with progressive drill-down — the taxonomy depth drives navigation depth.

### 3. Classification Pipeline Design — Cost-Efficient Accuracy

Design a multi-stage classification pipeline that maximizes accuracy while minimizing cost. The pipeline processes entities through increasingly expensive stages, with each stage handling what the previous one couldn't resolve.

Research and define:

**Stage 1: Structural Classification ($0, deterministic)**
- Use CFR citation structure as the primary signal. The CFR hierarchy (Title → Chapter → Subchapter → Part → Subpart → Section) encodes domain membership. Map CFR structural positions to domains.
- For Federal Register documents: use the `cfr_references` field to inherit domain membership from the CFR sections they amend.
- For openFDA records: use product type, application type, and regulatory category fields.
- Define the complete mapping table: CFR position → domain(s).
- Expected coverage: what percentage of entities can be classified this way?

**Stage 2: Metadata Classification ($0, deterministic)**
- Use entity metadata (source agency, document type, regulatory action type) to classify entities that Stage 1 missed.
- Define agency → domain mapping (e.g., "DEA" → Controlled Substances, "OCR" → HIPAA & Privacy).
- Define document type patterns (e.g., "Guidance Document" from FDA → appropriate FDA subdomain).
- Expected additional coverage beyond Stage 1.

**Stage 3: Keyword Cluster + Semantic Similarity Classification ($0, deterministic + local model)**
- This stage serves two purposes:
  - **Primary**: Classify entities that Stages 1-2 couldn't handle at all.
  - **Refinement**: Cross-classification pass on entities that Stages 1-2 *did* classify but may belong in additional domains. Example: a CFR section structurally classified as "Controlled Substances" in Stage 1 might also address telehealth prescribing requirements — Stage 3 should detect that and add a secondary domain assignment with `is_primary=false`. This refinement pass checks already-classified entities against all domains using keyword clusters and semantic similarity, looking for strong secondary signals.
- **3a: Weighted keyword clusters** — Design keyword clusters that are specific enough to avoid false positives. "Compounding" alone is too broad — "sterile compounding" + "USP <797>" + "outsourcing facility" together are strong signals. Define per-domain keyword clusters with weights and minimum match thresholds. Address the homonym problem: same terms meaning different things in different regulatory contexts. How to disambiguate?
- **3b: Semantic similarity via legal embeddings** — Use a legal-domain embedding model (LegalBERT, Legal-BERT-base, or similar) to compute entity embeddings and compare against domain description embeddings via cosine similarity. This runs locally (on Railway alongside Docling) at $0 per entity. Research which pre-trained legal embedding model performs best for US regulatory text classification without fine-tuning. Define the similarity threshold above which an entity gets assigned to a domain. This catches entities that use different vocabulary to describe the same regulatory concept — where keyword matching fails but semantic meaning aligns.
- Research whether any publicly available labeled datasets of US healthcare regulatory text exist that could bootstrap training data for a future LegalBERT fine-tune. Key datasets to evaluate: EUR-Lex/EURLEX57K, LEDGAR, CaseHOLD, MultiLegalPile, RegNLP corpora. Assess whether any of these transfer to Cedar's domain taxonomy or whether Cedar's own classification log (after human review) is the only viable training source.
- Expected additional coverage beyond Stages 1-2.

**Stage 4: AI Classification (cost per entity, Claude API) — MUST BE TRANSPARENT AND TUNABLE**
- Only for entities that remain unclassified after Stages 1-3.
- **Transparency requirement**: Every AI classification decision must be explainable. The system must log: the exact prompt sent, the entity context provided, the model's reasoning (chain-of-thought), the domain assignments returned, and the confidence scores. A human reviewing a classification should be able to see *why* the AI made that decision and *what information it used*. Store reasoning in `kg_classification_log` or a linked table.
- **Tunability requirement**: The classification prompts, confidence thresholds, domain descriptions provided to the model, and batching parameters must all be configurable — stored in `classification_rules` or a config table, editable without code changes. When a classification is wrong, an operator should be able to adjust the prompt template, add disambiguation instructions, modify domain descriptions, or change threshold values and re-run. The AI classifier is a tool with knobs, each knob visible and adjustable.
- Design the optimal prompt structure for Claude to classify a regulatory entity, given its name, description, source, and any partial metadata. The prompt should include the full domain taxonomy (or relevant subtree) so the model is choosing from a defined set, not inventing categories.
- Define batching strategy — how many entities per API call, what context to include.
- Define confidence thresholds — below what score should the AI-classified entity be flagged for human review? Recommend a tiered approach: high confidence (≥0.85) → auto-accept, medium (0.65-0.85) → accept but flag for eventual review, low (<0.65) → `needs_review=true`, requires human verification before the classification is treated as authoritative.
- Estimate: how many entities (out of 99K) will reach this stage? What's the projected cost?
- **Feedback loop**: When a human later overrides an AI classification, that correction should be captured in a format that can inform future prompt improvements. Define how corrections accumulate into prompt refinements over time.

**Stage 5: Irrelevance Confirmation**
- Entities that no stage could classify are candidates for the "irrelevant to healthcare practices" bin.
- Design a lightweight AI check: send a batch of unclassified entities to Claude with the question "Is this relevant to independent medical practice compliance?" Yes/No with confidence.
- Entities confirmed irrelevant get tagged but not deleted — they may become relevant if Cedar's scope expands.

For each stage, provide:
- Input: what entities it processes
- Logic: exact rules/patterns
- Output: domain assignments with confidence scores
- Estimated coverage (% of total corpus)
- Estimated cost
- Error modes: what it gets wrong and why

### 4. Non-Federal Source Classification — Robustness for Ambiguous Sources

The 99K entities are from federal APIs with relatively clean metadata (CFR citations, agency fields, document types). Non-federal sources are fundamentally harder — they lack standardized citation structures, use inconsistent naming conventions, and often contain ambiguous language that means different things depending on context.

Cedar monitors 71+ sources including:

- Florida state board rules (Board of Medicine, Board of Osteopathic Medicine, Board of Pharmacy, Board of Nursing, etc.)
- Florida Department of Health guidance
- Florida legislative session bills and committee analyses
- Board meeting minutes and decisions
- Professional association guidelines (AMA, AAFP, ACOG, etc.)
- CMS transmittals and coverage determinations (NCDs/LCDs)

**The framework must handle these sources at 80%+ accuracy.** This is harder than the 90% federal target because:

- **State board rules** use state-specific chapter/rule numbering that varies by state. Florida Administrative Code (FAC) Chapter 64B uses a different structure than Texas Administrative Code Title 22. The taxonomy must map both without state-specific hardcoding.
- **Board meeting minutes** are unstructured text — decisions, motions, enforcement actions buried in paragraph form. Classification depends on NLP extraction of the decision topic.
- **Legislative bills** may span multiple regulatory domains in a single document (omnibus healthcare bills). Cross-classification is the norm here.
- **Professional association guidelines** may reference regulatory requirements without citing specific regulations.
- **CMS transmittals** reference multiple regulatory areas and may affect billing, clinical standards, and coverage simultaneously.

For each source type, define:

- **Available classification signals** — what structured metadata exists? What's the equivalent of "CFR citation" for this source type?
- **Signal reliability** — how confident can we be in classifications based on these signals alone?
- **Fallback strategy** — when signals are insufficient, what's the minimum information needed for the AI classifier (Stage 4) to make a good decision?
- **Context enrichment** — can we improve classification by linking the non-federal entity to related federal entities? (e.g., a FL Board of Pharmacy rule that references 21 CFR 1301 should inherit some classification from the federal regulation it references)
- **State normalization** — how to map state-specific citation formats into Cedar's state-agnostic domain tree

**The goal is a classification approach that works when a new state is added.** If Cedar expands from Florida to Texas, the framework should handle Texas Medical Board rules, Texas Health and Safety Code, and Texas Administrative Code without rebuilding the pipeline — the domain taxonomy stays the same, the source-type-specific signal extraction adapts to the new state's citation format.

### 5. Authority Level Assignment

Cedar has an `authority_level` enum: federal_statute, federal_regulation, sub_regulatory_guidance, national_coverage_determination, local_coverage_determination, state_statute, state_board_rule, professional_standard.

Define deterministic rules for assigning authority level based on source and document type. Cover all source types Cedar ingests, not just the current three APIs.

### 6. Ongoing Classification — New Entity Ingestion

When the daily Federal Register pipeline or a scraping job ingests new entities, they need to be classified immediately. Define:

- How the pipeline determines if a new entity fits existing domain taxonomy
- When a new entity suggests a taxonomy gap (a regulation that doesn't fit any existing domain)
- How taxonomy evolution should work — who/what adds new domains, and how do existing classifications stay consistent?
- Alerting: when should Cedar flag a classification decision for human review?

## Deliverable Format

Produce a single structured document with:

1. **Relevance Filter Rules** — complete allowlist/denylist with CFR ranges and metadata signals
2. **Domain Taxonomy** — full hierarchical tree with all metadata per node (signals, cross-classification, practice-type relevance)
3. **Classification Pipeline Specification** — each stage with exact rules, expected coverage, cost estimates, and per-stage accuracy estimates. Target: 90%+ overall accuracy on federal corpus, 80%+ on non-federal sources.
4. **Semantic Embedding Strategy** — recommended legal embedding model, deployment approach, similarity thresholds, and assessment of available training datasets for future fine-tuning
5. **Source-Type Classification Guide** — per-source-type classification signals for non-federal sources, with explicit fallback strategies and state-normalization approach
6. **AI Classifier Specification** — exact prompt templates, batching parameters, confidence tiers, reasoning logging format, and tunability interface. Every parameter should be named and described so an operator can adjust it.
7. **Authority Level Rules** — deterministic mapping from source/type to authority level
8. **New Entity Classification Protocol** — how ongoing ingestion triggers classification
9. **Cost Model** — estimated total cost to classify the existing 99K corpus, per-entity cost for ongoing ingestion, and cost breakdown by pipeline stage
10. **Accuracy Budget** — where each stage contributes accuracy, where errors concentrate, and where human review effort should focus first

The document should be implementable — a developer should be able to read it and translate each rule directly into code or seed data. Avoid vague guidance like "use NLP to determine relevance." Instead: "If the entity's CFR reference falls within Title 42, Chapter IV, Subchapter B, Parts 410-426, classify as domain `medicare.coverage` with relevance_score 0.95."

**There is no length limit on this deliverable.** Prioritize comprehensiveness and completeness over brevity. If the full CFR-to-domain mapping table is 500 rows, include all 500 rows. If every Level 3 domain needs its own keyword cluster definition, define every one. Incomplete rules produce classification gaps — a missing CFR range mapping means entities fall through to expensive AI stages or get misclassified. The value of this document is directly proportional to its coverage.

## Reference Material

- Cedar's repo: https://github.com/cedar-admin/cedar — read `CLAUDE.md`, `supabase/migrations/` (especially 022-027 for current schema), and `docs/architecture/data-architecture-research.md`
- The existing 22 classification rules are in `inngest/corpus-classify.ts`
- The domain taxonomy seed is in `supabase/migrations/024_taxonomy_seed.sql`
- Cedar's monitoring sources spreadsheet: `docs/sources/FL-Cedar_Regulatory_Monitoring_Sources.xlsx` — 4 sheets covering 71+ sources with URLs, update cadences, domains covered, priority levels, and practice relevance notes. The Priority Matrix sheet ranks sources by criticality. The Board Meeting Minutes sheet details pre-regulatory intelligence sources. Read all 4 sheets.
- eCFR API: https://www.ecfr.gov/api/versioner/v1/ — for understanding CFR structure
- Federal Register API: https://www.federalregister.gov/api/v1/ — for understanding document metadata fields
- NUCC Healthcare Provider Taxonomy: https://www.nucc.org/ — for practice type code reference
