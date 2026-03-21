'use client'

import { useState } from 'react'
import { Button, Flex, Text } from '@radix-ui/themes'

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
    <Flex align="center" gap="3">
      <Button
        variant={state === 'done' ? 'outline' : 'classic'}
        color="gray"
        highContrast
        size="1"
        type="button"
        onClick={handleSeed}
        loading={state === 'loading'}
      >
        {state === 'done' ? (
          <><i className="ri-checkbox-circle-line text-[var(--cedar-success-solid)]" aria-hidden="true" /> Queued</>
        ) : (
          <><i className="ri-database-2-line" aria-hidden="true" /> Seed Corpus</>
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
