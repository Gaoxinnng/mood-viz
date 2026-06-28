import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Record from './pages/Record'
import Calendar from './pages/Calendar'
import Analysis from './pages/Analysis'
import Insight from './pages/Insight'

function Header() {
  const location = useLocation()
  
  const getHeaderColor = () => {
    switch (location.pathname) {
      case '/': return 'bg-[rgba(74,222,128,0.1)] text-[#16a34a]'
      case '/calendar': return 'bg-[rgba(96,165,250,0.1)] text-[#2563eb]'
      case '/analysis': return 'bg-[rgba(167,139,250,0.1)] text-[#7c3aed]'
      case '/insight': return 'bg-[rgba(251,191,36,0.1)] text-[#d97706]'
      default: return 'bg-[rgba(74,222,128,0.1)] text-[#16a34a]'
    }
  }
  
  const getMenuColor = () => {
    switch (location.pathname) {
      case '/': return 'text-[#16a34a]'
      case '/calendar': return 'text-[#2563eb]'
      case '/analysis': return 'text-[#7c3aed]'
      case '/insight': return 'text-[#d97706]'
      default: return 'text-[#16a34a]'
    }
  }

  return (
    <header className={`px-5 py-4 flex items-center justify-between ${getHeaderColor()}`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">🌿</span>
        <h1 className="text-lg font-bold tracking-wide">MoodBloom</h1>
      </div>
      <button className={`w-8 h-8 rounded-full flex items-center justify-center ${getMenuColor()}`}>
        <span className="text-lg font-medium">•••</span>
      </button>
    </header>
  )
}

function NavLink({ to, icon, label }) {
  const location = useLocation()
  const isActive = location.pathname === to
  
  const getActiveClass = () => {
    switch (to) {
      case '/': return isActive ? 'nav-active-log' : ''
      case '/calendar': return isActive ? 'nav-active-calendar' : ''
      case '/analysis': return isActive ? 'nav-active-analysis' : ''
      case '/insight': return isActive ? 'nav-active-insight' : ''
      default: return ''
    }
  }

  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all duration-300
        ${isActive ? getActiveClass() : 'text-gray-400'}
      `}
    >
      <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
        {icon}
      </span>
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-60'}`}>
        {label}
      </span>
    </Link>
  )
}

function App() {
  return (
    <Router>
      <div className="max-w-md mx-auto min-h-screen bg-[#f8fafc] relative">
        <Header />
        
        <main className="pb-24">
          <Routes>
            <Route path="/" element={<Record />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/insight" element={<Insight />} />
          </Routes>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.04)] flex justify-around items-center py-3 px-2 rounded-t-[2rem]">
          <NavLink to="/" icon="✏️" label="记录" />
          <NavLink to="/calendar" icon="📅" label="日历" />
          <NavLink to="/analysis" icon="📊" label="分析" />
          <NavLink to="/insight" icon="💡" label="洞察" />
        </nav>
      </div>
    </Router>
  )
}

export default App
