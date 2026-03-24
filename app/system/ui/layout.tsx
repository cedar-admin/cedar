import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getLayoutData } from '@/lib/layout-data'
import { LibraryNav } from './_lib/LibraryNav'

export const metadata: Metadata = {
  title: 'UI library — Cedar',
}

export default async function UILibraryLayout({ children }: { children: React.ReactNode }) {
  const { role } = await getLayoutData()
  if (role !== 'admin') redirect('/home')

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--cedar-page-bg)] text-[var(--cedar-text-primary)]">
      {/* Left nav */}
      <aside
        aria-label="UI library navigation"
        className="shrink-0 flex flex-col h-screen border-r border-[var(--cedar-border-subtle)] bg-[var(--cedar-panel-bg)] overflow-y-auto"
        style={{ width: '304px' }}
      >
        {/* Back to platform */}
        <div className="shrink-0 px-4 py-4 border-b border-[var(--cedar-border-subtle)]">
          <Link
            href="/home"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-[15px] leading-5 text-[var(--cedar-text-secondary)] hover:text-[var(--cedar-text-primary)] hover:bg-[var(--cedar-interactive-hover)] transition-colors"
          >
            <i className="ri-arrow-left-line text-base" aria-hidden="true" />
            Back to platform
          </Link>
        </div>

        {/* Library nav */}
        <div className="flex-1 px-4 py-5">
          <LibraryNav />
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1120px] mx-auto px-8 py-10 md:px-10 md:py-12">
          {children}
        </div>
      </main>
    </div>
  )
}
