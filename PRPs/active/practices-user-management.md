name: "Practices User Management — Filterable Table + Slide-Over Admin Panel"

## Goal

Upgrade `app/(admin)/practices/page.tsx` into a full admin user management interface: a filterable table of all non-deleted practices (matching the LibraryBrowser filter bar pattern) where clicking any row opens a fixed slide-over panel with the full practice profile, account stats, and admin actions (tier toggle + soft delete with WorkOS user deletion).

## Why

- Admins have no way to manage practices today — the page is read-only
- Tier changes require direct DB edits; soft delete is impossible from the UI
- WorkOS user cleanup on account deletion requires manual API calls
- MVP admin tooling completion for the Dashboard module (Module 9)

## Success Criteria

- [ ] Filter bar renders with Tier / Status / Practice Type selects; Clear filters button appears when active; count label updates
- [ ] Table excludes soft-deleted rows (deleted_at IS NOT NULL) by default
- [ ] Clicking a row opens the slide-over panel from the right; scrim dims background; X button and scrim click close it; page content does not reflow
- [ ] Slide-over shows all practices table columns (full profile)
- [ ] Slide-over shows acknowledgment count and account age in days
- [ ] Tier toggle: confirmation step → writes to `practices.tier` via PATCH API route → panel reflects new tier
- [ ] Soft delete: confirmation step → writes `deleted_at` → calls WorkOS user delete via DELETE API route → panel closes → row disappears from table
- [ ] Both API routes return 401 if caller is not admin, 422 on invalid input, 500 on unexpected errors
- [ ] `npm run build` passes with 0 errors, 0 warnings
- [ ] No `any` types. No files over 500 lines.

## Context

### Files to Read First

```yaml
- file: app/(admin)/practices/page.tsx
  why: Existing page to be replaced — understand current server component structure

- file: components/LibraryBrowser.tsx
  why: Filter bar and results list pattern to replicate exactly (Select components, clear button, count label)

- file: app/(admin)/reviews/page.tsx
  why: Admin page pattern — server component structure, filter tab pattern, empty state

- file: app/api/changes/[id]/approve/route.ts
  why: API route pattern — withAuth, createServerClient, error shapes, response format

- file: lib/layout-data.ts
  why: resolveRole(), ADMIN_EMAILS, withAuth pattern — will add requireAdmin() helper here

- file: lib/env.ts
  why: getEnv() pattern — used in API routes for WORKOS_API_KEY

- file: lib/db/client.ts
  why: createServerClient() — service role, bypasses RLS

- file: lib/format.ts
  why: formatDate(), timeAgo() — never define locally

- file: lib/ui-constants.ts
  why: Badge styling conventions

- migration: supabase/migrations/001_initial_schema.sql
  why: practices table base schema, practice_acknowledgments join structure

- migration: supabase/migrations/014_billing_columns.sql
  why: subscription_status CHECK constraint values, current_period_end

- migration: supabase/migrations/015_practice_profile.sql
  why: owner_name, practice_type enum values, phone

- migration: supabase/migrations/017_notification_prefs.sql
  why: notification_preferences JSONB column (display in profile)

- file: app/api/admin/trigger/route.ts
  why: Example of ADMIN_SECRET-gated API route pattern (alternative auth model — we'll use withAuth + email check instead)
```

### Current practices Table Schema (full, after all 17 migrations)

```sql
CREATE TABLE practices (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_email              TEXT NOT NULL UNIQUE,
  name                     TEXT NOT NULL,
  tier                     TEXT NOT NULL DEFAULT 'monitor' CHECK (tier IN ('monitor', 'intelligence')),
  stripe_customer_id       TEXT,
  stripe_subscription_id   TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- migration 014:
  subscription_status      TEXT DEFAULT 'inactive'
    CHECK (subscription_status IN ('active','trialing','past_due','canceled','unpaid','incomplete','inactive')),
  current_period_end       TIMESTAMPTZ,
  -- migration 015:
  owner_name               TEXT,
  practice_type            TEXT CHECK (practice_type IN (
    'medical_practice','pharmacy','dental','mental_health',
    'physical_therapy','chiropractic','optometry','other'
  )),
  phone                    TEXT,
  -- migration 017:
  notification_preferences JSONB NOT NULL DEFAULT '{"email_alerts":true,"email_threshold":"high","weekly_digest":false}'
  -- migration 018 (new): deleted_at TIMESTAMPTZ NULL DEFAULT NULL
);
```

> **Note:** `npi` column does NOT exist in any migration. The feature spec mentions NPI — omit it from the profile display entirely.

### Current File Tree (relevant)

```bash
app/(admin)/
  practices/page.tsx          ← server component to replace
  reviews/page.tsx            ← admin pattern reference
  layout.tsx                  ← admin layout (role guard, sidebar)

components/
  LibraryBrowser.tsx          ← filter bar + list pattern to replicate
  SeverityBadge.tsx
  StatusBadge.tsx
  EmptyState.tsx
  ui/
    sheet.tsx                 ← Radix slide-over (Sheet, SheetContent side="right")
    badge.tsx, button.tsx, card.tsx, select.tsx, table.tsx, ...

lib/
  layout-data.ts              ← getLayoutData(), resolveRole(), ADMIN_EMAILS — add requireAdmin()
  db/client.ts
  format.ts
  env.ts
  ui-constants.ts

app/api/
  admin/
    trigger/route.ts          ← existing admin API route
    practices/[id]/           ← NEW: tier/route.ts, route.ts (delete)
  changes/[id]/approve/route.ts  ← API route pattern to follow
```

### Files to Create or Modify

```bash
supabase/migrations/018_practices_soft_delete.sql   (+) add deleted_at column
lib/layout-data.ts                                  (M) export requireAdmin() helper
app/(admin)/practices/page.tsx                      (M) server component → fetch data → pass to PracticesTable
components/admin/PracticesTable.tsx                 (+) client component: filter bar + table + row click → slide-over
components/admin/PracticeSlideOver.tsx              (+) client component: fixed overlay slide-over panel + actions
app/api/admin/practices/[id]/tier/route.ts          (+) PATCH tier update, admin-only
app/api/admin/practices/[id]/route.ts               (+) DELETE soft delete + WorkOS user delete, admin-only
```

### Known Gotchas

```typescript
// 1. ADMIN_EMAILS is not currently exported from lib/layout-data.ts — must add export
//    or add a requireAdmin() helper that throws/returns null when not admin.

// 2. deleted_at does NOT exist in any migration yet.
//    Migration 018 must add it before any code references the column.

// 3. WorkOS SDK: use @workos-inc/node (already installed), NOT authkit-nextjs.
//    authkit-nextjs only has withAuth/signOut. The management API (listUsers, deleteUser)
//    lives on WorkOS class from @workos-inc/node.
//    workos.userManagement.listUsers({ email }) — returns AutoPaginatable<User>
//    workos.userManagement.deleteUser(userId: string)
//    WorkOS user ID is NOT stored in practices table — must look up by email.

// 4. The slide-over must NOT use Sheet from shadcn (which uses Radix Dialog/portal).
//    Sheet IS available (components/ui/sheet.tsx) and works correctly for this use case.
//    Use SheetContent side="right" — it renders as fixed overlay with scrim.
//    Alternatively, implement with plain Tailwind fixed positioning — see Task 4 for decision.

// 5. Filter bar: "Practice Type" filter uses unique values from the data (not hardcoded).
//    Derive the list client-side from the practices array passed as props.
//    Use the same Select pattern as LibraryBrowser.tsx.

// 6. Soft delete flow:
//    a. PATCH practices.deleted_at = now() in Supabase (service role)
//    b. Look up WorkOS user by email → delete if found (log warning if not found, don't fail)
//    c. Return { success: true } — frontend removes the row from local state

// 7. Tier toggle: NO Stripe calls. Add a TODO comment:
//    // TODO: sync tier change to Stripe subscription (post-MVP)

// 8. Stats: no delivery log table exists in schema. Use practice_acknowledgments count
//    as proxy for "changes acknowledged". Do NOT fabricate a "changes delivered" count.
//    Fetch acknowledgment counts server-side and pass as a map to avoid client-side fetching.

// 9. Server/client split: page.tsx is server component (data fetch).
//    PracticesTable and PracticeSlideOver are 'use client' components.
//    Do NOT use server actions for the tier/delete operations — use API routes (fetch calls
//    from the client component) to match the existing approve/reject API route pattern.

// 10. The admin layout already gates to role === 'admin' and redirects non-admins.
//     API routes must do their own auth check — layout guards don't protect API routes.

// 11. practices.tier CHECK constraint: only 'monitor' and 'intelligence' are valid.
//     API route must validate the incoming tier value before writing.

// 12. subscription_status values include 'paused' in the feature spec filter bar,
//     but 'paused' is NOT in the DB CHECK constraint. Omit 'paused' from filter options.
//     Use: active | trialing | past_due | canceled | inactive | all
```

## Tasks (execute in order)

---

### Task 1: Migration — Add deleted_at to practices

**File:** `supabase/migrations/018_practices_soft_delete.sql`
**Action:** CREATE

```sql
-- Cedar: Add soft delete support to practices table
-- deleted_at IS NULL = active; deleted_at IS NOT NULL = soft-deleted
ALTER TABLE practices
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL DEFAULT NULL;

COMMENT ON COLUMN practices.deleted_at IS
  'Soft delete timestamp. NULL = active. Set to now() on admin delete. Row is preserved for audit.';
```

After creating: apply to local Supabase if running, then push to production:
```bash
npx supabase gen types typescript --project-id serumeiwrvtwisibuawe > lib/db/types.ts
```

---

### Task 2: Add requireAdmin() helper to lib/layout-data.ts

**File:** `lib/layout-data.ts`
**Action:** MODIFY

Export `ADMIN_EMAILS` and add `requireAdmin()`:

```typescript
// Add export to existing ADMIN_EMAILS const:
export const ADMIN_EMAILS = ['cedaradmin@gmail.com']

// Add this function at the bottom of the file:
/**
 * Use in API routes to verify the caller is an admin.
 * Returns the WorkOS user object if admin, or null if not authenticated/not admin.
 * API routes should return 401 when this returns null.
 */
export async function requireAdmin(): Promise<{ id: string; email: string } | null> {
  try {
    const { user } = await withAuth({ ensureSignedIn: true })
    if (!user) return null
    const role = resolveRole(user.email, null)
    if (role !== 'admin') return null
    return { id: user.id, email: user.email }
  } catch {
    return null
  }
}
```

---

### Task 3: PATCH API route — Update practice tier

**File:** `app/api/admin/practices/[id]/tier/route.ts`
**Action:** CREATE
**Pattern:** Follow `app/api/changes/[id]/approve/route.ts`

```typescript
// PATCH /api/admin/practices/[id]/tier
// Updates practices.tier. Admin-only. No Stripe sync (TODO).
// Body: { tier: 'monitor' | 'intelligence' }

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../../../../lib/layout-data'
import { createServerClient } from '../../../../../lib/db/client'

const VALID_TIERS = ['monitor', 'intelligence'] as const
type Tier = (typeof VALID_TIERS)[number]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => ({})) as { tier?: string }

  if (!body.tier || !VALID_TIERS.includes(body.tier as Tier)) {
    return NextResponse.json(
      { error: `Invalid tier. Must be one of: ${VALID_TIERS.join(', ')}` },
      { status: 422 }
    )
  }

  const supabase = createServerClient()

  const { data: practice, error: fetchErr } = await supabase
    .from('practices')
    .select('id, tier')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (fetchErr || !practice) {
    return NextResponse.json({ error: 'Practice not found' }, { status: 404 })
  }

  // TODO: sync tier change to Stripe subscription (post-MVP)
  const { error: updateErr } = await supabase
    .from('practices')
    .update({ tier: body.tier })
    .eq('id', id)

  if (updateErr) {
    console.error('[tier-update] Failed:', updateErr.message)
    return NextResponse.json({ error: 'Failed to update tier' }, { status: 500 })
  }

  return NextResponse.json({ success: true, id, tier: body.tier })
}
```

---

### Task 4: DELETE API route — Soft delete practice + WorkOS user

**File:** `app/api/admin/practices/[id]/route.ts`
**Action:** CREATE
**Pattern:** Follow `app/api/changes/[id]/approve/route.ts`

```typescript
// DELETE /api/admin/practices/[id]
// Soft-deletes the practice (sets deleted_at = now()) and deletes the WorkOS user.
// Admin-only.

import { NextRequest, NextResponse } from 'next/server'
import { WorkOS } from '@workos-inc/node'
import { requireAdmin } from '../../../../lib/layout-data'
import { createServerClient } from '../../../../lib/db/client'
import { getEnv } from '../../../../lib/env'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createServerClient()
  const env = getEnv()

  // Fetch practice to get owner_email for WorkOS lookup
  const { data: practice, error: fetchErr } = await supabase
    .from('practices')
    .select('id, owner_email, name')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (fetchErr || !practice) {
    return NextResponse.json({ error: 'Practice not found' }, { status: 404 })
  }

  // Soft delete in Supabase
  const { error: deleteErr } = await supabase
    .from('practices')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (deleteErr) {
    console.error('[delete-practice] Supabase update failed:', deleteErr.message)
    return NextResponse.json({ error: 'Failed to delete practice' }, { status: 500 })
  }

  // WorkOS user deletion — graceful: log warning if not found, don't fail the request
  try {
    const workos = new WorkOS(env.WORKOS_API_KEY)
    const usersResult = await workos.userManagement.listUsers({ email: practice.owner_email })
    const workosUser = usersResult.data[0]

    if (workosUser) {
      await workos.userManagement.deleteUser(workosUser.id)
      console.info(`[delete-practice] Deleted WorkOS user ${workosUser.id} for ${practice.owner_email}`)
    } else {
      console.warn(`[delete-practice] WorkOS user not found for email: ${practice.owner_email} — skipping WorkOS delete`)
    }
  } catch (workosErr) {
    // Log but don't fail — Supabase soft delete already succeeded
    console.error('[delete-practice] WorkOS deletion error:', workosErr)
  }

  return NextResponse.json({ success: true, id })
}
```

---

### Task 5: PracticeSlideOver client component

**File:** `components/admin/PracticeSlideOver.tsx`
**Action:** CREATE
**Depends on:** Tasks 3, 4

This component is a purely client-side fixed overlay. Do NOT use `Sheet` from shadcn — implement directly with Tailwind `fixed` positioning to avoid portal/z-index conflicts and to match the spec exactly.

```typescript
'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import type { Database } from '@/lib/db/types'

type PracticeRow = Database['public']['Tables']['practices']['Row']

interface PracticeSlideOverProps {
  practice: PracticeRow
  acknowledgedCount: number
  onClose: () => void
  onTierChanged: (id: string, newTier: string) => void
  onDeleted: (id: string) => void
}

// Internal confirmation step state type
type ConfirmStep = 'tier' | 'delete' | null

export function PracticeSlideOver({
  practice,
  acknowledgedCount,
  onClose,
  onTierChanged,
  onDeleted,
}: PracticeSlideOverProps) {
  const [confirmStep, setConfirmStep] = useState<ConfirmStep>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate account age in days
  const accountAgeDays = Math.floor(
    (Date.now() - new Date(practice.created_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  const targetTier = practice.tier === 'monitor' ? 'intelligence' : 'monitor'

  async function handleTierChange() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/practices/${practice.id}/tier`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: targetTier }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? 'Tier update failed')
      }
      onTierChanged(practice.id, targetTier)
      setConfirmStep(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/practices/${practice.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? 'Delete failed')
      }
      onDeleted(practice.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-[480px] max-w-full bg-background border-l border-border shadow-xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-foreground truncate pr-4">
            {practice.name}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Close panel"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6">
          {/* Profile section */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Practice Profile
            </h3>
            <dl className="space-y-2">
              {/* Render each field as label: value rows */}
              {/* Use ProfileRow helper defined below in the same file */}
              {[
                { label: 'Practice Name', value: practice.name },
                { label: 'Owner Name', value: practice.owner_name ?? '—' },
                { label: 'Owner Email', value: practice.owner_email },
                { label: 'Practice Type', value: practice.practice_type ?? '—' },
                { label: 'Phone', value: practice.phone ?? '—' },
                { label: 'State', value: 'FL' },       // jurisdiction is always FL for now
                { label: 'Stripe Customer ID', value: practice.stripe_customer_id ?? '—' },
                { label: 'Stripe Subscription ID', value: practice.stripe_subscription_id ?? '—' },
                { label: 'Current Period End', value: practice.current_period_end ? formatDate(practice.current_period_end) : '—' },
                { label: 'Created', value: formatDate(practice.created_at) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-2">
                  <dt className="text-xs text-muted-foreground w-40 shrink-0 pt-px">{label}</dt>
                  <dd className="text-sm text-foreground">{value}</dd>
                </div>
              ))}
              {/* Tier — as badge */}
              <div className="flex items-center gap-2">
                <dt className="text-xs text-muted-foreground w-40 shrink-0">Tier</dt>
                <dd><TierBadge tier={practice.tier} /></dd>
              </div>
              {/* Subscription status — as badge */}
              <div className="flex items-center gap-2">
                <dt className="text-xs text-muted-foreground w-40 shrink-0">Subscription Status</dt>
                <dd><SubscriptionBadge status={practice.subscription_status} /></dd>
              </div>
            </dl>
          </section>

          {/* Stats section */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Account Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Changes Acknowledged</p>
                <p className="text-xl font-semibold text-foreground">{acknowledgedCount}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Account Age</p>
                <p className="text-xl font-semibold text-foreground">{accountAgeDays}d</p>
              </div>
            </div>
          </section>

          {/* Admin actions section */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Admin Actions
            </h3>

            {error && (
              <p className="text-xs text-destructive mb-3">{error}</p>
            )}

            {/* Tier toggle */}
            <div className="rounded-lg border border-border p-4 space-y-3 mb-3">
              <div>
                <p className="text-sm font-medium text-foreground">Tier</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Currently on <strong>{practice.tier}</strong> plan.
                  Switch to <strong>{targetTier}</strong>?
                </p>
              </div>
              {confirmStep === 'tier' ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleTierChange}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating…' : `Confirm → ${targetTier}`}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmStep(null)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmStep('tier')}
                >
                  Switch to {targetTier}
                </Button>
              )}
            </div>

            {/* Soft delete */}
            <div className="rounded-lg border border-destructive/30 p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-destructive">Delete Practice</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Soft-deletes this practice and removes the WorkOS user account.
                  This cannot be undone from the UI.
                </p>
              </div>
              {confirmStep === 'delete' ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Deleting…' : 'Confirm Delete'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmStep(null)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => setConfirmStep('delete')}
                >
                  <i className="ri-delete-bin-line mr-1.5" />
                  Delete Practice
                </Button>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

// ── Local badge helpers (same as page.tsx — kept co-located for panel use) ───

function TierBadge({ tier }: { tier: string }) {
  const isIntelligence = tier.toLowerCase() === 'intelligence'
  const label = tier.charAt(0).toUpperCase() + tier.slice(1)
  return (
    <Badge
      variant="outline"
      className={
        isIntelligence
          ? 'text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800'
          : 'text-xs'
      }
    >
      {label}
    </Badge>
  )
}

function SubscriptionBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-muted-foreground">—</span>
  const styles: Record<string, string> = {
    active:   'text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
    trialing: 'text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
    past_due: 'text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    unpaid:   'text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    canceled: 'text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
  }
  const cls = styles[status] ?? 'text-xs text-muted-foreground'
  const label = status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return <Badge variant="outline" className={cls}>{label}</Badge>
}
```

---

### Task 6: PracticesTable client component

**File:** `components/admin/PracticesTable.tsx`
**Action:** CREATE
**Depends on:** Task 5 (imports PracticeSlideOver)

This component handles all client-side state: filter bar, filtered rows, selected practice for slide-over.

```typescript
'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/format'
import { PracticeSlideOver } from '@/components/admin/PracticeSlideOver'
import type { Database } from '@/lib/db/types'

type PracticeRow = Database['public']['Tables']['practices']['Row']

interface PracticesTableProps {
  practices: PracticeRow[]
  ackCounts: Record<string, number>
}

interface Filters {
  tier: string
  status: string
  practiceType: string
}

const EMPTY_FILTERS: Filters = { tier: '', status: '', practiceType: '' }

function hasActiveFilters(f: Filters) {
  return Object.values(f).some(Boolean)
}

export function PracticesTable({ practices, ackCounts }: PracticesTableProps) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [selectedPractice, setSelectedPractice] = useState<PracticeRow | null>(null)
  // Local copy of practices for optimistic UI updates (tier change, deletion)
  const [localPractices, setLocalPractices] = useState<PracticeRow[]>(practices)

  // Derive unique practice types from data (for filter dropdown)
  const practiceTypes = useMemo(() => {
    const types = new Set<string>()
    for (const p of localPractices) {
      if (p.practice_type) types.add(p.practice_type)
    }
    return Array.from(types).sort()
  }, [localPractices])

  // Apply filters
  const filtered = useMemo(() => {
    return localPractices.filter((p) => {
      if (filters.tier && p.tier !== filters.tier) return false
      if (filters.status && p.subscription_status !== filters.status) return false
      if (filters.practiceType && p.practice_type !== filters.practiceType) return false
      return true
    })
  }, [localPractices, filters])

  function set(key: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value === 'all' ? '' : value }))
  }

  function clear() {
    setFilters(EMPTY_FILTERS)
  }

  // Called from slide-over after successful tier change
  function handleTierChanged(id: string, newTier: string) {
    setLocalPractices((prev) =>
      prev.map((p) => p.id === id ? { ...p, tier: newTier } : p)
    )
    setSelectedPractice((prev) => prev?.id === id ? { ...prev, tier: newTier } : prev)
  }

  // Called from slide-over after successful delete
  function handleDeleted(id: string) {
    setLocalPractices((prev) => prev.filter((p) => p.id !== id))
    setSelectedPractice(null)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filter bar — same pattern as LibraryBrowser */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filters.tier || 'all'} onValueChange={(v) => set('tier', v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tiers</SelectItem>
              <SelectItem value="monitor">Monitor</SelectItem>
              <SelectItem value="intelligence">Intelligence</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status || 'all'} onValueChange={(v) => set('status', v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trialing">Trialing</SelectItem>
              <SelectItem value="past_due">Past Due</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.practiceType || 'all'} onValueChange={(v) => set('practiceType', v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Practice Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {practiceTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters(filters) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-muted-foreground hover:text-foreground"
            >
              <i className="ri-close-line mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        {/* Count label */}
        <p className="text-xs text-muted-foreground -mt-2">
          {filtered.length} practice{filtered.length !== 1 ? 's' : ''}
          {hasActiveFilters(filters) ? ` (filtered from ${localPractices.length})` : ''}
        </p>

        {/* Empty state */}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <i className="ri-filter-off-line text-3xl text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No practices match the current filters.</p>
              {hasActiveFilters(filters) && (
                <Button variant="ghost" size="sm" onClick={clear} className="mt-3 text-muted-foreground">
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Table */}
        {filtered.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                All Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Practice</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow
                      key={p.id}
                      onClick={() => setSelectedPractice(p)}
                      className="cursor-pointer hover:bg-muted/30"
                    >
                      <TableCell>
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground">{p.owner_name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{p.owner_email}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.practice_type ?? '—'}
                      </TableCell>
                      <TableCell>
                        <TierBadge tier={p.tier} />
                      </TableCell>
                      <TableCell>
                        <SubscriptionBadge status={p.subscription_status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.phone ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(p.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Slide-over — rendered outside table div so it's not clipped */}
      {selectedPractice && (
        <PracticeSlideOver
          practice={selectedPractice}
          acknowledgedCount={ackCounts[selectedPractice.id] ?? 0}
          onClose={() => setSelectedPractice(null)}
          onTierChanged={handleTierChanged}
          onDeleted={handleDeleted}
        />
      )}
    </>
  )
}

// ── Badge helpers (co-located with table for correct display) ────────────────
// Copy from existing page.tsx — these are table-level display concerns

function TierBadge({ tier }: { tier: string }) {
  const isIntelligence = tier.toLowerCase() === 'intelligence'
  const label = tier.charAt(0).toUpperCase() + tier.slice(1)
  return (
    <Badge
      variant="outline"
      className={
        isIntelligence
          ? 'text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800'
          : 'text-xs'
      }
    >
      {label}
    </Badge>
  )
}

function SubscriptionBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-muted-foreground">—</span>
  const styles: Record<string, string> = {
    active:   'text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
    trialing: 'text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
    past_due: 'text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    unpaid:   'text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    canceled: 'text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
  }
  const cls = styles[status] ?? 'text-xs text-muted-foreground'
  const label = status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return <Badge variant="outline" className={cls}>{label}</Badge>
}
```

---

### Task 7: Replace app/(admin)/practices/page.tsx

**File:** `app/(admin)/practices/page.tsx`
**Action:** MODIFY (full replacement)
**Depends on:** Tasks 1, 5, 6

The new server component fetches practices (excluding deleted), fetches acknowledgment counts, merges into a count map, and passes both to the client PracticesTable.

```typescript
import { createServerClient } from '../../../lib/db/client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { PracticesTable } from '@/components/admin/PracticesTable'
import type { Database } from '@/lib/db/types'

export const dynamic = 'force-dynamic'

type PracticeRow = Database['public']['Tables']['practices']['Row']

export default async function PracticesPage() {
  const supabase = createServerClient()

  // Fetch active (non-deleted) practices
  const { data: rows, error } = await supabase
    .from('practices')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const practices = (rows ?? []) as PracticeRow[]

  // Fetch acknowledgment counts for all practices
  const { data: ackRows } = await supabase
    .from('practice_acknowledgments')
    .select('practice_id')

  // Build practice_id → count map
  const ackCounts: Record<string, number> = {}
  for (const row of ackRows ?? []) {
    ackCounts[row.practice_id] = (ackCounts[row.practice_id] ?? 0) + 1
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Practices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All registered practices — {practices.length} active
        </p>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <i className="ri-error-warning-line text-base" />
          <AlertDescription>Failed to load practices: {error.message}</AlertDescription>
        </Alert>
      )}

      {/* Empty state (no practices at all) */}
      {practices.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <i className="ri-building-line text-3xl text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No practices registered yet.</p>
          </CardContent>
        </Card>
      )}

      {/* Table + filter bar (client component) */}
      {practices.length > 0 && (
        <PracticesTable practices={practices} ackCounts={ackCounts} />
      )}
    </div>
  )
}
```

---

### Task 8: Apply migration to Supabase and regenerate types

Run in order:

```bash
# Apply migration 018 to production Supabase
npx supabase db push --project-ref serumeiwrvtwisibuawe

# Regenerate TypeScript types
npx supabase gen types typescript --project-id serumeiwrvtwisibuawe > lib/db/types.ts
```

Verify `deleted_at` appears in the generated `practices` table type before proceeding to build.

---

### Task 9: Build check and deploy

```bash
npm run build
# Must pass with 0 errors, 0 warnings

# If build passes, deploy:
git add -A
git commit -m "feat: practices admin — filterable table, slide-over panel, tier + delete actions"
PAT="$GITHUB_PAT"
git remote set-url origin "https://${PAT}@github.com/cedar-admin/cedar.git"
git push origin main
git remote set-url origin "https://github.com/cedar-admin/cedar.git"

# Verify deploy
sleep 10 && curl -s "https://api.vercel.com/v6/deployments?projectId=prj_YykyqY89BoocNV2xV3MUWcDjpdxv&limit=1" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  | jq '.deployments[0] | {id: .uid, state, url}'
```

## Integration Points

```yaml
DATABASE:
  - migration 018: ADD COLUMN deleted_at TIMESTAMPTZ NULL to practices
  - practices query: add .is('deleted_at', null) filter in page.tsx
  - practice_acknowledgments: SELECT practice_id for count aggregation
  - practices PATCH (tier): UPDATE practices.tier WHERE id = ? (service role, bypasses RLS)
  - practices UPDATE (delete): UPDATE practices.deleted_at = now() WHERE id = ?

INNGEST:
  - None — no Inngest events triggered by these actions

API ROUTES:
  - PATCH /api/admin/practices/[id]/tier — new, admin-only
  - DELETE /api/admin/practices/[id] — new, admin-only

EXTERNAL APIs:
  - WorkOS @workos-inc/node:
    workos.userManagement.listUsers({ email }) → find user ID
    workos.userManagement.deleteUser(userId) → hard-delete WorkOS user

UI:
  - app/(admin)/practices/page.tsx: replaced with server/client split
  - components/admin/PracticesTable.tsx: new client component
  - components/admin/PracticeSlideOver.tsx: new client component
  - lib/layout-data.ts: ADMIN_EMAILS exported, requireAdmin() added

ENV:
  - WORKOS_API_KEY: already in getEnv() schema — no new env vars needed
```

## Validation

### Build Check

```bash
npm run build
# Must pass with 0 errors, 0 warnings
```

### Functional Verification

```
1. Navigate to /practices (admin user)
   → Table renders with non-deleted practices
   → Header shows correct count

2. Use Tier filter → select "monitor"
   → Only monitor-tier rows show; count label updates

3. Use Status filter → select "active"
   → Only active-status rows show; count updates

4. Activate 2 filters → click "Clear filters"
   → All filters reset; full list shows

5. Click any table row
   → Scrim appears (dims background)
   → Panel slides in from right at ~480px
   → Page content does NOT shift/reflow
   → Practice name in panel header matches clicked row

6. Verify profile section
   → All fields render (nulls as —)
   → Tier and subscription status show as badges

7. Verify stats section
   → "Changes Acknowledged" shows a number
   → "Account Age" shows days as integer

8. Test tier toggle
   → Click "Switch to intelligence"
   → Confirmation step appears (two buttons)
   → Click Cancel → returns to initial state
   → Click "Switch to intelligence" again → Confirm
   → Loading state shows → success → tier badge in panel updates
   → Table row tier badge also updates (optimistic)

9. Test soft delete
   → Click "Delete Practice" button
   → Confirmation step appears
   → Click Cancel → returns
   → Click "Delete Practice" → Confirm Delete
   → Loading state → panel closes → row disappears from table

10. Click scrim (dim area outside panel)
    → Panel closes; scrim disappears

11. Click X button in panel header
    → Panel closes
```

### API Verification

```bash
# Test tier update (replace TOKEN and PRACTICE_ID)
curl -X PATCH https://cedar-beta.vercel.app/api/admin/practices/PRACTICE_ID/tier \
  -H "Content-Type: application/json" \
  -d '{"tier": "intelligence"}'
# Without auth: expect 401
# With admin session cookie: expect { success: true, id, tier }

# Test invalid tier value:
curl -X PATCH .../tier -d '{"tier": "enterprise"}'
# Expect 422 with error message
```

### Database Verification

```sql
-- Confirm deleted_at column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'practices' AND column_name = 'deleted_at';

-- Confirm soft delete worked (check a deleted row)
SELECT id, name, deleted_at FROM practices WHERE deleted_at IS NOT NULL;

-- Confirm active query excludes deleted rows
SELECT count(*) FROM practices WHERE deleted_at IS NULL;
```

## Anti-Patterns

- ❌ Do not use `any` types — use `PracticeRow` from generated types throughout
- ❌ Do not call Stripe from the tier update route — that sync is explicitly deferred (add TODO comment)
- ❌ Do not hard-fail the DELETE route if WorkOS user is not found — log warning and continue
- ❌ Do not use router navigation for the slide-over — it's pure client state on the list page
- ❌ Do not use `z-[9999]` or other arbitrary Tailwind values — use `z-40`/`z-50` from the scale
- ❌ Do not add `deleted_at IS NULL` filter in the WorkOS delete route — the supabase fetch already confirms the practice exists and isn't deleted
- ❌ Do not duplicate badge helper definitions across more than 2 files — they're co-located with their usage component, which is acceptable here
- ❌ Do not use `Sheet` from shadcn if it interferes with the scrim behavior — use raw Tailwind fixed positioning as described in Task 5
- ❌ Do not include `paused` in the subscription status filter — it is NOT in the DB CHECK constraint
- ❌ Do not display NPI — the column does not exist in any migration

## Confidence Score

**9 / 10** — High confidence for one-pass implementation.

The only uncertainty is the exact WorkOS `@workos-inc/node` import path and whether `WorkOS` is a named or default export. Verify by checking:

```typescript
// One of these will be correct:
import { WorkOS } from '@workos-inc/node'   // named export (most likely per SDK types)
// or
import WorkOS from '@workos-inc/node'       // default export
```

The type definition confirms `WorkOS` is a declared class — use the named import. If it fails at build time, check `node_modules/@workos-inc/node/lib/index.d.cts` for the export form.
