'use client'

import { useRouter } from 'next/navigation'

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
    <div className="flex items-center gap-2">
      <label htmlFor="practice-type-select" className="text-sm">
        Filter by practice type
      </label>
      <select
        id="practice-type-select"
        className="border rounded px-2 py-1 text-sm"
        value={selected ?? 'all'}
        onChange={(e) => handleChange(e.target.value)}
      >
        <option value="all">All</option>
        {practiceTypes.map((pt) => (
          <option key={pt.slug} value={pt.slug}>
            {pt.display_name}
          </option>
        ))}
      </select>
    </div>
  )
}
