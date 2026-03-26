-- Migration: 014_billing_columns.sql
-- Purpose: Add subscription billing status columns to practices for Stripe integration
-- Tables affected: practices
-- Special considerations: None

-- subscription_status mirrors Stripe's subscription.status field
-- 'inactive' is the Cedar-specific default meaning "never subscribed"
-- current_period_end stores the next renewal/expiry timestamp

alter table public.practices
  add column subscription_status text default 'inactive'
    check (subscription_status in (
      'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'inactive'
    )),
  add column current_period_end timestamptz;

-- Index for webhook handler lookups by stripe_customer_id
create index idx_practices_stripe_customer_id on public.practices(stripe_customer_id)
  where stripe_customer_id is not null;
