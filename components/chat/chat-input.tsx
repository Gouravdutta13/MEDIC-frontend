/**
 * ChatInput - Message input with animated send button
 * Features: Voice input, file attachment, proper icon sizing
 * Developed by Gourav Dutta
 */

"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Mic, MicOff, Paperclip, X, Languages, Volume2, VolumeX, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { startRecording, stopRecording, isSTTSupported, isTTSSupported, SUPPORTED_LANGUAGES } from "@/lib/voice"
import { logAnalyticsEvent } from "@/lib/api"

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void
  isLoading?: boolean
  disabled?: boolean
}

export default function ChatInput({ onSendMessage, isLoading = false, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [language, setLanguage] = useState("en-US")
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sttSupported = isSTTSupported()
  const ttsSupported = isTTSSupported()

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [message])

  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || isLoading || disabled) return

    onSendMessage(trimmedMessage, attachments.length > 0 ? attachments : undefined)
    setMessage("")
    setAttachments([])
    logAnalyticsEvent("message_sent", { hasAttachments: attachments.length > 0 })

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [message, attachments, isLoading, disabled, onSendMessage])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleListening = useCallback(() => {
    if (!sttSupported) return

    if (isListening) {
      stopRecording()
      setIsListening(false)
      if (transcript) {
        setMessage((prev) => (prev ? `${prev} ${transcript}` : transcript))
        setTranscript("")
      }
    } else {
      const result = startRecording((event) => {
        setTranscript(event.transcript)
        if (event.isFinal) {
          setMessage((prev) => (prev ? `${prev} ${event.transcript}` : event.transcript))
          setTranscript("")
        }
      }, language)
      if (result) {
        setIsListening(true)
        logAnalyticsEvent("voice_started")
      }
    }
  }, [sttSupported, isListening, transcript, language])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter((file) => {
      const isValidType = file.type === "application/pdf" || file.type === "text/plain"
      const isValidSize = file.size <= 10 * 1024 * 1024
      return isValidType && isValidSize
    })
    setAttachments((prev) => [...prev, ...validFiles])
    logAnalyticsEvent("file_attached", { count: validFiles.length })
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const canSend = message.trim().length > 0 && !isLoading && !disabled

  return (
    <TooltipProvider>
      <div className="shrink-0 border-t border-border bg-background p-4">
        {/* Attachments preview */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 flex flex-wrap gap-2"
            >
              {attachments.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5"
                >
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="max-w-[150px] truncate text-xs text-foreground">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice transcript preview */}
        <AnimatePresence>
          {isListening && transcript && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3"
            >
              <div className="flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-3 py-2">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scaleY: [1, 2, 1] }}
                      transition={{ duration: 0.5, delay: i * 0.1, repeat: Number.POSITIVE_INFINITY }}
                      className="h-4 w-1 rounded-full bg-primary"
                    />
                  ))}
                </div>
                <span className="text-sm text-foreground">{transcript}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input area */}
        <div className="flex items-end gap-3">
          {/* Left actions */}
          <div className="flex shrink-0 items-center gap-1 pb-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted"
                  aria-label="Attach file"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground border-border shadow-elevated">
                <p>Attach PDF or TXT (max 10MB)</p>
              </TooltipContent>
            </Tooltip>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              multiple
              onChange={handleFileChange}
              className="hidden"
              aria-hidden="true"
            />

            {/* Language selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={disabled || !sttSupported}
                  className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted"
                  aria-label="Select language"
                >
                  <Languages className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-popover border-border shadow-elevated z-[var(--z-dropdown)]"
                align="start"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`cursor-pointer ${language === lang.code ? "bg-primary/10 text-primary" : ""}`}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* TTS mute toggle */}
            {ttsSupported && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                    disabled={disabled}
                    className={`h-10 w-10 hover:bg-muted ${isMuted ? "text-destructive" : "text-muted-foreground"} hover:text-foreground`}
                    aria-label={isMuted ? "Unmute TTS" : "Mute TTS"}
                    aria-pressed={isMuted}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-popover text-popover-foreground border-border shadow-elevated">
                  <p>{isMuted ? "Unmute voice" : "Mute voice"}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Text input */}
          <div className="relative flex-1 rounded-2xl border border-border bg-muted/50 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/25 transition-all">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask MEDIC a health question..."
              disabled={disabled || isLoading}
              rows={1}
              className="max-h-[200px] min-h-[52px] w-full resize-none bg-transparent px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 break-words overflow-wrap-break-word"
              aria-label="Message input"
            />
          </div>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-1 pb-1">
            {/* Voice input */}
            {sttSupported && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleListening}
                    disabled={disabled}
                    className={`h-10 w-10 transition-all ${
                      isListening
                        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    aria-label={isListening ? "Stop recording" : "Start recording"}
                    aria-pressed={isListening}
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-popover text-popover-foreground border-border shadow-elevated">
                  <p>{isListening ? "Stop recording" : "Voice input"}</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={canSend ? { scale: 1.05, y: -2 } : {}}
                  whileTap={canSend ? { scale: 0.92 } : {}}
                  transition={{ type: "spring", stiffness: 500, damping: 20, duration: 0.15 }}
                >
                  <Button
                    onClick={handleSend}
                    disabled={!canSend}
                    className="h-10 w-10 gradient-accent text-primary-foreground shadow-glow btn-send disabled:opacity-50 disabled:shadow-none"
                    aria-label="Send message"
                  >
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0, rotate: 0 }}
                          animate={{ opacity: 1, rotate: 360 }}
                          exit={{ opacity: 0 }}
                          transition={{ rotate: { duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" } }}
                        >
                          <Loader2 className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="send"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.1 }}
                        >
                          <Send className="h-5 w-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground border-border shadow-elevated">
                <p>Send (Enter)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Press Enter to send · Shift + Enter for new line
          {!sttSupported && " · Voice input not supported in this browser"}
        </p>
      </div>
    </TooltipProvider>
  )
}
