import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AuthPanel from '../components/AuthPanel'
import { useAuthStore } from '../store/useAuthStore'

export default function LandingPage() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [defaultTab, setDefaultTab] = useState('login')
  const [searchParams] = useSearchParams()
  const wasKicked = searchParams.get('kicked') === 'true'
  const auth = useAuthStore()
  const navigate = useNavigate()

  if (auth.user && auth.approved) {
    navigate('/dashboard')
    return null
  }

  function openLogin() {
    setDefaultTab('login')
    setPanelOpen(true)
  }

  function openSignup() {
    setDefaultTab('signup')
    setPanelOpen(true)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      fontFamily: 'var(--font-sans)',
      overflowX: 'hidden',
    }}>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 40px',
        height: '64px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: '24px', fontWeight: 800,
          color: 'var(--accent-blue)', letterSpacing: '-0.5px',
        }}>
          MktSim
        </span>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={openLogin} style={{
            background: 'transparent',
            border: '1.5px solid var(--border)',
            color: 'var(--text-primary)',
            padding: '9px 22px', borderRadius: '10px',
            fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: 'var(--font-sans)',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent-blue)'
              e.currentTarget.style.color = 'var(--accent-blue)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
          >
            Log In
          </button>
          <button onClick={openSignup} style={{
            background: 'var(--accent-blue)',
            border: 'none', color: '#fff',
            padding: '9px 22px', borderRadius: '10px',
            fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 2px 10px rgba(59,130,246,0.3)',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-blue)'}
          >
            Sign Up Free
          </button>
        </div>
      </nav>

      {/* Kicked out banner */}
      {wasKicked && (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          padding: '14px 40px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          color: '#ef4444',
          fontWeight: 500,
        }}>
          <span>⚠️</span>
          <span>
            You were logged out because your account was accessed from another device.
            Your credentials may have been shared. Please change your password.
          </span>
        </div>
      )}

      {/* Hero */}
      <section style={{
        padding: '100px 40px 80px',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '999px',
          padding: '6px 16px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--accent-blue)',
          marginBottom: '28px',
          letterSpacing: '0.3px',
        }}>
          Free to use · No credit card required
        </div>

        <h1 style={{
          fontSize: '58px', fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1.1, letterSpacing: '-2px',
          marginBottom: '24px',
        }}>
          Understand How
          <span style={{ color: 'var(--accent-blue)', display: 'block' }}>
            Markets Really Move
          </span>
        </h1>

        <p style={{
          fontSize: '18px', color: 'var(--text-secondary)',
          lineHeight: 1.7, marginBottom: '40px',
          maxWidth: '580px', margin: '0 auto 40px',
        }}>
          Simulate real order flow, liquidity sweeps and institutional
          movements. Learn market mechanics by doing, not just watching.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={openSignup} style={{
            background: 'var(--accent-blue)', border: 'none',
            color: '#fff', padding: '14px 36px',
            borderRadius: '12px', fontSize: '16px', fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 4px 20px rgba(59,130,246,0.35)',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-blue)'}
          >
            Get Started Free →
          </button>
          <button onClick={openLogin} style={{
            background: '#fff', border: '1.5px solid var(--border)',
            color: 'var(--text-primary)', padding: '14px 36px',
            borderRadius: '12px', fontSize: '16px', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: 'var(--font-sans)',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            Log In
          </button>
        </div>
      </section>

      {/* Feature cards */}
      <section style={{
        padding: '0 40px 100px',
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
      }}>
        {[
          {
            icon: '📈',
            title: 'Real Order Book Simulation',
            desc: 'See exactly how bid and ask orders interact. Watch price move as market orders consume liquidity level by level.',
          },
          {
            icon: '🏦',
            title: 'Institutional Strategies',
            desc: 'Simulate accumulation, distribution, liquidity sweeps and stop hunts. Understand what really moves markets.',
          },
          {
            icon: '⏪',
            title: 'Replay and Learn',
            desc: 'Step forward and backward through every execution. Analyze each decision without risking real money.',
          },
          {
            icon: '✏️',
            title: 'Drawing Tools',
            desc: 'Mark trendlines and key levels directly on the chart. Pan and zoom like a professional trading platform.',
          },
          {
            icon: '📊',
            title: 'Volume Zones',
            desc: 'High liquidity levels highlight automatically on the chart. See where price is likely to slow or reverse.',
          },
          {
            icon: '🔬',
            title: 'More Tools Coming',
            desc: 'Trade journal, statistics dashboard, setup scanner and more. Everything a serious trader needs in one place.',
          },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{
            background: 'var(--bg-panel)',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)',
            transition: 'transform 0.2s, box-shadow 0.2s',
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
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>{icon}</div>
            <div style={{
              fontSize: '16px', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: '10px',
            }}>
              {title}
            </div>
            <div style={{
              fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65,
            }}>
              {desc}
            </div>
          </div>
        ))}
      </section>

      {/* CTA Banner */}
      <section style={{
        margin: '0 auto 80px',
        background: 'var(--accent-blue)',
        borderRadius: '20px',
        padding: '60px 40px',
        textAlign: 'center',
        maxWidth: '1020px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        <h2 style={{
          fontSize: '36px', fontWeight: 800,
          color: '#fff', marginBottom: '16px', letterSpacing: '-1px',
        }}>
          Start simulating for free
        </h2>
        <p style={{
          fontSize: '16px', color: 'rgba(255,255,255,0.8)',
          marginBottom: '32px', lineHeight: 1.6,
        }}>
          No credit card. No download. Just open the browser and start learning.
        </p>
        <button onClick={openSignup} style={{
          background: '#fff', border: 'none',
          color: 'var(--accent-blue)',
          padding: '14px 40px', borderRadius: '12px',
          fontSize: '16px', fontWeight: 700,
          cursor: 'pointer', transition: 'all 0.2s',
          fontFamily: 'var(--font-sans)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Create Free Account →
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '32px 40px',
        borderTop: '1px solid var(--border)',
        fontSize: '13px',
        color: 'var(--text-dim)',
      }}>
        © 2025 MktSim · Built for traders who want to understand markets deeply
      </footer>

      <AuthPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        defaultTab={defaultTab}
      />
    </div>
  )
}