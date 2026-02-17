import { useState } from 'react'
import type { AppView } from './types'
import TrainingView from './pages/TrainingView'
import StatsView from './pages/StatsView'
import SettingsView from './pages/SettingsView'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('training')

  const renderView = () => {
    switch (currentView) {
      case 'training':
        return <TrainingView />
      case 'stats':
        return <StatsView />
      case 'settings':
        return <SettingsView />
      default:
        return <TrainingView />
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>数字记忆训练</h1>
        <nav className="nav-buttons">
          <button
            className={currentView === 'training' ? 'active' : ''}
            onClick={() => setCurrentView('training')}
          >
            训练
          </button>
          <button
            className={currentView === 'stats' ? 'active' : ''}
            onClick={() => setCurrentView('stats')}
          >
            统计
          </button>
          <button
            className={currentView === 'settings' ? 'active' : ''}
            onClick={() => setCurrentView('settings')}
          >
            设置
          </button>
        </nav>
      </header>
      <main className="app-main">
        {renderView()}
      </main>
    </div>
  )
}

export default App
