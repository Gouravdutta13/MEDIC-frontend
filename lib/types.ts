/**
 * Core type definitions for MEDIC application
 */

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  sources?: Source[]
  confidence?: "high" | "medium" | "low"
  isStreaming?: boolean
  metadata?: MessageMetadata
}

export interface Source {
  id: string
  title: string
  snippet: string
  url: string
  score: number
  type: "journal" | "guideline" | "reference" | "database"
}

export interface MessageMetadata {
  tokens?: number
  latency?: number
  model?: string
  flagged?: boolean
  savedToProfile?: boolean
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  isPinned?: boolean
}

export interface MedicalTool {
  id: string
  name: string
  description: string
  icon: string
  category: "diagnosis" | "reference" | "emergency" | "analysis"
}

export interface VoiceState {
  isListening: boolean
  isSupported: boolean
  transcript: string
  language: string
  error?: string
}

export interface AnalyticsEvent {
  event: string
  timestamp: Date
  properties?: Record<string, unknown>
}

export interface UserPreferences {
  theme: "dark" | "light" | "clinical" | "warm"
  highContrast: boolean
  analyticsEnabled: boolean
  voiceEnabled: boolean
  language: string
  ttsSpeed: number
  autoSpeak: boolean
}

export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: string
  shortcut?: string
  action: () => void
  category: "navigation" | "tool" | "action" | "settings"
}
