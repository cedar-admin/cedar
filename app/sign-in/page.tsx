import { getSignInUrl } from '@workos-inc/authkit-nextjs'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Sign In — Cedar' }

interface Props {
  searchParams: Promise<{ redirect?: string }>
}

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams
  const redirectPath = params.redirect

  // Pass the redirect path through WorkOS back to our /post-auth handler
  const returnTo = redirectPath
    ? `/post-auth?redirect=${encodeURIComponent(redirectPath)}`
    : '/post-auth'

  const signInUrl = await getSignInUrl({ returnTo })
  redirect(signInUrl)
}
