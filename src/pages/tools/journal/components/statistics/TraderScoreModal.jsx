import { Card } from './StatUIComponents'

export default function TraderScoreModal({ showScoreInfo, setShowScoreInfo }) {
  if (!showScoreInfo) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }} onClick={() => setShowScoreInfo(false)}>
      <Card style={{ 
        maxWidth: '450px', width: '100%', padding: '32px', 
        position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        border: '1px solid rgba(59,130,246,0.3)',
        background: 'var(--bg-panel)'
      }} onClick={e => e.stopPropagation()}>
        <button 
          onClick={() => setShowScoreInfo(false)}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', color: 'var(--text-dim)',
            fontSize: '18px', cursor: 'pointer', padding: '4px'
          }}
        >✕</button>

        <div style={{ fontSize: '28px', marginBottom: '16px' }}>🎯</div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          What is the Trader Score?
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
          The Trader Score is a simple 0-100 rating that looks at your overall performance. It doesn't just look at how much you win, but <strong>how</strong> you win.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--bg-base)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>How it's calculated</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              We average 5 key parts: <strong>Win Rate</strong>, <strong>Profit Factor</strong>, <strong>Execution Consistency (Volume)</strong>, <strong>Risk Discipline</strong>, and <strong>Risk-to-Reward Ratio</strong>.
            </p>
          </div>

          <div style={{ background: 'var(--bg-base)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Example</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
              "If you win 5 out of 10 trades, but your wins are twice as big as your losses and you trade consistently every week, you'll likely have a score above 85."
            </p>
          </div>
        </div>

        <button 
          onClick={() => setShowScoreInfo(false)}
          style={{
            width: '100%', padding: '12px', borderRadius: '12px',
            background: 'var(--accent-blue)', color: 'white',
            border: 'none', fontWeight: 700, fontSize: '14px',
            cursor: 'pointer', transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Got it!
        </button>
      </Card>
    </div>
  )
}
