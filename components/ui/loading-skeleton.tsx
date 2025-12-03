/**
 * LoadingSkeleton - Animated skeleton for message streaming
 * S-COMBO V2 - Premium loading states
 * Developed by Gourav Dutta
 */

"use client"

import { motion } from "framer-motion"
import { Bot } from "lucide-react"

interface LoadingSkeletonProps {
  lines?: number
  showAvatar?: boolean
}

export default function LoadingSkeleton({ lines = 3, showAvatar = true }: LoadingSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-4 px-4 py-4"
      role="status"
      aria-label="Loading content"
    >
      {showAvatar && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-accent shadow-glow animate-pulse">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
      )}

      <div className="flex-1 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`h-4 rounded-lg skeleton ${i === lines - 1 ? "w-2/3" : "w-full"}`}
            style={{
              animationDelay: `${i * 0.15}s`,
              background: `linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground) / 0.15) 50%, hsl(var(--muted)) 100%)`,
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
