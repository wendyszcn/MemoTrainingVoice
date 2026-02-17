import { useState, useCallback } from 'react'
import type { TrainingSession } from '../types'
import {
  saveTrainingRecord,
  updateUserStats,
  getConfig,
  saveConfig
} from '../services/storage'
import { generateDigits } from '../services/digitGenerator'

const initialSession: TrainingSession = {
  state: 'IDLE',
  currentDigits: '',
  userAnswer: '',
  isCorrect: null,
  digitCount: 3,
  correctCount: 0,
  incorrectCount: 0,
  consecutiveCorrect: 0,
  consecutiveIncorrect: 0
}

export function useTrainingStore() {
  const [session, setSession] = useState<TrainingSession>(initialSession)

  const startTraining = useCallback(() => {
    const config = getConfig()
    const digits = generateDigits(config.currentDigitCount)
    setSession({
      ...initialSession,
      state: 'SHOWING_DIGITS',
      currentDigits: digits,
      digitCount: config.currentDigitCount,
      consecutiveCorrect: config.consecutiveCorrect,
      consecutiveIncorrect: config.consecutiveIncorrect
    })

    // Auto-hide digits after display duration
    setTimeout(() => {
      setSession((prev) => ({
        ...prev,
        state: 'INPUTTING'
      }))
    }, config.displayDuration)
  }, [])

  const submitAnswer = useCallback((answer: string) => {
    setSession((prev) => {
      const isCorrect = answer === prev.currentDigits
      const newConsecutiveCorrect = isCorrect ? prev.consecutiveCorrect + 1 : 0
      const newConsecutiveIncorrect = !isCorrect ? prev.consecutiveIncorrect + 1 : 0

      // Difficulty adjustment: +1 after 2 correct, -1 after 2 incorrect
      let newDigitCount = prev.digitCount
      if (newConsecutiveCorrect >= 2) {
        newDigitCount = prev.digitCount + 1
      } else if (newConsecutiveIncorrect >= 2 && prev.digitCount > 3) {
        newDigitCount = prev.digitCount - 1
      }

      // Save config with new difficulty
      saveConfig({
        consecutiveCorrect: newConsecutiveCorrect,
        consecutiveIncorrect: newConsecutiveIncorrect,
        currentDigitCount: newDigitCount
      })

      return {
        ...prev,
        state: 'RESULT_SHOWING',
        userAnswer: answer,
        isCorrect,
        correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
        incorrectCount: isCorrect ? prev.incorrectCount : prev.incorrectCount + 1,
        consecutiveCorrect: newConsecutiveCorrect,
        consecutiveIncorrect: newConsecutiveIncorrect,
        digitCount: newDigitCount
      }
    })
  }, [])

  const nextQuestion = useCallback(() => {
    const config = getConfig()
    const digits = generateDigits(config.currentDigitCount)
    setSession((prev) => ({
      ...prev,
      state: 'SHOWING_DIGITS',
      currentDigits: digits,
      userAnswer: '',
      isCorrect: null
    }))

    // Auto-hide digits after display duration
    setTimeout(() => {
      setSession((prev) => ({
        ...prev,
        state: 'INPUTTING'
      }))
    }, config.displayDuration)
  }, [])

  const finishTraining = useCallback(() => {
    // Save training record
    const record = saveTrainingRecord({
      date: new Date().toISOString(),
      digitCount: session.digitCount,
      correctCount: session.correctCount,
      incorrectCount: session.incorrectCount,
      score: session.correctCount * session.digitCount
    })

    // Update stats
    updateUserStats(record)

    // Reset session
    setSession(initialSession)
  }, [session])

  const resetSession = useCallback(() => {
    setSession(initialSession)
  }, [])

  const restartTraining = useCallback(() => {
    setSession(initialSession)
    // Automatically start new training
    setTimeout(() => {
      startTraining()
    }, 100)
  }, [startTraining])

  return {
    session,
    startTraining,
    submitAnswer,
    nextQuestion,
    finishTraining,
    resetSession,
    restartTraining
  }
}
