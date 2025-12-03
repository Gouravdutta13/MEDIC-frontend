/**
 * SymptomAnalyzer - Medical tool for analyzing symptoms
 * Fixed scrolling, multi-select for body regions, improved light mode
 */

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Stethoscope, AlertTriangle, ChevronRight, Search, Plus, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface SymptomAnalyzerProps {
  onClose: () => void
}

interface Symptom {
  id: string
  name: string
  severity: "mild" | "moderate" | "severe"
  duration: string
}

const COMMON_SYMPTOMS = [
  "Headache",
  "Fever",
  "Fatigue",
  "Nausea",
  "Cough",
  "Sore throat",
  "Body aches",
  "Dizziness",
  "Chest pain",
  "Shortness of breath",
  "Abdominal pain",
  "Joint pain",
]

const BODY_REGIONS = [
  { id: "head", label: "Head & Neck", icon: "🧠" },
  { id: "chest", label: "Chest", icon: "💗" },
  { id: "abdomen", label: "Abdomen", icon: "🫃" },
  { id: "back", label: "Back & Spine", icon: "🦴" },
  { id: "limbs", label: "Arms & Legs", icon: "💪" },
  { id: "skin", label: "Skin", icon: "🩹" },
]

export default function SymptomAnalyzer({ onClose }: SymptomAnalyzerProps) {
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)

  const filteredSymptoms = COMMON_SYMPTOMS.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

  const addSymptom = (name: string) => {
    if (symptoms.find((s) => s.name.toLowerCase() === name.toLowerCase())) return
    const newSymptom: Symptom = {
      id: `symptom-${Date.now()}`,
      name,
      severity: "mild",
      duration: "few days",
    }
    setSymptoms((prev) => [...prev, newSymptom])
    setSearchQuery("")
  }

  const removeSymptom = (id: string) => {
    setSymptoms((prev) => prev.filter((s) => s.id !== id))
  }

  const updateSeverity = (id: string, severity: Symptom["severity"]) => {
    setSymptoms((prev) => prev.map((s) => (s.id === id ? { ...s, severity } : s)))
  }

  const toggleRegion = (regionId: string) => {
    setSelectedRegions((prev) => (prev.includes(regionId) ? prev.filter((r) => r !== regionId) : [...prev, regionId]))
  }

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) return

    setIsAnalyzing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const regionNames = selectedRegions
      .map((r) => BODY_REGIONS.find((b) => b.id === r)?.label)
      .filter(Boolean)
      .join(", ")

    setAnalysisResult(`Based on your symptoms (${symptoms.map((s) => s.name).join(", ")})${regionNames ? ` affecting ${regionNames}` : ""}, here are some possible considerations:

**Possible Conditions:**
- Common cold or flu
- Viral infection
- Stress-related symptoms

**Recommended Actions:**
1. Rest and stay hydrated
2. Monitor symptom progression
3. Consider over-the-counter remedies if appropriate

**Red Flags - Seek Immediate Care If:**
- Symptoms worsen rapidly
- High fever (above 103°F / 39.4°C)
- Difficulty breathing
- Severe pain

⚠️ This is not a diagnosis. Please consult a healthcare professional for proper medical advice.`)

    setIsAnalyzing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-cinematic"
      >
        {/* Header - fixed */}
        <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Symptom Analyzer</h2>
              <p className="text-xs text-muted-foreground">Describe your symptoms for guidance</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-6">
            {/* Disclaimer */}
            <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
              <p className="text-xs text-warning-foreground dark:text-warning">
                This tool provides general health information only. It is not a substitute for professional medical
                advice, diagnosis, or treatment.
              </p>
            </div>

            {!analysisResult ? (
              <>
                <div>
                  <h3 className="mb-3 text-sm font-medium text-foreground">Select affected areas (optional)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {BODY_REGIONS.map((region) => {
                      const isSelected = selectedRegions.includes(region.id)
                      return (
                        <motion.button
                          key={region.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleRegion(region.id)}
                          className={`relative flex items-center gap-2 rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border bg-muted/30 hover:border-primary/50"
                          }`}
                          aria-pressed={isSelected}
                        >
                          <span className="text-xl">{region.icon}</span>
                          <span className="text-xs font-medium text-foreground">{region.label}</span>
                          {isSelected && <Check className="absolute right-2 top-2 h-4 w-4 text-primary" />}
                        </motion.button>
                      )
                    })}
                  </div>
                  {selectedRegions.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Selected: {selectedRegions.map((r) => BODY_REGIONS.find((b) => b.id === r)?.label).join(", ")}
                    </p>
                  )}
                </div>

                {/* Symptom search */}
                <div>
                  <h3 className="mb-3 text-sm font-medium text-foreground">Add your symptoms</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search or type a symptom..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && searchQuery.trim()) {
                          addSymptom(searchQuery.trim())
                        }
                      }}
                      className="pl-10 bg-muted/30"
                    />
                  </div>

                  {/* Suggestions */}
                  <AnimatePresence>
                    {searchQuery && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-1 rounded-lg border border-border bg-popover p-1"
                      >
                        {filteredSymptoms.slice(0, 5).map((symptom) => (
                          <button
                            key={symptom}
                            onClick={() => addSymptom(symptom)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"
                          >
                            <Plus className="h-3 w-3" />
                            {symptom}
                          </button>
                        ))}
                        {searchQuery &&
                          !filteredSymptoms.some((s) => s.toLowerCase() === searchQuery.toLowerCase()) && (
                            <button
                              onClick={() => addSymptom(searchQuery)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary hover:bg-primary/10"
                            >
                              <Plus className="h-3 w-3" />
                              Add "{searchQuery}"
                            </button>
                          )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Added symptoms - improved layout for severity pills */}
                {symptoms.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-foreground">Your symptoms</h3>
                    <div className="space-y-2">
                      {symptoms.map((symptom) => (
                        <motion.div
                          key={symptom.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/30 p-3"
                        >
                          <span className="text-sm font-medium text-foreground">{symptom.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                              {(["mild", "moderate", "severe"] as const).map((sev) => (
                                <button
                                  key={sev}
                                  onClick={() => updateSeverity(symptom.id, sev)}
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium capitalize transition-all ${
                                    symptom.severity === sev
                                      ? sev === "severe"
                                        ? "bg-destructive text-destructive-foreground"
                                        : sev === "moderate"
                                          ? "bg-warning text-warning-foreground"
                                          : "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                                  }`}
                                >
                                  {sev}
                                </button>
                              ))}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => removeSymptom(symptom.id)}
                              aria-label={`Remove ${symptom.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick add */}
                {!searchQuery && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-muted-foreground">Common symptoms</h3>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_SYMPTOMS.filter((s) => !symptoms.find((sym) => sym.name === s))
                        .slice(0, 8)
                        .map((symptom) => (
                          <Badge
                            key={symptom}
                            variant="outline"
                            className="cursor-pointer border-border bg-muted/30 hover:bg-primary/10 hover:border-primary text-foreground"
                            onClick={() => addSymptom(symptom)}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            {symptom}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Analysis Result */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-sm dark:prose-invert max-w-none"
              >
                <div className="whitespace-pre-wrap text-sm text-foreground">{analysisResult}</div>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setAnalysisResult(null)
                    setSymptoms([])
                    setSelectedRegions([])
                  }}
                >
                  Start New Analysis
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {!analysisResult && (
          <div className="shrink-0 border-t border-border bg-popover p-4">
            <Button
              onClick={analyzeSymptoms}
              disabled={symptoms.length === 0 || isAnalyzing}
              className="w-full gap-2 gradient-accent text-primary-foreground btn-hover"
            >
              {isAnalyzing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Symptoms
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
