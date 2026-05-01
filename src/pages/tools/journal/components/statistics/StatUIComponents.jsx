import { useState, useRef, useEffect } from 'react'

export function Card({ children, style = {}, noPadding = false, hoverable = false }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => hoverable && setHover(true)}
      onMouseLeave={() => hoverable && setHover(false)}
      style={{
        background: 'var(--bg-panel)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        padding: noPadding ? '0' : '20px',
        boxShadow: hover ? '0 8px 30px rgba(0,0,0,0.07)' : '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'var(--font-sans)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
        ...style,
      }}>
      {children}
    </div>
  )
}

export function StatPill({ label, value, sub, color, icon }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--bg-panel)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        padding: '16px 20px',
        boxShadow: hover ? '0 8px 30px rgba(0,0,0,0.07)' : '0 1px 3px rgba(0,0,0,0.04)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 700, color, fontFamily: 'var(--font-sans)', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '5px', fontFamily: 'var(--font-sans)' }}>{sub}</div>}
    </div>
  )
}

export function CardHeader({ title, endAction = null }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: '16px', padding: '0 2px'
    }}>
      <h3 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'var(--font-sans)' }}>
        {title}
      </h3>
      {endAction}
    </div>
  )
}

export function Badge({ children, variant = 'neutral' }) {
  const bg = variant === 'green' ? 'rgba(16,185,129,0.12)' : variant === 'red' ? 'rgba(239,68,68,0.12)' : 'var(--bg-base)'
  const color = variant === 'green' ? 'var(--accent-green)' : variant === 'red' ? 'var(--accent-red)' : 'var(--text-secondary)'
  const borderColor = variant === 'green' ? 'rgba(16,185,129,0.2)' : variant === 'red' ? 'rgba(239,68,68,0.2)' : 'var(--border)'
  return (
    <span style={{
      background: bg, color, padding: '3px 8px', borderRadius: '6px', border: `1px solid ${borderColor}`,
      fontSize: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)'
    }}>
      {children}
    </span>
  )
}

export function PillHighlight({ val, positive }) {
  return (
    <span style={{
      background: positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
      color: positive ? 'var(--accent-green)' : 'var(--accent-red)',
      padding: '3px 10px', borderRadius: '999px',
      fontSize: '11px', fontWeight: 800, marginLeft: '10px',
      border: `1px solid ${positive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
    }}>
      {positive ? '+' : ''}{val}
    </span>
  )
}

export const inputStyle = {
  background: 'var(--bg-card)',
  border: '1.5px solid var(--border)',
  borderRadius: '12px',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-sans)',
  fontSize: '13px',
  padding: '9px 13px',
  outline: 'none',
  width: '100%',
  transition: 'border .15s',
}

export function CustomDatePicker({ value, onChange, placeholder = "Select Date" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(value ? new Date(value + 'T12:00:00') : new Date())
  const ref = useRef(null)

  useEffect(() => {
    const clickOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false) }
    document.addEventListener('mousedown', clickOut)
    return () => document.removeEventListener('mousedown', clickOut)
  }, [])

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate()
  const startDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()

  const handleDaySelect = (d) => {
    const month = String(viewDate.getMonth() + 1).padStart(2, '0')
    const day = String(d).padStart(2, '0')
    const newVal = `${viewDate.getFullYear()}-${month}-${day}`
    onChange(newVal)
    setIsOpen(false)
  }

  const changeMonth = (offset) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1))
  }

  const displayDate = value ? (() => {
    const [y, m, d] = value.split('-')
    return `${d}-${m}-${y}`
  })() : placeholder

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ ...inputStyle, background: 'var(--bg-panel)', borderColor: isOpen ? 'var(--accent-blue)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', height: '36px' }}>
        <span style={{ fontSize: '13px', color: value ? 'var(--text-primary)' : 'var(--text-dim)', fontWeight: value ? 600 : 500 }}>{displayDate}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-md)', zIndex: 1000, width: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button onClick={() => changeMonth(-1)} style={{ background: 'var(--bg-base)', border: 'none', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', color: 'var(--text-primary)' }}>❮</button>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            <button onClick={() => changeMonth(1)} style={{ background: 'var(--bg-base)', border: 'none', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', color: 'var(--text-primary)' }}>❯</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>{d}</div>
            ))}
            {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => {
              const d = i + 1
              const month = String(viewDate.getMonth() + 1).padStart(2, '0')
              const dayStr = String(d).padStart(2, '0')
              const isSelected = value === `${viewDate.getFullYear()}-${month}-${dayStr}`
              return (
                <div key={d}
                  onClick={() => handleDaySelect(d)}
                  style={{
                    padding: '8px 0', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer',
                    background: isSelected ? 'var(--accent-blue)' : 'transparent',
                    color: isSelected ? '#fff' : 'var(--text-primary)',
                    transition: 'all 0.1s'
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                >{d}</div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
