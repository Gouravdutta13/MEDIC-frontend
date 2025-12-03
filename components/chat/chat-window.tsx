/**
 * ChatWindow - Main chat interface with improved disclaimer visibility
 * Fixed scroll behavior, proper dark/light mode contrast
 * Developed by Gourav Dutta
 */

"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Sparkles } from "lucide-react"
import ChatMessage from "./chat-message"
import TypingIndicator from "./typing-indicator"
import ChatInput from "./chat-input"
import type { Message } from "@/lib/types"
import { sendMessage, generateMessageId, logAnalyticsEvent } from "@/lib/api"

interface ChatWindowProps {
  chatId: string
  initialMessages?: Message[]
  onMessagesChange?: (messages: Message[]) => void
}

const FOLLOW_UP_SUGGESTIONS = [
  "What are the common symptoms?",
  "When should I see a doctor?",
  "Are there home remedies?",
  "What tests might be needed?",
]

export default function ChatWindow({ chatId, initialMessages = [], onMessagesChange }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isStreaming, setIsStreaming] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageCountRef = useRef(0)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior, block: "end" })
      }
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
      }
    })
  }, [])

  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      scrollToBottom(messages.length === lastMessageCountRef.current + 1 ? "smooth" : "instant")
    }
    lastMessageCountRef.current = messages.length
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isStreaming) {
      scrollToBottom()
    }
  }, [isStreaming, messages, scrollToBottom])

  useEffect(() => {
    onMessagesChange?.(messages)
  }, [messages, onMessagesChange])

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    scrollToBottom("instant")
    setIsStreaming(true)
    logAnalyticsEvent("message_sent", { chatId })

    const assistantMessageId = generateMessageId()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages((prev) => [...prev, assistantMessage])

    try {
      const stream = await sendMessage(content, chatId)
      let fullContent = ""

      for await (const chunk of stream) {
        fullContent += chunk.content

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: fullContent,
                  sources: chunk.done ? chunk.sources : undefined,
                  isStreaming: !chunk.done,
                }
              : msg,
          ),
        )
        scrollToBottom()
      }
    } catch (error) {
      console.error("[ChatWindow] Error streaming response:", error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: "I apologize, but I encountered an error processing your request. Please try again.",
                isStreaming: false,
                confidence: "low",
              }
            : msg,
        ),
      )
    } finally {
      setIsStreaming(false)
      scrollToBottom()
    }
  }

  const handleFlagMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              metadata: { ...msg.metadata, flagged: !msg.metadata?.flagged },
            }
          : msg,
      ),
    )
    logAnalyticsEvent("message_flagged", { messageId })
  }

  const handleSaveMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              metadata: { ...msg.metadata, savedToProfile: !msg.metadata?.savedToProfile },
            }
          : msg,
      ),
    )
    logAnalyticsEvent("message_saved", { messageId })
  }

  const handleEditMessage = (messageId: string, newContent: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, content: newContent } : msg)))
    logAnalyticsEvent("message_edited", { messageId })
  }

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
    logAnalyticsEvent("message_deleted", { messageId })
  }

  const handleFollowUp = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  return (
    <div className="flex h-full flex-col bg-background" role="main" id="main-content">
      {/* Medical disclaimer - FIXED contrast for both themes */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="shrink-0 border-b border-amber-500/30 bg-amber-500/10 px-4 py-3"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Medical Disclaimer</p>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                  I am an AI medical assistant. I cannot diagnose conditions or prescribe treatments. Always consult
                  qualified healthcare professionals for medical decisions. In emergencies, call your local emergency
                  number immediately.
                </p>
              </div>
              <button
                onClick={() => setShowDisclaimer(false)}
                className="text-xs text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1 transition-colors"
                aria-label="Dismiss disclaimer"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        <div className="py-4 min-h-full flex flex-col">
          {/* Empty state with illustration */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-1 flex-col items-center justify-center px-4 py-16"
            >
              <motion.div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl gradient-accent shadow-glow"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <Sparkles className="h-10 w-10 text-primary-foreground" />
              </motion.div>
              <h2 className="mb-2 text-xl font-semibold text-foreground">How can I help you today?</h2>
              <p className="mb-8 max-w-md text-center text-sm text-muted-foreground">
                Ask me about symptoms, medications, general health questions, or first aid guidance. I'm here to provide
                helpful medical information.
              </p>
              <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
                {[
                  "What causes headaches?",
                  "How do I check my pulse?",
                  "What are signs of dehydration?",
                  "Common cold vs flu symptoms?",
                ].map((suggestion) => (
                  <motion.button
                    key={suggestion}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSendMessage(suggestion)}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Message list */}
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onFlagMessage={handleFlagMessage}
                onSaveMessage={handleSaveMessage}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
              />
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {isStreaming && messages[messages.length - 1]?.content === "" && (
              <div className="px-4 pb-4">
                <TypingIndicator />
              </div>
            )}
          </AnimatePresence>

          {/* Follow-up suggestions */}
          <AnimatePresence>
            {!isStreaming && messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="px-4 py-3"
              >
                <p className="mb-2 text-xs font-medium text-muted-foreground">Follow-up questions:</p>
                <div className="flex flex-wrap gap-2">
                  {FOLLOW_UP_SUGGESTIONS.map((suggestion) => (
                    <motion.button
                      key={suggestion}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleFollowUp(suggestion)}
                      className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} className="h-px shrink-0" />
        </div>
      </div>

      <div className="shrink-0">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isStreaming} />
      </div>
    </div>
  )
}
