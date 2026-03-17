import { withAuth } from '@workos-inc/authkit-nextjs'
import { redirect } from 'next/navigation'
import { createServerClient } from '../../lib/db/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { user } = await withAuth({ ensureSignedIn: true })
  const supabase = createServerClient()

  const { data: practice } = await supabase
    .from('practices')
    .select('id')
    .eq('owner_email', user.email)
    .maybeSingle()

  redirect(practice ? '/changes' : '/onboarding')
}
