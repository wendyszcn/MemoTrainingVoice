import { useState, useEffect, useRef } from 'react'
import { getConfig, saveConfig, exportAllData, importData, clearTrainingRecords, resetUserStats } from '../services/storage'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

export default function SettingsView() {
  const [displayDuration, setDisplayDuration] = useState(2000)
  const [digitDisplayDuration, setDigitDisplayDuration] = useState(1000)
  const [sequentialDisplay, setSequentialDisplay] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Voice settings
  const { config: voiceConfig, setConfig: setVoiceConfig, supported: speechSupported } = useSpeechSynthesis()

  // Speech recognition settings
  const { config: recognitionConfig, setConfig: setRecognitionConfig, supported: recognitionSupported } = useSpeechRecognition()

  useEffect(() => {
    const config = getConfig()
    setDisplayDuration(config.displayDuration)
    setDigitDisplayDuration(config.digitDisplayDuration)
    setSequentialDisplay(config.sequentialDisplay)
  }, [])

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    setDisplayDuration(value)
    saveConfig({ displayDuration: value })
  }

  const handleDigitDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    setDigitDisplayDuration(value)
    saveConfig({ digitDisplayDuration: value })
  }

  const handleSequentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked
    setSequentialDisplay(value)
    saveConfig({ sequentialDisplay: value })
  }

  const handleVoiceEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVoiceConfig({ enabled: e.target.checked })
  }

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setVoiceConfig({ rate: value })
  }

  const handleRecognitionEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecognitionConfig({ enabled: e.target.checked })
  }

  const handleExport = () => {
    const data = exportAllData()
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `number-memory-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const result = importData(content)
      alert(result.message)
      if (result.success) {
        window.location.reload()
      }
    }
    reader.readAsText(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClearData = () => {
    if (confirm('确定要清空所有训练数据吗？此操作不可恢复。')) {
      clearTrainingRecords()
      resetUserStats()
      alert('数据已清空')
      window.location.reload()
    }
  }

  return (
    <div className="settings-view">
      <h2>设置</h2>

      <div className="setting-group">
        <h3>显示方式</h3>
        <div className="checkbox-container">
          <label>
            <input
              type="checkbox"
              checked={sequentialDisplay}
              onChange={handleSequentialChange}
            />
            逐个显示数字
          </label>
        </div>
        {sequentialDisplay ? (
          <>
            <p className="setting-description">每位数字显示时长（毫秒）</p>
            <div className="slider-container">
              <input
                type="range"
                min="300"
                max="3000"
                step="100"
                value={digitDisplayDuration}
                onChange={handleDigitDurationChange}
              />
              <span className="slider-value">{digitDisplayDuration}ms</span>
            </div>
          </>
        ) : (
          <>
            <p className="setting-description">同时显示所有数字的总时长（毫秒）</p>
            <div className="slider-container">
              <input
                type="range"
                min="500"
                max="10000"
                step="100"
                value={displayDuration}
                onChange={handleDurationChange}
              />
              <span className="slider-value">{displayDuration}ms</span>
            </div>
          </>
        )}
      </div>

      {speechSupported ? (
        <div className="setting-group">
          <h3>语音播报</h3>
          <p className="setting-description">语音朗读显示的数字</p>
          <div className="checkbox-container">
            <label>
              <input
                type="checkbox"
                checked={voiceConfig.enabled}
                onChange={handleVoiceEnabledChange}
              />
              开启语音播报
            </label>
          </div>
          {voiceConfig.enabled && (
            <div className="slider-container">
              <span>语速:</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceConfig.rate}
                onChange={handleRateChange}
              />
              <span className="slider-value">{voiceConfig.rate}x</span>
            </div>
          )}
        </div>
      ) : (
        <div className="setting-group">
          <p className="speech-warning">您的浏览器不支持语音功能</p>
        </div>
      )}

      {recognitionSupported ? (
        <div className="setting-group">
          <h3>语音输入</h3>
          <p className="setting-description">用语音输入答案</p>
          <div className="checkbox-container">
            <label>
              <input
                type="checkbox"
                checked={recognitionConfig.enabled}
                onChange={handleRecognitionEnabledChange}
              />
              开启语音输入
            </label>
          </div>
        </div>
      ) : (
        <div className="setting-group">
          <p className="speech-warning">您的浏览器不支持语音输入功能</p>
        </div>
      )}

      <div className="setting-group">
        <h3>数据管理</h3>
        <div className="button-group">
          <button onClick={handleExport} className="export-button">
            导出数据
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="import-button">
            导入数据
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <div className="setting-group danger-zone">
        <h3>危险区域</h3>
        <button onClick={handleClearData} className="danger-button">
          清空所有数据
        </button>
      </div>
    </div>
  )
}
