import { getLayoutData } from '@/lib/layout-data'
import { SidebarShell } from '@/components/SidebarShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, practice, role } = await getLayoutData()

  return (
    <SidebarShell user={user} practice={practice} role={role}>
      {children}
    </SidebarShell>
  )
}
