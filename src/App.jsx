import { useState } from 'react'
import './App.css'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import Pantry from './pages/Pantry'
import Meals from './pages/Meals'
import More from './pages/More'
import Scan from './pages/Scan'
import Staging from './pages/Staging'
import { extractTextFromImage, parseItemsFromText } from './services/ocrService'
import { addItems } from './services/storageService'
import { analyzeImageWithLLM, fileToBase64 } from './services/llmService'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [view, setView] = useState('tabs') // 'tabs' | 'scan' | 'processing' | 'staging' | 'llmResult'
  const [stagingItems, setStagingItems] = useState([])
  const [llmResult, setLlmResult] = useState(null)
  const [llmError, setLlmError] = useState(null)

  const handleCameraClick = () => {
    setView('scan')
  }

  const handleScanCancel = () => {
    setView('tabs')
  }

  const handleImageSelected = async (file) => {
    setView('processing')
    try {
      const text = await extractTextFromImage(file)
      const items = parseItemsFromText(text)
      setStagingItems(items)
      setView('staging')
    } catch (err) {
      console.error('OCR failed:', err)
      setStagingItems([])
      setView('staging')
    }
  }

  const handleStagingApprove = (items) => {
    addItems(items)
    setView('tabs')
    setActiveTab('pantry')
  }

  const handleStagingCancel = () => {
    setView('tabs')
  }

  const handleImageSelectedForAI = async (file) => {
    setView('processing')
    setLlmError(null)
    setLlmResult(null)
    try {
      const base64 = await fileToBase64(file)
      const data = await analyzeImageWithLLM(base64)
      setLlmResult(data.raw ?? '')
      setView('llmResult')
    } catch (err) {
      setLlmError(err.message ?? 'AI analysis failed')
      setLlmResult(null)
      setView('llmResult')
    }
  }

  const handleLlmResultBack = () => {
    setLlmResult(null)
    setLlmError(null)
    setView('tabs')
  }

  const renderContent = () => {
    if (view === 'scan') {
      return (
        <Scan
          onImageSelected={handleImageSelected}
          onImageSelectedForAI={handleImageSelectedForAI}
          onCancel={handleScanCancel}
        />
      )
    }
    if (view === 'llmResult') {
      return (
        <div className="llm-result">
          <div className="llm-result-content">
            {llmError && <p className="llm-error">{llmError}</p>}
            {llmResult != null && <pre className="llm-raw">{llmResult}</pre>}
          </div>
          <button className="llm-result-back" onClick={handleLlmResultBack}>
            Back
          </button>
        </div>
      )
    }
    if (view === 'processing') {
      return (
        <div className="processing">
          <p>Extracting text…</p>
        </div>
      )
    }
    if (view === 'staging') {
      return (
        <Staging
          items={stagingItems}
          onApprove={handleStagingApprove}
          onCancel={handleStagingCancel}
        />
      )
    }
    switch (activeTab) {
      case 'home':
        return <Dashboard />
      case 'pantry':
        return <Pantry />
      case 'meals':
        return <Meals />
      case 'more':
        return <More />
      default:
        return <Dashboard />
    }
  }

  const showNav = view === 'tabs'

  return (
    <div className="app">
      <header className="header">
        <h1>Grocery Tracker</h1>
      </header>

      <main className="main">{renderContent()}</main>

      {showNav && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onCameraClick={handleCameraClick}
        />
      )}
    </div>
  )
}

export default App
