/**
 * MessageActions - Action buttons with proper icon sizing (4x4)
 * Features: Copy, share, export, flag, save, speak
 * Developed by Gourav Dutta
 */

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Share2, Download, Flag, Bookmark, Check, MoreHorizontal, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MessageActionsProps {
  content: string
  messageId: string
  onCopy: () => void
  onShare: () => void
  onExport: () => void
  onFlag: () => void
  onSave: () => void
  onSpeak?: () => void
  isSaved?: boolean
  isFlagged?: boolean
}

export default function MessageActions({
  content,
  onCopy,
  onShare,
  onExport,
  onFlag,
  onSave,
  onSpeak,
  isSaved = false,
  isFlagged = false,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      onCopy()
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <TooltipProvider>
      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1">
        {/* Copy button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground focus:ring-2 focus:ring-ring"
              onClick={handleCopy}
              aria-label="Copy message"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Check className="h-4 w-4 text-primary" />
                  </motion.div>
                ) : (
                  <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Copy className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-popover text-popover-foreground border-border shadow-elevated">
            <p>{copied ? "Copied!" : "Copy"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Speak button (TTS) */}
        {onSpeak && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground focus:ring-2 focus:ring-ring"
                onClick={onSpeak}
                aria-label="Read aloud"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground border-border shadow-elevated">
              <p>Read aloud</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Save button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isSaved ? "text-primary" : "text-muted-foreground"} hover:text-foreground focus:ring-2 focus:ring-ring`}
              onClick={onSave}
              aria-label={isSaved ? "Remove from saved" : "Save to profile"}
              aria-pressed={isSaved}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-popover text-popover-foreground border-border shadow-elevated">
            <p>{isSaved ? "Saved" : "Save"}</p>
          </TooltipContent>
        </Tooltip>

        {/* More actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground focus:ring-2 focus:ring-ring"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border shadow-elevated z-[var(--z-dropdown)]">
            <DropdownMenuItem onClick={onShare} className="cursor-pointer">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExport} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Export
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onFlag} className={`cursor-pointer ${isFlagged ? "text-destructive" : ""}`}>
              <Flag className={`mr-2 h-4 w-4 ${isFlagged ? "fill-current" : ""}`} />
              {isFlagged ? "Flagged" : "Report issue"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    </TooltipProvider>
  )
}
