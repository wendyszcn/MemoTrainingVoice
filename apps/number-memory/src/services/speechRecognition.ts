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

// Chinese number mapping
const CHINESE_NUMBERS: Record<string, string> = {
  '零': '0',
  '一': '1',
  '二': '2',
  '三': '3',
  '四': '4',
  '五': '5',
  '六': '6',
  '七': '7',
  '八': '8',
  '九': '9',
  '〇': '0',
  '两': '2',  // 常见说法 "两"
}

// Extract digits from transcript (supports both Arabic and Chinese numbers)
export function extractDigits(transcript: string): string {
  let result = transcript.replace(/\s/g, '')

  // First convert Chinese numbers to Arabic digits
  for (const [chinese, arabic] of Object.entries(CHINESE_NUMBERS)) {
    result = result.replace(new RegExp(chinese, 'g'), arabic)
  }

  // Then keep only digits
  const digits = result.replace(/[^0-9]/g, '')
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

  // Use continuous mode to keep listening for multiple digits
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = config.lang

  let accumulatedDigits = ''

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    console.log('[SpeechRecognition] onresult called, results length:', event.results.length)
    let newInterim = ''
    let newFinal = ''

    // Process all results from current index
    for (let i = 0; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      console.log('[SpeechRecognition] Result', i, ':', transcript, 'isFinal:', event.results[i].isFinal)
      if (event.results[i].isFinal) {
        newFinal += transcript
      } else {
        newInterim += transcript
      }
    }

    console.log('[SpeechRecognition] newInterim:', newInterim, 'newFinal:', newFinal)

    // Extract digits from final results and accumulate
    if (newFinal) {
      const newDigits = extractDigits(newFinal)
      console.log('[SpeechRecognition] Extracted digits from final:', newDigits)
      accumulatedDigits += newDigits
      if (accumulatedDigits) {
        console.log('[SpeechRecognition] Calling onResult with:', accumulatedDigits)
        onResult(accumulatedDigits)
      }
    }
  }

  recognition.onerror = (event: { error: string }) => {
    console.log('[SpeechRecognition] onerror:', event.error)
    // Ignore no-speech errors, they happen naturally
    if (event.error === 'no-speech') {
      console.log('[SpeechRecognition] Ignoring no-speech error')
      return
    }
    // Also ignore aborted - happens when we stop manually
    if (event.error === 'aborted') {
      console.log('[SpeechRecognition] Ignoring aborted error')
      return
    }
    console.error('[SpeechRecognition] Non-ignorable error, calling onError')
    onError(event.error)
  }

  recognition.onend = () => {
    console.log('[SpeechRecognition] onend called')
    // Determine why it ended - check if we got any results
    if (accumulatedDigits) {
      console.log('[SpeechRecognition] Ended with accumulated digits:', accumulatedDigits)
    }
    onEnd()
  }

  recognition.onstart = () => {
    console.log('[SpeechRecognition] Recognition started')
  }

  try {
    console.log('[SpeechRecognition] Calling recognition.start()')
    recognition.start()
    console.log('[SpeechRecognition] recognition.start() called successfully')
    return recognition
  } catch (e) {
    console.error('[SpeechRecognition] Error starting recognition:', e)
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
