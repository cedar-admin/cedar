'use client'

import { createContext, useContext } from 'react'

export type CommandMenuTelemetryCallback = (event: Record<string, unknown>) => void

interface CommandMenuTelemetryContextValue {
  app: 'studio' | 'docs' | 'www'
  onTelemetry?: CommandMenuTelemetryCallback
}

const CommandMenuTelemetryContext = createContext<CommandMenuTelemetryContextValue | null>(null)

export function useCommandMenuTelemetryContext() {
  const context = useContext(CommandMenuTelemetryContext)
  return context
}

export { CommandMenuTelemetryContext }
