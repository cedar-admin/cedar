'use client'

import { useState, useTransition } from 'react'
import { Switch, Separator, Select, Text, Flex, Box } from '@radix-ui/themes'
import { saveNotificationPreferences } from '@/app/actions/settings'
import type { NotificationPreferences } from '@/app/actions/settings'

interface NotificationsFormProps {
  initial: NotificationPreferences
}

export function NotificationsForm({ initial }: NotificationsFormProps) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(initial)
  const [isPending, startTransition] = useTransition()

  function update(patch: Partial<NotificationPreferences>) {
    const next = { ...prefs, ...patch }
    setPrefs(next)
    startTransition(async () => {
      await saveNotificationPreferences(next)
    })
  }

  return (
    <Flex direction="column" gap="4">
      {/* Email alerts row */}
      <Flex align="center" justify="between">
        <Box>
          <Text as="label" size="2" weight="medium" htmlFor="email-alerts">
            Email alerts
          </Text>
          <Text size="1" color="gray" as="p" mt="1">
            Receive email for Critical &amp; High severity changes
          </Text>
        </Box>
        <Switch
          id="email-alerts"
          checked={prefs.email_alerts}
          onCheckedChange={(checked) => update({ email_alerts: checked })}
          disabled={isPending}
        />
      </Flex>
      <Separator size="4" />

      {/* Severity threshold row */}
      <Flex align="center" justify="between" gap="4">
        <Box>
          <Text size="2" weight="medium">Email threshold</Text>
          <Text size="1" color="gray" as="p" mt="1">
            Only send alerts at or above this severity
          </Text>
        </Box>
        <Select.Root
          value={prefs.email_threshold}
          onValueChange={(value) =>
            update({ email_threshold: value as NotificationPreferences['email_threshold'] })
          }
          disabled={isPending}
        >
          <Select.Trigger style={{ width: '9rem' }} />
          <Select.Content>
            <Select.Item value="critical">Critical only</Select.Item>
            <Select.Item value="high">High &amp; above</Select.Item>
            <Select.Item value="medium">Medium &amp; above</Select.Item>
            <Select.Item value="all">All changes</Select.Item>
          </Select.Content>
        </Select.Root>
      </Flex>
      <Separator size="4" />

      {/* Weekly digest row */}
      <Flex align="center" justify="between">
        <Box>
          <Text as="label" size="2" weight="medium" htmlFor="weekly-digest">
            Weekly digest
          </Text>
          <Text size="1" color="gray" as="p" mt="1">
            Summary email every Monday morning
          </Text>
        </Box>
        <Switch
          id="weekly-digest"
          checked={prefs.weekly_digest}
          onCheckedChange={(checked) => update({ weekly_digest: checked })}
          disabled={isPending}
        />
      </Flex>

      <Box pt="1">
        <Text size="1" color="gray">
          <i className="ri-information-line mr-1" />
          {isPending
            ? 'Saving…'
            : 'Notification preferences are applied account-wide. Per-user settings coming soon.'}
        </Text>
      </Box>
    </Flex>
  )
}
