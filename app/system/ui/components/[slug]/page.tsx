import { notFound, redirect } from 'next/navigation'

const LEGACY_COMPONENT_ROUTES: Record<string, string> = {
  'section-heading': '/system/ui/fragments/section-heading',
  'ai-trust': '/system/ui/fragments/ai-trust',
  'filter-pills': '/system/ui/fragments/filter-pills',
}

export function generateStaticParams() {
  return Object.keys(LEGACY_COMPONENT_ROUTES).map((slug) => ({ slug }))
}

export default async function LegacyComponentsRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const destination = LEGACY_COMPONENT_ROUTES[slug]

  if (!destination) notFound()
  redirect(destination)
}
