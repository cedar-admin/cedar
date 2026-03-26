import Link from 'next/link'

const STANDARD_ACTIVE = 'bg-gray-900 text-white border-gray-900'
const INACTIVE = 'bg-white text-gray-600 border-gray-300 hover:border-gray-500 hover:text-gray-900'

interface FilterPill {
  label: string
  href: string
  isActive: boolean
  activeClass?: string
}

interface FilterPillsProps {
  pills: FilterPill[]
}

export function FilterPills({ pills }: FilterPillsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {pills.map((pill) => (
        <Link
          key={pill.href}
          href={pill.href}
          className={`px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${
            pill.isActive ? (pill.activeClass ?? STANDARD_ACTIVE) : INACTIVE
          }`}
        >
          {pill.label}
        </Link>
      ))}
    </div>
  )
}
