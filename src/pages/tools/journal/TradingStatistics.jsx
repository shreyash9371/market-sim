import { useMemo, useState, useRef, useEffect } from 'react'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import {
  calcPnl,
  calcRR,
  getTradeResult
} from '../../../utils/tradeMetrics'

// ── REUSABLE UI PIECES ──
function Card({ children, style = {}, noPadding = false, hoverable = false }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => hoverable && setHover(true)}
      onMouseLeave={() => hoverable && setHover(false)}
      style={{
        background: 'var(--bg-panel)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        padding: noPadding ? '0' : '20px',
        boxShadow: hover ? '0 8px 30px rgba(0,0,0,0.07)' : '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'var(--font-sans)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
        ...style,
      }}>
      {children}
    </div>
  )
}

function StatPill({ label, value, sub, color, icon }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--bg-panel)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        padding: '16px 20px',
        boxShadow: hover ? '0 8px 30px rgba(0,0,0,0.07)' : '0 1px 3px rgba(0,0,0,0.04)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 700, color, fontFamily: 'var(--font-sans)', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '5px', fontFamily: 'var(--font-sans)' }}>{sub}</div>}
    </div>
  )
}

function CardHeader({ title, endAction = null }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: '16px', padding: '0 2px'
    }}>
      <h3 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'var(--font-sans)' }}>
        {title}
      </h3>
      {endAction}
    </div>
  )
}

function Badge({ children, variant = 'neutral' }) {
  const bg = variant === 'green' ? 'rgba(16,185,129,0.12)' : variant === 'red' ? 'rgba(239,68,68,0.12)' : 'var(--bg-base)'
  const color = variant === 'green' ? 'var(--accent-green)' : variant === 'red' ? 'var(--accent-red)' : 'var(--text-secondary)'
  const borderColor = variant === 'green' ? 'rgba(16,185,129,0.2)' : variant === 'red' ? 'rgba(239,68,68,0.2)' : 'var(--border)'
  return (
    <span style={{
      background: bg, color, padding: '3px 8px', borderRadius: '6px', border: `1px solid ${borderColor}`,
      fontSize: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)'
    }}>
      {children}
    </span>
  )
}

function PillHighlight({ val, positive }) {
  return (
    <span style={{
      background: positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
      color: positive ? 'var(--accent-green)' : 'var(--accent-red)',
      padding: '3px 10px', borderRadius: '999px',
      fontSize: '11px', fontWeight: 800, marginLeft: '10px',
      border: `1px solid ${positive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
    }}>
      {positive ? '+' : ''}{val}
    </span>
  )
}

const inputStyle = {
  background: 'var(--bg-card)',
  border: '1.5px solid var(--border)',
  borderRadius: '12px',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-sans)',
  fontSize: '13px',
  padding: '9px 13px',
  outline: 'none',
  width: '100%',
  transition: 'border .15s',
}

function CustomDatePicker({ value, onChange, placeholder = "Select Date" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(value ? new Date(value + 'T12:00:00') : new Date())
  const ref = useRef(null)

  useEffect(() => {
    const clickOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false) }
    document.addEventListener('mousedown', clickOut)
    return () => document.removeEventListener('mousedown', clickOut)
  }, [])

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate()
  const startDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()

  const handleDaySelect = (d) => {
    const month = String(viewDate.getMonth() + 1).padStart(2, '0')
    const day = String(d).padStart(2, '0')
    const newVal = `${viewDate.getFullYear()}-${month}-${day}`
    onChange(newVal)
    setIsOpen(false)
  }

  const changeMonth = (offset) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1))
  }

  const displayDate = value ? (() => {
    const [y, m, d] = value.split('-')
    return `${d}-${m}-${y}`
  })() : placeholder

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ ...inputStyle, background: 'var(--bg-panel)', borderColor: isOpen ? 'var(--accent-blue)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', height: '36px' }}>
        <span style={{ fontSize: '13px', color: value ? 'var(--text-primary)' : 'var(--text-dim)', fontWeight: value ? 600 : 500 }}>{displayDate}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-md)', zIndex: 1000, width: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button onClick={() => changeMonth(-1)} style={{ background: 'var(--bg-base)', border: 'none', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', color: 'var(--text-primary)' }}>❮</button>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            <button onClick={() => changeMonth(1)} style={{ background: 'var(--bg-base)', border: 'none', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', color: 'var(--text-primary)' }}>❯</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>{d}</div>
            ))}
            {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => {
              const d = i + 1
              const month = String(viewDate.getMonth() + 1).padStart(2, '0')
              const dayStr = String(d).padStart(2, '0')
              const isSelected = value === `${viewDate.getFullYear()}-${month}-${dayStr}`
              return (
                <div key={d}
                  onClick={() => handleDaySelect(d)}
                  style={{
                    padding: '8px 0', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer',
                    background: isSelected ? 'var(--accent-blue)' : 'transparent',
                    color: isSelected ? '#fff' : 'var(--text-primary)',
                    transition: 'all 0.1s'
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                >{d}</div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── MAIN STATISTICS COMPONENT ──
export default function TradingStatistics({ trades, tod, firstName, onTradeClick }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [showScoreInfo, setShowScoreInfo] = useState(false)
  const tradesListRef = useRef(null)

  // ── FILTERING STATE ──
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'this_week', 'last_week', 'this_month', 'last_month', 'custom'
  const [customRange, setCustomRange] = useState({ start: '', end: '' })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [winRateMode, setWinRateMode] = useState(localStorage.getItem('journal_wr_mode') || 'withBE')

  useEffect(() => {
    const handleStorage = () => setWinRateMode(localStorage.getItem('journal_wr_mode') || 'withBE')
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // ── HELPERS FOR FILTERING ──
  const filteredTrades = useMemo(() => {
    const now = new Date()
    const getStartOfWeek = (d) => {
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Start Monday
      return new Date(d.setDate(diff))
    }

    return trades.filter(t => {
      if (activeFilter === 'all') return true
      const tradeDate = new Date(t.date + 'T12:00:00')

      if (activeFilter === 'this_week') {
        const start = getStartOfWeek(new Date(now))
        start.setHours(0, 0, 0, 0)
        return tradeDate >= start
      }
      if (activeFilter === 'last_week') {
        const start = getStartOfWeek(new Date(now))
        start.setDate(start.getDate() - 7)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(end.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        return tradeDate >= start && tradeDate <= end
      }
      if (activeFilter === 'this_month') {
        return tradeDate.getMonth() === now.getMonth() && tradeDate.getFullYear() === now.getFullYear()
      }
      if (activeFilter === 'last_month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        return tradeDate.getMonth() === lastMonth.getMonth() && tradeDate.getFullYear() === lastMonth.getFullYear()
      }
      if (activeFilter === 'custom') {
        if (!customRange.start || !customRange.end) return true
        const start = new Date(customRange.start + 'T00:00:00')
        const end = new Date(customRange.end + 'T23:59:59')
        return tradeDate >= start && tradeDate <= end
      }
      return true
    })
  }, [trades, activeFilter, customRange])

  // Custom Balance Logic
  const [initialBalance, setInitialBalance] = useState(() => {
    return parseFloat(localStorage.getItem('mkt_sim_initial_balance')) || 100000
  })
  const [isEditingBalance, setIsEditingBalance] = useState(false)
  const [tempBalance, setTempBalance] = useState(initialBalance)

  function saveBalance() {
    const val = parseFloat(tempBalance)
    if (!isNaN(val)) {
      setInitialBalance(val)
      localStorage.setItem('mkt_sim_initial_balance', val)
    }
    setIsEditingBalance(false)
  }

  // Calendar Pagination Logic
  const [calendarAnchorDate, setCalendarAnchorDate] = useState(new Date())

  const stats = useMemo(() => {
    const closed = filteredTrades.filter(t => t.exit)
    const totalPnl = closed.reduce((acc, t) => acc + calcPnl(t).usd, 0)

    const wins = closed.filter(t => getTradeResult(t) === 'Win')
    const losses = closed.filter(t => getTradeResult(t) === 'Loss')
    const beTrades = closed.filter(t => getTradeResult(t) === 'BE')

    const winRate = winRateMode === 'withBE'
      ? (closed.length ? (wins.length / closed.length * 100) : 0)
      : (wins.length + losses.length ? (wins.length / (wins.length + losses.length) * 100) : 0)

    const grossProfit = wins.reduce((acc, t) => acc + calcPnl(t).usd, 0)
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + calcPnl(t).usd, 0))

    const totalTradesForExpectancy = winRateMode === 'withBE' ? closed.length : (wins.length + losses.length)
    const expectancy = totalTradesForExpectancy ? parseFloat((totalPnl / totalTradesForExpectancy).toFixed(2)) : 0
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? 'MAX' : '0.00'

    const avgWinSize = wins.length ? grossProfit / wins.length : 0
    const avgLossSize = losses.length ? grossLoss / losses.length : 0
    
    // Average RR is sum of RR of wins / number of wins
    const rrWins = closed.filter(t => getTradeResult(t) === 'Win' && calcRR(t) > 0)
    const avgSetupRR = rrWins.length ? rrWins.reduce((acc, t) => acc + calcRR(t), 0) / rrWins.length : 0

    const rewardToRisk = avgLossSize > 0 ? avgWinSize / avgLossSize : 0

    // Consectuve Streak Logic & Equity Curve
    let maxWins = 0, currentWins = 0
    let maxLoss = 0, currentLoss = 0
    let lastResult = null

    const sortedTrades = [...closed].sort((a, b) => new Date(`${a.date}T${a.exitTime || '12:00:00'}`) - new Date(`${b.date}T${b.exitTime || '12:00:00'}`))

    let cumulative = initialBalance
    const equityData = []

    sortedTrades.forEach((t, i) => {
      const pnl = calcPnl(t).usd
      cumulative += pnl
      equityData.push({
        name: `Trade ${i + 1}`,
        date: t.date,
        pnl: pnl,
        equity: parseFloat(cumulative.toFixed(2))
      })

      if (pnl >= 0) {
        if (lastResult !== 'win') currentWins = 0
        currentWins++
        if (currentWins > maxWins) maxWins = currentWins
        currentLoss = 0
        lastResult = 'win'
      } else {
        if (lastResult !== 'loss') currentLoss = 0
        currentLoss++
        if (currentLoss > maxLoss) maxLoss = currentLoss
        currentWins = 0
        lastResult = 'loss'
      }
    })

    const currentMonth = calendarAnchorDate.getMonth()
    const currentYear = calendarAnchorDate.getFullYear()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
      const day = String(i + 1).padStart(2, '0')
      const month = String(currentMonth + 1).padStart(2, '0')
      const dateStr = `${currentYear}-${month}-${day}`

      const dayTrades = closed.filter(t => t.date === dateStr)
      const net = dayTrades.reduce((acc, t) => acc + calcPnl(t).usd, 0)
      const dWins = dayTrades.filter(t => calcPnl(t).usd >= 0).length
      const dWR = dayTrades.length ? (dWins / dayTrades.length) * 100 : 0
      const dRR = dayTrades.reduce((a, t) => a + calcRR(t), 0)

      return {
        date: dateStr,
        dayNumber: i + 1,
        net: net,
        tradesCount: dayTrades.length,
        winRate: dWR,
        rrCollected: dRR
      }
    })

    const weeklySummary = [0, 1, 2, 3, 4, 5].map(weekIndex => {
      const startDay = weekIndex * 7 + 1
      const endDay = Math.min((weekIndex + 1) * 7, daysInMonth)
      if (startDay > daysInMonth) return null

      const weekDays = calendarDays.filter(d => d.dayNumber >= startDay && d.dayNumber <= endDay)
      const weekNet = weekDays.reduce((acc, d) => acc + d.net, 0)
      const weekActiveDays = weekDays.filter(d => d.tradesCount > 0).length

      return {
        label: `Week ${weekIndex + 1}`,
        net: parseFloat(weekNet.toFixed(2)),
        days: weekActiveDays
      }
    }).filter(Boolean)

    const biggestWin = wins.length ? Math.max(...wins.map(t => calcPnl(t).usd)) : 0
    const minPnl = closed.length ? Math.min(...closed.map(t => calcPnl(t).usd)) : 0
    const biggestLoss = Math.abs(minPnl < 0 ? minPnl : 0)

    let sWin = winRate
    let sPF = Math.min((parseFloat(profitFactor) / 3) * 100, 100) || 0
    let sRR = Math.min((avgSetupRR / 3) * 100, 100) || 0
    let sVol = Math.min((closed.length / 50) * 100, 100) || 0
    let sDiscipline = losses.length > 0 ? Math.max(100 - (maxLoss / 10) * 100, 0) : 50

    const radarData = [
      { subject: 'Win %', A: sWin },
      { subject: 'Prof. Factor', A: sPF },
      { subject: 'Execution', A: sVol },
      { subject: 'Discipline', A: sDiscipline },
      { subject: 'Av. Setup RR', A: sRR }
    ]

    const overallScore = Math.round((sWin + sPF + sRR + sVol + sDiscipline) / 5) || 0

    const totalDurationMins = closed.reduce((acc, t) => {
      if (!t.entryTime || !t.exitTime) return acc;
      const [eh, em] = t.entryTime.split(':').map(Number);
      const [xh, xm] = t.exitTime.split(':').map(Number);
      let diff = (xh * 60 + xm) - (eh * 60 + em);
      if (diff < 0) diff += 24 * 60;
      return acc + diff;
    }, 0);
    const avgDurationMins = closed.length ? Math.round(totalDurationMins / closed.length) : 0;
    const avgDurationStr = `${Math.floor(avgDurationMins / 60)}h ${avgDurationMins % 60}m`;

    const totalLotSize = closed.reduce((acc, t) => acc + (parseFloat(t.lots) || 0), 0);
    const avgLotSize = closed.length ? parseFloat((totalLotSize / closed.length).toFixed(2)) : 0;

    const totalCommissions = closed.reduce((acc, t) => acc + (Number(t.commissions) || 0), 0);

    return {
      closed, wins, losses,
      totalPnl, profitFactor, winRate, expectancy,
      currentWins, currentLoss, maxWins,
      calendarDays, weeklySummary,
      equityData, radarData, overallScore,
      avgWinSize, avgLossSize, biggestWin, biggestLoss,
      grossProfit, grossLoss, avgDurationStr, avgLotSize, totalCommissions
    }
  }, [filteredTrades, initialBalance, calendarAnchorDate, winRateMode])

  const winRateArcs = stats.closed.length > 0 ? [
    { name: 'Wins', value: stats.wins.length, color: 'var(--accent-green)' },
    { name: 'Losses', value: stats.losses.length, color: 'var(--accent-red)' }
  ] : [
    { name: 'No Data', value: 1, color: '#f1f5f9' }
  ]
  const currentMonthName = calendarAnchorDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const dayTradesList = stats.closed.filter(t => selectedDate ? t.date === selectedDate : true)

  const dayOfWeekOffset = new Date(calendarAnchorDate.getFullYear(), calendarAnchorDate.getMonth(), 1).getDay()

  const handlePrevMonth = () => setCalendarAnchorDate(new Date(calendarAnchorDate.getFullYear(), calendarAnchorDate.getMonth() - 1, 1))
  const handleNextMonth = () => setCalendarAnchorDate(new Date(calendarAnchorDate.getFullYear(), calendarAnchorDate.getMonth() + 1, 1))

  return (
    <div style={{ paddingBottom: '60px', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ marginBottom: '-8px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', margin: 0, lineHeight: 1.2 }}>
          {tod}, <span style={{ color: 'var(--text-primary)' }}>{firstName}</span> 👋
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.6 }}>
          {stats.closed.length} closed trades
          &nbsp;·&nbsp;
          {stats.wins.length}W / {stats.losses.length}L
          &nbsp;·&nbsp;
          <span style={{ color: stats.totalPnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
            {stats.totalPnl > 0 ? '+' : stats.totalPnl < 0 ? '-' : ''}${Math.abs(stats.totalPnl).toFixed(2)} net P&L
          </span>
        </p>
      </div>

      {/* ── TOP 5 METRICS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px' }}>

        {/* Account Balance */}
        <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border)', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.2s ease', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 30px rgba(0,0,0,0.07)' }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>Account Balance</div>
          {isEditingBalance ? (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>$</span>
              <input
                type="number" value={tempBalance}
                onChange={e => setTempBalance(e.target.value)}
                onBlur={saveBalance}
                onKeyDown={e => e.key === 'Enter' && saveBalance()}
                autoFocus
                style={{ fontSize: '18px', fontWeight: 700, border: '2px solid var(--accent-blue)', borderRadius: '8px', padding: '2px 8px', width: '100px', outline: 'none', color: 'var(--text-primary)', background: 'var(--bg-base)' }}
              />
            </div>
          ) : (
            <div onClick={() => { setTempBalance(initialBalance); setIsEditingBalance(true); }} style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                ${(initialBalance + stats.totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </div>
          )}
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '5px' }}>click to edit initial</div>
        </div>

        {/* Net P&L */}
        <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Net P&L</div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>all time</div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: stats.totalPnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', lineHeight: 1 }}>
            {stats.totalPnl > 0 ? '+' : stats.totalPnl < 0 ? '-' : ''}${Math.abs(stats.totalPnl).toFixed(2)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '5px' }}>{stats.closed.length} closed trades</div>
        </div>

        {/* Total Commissions */}
        <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Commissions</div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>paid</div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-red)', lineHeight: 1 }}>
            -${(stats.totalCommissions || 0).toFixed(2)}
          </div>
        </div>

        <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Win Rate</div>
            <div style={{ display: 'flex', background: 'var(--bg-base)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <button 
                onClick={() => { localStorage.setItem('journal_wr_mode', 'withBE'); window.dispatchEvent(new Event('storage')); }}
                style={{ padding: '2px 6px', fontSize: '9px', fontWeight: 800, borderRadius: '6px', border: 'none', cursor: 'pointer', background: winRateMode === 'withBE' ? 'var(--accent-blue)' : 'transparent', color: winRateMode === 'withBE' ? 'white' : 'var(--text-dim)', transition: 'all 0.2s' }}
              >+BE</button>
              <button 
                onClick={() => { localStorage.setItem('journal_wr_mode', 'withoutBE'); window.dispatchEvent(new Event('storage')); }}
                style={{ padding: '2px 6px', fontSize: '9px', fontWeight: 800, borderRadius: '6px', border: 'none', cursor: 'pointer', background: winRateMode === 'withoutBE' ? 'var(--accent-blue)' : 'transparent', color: winRateMode === 'withoutBE' ? 'white' : 'var(--text-dim)', transition: 'all 0.2s' }}
              >-BE</button>
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            {stats.winRate.toFixed(1)}%
          </div>
          <div style={{ marginTop: '8px', height: '4px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', overflow: 'hidden' }}>
            <div style={{ width: `${stats.winRate}%`, height: '100%', background: 'var(--accent-green)', borderRadius: '10px', transition: 'width 0.6s ease' }} />
          </div>
        </div>

        {/* Expectancy */}
        <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border)', padding: '16px 20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>Expectancy</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            ${stats.expectancy}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '5px' }}>per trade avg</div>
        </div>

        {/* Profit Factor */}
        <div style={{ position: 'relative' }}>
          {/* Filtering Dropdown Overlay */}
          <div style={{ position: 'absolute', top: '-42px', right: '0', zIndex: 60, display: 'flex', gap: '8px', alignItems: 'center', width: 'max-content' }}>
            {activeFilter !== 'all' && (
              <button
                onClick={() => { setActiveFilter('all'); setCustomRange({ start: '', end: '' }); }}
                style={{ background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.15)', borderRadius: '10px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, color: 'var(--accent-red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
              >
                ✕ Clear
              </button>
            )}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                style={{ background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '10px', padding: '6px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                {activeFilter === 'all' ? 'Filter Trades' : activeFilter.replace('_', ' ').toUpperCase()}
              </button>

              {isFilterOpen && (
                <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '8px', width: '220px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 100, padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {[
                    { id: 'all', label: 'All Trades' },
                    { id: 'this_week', label: 'This Week' },
                    { id: 'last_week', label: 'Previous Week' },
                    { id: 'this_month', label: 'This Month' },
                    { id: 'last_month', label: 'Previous Month' },
                    { id: 'custom', label: 'Custom Range...' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => { setActiveFilter(opt.id); if (opt.id !== 'custom') setIsFilterOpen(false); }}
                      style={{ padding: '9px 12px', textAlign: 'left', background: activeFilter === opt.id ? 'rgba(59,130,246,0.1)' : 'transparent', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: activeFilter === opt.id ? 'var(--accent-blue)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={e => { if (activeFilter !== opt.id) e.currentTarget.style.background = 'var(--bg-base)' }}
                      onMouseLeave={e => { if (activeFilter !== opt.id) e.currentTarget.style.background = 'transparent' }}
                    >
                      {opt.label}
                    </button>
                  ))}
                  
                  {activeFilter === 'custom' && (
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '6px', paddingTop: '10px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Start Date</label>
                        <CustomDatePicker 
                          value={customRange.start} 
                          onChange={val => setCustomRange(p => ({ ...p, start: val }))} 
                          placeholder="dd-mm-yyyy"
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>End Date</label>
                        <CustomDatePicker 
                          value={customRange.end} 
                          onChange={val => setCustomRange(p => ({ ...p, end: val }))} 
                          placeholder="dd-mm-yyyy"
                        />
                      </div>
                      <button onClick={() => setIsFilterOpen(false)} style={{ background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', marginTop: '4px' }}>Apply Filter</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border)', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 30px rgba(0,0,0,0.07)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>Profit Factor</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {stats.profitFactor}
              </div>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: stats.profitFactor > 1.5 ? 'rgba(16,185,129,0.15)' : stats.profitFactor > 0.8 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', border: `2px solid ${stats.profitFactor > 1.5 ? 'var(--accent-green)' : stats.profitFactor > 0.8 ? 'var(--accent-yellow)' : 'var(--accent-red)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stats.profitFactor > 1.5 ? 'var(--accent-green)' : stats.profitFactor > 0.8 ? 'var(--accent-yellow)' : 'var(--accent-red)' }} />
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '5px' }}>{stats.profitFactor > 1.5 ? 'Excellent' : stats.profitFactor > 0.8 ? 'Average' : 'Below avg'}</div>
          </div>
        </div>

      </div>

      {/* ── SECTION LABEL ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Equity Curve</div>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* ── EQUITY CURVE ROW ── */}
      <Card style={{ paddingBottom: '12px' }}>
        <CardHeader title="Equity Curve" />
        <div style={{ height: '240px', width: '100%', marginTop: '4px' }}>
          {stats.equityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.equityData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-base)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-dim)', fontFamily: 'var(--font-sans)' }} hide />
                <YAxis
                  domain={['auto', 'auto']}
                  axisLine={false} tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--text-dim)', fontWeight: 600, fontFamily: 'var(--font-sans)' }}
                  tickFormatter={(val) => `$${val.toLocaleString()}`}
                  width={70}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isProfit = data.pnl >= 0;
                      return (
                        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', fontFamily: 'var(--font-sans)' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>{data.date}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Trade P&L</span>
                              <span style={{ fontSize: '12px', fontWeight: 800, color: isProfit ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                {isProfit ? '+' : ''}${Math.abs(data.pnl).toFixed(2)}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', paddingTop: '4px', borderTop: '1px solid var(--border)' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>New Balance</span>
                              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>${data.equity.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="equity" stroke="var(--accent-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorEquity)" dot={{ r: 3, fill: '#fff', strokeWidth: 2, stroke: 'var(--accent-blue)' }} activeDot={{ r: 5, fill: '#fff', stroke: 'var(--accent-blue)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600 }}>
              No trades to plot exactly yet.
            </div>
          )}
        </div>
      </Card>

      {/* ── SECTION LABEL ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Performance Breakdown</div>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* ── METRICS & TRADER SCORE ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 440px', gap: '20px' }}>
        
        {/* Left Side: 6 Widgets in 2 rows of 3 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Profit vs Loss Summary */}
          <Card>
            <CardHeader title="Profit vs Loss Summary" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '4px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Gross Profit</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>+${stats.grossProfit.toFixed(2)}</div>
                <div style={{ marginTop: '8px', height: '5px', borderRadius: '99px', background: 'rgba(16,185,129,0.15)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((stats.grossProfit / (stats.grossProfit + stats.grossLoss || 1)) * 100, 100)}%`, height: '100%', background: 'var(--accent-green)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>{((stats.grossProfit / (stats.grossProfit + stats.grossLoss || 1)) * 100).toFixed(1)}% of total volume</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Gross Loss</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>-${stats.grossLoss.toFixed(2)}</div>
                <div style={{ marginTop: '8px', height: '5px', borderRadius: '99px', background: 'rgba(239,68,68,0.15)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((stats.grossLoss / (stats.grossProfit + stats.grossLoss || 1)) * 100, 100)}%`, height: '100%', background: 'var(--accent-red)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>{((stats.grossLoss / (stats.grossProfit + stats.grossLoss || 1)) * 100).toFixed(1)}% of total volume</div>
              </div>
            </div>
          </Card>

          {/* Win / Loss Analysis 2x2 Grid */}
          <Card>
            <CardHeader title="Win / Loss Analysis" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
              
              {/* Biggest Win */}
              <div style={{ background: 'rgba(16,185,129,0.04)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(16,185,129,0.12)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Biggest Win</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                  +${stats.biggestWin.toFixed(2)}
                </div>
              </div>

              {/* Biggest Loss */}
              <div style={{ background: 'rgba(239,68,68,0.04)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(239,68,68,0.12)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Biggest Loss</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                  -${stats.biggestLoss.toFixed(2)}
                </div>
              </div>

              {/* Avg Win */}
              <div style={{ background: 'var(--bg-base)', borderRadius: '12px', padding: '12px 14px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Avg Win</span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-green)', letterSpacing: '-0.3px' }}>
                  +${stats.avgWinSize.toFixed(2)}
                </div>
              </div>

              {/* Avg Loss */}
              <div style={{ background: 'var(--bg-base)', borderRadius: '12px', padding: '12px 14px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Avg Loss</span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-red)', letterSpacing: '-0.3px' }}>
                  -${stats.avgLossSize.toFixed(2)}
                </div>
              </div>

            </div>
          </Card>

          {/* Trade Mechanics */}
          <Card>
            <CardHeader title="Trade Mechanics" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Avg Duration</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.avgDurationStr}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>per trade avg</div>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Avg Lot Size</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.avgLotSize}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>lots per trade</div>
              </div>
            </div>
          </Card>

        </div>

        {/* Right Side: Trader Score */}
        <Card style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '260px', background: 'linear-gradient(135deg, var(--bg-panel) 0%, rgba(59,130,246,0.03) 100%)', borderTop: '3px solid var(--accent-blue)', position: 'relative' }}>
          <button 
            onClick={() => setShowScoreInfo(true)}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'var(--bg-base)', border: '1px solid var(--border)',
              width: '24px', height: '24px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.2s', zIndex: 20
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-blue)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-base)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            !
          </button>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', zIndex: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <CardHeader title="Trader Score" />
              </div>
              <div style={{ fontSize: '42px', fontWeight: 800, color: stats.overallScore >= 70 ? 'var(--accent-green)' : stats.overallScore >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)', letterSpacing: '-2px', lineHeight: 1, marginTop: '-8px' }}>
                {stats.overallScore}
                <span style={{ fontSize: '16px', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: 0 }}> / 100</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px', fontWeight: 600 }}>
                {stats.overallScore >= 70 ? '🏆 Top performer' : stats.overallScore >= 50 ? '📈 Developing' : '⚠️ Needs work'}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative', marginTop: '-10px', marginBottom: '-10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats.radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-dim)', fontSize: 11, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Trader" dataKey="A" stroke="var(--accent-blue)" fill="var(--accent-blue)" fillOpacity={0.2} strokeWidth={2} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 6px 16px rgba(0,0,0,0.08)', fontSize: '11px', fontWeight: 600, padding: '4px 8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── SECTION LABEL ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Monthly Calendar</div>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* ── CALENDAR ROW (FULL WIDTH) ── */}
      <Card noPadding style={{ overflow: 'hidden', borderTop: '3px solid var(--accent-blue)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <button onClick={handlePrevMonth} style={{ padding: '6px 10px', background: 'transparent', border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button onClick={handleNextMonth} style={{ padding: '6px 10px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
            <h2 style={{ margin: '0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{currentMonthName}</h2>
            {calendarAnchorDate.getMonth() !== new Date().getMonth() && (
              <button onClick={() => setCalendarAnchorDate(new Date())} style={{ marginLeft: '6px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                Today
              </button>
            )}
          </div>
          {selectedDate ? (
            <button onClick={() => { setSelectedDate(null); if(tradesListRef.current) tradesListRef.current.scrollIntoView({ behavior: 'smooth' }); }} style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', color: 'var(--text-secondary)' }}>
              Clear Selection
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(16,185,129,0.3)' }} /> Win</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(239,68,68,0.3)' }} /> Loss</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1, padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', background: 'var(--bg-card)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', paddingBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{d}</div>
            ))}
            {Array.from({ length: dayOfWeekOffset }).map((_, i) => (
              <div key={`empty-${i}`} style={{ minHeight: '90px' }} />
            ))}
            {stats.calendarDays.map((day) => {
              const hasTrades = day.tradesCount > 0
              const isWin = day.net > 1.00
              const isLoss = day.net < -0.01
              const isBE = hasTrades && !isWin && !isLoss
              const isSelected = selectedDate === day.date

              let bgColor = 'var(--bg-base)'
              let brdColor = 'var(--border)'
              let pnlColor = 'var(--text-dim)'

              if (isSelected) {
                bgColor = isWin ? 'rgba(16,185,129,0.15)' : isLoss ? 'rgba(239,68,68,0.15)' : 'rgba(107,114,128,0.15)'
                brdColor = isWin ? 'var(--accent-green)' : isLoss ? 'var(--accent-red)' : 'var(--text-secondary)'
              } else if (hasTrades) {
                bgColor = isWin ? 'rgba(16,185,129,0.06)' : isLoss ? 'rgba(239,68,68,0.06)' : 'rgba(107,114,128,0.06)'
                brdColor = isWin ? 'rgba(16,185,129,0.2)' : isLoss ? 'rgba(239,68,68,0.2)' : 'rgba(107,114,128,0.2)'
              }

              if (isWin) pnlColor = 'var(--accent-green)'
              else if (isLoss) pnlColor = 'var(--accent-red)'
              else if (isBE) pnlColor = 'var(--text-secondary)'

              const txtColorDay = hasTrades ? 'var(--text-primary)' : 'var(--text-dim)'

              return (
                <div
                  key={day.date}
                  onClick={() => {
                    if (hasTrades) {
                      setSelectedDate(day.date);
                      if (tradesListRef.current) {
                        setTimeout(() => {
                           tradesListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 50);
                      }
                    }
                  }}
                  style={{
                    minHeight: '90px', borderRadius: '12px', padding: '10px',
                    background: bgColor, border: `1px solid ${brdColor}`,
                    cursor: hasTrades ? 'pointer' : 'default',
                    display: 'flex', flexDirection: 'column', transition: 'all 0.2s',
                    boxShadow: isSelected ? `0 0 0 3px ${isWin ? 'rgba(16,185,129,0.15)' : isLoss ? 'rgba(239,68,68,0.15)' : 'rgba(107,114,128,0.15)'}` : 'none',
                    position: 'relative'
                  }}
                  onMouseEnter={e => { if (hasTrades && !isSelected) e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { if (hasTrades && !isSelected) e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: txtColorDay }}>
                      {day.dayNumber}
                    </div>
                    {hasTrades && (
                      <div style={{ marginTop: '4px', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: pnlColor, letterSpacing: '-0.5px' }}>
                          {day.net > 0 ? '+' : day.net < 0 ? '-' : ''}${Math.abs(day.net).toFixed(0)}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                          {day.tradesCount} trade{day.tradesCount > 1 ? 's' : ''}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          <div style={{ width: '180px', borderLeft: '1px solid var(--border)', background: 'linear-gradient(180deg, var(--bg-panel) 0%, var(--bg-base) 100%)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '20px' }}>
              Weekly Net
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {stats.weeklySummary.map(w => {
                const isWin = w.net > 1.00
                const isLoss = w.net < -0.01
                return (
                  <div key={w.label} style={{ 
                    padding: '12px 14px', borderRadius: '10px', 
                    background: isWin ? 'rgba(16,185,129,0.06)' : isLoss ? 'rgba(239,68,68,0.06)' : 'rgba(107,114,128,0.06)', 
                    border: `1px solid ${isWin ? 'rgba(16,185,129,0.15)' : isLoss ? 'rgba(239,68,68,0.15)' : 'rgba(107,114,128,0.15)'}` 
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{w.label}</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: isWin ? 'var(--accent-green)' : isLoss ? 'var(--accent-red)' : 'var(--text-secondary)', letterSpacing: '-0.5px' }}>
                      {w.net > 0 ? '+' : w.net < 0 ? '-' : ''}${Math.abs(w.net).toFixed(0)}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px', fontWeight: 600 }}>
                      {w.days} day{w.days !== 1 ? 's' : ''} active
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* ── SECTION LABEL ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Trade History</div>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* ── ALL CLOSED TRADES ROW ── */}
      <div ref={tradesListRef} style={{ scrollMarginTop: '80px' }}>
        <Card style={{ borderTop: '3px solid var(--accent-blue)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
                {selectedDate ? `Trades on ${selectedDate}` : 'All Closed Trades'}
              </h3>
              {selectedDate && (
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>Click a different day or clear to see all trades</div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Badge variant="neutral">{dayTradesList.length} trades</Badge>
              {selectedDate && (
                <button onClick={() => { setSelectedDate(null); }} style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px', padding: '5px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}>✕ Clear</button>
              )}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-base)', borderRadius: '10px' }}>
                  <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '10px 0 0 10px' }}>Date</th>
                  <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Asset</th>
                  <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                  <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Result</th>
                  <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Comms</th>
                  <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>RR</th>
                  <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', borderRadius: '0 10px 10px 0' }}>P&L</th>
                </tr>
              </thead>
              <tbody>
                {dayTradesList.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600 }}>No trades to display for this criteria.</td></tr>
                ) : dayTradesList.map((t, idx) => {
                  const pnlVal = calcPnl(t)?.usd || 0
                  const isEven = idx % 2 === 0
                  return (
                    <tr key={idx}
                      style={{ background: isEven ? 'transparent' : 'rgba(255,255,255,0.015)', borderBottom: '1px solid var(--border)', transition: 'background 0.15s', cursor: 'pointer' }}
                      onClick={() => onTradeClick && onTradeClick(t)}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = isEven ? 'transparent' : 'rgba(255,255,255,0.015)'}
                    >
                      <td style={{ padding: '13px 16px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.date}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', background: 'var(--bg-base)', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}>{t.pair}</span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <Badge variant={t.dir === 'long' ? 'green' : 'red'}>{t.dir.toUpperCase()}</Badge>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <Badge variant={getTradeResult(t) === 'Win' ? 'green' : getTradeResult(t) === 'Loss' ? 'red' : 'neutral'}>
                          {getTradeResult(t)}
                        </Badge>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: '12px', color: 'var(--accent-red)', fontWeight: 700 }}>
                        {t.commissions ? '-$'+Number(t.commissions).toFixed(2) : '--'}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>{calcRR(t)}R</td>
                      <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: pnlVal >= 1 ? 'var(--accent-green)' : pnlVal < 0 ? 'var(--accent-red)' : 'var(--text-secondary)', letterSpacing: '-0.3px', background: pnlVal >= 1 ? 'rgba(16,185,129,0.08)' : pnlVal < 0 ? 'rgba(239,68,68,0.08)' : 'rgba(107,114,128,0.08)', padding: '3px 10px', borderRadius: '6px' }}>
                          {pnlVal > 0 ? '+' : pnlVal < 0 ? '-' : ''}${Math.abs(pnlVal).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ── TRADER SCORE INFO MODAL ── */}
      {showScoreInfo && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setShowScoreInfo(false)}>
          <Card style={{ 
            maxWidth: '450px', width: '100%', padding: '32px', 
            position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            border: '1px solid rgba(59,130,246,0.3)',
            background: 'var(--bg-panel)'
          }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowScoreInfo(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'none', border: 'none', color: 'var(--text-dim)',
                fontSize: '18px', cursor: 'pointer', padding: '4px'
              }}
            >✕</button>

            <div style={{ fontSize: '28px', marginBottom: '16px' }}>🎯</div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.5px' }}>
              What is the Trader Score?
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
              The Trader Score is a simple 0-100 rating that looks at your overall performance. It doesn't just look at how much you win, but <strong>how</strong> you win.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--bg-base)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>How it's calculated</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  We average 5 key parts: <strong>Win Rate</strong>, <strong>Profit Factor</strong>, <strong>Execution Consistency (Volume)</strong>, <strong>Risk Discipline</strong>, and <strong>Risk-to-Reward Ratio</strong>.
                </p>
              </div>

              <div style={{ background: 'var(--bg-base)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Example</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                  "If you win 5 out of 10 trades, but your wins are twice as big as your losses and you trade consistently every week, you'll likely have a score above 85."
                </p>
              </div>
            </div>

            <button 
              onClick={() => setShowScoreInfo(false)}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                background: 'var(--accent-blue)', color: 'white',
                border: 'none', fontWeight: 700, fontSize: '14px',
                cursor: 'pointer', transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Got it!
            </button>
          </Card>
        </div>
      )}
    </div>
  )
}
