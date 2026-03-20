import { Badge } from '@radix-ui/themes'
import { STATUS_CLASS, STATUS_LABEL } from '@/lib/ui-constants'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'approved') {
    return (
      <Badge variant="outline" className="gap-1.5 text-[var(--green-11)] border-[var(--green-6)] bg-[var(--green-a3)]">
        <i className="ri-shield-check-line text-xs" />
        Reviewed
      </Badge>
    )
  }
  if (status === 'auto_approved' || status === 'not_required') {
    return (
      <Badge variant="soft" className="gap-1.5">
        <i className="ri-robot-line text-xs" />
        Auto
      </Badge>
    )
  }
  const cls = STATUS_CLASS[status] ?? ''
  const label = STATUS_LABEL[status] ?? status
  return (
    <Badge variant="outline" className={cn(cls)}>
      {label}
    </Badge>
  )
}
