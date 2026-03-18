'use client'

import { useState, useTransition } from 'react'
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
import { Separator } from '@/components/ui/separator'

type Tier = 'monitor' | 'intelligence'

interface Step1Data {
  owner_name: string
  name: string
  practice_type: string
  phone: string
}

const PLAN_FEATURES = {
  monitor: [
    'Regulatory change feed (FL)',
    'Email alerts for Critical & High',
    'Tamper-evident audit trail',
    '10 monitored sources',
  ],
  intelligence: [
    'Everything in Monitor',
    'Regulation Library (AI-curated)',
    'FAQ & Q&A assistant',
    'Attorney-reviewed content',
    'Weekly digest',
  ],
}

interface Props {
  email: string
}

export function OnboardingForm({ email }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [step1, setStep1] = useState<Step1Data>({
    owner_name: '',
    name: '',
    practice_type: '',
    phone: '',
  })
  const [tier, setTier] = useState<Tier>('monitor')
  const [isPending, startTransition] = useTransition()

  function handleStep1Submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setStep1({
      owner_name: fd.get('owner_name') as string,
      name: fd.get('name') as string,
      practice_type: fd.get('practice_type') as string,
      phone: fd.get('phone') as string,
    })
    setStep(2)
  }

  function handleFinalSubmit() {
    startTransition(async () => {
      const fd = new FormData()
      Object.entries(step1).forEach(([k, v]) => fd.set(k, v))
      fd.set('tier', tier)
      await createPractice(fd)
    })
  }

  // ── Step 1: Practice profile ─────────────────────────────────────────────
  if (step === 1) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <CardTitle className="text-xl">Set up your practice</CardTitle>
          </div>
          <CardDescription>
            Cedar monitors Florida regulatory sources for your practice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStep1Submit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="owner_name">Your name</Label>
              <Input
                id="owner_name"
                name="owner_name"
                type="text"
                required
                autoComplete="name"
                placeholder="Dr. Jane Smith"
                defaultValue={step1.owner_name}
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
                defaultValue={step1.name}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="practice_type">Practice type</Label>
              <Select name="practice_type" required defaultValue={step1.practice_type || undefined}>
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
                defaultValue={step1.phone}
              />
            </div>

            <Button type="submit" className="w-full mt-2">
              Continue
              <i className="ri-arrow-right-line" />
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  // ── Step 2: Plan selection ────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">2</span>
          <CardTitle className="text-xl">Choose your plan</CardTitle>
        </div>
        <CardDescription>
          You can change plans at any time from settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Monitor */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => setTier('monitor')}
            className={`h-auto text-left p-4 border rounded-none w-full justify-start transition-interactive ${
              tier === 'monitor'
                ? 'border-primary bg-primary/5 hover:bg-primary/5'
                : 'border-border bg-card hover:bg-muted/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">Monitor</span>
              {tier === 'monitor' && (
                <i className="ri-checkbox-circle-fill text-primary text-base" />
              )}
            </div>
            <p className="text-xl font-bold text-foreground">$99</p>
            <p className="text-xs text-muted-foreground mb-3">/month</p>
            <ul className="space-y-1.5">
              {PLAN_FEATURES.monitor.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <i className="ri-check-line text-primary mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </Button>

          {/* Intelligence */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => setTier('intelligence')}
            className={`h-auto text-left p-4 border rounded-none w-full justify-start transition-interactive ${
              tier === 'intelligence'
                ? 'border-primary bg-primary/5 hover:bg-primary/5'
                : 'border-border bg-card hover:bg-muted/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">Intelligence</span>
              {tier === 'intelligence' && (
                <i className="ri-checkbox-circle-fill text-primary text-base" />
              )}
            </div>
            <p className="text-xl font-bold text-foreground">$199</p>
            <p className="text-xs text-muted-foreground mb-3">/month</p>
            <ul className="space-y-1.5">
              {PLAN_FEATURES.intelligence.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <i className="ri-check-line text-primary mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </Button>
        </div>

        <Separator />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(1)}
            className="flex-1"
          >
            <i className="ri-arrow-left-line" />
            Back
          </Button>
          <Button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? (
              <><i className="ri-loader-4-line animate-spin" /> Setting up…</>
            ) : (
              <>Get started <i className="ri-arrow-right-line" /></>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
