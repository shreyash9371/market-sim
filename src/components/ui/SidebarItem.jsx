import { useState } from "react";

export function SidebarItem({ label, active, onClick }) {
    const [hover, setHover] = useState(false)
    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
            style={{
                padding: '12px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--accent-blue)' : hover ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active ? 'rgba(59,130,246,0.1)' : hover ? 'var(--bg-base)' : 'transparent',
                transition: 'all 0.2s ease',
            }}
        >
            {label}
        </div>
    )
}