import Link from 'next/link'
import { Button, Flex, Box, Text, Card } from '@radix-ui/themes'

interface UpgradeBannerProps {
  feature: string
}

export function UpgradeBanner({ feature }: UpgradeBannerProps) {
  return (
    <Box mb="6">
      <Card>
        <Flex align="center" gap="4" p="4">
          <Flex
            align="center"
            justify="center"
            className="w-9 h-9 bg-[var(--cedar-accent-bg)] shrink-0"
            style={{ borderRadius: 'var(--radius-2)' }}
          >
            <i className="ri-lock-2-line text-[var(--cedar-accent-text)] text-lg" aria-hidden="true" />
          </Flex>
          <Box className="flex-1 min-w-0">
            <Text size="2" weight="medium">
              {feature} is available on the Intelligence plan.
            </Text>
            <Text size="1" color="gray" as="p" mt="1">
              Upgrade to unlock AI-powered regulatory Q&amp;A, curated summaries, and more.
            </Text>
          </Box>
          <Button size="1" asChild className="shrink-0">
            <Link href="/settings#billing">
              Upgrade to Intelligence
              <i className="ri-arrow-right-line" />
            </Link>
          </Button>
        </Flex>
      </Card>

      <div className="relative mt-4 overflow-hidden pointer-events-none select-none">
        <div className="opacity-30 blur-sm space-y-3">
          {[80, 60, 70, 50, 65].map((w, i) => (
            <div key={i} className="h-10 bg-[var(--cedar-interactive-hover)] border border-[var(--cedar-border-subtle)]" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--cedar-page-bg)]/70 to-[var(--cedar-page-bg)]" />
      </div>
    </Box>
  )
}
