import { SEVERITY_COLOR } from '@/lib/ui-constants'
import { capitalize } from '@/lib/format'

interface SeverityBadgeProps {
  severity: string | null
  className?: string
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const label = severity ? capitalize(severity) : 'Unknown'
  return (
    <span className={`inline-flex px-2 py-0.5 text-xs rounded ${className ?? ''}`}>
      {label}
    </span>
  )
}
