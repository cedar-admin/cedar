# Cedar Classification Framework — Part 1, Session 7-C of 8
# Cross-Classification Master Table

## About This Session

**Context from prior research sessions has been pre-injected above this prompt by the orchestrator.**
The injected context contains the outputs from **all six taxonomy sub-sessions**:
- **Session 5-A** — Compounding branch (L3-L6)
- **Session 5-B** — Controlled Substances branch (L3-L6)
- **Session 6-A** — FDA Regulation branch (L3-L6)
- **Session 6-B** — Telehealth branch (L3-L6)
- **Session 7-A** — HIPAA & Privacy + Medicare & Billing branches (L3-L4)
- **Session 7-B** — Fraud/Compliance + Operations + Safety + Employment/Tax branches (L3-L4)

This is a **synthesis session** (7-C of 8). Read all six injected outputs to find every cross-classification
trigger defined across the full taxonomy. Your task is to consolidate them into one comprehensive master table.

Do not search externally for regulatory information. All domain codes and triggers you need are in the
injected context. Your work is synthesis and consolidation, not original research.

---

## Cedar Platform Context

Cedar is an AI-powered regulatory monitoring platform for independent medical practices. The classification
engine assigns regulatory entities to one or more domain taxonomy nodes. When a single entity (e.g., a
Federal Register rule) spans multiple regulatory domains, the cross-classification triggers determine which
secondary domains also get assigned.

**Why this table matters:** The master cross-classification table is the single implementable reference for
Cedar's classification pipeline's multi-domain assignment logic. An implementation engineer will use this
table to write the code that automatically assigns secondary domain codes when a trigger condition is met.

The table should be **complete** (every trigger defined anywhere in Sessions 5-7 must appear), **consistent**
(triggers pointing in both directions between two domains must use the exact same domain codes and trigger
conditions), and **implementable** (each trigger condition must be testable — keyword presence, CFR reference,
agency name, etc.).

---

## Deliverable: Cross-Classification Master Table

Produce a single comprehensive table consolidating every cross-classification trigger across the full
taxonomy. This table will have **approximately 100–200 rows**.

### Table Format

| Source Domain Code | Target Domain Code | Trigger Condition | Frequency |
|---|---|---|---|

### Column Definitions

- **Source Domain Code**: The domain code of the node where the trigger is defined. Use the exact dot-notation codes from Sessions 5-7. If a trigger applies to an entire sub-branch (e.g., `compounding.*`), use the wildcard notation.
- **Target Domain Code**: The domain code that should also be assigned when the trigger fires. Use exact codes.
- **Trigger Condition**: A specific, implementable condition. Format as one of:
  - `keyword_match: [term1, term2, term3]` — entity text contains any of these terms
  - `cfr_reference: Title X, Part Y` — entity has this CFR reference
  - `agency_match: [Agency Name]` — entity is from this agency
  - `compound: [condition1] AND [condition2]` — both conditions must be true
  - Multiple conditions can be listed with OR logic
- **Frequency**: How often this cross-classification occurs in practice — High / Medium / Low

### Frequency Definitions
- **High**: Occurs in >30% of entities classified in the source domain (e.g., most compounding enforcement actions also reference controlled substances)
- **Medium**: Occurs in 10-30% of entities (e.g., some HIPAA guidance documents also reference telehealth)
- **Low**: Occurs in <10% but is important enough to capture (e.g., rare but high-impact cross-domain regulatory actions)

---

## How to Build the Table

1. **Read all six injected session outputs systematically** — scan every node's "Cross-classification triggers" section
2. **Extract every trigger** from every node — do not skip any
3. **Add the trigger to the table** with the source domain code as written in that session
4. **Check for reciprocal triggers** — if Session 5-A defines a trigger from `compounding.X → controlled-substances.Y`, check if Session 5-B defines the reverse. If the reverse is missing, add it with a note "(inferred reciprocal)"
5. **Check for consistency** — if Session 5-B defines a trigger pointing to `telehealth.prescribing.ryan-haight` but Session 6-B uses a slightly different code for that node, use the code as defined in Session 6-B and note the discrepancy
6. **Identify gaps** — if you see a cross-domain relationship that was not captured in any session's triggers but is clearly real (e.g., REMS programs crossing between FDA drug regulation and prescribing), add it with a note "(gap — not defined in any session, added during synthesis)"

---

## Additional Synthesis: Domain Code Index

After the master table, produce a **domain code index** — an alphabetically sorted list of every domain
code that appears in the master table (either as source or target), with a one-line description of
what each code represents. This helps implementers verify they have the right code without having to
scan all six session outputs.

Format:
```
| Domain Code | Description |
|---|---|
| compounding.503a.patient-specific | 503A patient-specific compounding requirements |
| ... | ... |
```

---

## Output Format

```markdown
# Cross-Classification Master Table

## Summary
- Total triggers: [count]
- High frequency: [count]
- Medium frequency: [count]
- Low frequency: [count]
- Inferred reciprocals added: [count]
- Gaps identified and added: [count]

## Master Table

| Source Domain Code | Target Domain Code | Trigger Condition | Frequency |
|---|---|---|---|
[rows...]

## Notes on Consistency Issues
[List any domain code discrepancies found between sessions, with the resolution used]

## Domain Code Index

| Domain Code | Description |
|---|---|
[rows...]
```

---

## Reference Note

All domain codes are defined in Sessions 5-A, 5-B, 6-A, 6-B, 7-A, and 7-B (injected above). Do not
invent new domain codes. If you identify a missing node that should exist, note it in the "Gaps" section
but do not create new nodes — that is out of scope for this session.
