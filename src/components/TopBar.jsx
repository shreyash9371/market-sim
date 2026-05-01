import { useState, useEffect, useRef } from 'react'
import { useMarketStore } from '../store/useMarketStore'
import { startTourManually } from '../system/ProductTourManager'

export default function TopBar({
  onTogglePanel, onGenerate,
  selectedOrder, onRun, onClearOrder, onUpdateSelectedOrder,
  onBack, onForward, canGoBack, canGoForward,
}) {
  const [editedOrder, setEditedOrder] = useState(null)
  const [startPriceInput, setStartPriceInput] = useState('')
  const [condMenuOpen, setCondMenuOpen] = useState(false)
  const condMenuRef = useRef(null)
  const store = useMarketStore()

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

      {!store.isRealMarket ? (
        <>
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
          <button id="tour-manual-orders" onClick={onTogglePanel} style={{
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
          <button id="tour-manual-generate" onClick={onGenerate} style={{
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

              <button id="tour-manual-run" onClick={handleRun} style={{
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
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <button onClick={onTogglePanel} style={{
              background: 'var(--bg-card)', border: '1.5px solid var(--border)',
              color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600,
              padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
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
            <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />

            <div id="tour-start-price" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                placeholder="Start Price..."
                value={startPriceInput}
                onChange={e => setStartPriceInput(e.target.value)}
                style={{
                  width: '90px', fontSize: '13px', padding: '6px 10px',
                  borderRadius: '6px', border: '1.5px solid var(--border)'
                }}
              />
              <button
                onClick={() => {
                  if (startPriceInput) store.setStartingPrice(startPriceInput)
                }}
                style={{
                  background: 'var(--bg-card)', border: '1.5px solid var(--border)',
                  padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)'
                }}
              >Set</button>
            </div>

            <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />

            <button
              id="tour-play-pause"
              onClick={() => store.setPlaying(!store.playbackPlaying)}
              style={{
                background: store.playbackPlaying ? 'var(--accent-red)' : 'var(--accent-green)',
                color: '#fff', border: 'none', padding: '8px 24px',
                borderRadius: '8px', cursor: 'pointer', fontWeight: 700,
                fontSize: '14px', width: '90px'
              }}
            >
              {store.playbackPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

            {/* Teaching Mode: Phase & Trade Indicator */}
            {(store.marketCondition || store.playbackPlaying) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                {store.marketCondition && (
                  <div style={{
                    background: 'rgba(124,58,237,0.1)', color: '#7c3aed',
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
                    fontWeight: 800, border: '1px solid rgba(124,58,237,0.2)',
                    textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>
                    {store.conditionPhase?.replace('_', ' ') || 'Searching'}
                  </div>
                )}
                <div style={{
                  background: 'var(--bg-card)', color: 'var(--text-secondary)',
                  padding: '4px 8px', borderRadius: '6px', fontSize: '11px',
                  fontWeight: 600, border: '1px solid var(--border)'
                }}>
                  Ticks: {store.candleTickCount}/24
                </div>
              </div>
            )}

            <div id="tour-speed-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Speed {store.playbackSpeed}x</span>
              <input
                type="range" min="1" max="10" step="1"
                value={store.playbackSpeed}
                onChange={e => store.setPlaybackSpeed(Number(e.target.value))}
                style={{ width: '100px', cursor: 'pointer' }}
              />
            </div>

            {/* Market Condition Selector */}
            <div id="tour-conditions" ref={condMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setCondMenuOpen(o => !o)}
                style={{
                  background: store.marketCondition ? '#7c3aed' : 'var(--bg-card)',
                  border: `1.5px solid ${store.marketCondition ? '#7c3aed' : 'var(--border)'}`,
                  color: store.marketCondition ? '#fff' : 'var(--text-primary)',
                  fontSize: '12px', fontWeight: 700,
                  padding: '6px 12px', borderRadius: '6px',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                🎭 {store.marketCondition === 'liq_sweep' ? 'Liq Sweep' : store.marketCondition === 'stop_hunt' ? 'Stop Hunt' : 'Condition'}
              </button>
              {condMenuOpen && (
                <div style={{
                  position: 'absolute', top: '110%', left: 0, zIndex: 200,
                  background: 'var(--bg-panel)', border: '1.5px solid var(--border)',
                  borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  minWidth: '160px', overflow: 'hidden',
                }}>
                  {[['none', '🎲 Normal', null], ['liq_sweep', '🏦 Liq Sweep', 'liq_sweep'], ['stop_hunt', '🎯 Stop Hunt', 'stop_hunt']].map(([id, label, val]) => (
                    <button key={id} onClick={() => { store.setMarketCondition(val); setCondMenuOpen(false) }}
                      style={{
                        display: 'block', width: '100%', padding: '10px 16px',
                        background: store.marketCondition === val ? 'rgba(124,58,237,0.08)' : 'transparent',
                        border: 'none', textAlign: 'left', cursor: 'pointer',
                        fontSize: '13px', fontWeight: 600,
                        color: store.marketCondition === val ? '#7c3aed' : 'var(--text-primary)',
                        borderBottom: id !== 'stop_hunt' ? '1px solid var(--border)' : 'none',
                        transition: 'background 0.15s',
                      }}
                    >{label}</button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ flex: 1 }} />
          </div>
        </>
      )}

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Real Market</span>
          <button
            id="tour-trade-btn"
            onClick={() => store.toggleRealMarket()}
            style={{
              width: '36px', height: '20px', borderRadius: '10px',
              background: store.isRealMarket ? 'var(--accent-green)' : 'var(--bg-card)',
              border: `1.5px solid ${store.isRealMarket ? 'var(--accent-green)' : 'var(--border)'}`,
              position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <div style={{
              position: 'absolute', top: '2px', left: store.isRealMarket ? '16px' : '2px',
              width: '12px', height: '12px', borderRadius: '50%',
              background: store.isRealMarket ? '#fff' : 'var(--text-dim)',
              transition: 'all 0.2s'
            }} />
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />

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

        {/* How It Works Button (Simulator) */}
        <button onClick={() => {
          import('../system/ProductTourManager').then(m => m.startSimulatorTour(store.isRealMarket, true))
        }} style={{
          background: 'none', border: '1.5px solid var(--border)',
          color: 'var(--text-secondary)', padding: '6px 14px', borderRadius: '10px',
          fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center'
        }}>
          💡 How it works
        </button>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </div>
  )
}