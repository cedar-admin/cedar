import { SidebarLink } from './SidebarLink'
import { SignOutButton } from './SignOutButton'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { UserRole } from '@/lib/layout-data'

const MAIN_NAV = [
  { href: '/home',    label: 'Home',               icon: 'ri-home-4-line' },
  { href: '/changes', label: 'Changes',             icon: 'ri-pulse-line' },
  { href: '/library', label: 'Regulation Library',  icon: 'ri-book-2-line' },
  { href: '/faq',     label: 'FAQ',                 icon: 'ri-question-answer-line' },
  { href: '/sources', label: 'Sources',             icon: 'ri-database-2-line' },
  { href: '/audit',   label: 'Audit Trail',         icon: 'ri-shield-check-line' },
  { href: '/settings',label: 'Settings',            icon: 'ri-settings-3-line' },
]

const ADMIN_NAV = [
  { href: '/reviews', label: 'Review Queue',  icon: 'ri-clipboard-check-line' },
  { href: '/system',  label: 'System Health', icon: 'ri-server-line' },
]

function tierLabel(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

interface SidebarProps {
  user: { email: string; firstName: string | null; lastName: string | null }
  practice: { name: string; tier: string } | null
  role: UserRole
}

export function Sidebar({ user, practice, role }: SidebarProps) {
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName ?? user.email.split('@')[0]

  return (
    <aside className="flex flex-col w-60 shrink-0 h-screen border-r border-sidebar-border bg-sidebar overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 shrink-0 border-b border-sidebar-border">
        <i className="ri-leaf-line text-primary text-lg" />
        <span className="text-base font-semibold tracking-tight text-sidebar-foreground">Cedar</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {MAIN_NAV.map((item) => (
          <SidebarLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
        ))}

        {/* Admin section */}
        {role === 'admin' && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                Admin
              </p>
            </div>
            <Separator className="bg-sidebar-border my-1" />
            {ADMIN_NAV.map((item) => (
              <SidebarLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
            ))}
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 border-t border-sidebar-border">
        {/* Practice info */}
        {practice && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {practice.name}
            </p>
            <Badge
              variant="outline"
              className="mt-1 text-xs border-sidebar-border text-sidebar-foreground/70"
            >
              {tierLabel(practice.tier)}
            </Badge>
          </div>
        )}

        {/* User row */}
        <div className="px-4 py-2.5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary/20 flex items-center justify-center shrink-0">
              <i className="ri-user-line text-primary text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{displayName}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-3 py-2">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </aside>
  )
}
