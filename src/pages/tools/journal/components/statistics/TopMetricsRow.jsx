import { CustomDatePicker } from './StatUIComponents'

export default function TopMetricsRow({
  stats,
  initialBalance,
  isEditingBalance,
  tempBalance,
  setTempBalance,
  saveBalance,
  setIsEditingBalance,
  winRateMode,
  activeFilter,
  customRange,
  setIsFilterOpen,
  isFilterOpen,
  setActiveFilter,
  setCustomRange,
  isPropFirm
}) {
  return (
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
          <div onClick={isPropFirm ? undefined : () => { setTempBalance(initialBalance); setIsEditingBalance(true); }} style={{ display: 'flex', alignItems: 'baseline', gap: '6px', cursor: isPropFirm ? 'default' : 'pointer' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              ${(initialBalance + stats.totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            {!isPropFirm && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            )}
          </div>
        )}
        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '5px' }}>
          {isPropFirm ? '🔒 prop firm balance' : 'click to edit initial'}
        </div>
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
  )
}
