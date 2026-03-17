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
      const res = await fetch(`/api/changes/${changeId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }
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
      const res = await fetch(`/api/changes/${changeId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }
      setShowRejectDialog(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject')
      setLoading(null)
    }
  }

  if (showRejectDialog) {
    return (
      <div className="flex flex-col gap-2 min-w-[220px]">
        <textarea
          className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
          placeholder="Reason for rejection (optional)"
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          autoFocus
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleReject}
            disabled={loading === 'reject'}
            className="flex-1 text-sm font-medium bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors disabled:opacity-50"
          >
            {loading === 'reject' ? 'Rejecting…' : 'Confirm Reject'}
          </button>
          <button
            onClick={() => { setShowRejectDialog(false); setNotes(''); setError(null) }}
            className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 items-end">
      {error && <p className="text-xs text-red-600 text-right">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={loading !== null}
          className="text-sm font-medium bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded transition-colors disabled:opacity-50"
        >
          {loading === 'approve' ? 'Approving…' : 'Approve'}
        </button>
        <button
          onClick={() => setShowRejectDialog(true)}
          disabled={loading !== null}
          className="text-sm font-medium border border-red-300 text-red-700 hover:bg-red-50 px-4 py-1.5 rounded transition-colors disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  )
}
