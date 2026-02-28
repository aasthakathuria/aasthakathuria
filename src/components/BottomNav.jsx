import './BottomNav.css'

const tabs = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'pantry', label: 'Pantry', icon: '🥫' },
  { id: 'meals', label: 'Meals', icon: '🍽️' },
  { id: 'more', label: 'More', icon: '⋯' },
]

function BottomNav({ activeTab, onTabChange, onCameraClick }) {
  return (
    <nav className="bottom-nav">
      <div className="nav-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
        <button
          className="nav-tab nav-camera"
          onClick={onCameraClick}
          aria-label="Upload or take photo"
        >
          <span className="nav-icon">📷</span>
          <span className="nav-label">Scan</span>
        </button>
      </div>
    </nav>
  )
}

export default BottomNav
