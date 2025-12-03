/**
 * EmptyState - Beautiful empty state with SVG illustration
 * S-COMBO V2 - Premium UI
 * Developed by Gourav Dutta
 */

"use client"

import { motion } from "framer-motion"
import { MessageSquare, Plus, Sparkles, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  type?: "chat" | "search" | "messages" | "general"
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ type = "general", title, description, actionLabel, onAction }: EmptyStateProps) {
  const configs = {
    chat: {
      title: "No conversations yet",
      description: "Start a new chat to begin your medical consultation",
      actionLabel: "New Chat",
      icon: MessageSquare,
    },
    search: {
      title: "No results found",
      description: "Try adjusting your search terms or filters",
      actionLabel: "Clear Search",
      icon: Sparkles,
    },
    messages: {
      title: "Start a conversation",
      description: "Ask me about symptoms, medications, or health concerns",
      actionLabel: "Get Started",
      icon: Heart,
    },
    general: {
      title: "Nothing here yet",
      description: "This section is empty",
      actionLabel: "Add New",
      icon: Plus,
    },
  }

  const config = configs[type]
  const Icon = config.icon
  const displayTitle = title || config.title
  const displayDescription = description || config.description
  const displayAction = actionLabel || config.actionLabel

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* SVG Illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
        className="relative mb-6"
      >
        {/* Background circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            className="h-32 w-32 rounded-full bg-primary/10"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 3, delay: 0.5, repeat: Number.POSITIVE_INFINITY }}
            className="h-24 w-24 rounded-full bg-secondary/10"
          />
        </div>

        {/* Icon container */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-border"
        >
          <Icon className="h-10 w-10 text-muted-foreground" />
        </motion.div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-2 text-lg font-semibold text-foreground"
      >
        {displayTitle}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6 max-w-sm text-sm text-muted-foreground"
      >
        {displayDescription}
      </motion.p>

      {onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button onClick={onAction} className="gap-2 gradient-accent text-primary-foreground">
            <Plus className="h-4 w-4" />
            {displayAction}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
