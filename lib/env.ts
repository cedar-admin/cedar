import { z } from 'zod'

const serverEnvSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),

  // WorkOS
  NEXT_PUBLIC_WORKOS_CLIENT_ID: z.string().min(1),
  WORKOS_API_KEY: z.string().min(1),
  WORKOS_COOKIE_PASSWORD: z.string().min(32, 'WORKOS_COOKIE_PASSWORD must be at least 32 characters'),

  // Inngest
  INNGEST_EVENT_KEY: z.string().min(1),
  INNGEST_SIGNING_KEY: z.string().min(1),

  // Anthropic — accessed directly via process.env in intelligence agents
  // (getEnv() Zod validation has Turbopack step-callback issues with this key)
  ANTHROPIC_API_KEY: z.string().optional(),

  // App URL — used in email links. Falls back to cedar-beta.vercel.app if not set.
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Stripe — required for billing
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_MONITOR_PRICE_ID: z.string().min(1),
  STRIPE_INTELLIGENCE_PRICE_ID: z.string().min(1),
  ADMIN_SECRET: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().optional(),
  OXYLABS_USERNAME: z.string().optional(),
  OXYLABS_PASSWORD: z.string().optional(),
  BROWSERBASE_API_KEY: z.string().optional(),
  RAILWAY_DOCLING_URL: z.string().url().optional(),
  ONESIGNAL_API_KEY: z.string().optional(),
})

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_WORKOS_CLIENT_ID: z.string().min(1),
})

function validateServerEnv() {
  // Explicitly reference each process.env.KEY — Turbopack/webpack static analysis requires
  // explicit property access (not spread/pass-through) to correctly resolve server env vars
  // at runtime in API routes and Inngest step callbacks.
  const parsed = serverEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    NEXT_PUBLIC_WORKOS_CLIENT_ID: process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID,
    WORKOS_API_KEY: process.env.WORKOS_API_KEY,
    WORKOS_COOKIE_PASSWORD: process.env.WORKOS_COOKIE_PASSWORD,
    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ADMIN_SECRET: process.env.ADMIN_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_MONITOR_PRICE_ID: process.env.STRIPE_MONITOR_PRICE_ID,
    STRIPE_INTELLIGENCE_PRICE_ID: process.env.STRIPE_INTELLIGENCE_PRICE_ID,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    OXYLABS_USERNAME: process.env.OXYLABS_USERNAME,
    OXYLABS_PASSWORD: process.env.OXYLABS_PASSWORD,
    BROWSERBASE_API_KEY: process.env.BROWSERBASE_API_KEY,
    RAILWAY_DOCLING_URL: process.env.RAILWAY_DOCLING_URL,
    ONESIGNAL_API_KEY: process.env.ONESIGNAL_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  })
  if (!parsed.success) {
    console.error('❌ Invalid server environment variables:')
    console.error(parsed.error.flatten().fieldErrors)
    throw new Error('Invalid server environment variables. Check your .env.local file.')
  }
  return parsed.data
}

function validateClientEnv() {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_WORKOS_CLIENT_ID: process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID,
  })
  if (!parsed.success) {
    console.error('❌ Invalid client environment variables:')
    console.error(parsed.error.flatten().fieldErrors)
    throw new Error('Invalid client environment variables.')
  }
  return parsed.data
}

// Lazy singleton — validated on first access, not at module load time.
// This prevents build-time failures when Next.js evaluates API route modules
// before all env vars are available in the static analysis subprocess.
let _serverEnv: ReturnType<typeof validateServerEnv> | null = null

/**
 * Get validated server-side env vars.
 * Call this inside server components, API route handlers, and Inngest functions.
 * NEVER call this in client components. NEVER use process.env directly elsewhere.
 */
export function getEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('getEnv() called on the client — use getClientEnv() instead')
  }
  if (!_serverEnv) {
    _serverEnv = validateServerEnv()
  }
  return _serverEnv
}

// Client-safe env — validated eagerly (NEXT_PUBLIC_ vars are always available at build time)
export const clientEnv = typeof window !== 'undefined' || process.env.NEXT_PUBLIC_SUPABASE_URL
  ? validateClientEnv()
  : ({} as ReturnType<typeof validateClientEnv>)
