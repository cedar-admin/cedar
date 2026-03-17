'use server'

import { redirect } from 'next/navigation'
import { withAuth } from '@workos-inc/authkit-nextjs'
import { getStripe } from '../../lib/stripe'
import { getEnv } from '../../lib/env'
import { createServerClient } from '../../lib/db/client'

function appUrl(): string {
  return getEnv().NEXT_PUBLIC_APP_URL ?? 'https://cedar-beta.vercel.app'
}

/**
 * Create a Stripe Checkout Session for the given price ID and redirect the user to it.
 * Creates a Stripe Customer record if this practice doesn't have one yet.
 */
export async function createCheckoutSession(priceId: string) {
  const { user } = await withAuth({ ensureSignedIn: true })
  const supabase = createServerClient()
  const stripe = getStripe()
  const base = appUrl()

  const { data: practice } = await supabase
    .from('practices')
    .select('id, stripe_customer_id')
    .eq('owner_email', user.email)
    .maybeSingle()

  if (!practice) {
    redirect('/sign-in')
  }

  let customerId = practice.stripe_customer_id as string | null

  if (!customerId) {
    // Check Stripe first to avoid duplicate customers on double-click
    const existing = await stripe.customers.list({ email: user.email, limit: 1 })
    if (existing.data.length > 0) {
      customerId = existing.data[0].id
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { practice_id: practice.id },
      })
      customerId = customer.id
    }

    await supabase
      .from('practices')
      .update({ stripe_customer_id: customerId } as any)
      .eq('id', practice.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${base}/settings?checkout=success`,
    cancel_url: `${base}/pricing`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { practice_id: practice.id },
    },
  })

  redirect(session.url!)
}

/**
 * Create a Stripe Billing Portal session and redirect the user to it.
 * Redirects to /pricing if the practice has no Stripe customer yet.
 */
export async function createBillingPortalSession() {
  const { user } = await withAuth({ ensureSignedIn: true })
  const supabase = createServerClient()
  const base = appUrl()

  const { data: practice } = await supabase
    .from('practices')
    .select('stripe_customer_id')
    .eq('owner_email', user.email)
    .maybeSingle()

  const customerId = practice?.stripe_customer_id as string | null | undefined
  if (!customerId) {
    redirect('/pricing')
  }

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${base}/settings`,
  })

  redirect(portalSession.url)
}
