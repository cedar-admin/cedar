import { Card, Flex, Text, Heading } from '@radix-ui/themes'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Card>
      <Flex direction="column" align="center" justify="center" py="9" className="text-center">
        <i className={`${icon} text-4xl text-[var(--gray-9)] mb-3`} />
        <Heading size="3" mb="1">{title}</Heading>
        <Text size="2" color="gray" className="max-w-sm">{description}</Text>
      </Flex>
    </Card>
  )
}
