// POST /api/changes/:id/reject
// Rejects a pending change: records review_action and updates review_status.
// Rejected changes are not delivered and remain in the audit trail.

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@workos-inc/authkit-nextjs'
import { createServerClient } from '../../../../../lib/db/client'

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
    .select('id, review_status')
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
      action: 'reject',
      notes,
    })

  if (actionErr) {
    console.error('[reject] Failed to insert review_action:', actionErr.message)
    return NextResponse.json({ error: 'Failed to record action' }, { status: 500 })
  }

  // Flip review_status to rejected
  const { error: updateErr } = await supabase
    .from('changes')
    .update({ review_status: 'rejected' })
    .eq('id', changeId)

  if (updateErr) {
    console.error('[reject] Failed to update review_status:', updateErr.message)
    return NextResponse.json({ error: 'Failed to reject change' }, { status: 500 })
  }

  return NextResponse.json({ success: true, changeId, reviewerId })
}
