// POST /api/changes/:id/approve
// Approves a pending change: records review_action, updates review_status,
// and triggers delivery via Inngest.

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@workos-inc/authkit-nextjs'
import { createServerClient } from '../../../../../lib/db/client'
import { inngest } from '../../../../../inngest/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: changeId } = await params

  // Authenticate reviewer
  let reviewerId = 'admin'
  try {
    const { user } = await withAuth({ ensureSignedIn: true })
    reviewerId = user.id
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({})) as { notes?: string }
  const notes = body.notes ?? null

  const supabase = createServerClient()

  // Confirm the change exists and is pending
  const { data: change, error: chErr } = await supabase
    .from('changes')
    .select('id, severity, review_status')
    .eq('id', changeId)
    .single()

  if (chErr || !change) {
    return NextResponse.json({ error: 'Change not found' }, { status: 404 })
  }
  if (change.review_status !== 'pending') {
    return NextResponse.json(
      { error: `Change is already ${change.review_status}` },
      { status: 409 }
    )
  }

  // Record the review action (append-only audit trail)
  const { error: actionErr } = await supabase
    .from('review_actions')
    .insert({
      change_id: changeId,
      reviewer_id: reviewerId,
      action: 'approve',
      notes,
    })

  if (actionErr) {
    console.error('[approve] Failed to insert review_action:', actionErr.message)
    return NextResponse.json({ error: 'Failed to record action' }, { status: 500 })
  }

  // Flip review_status to approved (allowed by column-allowlist trigger in migration 010)
  const { error: updateErr } = await supabase
    .from('changes')
    .update({ review_status: 'approved' })
    .eq('id', changeId)

  if (updateErr) {
    console.error('[approve] Failed to update review_status:', updateErr.message)
    return NextResponse.json({ error: 'Failed to approve change' }, { status: 500 })
  }

  // Trigger email delivery via Inngest
  await inngest.send({
    name: 'cedar/change.deliver',
    data: { changeId, severity: change.severity ?? 'medium' },
  })

  return NextResponse.json({ success: true, changeId, reviewerId })
}
