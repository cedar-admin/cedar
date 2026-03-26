import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '../../../../lib/stripe'
import { getEnv } from '../../../../lib/env'
import { createServerClient } from '../../../../lib/db/client'

// Stripe delivers events more than once — all DB operations must be idempotent.
// Practice lookup is always by stripe_customer_id (present on every event type).

export async function POST(request: NextRequest) {
  // CRITICAL: must call request.text() before anything else.
  // constructEvent() requires the raw unparsed body to verify the HMAC signature.
  // Calling request.json() first will always produce a signature mismatch.
  const rawBody = await request.text()
  const sig = request.headers.get('stripe-signature') ?? ''
  const env = getEnv()

  const webhookSecret = env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServerClient()

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
        const priceMetaTier = sub.items.data[0]?.price?.metadata?.tier ?? 'monitor'
        const tier = priceMetaTier === 'intelligence' ? 'intelligence' : 'monitor'
        // current_period_end moved in newer Stripe API type definitions — cast to access
        const rawPeriodEnd = (sub as any).current_period_end as number | null | undefined
        const periodEnd = rawPeriodEnd ? new Date(rawPeriodEnd * 1000).toISOString() : null

        await supabase
          .from('practices')
          .update({
            stripe_subscription_id: sub.id,
            subscription_status: sub.status,
            tier,
            current_period_end: periodEnd,
          } as any)
          .eq('stripe_customer_id', customerId)

        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id

        await supabase
          .from('practices')
          .update({ subscription_status: 'canceled' } as any)
          .eq('stripe_customer_id', customerId)

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
        if (!customerId) break

        // Refresh current_period_end from the subscription object on the invoice
        // invoice.subscription field renamed in newer Stripe API type definitions
        const rawSub = (invoice as any).subscription as string | Stripe.Subscription | null | undefined
        const subId = typeof rawSub === 'string' ? rawSub : (rawSub as Stripe.Subscription | null | undefined)?.id
        if (!subId) break

        const sub = await getStripe().subscriptions.retrieve(subId)
        const rawPeriodEnd2 = (sub as any).current_period_end as number | null | undefined
        const periodEnd = rawPeriodEnd2 ? new Date(rawPeriodEnd2 * 1000).toISOString() : null

        await supabase
          .from('practices')
          .update({ current_period_end: periodEnd, subscription_status: sub.status } as any)
          .eq('stripe_customer_id', customerId)

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
        if (!customerId) break

        await supabase
          .from('practices')
          .update({ subscription_status: 'past_due' } as any)
          .eq('stripe_customer_id', customerId)

        break
      }

      default:
        // Always return 200 for unhandled events so Stripe doesn't retry
        break
    }
  } catch (err) {
    console.error(`[stripe-webhook] Error handling ${event.type}:`, err)
    // Return 500 so Stripe retries — transient DB errors should be retried
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
