name: "[Feature Name]"

## Goal
[What gets built — specific, measurable end state]

## Why
- [Business value and user impact]
- [Which roadmap phase this serves (MVP / 1.0 Launch / 1.0 Full)]
- [Problems this solves]

## Success Criteria
- [ ] [Specific measurable outcome 1]
- [ ] [Specific measurable outcome 2]
- [ ] `npm run build` passes with 0 errors, 0 warnings

## Context

### Files to Read First
```yaml
# Read these before implementing anything
- file: [path/to/existing/file.ts]
  why: [Pattern to follow or dependency to understand]

- migration: [supabase/migrations/NNN_name.sql]
  why: [Schema context needed for this feature]

- doc: [docs/architecture.md]
  section: [Specific module or section reference]
```

### Current File Tree (relevant subset)
```bash
[output of relevant directories only — keep focused]
```

### Files to Create or Modify
```bash
# NEW files marked with (+), modified files marked with (M)
[path/to/new-file.ts]          (+) [responsibility]
[path/to/existing-file.ts]     (M) [what changes]
```

### Known Gotchas
```typescript
// Cedar-specific constraints for this feature:
// - Inngest step functions: all async, use step.run() for each unit of work
// - Supabase RLS: all practice-scoped queries need practice_id filtering
// - changes table: append-only — use review_status columns for updates
// - AI output: must include disclaimer string (see CLAUDE.md)
// - Cost tracking: every external API call logs to cost_events
// - Feature flags: tier-gated features check isFeatureEnabled()
// [Add feature-specific gotchas here]
```

## Tasks (execute in order)

### Task 1: [Name]
**File:** `[exact path]`
**Action:** CREATE | MODIFY
**Pattern:** Follow `[path/to/similar/file.ts]`

```typescript
// Pseudocode with CRITICAL implementation details only
// Do not write the full implementation — focus on:
// - Function signatures and return types
// - Integration points (which functions to call, which events to fire)
// - Error handling approach
// - Any non-obvious logic
```

### Task 2: [Name]
**File:** `[exact path]`
**Action:** CREATE | MODIFY
**Depends on:** Task 1

```typescript
// Pseudocode...
```

### Task N: [Name]
[Continue pattern...]

## Integration Points
```yaml
DATABASE:
  - [migration or query changes needed]

INNGEST:
  - [events to fire or functions to register]

API ROUTES:
  - [routes to add or modify]

UI:
  - [pages or components to update]

ENV:
  - [new environment variables needed]
```

## Validation

### Build Check
```bash
npm run build
# Must pass with 0 errors, 0 warnings
```

### Functional Verification
```bash
# Step-by-step manual test:
# 1. [Navigate to / run command]
# 2. [Expected result]
# 3. [Verify in Supabase / Inngest / browser]
```

### Database Verification (if applicable)
```sql
-- Verify data integrity after implementation
-- [relevant queries]
```

## Anti-Patterns
- ❌ Do not create new patterns when existing ones work — mirror existing code
- ❌ Do not skip validation — fix and retry
- ❌ Do not add scope beyond this PRP — note future work in STATUS.md
- ❌ Do not use `any` types — define proper interfaces
- ❌ Do not hardcode values that belong in config or env vars
- ❌ Do not modify the changes table schema — it's append-only by design
- ❌ Do not forget the disclaimer on any AI-generated content
- ❌ Do not skip cost tracking on external API calls
