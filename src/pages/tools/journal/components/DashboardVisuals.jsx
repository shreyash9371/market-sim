import React from 'react';
import { Card, CardLabel } from '../../../../components/ui/BaseComponents.jsx';
import { CustomSelect, CustomDatePicker } from '../../../../components/ui/FormComponents.jsx';
import { calcPnl, SESSIONS, DAYS } from '../../../../utils/tradeMetrics';

export default function DashboardVisuals({
    dashboardFilter,
    setDashboardFilter,
    dashboardSpecificDate,
    setDashboardSpecificDate,
    dashboardCustomStart,
    setDashboardCustomStart,
    dashboardCustomEnd,
    setDashboardCustomEnd,
    dashboardFilteredTrades,
    biasWord,
    biasColor,
    biasDesc,
    bullPct,
    bearPct,
    longs,
    shorts,
    bestDay,
    dayStats,
    maxBarVal,
    assetRows,
    sessionMap
}) {
    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', marginTop: '32px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
                    Visualizations
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '160px' }}>
                        <CustomSelect
                            value={dashboardFilter}
                            onChange={setDashboardFilter}
                            options={[
                                { value: 'All', label: 'Overall Results' },
                                { value: 'Today', label: 'Today' },
                                { value: 'Yesterday', label: 'Yesterday' },
                                { value: 'Specific', label: 'Specific Date' },
                                { value: 'Custom', label: 'Custom Range' },
                            ]}
                        />
                    </div>
                    {dashboardFilter === 'Specific' && (
                        <div style={{ width: '150px' }}>
                            <CustomDatePicker
                                value={dashboardSpecificDate}
                                onChange={setDashboardSpecificDate}
                                placeholder="Select date"
                                alignRight
                            />
                        </div>
                    )}
                    {dashboardFilter === 'Custom' && (
                        <div style={{ display: 'flex', gap: '8px', width: '280px' }}>
                            <CustomDatePicker value={dashboardCustomStart} onChange={setDashboardCustomStart} placeholder="Start" />
                            <CustomDatePicker value={dashboardCustomEnd} onChange={setDashboardCustomEnd} placeholder="End" alignRight />
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* CARD 1 — BEHAVIORAL BIAS */}
                <Card>
                    <CardLabel>
                        Behavioral Bias
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'none', letterSpacing: 0 }}>
                            {dashboardFilteredTrades.length} filtered trades
                        </span>
                    </CardLabel>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        {/* Bear side */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                                width: '52px', height: '52px', borderRadius: '16px',
                                background: 'rgba(239,68,68,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px',
                            }}>🐻</div>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bear</span>
                        </div>

                        {/* Center label */}
                        <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: biasColor, letterSpacing: '-0.5px', marginBottom: '4px' }}>
                                {biasWord}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{biasDesc}</div>
                        </div>

                        {/* Bull side */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                                width: '52px', height: '52px', borderRadius: '16px',
                                background: 'rgba(16,185,129,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px',
                            }}>🐂</div>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bull</span>
                        </div>
                    </div>

                    {/* Track */}
                    <div style={{ position: 'relative', height: '8px', background: 'var(--bg-base)', borderRadius: '999px', marginBottom: '12px', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${bearPct * 100}%`, background: 'rgba(239,68,68,0.5)', borderRadius: '999px', transition: 'width .6s ease' }} />
                        <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: `${bullPct * 100}%`, background: 'rgba(16,185,129,0.5)', borderRadius: '999px', transition: 'width .6s ease' }} />
                        <div style={{
                            position: 'absolute', top: '50%',
                            left: `${bullPct * 100}%`,
                            transform: 'translate(-50%, -50%)',
                            width: '16px', height: '16px', borderRadius: '50%',
                            background: 'var(--accent-blue)', border: '3px solid var(--bg-panel)',
                            boxShadow: '0 0 0 2px var(--accent-blue), 0 2px 6px rgba(59,130,246,0.35)',
                            transition: 'left .6s ease',
                        }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {shorts} shorts &nbsp;({(bearPct * 100).toFixed(1)}%)
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {longs} longs &nbsp;({(bullPct * 100).toFixed(1)}%)
                        </span>
                    </div>
                </Card>

                {/* CARD 2 — DAY PERFORMANCE */}
                <Card style={{ paddingBottom: '16px' }}>
                    <CardLabel>
                        Trading Day Performance
                        <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-secondary)', textTransform: 'none', letterSpacing: 0 }}>
                            Best Day: <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{bestDay}</span>
                        </span>
                    </CardLabel>

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '40px', height: '140px', marginTop: '30px' }}>
                        {DAYS.map(day => {
                            const stats = dayStats[day]
                            const net = stats.net
                            const isNeg = net < 0
                            const formatNet = (Math.abs(net) % 1 === 0) ? Math.abs(net).toFixed(0) : Math.abs(net).toFixed(1)
                            const winH = (stats.win / maxBarVal) * 90
                            const lossH = (stats.loss / maxBarVal) * 90
                            return (
                                <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', height: '100%' }}>
                                    <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '6px' }}>
                                        <div style={{
                                            flex: 1,
                                            height: `${Math.max(winH, 4)}%`,
                                            borderRadius: '8px',
                                            background: 'var(--accent-green)',
                                            transition: 'height .5s ease',
                                        }} />
                                        <div style={{
                                            flex: 1,
                                            height: `${Math.max(lossH, 4)}%`,
                                            borderRadius: '8px',
                                            background: 'var(--accent-red)',
                                            transition: 'height .5s ease',
                                        }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                                            {isNeg ? '-' : ''}${formatNet}
                                        </span>
                                        <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-secondary)', textTransform: 'none' }}>{day}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>

                {/* CARD 3 — ASSET BREAKDOWN */}
                <Card>
                    <CardLabel>Asset Performance</CardLabel>

                    {assetRows.length === 0
                        ? <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>No closed trades yet.</p>
                        : assetRows.map(([pair, d]) => {
                            const t = d.w + d.l
                            const wPct = t ? d.w / t * 100 : 0
                            const pos = d.pnl >= 0
                            return (
                                <div key={pair} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                                    {/* Pair name pill */}
                                    <span style={{
                                        fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500,
                                        background: 'var(--bg-base)', border: '1px solid var(--border)',
                                        borderRadius: '8px', padding: '3px 10px',
                                        width: '68px', textAlign: 'center', flexShrink: 0,
                                        color: 'var(--text-primary)',
                                    }}>{pair}</span>

                                    {/* Bar */}
                                    <div style={{ flex: 1, height: '8px', borderRadius: '999px', background: 'var(--bg-base)', overflow: 'hidden', position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${wPct}%`, background: 'var(--accent-green)', borderRadius: '999px 0 0 999px' }} />
                                        <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: `${100 - wPct}%`, background: 'var(--accent-red)', borderRadius: '0 999px 999px 0' }} />
                                    </div>

                                    {/* W/L */}
                                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--text-secondary)', width: '56px', textAlign: 'right', flexShrink: 0 }}>
                                        {d.w}W / {d.l}L
                                    </span>

                                    {/* PnL */}
                                    <span style={{
                                        fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
                                        width: '68px', textAlign: 'right', flexShrink: 0,
                                    }}>
                                        {pos ? '+' : ''}${d.pnl.toFixed(2)}
                                    </span>
                                </div>
                            )
                        })
                    }
                </Card>

                {/* CARD 4 — SESSION WIN RATES */}
                <Card>
                    <CardLabel>Session Win Rates</CardLabel>

                    {SESSIONS.map(s => {
                        const d = sessionMap[s.key]
                        const t = d ? d.w + d.l : 0
                        const rate = t ? d.w / t * 100 : 0
                        return (
                            <div key={s.key} style={{ marginBottom: '18px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</span>
                                    </div>
                                    <span style={{
                                        fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
                                    }}>
                                        {rate.toFixed(1)}%
                                    </span>
                                </div>
                                <div style={{ height: '6px', background: 'var(--bg-base)', borderRadius: '999px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', width: `${rate}%`,
                                        background: s.color, opacity: 0.75,
                                        borderRadius: '999px', transition: 'width .6s ease',
                                    }} />
                                </div>
                            </div>
                        )
                    })}
                </Card>
            </div>
        </>
    );
}
