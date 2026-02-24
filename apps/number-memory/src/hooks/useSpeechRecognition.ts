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
  const isStartingRef = useRef(false)

  // Update config
  const setConfig = useCallback((newConfig: Partial<SpeechRecognitionConfig>) => {
    setConfigState(prev => {
      const updated = { ...prev, ...newConfig }
      saveConfig(updated)
      return updated
    })
  }, [])

  // Start listening - must be called directly from user interaction (click)
  const startListening = useCallback((onResult: (digits: string) => void) => {
    // Prevent multiple simultaneous starts
    if (isStartingRef.current) {
      console.log('[useSpeechRecognition] Already starting, returning')
      return
    }

    // Don't start if already have an active recognition
    if (recognitionRef.current) {
      console.log('[useSpeechRecognition] Recognition already active, returning')
      return
    }

    console.log('[useSpeechRecognition] Starting recognition')
    isStartingRef.current = true
    setListening(true)

    recognitionRef.current = startRecognition(
      config,
      (digits) => {
        console.log('[useSpeechRecognition] Got digits:', digits)
        onResult(digits)
      },
      () => {
        console.log('[useSpeechRecognition] Recognition ended')
        recognitionRef.current = null
        isStartingRef.current = false
        setListening(false)
      },
      (error) => {
        console.error('[useSpeechRecognition] Speech recognition error:', error)
        setError(error)
        recognitionRef.current = null
        isStartingRef.current = false
        setListening(false)
      }
    )

    // If recognition failed to start
    if (!recognitionRef.current) {
      console.log('[useSpeechRecognition] Recognition failed to start')
      isStartingRef.current = false
      setListening(false)
    }
  }, [config])

  // Stop listening
  const stopListening = useCallback(() => {
    console.log('[useSpeechRecognition] stopListening called')
    stopRecognition(recognitionRef.current)
    recognitionRef.current = null
    isStartingRef.current = false
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
