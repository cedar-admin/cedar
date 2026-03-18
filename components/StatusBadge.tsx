import { Badge } from '@/components/ui/badge'
import { STATUS_CLASS, STATUS_LABEL } from '@/lib/ui-constants'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'approved') {
    return (
      <Badge variant="outline" className="gap-1.5 text-green-700 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950">
        <i className="ri-shield-check-line text-xs" />
        Reviewed
      </Badge>
    )
  }
  if (status === 'auto_approved' || status === 'not_required') {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <i className="ri-robot-line text-xs" />
        Auto
      </Badge>
    )
  }
  const cls = STATUS_CLASS[status] ?? ''
  const label = STATUS_LABEL[status] ?? status
  return (
    <Badge variant="outline" className={cls}>
      {label}
    </Badge>
  )
}
