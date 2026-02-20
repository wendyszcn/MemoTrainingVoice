import { useState, useCallback, useEffect, useRef } from 'react'
import type { SpeechRecognitionConfig } from '../types'
import { DEFAULT_RECOGNITION_CONFIG, startRecognition, stopRecognition, isSupported } from '../services/speechRecognition'

const STORAGE_KEY = 'nm_speech_recognition_config'

// Load config from localStorage
function loadConfig(): SpeechRecognitionConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_RECOGNITION_CONFIG, ...JSON.parse(stored) }
    }
  } catch {
    // Ignore errors
  }
  return DEFAULT_RECOGNITION_CONFIG
}

// Save config to localStorage
function saveConfig(config: SpeechRecognitionConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function useSpeechRecognition() {
  const [config, setConfigState] = useState<SpeechRecognitionConfig>(loadConfig)
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  // Update config
  const setConfig = useCallback((newConfig: Partial<SpeechRecognitionConfig>) => {
    setConfigState(prev => {
      const updated = { ...prev, ...newConfig }
      saveConfig(updated)
      return updated
    })
  }, [])

  // Start listening
  const startListening = useCallback((onResult: (digits: string) => void) => {
    console.log('[useSpeechRecognition] startListening called, listening:', listening)
    if (listening) {
      console.log('[useSpeechRecognition] Already listening, returning')
      return
    }

    console.log('[useSpeechRecognition] Starting recognition')
    setListening(true)
    recognitionRef.current = startRecognition(
      config,
      (digits) => {
        console.log('[useSpeechRecognition] Got digits:', digits)
        onResult(digits)
      },
      () => {
        console.log('[useSpeechRecognition] Recognition ended')
        setListening(false)
      },
      (error) => {
        console.error('[useSpeechRecognition] Speech recognition error:', error)
        setError(error)
        setListening(false)
      }
    )
  }, [config, listening])

  // Stop listening
  const stopListening = useCallback(() => {
    stopRecognition(recognitionRef.current)
    recognitionRef.current = null
    setListening(false)
  }, [])

  // Check support on mount
  useEffect(() => {
    setSupported(isSupported())
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [])

  return {
    config,
    setConfig,
    supported,
    listening,
    error,
    startListening,
    stopListening
  }
}
