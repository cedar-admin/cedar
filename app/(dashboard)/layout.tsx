import Link from 'next/link'
import { withAuth } from '@workos-inc/authkit-nextjs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const NAV_ITEMS = [
  { href: '/changes', label: 'Changes' },
  { href: '/sources', label: 'Sources' },
  { href: '/audit', label: 'Audit Trail' },
  { href: '/settings', label: 'Settings' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await withAuth({ ensureSignedIn: true })

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Left: logo + nav */}
            <div className="flex items-center gap-6">
              <Link href="/changes" className="flex items-center gap-2 shrink-0">
                <i className="ri-leaf-line text-primary text-base" />
                <span className="text-sm font-semibold tracking-tight text-foreground">Cedar</span>
              </Link>

              <Separator orientation="vertical" className="h-4" />

              <nav className="flex items-center gap-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right: jurisdiction */}
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs font-medium gap-1">
                <i className="ri-map-pin-2-line text-primary" />
                FL
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
