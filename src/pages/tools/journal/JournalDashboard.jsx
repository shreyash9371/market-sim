import { useState, useEffect, useRef, useMemo } from 'react'
import confetti from 'canvas-confetti'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/useAuthStore'
import { supabase } from '../../../utils/supabase'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  calcPnl,
  calcRR,
  getTradeResult,
  calcDuration,
  SESSIONS,
  DAYS,
  DOW,
} from '../../../utils/tradeMetrics'
import TradingStatistics from './TradingStatistics'
import TradeDetailsView from './TradeDetailsView'
import LogTradeView from './LogTradeView'
import { getGuestTrades } from '../../../utils/guestData'
import { startTourManually } from '../../../components/ProductTourManager'
// ── HELPERS ───────────────────────────────────────────────────
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

const emptyForm = {
  pair: '', dir: 'long', date: '', session: '',
  entry: '', exit: '', sl: '', tp: '',
  lots: '0.10', pipval: '1.00', commissions: '', entryTime: '', exitTime: '', exit_date: '', emotion: '', notes: '', images: [],
}

const MOTIVATIONAL_NOTES = [
  "Discipline is the bridge between goals and accomplishment. Great execution!",
  "The market is a device for transferring money from the impatient to the patient.",
  "Focus on the process, not the outcome. You're building an elite mindset.",
  "Every trade is a lesson. Whether win or loss, your discipline is your true edge.",
  "Success in trading is not about being right, but about being disciplined.",
  "Trust your edge. The statistics will take care of the rest.",
  "Professional traders trade for the process, amateurs trade for the money.",
  "A losing trade with good discipline is a better outcome than a winning trade with bad habits."
]

function triggerCelebration() {
  console.info("🎉 Triggering profitable trade celebration!");
  const duration = 2000; // 2 seconds
  const end = Date.now() + duration;
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  (function frame() {
    // Flower configuration: Launching from sides and top
    // Increased particleCount for better visibility
    confetti({
      particleCount: 15,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: colors,
      zIndex: 1000000
    });
    confetti({
      particleCount: 15,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: colors,
      zIndex: 1000000
    });
    confetti({
      particleCount: 15,
      angle: 270,
      spread: 90,
      origin: { x: 0.5, y: -0.1 },
      colors: colors,
      zIndex: 1000000
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}



// ── SMALL REUSABLE PIECES ─────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--bg-panel)',
      borderRadius: '20px',
      border: '1px solid var(--border)',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function CardLabel({ children }) {
  return (
    <div style={{
      fontSize: '11px', fontWeight: 700,
      color: 'var(--text-dim)', textTransform: 'uppercase',
      letterSpacing: '0.7px', marginBottom: '18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {children}
    </div>
  )
}

function StatPill({ label, value, sub, color, children }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      padding: '16px 20px',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          {label}
        </div>
        {children}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 700, color, fontFamily: 'var(--font-sans)', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '5px', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{sub}</div>}
    </div>
  )
}

function Btn({ children, onClick, primary, danger, style = {}, id }) {
  const base = {
    fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600,
    padding: '8px 18px', borderRadius: '12px', cursor: 'pointer',
    border: 'none', transition: 'all .15s',
    display: 'inline-flex', alignItems: 'center', gap: '6px',
  }
  const variant = primary
    ? { background: 'var(--accent-blue)', color: '#fff' }
    : danger
      ? { background: 'rgba(239,68,68,0.08)', color: 'var(--accent-red)', border: '1.5px solid rgba(239,68,68,0.2)' }
      : { background: 'var(--bg-base)', color: 'var(--text-secondary)', border: '1.5px solid var(--border)' }
  return <button id={id} onClick={onClick} style={{ ...base, ...variant, ...style }}>{children}</button>
}

function FGroup({ label, children, full }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...(full ? { gridColumn: '1/-1' } : {}) }}>
      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </label>
      {children}
    </div>
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

function SidebarItem({ label, active, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{
        padding: '12px 16px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: active ? 600 : 500,
        color: active ? 'var(--accent-blue)' : hover ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: active ? 'rgba(59,130,246,0.1)' : hover ? 'var(--bg-base)' : 'transparent',
        transition: 'all 0.2s ease',
      }}
    >
      {label}
    </div>
  )
}

function CustomSelect({ label, value, onChange, options, placeholder = "— Select —" }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const clickOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false) }
    document.addEventListener('mousedown', clickOut)
    return () => document.removeEventListener('mousedown', clickOut)
  }, [])

  const selectedOpt = options.find(o => o.value === value)

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...inputStyle,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-panel)',
          borderColor: isOpen ? 'var(--accent-blue)' : 'var(--border)',
          boxShadow: isOpen ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none',
        }}
      >
        <span style={{ color: selectedOpt ? 'var(--text-primary)' : 'var(--text-dim)', fontWeight: selectedOpt ? 600 : 500 }}>
          {selectedOpt ? selectedOpt.label : placeholder}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-dim)' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'var(--bg-panel)', border: '1px solid var(--border)',
          borderRadius: '14px', marginTop: '8px', zIndex: 1000,
          padding: '6px', boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
          maxHeight: '240px', overflowY: 'auto'
        }} className="no-scrollbar">
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              style={{
                padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                fontSize: '13px', fontWeight: value === opt.value ? 700 : 500,
                color: value === opt.value ? 'var(--accent-blue)' : 'var(--text-primary)',
                background: value === opt.value ? 'rgba(59,130,246,0.08)' : 'transparent',
                transition: 'all 0.1s', display: 'flex', alignItems: 'center', gap: '10px'
              }}
              onMouseEnter={e => { if (value !== opt.value) e.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseLeave={e => { if (value !== opt.value) e.currentTarget.style.background = 'transparent' }}
            >
              {opt.icon && <span style={{ fontSize: '16px' }}>{opt.icon}</span>}
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StyledInput({ icon, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle,
          background: 'var(--bg-panel)',
          paddingRight: icon ? '40px' : '13px',
          borderColor: focused ? 'var(--accent-blue)' : 'var(--border)',
          boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none',
        }}
      />
      {icon && (
        <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none', display: 'flex' }}>
          {icon}
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
      <StyledInput
        placeholder="e.g. XAUUSD"
        value={query}
        onChange={e => {
          const val = e.target.value.toUpperCase();
          setQuery(val);
          setOpen(true);
          onChange(val);
        }}
        onFocus={() => setOpen(true)}
        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'var(--bg-panel)', border: '1px solid var(--border)',
          borderRadius: '14px', marginTop: '8px', zIndex: 1000,
          boxShadow: '0 10px 25px rgba(0,0,0,0.12)', maxHeight: '200px', overflowY: 'auto',
          padding: '6px'
        }} className="no-scrollbar">
          {filtered.map(a => (
            <div
              key={a}
              onMouseDown={() => {
                onChange(a)
                setQuery(a)
                setOpen(false)
              }}
              style={{
                padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
                transition: 'all 0.1s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {a}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CustomDatePicker({ value, onChange, placeholder = "Select Date", alignRight = false }) {
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
      <div onClick={() => setIsOpen(!isOpen)} style={{ ...inputStyle, background: 'var(--bg-panel)', borderColor: isOpen ? 'var(--accent-blue)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
        <span style={{ fontSize: '13px', color: value ? 'var(--text-primary)' : 'var(--text-dim)', fontWeight: value ? 600 : 500 }}>{displayDate}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', ...(alignRight ? { right: 0 } : { left: 0 }), marginTop: '8px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-md)', zIndex: 1000, width: '280px' }}>
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
          <button onClick={() => { onChange(today()); setIsOpen(false); }} style={{ width: '100%', marginTop: '16px', border: '1px solid var(--border)', background: 'var(--bg-base)', padding: '6px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer' }}>Go to Today</button>
        </div>
      )}
    </div>
  )
}

function CustomTimePicker({ value, onChange, placeholder = "--:--" }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const clickOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false) }
    document.addEventListener('mousedown', clickOut)
    return () => document.removeEventListener('mousedown', clickOut)
  }, [])

  const currentH = value ? value.split(':')[0] : '12'
  const currentM = value ? value.split(':')[1] : '00'

  const selectH = (h) => {
    const newH = String(h).padStart(2, '0')
    onChange(`${newH}:${currentM}`)
  }

  const selectM = (m) => {
    const newM = String(m).padStart(2, '0')
    onChange(`${currentH}:${newM}`)
  }

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ ...inputStyle, background: 'var(--bg-panel)', borderColor: isOpen ? 'var(--accent-blue)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
        <span style={{ fontSize: '13px', color: value ? 'var(--text-primary)' : 'var(--text-dim)', fontWeight: value ? 600 : 500 }}>{value || placeholder}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', overflow: 'hidden', boxShadow: 'var(--shadow-md)', zIndex: 1000, width: '180px' }}>
          <div className="no-scrollbar" style={{ flex: 1, maxHeight: '200px', overflowY: 'auto', padding: '6px', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', textAlign: 'center', marginBottom: '4px', textTransform: 'uppercase' }}>HH</div>
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} onClick={() => selectH(i)} style={{ padding: '8px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', textAlign: 'center', cursor: 'pointer', background: currentH === String(i).padStart(2, '0') ? 'var(--accent-blue)' : 'transparent', color: currentH === String(i).padStart(2, '0') ? '#fff' : 'var(--text-primary)' }} onMouseEnter={e => { if (currentH !== String(i).padStart(2, '0')) e.currentTarget.style.background = 'var(--bg-hover)' }} onMouseLeave={e => { if (currentH !== String(i).padStart(2, '0')) e.currentTarget.style.background = 'transparent' }}>
                {String(i).padStart(2, '0')}
              </div>
            ))}
          </div>
          <div className="no-scrollbar" style={{ flex: 1, maxHeight: '200px', overflowY: 'auto', padding: '6px' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', textAlign: 'center', marginBottom: '4px', textTransform: 'uppercase' }}>MM</div>
            {Array.from({ length: 12 }).map((_, i) => {
              const val = i * 5
              return (
              <div key={i} onClick={() => selectM(val)} style={{ padding: '8px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', textAlign: 'center', cursor: 'pointer', background: currentM === String(val).padStart(2, '0') ? 'var(--accent-blue)' : 'transparent', color: currentM === String(val).padStart(2, '0') ? '#fff' : 'var(--text-primary)' }} onMouseEnter={e => { if (currentM !== String(val).padStart(2, '0')) e.currentTarget.style.background = 'var(--bg-hover)' }} onMouseLeave={e => { if (currentM !== String(val).padStart(2, '0')) e.currentTarget.style.background = 'transparent' }}>
                {String(val).padStart(2, '0')}
              </div>
            )})}
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
export default function JournalDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const navigate = useNavigate()
  const auth = useAuthStore()
  const _meta = auth.user?.user_metadata || {}
  const firstName = _meta.first_name || _meta.given_name || _meta.full_name?.split(' ')[0] || _meta.name?.split(' ')[0] || 'Trader'

  // Theme Logic
  const [theme, setTheme] = useState(() => localStorage.getItem('mkt_sim_theme') || 'light')
  const [selectedTradeDetail, setSelectedTradeDetail] = useState(null)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('mkt_sim_theme', theme)
  }, [theme])

  const [trades, setTrades] = useState([])
  const [tradesLoading, setTradesLoading] = useState(true)

  useEffect(() => {
    if (!auth.user) {
      setTradesLoading(false)
      return
    }

    if (auth.isGuest) {
      setTrades(getGuestTrades())
      setTradesLoading(false)
      return
    }

    async function fetchTrades() {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: true })

      if (!error && data) {
        setTrades(data)
      }
      setTradesLoading(false)
    }

    fetchTrades()
  }, [auth.user, auth.isGuest])

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ ...emptyForm, date: today() })
  const [propMode, setPropMode] = useState(false)
  const [tradeToDelete, setTradeToDelete] = useState(null)
  const [skipDeleteConfirm, setSkipDeleteConfirm] = useState(false)
  const [editingTradeId, setEditingTradeId] = useState(null)

  // AI Chat State
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI trading assistant. Ask me anything about your trade journal, patterns, or setups." }
  ])
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  // Gallery & Lightbox Context
  const [galleryDateFilter, setGalleryDateFilter] = useState('All')
  const [galleryResultFilter, setGalleryResultFilter] = useState('All')
  const [winRateMode, setWinRateMode] = useState(localStorage.getItem('journal_wr_mode') || 'withBE')

  // Dashboard Visualizations Additions
  const [dashboardFilter, setDashboardFilter] = useState('All') 
  const [dashboardSpecificDate, setDashboardSpecificDate] = useState(today())
  const [dashboardCustomStart, setDashboardCustomStart] = useState('')
  const [dashboardCustomEnd, setDashboardCustomEnd] = useState('')

  useEffect(() => {
    localStorage.setItem('journal_wr_mode', winRateMode)
  }, [winRateMode])
  const [viewingContext, setViewingContext] = useState(null) // { trades: [], tradeIdx: 0, imgIdx: 0 }
  
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successQuote, setSuccessQuote] = useState('')
  const [lastLoggedTrade, setLastLoggedTrade] = useState(null)

  useEffect(() => {
    if (activeTab === 'Strategy Enhancement') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, isChatLoading, activeTab])

  async function handleSendChat() {
    if (!chatInput.trim()) return
    const userMsg = { role: 'user', content: chatInput }
    setChatMessages(prev => [...prev, userMsg])
    const currentInput = chatInput
    setChatInput('')
    setIsChatLoading(true)

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY
      if (!apiKey) {
        throw new Error('Please add a free VITE_GROQ_API_KEY to your .env file. Get one free at console.groq.com')
      }

      const systemPrompt = `You are a smart, concise trading journal analyst. You are currently speaking with ${firstName}. You MUST address them by their name in your responses. You have access to the full trade history, including all details and attached images.

STRICT RULES:
- Be brief. No long paragraphs.
- For queries about SESSIONS, PAIRS, DAYS, or anything involving win rates / breakdowns: respond ONLY with a JSON block in this exact format and nothing else:
:::SESSION_BARS
{"title": "...", "summary": "...", "bars": [{"label": "New York", "wins": 1, "losses": 2, "total": 3, "wr": 33.3}]}
:::
- For queries about specific trades (e.g., '>3RR', 'biggest loss'): use a clean markdown table. Columns: Date | Pair | Dir | Entry | Exit | P&L ($) | RR
- Use the pre-calculated 'pnl_usd' and 'rr' values from the trade data. Do NOT recalculate them.
- NEVER show internal UUIDs or 'id' fields.
- If no trades match, say so in one sentence (or put it in the JSON 'summary').

Trade data (pre-calculated values are already correct, do NOT recalculate them yourself):
${JSON.stringify(trades.map(t => {
  const pnl = calcPnl(t)
  const rr = calcRR(t)
  return {
    date: t.date, pair: t.pair, dir: t.dir, session: t.session,
    entry: t.entry, exit: t.exit ?? 'open', sl: t.sl, tp: t.tp,
    lots: t.lots, pipval: t.pipval, commissions: t.commissions,
    pnl_usd: pnl ? pnl.usd : 'open',
    rr: parseFloat(rr.toFixed(2)),
    emotion: t.emotion, notes: t.notes, strategy: t.strategy, images: t.images || [],
  }
}), null, 2)}`

      const geminiMessages = chatMessages.map(m => ({
        role: m.role,
        content: m.content
      }))
      geminiMessages.push({ role: 'user', content: userMsg.content })

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            ...geminiMessages
          ],
          temperature: 0.7
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error?.message || 'Groq API Error')
      }

      const aiText = data.choices[0].message.content
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiText }])
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${err.message}` }])
    } finally {
      setIsChatLoading(false)
    }
  }

  function setF(field, val) {
    setForm(f => ({ ...f, [field]: val }))
  }

  function openModal(trade = null) {
    if (trade) {
      setForm({
        pair: trade.pair,
        dir: trade.dir,
        date: trade.date,
        session: trade.session || '',
        entryTime: trade.entryTime || '',
        exitTime: trade.exitTime || '',
        exit_date: trade.exit_date || '',
        entry: trade.entry.toString(),
        exit: trade.exit ? trade.exit.toString() : '',
        sl: trade.sl.toString(),
        tp: trade.tp.toString(),
        lots: trade.lots.toString(),
        pipval: trade.pipval.toString(),
        commissions: trade.commissions ? trade.commissions.toString() : '',
        emotion: trade.emotion || '',
        notes: trade.notes || '',
        images: trade.images || [],
      })
      setEditingTradeId(trade.id)
    } else {
      setForm({ ...emptyForm, date: today() })
      setEditingTradeId(null)
    }
    setShowModal(true)
  }

  async function submitTrade() {
    if (!form.pair.trim()) return alert('Enter a pair')
    if (!form.entry) return alert('Entry price required')
    if (!form.sl) return alert('Stop loss required')
    if (!form.tp) return alert('Take profit required')
    if (!auth.user) return alert('Must be logged in to save trades')

    const newTrade = {
      user_id: auth.user.id,
      pair: form.pair.toUpperCase().trim(),
      dir: form.dir, date: form.date, session: form.session,
      entry: parseFloat(form.entry),
      exit: form.exit ? parseFloat(form.exit) : null,
      sl: parseFloat(form.sl), tp: parseFloat(form.tp),
      lots: parseFloat(form.lots) || 0.1,
      pipval: parseFloat(form.pipval) || 1,
      commissions: Number(form.commissions) || 0,
      emotion: form.emotion, notes: form.notes.trim(),
      images: form.images || [],
    }
    newTrade['entryTime'] = form.entryTime || null
    newTrade['exitTime'] = form.exitTime || null
    newTrade['exit_date'] = form.exit_date || null

    let savedData = null

    if (auth.isGuest) {
      savedData = { ...newTrade, id: editingTradeId || `guest-new-${Date.now()}` }
      if (editingTradeId) {
        setTrades(trades.map(t => t.id === editingTradeId ? savedData : t))
      } else {
        setTrades([...trades, savedData])
      }
    } else {
      if (editingTradeId) {
        const { data, error } = await supabase
          .from('trades')
          .update(newTrade)
          .eq('id', editingTradeId)
          .select()
          .single()

        if (error) {
          console.error(error)
          alert('Error updating trade: ' + error.message)
          return
        }

        savedData = data
        setTrades(trades.map(t => t.id === editingTradeId ? data : t))
      } else {
        const { data, error } = await supabase
          .from('trades')
          .insert([newTrade])
          .select()
          .single()

        if (error) {
          console.error(error)
          alert('Error saving trade: ' + error.message)
          return
        }

        savedData = data
        setTrades([...trades, data])
      }
    }

    setShowModal(false)
    setEditingTradeId(null)

    // Trigger Success Experience
    if (savedData) {
      const result = getTradeResult(savedData)
      setLastLoggedTrade(savedData)
      setSuccessQuote(MOTIVATIONAL_NOTES[Math.floor(Math.random() * MOTIVATIONAL_NOTES.length)])
      setShowSuccessModal(true)

      if (result === 'Win') {
        console.info("Matched 'Win' result, triggering celebration...");
        triggerCelebration()
      } else {
        console.info("Trade result was not 'Win' (was: " + result + "), no celebration.");
      }
    }
  }

  function handleDeleteClick(id) {
    if (skipDeleteConfirm) {
      confirmDelete(id)
    } else {
      setTradeToDelete(id)
    }
  }

  async function confirmDelete(id) {
    const updated = trades.filter(t => t.id !== id)
    setTrades(updated)
    setTradeToDelete(null)

    if (auth.isGuest) return

    const { error } = await supabase.from('trades').delete().eq('id', id)
    if (error) {
      console.error(error)
      alert('Failed to delete trade: ' + error.message)
    }
  }

  // ── COMPUTED ────────────────────────────────────────────────
  const closed = trades.filter(t => t.exit)
  const open = trades.filter(t => !t.exit)
  const totalPnl = closed.reduce((s, t) => s + calcPnl(t).usd, 0)
  const totalPips = closed.reduce((s, t) => s + calcPnl(t).pips, 0)
  
  const wins = closed.filter(t => getTradeResult(t) === 'Win')
  const losses = closed.filter(t => getTradeResult(t) === 'Loss')
  const beTrades = closed.filter(t => getTradeResult(t) === 'BE')

  const wr = winRateMode === 'withBE'
    ? (closed.length ? (wins.length / closed.length * 100) : 0)
    : (wins.length + losses.length ? (wins.length / (wins.length + losses.length) * 100) : 0)

  const rrVals = trades.filter(t => t.exit && getTradeResult(t) === 'Win')
                       .map(t => calcRR(t))
                       .filter(val => val > 0)
  const avgRR = rrVals.length ? rrVals.reduce((a, b) => a + b, 0) / rrVals.length : 0

  const byPair = {}
  closed.forEach(t => { byPair[t.pair] = (byPair[t.pair] || 0) + calcPnl(t).usd })
  const bestPair = Object.entries(byPair).sort((a, b) => b[1] - a[1])[0]

  // Day bars
  // Dashboard Visualizations Filter Logic
  const dashboardFilteredTrades = useMemo(() => {
    let list = closed
    if (dashboardFilter === 'All') return list

    const todayDate = new Date()
    todayDate.setHours(0,0,0,0)

    return list.filter(t => {
      const d = new Date(t.date + 'T12:00:00')
      d.setHours(0,0,0,0)
      
      if (dashboardFilter === 'Today') {
        return d.getTime() === todayDate.getTime()
      }
      if (dashboardFilter === 'Yesterday') {
        const yesterday = new Date(todayDate)
        yesterday.setDate(yesterday.getDate() - 1)
        return d.getTime() === yesterday.getTime()
      }
      if (dashboardFilter === 'Specific') {
        if (!dashboardSpecificDate) return true
        const specific = new Date(dashboardSpecificDate + 'T12:00:00')
        specific.setHours(0,0,0,0)
        return d.getTime() === specific.getTime()
      }
      if (dashboardFilter === 'Custom') {
        if (!dashboardCustomStart || !dashboardCustomEnd) return true
        const start = new Date(dashboardCustomStart + 'T00:00:00')
        const end = new Date(dashboardCustomEnd + 'T23:59:59')
        return d >= start && d <= end
      }
      return true
    })
  }, [closed, dashboardFilter, dashboardSpecificDate, dashboardCustomStart, dashboardCustomEnd])

  const dayStats = {
    Mon: { win: 0, loss: 0, net: 0 },
    Tue: { win: 0, loss: 0, net: 0 },
    Wed: { win: 0, loss: 0, net: 0 },
    Thu: { win: 0, loss: 0, net: 0 },
    Fri: { win: 0, loss: 0, net: 0 }
  }
  dashboardFilteredTrades.forEach(t => {
    const d = DOW[new Date(t.date + 'T12:00:00').getDay()]
    if (dayStats[d] !== undefined) {
      const pnl = calcPnl(t).usd
      dayStats[d].net += pnl
      if (pnl > 0) dayStats[d].win += pnl
      else dayStats[d].loss += Math.abs(pnl)
    }
  })
  let maxBarVal = 1
  DAYS.forEach(d => {
    if (dayStats[d].win > maxBarVal) maxBarVal = dayStats[d].win
    if (dayStats[d].loss > maxBarVal) maxBarVal = dayStats[d].loss
  })
  const bestDay = dashboardFilteredTrades.length === 0 ? '-' : DAYS.reduce((a, b) => dayStats[a].net >= dayStats[b].net ? a : b)

  // Bias
  const longs = dashboardFilteredTrades.filter(t => t.dir === 'long').length
  const shorts = dashboardFilteredTrades.filter(t => t.dir === 'short').length
  const total = longs + shorts
  const bullPct = total ? longs / total : 0.5
  const bearPct = total ? shorts / total : 0.5
  let biasWord = 'Neutral', biasColor = 'var(--text-primary)', biasDesc = 'Balanced long & short trades'
  if (bullPct > 0.65) { biasWord = 'Bullish'; biasColor = 'var(--accent-green)'; biasDesc = 'You favour long setups' }
  else if (bullPct > 0.55) { biasWord = 'Slightly Bullish'; biasColor = 'var(--accent-green)'; biasDesc = 'Mild long bias' }
  else if (bullPct < 0.35) { biasWord = 'Bearish'; biasColor = 'var(--accent-red)'; biasDesc = 'You favour short setups' }
  else if (bullPct < 0.45) { biasWord = 'Slightly Bearish'; biasColor = 'var(--accent-red)'; biasDesc = 'Mild short bias' }

  // Asset breakdown
  const assetMap = {}
  dashboardFilteredTrades.forEach(t => {
    if (!assetMap[t.pair]) assetMap[t.pair] = { w: 0, l: 0, pnl: 0 }
    calcPnl(t).usd >= 0 ? assetMap[t.pair].w++ : assetMap[t.pair].l++
    assetMap[t.pair].pnl += calcPnl(t).usd
  })
  const assetRows = Object.entries(assetMap).sort((a, b) => Math.abs(b[1].pnl) - Math.abs(a[1].pnl))

  // Sessions
  const sessionMap = {}
  dashboardFilteredTrades.filter(t => t.session).forEach(t => {
    if (!sessionMap[t.session]) sessionMap[t.session] = { w: 0, l: 0 }
    calcPnl(t).usd >= 0 ? sessionMap[t.session].w++ : sessionMap[t.session].l++
  })

  const hour = new Date().getHours()
  const tod = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // ── GALLERY FILTERING ──────────────────────────────────────
  const galleryTrades = useMemo(() => {
    let list = trades.filter(t => t.images && t.images.length > 0)
    
    // Result Filter
    if (galleryResultFilter !== 'All') {
      list = list.filter(t => {
        const pnl = calcPnl(t)?.usd || 0
        if (galleryResultFilter === 'Win') return pnl > 0
        if (galleryResultFilter === 'Loss') return pnl < 0
        if (galleryResultFilter === 'BE') return pnl === 0
        return true
      })
    }

    // Date Filter (Reuse logic from stats if possible, or simple version here)
    if (galleryDateFilter !== 'All') {
      const today = new Date()
      today.setHours(0,0,0,0)
      
      list = list.filter(t => {
        const d = new Date(t.date + 'T12:00:00')
        d.setHours(0,0,0,0)
        
        if (galleryDateFilter === 'Today') return d.getTime() === today.getTime()
        if (galleryDateFilter === 'This Week') {
          const todayCopy = new Date(today.getTime())
          const diff = todayCopy.getDate() - todayCopy.getDay() + (todayCopy.getDay() === 0 ? -6 : 1)
          const start = new Date(todayCopy.setDate(diff))
          return d >= start
        }
        if (galleryDateFilter === 'This Month') {
          return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear()
        }
        return true
      })
    }

    return list.slice().reverse()
  }, [trades, galleryDateFilter, galleryResultFilter])

  // ── RENDER ──────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-sans)' }}>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      {/* ── NAVBAR (matches Dashboard exactly) ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--bg-panel-alpha)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 40px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Left: back + logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'var(--bg-base)', border: '1.5px solid var(--border)',
              borderRadius: '12px', padding: '7px 14px',
              fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L5 7L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            MktSim
          </span>
          <span style={{
            fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)',
            background: 'var(--bg-base)', border: '1px solid var(--border)',
            padding: '4px 12px', borderRadius: '999px',
          }}>
            Trade Journal
          </span>
        </div>

        {/* Right: prop mode + log trade */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* How It Works Button (Journal) */}
          <button onClick={() => startTourManually('/tools/journal')} style={{
            background: 'none', border: '1.5px solid var(--border)',
            color: 'var(--text-secondary)', padding: '6px 14px', borderRadius: '10px',
            fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
          }}>
            💡 How it works
          </button>
          
          <button
            onClick={() => setPropMode(p => !p)}
            style={{
              fontSize: '12px', fontWeight: 600,
              padding: '7px 16px', borderRadius: '999px', cursor: 'pointer',
              background: propMode ? 'rgba(245,158,11,0.12)' : 'var(--bg-base)',
              border: propMode ? '1.5px solid rgba(245,158,11,0.35)' : '1.5px solid var(--border)',
              color: propMode ? 'var(--accent-yellow)' : 'var(--text-secondary)',
              transition: 'all .2s',
            }}
          >
            ⚡ Prop Firm Mode{propMode ? ': ON' : ''}
          </button>
          <Btn id="tour-new-trade" primary onClick={() => openModal()}>+ Log Trade</Btn>
        </div>
      </nav>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        {/* ── SIDEBAR ── */}
        <aside style={{
          width: '260px',
          background: 'var(--bg-panel)',
          borderRight: '1px solid var(--border)',
          padding: '32px 16px 24px',
          display: 'flex', flexDirection: 'column',
          position: 'fixed', top: '64px', bottom: 0,
          overflowY: 'auto',
          zIndex: 40,
        }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '12px', paddingLeft: '16px' }}>
                Menu
              </div>
              <div id="tour-journal-dashboard">
                <SidebarItem label="Dashboard" active={activeTab === 'Dashboard' && !showModal && !selectedTradeDetail} onClick={() => { setActiveTab('Dashboard'); setSelectedTradeDetail(null); setShowModal(false); }} />
              </div>
              <div id="tour-statistics-tab">
                <SidebarItem label="Trading Statistics" active={activeTab === 'Trading Statistics' && !showModal && !selectedTradeDetail} onClick={() => { setActiveTab('Trading Statistics'); setSelectedTradeDetail(null); setShowModal(false); }} />
              </div>
              <div id="tour-journal-ai">
                <SidebarItem label="Strategy Enhancement" active={activeTab === 'Strategy Enhancement' && !showModal && !selectedTradeDetail} onClick={() => { setActiveTab('Strategy Enhancement'); setSelectedTradeDetail(null); setShowModal(false); }} />
              </div>
              <div id="tour-journal-history">
                <SidebarItem label="Trading History" active={activeTab === 'Trading History' && !showModal && !selectedTradeDetail} onClick={() => { setActiveTab('Trading History'); setSelectedTradeDetail(null); setShowModal(false); }} />
              </div>
              <div id="tour-journal-images">
                <SidebarItem label="Images of your trades" active={activeTab === 'Images of your trades' && !showModal && !selectedTradeDetail} onClick={() => { setActiveTab('Images of your trades'); setSelectedTradeDetail(null); setShowModal(false); }} />
              </div>
            </div>

          {/* Bottom Section: Theme & Support */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '4px', paddingLeft: '16px' }}>
              Preference & Support
            </div>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
                borderRadius: '12px', border: 'none', background: 'var(--bg-hover)',
                cursor: 'pointer', transition: 'var(--transition)', width: '100%',
                color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600
              }}
            >
              <span style={{ fontSize: '18px' }}>{theme === 'light' ? '🌙' : '☀️'}</span>
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
            </button>

            <a
              href="https://discord.gg/qMGJaYp7hP"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
                borderRadius: '12px', background: 'rgba(88, 101, 242, 0.1)',
                cursor: 'pointer', transition: 'var(--transition)', width: '100%',
                color: '#5865F2', fontSize: '13px', fontWeight: 700
              }}
            >
              <span style={{ fontSize: '18px' }}>💬</span>
              Join Discord Support
            </a>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, marginLeft: '260px' }}>
          {/* ── BODY ── */}
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 40px 60px' }}>
            {selectedTradeDetail ? (
              <TradeDetailsView 
                trade={selectedTradeDetail} 
                onBack={() => setSelectedTradeDetail(null)} 
                onEdit={(t) => { setSelectedTradeDetail(null); openModal(t); }} 
                onDelete={(id) => { setSelectedTradeDetail(null); handleDeleteClick(id); }} 
              />
            ) : showModal ? (
              <LogTradeView
                form={form}
                setForm={setForm}
                onSubmit={submitTrade}
                onCancel={() => setShowModal(false)}
                editingTradeId={editingTradeId}
              />
            ) : (
              <div style={{ display: 'contents' }}>
                {/* Greeting */}
                {activeTab === 'Dashboard' && (
              <>
                <div style={{ marginBottom: '32px' }}>
                  <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '6px' }}>
                    {tod}, <span style={{ color: 'var(--text-primary)' }}>{firstName}</span> 👋
                  </h1>
                  <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {open.length} open position{open.length !== 1 ? 's' : ''} &nbsp;·&nbsp; {trades.length} trades logged &nbsp;·&nbsp; Journal overview
                  </p>
                </div>

                {/* ── STAT PILLS ROW ── */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '14px', marginBottom: '28px',
                }}>
                  <StatPill
                    label="Total Trades" value={trades.length}
                    color="var(--text-primary)" sub="all time"
                  />
                  <StatPill
                    label="Net P&L"
                    value={(totalPnl > 0 ? '+' : totalPnl < 0 ? '-' : '') + '$' + Math.abs(totalPnl).toFixed(2)}
                    color={totalPnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}
                    sub={(totalPips > 0 ? '+' : totalPips < 0 ? '-' : '') + Math.abs(totalPips).toFixed(1) + ' pips'}
                  />
                  <StatPill
                    label="Win Rate" value={wr.toFixed(1) + '%'}
                    color="var(--text-primary)"
                    sub={`${wins.length}W / ${losses.length}L${winRateMode === 'withBE' ? ` / ${beTrades.length}BE` : ''}`}
                  >
                    <div style={{ display: 'flex', background: 'var(--bg-base)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <button 
                        onClick={() => setWinRateMode('withBE')}
                        style={{ padding: '2px 6px', fontSize: '9px', fontWeight: 800, borderRadius: '6px', border: 'none', cursor: 'pointer', background: winRateMode === 'withBE' ? 'var(--accent-blue)' : 'transparent', color: winRateMode === 'withBE' ? 'white' : 'var(--text-dim)', transition: 'all 0.2s' }}
                      >+BE</button>
                      <button 
                        onClick={() => setWinRateMode('withoutBE')}
                        style={{ padding: '2px 6px', fontSize: '9px', fontWeight: 800, borderRadius: '6px', border: 'none', cursor: 'pointer', background: winRateMode === 'withoutBE' ? 'var(--accent-blue)' : 'transparent', color: winRateMode === 'withoutBE' ? 'white' : 'var(--text-dim)', transition: 'all 0.2s' }}
                      >-BE</button>
                    </div>
                  </StatPill>
                  <StatPill
                    label="Best Pair"
                    value={bestPair ? bestPair[0] : '—'}
                    color="var(--text-primary)"
                    sub={bestPair ? (bestPair[1] >= 0 ? '+' : '') + '$' + bestPair[1].toFixed(2) : '—'}
                  />
                  <StatPill
                    label="Avg R:R"
                    value={avgRR.toFixed(2) + 'R'}
                    color="var(--text-primary)"
                    sub="risk / reward"
                  />
                </div>

                {/* ── DASHBOARD VISUALIZATIONS FILTER ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', marginTop: '32px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
                    Visualizations
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '160px' }}>
                      <CustomSelect 
                        value={dashboardFilter} 
                        onChange={setDashboardFilter}
                        options={[
                          { value: 'All', label: 'Overall Results' },
                          { value: 'Today', label: 'Today' },
                          { value: 'Yesterday', label: 'Yesterday' },
                          { value: 'Specific', label: 'Specific Date' },
                          { value: 'Custom', label: 'Custom Range' },
                        ]}
                      />
                    </div>
                    {dashboardFilter === 'Specific' && (
                      <div style={{ width: '150px' }}>
                        <CustomDatePicker 
                          value={dashboardSpecificDate} 
                          onChange={setDashboardSpecificDate} 
                          placeholder="Select date"
                          alignRight
                        />
                      </div>
                    )}
                    {dashboardFilter === 'Custom' && (
                      <div style={{ display: 'flex', gap: '8px', width: '280px' }}>
                        <CustomDatePicker value={dashboardCustomStart} onChange={setDashboardCustomStart} placeholder="Start" />
                        <CustomDatePicker value={dashboardCustomEnd} onChange={setDashboardCustomEnd} placeholder="End" alignRight />
                      </div>
                    )}
                  </div>
                </div>

                {/* ── MAIN 2×2 GRID ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                  {/* CARD 1 — BEHAVIORAL BIAS */}
                  <Card>
                    <CardLabel>
                      Behavioral Bias
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'none', letterSpacing: 0 }}>
                        {dashboardFilteredTrades.length} filtered trades
                      </span>
                    </CardLabel>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                      {/* Bear side */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          width: '52px', height: '52px', borderRadius: '16px',
                          background: 'rgba(239,68,68,0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px',
                        }}>🐻</div>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bear</span>
                      </div>

                      {/* Center label */}
                      <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: biasColor, letterSpacing: '-0.5px', marginBottom: '4px' }}>
                          {biasWord}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{biasDesc}</div>
                      </div>

                      {/* Bull side */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          width: '52px', height: '52px', borderRadius: '16px',
                          background: 'rgba(16,185,129,0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px',
                        }}>🐂</div>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bull</span>
                      </div>
                    </div>

                    {/* Track */}
                    <div style={{ position: 'relative', height: '8px', background: 'var(--bg-base)', borderRadius: '999px', marginBottom: '12px', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${bearPct * 100}%`, background: 'rgba(239,68,68,0.5)', borderRadius: '999px', transition: 'width .6s ease' }} />
                      <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: `${bullPct * 100}%`, background: 'rgba(16,185,129,0.5)', borderRadius: '999px', transition: 'width .6s ease' }} />
                      <div style={{
                        position: 'absolute', top: '50%',
                        left: `${bullPct * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        width: '16px', height: '16px', borderRadius: '50%',
                        background: 'var(--accent-blue)', border: '3px solid var(--bg-panel)',
                        boxShadow: '0 0 0 2px var(--accent-blue), 0 2px 6px rgba(59,130,246,0.35)',
                        transition: 'left .6s ease',
                      }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {shorts} shorts &nbsp;({(bearPct * 100).toFixed(1)}%)
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {longs} longs &nbsp;({(bullPct * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </Card>

                  {/* CARD 2 — DAY PERFORMANCE */}
                  <Card style={{ paddingBottom: '16px' }}>
                    <CardLabel>
                      Trading Day Performance
                      <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-secondary)', textTransform: 'none', letterSpacing: 0 }}>
                        Best Day: <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{bestDay}</span>
                      </span>
                    </CardLabel>

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '40px', height: '140px', marginTop: '30px' }}>
                      {DAYS.map(day => {
                        const stats = dayStats[day]
                        const net = stats.net
                        const isNeg = net < 0
                        const formatNet = (Math.abs(net) % 1 === 0) ? Math.abs(net).toFixed(0) : Math.abs(net).toFixed(1)
                        const winH = (stats.win / maxBarVal) * 90
                        const lossH = (stats.loss / maxBarVal) * 90
                        return (
                          <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', height: '100%' }}>
                            <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '6px' }}>
                              <div style={{
                                flex: 1,
                                height: `${Math.max(winH, 4)}%`,
                                borderRadius: '8px',
                                background: 'var(--accent-green)',
                                transition: 'height .5s ease',
                              }} />
                              <div style={{
                                flex: 1,
                                height: `${Math.max(lossH, 4)}%`,
                                borderRadius: '8px',
                                background: 'var(--accent-red)',
                                transition: 'height .5s ease',
                              }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                                {isNeg ? '-' : ''}${formatNet}
                              </span>
                              <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-secondary)', textTransform: 'none' }}>{day}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Card>

                  {/* CARD 3 — ASSET BREAKDOWN */}
                  <Card>
                    <CardLabel>Asset Performance</CardLabel>

                    {assetRows.length === 0
                      ? <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>No closed trades yet.</p>
                      : assetRows.map(([pair, d]) => {
                        const t = d.w + d.l
                        const wPct = t ? d.w / t * 100 : 0
                        const pos = d.pnl >= 0
                        return (
                          <div key={pair} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                            {/* Pair name pill */}
                            <span style={{
                              fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500,
                              background: 'var(--bg-base)', border: '1px solid var(--border)',
                              borderRadius: '8px', padding: '3px 10px',
                              width: '68px', textAlign: 'center', flexShrink: 0,
                              color: 'var(--text-primary)',
                            }}>{pair}</span>

                            {/* Bar */}
                            <div style={{ flex: 1, height: '8px', borderRadius: '999px', background: 'var(--bg-base)', overflow: 'hidden', position: 'relative' }}>
                              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${wPct}%`, background: 'var(--accent-green)', borderRadius: '999px 0 0 999px' }} />
                              <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: `${100 - wPct}%`, background: 'var(--accent-red)', borderRadius: '0 999px 999px 0' }} />
                            </div>

                            {/* W/L */}
                            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--text-secondary)', width: '56px', textAlign: 'right', flexShrink: 0 }}>
                              {d.w}W / {d.l}L
                            </span>

                            {/* PnL */}
                            <span style={{
                              fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
                              width: '68px', textAlign: 'right', flexShrink: 0,
                            }}>
                              {pos ? '+' : ''}${d.pnl.toFixed(2)}
                            </span>
                          </div>
                        )
                      })
                    }
                  </Card>

                  {/* CARD 4 — SESSION WIN RATES */}
                  <Card>
                    <CardLabel>Session Win Rates</CardLabel>

                    {SESSIONS.map(s => {
                      const d = sessionMap[s.key]
                      const t = d ? d.w + d.l : 0
                      const rate = t ? d.w / t * 100 : 0
                      return (
                        <div key={s.key} style={{ marginBottom: '18px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</span>
                            </div>
                            <span style={{
                              fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
                            }}>
                              {rate.toFixed(1)}%
                            </span>
                          </div>
                          <div style={{ height: '6px', background: 'var(--bg-base)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${rate}%`,
                              background: s.color, opacity: 0.75,
                              borderRadius: '999px', transition: 'width .6s ease',
                            }} />
                          </div>
                        </div>
                      )
                    })}
                  </Card>

                </div>{/* /grid */}
              </>
            )}

            {activeTab === 'Trading History' && (
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '24px' }}>
                  Trading History
                </h1>

                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Date</th>
                        <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Asset</th>
                        <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Type</th>
                        <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Result</th>
                        <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Entry / Exit</th>
                        <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Lot Size</th>
                        <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Comms</th>
                        <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>RR</th>
                        <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Duration</th>
                        <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', textAlign: 'right' }}>P/L</th>
                        <th style={{ padding: '16px 20px', width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.length === 0 ? (
                        <tr><td colSpan="9" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '14px' }}>No trades logged yet.</td></tr>
                      ) : trades.slice().reverse().map(t => {
                        const pnl = calcPnl(t)
                        const pnlVal = pnl ? pnl.usd : null
                        return (
                          <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} onClick={() => setSelectedTradeDetail(t)}>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>{t.date}</td>
                            <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.pair}</td>
                            <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                              <span style={{
                                padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                                background: t.dir === 'long' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                color: 'var(--text-primary)'
                              }}>
                                {t.dir}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                                  background: getTradeResult(t) === 'Win' ? 'rgba(16,185,129,0.2)' : getTradeResult(t) === 'Loss' ? 'rgba(239,68,68,0.2)' : 'rgba(107,114,128,0.2)',
                                  color: getTradeResult(t) === 'Win' ? 'var(--accent-green)' : getTradeResult(t) === 'Loss' ? 'var(--accent-red)' : 'var(--text-secondary)'
                                }}>
                                  {getTradeResult(t)}
                                </span>
                                {t.exit && (
                                  <button 
                                    onClick={async (e) => {
                                      e.stopPropagation()
                                      let nextStatus
                                      if (!t.manual_result) nextStatus = 'BE'
                                      else if (t.manual_result === 'BE') nextStatus = 'Win'
                                      else if (t.manual_result === 'Win') nextStatus = 'Loss'
                                      else nextStatus = null // Revert to auto
                                      
                                      // Optimistic update
                                      setTrades(prev => prev.map(tr => tr.id === t.id ? { ...tr, manual_result: nextStatus } : tr))

                                      const { error } = await supabase.from('trades').update({ manual_result: nextStatus }).eq('id', t.id)
                                      if (error) {
                                        console.error('Manual result update failed:', error)
                                        alert('Failed to update result. Error: ' + error.message)
                                        // Rollback logic
                                        setTrades(prev => prev.map(tr => tr.id === t.id ? { ...tr, manual_result: t.manual_result } : tr))
                                      }
                                    }}
                                    title="Toggle Breakeven Status"
                                    style={{
                                      background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '6px', 
                                      padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.manual_result === 'BE' ? 'var(--accent-blue)' : 'var(--text-dim)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                  </button>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
                              {t.entryTime || '--:--'} <span style={{ color: 'var(--text-dim)' }}>→</span> {t.exitTime || '--:--'}
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>{t.lots}</td>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--accent-red)', fontFamily: 'var(--font-sans)' }}>{t.commissions ? '-$'+Number(t.commissions).toFixed(2) : '--'}</td>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{calcRR(t)}R</td>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>{calcDuration(t)}</td>
                            <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600, textAlign: 'right', fontFamily: 'var(--font-sans)', color: pnlVal >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                              {pnlVal === null ? 'Open' : `${pnlVal >= 0 ? '+' : ''}$${pnlVal.toFixed(2)}`}
                            </td>
                            <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                {t.images && t.images.length > 0 && (
                                  <button
                                    onClick={() => {
                                      const reversed = trades.slice().reverse()
                                      const tIdx = reversed.findIndex(rt => rt.id === t.id)
                                      setViewingContext({ trades: reversed, tradeIdx: tIdx, imgIdx: 0 })
                                    }}
                                    style={{
                                      background: 'rgba(59,130,246,0.1)', border: 'none', cursor: 'pointer',
                                      fontSize: '16px', color: 'var(--accent-blue)', padding: '6px',
                                      borderRadius: '8px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                    title="View Screenshots"
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                  </button>
                                )}
                                <button
                                  onClick={() => openModal(t)}
                                  style={{
                                    background: 'var(--bg-base)', border: 'none', cursor: 'pointer',
                                    fontSize: '16px', color: 'var(--text-secondary)', padding: '6px',
                                    borderRadius: '8px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                  }}
                                  title="Edit Trade"
                                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--border)'; }}
                                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-base)'; }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(t.id)}
                                  style={{
                                    background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer',
                                    fontSize: '16px', color: 'var(--accent-red)', padding: '6px',
                                    borderRadius: '8px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                  }}
                                  title="Delete Trade"
                                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </Card>
              </div>
            )}

            {activeTab === 'Images of your trades' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                  <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', margin: 0 }}>
                    Trade Gallery
                  </h1>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '160px' }}>
                      <CustomSelect 
                        value={galleryDateFilter} 
                        onChange={setGalleryDateFilter}
                        options={[
                          { value: 'All', label: 'All Dates' },
                          { value: 'Today', label: 'Today' },
                          { value: 'This Week', label: 'This Week' },
                          { value: 'This Month', label: 'This Month' },
                        ]}
                      />
                    </div>
                    <div style={{ width: '140px' }}>
                      <CustomSelect 
                        value={galleryResultFilter} 
                        onChange={setGalleryResultFilter}
                        options={[
                          { value: 'All', label: 'All Results' },
                          { value: 'Win', label: 'Wins Only' },
                          { value: 'Loss', label: 'Losses Only' },
                          { value: 'BE', label: 'Break Even' },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {galleryTrades.length === 0 ? (
                  <div style={{ padding: '80px 20px', textAlign: 'center', background: 'var(--bg-panel)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>No images found</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Try adjusting your filters or log more trades with screenshots.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    {galleryTrades.map((t, tIdx) => (
                      <div 
                        key={t.id}
                        onClick={() => {
                          setViewingContext({ trades: galleryTrades, tradeIdx: tIdx, imgIdx: 0 })
                        }}
                        style={{
                          background: 'var(--bg-panel)', borderRadius: '20px', overflow: 'hidden', 
                          border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s',
                          boxShadow: 'var(--shadow-sm)', position: 'relative',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-4px)'
                          e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                        }}
                      >
                        <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
                          <img src={t.images[0]} alt={t.pair} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-panel)', borderTop: '1px solid var(--border)' }}>
                           <div style={{ 
                             fontSize: '11px', fontWeight: 800, 
                             color: (calcPnl(t)?.usd || 0) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                             textTransform: 'uppercase',
                             minWidth: '60px'
                           }}>
                             {t.pair}
                           </div>
                           <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                             {t.date}
                           </span>
                           <div style={{ minWidth: '60px', textAlign: 'right' }}>
                             {t.images.length > 1 && (
                               <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
                                 +{t.images.length - 1} MORE
                               </span>
                             )}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Trading Statistics' && (
              <TradingStatistics trades={trades} tod={tod} firstName={firstName} onTradeClick={(t) => setSelectedTradeDetail(t)} />
            )}

            {activeTab === 'Strategy Enhancement' && (
              <div style={{
                position: 'fixed',
                top: '90px',
                left: '290px',
                right: '30px',
                bottom: '30px',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-panel)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                zIndex: 10,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>AI Trading Assistant</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Ask questions about your setups, performance drops, or general market conditions.</p>
                </div>

                <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: msg.role === 'user' ? '75%' : '95%',
                        padding: '12px 16px', borderRadius: '12px',
                        fontSize: '14px', lineHeight: 1.6,
                        color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                        background: msg.role === 'user' ? 'var(--accent-blue)' : 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)',
                      }}>
                        {msg.role === 'user' ? msg.content : (() => {
                          const barMatch = msg.content.match(/:::SESSION_BARS\n([\s\S]*?)\n:::/)
                          if (barMatch) {
                            try {
                              const parsed = JSON.parse(barMatch[1])
                              const maxWr = Math.max(...parsed.bars.map(b => b.wr), 1)
                              return (
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{parsed.title}</div>
                                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{parsed.summary}</div>
                                  {parsed.bars.map(b => (
                                    <div key={b.label} style={{ marginBottom: '14px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: 600, fontSize: '13px' }}>{b.label}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: b.wr >= 50 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{b.wr.toFixed(1)}%  <span style={{ fontWeight: 400, color: 'var(--text-dim)', fontSize: '11px' }}>{b.wins}W / {b.losses}L / {b.total} trades</span></span>
                                      </div>
                                      <div style={{ height: '8px', background: 'var(--bg-base)', borderRadius: '999px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${b.wr}%`, background: b.wr >= 50 ? 'var(--accent-green)' : 'var(--accent-red)', borderRadius: '999px', transition: 'width .6s ease', opacity: 0.8 }} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )
                            } catch { return <span>{msg.content}</span> }
                          }
                          return (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                table: ({ node, ...props }) => (
                                  <div style={{ overflowX: 'auto', marginTop: '8px', marginBottom: '8px' }}>
                                    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '13px' }} {...props} />
                                  </div>
                                ),
                                thead: ({ node, ...props }) => (
                                  <thead style={{ background: 'var(--bg-base)' }} {...props} />
                                ),
                                th: ({ node, ...props }) => (
                                  <th style={{ padding: '8px 14px', borderBottom: '2px solid var(--border)', fontWeight: 700, textAlign: 'left', color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }} {...props} />
                                ),
                                td: ({ node, ...props }) => (
                                  <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }} {...props} />
                                ),
                                tr: ({ node, ...props }) => (
                                  <tr style={{ transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-base)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    {...props}
                                  />
                                ),
                                p: ({ node, ...props }) => <p style={{ margin: '4px 0' }} {...props} />,
                                strong: ({ node, ...props }) => <strong style={{ fontWeight: 700, color: 'var(--text-primary)' }} {...props} />,
                                code: ({ node, ...props }) => <code style={{ background: 'var(--bg-base)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }} {...props} />,
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          )
                        })()}
                        <div ref={chatEndRef} />
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div style={{ padding: '12px 16px', borderRadius: '12px', fontSize: '14px', color: 'var(--text-secondary)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        Thinking...
                      </div>
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </div>

                <div style={{ padding: '16px 24px', background: 'var(--bg-panel)', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    {['Show me trades with > 3RR', 'Analyze my biggest loss', 'What is my best session?'].map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => setChatInput(prompt)}
                        style={{
                          background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '999px',
                          padding: '6px 14px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-dim)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                      placeholder="Ask the AI about your trading..."
                      style={{
                        flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)',
                        background: 'var(--bg-base)', fontSize: '14px', color: 'var(--text-primary)', outline: 'none'
                      }}
                    />
                    <Btn primary onClick={handleSendChat} disabled={isChatLoading || !chatInput.trim()}>
                      Send
                    </Btn>
                  </div>
                </div>
              </div>
            )}
              </div>
            )}
          </div>{/* /body */}
        </div>{/* /main content */}
      </div>{/* /flex layout wrapper */}

      {/* Modal removed — Log Trade is now rendered inline via LogTradeView */}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {tradeToDelete && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setTradeToDelete(null) }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, backdropFilter: 'blur(4px)',
          }}
        >
          <div style={{
            background: 'var(--bg-panel)', borderRadius: '24px',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
            width: '400px', maxWidth: '90vw',
            padding: '32px 24px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', marginBottom: '20px'
            }}>⚠️</div>

            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Delete Trade Log?
            </div>

            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.5 }}>
              This action cannot be undone. This trade will be permanently removed from your statistics.
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '32px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={skipDeleteConfirm}
                onChange={e => setSkipDeleteConfirm(e.target.checked)}
                style={{ accentColor: 'var(--accent-red)', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Don't ask me again
            </label>

            <div style={{ display: 'flex', width: '100%', gap: '12px' }}>
              <Btn style={{ flex: 1, justifyContent: 'center' }} onClick={() => setTradeToDelete(null)}>Cancel</Btn>
              <Btn danger style={{ flex: 1, justifyContent: 'center' }} onClick={() => confirmDelete(tradeToDelete)}>Delete</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── ENHANCED LIGHTBOX ── */}
      {viewingContext && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setViewingContext(null) }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,23,42,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 99999, backdropFilter: 'blur(12px)',
          }}
        >
          {(() => {
            const { trades: vTrades, tradeIdx, imgIdx } = viewingContext
            const currentTrade = vTrades[tradeIdx]
            const images = currentTrade.images || []
            
            const handleNext = () => {
              if (imgIdx < images.length - 1) {
                setViewingContext({ ...viewingContext, imgIdx: imgIdx + 1 })
              } else if (tradeIdx < vTrades.length - 1) {
                setViewingContext({ ...viewingContext, tradeIdx: tradeIdx + 1, imgIdx: 0 })
              }
            }

            const handlePrev = () => {
              if (imgIdx > 0) {
                setViewingContext({ ...viewingContext, imgIdx: imgIdx - 1 })
              } else if (tradeIdx > 0) {
                const prevTrade = vTrades[tradeIdx - 1]
                setViewingContext({ ...viewingContext, tradeIdx: tradeIdx - 1, imgIdx: (prevTrade.images?.length || 1) - 1 })
              }
            }

            const canNext = imgIdx < images.length - 1 || tradeIdx < vTrades.length - 1
            const canPrev = imgIdx > 0 || tradeIdx > 0

            return (
              <div style={{ position: 'relative', width: '90vw', maxWidth: '1200px', height: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <button onClick={() => setViewingContext(null)} style={{ position: 'absolute', top: '-48px', right: '0', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '13px', fontWeight: 800, padding: '8px 20px', borderRadius: '999px', cursor: 'pointer' }}>Close ✕</button>
                
                {canPrev && (
                  <button onClick={handlePrev} style={{ position: 'absolute', left: '-60px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                )}

                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <img src={images[imgIdx]} alt="Trade Screenshot" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 32px 64px rgba(0,0,0,0.6)' }} />
                  
                  {/* Date Badge at Bottom Center of Image View */}
                  <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15,23,41,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 24px', borderRadius: '999px', fontSize: '14px', fontWeight: 700, pointerEvents: 'none' }}>
                    {currentTrade.date} &nbsp;·&nbsp; {currentTrade.pair} &nbsp;·&nbsp; Image {imgIdx + 1} of {images.length}
                  </div>
                </div>

                {canNext && (
                  <button onClick={handleNext} style={{ position: 'absolute', right: '-60px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                )}
              </div>
            )
          })()}
        </div>
      )}

      {/* ── SUCCESS CELEBRATION MODAL ── */}
      {showSuccessModal && lastLoggedTrade && (
        <div 
          onClick={() => setShowSuccessModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999999,
            background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '440px', background: 'var(--bg-panel)',
              borderRadius: '24px', border: '1px solid var(--border)',
              padding: '40px 32px', textAlign: 'center', position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}
          >
            {/* Background Decoration */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--accent-blue)', opacity: 0.1, filter: 'blur(60px)', borderRadius: '50%' }} />
            
            <div style={{ fontSize: '56px', marginBottom: '24px' }}>
              {getTradeResult(lastLoggedTrade) === 'Win' ? '🏆' : '📝'}
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Trade Logged!
            </h2>
            
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {lastLoggedTrade.pair} · {lastLoggedTrade.date}
            </p>

            <div style={{ 
              padding: '24px', borderRadius: '20px', 
              background: 'rgba(59,130,246,0.06)', border: '1px dashed rgba(59,130,246,0.2)', 
              marginBottom: '32px' 
            }}>
              <p style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                "{successQuote}"
              </p>
            </div>

            <button 
              style={{
                width: '100%', padding: '16px', borderRadius: '12px', fontSize: '15px', fontWeight: 700,
                background: 'var(--accent-blue)', color: 'white', border: 'none', cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(59,130,246,0.2)'
              }}
              onClick={() => setShowSuccessModal(false)}
            >
              Continue Trading
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
