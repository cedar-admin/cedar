import type { Metadata } from 'next'
import { LibraryNav } from './_lib/LibraryNav'

export const metadata: Metadata = {
  title: 'UI library — Cedar Admin',
}

export default function UILibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-8 min-h-full">
      {/* Left nav */}
      <aside
        className="shrink-0 border-r border-[var(--cedar-border-subtle)] pr-6 overflow-y-auto"
        style={{ width: '220px' }}
      >
        <div className="sticky top-0">
          <LibraryNav />
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 py-1">
        {children}
      </main>
    </div>
  )
}
