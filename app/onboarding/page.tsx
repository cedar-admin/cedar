import { withAuth } from '@workos-inc/authkit-nextjs'
import { redirect } from 'next/navigation'
import { createServerClient } from '../../lib/db/client'
import { OnboardingForm } from './OnboardingForm'
import { Text } from '@radix-ui/themes'

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
    <div className="min-h-screen bg-[var(--cedar-page-bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <i className="ri-leaf-line text-[var(--cedar-brand-primary)] text-xl" aria-hidden="true" />
          <Text size="4" weight="bold" as="span" className="tracking-tight">Cedar</Text>
        </div>

        <OnboardingForm email={user.email} />

        <p className="mt-4 text-xs text-center text-[var(--cedar-text-secondary)]">
          Signed in as {user.email}
        </p>
      </div>
    </div>
  )
}
