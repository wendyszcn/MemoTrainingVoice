// Training Record - stored in localStorage
export interface TrainingRecord {
  id: string
  date: string // ISO 8601 format
  digitCount: number
  correctCount: number
  incorrectCount: number
  score: number // correctCount * digitCount
}

// User Statistics - stored in localStorage
export interface UserStats {
  totalTrainings: number
  highestDigitCount: number
  totalCorrect: number
  totalQuestions: number
}

// Training Configuration - stored in localStorage
export interface TrainingConfig {
  displayDuration: number // total display time in ms (for simultaneous display), default 2000
  digitDisplayDuration: number // time per digit in ms (for sequential display), default 1000
  sequentialDisplay: boolean // show digits one by one, default false
  currentDigitCount: number // default 3
  consecutiveCorrect: number // default 0
  consecutiveIncorrect: number // default 0
  autoContinue: boolean // auto-advance to next question, default false
  autoRecord: boolean // auto-start recording after digits, default false
  autoSubmit: boolean // auto-submit based on recognition result, default false
}

// Training States
export type TrainingState = 'IDLE' | 'SHOWING_DIGITS' | 'INPUTTING' | 'RESULT_SHOWING'

// App View
export type AppView = 'training' | 'stats' | 'settings'

// Application State
export interface AppState {
  currentView: AppView
  training: TrainingSession
  stats: UserStats
  config: TrainingConfig
}

// Training Session (runtime state)
export interface TrainingSession {
  state: TrainingState
  currentDigits: string
  userAnswer: string
  isCorrect: boolean | null
  digitCount: number
  correctCount: number
  incorrectCount: number
  consecutiveCorrect: number
  consecutiveIncorrect: number
}

// Export/Import Data Structure
export interface ExportData {
  version: string
  exportDate: string
  data: {
    records: TrainingRecord[]
    stats: UserStats
    config: TrainingConfig
  }
}

// Import Result
export interface ImportResult {
  success: boolean
  message: string
  importedRecords: number
}

// Voice Configuration - stored in localStorage
export interface VoiceConfig {
  enabled: boolean // default true
  rate: number // 0.1-10, default 1
  pitch: number // 0-2, default 1
  volume: number // 0-1, default 1
  voiceLang: string // default "zh-CN"
}

// Speech Recognition Configuration - stored in localStorage
export interface SpeechRecognitionConfig {
  enabled: boolean // default false
  lang: string // default "zh-CN"
}
