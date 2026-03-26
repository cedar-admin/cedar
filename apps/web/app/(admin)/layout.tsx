import { getLayoutData } from '@/lib/layout-data'
import { SidebarShell } from '@/components/SidebarShell'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, practice, role } = await getLayoutData()

  if (role !== 'admin') {
    redirect('/home')
  }

  return (
    <SidebarShell user={user} practice={practice} role={role}>
      {children}
    </SidebarShell>
  )
}
