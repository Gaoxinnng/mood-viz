import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Filler } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Filler)

const moodConfig = {
  elated: { name: '开心', emoji: '😄', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
  good: { name: '良好', emoji: '😊', color: '#84cc16', bgColor: 'rgba(132, 204, 22, 0.1)' },
  neutral: { name: '平静', emoji: '😐', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  low: { name: '低落', emoji: '😔', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  rough: { name: '糟糕', emoji: '😣', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
}

export default function Analysis() {
  const location = useLocation()
  const [records, setRecords] = useState([])

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('moodRecords') || '[]')
    setRecords(data)
  }, [location.pathname])

  const total = records.length

  const avgMood = () => {
    if (total === 0) return '0.0'
    const totalStrength = records.reduce((sum, item) => sum + (typeof item.strength === 'number' ? item.strength : 3), 0)
    return (totalStrength / total).toFixed(1)
  }

  const getStreakDays = () => {
    if (total === 0) return 0
    
    const sorted = [...records].sort((a, b) => b.time - a.time)
    const today = new Date()
    let streak = 0
    let checkDate = new Date(today)
    
    const recordDates = new Set(records.map(r => r.date))
    
    while (true) {
      const dateStr = checkDate.toLocaleDateString()
      if (recordDates.has(dateStr)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  const getLoggedDays = () => {
    return new Set(records.map(r => r.date)).size
  }

  const getBestDay = () => {
    if (total === 0) return null
    
    const dayRecords = {}
    records.forEach(r => {
      if (!dayRecords[r.date]) {
        dayRecords[r.date] = { count: 0, totalStrength: 0, records: [] }
      }
      dayRecords[r.date].count++
      dayRecords[r.date].totalStrength += (typeof r.strength === 'number' ? r.strength : 3)
      dayRecords[r.date].records.push(r)
    })
    
    let bestDay = null
    let bestAvg = -1
    
    Object.entries(dayRecords).forEach(([date, data]) => {
      const avg = data.totalStrength / data.count
      if (avg > bestAvg) {
        bestAvg = avg
        bestDay = { date, avg: avg.toFixed(1), records: data.records }
      }
    })
    
    return bestDay
  }

  const trendData = () => {
    if (total === 0) return { labels: [], datasets: [] }
    
    const sorted = [...records].sort((a, b) => a.time - b.time)
    
    const dateMap = new Map()
    const dates = []
    sorted.forEach(r => {
      const dateStr = new Date(r.time).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, [])
        dates.push(dateStr)
      }
      dateMap.get(dateStr).push(typeof r.strength === 'number' ? r.strength : 3)
    })
    
    const avgStrengths = dates.map(date => {
      const strengths = dateMap.get(date)
      return strengths.reduce((a, b) => a + b, 0) / strengths.length
    })
    
    return {
      labels: dates.slice(-14),
      datasets: [{
        label: 'Mood',
        data: avgStrengths.slice(-14),
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: '#7c3aed',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        fill: true,
      }]
    }
  }

  const distributionData = () => {
    const counts = { elated: 0, good: 0, neutral: 0, low: 0, rough: 0 }
    
    records.forEach(r => {
      const key = r.mood.key || r.mood
      if (counts[key] !== undefined) {
        counts[key]++
      }
    })
    
    return {
      labels: [moodConfig.elated.emoji, moodConfig.good.emoji, moodConfig.neutral.emoji, moodConfig.low.emoji, moodConfig.rough.emoji],
      datasets: [{
        label: 'Count',
        data: [counts.elated, counts.good, counts.neutral, counts.low, counts.rough],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(132, 204, 22, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
        borderRadius: 8,
      }]
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        backgroundColor: 'rgba(255,255,255,0.95)',
        titleColor: '#1f2937',
        bodyColor: '#6b7280',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      y: { 
        beginAtZero: true,
        ticks: { color: '#9ca3af', stepSize: 1 },
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
      },
      x: { 
        ticks: { color: '#9ca3af' },
        grid: { display: false },
      },
    },
  }

  const trendOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: { 
        ...chartOptions.scales.y,
        min: 0,
        max: 5,
        ticks: { ...chartOptions.scales.y.ticks, stepSize: 1 },
      },
    },
  }

  const bestDay = getBestDay()

  return (
    <div className="p-5 pb-28">
      <div className="text-[#7c3aed] text-sm font-medium mb-2">
        本月数据
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        数据分析
      </h2>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#f5f3ff] rounded-[1.5rem] p-4 text-center">
          <div className="text-lg mb-1">📈</div>
          <p className="text-2xl font-bold text-[#7c3aed]">{avgMood()}/5</p>
          <p className="text-[10px] text-gray-500 mt-1">平均情绪</p>
        </div>
        
        <div className="bg-[#eff6ff] rounded-[1.5rem] p-4 text-center">
          <div className="text-lg mb-1">🔥</div>
          <p className="text-2xl font-bold text-[#2563eb]">{getStreakDays()} 天</p>
          <p className="text-[10px] text-gray-500 mt-1">连续打卡</p>
        </div>
        
        <div className="bg-[#f0fdf4] rounded-[1.5rem] p-4 text-center">
          <div className="text-lg mb-1">📅</div>
          <p className="text-2xl font-bold text-[#16a34a]">{getLoggedDays()} 天</p>
          <p className="text-[10px] text-gray-500 mt-1">总记录</p>
        </div>
      </div>

      <div className="card-moodbloom p-5 mb-6">
        <label className="text-[#7c3aed] text-sm font-medium mb-4 block">
          情绪趋势
        </label>
        <div className="h-48">
          <Line data={trendData()} options={trendOptions} />
        </div>
      </div>

      <div className="card-moodbloom p-5 mb-6">
        <label className="text-[#7c3aed] text-sm font-medium mb-4 block">
          情绪分布
        </label>
        <div className="h-48">
          <Bar data={distributionData()} options={chartOptions} />
        </div>
      </div>

      {bestDay && (
        <div className="bg-[#f5f3ff] rounded-[1.5rem] p-5">
          <label className="text-[#7c3aed] text-sm font-medium mb-3 block">
            最佳心情日
          </label>
          <div className="flex items-center gap-4">
            <div className="text-4xl">🌟</div>
            <div>
              <p className="font-bold text-gray-800">{bestDay.date}</p>
              <p className="text-sm text-gray-500">平均情绪: {bestDay.avg}/5</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
