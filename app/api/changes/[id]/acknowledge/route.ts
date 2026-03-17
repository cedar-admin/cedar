// POST /api/changes/:id/acknowledge
// Called when a practice clicks "Mark as Reviewed" in a delivery email.
// Records the acknowledgment and redirects to the change detail page.

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../../lib/db/client'
import { getEnv } from '../../../../../lib/env'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Email links use GET so they work in any email client (no JS required)
  const { id: changeId } = await params
  const supabase = createServerClient()
  const env = getEnv()
  const appUrl = env.NEXT_PUBLIC_APP_URL ?? 'https://cedar-beta.vercel.app'

  // Resolve the practice from the token query param (optional — MVP uses single practice)
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

    // Resolve practice — use token if provided, otherwise use the first active practice (MVP)
    let practiceId: string | null = null

    if (token) {
      // Future: decode signed JWT token to get practice_id
      // For MVP, token is the raw practice_id
      practiceId = token
    } else {
      const { data: practice } = await supabase
        .from('practices')
        .select('id')
        .limit(1)
        .single()
      practiceId = practice?.id ?? null
    }

    if (!practiceId) {
      return NextResponse.redirect(`${appUrl}/changes/${changeId}?error=no_practice`, { status: 302 })
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
