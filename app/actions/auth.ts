'use server'

import { signOut } from '@workos-inc/authkit-nextjs'
import { headers } from 'next/headers'

export async function handleSignOut() {
  const heads = await headers()
  const host = heads.get('host') ?? 'localhost:3000'
  const proto = host.includes('localhost') ? 'http' : 'https'
  await signOut({ returnTo: `${proto}://${host}/sign-in` })
}
