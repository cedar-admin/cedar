# Cedar Product Roadmap Reference

Quick reference for Claude Code during PRP generation.

## Phases
| Phase | Timeline | Revenue Tier | Core Capability |
|-------|----------|-------------|-----------------|
| MVP | Month 0-2 | Pre-revenue | Pipeline works end-to-end for 10 sources |
| 1.0 Launch | Month 3-5 | Monitor ($99) | 71 sources, production dashboard, Stripe billing |
| 1.0 Full | Month 6-9 | Intelligence ($199) | Attorney-reviewed content, Q&A, KG, digest |

## Current Position: MVP (nearing completion)
Modules 1-3, 5-8 complete. Module 9 (Dashboard) partial. Module 4 blocked on Railway.

## MVP Success Criteria
1. Detect real regulatory change from 3+ sources within 24 hours
2. AI summary is accurate when reviewed
3. Audit trail correctly records full chain
4. Alert email arrives with summary and source link

## What MVP Does NOT Build
- Full 3-agent pipeline (single agent sufficient)
- Knowledge graph (1.0 Full)
- Conversational Q&A (1.0 Full)
- Push notifications (1.0 Full)
- Self-healing recovery chain (1.0 Launch)
- Docling PDF processing (1.0 Launch — blocked on Railway)
- Whisper audio transcription (1.0 Launch)
- Attorney review workflow (1.0 Full)
- Weekly digest (1.0 Full)

## Critical Path Dependencies
- MVP → 1.0 Launch: Pipeline reliable on 10 sources. Attorney conversations begun.
- 1.0 Launch → 1.0 Full: Attorney retainer signed. 25+ Monitor subscribers active. HITL workflow operational. Evaluation dataset exists (100+ scenarios).
