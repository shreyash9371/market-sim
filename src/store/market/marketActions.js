import { globalState, setGlobalState, snapshot, cloneBook, recalcMid } from './marketState'
import { generateOrders, generateOrderBook } from '../../utils/generators'

export function runGenerateOrders() {
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
}

export function selectOrder(order) {
  if (order.status === 'EXECUTED') return
  setGlobalState({ selectedOrder: order })
}

export function clearSelectedOrder() {
  setGlobalState({ selectedOrder: null })
}

export function runGenerateOrderBook() {
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
}

export function toggleRealMarket() {
  setGlobalState({
    isRealMarket: !globalState.isRealMarket,
    playbackPlaying: false,
  })
}

export function setPlaying(playing) {
  setGlobalState({ playbackPlaying: playing })
}

export function setPlaybackSpeed(speed) {
  setGlobalState({ playbackSpeed: speed })
}

export function setStartingPrice(price) {
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
}

export function setMarketCondition(cond) {
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
}

export function updateSelectedOrder(updatedOrder) {
  setGlobalState({ selectedOrder: updatedOrder })
}

export function updateOrderBookLevel(side, index, field, value) {
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
}

export function goBack() {
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
}

export function goForward() {
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
}
