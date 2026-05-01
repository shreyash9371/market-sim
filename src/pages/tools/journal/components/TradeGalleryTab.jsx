import React from 'react';
import { CustomSelect } from '../../../../components/ui/FormComponents.jsx';
import { calcPnl } from '../../../../utils/tradeMetrics';

export default function TradeGalleryTab({
    galleryTrades,
    galleryDateFilter,
    setGalleryDateFilter,
    galleryResultFilter,
    setGalleryResultFilter,
    setViewingContext
}) {
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', margin: 0 }}>
                    Trade Gallery
                </h1>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '160px' }}>
                        <CustomSelect
                            value={galleryDateFilter}
                            onChange={setGalleryDateFilter}
                            options={[
                                { value: 'All', label: 'All Dates' },
                                { value: 'Today', label: 'Today' },
                                { value: 'This Week', label: 'This Week' },
                                { value: 'This Month', label: 'This Month' },
                            ]}
                        />
                    </div>
                    <div style={{ width: '140px' }}>
                        <CustomSelect
                            value={galleryResultFilter}
                            onChange={setGalleryResultFilter}
                            options={[
                                { value: 'All', label: 'All Results' },
                                { value: 'Win', label: 'Wins Only' },
                                { value: 'Loss', label: 'Losses Only' },
                                { value: 'BE', label: 'Break Even' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {galleryTrades.length === 0 ? (
                <div style={{ padding: '80px 20px', textAlign: 'center', background: 'var(--bg-panel)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>No images found</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Try adjusting your filters or log more trades with screenshots.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    {galleryTrades.map((t, tIdx) => (
                        <div
                            key={t.id}
                            onClick={() => setViewingContext({ trades: galleryTrades, tradeIdx: tIdx, imgIdx: 0 })}
                            style={{
                                background: 'var(--bg-panel)', borderRadius: '20px', overflow: 'hidden',
                                border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: 'var(--shadow-sm)', position: 'relative',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)'
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                            }}
                        >
                            <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
                                <img src={t.images[0]} alt={t.pair} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-panel)', borderTop: '1px solid var(--border)' }}>
                                <div style={{
                                    fontSize: '11px', fontWeight: 800,
                                    color: (calcPnl(t)?.usd || 0) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                                    textTransform: 'uppercase',
                                    minWidth: '60px'
                                }}>
                                    {t.pair}
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                    {t.date}
                                </span>
                                <div style={{ minWidth: '60px', textAlign: 'right' }}>
                                    {t.images.length > 1 && (
                                        <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
                                            +{t.images.length - 1} MORE
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
