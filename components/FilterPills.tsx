import Link from 'next/link'

const STANDARD_ACTIVE = 'bg-[var(--cedar-filter-active-bg)] text-[var(--cedar-filter-active-text)] border-[var(--cedar-filter-active-border)]'
const INACTIVE = 'bg-[var(--cedar-page-bg)] text-[var(--cedar-text-secondary)] border-[var(--cedar-border)] hover:border-[var(--cedar-border-strong)] hover:text-[var(--cedar-text-primary)]'

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
