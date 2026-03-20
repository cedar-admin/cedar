'use client'

import { useState, useTransition } from 'react'
import { createPractice } from '../actions/onboarding'
import { Card, Box, Flex, Heading, Text, Button, TextField, Select, Separator } from '@radix-ui/themes'

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
        <Box px="5" pt="5" pb="4">
          <Flex align="center" gap="2" mb="1">
            <span className="w-6 h-6 bg-[var(--accent-9)] text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <Heading size="5">Set up your practice</Heading>
          </Flex>
          <Text size="2" color="gray" as="p">
            Cedar monitors Florida regulatory sources for your practice.
          </Text>
        </Box>
        <Box px="5" pb="5">
          <form onSubmit={handleStep1Submit}>
            <Flex direction="column" gap="5">
              <Box>
                <Text as="label" size="2" weight="medium" htmlFor="owner_name">Your name</Text>
                <Box mt="1">
                  <TextField.Root
                    id="owner_name"
                    name="owner_name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Dr. Jane Smith"
                    defaultValue={step1.owner_name}
                  />
                </Box>
              </Box>

              <Box>
                <Text as="label" size="2" weight="medium" htmlFor="name">Practice name</Text>
                <Box mt="1">
                  <TextField.Root
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="organization"
                    placeholder="Smith Family Medicine"
                    defaultValue={step1.name}
                  />
                </Box>
              </Box>

              <Box>
                <Text as="label" size="2" weight="medium" htmlFor="practice_type">Practice type</Text>
                <Box mt="1">
                  <Select.Root name="practice_type" required defaultValue={step1.practice_type || undefined}>
                    <Select.Trigger id="practice_type" placeholder="Select…" style={{ width: '100%' }} />
                    <Select.Content>
                      <Select.Item value="medical_practice">Medical Practice</Select.Item>
                      <Select.Item value="pharmacy">Pharmacy</Select.Item>
                      <Select.Item value="dental">Dental</Select.Item>
                      <Select.Item value="mental_health">Mental Health</Select.Item>
                      <Select.Item value="physical_therapy">Physical Therapy</Select.Item>
                      <Select.Item value="chiropractic">Chiropractic</Select.Item>
                      <Select.Item value="optometry">Optometry</Select.Item>
                      <Select.Item value="other">Other</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Box>
              </Box>

              <Box>
                <Text as="label" size="2" weight="medium" htmlFor="phone">Phone number</Text>
                <Box mt="1">
                  <TextField.Root
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="(555) 123-4567"
                    defaultValue={step1.phone}
                  />
                </Box>
              </Box>

              <Button type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
                Continue
                <i className="ri-arrow-right-line" />
              </Button>
            </Flex>
          </form>
        </Box>
      </Card>
    )
  }

  // ── Step 2: Plan selection ────────────────────────────────────────────────
  return (
    <Card>
      <Box px="5" pt="5" pb="4">
        <Flex align="center" gap="2" mb="1">
          <span className="w-6 h-6 bg-[var(--accent-9)] text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
          <Heading size="5">Choose your plan</Heading>
        </Flex>
        <Text size="2" color="gray" as="p">
          You can change plans at any time from settings.
        </Text>
      </Box>
      <Box px="5" pb="5">
        <Flex direction="column" gap="4">
          {/* Plan cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Monitor */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setTier('monitor')}
              className={`h-auto text-left p-4 border rounded-none w-full justify-start transition-interactive ${
                tier === 'monitor'
                  ? 'border-[var(--accent-9)] bg-[var(--accent-a2)] hover:bg-[var(--accent-a2)]'
                  : 'border-[var(--gray-6)] bg-[var(--color-panel)] hover:bg-[var(--gray-a2)]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--gray-12)]">Monitor</span>
                {tier === 'monitor' && (
                  <i className="ri-checkbox-circle-fill text-[var(--accent-9)] text-base" />
                )}
              </div>
              <p className="text-xl font-bold text-[var(--gray-12)]">$99</p>
              <p className="text-xs text-[var(--gray-11)] mb-3">/month</p>
              <ul className="space-y-1.5">
                {PLAN_FEATURES.monitor.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-[var(--gray-11)]">
                    <i className="ri-check-line text-[var(--accent-9)] mt-0.5 shrink-0" />
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
                  ? 'border-[var(--accent-9)] bg-[var(--accent-a2)] hover:bg-[var(--accent-a2)]'
                  : 'border-[var(--gray-6)] bg-[var(--color-panel)] hover:bg-[var(--gray-a2)]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--gray-12)]">Intelligence</span>
                {tier === 'intelligence' && (
                  <i className="ri-checkbox-circle-fill text-[var(--accent-9)] text-base" />
                )}
              </div>
              <p className="text-xl font-bold text-[var(--gray-12)]">$199</p>
              <p className="text-xs text-[var(--gray-11)] mb-3">/month</p>
              <ul className="space-y-1.5">
                {PLAN_FEATURES.intelligence.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-[var(--gray-11)]">
                    <i className="ri-check-line text-[var(--accent-9)] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </Button>
          </div>

          <Separator size="4" />

          <Flex gap="3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              style={{ flex: 1 }}
            >
              <i className="ri-arrow-left-line" />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isPending}
              style={{ flex: 1 }}
            >
              {isPending ? (
                <><i className="ri-loader-4-line animate-spin" /> Setting up…</>
              ) : (
                <>Get started <i className="ri-arrow-right-line" /></>
              )}
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Card>
  )
}
