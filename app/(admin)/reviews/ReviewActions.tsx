'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, TextArea, Flex } from '@radix-ui/themes'

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
      <Flex direction="column" gap="2" className="min-w-56">
        <TextArea
          placeholder="Reason for rejection (optional)"
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          autoFocus
          className="resize-none"
        />
        {error && (
          <p className="text-xs text-[var(--red-9)]">{error}</p>
        )}
        <Flex gap="2">
          <Button
            color="red"
            size="1"
            onClick={handleReject}
            disabled={loading === 'reject'}
            className="flex-1"
          >
            {loading === 'reject' ? 'Rejecting…' : 'Confirm Reject'}
          </Button>
          <Button
            variant="ghost"
            size="1"
            onClick={() => { setShowRejectDialog(false); setNotes(''); setError(null) }}
          >
            Cancel
          </Button>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap="2" align="end">
      {error && (
        <p className="text-xs text-[var(--red-9)] text-right">{error}</p>
      )}
      <Flex gap="2">
        <Button
          variant="solid"
          size="1"
          onClick={handleApprove}
          disabled={loading !== null}
        >
          {loading === 'approve' ? 'Approving…' : 'Approve'}
        </Button>
        <Button
          variant="outline"
          size="1"
          onClick={() => setShowRejectDialog(true)}
          disabled={loading !== null}
          className="text-[var(--red-9)] border-[var(--red-6)] hover:bg-[var(--red-a3)] hover:text-[var(--red-9)]"
        >
          Reject
        </Button>
      </Flex>
    </Flex>
  )
}
