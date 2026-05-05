import { useState, useMemo } from 'react'
import { filterTrades, downloadCSV, downloadHTML } from '../utils/mt5Export'

export default function ExportTradesModal({ trades = [], firstName = 'Trader', onClose }) {
  const today      = new Date().toISOString().slice(0, 10)
  const firstDate  = trades.length
    ? [...trades].sort((a, b) => (a.date||'').localeCompare(b.date||''))[0]?.date || today
    : today

  const [startDate, setStartDate] = useState(firstDate)
  const [endDate,   setEndDate]   = useState(today)
  const [fileType,  setFileType]  = useState('html')
  const [error,     setError]     = useState('')

  const rows = useMemo(() => filterTrades(trades, startDate, endDate), [trades, startDate, endDate])

  function handleExport() {
    if (!startDate || !endDate)      { setError('Select both dates.'); return }
    if (startDate > endDate)         { setError('Start date must be before end date.'); return }
    if (rows.length === 0)           { setError('No closed trades in this range.'); return }
    setError('')
    if (fileType === 'csv') downloadCSV(rows, firstName)
    else                    downloadHTML(rows, firstName)
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}
    >
      <div style={{
        background:'var(--bg-panel)', border:'1px solid var(--border)',
        borderRadius:'24px', boxShadow:'0 32px 80px rgba(0,0,0,0.22)',
        width:'460px', maxWidth:'94vw', padding:'34px 30px 28px',
        position:'relative', animation:'expUp .2s ease-out',
      }}>
        <style>{`
          @keyframes expUp { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:none} }
          .ei { width:100%; padding:10px 12px; background:var(--bg-base); border:1.5px solid var(--border);
                border-radius:10px; font-size:14px; color:var(--text-primary); outline:none;
                transition:border-color .2s; font-family:var(--font-sans); }
          .ei:focus { border-color:var(--accent-blue); }
          .es { width:100%; padding:10px 12px; background:var(--bg-base); border:1.5px solid var(--border);
                border-radius:10px; font-size:14px; color:var(--text-primary); outline:none; cursor:pointer;
                appearance:none; font-family:var(--font-sans);
                background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
                background-repeat:no-repeat; background-position:right 12px center; transition:border-color .2s; }
          .es:focus { border-color:var(--accent-blue); }
          .elbl { font-size:11px; font-weight:700; color:var(--text-secondary); margin-bottom:5px;
                  text-transform:uppercase; letter-spacing:.5px; display:block; }
        `}</style>

        {/* Close */}
        <button onClick={onClose} style={{
          position:'absolute', top:'16px', right:'18px',
          background:'var(--bg-base)', border:'1px solid var(--border)', borderRadius:'8px',
          width:'28px', height:'28px', display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', fontSize:'16px', color:'var(--text-secondary)',
        }}>×</button>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'22px' }}>
          <div style={{
            width:'42px', height:'42px', borderRadius:'12px',
            background:'linear-gradient(135deg,#3b82f6,#2563eb)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'19px',
          }}>📤</div>
          <div>
            <div style={{ fontSize:'17px', fontWeight:800, color:'var(--text-primary)', letterSpacing:'-0.3px' }}>Export Trades</div>
            <div style={{ fontSize:'12px', color:'var(--text-secondary)', marginTop:'1px' }}>MT5-compatible Trade History Report</div>
          </div>
        </div>

        {/* Date row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
          <div>
            <span className="elbl">Start Date</span>
            <input type="date" className="ei" value={startDate} max={endDate}
              onChange={e => { setStartDate(e.target.value); setError('') }} />
          </div>
          <div>
            <span className="elbl">End Date</span>
            <input type="date" className="ei" value={endDate} min={startDate} max={today}
              onChange={e => { setEndDate(e.target.value); setError('') }} />
          </div>
        </div>

        {/* File type */}
        <div style={{ marginBottom:'16px' }}>
          <span className="elbl">File Type</span>
          <select className="es" value={fileType} onChange={e => setFileType(e.target.value)}>
            <option value="html">HTML — MT5 Trade History Report (styled)</option>
            <option value="csv">CSV — Tab-delimited Positions Table</option>
          </select>
        </div>

        {/* Preview */}
        <div style={{
          padding:'9px 13px', borderRadius:'10px', marginBottom: error ? '10px' : '18px',
          background: rows.length > 0 ? 'rgba(59,130,246,0.06)' : 'rgba(245,158,11,0.06)',
          border:`1px solid ${rows.length > 0 ? 'rgba(59,130,246,0.2)' : 'rgba(245,158,11,0.2)'}`,
          display:'flex', alignItems:'center', gap:'8px',
          fontSize:'13px', fontWeight:600,
          color: rows.length > 0 ? 'var(--accent-blue)' : 'var(--accent-yellow)',
        }}>
          {rows.length > 0 ? '📊' : '⚠️'}
          {rows.length > 0
            ? `${rows.length} closed trade${rows.length !== 1 ? 's' : ''} will be exported`
            : 'No closed trades in this date range'}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding:'8px 12px', borderRadius:'8px', marginBottom:'14px',
            background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.22)',
            fontSize:'13px', color:'var(--accent-red)', fontWeight:600,
          }}>⛔ {error}</div>
        )}

        {/* Actions */}
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={onClose} style={{
            padding:'11px 18px', border:'1.5px solid var(--border)', borderRadius:'12px',
            background:'transparent', color:'var(--text-secondary)',
            fontSize:'13px', fontWeight:700, cursor:'pointer',
          }}>Cancel</button>
          <button onClick={handleExport} style={{
            flex:1, padding:'11px', border:'none', borderRadius:'12px',
            background:'linear-gradient(135deg,#3b82f6,#2563eb)',
            color:'#fff', fontSize:'14px', fontWeight:800, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'7px',
            transition:'opacity .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity='.85'}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 7l3 3 3-3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Export Trades
          </button>
        </div>
      </div>
    </div>
  )
}
