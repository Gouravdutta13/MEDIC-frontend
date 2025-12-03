/**
 * CommandPalette - Quick actions with solid background styling
 * Features: Fuzzy search, keyboard navigation, solid popover
 * Developed by Gourav Dutta
 */

"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Command,
  Search,
  MessageSquare,
  Stethoscope,
  Pill,
  Sun,
  Moon,
  Download,
  Settings,
  Heart,
  FileText,
  AlertTriangle,
  Activity,
  X,
  Info,
} from "lucide-react"
import type { CommandItem } from "@/lib/types"

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onNewChat: () => void
  onOpenTool: (toolId: string) => void
  onToggleTheme: () => void
  onExportChat: () => void
  onOpenSettings: () => void
}

const COMMANDS: CommandItem[] = [
  {
    id: "new-chat",
    label: "New Chat",
    description: "Start a new conversation",
    icon: "MessageSquare",
    shortcut: "⌘N",
    category: "navigation",
    action: () => {},
  },
  {
    id: "symptom-analyzer",
    label: "Symptom Analyzer",
    description: "Analyze symptoms and conditions",
    icon: "Stethoscope",
    category: "tool",
    action: () => {},
  },
  {
    id: "drug-lookup",
    label: "Drug Lookup",
    description: "Search medication information",
    icon: "Pill",
    category: "tool",
    action: () => {},
  },
  {
    id: "first-aid",
    label: "First Aid Guide",
    description: "Emergency first aid instructions",
    icon: "Heart",
    category: "tool",
    action: () => {},
  },
  {
    id: "health-reports",
    label: "Health Reports",
    description: "Generate health summaries",
    icon: "FileText",
    category: "tool",
    action: () => {},
  },
  {
    id: "emergency-info",
    label: "Emergency Info",
    description: "Critical emergency contacts",
    icon: "AlertTriangle",
    category: "tool",
    action: () => {},
  },
  {
    id: "toggle-theme",
    label: "Toggle Theme",
    description: "Switch between dark and light mode",
    icon: "Sun",
    shortcut: "⌘J",
    category: "action",
    action: () => {},
  },
  {
    id: "export-chat",
    label: "Export Chat",
    description: "Export current conversation",
    icon: "Download",
    category: "action",
    action: () => {},
  },
  {
    id: "settings",
    label: "Settings",
    description: "Open application settings",
    icon: "Settings",
    shortcut: "⌘,",
    category: "settings",
    action: () => {},
  },
  {
    id: "about",
    label: "About MEDIC",
    description: "Version info and credits",
    icon: "Info",
    category: "settings",
    action: () => {},
  },
]

const getIcon = (iconName: string) => {
  const icons: Record<string, React.ElementType> = {
    MessageSquare,
    Stethoscope,
    Pill,
    Sun,
    Moon,
    Download,
    Settings,
    Heart,
    FileText,
    AlertTriangle,
    Activity,
    Command,
    Search,
    Info,
  }
  return icons[iconName] || Command
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNewChat,
  onOpenTool,
  onToggleTheme,
  onExportChat,
  onOpenSettings,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showAbout, setShowAbout] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filteredCommands = COMMANDS.filter((cmd) => {
    const searchText = `${cmd.label} ${cmd.description || ""}`.toLowerCase()
    return query
      .toLowerCase()
      .split(" ")
      .every((word) => searchText.includes(word))
  })

  const executeCommand = useCallback(
    (command: CommandItem) => {
      switch (command.id) {
        case "new-chat":
          onNewChat()
          break
        case "toggle-theme":
          onToggleTheme()
          break
        case "export-chat":
          onExportChat()
          break
        case "settings":
          onOpenSettings()
          break
        case "about":
          setShowAbout(true)
          return // Don't close palette
        default:
          if (command.category === "tool") {
            onOpenTool(command.id)
          }
      }
      onClose()
    },
    [onNewChat, onToggleTheme, onExportChat, onOpenSettings, onOpenTool, onClose],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev === 0 ? filteredCommands.length - 1 : prev - 1))
          break
        case "Enter":
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex])
          }
          break
        case "Escape":
          e.preventDefault()
          if (showAbout) {
            setShowAbout(false)
          } else {
            onClose()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, executeCommand, onClose, showAbout])

  useEffect(() => {
    if (isOpen) {
      setQuery("")
      setSelectedIndex(0)
      setShowAbout(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const selectedElement = listRef.current?.children[selectedIndex] as HTMLElement
    selectedElement?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex])

  const groupedCommands = filteredCommands.reduce(
    (acc, cmd) => {
      const category = cmd.category
      if (!acc[category]) acc[category] = []
      acc[category].push(cmd)
      return acc
    },
    {} as Record<string, CommandItem[]>,
  )

  const categoryLabels: Record<string, string> = {
    navigation: "Navigation",
    tool: "Medical Tools",
    action: "Actions",
    settings: "Settings",
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Dialog - SOLID background */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-popover shadow-cinematic">
              {showAbout ? (
                // About panel
                <div className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent animate-heartbeat">
                      <Heart className="h-8 w-8 text-primary-foreground" fill="currentColor" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold gradient-text mb-1">MEDIC</h2>
                  <p className="text-sm text-muted-foreground mb-4">AI Medical Assistant</p>
                  <p className="text-xs text-muted-foreground mb-2">Version 1.0.0</p>
                  <p className="developer-credit text-muted-foreground mb-6">Developed by Gourav Dutta</p>
                  <button
                    onClick={() => setShowAbout(false)}
                    className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm text-foreground transition-colors"
                  >
                    Back to Commands
                  </button>
                </div>
              ) : (
                <>
                  {/* Search input */}
                  <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                    <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Type a command or search..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      aria-label="Search commands"
                      aria-activedescendant={`cmd-${filteredCommands[selectedIndex]?.id}`}
                    />
                    <kbd className="hidden rounded border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground sm:block">
                      ESC
                    </kbd>
                    <button
                      onClick={onClose}
                      className="rounded p-1 text-muted-foreground hover:text-foreground sm:hidden"
                      aria-label="Close command palette"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Commands list */}
                  <div
                    ref={listRef}
                    className="max-h-80 overflow-y-auto p-2 custom-scrollbar"
                    role="listbox"
                    aria-label="Available commands"
                  >
                    {Object.entries(groupedCommands).map(([category, commands]) => (
                      <div key={category} className="mb-2">
                        <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {categoryLabels[category]}
                        </p>
                        {commands.map((cmd) => {
                          const globalIndex = filteredCommands.indexOf(cmd)
                          const Icon = getIcon(cmd.icon || "Command")
                          const isSelected = globalIndex === selectedIndex

                          return (
                            <motion.button
                              key={cmd.id}
                              id={`cmd-${cmd.id}`}
                              onClick={() => executeCommand(cmd)}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                                isSelected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                              }`}
                              role="option"
                              aria-selected={isSelected}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{cmd.label}</p>
                                {cmd.description && <p className="text-xs text-muted-foreground">{cmd.description}</p>}
                              </div>
                              {cmd.shortcut && (
                                <kbd className="rounded border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                  {cmd.shortcut}
                                </kbd>
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                    ))}

                    {filteredCommands.length === 0 && (
                      <div className="py-8 text-center">
                        <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">No commands found</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-border px-4 py-2">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <kbd className="rounded border border-border bg-muted px-1">↑↓</kbd>
                        Navigate
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="rounded border border-border bg-muted px-1">↵</kbd>
                        Select
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Command className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">MEDIC</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
