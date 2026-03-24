import { Box, Flex, Text } from '@radix-ui/themes'

type PreviewSize = 'inline' | 'contained' | 'full-width'

interface PreviewFrameProps {
  size?: PreviewSize
  label?: string
  children: React.ReactNode
}

export function PreviewFrame({ size = 'contained', label, children }: PreviewFrameProps) {
  return (
    <Flex direction="column" gap="2">
      {label && (
        <Text as="p" size="1" color="gray">
          {label}
        </Text>
      )}
      <Box
        className="border border-[var(--cedar-border-subtle)] rounded-lg p-4 bg-[var(--cedar-page-bg)]"
      >
        {size === 'inline' ? (
          <Flex wrap="wrap" gap="3" align="center">
            {children}
          </Flex>
        ) : size === 'contained' ? (
          <Box className="max-w-md">
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
