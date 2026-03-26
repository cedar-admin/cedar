'use client'

import { useState, useTransition } from 'react'
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
    <div className="flex flex-col gap-4">
      {/* Email alerts row */}
      <div className="flex items-center justify-between">
        <div>
          <label htmlFor="email-alerts" className="text-sm font-medium">
            Email alerts
          </label>
          <p className="text-xs mt-1">
            Receive email for Critical &amp; High severity changes
          </p>
        </div>
        <input
          type="checkbox"
          id="email-alerts"
          checked={prefs.email_alerts}
          onChange={(e) => update({ email_alerts: e.target.checked })}
          disabled={isPending}
        />
      </div>
      <hr />

      {/* Severity threshold row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-sm font-medium">Email threshold</span>
          <p className="text-xs mt-1">
            Only send alerts at or above this severity
          </p>
        </div>
        <select
          style={{ width: '9rem' }}
          className="border rounded px-2 py-1 text-sm"
          value={prefs.email_threshold}
          onChange={(e) =>
            update({ email_threshold: e.target.value as NotificationPreferences['email_threshold'] })
          }
          disabled={isPending}
        >
          <option value="critical">Critical only</option>
          <option value="high">High &amp; above</option>
          <option value="medium">Medium &amp; above</option>
          <option value="all">All changes</option>
        </select>
      </div>
      <hr />

      {/* Weekly digest row */}
      <div className="flex items-center justify-between">
        <div>
          <label htmlFor="weekly-digest" className="text-sm font-medium">
            Weekly digest
          </label>
          <p className="text-xs mt-1">
            Summary email every Monday morning
          </p>
        </div>
        <input
          type="checkbox"
          id="weekly-digest"
          checked={prefs.weekly_digest}
          onChange={(e) => update({ weekly_digest: e.target.checked })}
          disabled={isPending}
        />
      </div>

      <div className="pt-1">
        <span className="text-xs">
          {isPending
            ? 'Saving…'
            : 'Notification preferences are applied account-wide. Per-user settings coming soon.'}
        </span>
      </div>
    </div>
  )
}
