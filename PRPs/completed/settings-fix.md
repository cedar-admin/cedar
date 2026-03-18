name: "Settings Page — Notification Persistence"

## Goal

Notification toggles and the email threshold selector on the Settings page persist their state to the database. Flipping a toggle or changing the threshold saves immediately. Admin accounts see only the Account card (Role: Admin, email) with no subscription fields — this is already implemented and must not be regressed. Sidebar role/tier badge is already correct and does not need changes.

## Why

- User-visible broken behavior: toggles render but saving does nothing
- Erodes trust in a compliance platform where users expect their preferences to stick
- Blocking Module 9 dashboard completion (see STATUS.md)
- MVP scope

## Success Criteria

- [ ] Flipping "Email alerts" toggle persists to `practices.notification_preferences` in Supabase
- [ ] Changing "Email threshold" select persists to `practices.notification_preferences`
- [ ] Flipping "Weekly digest" toggle persists to `practices.notification_preferences`
- [ ] Page load shows current saved state (not hardcoded defaults)
- [ ] Admin user sees Account card only — no notifications, no billing (already true, must not regress)
- [ ] `npm run build` passes with 0 errors, 0 warnings

## Context

### Files to Read First

```yaml
- file: app/(dashboard)/settings/page.tsx
  why: Current settings page — server component, understand the existing query and layout

- file: app/actions/onboarding.ts
  why: Server action pattern to mirror — withAuth + createServerClient + redirect

- file: app/actions/billing.ts
  why: Secondary server action pattern (form action)

- file: lib/db/client.ts
  why: createServerClient() vs createBrowserClient() — use service role in server action

- file: lib/layout-data.ts
  why: withAuth pattern and UserRole type

- file: supabase/migrations/016_hitl_columns.sql
  why: Migration file format to mirror for migration 017

- file: supabase/migrations/015_practice_profile.sql
  why: Simple ALTER TABLE pattern — this is the model for migration 017
```

### Current File Tree (relevant subset)

```bash
app/
  (dashboard)/
    settings/
      page.tsx          ← server component, needs practice query update + component split
    layout.tsx          ← passes role to Sidebar (no change needed)
  actions/
    billing.ts
    onboarding.ts       ← pattern to mirror
    settings.ts         ← NEW: server action for notification prefs
components/
  NotificationsForm.tsx ← NEW: client component for the notifications card
  Sidebar.tsx           ← already correct, no changes needed
lib/
  db/client.ts
  layout-data.ts
supabase/migrations/
  016_hitl_columns.sql  ← last migration
  017_notification_prefs.sql  ← NEW
```

### Files to Create or Modify

```bash
supabase/migrations/017_notification_prefs.sql   (+) Add notification_preferences JSONB to practices
app/actions/settings.ts                           (+) Server action: saveNotificationPreferences
components/NotificationsForm.tsx                  (+) Client component: toggle+select with auto-save
app/(dashboard)/settings/page.tsx                 (M) Add notification_preferences to query, pass to NotificationsForm
```

### Known Gotchas

```typescript
// 1. createServerClient() uses service role — bypasses RLS.
//    Safe for server actions because withAuth() verifies the caller.
//    Never use createServerClient() in client components.

// 2. The settings page is currently a pure server component.
//    The notifications card must be extracted to a client component ('use client')
//    because Switch and Select need onChange handlers.
//    The server component passes initial values as props — the client component owns state.

// 3. Server actions in Next.js App Router must be in files marked 'use server' at the top.
//    They are called directly from client components (no fetch/API route needed).

// 4. withAuth({ ensureSignedIn: true }) in the server action — throws if not authed.
//    Wrap in try/catch and return { error: 'Unauthorized' } shape.

// 5. notification_preferences JSONB default should be set in migration
//    so existing rows get the default without a backfill script:
//    DEFAULT '{"email_alerts": true, "email_threshold": "high", "weekly_digest": false}'::jsonb

// 6. The practices query in settings/page.tsx uses createServerClient() (service role).
//    This is correct — the page is a server component and RLS is enforced by the
//    .eq('owner_email', user.email) filter where user comes from withAuth().

// 7. Auto-save UX: call server action inside startTransition on each toggle/select change.
//    Use isPending from useTransition to show a subtle saving indicator.
//    Do NOT use a submit button — this is a toggle/select auto-save pattern.

// 8. NotificationPreferences type must match the JSONB schema exactly.
//    Define as an interface in the component or a shared types file.
```

### Existing Patterns to Mirror

**Server action pattern** (`app/actions/onboarding.ts`):
```typescript
'use server'
import { withAuth } from '@workos-inc/authkit-nextjs'
import { createServerClient } from '../../lib/db/client'

export async function saveNotificationPreferences(prefs: NotificationPreferences) {
  const { user } = await withAuth({ ensureSignedIn: true })
  // ... update practices set notification_preferences = prefs where owner_email = user.email
}
```

**Client component calling server action** (follow shadcn patterns):
```typescript
'use client'
import { useTransition } from 'react'
import { saveNotificationPreferences } from '@/app/actions/settings'

export function NotificationsForm({ initial }: { initial: NotificationPreferences }) {
  const [prefs, setPrefs] = useState(initial)
  const [isPending, startTransition] = useTransition()

  function update(patch: Partial<NotificationPreferences>) {
    const next = { ...prefs, ...patch }
    setPrefs(next)
    startTransition(() => saveNotificationPreferences(next))
  }
  // ... render Switch and Select using `prefs` state, calling update() on change
}
```

## Tasks (execute in order)

### Task 1: Migration — Add notification_preferences column
**File:** `supabase/migrations/017_notification_prefs.sql`
**Action:** CREATE
**Pattern:** Follow `supabase/migrations/015_practice_profile.sql` (simple ALTER TABLE)

```sql
-- Cedar: Add notification_preferences JSONB to practices
-- Stores per-practice notification settings persisted from the Settings page.

ALTER TABLE practices
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB
    NOT NULL
    DEFAULT '{"email_alerts": true, "email_threshold": "high", "weekly_digest": false}'::jsonb;

COMMENT ON COLUMN practices.notification_preferences IS
  'JSON object: { email_alerts: boolean, email_threshold: "critical"|"high"|"medium"|"all", weekly_digest: boolean }';
```

Apply locally:
```bash
npx supabase db push --local
# or push to remote if already applied locally
```

### Task 2: Server action — saveNotificationPreferences
**File:** `app/actions/settings.ts`
**Action:** CREATE
**Pattern:** `app/actions/onboarding.ts`

```typescript
'use server'

import { withAuth } from '@workos-inc/authkit-nextjs'
import { createServerClient } from '../../lib/db/client'

export interface NotificationPreferences {
  email_alerts: boolean
  email_threshold: 'critical' | 'high' | 'medium' | 'all'
  weekly_digest: boolean
}

export async function saveNotificationPreferences(
  prefs: NotificationPreferences
): Promise<{ success: boolean; error?: string }> {
  let userEmail: string
  try {
    const { user } = await withAuth({ ensureSignedIn: true })
    userEmail = user.email
  } catch {
    return { success: false, error: 'Unauthorized' }
  }

  // Validate — only accept known keys and values
  const validThresholds = ['critical', 'high', 'medium', 'all'] as const
  if (typeof prefs.email_alerts !== 'boolean' ||
      typeof prefs.weekly_digest !== 'boolean' ||
      !validThresholds.includes(prefs.email_threshold)) {
    return { success: false, error: 'Invalid preferences' }
  }

  const supabase = createServerClient()
  const { error } = await supabase
    .from('practices')
    .update({ notification_preferences: prefs })
    .eq('owner_email', userEmail)

  if (error) {
    console.error('[settings] Failed to save notification_preferences:', error.message)
    return { success: false, error: 'Failed to save' }
  }

  return { success: true }
}
```

### Task 3: Client component — NotificationsForm
**File:** `components/NotificationsForm.tsx`
**Action:** CREATE
**Pattern:** Follow shadcn/ui component conventions from existing components; use `useTransition` for server action calls

```typescript
'use client'

import { useState, useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { saveNotificationPreferences } from '@/app/actions/settings'
import type { NotificationPreferences } from '@/app/actions/settings'

interface NotificationsFormProps {
  initial: NotificationPreferences
}

export function NotificationsForm({ initial }: NotificationsFormProps) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(initial)
  const [isPending, startTransition] = useTransition()

  function update(patch: Partial<NotificationPreferences>) {
    const next = { ...prefs, ...patch }
    setPrefs(next)
    startTransition(async () => {
      await saveNotificationPreferences(next)
    })
  }

  return (
    <div className="space-y-4">
      {/* Email alerts row */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="email-alerts" className="text-sm font-medium text-foreground">
            Email alerts
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Receive email for Critical &amp; High severity changes
          </p>
        </div>
        <Switch
          id="email-alerts"
          checked={prefs.email_alerts}
          onCheckedChange={(checked) => update({ email_alerts: checked })}
          disabled={isPending}
        />
      </div>
      <Separator />

      {/* Severity threshold row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Email threshold</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Only send alerts at or above this severity
          </p>
        </div>
        <Select
          value={prefs.email_threshold}
          onValueChange={(value) =>
            update({ email_threshold: value as NotificationPreferences['email_threshold'] })
          }
          disabled={isPending}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="critical">Critical only</SelectItem>
            <SelectItem value="high">High &amp; above</SelectItem>
            <SelectItem value="medium">Medium &amp; above</SelectItem>
            <SelectItem value="all">All changes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator />

      {/* Weekly digest row */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="weekly-digest" className="text-sm font-medium text-foreground">
            Weekly digest
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Summary email every Monday morning
          </p>
        </div>
        <Switch
          id="weekly-digest"
          checked={prefs.weekly_digest}
          onCheckedChange={(checked) => update({ weekly_digest: checked })}
          disabled={isPending}
        />
      </div>

      <div className="pt-1">
        <p className="text-xs text-muted-foreground">
          <i className="ri-information-line mr-1" />
          {isPending
            ? 'Saving…'
            : 'Notification preferences are applied account-wide. Per-user settings coming soon.'}
        </p>
      </div>
    </div>
  )
}
```

### Task 4: Update settings page — query + wire NotificationsForm
**File:** `app/(dashboard)/settings/page.tsx`
**Action:** MODIFY
**Depends on:** Task 2 (NotificationPreferences type), Task 3 (NotificationsForm component)

Changes:
1. Add `notification_preferences` to the `.select(...)` string in the practice query
2. Import `NotificationsForm` and `NotificationPreferences`
3. Replace the static notifications card body (the Switch + Select elements) with `<NotificationsForm initial={...} />`
4. Build the `initial` value from `practice.notification_preferences` with type-safe defaults

```typescript
// Add to the existing select string:
.select('id, name, owner_email, tier, stripe_customer_id, stripe_subscription_id, subscription_status, current_period_end, created_at, notification_preferences')

// Build initial prefs with safe fallback:
import type { NotificationPreferences } from '@/app/actions/settings'
import { NotificationsForm } from '@/components/NotificationsForm'

// Inside the JSX, where the notifications CardContent currently has the static rows:
const rawPrefs = practice.notification_preferences as Record<string, unknown> | null
const initialPrefs: NotificationPreferences = {
  email_alerts:     typeof rawPrefs?.email_alerts === 'boolean'   ? rawPrefs.email_alerts   : true,
  email_threshold:  ['critical','high','medium','all'].includes(rawPrefs?.email_threshold as string)
                      ? (rawPrefs!.email_threshold as NotificationPreferences['email_threshold'])
                      : 'high',
  weekly_digest:    typeof rawPrefs?.weekly_digest === 'boolean'  ? rawPrefs.weekly_digest  : false,
}

// Replace the static notifications card body with:
<CardContent>
  <NotificationsForm initial={initialPrefs} />
</CardContent>
```

**Important:** Do NOT change the admin card, practice card, subscription card, team card, or jurisdictions card. Only the notifications card body changes.

## Integration Points

```yaml
DATABASE:
  - Migration 017: ADD COLUMN notification_preferences JSONB to practices
  - Apply with: npx supabase db push (local) then push migration to production

INNGEST:
  - None required for this feature

API ROUTES:
  - None required — server action handles persistence directly

UI:
  - app/(dashboard)/settings/page.tsx: add column to query, wire NotificationsForm
  - components/NotificationsForm.tsx: new client component

ENV:
  - No new environment variables needed
```

## Validation

### Build Check

```bash
npm run build
# Must pass with 0 errors, 0 warnings
```

### Functional Verification

```
1. Start dev server: env -u ANTHROPIC_API_KEY npx next dev --port 3000
2. Sign in as a practice_owner account (not admin)
3. Navigate to /settings
4. Verify the Notifications card loads with saved state (not hardcoded defaults)
5. Toggle "Email alerts" OFF — the toggle should flip immediately
6. Refresh the page — "Email alerts" should still be OFF (persisted)
7. Change "Email threshold" to "Critical only"
8. Refresh — threshold should still show "Critical only"
9. Toggle "Weekly digest" ON, refresh — should remain ON
10. Sign in as admin (cedaradmin@gmail.com)
11. Navigate to /settings — should see only the Account card (email + Admin badge)
    Should NOT see notifications, subscription, team, or jurisdictions cards
```

### Database Verification

```sql
-- After toggling in the UI, verify the row was updated:
SELECT id, owner_email, notification_preferences
FROM practices
WHERE owner_email = '<your-test-email>';

-- Expected: notification_preferences matches what you set in the UI
-- e.g. {"email_alerts": false, "email_threshold": "critical", "weekly_digest": true}
```

### Push Migration to Production

```bash
# After validating locally, apply migration to production Supabase:
npx supabase db push

# Regenerate types after schema change:
npx supabase gen types typescript --project-id serumeiwrvtwisibuawe > lib/db/types.ts
```

## Anti-Patterns

- ❌ Do not add a Save button — toggles and selects should auto-save on change
- ❌ Do not use `createBrowserClient()` in the server action — use `createServerClient()`
- ❌ Do not put the server action in a file without `'use server'` at the top
- ❌ Do not skip type validation in the server action — validate `prefs` before DB write
- ❌ Do not modify the changes table — this feature only touches the practices table
- ❌ Do not change the admin card, subscription card, team card, or jurisdictions card
- ❌ Do not redesign the settings page layout — keep scope tight
- ❌ Do not use `any` types — use the `NotificationPreferences` interface
- ❌ Do not forget to regenerate types after pushing the migration

## Confidence Score

**9/10** — Straightforward schema addition + server action + client component extraction. All patterns exist in the codebase. Only risk: the `notification_preferences` column type may need a cast in the TypeScript types after migration; regenerating types resolves this.
