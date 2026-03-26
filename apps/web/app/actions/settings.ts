'use server'

import { withAuth } from '@workos-inc/authkit-nextjs'
import { createServerClient } from '../../lib/db/client'
import type { Json } from '../../lib/db/types'

export interface NotificationPreferences {
  email_alerts: boolean
  email_threshold: 'critical' | 'high' | 'medium' | 'all'
  weekly_digest: boolean
}

export async function saveNotificationPreferences(
  prefs: NotificationPreferences
): Promise<{ success: boolean; error?: string }> {
  let userEmail: string
  try {
    const { user } = await withAuth({ ensureSignedIn: true })
    userEmail = user.email
  } catch {
    return { success: false, error: 'Unauthorized' }
  }

  // Validate — only accept known keys and values
  const validThresholds = ['critical', 'high', 'medium', 'all'] as const
  if (
    typeof prefs.email_alerts !== 'boolean' ||
    typeof prefs.weekly_digest !== 'boolean' ||
    !validThresholds.includes(prefs.email_threshold)
  ) {
    return { success: false, error: 'Invalid preferences' }
  }

  const supabase = createServerClient()
  const { error } = await supabase
    .from('practices')
    .update({ notification_preferences: prefs as unknown as { [key: string]: Json | undefined } })
    .eq('owner_email', userEmail)

  if (error) {
    console.error('[settings] Failed to save notification_preferences:', error.message)
    return { success: false, error: 'Failed to save' }
  }

  return { success: true }
}
