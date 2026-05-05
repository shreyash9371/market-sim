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
  const diff = t.dir === 'long'
    ? (parseFloat(t.exit) - parseFloat(t.entry))
    : (parseFloat(t.entry) - parseFloat(t.exit))
  let usd = diff * parseFloat(t.lots || 0) * size

  const commissions = Number(t.commissions) || 0
  usd -= commissions

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
  const entry = parseFloat(t.entry)
  const sl = parseFloat(t.sl)
  const tp = parseFloat(t.tp)
  if (isNaN(entry) || isNaN(sl) || isNaN(tp) || sl === entry) return 0
  const risk = Math.abs(entry - sl)
  const reward = Math.abs(tp - entry)
  return parseFloat((reward / risk).toFixed(2))
}

export function calcDuration(t) {
  if (!t.date || !t.entryTime || !t.exitTime) return '—'
  
  try {
    const entryDate = t.date
    const exitDate = t.exit_date || t.date // Use exit_date if available, otherwise assume same day
    
    const entry = new Date(`${entryDate}T${t.entryTime}:00`)
    const exit = new Date(`${exitDate}T${t.exitTime}:00`)
    
    const diffMs = exit - entry
    if (isNaN(diffMs) || diffMs < 0) return '—'
    
    const totalMins = Math.floor(diffMs / (1000 * 60))
    const days = Math.floor(totalMins / (60 * 24))
    const hours = Math.floor((totalMins % (60 * 24)) / 60)
    const mins = totalMins % 60
    
    if (days > 0) return `${days}d ${hours}h ${mins}m`
    return `${hours}h ${mins}m`
  } catch (e) {
    console.error("Error calculating duration:", e)
    return '—'
  }
}

export const SESSIONS = [
  { key: 'new_york', label: 'New York', color: 'var(--accent-blue)' },
  { key: 'london', label: 'London', color: 'var(--accent-green)' },
  { key: 'asian', label: 'Asian', color: 'var(--accent-yellow)' },
  { key: 'overlap', label: 'London / NY Overlap', color: 'var(--accent-red)' },
]

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
export const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
