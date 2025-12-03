/**
 * EmergencyInfo - Critical emergency contacts and information
 */

"use client"

import { motion } from "framer-motion"
import { X, AlertTriangle, Phone, MapPin, Heart, Shield, Ambulance, Flame, BadgeAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EmergencyInfoProps {
  onClose: () => void
}

const EMERGENCY_CONTACTS = [
  {
    id: "911",
    name: "Emergency Services",
    number: "911",
    description: "Police, Fire, Medical Emergency",
    icon: Ambulance,
    color: "from-red-500 to-rose-500",
  },
  {
    id: "poison",
    name: "Poison Control",
    number: "1-800-222-1222",
    description: "24/7 Poison emergency assistance",
    icon: Shield,
    color: "from-purple-500 to-violet-500",
  },
  {
    id: "suicide",
    name: "Suicide & Crisis Lifeline",
    number: "988",
    description: "24/7 mental health crisis support",
    icon: Heart,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "domestic",
    name: "Domestic Violence Hotline",
    number: "1-800-799-7233",
    description: "24/7 confidential support",
    icon: BadgeAlert,
    color: "from-amber-500 to-orange-500",
  },
]

const EMERGENCY_TIPS = [
  "Stay calm and speak clearly when calling emergency services",
  "Know your exact location - address, landmarks, cross streets",
  "Do not hang up until the dispatcher tells you to",
  "Follow all instructions given by emergency dispatchers",
  "If safe, stay on the line and wait for help to arrive",
]

export default function EmergencyInfo({ onClose }: EmergencyInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="glass-strong w-full max-w-lg overflow-hidden rounded-2xl border border-border shadow-cinematic"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-destructive/30 bg-destructive/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Emergency Information</h2>
              <p className="text-xs text-muted-foreground">Critical contacts and resources</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-4 space-y-4">
            {/* Main emergency */}
            <motion.a
              href="tel:911"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between rounded-xl bg-gradient-to-r from-destructive to-red-600 p-5 text-white"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                  <Phone className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Call 911</p>
                  <p className="text-sm opacity-90">For life-threatening emergencies</p>
                </div>
              </div>
            </motion.a>

            {/* Other contacts */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Other Emergency Lines</h3>
              {EMERGENCY_CONTACTS.slice(1).map((contact, index) => (
                <motion.a
                  key={contact.id}
                  href={`tel:${contact.number.replace(/-/g, "")}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:border-primary/50"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${contact.color}`}
                  >
                    <contact.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-primary">{contact.number}</p>
                    <p className="text-[10px] text-muted-foreground">Tap to call</p>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Tips */}
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <h3 className="mb-3 flex items-center gap-2 font-medium text-foreground">
                <Flame className="h-4 w-4 text-amber-500" />
                When Calling Emergency Services
              </h3>
              <ul className="space-y-2">
                {EMERGENCY_TIPS.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Location reminder */}
            <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3">
              <MapPin className="h-5 w-5 text-primary" />
              <p className="text-sm text-foreground/90">
                Know your location before calling. Include address, floor, and any landmarks.
              </p>
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  )
}
