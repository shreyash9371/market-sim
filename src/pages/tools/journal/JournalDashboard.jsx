import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/auth/useAuthStore'
import { supabase } from '../../../utils/supabase'

import TradingStatistics from './TradingStatistics'
import TradeDetailsView from './TradeDetailsView'
import LogTradeView from './LogTradeView'

import { startTourManually } from '../../../system/ProductTourManager'
import { today, emptyForm, MOTIVATIONAL_NOTES } from './constants.js'
import { StatPill, Btn } from '../../../components/ui/BaseComponents.jsx'
import { triggerCelebration } from '../../../utils/celebration.js'

import TradeHistoryTab from '../journal/components/TradeHistoryTab'
import AICoachTab from '../journal/components/AICoachTab.jsx'
import DashboardVisuals from '../journal/components/DashboardVisuals'
import TradeGalleryTab from '../journal/components/TradeGalleryTab'
import JournalModals from '../journal/components/JournalModals'
import JournalSidebar from '../journal/components/JournalSidebar'
import MT5SyncTab from '../journal/components/MT5SyncTab'

import { useJournalStats } from './hooks/useJournalStats'
import { useJournalData } from './hooks/useJournalData'
import { useJournalChat } from './hooks/useJournalChat'
import { useJournalSummary } from './hooks/useJournalSummary'
import { getTradeResult, calcPnl } from '../../../utils/tradeMetrics'

// ══════════════════════════════════════════════════════════════
export default function JournalDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const navigate = useNavigate()
  const auth = useAuthStore()
  const _meta = auth.user?.user_metadata || {}
  const firstName = _meta.first_name || _meta.given_name || _meta.full_name?.split(' ')[0] || _meta.name?.split(' ')[0] || 'Trader'

  const [theme, setTheme] = useState(() => localStorage.getItem('mkt_sim_theme') || 'light')
  const [selectedTradeDetail, setSelectedTradeDetail] = useState(null)
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('mkt_sim_theme', theme)
  }, [theme])

  const { trades, setTrades, tradesLoading } = useJournalData(auth)

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ ...emptyForm, date: today() })
  const [propMode, setPropMode] = useState(false)
  const [tradeToDelete, setTradeToDelete] = useState(null)
  const [skipDeleteConfirm, setSkipDeleteConfirm] = useState(false)
  const [editingTradeId, setEditingTradeId] = useState(null)

  const [galleryDateFilter, setGalleryDateFilter] = useState('All')
  const [galleryResultFilter, setGalleryResultFilter] = useState('All')
  const [winRateMode, setWinRateMode] = useState(localStorage.getItem('journal_wr_mode') || 'withBE')

  const [dashboardFilter, setDashboardFilter] = useState('All')
  const [dashboardSpecificDate, setDashboardSpecificDate] = useState(today())
  const [dashboardCustomStart, setDashboardCustomStart] = useState('')
  const [dashboardCustomEnd, setDashboardCustomEnd] = useState('')

  useEffect(() => {
    localStorage.setItem('journal_wr_mode', winRateMode)
  }, [winRateMode])
  
  const [viewingContext, setViewingContext] = useState(null)

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successQuote, setSuccessQuote] = useState('')
  const [lastLoggedTrade, setLastLoggedTrade] = useState(null)

  const {
    chatInput, setChatInput, chatMessages, setChatMessages,
    isChatLoading, handleSendChat, chatEndRef
  } = useJournalChat(trades, firstName, activeTab)

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
      const lastTrade = trades.length > 0 ? trades[trades.length - 1] : null
      if (lastTrade) {
        setForm({
          ...emptyForm,
          pair: lastTrade.pair,
          dir: lastTrade.dir,
          session: lastTrade.session || '',
          entry: lastTrade.entry.toString(),
          exit: lastTrade.exit ? lastTrade.exit.toString() : '',
          sl: lastTrade.sl.toString(),
          tp: lastTrade.tp.toString(),
          date: lastTrade.date,
          exit_date: lastTrade.exit_date || '',
          entryTime: lastTrade.entryTime || '',
          exitTime: lastTrade.exitTime || '',
          lots: lastTrade.lots.toString(),
          pipval: lastTrade.pipval.toString(),
          commissions: lastTrade.commissions ? lastTrade.commissions.toString() : '',
        })
      } else {
        setForm({ ...emptyForm, date: today() })
      }
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
      entryTime: form.entryTime || null,
      exitTime: form.exitTime || null,
      exit_date: form.exit_date || null
    }

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
        const { data, error } = await supabase.from('trades').update(newTrade).eq('id', editingTradeId).select().single()
        if (error) return alert('Error updating trade: ' + error.message)
        savedData = data
        setTrades(trades.map(t => t.id === editingTradeId ? data : t))
      } else {
        const { data, error } = await supabase.from('trades').insert([newTrade]).select().single()
        if (error) return alert('Error saving trade: ' + error.message)
        savedData = data
        setTrades([...trades, data])
      }
    }

    setShowModal(false)
    setEditingTradeId(null)

    if (savedData) {
      const result = getTradeResult(savedData)
      setLastLoggedTrade(savedData)
      setSuccessQuote(MOTIVATIONAL_NOTES[Math.floor(Math.random() * MOTIVATIONAL_NOTES.length)])
      setShowSuccessModal(true)

      if (result === 'Win') {
        triggerCelebration()
      } else if (result === 'Loss') {
        const recentTrades = [...trades, savedData].reverse().slice(0, 3)
        const lossStreak = recentTrades.filter(t => getTradeResult(t) === 'Loss').length >= 3
        if (lossStreak) {
          setActiveTab('AI Trading Coach')
          setTimeout(() => {
            handleSendChat("I just took another loss. Analyze my performance and give me a lecture on discipline.")
          }, 800)
        }
      }
    }
  }

  function handleDeleteClick(id) {
    if (skipDeleteConfirm) confirmDelete(id)
    else setTradeToDelete(id)
  }

  async function confirmDelete(id) {
    setTrades(trades.filter(t => t.id !== id))
    setTradeToDelete(null)
    if (!auth.isGuest) {
      await supabase.from('trades').delete().eq('id', id)
    }
  }

  // Hook-based computing
  const { closed, open, totalPnl, totalPips, wins, losses, beTrades, wr, avgRR, bestPair } = useJournalSummary(trades, winRateMode)
  const { dashboardFilteredTrades, biasWord, biasColor, biasDesc, bullPct, bearPct, longs, shorts, bestDay, dayStats, maxBarVal, assetRows, sessionMap } = useJournalStats(trades, dashboardFilter, dashboardSpecificDate, dashboardCustomStart, dashboardCustomEnd)

  const hour = new Date().getHours()
  const tod = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const galleryTrades = useMemo(() => {
    let list = trades.filter(t => t.images && t.images.length > 0)
    if (galleryResultFilter !== 'All') {
      list = list.filter(t => {
        const pnl = calcPnl(t)?.usd || 0
        if (galleryResultFilter === 'Win') return pnl > 0
        if (galleryResultFilter === 'Loss') return pnl < 0
        if (galleryResultFilter === 'BE') return pnl === 0
        return true
      })
    }
    if (galleryDateFilter !== 'All') {
      const today = new Date(); today.setHours(0, 0, 0, 0)
      list = list.filter(t => {
        const d = new Date(t.date + 'T12:00:00'); d.setHours(0, 0, 0, 0)
        if (galleryDateFilter === 'Today') return d.getTime() === today.getTime()
        if (galleryDateFilter === 'This Week') {
          const todayCopy = new Date(today.getTime())
          const diff = todayCopy.getDate() - todayCopy.getDay() + (todayCopy.getDay() === 0 ? -6 : 1)
          return d >= new Date(todayCopy.setDate(diff))
        }
        if (galleryDateFilter === 'This Month') return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear()
        return true
      })
    }
    return list.slice().reverse()
  }, [trades, galleryDateFilter, galleryResultFilter])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-sans)', paddingTop: '64px' }}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--bg-panel-alpha)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)', padding: '0 40px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/dashboard')} style={{
            background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '7px 14px',
            fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L5 7L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg> Back
          </button>
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>MktSim</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-base)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: '999px' }}>Trade Journal</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => startTourManually('/tools/journal')} style={{
            background: 'none', border: '1.5px solid var(--border)', color: 'var(--text-secondary)', padding: '6px 14px', borderRadius: '10px',
            fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
          }}>💡 How it works</button>
          <button onClick={() => setPropMode(p => !p)} style={{
            fontSize: '12px', fontWeight: 600, padding: '7px 16px', borderRadius: '999px', cursor: 'pointer',
            background: propMode ? 'rgba(245,158,11,0.12)' : 'var(--bg-base)',
            border: propMode ? '1.5px solid rgba(245,158,11,0.35)' : '1.5px solid var(--border)',
            color: propMode ? 'var(--accent-yellow)' : 'var(--text-secondary)', transition: 'all .2s',
          }}>⚡ Prop Firm Mode{propMode ? ': ON' : ''}</button>
          <Btn id="tour-new-trade" primary onClick={() => openModal()}>+ Log Trade</Btn>
        </div>
      </nav>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        <JournalSidebar 
          activeTab={activeTab} setActiveTab={setActiveTab} 
          setSelectedTradeDetail={setSelectedTradeDetail} 
          setShowModal={setShowModal} showModal={showModal} 
          selectedTradeDetail={selectedTradeDetail} 
          theme={theme} setTheme={setTheme} 
        />

        <div style={{ flex: 1, marginLeft: '260px' }}>
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
                form={form} setForm={setForm}
                onSubmit={submitTrade}
                onCancel={() => setShowModal(false)}
                editingTradeId={editingTradeId}
              />
            ) : (
              <div style={{ display: 'contents' }}>
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '28px' }}>
                      <StatPill label="Total Trades" value={trades.length} color="var(--text-primary)" sub="all time" />
                      <StatPill
                        label="Net P&L"
                        value={(totalPnl > 0 ? '+' : totalPnl < 0 ? '-' : '') + '$' + Math.abs(totalPnl).toFixed(2)}
                        color={totalPnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}
                        sub={(totalPips > 0 ? '+' : totalPips < 0 ? '-' : '') + Math.abs(totalPips).toFixed(1) + ' pips'}
                      />
                      <StatPill
                        label="Win Rate" value={wr.toFixed(1) + '%'} color="var(--text-primary)"
                        sub={`${wins.length}W / ${losses.length}L${winRateMode === 'withBE' ? ` / ${beTrades.length}BE` : ''}`}
                      >
                        <div style={{ display: 'flex', background: 'var(--bg-base)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                          <button onClick={() => setWinRateMode('withBE')} style={{ padding: '2px 6px', fontSize: '9px', fontWeight: 800, borderRadius: '6px', border: 'none', cursor: 'pointer', background: winRateMode === 'withBE' ? 'var(--accent-blue)' : 'transparent', color: winRateMode === 'withBE' ? 'white' : 'var(--text-dim)', transition: 'all 0.2s' }}>+BE</button>
                          <button onClick={() => setWinRateMode('withoutBE')} style={{ padding: '2px 6px', fontSize: '9px', fontWeight: 800, borderRadius: '6px', border: 'none', cursor: 'pointer', background: winRateMode === 'withoutBE' ? 'var(--accent-blue)' : 'transparent', color: winRateMode === 'withoutBE' ? 'white' : 'var(--text-dim)', transition: 'all 0.2s' }}>-BE</button>
                        </div>
                      </StatPill>
                      <StatPill label="Best Pair" value={bestPair ? bestPair[0] : '—'} color="var(--text-primary)" sub={bestPair ? (bestPair[1] >= 0 ? '+' : '') + '$' + bestPair[1].toFixed(2) : '—'} />
                      <StatPill label="Avg R:R" value={avgRR.toFixed(2) + 'R'} color="var(--text-primary)" sub="risk / reward" />
                    </div>

                    <DashboardVisuals
                      dashboardFilter={dashboardFilter} setDashboardFilter={setDashboardFilter}
                      dashboardSpecificDate={dashboardSpecificDate} setDashboardSpecificDate={setDashboardSpecificDate}
                      dashboardCustomStart={dashboardCustomStart} setDashboardCustomStart={setDashboardCustomStart}
                      dashboardCustomEnd={dashboardCustomEnd} setDashboardCustomEnd={setDashboardCustomEnd}
                      dashboardFilteredTrades={dashboardFilteredTrades} biasWord={biasWord} biasColor={biasColor} biasDesc={biasDesc}
                      bullPct={bullPct} bearPct={bearPct} longs={longs} shorts={shorts} bestDay={bestDay} dayStats={dayStats}
                      maxBarVal={maxBarVal} assetRows={assetRows} sessionMap={sessionMap}
                    />
                  </>
                )}

                {activeTab === 'Trading History' && <TradeHistoryTab trades={trades} setTrades={setTrades} setSelectedTradeDetail={setSelectedTradeDetail} openModal={openModal} handleDeleteClick={handleDeleteClick} setViewingContext={setViewingContext} />}
                {activeTab === 'Images of your trades' && <TradeGalleryTab galleryTrades={galleryTrades} galleryDateFilter={galleryDateFilter} setGalleryDateFilter={setGalleryDateFilter} galleryResultFilter={galleryResultFilter} setGalleryResultFilter={setGalleryResultFilter} setViewingContext={setViewingContext} />}
                {activeTab === 'Trading Statistics' && <TradingStatistics trades={trades} tod={tod} firstName={firstName} onTradeClick={(t) => setSelectedTradeDetail(t)} />}
                {activeTab === 'AI Trading Coach' && <AICoachTab chatMessages={chatMessages} chatInput={chatInput} setChatInput={setChatInput} handleSendChat={handleSendChat} isChatLoading={isChatLoading} chatEndRef={chatEndRef} />}
                {activeTab === 'MT5 Sync' && <MT5SyncTab trades={trades} setTrades={setTrades} auth={auth} />}
              </div>
            )}
          </div>
        </div>
      </div>

      {tradeToDelete && (
        <div onClick={e => { if (e.target === e.currentTarget) setTradeToDelete(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-panel)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.14)', width: '400px', maxWidth: '90vw', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '20px' }}>⚠️</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>Delete Trade Log?</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.5 }}>This action cannot be undone. This trade will be permanently removed from your statistics.</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '32px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
              <input type="checkbox" checked={skipDeleteConfirm} onChange={e => setSkipDeleteConfirm(e.target.checked)} style={{ accentColor: 'var(--accent-red)', width: '16px', height: '16px', cursor: 'pointer' }} />
              Don't ask me again
            </label>
            <div style={{ display: 'flex', width: '100%', gap: '12px' }}>
              <Btn style={{ flex: 1, justifyContent: 'center' }} onClick={() => setTradeToDelete(null)}>Cancel</Btn>
              <Btn danger style={{ flex: 1, justifyContent: 'center' }} onClick={() => confirmDelete(tradeToDelete)}>Delete</Btn>
            </div>
          </div>
        </div>
      )}

      <JournalModals
        viewingContext={viewingContext} setViewingContext={setViewingContext}
        tradeToDelete={tradeToDelete} setTradeToDelete={setTradeToDelete}
        skipDeleteConfirm={skipDeleteConfirm} setSkipDeleteConfirm={setSkipDeleteConfirm}
        confirmDelete={confirmDelete} showSuccessModal={showSuccessModal}
        setShowSuccessModal={setShowSuccessModal} successQuote={successQuote}
        lastLoggedTrade={lastLoggedTrade} openModal={openModal}
      />
    </div>
  )
}