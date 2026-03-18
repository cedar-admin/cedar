## FEATURE:

Fix the Settings page so notification toggles persist to the database. Currently, the toggles render but flipping them does nothing — the change isn't saved. This is user-visible broken behavior.

Additionally:
- Admin accounts should see "Role: Admin" and NOT see subscription-related fields
- Practice owner accounts should see their tier name and subscription management options
- Sidebar badge should show "Admin" for admins, tier name for practice owners

## FILES TO REFERENCE:

- `app/(dashboard)/settings/page.tsx` — current settings page (toggles don't persist)
- `app/(dashboard)/layout.tsx` — sidebar component with role/tier badge
- `lib/db/client.ts` — Supabase client patterns
- `supabase/migrations/` — check for a notification_preferences or practice_settings table/column
- `components/shared/` — existing shared components (SeverityBadge, StatusBadge)

## DOCUMENTATION:

- Supabase JS client docs for upsert: https://supabase.com/docs/reference/javascript/upsert
- WorkOS AuthKit for role checking

## OTHER CONSIDERATIONS:

- The practices table may need a `notification_preferences JSONB` column if one doesn't exist — check migrations first
- The toggle state should load from the database on page render (server component query)
- Saving should use a client-side handler that calls an API route or server action
- Follow existing patterns for Supabase queries in the codebase — don't invent new ones
- RLS must be applied if a new column/table is added
- This is a UI cleanup task, keep scope tight — don't redesign the settings page
