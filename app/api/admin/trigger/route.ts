// POST /api/admin/trigger
// Manually fire cedar/source.monitor events for one or all active sources.
// Gated by x-admin-secret header — never expose without this check.
//
// Body (optional): { "sourceId": "<uuid>" }  → run a single source
// Body (omitted)  : trigger ALL active sources

import { NextRequest, NextResponse } from 'next/server'
import { inngest } from '../../../../inngest/client'
import { createServerClient } from '../../../../lib/db/client'
import { getEnv } from '../../../../lib/env'

export async function POST(req: NextRequest) {
  // ── Auth guard ────────────────────────────────────────────────────────────
  const secret = getEnv().ADMIN_SECRET
  if (req.headers.get('x-admin-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()

  // ── Resolve which source_urls to trigger ─────────────────────────────────
  let body: { sourceId?: string } = {}
  try {
    body = await req.json()
  } catch {
    // No body is fine — trigger all
  }

  let query = supabase
    .from('source_urls')
    .select('id, source_id, sources!inner(id, name, is_active)')
    .eq('sources.is_active', true)

  if (body.sourceId) {
    query = query.eq('source_id', body.sourceId) as typeof query
  }

  const { data: sourceUrls, error } = await query

  if (error) {
    return NextResponse.json({ error: `DB query failed: ${error.message}` }, { status: 500 })
  }

  if (!sourceUrls || sourceUrls.length === 0) {
    return NextResponse.json({ error: 'No active source URLs found' }, { status: 404 })
  }

  // ── Fire Inngest events ───────────────────────────────────────────────────
  const events = sourceUrls.map((su) => ({
    name: 'cedar/source.monitor' as const,
    data: {
      sourceId: su.source_id,
      sourceUrlId: su.id,
    },
  }))

  await inngest.send(events)

  const sourceNames = sourceUrls.map((su) => {
    const src = su.sources as { name: string } | null
    return src?.name ?? su.source_id
  })

  return NextResponse.json({
    sent: events.length,
    sources: sourceNames,
  })
}
