import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../../store/auth/useAuthStore'
import { supabase } from '../../../utils/supabase'
import { useStrategies } from './hooks/useStrategies'
import { getTradeResult, calcPnl } from '../../../utils/tradeMetrics'

import StrategyCard from './components/StrategyCard'
import StrategyCreateModal from './components/StrategyCreateModal'
import { EditModal, DeleteModal } from './components/StrategyEditModal'

export default function StrategyDashboard() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const auth      = useAuthStore()
  const { strategies, loading, createStrategy, updateStrategy, deleteStrategy } = useStrategies(auth)

  // ── state ──────────────────────────────────────────────────────────────────
  const [newStrat,        setNewStrat]        = useState({ name: '', target_rr: '', target_wr: '', asset: '', notes: '' })
  const [newProp,         setNewProp]         = useState({ name: '', type: '2-step', phase: '1', target: '', maxDD: '', dailyDD: '', accountSize: '', startDate: '' })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating,        setCreating]        = useState(false)
  const [editingStrat,    setEditingStrat]    = useState(null)
  const [stratToDelete,   setStratToDelete]   = useState(null)
  const [allTrades,       setAllTrades]       = useState([])
  const [propMode,        setPropMode]        = useState(() => localStorage.getItem('mkt_sim_prop_mode') === 'true')

  const togglePropMode = () => {
    const next = !propMode
    setPropMode(next)
    localStorage.setItem('mkt_sim_prop_mode', next ? 'true' : 'false')
  }
  const isPropFirm = s => s.notes && s.notes.includes('"isPropFirm":true')

  // ── effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (location.state?.propMode) {
      setPropMode(true)
      localStorage.setItem('mkt_sim_prop_mode', 'true')
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  useEffect(() => {
    if (!auth.user && !auth.isGuest) return
    if (auth.isGuest) { setAllTrades([]); return }
    supabase.from('trades').select('*').eq('user_id', auth.user.id).then(({ data }) => { if (data) setAllTrades(data) })
  }, [auth.user, auth.isGuest])

  // ── stats ──────────────────────────────────────────────────────────────────
  const strategyStats = useMemo(() => {
    const stats = {}
    strategies.forEach(s => {
      const sTrades = allTrades.filter(t => t.strategy_id === s.id)
      const wins    = sTrades.filter(t => getTradeResult(t) === 'Win').length
      const losses  = sTrades.filter(t => getTradeResult(t) === 'Loss').length
      const wr      = (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0
      const netPnl  = sTrades.reduce((sum, t) => sum + (calcPnl(t)?.usd || 0), 0)
      stats[s.id]   = { count: sTrades.length, actualWR: wr.toFixed(1), netPnl }
    })
    return stats
  }, [strategies, allTrades])

  // ── handlers ───────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    setCreating(true)
    let payload = {}
    if (propMode) {
      if (!newProp.name.trim()) { setCreating(false); return alert('Prop firm name is required') }
      payload = { name: newProp.name.trim(), target_rr: 0, target_wr: 0, asset: 'Prop Firm', notes: JSON.stringify({ isPropFirm: true, ...newProp }) }
    } else {
      if (!newStrat.name.trim()) { setCreating(false); return alert('Strategy name is required') }
      payload = { name: newStrat.name.trim(), target_rr: parseFloat(newStrat.target_rr) || 0, target_wr: parseFloat(newStrat.target_wr) || 0, asset: newStrat.asset.trim() || 'Mixed', notes: newStrat.notes }
    }
    const { error } = await createStrategy(payload)
    setCreating(false)
    if (error) { alert('Error creating: ' + error.message) } else {
      setShowCreateModal(false)
      setNewStrat({ name: '', target_rr: '', target_wr: '', asset: '', notes: '' })
      setNewProp({ name: '', type: '2-step', phase: '1', target: '', maxDD: '', dailyDD: '', accountSize: '', startDate: '' })
    }
  }

  const handleUpdate = async () => {
    setCreating(true)
    let payload = {}
    if (propMode) {
      if (!editingStrat.name.trim()) { setCreating(false); return alert('Name is required') }
      payload = { name: editingStrat.name.trim(), notes: JSON.stringify({ isPropFirm: true, type: editingStrat.type, phase: editingStrat.phase, target: editingStrat.target, maxDD: editingStrat.maxDD, dailyDD: editingStrat.dailyDD, accountSize: editingStrat.accountSize, startDate: editingStrat.startDate }) }
    } else {
      if (!editingStrat.name.trim()) { setCreating(false); return alert('Strategy name is required') }
      payload = { name: editingStrat.name.trim(), target_rr: parseFloat(editingStrat.target_rr) || 0, target_wr: parseFloat(editingStrat.target_wr) || 0, asset: editingStrat.asset.trim() || 'Mixed', notes: editingStrat.notes }
    }
    const { error } = await updateStrategy(editingStrat.id, payload)
    setCreating(false)
    if (error) alert('Error updating: ' + error.message)
    else setEditingStrat(null)
  }

  const handleDelete = async () => {
    const { error } = await deleteStrategy(stratToDelete)
    if (error) alert('Error deleting strategy: ' + error.message)
    setStratToDelete(null)
  }

  const handleEditOpen = (strat, propData) => {
    if (propMode && propData) setEditingStrat({ ...strat, ...propData })
    else setEditingStrat(strat)
  }

  // ── loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading strategies...</div>
  }

  const displayed = strategies.filter(s => propMode ? isPropFirm(s) : !isPropFirm(s))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-sans)', paddingTop: '64px' }}>

      {/* NAVBAR */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'var(--bg-panel-alpha)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => { localStorage.setItem('mkt_sim_prop_mode', 'false'); navigate('/dashboard') }}
            style={{ background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '7px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L5 7L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg> Back
          </button>
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>MktSim</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-base)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: '999px' }}>Strategies</span>
        </div>
        <button onClick={togglePropMode} style={{ fontSize: '12px', fontWeight: 600, padding: '7px 16px', borderRadius: '999px', cursor: 'pointer', background: propMode ? 'rgba(245,158,11,0.12)' : 'var(--bg-base)', border: propMode ? '1.5px solid rgba(245,158,11,0.35)' : '1.5px solid var(--border)', color: propMode ? 'var(--accent-yellow)' : 'var(--text-secondary)', transition: 'all .2s' }}>
          ⚡ Prop Firm Mode{propMode ? ': ON' : ''}
        </button>
      </nav>

      {/* PAGE */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '6px' }}>
            {propMode ? 'Your Prop Firm Accounts ⚡' : 'Your Trading Strategies 🎯'}
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {propMode ? 'Manage your challenges, evaluations, and funded accounts all in one place.' : 'Select a strategy to view its journal, or create a new one to test a different approach.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>

          {/* Add new card */}
          <div onClick={() => setShowCreateModal(true)}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.05)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)' }}
            style={{ background: 'rgba(59,130,246,0.05)', border: '2px dashed rgba(59,130,246,0.3)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', minHeight: '220px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 300, marginBottom: '16px' }}>+</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-blue)' }}>{propMode ? 'New Account' : 'New Strategy'}</div>
          </div>

          {/* Strategy cards */}
          {displayed.map((strat, idx) => (
            <StrategyCard
              key={strat.id}
              strat={strat} idx={idx}
              stats={strategyStats[strat.id]}
              propMode={propMode}
              onEdit={handleEditOpen}
              onDelete={setStratToDelete}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <StrategyCreateModal
          propMode={propMode}
          newStrat={newStrat} setNewStrat={setNewStrat}
          newProp={newProp}   setNewProp={setNewProp}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
          creating={creating}
        />
      )}
      {editingStrat && (
        <EditModal
          propMode={propMode}
          editingStrat={editingStrat} setEditingStrat={setEditingStrat}
          onUpdate={handleUpdate}
          creating={creating}
        />
      )}
      {stratToDelete && (
        <DeleteModal
          onCancel={() => setStratToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
