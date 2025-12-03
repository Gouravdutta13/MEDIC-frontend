/**
 * API utilities and mock streaming helpers for MEDIC
 * Replace mockStreamResponse with real SSE/NDJSON endpoint integration
 */

import type { Message, Source } from "./types"

// Simulated medical response data
const MOCK_RESPONSES: Record<string, { content: string; sources: Source[] }> = {
  headache: {
    content: `## Understanding Your Headache

Based on your description, here's what you should know:

### Possible Causes
- **Tension headache**: Most common type, often related to stress or muscle tension
- **Migraine**: May include nausea, light sensitivity, or visual disturbances
- **Dehydration**: A frequently overlooked cause

### Recommended Actions
1. **Rest** in a quiet, dark room
2. **Hydrate** - drink water or electrolyte beverages
3. **Over-the-counter pain relief** (if appropriate for you)
4. **Apply cold or warm compress** to forehead or neck

### ⚠️ Red Flags - Seek Emergency Care If:
- Sudden, severe "thunderclap" headache
- Headache with fever, stiff neck, confusion
- Headache after head injury
- Vision changes or weakness on one side

> **Medical Disclaimer**: This information is for educational purposes only. Please consult a healthcare professional for personalized medical advice.`,
    sources: [
      {
        id: "src-1",
        title: "Headache Classification - ICHD-3",
        snippet: "International Classification of Headache Disorders, 3rd edition guidelines...",
        url: "https://ichd-3.org",
        score: 0.94,
        type: "guideline",
      },
      {
        id: "src-2",
        title: "Mayo Clinic - Tension Headaches",
        snippet: "Tension headaches are the most common type of headache...",
        url: "https://mayoclinic.org/headaches",
        score: 0.89,
        type: "reference",
      },
    ],
  },
  default: {
    content: `Thank you for your question. I'm MEDIC, your AI medical assistant.

### My Analysis
I'll help you understand your health concern with evidence-based information.

### Important Reminders
- This is general health information, not a diagnosis
- Always verify with a qualified healthcare provider
- In emergencies, call your local emergency number immediately

### What I Can Help With
- Explaining medical conditions and symptoms
- Providing general health education
- Suggesting when to seek professional care
- Offering lifestyle and wellness guidance

> **Disclaimer**: I am an AI assistant and cannot provide medical diagnoses or treatment recommendations. Always consult qualified healthcare professionals for medical decisions.`,
    sources: [
      {
        id: "src-default",
        title: "WHO Health Guidelines",
        snippet: "Evidence-based health information from the World Health Organization...",
        url: "https://who.int",
        score: 0.85,
        type: "reference",
      },
    ],
  },
}

/**
 * Mock streaming response generator
 * Simulates token-by-token streaming from an LLM
 */
export async function* mockStreamResponse(query: string): AsyncGenerator<{
  content: string
  done: boolean
  sources?: Source[]
}> {
  // Simulate initial processing delay
  await sleep(300)

  // Determine response based on query content
  const lowerQuery = query.toLowerCase()
  const responseData =
    lowerQuery.includes("headache") || lowerQuery.includes("head pain")
      ? MOCK_RESPONSES.headache
      : MOCK_RESPONSES.default

  const content = responseData.content
  const words = content.split(" ")

  // Stream word by word with variable delays for natural feel
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const delay = getStreamDelay(word)
    await sleep(delay)

    yield {
      content: word + (i < words.length - 1 ? " " : ""),
      done: false,
    }
  }

  // Final yield with sources
  yield {
    content: "",
    done: true,
    sources: responseData.sources,
  }
}

/**
 * Get variable delay based on content for natural streaming
 */
function getStreamDelay(word: string): number {
  // Longer pause after punctuation
  if (word.endsWith(".") || word.endsWith("!") || word.endsWith("?")) {
    return 80 + Math.random() * 40
  }
  if (word.endsWith(",") || word.endsWith(":")) {
    return 50 + Math.random() * 30
  }
  // Markdown headers get slight pause
  if (word.startsWith("#")) {
    return 60
  }
  // Normal words
  return 15 + Math.random() * 25
}

/**
 * Promise-based sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Send a message and get streaming response
 * ---- ONLY CHANGE: update backend API URL HERE ----
 *
 * This implementation POSTs to the MEDIC backend and converts the returned
 * full answer into a simple streamed word-by-word generator so the UI can
 * display token-like streaming. If the backend call fails we fall back to
 * the local mockStreamResponse.
 */
export async function sendMessage(
  content: string,
  chatId: string,
): Promise<AsyncGenerator<{ content: string; done: boolean; sources?: Source[] }>> {
  try {
    // <-- Set your backend URL here (relative or absolute). Keep as http://127.0.0.1:8000 for local dev.
    const BACKEND_URL = "http://127.0.0.1:8000/api/chat"

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: content,
        top_k: 3,
        explain: false,
      }),
    })

    if (!response.ok) {
      // if backend returned an error, log and fallback to mock stream
      console.error("Backend error:", response.status, await response.text().catch(() => "<no body>"))
      return mockStreamResponse(content)
    }

    const data = await response.json().catch((err) => {
      console.error("Failed to parse backend JSON:", err)
      return null
    })

    if (!data) return mockStreamResponse(content)

    // backend may return 'advice' / 'response' / 'answer' etc.
    const answer = (data.advice || data.response || data.answer || "").toString()
    const sources = (data.sources || data.sources_used || data.retrieved_docs || []) as Source[]

    // stream the returned answer word-by-word
    async function* stream() {
      if (!answer || answer.trim().length === 0) {
        // no textual answer: final yield with sources only
        yield { content: "", done: true, sources }
        return
      }

      const words = answer.split(" ")
      for (let i = 0; i < words.length; i++) {
        const w = words[i]
        await sleep(getStreamDelay(w))
        // preserve spacing except possibly at the end
        yield { content: w + (i < words.length - 1 ? " " : ""), done: false }
      }

      // final yield with sources
      yield { content: "", done: true, sources }
    }

    return stream()
  } catch (err) {
    console.error("Connection failed:", err)
    return mockStreamResponse(content)
  }
}

/**
 * Generate unique message ID
 */
export function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate unique chat ID
 */
export function generateChatId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Mock analytics endpoint
 */
export function logAnalyticsEvent(event: string, properties?: Record<string, unknown>): void {
  // Check if analytics is enabled
  const prefs = getStoredPreferences()
  if (!prefs.analyticsEnabled) return

  // TODO: Replace with actual analytics endpoint
  console.log("[MEDIC Analytics]", {
    event,
    timestamp: new Date().toISOString(),
    properties,
  })
}

/**
 * Get stored user preferences
 */
export function getStoredPreferences(): {
  analyticsEnabled: boolean
  theme: string
  highContrast: boolean
} {
  if (typeof window === "undefined") {
    return { analyticsEnabled: true, theme: "dark", highContrast: false }
  }

  try {
    const stored = localStorage.getItem("medic-preferences")
    return stored ? JSON.parse(stored) : { analyticsEnabled: true, theme: "dark", highContrast: false }
  } catch {
    return { analyticsEnabled: true, theme: "dark", highContrast: false }
  }
}

/**
 * Export chat to text format
 */
export function exportChatToText(messages: Message[]): string {
  return messages
    .map((msg) => {
      const timestamp = msg.timestamp.toLocaleString()
      const role = msg.role === "user" ? "You" : "MEDIC"
      return `[${timestamp}] ${role}:\n${msg.content}\n`
    })
    .join("\n---\n\n")
}

/**
 * Export chat to PDF (client-side)
 */
export async function exportChatToPDF(messages: Message[], title: string): Promise<void> {
  const content = exportChatToText(messages)

  // Create a simple HTML document for printing
  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - MEDIC Chat Export</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }
          h1 { color: #0891b2; }
          .message { margin: 1rem 0; padding: 1rem; border-radius: 8px; }
          .user { background: #f0f9ff; }
          .assistant { background: #f0fdf4; }
          .timestamp { font-size: 0.75rem; color: #666; }
          .disclaimer { background: #fef3c7; padding: 1rem; border-radius: 8px; margin-top: 2rem; }
        </style>
      </head>
      <body>
        <h1>MEDIC - Medical Assistant Chat</h1>
        <p><strong>Exported:</strong> ${new Date().toLocaleString()}</p>
        <hr />
        <pre style="white-space: pre-wrap;">${content}</pre>
        <div class="disclaimer">
          <strong>Disclaimer:</strong> This chat is for informational purposes only and does not constitute medical advice.
        </div>
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}
