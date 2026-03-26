'use client'

import { useState, useCallback, useEffect } from 'react'

interface ContentReaderProps {
  content: string | null
  title?: string
  className?: string
}

export function ContentReader({ content, title, className }: ContentReaderProps) {
  const [fullscreen, setFullscreen] = useState(false)

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setFullscreen(false)
  }, [])

  useEffect(() => {
    if (fullscreen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [fullscreen, handleEscape])

  if (!content) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 text-center ${className ?? ''}`}>
        <span className="text-3xl mb-2" aria-hidden="true" />
        <p className="text-sm">No content snapshot available</p>
      </div>
    )
  }

  const body = (
    <div className="prose prose-sm max-w-none whitespace-pre-wrap font-mono text-sm leading-relaxed">
      {content}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white animate-fade-in overflow-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-3">
          <h2 className="text-base font-semibold truncate">
            {title ?? 'Document'}
          </h2>
          <button type="button" onClick={() => setFullscreen(false)} className="text-lg">
            X
          </button>
        </div>
        <div className="mx-auto max-w-4xl px-6 py-6">{body}</div>
      </div>
    )
  }

  return (
    <div className={`border rounded ${className ?? ''}`}>
      <div className="p-4 relative">
        <button
          type="button"
          className="absolute top-2 right-2 text-sm"
          onClick={() => setFullscreen(true)}
        >
          Fullscreen
        </button>
        <div className="max-h-96 overflow-auto">{body}</div>
      </div>
    </div>
  )
}
