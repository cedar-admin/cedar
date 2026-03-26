'use client'

import { useState, useTransition } from 'react'
import { createPractice } from '../actions/onboarding'

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
      <div className="border rounded">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 text-xs font-bold flex items-center justify-center shrink-0 border rounded" aria-hidden="true">1</span>
            <h1 className="text-2xl font-bold">Set up your practice</h1>
          </div>
          <p className="text-sm">
            Cedar monitors Florida regulatory sources for your practice.
          </p>
        </div>
        <div className="px-5 pb-5">
          <form onSubmit={handleStep1Submit}>
            <div className="flex flex-col gap-5">
              <div>
                <label htmlFor="owner_name" className="text-sm font-medium">Your name</label>
                <div className="mt-1">
                  <input
                    id="owner_name"
                    name="owner_name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Dr. Jane Smith"
                    defaultValue={step1.owner_name}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="name" className="text-sm font-medium">Practice name</label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="organization"
                    placeholder="Smith Family Medicine"
                    defaultValue={step1.name}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="practice_type" className="text-sm font-medium">Practice type</label>
                <div className="mt-1">
                  <select
                    id="practice_type"
                    name="practice_type"
                    required
                    defaultValue={step1.practice_type || ''}
                    className="w-full border rounded px-3 py-2 text-sm"
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
              </div>

              <div>
                <label htmlFor="phone" className="text-sm font-medium">Phone number</label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="(555) 123-4567"
                    defaultValue={step1.phone}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <button type="submit" className="w-full mt-2 px-4 py-2 border rounded text-sm font-medium">
                Continue
                <span aria-hidden="true"> →</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ── Step 2: Plan selection ────────────────────────────────────────────────
  return (
    <div className="border rounded">
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 text-xs font-bold flex items-center justify-center shrink-0 border rounded" aria-hidden="true">2</span>
          <h1 className="text-2xl font-bold">Choose your plan</h1>
        </div>
        <p className="text-sm">
          You can change plans at any time from settings.
        </p>
      </div>
      <div className="px-5 pb-5">
        <div className="flex flex-col gap-4">
          {/* Plan cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Monitor */}
            <button
              type="button"
              onClick={() => setTier('monitor')}
              className={`h-auto text-left p-4 border w-full transition-all ${
                tier === 'monitor'
                  ? 'border-blue-500 bg-gray-50'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Monitor</span>
                {tier === 'monitor' && (
                  <span className="text-base" aria-hidden="true">✓</span>
                )}
              </div>
              <p className="text-xl font-bold">$99</p>
              <p className="text-xs mb-3">/month</p>
              <ul className="space-y-1.5">
                {PLAN_FEATURES.monitor.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs">
                    <span className="mt-0.5 shrink-0" aria-hidden="true">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </button>

            {/* Intelligence */}
            <button
              type="button"
              onClick={() => setTier('intelligence')}
              className={`h-auto text-left p-4 border w-full transition-all ${
                tier === 'intelligence'
                  ? 'border-blue-500 bg-gray-50'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Intelligence</span>
                {tier === 'intelligence' && (
                  <span className="text-base" aria-hidden="true">✓</span>
                )}
              </div>
              <p className="text-xl font-bold">$199</p>
              <p className="text-xs mb-3">/month</p>
              <ul className="space-y-1.5">
                {PLAN_FEATURES.intelligence.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs">
                    <span className="mt-0.5 shrink-0" aria-hidden="true">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          </div>

          <hr />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 px-4 py-2 border rounded text-sm"
            >
              <span aria-hidden="true">← </span>Back
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isPending}
              className="flex-1 px-4 py-2 border rounded text-sm font-medium"
            >
              {isPending ? (
                <>Setting up…</>
              ) : (
                <>Get started <span aria-hidden="true">→</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
