import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AuthPanel from '../components/AuthPanel'
import { useAuthStore } from '../store/auth/useAuthStore'
import LandingStyles from './landing/components/LandingStyles'
import NavBar from './landing/components/NavBar'
import HeroSection from './landing/components/HeroSection'
import MockupVisuals from './landing/components/MockupVisuals'
import FeatureGrid from './landing/components/FeatureGrid'
import HowItWorks from './landing/components/HowItWorks'
import DeepDive from './landing/components/DeepDive'
import CTASection from './landing/components/CTASection'
import Footer from './landing/components/Footer'

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
      paddingTop: '80px',
    }}>
      <LandingStyles />

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

      <NavBar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
        openLogin={openLogin} 
        openSignup={openSignup} 
        handleGuestClick={handleGuestClick} 
      />
      
      <HeroSection openLogin={openLogin} openSignup={openSignup} />
      <MockupVisuals />
      <FeatureGrid />
      <HowItWorks />
      <DeepDive />
      <CTASection openSignup={openSignup} />
      <Footer />

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