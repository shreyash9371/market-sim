import { globalState, setGlobalState, cloneBook, snapshot } from './marketState'
import { generateOrders } from '../../utils/generators'
import { processLiqSweep, processStopHunt } from './marketConditions'
import { executeMarketOrder, executeLimitOrder } from './orderExecution'

export function tickRealMarket() {
  const { orderBook, orders } = globalState
  if (!globalState.isRealMarket || !globalState.playbackPlaying) return
  
  const generated = generateOrders(orderBook)
  if (!generated.length) return
  let order = generated[0]
  
  const condition = globalState.marketCondition
  const phase = globalState.conditionPhase
  const step = globalState.conditionStep
  const anchor = globalState.conditionAnchorPrice
  const midPrice = Math.round(globalState.currentPrice)

  let trendBias = 0.5 
  if (['swing_up', 'move_up_away', 'rally', 'sh_approach', 'spike', 'bounce', 'reversal'].includes(phase)) trendBias = 0.8  
  if (['swing_dn', 'slow_approach', 'sweep_dn', 'sh_pullback', 'rejection', 'pullback', 'sh_reversal'].includes(phase)) trendBias = 0.2

  let updatedBook = cloneBook(globalState.orderBook)
  const side = Math.random() < trendBias ? 'BUY' : 'SELL'
  const qty = Math.floor(Math.random() * 15) + 5  
  order = { ...order, side, qty, type: 'MARKET' }

  if (condition === 'liq_sweep') {
    const res = processLiqSweep(globalState, setGlobalState, midPrice, anchor, step, phase, updatedBook, order)
    order = res.order
    updatedBook = res.updatedBook
  } else if (condition === 'stop_hunt') {
    const res = processStopHunt(globalState, setGlobalState, midPrice, anchor, step, phase, updatedBook, order)
    order = res.order
    updatedBook = res.updatedBook
  }

  globalState.orders = [order, ...orders].slice(0, 100)
  globalState.selectedOrder = order
  const before = snapshot()

  // --- DENSE LIQUIDITY BOT (TIGHT) ---
  {
    const isSweeping = (phase === 'sweep_dn' || phase === 'spike' || phase === 'bounce' || phase === 'rejection')
    
    if (!isSweeping) {
      for (let i = 1; i <= 15; i++) {
        const bp = midPrice - i
        if (!updatedBook.bids.some(b => b.price === bp)) {
          let baseQty = 50
          if (condition === 'liq_sweep' && anchor && bp <= anchor) {
            const dist = Math.abs(bp - anchor)
            if (dist < 0.5) baseQty = 2800
            else if (dist <= 1.5) baseQty = 1400
          }
          updatedBook.bids.push({ price: bp, qty: Math.floor(Math.random() * 50) + baseQty })
        }
        const ap = midPrice + i
        if (!updatedBook.asks.some(a => a.price === ap)) {
          let baseQty = 50
          if (condition === 'stop_hunt' && anchor && ap >= anchor) {
            const dist = Math.abs(ap - anchor)
            if (dist < 0.5) baseQty = 2800
            else if (dist <= 1.5) baseQty = 1400
          }
          updatedBook.asks.push({ price: ap, qty: Math.floor(Math.random() * 50) + baseQty })
        }
      }

      if (anchor && condition) {
        for (let offset = -2; offset <= 2; offset++) {
          const p = Math.round(anchor) + offset
          if (condition === 'liq_sweep' && p <= anchor) {
            const existing = updatedBook.bids.find(b => b.price === p)
            const dist = Math.abs(p - anchor)
            const targetQty = dist < 0.5 ? 2800 : 1400
            if (existing) {
              if (existing.qty < targetQty) existing.qty = targetQty + Math.floor(Math.random() * 100)
            } else {
              updatedBook.bids.push({ price: p, qty: targetQty + Math.floor(Math.random() * 100) })
            }
          }
          if (condition === 'stop_hunt' && p >= anchor) {
            const existing = updatedBook.asks.find(a => a.price === p)
            const dist = Math.abs(p - anchor)
            const targetQty = dist < 0.5 ? 2800 : 1400
            if (existing) {
              if (existing.qty < targetQty) existing.qty = targetQty + Math.floor(Math.random() * 100)
            } else {
              updatedBook.asks.push({ price: p, qty: targetQty + Math.floor(Math.random() * 100) })
            }
          }
        }
      }
    } else {
      if (phase === 'sweep_dn') {
        updatedBook.bids = updatedBook.bids.filter(b => b.price < midPrice - 10)
        updatedBook.asks = updatedBook.asks.filter(a => a.price > midPrice + 2) 
      }
      if (phase === 'spike') {
        updatedBook.asks = updatedBook.asks.filter(a => a.price > midPrice + 10)
        updatedBook.bids = updatedBook.bids.filter(b => b.price < midPrice - 2) 
      }
    }
    
    updatedBook.bids.sort((a, b) => b.price - a.price)
    updatedBook.asks.sort((a, b) => a.price - b.price)
    if (updatedBook.bids.length > 40) updatedBook.bids = updatedBook.bids.slice(0, 40)
    if (updatedBook.asks.length > 40) updatedBook.asks = updatedBook.asks.slice(0, 40)
  }

  let newPrice = globalState.currentPrice
  let didMovePrice = false
  let executionNote = ''

  if (order.type === 'MARKET') {
    const result = executeMarketOrder(order.side, order.qty, updatedBook)
    newPrice = result.newPrice
    updatedBook = result.updatedBook
    didMovePrice = true
    executionNote = order.note 
      ? `[${order.note}] Side: ${order.side} Qty: ${order.qty}`
      : (order.side === 'BUY'
          ? `Market Buy consumed asks up to ${newPrice}`
          : `Market Sell consumed bids down to ${newPrice}`)
  } else {
    const result = executeLimitOrder(order.side, order.price, order.qty, updatedBook)
    updatedBook = result.updatedBook
    if (result.movedPrice && result.newPrice !== null) {
      newPrice = result.newPrice
      didMovePrice = true
      executionNote = `Limit ${order.side} @ ${order.price} crossed spread → filled at ${newPrice}`
    } else {
      newPrice = globalState.currentPrice
      didMovePrice = false
      executionNote = `Limit ${order.side} @ ${order.price} added to book (passive)`
    }
  }

  const updatedOrders = globalState.orders.map(o =>
    o.id === order.id ? { ...o, status: 'EXECUTED' } : o
  )

  const finalPriceHistory = didMovePrice
    ? [
        ...globalState.priceHistory.slice(-499),
        {
          price: newPrice,
          type: order.type,
          side: order.side,
          qty: order.qty,
          orderId: order.id,
          note: executionNote,
          time: Date.now()
        },
      ]
    : globalState.priceHistory.slice(-499)

  const CANDLE_TICKS = 24 
  let newCandles = [...globalState.candles]
  let newTickCount = globalState.candleTickCount
  
  let nextBullishCount = globalState.bullishCount
  let nextBearishCount = globalState.bearishCount
  let nextHighPrice = globalState.swingHighPrice
  let nextLowPrice = globalState.swingLowPrice
  let nextFailCount = globalState.failToBreakCount
  let nextRejection = globalState.rejectionWickDetected
  let nextExecutionCount = globalState.executionCount

  if (globalState.isRealMarket && didMovePrice && order.type === 'MARKET') {
    newTickCount += 1
    nextExecutionCount += 1

    if (newCandles.length === 0) {
      newCandles.push({
        open: newPrice, high: newPrice, low: newPrice, close: newPrice,
        volume: order.qty, tickCount: 1, startTime: Date.now()
      })
      newTickCount = 1
    } else {
      let last = { ...newCandles[newCandles.length - 1] }

      if (newTickCount >= CANDLE_TICKS) {
        const finalClose = last.close
        const candleHigh = last.high
        const candleLow = last.low
        
        if (last.close > last.open) {
          nextBullishCount++
          nextBearishCount = 0
        } else if (last.close < last.open) {
          nextBearishCount++
          nextBullishCount = 0
        }
        
        if (globalState.conditionPhase === 'swing_up' || globalState.conditionPhase === 'rally' || globalState.conditionPhase === 'swing_top' || globalState.conditionPhase === 'sh_top') {
          if (candleHigh > nextHighPrice) {
            nextHighPrice = candleHigh
            nextFailCount = 0
          } else nextFailCount++
          
          const upperWick = candleHigh - Math.max(last.open, last.close)
          if (upperWick > (candleHigh - candleLow) * 0.4) nextRejection = true
        }

        if (globalState.conditionPhase === 'swing_dn' || globalState.conditionPhase === 'swing_bottom') {
          if (candleLow < nextLowPrice) {
            nextLowPrice = candleLow
            nextFailCount = 0
          } else nextFailCount++
          
          const lowerWick = Math.min(last.open, last.close) - candleLow
          if (lowerWick > (candleHigh - candleLow) * 0.4) nextRejection = true
        }

        newCandles[newCandles.length - 1] = last
        newCandles.push({
          open: finalClose, 
          high: Math.max(finalClose, newPrice), 
          low: Math.min(finalClose, newPrice), 
          close: newPrice,
          volume: order.qty, tickCount: 1, startTime: Date.now()
        })
        newTickCount = 1
      } else {
        last.high = Math.max(last.high, newPrice)
        last.low = Math.min(last.low, newPrice)
        last.close = newPrice
        last.volume += order.qty
        last.tickCount = newTickCount
        newCandles[newCandles.length - 1] = last
      }
    }
  }

  if (!isFinite(newPrice)) newPrice = globalState.currentPrice || 100
  
  setGlobalState({
    currentPrice: newPrice,
    priceHistory: finalPriceHistory,
    orders: updatedOrders,
    selectedOrder: null,
    orderBook: updatedBook,
    executionCount: nextExecutionCount,
    history: [...globalState.history, before],
    future: [],
    candles: newCandles,
    candleTickCount: newTickCount,
    bullishCount: nextBullishCount,
    bearishCount: nextBearishCount,
    swingHighPrice: nextHighPrice,
    swingLowPrice: nextLowPrice,
    failToBreakCount: nextFailCount,
    rejectionWickDetected: nextRejection,
  })
}
