/**
 * LoadingScreen - Animated splash with heartbeat and developer credit
 * Developed by Gourav Dutta
 */

"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Activity } from "lucide-react"

interface LoadingScreenProps {
  minDisplayTime?: number
  onComplete?: () => void
}

export default function LoadingScreen({ minDisplayTime = 2000, onComplete }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, minDisplayTime)

    return () => clearTimeout(timer)
  }, [minDisplayTime, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          role="status"
          aria-label="Loading MEDIC application"
        >
          {/* Background gradient orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.3, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute -top-1/4 -left-1/4 h-1/2 w-1/2 rounded-full bg-primary/20 blur-[100px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.2, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-secondary/20 blur-[100px]"
            />
          </div>

          {/* Logo container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative flex flex-col items-center"
          >
            {/* Animated heart with pulse ring */}
            <div className="relative mb-8">
              {/* Pulse rings */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.5, 2] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border-2 border-primary"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.3, 0], scale: [0.8, 1.3, 1.8] }}
                transition={{ duration: 2, delay: 0.3, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border-2 border-secondary"
              />

              {/* Heart icon with heartbeat animation */}
              <motion.div
                animate={{ scale: [1, 1.08, 1, 1.08, 1] }}
                transition={{
                  duration: 1.8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full gradient-accent shadow-glow"
              >
                <Heart className="h-10 w-10 text-primary-foreground" fill="currentColor" />
              </motion.div>
            </div>

            {/* Logo text */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-2 text-4xl font-bold tracking-tight"
            >
              <span className="gradient-text">MEDIC</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-sm text-muted-foreground"
            >
              AI Medical Assistant
            </motion.p>

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-8 flex items-center gap-2"
            >
              <Activity className="h-4 w-4 animate-pulse text-primary" />
              <span className="text-xs text-muted-foreground">Initializing...</span>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
              className="mt-4 h-0.5 w-48 origin-left rounded-full gradient-accent"
            />
          </motion.div>

          {/* Footer with developer credit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="absolute bottom-8 flex flex-col items-center gap-1"
          >
            <p className="text-xs text-muted-foreground">Version 1.0.0</p>
            <p className="developer-credit text-muted-foreground">Developed by Gourav Dutta</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
