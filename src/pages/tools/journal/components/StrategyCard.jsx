import { useNavigate } from 'react-router-dom'

const COLORS = ['#3B82F6','#10B981','#8B5CF6','#F59E0B','#EF4444','#EC4899','#06B6D4']

// ── Prop firm stats mini-grid ──────────────────────────────────────────────────
function PropGrid({ propData }) {
  const Cell = ({ icon, label, value, color }) => (
    <div style={{ background: 'var(--bg-base)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>{icon} {label}</div>
      <div style={{ fontSize: '16px', fontWeight: 800, color }}>${parseFloat(propData[value] || 0).toLocaleString()}</div>
    </div>
  )
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' }}>
      <Cell icon="💰" label="Target"   value="target"  color="var(--accent-green)" />
      <Cell icon="🛡️" label="Max DD"  value="maxDD"   color="var(--accent-red)" />
      <Cell icon="⚠️" label="Daily DD" value="dailyDD" color="var(--accent-yellow)" />
      <div style={{ background: 'var(--bg-base)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>📈 Type</div>
        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
          {propData.type} {propData.type === '2-step' ? `(Ph ${propData.phase})` : ''}
        </div>
      </div>
    </div>
  )
}

// ── Strategy stats mini-grid ──────────────────────────────────────────────────
function StratGrid({ strat, stats, color }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' }}>
      <div style={{ background: 'var(--bg-base)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>💼 Trades</div>
        <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.count} <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)' }}>logged</span></div>
      </div>
      <div style={{ background: 'var(--bg-base)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>🏆 Win Rate</div>
        <div style={{ fontSize: '18px', fontWeight: 800, color: stats.actualWR >= (strat.target_wr || 0) ? 'var(--accent-green)' : 'var(--text-primary)' }}>
          {stats.actualWR}%<span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginLeft: '4px' }}>/ {strat.target_wr || 0}%</span>
        </div>
      </div>
      <div style={{ background: 'var(--bg-base)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>🎯 Target R:R</div>
        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{strat.target_rr ? `${strat.target_rr}R` : '—'}</div>
      </div>
      <div style={{ background: 'var(--bg-base)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>📊 Asset</div>
        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{strat.asset || 'Mixed'}</div>
      </div>
    </div>
  )
}

// ── Main card component ────────────────────────────────────────────────────────
export default function StrategyCard({ strat, idx, stats = { count: 0, actualWR: 0, netPnl: 0 }, propMode, onEdit, onDelete }) {
  const navigate = useNavigate()
  const color = COLORS[idx % COLORS.length]
  let propData = null
  if (propMode) { try { propData = JSON.parse(strat.notes) } catch(e) {} }

  return (
    <div
      onClick={() => navigate(`/tools/journal/${strat.id}`)}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = color }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = 'var(--border)' }}
      style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '24px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', minHeight: '220px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: color }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{strat.name}</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: stats.netPnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', marginTop: '8px', letterSpacing: '-1px' }}>
              {stats.netPnl >= 0 ? '+' : ''}${Math.abs(stats.netPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px', letterSpacing: '0.5px' }}>Total Net P&L</div>
          </div>

          {/* Edit / Delete buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={e => { e.stopPropagation(); onEdit(strat, propData) }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-base)'}
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(strat.id) }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--accent-red)', transition: 'all 0.2s' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </div>

        {/* Notes snippet (strategy mode only) */}
        {(!propMode && strat.notes) && (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontStyle: 'italic', lineHeight: 1.5, background: 'var(--bg-base)', padding: '10px 14px', borderRadius: '8px', borderLeft: `3px solid ${color}` }}>
            "{strat.notes}"
          </div>
        )}

        {propMode && propData ? <PropGrid propData={propData} /> : !propMode && <StratGrid strat={strat} stats={stats} color={color} />}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
          {strat.created_at ? `Created ${new Date(strat.created_at).toLocaleDateString()}` : 'Active Strategy'}
        </span>
        <span style={{ fontSize: '13px', color, fontWeight: 700 }}>Open Journal →</span>
      </div>
    </div>
  )
}
