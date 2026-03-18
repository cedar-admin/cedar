# Cedar Tier Economics Reference

Quick reference for Claude Code during PRP generation.

## Tier Structure
| Tier | Price | Phase | Key Features |
|------|-------|-------|-------------|
| Monitor | $99/mo | 1.0 Launch | 71 sources, AI alerts, audit trail, dashboard, team access |
| Intelligence | $199/mo | 1.0 Full | + Attorney-reviewed content, Q&A, KG, weekly digest, push |

## Feature Gating
All tier-gated features check `feature_flags` table via `lib/features.ts`.
- Monitor features: `audit_export`
- Intelligence features: `qa_interface`, `knowledge_graph`, `push_notifications`, `weekly_digest`, `attorney_reviewed`

When a Monitor subscriber accesses a gated Intelligence feature, render an upgrade prompt.

## Information-Only Platform
Cedar provides regulatory monitoring, summaries, and FAQs. Cedar does not provide legal advice.
- Every AI summary: disclaimer label
- Every attorney-reviewed piece: disclaimer
- Every email alert: disclaimer
- Every dashboard page: disclaimer in footer (shared layout component)

## Unit Economics
- Monitor infrastructure cost per practice: ~$8-12/mo (88-92% gross margin)
- Intelligence infrastructure cost per practice: ~$15-25/mo (82-87% gross margin)
- Attorney retainer: $5,000-7,500/mo (scales with changes, not subscribers)
- Break-even: ~35-40 subscribers per tier
