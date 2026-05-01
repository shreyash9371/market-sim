import { globalState, setGlobalState, snapshot, cloneBook } from './marketState'
import { executeMarketOrder, executeLimitOrder } from './orderExecution'

export function executeOrder() {
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
}
