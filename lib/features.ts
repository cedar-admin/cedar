import { createServerClient } from './db/client'

type Tier = 'monitor' | 'intelligence'

// In-memory cache: { 'flag_name:tier' -> { enabled, expiresAt } }
const cache = new Map<string, { enabled: boolean; expiresAt: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Check whether a feature flag is enabled for a given subscription tier.
 * Results are cached in-memory for 5 minutes.
 *
 * Never hardcode tier strings in components — always use this function.
 *
 * @example
 * const canUseQA = await isFeatureEnabled('conversational_qa', practice.tier)
 */
export async function isFeatureEnabled(flagName: string, tier: Tier): Promise<boolean> {
  const cacheKey = `${flagName}:${tier}`
  const cached = cache.get(cacheKey)

  if (cached && cached.expiresAt > Date.now()) {
    return cached.enabled
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('feature_flags')
    .select('enabled')
    .eq('flag_name', flagName)
    .eq('tier', tier)
    .single()

  if (error || !data) {
    // Fail closed — unknown flags are disabled
    return false
  }

  const enabled = data.enabled
  cache.set(cacheKey, { enabled, expiresAt: Date.now() + CACHE_TTL_MS })
  return enabled
}

/**
 * Invalidate a specific flag from the cache (call after admin updates a flag).
 */
export function invalidateFeatureFlag(flagName: string, tier: Tier) {
  cache.delete(`${flagName}:${tier}`)
}

/**
 * Invalidate all cached feature flags.
 */
export function invalidateAllFeatureFlags() {
  cache.clear()
}
