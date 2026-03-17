-- Cedar Module 10: Add billing status columns to practices
-- subscription_status mirrors Stripe's subscription.status field
-- 'inactive' is the Cedar-specific default meaning "never subscribed"
-- current_period_end stores the next renewal/expiry timestamp

ALTER TABLE practices
  ADD COLUMN subscription_status TEXT DEFAULT 'inactive'
    CHECK (subscription_status IN (
      'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'inactive'
    )),
  ADD COLUMN current_period_end TIMESTAMPTZ;

-- Index for webhook handler lookups by stripe_customer_id
CREATE INDEX idx_practices_stripe_customer_id ON practices(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
