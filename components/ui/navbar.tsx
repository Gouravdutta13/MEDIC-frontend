/**
 * Navbar - Top navigation with pulsating heart logo
 * Features: Heartbeat animation, solid popovers, proper routing
 * Developed by Gourav Dutta
 */

"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  Moon,
  Sun,
  Command,
  Settings,
  HelpCircle,
  Bell,
  User,
  Menu,
  Contrast,
  X,
  Check,
  Info,
  LogOut,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NavbarProps {
  onOpenCommandPalette: () => void
  onToggleSidebar: () => void
  onOpenSettings: () => void
  currentChatTitle?: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning"
  read: boolean
  timestamp: Date
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Welcome to MEDIC",
    message: "Your AI medical assistant is ready to help.",
    type: "success",
    read: false,
    timestamp: new Date(),
  },
  {
    id: "2",
    title: "New Feature",
    message: "Voice assistant is now available. Try saying 'Hey MEDIC'.",
    type: "info",
    read: false,
    timestamp: new Date(Date.now() - 3600000),
  },
]

export default function Navbar({
  onOpenCommandPalette,
  onToggleSidebar,
  onOpenSettings,
  currentChatTitle,
}: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [highContrast, setHighContrast] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const notificationRef = useRef<HTMLDivElement>(null)
  const notificationButtonRef = useRef<HTMLButtonElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    setMounted(true)
    const savedHighContrast = localStorage.getItem("medic-high-contrast") === "true"
    if (savedHighContrast) {
      setHighContrast(true)
      document.documentElement.classList.add("high-contrast")
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false)
      }
    }

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isNotificationOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isNotificationOpen && e.key === "Escape") {
        setIsNotificationOpen(false)
        notificationButtonRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isNotificationOpen])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleHighContrast = () => {
    const newValue = !highContrast
    setHighContrast(newValue)
    document.documentElement.classList.toggle("high-contrast", newValue)
    localStorage.setItem("medic-high-contrast", String(newValue))
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const handleHelpClick = () => {
    router.push("/help")
  }

  const handleSignOut = () => {
    localStorage.removeItem("medic-preferences")
    localStorage.removeItem("medic-chats")
    router.push("/")
  }

  if (!mounted) return null

  return (
    <TooltipProvider>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="sticky top-0 z-40 border-b border-border bg-background"
        role="banner"
      >
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          {/* Left section */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 touch-target"
              onClick={onToggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo with heartbeat animation */}
            <a href="/" className="flex items-center gap-2" aria-label="MEDIC Home">
              <motion.div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-accent shadow-glow animate-heartbeat">
                <Heart className="h-4 w-4 text-primary-foreground" fill="currentColor" />
              </motion.div>
              <span className="hidden font-bold sm:inline">
                <span className="gradient-text">MEDIC</span>
              </span>
            </a>

            {currentChatTitle && (
              <div className="hidden items-center gap-2 md:flex">
                <span className="text-muted-foreground">/</span>
                <span className="max-w-[200px] truncate text-sm text-muted-foreground">{currentChatTitle}</span>
              </div>
            )}
          </div>

          {/* Center - Command palette trigger */}
          <div className="hidden md:block">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 gap-2 border-border px-3 text-muted-foreground hover:text-foreground bg-muted/50"
                  onClick={onOpenCommandPalette}
                  aria-label="Open command palette"
                >
                  <Command className="h-4 w-4" />
                  <span className="text-sm">Search commands...</span>
                  <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground border-border shadow-elevated">
                <p>Open command palette (⌘K)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:hidden"
              onClick={onOpenCommandPalette}
              aria-label="Open command palette"
            >
              <Command className="h-5 w-5" />
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-9 w-9 ${highContrast ? "text-primary bg-primary/10" : ""}`}
                  onClick={toggleHighContrast}
                  aria-label={highContrast ? "Disable high contrast" : "Enable high contrast"}
                  aria-pressed={highContrast}
                >
                  <Contrast className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground border-border shadow-elevated">
                Toggle high contrast
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground border-border shadow-elevated">
                Toggle theme (⌘J)
              </TooltipContent>
            </Tooltip>

            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    ref={notificationButtonRef}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 relative"
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
                    aria-expanded={isNotificationOpen}
                    aria-haspopup="true"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-popover text-popover-foreground border-border shadow-elevated">
                  Notifications
                </TooltipContent>
              </Tooltip>

              {/* Notification Panel - SOLID background */}
              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    ref={notificationRef}
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-popover shadow-elevated z-[var(--z-popover)]"
                    role="dialog"
                    aria-label="Notifications"
                  >
                    <div className="flex items-center justify-between border-b border-border p-3">
                      <h3 className="font-semibold text-popover-foreground">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                          onClick={markAllAsRead}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Mark all read
                        </Button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Bell className="mb-2 h-8 w-8 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">No notifications</p>
                        </div>
                      ) : (
                        <ul role="list" className="divide-y divide-border">
                          {notifications.map((notification) => (
                            <li
                              key={notification.id}
                              className={`group relative flex gap-3 p-3 transition-colors hover:bg-muted/50 ${
                                !notification.read ? "bg-primary/5" : ""
                              }`}
                            >
                              <div
                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                  notification.type === "success"
                                    ? "bg-primary/20 text-primary"
                                    : notification.type === "warning"
                                      ? "bg-warning/20 text-warning"
                                      : "bg-secondary/20 text-secondary"
                                }`}
                              >
                                {notification.type === "success" ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Info className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-popover-foreground">{notification.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                                <p className="mt-1 text-[10px] text-muted-foreground/70">
                                  {notification.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => markAsRead(notification.id)}
                                    aria-label="Mark as read"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                  onClick={() => clearNotification(notification.id)}
                                  aria-label="Dismiss notification"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              {!notification.read && (
                                <span className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onOpenSettings} aria-label="Settings">
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground border-border shadow-elevated">
                Settings
              </TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-1 h-9 w-9" aria-label="User menu">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-popover border-border shadow-elevated z-[var(--z-dropdown)]"
              >
                <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onOpenSettings} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleHelpClick} className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Docs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.header>
    </TooltipProvider>
  )
}
