import { Card, Badge } from './StatUIComponents'
import { calcPnl, calcRR, getTradeResult } from '../../../../../utils/tradeMetrics'

export default function StatCalendarAndHistory({
  stats, selectedDate, setSelectedDate, tradesListRef,
  handlePrevMonth, handleNextMonth, currentMonthName, dayOfWeekOffset,
  dayTradesList, onTradeClick, calendarAnchorDate
}) {
  return (
    <>
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
    </>
  )
}
