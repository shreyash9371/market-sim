export default function DeepDive() {
  return (
    <section className="deep-dive-section" style={{
      padding: '100px 24px',
      background: 'var(--bg-panel)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)'
    }}>
      <div className="deep-dive-container" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px' }}>
          <h2 className="section-title" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '24px', letterSpacing: '-1px' }}>
            Your Edge, <span style={{ color: '#10b981' }}>Quantified.</span>
          </h2>
          <p className="section-subtitle" style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '32px' }}>
            The brand new Trading Statistics dashboard turns your logs into powerful actionable insights. Stop guessing why you are losing and let the data reveal your optimal trading days, assets, and setups.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['Interactive Account Balance Equity Curve', 'Daily & Monthly Profitability Heatmaps', 'Radar Charts identifying your weak points', 'Beautiful Confetti celebrations for profitable trades'].map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: 500 }}>
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '12px'
                }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flex: '1 1 500px', position: 'relative' }}>
          <div className="radar-box" style={{
            width: '100%', height: '400px', background: 'var(--bg-card)',
            borderRadius: '24px', border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden'
          }}>
            {/* Abstract Radar Chart Mockup */}
            <svg width="200" height="200" viewBox="0 0 200 200">
              <polygon points="100,20 180,60 180,140 100,180 20,140 20,60" fill="none" stroke="var(--border)" strokeWidth="1" />
              <polygon points="100,40 160,75 160,125 100,160 40,125 40,75" fill="none" stroke="var(--border)" strokeWidth="1" />
              <polygon points="100,60 140,85 140,115 100,140 60,115 60,85" fill="none" stroke="var(--border)" strokeWidth="1" />
              <polygon points="100,10 170,70 140,150 100,170 50,130 40,50" fill="rgba(59,130,246,0.2)" stroke="var(--accent-blue)" strokeWidth="2" style={{ animation: 'pulseGlow 4s infinite' }} />
              {/* Hub points */}
              <circle cx="100" cy="10" r="4" fill="var(--accent-blue)" />
              <circle cx="170" cy="70" r="4" fill="var(--accent-blue)" />
              <circle cx="140" cy="150" r="4" fill="var(--accent-blue)" />
              <circle cx="100" cy="170" r="4" fill="var(--accent-blue)" />
              <circle cx="50" cy="130" r="4" fill="var(--accent-blue)" />
              <circle cx="40" cy="50" r="4" fill="var(--accent-blue)" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
