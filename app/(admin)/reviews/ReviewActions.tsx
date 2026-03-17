'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

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
        <Textarea
          placeholder="Reason for rejection (optional)"
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          autoFocus
          className="resize-none"
        />
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleReject}
            disabled={loading === 'reject'}
            className="flex-1"
          >
            {loading === 'reject' ? 'Rejecting…' : 'Confirm Reject'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setShowRejectDialog(false); setNotes(''); setError(null) }}
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 items-end">
      {error && (
        <p className="text-xs text-destructive text-right">{error}</p>
      )}
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={handleApprove}
          disabled={loading !== null}
        >
          {loading === 'approve' ? 'Approving…' : 'Approve'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRejectDialog(true)}
          disabled={loading !== null}
          className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        >
          Reject
        </Button>
      </div>
    </div>
  )
}
