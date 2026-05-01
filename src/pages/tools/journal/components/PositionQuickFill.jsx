import { useState } from 'react'

function QuickInput({ value, onChange, placeholder, label }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
      <label style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      <input
        type="number" step="0.00001"
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${focused ? 'rgba(59,130,246,0.7)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: '10px', color: 'white', fontFamily: 'var(--font-sans)', fontSize: '13px',
          padding: '8px 12px', outline: 'none', width: '100%', transition: 'border .15s',
          boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.2)' : 'none',
        }}
      />
    </div>
  )
}

export function PositionQuickFill({ onApply }) {
  const [expanded, setExpanded] = useState(false)
  const [qDir, setQDir] = useState('long')
  const [qEntry, setQEntry] = useState('')
  const [qSl, setQSl] = useState('')
  const [qTp, setQTp] = useState('')
  const [applied, setApplied] = useState(false)

  function handleApply() {
    if (!qEntry && !qSl && !qTp) return
    onApply({ dir: qDir, entry: qEntry, sl: qSl, tp: qTp })
    setApplied(true)
    setTimeout(() => setApplied(false), 2000)
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(20,30,55,0.97) 100%)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: expanded ? '16px 20px' : '12px 20px',
      transition: 'all 0.25s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: applied ? '#10B981' : '#3B82F6', boxShadow: `0 0 8px ${applied ? '#10B981' : '#3B82F6'}`, transition: 'all 0.3s' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.3px' }}>
            ⚡ Auto-Fill from Position Tool
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
            — Place a Long/Short tool on the chart, then enter its levels here
          </span>
        </div>
        <button onClick={() => setExpanded(e => !e)} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '4px 12px', cursor: 'pointer',
          color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 600,
          transition: 'all 0.2s',
        }}>
          {expanded ? '▲ Collapse' : '▼ Expand'}
        </button>
      </div>

      {expanded && (
        <div style={{ marginTop: '14px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <button onClick={() => setQDir('long')} style={{
              flex: 1, padding: '9px', borderRadius: '10px', fontFamily: 'var(--font-sans)',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', border: 'none',
              background: qDir === 'long' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
              color: qDir === 'long' ? '#10B981' : 'rgba(255,255,255,0.4)',
              boxShadow: qDir === 'long' ? 'inset 0 0 0 1.5px #10B981' : 'inset 0 0 0 1px rgba(255,255,255,0.1)',
            }}>
              📈 Long (Buy)
            </button>
            <button onClick={() => setQDir('short')} style={{
              flex: 1, padding: '9px', borderRadius: '10px', fontFamily: 'var(--font-sans)',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', border: 'none',
              background: qDir === 'short' ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.06)',
              color: qDir === 'short' ? '#EF4444' : 'rgba(255,255,255,0.4)',
              boxShadow: qDir === 'short' ? 'inset 0 0 0 1.5px #EF4444' : 'inset 0 0 0 1px rgba(255,255,255,0.1)',
            }}>
              📉 Short (Sell)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <QuickInput label="Entry Price" value={qEntry} onChange={setQEntry} placeholder="e.g. 1.08520" />
            <QuickInput label="Stop Loss" value={qSl} onChange={setQSl} placeholder="e.g. 1.08200" />
            <QuickInput label="Take Profit" value={qTp} onChange={setQTp} placeholder="e.g. 1.09200" />

            <button onClick={handleApply} style={{
              flexShrink: 0, background: applied ? 'rgba(16,185,129,0.9)' : 'rgba(59,130,246,0.9)',
              border: 'none', borderRadius: '10px', padding: '9px 20px',
              color: 'white', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 800,
              cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
              marginBottom: '0px',
            }}>
              {applied ? '✓ Applied!' : '→ Apply to Form'}
            </button>
          </div>

          <div style={{ marginTop: '10px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
            💡 <strong style={{ color: 'rgba(255,255,255,0.5)' }}>How to use:</strong> Place a <em>Long Position</em> or <em>Short Position</em> tool on the chart above. Read the Entry, SL, and TP prices from the tool's labels, type them above, then click <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Apply to Form</strong> — all fields below will be filled instantly.
          </div>

          <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', flex: 1 }}>
              📷 <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Save chart drawing:</strong> Click the Camera icon (top-right of chart) → Download Image → attach below
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
