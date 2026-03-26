import { STATUS_COLOR, STATUS_LABEL } from '@/lib/ui-constants'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = STATUS_LABEL[status] ?? status
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded">
      {label}
    </span>
  )
}
