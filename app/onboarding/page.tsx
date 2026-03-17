import { withAuth } from '@workos-inc/authkit-nextjs'
import { redirect } from 'next/navigation'
import { createServerClient } from '../../lib/db/client'
import { createPractice } from '../actions/onboarding'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const { user } = await withAuth({ ensureSignedIn: true })
  const supabase = createServerClient()

  // Guard: already onboarded users who navigate here directly
  const { data: existing } = await supabase
    .from('practices')
    .select('id')
    .eq('owner_email', user.email)
    .maybeSingle()

  if (existing) redirect('/changes')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl font-semibold tracking-tight text-gray-900">Cedar</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Set up your practice</h1>
          <p className="mt-2 text-sm text-gray-500">
            Cedar will start monitoring Florida regulatory sources for your practice as soon as you&apos;re done.
          </p>
        </div>

        <form action={createPractice} className="space-y-5 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div>
            <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700 mb-1">
              Your name
            </label>
            <input
              id="owner_name"
              name="owner_name"
              type="text"
              required
              autoComplete="name"
              placeholder="Dr. Jane Smith"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Practice name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="organization"
              placeholder="Smith Family Medicine"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="practice_type" className="block text-sm font-medium text-gray-700 mb-1">
              Practice type
            </label>
            <select
              id="practice_type"
              name="practice_type"
              required
              defaultValue=""
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              <option value="" disabled>Select…</option>
              <option value="medical_practice">Medical Practice</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="dental">Dental</option>
              <option value="mental_health">Mental Health</option>
              <option value="physical_therapy">Physical Therapy</option>
              <option value="chiropractic">Chiropractic</option>
              <option value="optometry">Optometry</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="(555) 123-4567"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-md hover:bg-gray-700 transition-colors mt-2"
          >
            Get started →
          </button>
        </form>

        <p className="mt-4 text-xs text-center text-gray-400">
          Signed in as {user.email}
        </p>
      </div>
    </div>
  )
}
