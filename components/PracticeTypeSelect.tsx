'use client'

import { useRouter } from 'next/navigation'
import { Select, Flex, Text } from '@radix-ui/themes'

interface PracticeType {
  slug: string
  display_name: string
}

interface Props {
  practiceTypes: PracticeType[]
  selected: string | undefined
}

export function PracticeTypeSelect({ practiceTypes, selected }: Props) {
  const router = useRouter()

  function handleChange(value: string) {
    if (value === 'all') {
      router.push('/library')
    } else {
      router.push(`/library?practice_type=${value}`)
    }
  }

  return (
    <Flex align="center" gap="2">
      <Text as="label" size="2" color="gray" htmlFor="practice-type-select">
        Filter by practice type
      </Text>
      <Select.Root
        value={selected ?? 'all'}
        onValueChange={handleChange}
        size="2"
      >
        <Select.Trigger id="practice-type-select" variant="surface" />
        <Select.Content>
          <Select.Item value="all">All</Select.Item>
          {practiceTypes.map((pt) => (
            <Select.Item key={pt.slug} value={pt.slug}>
              {pt.display_name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Flex>
  )
}
