/**
 * Storage utilities for persisting chats and preferences
 * Uses localStorage and IndexedDB
 */

import type { Chat, UserPreferences } from "./types"

const CHATS_KEY = "medic-chats"
const PREFERENCES_KEY = "medic-preferences"

/**
 * Save chats to localStorage
 */
export function saveChats(chats: Chat[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats))
  } catch (error) {
    console.error("[Storage] Failed to save chats:", error)
  }
}

/**
 * Load chats from localStorage
 */
export function loadChats(): Chat[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(CHATS_KEY)
    if (!stored) return []

    const chats = JSON.parse(stored) as Chat[]
    // Restore Date objects
    return chats.map((chat) => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
      messages: chat.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }))
  } catch (error) {
    console.error("[Storage] Failed to load chats:", error)
    return []
  }
}

/**
 * Save user preferences
 */
export function savePreferences(preferences: UserPreferences): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
  } catch (error) {
    console.error("[Storage] Failed to save preferences:", error)
  }
}

/**
 * Load user preferences
 */
export function loadPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return getDefaultPreferences()
  }

  try {
    const stored = localStorage.getItem(PREFERENCES_KEY)
    if (!stored) return getDefaultPreferences()
    return { ...getDefaultPreferences(), ...JSON.parse(stored) }
  } catch {
    return getDefaultPreferences()
  }
}

/**
 * Get default preferences
 */
export function getDefaultPreferences(): UserPreferences {
  return {
    theme: "dark",
    highContrast: false,
    analyticsEnabled: true,
    voiceEnabled: true,
    language: "en-US",
    ttsSpeed: 1,
    autoSpeak: false,
  }
}

/**
 * Clear all stored data
 */
export function clearAllData(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(CHATS_KEY)
  localStorage.removeItem(PREFERENCES_KEY)
}

/**
 * Export all data
 */
export function exportAllData(): string {
  const chats = loadChats()
  const preferences = loadPreferences()
  return JSON.stringify({ chats, preferences, exportedAt: new Date().toISOString() }, null, 2)
}
