// Shared formatting utilities — used across all pages and components.

export function timeAgo(iso: string | null): string {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const target = new Date(iso)
  const now = new Date()
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}
