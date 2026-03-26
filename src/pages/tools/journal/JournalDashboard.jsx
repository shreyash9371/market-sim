import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/useAuthStore'
import { supabase } from '../../../utils/supabase'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// ── HELPERS ───────────────────────────────────────────────────
function getContractSize(pair) {
  const p = pair.toUpperCase()
  if (p.includes('JPY')) return 100000 
  if (p.includes('XAU')) return 100 // 1 lot = 100 oz
  if (p.includes('XAG')) return 5000 // 1 lot = 5000 oz
  if (['US30', 'NAS100', 'SPX500', 'GER40', 'DAX'].includes(p)) return 10 // typical mini/micro contract
  if (['BTCUSD', 'ETHUSD', 'SOLUSD'].includes(p)) return 1 // 1 lot = 1 coin
  return 100000 // standard forex
}

function getPipMultiplier(pair) {
  const p = pair.toUpperCase()
  if (p.includes('JPY')) return 100
  if (p.includes('XAU') || p.includes('XAG')) return 10 // $1 move = 10 pips
  if (['US30', 'NAS100', 'SPX500', 'BTCUSD', 'ETHUSD'].includes(p)) return 1
  return 10000
}

function calcPnl(t) {
  if (!t.exit) return null
  const size = t.pipval ? parseFloat(t.pipval) : getContractSize(t.pair)
  const diff = t.dir === 'long' ? (t.exit - t.entry) : (t.entry - t.exit)
  const usd = diff * t.lots * size
  
  const mult = getPipMultiplier(t.pair)
  const pips = diff * mult

  return {
    pips: parseFloat(pips.toFixed(1)),
    usd: parseFloat(usd.toFixed(2)),
  }
}

function calcRR(t) {
  if (!t.sl || !t.tp || t.sl === t.entry) return 0
  const risk = Math.abs(t.entry - t.sl)
  const reward = Math.abs(t.tp - t.entry)
  return parseFloat((reward / risk).toFixed(2))
}
function today() {
  return new Date().toISOString().split('T')[0]
}

const SESSIONS = [
  { key: 'new_york', label: 'New York', color: 'var(--accent-blue)' },
  { key: 'london', label: 'London', color: 'var(--accent-green)' },
  { key: 'asian', label: 'Asian', color: 'var(--accent-yellow)' },
  { key: 'overlap', label: 'London / NY Overlap', color: 'var(--accent-red)' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
  lots: '0.10', pipval: '1.00', entryTime: '', exitTime: '', emotion: '', notes: '',
}

function calcDuration(t) {
  if (!t.entryTime || !t.exitTime) return '—'
  const [eh, em] = t.entryTime.split(':').map(Number)
  const [xh, xm] = t.exitTime.split(':').map(Number)
  let diff = (xh * 60 + xm) - (eh * 60 + em)
  if (diff < 0) diff += 24 * 60 // crossed midnight
  const hours = Math.floor(diff / 60)
  const mins = diff % 60
  return `${hours}h ${mins}m`
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

function StatPill({ label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      padding: '16px 20px',
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

function Btn({ children, onClick, primary, danger, style = {} }) {
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
  return <button onClick={onClick} style={{ ...base, ...variant, ...style }}>{children}</button>
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

function AssetAutocomplete({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value || '')

  const filtered = ASSETS.filter(a => a.toLowerCase().includes(query.toLowerCase()))

  return (
    <div style={{ position: 'relative' }}>
      <input
        style={inputStyle}
        value={query}
        onChange={e => { setQuery(e.target.value.toUpperCase()); setOpen(true); onChange(e.target.value.toUpperCase()); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="e.g. XAUUSD"
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'var(--bg-panel)', border: '1px solid var(--border)',
          borderRadius: '12px', marginTop: '4px', zIndex: 1000,
          maxHeight: '160px', overflowY: 'auto',
          boxShadow: 'var(--shadow-md)'
        }}>
          {filtered.map(a => (
            <div
              key={a}
              onMouseDown={() => { onChange(a); setQuery(a); setOpen(false); }}
              style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-base)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >{a}</div>
          ))}
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
  const firstName = auth.user?.user_metadata?.first_name || 'Trader'

  const [trades, setTrades] = useState([])
  const [tradesLoading, setTradesLoading] = useState(true)

  useEffect(() => {
    if (!auth.user) {
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
  }, [auth.user])

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

      const systemPrompt = `You are a smart, concise trading journal analyst. You have access to the user's trade history with pre-calculated values.

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
    lots: t.lots, pipval: t.pipval,
    pnl_usd: pnl ? pnl.usd : 'open',
    rr: parseFloat(rr.toFixed(2)),
    emotion: t.emotion, notes: t.notes, strategy: t.strategy,
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
        entry: trade.entry.toString(),
        exit: trade.exit ? trade.exit.toString() : '',
        sl: trade.sl.toString(),
        tp: trade.tp.toString(),
        lots: trade.lots.toString(),
        pipval: trade.pipval.toString(),
        emotion: trade.emotion || '',
        notes: trade.notes || '',
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
      emotion: form.emotion, notes: form.notes.trim(),
    }
    newTrade['entryTime'] = form.entryTime || null
    newTrade['exitTime'] = form.exitTime || null

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

      setTrades([...trades, data])
    }

    setShowModal(false)
    setEditingTradeId(null)
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

    const { error } = await supabase.from('trades').delete().eq('id', id)
    if (error) {
      console.error(error)
      alert('Failed to delete trade: ' + error.message)
    }
  }

  // ── COMPUTED ────────────────────────────────────────────────
  const closed = trades.filter(t => t.exit)
  const open = trades.filter(t => !t.exit)
  const wins = closed.filter(t => calcPnl(t).usd >= 0)
  const losses = closed.filter(t => calcPnl(t).usd < 0)
  const totalPnl = closed.reduce((s, t) => s + calcPnl(t).usd, 0)
  const totalPips = closed.reduce((s, t) => s + calcPnl(t).pips, 0)
  const wr = closed.length ? wins.length / closed.length * 100 : 0
  const rrVals = trades.filter(t => t.sl && t.tp).map(calcRR)
  const avgRR = rrVals.length ? rrVals.reduce((a, b) => a + b, 0) / rrVals.length : 0

  const byPair = {}
  closed.forEach(t => { byPair[t.pair] = (byPair[t.pair] || 0) + calcPnl(t).usd })
  const bestPair = Object.entries(byPair).sort((a, b) => b[1] - a[1])[0]

  // Day bars
  const dayStats = {
    Mon: { win: 0, loss: 0, net: 0 },
    Tue: { win: 0, loss: 0, net: 0 },
    Wed: { win: 0, loss: 0, net: 0 },
    Thu: { win: 0, loss: 0, net: 0 },
    Fri: { win: 0, loss: 0, net: 0 }
  }
  closed.forEach(t => {
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
  const bestDay = DAYS.reduce((a, b) => dayStats[a].net >= dayStats[b].net ? a : b)

  // Bias
  const longs = closed.filter(t => t.dir === 'long').length
  const shorts = closed.filter(t => t.dir === 'short').length
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
  closed.forEach(t => {
    if (!assetMap[t.pair]) assetMap[t.pair] = { w: 0, l: 0, pnl: 0 }
    calcPnl(t).usd >= 0 ? assetMap[t.pair].w++ : assetMap[t.pair].l++
    assetMap[t.pair].pnl += calcPnl(t).usd
  })
  const assetRows = Object.entries(assetMap).sort((a, b) => Math.abs(b[1].pnl) - Math.abs(a[1].pnl))

  // Sessions
  const sessionMap = {}
  closed.filter(t => t.session).forEach(t => {
    if (!sessionMap[t.session]) sessionMap[t.session] = { w: 0, l: 0 }
    calcPnl(t).usd >= 0 ? sessionMap[t.session].w++ : sessionMap[t.session].l++
  })

  const hour = new Date().getHours()
  const tod = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // ── RENDER ──────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-sans)' }}>

      {/* ── NAVBAR (matches Dashboard exactly) ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.90)',
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
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'black', letterSpacing: '-0.5px' }}>
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
          <Btn primary onClick={openModal}>+ Log Trade</Btn>
        </div>
      </nav>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        {/* ── SIDEBAR ── */}
        <aside style={{
          width: '260px',
          background: 'var(--bg-panel)',
          borderRight: '1px solid var(--border)',
          padding: '32px 16px',
          display: 'flex', flexDirection: 'column', gap: '8px',
          position: 'fixed', top: '64px', bottom: 0,
          overflowY: 'auto',
          zIndex: 40,
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '12px', paddingLeft: '16px' }}>
            Menu
          </div>
          <SidebarItem label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          <SidebarItem label="Trading Statistics" active={activeTab === 'Trading Statistics'} onClick={() => setActiveTab('Trading Statistics')} />
          <SidebarItem label="Strategy Enhancement" active={activeTab === 'Strategy Enhancement'} onClick={() => setActiveTab('Strategy Enhancement')} />
          <SidebarItem label="Trading History" active={activeTab === 'Trading History'} onClick={() => setActiveTab('Trading History')} />
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, marginLeft: '260px' }}>
          {/* ── BODY ── */}
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 40px 60px' }}>

            {/* Greeting */}
            {activeTab === 'Dashboard' && (
              <>
                <div style={{ marginBottom: '32px' }}>
                  <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '6px' }}>
                    {tod}, <span style={{ color: 'black' }}>{firstName}</span> 👋
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
                    color="black" sub="all time"
                  />
                  <StatPill
                    label="Net P&L"
                    value={(totalPnl >= 0 ? '+' : '') + '$' + totalPnl.toFixed(2)}
                    color="green"
                    sub={(totalPips >= 0 ? '+' : '') + totalPips.toFixed(1) + ' pips'}
                  />
                  <StatPill
                    label="Win Rate" value={wr.toFixed(1) + '%'}
                    color="black"
                    sub={wins.length + 'W  /  ' + losses.length + 'L'}
                  />
                  <StatPill
                    label="Best Pair"
                    value={bestPair ? bestPair[0] : '—'}
                    color="black"
                    sub={bestPair ? (bestPair[1] >= 0 ? '+' : '') + '$' + bestPair[1].toFixed(2) : '—'}
                  />
                  <StatPill
                    label="Avg R:R"
                    value={avgRR.toFixed(2) + 'R'}
                    color="black"
                    sub="risk / reward"
                  />
                </div>

                {/* ── MAIN 2×2 GRID ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                  {/* CARD 1 — BEHAVIORAL BIAS */}
                  <Card>
                    <CardLabel>
                      Behavioral Bias
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'none', letterSpacing: 0 }}>
                        {trades.length} total trades
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
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'black', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bear</span>
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
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'black', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bull</span>
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
                        background: 'var(--accent-blue)', border: '3px solid #fff',
                        boxShadow: '0 0 0 2px var(--accent-blue), 0 2px 6px rgba(59,130,246,0.35)',
                        transition: 'left .6s ease',
                      }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'black' }}>
                        {shorts} shorts &nbsp;({(bearPct * 100).toFixed(1)}%)
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'black' }}>
                        {longs} longs &nbsp;({(bullPct * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </Card>

                  {/* CARD 2 — DAY PERFORMANCE */}
                  <Card style={{ paddingBottom: '16px' }}>
                    <CardLabel>
                      Trading Day Performance
                      <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-secondary)', textTransform: 'none', letterSpacing: 0 }}>
                        Best Day: <span style={{ fontWeight: 700, color: 'black' }}>{bestDay}</span>
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
                        <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Date</th>
                        <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Asset</th>
                        <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Type</th>
                        <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Entry / Exit</th>
                        <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Lot Size</th>
                        <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Duration</th>
                        <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>P/L</th>
                        <th style={{ padding: '16px 20px', width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.length === 0 ? (
                        <tr><td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '14px' }}>No trades logged yet.</td></tr>
                      ) : trades.slice().reverse().map(t => {
                        const pnl = calcPnl(t)
                        const pnlVal = pnl ? pnl.usd : null
                        return (
                          <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>{t.date}</td>
                            <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.pair}</td>
                            <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                              <span style={{
                                padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                                background: t.dir === 'long' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                color: 'black'
                              }}>
                                {t.dir}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
                              {t.entryTime || '--:--'} <span style={{ color: 'var(--text-dim)' }}>→</span> {t.exitTime || '--:--'}
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>{t.lots}</td>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>{calcDuration(t)}</td>
                            <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600, textAlign: 'right', fontFamily: 'var(--font-sans)', color: 'black' }}>
                              {pnlVal === null ? 'Open' : `${pnlVal >= 0 ? '+' : ''}$${pnlVal.toFixed(2)}`}
                            </td>
                            <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => openModal(t)}
                                  style={{
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    fontSize: '16px', color: 'var(--text-dim)', padding: '6px',
                                    borderRadius: '6px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                  }}
                                  title="Edit Trade"
                                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-blue)'; e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; }}
                                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'transparent'; }}
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(t.id)}
                                  style={{
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    fontSize: '16px', color: 'var(--accent-red)', padding: '6px',
                                    borderRadius: '6px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                  }}
                                  title="Delete Trade"
                                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                  🗑️
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

            {activeTab === 'Trading Statistics' && (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚧</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Feature in Development</div>
                <div>This section will be available in a future update.</div>
              </div>
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
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: '#fff' }}>
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
                        background: msg.role === 'user' ? 'var(--accent-blue)' : '#fff',
                        border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
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
                      <div style={{ padding: '12px 16px', borderRadius: '12px', fontSize: '14px', color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border)' }}>
                        Thinking...
                      </div>
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </div>

                <div style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid var(--border)' }}>
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

          </div>{/* /body */}
        </div>{/* /main content */}
      </div>{/* /flex layout wrapper */}

      {/* ── LOG TRADE MODAL ── */}
      {showModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,23,42,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 999, backdropFilter: 'blur(4px)',
          }}
        >
          <div style={{
            background: '#fff', borderRadius: '24px',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
            width: '580px', maxWidth: '95vw',
            maxHeight: '90vh', overflowY: 'auto',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Modal header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--bg-base)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {editingTradeId ? 'Edit Trade' : 'Log New Trade'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  {editingTradeId ? 'Modify your trade details' : 'Fill in your trade details below'}
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'var(--bg-base)', border: '1.5px solid var(--border)',
                  borderRadius: '10px', width: '32px', height: '32px',
                  cursor: 'pointer', fontSize: '15px', color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                <FGroup label="Pair *">
                  <AssetAutocomplete value={form.pair} onChange={val => setF('pair', val)} />
                </FGroup>
                <FGroup label="Direction">
                  <select style={inputStyle} value={form.dir} onChange={e => setF('dir', e.target.value)}>
                    <option value="long">Long (Buy)</option>
                    <option value="short">Short (Sell)</option>
                  </select>
                </FGroup>
                <FGroup label="Date">
                  <input style={inputStyle} type="date" value={form.date} onChange={e => setF('date', e.target.value)} />
                </FGroup>
                <FGroup label="Session">
                  <select style={inputStyle} value={form.session} onChange={e => setF('session', e.target.value)}>
                    <option value="">— Select —</option>
                    {SESSIONS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </FGroup>
                <FGroup label="Entry Time">
                  <input style={inputStyle} type="time" value={form.entryTime} onChange={e => setF('entryTime', e.target.value)} />
                </FGroup>
                <FGroup label="Exit Time">
                  <input style={inputStyle} type="time" value={form.exitTime} onChange={e => setF('exitTime', e.target.value)} />
                </FGroup>
                <FGroup label="Entry *">
                  <input style={inputStyle} type="number" step="0.00001" value={form.entry} onChange={e => setF('entry', e.target.value)} placeholder="1.08520" />
                </FGroup>
                <FGroup label="Exit">
                  <input style={inputStyle} type="number" step="0.00001" value={form.exit} onChange={e => setF('exit', e.target.value)} placeholder="Blank if still open" />
                </FGroup>
                <FGroup label="Stop Loss *">
                  <input style={inputStyle} type="number" step="0.00001" value={form.sl} onChange={e => setF('sl', e.target.value)} placeholder="1.08200" />
                </FGroup>
                <FGroup label="Take Profit *">
                  <input style={inputStyle} type="number" step="0.00001" value={form.tp} onChange={e => setF('tp', e.target.value)} placeholder="1.09200" />
                </FGroup>
                <FGroup label="Lot Size">
                  <input style={inputStyle} type="number" step="0.01" value={form.lots} onChange={e => setF('lots', e.target.value)} />
                </FGroup>
                <FGroup label="Pip Value ($)">
                  <input style={inputStyle} type="number" step="0.01" value={form.pipval} onChange={e => setF('pipval', e.target.value)} />
                </FGroup>
                <FGroup label="Emotion">
                  <select style={inputStyle} value={form.emotion} onChange={e => setF('emotion', e.target.value)}>
                    <option value="">— Select —</option>
                    <option value="calm">😌  Calm</option>
                    <option value="confident">💪  Confident</option>
                    <option value="fomo">😰  FOMO</option>
                    <option value="fearful">😨  Fearful</option>
                    <option value="greedy">🤑  Greedy</option>
                    <option value="patient">🧘  Patient</option>
                    <option value="disciplined">✅  Disciplined</option>
                  </select>
                </FGroup>
                <FGroup label="Notes" full>
                  <textarea
                    style={{ ...inputStyle, fontFamily: 'var(--font-sans)', resize: 'vertical', minHeight: '80px' }}
                    value={form.notes}
                    onChange={e => setF('notes', e.target.value)}
                    placeholder="Setup, confluences, reasoning, lessons..."
                  />
                </FGroup>

              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px', paddingTop: '18px', borderTop: '1px solid var(--bg-base)' }}>
                <Btn onClick={() => setShowModal(false)}>Cancel</Btn>
                <Btn primary onClick={submitTrade}>Save Trade</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {tradeToDelete && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setTradeToDelete(null) }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,23,42,0.45)',
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

    </div>
  )
}