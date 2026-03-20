import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

const TOOLS = [
  {
    id: 'basic-simulator',
    title: 'Basic Market Movements by Orders',
    description: 'Simulate real order book mechanics. Execute market and limit orders, watch price move, and understand how liquidity drives markets.',
    icon: '📈',
    tag: 'Simulator',
    tagColor: '#3b82f6',
    available: true,
    route: '/tools/basic-simulator',
  },
  {
    id: 'liquidity-heatmap',
    title: 'Liquidity Heatmap',
    description: 'Visualize volume at every price level. See where institutional orders are concentrated and where price is likely to react.',
    icon: '🔥',
    tag: 'Coming Soon',
    tagColor: '#f59e0b',
    available: false,
  },
  {
    id: 'trade-journal',
    title: 'Trade Journal',
    description: 'Log every trade with full context. Track your R, win rate, and edge over time with automatic statistics.',
    icon: '📓',
    tag: 'Coming Soon',
    tagColor: '#f59e0b',
    available: false,
  },
  {
    id: 'institutional-replayer',
    title: 'Institutional Strategy Replayer',
    description: 'Step through famous institutional moves. Accumulation, distribution, stop hunts and liquidity sweeps explained visually.',
    icon: '🏦',
    tag: 'Coming Soon',
    tagColor: '#f59e0b',
    available: false,
  },
  {
    id: 'setup-scanner',
    title: 'Setup Scanner',
    description: 'Define your exact entry rules and scan for them automatically. Backtest your setup with objective criteria.',
    icon: '🔬',
    tag: 'Coming Soon',
    tagColor: '#f59e0b',
    available: false,
  },
  {
    id: 'stats-dashboard',
    title: 'Statistics Dashboard',
    description: 'All your journal data visualized. Expectancy, drawdown, win streaks, best and worst setups — everything in one view.',
    icon: '📊',
    tag: 'Coming Soon',
    tagColor: '#f59e0b',
    available: false,
  },
]

export default function Dashboard() {
  const auth = useAuthStore()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const firstName = auth.user?.user_metadata?.first_name || 'Trader'

  async function handleLogout() {
    setLoggingOut(true)
    await auth.signOut()
    navigate('/')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      fontFamily: 'var(--font-sans)',
    }}>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 40px',
        height: '64px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: '22px', fontWeight: 800,
          color: 'var(--accent-blue)', letterSpacing: '-0.5px',
        }}>
          MktSim
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* User pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '999px',
            padding: '6px 16px 6px 8px',
          }}>
            <div style={{
              width: '28px', height: '28px',
              borderRadius: '50%',
              background: 'var(--accent-blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: '#fff',
            }}>
              {firstName[0].toUpperCase()}
            </div>
            <span style={{
              fontSize: '14px', fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              {firstName}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              background: 'transparent',
              border: '1.5px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '8px 18px', borderRadius: '10px',
              fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#ef4444'
              e.currentTarget.style.color = '#ef4444'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </button>
        </div>
      </nav>

      {/* Page content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 40px',
      }}>

        {/* Welcome */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px', fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-1px', marginBottom: '8px',
          }}>
            Welcome back, {firstName} 👋
          </h1>
          <p style={{
            fontSize: '15px', color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}>
            Choose a tool below to start learning. More tools are being added regularly.
          </p>
        </div>

        {/* Tool grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {TOOLS.map(tool => (
            <div
              key={tool.id}
              onClick={() => tool.available && navigate(tool.route)}
              style={{
                background: 'var(--bg-panel)',
                borderRadius: '20px',
                border: `1px solid ${tool.available ? 'var(--border)' : 'var(--border)'}`,
                padding: '28px',
                cursor: tool.available ? 'pointer' : 'default',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden',
                opacity: tool.available ? 1 : 0.6,
              }}
              onMouseEnter={e => {
                if (!tool.available) return
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                e.currentTarget.style.borderColor = 'var(--accent-blue)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              {/* Lock overlay for coming soon */}
              {!tool.available && (
                <div style={{
                  position: 'absolute',
                  top: '16px', right: '16px',
                  fontSize: '18px',
                }}>
                  🔒
                </div>
              )}

              {/* Icon */}
              <div style={{
                fontSize: '40px',
                marginBottom: '18px',
                filter: tool.available ? 'none' : 'grayscale(60%)',
              }}>
                {tool.icon}
              </div>

              {/* Tag */}
              <div style={{
                display: 'inline-block',
                background: tool.available
                  ? 'rgba(59,130,246,0.08)'
                  : 'rgba(245,158,11,0.08)',
                color: tool.tagColor,
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                marginBottom: '12px',
                border: `1px solid ${tool.available
                  ? 'rgba(59,130,246,0.15)'
                  : 'rgba(245,158,11,0.15)'}`,
              }}>
                {tool.tag}
              </div>

              {/* Title */}
              <div style={{
                fontSize: '16px', fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '10px',
                lineHeight: 1.3,
              }}>
                {tool.title}
              </div>

              {/* Description */}
              <div style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
              }}>
                {tool.description}
              </div>

              {/* Arrow for available tools */}
              {tool.available && (
                <div style={{
                  marginTop: '20px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  color: 'var(--accent-blue)',
                  fontSize: '13px', fontWeight: 700,
                }}>
                  Open Tool →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}