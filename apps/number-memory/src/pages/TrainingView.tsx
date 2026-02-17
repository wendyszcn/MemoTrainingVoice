import { useState, useCallback, useEffect } from 'react'
import type { TrainingSession } from '../types'
import NumberDisplay from '../components/Training/NumberDisplay'
import AnswerInput from '../components/Training/AnswerInput'
import { generateDigits, validateAnswer } from '../services/digitGenerator'
import { getConfig, saveConfig, saveTrainingRecord, updateUserStats } from '../services/storage'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'

export default function TrainingView() {
  const [session, setSession] = useState<TrainingSession>({
    state: 'IDLE',
    currentDigits: '',
    userAnswer: '',
    isCorrect: null,
    digitCount: 3,
    correctCount: 0,
    incorrectCount: 0,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0
  })

  const [inputValue, setInputValue] = useState('')

  // Speech hooks
  const { speakResultMessage, config: voiceConfig } = useSpeechSynthesis()

  const startTraining = useCallback(() => {
    const config = getConfig()
    const digits = generateDigits(config.currentDigitCount)

    // Calculate display time based on mode
    let displayTime: number

    if (config.sequentialDisplay) {
      // Sequential mode: use digit display duration per digit
      displayTime = config.digitDisplayDuration * digits.length

      // Add extra time for speech if enabled
      if (voiceConfig.enabled !== false) {
        const rate = voiceConfig.rate || 1
        const speechTime = Math.ceil(digits.length * 600 / rate)
        displayTime = Math.max(displayTime, speechTime)
      }
    } else {
      // Simultaneous mode: auto-calculate based on digit count and voice
      const digitCount = digits.length

      // Base time: 600ms per digit minimum
      let baseDuration = digitCount * 600

      // Add speech time if voice is enabled (600ms per digit at rate 1)
      if (voiceConfig.enabled !== false) {
        const rate = voiceConfig.rate || 1
        const speechTime = Math.ceil(digitCount * 600 / rate)
        // Always add speech time plus 800ms buffer
        baseDuration = baseDuration + speechTime + 800
      }

      displayTime = Math.max(config.displayDuration, baseDuration)
    }

    setSession({
      ...session,
      state: 'SHOWING_DIGITS',
      currentDigits: digits,
      digitCount: config.currentDigitCount,
      userAnswer: '',
      isCorrect: null
    })

    setTimeout(() => {
      setSession((prev) => ({
        ...prev,
        state: 'INPUTTING'
      }))
    }, displayTime)
  }, [session])

  const submitAnswer = useCallback(() => {
    if (!inputValue.trim()) {
      alert('请输入数字')
      return
    }

    const isCorrect = validateAnswer(inputValue, session.currentDigits)
    const newConsecutiveCorrect = isCorrect ? session.consecutiveCorrect + 1 : 0
    const newConsecutiveIncorrect = !isCorrect ? session.consecutiveIncorrect + 1 : 0

    // Difficulty adjustment: +1 after 2 correct, -1 after 2 incorrect
    let newDigitCount = session.digitCount
    if (newConsecutiveCorrect >= 2) {
      newDigitCount = session.digitCount + 1
    } else if (newConsecutiveIncorrect >= 2 && session.digitCount > 3) {
      newDigitCount = session.digitCount - 1
    }

    // Save config with new difficulty
    saveConfig({
      consecutiveCorrect: newConsecutiveCorrect,
      consecutiveIncorrect: newConsecutiveIncorrect,
      currentDigitCount: newDigitCount
    })

    setSession((prev) => ({
      ...prev,
      state: 'RESULT_SHOWING',
      userAnswer: inputValue,
      isCorrect,
      correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
      incorrectCount: isCorrect ? prev.incorrectCount : prev.incorrectCount + 1,
      consecutiveCorrect: newConsecutiveCorrect,
      consecutiveIncorrect: newConsecutiveIncorrect,
      digitCount: newDigitCount
    }))
  }, [inputValue, session])

  // Speak result when showing
  useEffect(() => {
    if (session.state === 'RESULT_SHOWING' && session.isCorrect !== null) {
      speakResultMessage(session.isCorrect, session.currentDigits)
    }
  }, [session.state, session.isCorrect, session.currentDigits])

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
    setInputValue('')

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
    setSession({
      state: 'IDLE',
      currentDigits: '',
      userAnswer: '',
      isCorrect: null,
      digitCount: 3,
      correctCount: 0,
      incorrectCount: 0,
      consecutiveCorrect: 0,
      consecutiveIncorrect: 0
    })
    setInputValue('')
  }, [session])

  return (
    <div className="training-view">
      {session.state === 'IDLE' && (
        <div className="start-screen">
          <h2>准备好了吗？</h2>
          <p>点击开始挑战你的数字记忆能力</p>
          <button className="start-button" onClick={startTraining}>
            开始训练
          </button>
        </div>
      )}

      {session.state === 'SHOWING_DIGITS' && (
        <NumberDisplay
          digits={session.currentDigits}
          sequentialDisplay={getConfig().sequentialDisplay}
          digitDisplayDuration={getConfig().digitDisplayDuration}
        />
      )}

      {session.state === 'INPUTTING' && (
        <AnswerInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={submitAnswer}
          digitCount={session.digitCount}
        />
      )}

      {session.state === 'RESULT_SHOWING' && (
        <div className="result-screen">
          <h2 className={session.isCorrect ? 'correct' : 'incorrect'}>
            {session.isCorrect ? '正确！' : '错误！'}
          </h2>
          <p>正确答案是: <strong>{session.currentDigits}</strong></p>
          <p>你输入的是: <strong>{session.userAnswer}</strong></p>
          <div className="result-stats">
            <p>正确: {session.correctCount} | 错误: {session.incorrectCount}</p>
            <p>当前难度: {session.digitCount} 位数</p>
          </div>
          <div className="result-buttons">
            <button onClick={nextQuestion}>下一题</button>
            <button onClick={finishTraining} className="secondary">结束训练</button>
          </div>
        </div>
      )}
    </div>
  )
}
