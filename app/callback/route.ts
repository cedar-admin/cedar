import { handleAuth } from '@workos-inc/authkit-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export const GET = handleAuth({
  onError: ({ request }: { request: NextRequest }) => {
    // Redirect to sign-in with an error flag instead of showing raw JSON
    const url = new URL('/sign-in', request.url)
    url.searchParams.set('error', 'auth_failed')
    return NextResponse.redirect(url)
  },
})
