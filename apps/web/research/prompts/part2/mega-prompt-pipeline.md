# Cedar Classification Framework — Part 2 of 3

# Classification Pipeline, Semantic Embedding Strategy & Cost Model

## Context for the Research Agent

Cedar is an AI-powered regulatory monitoring platform for independent medical practices in Florida (expanding to all 50 states). The platform monitors 71+ regulatory sources across federal agencies, Florida state boards, and legislative activity. Target users are practice owners running functional medicine, hormone therapy, compounding pharmacy, med spa, weight management, peptide therapy, IV therapy, regenerative medicine, telehealth, and chiropractic practices.

Cedar has a PostgreSQL knowledge graph on Supabase containing ~99K entities ingested from three federal government APIs (eCFR, Federal Register, openFDA). These entities need to be classified into a domain taxonomy using a multi-stage pipeline that maximizes accuracy while minimizing cost.

### Database Schema Context

- `kg_entities` — individual regulations, rules, guidance docs, board decisions
- `kg_domains` — hierarchical taxonomy (self-referential via `parent_domain_id`, supports arbitrary depth)
- `kg_entity_domains` — many-to-many classification with `relevance_score`, `classified_by`, and `is_primary`
- `kg_practice_types` — NUCC-based practice type codes (14 seeded)
- `kg_entity_practice_relevance` — maps entities to practice types with relevance scores
- `kg_classification_log` — audit trail tracking rule-based, ML, and manual classifications with `reasoning` field
- `classification_rules` — configurable rules with `rule_type`, `rule_config` (JSONB), `target_domain_id`, `priority`, and `is_active`

### What This Session Depends On — CRITICAL: READ THE ATTACHED SESSION 1 OUTPUT

This prompt is accompanied by a second attachment: the **complete output from Session 1**. That document contains:

- The relevance filter (allowlist/denylist) for the 99K federal entities
- The complete domain taxonomy with every domain node at every level
- The exhaustive CFR-to-domain mapping table

**You must read and reference the Session 1 output throughout this research.** The classification pipeline you design here operates on the exact taxonomy, domain codes, and CFR mappings defined in that document. When specifying keyword clusters per domain, use the actual domain codes from Session 1. When estimating Stage 1 coverage, reference the actual CFR mapping table from Session 1. When designing the AI classifier prompt, include the actual taxonomy structure from Session 1.

Do not invent placeholder domain codes or assume a generic taxonomy shape. The Session 1 output is your ground truth.

### What This Session Produces

1. **Classification Pipeline Specification** — five stages with exact rules, expected coverage per stage, cost estimates, error modes, and per-stage accuracy estimates
2. **Semantic Embedding Strategy** — recommended legal embedding model, deployment approach, similarity thresholds, and assessment of available training datasets
3. **AI Classifier Specification** — exact prompt templates, batching parameters, confidence tiers, reasoning logging format, and tunability interface
4. **Cost Model** — total cost to classify existing 99K corpus and per-entity cost for ongoing ingestion
5. **Accuracy Budget** — where each stage contributes accuracy, where errors concentrate, and where human review effort should focus

---

## Research Objective 1: Classification Pipeline Design — Five Stages, Cost-Efficient Accuracy

Design a multi-stage classification pipeline that processes entities through increasingly expensive stages. Each stage handles what the previous one couldn't resolve. The overall target is **90%+ accuracy on the federal corpus before human review**.

### Stage 1: Structural Classification ($0, deterministic)

Use CFR citation structure as the primary signal. The CFR hierarchy (Title → Chapter → Subchapter → Part → Subpart → Section) encodes domain membership.

Research and define:

- **CFR-to-domain lookup**: How to implement the mapping table from Session 1 as a runtime classification engine. The entity has a `cfr_reference` or `citation` field — define the parsing logic to extract Title/Chapter/Part and look up the domain assignment.
- **Federal Register inheritance**: Federal Register documents have a `cfr_references` field listing which CFR sections they amend. Define the logic to inherit domain membership from the referenced CFR sections. Handle the case where a single FR document references multiple CFR parts in different domains (→ cross-classification).
- **openFDA structural signals**: openFDA records have `product_type`, `application_type`, `regulatory_category`, and other structured fields. Define the mapping from these fields to domains. Cover: drug applications (NDA, ANDA, BLA), device classifications (510(k), PMA, De Novo), enforcement actions, adverse event reports, labeling supplements.
- **Handling ambiguous citations**: Some entities have malformed, missing, or overly broad CFR references (e.g., referencing an entire Title instead of a specific Part). Define the fallback behavior — does the entity proceed to Stage 2, or does it get a low-confidence structural classification?
- **Expected coverage**: What percentage of the 99K entities can be classified at Stage 1? Estimate separately for eCFR entities (should be very high), Federal Register entities (moderate — depends on `cfr_references` field completeness), and openFDA entities (varies by record type).
- **Expected accuracy**: Of entities classified at Stage 1, what accuracy rate? This should be very high (95%+) since it's deterministic lookup, but flag known error modes (e.g., CFR parts that span multiple domains).

### Stage 2: Metadata Classification ($0, deterministic)

Use entity metadata fields — source agency, document type, regulatory action type — to classify entities that Stage 1 missed.

Research and define:

- **Agency-to-domain mapping**: Define the complete mapping from federal agency/sub-agency names to domains. Cover at minimum:
    - FDA → appropriate FDA subdomains (and how to distinguish between FDA drug, device, biologics, compounding divisions)
    - DEA → Controlled Substances domains
    - CMS → Medicare/Medicaid domains (and how to distinguish between Medicare and Medicaid content)
    - HHS Office for Civil Rights (OCR) → HIPAA & Privacy domains
    - OSHA → Workplace Safety domains
    - FTC → Advertising/Marketing domains (specifically health advertising)
    - DOJ → Enforcement domains (ADA, anti-kickback, False Claims Act)
    - OIG → Fraud & Abuse domains (OIG advisory opinions, compliance guidance)
    - SAMHSA → Behavioral health/substance abuse treatment domains
    - HRSA → 340B, health center program domains
    
    For each agency, specify which subdomain(s) within the taxonomy, and whether the mapping should be to L1, L2, or L3.
    
- **Document type patterns**: Define mappings from document types to domains. Federal Register has: final rules, proposed rules, notices, presidential documents, corrections. openFDA has: drug labels, enforcement reports, adverse events, 510(k) clearances, PMA approvals. For each document type, does it narrow the domain assignment?
- **Regulatory action type signals**: Some FR documents specify the type of regulatory action (rulemaking, guidance, enforcement, withdrawal). Define how action type affects classification confidence.
- **Expected additional coverage**: What percentage of entities that Stage 1 missed can Stage 2 classify? What's the cumulative coverage after Stages 1+2?
- **Expected accuracy**: Metadata classification is coarser — an entity from "FDA" could be in many subdomains. What accuracy rate at what taxonomy level? (Agency mapping might reliably get L1 but not L3.)

### Stage 3: Keyword Cluster + Semantic Similarity Classification ($0, deterministic + local model)

This stage serves two purposes:

- **Primary**: Classify entities that Stages 1-2 couldn't handle at all
- **Refinement**: Cross-classification pass on entities that Stages 1-2 *did* classify but may belong in additional domains

**Example of refinement**: A CFR section structurally classified as "Controlled Substances" in Stage 1 might also address telehealth prescribing requirements — Stage 3 should detect that and add a secondary domain assignment with `is_primary=false`.

### Stage 3a: Weighted Keyword Clusters

Research and define:

- **Per-domain keyword cluster definitions**: For every domain at L2 and L3 in the taxonomy, define a keyword cluster that identifies membership. Each cluster should include:
    - **Positive keywords** with weights (e.g., "sterile compounding" = 0.9, "USP 797" = 0.95, "beyond-use date" = 0.85)
    - **Negative keywords** that distinguish this domain from similar domains (e.g., for `compounding.sterile`, negative keywords like "non-sterile", "simple compounding" reduce the score)
    - **Minimum match threshold** — the cumulative weighted score above which an entity gets assigned to this domain
    - **Disambiguation rules** — how to handle homonyms and ambiguous terms. "Compounding" in a pharmaceutical context means drug preparation; in a financial context it means interest calculation. What contextual signals disambiguate?
- **Keyword cluster interaction**: When an entity's text matches keyword clusters from multiple domains, how are conflicts resolved? Define the scoring algorithm.
- **Performance on cross-classification**: How effective is keyword matching at detecting secondary domain membership? What types of cross-classification does it catch well vs. miss?

### Stage 3b: Semantic Similarity via Legal Embeddings

Research and define:

- **Model selection**: Which pre-trained embedding model performs best for US regulatory text classification without fine-tuning? Evaluate:
    - Legal-BERT (base and variants)
    - LegalBERT (from Chalkidis et al.)
    - RegBERT (if available)
    - General-purpose models with strong performance on legal/regulatory text (e.g., BGE, E5, GTE)
    - Sentence transformers trained on legal corpora
    
    For each candidate, assess: embedding quality on regulatory text, model size, inference speed, deployment requirements (can it run on Railway alongside Docling?), and memory footprint.
    
- **Domain description embeddings**: Each domain has a description. Define how to create a "domain centroid" embedding — should it use just the description, or a composite of description + sample entity text + keyword cluster terms?
- **Similarity thresholds**: What cosine similarity threshold constitutes a domain match? Should the threshold vary by taxonomy level? (L1 matching might use a lower threshold than L3 matching since L1 domains are broader.)
- **Refinement vs. primary classification**: For the refinement pass (adding secondary domains to already-classified entities), should the similarity threshold be different than for primary classification of unclassified entities?
- **Deployment architecture**: How does this model deploy? On Railway as a microservice? As a batch job? Define the infrastructure requirements and batch processing approach for 99K entities.
- **Expected coverage**: What percentage of previously-unclassified entities can semantic similarity classify? What percentage of already-classified entities get valuable secondary domain assignments?

### Stage 4: AI Classification (cost per entity, Claude API)

Only for entities that remain unclassified after Stages 1-3. Every AI classification decision must be transparent, auditable, and tunable.

Research and define:

- **Prompt structure**: Design the optimal prompt template for Claude to classify a regulatory entity. The prompt should include:
    - The entity's name, description, source, citation, and any partial metadata
    - The relevant domain taxonomy subtree (not the full taxonomy — pruned to relevant branches based on any partial signals from earlier stages)
    - Explicit instructions to return: primary domain assignment, secondary domain assignments, confidence score per assignment, and chain-of-thought reasoning
    - Output format specification (JSON schema)
    
    Provide the complete prompt template with placeholders for entity data and taxonomy context.
    
- **Taxonomy context management**: The full taxonomy is too large to include in every API call. Define the strategy for pruning the taxonomy to relevant branches per entity. If Stages 1-3 produced partial signals (e.g., "this is probably healthcare billing related but we can't determine the specific subdomain"), use those signals to select which taxonomy branches to include.
- **Batching strategy**: How many entities per API call? What context to include? Define the optimal batch size considering:
    - Context window limits
    - Classification quality (does batching degrade accuracy?)
    - Cost efficiency (fewer calls = lower overhead)
    - Error isolation (if one entity in a batch causes issues, how does that affect the others?)
    
    Recommend a specific batch size with reasoning.
    
- **Confidence tiers**: Define three tiers with specific thresholds:
    - **High confidence (≥ X)**: Auto-accept, no human review needed
    - **Medium confidence (Y to X)**: Accept but flag for eventual review
    - **Low confidence (< Y)**: `needs_review=true`, requires human verification before classification is treated as authoritative
    
    Recommend specific values for X and Y with reasoning.
    
- **Reasoning logging**: Define the exact data structure for storing AI classification reasoning in `kg_classification_log`. What fields? What format? How to make the reasoning queryable (e.g., "show me all entities where the AI was confused between two domains")?
- **Tunability interface**: List every parameter that an operator should be able to adjust without code changes, and where each parameter lives:
    - Prompt template text → stored where?
    - Confidence thresholds → stored where?
    - Domain descriptions provided to the model → stored where?
    - Batching parameters → stored where?
    - Taxonomy pruning rules → stored where?
    
    Define the configuration schema.
    
- **Feedback loop**: When a human later overrides an AI classification, define:
    - How the correction is stored (fields, format)
    - How corrections accumulate over time
    - How accumulated corrections inform prompt improvements (manual review trigger? automatic prompt adjustment?)
    - A concrete example: "Entity X was classified as `billing.coding` but a human corrected it to `billing.audit-defense`. The correction log shows this is the 5th time the AI confused coding updates with audit defense. Action: add disambiguation instruction to the prompt template for the `billing` branch."
- **Estimated volume and cost**: How many entities out of 99K will reach Stage 4? Based on coverage estimates from Stages 1-3, estimate the number. Then calculate cost using Claude API pricing (specify the model — Claude 3.5 Haiku for classification, or Claude 3.5 Sonnet for higher accuracy? Recommend with cost/accuracy tradeoff analysis).

### Stage 5: Irrelevance Confirmation

Entities that no stage could classify are candidates for the "irrelevant to healthcare practices" bin.

Research and define:

- **Lightweight AI check design**: Define a batch prompt that sends unclassified entities to Claude with the question "Is this relevant to independent medical practice compliance?" Binary Yes/No with confidence score.
- **Batch size and prompt**: How many entities per irrelevance check call? Provide the prompt template.
- **Threshold for irrelevance confirmation**: Below what confidence should the entity remain in an "uncertain" state rather than being tagged irrelevant?
- **Retention policy**: Entities confirmed irrelevant get tagged but never deleted — they may become relevant if Cedar's scope expands. Define the tagging schema.
- **Estimated volume**: How many entities will reach Stage 5?

### Per-Stage Summary Table

For each of the five stages, produce a summary row with:

- Stage name and type (deterministic / model / API)
- Input description (what entities it processes)
- Core logic (brief)
- Output (domain assignments with confidence)
- Estimated coverage (% of total corpus classified at this stage)
- Cumulative coverage (% classified after this and all prior stages)
- Estimated accuracy at this stage
- Estimated cost per entity
- Primary error modes

---

## Research Objective 2: Semantic Embedding Strategy — Deep Dive

Expand on Stage 3b with a dedicated section covering:

### Model Evaluation

For each candidate embedding model, research:

- **Training data**: What corpus was it trained on? How relevant to US regulatory text?
- **Benchmark performance**: On legal/regulatory NLP benchmarks, how does it perform?
- **Embedding dimensions**: What dimensionality? (This affects pgvector storage and search performance)
- **Inference requirements**: GPU required? CPU-only viable? Memory footprint? Batch throughput?
- **Licensing**: Open source? Commercial restrictions?
- **Integration with pgvector**: Can embeddings be stored in Supabase pgvector and queried efficiently at scale (99K entities × potential re-embedding)?

### Available Training Datasets Assessment

Research whether any publicly available labeled datasets of US healthcare regulatory text exist that could bootstrap training data for a future model fine-tune:

- **EUR-Lex / EURLEX57K**: EU legislation classification dataset. Does it transfer to US regulatory text?
- **LEDGAR**: Contract provision classification. Relevance to regulatory text?
- **CaseHOLD**: Legal holding classification. Relevance?
- **MultiLegalPile**: Multi-jurisdictional legal corpus. Contains US content?
- **RegNLP corpora**: Any regulatory-specific NLP datasets?
- **Federal Register corpus**: Has anyone published a labeled dataset of Federal Register documents by topic/agency/domain?
- **CMS/Medicare corpus**: Any labeled datasets of Medicare/Medicaid regulatory text?

For each dataset, assess: size, label taxonomy, overlap with Cedar's domain taxonomy, effort to adapt labels to Cedar's taxonomy, and whether it's useful for bootstrapping vs. requiring too much adaptation.

Conclude with a recommendation: fine-tune a legal model on existing datasets, wait until Cedar's own `kg_classification_log` has enough human-reviewed classifications to fine-tune, or proceed with zero-shot/few-shot approaches only?

### Deployment Architecture

Define the exact deployment plan for the embedding model:

- Where does it run? (Railway, Vercel serverless, dedicated GPU instance?)
- Batch processing workflow for initial 99K entity embedding
- Incremental embedding for new entities ingested daily
- Storage in pgvector: index type, distance metric, query patterns
- Estimated processing time for the initial corpus
- Estimated cost (compute cost, not API cost since it's local)

---

## Research Objective 3: Cost Model

Produce a detailed cost breakdown for:

### Initial Corpus Classification (99K entities)

For each pipeline stage:

- Number of entities processed
- Cost per entity at this stage
- Total cost for this stage
- Time estimate to process

Include the embedding generation cost (compute time for 99K entities) and the AI classification cost (Claude API calls for entities reaching Stage 4).

### Ongoing Per-Entity Cost

When a new entity is ingested from the daily Federal Register pipeline or a scraping job:

- Average cost to classify one new entity (weighted across stages — most will resolve at Stage 1-2)
- Worst-case cost (entity that reaches Stage 4)
- Monthly cost estimate assuming Cedar ingests ~50-200 new entities per day

### Cost Optimization Recommendations

- Where are the biggest cost savings opportunities?
- What accuracy tradeoffs would reduce cost significantly?
- At what entity volume does fine-tuning a local model become cheaper than Claude API classification?

---

## Research Objective 4: Accuracy Budget

Produce an accuracy analysis showing:

### Per-Stage Accuracy Contribution

- What accuracy does each stage achieve on the entities it classifies?
- Where do errors concentrate? (Which stages produce the most misclassifications, and what types?)
- What is the overall accuracy after all stages (weighted by the volume each stage handles)?

### Error Taxonomy

Categorize the types of classification errors:

- **Domain confusion**: Entity assigned to wrong L1 domain (rare but severe)
- **Subdomain confusion**: Correct L1 but wrong L2/L3 (more common, less severe)
- **Missing cross-classification**: Entity correctly classified in primary domain but missing secondary domains
- **Over-classification**: Entity assigned to too many domains (noise)
- **Confidence miscalibration**: High-confidence classifications that are wrong

For each error type:

- Which pipeline stage produces it?
- How to detect it?
- How to reduce it?

### Human Review Priority

Given limited human review bandwidth, which classifications should be reviewed first?

- Rank by: error likelihood × impact (entities seen by more practice types have higher impact)
- Define the review queue sorting algorithm
- Estimate: how many entities need human review to achieve 95% overall accuracy? 98%?

---

## Deliverable Format

Produce a single structured markdown document containing all four research objectives. The document should be implementable — a developer reading Stage 1 should be able to write the CFR parsing and lookup code directly from the specification. A developer reading the AI Classifier section should be able to implement the prompt template, batching logic, and confidence thresholds without ambiguity.

**There is no length limit.** Include complete prompt templates, complete configuration schemas, complete mapping tables. Every parameter should be named, typed, and have a recommended value with reasoning.

## Reference Material

- Cedar's repo: https://github.com/cedar-admin/cedar — read `CLAUDE.md`, `supabase/migrations/` (especially 022-027 for current schema), and `docs/architecture/data-architecture-research.md`
- The existing 22 classification rules are in `inngest/corpus-classify.ts`
- Anthropic Claude API pricing: https://www.anthropic.com/pricing — for cost calculations
- Legal-BERT: https://huggingface.co/nlpaueb/legal-bert-base-uncased
- LegalBERT: https://huggingface.co/pile-of-law/legalbert-large-1.7M-2
- Sentence Transformers: https://www.sbert.net/
- pgvector documentation: https://github.com/pgvector/pgvector