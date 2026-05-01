import { getEffectiveRange } from './chartUtils'

export function drawMainContent(ctx, W, H, args) {
  const {
    isRealMarket, candles, priceHistory, currentPrice, orderBook,
    conditionAnchorPrice, conditionPhase, conditionArrows,
    priceRangeRef, viewRef
  } = args

  const PAD_LEFT = 20
  const PAD_RIGHT = 80
  const PAD_TOP = 40
  const PAD_BOTTOM = 55
  const chartW = W - PAD_LEFT - PAD_RIGHT
  const chartH = H - PAD_TOP - PAD_BOTTOM

  const points = isRealMarket ? candles : (priceHistory || [])
  const total = points.length

  const allPrices = [
    ...(!isRealMarket ? points.map(p => p.price) : []),
    ...(isRealMarket ? points.map(c => c.high) : []),
    ...(isRealMarket ? points.map(c => c.low) : []),
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

  const { effMin, effMax, effMinIdx, effMaxIdx } = getEffectiveRange(priceRangeRef.current, viewRef.current)

  const toX = (idx) => PAD_LEFT + ((idx - effMinIdx) / (effMaxIdx - effMinIdx)) * chartW
  const toY = (price) => PAD_TOP + chartH - ((price - effMin) / (effMax - effMin)) * chartH

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

  // VOLUME ZONES > 400 (only show exceptional walls, not auto-injected liquidity)
  const bids = orderBook?.bids || []
  const asks = orderBook?.asks || []

  asks.forEach(a => {
    const price = parseInt(a.price)
    const qty = a.qty
    if (!price || !qty || qty <= 400) return
    const y = toY(price)
    const intensity = Math.min((qty - 400) / 200, 1)
    const zoneH = 10 + intensity * 14
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
    if (!price || !qty || qty <= 400) return
    const y = toY(price)
    const intensity = Math.min((qty - 400) / 200, 1)
    const zoneH = 10 + intensity * 14
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
  if (!isRealMarket && points.length >= 1) {
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
  if (!isRealMarket && points.length > 1) {
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

  // DOTS OR CANDLES
  if (!isRealMarket) {
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
  } else {
    const visibleRange = Math.max(effMaxIdx - effMinIdx, 1)
    const candleW = Math.max((chartW / Math.max(visibleRange, 10)) * 0.6, 2)
    points.forEach((c, i) => {
      const x = Math.floor(toX(i))
      const openY = toY(c.open)
      const closeY = toY(c.close)
      const highY = toY(c.high)
      const lowY = toY(c.low)
      const isBull = c.close >= c.open
      const color = isBull ? '#10b981' : '#ef4444' // green or red
      
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x, highY)
      ctx.lineTo(x, Math.min(openY, closeY))
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(x, Math.max(openY, closeY))
      ctx.lineTo(x, lowY)
      ctx.stroke()

      const bodyY = Math.min(openY, closeY)
      const bodyH = Math.max(Math.abs(openY - closeY), 1)
      
      ctx.fillStyle = color
      ctx.fillRect(x - candleW/2, bodyY, candleW, bodyH)
    })
    
    const currY = toY(currentPrice)
    ctx.strokeStyle = '#3b82f6'
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(PAD_LEFT, currY)
    ctx.lineTo(PAD_LEFT + chartW, currY)
    ctx.stroke()
    ctx.setLineDash([])
  }

  ctx.restore() // remove clip

  // CONDITION ANNOTATIONS (arrows, labels, anchor line)
  if (isRealMarket) {
    if (conditionAnchorPrice) {
      const ay = toY(conditionAnchorPrice)
      
      ctx.save()
      // LIQUIDITY ZONE (Subtle Fill)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.04)' // Dark slate
      ctx.fillRect(PAD_LEFT, ay - 8, chartW, 16)
      
      // THE RECTANGULAR BOX (Liquidity Zone)
      ctx.save()
      ctx.fillStyle = 'rgba(38, 166, 154, 0.05)' // Subtle teal zone
      const zoneH = 30
      ctx.fillRect(PAD_LEFT, ay - zoneH/2, chartW, zoneH)
      
      ctx.strokeStyle = 'rgba(38, 166, 154, 0.2)'
      ctx.lineWidth = 1
      ctx.strokeRect(PAD_LEFT, ay - zoneH/2, chartW, zoneH)

      // VISUAL ORDER CLUSTER (Depth Bars)
      const isConsumed = (conditionPhase === 'reversal' || conditionPhase === 'done')
      const zoneTopPrice = conditionAnchorPrice + 15
      const zoneBottomPrice = conditionAnchorPrice - 15
      const relevantLevels = [...(orderBook?.bids || []), ...(orderBook?.asks || [])].filter(
        l => l.price >= zoneBottomPrice && l.price <= zoneTopPrice
      )
      
      relevantLevels.forEach(level => {
        const ly = toY(level.price)
        const barW = Math.min(level.qty / 5, 120) // Scale qty to visual bars
        const baseColor = isConsumed ? 'rgba(100, 116, 139, 0.1)' : 'rgba(38, 166, 154, 0.15)'
        ctx.fillStyle = (!isConsumed && level.qty > 500) ? 'rgba(38, 166, 154, 0.4)' : baseColor
        ctx.fillRect(PAD_LEFT + chartW - barW, ly - 2, barW, 4)
      })

      // THE BLACK LINE (Liquidity Pool)
      ctx.strokeStyle = isConsumed ? 'rgba(15, 23, 42, 0.2)' : '#0f172a'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(PAD_LEFT, ay)
      ctx.lineTo(PAD_LEFT + chartW, ay)
      ctx.stroke()
      
      // LABEL
      ctx.font = 'bold 10px DM Sans, sans-serif'
      ctx.fillStyle = isConsumed ? 'rgba(15, 23, 42, 0.4)' : '#0f172a'
      ctx.textAlign = 'right'
      ctx.fillText(isConsumed ? 'LIQUIDITY CONSUMED' : 'LIQUIDITY CLUSTER', PAD_LEFT + chartW - 10, ay - zoneH/2 - 5)
      ctx.restore()
    }
    
    if (conditionArrows && conditionArrows.length > 0) {
      conditionArrows.forEach(arrow => {
        const y = toY(arrow.price)
        const candleX = Math.max(effMinIdx, Math.min(arrow.candleIdx, effMaxIdx))
        const x = toX(candleX)
        ctx.save()
        ctx.fillStyle = arrow.color
        // Triangle arrow pointing up at the price
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x - 7, y - 14)
        ctx.lineTo(x + 7, y - 14)
        ctx.closePath()
        ctx.fill()
        // Label badge background
        ctx.font = 'bold 10px DM Sans, sans-serif'
        const tw = ctx.measureText(arrow.label).width
        ctx.fillStyle = arrow.color
        ctx.globalAlpha = 0.88
        ctx.beginPath()
        if (ctx.roundRect) ctx.roundRect(x - tw/2 - 6, y - 32, tw + 12, 15, 3)
        else ctx.rect(x - tw/2 - 6, y - 32, tw + 12, 15)
        ctx.fill()
        // Label text
        ctx.globalAlpha = 1
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.fillText(arrow.label, x, y - 21)
        ctx.restore()
      })
    }
  }


  for (let p = firstLabel; p <= effMax; p += step) {
    const y = toY(p)
    if (y < PAD_TOP || y > PAD_TOP + chartH) continue
    ctx.fillStyle = '#94a3b8'
    ctx.font = '11px DM Mono, monospace'
    ctx.textAlign = 'left'
    ctx.fillText(Math.round(p), PAD_LEFT + chartW + 8, y + 4)
  }

  // X axis labels
  if (!isRealMarket) {
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
  } else {
    points.forEach((c, i) => {
      const x = toX(i)
      if (x < PAD_LEFT || x > PAD_LEFT + chartW) return
      
      const date = new Date(c.startTime)
      const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
      
      ctx.fillStyle = '#94a3b8'
      ctx.font = '9px DM Sans, monospace'
      ctx.textAlign = 'center'
      const visibleRange = Math.max(effMaxIdx - effMinIdx, 1)
      if (visibleRange < 15 || i % Math.ceil(visibleRange / 8) === 0) {
        ctx.fillText(timeStr, x, PAD_TOP + chartH + 18)
      }
    })
  }

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
    ctx.fillText(isRealMarket 
      ? 'Set Starting Price and click ▶ Play to simulate real market'
      : 'Generate orders and click ▶ Run to see price movement', W / 2 - PAD_RIGHT / 2, H / 2 - 10)
    ctx.font = '12px DM Sans, sans-serif'
    ctx.fillStyle = '#e2e8f0'
    ctx.fillText(isRealMarket ? 'Candles will appear as orders are executed automatically' : 'Each executed order creates a price dot on the chart', W / 2 - PAD_RIGHT / 2, H / 2 + 12)
  }

  ctx.fillStyle = 'rgba(226,232,240,0.5)'
  ctx.font = 'bold 10px DM Sans, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('MKT/SIM · EXECUTION CHART', PAD_LEFT + 8, PAD_TOP - 14)
}
