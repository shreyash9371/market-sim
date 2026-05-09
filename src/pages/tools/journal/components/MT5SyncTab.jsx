import { useState, useRef } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { supabase } from '../../../../utils/supabase'
import { Btn } from '../../../../components/ui/BaseComponents'
import LogTradeView from '../LogTradeView'
import { calcPnl, getTradeResult } from '../../../../utils/tradeMetrics'

export default function MT5SyncTab({ trades, setTrades, auth, strategyId }) {
  const [parsedTrades, setParsedTrades] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [syncingToJournal, setSyncingToJournal] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const fileInputRef = useRef(null)

  // Edit Mode State (uses LogTradeView format)
  const [editingTrade, setEditingTrade] = useState(null)

  const processCSV = (fileOrText) => {
    Papa.parse(fileOrText, {
      header: false,
      skipEmptyLines: false,
      complete: (results) => {
        const rows = results.data

        const parseDateTime = (raw = '') => {
          if (!raw) return { dateStr: new Date().toISOString().split('T')[0], timeStr: '12:00' }
          const cleaned = raw.trim().replace(/^(\d{4})\.(\d{2})\.(\d{2})/, '$1-$2-$3')
          const d = new Date(cleaned)
          if (isNaN(d.getTime())) return { dateStr: new Date().toISOString().split('T')[0], timeStr: '12:00' }
          return {
            dateStr: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
            timeStr: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
          }
        }

        const cleanNum = (val) => {
          if (!val) return ''
          return String(val).replace(/\s/g, '').replace(/,/g, '')
        }

        let posHeaderRowIdx = -1
        for (let i = 0; i < rows.length; i++) {
          const first = (rows[i][0] || '').trim().toLowerCase()
          if (first === 'positions') {
            posHeaderRowIdx = i + 1
            break
          }
        }

        let normalizedTrades = []

        if (posHeaderRowIdx !== -1 && posHeaderRowIdx < rows.length) {
          const headers = rows[posHeaderRowIdx].map(h => (h || '').trim().toLowerCase())
          const timeIndices    = headers.reduce((a, h, i) => h === 'time'    ? [...a, i] : a, [])
          const priceIndices   = headers.reduce((a, h, i) => h === 'price'   ? [...a, i] : a, [])
          const typeIdx        = headers.indexOf('type')
          const symbolIdx      = headers.indexOf('symbol')
          const positionIdx    = headers.indexOf('position')
          const volumeIdx      = headers.indexOf('volume')
          const slIdx          = headers.findIndex(h => h.replace(/[\s\/]/g, '') === 'sl')
          const tpIdx          = headers.findIndex(h => h.replace(/[\s\/]/g, '') === 'tp')
          const commissionIdx  = headers.indexOf('commission')
          const swapIdx        = headers.indexOf('swap')
          const profitIdx      = headers.lastIndexOf('profit')

          const openTimeIdx   = timeIndices[0]  ?? -1
          const closeTimeIdx  = timeIndices[1]  ?? -1
          const entryPriceIdx = priceIndices[0] ?? -1
          const exitPriceIdx  = priceIndices[1] ?? -1

          const STOP_LABELS = ['orders', 'deals', 'balance']

          for (let i = posHeaderRowIdx + 1; i < rows.length; i++) {
            const row = rows[i]
            const firstCell = (row[0] || '').trim().toLowerCase()
            if (STOP_LABELS.includes(firstCell)) break
            if (row.every(c => !c || !c.trim())) continue

            const typeStr = typeIdx !== -1 ? (row[typeIdx] || '').trim().toLowerCase() : ''
            const isBuy  = typeStr === 'buy'  || typeStr === 'buy stop'  || typeStr === 'buy limit'
            const isSell = typeStr === 'sell' || typeStr === 'sell stop' || typeStr === 'sell limit'
            if (!isBuy && !isSell) continue

            const { dateStr: openDate, timeStr: openTime }   = parseDateTime(openTimeIdx  !== -1 ? row[openTimeIdx]  : '')
            const { dateStr: closeDate, timeStr: closeTime } = parseDateTime(closeTimeIdx !== -1 ? row[closeTimeIdx] : '')
            const commission   = parseFloat(cleanNum(row[commissionIdx]) || 0)
            const swap         = parseFloat(cleanNum(row[swapIdx])       || 0)

            normalizedTrades.push({
              id:          positionIdx !== -1 ? (row[positionIdx] || `CSV-${Date.now()}-${i}`) : `CSV-${Date.now()}-${i}`,
              date:        openDate,
              entryTime:   openTime,
              exit_date:   closeDate,
              exitTime:    closeTime,
              pair:        symbolIdx !== -1 ? (row[symbolIdx] || '').trim().toUpperCase() : '',
              dir:         isBuy ? 'long' : 'short',
              lots:        volumeIdx !== -1 ? (cleanNum(row[volumeIdx]) || '0') : '0',
              entry:       entryPriceIdx !== -1 ? cleanNum(row[entryPriceIdx]) : '',
              exit:        exitPriceIdx  !== -1 ? cleanNum(row[exitPriceIdx])  : '',
              sl:          slIdx !== -1 ? cleanNum(row[slIdx]) : '',
              tp:          tpIdx !== -1 ? cleanNum(row[tpIdx]) : '',
              session:     'New York',
              emotion:     'calm',
              pipval:      1,
              commissions: Math.abs(commission + swap),
              notes:       'Imported via CSV/Excel (Positions).',
              images:      []
            })
          }
        }

        if (normalizedTrades.length === 0) {
          let headerIdx = -1
          for (let i = 0; i < Math.min(rows.length, 20); i++) {
            const hasType   = rows[i].some(c => (c||'').trim().toLowerCase() === 'type')
            const hasSymbol = rows[i].some(c => (c||'').trim().toLowerCase() === 'symbol')
            if (hasType && hasSymbol) { headerIdx = i; break }
          }

          if (headerIdx !== -1) {
            const headers = rows[headerIdx].map(h => (h||'').trim().toLowerCase())
            const SKIP_TYPES = ['balance','credit','deposit','withdrawal','correction','bonus']
            const timeIndices  = headers.reduce((a, h, i) => h === 'time'  ? [...a, i] : a, [])
            const priceIndices = headers.reduce((a, h, i) => h === 'price' ? [...a, i] : a, [])

            for (let i = headerIdx + 1; i < rows.length; i++) {
              const row = rows[i]
              if (row.every(c => !c || !c.trim())) continue

              const typeIdx = headers.findIndex(h => h === 'type')
              const typeStr = typeIdx !== -1 ? (row[typeIdx]||'').trim().toLowerCase() : ''
              if (SKIP_TYPES.includes(typeStr) || !typeStr) continue
              const isBuy  = typeStr.includes('buy')
              const isSell = typeStr.includes('sell')
              if (!isBuy && !isSell) continue

              const openTimeIdx   = timeIndices[0]  ?? -1
              const closeTimeIdx  = timeIndices[1]  ?? -1
              const entryPriceIdx = priceIndices[0] ?? -1
              const exitPriceIdx  = priceIndices[1] ?? -1
              const { dateStr: openDate, timeStr: openTime }   = parseDateTime(openTimeIdx  !== -1 ? row[openTimeIdx]  : '')
              const { dateStr: closeDate, timeStr: closeTime } = parseDateTime(closeTimeIdx !== -1 ? row[closeTimeIdx] : '')
              const symbolIdx     = headers.indexOf('symbol')
              const positionIdx   = ['position','ticket','deal','order'].map(k => headers.indexOf(k)).find(x => x !== -1) ?? -1
              const volumeIdx     = headers.findIndex(h => h === 'volume' || h === 'size' || h === 'lots')
              const slIdx         = headers.findIndex(h => h.replace(/[\s\/]/g, '') === 'sl')
              const tpIdx         = headers.findIndex(h => h.replace(/[\s\/]/g, '') === 'tp')
              const commIdx       = headers.indexOf('commission')
              const swapIdx       = headers.indexOf('swap')
              const commission    = parseFloat(cleanNum(row[commIdx])  || 0)
              const swap          = parseFloat(cleanNum(row[swapIdx])  || 0)

              normalizedTrades.push({
                id:          positionIdx !== -1 ? (row[positionIdx] || `CSV-${Date.now()}-${i}`) : `CSV-${Date.now()}-${i}`,
                date:        openDate,
                entryTime:   openTime,
                exit_date:   closeDate,
                exitTime:    closeTime,
                pair:        symbolIdx !== -1 ? (row[symbolIdx]||'').trim().toUpperCase() : '',
                dir:         isBuy ? 'long' : 'short',
                lots:        volumeIdx !== -1 ? (cleanNum(row[volumeIdx])||'0') : '0',
                entry:       entryPriceIdx !== -1 ? cleanNum(row[entryPriceIdx]) : '',
                exit:       exitPriceIdx  !== -1 ? cleanNum(row[exitPriceIdx])  : '',
                sl:          slIdx !== -1 ? cleanNum(row[slIdx]) : '',
                tp:          tpIdx !== -1 ? cleanNum(row[tpIdx]) : '',
                session:     'New York',
                emotion:     'calm',
                pipval:      1,
                commissions: Math.abs(commission + swap),
                notes:       'Imported via CSV/Excel.',
                images:      []
              })
            }
          }
        }

        if (normalizedTrades.length === 0) {
          setError('No valid trades (Buy/Sell) found in the file. Please check the format.')
        } else {
          setParsedTrades(normalizedTrades)
          setSelectedIds(new Set(normalizedTrades.map(t => t.id)))
        }
      },
      error: (err) => {
        setError(err.message)
      }
    })
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError('')
    
    const fileName = file.name.toLowerCase()
    const isHtml = fileName.endsWith('.html') || fileName.endsWith('.htm')
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')

    if (isHtml) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const htmlText = event.target.result
          const parser = new DOMParser()
          const doc = parser.parseFromString(htmlText, 'text/html')
          
          const rows = Array.from(doc.querySelectorAll('tr'))
          if (rows.length < 2) return setError('Could not find trading data in HTML file.')
          
          let newTrades = []
          
          rows.forEach((tr, idx) => {
            const tds = Array.from(tr.querySelectorAll('td'))
            if (tds.length >= 10 && tds.length <= 14) {
              const textNodes = tds.map(td => td.innerText.trim())
              
              let typeColIdx = -1
              for(let i=1; i<5; i++) {
                const t = (textNodes[i] || '').toLowerCase()
                if (t === 'buy' || t === 'sell') {
                  typeColIdx = i
                  break
                }
              }
              
              if (typeColIdx !== -1) {
                const isBuy = textNodes[typeColIdx].toLowerCase() === 'buy'
                
                const dirCol = (textNodes[typeColIdx + 1] || '').toLowerCase()
                if (dirCol === 'in' || dirCol === 'out') return
                
                const stateCol1 = (textNodes[tds.length - 1] || '').toLowerCase()
                const stateCol2 = (textNodes[tds.length - 2] || '').toLowerCase()
                if (['canceled', 'filled', 'placed'].includes(stateCol1) || ['canceled', 'filled', 'placed'].includes(stateCol2)) return

                const dir = isBuy ? 'long' : 'short'
                const symbol = textNodes[typeColIdx - 1] 
                const ticket = textNodes[typeColIdx - 2] || `HTML-${idx}`
                const openTimeRaw = textNodes[0]
                
                // Some MT5 reports have a hidden/spacer column with '0' or empty string here
                let offset = 1;
                if (textNodes[typeColIdx + offset] === '0' || textNodes[typeColIdx + offset] === '') {
                  offset++;
                }

                const lots = textNodes[typeColIdx + offset]
                const entry = textNodes[typeColIdx + offset + 1]
                const sl = textNodes[typeColIdx + offset + 2]
                const tp = textNodes[typeColIdx + offset + 3]
                const closeTimeRaw = textNodes[typeColIdx + offset + 4]
                const exit = textNodes[typeColIdx + offset + 5]
                
                const commission = textNodes[tds.length - 3]
                const swap = textNodes[tds.length - 2]

                let dateStr = new Date().toISOString().split('T')[0]
                let entryTimeStr = '12:00'
                if (openTimeRaw) {
                  const cleanTime = openTimeRaw.replace(/\./g, '-')
                  const dObj = new Date(cleanTime)
                  if (!isNaN(dObj.getTime())) {
                    const y = dObj.getFullYear()
                    const m = String(dObj.getMonth() + 1).padStart(2, '0')
                    const d = String(dObj.getDate()).padStart(2, '0')
                    dateStr = `${y}-${m}-${d}`
                    const hh = String(dObj.getHours()).padStart(2, '0')
                    const mm = String(dObj.getMinutes()).padStart(2, '0')
                    entryTimeStr = `${hh}:${mm}`
                  }
                }

                let exitDateStr = dateStr
                let exitTimeStr = ''
                if (closeTimeRaw) {
                  const cleanTime = closeTimeRaw.replace(/\./g, '-')
                  const dObj = new Date(cleanTime)
                  if (!isNaN(dObj.getTime())) {
                    const y = dObj.getFullYear()
                    const m = String(dObj.getMonth() + 1).padStart(2, '0')
                    const d = String(dObj.getDate()).padStart(2, '0')
                    exitDateStr = `${y}-${m}-${d}`
                    const hh = String(dObj.getHours()).padStart(2, '0')
                    const mm = String(dObj.getMinutes()).padStart(2, '0')
                    exitTimeStr = `${hh}:${mm}`
                  }
                }
                
                const totalComms = Math.abs(parseFloat(commission || 0) + parseFloat(swap || 0))

                newTrades.push({
                  id: ticket,
                  date: dateStr,
                  entryTime: entryTimeStr,
                  exit_date: exitDateStr,
                  exitTime: exitTimeStr,
                  pair: symbol.toUpperCase(),
                  dir: dir,
                  lots: lots || '0',
                  entry: entry || '0',
                  exit: exit || '',
                  sl: sl || '',
                  tp: tp || '',
                  session: 'New York',
                  emotion: 'calm',
                  pipval: 1,
                  commissions: totalComms,
                  notes: `Imported via HTML Report. Ticket #${ticket}`,
                  images: []
                })
              }
            }
          })
          
          if (newTrades.length === 0) return setError('No valid Buy/Sell trades found in HTML.')
          setParsedTrades(newTrades)
          setSelectedIds(new Set(newTrades.map(t => t.id)))
        } catch (err) {
          setError('Failed to parse HTML file: ' + err.message)
        }
      }
      reader.readAsText(file)
    } else if (isExcel) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const csvText = XLSX.utils.sheet_to_csv(worksheet)
          processCSV(csvText)
        } catch (err) {
          setError('Failed to parse Excel file: ' + err.message)
        }
      }
      reader.readAsArrayBuffer(file)
    } else {
      processCSV(file)
    }
  }

  const toggleSelection = (id) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    setParsedTrades(prev => prev.filter(t => t.id !== id))
    const next = new Set(selectedIds)
    next.delete(id)
    setSelectedIds(next)
  }

  const openEdit = (trade, e) => {
    e.stopPropagation()
    setEditingTrade({ ...trade })
  }

  const saveEdit = () => {
    if (!editingTrade) return
    const updatedTrade = { ...editingTrade }
    setParsedTrades(prev => prev.map(t => t.id === updatedTrade.id ? updatedTrade : t))
    setEditingTrade(null)
  }

  async function addSelectedToJournal() {
    if (selectedIds.size === 0) return
    if (!auth?.user) return setError("Must be logged in to save trades to journal.")

    setSyncingToJournal(true)
    setError('')

    const selectedRows = parsedTrades.filter(t => selectedIds.has(t.id))
    
    const newTrades = selectedRows.map(row => ({
      user_id: auth.user.id,
      strategy_id: strategyId,
      pair: row.pair || 'UNKNOWN',
      dir: row.dir || 'long',
      date: row.date,
      exit_date: row.exit_date,
      entryTime: row.entryTime,
      exitTime: row.exitTime,
      entry: parseFloat(row.entry) || 0,
      exit: parseFloat(row.exit) || null,
      sl: parseFloat(row.sl) || 0,
      tp: parseFloat(row.tp) || 0,
      lots: parseFloat(row.lots) || 0.1,
      pipval: parseFloat(row.pipval) || 1, 
      commissions: parseFloat(row.commissions) || 0,
      notes: row.notes,
      images: row.images || [],
    }))

    try {
      const { data, error: insertErr } = await supabase
        .from('trades')
        .insert(newTrades)
        .select()

      if (insertErr) throw insertErr
      
      if (data) {
        setTrades([...trades, ...data])
      }
      
      setParsedTrades(prev => prev.filter(t => !selectedIds.has(t.id)))
      setSelectedIds(new Set())
      
      setSuccessMessage(`Successfully imported ${newTrades.length} trades to your journal!`)
    } catch (err) {
      setError("Failed to add trades: " + err.message)
    } finally {
      setSyncingToJournal(false)
    }
  }

  // Calculate Duration helper
  const calcDuration = (t) => {
    if (!t.date || !t.entryTime || !t.exitTime) return '--'
    const start = new Date(`${t.date}T${t.entryTime}:00`)
    const end = new Date(`${t.exit_date || t.date}T${t.exitTime}:00`)
    const diffMin = Math.round((end - start) / 60000)
    if (isNaN(diffMin) || diffMin < 0) return '--'
    const h = Math.floor(diffMin / 60)
    const m = diffMin % 60
    return `${h}h ${m}m`
  }

  // Calculate RR helper (Planned RR based on TP/SL to match TradingHistoryTab)
  const calcRR = (t) => {
    const entry = parseFloat(t.entry)
    const sl = parseFloat(t.sl)
    const tp = parseFloat(t.tp)
    if (isNaN(entry) || isNaN(sl) || isNaN(tp) || entry === sl) return '--'
    const risk = Math.abs(entry - sl)
    const reward = Math.abs(tp - entry)
    const rr = reward / risk
    return rr > 0 ? rr.toFixed(2) : '--'
  }

  if (editingTrade) {
    return (
      <div style={{ background: 'var(--bg-panel)', borderRadius: '20px', border: '1px solid var(--border)', padding: '24px' }}>
        <LogTradeView 
          form={editingTrade} 
          setForm={setEditingTrade} 
          onSubmit={saveEdit} 
          onCancel={() => setEditingTrade(null)} 
          editingTradeId={editingTrade.id} 
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ background: 'var(--bg-panel)', borderRadius: '20px', border: '1px solid var(--border)', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>Import MT5 Trades (CSV / Excel)</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 24px', maxWidth: '600px' }}>
          Instantly add historical trades to your journal by uploading an MT5 HTML report, CSV, or Excel file.
        </p>

        <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>How to get your file from MT5:</h4>
          <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Open MT5 on your PC and press <strong>Ctrl+T</strong> to open the Toolbox at the bottom.</li>
            <li>Click on the <strong>History</strong> tab to view your past trades.</li>
            <li>Right-click anywhere inside the History tab and select <strong>Report &gt; HTML</strong>.</li>
            <li>Save the HTML file to your computer, and upload it directly below!</li>
          </ol>
        </div>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input 
            type="file" 
            accept=".csv,.html,.htm,.xlsx,.xls"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <Btn primary onClick={() => fileInputRef.current?.click()} style={{ padding: '10px 24px' }}>
            <span style={{ marginRight: '8px' }}>📄</span> Upload File
          </Btn>
          
          {parsedTrades.length > 0 && (
            <Btn onClick={() => { setParsedTrades([]); setSelectedIds(new Set()) }} style={{ background: 'var(--bg-base)', border: '1.5px solid var(--border)', padding: '10px 24px' }}>
              Clear Data
            </Btn>
          )}
        </div>
      </div>

      {parsedTrades.length > 0 && (
        <div style={{ background: 'var(--bg-panel)', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-base)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {selectedIds.size} trade{selectedIds.size !== 1 ? 's' : ''} selected
              </span>
              <button 
                onClick={() => setSelectedIds(new Set(parsedTrades.map(t => t.id)))}
                style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >Select All</button>
              <span style={{ color: 'var(--border)' }}>|</span>
              <button 
                onClick={() => setSelectedIds(new Set())}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >Clear All</button>
            </div>
            
            <Btn primary onClick={addSelectedToJournal} style={{ padding: '8px 20px', opacity: (selectedIds.size === 0 || syncingToJournal) ? 0.5 : 1, pointerEvents: (selectedIds.size === 0 || syncingToJournal) ? 'none' : 'auto' }}>
              {syncingToJournal ? 'Adding...' : 'Add selected to journal'}
            </Btn>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
              <thead style={{ background: 'var(--bg-panel)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                <tr>
                  <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', width: '40px' }}></th>
                  <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>Date</th>
                  <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>Asset</th>
                  <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>Type</th>
                  <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>Result</th>
                  <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>Entry / Exit</th>
                  <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>Lot Size</th>
                  <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>Comms</th>
                  <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>RR</th>
                  <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>Duration</th>
                  <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>P/L</th>
                  <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {parsedTrades.map(t => {
                  const isSelected = selectedIds.has(t.id)
                  const isLong = t.dir === 'long'
                  const pnlObj = calcPnl(t)
                  const pnlVal = pnlObj ? pnlObj.usd : 0
                  const resultStr = getTradeResult(t)
                  
                  return (
                    <tr 
                      key={t.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border)', 
                        background: isSelected ? 'rgba(59,130,246,0.05)' : 'transparent',
                        transition: 'background 0.2s',
                        cursor: 'pointer'
                      }}
                      onClick={() => toggleSelection(t.id)}
                      onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = 'var(--bg-hover)' }}
                      onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'transparent' }}
                    >
                      <td style={{ padding: '12px 20px' }}>
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => toggleSelection(t.id)}
                          onClick={e => e.stopPropagation()}
                          style={{ accentColor: 'var(--accent-blue)', cursor: 'pointer', width: '16px', height: '16px' }} 
                        />
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{t.date}</td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.pair}</td>
                      <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                          background: isLong ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: 'var(--text-primary)'
                        }}>
                          {t.dir}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                          background: resultStr === 'Win' ? 'rgba(16,185,129,0.2)' : resultStr === 'Loss' ? 'rgba(239,68,68,0.2)' : 'rgba(107,114,128,0.2)',
                          color: resultStr === 'Win' ? 'var(--accent-green)' : resultStr === 'Loss' ? 'var(--accent-red)' : 'var(--text-secondary)'
                        }}>
                          {resultStr}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>
                        {t.entryTime || '--:--'} <span style={{ color: 'var(--text-dim)' }}>→</span> {t.exitTime || '--:--'}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>{t.lots}</td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--accent-red)', fontFamily: 'var(--font-sans)' }}>
                        {(t.commissions !== undefined && t.commissions !== null) ? '-$' + Number(t.commissions).toFixed(2) : '--'}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{calcRR(t)}R</td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{calcDuration(t)}</td>
                      <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600, textAlign: 'right', fontFamily: 'var(--font-sans)', color: pnlVal >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        {pnlObj === null ? 'Open' : `${pnlVal >= 0 ? '+' : ''}$${pnlVal.toFixed(2)}`}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={(e) => openEdit(t, e)}
                            style={{ background: 'var(--bg-base)', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: '8px' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button
                            onClick={(e) => handleDelete(t.id, e)}
                            style={{ background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: '6px', borderRadius: '8px' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {successMessage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg-panel)', width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '32px', border: '1px solid var(--border)', boxShadow: '0 24px 48px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 20px' }}>✓</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>Success!</h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.5 }}>{successMessage}</p>
            <Btn primary style={{ width: '100%', justifyContent: 'center' }} onClick={() => setSuccessMessage('')}>Awesome</Btn>
          </div>
        </div>
      )}
    </div>
  )
}
