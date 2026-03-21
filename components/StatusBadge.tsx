import { Badge } from '@radix-ui/themes'
import { STATUS_COLOR, STATUS_LABEL } from '@/lib/ui-constants'

const STATUS_ICON: Record<string, string | undefined> = {
  approved:       'ri-shield-check-line',
  auto_approved:  'ri-robot-line',
  pending:        'ri-time-line',
  pending_review: 'ri-time-line',
  rejected:       'ri-close-circle-line',
  not_required:   'ri-robot-line',
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = (STATUS_COLOR[status] ?? 'gray') as any
  const label = STATUS_LABEL[status] ?? status
  const icon = STATUS_ICON[status]
  return (
    <Badge color={color} variant="soft" className="gap-1.5">
      {icon && <i className={`${icon} text-xs`} />}
      {label}
    </Badge>
  )
}
