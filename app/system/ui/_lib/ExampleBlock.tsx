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
    <Flex direction="column" gap="3">
      <PreviewFrame size={size} label={title}>
        {children}
      </PreviewFrame>
      {code && (
        <details className="rounded-xl border border-[var(--cedar-border-subtle)] bg-[var(--cedar-panel-bg)]">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
            <Flex align="center" gap="2">
              <i className="ri-code-line text-sm text-[var(--cedar-text-muted)]" aria-hidden="true" />
              <Text as="span" size="2" weight="medium">
                Implementation
              </Text>
            </Flex>
            <Text as="span" size="1" color="gray">
              Expand code
            </Text>
          </summary>
          <Box className="border-t border-[var(--cedar-border-subtle)] px-4 py-4">
            <pre className="overflow-x-auto text-sm leading-7 text-[var(--cedar-text-secondary)]">
              <code>{code}</code>
            </pre>
          </Box>
        </details>
      )}
    </Flex>
  )
}
