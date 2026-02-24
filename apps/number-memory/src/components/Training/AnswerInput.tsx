import { useRef, useEffect, useCallback, useState } from 'react'
import { filterDigits } from '../../services/digitGenerator'
import { getConfig } from '../../services/storage'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'

interface AnswerInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  digitCount: number
  expectedDigits?: string
}

export default function AnswerInput({
  value,
  onChange,
  onSubmit,
  digitCount,
  expectedDigits = ''
}: AnswerInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autoSubmittedRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const autoRecordScheduledRef = useRef(false)
  const [autoRecord, setAutoRecord] = useState(false)
  const [autoSubmit, setAutoSubmit] = useState(false)
  const { config: recognitionConfig, supported: recognitionSupported, listening, error, startListening, stopListening } = useSpeechRecognition()
  const { stop: stopSpeech } = useSpeechSynthesis()

  // Use refs to always get latest values in callbacks
  const valueRef = useRef(value)
  const autoSubmitRef = useRef(autoSubmit)
  const digitCountRef = useRef(digitCount)
  const expectedDigitsRef = useRef(expectedDigits)
  const onChangeRef = useRef(onChange)
  const onSubmitRef = useRef(onSubmit)
  const listeningRef = useRef(listening)

  // Update refs when values change
  useEffect(() => { valueRef.current = value }, [value])
  useEffect(() => { autoSubmitRef.current = autoSubmit }, [autoSubmit])
  useEffect(() => { digitCountRef.current = digitCount }, [digitCount])
  useEffect(() => { expectedDigitsRef.current = expectedDigits }, [expectedDigits])
  useEffect(() => { onChangeRef.current = onChange }, [onChange])
  useEffect(() => { onSubmitRef.current = onSubmit }, [onSubmit])
  useEffect(() => { listeningRef.current = listening }, [listening])

  // Load config on mount
  useEffect(() => {
    const config = getConfig()
    console.log('[AnswerInput] Loaded config, autoRecord:', config.autoRecord, 'autoSubmit:', config.autoSubmit)
    setAutoRecord(config.autoRecord)
    setAutoSubmit(config.autoSubmit)
  }, [])

  // Handle auto-continue after result is shown
  const handleAutoContinue = useCallback((isCorrect: boolean) => {
    const config = getConfig()
    if (config.autoSubmit) {
      console.log('[AutoContinue] Force auto-continue after auto-submit, isCorrect:', isCorrect)
      // Correct: 3 seconds, Incorrect: 7 seconds + digit count * 700ms
      const delay = isCorrect ? 3000 : 7000 + (digitCountRef.current * 700)
      console.log('[AutoContinue] Will continue in', delay, 'ms')
      timerRef.current = window.setTimeout(() => {
        console.log('[AutoContinue] Calling onSubmit to continue')
        onSubmitRef.current()
      }, delay)
    }
  }, [])

  // Handle recognized digits with auto-submit logic
  const handleRecognizedDigits = useCallback((digits: string) => {
    const currentValue = valueRef.current
    const currentConfig = getConfig() // Always get latest config
    const currentAutoSubmit = currentConfig.autoSubmit
    const currentDigitCount = digitCountRef.current
    const currentExpectedDigits = expectedDigitsRef.current
    const currentOnChange = onChangeRef.current
    const currentOnSubmit = onSubmitRef.current

    console.log('[AutoRecord] Recognized digits:', digits, 'current value:', currentValue, 'autoSubmit:', currentAutoSubmit)

    if (autoSubmittedRef.current) {
      console.log('[AutoRecord] Already submitted, skipping')
      return
    }

    // Append recognized digits to current value
    const newValue = (currentValue + digits).slice(0, currentDigitCount)
    console.log('[AutoRecord] New value:', newValue, 'digitCount:', currentDigitCount)
    currentOnChange(newValue)

    // Auto-submit logic (only if enabled)
    if (currentAutoSubmit && newValue.length === currentDigitCount) {
      console.log('[AutoSubmit] Length matches, checking correctness...')
      if (newValue === currentExpectedDigits) {
        console.log('[AutoSubmit] Correct! Submitting immediately')
        autoSubmittedRef.current = true
        // Submit - TrainingView will speak the result
        setTimeout(() => {
          currentOnSubmit()
          // Force auto-continue after correct answer
          handleAutoContinue(true)
        }, 500)
      } else {
        console.log('[AutoSubmit] Incorrect, expected:', currentExpectedDigits, 'got:', newValue)
        const delay = currentDigitCount * 1200
        console.log('[AutoSubmit] Wrong digits, will submit in', delay, 'ms')
        setTimeout(() => {
          if (!autoSubmittedRef.current) {
            autoSubmittedRef.current = true
            // Submit - TrainingView will speak the result
            currentOnSubmit()
            // Force auto-continue after incorrect answer
            handleAutoContinue(false)
          }
        }, delay)
      }
    }
  }, [handleAutoContinue])

  // Auto-start recording after 2 seconds (only if enabled)
  useEffect(() => {
    // Only schedule once per question - skip if already scheduled or already listening
    if (autoRecordScheduledRef.current || listeningRef.current) {
      console.log('[AutoRecord] Already scheduled or listening, skipping')
      return
    }

    console.log('[AutoRecord] Effect running, autoRecord:', autoRecord, 'recognitionEnabled:', recognitionConfig.enabled, 'supported:', recognitionSupported)

    if (autoRecord && recognitionConfig.enabled && recognitionSupported && expectedDigits) {
      console.log('[AutoRecord] Scheduling auto-start in 2 seconds')
      autoRecordScheduledRef.current = true
      timerRef.current = window.setTimeout(() => {
        console.log('[AutoRecord] Starting recording now, listening:', listeningRef.current)
        stopSpeech()
        startListening(handleRecognizedDigits)
      }, 2000)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [autoRecord, recognitionConfig.enabled, recognitionSupported, expectedDigits, stopSpeech, startListening, handleRecognizedDigits])

  useEffect(() => {
    // Auto-focus input when component mounts
    inputRef.current?.focus()
    // Reset auto-submit flag and scheduled flag
    autoSubmittedRef.current = false
    autoRecordScheduledRef.current = false
    console.log('[AnswerInput] Mounted')
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = filterDigits(e.target.value)
    onChange(filtered)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.length === digitCount) {
      autoSubmittedRef.current = true
      onSubmit()
    }
  }

  const handleMicClick = () => {
    // Use ref to get latest listening state, avoid stale closure
    if (listeningRef.current) {
      stopListening()
    } else {
      stopSpeech()
      startListening(handleRecognizedDigits)
    }
  }

  return (
    <div className="answer-input">
      <h2>请输入刚才的数字</h2>
      <p className="hint">请输入 {digitCount} 位数字</p>
      <div className="input-row">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="输入数字..."
          maxLength={digitCount}
          className={value.length === digitCount ? 'complete' : ''}
        />
        {recognitionConfig.enabled && recognitionSupported && (
          <button
            type="button"
            onClick={handleMicClick}
            className={`mic-button ${listening ? 'listening' : ''}`}
            title={listening ? '点击停止' : '点击说话'}
          >
            {listening ? '🔴' : '🎤'}
          </button>
        )}
      </div>
      {error && (
        <p className="speech-error">语音识别出错: {error}（请检查浏览器权限设置）</p>
      )}
      <button
        onClick={onSubmit}
        disabled={value.length !== digitCount}
        className="submit-button"
      >
        提交答案
      </button>
    </div>
  )
}
