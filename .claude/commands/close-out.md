---
description: Update STATUS.md with session summary, move active PRP to completed, commit and push.
---

# Cedar Session Close-Out

End the current session cleanly: summarize what was built, update STATUS.md, archive the PRP, and deploy.

## Process

### 0. Staleness Check (do this first, before any edits)

Read `STATUS.md` and find the "Last updated" line at the top. It follows the format:
`Last updated: <date> by Sonnet Session <N>`

Extract the session number N. Compare it to the session number for *this* conversation. If the STATUS.md session number is **higher** than this session's number, STOP immediately and warn the user:

> ⚠️ STATUS.md was last updated by Session N, which is newer than this session. Proceeding would overwrite more recent information. Please confirm you want to continue, or run /close-out from the correct session.

Do not update STATUS.md, commit, or push until the user explicitly confirms.

### 1. Read Context

- Read `STATUS.md` (current state before your changes)
- Read the active PRP in `PRPs/active/` (if one exists) — use it to summarize what was built
- Run `git diff HEAD~1 --stat` and `git log --oneline -5` to understand what changed this session

### 2. Update STATUS.md

Make the following updates in a single edit:

- **Last updated** line → today's date and session identifier
- **Module Status table** → update any rows whose status changed this session
- **Codebase Stats** → update line count (`find . -name '*.ts' -not -path '*/node_modules/*' | xargs wc -l | tail -1`), migration count, commit count
- **Last Session Summary** → 3–5 sentences: what was built, what patterns were used, what was deferred
- **Next Session Priority** → numbered list of the next 1–3 concrete tasks, in priority order
- **Known Issues** → add any new issues discovered; remove any that were resolved
- **Blockers** → add any new blockers; remove any that were resolved
- **Environment** → update credential status if anything changed

Do NOT rewrite sections unrelated to this session. Keep STATUS.md truthful — if something is partial, say partial.

### 3. Archive the PRP (if one exists)

```bash
# Move active PRP to completed
mv PRPs/active/<name>.md PRPs/completed/<name>.md
```

If no PRP was active, skip this step.

### 4. Commit

Stage only the close-out files (STATUS.md and the moved PRP). Feature code was already committed and pushed during execution — do not re-stage it.

```bash
git add STATUS.md
git add PRPs/completed/<name>.md   # if a PRP was active
git status                         # confirm only close-out files are staged
git commit -m "chore: close out session — <one-line summary>"
```

### 5. Push to GitHub

Use the PAT from `.env.local`. Never leave the PAT embedded in the remote URL.

```bash
PAT=$(grep GITHUB_PAT /path/to/.env.local | cut -d= -f2)
git remote set-url origin "https://${PAT}@github.com/cedar-admin/cedar.git"
git push origin main
git remote set-url origin "https://github.com/cedar-admin/cedar.git"
```

### 6. Verify Vercel Deployment

Poll until state is READY or ERROR (wait up to 3 minutes).

```bash
sleep 10
curl -s "https://api.vercel.com/v6/deployments?projectId=prj_YykyqY89BoocNV2xV3MUWcDjpdxv&limit=1" \
  -H "Authorization: Bearer $(grep VERCEL_TOKEN /path/to/.env.local | cut -d= -f2)" \
  | python3 -c "import json,sys; d=json.load(sys.stdin)['deployments'][0]; print(d['state'], d.get('url',''))"
```

If state is BUILDING, wait 30s and poll again. If ERROR, report the deployment ID so the user can check logs.

### 7. Report to User

Summarize in a short message:
- What was committed and pushed
- Vercel deployment state
- What the next session should pick up from STATUS.md
