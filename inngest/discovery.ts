// Module 2: Weekly discovery re-crawl
// Re-crawls all sources to find new URLs and validate existing ones
// Built in Phase: 1.0 Launch (Months 3-5)

import { inngest } from './client'

export const weeklyDiscovery = inngest.createFunction(
  {
    id: 'weekly-discovery',
    name: 'Weekly Discovery Re-Crawl',
  },
  { cron: '0 2 * * 0' }, // Every Sunday at 2am
  async ({ step }) => {
    throw new Error('weeklyDiscovery not yet implemented — Module 2 (1.0 Launch)')
  }
)
