import { authkitMiddleware } from '@workos-inc/authkit-nextjs'

export default authkitMiddleware({
  // Redirect unauthenticated users to /sign-in
  redirectUri: '/sign-in',
})

export const config = {
  // Run middleware on all routes except:
  // - Next.js static assets and image optimization
  // - /api/inngest — Inngest webhooks must be publicly accessible (no auth)
  // - /callback — WorkOS auth callback must be publicly accessible
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/inngest|callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
