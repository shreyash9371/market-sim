import { motion } from 'framer-motion'

export default function HowItWorks() {
  return (
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
  )
}
