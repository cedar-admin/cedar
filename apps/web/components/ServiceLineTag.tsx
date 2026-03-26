interface ServiceLineTagProps {
  name: string
  className?: string
}

export function ServiceLineTag({ name, className }: ServiceLineTagProps) {
  return (
    <span className={`inline-flex px-2 py-0.5 text-xs rounded ${className ?? ''}`}>
      {name}
    </span>
  )
}
