# How regulatory platforms organize massive corpora — and what Cedar should build next

**Cedar's 99K-entity knowledge graph already has the right foundation.** The existing PostgreSQL schema on Supabase — with `kg_entities`, `kg_entity_types`, `kg_domains`, `kg_relationships`, and `classification_rules` — mirrors the core architecture that platforms like Westlaw, Ascent AI, and Bloomberg Law use to organize millions of regulatory documents. What Cedar needs is a structured expansion: a healthcare-specific taxonomy layered on top of the knowledge graph, a richer relationship type system, temporal versioning, and a daily ingestion pipeline from the Federal Register API. This report synthesizes research across 15+ platforms, 6 standards bodies, and dozens of technical sources into a concrete implementation plan that builds on Cedar's actual schema.

---

## The industry classifies along four axes, and Cedar should too

Every major legal information platform organizes regulatory content along the same four dimensions — they just weight them differently. **LexisNexis** uses 20+ practice areas subdivided into **16,000+ topics** maintained by editorial staff and classified by ML (their SmartIndexing system assigns 50–99% relevance scores per topic). **Westlaw's** century-old Key Number System spans **450+ legal topics** with **100,000+ subtopic key numbers** going 3–5 levels deep, all assigned by attorney-editors who write headnotes for each case. **Bloomberg Law** organizes around 14 Practice Centers supplemented by AI-powered tools (Points of Law, Smart Code). **Ascent AI** breaks from all three by operating at the *obligation* level — its NLP engines parse regulatory text into individual requirement objects mapped to customer-specific compliance profiles.

The four universal classification axes are: **(1) regulatory domain/topic** (what the regulation is about), **(2) jurisdiction** (where it applies), **(3) issuing authority/agency** (who wrote it), and **(4) document type** (what form it takes). For healthcare, a critical fifth axis emerges: **(5) practice type and clinical workflow** (who it affects and how). Cedar's existing `kg_domains` table handles axis 1, `kg_entity_types` handles axis 4, and metadata within `kg_entities` can carry axes 2–3. The gap is axis 5 — practice-type relevance — which is Cedar's primary differentiator for independent medical practices.

The NUCC Healthcare Provider Taxonomy Code Set provides the industry-standard classification for practice types. It is a **3-level hierarchy of ~883 codes** (Provider Grouping → Classification → Specialization) required for NPI registration and HIPAA transactions. CMS maintains a crosswalk linking Medicare-eligible provider types to these codes. Cedar should adopt NUCC codes as the canonical reference for mapping regulations to practice types — "compounding pharmacy," "endocrinology" (hormone therapy), and "internal medicine" (functional medicine) all have specific taxonomy codes.

For the domain taxonomy itself, the practical sweet spot across all surveyed platforms is **3–5 levels of hierarchy**. EuroVoc goes to 8 levels but concentrates 80% of descriptors at levels 4–5. Westlaw's Key Numbers rarely exceed 5 levels. Cedar should target 4 levels:

- **Level 1 — Compliance Domain** (~10 categories): HIPAA, Medicare/Medicaid, Controlled Substances (DEA), FDA, OSHA, Fraud & Abuse, Licensing & Credentialing, Clinical Standards, Employment, Billing & Coding
- **Level 2 — Regulatory Topic** (~50–80 categories): Under HIPAA → Privacy Rule, Security Rule, Breach Notification; Under DEA → Prescribing, Registration, Record-Keeping, EPCS
- **Level 3 — Specific Requirement Area** (~300–500): Under HIPAA Security Rule → Access Controls, Audit Controls, Transmission Security, Risk Analysis
- **Level 4 — Obligation** (extracted per-entity): Individual enforceable requirements parsed from regulatory text

This maps directly to extending `kg_domains` with a `parent_domain_id` self-referential foreign key and a `depth` column. The existing `classification_rules` table can hold the logic that assigns entities to domains — currently likely rule-based, evolving toward ML-assisted classification.

### Recommended schema additions for taxonomy

```sql
-- Extend kg_domains with hierarchy support
ALTER TABLE kg_domains ADD COLUMN parent_domain_id UUID REFERENCES kg_domains(id);
ALTER TABLE kg_domains ADD COLUMN depth INTEGER DEFAULT 1;
ALTER TABLE kg_domains ADD COLUMN domain_code TEXT; -- e.g., 'HIPAA.SECURITY.ACCESS'
ALTER TABLE kg_domains ADD COLUMN taxonomy_source TEXT; -- 'cedar_internal', 'nucc', 'cfr_index'

-- Many-to-many classification with relevance scoring (LexisNexis SmartIndexing pattern)
CREATE TABLE kg_entity_domains (
    entity_id UUID REFERENCES kg_entities(id) ON DELETE CASCADE,
    domain_id UUID REFERENCES kg_domains(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    relevance_score NUMERIC(4,3) CHECK (relevance_score BETWEEN 0 AND 1),
    classified_by TEXT DEFAULT 'rule', -- 'rule', 'ml', 'manual'
    classified_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (entity_id, domain_id)
);
CREATE INDEX idx_entity_domains_domain ON kg_entity_domains(domain_id);
CREATE INDEX idx_entity_domains_primary ON kg_entity_domains(entity_id) WHERE is_primary;

-- Practice-type relevance using NUCC codes
CREATE TABLE kg_practice_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nucc_code TEXT UNIQUE NOT NULL, -- e.g., '207RC0000X'
    grouping TEXT NOT NULL,         -- Level 1: 'Allopathic & Osteopathic Physicians'
    classification TEXT NOT NULL,   -- Level 2: 'Internal Medicine'
    specialization TEXT,            -- Level 3: 'Endocrinology'
    display_name TEXT NOT NULL      -- 'Hormone Therapy / Endocrinology'
);

CREATE TABLE kg_entity_practice_relevance (
    entity_id UUID REFERENCES kg_entities(id) ON DELETE CASCADE,
    practice_type_id UUID REFERENCES kg_practice_types(id) ON DELETE CASCADE,
    relevance_score NUMERIC(4,3),
    PRIMARY KEY (entity_id, practice_type_id)
);
```

---

## Relationships need types, direction, and temporal bounds

Cedar's `kg_relationships` table already models entity-to-entity connections. The key enhancement is a controlled vocabulary of **relationship types** drawn from how regulations actually connect. Research across the European Legislation Identifier (ELI) ontology, Westlaw's KeyCite system, LexisNexis Shepard's Citations, and the Federal Register and eCFR APIs reveals a core set of **12 relationship types** that matter for regulatory compliance monitoring.

The **ELI ontology** defines `changes`/`changed_by`, `consolidates`/`consolidated_by`, `transposes`/`transposed_by`, `cites`/`is_cited_by`, and `has_legal_basis` as its core relationships. Westlaw's KeyCite distinguishes between **direct history** (procedural relationships within the same rulemaking) and **citing references** (how other documents treat a regulation). This two-tier model is critical: a Federal Register final rule that amends 42 CFR Part 482 has a *direct amendment relationship*, while a CMS transmittal that references 42 CFR Part 482 for guidance has a *citation relationship*. They carry different weights for compliance monitoring.

The Federal Register API natively exposes amendment relationships via the `cfr_references` field (which CFR titles/parts a document amends), `correction_of`/`corrections` fields, `regulation_id_numbers` (RIN linking to the Unified Agenda regulatory timeline), and `docket_ids` (linking to Regulations.gov dockets). The eCFR embeds source citations in section notes (e.g., "[85 FR 25945, May 1, 2020]") connecting each CFR section to the Federal Register documents that created or amended it.

For **versioning**, the eCFR implements a snapshot-based point-in-time system — daily snapshots capture each title's state, accessible through the API at any historical date via `/api/versioner/v1/full/{date}/title-{number}.xml`. The FRBR (Functional Requirements for Bibliographic Records) model provides the conceptual framework: a **Work** is the abstract regulation concept (e.g., "21 CFR 312.23"), an **Expression** is its text at a point in time, and a **Manifestation** is the format (XML, HTML, PDF). Cedar should adopt this distinction by separating a regulation's identity from its versioned content.

### Recommended relationship type enumeration and schema changes

```sql
-- Controlled vocabulary for relationship types
CREATE TYPE relationship_type_enum AS ENUM (
    'amends',           -- FR document modifies CFR section
    'amended_by',       -- inverse
    'supersedes',       -- new regulation replaces old
    'superseded_by',    -- inverse
    'implements',       -- regulation implements a statute
    'interprets',       -- guidance/notice interprets regulation
    'cites',            -- document references another
    'cited_by',         -- inverse
    'corrects',         -- correction of another document
    'part_of',          -- section → part → chapter → title hierarchy
    'has_legal_basis',  -- regulation → authorizing statute
    'conflicts_with',   -- identified regulatory conflict
    'related_to',       -- general association
    'delegates_to',     -- authority delegation
    'enables',          -- permits an activity
    'restricts'         -- constrains an activity
);

-- Extend kg_relationships with temporal bounds and provenance
ALTER TABLE kg_relationships ADD COLUMN relationship_type_enum relationship_type_enum;
ALTER TABLE kg_relationships ADD COLUMN effective_date DATE;
ALTER TABLE kg_relationships ADD COLUMN end_date DATE;
ALTER TABLE kg_relationships ADD COLUMN confidence NUMERIC(4,3) DEFAULT 1.0;
ALTER TABLE kg_relationships ADD COLUMN provenance TEXT; -- 'api_cfr_references', 'api_correction_of', 'nlp_extracted', 'manual'
ALTER TABLE kg_relationships ADD COLUMN fr_citation TEXT; -- e.g., '89 FR 1433'

-- Versioning table (FRBR Expression model)
CREATE TABLE kg_entity_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES kg_entities(id) ON DELETE CASCADE,
    version_date DATE NOT NULL,
    content_hash TEXT, -- SHA-256 for change detection
    content_snapshot TEXT, -- full text at this point in time
    fr_document_number TEXT, -- Federal Register doc that triggered this version
    change_summary TEXT, -- AI-generated summary of what changed
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(entity_id, version_date)
);
CREATE INDEX idx_entity_versions_date ON kg_entity_versions(entity_id, version_date DESC);

-- Composite indexes for relationship traversal
CREATE INDEX idx_relationships_source_type ON kg_relationships(source_entity_id, relationship_type_enum);
CREATE INDEX idx_relationships_target_type ON kg_relationships(target_entity_id, relationship_type_enum);
```

---

## Relevance scoring starts with rules, graduates to ML

The cold-start problem — how to determine what's relevant to independent medical practices when Cedar has no user behavior data — is solved differently by each platform. **Ascent AI** uses an expert-curated "Regulatory Map" defined during customer onboarding: a structured definition of which jurisdictions, regulators, and rule sections matter. **Compliance.ai** uses an "Expert-in-the-Loop" (EITL) patented approach where ML models classify documents and human compliance experts adjudicate ambiguous cases, with corrections fed back as training data. **Westlaw Precision** added 250+ attorney editors to manually tag cases with metadata (issue outcome, fact pattern, motion type), producing **3x improvement** in relevant results found per session.

Academic research confirms the hybrid approach outperforms either pure rules or pure ML. A study of **17 fine-tuning methods across 5 model architectures** on **15,000 labeled regulatory statements** found domain-specific LLMs achieve a **37.6% improvement** over general models. JPMorgan's COIN system reaches **95% accuracy** in regulatory attribute extraction. An OECD survey across **143 institutions in 27 jurisdictions** reported **67% reduction** in processing time and **82% reduction** in false negatives for automated regulatory classification.

For Cedar's cold-start at 99K entities, the recommended pipeline is:

1. **Rule-based first pass** using `classification_rules`: Filter by agency (CMS, FDA, DEA, OIG, OCR, OSHA), CFR title (21, 29, 42, 45), and document type. These deterministic rules can classify ~70% of the corpus correctly.
2. **Keyword/citation scoring**: Weight entities by relevance signals — number of incoming citations (from `kg_relationships`), agency authority level, recency, and keyword density for healthcare terms.
3. **Expert-in-the-loop refinement**: Flag entities where rule-based confidence is below threshold for human review. Store decisions as training data.
4. **ML classifier deployment**: Fine-tune a domain-specific model (LegalBERT or similar) on the expert-labeled subset. Deploy as a Supabase Edge Function or external service for new entity classification.
5. **Practice-type relevance scoring**: Map each entity to NUCC practice types using a combination of CFR-part heuristics (e.g., 21 CFR 1300–1322 → controlled substances → relevant to all prescribers) and NLP-extracted relevance signals.

### Classification pipeline architecture

```sql
-- Enhance classification_rules for multi-stage pipeline
ALTER TABLE classification_rules ADD COLUMN stage INTEGER DEFAULT 1; -- 1=rule, 2=keyword, 3=ml
ALTER TABLE classification_rules ADD COLUMN confidence_threshold NUMERIC(4,3) DEFAULT 0.85;
ALTER TABLE classification_rules ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Classification audit trail
CREATE TABLE kg_classification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES kg_entities(id),
    domain_id UUID REFERENCES kg_domains(id),
    stage TEXT NOT NULL, -- 'rule', 'keyword', 'ml', 'manual'
    confidence NUMERIC(4,3),
    rule_id UUID REFERENCES classification_rules(id),
    classified_at TIMESTAMPTZ DEFAULT now(),
    classified_by TEXT -- 'system', user email, or model version
);
CREATE INDEX idx_classification_log_entity ON kg_classification_log(entity_id);
```

---

## A daily polling pipeline beats event-driven for this problem

The Federal Register publishes daily on business days. New documents appear by 6:00 AM ET. The eCFR updates within ~2 business days of publication. Neither API offers webhooks. This makes a **scheduled daily pipeline** the right architecture.

The Federal Register API requires no authentication and supports powerful filtering: `conditions[type]=RULE`, `conditions[cfr][title]=42`, `conditions[agencies][]=health-and-human-services`, `conditions[publication_date][gte]=YYYY-MM-DD`. Cedar should poll daily, extracting the `cfr_references` field from each new document to identify which existing `kg_entities` are affected. The `regulation_id_numbers` (RIN) field links documents across the entire rulemaking lifecycle — proposed rule, comment period, final rule — enabling Cedar to track regulatory actions from inception to enforcement.

**Cascade detection** uses the existing `kg_relationships` table: when entity A is amended, traverse all entities with a `cites` or `implements` relationship to A and flag them for re-evaluation. Ascent AI's approach — maintaining an explicit dependency graph of obligations — can be replicated in Cedar by querying `kg_relationships` with recursive CTEs to find all downstream entities affected by a change.

The diff-based approach strongly outperforms full reprocessing at Cedar's scale. Store a `content_hash` (SHA-256) for each entity's current text in `kg_entity_versions`. When the eCFR text for a section changes, compare hashes to detect actual content modifications versus cosmetic reformatting. Only reclassify entities whose content actually changed.

### Recommended pipeline flow

The daily pipeline should: **(1)** poll the Federal Register API for new RULE and PRORULE documents filtered by relevant agencies and CFR titles, **(2)** for each new document, extract `cfr_references` and match to existing `kg_entities` by CFR citation, **(3)** create new `kg_entities` for Federal Register documents not yet in the corpus, **(4)** create `kg_relationships` with type `amends` linking each FR document to the CFR sections in its `cfr_references`, **(5)** poll eCFR titles endpoint checking `latest_amended_on` against the last-checked date, **(6)** for changed titles, fetch updated section content and compare content hashes, **(7)** create new `kg_entity_versions` records for sections with actual changes, **(8)** run classification pipeline stages 1–3 on new and modified entities, **(9)** traverse `kg_relationships` from modified entities to find cascade candidates, and **(10)** generate user-facing alerts for entities matching practice-type subscriptions.

---

## PostgreSQL handles this scale — no Elasticsearch needed yet

At 99K entities growing toward 1M, **PostgreSQL native features on Supabase are sufficient** without external search infrastructure. A University of Washington study found PostgreSQL outperforms Neo4j for most graph query patterns, with Neo4j advantages appearing only beyond 5-hop traversals on very large datasets. Alibaba Cloud benchmarks show recursive CTEs on **10 million nodes and 5 billion edges** completing 3-depth searches in **2.1 milliseconds**. Cedar's regulatory hierarchy (title → chapter → part → section) rarely exceeds 4 levels.

The critical additions to Cedar's existing schema are **full-text search vectors**, **GIN indexes**, and **trigram fuzzy matching**. PostgreSQL's `tsvector` with weighted fields (entity name at weight A, description at B, metadata at C) handles keyword search. The `pg_trgm` extension enables fuzzy matching for users who don't know exact citation formats. GIN indexes on tsvector columns provide lookup speeds ~3x faster than GiST, and regulatory data's read-heavy profile is ideal for GIN's build-once-query-fast characteristics.

For faceted navigation (filter by jurisdiction + agency + topic + date + document type), **materialized views** pre-computing facet counts refresh efficiently with `REFRESH MATERIALIZED VIEW CONCURRENTLY` on an hourly schedule. At larger scale, the `pgfaceting` extension using roaring bitmaps provides sub-millisecond facet counts.

**pgvector** on Supabase enables semantic search alongside keyword search. Store 512-dimensional embeddings for each entity (generated by a domain-specific model) and use HNSW indexes with `m=32, ef_construction=80` for approximate nearest-neighbor queries. This enables "find regulations similar to this one" functionality without Elasticsearch.

### Search and indexing additions

```sql
-- Full-text search with weighted fields
ALTER TABLE kg_entities ADD COLUMN search_vector tsvector;
UPDATE kg_entities SET search_vector =
  setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B');
CREATE INDEX idx_kg_entities_search ON kg_entities USING GIN (search_vector);

-- Trigram fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_kg_entities_name_trgm ON kg_entities USING GIN (name gin_trgm_ops);

-- Semantic search embeddings
ALTER TABLE kg_entities ADD COLUMN embedding vector(512);
CREATE INDEX idx_kg_entities_embedding ON kg_entities
  USING hnsw (embedding vector_cosine_ops) WITH (m = 32, ef_construction = 80);

-- JSONB metadata indexing (use jsonb_path_ops for 40% smaller index)
CREATE INDEX idx_kg_entities_meta ON kg_entities USING GIN (metadata jsonb_path_ops);

-- Expression indexes for frequently filtered JSONB fields
CREATE INDEX idx_kg_entities_jurisdiction ON kg_entities ((metadata->>'jurisdiction'));
CREATE INDEX idx_kg_entities_agency ON kg_entities ((metadata->>'agency'));
CREATE INDEX idx_kg_entities_cfr_ref ON kg_entities ((metadata->>'cfr_reference'));

-- Facet count materialized view
CREATE MATERIALIZED VIEW mv_corpus_facets AS
SELECT
  metadata->>'jurisdiction' AS jurisdiction,
  metadata->>'agency' AS agency,
  t.name AS entity_type,
  d.name AS domain,
  COUNT(*) AS doc_count
FROM kg_entities e
LEFT JOIN kg_entity_types t ON e.entity_type_id = t.id
LEFT JOIN kg_entity_domains ed ON e.id = ed.entity_id AND ed.is_primary
LEFT JOIN kg_domains d ON ed.domain_id = d.id
GROUP BY 1, 2, 3, 4;

CREATE UNIQUE INDEX idx_mv_facets ON mv_corpus_facets(jurisdiction, agency, entity_type, domain);
```

Supabase's **Small or Medium tier** ($15–60/month) handles 99K entities comfortably. At 1M entities, upgrade to Large (8GB RAM, ~$110/month) to keep GIN indexes in memory. **Partitioning is premature** below 5M rows — it adds complexity without measurable benefit at Cedar's current scale.

---

## Healthcare regulations demand a sixth classification dimension: authority level

Healthcare regulatory compliance has a unique structural characteristic absent from general legal research: a **layered authority hierarchy** where federal statutes override regulations, regulations override sub-regulatory guidance, and national coverage determinations override local ones, but state-specific rules add independent requirements at every level. No single standard taxonomy exists for healthcare regulatory classification, which is why platforms like YouCompli, Compliancy Group, and Healthicity all use proprietary approaches.

The hierarchy runs: **federal statute** (Social Security Act, HIPAA) → **CFR regulation** (42 CFR, 21 CFR, 45 CFR) → **sub-regulatory guidance** (CMS Transmittals, Manual Instructions) → **coverage determinations** (NCDs nationally, LCDs per MAC jurisdiction) → **state statute** → **state board rules** → **professional standards** (Joint Commission, USP). Cedar should encode this hierarchy as an `authority_level` attribute on each `kg_entity`, enabling sorting by regulatory weight.

For Cedar's target users — independent practices doing functional medicine, hormone therapy, and compounding pharmacy — the regulatory landscape is **uniquely complex**. A single clinical workflow like testosterone pellet therapy simultaneously invokes FDA compounding rules (Section 503A vs. 503B), DEA Schedule III requirements (21 CFR 1300–1322), state PDMP checking mandates, state medical board scope-of-practice rules, Medicare LCD coverage criteria, and OSHA handling requirements. The 503A/503B distinction in pharmacy compounding is itself a regulatory fault line: 503A pharmacies are primarily state-regulated, while 503B outsourcing facilities face FDA GMP inspections.

**Bioidentical hormone therapy is an extremely active regulatory area.** The FDA is considering restricting compounding of 11 hormones including estradiol, testosterone, and progesterone. California updated compounding regulations in June 2025. These practice-area-specific regulatory changes are exactly what Cedar's monitoring pipeline must catch and route to the right practitioners.

### Healthcare-specific schema additions

```sql
-- Authority level for regulatory precedence
CREATE TYPE authority_level_enum AS ENUM (
    'federal_statute',
    'federal_regulation',
    'sub_regulatory_guidance',
    'national_coverage_determination',
    'local_coverage_determination',
    'state_statute',
    'state_board_rule',
    'professional_standard'
);

ALTER TABLE kg_entities ADD COLUMN authority_level authority_level_enum;
ALTER TABLE kg_entities ADD COLUMN jurisdiction TEXT; -- 'federal', 'CA', 'TX', etc.
ALTER TABLE kg_entities ADD COLUMN effective_date DATE;
ALTER TABLE kg_entities ADD COLUMN issuing_agency TEXT;

-- Service-line-to-regulation mapping (the clinical workflow connection)
CREATE TABLE kg_service_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,          -- 'Testosterone Pellet Therapy'
    description TEXT,
    practice_type_id UUID REFERENCES kg_practice_types(id),
    cpt_codes TEXT[],            -- associated CPT codes
    icd10_codes TEXT[]           -- associated ICD-10 codes
);

CREATE TABLE kg_service_line_regulations (
    service_line_id UUID REFERENCES kg_service_lines(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES kg_entities(id) ON DELETE CASCADE,
    regulation_role TEXT NOT NULL, -- 'prescribing', 'dispensing', 'billing', 'safety', 'scope_of_practice'
    PRIMARY KEY (service_line_id, entity_id)
);
```

---

## Phased implementation plan

**Phase 1: Search, indexes, and taxonomy foundation.** Add `search_vector` column and GIN index to `kg_entities`. Enable `pg_trgm`. Add `parent_domain_id` to `kg_domains` and populate the 4-level healthcare domain taxonomy (~10 Level 1 + ~60 Level 2 + ~300 Level 3 domains). Create the `kg_entity_domains` junction table. Run initial rule-based classification using existing `classification_rules` to populate `kg_entity_domains` for the 99K entities. Create the `mv_corpus_facets` materialized view. This phase makes the existing corpus searchable and browsable.

**Phase 2: Relationship enrichment and daily ingestion.** Add the `relationship_type_enum` and temporal columns to `kg_relationships`. Build the daily Federal Register polling pipeline using `conditions[cfr][title]` filters for titles 21, 29, 42, and 45. Parse `cfr_references` from new documents to create `amends` relationships. Add the `kg_entity_versions` table and start storing content hashes. Implement cascade detection via recursive CTE traversal of `kg_relationships`. At the end of this phase, Cedar ingests new regulations daily and links them to the existing corpus.

**Phase 3: Practice-type relevance and healthcare specialization.** Create `kg_practice_types` seeded from the NUCC taxonomy. Build `kg_entity_practice_relevance` and populate initial scores using CFR-part heuristics (e.g., all 21 CFR 1300-series entities get high relevance for prescribing practices). Add `authority_level` to `kg_entities`. Create `kg_service_lines` and `kg_service_line_regulations` for key clinical workflows (controlled substance prescribing, compounding, hormone therapy). This phase makes Cedar specifically useful for independent medical practices.

**Phase 4: ML classification and semantic search.** Add pgvector embeddings to `kg_entities`. Fine-tune a classifier on the expert-labeled subset from Phase 3. Deploy as classification pipeline stage 3. Build the semantic search "find similar regulations" feature. Implement the Expert-in-the-Loop feedback loop where low-confidence classifications are queued for human review and corrections become training data. Reclassify the full corpus with the ML model. This phase transitions Cedar from rule-based to hybrid intelligent classification.

**Phase 5: Scale and expand sources.** Add state regulatory sources (initially for 5–10 target states). Integrate CMS coverage determination data (NCDs/LCDs). Add CMS transmittals and change requests. Evaluate Supabase tier upgrades as entity count grows. Implement table partitioning when approaching 5M entities. Add read replicas for search query scaling.

---

## Conclusion

Cedar's PostgreSQL knowledge graph on Supabase is architecturally sound for this problem. The existing `kg_entities`/`kg_relationships`/`kg_domains` schema mirrors how every major regulatory platform structures its core data model — the difference between a 99K-entity startup corpus and Westlaw's millions of documents is taxonomy depth, relationship richness, and ingestion automation. The most impactful near-term investments are **(1)** the `kg_entity_domains` multi-classification junction table with relevance scores, which enables the faceted navigation and practice-type filtering that makes Cedar useful, **(2)** the daily Federal Register polling pipeline with `cfr_references` parsing, which keeps the corpus current without manual intervention, and **(3)** the NUCC-based practice-type relevance system, which is Cedar's core differentiator against general-purpose legal research platforms. The obligation-level extraction that makes Ascent AI valuable for financial services — parsing each regulation into individual enforceable requirements — is the long-term north star, but the four-level domain taxonomy with rule-based classification gets Cedar 70% of the way there immediately.
