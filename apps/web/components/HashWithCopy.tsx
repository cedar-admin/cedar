'use client'

import { useState } from 'react'

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
    <div className="flex items-center gap-1">
      <span className="font-mono text-xs">
        {hash.slice(0, displayLength)}&hellip;
      </span>
      <button
        type="button"
        aria-label="Copy full hash"
        onClick={handleCopy}
        className="text-xs"
      >
        {copied ? '✓' : 'Copy'}
      </button>
    </div>
  )
}
