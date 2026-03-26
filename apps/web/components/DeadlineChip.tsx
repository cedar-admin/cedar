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

  if (days < 0) {
    text = 'Passed'
  } else if (days === 0) {
    text = 'Today'
  } else if (days <= 7) {
    text = `${days}d left`
  } else if (days <= 30) {
    text = `${days}d left`
  } else {
    const d = new Date(date!)
    text = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border ${className ?? ''}`}>
      <span aria-hidden="true" />
      {label}: {text}
    </span>
  )
}
