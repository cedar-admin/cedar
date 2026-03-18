// DELETE /api/admin/practices/[id]
// Soft-deletes the practice (sets deleted_at = now()) and deletes the WorkOS user.
// Admin-only.

import { NextRequest, NextResponse } from 'next/server'
import { WorkOS } from '@workos-inc/node'
import { requireAdmin } from '@/lib/layout-data'
import { createServerClient } from '@/lib/db/client'
import { getEnv } from '@/lib/env'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createServerClient()
  const env = getEnv()

  // Fetch practice to get owner_email for WorkOS lookup
  const { data: practice, error: fetchErr } = await supabase
    .from('practices')
    .select('id, owner_email, name')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (fetchErr || !practice) {
    return NextResponse.json({ error: 'Practice not found' }, { status: 404 })
  }

  // Soft delete in Supabase
  const { error: deleteErr } = await supabase
    .from('practices')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (deleteErr) {
    console.error('[delete-practice] Supabase update failed:', deleteErr.message)
    return NextResponse.json({ error: 'Failed to delete practice' }, { status: 500 })
  }

  // WorkOS user deletion — graceful: log warning if not found, don't fail the request
  try {
    const workos = new WorkOS(env.WORKOS_API_KEY)
    const usersResult = await workos.userManagement.listUsers({ email: practice.owner_email })
    const workosUser = usersResult.data[0]

    if (workosUser) {
      await workos.userManagement.deleteUser(workosUser.id)
      console.info(`[delete-practice] Deleted WorkOS user ${workosUser.id} for ${practice.owner_email}`)
    } else {
      console.warn(`[delete-practice] WorkOS user not found for email: ${practice.owner_email} — skipping WorkOS delete`)
    }
  } catch (workosErr) {
    // Log but don't fail — Supabase soft delete already succeeded
    console.error('[delete-practice] WorkOS deletion error:', workosErr)
  }

  return NextResponse.json({ success: true, id })
}
