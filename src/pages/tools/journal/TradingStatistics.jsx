import { useState, useRef, useEffect } from 'react'
import { useTradingStatistics } from './hooks/statistics/useTradingStatistics'
import TopMetricsRow from './components/statistics/TopMetricsRow'
import StatVisuals from './components/statistics/StatVisuals'
import StatCalendarAndHistory from './components/statistics/StatCalendarAndHistory'
import TraderScoreModal from './components/statistics/TraderScoreModal'

export default function TradingStatistics({ trades, tod, firstName, onTradeClick }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [showScoreInfo, setShowScoreInfo] = useState(false)
  const tradesListRef = useRef(null)

  const [activeFilter, setActiveFilter] = useState('all')
  const [customRange, setCustomRange] = useState({ start: '', end: '' })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [winRateMode, setWinRateMode] = useState(localStorage.getItem('journal_wr_mode') || 'withBE')

  useEffect(() => {
    const handleStorage = () => setWinRateMode(localStorage.getItem('journal_wr_mode') || 'withBE')
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const [initialBalance, setInitialBalance] = useState(() => {
    if (sessionStorage.getItem('guest_mode') === 'true') return 10000;
    return parseFloat(localStorage.getItem('mkt_sim_initial_balance')) || 10000
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

  const [calendarAnchorDate, setCalendarAnchorDate] = useState(new Date())

  const { stats, dayOfWeekOffset } = useTradingStatistics({
    trades,
    activeFilter,
    customRange,
    calendarAnchorDate,
    winRateMode,
    initialBalance
  })

  const currentMonthName = calendarAnchorDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const dayTradesList = stats.closed.filter(t => selectedDate ? t.date === selectedDate : true)

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

      <TopMetricsRow 
        stats={stats}
        initialBalance={initialBalance}
        isEditingBalance={isEditingBalance}
        tempBalance={tempBalance}
        setTempBalance={setTempBalance}
        saveBalance={saveBalance}
        setIsEditingBalance={setIsEditingBalance}
        winRateMode={winRateMode}
        activeFilter={activeFilter}
        customRange={customRange}
        setIsFilterOpen={setIsFilterOpen}
        isFilterOpen={isFilterOpen}
        setActiveFilter={setActiveFilter}
        setCustomRange={setCustomRange}
      />

      <StatVisuals 
        stats={stats} 
        setShowScoreInfo={setShowScoreInfo} 
      />

      <StatCalendarAndHistory
        stats={stats}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        tradesListRef={tradesListRef}
        handlePrevMonth={handlePrevMonth}
        handleNextMonth={handleNextMonth}
        currentMonthName={currentMonthName}
        dayOfWeekOffset={dayOfWeekOffset}
        dayTradesList={dayTradesList}
        onTradeClick={onTradeClick}
        calendarAnchorDate={calendarAnchorDate}
      />

      <TraderScoreModal
        showScoreInfo={showScoreInfo}
        setShowScoreInfo={setShowScoreInfo}
      />
    </div>
  )
}
