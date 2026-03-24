# Cedar Classification Framework — Part 3, Session 5 of 7

# 50-State Normalization Framework

> **Orchestrator note**: This prompt expects the following upstream session outputs pre-injected as context:
> - `P2_S1` — Pipeline architecture (jurisdiction-scoped `classification_rules` table, `CitationParser` interface, stage transition logic, jurisdiction-scoped rule loading)
> - `P2_S5` — Cost model + accuracy budget + integration reference (state source accommodation table mapping federal implementations to state extensions needed)
> - `P3_S1` — FL state board rules mapping (FAC-to-domain tables, FL agency A-scores, FL-specific keywords, FL citation parser spec — the reference implementation for state expansion)
>
> All outputs are in `research/outputs/`. Read them fully before proceeding.

---

## Your Role

You are a research agent designing Cedar's state expansion framework. Cedar currently operates in Florida. When Cedar adds a new state, the classification framework must adapt without redesigning the pipeline. Your job is to define the abstraction layer that makes this possible, and the onboarding checklist that makes it repeatable.

## Critical Context from Upstream Sessions

**P2-S1** contains the jurisdiction-scoped architecture:
- `classification_rules` table with `jurisdiction` column (federal, FL, CA, etc.)
- `CitationParser` interface — generic, with federal CFR as the first implementation
- Stage transition logic that applies jurisdiction-scoped rules

**P2-S5** contains the state source accommodation table mapping federal implementations to state extensions needed: citation parser formats, agency counts, keyword overlap, exclusion lists, config overrides, rule loading queries.

**P3-S1** contains Cedar's complete FL implementation: FAC-to-domain mappings, FL agency A-scores, FL-specific keywords, FL citation parser spec. This serves as the reference implementation — the "first state" that the normalization framework must generalize from.

## Research Objectives

### 1. Citation Format Abstraction Layer

State administrative codes use different citation formats:

| State | Format | Example |
|---|---|---|
| Florida | FAC Title.Chapter-Rule | 64B8-9.003 |
| Texas | TAC Title.Part.Chapter.Rule | 22 TAC §174.1 |
| California | CCR Title.Division.Chapter.Article.Section | 16 CCR §1399.540 |
| New York | NYCRR Title.Chapter.Subchapter.Part.Section | 10 NYCRR §405.2 |

Design the abstraction layer that extends P2-S1's `CitationParser` interface:

**A) Normalized citation object:**

Define the common output format that all state parsers produce. This object must contain enough information to:
- Route to the correct classification rules (`jurisdiction` + parsed structural components)
- Support domain mapping (the structural components map to domains)
- Display to users (human-readable citation string)

```typescript
interface NormalizedCitation {
  jurisdiction: string;         // 'FL', 'TX', 'CA', 'NY'
  raw: string;                  // original citation string
  // ... define the common fields
}
```

**B) Parser registration pattern:**

How do new state parsers register with the pipeline? Define:
- Where parser implementations live (per-state modules?)
- How the pipeline selects the correct parser for a given entity
- How citation patterns in entity text are detected and extracted (regex library?)

**C) Structural mapping portability:**

P3-S1 mapped FAC chapters → Cedar domains. When adding Texas, similar TAC → domain mappings are needed. Define:
- The configuration format for state-specific structural mappings
- How much of a state's structural mapping can be auto-generated vs. requires manual research
- The expected mapping granularity per state (chapter-level? section-level?)

### 2. State Board Name Normalization

Every state names its regulatory boards differently:

| Concept | Florida | Texas | California | New York |
|---|---|---|---|---|
| Medical licensing | Board of Medicine | Texas Medical Board | Medical Board of California | Office of Professional Medical Conduct |
| Pharmacy regulation | Board of Pharmacy | Texas State Board of Pharmacy | Board of Pharmacy | — (under Dept of Education) |

Define the normalization approach:

**A) Board name → Cedar concept mapping:**

Design a lookup table structure that maps arbitrary state board names to Cedar's standardized concepts. The concepts should align with Cedar's domain taxonomy — a "Board of Medicine" in any state maps to the same domain nodes.

**B) Board name detection:**

When ingesting a state source, how does Cedar identify which board produced it?
- Source URL patterns?
- Metadata fields?
- Board name appearing in document text?

Define the detection heuristics.

**C) New board discovery:**

Some states have regulatory bodies that don't exist in Florida (e.g., a "Board of Naturopathic Medicine" in states that license NDs). How does Cedar handle boards that don't map to any existing FL board? Flag as taxonomy gap? Auto-create a mapping to the nearest domain?

### 3. State-Specific Entity Tagging

P2-S1's schema includes a `jurisdiction` column on `classification_rules`. Entities themselves also need jurisdiction tagging.

Define:
- Where jurisdiction lives on the entity (a `jurisdiction` field on the `knowledge_graph_entities` table?)
- How jurisdiction is determined at ingestion time (from the source definition? from the citation parser output?)
- How jurisdiction interacts with search and filtering (users should be able to filter the Library by "Florida only" or "Federal + Florida")

### 4. State Onboarding Checklist

When Cedar adds a new state, define the complete checklist of configuration work:

**Per-state configuration items:**

For each item, specify:
- What it is
- Estimated effort (hours)
- Whether it can be automated or requires manual research
- Dependencies (what must be done before this item?)

Categories to cover:
- Citation parser implementation
- Admin code structural mapping (chapters → domains)
- Board/agency name normalization entries
- Agency A-scores
- State-specific keyword additions
- Cross-classification pattern identification
- Source URL registration (where to scrape)
- Authority level rule registration (state statute, state board rule, state guidance)

**Effort estimation model:**

Based on the FL implementation (P3-S1), estimate:
- Total hours to onboard a new state
- What percentage of the work transfers automatically from federal + FL configuration
- What percentage requires per-state manual research
- How does effort scale with the complexity of the state's regulatory structure?

### 5. State Accommodation Table Extension

P2-S5 produced a state accommodation table mapping federal implementations to state extensions. Extend it with the specific configuration objects and data structures defined in this session. The extended table should serve as the working specification for the "add a state" PRP.

## Deliverable Format

Produce a single structured markdown document. Include TypeScript interface definitions, configuration object schemas, and the complete onboarding checklist. The abstraction layer should be concrete enough for a developer to implement the `StateCitationParser` base class and the board normalization lookup.
