import type { ReactNode } from 'react'
import { Box, Flex, Text } from '@radix-ui/themes'
import { PreviewFrame } from './PreviewFrame'

type PreviewSize = 'inline' | 'contained' | 'full-width'

interface ExampleBlockProps {
  title: string
  size?: PreviewSize
  code?: string
  children: ReactNode
}

export function ExampleBlock({ title, size = 'contained', code, children }: ExampleBlockProps) {
  return (
    <Flex direction="column" gap="2">
      <PreviewFrame size={size} label={title}>
        {children}
      </PreviewFrame>
      {code && (
        <Box className="rounded-lg border border-[var(--cedar-border-subtle)] bg-[var(--cedar-panel-bg)] p-4">
          <Text as="p" size="1" weight="medium" className="uppercase tracking-wide text-[var(--cedar-text-muted)]">
            Implementation
          </Text>
          <pre className="mt-2 overflow-x-auto text-xs leading-6 text-[var(--cedar-text-secondary)]">
            <code>{code}</code>
          </pre>
        </Box>
      )}
    </Flex>
  )
}
