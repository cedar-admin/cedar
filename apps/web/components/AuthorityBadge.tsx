import { AUTHORITY_LEVEL_LABEL, AUTHORITY_LEVEL_COLOR } from '@/lib/ui-constants'

interface AuthorityBadgeProps {
  level: string | null
  className?: string
}

export function AuthorityBadge({ level, className }: AuthorityBadgeProps) {
  if (!level) return null
  const label = AUTHORITY_LEVEL_LABEL[level] ?? level.replace(/_/g, ' ')
  return (
    <span className={`inline-flex px-2 py-0.5 text-xs rounded border ${className ?? ''}`}>
      {label}
    </span>
  )
}
