/**
 * FirstAidGuide - Emergency first aid instructions
 * Quick reference for common emergency situations
 */

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Heart, Search, Phone, ChevronRight, AlertTriangle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FirstAidGuideProps {
  onClose: () => void
}

interface FirstAidTopic {
  id: string
  title: string
  icon: string
  category: "emergency" | "injury" | "illness"
  steps: string[]
  warning?: string
  callEmergency?: boolean
}

const FIRST_AID_TOPICS: FirstAidTopic[] = [
  {
    id: "cpr",
    title: "CPR (Adult)",
    icon: "❤️",
    category: "emergency",
    callEmergency: true,
    steps: [
      "Call emergency services (911) immediately",
      "Place the person on their back on a firm surface",
      "Place heel of your hand on center of chest",
      "Place other hand on top, fingers interlaced",
      "Push hard and fast - 100-120 compressions per minute",
      "Push at least 2 inches deep",
      "Allow chest to fully recoil between compressions",
      "If trained, give 2 rescue breaths after 30 compressions",
      "Continue until emergency services arrive",
    ],
    warning: "Only perform CPR on someone who is unresponsive and not breathing normally.",
  },
  {
    id: "choking",
    title: "Choking",
    icon: "🫁",
    category: "emergency",
    callEmergency: true,
    steps: [
      "Ask the person if they are choking",
      "If they cannot speak or cough, call 911",
      "Stand behind the person, wrap arms around waist",
      "Make a fist with one hand, place above navel",
      "Grasp fist with other hand",
      "Give quick, upward abdominal thrusts",
      "Repeat until object is expelled or person becomes unconscious",
      "If unconscious, begin CPR",
    ],
  },
  {
    id: "bleeding",
    title: "Severe Bleeding",
    icon: "🩸",
    category: "injury",
    steps: [
      "Apply direct pressure with clean cloth or bandage",
      "Maintain continuous pressure for at least 10 minutes",
      "If blood soaks through, add more cloth on top",
      "Elevate injured area above heart if possible",
      "Do NOT remove embedded objects",
      "Apply tourniquet only as last resort for life-threatening limb bleeding",
      "Seek immediate medical attention",
    ],
    callEmergency: true,
  },
  {
    id: "burns",
    title: "Burns",
    icon: "🔥",
    category: "injury",
    steps: [
      "Remove person from heat source safely",
      "Cool the burn under cool (not cold) running water for 10-20 minutes",
      "Remove jewelry or tight clothing near the burn",
      "Do NOT apply ice, butter, or ointments",
      "Cover with a clean, non-stick bandage",
      "Do NOT break blisters",
      "For severe burns, call emergency services",
    ],
    warning:
      "Seek emergency care for burns larger than 3 inches, on face/hands/genitals, or that appear white/charred.",
  },
  {
    id: "fracture",
    title: "Broken Bone",
    icon: "🦴",
    category: "injury",
    steps: [
      "Keep the injured area still - do NOT try to realign",
      "Apply ice wrapped in cloth to reduce swelling",
      "Immobilize the area with a splint if possible",
      "For open fractures, cover wound with clean bandage",
      "Control any bleeding with gentle pressure",
      "Watch for signs of shock",
      "Seek immediate medical attention",
    ],
  },
  {
    id: "allergic",
    title: "Severe Allergic Reaction",
    icon: "⚠️",
    category: "emergency",
    callEmergency: true,
    steps: [
      "Call 911 immediately",
      "Ask if person has an epinephrine auto-injector (EpiPen)",
      "Help them use it if available - inject into outer thigh",
      "Have them lie down with legs elevated",
      "Loosen tight clothing",
      "If they stop breathing, begin CPR",
      "A second dose may be needed after 5-15 minutes",
    ],
    warning: "Signs: difficulty breathing, swelling of face/throat, hives, dizziness, rapid pulse.",
  },
]

export default function FirstAidGuide({ onClose }: FirstAidGuideProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopic, setSelectedTopic] = useState<FirstAidTopic | null>(null)

  const filteredTopics = FIRST_AID_TOPICS.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getCategoryColor = (category: FirstAidTopic["category"]) => {
    switch (category) {
      case "emergency":
        return "from-red-500 to-rose-500"
      case "injury":
        return "from-amber-500 to-orange-500"
      case "illness":
        return "from-blue-500 to-cyan-500"
    }
  }

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
        className="glass-strong w-full max-w-2xl overflow-hidden rounded-2xl border border-border shadow-cinematic"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">First Aid Guide</h2>
              <p className="text-xs text-muted-foreground">Emergency procedures and instructions</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-4 space-y-4">
            {/* Emergency call banner */}
            <motion.a
              href="tel:911"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex items-center justify-between rounded-xl bg-gradient-to-r from-destructive to-red-600 p-4 text-white"
            >
              <div className="flex items-center gap-3">
                <Phone className="h-6 w-6" />
                <div>
                  <p className="font-bold">Emergency? Call 911</p>
                  <p className="text-xs opacity-90">Tap to call emergency services</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5" />
            </motion.a>

            <AnimatePresence mode="wait">
              {!selectedTopic ? (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search first aid topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Topics grid */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredTopics.map((topic, index) => (
                      <motion.button
                        key={topic.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTopic(topic)}
                        className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4 text-left transition-colors hover:border-primary/50"
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getCategoryColor(topic.category)}`}
                        >
                          <span className="text-2xl">{topic.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{topic.title}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {topic.category}
                            </Badge>
                            {topic.callEmergency && (
                              <Badge variant="destructive" className="text-[10px]">
                                Call 911
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTopic(null)} className="gap-1">
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    Back to topics
                  </Button>

                  {/* Topic header */}
                  <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${getCategoryColor(selectedTopic.category)}`}
                    >
                      <span className="text-3xl">{selectedTopic.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{selectedTopic.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="capitalize">
                          {selectedTopic.category}
                        </Badge>
                        {selectedTopic.callEmergency && <Badge variant="destructive">Call 911 First</Badge>}
                      </div>
                    </div>
                  </div>

                  {/* Warning */}
                  {selectedTopic.warning && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                      <p className="text-sm text-amber-200">{selectedTopic.warning}</p>
                    </div>
                  )}

                  {/* Steps */}
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 font-medium text-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      Step-by-Step Instructions
                    </h4>
                    <div className="space-y-2">
                      {selectedTopic.steps.map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {index + 1}
                          </span>
                          <p className="text-sm text-foreground/90">{step}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  )
}
