import { redirect } from 'next/navigation'

export const metadata = { title: 'Cedar' }

export default function RootPage() {
  redirect('/changes')
}
