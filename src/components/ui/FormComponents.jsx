import { useState, useEffect, useRef } from 'react'
import { inputStyle } from '../../components/ui/BaseComponents'   // adjust path if needed
import { ASSETS, today } from '../../pages/tools/journal/constants.js' // adjust path

export function CustomSelect({ label, value, onChange, options, placeholder = "— Select —" }) {
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const clickOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false) }
        document.addEventListener('mousedown', clickOut)
        return () => document.removeEventListener('mousedown', clickOut)
    }, [])

    const selectedOpt = options.find(o => o.value === value)

    return (
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    ...inputStyle,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-panel)',
                    borderColor: isOpen ? 'var(--accent-blue)' : 'var(--border)',
                    boxShadow: isOpen ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none',
                }}
            >
                <span style={{ color: selectedOpt ? 'var(--text-primary)' : 'var(--text-dim)', fontWeight: selectedOpt ? 600 : 500 }}>
                    {selectedOpt ? selectedOpt.label : placeholder}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-dim)' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'var(--bg-panel)', border: '1px solid var(--border)',
                    borderRadius: '14px', marginTop: '8px', zIndex: 1000,
                    padding: '6px', boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                    maxHeight: '240px', overflowY: 'auto'
                }} className="no-scrollbar">
                    {options.map(opt => (
                        <div
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            style={{
                                padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                                fontSize: '13px', fontWeight: value === opt.value ? 700 : 500,
                                color: value === opt.value ? 'var(--accent-blue)' : 'var(--text-primary)',
                                background: value === opt.value ? 'rgba(59,130,246,0.08)' : 'transparent',
                                transition: 'all 0.1s', display: 'flex', alignItems: 'center', gap: '10px'
                            }}
                            onMouseEnter={e => { if (value !== opt.value) e.currentTarget.style.background = 'var(--bg-hover)' }}
                            onMouseLeave={e => { if (value !== opt.value) e.currentTarget.style.background = 'transparent' }}
                        >
                            {opt.icon && <span style={{ fontSize: '16px' }}>{opt.icon}</span>}
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export function StyledInput({ icon, ...props }) {
    const [focused, setFocused] = useState(false)
    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <input
                {...props}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    ...inputStyle,
                    background: 'var(--bg-panel)',
                    paddingRight: icon ? '40px' : '13px',
                    borderColor: focused ? 'var(--accent-blue)' : 'var(--border)',
                    boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none',
                }}
            />
            {icon && (
                <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none', display: 'flex' }}>
                    {icon}
                </div>
            )}
        </div>
    )
}

export function AssetAutocomplete({ value, onChange }) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState(value || '')

    const filtered = ASSETS.filter(a => a.toLowerCase().includes(query.toLowerCase()))

    return (
        <div style={{ position: 'relative' }}>
            <StyledInput
                placeholder="e.g. XAUUSD"
                value={query}
                onChange={e => {
                    const val = e.target.value.toUpperCase();
                    setQuery(val);
                    setOpen(true);
                    onChange(val);
                }}
                onFocus={() => setOpen(true)}
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>}
            />
            {open && filtered.length > 0 && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'var(--bg-panel)', border: '1px solid var(--border)',
                    borderRadius: '14px', marginTop: '8px', zIndex: 1000,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.12)', maxHeight: '200px', overflowY: 'auto',
                    padding: '6px'
                }} className="no-scrollbar">
                    {filtered.map(a => (
                        <div
                            key={a}
                            onMouseDown={() => {
                                onChange(a)
                                setQuery(a)
                                setOpen(false)
                            }}
                            style={{
                                padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                                fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
                                transition: 'all 0.1s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            {a}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export function CustomDatePicker({ value, onChange, placeholder = "Select Date", alignRight = false }) {
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
            <div onClick={() => setIsOpen(!isOpen)} style={{ ...inputStyle, background: 'var(--bg-panel)', borderColor: isOpen ? 'var(--accent-blue)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '13px', color: value ? 'var(--text-primary)' : 'var(--text-dim)', fontWeight: value ? 600 : 500 }}>{displayDate}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>

            {isOpen && (
                <div style={{ position: 'absolute', top: '100%', ...(alignRight ? { right: 0 } : { left: 0 }), marginTop: '8px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-md)', zIndex: 1000, width: '280px' }}>
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
                    <button onClick={() => { onChange(today()); setIsOpen(false); }} style={{ width: '100%', marginTop: '16px', border: '1px solid var(--border)', background: 'var(--bg-base)', padding: '6px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer' }}>Go to Today</button>
                </div>
            )}
        </div>
    )
}

export function CustomTimePicker({ value, onChange, placeholder = "--:--" }) {
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const clickOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false) }
        document.addEventListener('mousedown', clickOut)
        return () => document.removeEventListener('mousedown', clickOut)
    }, [])

    const currentH = value ? value.split(':')[0] : '12'
    const currentM = value ? value.split(':')[1] : '00'

    const selectH = (h) => {
        const newH = String(h).padStart(2, '0')
        onChange(`${newH}:${currentM}`)
    }

    const selectM = (m) => {
        const newM = String(m).padStart(2, '0')
        onChange(`${currentH}:${newM}`)
    }

    return (
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
            <div onClick={() => setIsOpen(!isOpen)} style={{ ...inputStyle, background: 'var(--bg-panel)', borderColor: isOpen ? 'var(--accent-blue)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '13px', color: value ? 'var(--text-primary)' : 'var(--text-dim)', fontWeight: value ? 600 : 500 }}>{value || placeholder}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>

            {isOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', overflow: 'hidden', boxShadow: 'var(--shadow-md)', zIndex: 1000, width: '180px' }}>
                    <div className="no-scrollbar" style={{ flex: 1, maxHeight: '200px', overflowY: 'auto', padding: '6px', borderRight: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', textAlign: 'center', marginBottom: '4px', textTransform: 'uppercase' }}>HH</div>
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div key={i} onClick={() => selectH(i)} style={{ padding: '8px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', textAlign: 'center', cursor: 'pointer', background: currentH === String(i).padStart(2, '0') ? 'var(--accent-blue)' : 'transparent', color: currentH === String(i).padStart(2, '0') ? '#fff' : 'var(--text-primary)' }} onMouseEnter={e => { if (currentH !== String(i).padStart(2, '0')) e.currentTarget.style.background = 'var(--bg-hover)' }} onMouseLeave={e => { if (currentH !== String(i).padStart(2, '0')) e.currentTarget.style.background = 'transparent' }}>
                                {String(i).padStart(2, '0')}
                            </div>
                        ))}
                    </div>
                    <div className="no-scrollbar" style={{ flex: 1, maxHeight: '200px', overflowY: 'auto', padding: '6px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', textAlign: 'center', marginBottom: '4px', textTransform: 'uppercase' }}>MM</div>
                        {Array.from({ length: 12 }).map((_, i) => {
                            const val = i * 5
                            return (
                                <div key={i} onClick={() => selectM(val)} style={{ padding: '8px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', textAlign: 'center', cursor: 'pointer', background: currentM === String(val).padStart(2, '0') ? 'var(--accent-blue)' : 'transparent', color: currentM === String(val).padStart(2, '0') ? '#fff' : 'var(--text-primary)' }} onMouseEnter={e => { if (currentM !== String(val).padStart(2, '0')) e.currentTarget.style.background = 'var(--bg-hover)' }} onMouseLeave={e => { if (currentM !== String(val).padStart(2, '0')) e.currentTarget.style.background = 'transparent' }}>
                                    {String(val).padStart(2, '0')}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}