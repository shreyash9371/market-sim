import { useState, useEffect } from 'react'

export default function TopBar({
  onTogglePanel, onGenerate,
  selectedOrder, onRun, onClearOrder, onUpdateSelectedOrder,
  onBack, onForward, canGoBack, canGoForward,
}) {
  const [editedOrder, setEditedOrder] = useState(null)

  useEffect(() => {
    if (selectedOrder) {
      setEditedOrder({ ...selectedOrder })
    } else {
      setEditedOrder(null)
    }
  }, [selectedOrder])

  function handleField(field, value) {
    if (!editedOrder) return
    if ((field === 'qty' || field === 'price') && !/^\d*$/.test(value)) return
    setEditedOrder(prev => ({
      ...prev,
      [field]: field === 'type' || field === 'side'
        ? value
        : value === '' ? '' : parseInt(value) || ''
    }))
  }

  function handleRun() {
    if (editedOrder) onUpdateSelectedOrder(editedOrder)
    setTimeout(() => onRun(), 0)
  }

  const order = editedOrder

  return (
    <div style={{
      height: '68px',
      background: 'var(--bg-panel)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-md)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: '14px',
      flexShrink: 0,
    }}>

      {/* Logo */}
      <span style={{
        fontSize: '22px', fontWeight: 700,
        color: 'var(--accent-blue)', letterSpacing: '-0.5px',
        marginRight: '4px', whiteSpace: 'nowrap',
      }}>
        MktSim
      </span>

      <div style={{ width: '1px', height: '32px', background: 'var(--border)' }} />

      {/* Back / Forward */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={onBack}
          disabled={!canGoBack}
          title="Go back to previous state"
          style={{
            background: canGoBack ? 'var(--bg-card)' : 'var(--bg-base)',
            border: `1.5px solid ${canGoBack ? 'var(--border-bright)' : 'var(--border)'}`,
            color: canGoBack ? 'var(--text-primary)' : 'var(--text-dim)',
            fontSize: '16px',
            fontWeight: 700,
            width: '36px', height: '36px',
            borderRadius: 'var(--radius-sm)',
            cursor: canGoBack ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            if (canGoBack) {
              e.currentTarget.style.borderColor = 'var(--accent-blue)'
              e.currentTarget.style.color = 'var(--accent-blue)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = canGoBack ? 'var(--border-bright)' : 'var(--border)'
            e.currentTarget.style.color = canGoBack ? 'var(--text-primary)' : 'var(--text-dim)'
          }}
        >
          ←
        </button>

        <button
          onClick={onForward}
          disabled={!canGoForward}
          title="Go forward to next state"
          style={{
            background: canGoForward ? 'var(--bg-card)' : 'var(--bg-base)',
            border: `1.5px solid ${canGoForward ? 'var(--border-bright)' : 'var(--border)'}`,
            color: canGoForward ? 'var(--text-primary)' : 'var(--text-dim)',
            fontSize: '16px',
            fontWeight: 700,
            width: '36px', height: '36px',
            borderRadius: 'var(--radius-sm)',
            cursor: canGoForward ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            if (canGoForward) {
              e.currentTarget.style.borderColor = 'var(--accent-blue)'
              e.currentTarget.style.color = 'var(--accent-blue)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = canGoForward ? 'var(--border-bright)' : 'var(--border)'
            e.currentTarget.style.color = canGoForward ? 'var(--text-primary)' : 'var(--text-dim)'
          }}
        >
          →
        </button>
      </div>

      <div style={{ width: '1px', height: '32px', background: 'var(--border)' }} />

      {/* Toggle panel */}
      <button onClick={onTogglePanel} style={{
        background: 'var(--bg-card)', border: '1.5px solid var(--border)',
        color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600,
        padding: '10px 20px', borderRadius: 'var(--radius-sm)',
        cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--accent-blue)'
          e.currentTarget.style.color = 'var(--accent-blue)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--text-primary)'
        }}
      >
        ☰ Orders
      </button>

      {/* Generate */}
      <button onClick={onGenerate} style={{
        background: 'var(--accent-blue)', border: 'none', color: '#fff',
        fontSize: '14px', fontWeight: 600, padding: '10px 20px',
        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(59,130,246,0.25)',
        transition: 'all 0.2s', whiteSpace: 'nowrap',
      }}
        onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-blue)'}
      >
        ＋ Generate Orders
      </button>

      <div style={{ width: '1px', height: '32px', background: 'var(--border)' }} />

      {/* Selected order chip */}
      {order ? (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--bg-card)', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '6px 12px',
            animation: 'slideIn 0.25s ease',
          }}>

            <select
              value={order.side}
              onChange={e => handleField('side', e.target.value)}
              style={{
                fontSize: '12px', fontWeight: 700,
                color: order.side === 'BUY' ? '#3b82f6' : '#ef4444',
                background: order.side === 'BUY' ? 'rgba(59,130,246,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1.5px solid ${order.side === 'BUY' ? '#93c5fd' : '#fca5a5'}`,
                borderRadius: '6px', padding: '4px 8px',
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
                outline: 'none', letterSpacing: '0.5px',
              }}
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>

            <select
              value={order.type}
              onChange={e => handleField('type', e.target.value)}
              style={{
                fontSize: '11px', fontWeight: 600,
                color: 'var(--text-secondary)',
                background: 'var(--bg-hover)',
                border: '1px solid var(--border)',
                borderRadius: '6px', padding: '4px 6px',
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
                outline: 'none',
              }}
            >
              <option value="MARKET">MARKET</option>
              <option value="LIMIT">LIMIT</option>
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Qty</span>
              <input
                type="text" inputMode="numeric"
                value={order.qty}
                onChange={e => handleField('qty', e.target.value)}
                style={{
                  width: '52px', fontSize: '13px', fontWeight: 700,
                  fontFamily: 'var(--font-mono)', color: 'var(--text-primary)',
                  background: '#fff', border: '1.5px solid var(--border)',
                  borderRadius: '6px', padding: '3px 6px',
                  outline: 'none', textAlign: 'center',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {order.type === 'LIMIT' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>@</span>
                <input
                  type="text" inputMode="numeric"
                  value={order.price ?? ''}
                  onChange={e => handleField('price', e.target.value)}
                  style={{
                    width: '52px', fontSize: '13px', fontWeight: 700,
                    fontFamily: 'var(--font-mono)', color: 'var(--accent-yellow)',
                    background: '#fff', border: '1.5px solid var(--border)',
                    borderRadius: '6px', padding: '3px 6px',
                    outline: 'none', textAlign: 'center',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-yellow)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            )}

            {order.type === 'MARKET' && (
              <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                Market Price
              </span>
            )}

            <button onClick={onClearOrder} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-dim)', fontSize: '18px',
              lineHeight: 1, padding: '0 2px',
            }}>×</button>
          </div>

          <button onClick={handleRun} style={{
            background: 'var(--accent-green)', border: 'none', color: '#fff',
            fontSize: '14px', fontWeight: 700, padding: '10px 28px',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(16,185,129,0.35)',
            transition: 'all 0.2s', animation: 'slideIn 0.25s ease',
            whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#059669'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-green)'}
          >
            ▶ Run
          </button>
        </>
      ) : (
        <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
          Select an order to execute…
        </span>
      )}

      <div style={{ flex: 1 }} />

      {/* Status pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#ecfdf5', border: '1.5px solid #a7f3d0',
        borderRadius: '999px', padding: '6px 16px', flexShrink: 0,
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: 'var(--accent-green)', boxShadow: '0 0 6px #10b981',
          animation: 'pulse 2s infinite',
        }} />
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>
          Market Open
        </span>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </div>
  )
}