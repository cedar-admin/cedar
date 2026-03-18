import { Badge } from '@/components/ui/badge'
import { SEVERITY_CLASS, SEVERITY_DOT } from '@/lib/ui-constants'
import { capitalize } from '@/lib/format'

interface SeverityBadgeProps {
  severity: string | null
  className?: string
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const key = severity?.toLowerCase() ?? ''
  const cls = SEVERITY_CLASS[key] ?? 'bg-muted text-muted-foreground border-border'
  const dot = SEVERITY_DOT[key] ?? 'bg-muted-foreground/50'
  const label = severity ? capitalize(severity) : 'Unknown'
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 font-semibold w-[6.5rem] justify-center ${cls} ${className ?? ''}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {label}
    </Badge>
  )
}
