import { Badge } from '@radix-ui/themes'
import { cn } from '@/lib/utils'

interface ConfidenceBadgeProps {
  confidence: number | null
  className?: string
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  if (confidence == null) return null
  const pct = Math.round(confidence * 100)
  const cls =
    confidence > 0.8
      ? 'text-[var(--green-11)] border-[var(--green-6)]'
      : confidence > 0.5
        ? 'text-[var(--amber-11)] border-[var(--amber-6)]'
        : 'text-[var(--red-11)] border-[var(--red-6)]'
  return (
    <Badge variant="outline" className={cn('font-medium', cls, className)}>
      {pct}%
    </Badge>
  )
}
