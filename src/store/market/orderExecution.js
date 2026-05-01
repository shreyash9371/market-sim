import { cloneBook, recalcMid } from './marketState'

// ─── MARKET ORDER ───────────────────────────────────────────
// Walks through the book consuming levels until qty is filled.
// Returns the last price level touched = new market price.
export function executeMarketOrder(side, qty, book) {
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
export function executeLimitOrder(side, price, qty, book) {
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
