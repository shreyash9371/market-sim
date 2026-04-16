import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import AuthPanel from '../components/AuthPanel'
import { useAuthStore } from '../store/useAuthStore'

export default function LandingPage() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [defaultTab, setDefaultTab] = useState('login')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const wasKicked = searchParams.get('kicked') === 'true'
  const hasError = searchParams.get('error') === 'confirmation_failed'
  const auth = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth.loading && auth.user && auth.approved && !auth.isGuest) {
      navigate('/dashboard', { replace: true })
    }
  }, [auth.loading, auth.user, auth.approved, auth.isGuest, navigate])

  if (auth.loading) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)'
      }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', boxShadow: '0 8px 32px rgba(59,130,246,0.4)',
          animation: 'pulseGlow 2s infinite ease-in-out', marginBottom: '24px'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20V14"></path>
          </svg>
        </div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          MktSim
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '8px' }}>
          Authenticating...
        </div>
      </div>
    )
  }

  if (auth.user && auth.approved && !auth.isGuest) {
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

  function handleGuestClick() {
    if (window.gtag) {
      window.gtag('event', 'guest_mode_clicked', {
        event_category: 'engagement',
        event_label: 'guest_user'
      });
    }
    localStorage.removeItem('tour_dashboard_v1');
    localStorage.removeItem('tour_simulator_manual_v1');
    localStorage.removeItem('tour_simulator_real_v1');
    localStorage.removeItem('tour_journal_v1');
    localStorage.removeItem('tour_log_trade_v1');
    auth.loginAsGuest()
    navigate('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      fontFamily: 'var(--font-sans)',
      overflowX: 'hidden',
      position: 'relative',
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(59,130,246,0.2); }
          50% { box-shadow: 0 0 40px rgba(59,130,246,0.4); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-fade-up {
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        
        .mobile-menu-btn {
          display: none;
          align-items: center;
          justify-content: center;
          background: var(--bg-panel);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px;
          color: var(--text-primary);
          cursor: pointer;
        }
        
        .bento-card {
          background: var(--bg-panel);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 32px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .bento-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08);
          border-color: rgba(59,130,246,0.3);
        }
        .glass-nav {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255,255,255,0.6);
        }
        [data-theme="dark"] .glass-nav {
          background: rgba(17, 24, 39, 0.65);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .bg-grid {
          position: absolute; width: 100%; height: 100%; top: 0; left: 0;
          background-image: 
            linear-gradient(to right, rgba(59,130,246,0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59,130,246,0.07) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(ellipse at top, black 40%, transparent 70%);
          -webkit-mask-image: -webkit-radial-gradient(ellipse at top, black 40%, transparent 70%);
          z-index: 0; pointer-events: none;
        }
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        * {
          scrollbar-width: none;
        }
        .animated-gradient-text {
          background: linear-gradient(270deg, #3b82f6, #6b21a8, #3b82f6);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 6s ease infinite;
        }
        .glow-button {
          position: relative;
        }
        .glow-button::before {
          content: ''; position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #10b981, #3b82f6);
          background-size: 400%; z-index: -1; border-radius: 18px;
          animation: gradientShift 8s linear infinite;
          opacity: 0; transition: opacity 0.3s ease;
        }
        .glow-button:hover::before { opacity: 1; }
        
        @media (max-width: 768px) {
          .glass-nav {
            padding: 16px !important;
            height: auto !important;
            flex-direction: column;
            gap: 0 !important;
          }
          .glass-nav > div:first-child {
            justify-content: space-between;
            width: 100%;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .nav-links {
            display: none !important;
          }
          .nav-links.mobile-open {
            display: flex !important;
            flex-direction: column !important;
            width: 100%;
            margin-top: 16px;
            gap: 8px !important;
            padding-bottom: 8px;
          }
          .nav-links.mobile-open > * {
            width: 100% !important;
            justify-content: flex-start;
            text-align: left;
            padding: 12px 16px !important;
            font-size: 15px !important;
            margin: 0 !important;
          }
          .nav-links.mobile-open > *:last-child {
            margin-top: 8px !important;
            justify-content: center;
            text-align: center;
          }
          .hero-section {
            padding: 60px 16px 40px !important;
          }
          .hero-title {
            font-size: 36px !important;
            line-height: 1.1 !important;
            letter-spacing: -1px !important;
            margin-bottom: 20px !important;
          }
          .hero-subtitle {
            font-size: 15px !important;
            margin-bottom: 24px !important;
          }
          .hero-buttons {
            flex-direction: column !important;
            width: 100%;
            gap: 12px !important;
          }
          .hero-buttons > * {
            width: 100% !important;
          }
          .glow-button button {
            width: 100% !important;
            justify-content: center;
            padding: 14px 20px !important;
            font-size: 16px !important;
          }
          .hero-buttons > button {
            padding: 14px 20px !important;
            font-size: 16px !important;
          }
          .hero-update-badge {
            flex-direction: column;
            border-radius: 16px !important;
            padding: 8px 12px !important;
            text-align: center;
            font-size: 12px !important;
            margin-bottom: 24px !important;
          }
          .mockup-container {
            flex-direction: column !important;
            height: auto !important;
          }
          .mockup-left {
            border-right: none !important;
            border-bottom: 1px solid var(--border);
            padding: 24px !important;
          }
          .mockup-right {
            padding: 24px !important;
          }
          .bento-card-half {
            grid-column: span 12 !important;
          }
          .ai-spotlight-title {
            font-size: 24px !important;
          }
          .deep-dive-section {
            padding: 60px 16px !important;
          }
          .deep-dive-container {
            flex-direction: column !important;
            gap: 32px !important;
          }
          .deep-dive-container > div {
            width: 100% !important;
            flex: 1 1 100% !important;
          }
          .cta-section {
            padding: 80px 16px !important;
          }
          .cta-box {
            padding: 40px 20px !important;
          }
          .cta-title {
            font-size: 28px !important;
            line-height: 1.2 !important;
          }
          .cta-box p {
            font-size: 15px !important;
            margin-bottom: 24px !important;
          }
          .cta-box button {
            width: 100% !important;
            padding: 14px 20px !important;
            font-size: 16px !important;
          }
          .footer-links {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .section-title {
            font-size: 32px !important;
            line-height: 1.1 !important;
            letter-spacing: -1px !important;
          }
          .section-subtitle {
            font-size: 16px !important;
            padding: 0 8px;
          }
          .stats-cards-container {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .stats-cards-container > div {
             height: auto !important;
             padding: 16px !important;
          }
          .radar-box {
            height: 320px !important;
            width: 100% !important;
          }
          .step-container {
            padding: 24px 16px !important;
            border-left: none !important;
            border-bottom: 1px dashed var(--border);
          }
          .bento-card {
            padding: 24px !important;
          }
        }
      `}</style>

      {/* Hero Backgrounds */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '900px', overflow: 'hidden', zIndex: 0 }}>
        <div className="bg-grid"></div>
        {/* Decorative Color Orbs */}
        <div style={{
          position: 'absolute', top: '-10%', left: '10%', width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 60%)',
          borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', top: '10%', right: '10%', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)',
          borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none'
        }} />
      </div>

      {/* Navbar */}
      <nav className="glass-nav" style={{
        position: 'sticky', top: 0, zIndex: 100,
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
          <button onClick={() => document.getElementById('features').scrollIntoView({behavior: 'smooth'})} style={{
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
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
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

      {/* Hero Section */}
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
          Experience the <br/>
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

      {/* Abstract Mockup Visuals */}
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
                 <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)'}}>94.2</div>
               </div>
               <div style={{ flex: 1, height: '100px', background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px' }}>
                 <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Win Rate</div>
                 <div style={{ fontSize: '32px', fontWeight: 800, color: '#10b981'}}>68%</div>
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

      {/* AI & Feature Bento Grid */}
      <section id="features" style={{ maxWidth: '1200px', margin: '0 auto 120px', padding: '0 24px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: '999px', padding: '5px 18px', marginBottom: '24px',
            fontSize: '13px', fontWeight: 700, color: '#7c3aed', letterSpacing: '0.3px',
            textTransform: 'uppercase'
          }}>
            ✦ The Future of Trading Mastery
          </div>
          <h2 className="section-title" style={{ fontSize: '46px', fontWeight: 800, marginBottom: '20px', letterSpacing: '-1.5px', color: 'var(--text-primary)' }}>
            Powered by next-generation <span style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Intelligence</span>.
          </h2>
          <p className="section-subtitle" style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
            Stop guessing your edge. MktSim unifies institutional simulators, automated journaling, and an AI Trade Coach into one powerful learning ecosystem.
          </p>
        </motion.div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', gridAutoRows: 'minmax(320px, auto)'
        }}>
          {/* Card 1: AI Spotlight */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="bento-card" style={{ gridColumn: 'span 12', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#fff', border: '1px solid rgba(124,58,237,0.3)' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', zIndex: 10 }}>
              <div style={{ fontSize: '48px', marginBottom: '24px' }}>🤖</div>
              <h3 className="ai-spotlight-title" style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>AI Trade Coach & Strategy Enhancement</h3>
              <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '600px' }}>
                Your personal AI hedge fund manager. As you trade, our intelligence framework analyzes your execution patterns, detects behavioral flaws (like revenge trading), and quantitatively enhances your setups for maximum expectancy.
              </p>
              
              <div style={{ display: 'flex', gap: '16px', marginTop: 'auto', flexWrap: 'wrap' }}>
                {['Cognitive Bias Detection', 'Dynamic Expectancy Scoring', 'Algorithmic Optimization'].map((tag, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)' }}>
                    ✓ {tag}
                  </div>
                ))}
              </div>
            </div>
            {/* Abstract background art */}
            <div style={{ position: 'absolute', right: 0, bottom: 0, width: '50%', height: '100%', pointerEvents: 'none', background: 'radial-gradient(circle at 80% 80%, rgba(124,58,237,0.2) 0%, transparent 60%)' }} />
            <svg style={{ position: 'absolute', right: '40px', bottom: '40px', width: '300px', height: '200px', opacity: 0.1 }} viewBox="0 0 100 100">
              <path d="M10,90 Q30,10 50,70 T90,30" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="90" cy="30" r="4" fill="#fff" />
              <circle cx="50" cy="70" r="4" fill="#fff" />
            </svg>
          </motion.div>

          {/* Card 2: Simulator */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="bento-card bento-card-half" style={{ gridColumn: 'span 7' }}
          >
            <div style={{ fontSize: '36px', marginBottom: '20px' }}>📊</div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Institutional Order Simulator</h3>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '85%' }}>
              Experience true price action. Watch how buy and sell volumes interact organically. Our physics-based DOM accurately simulates liquidity consumption, sweeps, and block reactions.
            </p>
            <div style={{ position: 'absolute', bottom: '-20px', right: '20px', opacity: 0.05, fontSize: '160px', transform: 'rotate(-10deg)' }}>📈</div>
          </motion.div>

          {/* Card 3: Journal */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="bento-card bento-card-half" style={{ gridColumn: 'span 5' }}
          >
            <div style={{ fontSize: '36px', marginBottom: '20px' }}>📓</div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Cloud Trade Journal</h3>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Log simulated (or real) executions with asset tags, screenshots, and custom notes automatically tracked and synced.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 120px', padding: '0 24px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '72px' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '999px', padding: '5px 18px', marginBottom: '24px',
            fontSize: '13px', fontWeight: 700, color: '#8b5cf6', letterSpacing: '0.3px'
          }}>
            ✦ How It Works
          </div>
          <h2 className="section-title" style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '16px', color: 'var(--text-primary)' }}>
            From zero to trading in<br />
            <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              3 simple steps.
            </span>
          </h2>
          <p className="section-subtitle" style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
            No complex setup. No prior knowledge required. Just open any tool and start learning real market mechanics.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2px', position: 'relative' }}>
          {/* Connector line */}
          <div style={{
            position: 'absolute', top: '52px', left: 'calc(16.67% + 20px)', right: 'calc(16.67% + 20px)',
            height: '2px',
            background: 'linear-gradient(90deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3), rgba(16,185,129,0.3))',
            display: 'none', // hidden on mobile, shown via grid layout
          }} />

          {[
            {
              num: '01',
              icon: '🚀',
              color: '#3b82f6',
              bg: 'rgba(59,130,246,0.08)',
              border: 'rgba(59,130,246,0.15)',
              title: 'Open any Tool',
              desc: 'Sign up free or jump in as Guest. From the Dashboard, click "Basic Market Movements" to open the live simulator — no tutorials needed, it\'s self-explanatory.',
              cues: ['Free account', 'No setup', 'Works immediately'],
            },
            {
              num: '02',
              icon: '📈',
              color: '#8b5cf6',
              bg: 'rgba(139,92,246,0.08)',
              border: 'rgba(139,92,246,0.15)',
              title: 'Simulate & Log Trades',
              desc: 'Watch real order flow drive price. Pause, rewind, and mark key levels. When you spot a setup — log it in the Trade Journal with one click.',
              cues: ['Pause anytime', 'Mark levels', 'Log instantly'],
            },
            {
              num: '03',
              icon: '📊',
              color: '#10b981',
              bg: 'rgba(16,185,129,0.08)',
              border: 'rgba(16,185,129,0.15)',
              title: 'Reveal Your Edge',
              desc: 'Open Statistics. See your win rate, equity curve, best performing days, and a radar chart that shows exactly where your edge is — or where you\'re losing it.',
              cues: ['Equity curve', 'Win-rate gauge', 'Trader Score'],
            },
          ].map((step, i) => (
            <div className="step-container" key={i} style={{
              padding: '36px 32px',
              position: 'relative',
              borderLeft: i > 0 ? '1px dashed var(--border)' : 'none',
            }}>
              {/* Step number */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: step.bg, border: `1px solid ${step.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', flexShrink: 0,
                }}>
                  {step.icon}
                </div>
                <div style={{
                  fontSize: '13px', fontWeight: 800, color: step.color,
                  letterSpacing: '1px', opacity: 0.6,
                }}>STEP {step.num}</div>
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
                {step.desc}
              </p>

              {/* Cue pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {step.cues.map((cue, j) => (
                  <div key={j} style={{
                    background: step.bg,
                    border: `1px solid ${step.border}`,
                    color: step.color,
                    fontSize: '12px', fontWeight: 700,
                    padding: '4px 12px', borderRadius: '999px',
                    letterSpacing: '0.2px',
                  }}>
                    ✓ {cue}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deep Dive Section: The Journal */}
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

      {/* Beautiful CTA */}
      <section className="cta-section" style={{ padding: '120px 24px', textAlign: 'center' }}>
        <div className="cta-box" style={{
          background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
          borderRadius: '32px',
          padding: '80px 40px',
          maxWidth: '1000px',
          margin: '0 auto',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(59,130,246,0.3)'
        }}>
          {/* Internal Glow Effects */}
          <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-50%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)', borderRadius: '50%' }} />
          
          <h2 className="cta-title" style={{ fontSize: '42px', fontWeight: 800, color: '#fff', marginBottom: '20px', letterSpacing: '-1.5px', position: 'relative', zIndex: 10 }}>
            Ready to completely transform your<br/>trading mechanics?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.85)', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px', position: 'relative', zIndex: 10 }}>
            Join the platform that focuses on real mechanics, not just hindsight charting. Experience true market environments.
          </p>
          
          <button onClick={openSignup} style={{
            background: '#fff', border: 'none', color: '#1e3a8a',
            padding: '18px 48px', borderRadius: '16px',
            fontSize: '18px', fontWeight: 800, cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative', zIndex: 10,
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)' }}
          >
            Create Your Free Account
          </button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer style={{
        textAlign: 'center', padding: '40px', borderTop: '1px solid var(--border)',
        fontSize: '14px', color: 'var(--text-dim)', background: 'var(--bg-panel)'
      }}>
        <div className="footer-links" style={{ marginBottom: '24px', display: 'flex', gap: '32px', justifyContent: 'center' }}>
          <a href="https://discord.gg/qMGJaYp7hP" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#5865F2'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
            </svg>
            Discord Community (Help / Support)
          </a>
          <a href="mailto:Shreyashshahane2004@gmail.com" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <span style={{ fontSize: '18px' }}>✉️</span>
            Contact via Email
          </a>
        </div>
        © 2026 MktSim / AITradingJournal. Built for traders who want to map the markets properly.
      </footer>

      {/* Kicked / Error Banners Absolute Positioning */}
      {(wasKicked || hasError) && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
          {wasKicked && (
            <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '12px', padding: '16px', color: '#b91c1c', fontSize: '14px', fontWeight: 500, boxShadow: 'var(--shadow-md)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
              You were logged out because your account was accessed from another device. Please change your password.
            </div>
          )}
          {hasError && (
            <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '12px', padding: '16px', color: '#b91c1c', fontSize: '14px', fontWeight: 500, boxShadow: 'var(--shadow-md)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
              Email confirmation failed or link expired. Please sign up again or contact support.
            </div>
          )}
        </div>
      )}

      <AuthPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        defaultTab={defaultTab}
      />
    </div>
  )
}