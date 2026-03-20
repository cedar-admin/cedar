import { Badge } from '@/components/ui/badge'
import { daysUntil } from '@/lib/format'

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
    cls = 'text-muted-foreground border-border'
  } else if (days === 0) {
    text = 'Today'
    cls = 'text-red-700 border-red-200 dark:text-red-400 dark:border-red-800'
  } else if (days <= 7) {
    text = `${days}d left`
    cls = 'text-red-700 border-red-200 dark:text-red-400 dark:border-red-800'
  } else if (days <= 30) {
    text = `${days}d left`
    cls = 'text-yellow-700 border-yellow-200 dark:text-yellow-400 dark:border-yellow-800'
  } else {
    const d = new Date(date!)
    text = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    cls = 'text-muted-foreground border-border'
  }

  return (
    <Badge variant="outline" className={`text-xs gap-1 ${cls} ${className ?? ''}`}>
      <i className="ri-time-line" />
      {label}: {text}
    </Badge>
  )
}
