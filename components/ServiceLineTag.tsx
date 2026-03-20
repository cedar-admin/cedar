import { Badge } from '@/components/ui/badge'

interface ServiceLineTagProps {
  name: string
  className?: string
}

export function ServiceLineTag({ name, className }: ServiceLineTagProps) {
  return (
    <Badge variant="secondary" className={`text-xs ${className ?? ''}`}>
      {name}
    </Badge>
  )
}
