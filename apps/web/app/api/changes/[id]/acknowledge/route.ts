// GET /api/changes/:id/acknowledge?token=<signed>
// Called when a practice clicks "Mark as Reviewed" in a delivery email.
// Token is HMAC-signed (practiceId:signature). Verifies before recording.

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../../lib/db/client'
import { getEnv } from '../../../../../lib/env'
import { verifyAcknowledgeToken } from '../../../../../lib/delivery/email'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Email links use GET so they work in any email client (no JS required)
  const { id: changeId } = await params
  const supabase = createServerClient()
  const env = getEnv()
  const appUrl = env.NEXT_PUBLIC_APP_URL ?? 'https://cedar-beta.vercel.app'

  const token = request.nextUrl.searchParams.get('token')

  try {
    // Look up the change to confirm it exists
    const { data: change, error: chErr } = await supabase
      .from('changes')
      .select('id, source_id, review_status')
      .eq('id', changeId)
      .single()

    if (chErr || !change) {
      return NextResponse.redirect(`${appUrl}/changes?error=change_not_found`, { status: 302 })
    }

    // Verify signed token
    if (!token) {
      return NextResponse.redirect(`${appUrl}/changes/${changeId}?error=missing_token`, { status: 302 })
    }

    if (!env.ADMIN_SECRET) {
      return NextResponse.redirect(`${appUrl}/changes/${changeId}?error=server_misconfigured`, { status: 302 })
    }
    const practiceId = verifyAcknowledgeToken(token, changeId, env.ADMIN_SECRET)
    if (!practiceId) {
      return NextResponse.redirect(`${appUrl}/changes/${changeId}?error=invalid_token`, { status: 302 })
    }

    // Upsert acknowledgment — idempotent (re-clicking the link is safe)
    const { error: ackErr } = await supabase
      .from('practice_acknowledgments')
      .upsert(
        {
          change_id: changeId,
          practice_id: practiceId,
          acknowledged_by: 'email_link',   // MVP: no per-user tracking yet
          acknowledged_at: new Date().toISOString(),
        },
        { onConflict: 'practice_id,change_id' }
      )

    if (ackErr) {
      console.error('[acknowledge] Failed to record acknowledgment:', ackErr.message)
      // Don't block the redirect — log and continue
    }

    // Redirect to the change detail page with a success indicator
    return NextResponse.redirect(`${appUrl}/changes/${changeId}?acknowledged=1`, { status: 302 })
  } catch (err) {
    console.error('[acknowledge] Unexpected error:', err)
    return NextResponse.redirect(`${appUrl}/changes?error=server_error`, { status: 302 })
  }
}
