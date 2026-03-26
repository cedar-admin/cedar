'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ReviewActionsProps {
  changeId: string
  sourceName: string
}

export default function ReviewActions({ changeId, sourceName }: ReviewActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleApprove() {
    setLoading('approve')
    setError(null)
    try {
      const res = await fetch(`/api/changes/${changeId}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes }) })
      if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body.error ?? `HTTP ${res.status}`) }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve')
      setLoading(null)
    }
  }

  async function handleReject() {
    setLoading('reject')
    setError(null)
    try {
      const res = await fetch(`/api/changes/${changeId}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes }) })
      if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body.error ?? `HTTP ${res.status}`) }
      setShowRejectDialog(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject')
      setLoading(null)
    }
  }

  if (showRejectDialog) {
    return (
      <div className="flex flex-col gap-2 min-w-56">
        <textarea placeholder="Reason for rejection (optional)" rows={2} value={notes} onChange={e => setNotes(e.target.value)} autoFocus className="resize-none border rounded px-3 py-2 text-sm" />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button type="button" disabled={loading === 'reject'} onClick={handleReject} className="flex-1 px-3 py-1 text-sm bg-red-600 text-white rounded">{loading === 'reject' ? 'Rejecting…' : 'Confirm Reject'}</button>
          <button type="button" onClick={() => { setShowRejectDialog(false); setNotes(''); setError(null) }} className="px-3 py-1 text-sm">Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 items-end">
      {error && <p className="text-xs text-red-600 text-right">{error}</p>}
      <div className="flex gap-2">
        <button type="button" disabled={loading !== null && loading !== 'approve'} onClick={handleApprove} className="px-3 py-1 text-sm border rounded font-medium">{loading === 'approve' ? 'Approving…' : 'Approve'}</button>
        <button type="button" disabled={loading !== null} onClick={() => setShowRejectDialog(true)} className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded">Reject</button>
      </div>
    </div>
  )
}
