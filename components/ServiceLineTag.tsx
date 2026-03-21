import { Badge } from '@radix-ui/themes'

interface ServiceLineTagProps {
  name: string
  className?: string
}

export function ServiceLineTag({ name, className }: ServiceLineTagProps) {
  return (
    <Badge color="gray" variant="soft" className={`text-xs ${className ?? ''}`}>
      {name}
    </Badge>
  )
}
