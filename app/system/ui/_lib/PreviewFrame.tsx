import type { ReactNode } from 'react'
import { Box, Flex, Text } from '@radix-ui/themes'

type PreviewSize = 'inline' | 'contained' | 'full-width'

interface PreviewFrameProps {
  size?: PreviewSize
  label?: string
  children: ReactNode
}

export function PreviewFrame({ size = 'contained', label, children }: PreviewFrameProps) {
  return (
    <Flex direction="column" gap="3">
      {label && (
        <Text as="p" size="2" weight="medium" color="gray">
          {label}
        </Text>
      )}
      <Box
        className="rounded-xl border border-[var(--cedar-border-subtle)] bg-[var(--cedar-panel-bg)] p-6"
      >
        {size === 'inline' ? (
          <Flex wrap="wrap" gap="4" align="center">
            {children}
          </Flex>
        ) : size === 'contained' ? (
          <Box className="max-w-lg">
            {children}
          </Box>
        ) : (
          <Box className="w-full">
            {children}
          </Box>
        )}
      </Box>
    </Flex>
  )
}
