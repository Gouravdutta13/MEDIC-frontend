/**
 * Sign out page - placeholder route for sign out
 */
"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function SignOutPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear local storage on mount
    localStorage.removeItem("medic-preferences")
    localStorage.removeItem("medic-chats")
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-6 mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
          <LogOut className="h-10 w-10 text-muted-foreground" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Signed Out</h1>

        <p className="text-muted-foreground mb-8">
          You have been signed out successfully. Your local data has been cleared.
        </p>

        <Button
          onClick={() => router.push("/")}
          className="gradient-accent text-primary-foreground gap-2"
        >
          Return to MEDIC
        </Button>
      </motion.div>
    </div>
  )
}
