export function getContractSize(pair) {
  const p = pair.toUpperCase()
  if (p.includes('JPY')) return 100000 
  if (p.includes('XAU')) return 100 // 1 lot = 100 oz
  if (p.includes('XAG')) return 5000 // 1 lot = 5000 oz
  if (['US30', 'NAS100', 'SPX500', 'GER40', 'DAX'].includes(p)) return 10 // typical mini/micro contract
  if (['BTCUSD', 'ETHUSD', 'SOLUSD'].includes(p)) return 1 // 1 lot = 1 coin
  return 100000 // standard forex
}

export function getPipMultiplier(pair) {
  const p = pair.toUpperCase()
  if (p.includes('JPY')) return 100
  if (p.includes('XAU') || p.includes('XAG')) return 10 // $1 move = 10 pips
  if (['US30', 'NAS100', 'SPX500', 'BTCUSD', 'ETHUSD'].includes(p)) return 1
  return 10000
}

export function calcPnl(t) {
  if (!t.exit) return null
  const size = t.pipval ? parseFloat(t.pipval) : getContractSize(t.pair)
  const diff = t.dir === 'long' ? (t.exit - t.entry) : (t.entry - t.exit)
  const usd = diff * t.lots * size
  
  const mult = getPipMultiplier(t.pair)
  const pips = diff * mult

  return {
    pips: parseFloat(pips.toFixed(1)),
    usd: parseFloat(usd.toFixed(2)),
  }
}

export function getTradeResult(t) {
  if (!t.exit) return 'Open'
  if (t.manual_result === 'Win') return 'Win'
  if (t.manual_result === 'Loss') return 'Loss'
  if (t.manual_result === 'BE') return 'BE'
  
  const pnl = calcPnl(t)?.usd || 0
  if (pnl > 0.01) return 'Win'
  if (pnl < 0) return 'Loss'
  return 'BE'
}

export function calcRR(t) {
  if (!t.sl || !t.tp || t.sl === t.entry) return 0
  const risk = Math.abs(t.entry - t.sl)
  const reward = Math.abs(t.tp - t.entry)
  return parseFloat((reward / risk).toFixed(2))
}

export function calcDuration(t) {
  if (!t.entryTime || !t.exitTime) return '—'
  const [eh, em] = t.entryTime.split(':').map(Number)
  const [xh, xm] = t.exitTime.split(':').map(Number)
  let diff = (xh * 60 + xm) - (eh * 60 + em)
  if (diff < 0) diff += 24 * 60 // crossed midnight
  const hours = Math.floor(diff / 60)
  const mins = diff % 60
  return `${hours}h ${mins}m`
}

export const SESSIONS = [
  { key: 'new_york', label: 'New York', color: 'var(--accent-blue)' },
  { key: 'london', label: 'London', color: 'var(--accent-green)' },
  { key: 'asian', label: 'Asian', color: 'var(--accent-yellow)' },
  { key: 'overlap', label: 'London / NY Overlap', color: 'var(--accent-red)' },
]

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
export const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
