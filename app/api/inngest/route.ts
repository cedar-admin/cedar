import { serve } from 'inngest/next'
import { inngest } from '../../../inngest/client'
import { monitorSource, scheduledMonitor } from '../../../inngest/monitor'
import { weeklyDiscovery } from '../../../inngest/discovery'
import { runIntelligencePipeline } from '../../../inngest/intelligence'
import { deliverChangeAlert } from '../../../inngest/delivery'
import { recoverFailedFetch } from '../../../inngest/recovery'
import { weeklyAuditValidation } from '../../../inngest/audit-validation'
import { corpusSeed } from '../../../inngest/corpus-seed'
import { corpusClassify } from '../../../inngest/corpus-classify'
import { frDailyPoll } from '../../../inngest/fr-daily-poll'
import { ecfrDailyCheck } from '../../../inngest/ecfr-daily-check'

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
    corpusSeed,
    corpusClassify,
    frDailyPoll,
    ecfrDailyCheck,
  ],
  signingKey: process.env.INNGEST_SIGNING_KEY,
})
