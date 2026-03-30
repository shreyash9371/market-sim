import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AuthPanel from '../components/AuthPanel'
import { useAuthStore } from '../store/useAuthStore'

export default function LandingPage() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [defaultTab, setDefaultTab] = useState('login')
  const [searchParams] = useSearchParams()
  const wasKicked = searchParams.get('kicked') === 'true'
  const hasError = searchParams.get('error') === 'confirmation_failed'
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

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
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
      <section style={{
        padding: '140px 24px 80px',
        textAlign: 'center',
        maxWidth: '1000px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="animate-fade-up" style={{
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

        <h1 className="animate-fade-up delay-1" style={{
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

        <p className="animate-fade-up delay-2" style={{
          fontSize: '21px', color: 'var(--text-secondary)',
          lineHeight: 1.6, marginBottom: '56px',
          maxWidth: '720px', margin: '0 auto 56px',
          fontWeight: 400
        }}>
          The most advanced order-flow simulator built to bridge the gap between 
          theory and real prop-firm execution. Master liquidity, order blocks, and built-in journaling.
        </p>

        <div className="animate-fade-up delay-3" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
        <div style={{
          position: 'relative',
          height: '460px', borderRadius: '24px',
          background: 'var(--bg-panel)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          display: 'flex'
        }}>
          {/* Mockup Left - Simulator */}
          <div style={{ flex: 1, padding: '40px', borderRight: '1px solid var(--border)', position: 'relative' }}>
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
          <div style={{ flex: 1, padding: '40px', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
             <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#8b5cf6' }}>●</span> Trading Statistics
             </h3>
             <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
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

      {/* Feature Bento Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 120px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px' }}>
            Everything you need in one platform.
          </h2>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Stop switching between simulators, charting tools, and spreadsheets. MktSim unifies your entire learning and journaling workflow.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', gridAutoRows: 'minmax(280px, auto)'
        }}>
          {/* Card 1 */}
          <div className="bento-card" style={{ gridColumn: 'span 8' }}>
            <div style={{ fontSize: '32px', marginBottom: '20px' }}>📊</div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Institutional Order Simulator</h3>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '80%' }}>
              Experience true price action. Watch how buy and sell volumes interact organically to form bars. Our physics-based DOM accurately simulates liquidity consumption, sweeps, and block reactions.
            </p>
            <div style={{ position: 'absolute', bottom: '-40px', right: '40px', opacity: 0.05, fontSize: '200px', transform: 'rotate(-15deg)' }}>📈</div>
          </div>

          {/* Card 2 */}
          <div className="bento-card" style={{ gridColumn: 'span 4' }}>
            <div style={{ fontSize: '32px', marginBottom: '20px' }}>📓</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>Built-in Trade Journal</h3>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Log simulated (or real) executions with asset tags, screenshots, and custom notes automatically tracked in the cloud.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bento-card" style={{ gridColumn: 'span 5' }}>
            <div style={{ fontSize: '32px', marginBottom: '20px' }}>⚡️</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>Advanced Analytics</h3>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Uncover your edge with deep metrics. View your win-rate gauges, premium Trader Score, and daily P&L heatmap instantly.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bento-card" style={{ gridColumn: 'span 7' }}>
            <div style={{ fontSize: '32px', marginBottom: '20px' }}>Rewind & Replay</div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Perfect Your Timing</h3>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '80%' }}>
              Missed a setup? You can manually pause, speed up, or rewind the simulation to understand complex structural changes before committing to a trade.
            </p>
            <div style={{ position: 'absolute', bottom: '-20px', right: '20px', opacity: 0.1, fontSize: '160px' }}>⏪</div>
          </div>
        </div>
      </section>

      {/* Deep Dive Section: The Journal */}
      <section style={{ 
        padding: '100px 24px', 
        background: 'var(--bg-panel)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
           <div style={{ flex: '1 1 400px' }}>
             <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '24px', letterSpacing: '-1px' }}>
                Your Edge, <span style={{ color: '#10b981' }}>Quantified.</span>
             </h2>
             <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '32px' }}>
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
             <div style={{ 
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
      <section style={{ padding: '120px 24px', textAlign: 'center' }}>
        <div style={{
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
          
          <h2 style={{ fontSize: '42px', fontWeight: 800, color: '#fff', marginBottom: '20px', letterSpacing: '-1.5px', position: 'relative', zIndex: 10 }}>
            Ready to completely transform your<br/>trading mechanics?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.85)', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px', position: 'relative', zIndex: 10 }}>
            Join the platform that focuses on real mechanics, not just hindsight charting. Free for everyone.
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
        © 2026 MktSim. Built for traders who want to map the markets properly.
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