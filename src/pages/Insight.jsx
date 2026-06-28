import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const quickTips = [
  { emoji: '🧘', text: '情绪低落时，试试5分钟深呼吸。' },
  { emoji: '📝', text: '每天写日记能提升40%的情绪记忆力。' },
  { emoji: '🌿', text: '亲近自然能让好心情持续7小时。' },
]

const moodConfig = {
  elated: { name: '开心', emoji: '😄' },
  good: { name: '良好', emoji: '😊' },
  neutral: { name: '平静', emoji: '😐' },
  low: { name: '低落', emoji: '😔' },
  rough: { name: '糟糕', emoji: '😣' },
}

const suggestions = {
  elated: [
    '保持这份好心情！可以记录下让你开心的事情，以后低落时翻出来看看~',
    '心情好的时候效率最高，趁这个时候完成一些重要任务吧！',
    '把你的快乐分享给身边的人，好心情会传染哦~'
  ],
  good: [
    '不错的状态！保持积极心态，今天会很顺利~',
    '利用这个状态完成一些待办事项吧！',
    '享受当下的美好时光~'
  ],
  neutral: [
    '平静的状态很珍贵，可以做一些需要专注的事情。',
    '试试冥想5分钟，让内心更宁静。',
    '利用平静的时刻，规划一下接下来的生活。'
  ],
  low: [
    '低落是正常的情绪，允许自己难过一会儿，没关系的。',
    '听听喜欢的音乐，或者看一部温暖的电影。',
    '和朋友聊聊天吧，说出来会好很多。'
  ],
  rough: [
    '先深呼吸10次，等情绪平复一点再做决定。',
    '去运动一下，跑步、打球都能很好地释放情绪。',
    '问问自己：这件事3年后还重要吗？很多愤怒其实不值得。'
  ],
}

const insightTexts = {
  positive: [
    '太棒了！你的积极能量很充沛，继续保持这份好心情~',
    '整体情绪状态很不错，你正在享受美好的生活！',
    '正能量满满的你，周围的人也会被你感染哦！',
  ],
  balanced: [
    '情绪比较平稳，这是很健康的状态。试着多记录一些开心的时刻吧！',
    '你的情绪像平静的湖面，波澜不惊，很适合思考和规划。',
    '稳定的情绪是成功的基石，继续保持这份从容~',
  ],
  negative: [
    '近期情绪偏低，多做一些让自己开心的事吧，比如听听音乐、出门散步~',
    '感觉有点疲惫吗？给自己放个假，好好休息一下吧。',
    '情绪就像天气，总有阴转晴的时候，给自己一些时间~',
  ],
  fewRecords: [
    '记录还比较少哦，多记录一些，洞察会更准确~',
    '刚开始记录吧？坚持下去，你会发现更多有趣的规律！',
    '每一次记录都是对自己的关爱，继续加油~',
  ],
}

const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日']

export default function Insight() {
  const location = useLocation()
  const [records, setRecords] = useState([])
  const [currentSuggestion, setCurrentSuggestion] = useState('')
  const [expandedCards, setExpandedCards] = useState({})

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('moodRecords') || '[]')
    setRecords(data)
    
    if (data.length > 0) {
      const lastMood = data[data.length - 1].mood.key || data[data.length - 1].mood
      const tips = suggestions[lastMood] || suggestions.neutral
      const randomTip = tips[Math.floor(Math.random() * tips.length)]
      setCurrentSuggestion(randomTip)
    }
  }, [location.pathname])

  const total = records.length
  
  const avgStrength = total 
    ? (records.reduce((sum, item) => sum + (typeof item.strength === 'number' ? item.strength : 3), 0) / total).toFixed(1)
    : 0

  const moodCount = {}
  records.forEach(item => {
    const key = item.mood.key || item.mood
    moodCount[key] = (moodCount[key] || 0) + 1
  })

  let mostMood = null
  let mostCount = 0
  Object.keys(moodCount).forEach(key => {
    if (moodCount[key] > mostCount) {
      mostCount = moodCount[key]
      mostMood = key
    }
  })

  const negativeMoods = ['low', 'rough']
  const positiveMoods = ['elated', 'good']
  
  const recentNegative = records.length >= 3 && 
    records.slice(-3).every(r => negativeMoods.includes(r.mood.key || r.mood))

  const getInsightText = () => {
    if (total < 3) {
      return insightTexts.fewRecords[Math.floor(Math.random() * insightTexts.fewRecords.length)]
    }
    
    const avg = parseFloat(avgStrength)
    if (avg >= 4) {
      return insightTexts.positive[Math.floor(Math.random() * insightTexts.positive.length)]
    } else if (avg >= 3) {
      return insightTexts.balanced[Math.floor(Math.random() * insightTexts.balanced.length)]
    } else {
      return insightTexts.negative[Math.floor(Math.random() * insightTexts.negative.length)]
    }
  }

  const getMoodInsight = () => {
    if (!mostMood) return null
    
    const mostMoodConfig = moodConfig[mostMood]
    if (!mostMoodConfig) return null
    
    const isPositive = positiveMoods.includes(mostMood)
    const isNegative = negativeMoods.includes(mostMood)
    
    if (isPositive) {
      return {
        type: 'positive',
        text: `你最常出现的情绪是${mostMoodConfig.emoji}${mostMoodConfig.name}，共${mostCount}次，你的心态很积极！`,
      }
    } else if (isNegative) {
      return {
        type: 'negative',
        text: `你最常出现的情绪是${mostMoodConfig.emoji}${mostMoodConfig.name}，共${mostCount}次，记得多关爱自己哦~`,
      }
    } else {
      return {
        type: 'neutral',
        text: `你最常出现的情绪是${mostMoodConfig.emoji}${mostMoodConfig.name}，共${mostCount}次，内心很平静~`,
      }
    }
  }

  const moodInsight = getMoodInsight()

  const getMoodValue = (record) => {
    if (record.mood && typeof record.mood.value === 'number') return record.mood.value
    if (typeof record.strength === 'number') return record.strength
    return 3
  }

  const getMoodEmojiByValue = (value) => {
    if (value >= 4.5) return '😄'
    if (value >= 3.5) return '😊'
    if (value >= 2.5) return '😐'
    if (value >= 1.5) return '😔'
    return '😣'
  }

  const getWeekdayAnalysis = () => {
    const weekdayData = [[], [], [], [], [], [], []]
    
    records.forEach(record => {
      const date = new Date(record.time)
      const day = date.getDay()
      const adjustedDay = day === 0 ? 6 : day - 1
      weekdayData[adjustedDay].push(getMoodValue(record))
    })
    
    const averages = weekdayData.map(dayRecords => {
      if (dayRecords.length === 0) return null
      return dayRecords.reduce((a, b) => a + b, 0) / dayRecords.length
    })
    
    let maxDay = null
    let minDay = null
    let maxValue = -1
    let minValue = 6
    
    averages.forEach((avg, index) => {
      if (avg !== null) {
        if (avg > maxValue) {
          maxValue = avg
          maxDay = index
        }
        if (avg < minValue) {
          minValue = avg
          minDay = index
        }
      }
    })
    
    return { averages, maxDay, minDay, maxValue, minValue }
  }

  const getWeekendAnalysis = () => {
    const weekdayRecords = []
    const weekendRecords = []
    
    records.forEach(record => {
      const date = new Date(record.time)
      const day = date.getDay()
      if (day === 0 || day === 6) {
        weekendRecords.push(getMoodValue(record))
      } else {
        weekdayRecords.push(getMoodValue(record))
      }
    })
    
    const weekdayAvg = weekdayRecords.length >= 2 
      ? weekdayRecords.reduce((a, b) => a + b, 0) / weekdayRecords.length 
      : null
    const weekendAvg = weekendRecords.length >= 2 
      ? weekendRecords.reduce((a, b) => a + b, 0) / weekendRecords.length 
      : null
    
    let title = '情绪稳定'
    let color = 'bg-[#eff6ff]'
    let textColor = 'text-[#2563eb]'
    let tagBg = 'bg-[rgba(96,165,250,0.2)]'
    
    if (weekdayAvg !== null && weekendAvg !== null) {
      const diff = weekendAvg - weekdayAvg
      if (diff > 0.5) {
        title = '周末更嗨'
        color = 'bg-[#f0fdf4]'
        textColor = 'text-[#16a34a]'
        tagBg = 'bg-[rgba(74,222,128,0.2)]'
      } else if (diff < -0.5) {
        title = '周末低落'
        color = 'bg-[#fffbeb]'
        textColor = 'text-[#d97706]'
        tagBg = 'bg-[rgba(251,191,36,0.2)]'
      }
    }
    
    return { weekdayAvg, weekendAvg, weekdayCount: weekdayRecords.length, weekendCount: weekendRecords.length, title, color, textColor, tagBg }
  }

  const getTimeOfDayAnalysis = () => {
    const morningRecords = []
    const afternoonRecords = []
    const eveningRecords = []
    
    records.forEach(record => {
      if (record.timeOfDay === 'morning') {
        morningRecords.push(getMoodValue(record))
      } else if (record.timeOfDay === 'afternoon') {
        afternoonRecords.push(getMoodValue(record))
      } else if (record.timeOfDay === 'evening') {
        eveningRecords.push(getMoodValue(record))
      }
    })
    
    const morningAvg = morningRecords.length >= 2 
      ? morningRecords.reduce((a, b) => a + b, 0) / morningRecords.length 
      : null
    const afternoonAvg = afternoonRecords.length >= 2 
      ? afternoonRecords.reduce((a, b) => a + b, 0) / afternoonRecords.length 
      : null
    const eveningAvg = eveningRecords.length >= 2 
      ? eveningRecords.reduce((a, b) => a + b, 0) / eveningRecords.length 
      : null
    
    let bestTime = null
    let bestValue = -1
    const times = [
      { key: 'morning', avg: morningAvg },
      { key: 'afternoon', avg: afternoonAvg },
      { key: 'evening', avg: eveningAvg },
    ]
    
    times.forEach(t => {
      if (t.avg !== null && t.avg > bestValue) {
        bestValue = t.avg
        bestTime = t.key
      }
    })
    
    return { morningAvg, afternoonAvg, eveningAvg, bestTime, morningCount: morningRecords.length, afternoonCount: afternoonRecords.length, eveningCount: eveningRecords.length }
  }

  const getExerciseAnalysis = () => {
    const exerciseRecords = []
    const restRecords = []
    
    records.forEach(record => {
      if (record.hasExercise) {
        exerciseRecords.push(getMoodValue(record))
      } else {
        restRecords.push(getMoodValue(record))
      }
    })
    
    const exerciseAvg = exerciseRecords.length >= 1 
      ? exerciseRecords.reduce((a, b) => a + b, 0) / exerciseRecords.length 
      : null
    const restAvg = restRecords.length >= 1 
      ? restRecords.reduce((a, b) => a + b, 0) / restRecords.length 
      : null
    
    return { 
      exerciseAvg, 
      restAvg, 
      exerciseCount: exerciseRecords.length, 
      restCount: restRecords.length,
      hasExerciseData: exerciseRecords.length > 0,
    }
  }

  const getSocialAnalysis = () => {
    const socialRecords = []
    const aloneRecords = []
    
    records.forEach(record => {
      if (record.hasSocial) {
        socialRecords.push(getMoodValue(record))
      } else {
        aloneRecords.push(getMoodValue(record))
      }
    })
    
    const socialAvg = socialRecords.length >= 1 
      ? socialRecords.reduce((a, b) => a + b, 0) / socialRecords.length 
      : null
    const aloneAvg = aloneRecords.length >= 1 
      ? aloneRecords.reduce((a, b) => a + b, 0) / aloneRecords.length 
      : null
    
    return { 
      socialAvg, 
      aloneAvg, 
      socialCount: socialRecords.length, 
      aloneCount: aloneRecords.length,
      hasSocialData: socialRecords.length > 0,
    }
  }

  const toggleCard = (key) => {
    setExpandedCards(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const changeSuggestion = () => {
    if (records.length === 0) return
    const lastMood = records[records.length - 1].mood.key || records[records.length - 1].mood
    const tips = suggestions[lastMood] || suggestions.neutral
    let newTip = tips[Math.floor(Math.random() * tips.length)]
    while (newTip === currentSuggestion && tips.length > 1) {
      newTip = tips[Math.floor(Math.random() * tips.length)]
    }
    setCurrentSuggestion(newTip)
  }

  const weekendAnalysis = getWeekendAnalysis()
  const weekdayAnalysis = getWeekdayAnalysis()
  const timeOfDayAnalysis = getTimeOfDayAnalysis()
  const exerciseAnalysis = getExerciseAnalysis()
  const socialAnalysis = getSocialAnalysis()

  const cardConfigs = [
    {
      key: 'morning',
      title: '早晨能量',
      tag: '模式',
      emoji: '🌅',
      color: 'bg-[#fffbeb]',
      textColor: 'text-[#d97706]',
      tagBg: 'bg-[rgba(251,191,36,0.2)]',
      locked: false,
    },
    {
      key: 'exercise',
      title: '运动有益',
      tag: '习惯',
      emoji: '🏃',
      color: 'bg-[#f0fdf4]',
      textColor: 'text-[#16a34a]',
      tagBg: 'bg-[rgba(74,222,128,0.2)]',
      locked: false,
    },
    {
      key: 'weekend',
      title: weekendAnalysis.title,
      tag: '趋势',
      emoji: '🌙',
      color: weekendAnalysis.color,
      textColor: weekendAnalysis.textColor,
      tagBg: weekendAnalysis.tagBg,
      locked: false,
    },
    {
      key: 'social',
      title: '社交提升',
      tag: '模式',
      emoji: '👥',
      color: 'bg-[#f5f3ff]',
      textColor: 'text-[#7c3aed]',
      tagBg: 'bg-[rgba(167,139,250,0.2)]',
      locked: false,
    },
    {
      key: 'weekday',
      title: '周中低谷',
      tag: '趋势',
      emoji: '📉',
      color: 'bg-[#fffbeb]',
      textColor: 'text-[#d97706]',
      tagBg: 'bg-[rgba(251,191,36,0.2)]',
      locked: false,
    },
  ]

  const renderMorningContent = () => {
    const { morningAvg, afternoonAvg, eveningAvg, bestTime, morningCount, afternoonCount, eveningCount } = timeOfDayAnalysis
    
    const hasEnoughData = morningAvg !== null || afternoonAvg !== null || eveningAvg !== null
    
    if (!hasEnoughData) {
      return (
        <div className="pt-4 text-center">
          <p className="text-sm text-gray-500">多记录不同时段的心情，就能看到规律啦~</p>
        </div>
      )
    }
    
    let conclusion = ''
    if (bestTime === 'morning') {
      conclusion = '你是早起活力型，早上状态最好！'
    } else if (bestTime === 'afternoon') {
      conclusion = '你是午后续航型，下午效率最高！'
    } else if (bestTime === 'evening') {
      conclusion = '你是夜猫子型，越晚越精神~'
    }
    
    return (
      <div className="pt-4 space-y-3">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <span>🌅</span>
            <span className="text-sm text-gray-500">早晨</span>
            <span className="text-xl">{morningAvg !== null ? getMoodEmojiByValue(morningAvg) : '—'}</span>
          </div>
          <span className="font-bold text-gray-800">
            {morningAvg !== null ? `${morningAvg.toFixed(1)} 分` : '数据不足'}
          </span>
        </div>
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <span>☀️</span>
            <span className="text-sm text-gray-500">下午</span>
            <span className="text-xl">{afternoonAvg !== null ? getMoodEmojiByValue(afternoonAvg) : '—'}</span>
          </div>
          <span className="font-bold text-gray-800">
            {afternoonAvg !== null ? `${afternoonAvg.toFixed(1)} 分` : '数据不足'}
          </span>
        </div>
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <span>🌙</span>
            <span className="text-sm text-gray-500">晚上</span>
            <span className="text-xl">{eveningAvg !== null ? getMoodEmojiByValue(eveningAvg) : '—'}</span>
          </div>
          <span className="font-bold text-gray-800">
            {eveningAvg !== null ? `${eveningAvg.toFixed(1)} 分` : '数据不足'}
          </span>
        </div>
        <p className="text-sm text-gray-500 text-center pt-2 border-t border-gray-100">{conclusion}</p>
      </div>
    )
  }

  const renderExerciseContent = () => {
    const { exerciseAvg, restAvg, exerciseCount, restCount, hasExerciseData } = exerciseAnalysis
    
    if (!hasExerciseData) {
      return (
        <div className="pt-4 text-center">
          <p className="text-sm text-gray-500">标记几次运动日，就能看到运动对你的影响啦~</p>
        </div>
      )
    }
    
    let diffText = ''
    let suggestion = '坚持每周运动3次，心情会越来越好哦~'
    
    if (exerciseAvg !== null && restAvg !== null) {
      const diff = exerciseAvg - restAvg
      if (diff > 0.3) {
        diffText = `运动让你的情绪提升了 ${diff.toFixed(1)} 分！`
      } else if (diff < -0.3) {
        diffText = '运动后情绪反而低了？可能是太累了~'
        suggestion = '试试运动后好好休息，或者降低运动强度~'
      } else {
        diffText = '运动对你情绪影响不大，保持就好~'
      }
    }
    
    return (
      <div className="pt-4 space-y-3">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <span>🏃</span>
            <span className="text-sm text-gray-500">运动日</span>
            <span className="text-xl">{exerciseAvg !== null ? getMoodEmojiByValue(exerciseAvg) : '—'}</span>
          </div>
          <span className="font-bold text-gray-800">
            {exerciseAvg !== null ? `${exerciseAvg.toFixed(1)} 分` : '数据不足'}
          </span>
        </div>
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <span>🛋️</span>
            <span className="text-sm text-gray-500">非运动日</span>
            <span className="text-xl">{restAvg !== null ? getMoodEmojiByValue(restAvg) : '—'}</span>
          </div>
          <span className="font-bold text-gray-800">
            {restAvg !== null ? `${restAvg.toFixed(1)} 分` : '数据不足'}
          </span>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-2">{diffText}</p>
          <p className="text-xs text-gray-400">💡 {suggestion}</p>
        </div>
      </div>
    )
  }

  const renderSocialContent = () => {
    const { socialAvg, aloneAvg, socialCount, aloneCount, hasSocialData } = socialAnalysis
    
    if (!hasSocialData) {
      return (
        <div className="pt-4 text-center">
          <p className="text-sm text-gray-500">标记几次社交日，就能看到社交对你的影响啦~</p>
        </div>
      )
    }
    
    let diffText = ''
    let suggestion = ''
    
    if (socialAvg !== null && aloneAvg !== null) {
      const diff = socialAvg - aloneAvg
      if (diff > 0.3) {
        diffText = `社交让你的情绪提升了 ${diff.toFixed(1)} 分，多和朋友出去玩吧！`
        suggestion = '约上三五好友，让快乐翻倍~'
      } else if (diff < -0.3) {
        diffText = '你更喜欢独处，一个人时状态更好~'
        suggestion = '遵从内心，独处时也能收获满满的能量~'
      } else {
        diffText = '社交和独处对你都差不多，随心就好~'
        suggestion = '不管是社交还是独处，舒服最重要~'
      }
    }
    
    return (
      <div className="pt-4 space-y-3">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <span>👥</span>
            <span className="text-sm text-gray-500">社交日</span>
            <span className="text-xl">{socialAvg !== null ? getMoodEmojiByValue(socialAvg) : '—'}</span>
          </div>
          <span className="font-bold text-gray-800">
            {socialAvg !== null ? `${socialAvg.toFixed(1)} 分` : '数据不足'}
          </span>
        </div>
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <span>🧘</span>
            <span className="text-sm text-gray-500">独处日</span>
            <span className="text-xl">{aloneAvg !== null ? getMoodEmojiByValue(aloneAvg) : '—'}</span>
          </div>
          <span className="font-bold text-gray-800">
            {aloneAvg !== null ? `${aloneAvg.toFixed(1)} 分` : '数据不足'}
          </span>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-2">{diffText}</p>
          <p className="text-xs text-gray-400">💡 {suggestion}</p>
        </div>
      </div>
    )
  }

  const renderWeekendContent = () => {
    const { weekdayAvg, weekendAvg, weekdayCount, weekendCount } = weekendAnalysis
    
    if (weekdayAvg === null && weekendAvg === null) {
      return (
        <div className="pt-4 text-center">
          <p className="text-sm text-gray-500">数据不足，至少需要各2条记录哦~</p>
        </div>
      )
    }
    
    const diff = weekdayAvg !== null && weekendAvg !== null ? (weekendAvg - weekdayAvg).toFixed(1) : null
    
    let conclusion = ''
    if (diff !== null) {
      if (parseFloat(diff) > 0.5) {
        conclusion = `你周末的情绪比工作日高 ${diff} 分，很会享受生活呀~`
      } else if (parseFloat(diff) < -0.5) {
        conclusion = `你工作日情绪更好，是个热爱工作的人！`
      } else {
        conclusion = '工作日和周末情绪差不多，状态很稳定~'
      }
    } else if (weekdayAvg === null) {
      conclusion = '工作日记录不足2条，还无法对比~'
    } else {
      conclusion = '周末记录不足2条，还无法对比~'
    }
    
    return (
      <div className="pt-4 space-y-3">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">工作日</span>
            <span className="text-xl">{weekdayAvg !== null ? getMoodEmojiByValue(weekdayAvg) : '—'}</span>
          </div>
          <span className="font-bold text-gray-800">
            {weekdayAvg !== null ? `${weekdayAvg.toFixed(1)} 分` : '数据不足'}
          </span>
        </div>
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">周末</span>
            <span className="text-xl">{weekendAvg !== null ? getMoodEmojiByValue(weekendAvg) : '—'}</span>
          </div>
          <span className="font-bold text-gray-800">
            {weekendAvg !== null ? `${weekendAvg.toFixed(1)} 分` : '数据不足'}
          </span>
        </div>
        <p className="text-sm text-gray-500 text-center pt-2 border-t border-gray-100">{conclusion}</p>
      </div>
    )
  }

  const renderWeekdayContent = () => {
    const { averages, maxDay, minDay, maxValue, minValue } = weekdayAnalysis
    
    const hasData = averages.some(avg => avg !== null)
    
    if (!hasData) {
      return (
        <div className="pt-4 text-center">
          <p className="text-sm text-gray-500">还没有记录，快去记录情绪吧~</p>
        </div>
      )
    }
    
    const maxBarHeight = 80
    
    return (
      <div className="pt-4 space-y-4">
        <div className="flex items-end justify-between px-1" style={{ height: '100px' }}>
          {averages.map((avg, index) => {
            const height = avg !== null ? (avg / 5) * maxBarHeight : 0
            let barColor = '#9ca3af'
            if (avg !== null) {
              if (avg >= 4) barColor = '#22c55e'
              else if (avg >= 3) barColor = '#84cc16'
              else if (avg >= 2) barColor = '#f59e0b'
              else barColor = '#ef4444'
            }
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-5 rounded-t-lg transition-all duration-500"
                  style={{ height: `${height}px`, backgroundColor: avg !== null ? barColor : '#e5e7eb' }}
                />
                <span className="text-xs text-gray-400 mt-2">{weekdayLabels[index]}</span>
              </div>
            )
          })}
        </div>
        <div className="space-y-2 pt-2 border-t border-gray-100">
          {maxDay !== null && (
            <p className="text-sm text-gray-600">
              你通常<span className="font-medium text-green-500">周{weekdayLabels[maxDay]}</span>情绪最高，平均{maxValue.toFixed(1)}分
            </p>
          )}
          {minDay !== null && (
            <p className="text-sm text-gray-600">
              你通常<span className="font-medium text-orange-500">周{weekdayLabels[minDay]}</span>情绪最低，平均{minValue.toFixed(1)}分
            </p>
          )}
          <p className="text-xs text-gray-400">情绪低的那天记得多做些让自己开心的事哦~</p>
        </div>
      </div>
    )
  }

  const renderCardContent = (card) => {
    if (card.key === 'morning') return renderMorningContent()
    if (card.key === 'exercise') return renderExerciseContent()
    if (card.key === 'weekend') return renderWeekendContent()
    if (card.key === 'social') return renderSocialContent()
    if (card.key === 'weekday') return renderWeekdayContent()
    return null
  }

  return (
    <div className="p-5 pb-28">
      <div className="text-[#d97706] text-sm font-medium mb-2">
        基于你的数据
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        情绪洞察
      </h2>

      {total === 0 ? (
        <div className="card-moodbloom p-12 text-center">
          <p className="text-5xl mb-4">🤔</p>
          <p className="text-gray-500">还没有情绪记录哦</p>
          <p className="text-sm text-gray-400 mt-2">先去记录几条心情，再来看看洞察吧~</p>
        </div>
      ) : (
        <>
          <div className="bg-[#fffbeb] rounded-[1.5rem] p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#d97706] font-semibold text-sm">小贴士</span>
              <span>💛</span>
            </div>
            <div className="space-y-3">
              {quickTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-xl">{tip.emoji}</span>
                  <span className="text-sm text-gray-700 leading-relaxed">{tip.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {cardConfigs.map((card) => (
              <div 
                key={card.key} 
                className={`${card.color} rounded-[1.5rem] p-4 transition-all duration-300`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{card.emoji}</span>
                    <div>
                      <p className={`font-bold ${card.textColor}`}>{card.title}</p>
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${card.tagBg} ${card.textColor}`}>
                        {card.tag}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleCard(card.key)}
                    className={`w-8 h-8 rounded-full ${card.tagBg} ${card.textColor} flex items-center justify-center transition-transform duration-300 ${expandedCards[card.key] ? 'rotate-180' : ''}`}
                  >
                    <span className="text-sm">{expandedCards[card.key] ? '−' : '+'}</span>
                  </button>
                </div>
                <div 
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: expandedCards[card.key] ? '500px' : '0px', opacity: expandedCards[card.key] ? 1 : 0 }}
                >
                  {renderCardContent(card)}
                </div>
              </div>
            ))}
          </div>

          {recentNegative && (
            <div className="card-moodbloom p-4 mb-6 border border-[rgba(251,191,36,0.3)]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[rgba(251,191,36,0.2)] flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💛</span>
                </div>
                <div>
                  <p className="font-medium text-[#d97706] mb-1">温馨提醒</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    最近你连续记录了负面情绪，记得多关心自己。
                    如果持续感到不适，可以寻求专业帮助。
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="card-moodbloom p-5 mb-6">
            <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
              <span>🔍</span> 情绪小洞察
            </h3>
            <ul className="space-y-3">
              {moodInsight && (
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[rgba(251,191,36,0.2)] text-[#d97706] flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span className="text-sm text-gray-600">
                    {moodInsight.text}
                  </span>
                </li>
              )}
              {total < 3 && (
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span className="text-sm text-gray-600">
                    {getInsightText()}
                  </span>
                </li>
              )}
              {total >= 3 && parseFloat(avgStrength) >= 4 && (
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-500 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span className="text-sm text-gray-600">
                    {getInsightText()}
                  </span>
                </li>
              )}
              {total >= 3 && parseFloat(avgStrength) >= 3 && parseFloat(avgStrength) < 4 && (
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-500 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span className="text-sm text-gray-600">
                    {getInsightText()}
                  </span>
                </li>
              )}
              {total >= 3 && parseFloat(avgStrength) < 3 && (
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span className="text-sm text-gray-600">
                    {getInsightText()}
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] rounded-[1.5rem] p-5">
            <h3 className="font-medium text-white mb-3 flex items-center gap-2">
              <span>💡</span> 给你的小建议
            </h3>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
              <p className="text-sm text-white/90 leading-relaxed">
                {currentSuggestion || '记录更多情绪后，会为你生成个性化建议~'}
              </p>
            </div>
            {total > 0 && (
              <button
                onClick={changeSuggestion}
                className="w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>🔄</span> 换一条建议
              </button>
            )}
          </div>

          <div className="card-moodbloom p-4 mt-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-lg">💙</span>
              <span className="text-sm font-medium text-gray-600">心理援助资源</span>
            </div>
            <p className="text-xs text-gray-400 text-center">
              如果情绪问题持续困扰你，请寻求专业心理援助
            </p>
            <p className="text-sm font-bold text-[#d97706] text-center mt-2">
              全国心理援助热线：400-161-9995
            </p>
          </div>
        </>
      )}
    </div>
  )
}
