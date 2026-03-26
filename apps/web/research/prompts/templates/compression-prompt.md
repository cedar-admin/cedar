You are compressing a research session output into a structured context pack.
This context pack will be consumed by downstream research sessions that depend on
the data in this output. Accuracy is paramount — missing data structures cause
downstream errors in a healthcare regulatory classification pipeline.

## Rules — FOLLOW EXACTLY
1. PRESERVE VERBATIM: All data structures, tables, mappings, taxonomies, domain codes,
   allowlists, classification rules, SQL schemas, scoring rubrics, thresholds,
   practice-type relevance tables, and cross-classification triggers.
   Do not paraphrase or abbreviate these — copy them exactly.
2. PRESERVE VERBATIM: All resolved decisions and their final values.
3. PRESERVE VERBATIM: All cross-references to other sessions (session IDs, domain codes).
4. COMPRESS: Explanatory prose → 1-2 sentence summary per major section.
5. STRIP ENTIRELY: Methodology descriptions, verification narratives, background context,
   hedging language, research process notes.
6. OUTPUT FORMAT: YAML with this structure:

    session_id: "P1_S1"
    title: "CFR Title Classification"
    summary: "2-3 sentence summary of what this session produced"
    key_decisions:
      - decision: "35 CFR titles classified IRRELEVANT"
        value: [1, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 17, 18, 19, 22, 23, 24, 25, 27, 30, 31, 33, 34, 35, 36, 37, 39, 41, 43, 44, 46, 48, 50]
      - decision: "15 CFR titles classified MIXED"
        value: [2, 10, 16, 20, 21, 26, 28, 29, 32, 38, 40, 42, 45, 47, 49]
    data_structures:
      # Paste ALL tables, dictionaries, allowlists, mappings here in YAML format
    cross_references:
      - references_session: "P1_S2"
        context: "Part-level filtering depends on this title classification"

7. If you are uncertain whether something is a data structure or prose, KEEP IT.
   A slightly larger context pack is acceptable. A context pack missing a mapping table is not.

## Input (raw session output):
{raw_output}
