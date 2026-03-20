import { Badge } from '@radix-ui/themes'
import { AUTHORITY_LEVEL_LABEL, AUTHORITY_LEVEL_CLASS } from '@/lib/ui-constants'
import { cn } from '@/lib/utils'

interface AuthorityBadgeProps {
  level: string | null
  className?: string
}

export function AuthorityBadge({ level, className }: AuthorityBadgeProps) {
  if (!level) return null
  const label = AUTHORITY_LEVEL_LABEL[level] ?? level.replace(/_/g, ' ')
  const cls = AUTHORITY_LEVEL_CLASS[level] ?? 'bg-[var(--gray-a3)] text-[var(--gray-11)] border-[var(--gray-6)]'
  return (
    <Badge variant="outline" className={cn('font-medium', cls, className)}>
      {label}
    </Badge>
  )
}
