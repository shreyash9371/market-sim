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
  if (book.bids[0] && book.asks[0]) {
    book.mid = Math.round(
      (book.bids[0].price + book.asks[0].price) / 2
    )
  }
  return book
}

// ─── MARKET ORDER ───────────────────────────────────────────
// Walks through the book consuming levels until qty is filled.
// Returns the last price level touched = new market price.
function executeMarketOrder(side, qty, book) {
  const book2 = cloneBook(book)
  let remainingQty = qty
  let lastPrice = side === 'BUY'
    ? book2.asks[0]?.price   // buying → eats asks upward
    : book2.bids[0]?.price   // selling → eats bids downward
  let fills = []  // track what got consumed

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
        : lastPrice
      book2.asks.push({
        price: topAsk + 1,
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
        : lastPrice
      book2.bids.push({
        price: bottomBid - 1,
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

      setGlobalState({
        currentPrice: newPrice,
        priceHistory: newHistory,
        orders: updatedOrders,
        selectedOrder: null,
        orderBook: updatedBook,
        history: [...globalState.history, before],
        future: [],
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
  }
}