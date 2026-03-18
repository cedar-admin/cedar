import { createClient } from '@supabase/supabase-js'
import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'
import type { Database } from './types'
import { getEnv } from '../env'

/**
 * Server-side Supabase client — uses service role key, bypasses RLS.
 * Use ONLY in Inngest functions and API routes.
 * Never use in client components or server components that render user data.
 */
export function createServerClient() {
  const env = getEnv()
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SECRET_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

/**
 * Browser-side Supabase client — uses anon key, subject to RLS.
 * Use in client components and server components rendering user-scoped data.
 */
export function createBrowserClient() {
  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
