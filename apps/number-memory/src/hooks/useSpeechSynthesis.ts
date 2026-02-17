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

    // Stop any ongoing speech before starting new
    stop()
    setSpeaking(true)
    try {
      await speak(text, config)
    } catch (e) {
      console.error('Speech error:', e)
    } finally {
      setSpeaking(false)
    }
  }, [supported, config])

  // Speak digits (T018: Handle rapid speech - stop previous speech first)
  const speakDigits = useCallback(async (digits: string) => {
    if (!supported || !config.enabled) return

    // Stop any ongoing speech before starting new
    stop()
    setSpeaking(true)
    try {
      // Speak each digit individually with a small delay between
      for (const digit of digits) {
        await speak(digit, config)
        // Add delay between digits based on rate (slower rate = more delay)
        await new Promise(resolve => setTimeout(resolve, 200 / config.rate))
      }
    } catch (e) {
      console.error('Speech error:', e)
    } finally {
      setSpeaking(false)
    }
  }, [supported, config])

  // Speak result (T018: Handle rapid speech - stop previous speech first)
  const speakResultMessage = useCallback(async (isCorrect: boolean, correctAnswer?: string) => {
    if (!supported || !config.enabled) return

    // Stop any ongoing speech before starting new
    stop()
    setSpeaking(true)
    try {
      const message = isCorrect ? '正确' : (correctAnswer ? `错误，正确答案是 ${correctAnswer}` : '错误')
      await speak(message, config)
    } catch (e) {
      console.error('Speech error:', e)
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
    isSpeaking: () => speaking || isSpeaking()
  }
}
