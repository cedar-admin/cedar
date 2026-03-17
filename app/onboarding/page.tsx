import { withAuth } from '@workos-inc/authkit-nextjs'
import { redirect } from 'next/navigation'
import { createServerClient } from '../../lib/db/client'
import { createPractice } from '../actions/onboarding'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const { user } = await withAuth({ ensureSignedIn: true })
  const supabase = createServerClient()

  const { data: existing } = await supabase
    .from('practices')
    .select('id')
    .eq('owner_email', user.email)
    .maybeSingle()

  if (existing) redirect('/changes')

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <i className="ri-leaf-line text-primary text-xl" />
          <span className="text-lg font-semibold tracking-tight text-foreground">Cedar</span>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Set up your practice</CardTitle>
            <CardDescription>
              Cedar will start monitoring Florida regulatory sources for your practice as soon as you&apos;re done.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createPractice} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="owner_name">Your name</Label>
                <Input
                  id="owner_name"
                  name="owner_name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Dr. Jane Smith"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name">Practice name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="organization"
                  placeholder="Smith Family Medicine"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="practice_type">Practice type</Label>
                <Select name="practice_type" required>
                  <SelectTrigger id="practice_type">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical_practice">Medical Practice</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="dental">Dental</SelectItem>
                    <SelectItem value="mental_health">Mental Health</SelectItem>
                    <SelectItem value="physical_therapy">Physical Therapy</SelectItem>
                    <SelectItem value="chiropractic">Chiropractic</SelectItem>
                    <SelectItem value="optometry">Optometry</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="(555) 123-4567"
                />
              </div>

              <Button type="submit" className="w-full mt-2">
                Get started
                <i className="ri-arrow-right-line" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-xs text-center text-muted-foreground">
          Signed in as {user.email}
        </p>
      </div>
    </div>
  )
}
