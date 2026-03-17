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
 * Check whether a feature flag is enabled for a practice, accounting for
 * live subscription status. Practices that are past_due, canceled, or inactive
 * are treated as Monitor tier regardless of their recorded tier field.
 *
 * Pass a practice object fetched from the DB — callers already have it,
 * so there's no extra query cost here.
 *
 * @example
 * const canUseQA = await isFeatureEnabledForPractice('conversational_qa', practice)
 */
export async function isFeatureEnabledForPractice(
  flagName: string,
  practice: { tier: string; subscription_status: string | null }
): Promise<boolean> {
  const status = practice.subscription_status ?? 'inactive'
  const isActive = status === 'active' || status === 'trialing'
  const effectiveTier = isActive
    ? (practice.tier as Tier)
    : 'monitor'
  return isFeatureEnabled(flagName, effectiveTier)
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
