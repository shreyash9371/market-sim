export default function OrderPanel({ open, orders, selectedOrder, onSelectOrder, onClose }) {
  const pending = orders.filter(o => o.status === 'PENDING').length
  const executed = orders.filter(o => o.status === 'EXECUTED').length

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      width: '300px',
      background: 'var(--bg-panel)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-md)',
      zIndex: 100,
      transform: open ? 'translateX(0)' : 'translateX(-120%)',
      transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        padding: '16px 18px 12px',
        borderBottom: '1.5px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Order Stack
          </span>
          <button onClick={onClose} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            width: '28px', height: '28px',
            cursor: 'pointer',
            fontSize: '16px',
            color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* Stats row */}
        {orders.length > 0 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{
              flex: 1,
              background: 'rgba(59,130,246,0.07)',
              borderRadius: '8px',
              padding: '6px 10px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>{pending}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending</div>
            </div>
            <div style={{
              flex: 1,
              background: 'rgba(16,185,129,0.07)',
              borderRadius: '8px',
              padding: '6px 10px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>{executed}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Executed</div>
            </div>
          </div>
        )}
      </div>

      {/* Order list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {orders.length === 0 ? (
          <div style={{
            color: 'var(--text-dim)',
            fontSize: '13px',
            textAlign: 'center',
            marginTop: '40px',
            lineHeight: 1.8,
          }}>
            No orders yet.<br />
            Click <strong style={{ color: 'var(--accent-blue)' }}>＋ Generate Orders</strong><br />
            to create a batch.
          </div>
        ) : orders.map((order, i) => {
          const isSelected = selectedOrder?.id === order.id
          const isExecuted = order.status === 'EXECUTED'
          const isBuy = order.side === 'BUY'

          return (
            <button
              key={order.id}
              onClick={() => !isExecuted && onSelectOrder(order)}
              style={{
                background: isSelected
                  ? (isBuy ? 'rgba(59,130,246,0.07)' : 'rgba(239,68,68,0.07)')
                  : 'var(--bg-panel)',
                border: `1.5px solid ${isSelected
                  ? (isBuy ? '#3b82f6' : '#ef4444')
                  : isExecuted ? 'var(--border)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '11px 14px',
                cursor: isExecuted ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                opacity: isExecuted ? 0.4 : 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                width: '100%',
              }}
              onMouseEnter={e => {
                if (!isExecuted && !isSelected)
                  e.currentTarget.style.borderColor = isBuy ? '#93c5fd' : '#fca5a5'
              }}
              onMouseLeave={e => {
                if (!isSelected)
                  e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span style={{
                  fontSize: '10px',
                  color: 'var(--text-dim)',
                  fontFamily: 'var(--font-mono)',
                  minWidth: '22px',
                }}>#{i + 1}</span>

                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: isBuy ? 'var(--accent-blue)' : 'var(--accent-red)',
                  background: isBuy ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  letterSpacing: '0.5px',
                }}>{order.side}</span>

                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-hover)',
                  padding: '2px 7px',
                  borderRadius: '6px',
                }}>{order.type}</span>

                {isExecuted && (
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '10px',
                    color: 'var(--accent-green)',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                  }}>✓ DONE</span>
                )}

                {isSelected && !isExecuted && (
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '10px',
                    color: 'var(--accent-blue)',
                    fontWeight: 700,
                  }}>● SELECTED</span>
                )}
              </div>

              {/* Bottom row */}
              <div style={{
                display: 'flex',
                gap: '14px',
                paddingLeft: '30px',
              }}>
                <span style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                }}>
                  Qty: <strong style={{ color: 'var(--text-primary)' }}>{order.qty}</strong>
                </span>
                {order.price ? (
                  <span style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                  }}>
                    @ <strong style={{ color: 'var(--accent-yellow)' }}>{order.price}</strong>
                  </span>
                ) : (
                  <span style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-dim)',
                  }}>Market Price</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}