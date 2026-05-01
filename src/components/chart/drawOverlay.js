import { xRatioToIdx, idxToX, priceToY } from './chartUtils'

export function drawOverlayContent(ctx, W, H, drawings, drawing, priceRangeRef, viewRef) {
  const { PAD_LEFT, PAD_RIGHT, PAD_TOP, PAD_BOTTOM } = priceRangeRef.current
  const chartW = W - PAD_LEFT - PAD_RIGHT
  const chartH = H - PAD_TOP - PAD_BOTTOM

  const allLines = drawing ? [...drawings, drawing] : drawings

  allLines.forEach(line => {
    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (line.type === 'trendline') {
      const idx1 = xRatioToIdx(line.x1ratio, priceRangeRef.current)
      const idx2 = xRatioToIdx(line.x2ratio, priceRangeRef.current)
      const x1 = idxToX(idx1, W, priceRangeRef.current, viewRef.current)
      const y1 = priceToY(line.price1, H, priceRangeRef.current, viewRef.current)
      const x2 = idxToX(idx2, W, priceRangeRef.current, viewRef.current)
      const y2 = priceToY(line.price2, H, priceRangeRef.current, viewRef.current)

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
      const y = priceToY(line.price1, H, priceRangeRef.current, viewRef.current)
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
}
