/**
 * DrugLookup - Medical tool for searching medication information
 * Includes drug interactions and safety warnings
 */

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Pill, Search, AlertTriangle, Info, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DrugLookupProps {
  onClose: () => void
}

interface Drug {
  id: string
  name: string
  genericName: string
  category: string
  description: string
  dosage: string
  sideEffects: string[]
  warnings: string[]
  interactions: string[]
}

const MOCK_DRUGS: Drug[] = [
  {
    id: "1",
    name: "Ibuprofen",
    genericName: "Ibuprofen",
    category: "NSAID / Pain Reliever",
    description: "Nonsteroidal anti-inflammatory drug (NSAID) used to reduce fever and treat pain or inflammation.",
    dosage: "Adults: 200-400mg every 4-6 hours. Maximum 1200mg/day without prescription.",
    sideEffects: ["Stomach upset", "Nausea", "Dizziness", "Headache", "Mild heartburn"],
    warnings: [
      "May increase risk of heart attack or stroke",
      "Can cause stomach bleeding",
      "Not recommended during pregnancy",
      "Use caution with kidney or liver disease",
    ],
    interactions: ["Blood thinners", "Aspirin", "Other NSAIDs", "ACE inhibitors", "Diuretics"],
  },
  {
    id: "2",
    name: "Acetaminophen",
    genericName: "Paracetamol",
    category: "Analgesic / Antipyretic",
    description: "Pain reliever and fever reducer. Does not reduce inflammation like NSAIDs.",
    dosage: "Adults: 325-650mg every 4-6 hours. Maximum 3000mg/day.",
    sideEffects: ["Rare at recommended doses", "Allergic reactions possible", "Liver damage with overdose"],
    warnings: [
      "Liver damage risk with excessive use",
      "Avoid alcohol while taking",
      "Check other medications for acetaminophen content",
    ],
    interactions: ["Warfarin", "Alcohol", "Isoniazid", "Carbamazepine"],
  },
]

export default function DrugLookup({ onClose }: DrugLookupProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const found = MOCK_DRUGS.find(
      (d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.genericName.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setSelectedDrug(found || null)
    setIsSearching(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drug-lookup-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-cinematic"
      >
        {/* Header - Fixed */}
        <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 id="drug-lookup-title" className="text-lg font-semibold text-foreground">
                Drug Lookup
              </h2>
              <p className="text-xs text-muted-foreground">Search medication information</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close drug lookup">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
              <p className="text-xs text-warning">
                This information is for educational purposes only. Always consult your healthcare provider or pharmacist
                before taking any medication.
              </p>
            </div>

            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by drug name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                  aria-label="Search for medication"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>

            {/* Quick search suggestions */}
            {!selectedDrug && (
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Common medications:</p>
                <div className="flex flex-wrap gap-2">
                  {MOCK_DRUGS.map((drug) => (
                    <Badge
                      key={drug.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10 focus:ring-2 focus:ring-ring"
                      onClick={() => {
                        setSearchQuery(drug.name)
                        setSelectedDrug(drug)
                      }}
                    >
                      {drug.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Drug details */}
            <AnimatePresence mode="wait">
              {selectedDrug && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Drug header */}
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{selectedDrug.name}</h3>
                        <p className="text-sm text-muted-foreground">Generic: {selectedDrug.genericName}</p>
                      </div>
                      <Badge variant="secondary">{selectedDrug.category}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-foreground/80">{selectedDrug.description}</p>
                  </div>

                  {/* Tabs for details */}
                  <Tabs defaultValue="dosage" className="w-full">
                    <TabsList className="w-full grid grid-cols-4">
                      <TabsTrigger value="dosage" className="text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        Dosage
                      </TabsTrigger>
                      <TabsTrigger value="effects" className="text-xs">
                        <Info className="mr-1 h-3 w-3" />
                        Side Effects
                      </TabsTrigger>
                      <TabsTrigger value="warnings" className="text-xs">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Warnings
                      </TabsTrigger>
                      <TabsTrigger value="interactions" className="text-xs">
                        <Shield className="mr-1 h-3 w-3" />
                        Interactions
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="dosage" className="mt-4">
                      <div className="rounded-xl border border-border bg-muted/30 p-4">
                        <h4 className="mb-2 font-medium text-foreground">Recommended Dosage</h4>
                        <p className="text-sm text-foreground/80">{selectedDrug.dosage}</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="effects" className="mt-4">
                      <div className="rounded-xl border border-border bg-muted/30 p-4">
                        <h4 className="mb-2 font-medium text-foreground">Common Side Effects</h4>
                        <ul className="space-y-1">
                          {selectedDrug.sideEffects.map((effect, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {effect}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>

                    <TabsContent value="warnings" className="mt-4">
                      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                        <h4 className="mb-2 font-medium text-destructive">Important Warnings</h4>
                        <ul className="space-y-2">
                          {selectedDrug.warnings.map((warning, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>

                    <TabsContent value="interactions" className="mt-4">
                      <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
                        <h4 className="mb-2 font-medium text-warning">Drug Interactions</h4>
                        <p className="mb-2 text-xs text-warning/80">May interact with the following:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedDrug.interactions.map((interaction, i) => (
                            <Badge key={i} variant="outline" className="border-warning/50 text-warning">
                              {interaction}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Button variant="outline" onClick={() => setSelectedDrug(null)} className="w-full">
                    Search Another Medication
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
