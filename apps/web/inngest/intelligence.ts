// Module 2/6: Intelligence pipeline jobs
// Orchestrates the 3-agent pipeline as async Inngest steps
// Built in Phase: MVP (single agent), 1.0 Launch (full 3-agent)

import { inngest } from './client'

export const runIntelligencePipeline = inngest.createFunction(
  {
    id: 'intelligence-pipeline',
    name: 'Intelligence Pipeline',
    retries: 2,
  },
  { event: 'cedar/change.classify' },
  async ({ event, step }) => {
    throw new Error('runIntelligencePipeline not yet implemented — Module 6 (MVP)')
  }
)
