import { Badge } from '@radix-ui/themes'
import { cn } from '@/lib/utils'

interface ServiceLineTagProps {
  name: string
  className?: string
}

export function ServiceLineTag({ name, className }: ServiceLineTagProps) {
  return (
    <Badge variant="soft" className={cn('text-xs', className)}>
      {name}
    </Badge>
  )
}
