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

  // Sort chats
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

  // Copy JSON
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
    try {
      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
      setCopiedId(chat.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error(err)
    }
  }, [])

  // Download JSON
  const handleDownloadChat = useCallback((chat: Chat) => {
    const exportData = {
      title: chat.title,
      createdAt: chat.createdAt,
      messages: chat.messages,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `medic-chat-${chat.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  // Chat item renderer
  const renderChatItem = (chat: Chat, index: number) => (
    <motion.div
      key={chat.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group w-full min-w-0"
    >
      {editingChatId === chat.id ? (
        <div className="flex items-center gap-1 rounded-lg border border-primary/50 bg-muted p-1 min-w-0">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit()
              if (e.key === "Escape") cancelEdit()
            }}
            className="flex-1 min-w-0 bg-transparent px-2 py-1 text-sm text-foreground focus:outline-none max-w-full"
            autoFocus
            maxLength={100}
          />
          <Button variant="ghost" size="icon" onClick={saveEdit} className="h-8 w-8">
            <Check className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={cancelEdit} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`flex w-full min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-left text-sm transition-all ${
            currentChatId === chat.id
              ? "bg-primary/10 border border-primary/20"
              : "hover:bg-muted/60 border border-transparent"
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
            {chat.isPinned ? <Pin className="h-4 w-4 text-primary" /> : <MessageSquare className="h-4 w-4" />}
          </div>

          <button
            onClick={() => onSelectChat(chat.id)}
            className="flex-1 min-w-0 px-1 text-left overflow-hidden"
            title={chat.title}
          >
            <span className="block truncate text-sm">{chat.title}</span>
          </button>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted/80"
              >
                <MoreVertical className="h-4 w-4" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onPinChat(chat.id)}>
                {chat.isPinned ? (
                  <>
                    <PinOff className="mr-2 h-4 w-4" /> Unpin
                  </>
                ) : (
                  <>
                    <Pin className="mr-2 h-4 w-4" /> Pin
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => startEditing(chat)}>
                <Pencil className="mr-2 h-4 w-4" /> Rename
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => handleShareChat(chat)}>
                {copiedId === chat.id ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-primary" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" /> Copy JSON
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handleDownloadChat(chat)}>
                <Download className="mr-2 h-4 w-4" /> Download JSON
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDeleteClick(chat.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </motion.div>
  )

  return (
    <TooltipProvider>
      <AnimatePresence>
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
              className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-border bg-background shadow-lg lg:z-40"
            >
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-border p-4 bg-background">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-accent animate-heartbeat">
                    <Activity className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">MEDIC</h1>
                    <p className="text-[10px] text-muted-foreground">AI Medical Assistant</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className="h-8 w-8 lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* New chat */}
              <div className="shrink-0 p-3 bg-background">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={onNewChat} className="w-full gap-2 gradient-accent text-white">
                    <Plus className="h-4 w-4" />
                    New Chat
                  </Button>
                </motion.div>
              </div>

              {/* FIXED: ScrollArea height */}
              <ScrollArea className="flex-1 min-h-0 w-full">
                {/* Pinned */}
                {pinnedChats.length > 0 && (
                  <div className="px-3 py-2 w-full min-w-0">
                    <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
                      Pinned
                    </h3>
                    <div className="space-y-1 w-full min-w-0">
                      {pinnedChats.map((chat, index) => renderChatItem(chat, index))}
                    </div>
                  </div>
                )}

                {/* Recent */}
                <div className="px-3 py-2 w-full min-w-0">
                  <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
                    Recent Chats
                  </h3>
                  <div className="space-y-1 w-full min-w-0">
                    {unpinnedChats.map((chat, index) => renderChatItem(chat, index))}
                  </div>
                </div>

                {/* Tools */}
                <div className="px-3 py-2 w-full min-w-0">
                  <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
                    Medical Tools
                  </h3>
                  <div className="space-y-2 w-full">
                    {MEDICAL_TOOLS.map((tool, index) => (
                      <motion.button
                        key={tool.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onOpenTool(tool.id)}
                        className="group flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/30 hover:shadow-md"
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${tool.gradient}`}
                        >
                          <tool.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{tool.label}</p>
                          <p className="truncate text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="shrink-0 border-t border-border p-3 text-center text-[10px] text-muted-foreground space-y-1 bg-background">
                <p>MEDIC v1.0 — AI Medical Assistant</p>
                <p className="developer-credit">Developed by Gourav Dutta</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className="fixed left-4 top-4 z-30 hidden rounded-lg border border-border bg-card p-2 shadow-md lg:block"
        >
          <ChevronLeft className="h-5 w-5 rotate-180" />
        </motion.button>
      )}

      {/* Delete dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}
