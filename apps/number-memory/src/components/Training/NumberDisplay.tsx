import { useEffect, useRef, useState } from 'react'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'

interface NumberDisplayProps {
  digits: string
  sequentialDisplay?: boolean
  digitDisplayDuration?: number
}

export default function NumberDisplay({
  digits,
  sequentialDisplay = false,
  digitDisplayDuration = 1000
}: NumberDisplayProps) {
  const { speakDigits, speaking, stopSpeaking, supported, config, speakText, stop } = useSpeechSynthesis()
  const isMountedRef = useRef(true)
  const [currentDigitIndex, setCurrentDigitIndex] = useState(-1)

  // Auto-speak digits when they appear
  useEffect(() => {
    isMountedRef.current = true

    if (digits && config.enabled) {
      // Stop any previous speech first, then wait before starting new speech
      stop()

      const timer = setTimeout(async () => {
        if (isMountedRef.current) {
          // First say "请注意听"
          await speakText('请注意听')
          // Then speak the digits
          speakDigits(digits)
        }
      }, 800) // Increased delay to let previous speech fully finish

      return () => {
        clearTimeout(timer)
        isMountedRef.current = false
      }
    }
  }, [digits, config.enabled])

  // Handle sequential digit display
  useEffect(() => {
    if (!sequentialDisplay || !digits) return

    setCurrentDigitIndex(0)

    const showNextDigit = (index: number) => {
      if (index < digits.length && isMountedRef.current) {
        setCurrentDigitIndex(index)
        setTimeout(() => {
          showNextDigit(index + 1)
        }, digitDisplayDuration)
      } else {
        // All digits shown, will be handled by parent
        setCurrentDigitIndex(-1)
      }
    }

    showNextDigit(0)

    return () => {
      // Cleanup handled by parent
    }
  }, [digits, sequentialDisplay, digitDisplayDuration])

  // Show digits based on mode
  const renderDigits = () => {
    if (sequentialDisplay && currentDigitIndex >= 0) {
      // Show only current digit
      return (
        <span key={currentDigitIndex} className="digit">
          {digits[currentDigitIndex]}
        </span>
      )
    } else if (sequentialDisplay) {
      // All digits have been shown, show placeholder or nothing
      return <span className="digit-placeholder">请输入答案</span>
    }
    // Show all digits at once
    return digits.split('').map((digit, index) => (
      <span key={index} className="digit">{digit}</span>
    ))
  }

  return (
    <div className="number-display">
      <h2>记住这些数字</h2>
      {supported && (
        <div className="speech-controls">
          {!speaking && config.enabled && (
            <button className="speaker-button" onClick={() => speakText(digits)} title="点击播放">
              🔊
            </button>
          )}
          {speaking && (
            <button className="stop-button" onClick={stopSpeaking}>
              停止播报
            </button>
          )}
        </div>
      )}
      <div className="digits-container">
        {renderDigits()}
      </div>
      {!supported && (
        <p className="speech-warning">您的浏览器不支持语音功能</p>
      )}
    </div>
  )
}
