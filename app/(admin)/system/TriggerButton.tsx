'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Flex, Text } from '@radix-ui/themes'

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
      if (!adminSecret) {
        setState('idle')
        return
      }
      const res = await fetch('/api/admin/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify(sourceId ? { sourceId } : {}),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error ?? `HTTP ${res.status}`)
      }
      setState('done')
      setResult(`Fired ${json.sent} event${json.sent !== 1 ? 's' : ''}: ${json.sources.join(', ')}`)
      router.refresh()
    } catch (err) {
      setState('error')
      setResult(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <Flex align="center" gap="3">
      <Button
        variant={state === 'done' ? 'outline' : 'classic'}
        color="gray"
        highContrast
        size="1"
        type="button"
        onClick={handleTrigger}
        loading={state === 'loading'}
      >
        {state === 'done' ? (
          <><i className="ri-checkbox-circle-line text-[var(--cedar-success-solid)]" aria-hidden="true" /> Triggered</>
        ) : (
          <><i className="ri-play-circle-line" aria-hidden="true" /> {label}</>
        )}
      </Button>
      {result && (
        <Text as="span" size="1" color={state === 'error' ? 'red' : 'gray'}>
          {result}
        </Text>
      )}
    </Flex>
  )
}
