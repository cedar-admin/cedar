// PATCH /api/admin/practices/[id]/tier
// Updates practices.tier. Admin-only. No Stripe sync (TODO).
// Body: { tier: 'monitor' | 'intelligence' }

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/layout-data'
import { createServerClient } from '@/lib/db/client'

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
