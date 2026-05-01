export default function ChartToolbar({
  isRealMarket,
  candles,
  priceHistory,
  currentPrice,
  viewRef,
  redrawMainChart,
  drawOverlay,
  tool,
  setTool,
  drawings,
  setDrawings,
  setDrawing
}) {
  return (
    <div style={{
      padding: '10px 20px',
      display: 'flex', alignItems: 'center', gap: '12px',
      flexShrink: 0, borderBottom: '1px solid var(--border)',
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
        Price Chart
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '22px',
        fontWeight: 700, color: 'var(--accent-blue)',
      }}>
        {Math.round(currentPrice)}
      </span>

      {(isRealMarket ? candles.length > 0 : priceHistory.length > 1) && (() => {
        const firstPrice = isRealMarket ? candles[0].open : Math.round(priceHistory[0].price)
        const lastPrice = isRealMarket ? candles[candles.length - 1].close : Math.round(priceHistory[priceHistory.length - 1].price)
        const diff = lastPrice - firstPrice
        const pct = firstPrice ? ((diff / firstPrice) * 100).toFixed(1) : 0
        const up = diff >= 0
        return (
          <span style={{
            fontSize: '13px', fontWeight: 700,
            color: up ? 'var(--accent-green)' : 'var(--accent-red)',
            background: up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            padding: '3px 10px', borderRadius: '999px',
          }}>
            {up ? '▲' : '▼'} {Math.abs(diff)} ({pct}%)
          </span>
        )
      })()}

      <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />

      <button
        onClick={() => {
          viewRef.current = { offsetY: 0, offsetX: 0, scaleY: 1, scaleX: 1 }
          redrawMainChart()
          drawOverlay()
        }}
        style={{
          fontSize: '12px', fontWeight: 600,
          padding: '6px 12px', borderRadius: '8px',
          border: '1.5px solid var(--border)',
          background: 'var(--bg-card)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
        }}
      >
        ⊡ Reset View
      </button>

      <button
        onClick={() => setTool(t => t === 'trendline' ? null : 'trendline')}
        style={{
          fontSize: '12px', fontWeight: 600,
          padding: '6px 14px', borderRadius: '8px',
          border: `1.5px solid ${tool === 'trendline' ? '#f59e0b' : 'var(--border)'}`,
          background: tool === 'trendline' ? 'rgba(245,158,11,0.1)' : 'var(--bg-card)',
          color: tool === 'trendline' ? '#f59e0b' : 'var(--text-secondary)',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        📈 Trendline
      </button>

      <button
        onClick={() => setTool(t => t === 'hline' ? null : 'hline')}
        style={{
          fontSize: '12px', fontWeight: 600,
          padding: '6px 14px', borderRadius: '8px',
          border: `1.5px solid ${tool === 'hline' ? '#a855f7' : 'var(--border)'}`,
          background: tool === 'hline' ? 'rgba(168,85,247,0.1)' : 'var(--bg-card)',
          color: tool === 'hline' ? '#a855f7' : 'var(--text-secondary)',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        ➖ H-Line
      </button>

      {drawings.length > 0 && (
        <button
          onClick={() => { setDrawings([]); setDrawing(null) }}
          style={{
            fontSize: '12px', fontWeight: 600,
            padding: '6px 12px', borderRadius: '8px',
            border: '1.5px solid #fca5a5',
            background: 'rgba(239,68,68,0.05)',
            color: '#ef4444', cursor: 'pointer',
          }}
        >
          🗑 Clear
        </button>
      )}

      <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
        {tool === 'trendline' ? 'Click & drag to draw'
          : tool === 'hline' ? 'Click to place — drag dot to move'
          : 'Drag to pan · Scroll to zoom'}
      </span>

      <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto', flexWrap: 'wrap' }}>
        {[
          { color: '#3b82f6', label: 'BUY' },
          { color: '#ef4444', label: 'SELL' },
          { color: 'rgba(59,130,246,0.5)', label: 'Vol>100', dashed: true },
          { color: '#f59e0b', label: 'Trend' },
          { color: '#a855f7', label: 'H-Line', dashed: true },
        ].map(({ color, label, dashed }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {dashed
              ? <div style={{ width: '14px', height: '2px', borderTop: `2px dashed ${color}` }} />
              : <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color }} />
            }
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
        {priceHistory?.length || 0} exec
      </span>
    </div>
  )
}
