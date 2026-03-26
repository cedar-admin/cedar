import type { Metadata } from 'next'
import { createServerClient } from '../../../lib/db/client'
import TriggerButton from './TriggerButton'
import SeedCorpusButton from './SeedCorpusButton'
import { CedarTable } from '@/components/CedarTable'
import { SEVERITY_COLOR } from '@/lib/ui-constants'
import { timeAgo } from '@/lib/format'

export const metadata: Metadata = { title: 'System Health — Cedar Admin' }

const ENV_VARS = [
  { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API', required: true },
  { key: 'RESEND_API_KEY', label: 'Resend Email', required: true },
  { key: 'INNGEST_SIGNING_KEY', label: 'Inngest Signing', required: true },
  { key: 'INNGEST_EVENT_KEY', label: 'Inngest Events', required: true },
  { key: 'OXYLABS_USERNAME', label: 'Oxylabs Username', required: false },
  { key: 'OXYLABS_PASSWORD', label: 'Oxylabs Password', required: false },
  { key: 'BROWSERBASE_API_KEY', label: 'BrowserBase', required: false },
  { key: 'ADMIN_SECRET', label: 'Admin Secret', required: true },
]

function EnvRow({ keyName, label, required }: { keyName: string; label: string; required: boolean }) {
  const isSet = !!process.env[keyName]
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono">{keyName}</span>
        <span className="text-xs">{label}</span>
        {required && !isSet && <span className="inline-flex px-2 py-0.5 text-xs rounded border border-red-300 text-red-700">Required</span>}
      </div>
      {isSet ? (
        <span className="flex items-center gap-1 text-xs font-medium text-green-700">Set</span>
      ) : (
        <span className="flex items-center gap-1 text-xs">Not set</span>
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default async function SystemPage() {
  const supabase = createServerClient()
  const { data: sources } = await supabase.from('sources').select('id, name, fetch_method, is_active, source_urls(id, last_fetched_at, last_fetch_method)').order('name')
  const { data: changeCounts } = await supabase.from('changes').select('source_id')
  const countBySource = (changeCounts ?? []).reduce<Record<string, number>>((acc, c) => { acc[c.source_id] = (acc[c.source_id] ?? 0) + 1; return acc }, {})
  const { data: recentChanges } = await supabase.from('changes').select('id, severity, detected_at, sources(name)').order('detected_at', { ascending: false }).limit(5)
  const missingRequired = ENV_VARS.filter(v => v.required && !process.env[v.key])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Health</h1>
          <span className="text-sm mt-1 block">Environment status, source monitoring, and manual trigger controls</span>
        </div>
        <div className="flex items-center gap-2">
          <SeedCorpusButton />
          <TriggerButton label="Run All Sources" />
        </div>
      </div>

      {missingRequired.length > 0 && (
        <div className="p-4 border border-red-300 rounded"><p className="text-sm"><strong>{missingRequired.length} required env var{missingRequired.length !== 1 ? 's' : ''} not set:</strong> {missingRequired.map(v => v.key).join(', ')}</p></div>
      )}

      <div className="border rounded">
        <div className="px-4 pt-4 pb-3"><h2 className="text-xs font-bold uppercase tracking-wide">Environment Variables</h2></div>
        <div className="px-4 pb-4">
          <div className="divide-y">{ENV_VARS.map((v) => <EnvRow key={v.key} keyName={v.key} label={v.label} required={v.required} />)}</div>
        </div>
      </div>

      <div className="border rounded">
        <div className="px-4 pt-4 pb-3"><h2 className="text-xs font-bold uppercase tracking-wide">Sources ({sources?.length ?? 0})</h2></div>
        <div className="p-0">
          <CedarTable surface="nested">
            <thead><tr><th>Source</th><th>Method</th><th>Last Fetched</th><th>Changes</th><th className="text-right">Trigger</th></tr></thead>
            <tbody>
              {(sources ?? []).map((source) => {
                const urls = (source.source_urls ?? []) as Array<{ id: string; last_fetched_at: string | null; last_fetch_method: string | null }>
                const lastFetch = urls.map(u => u.last_fetched_at).filter(Boolean).sort().at(-1) ?? null
                const actualMethod = urls.find(u => u.last_fetch_method)?.last_fetch_method ?? null
                const changes = countBySource[source.id] ?? 0
                return (
                  <tr key={source.id}>
                    <td><div className="flex items-center gap-2"><span className={`w-1.5 h-1.5 rounded-full ${source.is_active ? 'bg-green-500' : 'bg-gray-400'}`} aria-hidden="true" /><span className="text-sm font-medium">{source.name}</span></div></td>
                    <td><span className="inline-flex px-2 py-0.5 text-xs rounded border font-mono">{actualMethod ?? source.fetch_method}</span></td>
                    <td><span className="text-sm"><time dateTime={lastFetch ?? ''}>{timeAgo(lastFetch)}</time></span></td>
                    <td><span className="text-sm">{changes}</span></td>
                    <td className="text-right"><TriggerButton label="Run" sourceId={source.id} /></td>
                  </tr>
                )
              })}
            </tbody>
          </CedarTable>
        </div>
      </div>

      <div className="border rounded">
        <div className="px-4 pt-4 pb-3"><h2 className="text-xs font-bold uppercase tracking-wide">Recent Changes</h2></div>
        <div className="px-4 pb-4">
          {!recentChanges || recentChanges.length === 0 ? (
            <span className="text-sm italic py-4 text-center block">No changes recorded yet</span>
          ) : (
            <div className="flex flex-col gap-3">
              {recentChanges.map((c) => {
                const src = c.sources as { name: string } | null
                return (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex px-2 py-0.5 text-xs rounded">{c.severity ?? 'unknown'}</span>
                      <span className="text-sm">{src?.name ?? '—'}</span>
                    </div>
                    <span className="text-xs"><time dateTime={c.detected_at}>{timeAgo(c.detected_at)}</time></span>
                  </div>
                )
              })}
            </div>
          )}
          <hr className="mt-4 mb-3" />
          <span className="text-xs">Total changes: <strong>{Object.values(countBySource).reduce((a, b) => a + b, 0)}</strong></span>
        </div>
      </div>
    </div>
  )
}
