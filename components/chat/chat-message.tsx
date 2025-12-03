/**
 * ChatMessage - Message bubble with proper animations
 * Features: Edit/delete, source cards, markdown rendering
 * Developed by Gourav Dutta
 */

"use client"

import { useState, memo } from "react"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { User, Bot, ExternalLink, AlertCircle, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import MessageActions from "./message-actions"
import type { Message, Source } from "@/lib/types"
import { speak } from "@/lib/voice"
import { logAnalyticsEvent } from "@/lib/api"

interface ChatMessageProps {
  message: Message
  onFlagMessage: (messageId: string) => void
  onSaveMessage: (messageId: string) => void
  onEditMessage?: (messageId: string, newContent: string) => void
  onDeleteMessage?: (messageId: string) => void
}

const SourceCard = memo(function SourceCard({ source }: { source: Source }) {
  return (
    <motion.a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="line-clamp-1 text-sm font-medium text-foreground">{source.title}</h4>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </div>
      <p className="line-clamp-2 text-xs text-muted-foreground">{source.snippet}</p>
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          {source.type}
        </span>
        <span className="text-[10px] text-muted-foreground">Relevance: {Math.round(source.score * 100)}%</span>
      </div>
    </motion.a>
  )
})

function ChatMessage({ message, onFlagMessage, onSaveMessage, onEditMessage, onDeleteMessage }: ChatMessageProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const isUser = message.role === "user"
  const isLongMessage = message.content.length > 1000

  const handleSpeak = () => {
    speak(message.content)
    logAnalyticsEvent("message_spoken", { messageId: message.id })
  }

  const handleCopy = () => {
    logAnalyticsEvent("message_copied", { messageId: message.id })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "MEDIC Conversation",
        text: message.content,
      })
    }
    logAnalyticsEvent("message_shared", { messageId: message.id })
  }

  const handleExport = () => {
    const blob = new Blob([message.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `medic-message-${message.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
    logAnalyticsEvent("message_exported", { messageId: message.id })
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditContent(message.content)
  }

  const handleSaveEdit = () => {
    if (onEditMessage && editContent.trim()) {
      onEditMessage(message.id, editContent.trim())
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(message.content)
  }

  const handleDelete = () => {
    if (onDeleteMessage) {
      onDeleteMessage(message.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 0.06,
      }}
      className={`group flex gap-4 px-4 py-4 ${isUser ? "justify-end" : ""}`}
      role="article"
      aria-label={`${isUser ? "Your" : "MEDIC's"} message`}
    >
      {/* Avatar - assistant only */}
      {!isUser && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-accent shadow-glow">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
      )}

      {/* Message content */}
      <div className={`flex max-w-[80%] min-w-0 flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        {/* Confidence indicator for assistant */}
        {!isUser && message.confidence && message.confidence !== "high" && (
          <div className="flex items-center gap-1.5 text-xs">
            <AlertCircle className="h-3 w-3 text-amber-500" />
            <span className="text-amber-600 dark:text-amber-400">Confidence: {message.confidence}</span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3 break-words overflow-hidden ${
            isUser ? "gradient-accent text-primary-foreground" : "bg-card border border-border"
          }`}
        >
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[80px] max-h-[300px] bg-transparent text-sm resize-none focus:outline-none overflow-y-auto break-words overflow-wrap-break-word"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div
                className={`prose prose-sm max-w-none break-words overflow-hidden ${
                  isUser ? "prose-invert" : "dark:prose-invert"
                } ${!isExpanded && isLongMessage ? "line-clamp-6" : ""}`}
              >
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="mb-3 mt-4 text-lg font-bold text-foreground first:mt-0">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-2 mt-3 text-base font-semibold text-foreground">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-2 mt-2 text-sm font-semibold text-foreground">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p
                        className={`mb-2 leading-relaxed last:mb-0 ${isUser ? "text-primary-foreground" : "text-foreground"}`}
                      >
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
                    li: ({ children }) => (
                      <li className={isUser ? "text-primary-foreground" : "text-foreground"}>{children}</li>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2 hover:text-primary/80"
                      >
                        {children}
                      </a>
                    ),
                    code: ({ children, className }) => {
                      const isBlock = className?.includes("language-")
                      return isBlock ? (
                        <pre className="my-2 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs">
                          <code className="text-foreground">{children}</code>
                        </pre>
                      ) : (
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                          {children}
                        </code>
                      )
                    },
                    blockquote: ({ children }) => (
                      <blockquote className="my-2 border-l-2 border-primary/50 pl-3 italic text-muted-foreground">
                        {children}
                      </blockquote>
                    ),
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>

              {isLongMessage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      Show more
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>

        {/* Message actions */}
        {!message.isStreaming && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isUser && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={handleEdit}
                  aria-label="Edit message"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={handleDelete}
                  aria-label="Delete message"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}

            {!isUser && (
              <MessageActions
                content={message.content}
                messageId={message.id}
                onCopy={handleCopy}
                onShare={handleShare}
                onExport={handleExport}
                onFlag={() => onFlagMessage(message.id)}
                onSave={() => onSaveMessage(message.id)}
                onSpeak={handleSpeak}
                isSaved={message.metadata?.savedToProfile}
                isFlagged={message.metadata?.flagged}
              />
            )}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* Avatar - user only */}
      {isUser && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted border border-border">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  )
}

export default memo(ChatMessage)
