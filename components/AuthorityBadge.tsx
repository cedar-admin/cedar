import { Badge } from '@/components/ui/badge'
import { AUTHORITY_LEVEL_LABEL, AUTHORITY_LEVEL_CLASS } from '@/lib/ui-constants'

interface AuthorityBadgeProps {
  level: string | null
  className?: string
}

export function AuthorityBadge({ level, className }: AuthorityBadgeProps) {
  if (!level) return null
  const label = AUTHORITY_LEVEL_LABEL[level] ?? level.replace(/_/g, ' ')
  const cls = AUTHORITY_LEVEL_CLASS[level] ?? 'bg-muted text-muted-foreground border-border'
  return (
    <Badge variant="outline" className={`font-medium ${cls} ${className ?? ''}`}>
      {label}
    </Badge>
  )
}
