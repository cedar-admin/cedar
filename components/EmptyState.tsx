import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <i className={`${icon} text-4xl text-muted-foreground/40 mb-3`} />
        <h2 className="text-base font-semibold text-foreground mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      </CardContent>
    </Card>
  )
}
