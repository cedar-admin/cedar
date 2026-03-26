'use server'

import { withAuth } from '@workos-inc/authkit-nextjs'
import { redirect } from 'next/navigation'
import { createServerClient } from '../../lib/db/client'

export async function createPractice(formData: FormData) {
  const { user } = await withAuth({ ensureSignedIn: true })
  const supabase = createServerClient()

  // Guard: already onboarded (double-submit or back-button)
  const { data: existing } = await supabase
    .from('practices')
    .select('id')
    .eq('owner_email', user.email)
    .maybeSingle()

  if (existing) redirect('/home')

  const name          = (formData.get('name') as string).trim()
  const owner_name    = (formData.get('owner_name') as string).trim()
  const practice_type = (formData.get('practice_type') as string).trim()
  const phone         = (formData.get('phone') as string).trim()
  const tier          = (formData.get('tier') as string | null)?.trim() ?? 'monitor'

  // Validate tier value
  const validTier = tier === 'intelligence' ? 'intelligence' : 'monitor'

  const { error } = await supabase
    .from('practices')
    .insert({
      owner_email:         user.email,
      name,
      owner_name,
      practice_type,
      phone,
      tier:                validTier,
      subscription_status: 'active',
    })

  if (error) {
    // 23505 = unique_violation — race condition, practice was just created
    if (error.code === '23505') redirect('/home')
    throw new Error(`Failed to create practice: ${error.message}`)
  }

  redirect('/home')
}
