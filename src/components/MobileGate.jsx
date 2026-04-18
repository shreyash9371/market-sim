import { useEffect, useState } from 'react'

export default function MobileGate() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Slight delay for a smooth fade-in
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'linear-gradient(145deg, #0a0d14 0%, #0d1220 50%, #080b11 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      fontFamily: 'Inter, system-ui, sans-serif',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.5s ease',
    }}>

      {/* Background grid lines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      {/* Glow blob */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
        borderRadius: '50%',
      }} />

      {/* Card */}
      <div style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: '24px',
        padding: '40px 28px',
        maxWidth: '340px',
        width: '100%',
        textAlign: 'center',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 0 60px rgba(99,102,241,0.08), 0 20px 60px rgba(0,0,0,0.5)',
      }}>

        {/* Monitor icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
          border: '1px solid rgba(99,102,241,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          animation: 'pulse-glow 2.5s ease-in-out infinite',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="url(#grad1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          margin: '0 0 12px',
          fontSize: '22px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #e2e8f0, #a5b4fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.3px',
          lineHeight: '1.3',
        }}>
          Desktop Experience Required
        </h1>

        {/* Subtitle */}
        <p style={{
          margin: '0 0 28px',
          fontSize: '13.5px',
          color: 'rgba(148,163,184,0.85)',
          lineHeight: '1.7',
        }}>
          The trading dashboard is built for larger screens. Please open this site on your <strong style={{ color: '#a5b4fc' }}>PC or laptop</strong> for the best experience.
        </p>

        {/* Step pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {[
            { num: '1', text: 'Open your PC or laptop' },
            { num: '2', text: 'Visit the same URL in your browser' },
            { num: '3', text: 'Log in and start trading' },
          ].map(step => (
            <div key={step.num} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: '12px',
              padding: '11px 14px',
              textAlign: 'left',
            }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '12px',
                fontWeight: '700',
                color: '#fff',
              }}>{step.num}</div>
              <span style={{ fontSize: '13px', color: '#cbd5e1' }}>{step.text}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)',
          marginBottom: '20px',
        }} />

        {/* Footer note */}
        <p style={{
          margin: 0,
          fontSize: '11.5px',
          color: 'rgba(100,116,139,0.8)',
        }}>
          📊 Built for serious traders — full charts, tools & analytics available on desktop.
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.2); }
          50% { box-shadow: 0 0 0 12px rgba(99,102,241,0); }
        }
      `}</style>
    </div>
  )
}
