import { useEffect, useRef, useState, useCallback } from 'react'
import { getCanvasPos, getSize, yToPrice, xToIdx, idxToXRatio, priceToY } from './chart/chartUtils'
import { drawOverlayContent } from './chart/drawOverlay'
import { drawMainContent } from './chart/drawMain'
import ChartToolbar from './chart/ChartToolbar'

export default function PriceChart({ priceHistory, currentPrice, orderBook, isRealMarket, candles = [], conditionArrows = [], conditionAnchorPrice, conditionPhase }) {
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

    drawOverlayContent(ctx, W, H, drawings, drawing, priceRangeRef, viewRef)
  }, [drawings, drawing])

  useEffect(() => {
    drawOverlay()
  }, [drawOverlay, drawings, drawing, priceHistory, currentPrice, orderBook])

  // ════════════════════════════════════════════════════════════
  //  MOUSE HANDLERS
  // ════════════════════════════════════════════════════════════
  function handleMouseDown(e) {
    const { x, y } = getCanvasPos(e, overlayRef.current)
    const { W, H } = getSize(overlayRef.current)
    const { PAD_LEFT, PAD_RIGHT } = priceRangeRef.current
    const chartW = W - PAD_LEFT - PAD_RIGHT
    const midX = PAD_LEFT + chartW / 2

    // Check hline drag handle
    for (let i = 0; i < drawings.length; i++) {
      const line = drawings[i]
      if (line.type !== 'hline') continue
      const lineY = priceToY(line.price1, H, priceRangeRef.current, viewRef.current)
      if (Math.abs(y - lineY) < 12 && Math.abs(x - midX) < 20) {
        setDraggingIndex(i)
        return
      }
    }

    if (!tool) {
      const isYAxisDrag = x > PAD_LEFT + chartW
      panRef.current = {
        startX: x,
        startY: y,
        startOffsetX: viewRef.current.offsetX,
        startOffsetY: viewRef.current.offsetY,
        startScaleY: viewRef.current.scaleY,
        isYAxisDrag,
      }
      return
    }

    const price = yToPrice(y, H, priceRangeRef.current, viewRef.current)
    const idx = xToIdx(x, W, priceRangeRef.current, viewRef.current)
    const xRatio = idxToXRatio(idx, priceRangeRef.current)

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
    const { x, y } = getCanvasPos(e, overlayRef.current)
    const { W, H } = getSize(overlayRef.current)

    // Dragging hline
    if (draggingIndex !== null) {
      const newPrice = yToPrice(y, H, priceRangeRef.current, viewRef.current)
      setDrawings(prev => prev.map((d, i) =>
        i === draggingIndex ? { ...d, price1: newPrice } : d
      ))
      return
    }

    if (panRef.current && !tool) {
      const dy = y - panRef.current.startY
      const dx = x - panRef.current.startX

      if (panRef.current.isYAxisDrag) {
        const zoomDelta = -dy * 0.01;
        viewRef.current = {
          ...viewRef.current,
          scaleY: Math.max(0.1, Math.min(20, panRef.current.startScaleY * Math.exp(zoomDelta)))
        }
      } else {
        const { PAD_TOP, PAD_BOTTOM, minPrice, maxPrice, minIdx, maxIdx, PAD_LEFT, PAD_RIGHT } = priceRangeRef.current
        const chartH = H - PAD_TOP - PAD_BOTTOM
        const chartW = W - PAD_LEFT - PAD_RIGHT

        const pricePerPx = (maxPrice - minPrice) / viewRef.current.scaleY / chartH
        const idxPerPx = (maxIdx - minIdx) / viewRef.current.scaleX / chartW

        viewRef.current = {
          ...viewRef.current,
          offsetX: panRef.current.startOffsetX - dx * idxPerPx,
          offsetY: panRef.current.startOffsetY + dy * pricePerPx,
        }
      }

      redrawMainChart()
      drawOverlay()
      return
    }

    // Drawing trendline
    if (drawing && tool === 'trendline') {
      const idx = xToIdx(x, W, priceRangeRef.current, viewRef.current)
      setDrawing(prev => ({
        ...prev,
        price2: yToPrice(y, H, priceRangeRef.current, viewRef.current),
        x2ratio: idxToXRatio(idx, priceRangeRef.current),
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
      const { x, y } = getCanvasPos(e, overlayRef.current)
      const { W, H } = getSize(overlayRef.current)
      const price2 = yToPrice(y, H, priceRangeRef.current, viewRef.current)
      const idx2 = xToIdx(x, W, priceRangeRef.current, viewRef.current)
      const x2ratio = idxToXRatio(idx2, priceRangeRef.current)
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
      scaleX: Math.max(0.15, Math.min(20, viewRef.current.scaleX * zoomFactor)),
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

    drawMainContent(ctx, W, H, {
      isRealMarket, candles, priceHistory, currentPrice, orderBook,
      conditionAnchorPrice, conditionPhase, conditionArrows,
      priceRangeRef, viewRef
    })
  }, [priceHistory, currentPrice, orderBook, isRealMarket, candles, conditionArrows, conditionAnchorPrice])

  useEffect(() => {
    redrawMainChart()
    drawOverlay()
  }, [redrawMainChart, drawOverlay])

  useEffect(() => {
    viewRef.current = { offsetY: 0, offsetX: 0, scaleY: 1, scaleX: 1 }
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ChartToolbar
        isRealMarket={isRealMarket}
        candles={candles}
        priceHistory={priceHistory}
        currentPrice={currentPrice}
        viewRef={viewRef}
        redrawMainChart={redrawMainChart}
        drawOverlay={drawOverlay}
        tool={tool}
        setTool={setTool}
        drawings={drawings}
        setDrawings={setDrawings}
        setDrawing={setDrawing}
      />

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