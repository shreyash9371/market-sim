import { useEffect, useRef, useState, useCallback } from 'react'

export default function PriceChart({ priceHistory, currentPrice, orderBook }) {
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)

  const viewRef = useRef({ offsetY: 0, offsetX: 0, scaleY: 1, scaleX: 1 })
  const panRef = useRef(null)

  const [tool, setTool] = useState(null)
  const [drawings, setDrawings] = useState([])
  const [drawing, setDrawing] = useState(null)
  const [draggingIndex, setDraggingIndex] = useState(null)

  const priceRangeRef = useRef({
    minPrice: 90, maxPrice: 110,
    minIdx: 0, maxIdx: 10,
    PAD_LEFT: 60, PAD_RIGHT: 110,
    PAD_TOP: 40, PAD_BOTTOM: 55,
  })

  // ════════════════════════════════════════════════════════════
  //  COORDINATE HELPERS
  // ════════════════════════════════════════════════════════════
  function getEffectiveRange() {
    const { minPrice, maxPrice, minIdx, maxIdx } = priceRangeRef.current
    const { offsetY, offsetX, scaleY, scaleX } = viewRef.current

    const priceRange = (maxPrice - minPrice) / scaleY
    const midPrice = (minPrice + maxPrice) / 2 + offsetY
    const effMin = midPrice - priceRange / 2
    const effMax = midPrice + priceRange / 2

    const idxRange = (maxIdx - minIdx) / scaleX
    const midIdx = (minIdx + maxIdx) / 2 + offsetX
    const effMinIdx = midIdx - idxRange / 2
    const effMaxIdx = midIdx + idxRange / 2

    return { effMin, effMax, effMinIdx, effMaxIdx }
  }

  function priceToY(price, H) {
    const { PAD_TOP, PAD_BOTTOM } = priceRangeRef.current
    const chartH = H - PAD_TOP - PAD_BOTTOM
    const { effMin, effMax } = getEffectiveRange()
    return PAD_TOP + chartH - ((price - effMin) / (effMax - effMin)) * chartH
  }

  function yToPrice(y, H) {
    const { PAD_TOP, PAD_BOTTOM } = priceRangeRef.current
    const chartH = H - PAD_TOP - PAD_BOTTOM
    const { effMin, effMax } = getEffectiveRange()
    return effMax - ((y - PAD_TOP) / chartH) * (effMax - effMin)
  }

  function idxToX(idx, W) {
    const { PAD_LEFT, PAD_RIGHT } = priceRangeRef.current
    const chartW = W - PAD_LEFT - PAD_RIGHT
    const { effMinIdx, effMaxIdx } = getEffectiveRange()
    return PAD_LEFT + ((idx - effMinIdx) / (effMaxIdx - effMinIdx)) * chartW
  }

  function xToIdx(x, W) {
    const { PAD_LEFT, PAD_RIGHT } = priceRangeRef.current
    const chartW = W - PAD_LEFT - PAD_RIGHT
    const { effMinIdx, effMaxIdx } = getEffectiveRange()
    return effMinIdx + ((x - PAD_LEFT) / chartW) * (effMaxIdx - effMinIdx)
  }

  function xRatioToIdx(ratio) {
    const { minIdx, maxIdx } = priceRangeRef.current
    return minIdx + ratio * (maxIdx - minIdx)
  }

  function idxToXRatio(idx) {
    const { minIdx, maxIdx } = priceRangeRef.current
    return (idx - minIdx) / (maxIdx - minIdx)
  }

  function getCanvasPos(e) {
    const o = overlayRef.current
    if (!o) return { x: 0, y: 0 }
    const rect = o.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function getSize() {
    const o = overlayRef.current
    if (!o) return { W: 800, H: 400 }
    return { W: o.offsetWidth, H: o.offsetHeight }
  }

  // ════════════════════════════════════════════════════════════
  //  DRAW OVERLAY
  // ════════════════════════════════════════════════════════════
  const drawOverlay = useCallback(() => {
    const overlay = overlayRef.current
    if (!overlay) return
    const W = overlay.offsetWidth
    const H = overlay.offsetHeight
    const dpr = window.devicePixelRatio || 1
    overlay.width = W * dpr
    overlay.height = H * dpr
    const ctx = overlay.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const { PAD_LEFT, PAD_RIGHT, PAD_TOP, PAD_BOTTOM } = priceRangeRef.current
    const chartW = W - PAD_LEFT - PAD_RIGHT
    const chartH = H - PAD_TOP - PAD_BOTTOM

    const allLines = drawing ? [...drawings, drawing] : drawings

    allLines.forEach(line => {
      ctx.save()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (line.type === 'trendline') {
        const idx1 = xRatioToIdx(line.x1ratio)
        const idx2 = xRatioToIdx(line.x2ratio)
        const x1 = idxToX(idx1, W)
        const y1 = priceToY(line.price1, H)
        const x2 = idxToX(idx2, W)
        const y2 = priceToY(line.price2, H)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 2
        ctx.setLineDash([])
        ctx.stroke()

        ;[{ x: x1, y: y1, p: line.price1 }, { x: x2, y: y2, p: line.price2 }].forEach(pt => {
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2)
          ctx.fillStyle = '#f59e0b'
          ctx.fill()
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = '#fff'
          ctx.fill()
          ctx.fillStyle = '#f59e0b'
          ctx.font = 'bold 10px DM Mono, monospace'
          ctx.textAlign = 'center'
          ctx.fillText(Math.round(pt.p), pt.x, pt.y - 10)
        })

      } else if (line.type === 'hline') {
        const y = priceToY(line.price1, H)
        const midX = PAD_LEFT + chartW / 2

        if (y < PAD_TOP || y > PAD_TOP + chartH) {
          ctx.restore()
          return
        }

        ctx.beginPath()
        ctx.moveTo(PAD_LEFT, y)
        ctx.lineTo(PAD_LEFT + chartW, y)
        ctx.strokeStyle = '#a855f7'
        ctx.lineWidth = 2
        ctx.setLineDash([7, 4])
        ctx.stroke()
        ctx.setLineDash([])

        ctx.beginPath()
        ctx.arc(midX, y, 6, 0, Math.PI * 2)
        ctx.fillStyle = '#a855f7'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(midX, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()

        const tagW = 50, tagH = 20
        const tagX = PAD_LEFT + chartW + 4
        ctx.fillStyle = '#a855f7'
        ctx.beginPath()
        ctx.roundRect(tagX, y - tagH / 2, tagW, tagH, 4)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 10px DM Mono, monospace'
        ctx.textAlign = 'center'
        ctx.fillText(Math.round(line.price1), tagX + tagW / 2, y + 4)
      }

      ctx.restore()
    })
  }, [drawings, drawing])

  useEffect(() => {
    drawOverlay()
  }, [drawOverlay, drawings, drawing, priceHistory, currentPrice, orderBook])

  // ════════════════════════════════════════════════════════════
  //  MOUSE HANDLERS
  // ════════════════════════════════════════════════════════════
  function handleMouseDown(e) {
    const { x, y } = getCanvasPos(e)
    const { W, H } = getSize()
    const { PAD_LEFT, PAD_RIGHT } = priceRangeRef.current
    const chartW = W - PAD_LEFT - PAD_RIGHT
    const midX = PAD_LEFT + chartW / 2

    // Check hline drag handle
    for (let i = 0; i < drawings.length; i++) {
      const line = drawings[i]
      if (line.type !== 'hline') continue
      const lineY = priceToY(line.price1, H)
      if (Math.abs(y - lineY) < 12 && Math.abs(x - midX) < 20) {
        setDraggingIndex(i)
        return
      }
    }

    if (!tool) {
      panRef.current = {
        startX: x,
        startY: y,
        startOffsetX: viewRef.current.offsetX,
        startOffsetY: viewRef.current.offsetY,
      }
      return
    }

    const price = yToPrice(y, H)
    const idx = xToIdx(x, W)
    const xRatio = idxToXRatio(idx)

    if (tool === 'hline') {
      setDrawings(prev => [...prev, { type: 'hline', price1: price }])
      setTool(null)
    } else if (tool === 'trendline') {
      setDrawing({
        type: 'trendline',
        price1: price, x1ratio: xRatio,
        price2: price, x2ratio: xRatio,
      })
    }
  }

  function handleMouseMove(e) {
    const { x, y } = getCanvasPos(e)
    const { W, H } = getSize()

    // Dragging hline
    if (draggingIndex !== null) {
      const newPrice = yToPrice(y, H)
      setDrawings(prev => prev.map((d, i) =>
        i === draggingIndex ? { ...d, price1: newPrice } : d
      ))
      return
    }

    // Panning — FLIPPED signs so chart content follows the cursor
    if (panRef.current && !tool) {
      const { PAD_TOP, PAD_BOTTOM, minPrice, maxPrice, minIdx, maxIdx } = priceRangeRef.current
      const chartH = H - PAD_TOP - PAD_BOTTOM
      const chartW = W - priceRangeRef.current.PAD_LEFT - priceRangeRef.current.PAD_RIGHT

      const pricePerPx = (maxPrice - minPrice) / viewRef.current.scaleY / chartH
      const idxPerPx = (maxIdx - minIdx) / viewRef.current.scaleX / chartW

      const dy = y - panRef.current.startY
      const dx = x - panRef.current.startX

      viewRef.current = {
        ...viewRef.current,
        // FLIPPED: drag right → content moves right (offsetX decreases)
        offsetX: panRef.current.startOffsetX - dx * idxPerPx,
        // FLIPPED: drag up → content moves up (offsetY increases)
        offsetY: panRef.current.startOffsetY + dy * pricePerPx,
      }

      redrawMainChart()
      drawOverlay()
      return
    }

    // Drawing trendline
    if (drawing && tool === 'trendline') {
      const idx = xToIdx(x, W)
      setDrawing(prev => ({
        ...prev,
        price2: yToPrice(y, H),
        x2ratio: idxToXRatio(idx),
      }))
    }
  }

  function handleMouseUp(e) {
    if (draggingIndex !== null) {
      setDraggingIndex(null)
      return
    }

    if (panRef.current) {
      panRef.current = null
      return
    }

    if (drawing && tool === 'trendline') {
      const { x, y } = getCanvasPos(e)
      const { W, H } = getSize()
      const price2 = yToPrice(y, H)
      const idx2 = xToIdx(x, W)
      const x2ratio = idxToXRatio(idx2)
      const dx = Math.abs(x2ratio - drawing.x1ratio)
      const dp = Math.abs(price2 - drawing.price1)
      if (dx > 0.01 || dp > 0.3) {
        setDrawings(prev => [...prev, { ...drawing, price2, x2ratio }])
      }
      setDrawing(null)
      setTool(null)
    }
  }

  function handleWheel(e) {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.90
    viewRef.current = {
      ...viewRef.current,
      scaleY: Math.max(0.15, Math.min(20, viewRef.current.scaleY * zoomFactor)),
    }
    redrawMainChart()
    drawOverlay()
  }

  function getCursor() {
    if (draggingIndex !== null) return 'grabbing'
    if (panRef.current) return 'grabbing'
    if (tool === 'trendline') return 'crosshair'
    if (tool === 'hline') return 'row-resize'
    return 'grab'
  }

  // ════════════════════════════════════════════════════════════
  //  MAIN CHART DRAW
  // ════════════════════════════════════════════════════════════
  const redrawMainChart = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const W = rect.width
    const H = rect.height
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)

    const PAD_LEFT = 60
    const PAD_RIGHT = 110
    const PAD_TOP = 40
    const PAD_BOTTOM = 55
    const chartW = W - PAD_LEFT - PAD_RIGHT
    const chartH = H - PAD_TOP - PAD_BOTTOM

    const points = priceHistory || []
    const total = points.length

    const allPrices = [
      ...points.map(p => p.price),
      ...(orderBook?.bids || []).map(b => parseInt(b.price)),
      ...(orderBook?.asks || []).map(a => parseInt(a.price)),
      Math.round(currentPrice),
    ].filter(Boolean)

    const rawMin = allPrices.length ? Math.min(...allPrices) : currentPrice - 5
    const rawMax = allPrices.length ? Math.max(...allPrices) : currentPrice + 5
    const pad = Math.max(Math.ceil((rawMax - rawMin) * 0.18), 3)
    const minPrice = rawMin - pad
    const maxPrice = rawMax + pad
    const minIdx = 0
    const maxIdx = Math.max(total - 1, 9)

    priceRangeRef.current = {
      minPrice, maxPrice, minIdx, maxIdx,
      PAD_LEFT, PAD_RIGHT, PAD_TOP, PAD_BOTTOM,
    }

    const { effMin, effMax, effMinIdx, effMaxIdx } = getEffectiveRange()

    const toX = (idx) =>
      PAD_LEFT + ((idx - effMinIdx) / (effMaxIdx - effMinIdx)) * chartW

    const toY = (price) =>
      PAD_TOP + chartH - ((price - effMin) / (effMax - effMin)) * chartH

    // Clip chart content
    ctx.save()
    ctx.beginPath()
    ctx.rect(PAD_LEFT, PAD_TOP, chartW, chartH)
    ctx.clip()

    // GRID Y
    const rawStep = (effMax - effMin) / 6
    const magnitude = Math.pow(10, Math.floor(Math.log10(Math.max(rawStep, 0.01))))
    const step = Math.ceil(rawStep / magnitude) * magnitude
    const firstLabel = Math.ceil(effMin / step) * step

    for (let p = firstLabel; p <= effMax; p += step) {
      const y = toY(p)
      ctx.strokeStyle = '#f1f5f9'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(PAD_LEFT, y)
      ctx.lineTo(PAD_LEFT + chartW, y)
      ctx.stroke()
    }

    // GRID X
    const vCount = Math.min(Math.max(total, 6), 10)
    for (let i = 0; i <= vCount; i++) {
      const x = PAD_LEFT + (i / vCount) * chartW
      ctx.strokeStyle = '#f8fafc'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, PAD_TOP)
      ctx.lineTo(x, PAD_TOP + chartH)
      ctx.stroke()
    }

    // VOLUME ZONES > 100
    const bids = orderBook?.bids || []
    const asks = orderBook?.asks || []

    asks.forEach(a => {
      const price = parseInt(a.price)
      const qty = a.qty
      if (!price || !qty || qty <= 100) return
      const y = toY(price)
      const intensity = Math.min((qty - 100) / 100, 1)
      const zoneH = 12 + intensity * 16
      const grad = ctx.createLinearGradient(PAD_LEFT, 0, PAD_LEFT + chartW, 0)
      grad.addColorStop(0, `rgba(239,68,68,${0.10 + intensity * 0.08})`)
      grad.addColorStop(1, `rgba(239,68,68,0.01)`)
      ctx.fillStyle = grad
      ctx.fillRect(PAD_LEFT, y - zoneH / 2, chartW, zoneH)
      ctx.strokeStyle = `rgba(239,68,68,${0.30 + intensity * 0.25})`
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(PAD_LEFT, y)
      ctx.lineTo(PAD_LEFT + chartW, y)
      ctx.stroke()
      ctx.setLineDash([])
    })

    bids.forEach(b => {
      const price = parseInt(b.price)
      const qty = b.qty
      if (!price || !qty || qty <= 100) return
      const y = toY(price)
      const intensity = Math.min((qty - 100) / 100, 1)
      const zoneH = 12 + intensity * 16
      const grad = ctx.createLinearGradient(PAD_LEFT, 0, PAD_LEFT + chartW, 0)
      grad.addColorStop(0, `rgba(59,130,246,${0.10 + intensity * 0.08})`)
      grad.addColorStop(1, `rgba(59,130,246,0.01)`)
      ctx.fillStyle = grad
      ctx.fillRect(PAD_LEFT, y - zoneH / 2, chartW, zoneH)
      ctx.strokeStyle = `rgba(59,130,246,${0.30 + intensity * 0.25})`
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(PAD_LEFT, y)
      ctx.lineTo(PAD_LEFT + chartW, y)
      ctx.stroke()
      ctx.setLineDash([])
    })

    // AREA FILL
    if (points.length >= 1) {
      ctx.beginPath()
      if (points.length === 1) {
        const x = toX(0)
        const y = toY(points[0].price)
        ctx.moveTo(x - 20, y)
        ctx.lineTo(x + 20, y)
        ctx.lineTo(x + 20, PAD_TOP + chartH)
        ctx.lineTo(x - 20, PAD_TOP + chartH)
      } else {
        ctx.moveTo(toX(0), toY(points[0].price))
        points.forEach((p, i) => {
          if (i > 0) ctx.lineTo(toX(i), toY(p.price))
        })
        ctx.lineTo(toX(total - 1), PAD_TOP + chartH)
        ctx.lineTo(toX(0), PAD_TOP + chartH)
      }
      ctx.closePath()
      const areaGrad = ctx.createLinearGradient(0, PAD_TOP, 0, PAD_TOP + chartH)
      areaGrad.addColorStop(0, 'rgba(59,130,246,0.07)')
      areaGrad.addColorStop(1, 'rgba(59,130,246,0.00)')
      ctx.fillStyle = areaGrad
      ctx.fill()
    }

    // LINE
    if (points.length > 1) {
      ctx.beginPath()
      ctx.moveTo(toX(0), toY(points[0].price))
      points.forEach((p, i) => {
        if (i > 0) ctx.lineTo(toX(i), toY(p.price))
      })
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    // DOTS
    points.forEach((p, i) => {
      const x = toX(i)
      const y = toY(p.price)
      const isBuy = p.side === 'BUY'
      const color = isBuy ? '#3b82f6' : '#ef4444'
      const isLast = i === total - 1

      if (isLast) {
        ctx.beginPath()
        ctx.arc(x, y, 12, 0, Math.PI * 2)
        ctx.fillStyle = isBuy ? 'rgba(59,130,246,0.08)' : 'rgba(239,68,68,0.08)'
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fillStyle = isBuy ? 'rgba(59,130,246,0.14)' : 'rgba(239,68,68,0.14)'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x, y, isLast ? 6 : 5, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = isLast ? 10 : 4
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.beginPath()
      ctx.arc(x, y, isLast ? 2.5 : 2, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()

      ctx.fillStyle = color
      ctx.font = 'bold 11px DM Mono, monospace'
      ctx.textAlign = 'center'
      ctx.fillText(Math.round(p.price), x, y - 16)
    })

    ctx.restore() // remove clip

    // Y axis labels
    for (let p = firstLabel; p <= effMax; p += step) {
      const y = toY(p)
      if (y < PAD_TOP || y > PAD_TOP + chartH) continue
      ctx.fillStyle = '#94a3b8'
      ctx.font = '11px DM Mono, monospace'
      ctx.textAlign = 'right'
      ctx.fillText(Math.round(p), PAD_LEFT - 8, y + 4)
    }

    // X axis labels
    points.forEach((p, i) => {
      const x = toX(i)
      if (x < PAD_LEFT || x > PAD_LEFT + chartW) return
      ctx.fillStyle = '#94a3b8'
      ctx.font = '10px DM Sans, monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`#${i + 1}`, x, PAD_TOP + chartH + 18)
      ctx.fillStyle = p.side === 'BUY' ? 'rgba(59,130,246,0.6)' : 'rgba(239,68,68,0.6)'
      ctx.font = '9px DM Sans, monospace'
      ctx.fillText(p.type === 'MARKET' ? 'MKT' : 'LMT', x, PAD_TOP + chartH + 32)
    })

    // Volume zone right labels
    asks.forEach(a => {
      const price = parseInt(a.price)
      const qty = a.qty
      if (!price || !qty || qty <= 100) return
      const y = toY(price)
      if (y < PAD_TOP || y > PAD_TOP + chartH) return
      ctx.fillStyle = `rgba(239,68,68,0.85)`
      ctx.font = 'bold 10px DM Mono, monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`ASK ${price}  ×${qty}`, PAD_LEFT + chartW + 6, y + 4)
    })
    bids.forEach(b => {
      const price = parseInt(b.price)
      const qty = b.qty
      if (!price || !qty || qty <= 100) return
      const y = toY(price)
      if (y < PAD_TOP || y > PAD_TOP + chartH) return
      ctx.fillStyle = `rgba(59,130,246,0.85)`
      ctx.font = 'bold 10px DM Mono, monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`BID ${price}  ×${qty}`, PAD_LEFT + chartW + 6, y + 4)
    })

    // AXES
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(PAD_LEFT, PAD_TOP)
    ctx.lineTo(PAD_LEFT, PAD_TOP + chartH)
    ctx.lineTo(PAD_LEFT + chartW, PAD_TOP + chartH)
    ctx.stroke()

    // EMPTY STATE
    if (points.length === 0) {
      ctx.fillStyle = '#cbd5e1'
      ctx.font = '500 13px DM Sans, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Generate orders and click ▶ Run to see price movement', W / 2 - PAD_RIGHT / 2, H / 2 - 10)
      ctx.font = '12px DM Sans, sans-serif'
      ctx.fillStyle = '#e2e8f0'
      ctx.fillText('Each executed order creates a price dot on the chart', W / 2 - PAD_RIGHT / 2, H / 2 + 12)
    }

    ctx.fillStyle = 'rgba(226,232,240,0.5)'
    ctx.font = 'bold 10px DM Sans, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('MKT/SIM · EXECUTION CHART', PAD_LEFT + 8, PAD_TOP - 14)

  }, [priceHistory, currentPrice, orderBook])

  useEffect(() => {
    redrawMainChart()
    drawOverlay()
  }, [redrawMainChart, drawOverlay])

  useEffect(() => {
    viewRef.current = { offsetY: 0, offsetX: 0, scaleY: 1, scaleX: 1 }
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

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

        {priceHistory.length > 1 && (() => {
          const diff = Math.round(priceHistory[priceHistory.length - 1].price)
            - Math.round(priceHistory[0].price)
          const pct = ((diff / Math.round(priceHistory[0].price)) * 100).toFixed(1)
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
          {priceHistory.length} exec
        </span>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
        <canvas
          ref={overlayRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            cursor: getCursor(),
            background: 'transparent',
          }}
        />
      </div>
    </div>
  )
}