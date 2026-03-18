export function generateOrderBook() {
  const mid = 100

  // Asks above mid — sorted low to high (sellers above market)
  const asks = Array.from({ length: 6 }, (_, i) => ({
    price: mid + i + 1,  // 101, 102, 103, 104, 105, 106
    qty: Math.floor(Math.random() * 60) + 15,
  }))

  // Bids below mid — sorted high to low (buyers below market)
  const bids = Array.from({ length: 6 }, (_, i) => ({
    price: mid - i,  // 100, 99, 98, 97, 96, 95
    qty: Math.floor(Math.random() * 60) + 15,
  }))

  return { asks, bids, mid }
}

export function generateOrders(orderBook) {
  const bids = orderBook?.bids || []
  const asks = orderBook?.asks || []
  if (!bids.length || !asks.length) return []

  const bestBid = bids[0].price   // highest bid
  const bestAsk = asks[0].price   // lowest ask

  return Array.from({ length: 10 }, (_, i) => {
    // Randomly pick type and side
    const type = Math.random() > 0.4 ? 'MARKET' : 'LIMIT'
    const side = Math.random() > 0.5 ? 'BUY' : 'SELL'

    let price = null
    if (type === 'LIMIT') {
      if (side === 'BUY') {
        // Limit buy must be BELOW best ask (passive, adds to bid side)
        const validBids = bids.map(b => b.price)
        price = validBids[Math.floor(Math.random() * validBids.length)]
      } else {
        // Limit sell must be ABOVE best bid (passive, adds to ask side)
        const validAsks = asks.map(a => a.price)
        price = validAsks[Math.floor(Math.random() * validAsks.length)]
      }
    }

    const qty = Math.floor(Math.random() * 80) + 10

    return {
      id: `ORD-${Date.now()}-${i}`,
      type,
      side,
      price,
      qty,
      status: 'PENDING',
    }
  })
}