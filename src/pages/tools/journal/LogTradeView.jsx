import { useState, useEffect, useRef } from 'react'
import { SESSIONS } from '../../../utils/tradeMetrics'

// ── Helper ────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().split('T')[0]
}

const ASSETS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
  'EURGBP', 'EURJPY', 'EURAUD', 'EURCAD', 'EURCHF', 'EURNZD',
  'GBPJPY', 'GBPAUD', 'GBPCAD', 'GBPCHF', 'GBPNZD',
  'AUDJPY', 'AUDCAD', 'AUDCHF', 'AUDNZD',
  'CADJPY', 'CADCHF',
  'NZDJPY', 'NZDCAD', 'NZDCHF',
  'CHFJPY',
  'XAUUSD', 'XAGUSD', 'WTI', 'BRENT', 'NATGAS',
  'US30', 'SPX500', 'NAS100', 'US2000',
  'BTCUSD', 'ETHUSD', 'SOLUSD', 'XRPUSD', 'ADAUSD'
]

const TV_SYMBOL_MAP = {
  'XAUUSD': 'TVC:GOLD', 'XAGUSD': 'TVC:SILVER', 'WTI': 'TVC:USOIL', 'BRENT': 'TVC:UKOIL',
  'NATGAS': 'TVC:NATURALGAS', 'US30': 'TVC:DJI', 'SPX500': 'OANDA:SPX500USD',
  'NAS100': 'OANDA:NAS100USD', 'US2000': 'TVC:RUT', 'BTCUSD': 'BITSTAMP:BTCUSD',
  'ETHUSD': 'BITSTAMP:ETHUSD', 'SOLUSD': 'COINBASE:SOLUSD', 'XRPUSD': 'BITSTAMP:XRPUSD',
  'ADAUSD': 'COINBASE:ADAUSD',
}

function getTVSymbol(pair) {
  if (TV_SYMBOL_MAP[pair]) return TV_SYMBOL_MAP[pair]
  if (pair && pair.length === 6) return `FX:${pair}`
  return pair || 'FX:EURUSD'
}

const inputStyle = {
  background: 'var(--bg-base)',
  border: '1.5px solid var(--border)',
  borderRadius: '10px',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-sans)',
  fontSize: '13px',
  padding: '8px 12px',
  outline: 'none',
  width: '100%',
  transition: 'border .15s',
  boxSizing: 'border-box',
}

// ── Sub-components ────────────────────────────────────────────
function FGroup({ label, children, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', ...style }}>
      <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function StyledInput({ ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <input {...props} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ ...inputStyle, background: 'var(--bg-panel)', borderColor: focused ? 'var(--accent-blue)' : 'var(--border)', boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none' }}
    />
  )
}

function QuickInput({ value, onChange, placeholder, label }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
      <label style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      <input
        type="number" step="0.00001"
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${focused ? 'rgba(59,130,246,0.7)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: '10px', color: 'white', fontFamily: 'var(--font-sans)', fontSize: '13px',
          padding: '8px 12px', outline: 'none', width: '100%', transition: 'border .15s',
          boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.2)' : 'none',
        }}
      />
    </div>
  )
}

function CustomSelect({ value, onChange, options, placeholder = '— Select —', dark = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const clickOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false) }
    document.addEventListener('mousedown', clickOut)
    return () => document.removeEventListener('mousedown', clickOut)
  }, [])
  const selectedOpt = options.find(o => o.value === value)
  const baseStyle = dark
    ? { background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${isOpen ? 'rgba(59,130,246,0.7)' : 'rgba(255,255,255,0.12)'}`, color: 'white' }
    : { background: 'var(--bg-panel)', border: `1.5px solid ${isOpen ? 'var(--accent-blue)' : 'var(--border)'}`, color: 'var(--text-primary)', boxShadow: isOpen ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none' }
  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ ...inputStyle, ...baseStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: selectedOpt ? (dark ? 'white' : 'var(--text-primary)') : (dark ? 'rgba(255,255,255,0.4)' : 'var(--text-dim)'), fontWeight: selectedOpt ? 600 : 400, fontSize: '13px' }}>
          {selectedOpt ? selectedOpt.label : placeholder}
        </span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.6, flexShrink: 0 }}><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      {isOpen && (
        <div className="no-scrollbar" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', marginTop: '6px', zIndex: 2000, padding: '4px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', maxHeight: '200px', overflowY: 'auto' }}>
          {options.map(opt => (
            <div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false) }}
              style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: value === opt.value ? 700 : 500, color: value === opt.value ? 'var(--accent-blue)' : 'var(--text-primary)', background: value === opt.value ? 'rgba(59,130,246,0.08)' : 'transparent', transition: 'all 0.1s' }}
              onMouseEnter={e => { if (value !== opt.value) e.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseLeave={e => { if (value !== opt.value) e.currentTarget.style.background = 'transparent' }}
            >{opt.label}</div>
          ))}
        </div>
      )}
    </div>
  )
}

function AssetAutocomplete({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value || '')
  const filtered = ASSETS.filter(a => a.toLowerCase().includes(query.toLowerCase()))
  return (
    <div style={{ position: 'relative' }}>
      <input placeholder="e.g. XAUUSD" value={query}
        onChange={e => { const val = e.target.value.toUpperCase(); setQuery(val); setOpen(true); onChange(val) }}
        onFocus={() => setOpen(true)}
        style={{ ...inputStyle, background: 'var(--bg-panel)' }}
      />
      {open && filtered.length > 0 && (
        <div className="no-scrollbar" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', marginTop: '6px', zIndex: 2000, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', maxHeight: '180px', overflowY: 'auto', padding: '4px' }}>
          {filtered.map(a => (
            <div key={a} onMouseDown={() => { onChange(a); setQuery(a); setOpen(false) }}
              style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', transition: 'all 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >{a}</div>
          ))}
        </div>
      )}
    </div>
  )
}

function CustomDatePicker({ value, onChange }) {
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
    onChange(`${viewDate.getFullYear()}-${month}-${day}`)
    setIsOpen(false)
  }
  const changeMonth = (offset) => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1))
  const displayDate = value ? (() => { const [y, m, d] = value.split('-'); return `${d}-${m}-${y}` })() : 'Select Date'
  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ ...inputStyle, background: 'var(--bg-panel)', borderColor: isOpen ? 'var(--accent-blue)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: isOpen ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none' }}>
        <span style={{ fontSize: '13px', color: value ? 'var(--text-primary)' : 'var(--text-dim)', fontWeight: value ? 600 : 400 }}>{displayDate}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '6px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 2000, width: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <button onClick={() => changeMonth(-1)} style={{ background: 'var(--bg-base)', border: 'none', borderRadius: '8px', padding: '3px 7px', cursor: 'pointer', color: 'var(--text-primary)' }}>❮</button>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
            <button onClick={() => changeMonth(1)} style={{ background: 'var(--bg-base)', border: 'none', borderRadius: '8px', padding: '3px 7px', cursor: 'pointer', color: 'var(--text-primary)' }}>❯</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', textAlign: 'center' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>{d}</div>)}
            {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => {
              const d = i + 1; const month = String(viewDate.getMonth() + 1).padStart(2, '0'); const dayStr = String(d).padStart(2, '0')
              const isSelected = value === `${viewDate.getFullYear()}-${month}-${dayStr}`
              return <div key={d} onClick={() => handleDaySelect(d)} style={{ padding: '7px 0', fontSize: '11px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', background: isSelected ? 'var(--accent-blue)' : 'transparent', color: isSelected ? '#fff' : 'var(--text-primary)', transition: 'all 0.1s' }} onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)' }} onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}>{d}</div>
            })}
          </div>
          <button onClick={() => { onChange(today()); setIsOpen(false) }} style={{ width: '100%', marginTop: '12px', border: '1px solid var(--border)', background: 'var(--bg-base)', padding: '5px', borderRadius: '7px', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer' }}>Today</button>
        </div>
      )}
    </div>
  )
}

function CustomTimePicker({ value, onChange, placeholder = '--:--' }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const clickOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false) }
    document.addEventListener('mousedown', clickOut)
    return () => document.removeEventListener('mousedown', clickOut)
  }, [])
  const currentH = value ? value.split(':')[0] : '12'
  const currentM = value ? value.split(':')[1] : '00'
  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ ...inputStyle, background: 'var(--bg-panel)', borderColor: isOpen ? 'var(--accent-blue)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: isOpen ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none' }}>
        <span style={{ fontSize: '13px', color: value ? 'var(--text-primary)' : 'var(--text-dim)', fontWeight: value ? 600 : 400 }}>{value || placeholder}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '6px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '14px', display: 'flex', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 2000, width: '160px' }}>
          <div className="no-scrollbar" style={{ flex: 1, maxHeight: '180px', overflowY: 'auto', padding: '4px', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-dim)', textAlign: 'center', marginBottom: '4px', textTransform: 'uppercase' }}>HH</div>
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} onClick={() => onChange(`${String(i).padStart(2, '0')}:${currentM}`)}
                style={{ padding: '7px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', textAlign: 'center', cursor: 'pointer', background: currentH === String(i).padStart(2, '0') ? 'var(--accent-blue)' : 'transparent', color: currentH === String(i).padStart(2, '0') ? '#fff' : 'var(--text-primary)' }}
                onMouseEnter={e => { if (currentH !== String(i).padStart(2, '0')) e.currentTarget.style.background = 'var(--bg-hover)' }}
                onMouseLeave={e => { if (currentH !== String(i).padStart(2, '0')) e.currentTarget.style.background = 'transparent' }}
              >{String(i).padStart(2, '0')}</div>
            ))}
          </div>
          <div className="no-scrollbar" style={{ flex: 1, maxHeight: '180px', overflowY: 'auto', padding: '4px' }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-dim)', textAlign: 'center', marginBottom: '4px', textTransform: 'uppercase' }}>MM</div>
            {Array.from({ length: 12 }).map((_, i) => {
              const val = i * 5
              return <div key={i} onClick={() => onChange(`${currentH}:${String(val).padStart(2, '0')}`)}
                style={{ padding: '7px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', textAlign: 'center', cursor: 'pointer', background: currentM === String(val).padStart(2, '0') ? 'var(--accent-blue)' : 'transparent', color: currentM === String(val).padStart(2, '0') ? '#fff' : 'var(--text-primary)' }}
                onMouseEnter={e => { if (currentM !== String(val).padStart(2, '0')) e.currentTarget.style.background = 'var(--bg-hover)' }}
                onMouseLeave={e => { if (currentM !== String(val).padStart(2, '0')) e.currentTarget.style.background = 'transparent' }}
              >{String(val).padStart(2, '0')}</div>
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── TradingView Advanced Chart (exported for reuse) ───────────
export function TradingViewAdvancedChart({ pair, theme }) {
  const symbol = getTVSymbol(pair || 'EURUSD')
  const tvTheme = theme === 'dark' ? 'dark' : 'light'
  const src = `https://www.tradingview.com/widgetembed/?` + new URLSearchParams({
    frameElementId: 'tradingview_chart',
    symbol,
    interval: 'H1',
    theme: tvTheme === 'dark' ? 'Dark' : 'Light',
    style: '1',
    locale: 'en',
    toolbar_bg: tvTheme === 'dark' ? '#1a1a2e' : '#f4f4f4',
    enable_publishing: '0',
    allow_symbol_change: '1',
    save_image: '1',
    hide_top_toolbar: '0',
    hide_side_toolbar: '0',
    withdateranges: '1',
    hideideas: '1',
    studies: '[]',
    show_popup_button: '0',
  }).toString()
  return (
    <iframe key={symbol + tvTheme} src={src} title="TradingView Advanced Chart"
      frameBorder="0" allow="fullscreen" loading="lazy"
      style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
    />
  )
}

// ── Position Quick-Fill Bar ───────────────────────────────────
function PositionQuickFill({ onApply }) {
  const [expanded, setExpanded] = useState(false)
  const [qDir, setQDir] = useState('long')
  const [qEntry, setQEntry] = useState('')
  const [qSl, setQSl] = useState('')
  const [qTp, setQTp] = useState('')
  const [applied, setApplied] = useState(false)

  function handleApply() {
    if (!qEntry && !qSl && !qTp) return
    onApply({ dir: qDir, entry: qEntry, sl: qSl, tp: qTp })
    setApplied(true)
    setTimeout(() => setApplied(false), 2000)
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(20,30,55,0.97) 100%)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: expanded ? '16px 20px' : '12px 20px',
      transition: 'all 0.25s ease',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: applied ? '#10B981' : '#3B82F6', boxShadow: `0 0 8px ${applied ? '#10B981' : '#3B82F6'}`, transition: 'all 0.3s' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.3px' }}>
            ⚡ Auto-Fill from Position Tool
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
            — Place a Long/Short tool on the chart, then enter its levels here
          </span>
        </div>
        <button onClick={() => setExpanded(e => !e)} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '4px 12px', cursor: 'pointer',
          color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 600,
          transition: 'all 0.2s',
        }}>
          {expanded ? '▲ Collapse' : '▼ Expand'}
        </button>
      </div>

      {/* Expanded fill area */}
      {expanded && (
        <div style={{ marginTop: '14px' }}>
          {/* Direction toggle */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <button onClick={() => setQDir('long')} style={{
              flex: 1, padding: '9px', borderRadius: '10px', fontFamily: 'var(--font-sans)',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', border: 'none',
              background: qDir === 'long' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
              color: qDir === 'long' ? '#10B981' : 'rgba(255,255,255,0.4)',
              boxShadow: qDir === 'long' ? 'inset 0 0 0 1.5px #10B981' : 'inset 0 0 0 1px rgba(255,255,255,0.1)',
            }}>
              📈 Long (Buy)
            </button>
            <button onClick={() => setQDir('short')} style={{
              flex: 1, padding: '9px', borderRadius: '10px', fontFamily: 'var(--font-sans)',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', border: 'none',
              background: qDir === 'short' ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.06)',
              color: qDir === 'short' ? '#EF4444' : 'rgba(255,255,255,0.4)',
              boxShadow: qDir === 'short' ? 'inset 0 0 0 1.5px #EF4444' : 'inset 0 0 0 1px rgba(255,255,255,0.1)',
            }}>
              📉 Short (Sell)
            </button>
          </div>

          {/* Price level inputs + apply */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <QuickInput label="Entry Price" value={qEntry} onChange={setQEntry} placeholder="e.g. 1.08520" />
            <QuickInput label="Stop Loss" value={qSl} onChange={setQSl} placeholder="e.g. 1.08200" />
            <QuickInput label="Take Profit" value={qTp} onChange={setQTp} placeholder="e.g. 1.09200" />

            <button onClick={handleApply} style={{
              flexShrink: 0, background: applied ? 'rgba(16,185,129,0.9)' : 'rgba(59,130,246,0.9)',
              border: 'none', borderRadius: '10px', padding: '9px 20px',
              color: 'white', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 800,
              cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
              marginBottom: '0px',
            }}>
              {applied ? '✓ Applied!' : '→ Apply to Form'}
            </button>
          </div>

          <div style={{ marginTop: '10px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
            💡 <strong style={{ color: 'rgba(255,255,255,0.5)' }}>How to use:</strong> Place a <em>Long Position</em> or <em>Short Position</em> tool on the chart above. Read the Entry, SL, and TP prices from the tool's labels, type them above, then click <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Apply to Form</strong> — all fields below will be filled instantly.
          </div>

          {/* Chart snapshot capture */}
          <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', flex: 1 }}>
              📷 <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Save chart drawing:</strong> Click the Camera icon (top-right of chart) → Download Image → attach below
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function LogTradeView({ form, setForm, onSubmit, onCancel, editingTradeId }) {
  const theme = document.documentElement.getAttribute('data-theme') || 'light'
  const pair = form.pair || 'EURUSD'

  function setF(field, val) {
    setForm(f => ({ ...f, [field]: val }))
  }

  function handlePositionApply({ dir, entry, sl, tp }) {
    setForm(f => ({
      ...f,
      dir: dir || f.dir,
      entry: entry || f.entry,
      sl: sl || f.sl,
      tp: tp || f.tp,
    }))
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans)', paddingBottom: '40px' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        <div>
          <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0, marginBottom: '8px' }}>
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
            {editingTradeId ? '✎ Edit Trade' : '+ Log New Trade'}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '3px', marginBottom: 0 }}>
            Draw your setup on the chart · use Auto-Fill to populate levels · save the trade
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={onCancel} style={{ background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onSubmit}
            style={{ background: 'var(--accent-blue)', border: 'none', borderRadius: '12px', padding: '9px 26px', fontSize: '13px', fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,0.3)', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {editingTradeId ? '✓ Update Trade' : '✓ Save Trade'}
          </button>
        </div>
      </div>

      {/* ── CHART SECTION (TOP, FULL WIDTH) ── */}
      <div style={{
        background: '#0d1117',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        {/* Chart Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'white', whiteSpace: 'nowrap' }}>
              Interactive Chart
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '2px 10px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.08)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              TradingView
            </span>
          </div>

          {/* Quick Pair Selector - Moved here for better UX */}
          <div style={{ flex: 1, maxWidth: '240px' }}>
            <AssetAutocomplete value={form.pair} onChange={val => setF('pair', val)} />
          </div>

          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span>💡</span> Log into TV for <strong style={{ color: 'rgba(255,255,255,0.55)' }}>saved drawings</strong>
          </div>
        </div>

        {/* Chart iframe */}
        <div style={{ width: '100%', height: '560px' }}>
          <TradingViewAdvancedChart pair={pair} theme={theme} />
        </div>

        {/* ── POSITION AUTO-FILL BAR ── */}
        <PositionQuickFill onApply={handlePositionApply} />
      </div>

      {/* ── FORM FIELDS (BOTTOM) ── */}
      <div style={{ background: 'var(--bg-panel)', borderRadius: '20px', border: '1px solid var(--border)', padding: '28px', marginBottom: '24px' }}>

        {/* Section 1: Trade Identity */}
        <div style={{ marginBottom: '22px' }}>
          <SectionLabel color="var(--accent-blue)" label="Trade Identity" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <FGroup label="Direction">
              <CustomSelect value={form.dir} onChange={val => setF('dir', val)} options={[{ value: 'long', label: '📈 Long' }, { value: 'short', label: '📉 Short' }]} />
            </FGroup>
            <FGroup label="Session">
              <CustomSelect value={form.session} onChange={val => setF('session', val)} placeholder="Session" options={SESSIONS.map(s => ({ value: s.key, label: s.label }))} />
            </FGroup>
            <FGroup label="Emotion">
              <CustomSelect value={form.emotion} onChange={val => setF('emotion', val)} placeholder="Emotion" options={[
                { value: 'calm', label: '😌 Calm' }, { value: 'confident', label: '💪 Confident' },
                { value: 'fomo', label: '😰 FOMO' }, { value: 'fearful', label: '😨 Fearful' },
                { value: 'greedy', label: '🤑 Greedy' }, { value: 'patient', label: '🧘 Patient' },
                { value: 'disciplined', label: '✅ Disciplined' },
              ]} />
            </FGroup>
          </div>
        </div>

        <Divider />

        {/* Section 2: Price Levels */}
        <div style={{ marginBottom: '22px' }}>
          <SectionLabel color="var(--accent-green)" label="Price Levels" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            <FGroup label="Entry *">
              <StyledInput type="number" step="0.00001" value={form.entry} onChange={e => setF('entry', e.target.value)} placeholder="1.08520" />
            </FGroup>
            <FGroup label="Exit (blank if open)">
              <StyledInput type="number" step="0.00001" value={form.exit} onChange={e => setF('exit', e.target.value)} placeholder="—" />
            </FGroup>
            <FGroup label="Stop Loss *">
              <StyledInput type="number" step="0.00001" value={form.sl} onChange={e => setF('sl', e.target.value)} placeholder="1.08200" />
            </FGroup>
            <FGroup label="Take Profit *">
              <StyledInput type="number" step="0.00001" value={form.tp} onChange={e => setF('tp', e.target.value)} placeholder="1.09200" />
            </FGroup>
          </div>
        </div>

        <Divider />

        {/* Section 3: Trade Timing */}
        <div style={{ marginBottom: '22px' }}>
          <SectionLabel color="var(--accent-yellow)" label="Trade Timing" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            <FGroup label="Entry Date">
              <CustomDatePicker value={form.date} onChange={val => setF('date', val)} />
            </FGroup>
            <FGroup label="Entry Time">
              <CustomTimePicker value={form.entryTime} onChange={val => setF('entryTime', val)} />
            </FGroup>
            <FGroup label="Exit Date">
              <CustomDatePicker value={form.exit_date} onChange={val => setF('exit_date', val)} />
            </FGroup>
            <FGroup label="Exit Time">
              <CustomTimePicker value={form.exitTime} onChange={val => setF('exitTime', val)} />
            </FGroup>
          </div>
        </div>

        <Divider />

        {/* Section 4: Position Size */}
        <div style={{ marginBottom: '22px' }}>
          <SectionLabel color="var(--accent-purple)" label="Position Size" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <FGroup label="Lot Size">
              <StyledInput type="number" step="0.01" value={form.lots} onChange={e => setF('lots', e.target.value)} />
            </FGroup>
            <FGroup label="Pip Value ($)">
              <StyledInput type="number" step="0.01" value={form.pipval} onChange={e => setF('pipval', e.target.value)} />
            </FGroup>
            <FGroup label="Commissions ($)">
              <StyledInput type="number" step="0.01" value={form.commissions} onChange={e => setF('commissions', e.target.value)} placeholder="0.00" />
            </FGroup>
          </div>
        </div>

        <Divider />

        {/* Section 4: Notes & Screenshots */}
        <div>
          <SectionLabel color="var(--accent-red)" label="Notes & Screenshots" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
            <FGroup label="Trade Notes">
              <textarea
                style={{ ...inputStyle, background: 'var(--bg-panel)', fontFamily: 'var(--font-sans)', resize: 'vertical', minHeight: '72px' }}
                value={form.notes}
                onChange={e => setF('notes', e.target.value)}
                placeholder="Setup, confluences, reasoning, lessons learned..."
              />
            </FGroup>
            <FGroup label="Chart Screenshots (Max 4)">
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(form.images || []).map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '10px', border: '1.5px solid var(--border)', overflow: 'hidden' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => { const n = [...(form.images || [])]; n.splice(idx, 1); setF('images', n) }}
                      style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.65)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                ))}
                {(form.images || []).length < 4 && (
                  <label style={{ width: '60px', height: '60px', borderRadius: '10px', border: '1.5px dashed var(--text-dim)', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '3px', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-base)'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <span style={{ fontSize: '8px', fontWeight: 700, color: 'var(--text-secondary)' }}>Upload</span>
                    <input type="file" accept="image/*" multiple onChange={(e) => {
                      const files = Array.from(e.target.files)
                      if ((form.images || []).length + files.length > 4) { alert('Max 4 images'); return }
                      files.forEach(file => {
                        const reader = new FileReader()
                        reader.onloadend = () => setForm(prev => ({ ...prev, images: [...(prev.images || []), reader.result] }))
                        reader.readAsDataURL(file)
                      })
                    }} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </FGroup>
          </div>
        </div>
      </div>

      {/* ── BOTTOM SAVE BAR ── */}
      <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button onClick={onCancel} style={{ background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={onSubmit}
          style={{ background: 'var(--accent-blue)', border: 'none', borderRadius: '12px', padding: '10px 32px', fontSize: '14px', fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,0.3)', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {editingTradeId ? '✓ Update Trade' : '✓ Save Trade'}
        </button>
      </div>
    </div>
  )
}

// ── Small helpers ─────────────────────────────────────────────
function SectionLabel({ color, label }) {
  return (
    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ width: '16px', height: '2px', background: color, borderRadius: '1px', display: 'inline-block', flexShrink: 0 }} />
      {label}
    </div>
  )
}

function Divider() {
  return <div style={{ height: '1px', background: 'var(--border)', marginBottom: '22px' }} />
}
