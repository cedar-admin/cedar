# Splintering Prompt Template

You are splitting a research session into smaller sub-sessions because it exceeds
the context budget for a single API call.

## Input
- Session ID: {session_id}
- Session title: {session_title}
- Estimated total tokens: {estimated_tokens}
- Maximum tokens per sub-session: {max_tokens_per_session}
- Session prompt (the task to be split):

{session_prompt}

## Available context files (parent session loaded all of these)
{context_file_list}

## Rules
1. Each sub-session must produce a self-contained output with its own value.
   A sub-session that only makes sense in combination with another is poorly split.
2. Preserve dependency coherence: if Deliverable B references data from Deliverable A,
   then B's sub-session must depend on A's sub-session.
3. The LAST sub-session should be a "consolidation" session that merges outputs from
   all prior sub-sessions into the format the parent session's downstream consumers expect.
4. Each sub-session inherits only the context files it actually needs — do NOT copy all
   parent context files to every child. The "Available context files" list above shows
   what is available; select the minimal subset required for each sub-session's task.
5. Cross-classification triggers and cross-references between deliverables must be
   explicitly noted in the sub-session that produces them.

## Output Format
Respond with YAML:

    sub_sessions:
      - id_suffix: "A"       # Will become {parent_id}-A
        title: "..."
        description: "..."
        deliverables: ["List of deliverables this sub-session covers"]
        additional_dependencies: []    # Beyond the parent's dependencies
        context_inputs:                # Subset of available context files this sub-session needs
          - "research/outputs/part1/P1_S4.md"
        execution_route: "api"         # or "web" if it needs live data
        estimated_tokens: 40000
      - id_suffix: "B"
        title: "..."
        ...
