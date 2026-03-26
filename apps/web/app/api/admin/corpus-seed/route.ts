// POST /api/admin/corpus-seed
// Fires the cedar/corpus.seed Inngest event to kick off bulk ingestion.
// Gated by x-admin-secret header.

import { NextRequest, NextResponse } from 'next/server'
import { inngest } from '../../../../inngest/client'
import { getEnv } from '../../../../lib/env'

export async function POST(req: NextRequest) {
  const secret = getEnv().ADMIN_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'ADMIN_SECRET not configured' }, { status: 500 })
  }
  if (req.headers.get('x-admin-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await inngest.send({ name: 'cedar/corpus.seed', data: {} })

  return NextResponse.json({ sent: true, event: 'cedar/corpus.seed' })
}
