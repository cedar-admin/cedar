'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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
        <i className="ri-file-unknow-line text-3xl text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No content snapshot available</p>
      </div>
    )
  }

  const body = (
    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-sm leading-relaxed">
      {content}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background animate-fade-in overflow-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-3">
          <h2 className="text-base font-semibold text-foreground truncate">{title ?? 'Document'}</h2>
          <Button variant="ghost" size="sm" onClick={() => setFullscreen(false)}>
            <i className="ri-close-line text-lg" />
          </Button>
        </div>
        <div className="mx-auto max-w-4xl px-6 py-6">{body}</div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2"
          onClick={() => setFullscreen(true)}
        >
          <i className="ri-fullscreen-line" />
        </Button>
        <div className="max-h-96 overflow-auto">{body}</div>
      </CardContent>
    </Card>
  )
}
