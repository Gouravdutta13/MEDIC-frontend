/**
 * Main page - Entry point for MEDIC application
 * Developed by Gourav Dutta
 */

"use client"

import { useState, useEffect } from "react"
import { ThemeProvider } from "next-themes"
import LoadingScreen from "@/components/ui/loading-screen"
import ChatPage from "@/components/chat/chat-page"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  // Apply saved preferences on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefs = localStorage.getItem("medic-preferences")
      if (prefs) {
        try {
          const parsed = JSON.parse(prefs)
          if (parsed.accentTheme && parsed.accentTheme !== "default") {
            document.documentElement.classList.add(`theme-${parsed.accentTheme}`)
          }
          if (parsed.highContrast) {
            document.documentElement.classList.add("high-contrast")
          }
        } catch (e) {
          console.error("Failed to parse preferences:", e)
        }
      }
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {isLoading && <LoadingScreen minDisplayTime={2000} onComplete={() => setIsLoading(false)} />}
      {!isLoading && <ChatPage />}
    </ThemeProvider>
  )
}
