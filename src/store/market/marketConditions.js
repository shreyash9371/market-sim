export function processLiqSweep(globalState, setGlobalState, mid, anchor, step, phase, updatedBook, order) {
  let newOrder = { ...order }
  
  if (phase === 'swing_dn') {
    if (globalState.bearishCount >= 4 && step >= 48) {
      setGlobalState({ conditionPhase: 'swing_bottom', conditionStep: 0 })
    } else { setGlobalState({ conditionStep: step + 1 }) }

  } else if (phase === 'swing_bottom') {
    if (globalState.failToBreakCount >= 2 && globalState.rejectionWickDetected) {
      setGlobalState({ 
        conditionPhase: 'move_up_away', 
        conditionStep: 0, 
        conditionAnchorPrice: globalState.swingLowPrice 
      })
    } else {
      setGlobalState({ conditionStep: step + 1 })
      if (step >= 48) {
        setGlobalState({ 
          conditionPhase: 'move_up_away', 
          conditionStep: 0, 
          conditionAnchorPrice: globalState.swingLowPrice 
        })
      }
    }

  } else if (phase === 'move_up_away') {
    if (step >= 240) {
      const arr = { price: globalState.swingLowPrice, candleIdx: globalState.candles.length, label: 'POOL', color: '#0f172a' }
      setGlobalState({ 
        conditionPhase: 'slow_approach', 
        conditionStep: 0, 
        conditionAnchorPrice: globalState.swingLowPrice, 
        conditionArrows: [...globalState.conditionArrows, arr] 
      })
    } else { setGlobalState({ conditionStep: step + 1 }) }

  } else if (phase === 'slow_approach') {
    if (mid <= anchor + 15 && step >= 120) {
      setGlobalState({ conditionPhase: 'sweep_dn', conditionStep: 0 })
    } else {
      setGlobalState({ conditionStep: step + 1 })
      if (step >= 400) setGlobalState({ conditionPhase: 'sweep_dn', conditionStep: 0 })
    }

  } else if (phase === 'sweep_dn') {
    const burstQty = Math.floor(Math.random() * 300) + 400 
    newOrder = { ...newOrder, type: 'MARKET', side: 'SELL', qty: burstQty, note: 'CONSUMING LIQUIDITY' }
    
    updatedBook.bids = updatedBook.bids.filter(b => b.price < mid - 1)
    
    if (step >= 18 || (anchor !== null && mid < anchor - 10)) {
      setGlobalState({ conditionPhase: 'exhaustion', conditionStep: 0 })
    } else {
      setGlobalState({ conditionStep: step + 1 })
    }
  } else if (phase === 'exhaustion') {
    const churnQty = Math.floor(Math.random() * 50) + 20
    const side = Math.random() > 0.6 ? 'BUY' : 'SELL'
    newOrder = { ...newOrder, type: 'MARKET', side, qty: churnQty, note: 'ABSORPTION' }

    if (step >= 8) {
      const nextPhase = 'bounce'
      setGlobalState({ conditionPhase: nextPhase, conditionStep: 0 })
    } else {
      setGlobalState({ conditionStep: step + 1 })
    }

  } else if (phase === 'bounce') {
    const shiftQty = Math.floor(Math.random() * 200) + 400 
    newOrder = { ...newOrder, type: 'MARKET', side: 'BUY', qty: shiftQty, note: 'INSTITUTIONAL SHIFT' }
    
    updatedBook.asks = updatedBook.asks.filter(a => a.price > mid + 2)

    if (anchor !== null) {
      updatedBook.bids = updatedBook.bids.filter(b => Math.abs(b.price - anchor) > 2)
    }

    if (anchor !== null && mid >= anchor) {
      setGlobalState({ conditionPhase: 'reversal', conditionStep: 0 })
    } else {
      setGlobalState({ conditionStep: step + 1 })
      if (step >= 16) setGlobalState({ conditionPhase: 'reversal', conditionStep: 0 })
    }

  } else if (phase === 'reversal') {
    newOrder = { ...newOrder, type: 'MARKET', side: 'BUY', qty: Math.floor(Math.random() * 20) + 10 }
    if (step >= 300) {
      const arr = { price: mid, candleIdx: globalState.candles.length, label: 'SWEPT', color: '#10b981' }
      setGlobalState({ conditionPhase: 'done', conditionArrows: [...globalState.conditionArrows, arr] })
    } else {
      setGlobalState({ conditionStep: step + 1 })
    }

  } else if (phase === 'done') {
    setGlobalState({ marketCondition: null, conditionPhase: null }); 
  }

  return { order: newOrder, updatedBook }
}

export function processStopHunt(globalState, setGlobalState, mid, anchor, step, phase, updatedBook, order) {
  let newOrder = { ...order }
  
  if (phase === 'rally') {
    if (globalState.bullishCount >= 4 && step >= 48) {
      setGlobalState({ conditionPhase: 'sh_top', conditionStep: 0 })
    } else { setGlobalState({ conditionStep: step + 1 }) }

  } else if (phase === 'sh_top') {
    if (globalState.failToBreakCount >= 2 && globalState.rejectionWickDetected) {
      setGlobalState({ conditionPhase: 'sh_pullback', conditionStep: 0, conditionAnchorPrice: globalState.swingHighPrice })
    } else {
      setGlobalState({ conditionStep: step + 1 })
      if (step >= 48) setGlobalState({ conditionPhase: 'sh_pullback', conditionStep: 0, conditionAnchorPrice: globalState.swingHighPrice })
    }

  } else if (phase === 'sh_pullback') {
    if (step >= 240) {
      const arr = { price: globalState.swingHighPrice, candleIdx: globalState.candles.length, label: 'POOL', color: '#0f172a' }
      setGlobalState({ 
        conditionPhase: 'sh_approach', 
        conditionStep: 0, 
        conditionAnchorPrice: globalState.swingHighPrice, 
        conditionArrows: [...globalState.conditionArrows, arr] 
      })
    } else setGlobalState({ conditionStep: step + 1 })

  } else if (phase === 'sh_approach') {
    if (mid >= anchor - 15 && step >= 120) {
      setGlobalState({ conditionPhase: 'spike', conditionStep: 0 })
    } else {
      setGlobalState({ conditionStep: step + 1 })
      if (step >= 400) setGlobalState({ conditionPhase: 'spike', conditionStep: 0 })
    }

  } else if (phase === 'spike') {
    const burstQty = Math.floor(Math.random() * 500) + 2500
    newOrder = { ...newOrder, type: 'MARKET', side: 'BUY', qty: burstQty, note: 'SWEEPING POOL' }
    
    updatedBook.asks = updatedBook.asks.filter(a => a.price > mid + 1 && Math.abs(a.price - anchor) > 0.5)
    if (anchor !== null && mid > anchor + 12) {
      setGlobalState({ conditionPhase: 'rejection', conditionStep: 0 })
    } else {
      setGlobalState({ conditionStep: step + 1 })
      if (step >= 12) setGlobalState({ conditionPhase: 'rejection', conditionStep: 0 })
    }

  } else if (phase === 'rejection') {
    newOrder = { ...newOrder, type: 'MARKET', side: 'SELL', qty: Math.floor(Math.random() * 100) + 200 }
    
    if (anchor !== null) {
      updatedBook.bids = updatedBook.bids.filter(b => Math.abs(b.price - anchor) > 2)
      updatedBook.asks = updatedBook.asks.filter(a => Math.abs(a.price - anchor) > 2)
    }

    if (anchor !== null && mid <= anchor - 2) {
      setGlobalState({ conditionPhase: 'sh_reversal', conditionStep: 0 })
    } else {
      setGlobalState({ conditionStep: step + 1 })
      if (step >= 16) setGlobalState({ conditionPhase: 'sh_reversal', conditionStep: 0 })
    }

  } else if (phase === 'sh_reversal') {
    newOrder = { ...newOrder, type: 'MARKET', side: 'SELL', qty: Math.floor(Math.random() * 20) + 10 }
    if (step >= 300) {
      const arr = { price: mid, candleIdx: globalState.candles.length, label: 'HUNTED', color: '#ef4444' }
      setGlobalState({ conditionPhase: 'done', conditionArrows: [...globalState.conditionArrows, arr] })
    } else {
      setGlobalState({ conditionStep: step + 1 })
    }

  } else if (phase === 'done') {
    setGlobalState({ marketCondition: null, conditionPhase: null }); 
  }

  return { order: newOrder, updatedBook }
}
