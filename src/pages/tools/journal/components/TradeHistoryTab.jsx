import React from 'react';
import { Card } from '../../../../components/ui/BaseComponents';
import { supabase } from '../../../../utils/supabase';
import {
    calcPnl,
    calcRR,
    getTradeResult,
    calcDuration
} from '../../../../utils/tradeMetrics';

export default function TradeHistoryTab({
    trades,
    setTrades,
    setSelectedTradeDetail,
    openModal,
    handleDeleteClick,
    setViewingContext
}) {
    return (
        <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '24px' }}>
                Trading History
            </h1>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Date</th>
                            <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Asset</th>
                            <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Type</th>
                            <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Result</th>
                            <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Entry / Exit</th>
                            <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Lot Size</th>
                            <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Comms</th>
                            <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>RR</th>
                            <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Duration</th>
                            <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', textAlign: 'right' }}>P/L</th>
                            <th style={{ padding: '16px 20px', width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.length === 0 ? (
                            <tr><td colSpan="11" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '14px' }}>No trades logged yet.</td></tr>
                        ) : trades.slice().sort((a, b) => {
                            const aTime = new Date(`${a.date}T${a.entryTime || '00:00'}:00`)
                            const bTime = new Date(`${b.date}T${b.entryTime || '00:00'}:00`)
                            return bTime - aTime
                        }).map(t => {
                            const pnl = calcPnl(t)
                            const pnlVal = pnl ? pnl.usd : null
                            return (
                                <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} onClick={() => setSelectedTradeDetail(t)}>
                                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{t.date}</td>
                                    <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.pair}</td>
                                    <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                                            background: t.dir === 'long' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {t.dir}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                                                background: getTradeResult(t) === 'Win' ? 'rgba(16,185,129,0.2)' : getTradeResult(t) === 'Loss' ? 'rgba(239,68,68,0.2)' : 'rgba(107,114,128,0.2)',
                                                color: getTradeResult(t) === 'Win' ? 'var(--accent-green)' : getTradeResult(t) === 'Loss' ? 'var(--accent-red)' : 'var(--text-secondary)'
                                            }}>
                                                {getTradeResult(t)}
                                            </span>
                                            {t.exit && (
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation()
                                                        let nextStatus
                                                        if (!t.manual_result) nextStatus = 'BE'
                                                        else if (t.manual_result === 'BE') nextStatus = 'Win'
                                                        else if (t.manual_result === 'Win') nextStatus = 'Loss'
                                                        else nextStatus = null

                                                        setTrades(prev => prev.map(tr => tr.id === t.id ? { ...tr, manual_result: nextStatus } : tr))

                                                        const { error } = await supabase.from('trades').update({ manual_result: nextStatus }).eq('id', t.id)
                                                        if (error) {
                                                            alert('Failed to update result.');
                                                            setTrades(prev => prev.map(tr => tr.id === t.id ? { ...tr, manual_result: t.manual_result } : tr))
                                                        }
                                                    }}
                                                    style={{
                                                        background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '6px',
                                                        padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.manual_result === 'BE' ? 'var(--accent-blue)' : 'var(--text-dim)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>
                                        {t.entryTime || '--:--'} <span style={{ color: 'var(--text-dim)' }}>→</span> {t.exitTime || '--:--'}
                                    </td>
                                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>{t.lots}</td>
                                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--accent-red)', fontFamily: 'var(--font-sans)' }}>{t.commissions ? '-$' + Number(t.commissions).toFixed(2) : '--'}</td>
                                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{calcRR(t)}R</td>
                                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{calcDuration(t)}</td>
                                    <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600, textAlign: 'right', fontFamily: 'var(--font-sans)', color: pnlVal >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                        {pnlVal === null ? 'Open' : `${pnlVal >= 0 ? '+' : ''}$${pnlVal.toFixed(2)}`}
                                    </td>
                                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            {t.images && t.images.length > 0 && (
                                                <button
                                                    onClick={() => {
                                                        e.stopPropagation();
                                                        const reversed = trades.slice().reverse()
                                                        const tIdx = reversed.findIndex(rt => rt.id === t.id)
                                                        setViewingContext({ trades: reversed, tradeIdx: tIdx, imgIdx: 0 })
                                                    }}
                                                    style={{ background: 'rgba(59,130,246,0.1)', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)', padding: '6px', borderRadius: '8px' }}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openModal(t);
                                                }}
                                                style={{ background: 'var(--bg-base)', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: '8px' }}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(t.id);
                                                }}
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
            </Card>
        </div>
    );
}
