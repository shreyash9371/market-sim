import { useMemo } from 'react'
import { calcPnl, calcRR, getTradeResult } from '../../../../utils/tradeMetrics'

export function useJournalSummary(trades, winRateMode) {
  return useMemo(() => {
    const closed = trades.filter(t => t.exit)
    const open = trades.filter(t => !t.exit)
    const totalPnl = closed.reduce((s, t) => s + calcPnl(t).usd, 0)
    const totalPips = closed.reduce((s, t) => s + calcPnl(t).pips, 0)

    const wins = closed.filter(t => getTradeResult(t) === 'Win')
    const losses = closed.filter(t => getTradeResult(t) === 'Loss')
    const beTrades = closed.filter(t => getTradeResult(t) === 'BE')

    const wr = winRateMode === 'withBE'
      ? (closed.length ? (wins.length / closed.length * 100) : 0)
      : (wins.length + losses.length ? (wins.length / (wins.length + losses.length) * 100) : 0)

    const rrVals = trades.filter(t => t.exit && getTradeResult(t) === 'Win')
      .map(t => calcRR(t))
      .filter(val => val > 0)
    const avgRR = rrVals.length ? rrVals.reduce((a, b) => a + b, 0) / rrVals.length : 0

    const byPair = {}
    closed.forEach(t => { byPair[t.pair] = (byPair[t.pair] || 0) + calcPnl(t).usd })
    const bestPair = Object.entries(byPair).sort((a, b) => b[1] - a[1])[0]

    return {
      closed, open, totalPnl, totalPips,
      wins, losses, beTrades, wr, avgRR, bestPair
    }
  }, [trades, winRateMode])
}
