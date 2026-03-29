import { useState, useEffect } from 'react'
import { generateOrders, generateOrderBook } from '../utils/generators'

const initialState = {
  orders: [],
  selectedOrder: null,
  orderBook: { asks: [], bids: [], mid: 100 },
  priceHistory: [],
  currentPrice: 100,
  history: [],
  future: [],
  isRealMarket: false,
  playbackPlaying: false,
  playbackSpeed: 1,
  candles: [],
  candleTickCount: 0,   // counts filled market orders toward next candle close
  marketCondition: null,
  conditionPhase: null,
  conditionStep: 0,
  conditionAnchorPrice: null,
  conditionArrows: [],
  // High-Fidelity Swing Tracking
  swingHighPrice: 0,
  swingLowPrice: 999999,
  bullishCount: 0,
  bearishCount: 0,
  failToBreakCount: 0,
  rejectionWickDetected: false,
  executionCount: 0,
}

let globalState = { ...initialState }
let listeners = new Set()

function setGlobalState(partial) {
  globalState = { ...globalState, ...partial }
  listeners.forEach(fn => fn())
}

function cloneBook(ob) {
  return {
    bids: ob.bids.map(b => ({ ...b })),
    asks: ob.asks.map(a => ({ ...a })),
    mid: ob.mid,
  }
}

function recalcMid(book) {
  const bestBid = book.bids[0]?.price || book.mid || 100
  const bestAsk = book.asks[0]?.price || (bestBid + 1)
  book.mid = Math.round((bestBid + bestAsk) / 2)
  return book
}

// ─── MARKET ORDER ───────────────────────────────────────────
// Walks through the book consuming levels until qty is filled.
// Returns the last price level touched = new market price.
function executeMarketOrder(side, qty, book) {
  const book2 = cloneBook(book)
  let remainingQty = qty
  
  // Safety: Use current market price if book side is empty
  let lastPrice = side === 'BUY'
    ? (book2.asks[0]?.price || book.mid || 100)
    : (book2.bids[0]?.price || book.mid || 100)
  
  let fills = []

  if (side === 'BUY') {
    // Consume asks from lowest to highest
    for (let i = 0; i < book2.asks.length && remainingQty > 0; i++) {
      const level = book2.asks[i]
      if (remainingQty >= level.qty) {
        fills.push({ price: level.price, qty: level.qty })
        remainingQty -= level.qty
        lastPrice = level.price
        level.qty = 0
      } else {
        fills.push({ price: level.price, qty: remainingQty })
        level.qty -= remainingQty
        lastPrice = level.price
        remainingQty = 0
      }
    }
    // Remove depleted ask levels
    book2.asks = book2.asks.filter(a => a.qty > 0)

    // Replenish asks above the new top
    while (book2.asks.length < 5) {
      const topAsk = book2.asks.length
        ? book2.asks[book2.asks.length - 1].price
        : (lastPrice || book.mid || 100)
      book2.asks.push({
        price: (Number(topAsk) || 100) + 1,
        qty: Math.floor(Math.random() * 40) + 10,
      })
    }

  } else {
    // SELL — consume bids from highest to lowest
    for (let i = 0; i < book2.bids.length && remainingQty > 0; i++) {
      const level = book2.bids[i]
      if (remainingQty >= level.qty) {
        fills.push({ price: level.price, qty: level.qty })
        remainingQty -= level.qty
        lastPrice = level.price
        level.qty = 0
      } else {
        fills.push({ price: level.price, qty: remainingQty })
        level.qty -= remainingQty
        lastPrice = level.price
        remainingQty = 0
      }
    }
    // Remove depleted bid levels
    book2.bids = book2.bids.filter(b => b.qty > 0)

    // Replenish bids below the new bottom
    while (book2.bids.length < 5) {
      const bottomBid = book2.bids.length
        ? book2.bids[book2.bids.length - 1].price
        : (lastPrice || book.mid || 100)
      book2.bids.push({
        price: (Number(bottomBid) || 100) - 1,
        qty: Math.floor(Math.random() * 40) + 10,
      })
    }
  }

  recalcMid(book2)
  return { newPrice: lastPrice, updatedBook: book2, fills }
}

// ─── LIMIT ORDER ────────────────────────────────────────────
// Does NOT move price. Adds qty to the book at the given level.
// This is a passive resting order — it sits in the book until
// a market order comes and fills it.
function executeLimitOrder(side, price, qty, book) {
  const book2 = cloneBook(book)

  if (side === 'BUY') {
    // Check if this limit buy price crosses the best ask
    // If it does, it acts like a market order up to that level
    if (book2.asks.length && price >= book2.asks[0].price) {
      // Aggressive limit — treat like market buy up to limit price
      let remainingQty = qty
      let lastPrice = book2.asks[0].price
      for (let i = 0; i < book2.asks.length && remainingQty > 0; i++) {
        const level = book2.asks[i]
        if (level.price > price) break // don't go above limit price
        if (remainingQty >= level.qty) {
          remainingQty -= level.qty
          lastPrice = level.price
          level.qty = 0
        } else {
          level.qty -= remainingQty
          lastPrice = level.price
          remainingQty = 0
        }
      }
      book2.asks = book2.asks.filter(a => a.qty > 0)
      while (book2.asks.length < 5) {
        const top = book2.asks.length
          ? book2.asks[book2.asks.length - 1].price
          : lastPrice
        book2.asks.push({ price: top + 1, qty: Math.floor(Math.random() * 40) + 10 })
      }
      recalcMid(book2)
      return { newPrice: lastPrice, updatedBook: book2, movedPrice: true }
    }

    // Passive — add to bid side, price does NOT change
    const existing = book2.bids.find(b => b.price === price)
    if (existing) {
      existing.qty += qty
    } else {
      book2.bids.push({ price, qty })
      book2.bids.sort((a, b) => b.price - a.price)
    }
    recalcMid(book2)
    // Price stays the same — return current mid
    return {
      newPrice: null,  // null = no price movement
      updatedBook: book2,
      movedPrice: false,
    }

  } else {
    // SELL limit
    if (book2.bids.length && price <= book2.bids[0].price) {
      // Aggressive limit sell — fills against bids
      let remainingQty = qty
      let lastPrice = book2.bids[0].price
      for (let i = 0; i < book2.bids.length && remainingQty > 0; i++) {
        const level = book2.bids[i]
        if (level.price < price) break
        if (remainingQty >= level.qty) {
          remainingQty -= level.qty
          lastPrice = level.price
          level.qty = 0
        } else {
          level.qty -= remainingQty
          lastPrice = level.price
          remainingQty = 0
        }
      }
      book2.bids = book2.bids.filter(b => b.qty > 0)
      while (book2.bids.length < 5) {
        const bottom = book2.bids.length
          ? book2.bids[book2.bids.length - 1].price
          : lastPrice
        book2.bids.push({ price: bottom - 1, qty: Math.floor(Math.random() * 40) + 10 })
      }
      recalcMid(book2)
      return { newPrice: lastPrice, updatedBook: book2, movedPrice: true }
    }

    // Passive — add to ask side, price does NOT change
    const existing = book2.asks.find(a => a.price === price)
    if (existing) {
      existing.qty += qty
    } else {
      book2.asks.push({ price, qty })
      book2.asks.sort((a, b) => a.price - b.price)
    }
    recalcMid(book2)
    return {
      newPrice: null,
      updatedBook: book2,
      movedPrice: false,
    }
  }
}

function snapshot() {
  return {
    orders: globalState.orders.map(o => ({ ...o })),
    selectedOrder: globalState.selectedOrder
      ? { ...globalState.selectedOrder }
      : null,
    orderBook: cloneBook(globalState.orderBook),
    priceHistory: [...globalState.priceHistory],
    currentPrice: globalState.currentPrice,
    isRealMarket: globalState.isRealMarket,
    playbackPlaying: globalState.playbackPlaying,
    playbackSpeed: globalState.playbackSpeed,
    candles: [...globalState.candles],
  }
}

export function useMarketStore() {
  const [, rerender] = useState(0)

  useEffect(() => {
    const trigger = () => rerender(n => n + 1)
    listeners.add(trigger)
    return () => listeners.delete(trigger)
  }, [])

  return {
    ...globalState,

    canGoBack: globalState.history.length > 0,
    canGoForward: globalState.future.length > 0,

    generateOrders() {
      const { orderBook } = globalState
      if (!orderBook.bids.length && !orderBook.asks.length) {
        alert('Please generate the Order Book first.')
        return
      }
      setGlobalState({
        orders: generateOrders(orderBook),
        selectedOrder: null,
        future: [],
      })
    },

    selectOrder(order) {
      if (order.status === 'EXECUTED') return
      setGlobalState({ selectedOrder: order })
    },

    clearSelectedOrder() {
      setGlobalState({ selectedOrder: null })
    },

    generateOrderBook() {
      const newBook = generateOrderBook()
      setGlobalState({
        orderBook: newBook,
        orders: [],
        selectedOrder: null,
        priceHistory: [],
        currentPrice: newBook.mid,
        history: [],
        future: [],
        candles: [],
        candleTickCount: 0,
        playbackPlaying: false,
      })
    },

    toggleRealMarket() {
      setGlobalState({
        isRealMarket: !globalState.isRealMarket,
        playbackPlaying: false,
      })
    },

    setPlaying(playing) {
      setGlobalState({ playbackPlaying: playing })
    },

    setPlaybackSpeed(speed) {
      setGlobalState({ playbackSpeed: speed })
    },

    setStartingPrice(price) {
      const mid = parseInt(price) || 100
      const asks = Array.from({ length: 6 }, (_, i) => ({ price: mid + i + 1, qty: Math.floor(Math.random() * 60) + 15 }))
      const bids = Array.from({ length: 6 }, (_, i) => ({ price: mid - i, qty: Math.floor(Math.random() * 60) + 15 }))
      setGlobalState({
        orderBook: { asks, bids, mid },
        orders: [],
        selectedOrder: null,
        priceHistory: [],
        currentPrice: mid,
        history: [],
        future: [],
        candles: [],
        playbackPlaying: false,
      })
    },

    setMarketCondition(cond) {
      // cond: null | 'liq_sweep' | 'stop_hunt'
      const initialPhase = cond === 'liq_sweep' ? 'swing_dn' : cond === 'stop_hunt' ? 'rally' : null
      setGlobalState({
        marketCondition: cond,
        conditionPhase: initialPhase,
        conditionStep: 0,
        conditionAnchorPrice: null,
        conditionArrows: [],
        swingHighPrice: 0,
        swingLowPrice: 999999,
        bullishCount: 0,
        bearishCount: 0,
        failToBreakCount: 0,
        rejectionWickDetected: false,
        playbackPlaying: false,
        candles: [],
        candleTickCount: 0,
        priceHistory: [],
        history: [],
        future: [],
      })
    },

    updateSelectedOrder(updatedOrder) {
      setGlobalState({ selectedOrder: updatedOrder })
    },

    updateOrderBookLevel(side, index, field, value) {
      const book2 = cloneBook(globalState.orderBook)
      const levels = side === 'bid' ? book2.bids : book2.asks
      if (!levels[index]) return
      levels[index][field] = value === '' ? 0 : parseInt(value)
      if (field === 'price') {
        if (side === 'bid') book2.bids.sort((a, b) => b.price - a.price)
        else book2.asks.sort((a, b) => a.price - b.price)
      }
      recalcMid(book2)
      setGlobalState({ orderBook: book2 })
    },

    executeOrder() {
      const {
        selectedOrder, currentPrice,
        priceHistory, orders, orderBook,
      } = globalState
      if (!selectedOrder) return

      const before = snapshot()

      let updatedBook = cloneBook(orderBook)
      let newPrice = currentPrice
      let didMovePrice = false
      let executionNote = ''

      if (selectedOrder.type === 'MARKET') {
        // Market order ALWAYS moves price
        const result = executeMarketOrder(
          selectedOrder.side,
          selectedOrder.qty,
          orderBook,
        )
        newPrice = result.newPrice
        updatedBook = result.updatedBook
        didMovePrice = true
        executionNote = selectedOrder.side === 'BUY'
          ? `Market Buy consumed asks up to ${newPrice}`
          : `Market Sell consumed bids down to ${newPrice}`

      } else {
        // Limit order — may or may not move price
        const result = executeLimitOrder(
          selectedOrder.side,
          selectedOrder.price,
          selectedOrder.qty,
          orderBook,
        )
        updatedBook = result.updatedBook

        if (result.movedPrice && result.newPrice !== null) {
          // Aggressive limit — crossed the spread, filled immediately
          newPrice = result.newPrice
          didMovePrice = true
          executionNote = `Limit ${selectedOrder.side} @ ${selectedOrder.price} crossed spread → filled at ${newPrice}`
        } else {
          // Passive limit — sits in book, no price movement
          newPrice = currentPrice
          didMovePrice = false
          executionNote = `Limit ${selectedOrder.side} @ ${selectedOrder.price} added to book (passive)`
        }
      }

      const updatedOrders = orders.map(o =>
        o.id === selectedOrder.id ? { ...o, status: 'EXECUTED' } : o
      )

      // Only add a price dot if price actually moved
      const newHistory = didMovePrice
        ? [
            ...priceHistory,
            {
              price: newPrice,
              type: selectedOrder.type,
              side: selectedOrder.side,
              qty: selectedOrder.qty,
              orderId: selectedOrder.id,
              note: executionNote,
            },
          ]
        : priceHistory  // passive limit — no new dot on chart

      let newCandles = [...globalState.candles]
      if (globalState.isRealMarket && didMovePrice) {
        const now = Date.now()
        const CANDLE_MS = 15000
        const periodStart = Math.floor(now / CANDLE_MS) * CANDLE_MS

        if (newCandles.length === 0) {
          newCandles.push({
            open: newPrice, high: newPrice, low: newPrice, close: newPrice,
            volume: selectedOrder.qty,
            startTime: periodStart
          })
        } else {
          let lastCandle = { ...newCandles[newCandles.length - 1] }
          if (periodStart > lastCandle.startTime) {
            newCandles.push({
              open: lastCandle.close,
              high: Math.max(lastCandle.close, newPrice),
              low: Math.min(lastCandle.close, newPrice),
              close: newPrice,
              volume: selectedOrder.qty,
              startTime: periodStart
            })
          } else {
            lastCandle.high = Math.max(lastCandle.high, newPrice)
            lastCandle.low = Math.min(lastCandle.low, newPrice)
            lastCandle.close = newPrice
            lastCandle.volume += selectedOrder.qty
            newCandles[newCandles.length - 1] = lastCandle
          }
        }
      }

      setGlobalState({
        currentPrice: newPrice,
        priceHistory: newHistory,
        orders: updatedOrders,
        selectedOrder: null,
        orderBook: updatedBook,
        history: [...globalState.history, before],
        future: [],
        candles: newCandles,
      })
    },

    goBack() {
      const { history, future } = globalState
      if (!history.length) return
      const current = snapshot()
      const prev = history[history.length - 1]

      const lastExecutedOrder = prev.orders.find(o => {
        const cur = globalState.orders.find(x => x.id === o.id)
        return cur?.status === 'EXECUTED' && o.status === 'PENDING'
      }) || null

      setGlobalState({
        ...prev,
        selectedOrder: lastExecutedOrder,
        history: history.slice(0, -1),
        future: [current, ...future],
      })
    },

    goForward() {
      const { history, future } = globalState
      if (!future.length) return
      const current = snapshot()
      const next = future[0]
      setGlobalState({
        ...next,
        selectedOrder: null,
        history: [...history, current],
        future: future.slice(1),
      })
    },

    tickRealMarket() {
      const { orderBook, orders } = globalState
      if (!globalState.isRealMarket || !globalState.playbackPlaying) return
      
      const generated = generateOrders(orderBook)
      if (!generated.length) return
      let order = generated[0]
      
      const condition = globalState.marketCondition
      const phase = globalState.conditionPhase
      const step = globalState.conditionStep
      const anchor = globalState.conditionAnchorPrice
      const mid = Math.round(globalState.currentPrice)

      // Decide the BIAS for this tick based on phase
      // 70% favoring the trend, 30% against it to create "jagged" candles
      let trendBias = 0.5 // default 50/50
      if (['swing_up', 'move_up_away', 'rally', 'sh_approach', 'spike', 'bounce', 'reversal'].includes(phase)) trendBias = 0.8  // Stronger bias for reversal
      if (['swing_dn', 'slow_approach', 'sweep_dn', 'sh_pullback', 'rejection', 'pullback', 'sh_reversal'].includes(phase)) trendBias = 0.2

      let updatedBook = cloneBook(globalState.orderBook)
      const side = Math.random() < trendBias ? 'BUY' : 'SELL'
      const qty = Math.floor(Math.random() * 15) + 5  // Smaller orders for smoother "1-tick" moves
      order = { ...order, side, qty, type: 'MARKET' }

      if (condition === 'liq_sweep') {
        // ─────────────────────────────────────────────────
        // ICT Liquidity Sweep (Sell-Side - Long Term Pivot):
        //   swing_dn       → trending down to create swing low
        //   swing_bottom   → base formation (failed breaks)
        //   move_up_away   → rally (12+ candles) to establish distance
        //   slow_approach  → slow drift back to the "old" low
        //   sweep_dn       → violent burst through the low
        //   bounce         → immediate recovery
        // ─────────────────────────────────────────────────
        if (phase === 'swing_dn') {
          if (globalState.bearishCount >= 4 && step >= 48) {
            setGlobalState({ conditionPhase: 'swing_bottom', conditionStep: 0 })
          } else { setGlobalState({ conditionStep: step + 1 }) }

        } else if (phase === 'swing_bottom') {
          // Capturing the absolute pivot (Real Liquidity Point)
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
          // Rally away (10 candles = 240 ticks) to establish massive distance
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
          // Slow drift back to the "Black Line"
          // TRIGGER SWEEP when price gets close (within 15 ticks) AND enough time passed
          if (mid <= anchor + 15 && step >= 120) {
            setGlobalState({ conditionPhase: 'sweep_dn', conditionStep: 0 })
          } else {
            // Bias still SELL (handled by trendBias)
            setGlobalState({ conditionStep: step + 1 })
            // Safety fallback if it takes too long
            if (step >= 400) setGlobalState({ conditionPhase: 'sweep_dn', conditionStep: 0 })
          }

        } else if (phase === 'sweep_dn') {
          // Stage 3: THE SWEEP CHURN (Gradual consumption of liquidity)
          // Moderate sell orders to "eat" the pool over time
          const burstQty = Math.floor(Math.random() * 300) + 400 
          order = { ...order, type: 'MARKET', side: 'SELL', qty: burstQty, note: 'CONSUMING LIQUIDITY' }
          
          // VACUUM: WIPE ALL BIDS near the mid
          updatedBook.bids = updatedBook.bids.filter(b => b.price < mid - 1)
          
          // Transition to Exhaustion after enough churn or deep enough price
          if (step >= 18 || (anchor !== null && mid < anchor - 10)) {
            setGlobalState({ conditionPhase: 'exhaustion', conditionStep: 0 })
          } else {
            setGlobalState({ conditionStep: step + 1 })
          }
        } else if (phase === 'exhaustion') {
          // Stage 4: THE PAUSE (Sellers dry up, Buyers absorb)
          const churnQty = Math.floor(Math.random() * 50) + 20
          const side = Math.random() > 0.6 ? 'BUY' : 'SELL'
          order = { ...order, type: 'MARKET', side, qty: churnQty, note: 'ABSORPTION' }

          if (step >= 8) {
            const nextPhase = condition === 'liq_sweep' ? 'bounce' : 'rejection'
            setGlobalState({ conditionPhase: nextPhase, conditionStep: 0 })
          } else {
            setGlobalState({ conditionStep: step + 1 })
          }

        } else if (phase === 'bounce') {
          // Sharp recovery (Institutional Shift / Market Structure Shift)
          const shiftQty = Math.floor(Math.random() * 200) + 400 // Institutional Buy Spurt
          order = { ...order, type: 'MARKET', side: 'BUY', qty: shiftQty, note: 'INSTITUTIONAL SHIFT' }
          
          // VACUUM: WIPE ALL ASKS to allow price to shoot back up (Balance Shift)
          updatedBook.asks = updatedBook.asks.filter(a => a.price > mid + 2)

          // MECHANICAL CLEANUP: Ensure the anchor cluster is GONE
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
          // LONG TERM REVERSAL (300 ticks = ~12-15 candles)
          order = { ...order, type: 'MARKET', side: 'BUY', qty: Math.floor(Math.random() * 20) + 10 }
          if (step >= 300) {
            const arr = { price: mid, candleIdx: globalState.candles.length, label: 'SWEPT', color: '#10b981' }
            setGlobalState({ conditionPhase: 'done', conditionArrows: [...globalState.conditionArrows, arr] })
          } else {
            setGlobalState({ conditionStep: step + 1 })
          }

        } else if (phase === 'done') {
          setGlobalState({ marketCondition: null, conditionPhase: null }); return
        }

      } else if (condition === 'stop_hunt') {
        // ─────────────────────────────────────────────────
        // ICT Stop Hunt (Buy-Side Stops):
        //   rally     → 8 ticks BUY → creates highs with stops above
        //   pullback  → 3 ticks SELL → small retracement
        //   approach  → 3 ticks BUY → building back up
        //   spike     → massive BUY → breaks above highs, triggers stops
        //   rejection → massive SELL → price dumps back below highs
        //   done      → stop
        // ─────────────────────────────────────────────────
        if (phase === 'rally') {
          // Build structure (at least 4 bullish candles)
          if (globalState.bullishCount >= 4 && step >= 48) {
            setGlobalState({ conditionPhase: 'sh_top', conditionStep: 0 })
          } else { setGlobalState({ conditionStep: step + 1 }) }

        } else if (phase === 'sh_top') {
          // Wait for 2 failures + rejection wick
          if (globalState.failToBreakCount >= 2 && globalState.rejectionWickDetected) {
            setGlobalState({ conditionPhase: 'sh_pullback', conditionStep: 0, conditionAnchorPrice: globalState.swingHighPrice })
          } else {
            setGlobalState({ conditionStep: step + 1 })
            if (step >= 48) setGlobalState({ conditionPhase: 'sh_pullback', conditionStep: 0, conditionAnchorPrice: globalState.swingHighPrice })
          }

        } else if (phase === 'sh_pullback') {
          // Move away from the high (10 candles = 240 ticks)
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
          // Approach the pool
          // TRIGGER SPIKE when price gets close (within 15 ticks) AND time passed
          if (mid >= anchor - 15 && step >= 120) {
            setGlobalState({ conditionPhase: 'spike', conditionStep: 0 })
          } else {
            setGlobalState({ conditionStep: step + 1 })
            if (step >= 400) setGlobalState({ conditionPhase: 'spike', conditionStep: 0 })
          }

        } else if (phase === 'spike') {
          // The fast burst through the high
          // 2500-3500 burst to ensure the anchor pool is fully taken
          const burstQty = Math.floor(Math.random() * 500) + 2500
          order = { ...order, type: 'MARKET', side: 'BUY', qty: burstQty, note: 'SWEEPING POOL' }
          
          // VACUUM: WIPE ALL ASKS near the mid and the anchor
          updatedBook.asks = updatedBook.asks.filter(a => a.price > mid + 1 && Math.abs(a.price - anchor) > 0.5)
          if (anchor !== null && mid > anchor + 12) {
            setGlobalState({ conditionPhase: 'rejection', conditionStep: 0 })
          } else {
            setGlobalState({ conditionStep: step + 1 })
            if (step >= 12) setGlobalState({ conditionPhase: 'rejection', conditionStep: 0 })
          }

        } else if (phase === 'rejection') {
          // Massive dump back down (Sequence for wick)
          order = { ...order, type: 'MARKET', side: 'SELL', qty: Math.floor(Math.random() * 100) + 200 }
          
          // MECHANICAL CLEANUP: Once we rejection starts, the liquidity at anchor MUST BE GONE
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
          // LONG TERM DUMP (300 ticks)
          order = { ...order, type: 'MARKET', side: 'SELL', qty: Math.floor(Math.random() * 20) + 10 }
          if (step >= 300) {
            const arr = { price: mid, candleIdx: globalState.candles.length, label: 'HUNTED', color: '#ef4444' }
            setGlobalState({ conditionPhase: 'done', conditionArrows: [...globalState.conditionArrows, arr] })
          } else {
            setGlobalState({ conditionStep: step + 1 })
          }

        } else if (phase === 'done') {
          setGlobalState({ marketCondition: null, conditionPhase: null }); return
        }
      } // end condition blocks

      // Pre-add to orders and select it
      globalState.orders = [order, ...orders].slice(0, 100)
      globalState.selectedOrder = order
      const before = snapshot()

      // --- DENSE LIQUIDITY BOT (TIGHT) ---
      // Increasing qty per level to 50-100 to ensure price moves smoothly (1-2 ticks max per order).
      {
        const midPrice = Math.round(globalState.currentPrice)
        const phase = globalState.conditionPhase
        
        // RULE: DURING A SWEEP/SPIKE, NO NEW LIMIT ORDERS (IMBALANCE VACUUM)
        // BOT only runs during setup phases or exhaustion
        const isSweeping = (phase === 'sweep_dn' || phase === 'spike' || phase === 'bounce' || phase === 'rejection')
        
        if (!isSweeping) {
          const anchor = globalState.conditionAnchorPrice
          const condition = globalState.marketCondition

          // 1. Maintain liquidity around the current mid price (standard bot)
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

          // 2. Persistent Anchor Liquidity (Maintain the "Pool" even if mid is far away)
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
          // DURING SWEEP: AGGRESSIVE BOOK CLEARING (Total Imbalance)
          if (phase === 'sweep_dn') {
            updatedBook.bids = updatedBook.bids.filter(b => b.price < midPrice - 10)
            updatedBook.asks = updatedBook.asks.filter(a => a.price > midPrice + 2) // Keep asks empty to allow snapback
          }
          if (phase === 'spike') {
            updatedBook.asks = updatedBook.asks.filter(a => a.price > midPrice + 10)
            updatedBook.bids = updatedBook.bids.filter(b => b.price < midPrice - 2) // Keep bids empty to allow snapback
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

      const tradeEventLog = didMovePrice
        ? [
            ...globalState.priceHistory,
            {
              price: newPrice,
              type: order.type,
              side: order.side,
              qty: order.qty,
              orderId: order.id,
              note: executionNote,
            },
          ]
        : globalState.priceHistory

      // --- TRADE-COUNT CANDLE FORMATION ---
      const CANDLE_TICKS = 24 // Increased for more structural detail per candle
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
            // --- CANDLE CLOSE: New candle OPENS at previous CLOSE ---
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
              open: finalClose, // ZERO GAP LOGIC
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

      // --- FINAL STATE SYNC ---
      if (!isFinite(newPrice)) newPrice = globalState.currentPrice || 100
      
      const finalPriceHistory = [...globalState.priceHistory.slice(-499), { price: newPrice, time: Date.now() }]

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
    },
  }
}