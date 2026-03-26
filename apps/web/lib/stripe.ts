import Stripe from 'stripe'
import { getEnv } from './env'

let _stripe: Stripe | null = null

/**
 * Lazy Stripe client singleton.
 * Call inside server components, API routes, and server actions.
 * Never call in client components.
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = getEnv().STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
    _stripe = new Stripe(key, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    })
  }
  return _stripe
}
