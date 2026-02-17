import type { VoiceConfig } from '../types'

// Check if browser supports speech synthesis
export function isSupported(): boolean {
  return 'speechSynthesis' in window
}

// Get available voices
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSupported()) return []
  return speechSynthesis.getVoices()
}

// Default voice config
export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  enabled: true,
  rate: 1,
  pitch: 1,
  volume: 1,
  voiceLang: 'zh-CN'
}

// Speak text with given config
export function speak(text: string, config: VoiceConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isSupported()) {
      reject(new Error('Speech synthesis not supported'))
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = config.voiceLang
    utterance.rate = config.rate
    utterance.pitch = config.pitch
    utterance.volume = config.volume

    // Find matching voice for language
    const voices = getAvailableVoices()
    const matchingVoice = voices.find(v => v.lang.startsWith(config.voiceLang))
    if (matchingVoice) {
      utterance.voice = matchingVoice
    }

    utterance.onend = () => resolve()
    utterance.onerror = (e) => reject(e)

    speechSynthesis.speak(utterance)
  })
}

// Speak digits one by one
export async function speakDigits(digits: string, config: VoiceConfig): Promise<void> {
  if (!config.enabled) return

  // Speak each digit individually for clarity
  for (const digit of digits) {
    await speak(digit, config)
  }
}

// Speak result message
export async function speakResult(isCorrect: boolean, correctAnswer?: string, config?: VoiceConfig): Promise<void> {
  const finalConfig = config || DEFAULT_VOICE_CONFIG
  if (!finalConfig.enabled) return

  if (isCorrect) {
    await speak('正确', finalConfig)
  } else {
    const message = correctAnswer ? `错误，正确答案是 ${correctAnswer}` : '错误'
    await speak(message, finalConfig)
  }
}

// Stop speaking
export function stop(): void {
  if (isSupported()) {
    speechSynthesis.cancel()
  }
}

// Check if currently speaking
export function isSpeaking(): boolean {
  if (!isSupported()) return false
  return speechSynthesis.speaking
}
