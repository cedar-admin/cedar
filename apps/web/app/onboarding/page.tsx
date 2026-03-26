import { withAuth } from '@workos-inc/authkit-nextjs'
import { redirect } from 'next/navigation'
import { createServerClient } from '../../lib/db/client'
import { OnboardingForm } from './OnboardingForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Get Started — Cedar' }

export default async function OnboardingPage() {
  const { user } = await withAuth({ ensureSignedIn: true })
  const supabase = createServerClient()

  const { data: existing } = await supabase
    .from('practices')
    .select('id')
    .eq('owner_email', user.email)
    .maybeSingle()

  if (existing) redirect('/home')

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-xl" aria-hidden="true" />
          <span className="text-lg font-bold tracking-tight">Cedar</span>
        </div>

        <OnboardingForm email={user.email} />

        <p className="mt-4 text-xs text-center">
          Signed in as {user.email}
        </p>
      </div>
    </div>
  )
}
