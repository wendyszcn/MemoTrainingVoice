import type { SpeechRecognitionConfig } from '../types'

// Type for SpeechRecognition API
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

// Default config
export const DEFAULT_RECOGNITION_CONFIG: SpeechRecognitionConfig = {
  enabled: false,
  lang: 'zh-CN'
}

// Check if browser supports speech recognition
export function isSupported(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

// Extract digits from transcript
export function extractDigits(transcript: string): string {
  // Remove spaces and keep only digits
  const digits = transcript.replace(/\s/g, '').replace(/[^0-9]/g, '')
  return digits
}

// Create and start recognition
export function startRecognition(
  config: SpeechRecognitionConfig,
  onResult: (digits: string) => void,
  onEnd: () => void,
  onError: (error: string) => void
): SpeechRecognition | null {
  if (!isSupported()) {
    onError('您的浏览器不支持语音识别')
    return null
  }

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognitionClass()

  // Continuous mode to keep listening
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = config.lang

  let accumulatedDigits = ''

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let newInterim = ''
    let newFinal = ''

    // Process all results from current index
    for (let i = 0; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        newFinal += transcript
      } else {
        newInterim += transcript
      }
    }

    // Extract digits from final results and accumulate
    if (newFinal) {
      const newDigits = extractDigits(newFinal)
      accumulatedDigits += newDigits
      if (accumulatedDigits) {
        onResult(accumulatedDigits)
      }
    }
  }

  recognition.onerror = (event: { error: string }) => {
    // Ignore no-speech errors, they happen naturally
    if (event.error === 'no-speech') return
    onError(event.error)
  }

  recognition.onend = () => {
    // Only call onEnd if not manually stopped
    onEnd()
  }

  recognition.onstart = () => {
    // Started
  }

  try {
    recognition.start()
    return recognition
  } catch (e) {
    onError('启动语音识别失败')
    return null
  }
}

// Stop recognition
export function stopRecognition(recognition: SpeechRecognition | null): void {
  if (recognition) {
    try {
      recognition.stop()
    } catch {
      // Ignore errors when stopping
    }
  }
}
