import { Badge } from '@radix-ui/themes'
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
  let color: 'red' | 'amber' | 'gray'

  if (days < 0) {
    text = 'Passed'
    color = 'gray'
  } else if (days === 0) {
    text = 'Today'
    color = 'red'
  } else if (days <= 7) {
    text = `${days}d left`
    color = 'red'
  } else if (days <= 30) {
    text = `${days}d left`
    color = 'amber'
  } else {
    const d = new Date(date!)
    text = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    color = 'gray'
  }

  return (
    <Badge color={color} variant="outline" className={`text-xs gap-1 ${className ?? ''}`}>
      <i className="ri-time-line" />
      {label}: {text}
    </Badge>
  )
}
