import { withAuth } from '@workos-inc/authkit-nextjs'
import { redirect } from 'next/navigation'
import { createServerClient } from '../../lib/db/client'
import { OnboardingForm } from './OnboardingForm'

export const dynamic = 'force-dynamic'

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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <i className="ri-leaf-line text-primary text-xl" />
          <span className="text-lg font-semibold tracking-tight text-foreground">Cedar</span>
        </div>

        <OnboardingForm email={user.email} />

        <p className="mt-4 text-xs text-center text-muted-foreground">
          Signed in as {user.email}
        </p>
      </div>
    </div>
  )
}
