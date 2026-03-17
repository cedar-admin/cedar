import Link from 'next/link'

const ADMIN_NAV = [
  { href: '/reviews',      label: 'Review Queue' },
  { href: '/sources',      label: 'Sources' },
  { href: '/intelligence', label: 'Intelligence' },
  { href: '/jobs',         label: 'Jobs' },
  { href: '/costs',        label: 'Costs' },
  { href: '/system',       label: 'System' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white text-lg">Cedar</span>
                <span className="text-xs font-medium bg-amber-500 text-white px-2 py-0.5 rounded">Admin</span>
              </div>
              <div className="flex items-center gap-1">
                {ADMIN_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/changes"
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
