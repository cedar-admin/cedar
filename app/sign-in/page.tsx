import { getSignInUrl } from '@workos-inc/authkit-nextjs'
import { redirect } from 'next/navigation'

// WorkOS AuthKit sign-in: redirect to hosted sign-in page
export default async function SignInPage() {
  const signInUrl = await getSignInUrl()
  redirect(signInUrl)
}
