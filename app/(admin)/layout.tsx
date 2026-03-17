import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

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
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-foreground text-lg">Cedar</span>
                <Badge variant="default" className="text-xs">Admin</Badge>
              </div>
              <div className="flex items-center gap-1">
                {ADMIN_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/changes"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <i className="ri-arrow-left-line" />
              Dashboard
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
