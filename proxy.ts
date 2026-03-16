import { authkitMiddleware } from '@workos-inc/authkit-nextjs'

// redirectUri is the OAuth callback URL — read from NEXT_PUBLIC_WORKOS_REDIRECT_URI env var.
// Do NOT pass a relative path here; authkit-nextjs calls `new URL(redirectUri)` which throws.
export default authkitMiddleware()

export const config = {
  // Run middleware on all routes except:
  // - Next.js static assets and image optimization
  // - /api/inngest — Inngest webhooks must be publicly accessible (no auth)
  // - /callback — WorkOS auth callback must be publicly accessible
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/inngest|callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
