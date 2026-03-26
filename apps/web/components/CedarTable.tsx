import type { ReactNode } from 'react'

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
    <table
      className={[
        'cedar-table w-full',
        surface === 'nested' ? 'cedar-table--nested' : 'cedar-table--standalone',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </table>
  )
}
