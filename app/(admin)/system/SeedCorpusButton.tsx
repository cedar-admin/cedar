'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function SeedCorpusButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<string | null>(null)

  async function handleSeed() {
    setState('loading')
    setResult(null)
    try {
      const adminSecret = prompt('Enter ADMIN_SECRET:')
      if (!adminSecret) {
        setState('idle')
        return
      }
      const res = await fetch('/api/admin/corpus-seed', {
        method: 'POST',
        headers: { 'x-admin-secret': adminSecret },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      setState('done')
      setResult('Corpus seed queued — monitor in Inngest dashboard')
    } catch (err) {
      setState('error')
      setResult(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={state === 'done' ? 'outline' : 'secondary'}
        size="sm"
        onClick={handleSeed}
        disabled={state === 'loading'}
      >
        {state === 'loading' ? (
          <><i className="ri-loader-4-line animate-spin" /> Queuing…</>
        ) : state === 'done' ? (
          <><i className="ri-checkbox-circle-line text-green-500" /> Queued</>
        ) : (
          <><i className="ri-database-2-line" /> Seed Corpus</>
        )}
      </Button>
      {result && (
        <span className={`text-xs ${state === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>
          {result}
        </span>
      )}
    </div>
  )
}
