'use client'

import { useState } from 'react'
import { Flex, IconButton, Tooltip } from '@radix-ui/themes'

interface HashWithCopyProps {
  hash: string
  displayLength?: number
}

export function HashWithCopy({ hash, displayLength = 8 }: HashWithCopyProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(hash).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {
      // Clipboard API unavailable — fail silently
    })
  }

  return (
    <Flex align="center" gap="1">
      <span className="font-mono text-xs text-[var(--cedar-text-secondary)]">
        {hash.slice(0, displayLength)}&hellip;
      </span>
      <Tooltip content="Copy hash">
        <IconButton
          variant="ghost"
          color="gray"
          size="1"
          aria-label="Copy full hash"
          onClick={handleCopy}
        >
          <i
            className={`text-xs ${copied ? 'ri-check-line' : 'ri-file-copy-line'}`}
            aria-hidden="true"
          />
        </IconButton>
      </Tooltip>
    </Flex>
  )
}
