'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button, IconButton, Card, Box, Heading, Text } from '@radix-ui/themes'

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
      <Box className={`flex flex-col items-center justify-center py-12 text-center ${className ?? ''}`}>
        <i className="ri-file-unknow-line text-3xl text-[var(--cedar-text-muted)] mb-2" />
        <Text as="p" size="2" color="gray">No content snapshot available</Text>
      </Box>
    )
  }

  const body = (
    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-sm leading-relaxed">
      {content}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[var(--color-background)] animate-fade-in overflow-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--gray-6)] bg-[var(--color-background)] px-6 py-3">
          <Heading as="h2" size="3" className="truncate">
            {title ?? 'Document'}
          </Heading>
          <IconButton variant="ghost" size="1" onClick={() => setFullscreen(false)}>
            <i className="ri-close-line text-lg" />
          </IconButton>
        </div>
        <div className="mx-auto max-w-4xl px-6 py-6">{body}</div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <Box p="4" className="relative">
        <Button
          variant="ghost"
          size="1"
          className="absolute top-2 right-2"
          onClick={() => setFullscreen(true)}
        >
          <i className="ri-fullscreen-line" />
        </Button>
        <div className="max-h-96 overflow-auto">{body}</div>
      </Box>
    </Card>
  )
}
