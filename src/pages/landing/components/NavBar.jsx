export default function NavBar({ isMobileMenuOpen, setIsMobileMenuOpen, openLogin, openSignup, handleGuestClick }) {
  return (
    <nav className="glass-nav" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 40px',
      height: '80px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.3s ease'
    }}>
      <div className="nav-brand-container" style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 8px 16px rgba(59,130,246,0.25)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10"></path>
              <path d="M12 20V4"></path>
              <path d="M6 20V14"></path>
              <path d="M4 14h4"></path>
              <path d="M10 4h4"></path>
              <path d="M16 10h4"></path>
            </svg>
          </div>
          <span style={{
            fontSize: '24px', fontWeight: 800,
            color: 'var(--text-primary)', letterSpacing: '-0.5px',
          }}>
            MktSim
          </span>
        </div>

        {/* Mobile menu button */}
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} style={{
          background: 'transparent', border: 'none',
          color: 'var(--text-secondary)', padding: '10px 20px', borderRadius: '10px',
          fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          Features
        </button>

        <a href="https://discord.gg/qMGJaYp7hP" target="_blank" rel="noreferrer" style={{
          background: 'rgba(88,101,242,0.1)', border: '1px solid rgba(88,101,242,0.2)', textDecoration: 'none',
          color: '#5865F2', padding: '10px 18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(88,101,242,0.15)'; e.currentTarget.style.borderColor = 'rgba(88,101,242,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(88,101,242,0.1)'; e.currentTarget.style.borderColor = 'rgba(88,101,242,0.2)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
          </svg>
          Help / Support
        </a>
        <button onClick={handleGuestClick} style={{
          background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)',
          padding: '10px 20px', borderRadius: '10px',
          fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          Guest Mode
        </button>

        <button onClick={openLogin} style={{
          background: 'transparent', border: 'none',
          color: 'var(--text-primary)', padding: '10px 20px', borderRadius: '10px',
          fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-blue)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
        >
          Log In
        </button>
        <button onClick={openSignup} style={{
          background: 'var(--text-primary)', color: 'var(--bg-base)', border: 'none',
          padding: '12px 28px', borderRadius: '12px',
          fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.1)' }}
        >
          Start for Free
        </button>
      </div>
    </nav>
  )
}
