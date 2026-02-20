import { useState, useCallback, useEffect } from 'react'
import type { VoiceConfig } from '../types'
import { DEFAULT_VOICE_CONFIG } from '../services/speechSynthesis'
import { speak, stop, isSpeaking, isSupported } from '../services/speechSynthesis'

const STORAGE_KEY = 'nm_voice_config'

// Load config from localStorage
function loadConfig(): VoiceConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_VOICE_CONFIG, ...JSON.parse(stored) }
    }
  } catch {
    // Ignore errors
  }
  return DEFAULT_VOICE_CONFIG
}

// Save config to localStorage
function saveConfig(config: VoiceConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function useSpeechSynthesis() {
  const [config, setConfigState] = useState<VoiceConfig>(loadConfig)
  const [supported, setSupported] = useState(isSupported())
  const [speaking, setSpeaking] = useState(false)

  // Update config
  const setConfig = useCallback((newConfig: Partial<VoiceConfig>) => {
    setConfigState(prev => {
      const updated = { ...prev, ...newConfig }
      saveConfig(updated)
      return updated
    })
  }, [])

  // Speak text (T018: Handle rapid speech - stop previous speech first)
  const speakText = useCallback(async (text: string) => {
    if (!supported || !config.enabled) return

    console.log('[Speech] speakText called with:', text)
    // Stop any ongoing speech before starting new
    stop()
    setSpeaking(true)
    try {
      await speak(text, config)
    } catch (e) {
      // Ignore "interrupted" errors - they happen when speech is intentionally stopped
      if (e instanceof Error && e.message !== 'interrupted') {
        console.error('Speech error:', e)
      }
    } finally {
      setSpeaking(false)
    }
  }, [supported, config])

  // Speak digits (T018: Handle rapid speech - stop previous speech first)
  const speakDigits = useCallback(async (digits: string) => {
    if (!supported || !config.enabled) return

    console.log('[Speech] speakDigits called with:', digits)
    // Stop any ongoing speech before starting new
    stop()
    setSpeaking(true)
    try {
      // Speak each digit individually with delay based on rate
      for (const digit of digits) {
        await speak(digit, config)
        // Add delay between digits based on rate (slower rate = more delay)
        await new Promise(resolve => setTimeout(resolve, 200 / config.rate))
      }
    } catch (e) {
      // Ignore "interrupted" errors - they happen when speech is intentionally stopped
      if (e instanceof Error && e.message !== 'interrupted') {
        console.error('Speech error:', e)
      }
    } finally {
      setSpeaking(false)
    }
  }, [supported, config])

  // Speak result (T018: Handle rapid speech - stop previous speech first)
  const speakResultMessage = useCallback(async (isCorrect: boolean, correctAnswer?: string) => {
    if (!supported || !config.enabled) return

    console.log('[Speech] speakResultMessage called, isCorrect:', isCorrect, 'answer:', correctAnswer)
    // Stop any ongoing speech before starting new
    stop()
    setSpeaking(true)
    try {
      // Correct: say "正确", Incorrect: say "错误，正确答案是" then digits
      let message: string
      if (isCorrect) {
        message = '正确'
      } else if (correctAnswer) {
        // Speak "错误，正确答案是" then each digit individually with faster rate
        message = '错误，正确答案是'
        await speak(message, config)
        // Use 1.5x rate for result feedback
        const fastConfig = { ...config, rate: config.rate * 1.5 }
        for (const digit of correctAnswer) {
          await speak(digit, fastConfig)
          // Fixed 100ms delay between digits (faster for result feedback)
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        return
      } else {
        message = '错误'
      }
      await speak(message, config)
    } catch (e) {
      // Ignore "interrupted" errors - they happen when speech is intentionally stopped
      if (e instanceof Error && e.message !== 'interrupted') {
        console.error('Speech error:', e)
      }
    } finally {
      setSpeaking(false)
    }
  }, [supported, config])

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    stop()
    setSpeaking(false)
  }, [])

  // Check support on mount
  useEffect(() => {
    setSupported(isSupported())
  }, [])

  // Cleanup on unmount and page unload (T017)
  useEffect(() => {
    const handleUnload = () => stop()
    window.addEventListener('beforeunload', handleUnload)
    return () => {
      window.removeEventListener('beforeunload', handleUnload)
      stop()
    }
  }, [])

  return {
    config,
    setConfig,
    supported,
    speaking,
    speakText,
    speakDigits,
    speakResultMessage,
    stopSpeaking,
    stop,
    isSpeaking: () => speaking || isSpeaking()
  }
}
