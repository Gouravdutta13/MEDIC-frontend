/**
 * Voice utilities for Speech-to-Text and Text-to-Speech
 * Uses Web Speech API with fallbacks
 */

export interface VoiceConfig {
  language: string
  rate: number
  pitch: number
  volume: number
  voiceIndex?: number
}

export interface TranscriptEvent {
  transcript: string
  isFinal: boolean
  confidence: number
}

type TranscriptCallback = (event: TranscriptEvent) => void

// Check for browser support
export const isSTTSupported = (): boolean => {
  if (typeof window === "undefined") return false
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window
}

export const isTTSSupported = (): boolean => {
  if (typeof window === "undefined") return false
  return "speechSynthesis" in window
}

// Speech Recognition instance
let recognition: any | null = null // Declare SpeechRecognition variable
let isListening = false

/**
 * Start speech recognition
 * @param onTranscript Callback for transcript updates
 * @param language Language code (default: 'en-US')
 */
export function startRecording(onTranscript: TranscriptCallback, language = "en-US"): { stop: () => void } | null {
  if (!isSTTSupported()) {
    console.warn("[Voice] Speech recognition not supported")
    return null
  }

  // @ts-expect-error - WebkitSpeechRecognition may not be in types
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  recognition = new SpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = language

  recognition.onresult = (event) => {
    let finalTranscript = ""
    let interimTranscript = ""

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      if (result.isFinal) {
        finalTranscript += result[0].transcript
        onTranscript({
          transcript: finalTranscript,
          isFinal: true,
          confidence: result[0].confidence,
        })
      } else {
        interimTranscript += result[0].transcript
        onTranscript({
          transcript: interimTranscript,
          isFinal: false,
          confidence: result[0].confidence,
        })
      }
    }
  }

  recognition.onerror = (event) => {
    console.error("[Voice] Recognition error:", event.error)
    isListening = false
  }

  recognition.onend = () => {
    isListening = false
  }

  recognition.start()
  isListening = true

  return {
    stop: () => stopRecording(),
  }
}

/**
 * Stop speech recognition
 */
export function stopRecording(): string {
  if (recognition && isListening) {
    recognition.stop()
    isListening = false
  }
  return ""
}

/**
 * Check if currently listening
 */
export function getIsListening(): boolean {
  return isListening
}

/**
 * Speak text using TTS
 * @param text Text to speak
 * @param config Voice configuration
 */
export function speak(text: string, config: Partial<VoiceConfig> = {}): SpeechSynthesisUtterance | null {
  if (!isTTSSupported()) {
    console.warn("[Voice] Text-to-speech not supported")
    return null
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = config.language || "en-US"
  utterance.rate = config.rate || 1
  utterance.pitch = config.pitch || 1
  utterance.volume = config.volume || 1

  // Get available voices and select one
  const voices = window.speechSynthesis.getVoices()
  if (voices.length > 0) {
    const voiceIndex = config.voiceIndex || 0
    const selectedVoice = voices.find((v) => v.lang.startsWith(config.language || "en")) || voices[voiceIndex]
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }
  }

  window.speechSynthesis.speak(utterance)
  return utterance
}

/**
 * Stop current speech
 */
export function stopSpeaking(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.cancel()
  }
}

/**
 * Pause current speech
 */
export function pauseSpeaking(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.pause()
  }
}

/**
 * Resume paused speech
 */
export function resumeSpeaking(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.resume()
  }
}

/**
 * Get available voices
 */
export function getVoices(): SpeechSynthesisVoice[] {
  if (!isTTSSupported()) return []
  return window.speechSynthesis.getVoices()
}

/**
 * Get supported languages
 */
export const SUPPORTED_LANGUAGES = [
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "es-ES", name: "Spanish" },
  { code: "fr-FR", name: "French" },
  { code: "de-DE", name: "German" },
  { code: "it-IT", name: "Italian" },
  { code: "pt-BR", name: "Portuguese (Brazil)" },
  { code: "zh-CN", name: "Chinese (Mandarin)" },
  { code: "ja-JP", name: "Japanese" },
  { code: "ko-KR", name: "Korean" },
]
