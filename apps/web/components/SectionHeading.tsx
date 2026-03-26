interface SectionHeadingProps {
  as?: 'h2' | 'h3' | 'h4'
  variant?: 'card' | 'standalone'
  id?: string
  children: React.ReactNode
  mb?: string
}

export function SectionHeading({
  as: Tag = 'h2',
  variant = 'card',
  id,
  children,
}: SectionHeadingProps) {
  return (
    <Tag id={id} className={variant === 'standalone' ? 'text-lg font-medium' : 'text-base font-medium'}>
      {children}
    </Tag>
  )
}
