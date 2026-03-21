# Cedar Classification Framework — Part 3 of 3

# Non-Federal Source Classification, Authority Levels & Ingestion Protocol

## Context for the Research Agent

Cedar is an AI-powered regulatory monitoring platform for independent medical practices in Florida (expanding to all 50 states). The platform monitors 71+ regulatory sources across federal agencies, Florida state boards, and legislative activity. Target users are practice owners running functional medicine, hormone therapy, compounding pharmacy, med spa, weight management, peptide therapy, IV therapy, regenerative medicine, telehealth, and chiropractic practices.

### What This Session Depends On — CRITICAL: READ THE ATTACHED SESSION 2 OUTPUT

This prompt is accompanied by a second attachment: the **complete output from Session 2**. That document contains:

- The five-stage classification pipeline specification (Structural → Metadata → Keywords+Embeddings → AI → Irrelevance Confirmation)
- The semantic embedding model recommendation and deployment plan
- The complete AI classifier specification (prompt templates, batching, confidence tiers, tunability)
- The cost model for initial corpus and ongoing ingestion
- The accuracy budget showing where errors concentrate

The Session 2 output itself was built on top of Session 1's output, so it already references the complete domain taxonomy, CFR-to-domain mapping table, and relevance filters. You can treat the Session 2 output as containing all prior context.

**You must read and reference the Session 2 output throughout this research.** When defining non-federal source classification strategies, reference the actual pipeline stages, confidence tiers, and domain codes from Session 2. When designing the new entity ingestion protocol, reference the actual pipeline flow. When mapping state board rules to domains, use the actual domain codes established in prior sessions.

Do not reinvent or contradict the pipeline design from Session 2. Your work extends and completes it for non-federal sources, authority levels, and ongoing operations.

### What This Session Produces

This session handles the harder, messier classification challenges:

1. **Non-Federal Source Classification Guide** — per-source-type classification strategies for state boards, legislative activity, board minutes, CMS transmittals, and professional guidelines
2. **Authority Level Assignment Rules** — deterministic mapping from source/type to authority level
3. **New Entity Classification Protocol** — how ongoing ingestion triggers classification, how taxonomy gaps are detected, and how the taxonomy evolves
4. **State Expansion Playbook** — how the framework adapts when Cedar expands from Florida to additional states

---

## Research Objective 1: Non-Federal Source Classification — Per-Source-Type Strategies

The 99K entities from federal APIs have relatively clean metadata (CFR citations, agency fields, document types). Non-federal sources are fundamentally harder — they lack standardized citation structures, use inconsistent naming conventions, and often contain ambiguous language that means different things depending on context.

**Target accuracy for non-federal sources: 80%+ with clear identification of which entities need human verification.**

Cedar monitors 71+ sources. Research and define classification strategies for each of the following source types:

### 1A. Florida State Board Rules (Florida Administrative Code)

Cedar monitors rules from:

- Board of Medicine (FAC Chapter 64B8)
- Board of Osteopathic Medicine (FAC Chapter 64B15)
- Board of Pharmacy (FAC Chapter 64B16)
- Board of Nursing (FAC Chapter 64B9)
- Board of Clinical Social Work, Marriage & Family Therapy, and Mental Health Counseling (FAC Chapter 64B4)
- Board of Chiropractic Medicine (FAC Chapter 64B2)
- Board of Acupuncture (FAC Chapter 64B1)
- Department of Health — general health regulations (FAC Title 64)
- Agency for Health Care Administration (FAC Title 59A)

For Florida state board rules, define:

- **Available structural signals**: FAC chapter/rule numbering. Map FAC chapters to Cedar domains. Example: FAC 64B8-9 covers medical practice standards → maps to domain `clinical-standards.practice-standards`. Define the complete FAC-to-domain mapping for all monitored Florida boards.
- **Content-based signals**: FAC rules have titles and body text. What keyword signals help classify within a board's rules? A Board of Pharmacy rule might cover compounding, dispensing, or controlled substances — how to distinguish?
- **Signal reliability**: FAC structural mapping should achieve ~85% accuracy at L2. What brings it to 80%+ at L3?
- **Cross-classification patterns**: State board rules frequently cross federal domains. A FL Board of Medicine rule about telehealth prescribing crosses into Telehealth, Prescribing, and potentially Controlled Substances. Define the common cross-classification patterns for Florida boards.
- **Context enrichment via federal linkage**: Many state rules reference or implement federal regulations. If a FL Board of Pharmacy rule references 21 CFR 1301 (DEA registration), it should inherit the `controlled-substances.registration` classification from the federal regulation. Define the reference detection approach (regex patterns for federal citations in state rule text).

### 1B. Florida Legislative Activity

Cedar monitors:

- Florida legislative session bills (Senate and House)
- Committee analyses and staff analyses
- Bill text and amendments

For legislative activity, define:

- **Available structural signals**: Bill numbers, committee assignments, subject matter codes. Florida Legislature assigns subject codes to bills — map these to Cedar domains.
- **The omnibus bill problem**: A single healthcare bill may span multiple regulatory domains (compounding reform + telehealth expansion + PDMP updates in one bill). Define the approach: does each section of an omnibus bill get classified separately, or does the bill entity get cross-classified into all relevant domains?
- **Committee signals**: Which Florida legislative committees produce healthcare-relevant bills? (Health & Human Services, Health Policy, Appropriations subcommittees on health) Define committee-to-domain mappings.
- **Amendment tracking**: When a bill is amended, how does the classification of the amendment relate to the classification of the original bill?
- **Pre-regulatory intelligence value**: Bills represent *future* regulation. Define how bill classification feeds into Cedar's change detection — users need to know "this bill, if passed, would affect your [Compounding] compliance."

### 1C. Board Meeting Minutes and Decisions

Cedar monitors board meeting minutes from Florida boards of medicine, pharmacy, nursing, osteopathic medicine, and others.

For board meeting minutes, define:

- **The unstructured text challenge**: Board minutes are paragraph-form text containing decisions, motions, enforcement actions, license actions, and policy discussions. Classification depends on extracting the topic of each decision. Define the NLP extraction approach:
    - How to segment minutes into individual decisions/agenda items
    - How to extract the regulatory topic from each segment
    - How to handle mixed-topic discussions
- **Decision type classification**: Board decisions fall into categories: enforcement actions, license grants/denials, rulemaking proposals, policy interpretations, waivers/exceptions. Define how decision type maps to domains. An enforcement action for prescribing violations → `controlled-substances.enforcement`. A policy interpretation about telehealth → `telehealth.state-licensure`.
- **Entity granularity**: Should the entire meeting minutes document be one entity, or should each agenda item/decision be a separate entity? Recommend with tradeoffs.
- **Confidence calibration**: Board minutes are the least structured source. What accuracy can we realistically achieve? Where should the confidence threshold be set to flag items for human review?

### 1D. CMS Transmittals and Coverage Determinations

Cedar monitors:

- CMS transmittals (changes to Medicare manuals)
- National Coverage Determinations (NCDs)
- Local Coverage Determinations (LCDs) — particularly Palmetto GBA (MAC for Florida) and First Coast Service Options
- Medicare Learning Network (MLN) articles

For CMS content, define:

- **Available structural signals**: Transmittal numbers, manual chapter references, NCD/LCD identifiers, ICD/CPT code references. Map these to Cedar domains:
    - Manual chapter references → billing subdomains (e.g., Chapter 12 of Benefit Policy Manual = physician services)
    - ICD/CPT codes → clinical domain + billing domain
    - Transmittal type (recurring update vs. new policy) → how does this affect classification?
- **Multi-domain nature of CMS content**: A single NCD covers both clinical criteria (what the service is, clinical indications) and billing rules (when Medicare pays, documentation requirements). Define the cross-classification approach — does the NCD get classified in both `clinical-standards` and `billing`?
- **LCD geographic scope**: LCDs are MAC-specific. Florida has two MACs (Palmetto GBA for Part A/HH/Hospice, First Coast Service Options for Part B). Define how geographic scope is captured alongside domain classification.
- **Practice-type relevance**: CMS content relevance varies heavily by practice type. An NCD about chiropractic manipulation services is high-relevance for chiropractors, low for med spas. Define how practice-type relevance scores are assigned for CMS content.

### 1E. Professional Association Guidelines

Cedar monitors (or will monitor) guidelines from:

- AMA (American Medical Association) — CPT updates, policy statements, ethical opinions
- AAFP (American Academy of Family Physicians) — clinical guidelines relevant to primary care/DPC
- ACOG — reproductive health guidelines
- ASPS (American Society of Plastic Surgeons) — aesthetic procedure standards
- AmSECT, specialty-specific societies
- State medical associations (FMA — Florida Medical Association)
- Compounding-specific bodies (PCCA, APC)

For professional association guidelines, define:

- **Available classification signals**: Professional associations often organize content by specialty and topic. What metadata is available? (Organization name, document type, topic tags, referenced regulations)
- **Authority level interplay**: Guidelines are "professional standards" — softer than regulations but relevant because they inform standard of care. How does this affect classification confidence vs. regulatory sources?
- **Organization-to-domain mapping**: Map each organization to the domains they primarily address. AMA → broad coverage across clinical and billing domains. PCCA → compounding domains. ASPS → aesthetic medicine domains.
- **Cross-reference enrichment**: When a professional guideline references specific regulations (e.g., AMA guidelines citing HIPAA requirements), inherit domain classification from the referenced regulations.

### 1F. State Normalization — The 50-State Problem

When Cedar expands from Florida to other states, the classification framework must adapt. Define:

- **Citation format normalization**: Each state has its own administrative code structure:
    - Florida: FAC Title.Chapter-Rule (e.g., 64B8-9.003)
    - Texas: TAC Title.Part.Chapter.Rule (e.g., 22 TAC §174.1)
    - California: CCR Title.Division.Chapter.Article.Section
    - New York: NYCRR Title.Chapter.Subchapter.Part.Section
    
    Define an abstraction layer that normalizes state citation formats into Cedar's domain taxonomy. The abstraction should: (a) parse state-specific citation formats, (b) map state board/agency names to Cedar's practice-type-agnostic domains, (c) produce the same domain assignments regardless of which state the regulation comes from.
    
- **State board name normalization**: Every state names its boards differently ("Board of Medicine" vs. "Medical Board" vs. "Board of Medical Examiners" vs. "Division of Medical Quality"). Define an approach to map arbitrary state board names to Cedar's standardized domain structure.
- **State-specific domain content**: Some states have unique regulatory frameworks (e.g., California's Medical Board has unique compounding regulations). These slot into the existing taxonomy — the domain tree stays the same, the entities underneath are state-specific. Define how state-specific entities are tagged (a `jurisdiction` field on the entity? a state-specific subtree?).
- **Effort estimation**: When Cedar adds a new state, what configuration work is required? Define the "state onboarding checklist" — what mappings need to be created, what reference data needs to be collected, and how much of the classification framework transfers automatically vs. requires per-state work.

---

## Research Objective 2: Authority Level Assignment

Cedar's `authority_level` enum defines the legal weight of a regulatory entity:

```
federal_statute
federal_regulation
sub_regulatory_guidance
national_coverage_determination
local_coverage_determination
state_statute
state_board_rule
professional_standard
```

### Deterministic Assignment Rules

Define deterministic rules for assigning authority level based on source and document type. Cover ALL source types Cedar ingests:

**Federal sources:**

- eCFR entries → Which authority level? (Most are `federal_regulation`, but some parts codify statutes)
- Federal Register final rules → `federal_regulation`
- Federal Register proposed rules → What level? (They're not yet regulations)
- Federal Register notices → What level?
- Federal Register guidance documents → `sub_regulatory_guidance`
- Federal Register presidential documents → What level?
- openFDA drug approvals → What level?
- openFDA enforcement reports → What level?
- openFDA adverse event data → What level? (Not regulatory — it's data)
- CMS transmittals → What level?
- CMS NCDs → `national_coverage_determination`
- CMS LCDs → `local_coverage_determination`
- CMS MLN articles → What level?
- OIG advisory opinions → What level?
- OIG compliance guidance → What level?

**State sources:**

- Florida Statutes → `state_statute`
- Florida Administrative Code rules → `state_board_rule`
- Florida Department of Health guidance → What level? (Guidance from a state agency)
- Florida legislative bills (not yet enacted) → What level? (Proposed legislation)
- Board meeting decisions → What level? (Administrative decisions, possibly binding)

**Professional sources:**

- AMA policy statements → `professional_standard`
- Clinical practice guidelines from specialty societies → `professional_standard`
- Accreditation standards (Joint Commission, AAAHC) → What level?

For each source type:

- Define the default authority level
- Define any exceptions (some FR notices have regulatory force, others are informational)
- Define how to distinguish between authority levels within a single source (e.g., FDA publishes both regulations and guidance through the Federal Register)

### Authority Level Hierarchy

Define the explicit hierarchy — which authority levels supersede others when there's a conflict? This affects how Cedar presents information: federal regulations override state board rules that conflict, but state board rules can be MORE restrictive than federal regulations. Define the display logic.

### Handling "Proposed" Entities

Proposed rules, pending legislation, and draft guidance are important for Cedar's users (they signal upcoming changes) but have no current legal force. Define:

- Do proposed entities get a provisional authority level?
- How does the authority level change when a proposed rule becomes final?
- How are users notified of the authority level transition?

---

## Research Objective 3: New Entity Classification Protocol

When the daily Federal Register pipeline or a scraping job ingests new entities, they need to be classified immediately. Define the complete protocol:

### Real-Time Classification Flow

When a new entity is ingested:

1. **Relevance gate**: Apply the allowlist/denylist from Session 1. If the entity falls outside the allowlist and isn't in the denylist, flag for review. If it's on the denylist, tag as irrelevant and stop.
2. **Pipeline stages**: Run the entity through Stages 1-4 (skipping Stage 5 for new entities — they passed the relevance gate). Define:
    - Should all stages run sequentially, or should the pipeline short-circuit once a high-confidence classification is achieved?
    - What's the maximum latency target? (New entities should be classified within minutes of ingestion, not hours)
    - How does the real-time single-entity pipeline differ from the batch pipeline used for the initial 99K corpus?
3. **Confidence-based routing**: Based on the classification confidence:
    - High confidence → entity appears in Library immediately
    - Medium confidence → entity appears in Library with a "classification pending review" indicator
    - Low confidence → entity enters the HITL review queue, does not appear in Library until reviewed

### Taxonomy Gap Detection

When a new entity suggests a gap in the existing taxonomy:

- **Detection signals**: What indicates a taxonomy gap? (Entity that keyword-matches a domain but doesn't fit any L3/L4 subdomain? AI classifier that assigns low confidence across all domains? Entity that the AI classifier suggests needs a new domain?)
- **Gap response protocol**: When a gap is detected:
    - Immediate: Where does the entity go in the meantime? (Classify to the nearest parent domain with a `taxonomy_gap` flag?)
    - Short-term: How does the gap get surfaced to an operator? (Admin panel alert? Dashboard metric?)
    - Resolution: Who/what adds new domains? Define the taxonomy modification workflow — adding a new L3 domain under an existing L2, including updating all existing entities that might belong in the new domain.

### Taxonomy Evolution

Over time, the regulatory landscape changes. New regulatory areas emerge (AI regulation, genetic privacy, psychedelic therapy), existing areas merge or split. Define:

- **Taxonomy versioning**: How are taxonomy changes tracked? (Timestamped migrations? Version numbers on domain nodes? A change log?)
- **Backward compatibility**: When a domain is renamed, merged, or split, how do existing entity classifications update?
- **Re-classification triggers**: When the taxonomy changes, which existing entities need re-classification? Define the re-classification scope and approach (full re-run vs. targeted).

### Alerting Rules

When should Cedar flag a classification decision for human review?

- **Confidence-based**: All low-confidence classifications
- **Anomaly-based**: Entity classified in a domain where that source/type has never appeared before (novelty detection)
- **Volume-based**: Sudden spike in entities classified in a single domain (may indicate a classification bug or a genuine regulatory burst — either way, worth checking)
- **Conflict-based**: New entity classified differently than a closely-related existing entity (e.g., two sections of the same CFR part classified in different L1 domains)

For each alerting rule, define the trigger condition, the alert format, and the recommended response.

---

## Research Objective 4: Cross-Cutting Concerns

### Classification Audit Trail

Define the complete audit trail schema for classification decisions:

- **Required fields**: entity_id, domain_id, stage (which pipeline stage made the decision), classified_by (rule ID, model name, or user ID), confidence_score, reasoning (for AI-classified entities), timestamp, is_primary, superseded_by (if later overridden)
- **Query patterns**: What queries should the audit trail support?
    - "Show me all classifications made by Stage 4 with confidence < 0.7"
    - "Show me all entities where a human overrode the AI classification"
    - "Show me classification accuracy by stage over the last 30 days"
    - "Show me all entities classified in domain X — how many by each stage?"
- **Storage efficiency**: 99K entities × multiple domain assignments × audit trail per assignment = potentially hundreds of thousands of rows. Define indexing strategy and archival approach.

### Classification Performance Metrics

Define the metrics Cedar should track to monitor classification health:

- **Coverage**: % of entities with at least one domain assignment
- **Confidence distribution**: Histogram of confidence scores across stages
- **Human review rate**: % of entities flagged for human review
- **Override rate**: % of classifications changed by humans
- **Stage distribution**: % of entities classified at each stage
- **Cross-classification rate**: Average number of domain assignments per entity
- **Taxonomy coverage**: % of L3+ domains that have at least one entity

Define how each metric is calculated, what threshold indicates a problem, and what dashboard display is appropriate.

### Bulk Re-Classification

When the taxonomy changes or classification rules are updated, Cedar needs to re-classify entities in bulk. Define:

- **Scope determination**: How to identify which entities need re-classification (all entities in an affected domain? all entities classified by a specific rule that was updated?)
- **Re-classification pipeline**: Is it the same 5-stage pipeline, or a modified version? (e.g., if re-classifying because a domain was split, only Stage 3-4 may be relevant)
- **Conflict resolution**: If re-classification produces a different result than the original classification, which wins? (The newer classification, unless the original was human-verified?)
- **Rate limiting**: How to re-classify 10K entities without hitting API rate limits or overwhelming the database

---

## Deliverable Format

Produce a single structured markdown document containing all four research objectives. The document should be implementable — a developer should be able to read the state normalization section and implement a citation parser, read the authority level rules and implement a deterministic assignment function, read the ingestion protocol and implement the real-time classification flow.

**There is no length limit.** Include complete mapping tables (FAC chapters → domains, agency names → authority levels, committee names → domains). Every rule should be specific enough to translate directly into code.

## Reference Material

- Cedar's repo: https://github.com/cedar-admin/cedar — read `CLAUDE.md`, `supabase/migrations/` (especially 022-027 for current schema), and `docs/architecture/data-architecture-research.md`
- The existing 22 classification rules are in `inngest/corpus-classify.ts`
- Cedar's monitoring sources spreadsheet: `docs/sources/FL-Cedar_Regulatory_Monitoring_Sources.xlsx` — 4 sheets covering 71+ sources with URLs, update cadences, domains covered, priority levels, and practice relevance notes. The Priority Matrix sheet ranks sources by criticality. The Board Meeting Minutes sheet details pre-regulatory intelligence sources. Read all 4 sheets.
- Florida Administrative Code: https://www.flrules.org/ — for understanding FAC structure
- Florida Legislature: https://www.myfloridahouse.gov/ and https://www.flsenate.gov/ — for understanding legislative document structure
- Texas Administrative Code: https://texreg.sos.state.tx.us/public/readtac$ext.viewtac — for understanding multi-state citation variation
- California Code of Regulations: https://www.oal.ca.gov/ — for understanding multi-state citation variation
- CMS transmittals: https://www.cms.gov/Regulations-and-Guidance/Transmittals — for understanding transmittal structure
- CMS NCD/LCD databases: https://www.cms.gov/medicare-coverage-database — for understanding coverage determination structure
- NUCC Healthcare Provider Taxonomy: https://www.nucc.org/ — for practice type code reference