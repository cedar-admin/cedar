import { Badge } from '@radix-ui/themes'

interface ConfidenceBadgeProps {
  confidence: number | null
  className?: string
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  if (confidence == null) return null
  const pct = Math.round(confidence * 100)
  const color: 'green' | 'amber' | 'red' =
    confidence > 0.8 ? 'green' : confidence > 0.5 ? 'amber' : 'red'
  return (
    <Badge color={color} variant="outline" className={className}>
      {pct}%
    </Badge>
  )
}
