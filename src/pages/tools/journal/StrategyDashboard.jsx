import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../../store/auth/useAuthStore'
import { supabase } from '../../../utils/supabase'
import { useStrategies } from './hooks/useStrategies'
import { getTradeResult, calcPnl } from '../../../utils/tradeMetrics'
import { Btn } from '../../../components/ui/BaseComponents.jsx'

export default function StrategyDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAuthStore()
  const { strategies, loading, createStrategy, updateStrategy, deleteStrategy } = useStrategies(auth)
  
  const [newStrat, setNewStrat] = useState({ name: '', target_rr: '', target_wr: '', asset: '', notes: '' })
  const [newProp, setNewProp] = useState({ name: '', type: '2-step', phase: '1', target: '', maxDD: '', dailyDD: '', accountSize: '', startDate: '' })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editingStrat, setEditingStrat] = useState(null)
  const [stratToDelete, setStratToDelete] = useState(null)
  const [allTrades, setAllTrades] = useState([])
  const [propMode, setPropMode] = useState(() => localStorage.getItem('mkt_sim_prop_mode') === 'true')

  const togglePropMode = () => {
    const next = !propMode
    setPropMode(next)
    localStorage.setItem('mkt_sim_prop_mode', next ? 'true' : 'false')
  }

  const isPropFirm = (strat) => strat.notes && strat.notes.includes('"isPropFirm":true')


  useEffect(() => {
    if (location.state?.propMode) {
      setPropMode(true)
      localStorage.setItem('mkt_sim_prop_mode', 'true')
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  useEffect(() => {
    if (!auth.user && !auth.isGuest) return
    async function fetchAllTrades() {
      if (auth.isGuest) {
        setAllTrades([])
        return
      }
      const { data } = await supabase.from('trades').select('*').eq('user_id', auth.user.id)
      if (data) setAllTrades(data)
    }
    fetchAllTrades()
  }, [auth.user, auth.isGuest])

  const strategyStats = useMemo(() => {
    const stats = {}
    strategies.forEach(s => {
      const sTrades = allTrades.filter(t => t.strategy_id === s.id)
      const wins = sTrades.filter(t => getTradeResult(t) === 'Win').length
      const losses = sTrades.filter(t => getTradeResult(t) === 'Loss').length
      const totalResolved = wins + losses
      const wr = totalResolved > 0 ? (wins / totalResolved) * 100 : 0
      
      let netPnl = 0
      sTrades.forEach(t => {
        const pnlObj = calcPnl(t)
        if (pnlObj && pnlObj.usd) {
          netPnl += pnlObj.usd
        }
      })
      
      stats[s.id] = { count: sTrades.length, actualWR: wr.toFixed(1), netPnl }
    })
    return stats
  }, [strategies, allTrades])

  const _meta = auth.user?.user_metadata || {}
  const firstName = _meta.first_name || _meta.given_name || _meta.full_name?.split(' ')[0] || _meta.name?.split(' ')[0] || 'Trader'

  const handleCreate = async () => {
    setCreating(true)
    let payload = {}

    if (propMode) {
      if (!newProp.name.trim()) { setCreating(false); return alert("Prop firm name is required") }
      payload = {
        name: newProp.name.trim(),
        target_rr: 0,
        target_wr: 0,
        asset: 'Prop Firm',
        notes: JSON.stringify({ isPropFirm: true, type: newProp.type, phase: newProp.phase, target: newProp.target, maxDD: newProp.maxDD, dailyDD: newProp.dailyDD, accountSize: newProp.accountSize, startDate: newProp.startDate })
      }
    } else {
      if (!newStrat.name.trim()) { setCreating(false); return alert("Strategy name is required") }
      payload = {
        name: newStrat.name.trim(),
        target_rr: parseFloat(newStrat.target_rr) || 0,
        target_wr: parseFloat(newStrat.target_wr) || 0,
        asset: newStrat.asset.trim() || 'Mixed',
        notes: newStrat.notes
      }
    }
    
    const { error } = await createStrategy(payload)
    setCreating(false)

    if (error) {
      alert("Error creating: " + error.message)
    } else {
      setShowCreateModal(false)
      setNewStrat({ name: '', target_rr: '', target_wr: '', asset: '', notes: '' })
      setNewProp({ name: '', type: '2-step', phase: '1', target: '', maxDD: '', dailyDD: '', accountSize: '', startDate: '' })
    }
  }

  const handleUpdate = async () => {
    setCreating(true)
    let payload = {}

    if (propMode) {
      if (!editingStrat.name.trim()) { setCreating(false); return alert("Name is required") }
      payload = {
        name: editingStrat.name.trim(),
        notes: JSON.stringify({ isPropFirm: true, type: editingStrat.type, phase: editingStrat.phase, target: editingStrat.target, maxDD: editingStrat.maxDD, dailyDD: editingStrat.dailyDD, accountSize: editingStrat.accountSize, startDate: editingStrat.startDate })
      }
    } else {
      if (!editingStrat.name.trim()) { setCreating(false); return alert("Strategy name is required") }
      payload = {
        name: editingStrat.name.trim(),
        target_rr: parseFloat(editingStrat.target_rr) || 0,
        target_wr: parseFloat(editingStrat.target_wr) || 0,
        asset: editingStrat.asset.trim() || 'Mixed',
        notes: editingStrat.notes
      }
    }

    const { error } = await updateStrategy(editingStrat.id, payload)
    setCreating(false)
    if (error) alert("Error updating: " + error.message)
    else setEditingStrat(null)
  }

  const handleDelete = async () => {
    const { error } = await deleteStrategy(stratToDelete)
    if (error) alert("Error deleting strategy: " + error.message)
    setStratToDelete(null)
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading strategies...</div>
  }

  const displayedStrategies = strategies.filter(s => propMode ? isPropFirm(s) : !isPropFirm(s))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-sans)', paddingTop: '64px' }}>

      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--bg-panel-alpha)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)', padding: '0 40px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => {
              localStorage.setItem('mkt_sim_prop_mode', 'false')
              navigate('/dashboard')
            }} style={{
            background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '7px 14px',
            fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L5 7L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg> Back
          </button>
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>MktSim</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-base)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: '999px' }}>Strategies</span>
        </div>

        <button onClick={togglePropMode} style={{
          fontSize: '12px', fontWeight: 600, padding: '7px 16px', borderRadius: '999px', cursor: 'pointer',
          background: propMode ? 'rgba(245,158,11,0.12)' : 'var(--bg-base)',
          border: propMode ? '1.5px solid rgba(245,158,11,0.35)' : '1.5px solid var(--border)',
          color: propMode ? 'var(--accent-yellow)' : 'var(--text-secondary)', transition: 'all .2s',
        }}>⚡ Prop Firm Mode{propMode ? ': ON' : ''}</button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '6px' }}>
            {propMode ? 'Your Prop Firm Accounts ⚡' : 'Your Trading Strategies 🎯'}
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {propMode 
              ? 'Manage your challenges, evaluations, and funded accounts all in one place.' 
              : 'Select a strategy to view its journal, or create a new one to test a different approach.'}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          
          {/* CREATE NEW STRATEGY CARD */}
          <div 
            onClick={() => setShowCreateModal(true)}
            style={{
              background: 'rgba(59, 130, 246, 0.05)',
              border: '2px dashed rgba(59, 130, 246, 0.3)',
              borderRadius: '24px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minHeight: '220px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)'
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'
            }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-blue)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 300, marginBottom: '16px'
            }}>+</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-blue)' }}>
              {propMode ? 'New Account' : 'New Strategy'}
            </div>
          </div>

          {/* STRATEGY CARDS */}
          {displayedStrategies.map((strat, idx) => {
            const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4']
            const color = colors[idx % colors.length]
            const stats = strategyStats[strat.id] || { count: 0, actualWR: 0, netPnl: 0 }
            
            return (
              <div 
                key={strat.id}
                onClick={() => navigate(`/tools/journal/${strat.id}`)}
                style={{
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border)',
                  borderRadius: '24px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '220px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)'
                  e.currentTarget.style.borderColor = color
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: color }} />
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {strat.name}
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 800, color: stats.netPnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', marginTop: '8px', letterSpacing: '-1px' }}>
                        {stats.netPnl >= 0 ? '+' : ''}${Math.abs(stats.netPnl).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px', letterSpacing: '0.5px' }}>Total Net P&L</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (propMode) {
                            const pData = JSON.parse(strat.notes)
                            setEditingStrat({ ...strat, ...pData })
                          } else {
                            setEditingStrat(strat); 
                          }
                        }}
                        style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-base)'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setStratToDelete(strat.id); }}
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--accent-red)', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </div>
                  </div>
                  
                  {(!propMode && strat.notes) && (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontStyle: 'italic', lineHeight: 1.5, background: 'var(--bg-base)', padding: '10px 14px', borderRadius: '8px', borderLeft: `3px solid ${color}` }}>
                      "{strat.notes}"
                    </div>
                  )}
                  
                  {propMode ? (() => {
                    const propData = JSON.parse(strat.notes)
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' }}>
                        <div style={{ background: 'var(--bg-base)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>💰 Target</div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-green)' }}>${parseFloat(propData.target).toLocaleString()}</div>
                        </div>
                        <div style={{ background: 'var(--bg-base)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>🛡️ Max DD</div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-red)' }}>${parseFloat(propData.maxDD).toLocaleString()}</div>
                        </div>
                        <div style={{ background: 'var(--bg-base)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>⚠️ Daily DD</div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-yellow)' }}>${parseFloat(propData.dailyDD).toLocaleString()}</div>
                        </div>
                        <div style={{ background: 'var(--bg-base)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>📈 Type</div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{propData.type} {propData.type === '2-step' ? `(Ph ${propData.phase})` : ''}</div>
                        </div>
                      </div>
                    )
                  })() : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' }}>
                      <div style={{ background: 'var(--bg-base)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          💼 Trades
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.count} <span style={{fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)'}}>logged</span></div>
                      </div>

                      <div style={{ background: 'var(--bg-base)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🏆 Win Rate
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: stats.actualWR >= (strat.target_wr || 0) ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                          {stats.actualWR}%
                          <span style={{fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginLeft: '4px'}}>
                            / {strat.target_wr || 0}%
                          </span>
                        </div>
                      </div>

                      <div style={{ background: 'var(--bg-base)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🎯 Target R:R
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{strat.target_rr ? `${strat.target_rr}R` : '—'}</div>
                      </div>

                      <div style={{ background: 'var(--bg-base)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          📊 Asset
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{strat.asset || 'Mixed'}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
                     {strat.created_at ? `Created ${new Date(strat.created_at).toLocaleDateString()}` : 'Active Strategy'}
                   </span>
                   <span style={{ fontSize: '13px', color: color, fontWeight: 700 }}>Open Journal →</span>
                </div>
              </div>
            )
          })}

        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: 'var(--bg-panel)', width: '100%', maxWidth: '440px', borderRadius: '24px', padding: '32px', border: '1px solid var(--border)', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              {propMode ? 'New Prop Firm Account' : 'Create New Strategy'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {propMode ? 'Enter the details and rules for your evaluation or funded account.' : 'Define the parameters and goals for this specific strategy.'}
            </p>
            
            {propMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Prop Firm Name <span style={{color: 'var(--accent-red)'}}>*</span></label>
                  <input type="text" value={newProp.name} onChange={e => setNewProp({...newProp, name: e.target.value})} placeholder="e.g. FTMO, Topstep" style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Account Type</label>
                    <select value={newProp.type} onChange={e => setNewProp({...newProp, type: e.target.value})} style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }}>
                      <option value="2-step">2-Step Eval</option>
                      <option value="1-step">1-Step Eval</option>
                      <option value="instant">Instant Funding</option>
                    </select>
                  </div>
                  {newProp.type === '2-step' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Phase</label>
                      <select value={newProp.phase} onChange={e => setNewProp({...newProp, phase: e.target.value})} style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }}>
                        <option value="1">Phase 1</option>
                        <option value="2">Phase 2</option>
                      </select>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Profit Target ($)</label>
                  <input type="number" value={newProp.target} onChange={e => setNewProp({...newProp, target: e.target.value})} placeholder="e.g. 5000" style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Max DD ($)</label>
                    <input type="number" value={newProp.maxDD} onChange={e => setNewProp({...newProp, maxDD: e.target.value})} placeholder="e.g. 10000" style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Daily DD ($)</label>
                    <input type="number" value={newProp.dailyDD} onChange={e => setNewProp({...newProp, dailyDD: e.target.value})} placeholder="e.g. 5000" style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Account Size ($)</label>
                    <input type="number" value={newProp.accountSize} onChange={e => setNewProp({...newProp, accountSize: e.target.value})} placeholder="e.g. 50000" style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Start Date</label>
                    <input type="date" value={newProp.startDate} onChange={e => setNewProp({...newProp, startDate: e.target.value})} style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Strategy Name <span style={{color: 'var(--accent-red)'}}>*</span></label>
                  <input 
                    type="text" 
                    value={newStrat.name} 
                    onChange={e => setNewStrat({...newStrat, name: e.target.value})}
                    placeholder="e.g. London Breakout"
                    style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Target R:R</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={newStrat.target_rr} 
                      onChange={e => setNewStrat({...newStrat, target_rr: e.target.value})}
                      placeholder="e.g. 2.5"
                      style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Target Win Rate (%)</label>
                    <input 
                      type="number" 
                      value={newStrat.target_wr} 
                      onChange={e => setNewStrat({...newStrat, target_wr: e.target.value})}
                      placeholder="e.g. 55"
                      style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Asset / Pair</label>
                  <input 
                    type="text" 
                    value={newStrat.asset} 
                    onChange={e => setNewStrat({...newStrat, asset: e.target.value})}
                    placeholder="e.g. EURUSD, Crypto, Mixed"
                    style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Strategy Rules & Notes</label>
                  <textarea 
                    value={newStrat.notes || ''} 
                    onChange={e => setNewStrat({...newStrat, notes: e.target.value})}
                    placeholder="Define your strategy rules, confluences, setup requirements..."
                    style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none', minHeight: '80px', resize: 'vertical', fontFamily: 'var(--font-sans)' }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <Btn style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowCreateModal(false)}>Cancel</Btn>
              <Btn primary style={{ flex: 1, justifyContent: 'center' }} onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating...' : (propMode ? 'Create Account' : 'Create Strategy')}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingStrat && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: 'var(--bg-panel)', width: '100%', maxWidth: '440px', borderRadius: '24px', padding: '32px', border: '1px solid var(--border)', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              {propMode ? 'Edit Prop Firm Account' : 'Edit Strategy'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {propMode ? 'Update your account parameters.' : 'Update the parameters, goals, or rules for this strategy.'}
            </p>
            
            {propMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Prop Firm Name <span style={{color: 'var(--accent-red)'}}>*</span></label>
                  <input type="text" value={editingStrat.name} onChange={e => setEditingStrat({...editingStrat, name: e.target.value})} style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Account Type</label>
                    <select value={editingStrat.type} onChange={e => setEditingStrat({...editingStrat, type: e.target.value})} style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }}>
                      <option value="2-step">2-Step Eval</option>
                      <option value="1-step">1-Step Eval</option>
                      <option value="instant">Instant Funding</option>
                    </select>
                  </div>
                  {editingStrat.type === '2-step' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Phase</label>
                      <select value={editingStrat.phase} onChange={e => setEditingStrat({...editingStrat, phase: e.target.value})} style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }}>
                        <option value="1">Phase 1</option>
                        <option value="2">Phase 2</option>
                      </select>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Profit Target ($)</label>
                  <input type="number" value={editingStrat.target} onChange={e => setEditingStrat({...editingStrat, target: e.target.value})} style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Max DD ($)</label>
                    <input type="number" value={editingStrat.maxDD} onChange={e => setEditingStrat({...editingStrat, maxDD: e.target.value})} style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Daily DD ($)</label>
                    <input type="number" value={editingStrat.dailyDD} onChange={e => setEditingStrat({...editingStrat, dailyDD: e.target.value})} style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }} />
  
                </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Account Size ($)</label>
                    <input type="number" value={editingStrat.accountSize} onChange={e => setEditingStrat({...editingStrat, accountSize: e.target.value})} style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Start Date</label>
                    <input type="date" value={editingStrat.startDate} onChange={e => setEditingStrat({...editingStrat, startDate: e.target.value})} style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Strategy Name <span style={{color: 'var(--accent-red)'}}>*</span></label>
                  <input type="text" value={editingStrat.name} onChange={e => setEditingStrat({...editingStrat, name: e.target.value})} placeholder="e.g. London Breakout" style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Target R:R</label>
                    <input type="number" step="0.1" value={editingStrat.target_rr} onChange={e => setEditingStrat({...editingStrat, target_rr: e.target.value})} placeholder="e.g. 2.5" style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Target Win Rate (%)</label>
                    <input type="number" value={editingStrat.target_wr} onChange={e => setEditingStrat({...editingStrat, target_wr: e.target.value})} placeholder="e.g. 55" style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Asset / Pair</label>
                  <input type="text" value={editingStrat.asset} onChange={e => setEditingStrat({...editingStrat, asset: e.target.value})} placeholder="e.g. EURUSD, Crypto, Mixed" style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Strategy Rules & Notes</label>
                  <textarea value={editingStrat.notes || ''} onChange={e => setEditingStrat({...editingStrat, notes: e.target.value})} placeholder="Define your strategy rules, confluences, setup requirements..." style={{ width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none', minHeight: '80px', resize: 'vertical', fontFamily: 'var(--font-sans)' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <Btn style={{ flex: 1, justifyContent: 'center' }} onClick={() => setEditingStrat(null)}>Cancel</Btn>
              <Btn primary style={{ flex: 1, justifyContent: 'center' }} onClick={handleUpdate} disabled={creating}>{creating ? 'Updating...' : 'Save Changes'}</Btn>
            </div>
          </div>
        </div>
      )}

      {/* DELETE WARNING MODAL */}
      {stratToDelete && (
        <div onClick={e => { if (e.target === e.currentTarget) setStratToDelete(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-panel)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.14)', width: '400px', maxWidth: '90vw', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '20px' }}>⚠️</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>Delete this Strategy?</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.5 }}>
              This will permanently delete the strategy AND <strong>ALL</strong> trades associated with it. This action cannot be undone.
            </div>
            <div style={{ display: 'flex', width: '100%', gap: '12px' }}>
              <Btn style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStratToDelete(null)}>Cancel</Btn>
              <Btn danger style={{ flex: 1, justifyContent: 'center' }} onClick={handleDelete}>Delete Everything</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
