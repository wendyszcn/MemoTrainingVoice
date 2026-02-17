import { useState, useEffect } from 'react'
import type { TrainingRecord, UserStats } from '../types'
import { getTrainingRecords, getUserStats, calculateAccuracy } from '../services/storage'

export default function StatsView() {
  const [records, setRecords] = useState<TrainingRecord[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalTrainings: 0,
    highestDigitCount: 3,
    totalCorrect: 0,
    totalQuestions: 0
  })

  useEffect(() => {
    setRecords(getTrainingRecords())
    setStats(getUserStats())
  }, [])

  const accuracy = calculateAccuracy(stats)

  return (
    <div className="stats-view">
      <h2>训练统计</h2>

      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-value">{stats.totalTrainings}</div>
          <div className="stat-label">总训练次数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.highestDigitCount}</div>
          <div className="stat-label">最高记录 (位数)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{accuracy}%</div>
          <div className="stat-label">平均正确率</div>
        </div>
      </div>

      <h3>训练历史</h3>
      {records.length === 0 ? (
        <p className="no-data">暂无训练记录</p>
      ) : (
        <div className="history-list">
          {[...records].reverse().map((record) => (
            <div key={record.id} className="history-item">
              <div className="history-date">
                {new Date(record.date).toLocaleDateString('zh-CN')}
              </div>
              <div className="history-details">
                <span>{record.digitCount}位数</span>
                <span>正确: {record.correctCount}</span>
                <span>错误: {record.incorrectCount}</span>
                <span>得分: {record.score}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
