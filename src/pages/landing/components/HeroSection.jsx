export default function HeroSection({ openLogin, openSignup }) {
  return (
    <section className="hero-section" style={{
      padding: '140px 24px 80px',
      textAlign: 'center',
      maxWidth: '1000px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="animate-fade-up hero-update-badge" style={{
        display: 'inline-flex', alignItems: 'center', gap: '10px',
        background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)',
        border: '1px solid var(--border)',
        borderRadius: '999px', padding: '6px 20px 6px 8px',
        fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)',
        marginBottom: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <span style={{
          background: '#10b981', color: '#fff',
          padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 800,
          letterSpacing: '0.5px'
        }}>UPDATE</span>
        Now featuring complete Trading Journal integration ✨
      </div>

      <h1 className="animate-fade-up delay-1 hero-title" style={{
        fontSize: 'clamp(52px, 7vw, 90px)', fontWeight: 800,
        color: 'var(--text-primary)',
        lineHeight: 1.05, letterSpacing: '-3px',
        marginBottom: '32px',
      }}>
        Experience the <br />
        <span className="animated-gradient-text" style={{ paddingBottom: '14px', display: 'inline-block' }}>
          Real Market Mechanics.
        </span>
      </h1>

      <p className="animate-fade-up delay-2 hero-subtitle" style={{
        fontSize: '21px', color: 'var(--text-secondary)',
        lineHeight: 1.6, marginBottom: '56px',
        maxWidth: '720px', margin: '0 auto 56px',
        fontWeight: 400
      }}>
        The most advanced order-flow simulator built to bridge the gap between
        theory and real prop-firm execution. Master liquidity, order blocks, and built-in journaling.
      </p>

      <div className="animate-fade-up delay-3 hero-buttons" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div className="glow-button" style={{ borderRadius: '16px' }}>
          <button onClick={openSignup} style={{
            background: 'linear-gradient(135deg, var(--accent-blue) 0%, #1e3a8a 100%)',
            border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
            padding: '18px 48px', borderRadius: '16px', fontSize: '18px', fontWeight: 800,
            cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 12px 32px rgba(59,130,246,0.4)',
            display: 'flex', alignItems: 'center', gap: '10px',
            position: 'relative', zIndex: 2
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
          >
            Start Simulating
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>

        <button onClick={openLogin} style={{
          background: 'var(--bg-panel)', border: '2px solid var(--border)',
          color: 'var(--text-primary)',
          padding: '18px 48px', borderRadius: '16px', fontSize: '18px', fontWeight: 800,
          cursor: 'pointer', transition: 'all 0.3s',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative', zIndex: 2
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-panel)' }}
        >
          Log In
        </button>
      </div>
    </section>
  )
}
