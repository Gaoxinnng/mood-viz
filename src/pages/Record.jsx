import { useState, useEffect } from 'react'

const moodList = [
  { key: 'elated', name: '开心', emoji: '😄', color: '#22c55e', bgColor: '#dcfce7', textColor: '#166534' },
  { key: 'good', name: '良好', emoji: '😊', color: '#84cc16', bgColor: '#f0fdf4', textColor: '#4d7c0f' },
  { key: 'neutral', name: '平静', emoji: '😐', color: '#f59e0b', bgColor: '#fffbeb', textColor: '#92400e' },
  { key: 'low', name: '低落', emoji: '😔', color: '#3b82f6', bgColor: '#eff6ff', textColor: '#1e40af' },
  { key: 'rough', name: '糟糕', emoji: '😣', color: '#ef4444', bgColor: '#fef2f2', textColor: '#991b1b' },
]

const timeOptions = [
  { key: 'morning', name: '早晨', emoji: '🌅' },
  { key: 'afternoon', name: '下午', emoji: '☀️' },
  { key: 'evening', name: '晚上', emoji: '🌙' },
]

export default function Record() {
  const [selectedMood, setSelectedMood] = useState(null)
  const [note, setNote] = useState('')
  const [records, setRecords] = useState([])
  const [saved, setSaved] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState(null)
  const [hasExercise, setHasExercise] = useState(false)
  const [hasSocial, setHasSocial] = useState(false)

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('moodRecords') || '[]')
    setRecords(data)
    
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) {
      setTimeOfDay('morning')
    } else if (hour >= 12 && hour < 18) {
      setTimeOfDay('afternoon')
    } else {
      setTimeOfDay('evening')
    }
  }, [])

  const getTodayDate = () => {
    const date = new Date()
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}日`
  }

  const getRecentStreak = () => {
    const sorted = [...records].sort((a, b) => b.time - a.time)
    const last7Days = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString()
      
      const dayRecord = sorted.find(r => r.date === dateStr)
      last7Days.push({
        date: date,
        dayName: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        record: dayRecord,
      })
    }
    
    return last7Days
  }

  const handleSave = () => {
    if (!selectedMood) {
      return
    }
    
    const moodData = moodList.find(m => m.key === selectedMood)
    
    const record = {
      date: new Date().toLocaleDateString(),
      mood: moodData,
      strength: selectedMood === 'elated' || selectedMood === 'good' ? 5 : 
                selectedMood === 'neutral' ? 3 : 1,
      note: note,
      time: Date.now(),
      timeOfDay: timeOfDay,
      hasExercise: hasExercise,
      hasSocial: hasSocial,
    }
    
    const oldRecords = JSON.parse(localStorage.getItem('moodRecords') || '[]')
    oldRecords.push(record)
    localStorage.setItem('moodRecords', JSON.stringify(oldRecords))
    
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setSelectedMood(null)
      setNote('')
      setHasExercise(false)
      setHasSocial(false)
      const hour = new Date().getHours()
      if (hour >= 6 && hour < 12) {
        setTimeOfDay('morning')
      } else if (hour >= 12 && hour < 18) {
        setTimeOfDay('afternoon')
      } else {
        setTimeOfDay('evening')
      }
      const data = JSON.parse(localStorage.getItem('moodRecords') || '[]')
      setRecords(data)
    }, 1500)
  }

  const recentStreak = getRecentStreak()

  return (
    <div className="p-5 pb-28">
      <div className="text-[#16a34a] text-sm font-medium mb-2">
        {getTodayDate()}
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        今天心情如何？
      </h2>

      <div className="flex justify-between gap-2 mb-8">
        {moodList.map((mood) => (
          <button
            key={mood.key}
            onClick={() => setSelectedMood(mood.key)}
            className={`flex-1 flex flex-col items-center justify-center p-4 rounded-[1.5rem] transition-all duration-300
              ${selectedMood === mood.key 
                ? `bg-[${mood.bgColor}] ring-2 ring-[${mood.color}] ring-offset-2 scale-105` 
                : 'bg-white/60 hover:bg-white/80 hover:scale-102'
              }`}
          >
            <span className="text-3xl mb-2">{mood.emoji}</span>
            <span className={`text-xs font-semibold ${selectedMood === mood.key ? `text-[${mood.textColor}]` : 'text-gray-500'}`}>
              {mood.name}
            </span>
          </button>
        ))}
      </div>

      <div className="card-moodbloom p-5 mb-4">
        <label className="text-[#16a34a] text-sm font-medium mb-3 block">
          有什么想说的？（可选）
        </label>
        <textarea
          className="w-full bg-transparent border-none resize-none text-gray-600 text-sm placeholder:text-gray-300 focus:outline-none h-24"
          placeholder="写点什么..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="space-y-3 mb-6">
        <label className="text-[#16a34a] text-sm font-medium block">
          记录标签
        </label>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {timeOptions.map((time) => (
            <button
              key={time.key}
              onClick={() => setTimeOfDay(timeOfDay === time.key ? null : time.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2
                ${timeOfDay === time.key
                  ? 'bg-[#4ade80] text-white shadow-md shadow-[#4ade80]/30'
                  : 'bg-white/60 text-gray-600 border border-gray-200 hover:bg-white/80'
                }`}
            >
              <span>{time.emoji}</span>
              <span>{time.name}</span>
            </button>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setHasExercise(!hasExercise)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2
              ${hasExercise
                ? 'bg-[#4ade80] text-white shadow-md shadow-[#4ade80]/30'
                : 'bg-white/60 text-gray-600 border border-gray-200 hover:bg-white/80'
              }`}
          >
            <span>🏃</span>
            <span>今天运动了</span>
          </button>
          
          <button
            onClick={() => setHasSocial(!hasSocial)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2
              ${hasSocial
                ? 'bg-[#4ade80] text-white shadow-md shadow-[#4ade80]/30'
                : 'bg-white/60 text-gray-600 border border-gray-200 hover:bg-white/80'
              }`}
          >
            <span>👥</span>
            <span>今天有社交</span>
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={!selectedMood}
        className={`w-full py-4 rounded-[1.5rem] font-semibold text-lg transition-all duration-300
          ${selectedMood 
            ? 'bg-[#4ade80] text-white shadow-lg shadow-[#4ade80]/30 hover:shadow-xl hover:shadow-[#4ade80]/40' 
            : 'bg-[rgba(74,222,128,0.2)] text-[#16a34a]/50 cursor-not-allowed'
          }
          ${saved ? 'bg-green-600' : ''}`}
      >
        {saved ? '✓ 已保存！' : '保存今日心情'}
      </button>

      <div className="card-moodbloom p-5 mt-6">
        <label className="text-[#16a34a] text-sm font-medium mb-4 block">
          最近记录
        </label>
        <div className="flex justify-between">
          {recentStreak.map((item) => (
            <div key={item.date.getTime()} className="flex flex-col items-center">
              <span className="text-2xl mb-1">
                {item.record ? item.record.mood.emoji : '○'}
              </span>
              <span className="text-[10px] text-gray-400">{item.dayName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
