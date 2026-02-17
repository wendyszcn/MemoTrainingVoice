import { useRef, useEffect } from 'react'
import { filterDigits } from '../../services/digitGenerator'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'

interface AnswerInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  digitCount: number
}

export default function AnswerInput({
  value,
  onChange,
  onSubmit,
  digitCount
}: AnswerInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { config: recognitionConfig, supported: recognitionSupported, listening, startListening, stopListening } = useSpeechRecognition()

  useEffect(() => {
    // Auto-focus input when component mounts
    inputRef.current?.focus()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = filterDigits(e.target.value)
    onChange(filtered)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.length === digitCount) {
      onSubmit()
    }
  }

  const handleMicClick = () => {
    if (listening) {
      stopListening()
    } else {
      startListening((digits) => {
        // Append recognized digits to current value
        const newValue = (value + digits).slice(0, digitCount)
        onChange(newValue)
      })
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
