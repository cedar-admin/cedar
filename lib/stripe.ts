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
    _stripe = new Stripe(getEnv().STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    })
  }
  return _stripe
}
