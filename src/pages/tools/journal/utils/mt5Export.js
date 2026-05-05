import { calcPnl, calcRR } from '../../../../utils/tradeMetrics'

// ── date helpers ──────────────────────────────────────────────────────────────
function fmtDT(date, time) {
  if (!date) return ''
  const d = date.replace(/-/g, '.')
  const t = time ? time + ':00' : '00:00:00'
  return `${d} ${t}`
}
function f2(n) { return Number(n || 0).toFixed(2) }

// ── build one row from a trade ────────────────────────────────────────────────
function row(t, idx) {
  const pnl      = calcPnl(t)
  const gross    = pnl ? parseFloat(f2(pnl.usd + (Number(t.commissions) || 0))) : 0
  const swap     = 0
  const comm     = -(Number(t.commissions) || 0)
  return {
    openTime  : fmtDT(t.date,                    t.entryTime),
    closeTime : fmtDT(t.exit_date || t.date,     t.exitTime),
    ticket    : 500000000 + idx + 1,
    symbol    : (t.pair || '').toUpperCase(),
    type      : t.dir === 'long' ? 'buy' : 'sell',
    volume    : parseFloat(t.lots || 0).toFixed(2),
    openPrice : parseFloat(t.entry || 0).toFixed(5),
    sl        : parseFloat(t.sl    || 0).toFixed(5),
    tp        : parseFloat(t.tp    || 0).toFixed(5),
    closePrice: t.exit ? parseFloat(t.exit).toFixed(5) : '',
    commission: f2(comm),
    swap      : f2(swap),
    profit    : f2(gross),
    rr        : calcRR(t).toFixed(2),
  }
}

// ── filter + sort closed trades ───────────────────────────────────────────────
export function filterTrades(trades, start, end) {
  return trades
    .filter(t => {
      if (!t.exit) return false
      const d = t.exit_date || t.date
      return d >= start && d <= end
    })
    .sort((a, b) => ((a.exit_date || a.date) + (a.exitTime || '')).localeCompare((b.exit_date || b.date) + (b.exitTime || '')))
    .map((t, i) => row(t, i))
}

// ── CSV (tab-delimited, MT5 Positions style) ──────────────────────────────────
export function downloadCSV(rows, firstName) {
  const hdr  = ['Time','Position','Symbol','Type','Volume','Price','S / L','T / P','Time','Price','Commission','Swap','Profit'].join('\t')
  const body = rows.map(r =>
    [r.openTime,r.ticket,r.symbol,r.type,r.volume,r.openPrice,r.sl,r.tp,
     r.closeTime,r.closePrice,r.commission,r.swap,r.profit].join('\t')
  )
  const totProfit = f2(rows.reduce((s,r) => s + parseFloat(r.profit), 0))
  const totComm   = f2(rows.reduce((s,r) => s + parseFloat(r.commission), 0))
  const totSwap   = '0.00'
  const net       = f2(rows.reduce((s,r) => s + parseFloat(r.profit) + parseFloat(r.commission), 0))

  const lines = [
    `Trade History Report`,
    `Name:\t${firstName || 'Trader'}`,
    `Date:\t${new Date().toLocaleString()}`,
    '',
    hdr,
    ...body,
    '',
    `\t\t\t\t\t\t\t\t\t\t${totComm}\t${totSwap}\t${totProfit}`,
    '',
    `Total Net Profit:\t${net}\t\tGross Profit:\t${f2(rows.filter(r=>parseFloat(r.profit)>0).reduce((s,r)=>s+parseFloat(r.profit),0))}\t\tGross Loss:\t${f2(rows.filter(r=>parseFloat(r.profit)<0).reduce((s,r)=>s+parseFloat(r.profit),0))}`,
    `Total Trades:\t${rows.length}`,
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' })
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'TradeHistory.csv' })
  a.click(); URL.revokeObjectURL(a.href)
}

// ── HTML (exact MT5 "Trade History Report" format) ────────────────────────────
export function downloadHTML(rows, firstName) {
  const wins       = rows.filter(r => parseFloat(r.profit) > 0)
  const losses     = rows.filter(r => parseFloat(r.profit) < 0)
  const grossP     = wins.reduce((s,r)  => s + parseFloat(r.profit), 0)
  const grossL     = losses.reduce((s,r) => s + parseFloat(r.profit), 0)
  const totComm    = rows.reduce((s,r) => s + parseFloat(r.commission), 0)
  const totSwap    = 0
  const net        = rows.reduce((s,r) => s + parseFloat(r.profit) + parseFloat(r.commission), 0)
  const pf         = grossL !== 0 ? (grossP / Math.abs(grossL)).toFixed(2) : '—'
  const ep         = rows.length ? (net / rows.length).toFixed(2) : '0.00'
  const longTrades = rows.filter(r => r.type === 'buy')
  const shortTrades= rows.filter(r => r.type === 'sell')
  const longWins   = longTrades.filter(r => parseFloat(r.profit) > 0).length
  const shortWins  = shortTrades.filter(r => parseFloat(r.profit) > 0).length
  const now        = new Date()
  const nowStr     = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

  const posRows = rows.map((r, i) => {
    const bg = i % 2 === 0 ? '#FFFFFF' : '#F7F7F7'
    return `
        <tr bgcolor="${bg}" align="right">
            <td>${r.openTime}</td>
            <td>${r.ticket}</td>
            <td>${r.symbol}</td>
            <td>${r.type}</td>
            <td class="hidden" colspan="8"></td>
            <td class="">${r.volume}</td>
            <td class="">${r.openPrice}</td>
            <td class="">${r.sl}</td>
            <td class="">${r.tp}</td>
            <td class="">${r.closeTime}</td>
            <td class="">${r.closePrice}</td>
            <td class="">${r.commission}</td>
            <td class="">${r.swap}</td>
            <td colspan="2">${r.profit}</td>
        </tr>`
  }).join('\n')

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
  <head>
    <title>Trade History Report</title>
    <meta name="generator" content="MktSim">
    <style type="text/css">
    <!--
    @media screen {
      td { font: 8pt  Tahoma,Arial; }
      th { font: 10pt Tahoma,Arial; }
    }
    @media print {
      td { font: 7pt Tahoma,Arial; }
      th { font: 9pt Tahoma,Arial; }
    }
    .msdate { mso-number-format:"General Date"; }
    .mspt   { mso-number-format:\\#\\,\\#\\#0\\.00; }
    .hidden { display: none; }
    body {margin:1px;}
    //-->
    </style>
  </head>
<body>
<div align="center">
    <table cellspacing="1" cellpadding="3" border="0">
        <tr align="center">
            <td colspan="14"><div style="font: 14pt Tahoma"><b>Trade History Report</b><br></div></td>
        </tr>
        <tr align="left">
            <th colspan="4" nowrap align="right" style="width: 220px; height: 20px">Name:</th>
            <th colspan="10" nowrap align="left" style="width: 220px; height: 20px"><b>${firstName || 'Trader'}</b></th>
        </tr>
        <tr align="left">
            <th colspan="4" nowrap align="right" style="width: 220px; height: 20px">Account:</th>
            <th colspan="10" nowrap align="left" style="width: 220px; height: 20px"><b>MktSim Journal (USD)</b></th>
        </tr>
        <tr align="left">
            <th colspan="4" nowrap align="right" style="width: 220px; height: 20px">Company:</th>
            <th colspan="10" nowrap align="left" style="width: 220px; height: 20px"><b>MktSim</b></th>
        </tr>
        <tr align="left">
            <th colspan="4" nowrap align="right" style="width: 220px; height: 20px">Date:</th>
            <th colspan="10" nowrap align="left" style="width: 220px; height: 20px"><b>${nowStr}</b></th>
        </tr>
        <tr>
            <td nowrap style="width: 140px;height: 10px"></td>
            <td nowrap style="width: 60px;"></td>
            <td nowrap style="width: 60px;"></td>
            <td nowrap style="width: 60px;"></td>
            <td nowrap style="width: 70px;"></td>
            <td nowrap style="width: 60px;"></td>
            <td nowrap style="width: 60px;"></td>
            <td nowrap style="width: 60px;"></td>
            <td nowrap style="width: 140px;"></td>
            <td nowrap style="width: 60px;"></td>
            <td nowrap style="width: 60px;"></td>
            <td nowrap style="width: 60px;"></td>
            <td nowrap style="width: 60px;"></td>
            <td nowrap style="width: 100px;"></td>
        </tr>
        <tr align="center">
            <th colspan="14" style="height: 25px"><div style="font: 10pt Tahoma"><b>Positions</b></div></th>
        </tr>
        <tr align="center" bgcolor="#E5F0FC">
            <td nowrap style="height: 30px"><b>Time</b></td>
            <td nowrap><b>Position</b></td>
            <td nowrap><b>Symbol</b></td>
            <td nowrap><b>Type</b></td>
            <td nowrap><b>Volume</b></td>
            <td nowrap><b>Price</b></td>
            <td nowrap><b>S / L</b></td>
            <td nowrap><b>T / P</b></td>
            <td nowrap><b>Time</b></td>
            <td nowrap><b>Price</b></td>
            <td nowrap><b>Commission</b></td>
            <td nowrap><b>Swap</b></td>
            <td nowrap colspan="2"><b>Profit</b></td>
        </tr>
        ${posRows}
        <tr align="right">
            <td nowrap colspan="11" style="height: 30px"></td>
            <td nowrap><b>${f2(totSwap)}</b></td>
            <td nowrap colspan="2"><b>${f2(net)}</b></td>
        </tr>
        <tr>
            <td nowrap style="height: 10px"></td>
        </tr>
        <tr>
            <td colspan="13" align="center"><div style="font: 10pt Tahoma"><b>Results</b></div></td>
        </tr>
        <tr align="right">
            <td nowrap colspan="3">Total Net Profit:</td>
            <td nowrap><b>${f2(net)}</b></td>
            <td nowrap colspan="3">Gross Profit:</td>
            <td nowrap><b>${f2(grossP)}</b></td>
            <td nowrap colspan="3">Gross Loss:</td>
            <td nowrap colspan="2"><b>${f2(grossL)}</b></td>
        </tr>
        <tr align="right">
            <td nowrap colspan="3">Profit Factor:</td>
            <td nowrap><b>${pf}</b></td>
            <td nowrap colspan="3">Expected Payoff:</td>
            <td nowrap><b>${ep}</b></td>
        </tr>
        <tr>
            <td nowrap style="height: 10px"></td>
        </tr>
        <tr align="right">
            <td nowrap colspan="3">Total Trades:</td>
            <td nowrap><b>${rows.length}</b></td>
            <td nowrap colspan="3">Short Trades (won %):</td>
            <td nowrap><b>${shortTrades.length} (${shortTrades.length ? ((shortWins/shortTrades.length)*100).toFixed(2) : '0.00'}%)</b></td>
            <td nowrap colspan="3">Long Trades (won %):</td>
            <td nowrap colspan="2"><b>${longTrades.length} (${longTrades.length ? ((longWins/longTrades.length)*100).toFixed(2) : '0.00'}%)</b></td>
        </tr>
        <tr align="right">
            <td nowrap colspan="4"></td>
            <td nowrap colspan="3">Profit Trades (% of total):</td>
            <td nowrap><b>${wins.length} (${rows.length ? ((wins.length/rows.length)*100).toFixed(2) : '0.00'}%)</b></td>
            <td nowrap colspan="3">Loss Trades (% of total):</td>
            <td nowrap colspan="2"><b>${losses.length} (${rows.length ? ((losses.length/rows.length)*100).toFixed(2) : '0.00'}%)</b></td>
        </tr>
        <tr align="right">
            <td nowrap colspan="4"></td>
            <td nowrap colspan="3">Largest profit trade:</td>
            <td nowrap><b>${wins.length  ? f2(Math.max(...wins.map(r=>parseFloat(r.profit))))   : '0.00'}</b></td>
            <td nowrap colspan="3">Largest loss trade:</td>
            <td nowrap colspan="2"><b>${losses.length ? f2(Math.min(...losses.map(r=>parseFloat(r.profit)))) : '0.00'}</b></td>
        </tr>
        <tr align="right">
            <td nowrap colspan="4"></td>
            <td nowrap colspan="3">Average profit trade:</td>
            <td nowrap><b>${wins.length  ? f2(grossP/wins.length)   : '0.00'}</b></td>
            <td nowrap colspan="3">Average loss trade:</td>
            <td nowrap colspan="2"><b>${losses.length ? f2(grossL/losses.length) : '0.00'}</b></td>
        </tr>
        <tr>
            <td nowrap style="height: 10px"></td>
        </tr>
    </table>
</div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' })
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'TradeHistory.html' })
  a.click(); URL.revokeObjectURL(a.href)
}
