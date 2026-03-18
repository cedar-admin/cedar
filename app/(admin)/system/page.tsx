import { createServerClient } from '../../../lib/db/client'
import TriggerButton from './TriggerButton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { SEVERITY_CLASS } from '@/lib/ui-constants'
import { timeAgo } from '@/lib/format'

// ── Env var check ────────────────────────────────────────────────────────────

const ENV_VARS = [
  { key: 'ANTHROPIC_API_KEY',    label: 'Anthropic API',    required: true  },
  { key: 'RESEND_API_KEY',       label: 'Resend Email',     required: true  },
  { key: 'INNGEST_SIGNING_KEY',  label: 'Inngest Signing',  required: true  },
  { key: 'INNGEST_EVENT_KEY',    label: 'Inngest Events',   required: true  },
  { key: 'OXYLABS_USERNAME',     label: 'Oxylabs Username', required: false },
  { key: 'OXYLABS_PASSWORD',     label: 'Oxylabs Password', required: false },
  { key: 'BROWSERBASE_API_KEY',  label: 'BrowserBase',      required: false },
  { key: 'ADMIN_SECRET',         label: 'Admin Secret',     required: true  },
]

function EnvRow({ keyName, label, required }: { keyName: string; label: string; required: boolean }) {
  const isSet = !!process.env[keyName]
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-foreground">{keyName}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
        {required && !isSet && (
          <Badge variant="outline" className="text-xs text-destructive border-destructive/30 bg-destructive/5">
            Required
          </Badge>
        )}
      </div>
      {isSet ? (
        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
          <i className="ri-checkbox-circle-fill" /> Set
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <i className="ri-close-circle-line" /> Not set
        </span>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic'

export default async function SystemPage() {
  const supabase = createServerClient()

  // Source status
  const { data: sources } = await supabase
    .from('sources')
    .select(`
      id,
      name,
      fetch_method,
      is_active,
      source_urls (
        id,
        last_fetched_at,
        last_fetch_method
      )
    `)
    .order('name')

  // Change counts per source
  const { data: changeCounts } = await supabase
    .from('changes')
    .select('source_id')

  const countBySource = (changeCounts ?? []).reduce<Record<string, number>>((acc, c) => {
    acc[c.source_id] = (acc[c.source_id] ?? 0) + 1
    return acc
  }, {})

  // Recent changes
  const { data: recentChanges } = await supabase
    .from('changes')
    .select('id, severity, detected_at, sources(name)')
    .order('detected_at', { ascending: false })
    .limit(5)

  // Check required env vars
  const missingRequired = ENV_VARS.filter(v => v.required && !process.env[v.key])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">System Health</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Environment status, source monitoring, and manual trigger controls
          </p>
        </div>
        <TriggerButton label="Run All Sources" />
      </div>

      {missingRequired.length > 0 && (
        <Alert variant="destructive">
          <i className="ri-error-warning-line text-base" />
          <AlertDescription>
            <strong>{missingRequired.length} required env var{missingRequired.length !== 1 ? 's' : ''} not set:</strong>{' '}
            {missingRequired.map(v => v.key).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Environment Variables */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Environment Variables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {ENV_VARS.map((v) => (
              <EnvRow key={v.key} keyName={v.key} label={v.label} required={v.required} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sources */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Sources ({sources?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Last Fetched</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead className="text-right">Trigger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(sources ?? []).map((source) => {
                const urls = (source.source_urls ?? []) as Array<{
                  id: string
                  last_fetched_at: string | null
                  last_fetch_method: string | null
                }>
                const lastFetch = urls
                  .map(u => u.last_fetched_at)
                  .filter(Boolean)
                  .sort()
                  .at(-1) ?? null
                const actualMethod = urls.find(u => u.last_fetch_method)?.last_fetch_method ?? null
                const changes = countBySource[source.id] ?? 0

                return (
                  <TableRow key={source.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${source.is_active ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
                        <span className="text-sm font-medium text-foreground">{source.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-mono">
                        {actualMethod ?? source.fetch_method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {timeAgo(lastFetch)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {changes}
                    </TableCell>
                    <TableCell className="text-right">
                      <TriggerButton label="Run" sourceId={source.id} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Changes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Recent Changes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!recentChanges || recentChanges.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4 text-center">
              No changes recorded yet
            </p>
          ) : (
            <div className="space-y-3">
              {recentChanges.map((c) => {
                const src = c.sources as { name: string } | null
                const cls = SEVERITY_CLASS[c.severity ?? ''] ?? ''
                return (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`text-xs ${cls}`}>
                        {c.severity ?? 'unknown'}
                      </Badge>
                      <span className="text-sm text-foreground">{src?.name ?? '—'}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(c.detected_at)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          <Separator className="mt-4 mb-3" />
          <p className="text-xs text-muted-foreground">
            Total changes: <strong>{Object.values(countBySource).reduce((a, b) => a + b, 0)}</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
