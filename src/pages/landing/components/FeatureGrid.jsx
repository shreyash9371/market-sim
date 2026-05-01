import { motion } from 'framer-motion'

export default function FeatureGrid() {
  return (
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
            <h3 className="ai-spotlight-title" style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>AI Trading Coach & Performance Specialist</h3>
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
  )
}
