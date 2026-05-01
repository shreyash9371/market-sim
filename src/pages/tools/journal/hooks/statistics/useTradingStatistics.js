import { useMemo } from 'react'
import { calcPnl, calcRR, getTradeResult } from '../../../../../utils/tradeMetrics'

export function useTradingStatistics({
  trades,
  activeFilter,
  customRange,
  calendarAnchorDate,
  winRateMode,
  initialBalance
}) {
  const filteredTrades = useMemo(() => {
    const now = new Date()
    const getStartOfWeek = (d) => {
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Start Monday
      return new Date(d.setDate(diff))
    }

    return trades.filter(t => {
      if (activeFilter === 'all') return true
      const tradeDate = new Date(t.date + 'T12:00:00')

      if (activeFilter === 'this_week') {
        const start = getStartOfWeek(new Date(now))
        start.setHours(0, 0, 0, 0)
        return tradeDate >= start
      }
      if (activeFilter === 'last_week') {
        const start = getStartOfWeek(new Date(now))
        start.setDate(start.getDate() - 7)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(end.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        return tradeDate >= start && tradeDate <= end
      }
      if (activeFilter === 'this_month') {
        return tradeDate.getMonth() === now.getMonth() && tradeDate.getFullYear() === now.getFullYear()
      }
      if (activeFilter === 'last_month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        return tradeDate.getMonth() === lastMonth.getMonth() && tradeDate.getFullYear() === lastMonth.getFullYear()
      }
      if (activeFilter === 'custom') {
        if (!customRange.start || !customRange.end) return true
        const start = new Date(customRange.start + 'T00:00:00')
        const end = new Date(customRange.end + 'T23:59:59')
        return tradeDate >= start && tradeDate <= end
      }
      return true
    })
  }, [trades, activeFilter, customRange])

  const dayOfWeekOffset = new Date(calendarAnchorDate.getFullYear(), calendarAnchorDate.getMonth(), 1).getDay()

  const stats = useMemo(() => {
    const closed = filteredTrades.filter(t => t.exit)
    const totalPnl = closed.reduce((acc, t) => acc + calcPnl(t).usd, 0)

    const wins = closed.filter(t => getTradeResult(t) === 'Win')
    const losses = closed.filter(t => getTradeResult(t) === 'Loss')
    const beTrades = closed.filter(t => getTradeResult(t) === 'BE')

    const winRate = winRateMode === 'withBE'
      ? (closed.length ? (wins.length / closed.length * 100) : 0)
      : (wins.length + losses.length ? (wins.length / (wins.length + losses.length) * 100) : 0)

    const grossProfit = wins.reduce((acc, t) => acc + calcPnl(t).usd, 0)
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + calcPnl(t).usd, 0))

    const totalTradesForExpectancy = winRateMode === 'withBE' ? closed.length : (wins.length + losses.length)
    const expectancy = totalTradesForExpectancy ? parseFloat((totalPnl / totalTradesForExpectancy).toFixed(2)) : 0
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? 'MAX' : '0.00'

    const avgWinSize = wins.length ? grossProfit / wins.length : 0
    const avgLossSize = losses.length ? grossLoss / losses.length : 0
    
    // Average RR is sum of RR of wins / number of wins
    const rrWins = closed.filter(t => getTradeResult(t) === 'Win' && calcRR(t) > 0)
    const avgSetupRR = rrWins.length ? rrWins.reduce((acc, t) => acc + calcRR(t), 0) / rrWins.length : 0

    const rewardToRisk = avgLossSize > 0 ? avgWinSize / avgLossSize : 0

    // Consectuve Streak Logic & Equity Curve
    let maxWins = 0, currentWins = 0
    let maxLoss = 0, currentLoss = 0
    let lastResult = null

    const sortedTrades = [...closed].sort((a, b) => new Date(`${a.date}T${a.exitTime || '12:00:00'}`) - new Date(`${b.date}T${b.exitTime || '12:00:00'}`))

    let cumulative = initialBalance
    const equityData = []

    sortedTrades.forEach((t, i) => {
      const pnl = calcPnl(t).usd
      cumulative += pnl
      equityData.push({
        name: `Trade ${i + 1}`,
        date: t.date,
        pnl: pnl,
        equity: parseFloat(cumulative.toFixed(2))
      })

      if (pnl >= 0) {
        if (lastResult !== 'win') currentWins = 0
        currentWins++
        if (currentWins > maxWins) maxWins = currentWins
        currentLoss = 0
        lastResult = 'win'
      } else {
        if (lastResult !== 'loss') currentLoss = 0
        currentLoss++
        if (currentLoss > maxLoss) maxLoss = currentLoss
        currentWins = 0
        lastResult = 'loss'
      }
    })

    const currentMonth = calendarAnchorDate.getMonth()
    const currentYear = calendarAnchorDate.getFullYear()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
      const day = String(i + 1).padStart(2, '0')
      const month = String(currentMonth + 1).padStart(2, '0')
      const dateStr = `${currentYear}-${month}-${day}`

      const dayTrades = closed.filter(t => t.date === dateStr)
      const net = dayTrades.reduce((acc, t) => acc + calcPnl(t).usd, 0)
      const dWins = dayTrades.filter(t => calcPnl(t).usd >= 0).length
      const dWR = dayTrades.length ? (dWins / dayTrades.length) * 100 : 0
      const dRR = dayTrades.reduce((a, t) => a + calcRR(t), 0)

      return {
        date: dateStr,
        dayNumber: i + 1,
        net: net,
        tradesCount: dayTrades.length,
        winRate: dWR,
        rrCollected: dRR
      }
    })

    const weeksMap = {}
    calendarDays.forEach(d => {
      const rowIndex = Math.floor((dayOfWeekOffset + d.dayNumber - 1) / 7)
      if (!weeksMap[rowIndex]) weeksMap[rowIndex] = { net: 0, days: 0 }
      weeksMap[rowIndex].net += d.net
      if (d.tradesCount > 0) weeksMap[rowIndex].days++
    })

    const weeklySummary = Object.keys(weeksMap).sort((a, b) => parseInt(a) - parseInt(b)).map((rowIndex, i) => {
      return {
        label: `Week ${i + 1}`,
        net: parseFloat(weeksMap[rowIndex].net.toFixed(2)),
        days: weeksMap[rowIndex].days
      }
    })

    const biggestWin = wins.length ? Math.max(...wins.map(t => calcPnl(t).usd)) : 0
    const minPnl = closed.length ? Math.min(...closed.map(t => calcPnl(t).usd)) : 0
    const biggestLoss = Math.abs(minPnl < 0 ? minPnl : 0)

    let sWin = winRate
    let sPF = Math.min((parseFloat(profitFactor) / 3) * 100, 100) || 0
    let sRR = Math.min((avgSetupRR / 3) * 100, 100) || 0
    let sVol = Math.min((closed.length / 50) * 100, 100) || 0
    let sDiscipline = losses.length > 0 ? Math.max(100 - (maxLoss / 10) * 100, 0) : 50

    const radarData = [
      { subject: 'Win %', A: sWin },
      { subject: 'Prof. Factor', A: sPF },
      { subject: 'Execution', A: sVol },
      { subject: 'Discipline', A: sDiscipline },
      { subject: 'Av. Setup RR', A: sRR }
    ]

    const overallScore = Math.round((sWin + sPF + sRR + sVol + sDiscipline) / 5) || 0

    const totalDurationMins = closed.reduce((acc, t) => {
      if (!t.entryTime || !t.exitTime) return acc;
      try {
        const entry = new Date(`${t.date}T${t.entryTime}:00`);
        const exitDateStr = t.exit_date || t.date;
        const exit = new Date(`${exitDateStr}T${t.exitTime}:00`);
        
        let diffMs = exit.getTime() - entry.getTime();
        
        // Handle overnight trades for legacy data missing exit_date
        if (!t.exit_date && diffMs < 0) {
          diffMs += 24 * 60 * 60 * 1000;
        }
        
        return acc + (diffMs > 0 ? diffMs / (1000 * 60) : 0);
      } catch (e) {
        return acc;
      }
    }, 0);
    const avgDurationMins = closed.length ? Math.round(totalDurationMins / closed.length) : 0;
    const avgDurationStr = `${Math.floor(avgDurationMins / 60)}h ${avgDurationMins % 60}m`;

    const totalLotSize = closed.reduce((acc, t) => acc + (parseFloat(t.lots) || 0), 0);
    const avgLotSize = closed.length ? parseFloat((totalLotSize / closed.length).toFixed(2)) : 0;

    const totalCommissions = closed.reduce((acc, t) => acc + (Number(t.commissions) || 0), 0);

    return {
      closed, wins, losses,
      totalPnl, profitFactor, winRate, expectancy,
      currentWins, currentLoss, maxWins,
      calendarDays, weeklySummary,
      equityData, radarData, overallScore,
      avgWinSize, avgLossSize, biggestWin, biggestLoss,
      grossProfit, grossLoss, avgDurationStr, avgLotSize, totalCommissions
    }
  }, [filteredTrades, initialBalance, calendarAnchorDate, winRateMode])

  return { stats, filteredTrades, dayOfWeekOffset }
}
