# Execute Cedar PRP

## PRP File: $ARGUMENTS

Implement a feature using the specified PRP file. Follow every instruction precisely.

## Process

1. **Load Context**
   - Read `STATUS.md` for current build state
   - Read the PRP file in full
   - Read ALL files listed in the PRP's "Files to Read First" section
   - Ensure you understand the full scope before writing any code

2. **Plan**
   - Think carefully about the implementation approach
   - Create a task list using TodoWrite matching the PRP's task ordering
   - Identify any potential conflicts with existing code
   - If anything is unclear, note it and proceed with best judgment

3. **Execute Each Task**
   - Read the target file immediately before modifying it
   - Implement the change following Cedar conventions from CLAUDE.md
   - After each file change, run: `npm run build`
   - Fix any build errors before proceeding to the next task
   - Do not skip ahead — complete each task fully before starting the next

4. **Validate**
   - Run every validation command listed in the PRP
   - Fix any failures
   - Re-run until all pass
   - Do not mark a task complete until validation passes

5. **Verify Completeness**
   - Re-read the PRP from top to bottom
   - Confirm every success criterion is met
   - Confirm every file listed was created or modified
   - Run `npm run build` one final time

6. **Close Out**
   - Update `STATUS.md` with:
     - What was built in this session
     - What the next priority should be
     - Any issues discovered during implementation
   - Move the PRP from `PRPs/active/` to `PRPs/completed/`
   - Report completion status

## Rules
- Follow CLAUDE.md conventions at all times
- Never skip validation — fix and retry
- If blocked by an external dependency, document it in STATUS.md and stop
- If a task requires changes outside the PRP scope, note it in STATUS.md as a future task — do not scope-creep
- If the PRP references a file that doesn't exist, check if it was renamed or moved before creating a new one
- Always reference the PRP again if you lose track of requirements
