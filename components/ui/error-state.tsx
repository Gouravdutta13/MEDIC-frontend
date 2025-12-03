/**
 * ErrorState - Error display for network/voice/STT failures
 * S-COMBO V2 - Graceful error handling
 * Developed by Gourav Dutta
 */

"use client"

import { motion } from "framer-motion"
import { AlertCircle, RefreshCw, WifiOff, Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"

type ErrorType = "network" | "voice" | "stt" | "tts" | "general"

interface ErrorStateProps {
  type?: ErrorType
  title?: string
  message?: string
  onRetry?: () => void
  compact?: boolean
}

const ERROR_CONFIGS: Record<ErrorType, { icon: typeof AlertCircle; title: string; message: string }> = {
  network: {
    icon: WifiOff,
    title: "Connection Lost",
    message: "Unable to reach the server. Please check your internet connection.",
  },
  voice: {
    icon: MicOff,
    title: "Voice Unavailable",
    message: "Voice features are not supported in this browser.",
  },
  stt: {
    icon: Mic,
    title: "Speech Recognition Failed",
    message: "Unable to process your speech. Please try again or type your message.",
  },
  tts: {
    icon: AlertCircle,
    title: "Text-to-Speech Error",
    message: "Unable to read the message aloud. Please try again.",
  },
  general: {
    icon: AlertCircle,
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again.",
  },
}

export default function ErrorState({ type = "general", title, message, onRetry, compact = false }: ErrorStateProps) {
  const config = ERROR_CONFIGS[type]
  const Icon = config.icon
  const displayTitle = title || config.title
  const displayMessage = message || config.message

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3"
        role="alert"
      >
        <Icon className="h-5 w-5 shrink-0 text-destructive" />
        <p className="flex-1 text-sm text-destructive">{displayMessage}</p>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-8 gap-1 text-destructive hover:text-destructive hover:bg-destructive/20"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      role="alert"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10"
      >
        <Icon className="h-8 w-8 text-destructive" />
      </motion.div>

      <h3 className="mb-2 text-lg font-semibold text-foreground">{displayTitle}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{displayMessage}</p>

      {onRetry && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
