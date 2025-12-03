/**
 * ChatPage - Main chat page layout with sidebar integration
 * Manages chat state and navigation
 */

"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Chat, Message } from "@/lib/types"
import { generateChatId, logAnalyticsEvent, exportChatToText, exportChatToPDF } from "@/lib/api"
import { saveChats, loadChats } from "@/lib/storage"
import { useTheme } from "next-themes"
import AppSidebar from "@/components/ui/app-sidebar"
import Navbar from "@/components/ui/navbar"
import ChatWindow from "./chat-window"
import CommandPalette from "@/components/ui/command-palette"
import SymptomAnalyzer from "@/components/tools/symptom-analyzer"
import DrugLookup from "@/components/tools/drug-lookup"
import FirstAidGuide from "@/components/tools/first-aid-guide"
import HealthReports from "@/components/tools/health-reports"
import EmergencyInfo from "@/components/tools/emergency-info"
import SettingsModal from "@/components/ui/settings-modal"

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { setTheme, theme } = useTheme()

  // Load chats from storage on mount
  useEffect(() => {
    const savedChats = loadChats()
    if (savedChats.length > 0) {
      setChats(savedChats)
      setCurrentChatId(savedChats[0].id)
    } else {
      // Create initial chat
      const newChat: Chat = {
        id: generateChatId(),
        title: "New Conversation",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setChats([newChat])
      setCurrentChatId(newChat.id)
    }
  }, [])

  // Save chats when they change
  useEffect(() => {
    if (chats.length > 0) {
      saveChats(chats)
    }
  }, [chats])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault()
        setTheme(theme === "dark" ? "light" : "dark")
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault()
        createNewChat()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [theme, setTheme])

  // Create a new chat
  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: generateChatId(),
      title: "New Conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setChats((prev) => [newChat, ...prev])
    setCurrentChatId(newChat.id)
    logAnalyticsEvent("chat_created")
  }, [])

  // Select a chat
  const selectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId)
    // Close sidebar on mobile after selection
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSidebarOpen(false)
    }
  }, [])

  // Delete a chat
  const deleteChat = useCallback(
    (chatId: string) => {
      setChats((prev) => {
        const filtered = prev.filter((c) => c.id !== chatId)
        if (currentChatId === chatId && filtered.length > 0) {
          setCurrentChatId(filtered[0].id)
        } else if (filtered.length === 0) {
          createNewChat()
        }
        return filtered
      })
      logAnalyticsEvent("chat_deleted")
    },
    [currentChatId, createNewChat],
  )

  // Rename a chat
  const renameChat = useCallback((chatId: string, newTitle: string) => {
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, title: newTitle, updatedAt: new Date() } : c)))
  }, [])

  // Pin/unpin a chat
  const togglePinChat = useCallback((chatId: string) => {
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, isPinned: !c.isPinned } : c)))
  }, [])

  // Handle messages change from ChatWindow
  const handleMessagesChange = useCallback(
    (messages: Message[]) => {
      if (!currentChatId) return

      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== currentChatId) return c

          // Auto-generate title from first user message
          let title = c.title
          if (title === "New Conversation" && messages.length > 0 && messages[0].role === "user") {
            title = messages[0].content.slice(0, 50) + (messages[0].content.length > 50 ? "..." : "")
          }

          return {
            ...c,
            messages,
            title,
            updatedAt: new Date(),
          }
        }),
      )
    },
    [currentChatId],
  )

  // Export current chat
  const exportChat = useCallback(() => {
    const currentChat = chats.find((c) => c.id === currentChatId)
    if (!currentChat) return

    const text = exportChatToText(currentChat.messages)
    navigator.clipboard.writeText(text)
    logAnalyticsEvent("chat_exported", { format: "text" })
  }, [chats, currentChatId])

  // Export to PDF
  const exportToPDF = useCallback(() => {
    const currentChat = chats.find((c) => c.id === currentChatId)
    if (!currentChat) return

    exportChatToPDF(currentChat.messages, currentChat.title)
    logAnalyticsEvent("chat_exported", { format: "pdf" })
  }, [chats, currentChatId])

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  // Get current chat
  const currentChat = chats.find((c) => c.id === currentChatId)

  // Render active tool modal
  const renderActiveTool = () => {
    if (!activeTool) return null

    const toolComponents: Record<string, React.ReactNode> = {
      "symptom-analyzer": <SymptomAnalyzer onClose={() => setActiveTool(null)} />,
      "drug-lookup": <DrugLookup onClose={() => setActiveTool(null)} />,
      "first-aid": <FirstAidGuide onClose={() => setActiveTool(null)} />,
      "health-reports": <HealthReports onClose={() => setActiveTool(null)} chats={chats} />,
      "emergency-info": <EmergencyInfo onClose={() => setActiveTool(null)} />,
    }

    return toolComponents[activeTool] || null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <AppSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={selectChat}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
        onPinChat={togglePinChat}
        onOpenTool={setActiveTool}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          currentChatTitle={currentChat?.title}
        />

        {/* Chat window */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {currentChatId && (
              <motion.div
                key={currentChatId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ChatWindow
                  chatId={currentChatId}
                  initialMessages={currentChat?.messages || []}
                  onMessagesChange={handleMessagesChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Command palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNewChat={createNewChat}
        onOpenTool={setActiveTool}
        onToggleTheme={toggleTheme}
        onExportChat={exportChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Tool modals */}
      <AnimatePresence>{renderActiveTool()}</AnimatePresence>

      {/* Settings modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}
