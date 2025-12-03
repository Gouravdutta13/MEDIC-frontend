/**
 * AppSidebar - Chat management with share, drag-reorder, and 3-dot menu
 * Features: Pin/unpin, rename, delete, share as JSON, smooth animations
 * Developed by Gourav Dutta
 */

"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare,
  Plus,
  Stethoscope,
  Pill,
  Heart,
  FileText,
  AlertTriangle,
  Activity,
  Pin,
  PinOff,
  Pencil,
  Trash2,
  ChevronLeft,
  X,
  Check,
  MoreVertical,
  Download,
  Copy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Chat } from "@/lib/types"

interface AppSidebarProps {
  isOpen: boolean
  onToggle: () => void
  chats: Chat[]
  currentChatId: string | null
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void
  onRenameChat: (chatId: string, newTitle: string) => void
  onPinChat: (chatId: string) => void
  onOpenTool: (toolId: string) => void
}

const MEDICAL_TOOLS = [
  {
    id: "symptom-analyzer",
    label: "Symptom Analyzer",
    description: "Analyze symptoms and conditions",
    icon: Stethoscope,
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    id: "drug-lookup",
    label: "Drug Lookup",
    description: "Search medication information",
    icon: Pill,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "first-aid",
    label: "First Aid Guide",
    description: "Emergency first aid instructions",
    icon: Heart,
    gradient: "from-rose-500 to-pink-500",
  },
  {
    id: "health-reports",
    label: "Health Reports",
    description: "Generate health summaries",
    icon: FileText,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    id: "emergency-info",
    label: "Emergency Info",
    description: "Critical emergency contacts",
    icon: AlertTriangle,
    gradient: "from-amber-500 to-orange-500",
  },
]

export default function AppSidebar({
  isOpen,
  onToggle,
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onPinChat,
  onOpenTool,
}: AppSidebarProps) {
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Sort chats: pinned first, then by date
  const pinnedChats = chats
    .filter((c) => c.isPinned)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  const unpinnedChats = chats
    .filter((c) => !c.isPinned)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const startEditing = (chat: Chat) => {
    setEditingChatId(chat.id)
    setEditTitle(chat.title)
  }

  const saveEdit = () => {
    if (editingChatId && editTitle.trim()) {
      onRenameChat(editingChatId, editTitle.trim())
    }
    setEditingChatId(null)
    setEditTitle("")
  }

  const cancelEdit = () => {
    setEditingChatId(null)
    setEditTitle("")
  }

  const handleDeleteClick = (chatId: string) => {
    setChatToDelete(chatId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (chatToDelete) {
      onDeleteChat(chatToDelete)
    }
    setDeleteDialogOpen(false)
    setChatToDelete(null)
  }

  // Share chat as JSON
  const handleShareChat = useCallback(async (chat: Chat) => {
    const exportData = {
      title: chat.title,
      createdAt: chat.createdAt,
      messages: chat.messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
    }
    const jsonString = JSON.stringify(exportData, null, 2)

    try {
      await navigator.clipboard.writeText(jsonString)
      setCopiedId(chat.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [])

  // Download chat as JSON file
  const handleDownloadChat = useCallback((chat: Chat) => {
    const exportData = {
      title: chat.title,
      createdAt: chat.createdAt,
      messages: chat.messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
    }
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `medic-chat-${chat.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const renderChatItem = (chat: Chat, index: number) => (
    <motion.div
      key={chat.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group"
      role="listitem"
      draggable={chat.isPinned}
    >
      {editingChatId === chat.id ? (
        <div className="flex items-center gap-1 rounded-lg border border-primary/50 bg-muted p-1">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit()
              if (e.key === "Escape") cancelEdit()
            }}
            className="flex-1 bg-transparent px-2 py-1 text-sm text-foreground focus:outline-none"
            autoFocus
            aria-label="Edit conversation title"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={saveEdit}
            className="h-8 w-8 text-primary touch-target"
            aria-label="Save title"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={cancelEdit}
            className="h-8 w-8 text-muted-foreground touch-target"
            aria-label="Cancel editing"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm transition-all duration-200 ${
            currentChatId === chat.id
              ? "bg-primary/10 text-foreground border border-primary/20"
              : "text-foreground hover:bg-muted/60 border border-transparent"
          }`}
        >
          {/* Pin indicator */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
            {chat.isPinned ? (
              <Pin className="h-4 w-4 text-primary" />
            ) : (
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          <button
            onClick={() => onSelectChat(chat.id)}
            className="flex-1 truncate text-left focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
            aria-current={currentChatId === chat.id ? "true" : undefined}
          >
            {chat.title}
          </button>

          {/* 3-dot menu with smooth animation */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted/80 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring transition-opacity touch-target"
                aria-label="Chat options"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-popover border-border shadow-elevated z-[var(--z-dropdown)]"
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onPinChat(chat.id)
                }}
                className="cursor-pointer"
              >
                {chat.isPinned ? (
                  <>
                    <PinOff className="mr-2 h-4 w-4" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="mr-2 h-4 w-4" />
                    Pin
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  startEditing(chat)
                }}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleShareChat(chat)
                }}
                className="cursor-pointer"
              >
                {copiedId === chat.id ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-primary">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy as JSON
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownloadChat(chat)
                }}
                className="cursor-pointer"
              >
                <Download className="mr-2 h-4 w-4" />
                Download JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteClick(chat.id)
                }}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </motion.div>
  )

  return (
    <TooltipProvider>
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            {/* Mobile overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed left-0 top-0 z-[var(--z-sidebar)] flex h-full w-72 flex-col border-r border-border bg-background lg:relative lg:z-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-accent animate-heartbeat">
                    <Activity className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-foreground">MEDIC</h1>
                    <p className="text-[10px] text-muted-foreground">AI Medical Assistant</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className="h-8 w-8 lg:hidden"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* New chat button */}
              <div className="p-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={onNewChat} className="w-full gap-2 gradient-accent text-primary-foreground">
                    <Plus className="h-4 w-4" />
                    New Chat
                  </Button>
                </motion.div>
              </div>

              <ScrollArea className="flex-1">
                {/* Pinned chats */}
                {pinnedChats.length > 0 && (
                  <div className="px-3 py-2">
                    <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Pinned
                    </h3>
                    <div className="space-y-1" role="list" aria-label="Pinned conversations">
                      {pinnedChats.map((chat, index) => renderChatItem(chat, index))}
                    </div>
                  </div>
                )}

                {/* Recent chats */}
                <div className="px-3 py-2">
                  <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Recent Chats
                  </h3>
                  <div className="space-y-1" role="list" aria-label="Recent conversations">
                    {unpinnedChats.map((chat, index) => renderChatItem(chat, index))}

                    {chats.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground/40" />
                        <p className="text-xs text-muted-foreground">No conversations yet</p>
                        <p className="text-[10px] text-muted-foreground/60">Start a new chat to begin</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical tools */}
                <div className="px-3 py-2">
                  <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Medical Tools
                  </h3>
                  <div className="space-y-2">
                    {MEDICAL_TOOLS.map((tool, index) => (
                      <motion.button
                        key={tool.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => onOpenTool(tool.id)}
                        className="group flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring magnetic-hover"
                        aria-label={`Open ${tool.label}`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${tool.gradient}`}
                        >
                          <tool.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{tool.label}</p>
                          <p className="truncate text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </ScrollArea>

              {/* Footer with developer credit */}
              <div className="border-t border-border p-3 space-y-1">
                <p className="text-center text-[10px] text-muted-foreground">MEDIC v1.0 - AI Medical Assistant</p>
                <p className="text-center developer-credit text-muted-foreground">Developed by Gourav Dutta</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Collapsed toggle for desktop */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className="fixed left-4 top-4 z-30 hidden rounded-lg border border-border bg-card p-2 shadow-md hover:bg-muted lg:block focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Open sidebar"
        >
          <ChevronLeft className="h-5 w-5 rotate-180" />
        </motion.button>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-popover border-border shadow-cinematic">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted hover:bg-muted/80">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}
