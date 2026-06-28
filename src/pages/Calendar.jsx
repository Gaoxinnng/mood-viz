import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const moodConfig = {
  elated: { emoji: '😄', color: '#22c55e', bgColor: '#dcfce7' },
  good: { emoji: '😊', color: '#84cc16', bgColor: '#f0fdf4' },
  neutral: { emoji: '😐', color: '#f59e0b', bgColor: '#fffbeb' },
  low: { emoji: '😔', color: '#3b82f6', bgColor: '#eff6ff' },
  rough: { emoji: '😣', color: '#ef4444', bgColor: '#fef2f2' },
}

const moodList = [
  { key: 'elated', name: '开心', emoji: '😄' },
  { key: 'good', name: '良好', emoji: '😊' },
  { key: 'neutral', name: '平静', emoji: '😐' },
  { key: 'low', name: '低落', emoji: '😔' },
  { key: 'rough', name: '糟糕', emoji: '😣' },
]

export default function Calendar() {
  const location = useLocation()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [records, setRecords] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('moodRecords') || '[]')
    setRecords(data)
  }, [location.pathname])

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const formatDate = (day) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return d.toLocaleDateString()
  }

  const getDayRecord = (day) => {
    const dateStr = formatDate(day)
    const dayRecords = records.filter(r => r.date === dateStr)
    return dayRecords.length > 0 ? dayRecords[dayRecords.length - 1] : null
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    setSelectedDay(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    setSelectedDay(null)
  }

  const isToday = (day) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const days = getDaysInMonth()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="p-5 pb-28">
      <div className="text-[#2563eb] text-sm font-medium mb-2">
        月视图
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        情绪日历
      </h2>

      <div className="card-moodbloom p-4 mb-6">
        <div className="flex justify-between items-center">
          <button 
            onClick={prevMonth}
            className="w-10 h-10 rounded-full bg-[rgba(96,165,250,0.1)] text-[#2563eb] flex items-center justify-center hover:bg-[rgba(96,165,250,0.2)] transition-colors"
          >
            <span className="text-lg">‹</span>
          </button>
          <div className="text-center">
            <span className="text-lg font-bold text-gray-800">
              {currentDate.toLocaleDateString('zh-CN', { month: 'long' })} {currentDate.getFullYear()}年
            </span>
          </div>
          <button 
            onClick={nextMonth}
            className="w-10 h-10 rounded-full bg-[rgba(96,165,250,0.1)] text-[#2563eb] flex items-center justify-center hover:bg-[rgba(96,165,250,0.2)] transition-colors"
          >
            <span className="text-lg">›</span>
          </button>
        </div>
      </div>

      <div className="card-moodbloom p-4 mb-6">
        <div className="grid grid-cols-7 gap-1 mb-3">
          {weekDays.map((day, index) => (
            <div 
              key={index} 
              className="text-center text-xs font-semibold text-[#2563eb] py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={index} className="min-h-[44px]"></div>
            }
            
            const record = getDayRecord(day)
            const today = isToday(day)
            
            return (
              <button
                key={index}
                onClick={() => record && setSelectedDay(day)}
                className={`min-h-[44px] aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all duration-300
                  ${today ? 'bg-[rgba(96,165,250,0.1)] ring-2 ring-[#60a5fa]' : 'bg-transparent'}
                  ${record ? 'cursor-pointer hover:scale-105' : 'opacity-40'}
                `}
              >
                <span className={`font-medium ${today ? 'text-[#2563eb]' : 'text-gray-700'}`}>{day}</span>
                {record && (
                  <span className="text-sm mt-0.5">
                    {moodConfig[record.mood.key]?.emoji || record.mood.emoji}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {moodList.map((mood) => (
          <div key={mood.key} className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80">
            <span>{mood.emoji}</span>
            <span className="text-xs font-medium text-gray-600">{mood.name}</span>
          </div>
        ))}
      </div>

      {selectedDay && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setSelectedDay(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-[300px] w-full shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              {currentDate.toLocaleDateString('zh-CN', { month: 'long' })} {selectedDay}日, {currentDate.getFullYear()}年
            </h3>
            {getDayRecord(selectedDay) && (
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-[${moodConfig[getDayRecord(selectedDay).mood.key]?.bgColor || '#f3f4f6'}] flex items-center justify-center`}>
                    <span className="text-4xl">
                      {moodConfig[getDayRecord(selectedDay).mood.key]?.emoji || getDayRecord(selectedDay).mood.emoji}
                    </span>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-800">
                      {moodConfig[getDayRecord(selectedDay).mood.key] ? moodList.find(m => m.key === getDayRecord(selectedDay).mood.key)?.name : getDayRecord(selectedDay).mood.name}
                    </p>
                  </div>
                </div>
                {getDayRecord(selectedDay).note && (
                  <div className="p-4 bg-gray-50 rounded-xl mb-4">
                    <p className="text-sm text-gray-700 break-words leading-relaxed">
                      {getDayRecord(selectedDay).note}
                    </p>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setSelectedDay(null)}
              className="w-full py-3 bg-[#60a5fa] text-white rounded-xl font-medium hover:bg-[#3b82f6] transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
