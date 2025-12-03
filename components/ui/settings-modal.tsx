/**
 * SettingsModal - Application settings with proper scrolling
 * Features: Theme selection, accessibility, voice settings
 * Developed by Gourav Dutta
 */

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Settings, Moon, Sun, Contrast, Volume2, BarChart3, Palette, Check } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const THEME_OPTIONS = [
  { id: "dark", label: "Night Mode", icon: Moon, description: "Deep navy (default)" },
  { id: "light", label: "Light Mode", icon: Sun, description: "Clean white" },
]

const ACCENT_OPTIONS = [
  { id: "default", label: "Cyan Blue", colors: ["#00E5BD", "#1396FF"], cssClass: "" },
  { id: "clinical", label: "Clinical", colors: ["#0ea5e9", "#0284c7"], cssClass: "theme-clinical" },
  { id: "warm", label: "Warm Care", colors: ["#f59e0b", "#d97706"], cssClass: "theme-warm" },
]

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme()
  const [highContrast, setHighContrast] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [ttsSpeed, setTtsSpeed] = useState([1])
  const [accentTheme, setAccentTheme] = useState("default")

  useEffect(() => {
    if (typeof window !== "undefined" && isOpen) {
      const prefs = localStorage.getItem("medic-preferences")
      if (prefs) {
        try {
          const parsed = JSON.parse(prefs)
          setHighContrast(parsed.highContrast || false)
          setAnalyticsEnabled(parsed.analyticsEnabled ?? true)
          setVoiceEnabled(parsed.voiceEnabled ?? true)
          setTtsSpeed([parsed.ttsSpeed || 1])
          setAccentTheme(parsed.accentTheme || "default")
        } catch (e) {
          console.error("Failed to parse preferences:", e)
        }
      }

      if (document.documentElement.classList.contains("theme-clinical")) {
        setAccentTheme("clinical")
      } else if (document.documentElement.classList.contains("theme-warm")) {
        setAccentTheme("warm")
      }

      if (document.documentElement.classList.contains("high-contrast")) {
        setHighContrast(true)
      }
    }
  }, [isOpen])

  const handleAccentChange = (newAccent: string) => {
    setAccentTheme(newAccent)
    document.documentElement.classList.remove("theme-clinical", "theme-warm")
    if (newAccent !== "default") {
      document.documentElement.classList.add(`theme-${newAccent}`)
    }
  }

  const handleHighContrastChange = (enabled: boolean) => {
    setHighContrast(enabled)
    document.documentElement.classList.toggle("high-contrast", enabled)
  }

  const savePreferences = () => {
    const prefs = {
      highContrast,
      analyticsEnabled,
      voiceEnabled,
      ttsSpeed: ttsSpeed[0],
      accentTheme,
    }
    localStorage.setItem("medic-preferences", JSON.stringify(prefs))
    localStorage.setItem("medic-high-contrast", String(highContrast))
    onClose()
  }

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-cinematic"
        >
          {/* Header - Fixed */}
          <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-accent">
                <Settings className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 id="settings-title" className="text-lg font-semibold text-foreground">
                  Settings
                </h2>
                <p className="text-xs text-muted-foreground">Customize your experience</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close settings">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-4 space-y-6">
              {/* Theme selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Theme</Label>
                <div className="grid grid-cols-2 gap-2">
                  {THEME_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                        theme === option.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-muted/30 hover:border-primary/50"
                      }`}
                      aria-pressed={theme === option.id}
                    >
                      <option.icon className="h-5 w-5 text-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{option.label}</p>
                        <p className="text-[10px] text-muted-foreground">{option.description}</p>
                      </div>
                      {theme === option.id && <Check className="ml-auto h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent theme */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Palette className="h-4 w-4" />
                  Accent Theme
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {ACCENT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAccentChange(option.id)}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                        accentTheme === option.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-muted/30 hover:border-primary/50"
                      }`}
                      aria-pressed={accentTheme === option.id}
                    >
                      <div
                        className="h-8 w-full rounded-lg"
                        style={{
                          background: `linear-gradient(90deg, ${option.colors[0]}, ${option.colors[1]})`,
                        }}
                      />
                      <p className="text-[10px] font-medium text-foreground">{option.label}</p>
                      {accentTheme === option.id && <Check className="h-3 w-3 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessibility */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Contrast className="h-4 w-4" />
                  Accessibility
                </Label>
                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">High Contrast</p>
                    <p className="text-[10px] text-muted-foreground">WCAG AA compliance</p>
                  </div>
                  <Switch
                    checked={highContrast}
                    onCheckedChange={handleHighContrastChange}
                    aria-label="Toggle high contrast mode"
                  />
                </div>
              </div>

              {/* Voice settings */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Volume2 className="h-4 w-4" />
                  Voice Settings
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Voice Features</p>
                      <p className="text-[10px] text-muted-foreground">STT and TTS</p>
                    </div>
                    <Switch
                      checked={voiceEnabled}
                      onCheckedChange={setVoiceEnabled}
                      aria-label="Toggle voice features"
                    />
                  </div>
                  {voiceEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-xl border border-border bg-muted/30 p-3"
                    >
                      <Label htmlFor="tts-speed" className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-foreground">TTS Speed</span>
                        <span className="text-xs text-muted-foreground">{ttsSpeed[0]}x</span>
                      </Label>
                      <Slider
                        id="tts-speed"
                        value={ttsSpeed}
                        onValueChange={setTtsSpeed}
                        min={0.5}
                        max={2}
                        step={0.1}
                        aria-label="Text-to-speech speed"
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Analytics */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <BarChart3 className="h-4 w-4" />
                  Privacy
                </Label>
                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Usage Analytics</p>
                    <p className="text-[10px] text-muted-foreground">Help improve MEDIC</p>
                  </div>
                  <Switch
                    checked={analyticsEnabled}
                    onCheckedChange={setAnalyticsEnabled}
                    aria-label="Toggle usage analytics"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sticky footer */}
          <div className="shrink-0 border-t border-border bg-popover p-4 space-y-3">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button onClick={savePreferences} className="w-full gradient-accent text-primary-foreground">
                Save Settings
              </Button>
            </motion.div>
            <p className="text-center developer-credit text-muted-foreground">Developed by Gourav Dutta</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
