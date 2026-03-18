// Shared helper used by both (dashboard) and (admin) layouts
// Returns the authenticated user, their practice, and their role.

import { withAuth } from '@workos-inc/authkit-nextjs'
import { createServerClient } from './db/client'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export type UserRole = 'admin' | 'intelligence' | 'monitor'

const ADMIN_EMAILS = ['cedaradmin@gmail.com']

export function resolveRole(email: string, tier: string | null): UserRole {
  if (ADMIN_EMAILS.includes(email.toLowerCase())) return 'admin'
  const t = tier?.toLowerCase() ?? 'monitor'
  if (t === 'admin') return 'admin'
  if (t === 'intelligence') return 'intelligence'
  return 'monitor'
}

export interface LayoutData {
  user: { email: string; firstName: string | null; lastName: string | null }
  practice: { name: string; tier: string; subscription_status: string | null } | null
  role: UserRole
}

export async function getLayoutData(): Promise<LayoutData> {
  const { user } = await withAuth({ ensureSignedIn: false })

  if (!user) {
    // Get current pathname to preserve redirect destination
    const heads = await headers()
    const pathname =
      heads.get('x-invoke-path') ??
      heads.get('x-pathname') ??
      '/home'
    redirect(`/sign-in?redirect=${encodeURIComponent(pathname)}`)
  }

  const supabase = createServerClient()
  const { data: practice } = await supabase
    .from('practices')
    .select('name, tier, subscription_status')
    .eq('owner_email', user.email)
    .maybeSingle()

  const role = resolveRole(
    user.email,
    practice?.tier ?? null
  )

  return {
    user: {
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
    },
    practice: practice
      ? {
          name: practice.name,
          tier: practice.tier ?? 'monitor',
          subscription_status: practice.subscription_status ?? null,
        }
      : null,
    role,
  }
}
