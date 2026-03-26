# Cedar Classification Framework — Part 3, Session 4 of 7

# Authority Level Assignment Rules

> **Orchestrator note**: This prompt expects the following upstream session outputs pre-injected as context:
> - `P1_S4` — Domain taxonomy (11 L1 domains, 55 L2 subdomains, ~320 L3-L6 nodes with classification signals and entity type references)
> - `P2_S1` — Pipeline architecture (5-stage pipeline spec, `classification_rules` table schema, jurisdiction-scoped design)
>
> All outputs are in `research/outputs/`. Read them fully before proceeding.

---

## Your Role

You are a research agent defining deterministic rules for assigning authority levels to every entity type Cedar ingests. Authority level represents the legal weight of a regulatory entity — from binding federal statute down to voluntary professional standard.

## Critical Context from Upstream Sessions

**P1-S4** contains the domain taxonomy, which you'll reference for domain-specific exceptions.

**P2-S1** contains the pipeline architecture. Authority level assignment happens alongside domain classification in the pipeline. The `classification_rules` table can store authority level assignment rules.

## Cedar's Authority Level Enum

```sql
CREATE TYPE authority_level AS ENUM (
  'federal_statute',
  'federal_regulation',
  'sub_regulatory_guidance',
  'national_coverage_determination',
  'local_coverage_determination',
  'state_statute',
  'state_board_rule',
  'professional_standard'
);
```

## Research Objectives

### 1. Complete Source Type → Authority Level Mapping

For every source type Cedar ingests, define the default authority level and any exceptions.

**Federal Sources:**

| Source Type | Document Subtype | Default Authority Level | Exceptions / Notes |
|---|---|---|---|
| eCFR entries | — | federal_regulation | Some parts codify statutory text — identify which and how to detect |
| Federal Register | Final rules | federal_regulation | — |
| Federal Register | Proposed rules | ? | No current legal force — define handling |
| Federal Register | Notices | ? | Some notices have regulatory force (e.g., DEA scheduling), others are informational |
| Federal Register | Guidance documents | sub_regulatory_guidance | — |
| Federal Register | Presidential documents | ? | Executive orders vs. proclamations — different authority? |
| openFDA | Drug approvals | ? | Approval is an agency action — what level? |
| openFDA | Enforcement reports | ? | Reports vs. enforcement actions |
| openFDA | Adverse event data | ? | Data, no regulatory force — is this even classifiable as an authority level? |
| CMS transmittals | — | ? | Manual updates implementing regulations |
| CMS NCDs | — | national_coverage_determination | — |
| CMS LCDs | — | local_coverage_determination | — |
| CMS MLN articles | — | ? | Educational, no regulatory force |
| OIG advisory opinions | — | ? | Binding on the requestor, persuasive to others |
| OIG compliance guidance | — | ? | Guidance, not regulation |

**State Sources (Florida):**

| Source Type | Document Subtype | Default Authority Level | Exceptions / Notes |
|---|---|---|---|
| Florida Statutes | — | state_statute | — |
| Florida Administrative Code | — | state_board_rule | — |
| FL DOH guidance | — | ? | State-level sub-regulatory guidance |
| FL legislative bills | Not yet enacted | ? | Proposed legislation — no current force |
| Board meeting decisions | — | ? | Some decisions are binding administrative actions |

**Professional Sources:**

| Source Type | Document Subtype | Default Authority Level | Exceptions / Notes |
|---|---|---|---|
| AMA policy statements | — | professional_standard | — |
| Clinical practice guidelines | — | professional_standard | — |
| Accreditation standards (JCAHO, AAAHC) | — | ? | Quasi-regulatory — accreditation can be required for participation in programs |

Complete ALL rows in these tables. For every "?" cell, provide a definitive answer with reasoning.

### 2. Within-Source Authority Level Disambiguation

Some sources produce content at multiple authority levels. The Federal Register publishes regulations, guidance, and notices through the same channel. Define the disambiguation logic:

- What metadata field(s) distinguish authority levels within a single source?
- Can disambiguation be fully deterministic (rule-based), or does some content require AI classification of authority level?
- For FR documents: map FR document type codes to authority levels.
- For state sources: what distinguishes a binding board decision from a non-binding policy discussion?

### 3. Authority Level Hierarchy and Conflict Resolution

Define the explicit hierarchy:

```
federal_statute > federal_regulation > sub_regulatory_guidance
national_coverage_determination (parallel track — CMS-specific)
local_coverage_determination (parallel track — MAC-specific)
state_statute > state_board_rule
professional_standard (informational, no supersession)
```

**Conflict resolution rules:**

When a higher-authority source and a lower-authority source address the same topic:
- Federal regulation preempts conflicting state board rules (but state rules can be MORE restrictive)
- How does Cedar surface this relationship? Define the display logic:
  - Should Cedar show a "preemption" indicator?
  - Should Cedar show "this state rule is more restrictive than federal requirements"?
  - How is the "more restrictive" determination made? (Manual tagging? AI? Heuristic?)

### 4. Proposed Entity Protocol

Proposed rules, pending legislation, and draft guidance have no current legal force but signal upcoming changes. Define:

**A) Provisional authority levels:**

Add these to the enum or use a modifier field?
- `proposed_federal_regulation` (or `federal_regulation` + `status = 'proposed'`?)
- `pending_state_statute` (or `state_statute` + `status = 'pending'`?)

Recommend one approach: expand the enum vs. use a status modifier. Consider database simplicity, query ergonomics, and UI implications.

**B) Authority level transitions:**

When a proposed rule becomes final:
- Does the entity's authority level change in place, or does a new entity get created?
- How is the transition tracked in the audit trail?
- How are users notified? (Change detection alert: "This proposed rule is now final")

**C) Effective date handling:**

Some rules have future effective dates (final rule published today, effective in 90 days). How does Cedar handle the interim period? The rule is authoritative but not yet enforceable.

### 5. SQL Seed Data

Produce INSERT statements for:
- The authority_level enum (if not already in migrations — check P2-S1)
- A deterministic `authority_level_rules` table (or entries in `classification_rules`) that maps source_type + document_type → authority_level
- The hierarchy ordering (a numeric `hierarchy_rank` or similar for sorting/comparison)

## Deliverable Format

Produce a single structured markdown document. The mapping table in Section 1 must have zero "?" cells — every source type gets a definitive authority level. Include SQL seed data that a developer can run directly. Define edge cases explicitly (what happens with source types that don't cleanly map).
