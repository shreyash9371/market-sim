// ── SMALL REUSABLE PIECES ─────────────────────────────────────
export function Card({ children, style = {} }) {
    return (
        <div style={{
            background: 'var(--bg-panel)',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
            ...style,
        }}>
            {children}
        </div>
    )
}

export function CardLabel({ children }) {
    return (
        <div style={{
            fontSize: '11px', fontWeight: 700,
            color: 'var(--text-dim)', textTransform: 'uppercase',
            letterSpacing: '0.7px', marginBottom: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
            {children}
        </div>
    )
}

export function StatPill({ label, value, sub, color, children }) {
    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '16px 20px',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    {label}
                </div>
                {children}
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color, fontFamily: 'var(--font-sans)', lineHeight: 1 }}>
                {value}
            </div>
            {sub && <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '5px', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{sub}</div>}
        </div>
    )
}

export function Btn({ children, onClick, primary, danger, style = {}, id }) {
    const base = {
        fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600,
        padding: '8px 18px', borderRadius: '12px', cursor: 'pointer',
        border: 'none', transition: 'all .15s',
        display: 'inline-flex', alignItems: 'center', gap: '6px',
    }
    const variant = primary
        ? { background: 'var(--accent-blue)', color: '#fff' }
        : danger
            ? { background: 'rgba(239,68,68,0.08)', color: 'var(--accent-red)', border: '1.5px solid rgba(239,68,68,0.2)' }
            : { background: 'var(--bg-base)', color: 'var(--text-secondary)', border: '1.5px solid var(--border)' }
    return <button id={id} onClick={onClick} style={{ ...base, ...variant, ...style }}>{children}</button>
}

export function FGroup({ label, children, full }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...(full ? { gridColumn: '1/-1' } : {}) }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {label}
            </label>
            {children}
        </div>
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