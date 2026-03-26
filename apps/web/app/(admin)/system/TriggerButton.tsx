'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TriggerButtonProps {
  label: string
  sourceId?: string
}

export default function TriggerButton({ label, sourceId }: TriggerButtonProps) {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<string | null>(null)

  async function handleTrigger() {
    setState('loading')
    setResult(null)
    try {
      const adminSecret = prompt('Enter ADMIN_SECRET:')
      if (!adminSecret) { setState('idle'); return }
      const res = await fetch('/api/admin/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
        body: JSON.stringify(sourceId ? { sourceId } : {}),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      setState('done')
      setResult(`Fired ${json.sent} event${json.sent !== 1 ? 's' : ''}: ${json.sources.join(', ')}`)
      router.refresh()
    } catch (err) {
      setState('error')
      setResult(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={handleTrigger} disabled={state === 'loading'} className="px-3 py-1 text-sm border rounded">
        {state === 'done' ? 'Triggered' : state === 'loading' ? 'Running…' : label}
      </button>
      {result && <span className={`text-xs ${state === 'error' ? 'text-red-600' : ''}`}>{result}</span>}
    </div>
  )
}
