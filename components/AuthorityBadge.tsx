import { Badge } from '@radix-ui/themes'
import { AUTHORITY_LEVEL_LABEL, AUTHORITY_LEVEL_COLOR } from '@/lib/ui-constants'

interface AuthorityBadgeProps {
  level: string | null
  className?: string
}

export function AuthorityBadge({ level, className }: AuthorityBadgeProps) {
  if (!level) return null
  const label = AUTHORITY_LEVEL_LABEL[level] ?? level.replace(/_/g, ' ')
  const color = (AUTHORITY_LEVEL_COLOR[level] ?? 'gray') as any
  return (
    <Badge color={color} variant="outline" className={className}>
      {label}
    </Badge>
  )
}
