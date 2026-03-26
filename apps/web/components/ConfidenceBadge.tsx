interface ConfidenceBadgeProps {
  confidence: number | null
  className?: string
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  if (confidence == null) return null
  const pct = Math.round(confidence * 100)
  return (
    <span className={`inline-flex px-2 py-0.5 text-xs rounded border ${className ?? ''}`}>
      {pct}%
    </span>
  )
}
