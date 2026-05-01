export const initialState = {
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
  candleTickCount: 0,
  marketCondition: null,
  conditionPhase: null,
  conditionStep: 0,
  conditionAnchorPrice: null,
  conditionArrows: [],
  swingHighPrice: 0,
  swingLowPrice: 999999,
  bullishCount: 0,
  bearishCount: 0,
  failToBreakCount: 0,
  rejectionWickDetected: false,
  executionCount: 0,
}

export let globalState = { ...initialState }
export const listeners = new Set()

export function setGlobalState(partial) {
  globalState = { ...globalState, ...partial }
  listeners.forEach(fn => fn())
}

export function cloneBook(ob) {
  return {
    bids: ob.bids.map(b => ({ ...b })),
    asks: ob.asks.map(a => ({ ...a })),
    mid: ob.mid,
  }
}

export function recalcMid(book) {
  const bestBid = book.bids[0]?.price || book.mid || 100
  const bestAsk = book.asks[0]?.price || (bestBid + 1)
  book.mid = Math.round((bestBid + bestAsk) / 2)
  return book
}

export function snapshot() {
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
