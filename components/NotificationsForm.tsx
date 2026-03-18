'use client'

import { useState, useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
    <div className="space-y-4">
      {/* Email alerts row */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="email-alerts" className="text-sm font-medium text-foreground">
            Email alerts
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Receive email for Critical &amp; High severity changes
          </p>
        </div>
        <Switch
          id="email-alerts"
          checked={prefs.email_alerts}
          onCheckedChange={(checked) => update({ email_alerts: checked })}
          disabled={isPending}
        />
      </div>
      <Separator />

      {/* Severity threshold row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Email threshold</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Only send alerts at or above this severity
          </p>
        </div>
        <Select
          value={prefs.email_threshold}
          onValueChange={(value) =>
            update({ email_threshold: value as NotificationPreferences['email_threshold'] })
          }
          disabled={isPending}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="critical">Critical only</SelectItem>
            <SelectItem value="high">High &amp; above</SelectItem>
            <SelectItem value="medium">Medium &amp; above</SelectItem>
            <SelectItem value="all">All changes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator />

      {/* Weekly digest row */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="weekly-digest" className="text-sm font-medium text-foreground">
            Weekly digest
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Summary email every Monday morning
          </p>
        </div>
        <Switch
          id="weekly-digest"
          checked={prefs.weekly_digest}
          onCheckedChange={(checked) => update({ weekly_digest: checked })}
          disabled={isPending}
        />
      </div>

      <div className="pt-1">
        <p className="text-xs text-muted-foreground">
          <i className="ri-information-line mr-1" />
          {isPending
            ? 'Saving…'
            : 'Notification preferences are applied account-wide. Per-user settings coming soon.'}
        </p>
      </div>
    </div>
  )
}
