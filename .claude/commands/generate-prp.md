---
description: Generate a comprehensive PRP (Product Requirements Prompt) from a feature description file. Use when planning a new feature implementation.
---

# Generate PRP for Cedar

## Feature file: $ARGUMENTS

Generate a complete PRP for the feature described in the specified file. The executing agent only gets the context in the PRP plus the codebase. Research thoroughly before writing.

## Research Process

1. **Read STATUS.md** for current build state and known issues
2. **Read the feature file** ($ARGUMENTS) to understand requirements
3. **Codebase analysis:**
   - Search for similar patterns (grep for related functions, components, routes)
   - Read files that will need modification (in full, not just grep hits)
   - Note existing conventions (imports, error handling, types, component patterns)
   - Check `supabase/migrations/` for schema context
   - Check `inngest/` for orchestration patterns
   - Check `lib/` for utility patterns
4. **Identify integration points** with existing modules (Inngest events, Supabase queries, API routes, shared components)
5. **Check examples/patterns/** for canonical implementation references

## PRP Generation

Using `PRPs/templates/prp_base.md` as template:

### Critical Context to Include
- **File paths**: Exact paths to every file that needs reading, creating, or modifying
- **Code patterns**: Real snippets from the codebase showing conventions to follow
- **Schema context**: Relevant table structures from migration files
- **Gotchas**: Cedar-specific quirks (append-only changes, RLS scoping, cost tracking, disclaimer injection)
- **Integration points**: Which Inngest events, Supabase queries, API routes are involved

### Implementation Blueprint
- Ordered task list with clear dependencies
- Pseudocode for complex logic (not full implementation — just critical details)
- Reference real files for patterns to mirror
- Include error handling strategy

### Validation Gates (Must be Executable)
```bash
# Build check (required)
npm run build

# Manual verification steps specific to the feature
# e.g., curl commands, Supabase queries, UI checks
```

## IMPORTANT: Before writing the PRP, think carefully about the implementation approach. Plan the task ordering and identify all dependencies.

## Output
Save as: `PRPs/active/{feature-name}.md`

## Quality Checklist
- [ ] All necessary context included for one-pass implementation
- [ ] References real files and patterns from the codebase
- [ ] Validation gates are executable
- [ ] Clear task ordering with dependencies noted
- [ ] Error handling strategy defined
- [ ] Cedar conventions respected (RLS, cost tracking, disclaimer, append-only)

Score confidence 1-10 for one-pass implementation success.

Remember: The goal is one-pass implementation success through comprehensive context.
