import { Flex, Text, Heading } from '@radix-ui/themes'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Flex direction="column" align="center" justify="center" py="9" className="text-center">
      <i className={`${icon} text-4xl text-[var(--cedar-text-muted)] mb-3`} />
      <Heading as="h3" size="3" mb="1">{title}</Heading>
      <Text as="span" size="2" color="gray" className="max-w-sm">{description}</Text>
    </Flex>
  )
}
