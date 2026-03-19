# Cedar Architecture Reference

Quick reference for Claude Code during PRP generation. For full detail, see the System Architecture Build Guide.

## Monorepo Structure
```
cedar/
  app/
    (dashboard)/          # Practice-facing routes
      changes/            # Change timeline + detail views
      sources/            # Source health status
      audit/              # Audit trail viewer + export
      settings/           # Notifications, account, billing
      library/            # Regulation browser [Intelligence]
      faq/                # FAQ library [Intelligence]
    (admin)/              # Internal admin panel
      reviews/            # HITL review queue
      system/             # System health, kill switches
    api/
      inngest/            # Inngest webhook endpoint
      webhooks/           # Stripe, Resend webhooks
      changes/[id]/       # approve, reject, acknowledge routes
      trigger/            # Manual pipeline trigger
  lib/
    env.ts                # Zod-validated env vars
    features.ts           # Feature flag checker
    cost-tracker.ts       # Cost event logging
    fetchers/             # Oxylabs, BrowserBase, Gov APIs, dispatcher
    processing/           # Docling client, Whisper client, normalize
    changes/              # hash.ts, diff.ts
    intelligence/         # relevance-filter.ts, classifier.ts, ontology-mapper.ts
    audit/                # record.ts, snapshot.ts, chain-validator.ts
    delivery/             # email.ts, push.ts
    knowledge-graph/      # entities.ts, relationships.ts, queries.ts
    db/                   # Supabase clients + generated types
  inngest/
    client.ts             # Inngest client init
    monitor.ts            # Core pipeline (398 LOC)
    delivery.ts           # Alert delivery per practice
    scheduler.ts          # Cron: fan out to all active source_urls
    audit-validation.ts   # Weekly chain validation cron
  supabase/migrations/    # 16 SQL migration files (source of truth)
  components/shared/      # SeverityBadge, StatusBadge, EmptyState, DataList
```

## Core Pipeline Flow
```
Inngest scheduler → fetch source URL → normalize → SHA-256 hash
→ compare to last_hash → [no change: update timestamp, done]
→ [change detected: generate structured diff → Agent 1 (relevance)
→ Agent 2 (classify + summarize) → HITL review rules check
→ record change (append-only) → write KG entity → deliver email]
```

## Key Tables
- `sources` + `source_urls`: What Cedar monitors
- `changes`: Append-only audit trail (chain_hash linked)
- `practices`: Subscriber accounts
- `practice_acknowledgments`: "Mark as Reviewed" records
- `review_rules` + `review_actions`: HITL gating
- `kg_entities` + `kg_relationships` + `kg_entity_versions`: Knowledge graph
- `cost_events`: Per-call cost tracking
- `feature_flags`: Tier gating
- `prompt_templates`: Agent prompt versioning
- `validation_log`: Weekly chain integrity checks
