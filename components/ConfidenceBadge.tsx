import { Badge } from '@/components/ui/badge'

interface ConfidenceBadgeProps {
  confidence: number | null
  className?: string
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  if (confidence == null) return null
  const pct = Math.round(confidence * 100)
  const cls =
    confidence > 0.8
      ? 'text-green-700 border-green-200 dark:text-green-400 dark:border-green-800'
      : confidence > 0.5
        ? 'text-yellow-700 border-yellow-200 dark:text-yellow-400 dark:border-yellow-800'
        : 'text-red-700 border-red-200 dark:text-red-400 dark:border-red-800'
  return (
    <Badge variant="outline" className={`font-medium ${cls} ${className ?? ''}`}>
      {pct}%
    </Badge>
  )
}
