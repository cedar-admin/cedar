import { serve } from 'inngest/next'
import { inngest } from '../../../inngest/client'
import { monitorSource, scheduledMonitor } from '../../../inngest/monitor'
import { weeklyDiscovery } from '../../../inngest/discovery'
import { runIntelligencePipeline } from '../../../inngest/intelligence'
import { deliverChangeAlert } from '../../../inngest/delivery'
import { recoverFailedFetch } from '../../../inngest/recovery'
import { weeklyAuditValidation } from '../../../inngest/audit-validation'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    monitorSource,
    scheduledMonitor,
    weeklyDiscovery,
    runIntelligencePipeline,
    deliverChangeAlert,
    recoverFailedFetch,
    weeklyAuditValidation,
  ],
  signingKey: process.env.INNGEST_SIGNING_KEY,
})
