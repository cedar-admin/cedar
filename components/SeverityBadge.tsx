import { Badge } from '@radix-ui/themes'
import { SEVERITY_COLOR } from '@/lib/ui-constants'
import { capitalize } from '@/lib/format'

interface SeverityBadgeProps {
  severity: string | null
  className?: string
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const key = severity?.toLowerCase() ?? ''
  const color = (SEVERITY_COLOR[key] ?? 'gray') as any
  const label = severity ? capitalize(severity) : 'Unknown'
  return (
    <Badge color={color} variant="soft" className={className}>
      {label}
    </Badge>
  )
}
