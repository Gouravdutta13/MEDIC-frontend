/**
 * Help & Docs page - placeholder route for help menu
 */
"use client"

import { motion } from "framer-motion"
import { HelpCircle, ArrowLeft, Book, MessageCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function HelpPage() {
  const router = useRouter()

  const helpItems = [
    { icon: Book, title: "Documentation", description: "Read the full MEDIC documentation" },
    { icon: MessageCircle, title: "FAQ", description: "Frequently asked questions" },
    { icon: Mail, title: "Contact Support", description: "Get help from our team" },
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-6 mx-auto flex h-20 w-20 items-center justify-center rounded-2xl gradient-accent shadow-glow">
            <HelpCircle className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Help & Documentation</h1>
          <p className="text-muted-foreground">Get help with MEDIC AI Medical Assistant</p>
        </div>

        <div className="space-y-3 mb-8">
          {helpItems.map((item, index) => (
            <motion.button
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="text-center">
          <Button onClick={() => router.back()} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
