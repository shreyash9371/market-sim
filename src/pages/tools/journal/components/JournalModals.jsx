import React from 'react';
import { Card } from '../../../../components/ui/BaseComponents.jsx';

export default function JournalModals({
    viewingContext,
    setViewingContext,
    tradeToDelete,
    setTradeToDelete,
    skipDeleteConfirm,
    setSkipDeleteConfirm,
    confirmDelete,
    showSuccessModal,
    setShowSuccessModal,
    successQuote,
    lastLoggedTrade,
    openModal
}) {
    return (
        <>
            {/* ── ENHANCED LIGHTBOX (Restored Original Style) ── */}
            {viewingContext && (
                <div
                    onClick={e => { if (e.target === e.currentTarget) setViewingContext(null) }}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(15,23,42,0.92)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 99999, backdropFilter: 'blur(12px)',
                    }}
                >
                    {(() => {
                        const { trades: vTrades, tradeIdx, imgIdx } = viewingContext;
                        const currentTrade = vTrades[tradeIdx];
                        const images = currentTrade.images || [];

                        const handleNext = () => {
                            if (imgIdx < images.length - 1) {
                                setViewingContext({ ...viewingContext, imgIdx: imgIdx + 1 });
                            } else if (tradeIdx < vTrades.length - 1) {
                                setViewingContext({ ...viewingContext, tradeIdx: tradeIdx + 1, imgIdx: 0 });
                            }
                        };

                        const handlePrev = () => {
                            if (imgIdx > 0) {
                                setViewingContext({ ...viewingContext, imgIdx: imgIdx - 1 });
                            } else if (tradeIdx > 0) {
                                const prevTrade = vTrades[tradeIdx - 1];
                                setViewingContext({ ...viewingContext, tradeIdx: tradeIdx - 1, imgIdx: (prevTrade.images?.length || 1) - 1 });
                            }
                        };

                        const canNext = imgIdx < images.length - 1 || tradeIdx < vTrades.length - 1;
                        const canPrev = imgIdx > 0 || tradeIdx > 0;

                        return (
                            <div style={{ position: 'relative', width: '90vw', maxWidth: '1200px', height: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <button onClick={() => setViewingContext(null)} style={{ position: 'absolute', top: '-48px', right: '0', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '13px', fontWeight: 800, padding: '8px 20px', borderRadius: '999px', cursor: 'pointer' }}>Close ✕</button>

                                {canPrev && (
                                    <button onClick={handlePrev} style={{ position: 'absolute', left: '-60px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 10 }}>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                    </button>
                                )}

                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    <img src={images[imgIdx]} alt="Trade Screenshot" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 32px 64px rgba(0,0,0,0.6)' }} />

                                    {/* Date Badge at Bottom Center */}
                                    <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15,23,41,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 24px', borderRadius: '999px', fontSize: '14px', fontWeight: 700, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                                        {currentTrade.date} &nbsp;·&nbsp; {currentTrade.pair} &nbsp;·&nbsp; Image {imgIdx + 1} of {images.length}
                                    </div>
                                </div>

                                {canNext && (
                                    <button onClick={handleNext} style={{ position: 'absolute', right: '-60px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 10 }}>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    </button>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* ── DELETE CONFIRMATION (Restored Original Style) ── */}
            {tradeToDelete && (
                <div
                    onClick={e => { if (e.target === e.currentTarget) setTradeToDelete(null) }}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, backdropFilter: 'blur(4px)' }}
                >
                    <Card style={{ width: '400px', padding: '32px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>Delete this trade?</h2>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>This action cannot be undone. It will be removed from your journal and history.</p>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                            <button style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setTradeToDelete(null)}>Cancel</button>
                            <button style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'var(--accent-red)', color: '#fff', cursor: 'pointer', fontWeight: 600 }} onClick={() => confirmDelete(tradeToDelete)}>Delete</button>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }} onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={skipDeleteConfirm} onChange={e => setSkipDeleteConfirm(e.target.checked)} />
                            <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Don't ask me again</span>
                        </label>
                    </Card>
                </div>
            )}

            {/* ── SUCCESS MODAL (Restored Original Style) ── */}
            {showSuccessModal && lastLoggedTrade && (
                <div
                    onClick={() => setShowSuccessModal(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 999999,
                        background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: '100%', maxWidth: '440px', background: 'var(--bg-panel)',
                            borderRadius: '24px', border: '1px solid var(--border)',
                            padding: '40px 32px', textAlign: 'center', position: 'relative',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Background Decoration */}
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--accent-blue)', opacity: 0.1, filter: 'blur(60px)', borderRadius: '50%' }} />

                        <div style={{ fontSize: '56px', marginBottom: '24px' }}>
                            {/* Note: I'm using a simple trophy here, but you can add your getTradeResult logic if you pass it as a prop */}
                            🏆
                        </div>

                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                            Trade Logged!
                        </h2>

                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            {lastLoggedTrade.pair} · {lastLoggedTrade.date}
                        </p>

                        <div style={{
                            padding: '24px', borderRadius: '20px',
                            background: 'rgba(59,130,246,0.06)', border: '1px dashed rgba(59,130,246,0.2)',
                            marginBottom: '32px'
                        }}>
                            <p style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                                "{successQuote}"
                            </p>
                        </div>

                        <button
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px', fontSize: '15px', fontWeight: 700,
                                background: 'var(--accent-blue)', color: 'white', border: 'none', cursor: 'pointer',
                                boxShadow: '0 10px 20px rgba(59,130,246,0.2)'
                            }}
                            onClick={() => setShowSuccessModal(false)}
                        >
                            Continue Trading
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
