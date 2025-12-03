/**
 * TypingIndicator - Pulsing dots with gradient glow
 * Developed by Gourav Dutta
 */

"use client"

import { motion } from "framer-motion"
import { Bot } from "lucide-react"

interface TypingIndicatorProps {
  message?: string
}

export default function TypingIndicator({ message = "MEDIC is thinking..." }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-4 px-4 py-3"
      role="status"
      aria-live="polite"
      aria-label="MEDIC is typing a response"
    >
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-accent shadow-glow">
        <Bot className="h-5 w-5 text-primary-foreground" />
      </div>

      {/* Content */}
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
        {/* Pulsing dots with gradient */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                delay: i * 0.15,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="h-2.5 w-2.5 rounded-full gradient-accent shadow-glow"
            />
          ))}
        </div>

        {/* Shimmer text */}
        <div className="relative overflow-hidden">
          <span className="text-sm text-muted-foreground">{message}</span>
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            aria-hidden="true"
          />
        </div>
      </div>
    </motion.div>
  )
}
