import { Badge } from '@radix-ui/themes'
import { SEVERITY_CLASS, SEVERITY_DOT } from '@/lib/ui-constants'
import { capitalize } from '@/lib/format'
import { cn } from '@/lib/utils'

interface SeverityBadgeProps {
  severity: string | null
  className?: string
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const key = severity?.toLowerCase() ?? ''
  const cls = SEVERITY_CLASS[key] ?? 'bg-[var(--gray-a3)] text-[var(--gray-11)] border-[var(--gray-6)]'
  const dot = SEVERITY_DOT[key] ?? 'bg-[var(--gray-9)]'
  const label = severity ? capitalize(severity) : 'Unknown'
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 font-semibold w-[6.5rem] justify-center', cls, className)}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dot)} />
      {label}
    </Badge>
  )
}
