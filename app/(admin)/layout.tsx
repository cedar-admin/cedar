import { getLayoutData } from '@/lib/layout-data'
import { Sidebar } from '@/components/Sidebar'
import { BreadcrumbNav } from '@/components/BreadcrumbNav'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, practice, role } = await getLayoutData()

  if (role !== 'admin') {
    redirect('/home')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar user={user} practice={practice} role={role} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <BreadcrumbNav />
          {children}
        </div>
      </main>
    </div>
  )
}
