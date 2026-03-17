import { withAuth } from '@workos-inc/authkit-nextjs'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'
import { createServerClient } from '../../lib/db/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { user } = await withAuth({ ensureSignedIn: true })
  const supabase = createServerClient()

  const { data: practice } = await supabase
    .from('practices')
    .select('id')
    .eq('owner_email', user.email)
    .maybeSingle()

  // New user — send to onboarding regardless of redirect param
  if (!practice) {
    redirect('/onboarding')
  }

  // Read redirect param — only allow relative paths to prevent open redirect
  const url = new URL(request.url)
  const raw = url.searchParams.get('redirect') ?? ''
  const destination = raw.startsWith('/') ? raw : '/home'

  redirect(destination)
}
