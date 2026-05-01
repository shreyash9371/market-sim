export default function MockupVisuals() {
  return (
    <section className="animate-fade-up delay-3" style={{
      maxWidth: '1200px', margin: '0 auto 120px', padding: '0 24px',
      position: 'relative', zIndex: 10
    }}>
      <div className="mockup-container" style={{
        position: 'relative',
        height: '460px', borderRadius: '24px',
        background: 'var(--bg-panel)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        display: 'flex'
      }}>
        {/* Mockup Left - Simulator */}
        <div className="mockup-left" style={{ flex: 1, padding: '40px', borderRight: '1px solid var(--border)', position: 'relative' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent-blue)' }}>●</span> Simulator Engine
          </h3>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ height: '140px', width: '40px', background: 'var(--accent-red)', opacity: 0.1, borderRadius: '4px' }}></div>
            <div style={{ height: '80px', width: '40px', background: 'var(--accent-green)', opacity: 0.2, borderRadius: '4px', alignSelf: 'flex-end' }}></div>
            <div style={{ height: '220px', width: '40px', background: 'var(--accent-green)', opacity: 0.4, borderRadius: '4px', alignSelf: 'flex-end' }}></div>
            <div style={{ height: '160px', width: '40px', background: 'var(--accent-red)', opacity: 0.3, borderRadius: '4px', alignSelf: 'flex-end' }}></div>
            <div style={{ height: '280px', width: '40px', background: 'var(--accent-green)', opacity: 0.8, borderRadius: '4px', alignSelf: 'flex-end', animation: 'float 6s infinite ease-in-out' }}></div>
          </div>
          <div style={{ height: '2px', background: 'var(--border)', width: '100%', marginBottom: '20px' }} />
          <div style={{ height: '20px', background: 'var(--bg-hover)', width: '60%', borderRadius: '4px', marginBottom: '8px' }} />
          <div style={{ height: '20px', background: 'var(--bg-hover)', width: '40%', borderRadius: '4px' }} />
        </div>

        {/* Mockup Right - Journal */}
        <div className="mockup-right" style={{ flex: 1, padding: '40px', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#8b5cf6' }}>●</span> Trading Statistics
          </h3>
          <div className="stats-cards-container" style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '100px', background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Trader Score</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>94.2</div>
            </div>
            <div style={{ flex: 1, height: '100px', background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Win Rate</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#10b981' }}>68%</div>
            </div>
          </div>

          {/* Calendar mockup */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} style={{
                height: '40px', borderRadius: '8px',
                background: i === 3 || i === 7 || i === 11 ? 'rgba(16, 185, 129, 0.2)' :
                  i === 5 || i === 12 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-panel)',
                border: '1px solid var(--border)',
                animation: `floatSlow ${5 + (i % 3)}s infinite ease-in-out`
              }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
