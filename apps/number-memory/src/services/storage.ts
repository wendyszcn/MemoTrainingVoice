import type {
  TrainingRecord,
  UserStats,
  TrainingConfig,
  ExportData,
  ImportResult
} from '../types'

const STORAGE_KEYS = {
  RECORDS: 'nm_training_records',
  STATS: 'nm_user_stats',
  CONFIG: 'nm_training_config'
}

const DEFAULT_CONFIG: TrainingConfig = {
  displayDuration: 2000,
  digitDisplayDuration: 1000,
  sequentialDisplay: false,
  currentDigitCount: 3,
  consecutiveCorrect: 0,
  consecutiveIncorrect: 0,
  autoContinue: false,
  autoRecord: false,
  autoSubmit: false
}

const DEFAULT_STATS: UserStats = {
  totalTrainings: 0,
  highestDigitCount: 3,
  totalCorrect: 0,
  totalQuestions: 0
}

// Generate UUID
function generateId(): string {
  return crypto.randomUUID()
}

// Training Records
export function getTrainingRecords(): TrainingRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECORDS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveTrainingRecord(record: Omit<TrainingRecord, 'id'>): TrainingRecord {
  const records = getTrainingRecords()
  const newRecord: TrainingRecord = {
    ...record,
    id: generateId()
  }
  records.push(newRecord)
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records))
  return newRecord
}

export function clearTrainingRecords(): void {
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify([]))
}

// User Stats
export function getUserStats(): UserStats {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS)
    return data ? JSON.parse(data) : DEFAULT_STATS
  } catch {
    return DEFAULT_STATS
  }
}

export function updateUserStats(record: TrainingRecord): UserStats {
  const stats = getUserStats()
  const newStats: UserStats = {
    totalTrainings: stats.totalTrainings + 1,
    highestDigitCount: Math.max(stats.highestDigitCount, record.digitCount),
    totalCorrect: stats.totalCorrect + record.correctCount,
    totalQuestions: stats.totalQuestions + record.correctCount + record.incorrectCount
  }
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats))
  return newStats
}

export function resetUserStats(): void {
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(DEFAULT_STATS))
}

// Training Config
export function getConfig(): TrainingConfig {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG)
    const parsed = data ? JSON.parse(data) : {}
    // Ensure all new fields have defaults
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      autoRecord: parsed.autoRecord ?? false,
      autoSubmit: parsed.autoSubmit ?? false
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

export function saveConfig(config: Partial<TrainingConfig>): TrainingConfig {
  const currentConfig = getConfig()
  const newConfig = { ...currentConfig, ...config }
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(newConfig))
  return newConfig
}

// Export/Import
export function exportAllData(): ExportData {
  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    data: {
      records: getTrainingRecords(),
      stats: getUserStats(),
      config: getConfig()
    }
  }
}

export function importData(data: string): ImportResult {
  try {
    const parsed: ExportData = JSON.parse(data)

    // Validate structure
    if (!parsed.version || !parsed.data || !parsed.data.records) {
      return { success: false, message: 'Invalid data format', importedRecords: 0 }
    }

    // Import records
    const existingRecords = getTrainingRecords()
    const newRecords = parsed.data.records
    const allRecords = [...existingRecords, ...newRecords]

    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(allRecords))

    // Import stats if present
    if (parsed.data.stats) {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(parsed.data.stats))
    }

    // Import config if present
    if (parsed.data.config) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(parsed.data.config))
    }

    return {
      success: true,
      message: `Successfully imported ${newRecords.length} records`,
      importedRecords: newRecords.length
    }
  } catch (e) {
    return {
      success: false,
      message: `Import failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
      importedRecords: 0
    }
  }
}

// Utility
export function calculateAccuracy(stats: UserStats): number {
  if (stats.totalQuestions === 0) return 0
  return Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
}
