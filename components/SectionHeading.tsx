import { Heading } from '@radix-ui/themes'

interface SectionHeadingProps {
  as?: 'h2' | 'h3' | 'h4'
  variant?: 'card' | 'standalone'
  id?: string
  children: React.ReactNode
  mb?: string
}

export function SectionHeading({
  as = 'h2',
  variant = 'card',
  id,
  children,
  mb,
}: SectionHeadingProps) {
  return (
    <Heading as={as} size={variant === 'standalone' ? '4' : '3'} weight="medium" id={id} mb={mb as any}>
      {children}
    </Heading>
  )
}
