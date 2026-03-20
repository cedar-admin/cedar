import { Badge } from '@radix-ui/themes'
import { daysUntil } from '@/lib/format'
import { cn } from '@/lib/utils'

interface DeadlineChipProps {
  date: string | null
  label?: string
  className?: string
}

export function DeadlineChip({ date, label = 'Deadline', className }: DeadlineChipProps) {
  const days = daysUntil(date)
  if (days == null) return null

  let text: string
  let cls: string

  if (days < 0) {
    text = 'Passed'
    cls = 'text-[var(--gray-11)] border-[var(--gray-6)]'
  } else if (days === 0) {
    text = 'Today'
    cls = 'text-[var(--red-11)] border-[var(--red-6)]'
  } else if (days <= 7) {
    text = `${days}d left`
    cls = 'text-[var(--red-11)] border-[var(--red-6)]'
  } else if (days <= 30) {
    text = `${days}d left`
    cls = 'text-[var(--amber-11)] border-[var(--amber-6)]'
  } else {
    const d = new Date(date!)
    text = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    cls = 'text-[var(--gray-11)] border-[var(--gray-6)]'
  }

  return (
    <Badge variant="outline" className={cn('text-xs gap-1', cls, className)}>
      <i className="ri-time-line" />
      {label}: {text}
    </Badge>
  )
}
