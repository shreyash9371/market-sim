import { useState } from 'react'

export default function BidAskTable({ orderBook, onGenerate, onUpdateLevel }) {
  const [editingCell, setEditingCell] = useState(null)
  // editingCell: { side: 'bid'|'ask', index: number, field: 'price'|'qty' }

  const bids = orderBook?.bids || []
  const asks = orderBook?.asks || []
  const allQtys = [...bids, ...asks].map(r => r.qty)
  const maxQty = allQtys.length ? Math.max(...allQtys) : 1

  const emptyRows = Array.from({ length: 5 }, () => ({ price: '—', qty: 0 }))
  const displayBids = bids.length ? bids : emptyRows
  const displayAsks = asks.length ? asks : emptyRows

  const spread = bids.length && asks.length
    ? (asks[0].price - bids[0].price)
    : null

  function handleCellClick(side, index, field) {
    setEditingCell({ side, index, field })
  }

  function handleCellChange(e, side, index, field) {
    const raw = e.target.value
    // Only allow digits
    if (!/^\d*$/.test(raw)) return
    onUpdateLevel(side, index, field, raw === '' ? '' : parseInt(raw))
  }

  function handleCellBlur(side, index, field, currentValue) {
    // If empty or zero on blur, restore to 1
    if (!currentValue || currentValue === '') {
      onUpdateLevel(side, index, field, 1)
    }
    setEditingCell(null)
  }

  function handleKeyDown(e, side, index, field, currentValue) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      handleCellBlur(side, index, field, currentValue)
    }
  }

  function isEditing(side, index, field) {
    return editingCell?.side === side &&
      editingCell?.index === index &&
      editingCell?.field === field
  }

  function CellValue({ side, index, field, value, color }) {
    const editing = isEditing(side, index, field)
    const isEmpty = value === '—' || value === 0

    return (
      <div
        onClick={() => !isEmpty && handleCellClick(side, index, field)}
        style={{
          position: 'relative',
          zIndex: 1,
          cursor: isEmpty ? 'default' : 'text',
          display: 'flex',
          alignItems: 'center',
          justifyContent: field === 'qty' ? 'flex-end' : 'flex-start',
          paddingLeft: field === 'price' && side === 'ask' ? '10px' : '0',
          height: '100%',
        }}
      >
        {editing ? (
          <input
            autoFocus
            type="text"
            inputMode="numeric"
            value={value === '—' ? '' : value}
            onChange={e => handleCellChange(e, side, index, field)}
            onBlur={() => handleCellBlur(side, index, field, value)}
            onKeyDown={e => handleKeyDown(e, side, index, field, value)}
            style={{
              width: field === 'qty' ? '52px' : '58px',
              background: '#fff',
              border: `2px solid ${color}`,
              borderRadius: '6px',
              padding: '2px 6px',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: color,
              textAlign: field === 'qty' ? 'right' : 'left',
              outline: 'none',
              boxShadow: `0 0 0 3px ${color}22`,
            }}
          />
        ) : (
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            color: isEmpty ? 'var(--text-dim)' : color,
            borderBottom: isEmpty ? 'none' : '1px dashed transparent',
            transition: 'border-color 0.15s',
            padding: '1px 2px',
            borderRadius: '3px',
          }}
            onMouseEnter={e => {
              if (!isEmpty) e.currentTarget.style.borderBottomColor = color
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderBottomColor = 'transparent'
            }}
          >
            {value === '—' ? '—' : value}
          </span>
        )}
      </div>
    )
  }

  return (
    <div style={{
      width: '300px',
      background: 'var(--bg-panel)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-md)',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* Title */}
      <div style={{
        padding: '14px 18px 10px',
        borderBottom: '1.5px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Order Book
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {bids.length > 0 && (
            <span style={{
              fontSize: '10px',
              color: 'var(--text-dim)',
              fontStyle: 'italic',
              letterSpacing: '0.3px',
            }}>
              click to edit
            </span>
          )}
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: bids.length ? 'var(--accent-green)' : 'var(--text-dim)',
          }} />
          <span style={{
            fontSize: '11px', color: 'var(--text-dim)',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            {bids.length ? 'Live' : 'Empty'}
          </span>
        </div>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 0.6fr 1fr 0.6fr',
        padding: '7px 14px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {['Bid Price', 'Qty', 'Ask Price', 'Qty'].map((h, i) => (
          <span key={i} style={{
            fontSize: '11px',
            fontWeight: 700,
            color: i < 2 ? 'var(--accent-blue)' : 'var(--accent-red)',
            textAlign: i % 2 === 0 ? 'left' : 'right',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
          }}>{h}</span>
        ))}
      </div>

      {/* Ask rows — shown top (high to low reversed for display) */}
      <div style={{
        borderBottom: '2px solid var(--border)',
        background: 'rgba(239,68,68,0.02)',
      }}>
        {[...displayAsks].reverse().map((ask, ri) => {
          const i = displayAsks.length - 1 - ri
          const askPct = ask.qty ? (ask.qty / maxQty) * 44 : 0
          const isHighVol = ask.qty > 50

          return (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 0.6fr 1fr 0.6fr',
              padding: '0 14px',
              height: '34px',
              alignItems: 'center',
              position: 'relative',
              borderBottom: '1px solid var(--border)',
              background: isHighVol ? 'rgba(239,68,68,0.04)' : 'transparent',
            }}>
              {/* Ask depth bar */}
              <div style={{
                position: 'absolute', right: 0, top: 0,
                height: '100%', width: `${askPct}%`,
                background: 'rgba(239,68,68,0.07)',
                borderRadius: '3px 0 0 3px',
              }} />

              {/* Empty bid side */}
              <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>—</span>
              <span style={{ fontSize: '13px', color: 'var(--text-dim)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>—</span>

              {/* Ask Price */}
              <CellValue
                side="ask" index={i} field="price"
                value={ask.price ?? '—'}
                color="var(--accent-red)"
              />

              {/* Ask Qty */}
              <CellValue
                side="ask" index={i} field="qty"
                value={ask.qty || '—'}
                color={isHighVol ? 'var(--accent-yellow)' : 'var(--text-secondary)'}
              />
            </div>
          )
        })}
      </div>

      {/* Spread row */}
      <div style={{
        padding: '6px 14px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: '11px', color: 'var(--text-dim)',
          textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>Spread</span>
        <span style={{
          fontSize: '13px', fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          color: spread != null ? 'var(--accent-yellow)' : 'var(--text-dim)',
        }}>
          {spread != null ? spread : '—'}
        </span>
      </div>

      {/* Bid rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {displayBids.map((bid, i) => {
          const bidPct = bid.qty ? (bid.qty / maxQty) * 44 : 0
          const isHighVol = bid.qty > 50

          return (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 0.6fr 1fr 0.6fr',
              padding: '0 14px',
              height: '34px',
              alignItems: 'center',
              position: 'relative',
              borderBottom: '1px solid var(--border)',
              background: isHighVol ? 'rgba(59,130,246,0.04)' : 'transparent',
            }}>
              {/* Bid depth bar */}
              <div style={{
                position: 'absolute', left: 0, top: 0,
                height: '100%', width: `${bidPct}%`,
                background: 'rgba(59,130,246,0.07)',
                borderRadius: '0 3px 3px 0',
              }} />

              {/* Bid Price */}
              <CellValue
                side="bid" index={i} field="price"
                value={bid.price ?? '—'}
                color="var(--accent-blue)"
              />

              {/* Bid Qty */}
              <CellValue
                side="bid" index={i} field="qty"
                value={bid.qty || '—'}
                color={isHighVol ? 'var(--accent-yellow)' : 'var(--text-secondary)'}
              />

              {/* Empty ask side */}
              <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', paddingLeft: '10px' }}>—</span>
              <span style={{ fontSize: '13px', color: 'var(--text-dim)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>—</span>
            </div>
          )
        })}
      </div>

      {/* Generate button */}
      <div style={{ padding: '12px 14px', flexShrink: 0 }}>
        <button
          onClick={onGenerate}
          style={{
            width: '100%',
            background: 'var(--accent-blue)',
            border: 'none',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(59,130,246,0.25)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-blue)'}
        >
          ⟳ Generate Randomly
        </button>
      </div>
    </div>
  )
}