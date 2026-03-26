interface EmptyStateProps {
  icon: string
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-9 text-center">
      <span className="text-4xl mb-3" aria-hidden="true" />
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <span className="text-sm max-w-sm">{description}</span>
    </div>
  )
}
