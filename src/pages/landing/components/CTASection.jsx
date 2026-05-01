export default function CTASection({ openSignup }) {
  return (
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
          Ready to completely transform your<br />trading mechanics?
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
  )
}
