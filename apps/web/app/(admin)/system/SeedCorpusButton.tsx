'use client'

import { useState } from 'react'

export default function SeedCorpusButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<string | null>(null)

  async function handleSeed() {
    setState('loading')
    setResult(null)
    try {
      const adminSecret = prompt('Enter ADMIN_SECRET:')
      if (!adminSecret) { setState('idle'); return }
      const res = await fetch('/api/admin/corpus-seed', { method: 'POST', headers: { 'x-admin-secret': adminSecret } })
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
      <button type="button" onClick={handleSeed} disabled={state === 'loading'} className="px-3 py-1 text-sm border rounded">
        {state === 'done' ? 'Queued' : state === 'loading' ? 'Seeding…' : 'Seed Corpus'}
      </button>
      {result && <span className={`text-xs ${state === 'error' ? 'text-red-600' : ''}`}>{result}</span>}
    </div>
  )
}
