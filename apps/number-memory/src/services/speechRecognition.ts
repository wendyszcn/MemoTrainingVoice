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

// Extract digits from transcript (only Arabic digits)
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
  console.log('[SpeechRecognition] startRecognition called, supported:', isSupported())
  if (!isSupported()) {
    onError('您的浏览器不支持语音识别')
    return null
  }

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
  console.log('[SpeechRecognition] Creating recognition instance')
  const recognition = new SpeechRecognitionClass()

  // Use single-shot mode
  recognition.continuous = false
  recognition.interimResults = true
  recognition.lang = config.lang

  let latestDigits = ''

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    // Get the latest result
    const result = event.results[event.results.length - 1]
    if (result && result.isFinal) {
      const transcript = result[0].transcript
      latestDigits = extractDigits(transcript)
      if (latestDigits) {
        onResult(latestDigits)
      }
    }
  }

  recognition.onerror = (event: { error: string }) => {
    // Ignore no-speech and aborted errors
    if (event.error === 'no-speech' || event.error === 'aborted') {
      return
    }
    onError(event.error)
  }

  recognition.onend = () => {
    onEnd()
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
