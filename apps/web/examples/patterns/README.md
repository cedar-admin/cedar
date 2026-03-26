# Cedar Code Pattern Examples

These files contain canonical implementation patterns that Claude Code should reference when building new features. Each file is a real, working extract from the Cedar codebase demonstrating the correct way to implement common patterns.

## How to Use
When generating PRPs, reference these files in the "Files to Read First" section. When implementing, mirror these patterns rather than inventing new ones.

## Files to Add
Extract these from your codebase and place them here:

### `inngest-function.ts`
Copy a representative Inngest step function (e.g., from `inngest/monitor.ts`). Should show:
- Kill switch check at the start
- Step function structure with `step.run()`
- Cost tracking wrapper on external API calls
- Error handling and logging pattern

### `supabase-query.ts`
Copy a representative Supabase query (e.g., from a dashboard page). Should show:
- Service role vs anon client usage
- RLS-aware query pattern
- Type-safe response handling
- Error handling

### `api-route.ts`
Copy a representative API route (e.g., `app/api/changes/[id]/approve/route.ts`). Should show:
- Auth validation (WorkOS session check)
- Role-based access control
- Input validation
- Supabase mutation pattern
- Response format

### `dashboard-page.tsx`
Copy a representative dashboard page (e.g., the changes list page). Should show:
- Server component data fetching
- Shared component usage (SeverityBadge, StatusBadge, EmptyState)
- Layout and styling conventions
- TypeScript interfaces for page data
