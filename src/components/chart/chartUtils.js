export function getEffectiveRange(priceRange, view) {
  const { minPrice, maxPrice, minIdx, maxIdx } = priceRange
  const { offsetY, offsetX, scaleY, scaleX } = view

  const pRange = (maxPrice - minPrice) / scaleY
  const midPrice = (minPrice + maxPrice) / 2 + offsetY
  const effMin = midPrice - pRange / 2
  const effMax = midPrice + pRange / 2

  const idxRange = (maxIdx - minIdx) / scaleX
  const midIdx = (minIdx + maxIdx) / 2 + offsetX
  const effMinIdx = midIdx - idxRange / 2
  const effMaxIdx = midIdx + idxRange / 2

  return { effMin, effMax, effMinIdx, effMaxIdx }
}

export function priceToY(price, H, priceRange, view) {
  const { PAD_TOP, PAD_BOTTOM } = priceRange
  const chartH = H - PAD_TOP - PAD_BOTTOM
  const { effMin, effMax } = getEffectiveRange(priceRange, view)
  return PAD_TOP + chartH - ((price - effMin) / (effMax - effMin)) * chartH
}

export function yToPrice(y, H, priceRange, view) {
  const { PAD_TOP, PAD_BOTTOM } = priceRange
  const chartH = H - PAD_TOP - PAD_BOTTOM
  const { effMin, effMax } = getEffectiveRange(priceRange, view)
  return effMax - ((y - PAD_TOP) / chartH) * (effMax - effMin)
}

export function idxToX(idx, W, priceRange, view) {
  const { PAD_LEFT, PAD_RIGHT } = priceRange
  const chartW = W - PAD_LEFT - PAD_RIGHT
  const { effMinIdx, effMaxIdx } = getEffectiveRange(priceRange, view)
  return PAD_LEFT + ((idx - effMinIdx) / (effMaxIdx - effMinIdx)) * chartW
}

export function xToIdx(x, W, priceRange, view) {
  const { PAD_LEFT, PAD_RIGHT } = priceRange
  const chartW = W - PAD_LEFT - PAD_RIGHT
  const { effMinIdx, effMaxIdx } = getEffectiveRange(priceRange, view)
  return effMinIdx + ((x - PAD_LEFT) / chartW) * (effMaxIdx - effMinIdx)
}

export function xRatioToIdx(ratio, priceRange) {
  const { minIdx, maxIdx } = priceRange
  return minIdx + ratio * (maxIdx - minIdx)
}

export function idxToXRatio(idx, priceRange) {
  const { minIdx, maxIdx } = priceRange
  return (idx - minIdx) / (maxIdx - minIdx)
}

export function getCanvasPos(e, overlay) {
  if (!overlay) return { x: 0, y: 0 }
  const rect = overlay.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

export function getSize(overlay) {
  if (!overlay) return { W: 800, H: 400 }
  return { W: overlay.offsetWidth, H: overlay.offsetHeight }
}
