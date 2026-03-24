import type { ReactNode } from 'react'
import { Table } from '@radix-ui/themes'

interface CedarTableProps {
  children: ReactNode
  surface?: 'standalone' | 'nested'
  size?: '1' | '2' | '3'
  className?: string
}

export function CedarTable({
  children,
  surface = 'standalone',
  size = '2',
  className,
}: CedarTableProps) {
  return (
    <Table.Root
      variant={surface === 'nested' ? 'ghost' : 'surface'}
      size={size}
      className={className}
    >
      {children}
    </Table.Root>
  )
}
