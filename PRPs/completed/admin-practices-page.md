name: "Admin Practices Management Page"

## Goal

Build `app/(admin)/practices/page.tsx` — a read-only admin page that queries all rows from the `practices` table and renders them in a shadcn/ui `Table`. Display every column the table exposes. Render `tier` and `subscription_status` as styled `Badge` components. Add a `/practices` nav link to the admin section of `components/Sidebar.tsx`.

## Why

- Gives admins visibility into all onboarded practices without needing direct DB access
- Supports operational monitoring (billing status, tier distribution, new sign-ups)
- MVP dashboard completeness — admin panel currently lacks customer visibility

## Success Criteria

- [ ] Page renders at `/practices` for admin role without errors
- [ ] Non-admin users are redirected to `/home` (inherited from layout)
- [ ] All 13 `practices` columns are displayed (or gracefully null-handled)
- [ ] `tier` and `subscription_status` render as styled `Badge` components
- [ ] Sidebar shows "Practices" link in the Admin nav section
- [ ] `npm run build` passes with 0 errors, 0 warnings

## Context

### Files to Read First

```yaml
- file: app/(admin)/layout.tsx
  why: Shows admin role-gate pattern (redirect if role !== 'admin') — already handled at layout level, page needs no additional gate

- file: app/(admin)/system/page.tsx
  why: Canonical pattern for admin server components — imports createServerClient, uses Table, Card, Badge, exports dynamic = 'force-dynamic'

- file: app/(admin)/reviews/page.tsx
  why: Shows createServerClient() usage, type narrowing from Supabase query result, error/empty state patterns

- file: components/Sidebar.tsx
  why: ADMIN_NAV array at line 22-25 — add Practices entry here

- file: lib/db/types.ts
  why: practices.Row type at lines 1262-1308 — defines all 13 columns and their nullable status

- file: lib/db/client.ts
  why: createServerClient() signature — use this, not createBrowserClient, because query bypasses RLS

- file: lib/format.ts
  why: formatDate() and timeAgo() utilities — use for created_at and current_period_end display

- file: lib/ui-constants.ts
  why: Check if TIER_CLASS or STATUS_CLASS constants already exist before defining inline badge styles
```

### Current File Tree (relevant subset)

```bash
app/(admin)/
  layout.tsx          # Role gate + Sidebar + BreadcrumbNav
  reviews/
    page.tsx          # Review queue — table pattern to mirror
  system/
    page.tsx          # System health — another admin table pattern
  # practices/ does NOT exist yet

components/
  Sidebar.tsx         # ADMIN_NAV array to modify
  SeverityBadge.tsx
  StatusBadge.tsx

lib/
  db/
    client.ts         # createServerClient()
    types.ts          # Database['public']['Tables']['practices']['Row']
  format.ts           # timeAgo(), formatDate()
  ui-constants.ts     # SEVERITY_CLASS, STATUS_CLASS, STATUS_LABEL, etc.
```

### Files to Create or Modify

```bash
app/(admin)/practices/page.tsx   (+) New admin page — practices table
components/Sidebar.tsx           (M) Add Practices entry to ADMIN_NAV array
```

### Known Gotchas

```typescript
// 1. Service role client required — practices query has no practice_id filter
//    so it bypasses RLS. Use createServerClient() exactly as system/page.tsx does.
//    import { createServerClient } from '../../../lib/db/client'

// 2. Role gate is inherited from app/(admin)/layout.tsx — do NOT add a
//    redundant role check inside the page component.

// 3. Type narrowing: Supabase .select('*') returns a wide union. Cast the
//    result to a typed array after the query, same as reviews/page.tsx does:
//    const practices = (rows ?? []) as Array<Database['public']['Tables']['practices']['Row']>

// 4. Nullable columns — these fields may be null and must render gracefully:
//    owner_name, phone, practice_type, stripe_customer_id,
//    stripe_subscription_id, subscription_status, current_period_end,
//    notification_preferences is JSON — do not display it in this pass

// 5. No search or sort in this pass — display only, ordered by created_at desc

// 6. export const dynamic = 'force-dynamic' — required on all admin pages
//    to prevent stale caching (mirrors system/page.tsx line 59)

// 7. Sidebar ADMIN_NAV is a plain array of objects at the top of the file —
//    add the Practices entry before Reviews (or after — alphabetical is fine,
//    but match the icon style: ri-[name]-line)

// 8. lib/ui-constants.ts may not have tier or subscription_status constants.
//    Define inline badge styles in the page file rather than adding new
//    constants — keep scope minimal.

// 9. Table column for notification_preferences (JSON): skip this column —
//    it is not meaningful to display raw JSON in a management table.
//    The feature description says "every column" but JSON blobs are not
//    operationally useful here. Omit it from the table columns.
```

### practices.Row type (from lib/db/types.ts lines 1262-1308)

```typescript
// Database['public']['Tables']['practices']['Row']
{
  id: string
  created_at: string
  current_period_end: string | null
  name: string
  notification_preferences: Json   // OMIT from table — not displayable
  owner_email: string
  owner_name: string | null
  phone: string | null
  practice_type: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string | null
  tier: string
}
```

## Tasks (execute in order)

### Task 1: Create app/(admin)/practices/page.tsx

**File:** `app/(admin)/practices/page.tsx`
**Action:** CREATE
**Pattern:** Follow `app/(admin)/system/page.tsx` exactly for structure, imports, and dynamic export

```typescript
// Import pattern — mirror system/page.tsx exactly
import { createServerClient } from '../../../lib/db/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/format'
import type { Database } from '@/lib/db/types'

// Required — prevents stale cache
export const dynamic = 'force-dynamic'

// Type alias for cleaner usage
type PracticeRow = Database['public']['Tables']['practices']['Row']

// ── Badge helpers ─────────────────────────────────────────────────────────────

// TierBadge — mirrors RoleBadge in Sidebar.tsx color logic
// monitor: default outline badge
// intelligence: purple badge (matching sidebar RoleBadge)
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

// SubscriptionBadge — color-codes by status value
// active: green  |  trialing: blue  |  past_due/unpaid: amber  |  canceled: red  |  null/unknown: muted
function SubscriptionBadge({ status }: { status: string | null }) {
  if (!status) {
    return <span className="text-xs text-muted-foreground">—</span>
  }
  const styles: Record<string, string> = {
    active:    'text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
    trialing:  'text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
    past_due:  'text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    unpaid:    'text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    canceled:  'text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
  }
  const cls = styles[status] ?? 'text-xs text-muted-foreground'
  const label = status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
  return (
    <Badge variant="outline" className={cls}>
      {label}
    </Badge>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function PracticesPage() {
  const supabase = createServerClient()

  const { data: rows, error } = await supabase
    .from('practices')
    .select('*')
    .order('created_at', { ascending: false })

  const practices = (rows ?? []) as PracticeRow[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Practices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All registered practices — {practices.length} total
        </p>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <i className="ri-error-warning-line text-base" />
          <AlertDescription>Failed to load practices: {error.message}</AlertDescription>
        </Alert>
      )}

      {/* Empty state */}
      {practices.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <i className="ri-building-line text-3xl text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No practices registered yet.</p>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {practices.length > 0 && (
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
                  <TableHead>Period End</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {practices.map((p) => (
                  <TableRow key={p.id}>
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
                      {p.current_period_end ? formatDate(p.current_period_end) : '—'}
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
  )
}
```

**Note:** `stripe_customer_id` and `stripe_subscription_id` are internal IDs — omit from display columns (not operationally useful in a UI table). The `notification_preferences` JSON field is also omitted. All other fields are displayed.

### Task 2: Add Practices to ADMIN_NAV in Sidebar

**File:** `components/Sidebar.tsx`
**Action:** MODIFY
**Depends on:** Task 1 (page must exist before nav points to it)

Find the `ADMIN_NAV` array at line 22 and add the Practices entry:

```typescript
// BEFORE (lines 22-25):
const ADMIN_NAV = [
  { href: '/reviews',   label: 'Review Queue',  icon: 'ri-inbox-line' },
  { href: '/system',    label: 'System Health', icon: 'ri-server-line' },
]

// AFTER:
const ADMIN_NAV = [
  { href: '/practices', label: 'Practices',     icon: 'ri-building-line' },
  { href: '/reviews',   label: 'Review Queue',  icon: 'ri-inbox-line' },
  { href: '/system',    label: 'System Health', icon: 'ri-server-line' },
]
```

**Why `ri-building-line`:** Remix Icon for building/organization — consistent with the Remix Icon-only convention in CLAUDE.md.

### Task 3: Verify formatDate exists in lib/format.ts

**File:** `lib/format.ts`
**Action:** READ-ONLY verification

Before using `formatDate()`, confirm it is exported from `lib/format.ts`. If only `timeAgo()` exists (no `formatDate`), use an inline date formatter instead:

```typescript
// Fallback if formatDate is not exported:
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
// Then replace formatDate(x) calls with fmtDate(x) in page.tsx
```

Do NOT add `formatDate` to `lib/format.ts` unless it already exists there — adding to shared utilities is out of scope.

## Integration Points

```yaml
DATABASE:
  - No schema changes — query uses existing practices table
  - Uses SELECT * ordered by created_at DESC, no RLS filtering needed
  - createServerClient() bypasses RLS — correct for cross-practice admin query

INNGEST:
  - None

API ROUTES:
  - None — page is a server component with direct Supabase query

UI:
  - app/(admin)/practices/page.tsx  — NEW page
  - components/Sidebar.tsx          — ADMIN_NAV array modified (1 entry added)

ENV:
  - None — uses existing SUPABASE_SECRET_KEY via createServerClient()
```

## Validation

### Build Check

```bash
npm run build
# Must pass with 0 errors, 0 warnings
```

### Functional Verification

```bash
# 1. Start dev server (use the env-u pattern from CLAUDE.md)
env -u ANTHROPIC_API_KEY npx next dev --port 3000

# 2. Sign in as admin user

# 3. Verify sidebar shows "Practices" link in the Admin section
#    (below the "Admin" label, above or alongside Review Queue and System Health)

# 4. Click "Practices" — verify page loads at /practices

# 5. Verify table renders with all columns:
#    Practice | Owner | Type | Tier | Status | Phone | Period End | Created

# 6. Verify tier badge colors:
#    - "monitor" → plain outline badge
#    - "intelligence" → purple badge

# 7. Verify subscription_status badge colors:
#    - "active" → green
#    - null → em dash, no badge

# 8. Verify null fields (owner_name, phone, practice_type) render as "—"

# 9. Sign in as practice_owner — verify /practices redirects to /home
#    (role gate enforced by app/(admin)/layout.tsx)
```

### Database Verification

```sql
-- Confirm practices table has expected columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'practices'
ORDER BY ordinal_position;

-- Confirm query returns all rows
SELECT COUNT(*) FROM practices;
```

## Anti-Patterns

- ❌ Do not create new patterns when existing ones work — mirror `system/page.tsx` structure exactly
- ❌ Do not use `any` types — use `Database['public']['Tables']['practices']['Row']` type alias
- ❌ Do not add a redundant role check in the page — the layout already gates to admin
- ❌ Do not use `createBrowserClient()` — this query bypasses RLS and requires `createServerClient()`
- ❌ Do not display `notification_preferences` (JSON blob) or raw Stripe IDs — not operationally useful
- ❌ Do not add search, sort, or pagination in this pass — display only
- ❌ Do not hardcode color values — use Tailwind utility classes with CSS variable-based colors
- ❌ Do not modify `lib/ui-constants.ts` — define badge styles inline in the page file only
- ❌ Do not skip `export const dynamic = 'force-dynamic'` — required on all admin pages

## Confidence Score

**9/10** — Straightforward server component with no new API calls, no schema changes, and clear patterns to mirror from system/page.tsx and reviews/page.tsx. The only uncertainty is whether `formatDate` exists in lib/format.ts (Task 3 handles this). All other dependencies are confirmed from direct file reads.
