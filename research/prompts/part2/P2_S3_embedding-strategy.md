# Cedar Classification Framework — Part 2, Session 3 of 5

# Stage 3b: Semantic Embedding Strategy (Deferred Optimization)

> **Orchestrator note**: This prompt expects the following upstream session output pre-injected as context:
> - `P1_S4` — Domain taxonomy (11 L1 domains, 55 L2 subdomains with descriptions and classification signals)
>
> All outputs are in `research/outputs/part1/`. Read fully before proceeding.

---

## Platform Context

Cedar is a regulatory intelligence platform for independent Florida medical practices (14 practice types). Cedar's knowledge graph contains ~99,000 federal regulatory entities from eCFR, Federal Register, and openFDA. These entities are classified into a domain taxonomy through a multi-stage pipeline.

### Role of Stage 3b in the Pipeline

Stage 3b — semantic embedding classification — is a **deferred optimization**, designed now but activated later. The pipeline's core stages (structural classification, metadata scoring, keyword matching, and AI classification via Claude API) handle the initial classification workload. Embeddings get pulled off the shelf only if:

1. The AI classifier (Stage 4) proves too expensive at scale — too many entities reaching Stage 4 because Stages 1-3a can't resolve them
2. The AI classifier proves inaccurate on certain entity types where semantic similarity would perform better
3. Cedar expands to genuinely unstructured content (scraped web pages, board meeting minutes, court filings) where metadata and keyword signals are sparse

### Why Deferral is the Right Call

Two reference points inform this framing:

- **Structured metadata outperforms embeddings for well-structured data**: When entities have rich metadata (CFR references, agency identifiers, document types, structured fields) — which Cedar's federal corpus does — filtered retrieval on those metadata fields matches or exceeds embedding-based approaches. P1 Session S8-C estimates 85% of eCFR entities are classifiable by structural rules alone.

- **Domain-specific fine-tuning is required for regulatory text**: General-purpose embedding models underperform on specialized legal/regulatory vocabulary. A domain-specific fine-tune would need labeled training data that Cedar doesn't yet have in sufficient volume. After the initial classification run generates thousands of human-reviewed classifications in `kg_classification_log`, the fine-tuning path becomes viable.

### What This Session Produces

A **ready-to-implement specification on the shelf** — model evaluation, architecture design, decision criteria for activation — that can be handed to Claude Code as a PRP when the activation criteria are met. This means:

1. Model evaluation matrix with a clear recommendation
2. Domain centroid construction approach using Cedar's taxonomy
3. Similarity thresholds calibrated to regulatory text
4. Deployment architecture (Railway microservice or Supabase pgvector)
5. Available training dataset assessment
6. Activation decision criteria — the specific metrics that trigger pulling this off the shelf

---

## Research Objective 1: Model Evaluation

Evaluate candidate embedding models for US regulatory text classification. For each model, assess fitness for Cedar's specific use case: classifying federal regulatory entities (titles, abstracts, CFR section text, FDA guidance summaries) into a 55-node L2 domain taxonomy.

### Candidates to Evaluate

**Legal/regulatory domain models:**
- `nlpaueb/legal-bert-base-uncased` — Legal-BERT trained on US/EU legal corpora
- `pile-of-law/legalbert-large-1.7M-2` — LegalBERT trained on Pile of Law
- Any RegBERT variants or regulatory-specific BERT models available on HuggingFace

**General-purpose high-performing models:**
- `BAAI/bge-large-en-v1.5` — BGE from BAAI
- `intfloat/e5-large-v2` — E5 from Microsoft
- `thenlper/gte-large` — GTE from Alibaba DAMO
- `sentence-transformers/all-MiniLM-L12-v2` — lightweight sentence transformer
- `sentence-transformers/all-mpnet-base-v2` — higher quality sentence transformer
- `Alibaba-NLP/gte-Qwen2-1.5B-instruct` — newer instruction-tuned embedding model

**Newer regulatory/domain models:**
- Any models released since mid-2024 specifically targeting regulatory, compliance, or government text classification. Search HuggingFace for recent uploads in legal/regulatory NLP.

### Evaluation Criteria

For each candidate, produce a row in the evaluation matrix:

| Criterion | What to Assess |
|---|---|
| **Training corpus** | What was it trained on? How much US regulatory/legal content? Any FDA, CFR, Federal Register text? |
| **Embedding dimensions** | Dimensionality of output vectors. (Affects pgvector storage: 99K entities × dimensions × 4 bytes) |
| **Sequence length** | Maximum input token length. Cedar entities range from short titles (~20 tokens) to full regulation text (~2000+ tokens). How does the model handle long inputs? |
| **Benchmark performance** | Performance on legal/regulatory NLP benchmarks (LexGLUE, LEDGAR, CaseHOLD, any regulatory classification tasks). If no regulatory benchmarks exist, note general MTEB ranking. |
| **Inference requirements** | GPU required? CPU-only viable for 99K batch? Memory footprint? Approximate throughput (entities/second on CPU vs. GPU)? |
| **Deployment size** | Model file size. Can it fit alongside Docling on Cedar's Railway instance? |
| **Licensing** | Open source? Commercial use allowed? Any restrictions? |
| **Fine-tunability** | How easy to fine-tune with Cedar's own labeled data? What framework (Sentence Transformers, Hugging Face Trainer)? Minimum labeled examples needed? |
| **pgvector compatibility** | Any issues storing these embeddings in Supabase pgvector? (Max dimensions, index type implications) |

### Recommendation

After evaluating all candidates, recommend:

1. **Primary model**: Best overall fit for Cedar's regulatory text classification
2. **Lightweight alternative**: For if deployment constraints (Railway CPU) rule out the primary
3. **Fine-tune base**: Which model to start from when Cedar has enough labeled data for domain-specific fine-tuning

Justify each recommendation with specific reasoning tied to Cedar's use case.

---

## Research Objective 2: Domain Centroid Construction

Each of Cedar's 55 L2 domains needs a "centroid" embedding — a reference vector representing what entities in that domain look like semantically.

### 2A. Centroid Construction Approach

Evaluate options:

**Option A — Description-only**: Embed each L2 domain's description text from S4.

**Option B — Description + keyword enrichment**: Concatenate domain description with keyword cluster terms (from S3/P2-S2) before embedding.

**Option C — Sample-based centroids**: After the initial classification run, use classified entities to compute centroids (mean of all entity vectors per domain).

**Option D — Hybrid**: Start with Option B, update to Option C after initial classification.

Recommend an approach. Define the exact input text format for centroid generation.

### 2B. Centroid Maintenance

Define update frequency, triggers (Inngest event or cron), and versioning approach.

### 2C. Taxonomy Depth

Should embeddings target L2 only (55 centroids) or extend to L3 (hundreds)? Recommend with reasoning based on the accuracy/compute tradeoff.

---

## Research Objective 3: Similarity Thresholds

### 3A. Classification Thresholds

Define cosine similarity thresholds for:
- Primary classification
- Secondary cross-classification
- Ambiguity zone (→ HITL review)
- Irrelevance (below threshold for all domains)

Should thresholds vary by taxonomy level, domain, or entity source type?

### 3B. Calibration Plan

After the initial classification run produces labeled data, define the process for:
1. Embedding all classified entities
2. Computing per-domain similarity distributions
3. Tuning thresholds to maximize precision/recall on labeled data
4. Output format for threshold calibration results

---

## Research Objective 4: Training Dataset Assessment

Research publicly available labeled datasets:

| Dataset | Source | What to Assess |
|---|---|---|
| **EUR-Lex / EURLEX57K** | EU legislation | Size, label taxonomy, transferability to US regulatory text |
| **LEDGAR** | Contract provisions | Relevance to regulatory (vs. transactional) text |
| **CaseHOLD** | Legal holdings | Relevance to regulatory entities |
| **MultiLegalPile** | Multi-jurisdictional legal | US content volume |
| **RegNLP corpora** | Regulatory NLP | Existence, size, labeling scheme |
| **Federal Register corpus** | FR documents | Whether labeled FR data by topic exists |
| **LexGLUE benchmark** | Legal NLU suite | Component tasks relevant to regulatory classification |

For each: accessibility, size, label taxonomy overlap with Cedar's 55 L2 domains, adaptation effort, and usefulness for fine-tuning vs. evaluation only.

**Fine-tuning readiness recommendation**: Fine-tune now on external data? Wait for Cedar's own `kg_classification_log` data? How many human-reviewed classifications per domain are needed for meaningful fine-tuning?

---

## Research Objective 5: Deployment Architecture

### 5A. Infrastructure Options

Evaluate: Railway microservice (alongside Docling), Supabase Edge Function, dedicated GPU instance, external embedding API (OpenAI/Cohere/Voyage AI). Recommend with cost estimates.

### 5B. Batch Processing

Define workflow for embedding 99K entities: batch size, total processing time, error handling.

### 5C. Incremental Processing

For daily new entities: at which pipeline stage does embedding happen? Latency target? Index update strategy?

### 5D. pgvector Configuration

```sql
-- Embedding storage
-- Index creation (ivfflat vs. hnsw, distance metric)
-- Nearest-centroid search function
```

Provide complete SQL.

---

## Research Objective 6: Activation Decision Criteria

Define specific, measurable thresholds that trigger activating Stage 3b:

| Trigger | Threshold | Measurement Source | Action |
|---|---|---|---|
| **Cost** | Stage 4 API spend > $X/month | Anthropic billing | Activate 3b as pre-filter to reduce Stage 4 volume |
| **Accuracy** | Stage 3a accuracy < Y% | `kg_classification_log` HITL corrections | Activate 3b to supplement/replace 3a for specific domains |
| **Content type** | Web/unstructured sources added | `kg_entities.source_type` distribution | Activate 3b for those source types only |
| **Data volume** | N+ human-reviewed per domain | `kg_classification_log` counts | Fine-tune model, then activate |

Define specific dollar amounts, accuracy percentages, and entity counts for each threshold. Include the cost break-even calculation: at what Stage 4 volume does the infrastructure cost of running embeddings pay for itself?

---

## Deliverable Checklist

Produce all of the following as a single structured markdown document:

- [ ] Model evaluation matrix (all candidates × all criteria)
- [ ] Primary, lightweight, and fine-tune-base recommendations with reasoning
- [ ] Domain centroid construction specification
- [ ] Similarity threshold recommendations with calibration process
- [ ] Training dataset assessment table
- [ ] Fine-tuning readiness recommendation with minimum data requirements
- [ ] Deployment architecture recommendation with cost estimate
- [ ] Batch processing workflow for 99K entities
- [ ] Incremental processing workflow for daily entities
- [ ] pgvector SQL (schema, indexes, search function)
- [ ] Activation decision criteria matrix with specific thresholds and break-even calculations
