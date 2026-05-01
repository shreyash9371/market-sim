import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { calcPnl, calcRR, getTradeResult } from '../../../utils/tradeMetrics';
import { TradingViewAdvancedChart } from "./components/TradingViewAdvancedChart";

function Badge({ children, variant = 'neutral' }) {
  const bg = variant === 'green' ? 'rgba(16,185,129,0.12)' : variant === 'red' ? 'rgba(239,68,68,0.12)' : 'var(--bg-base)';
  const color = variant === 'green' ? 'var(--accent-green)' : variant === 'red' ? 'var(--accent-red)' : 'var(--text-secondary)';
  const borderColor = variant === 'green' ? 'rgba(16,185,129,0.2)' : variant === 'red' ? 'rgba(239,68,68,0.2)' : 'var(--border)';
  return (
    <span style={{
      background: bg, color, padding: '4px 10px', borderRadius: '8px', border: `1px solid ${borderColor}`,
      fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', textTransform: 'uppercase'
    }}>
      {children}
    </span>
  );
}

function Card({ children, style = {}, noPadding = false }) {
  return (
    <div style={{
      background: 'var(--bg-panel)',
      borderRadius: '20px',
      border: '1px solid var(--border)',
      padding: noPadding ? '0' : '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      ...style,
    }}>
      {children}
    </div>
  );
}

export default function TradeDetailsView({ trade, onBack, onEdit, onDelete }) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!trade) return null;

  const result = getTradeResult(trade);
  const pnl = calcPnl(trade);
  const pnlUsd = pnl ? pnl.usd : 0;
  const rr = calcRR(trade);

  // Use emotion as mistake analysis placeholder if it exists (split by commas if multiple)
  const formatTags = (str) => {
    if (!str) return [];
    if (Array.isArray(str)) return str;
    return String(str).split(',').map(s => s.trim()).filter(s => s.length > 0);
  };
  const mistakeTags = formatTags(trade.emotion);

  return (
    <div style={{ paddingBottom: '60px', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button 
            onClick={onBack}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--accent-blue)', 
              fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px',
              cursor: 'pointer', padding: 0, marginBottom: '12px'
            }}
          >
            ← Back to Trading History
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
              {trade.pair} {trade.dir ? trade.dir.charAt(0).toUpperCase() + trade.dir.slice(1) : ''}
            </h1>
            <Badge variant={result === 'Win' ? 'green' : result === 'Loss' ? 'red' : 'neutral'}>
              {result}
            </Badge>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => onEdit(trade)}
            style={{
              background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '12px',
              padding: '8px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-base)'}
          >
            ✎ Edit Trade
          </button>
          <button 
            onClick={() => onDelete(trade.id)}
            style={{
              background: 'var(--accent-red)', border: 'none', borderRadius: '12px',
              padding: '8px 16px', fontSize: '13px', fontWeight: 600, color: 'white',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s',
              opacity: 0.9
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}
          >
            🗑 Delete Trade
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px', marginTop: '10px' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Execution Snapshot */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Execution Snapshot</h3>
              {trade.session && (
                 <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--bg-base)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                   {trade.session.toUpperCase()} SESSION
                 </span>
              )}
            </div>

            {trade.images && trade.images.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Main viewer */}
                <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', background: '#000', position: 'relative' }}>
                  {trade.images[activeImageIdx]?.includes('tradingview.com') ? (
                    <>
                      <iframe
                        src={trade.images[activeImageIdx]}
                        title="TradingView Chart"
                        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                        allow="fullscreen"
                        loading="lazy"
                      />
                      <div style={{
                        position: 'absolute', top: '10px', left: '10px',
                        background: 'rgba(59,130,246,0.85)', color: 'white',
                        padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                        backdropFilter: 'blur(4px)', pointerEvents: 'none',
                      }}>
                        📊 TradingView Chart
                      </div>
                    </>
                  ) : (
                    <img src={trade.images[activeImageIdx]} alt="Trade Execution" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  )}
                </div>
                {/* Thumbnails row */}
                {trade.images.length > 1 && (
                  <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }} className="no-scrollbar">
                    {trade.images.map((img, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setActiveImageIdx(idx)}
                        style={{ 
                          width: '100px', height: '60px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                          border: activeImageIdx === idx ? '2px solid var(--accent-blue)' : '2px solid transparent',
                          opacity: activeImageIdx === idx ? 1 : 0.6, transition: 'all 0.2s',
                          background: img.includes('tradingview.com') ? 'rgba(59,130,246,0.1)' : '#000',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2px',
                        }}
                      >
                        {img.includes('tradingview.com') ? (
                          <>
                            <span style={{ fontSize: '20px' }}>📊</span>
                            <span style={{ fontSize: '8px', fontWeight: 700, color: 'var(--accent-blue)' }}>TV Chart</span>
                          </>
                        ) : (
                          <img src={img} alt={`Thumbnail ${idx+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '16px', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)' }}>
                <span style={{ color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600 }}>No screenshots appended to this trade.</span>
              </div>
            )}
          </Card>

          {/* Journal Entry */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '20px' }}>📖</span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Journal Entry</h3>
            </div>
            
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
              THOUGHT PROCESS & NOTES
            </div>
            {trade.notes ? (
              <div style={{ 
                background: 'var(--bg-base)', padding: '20px', borderRadius: '12px', 
                border: '1px solid var(--border)', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)' 
              }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {trade.notes}
                </ReactMarkdown>
              </div>
            ) : (
               <div style={{ fontStyle: 'italic', color: 'var(--text-dim)', fontSize: '13px' }}>No notes recorded for this trade.</div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Trade Parameters */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Trade Parameters</h3>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Entry Price</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{trade.entry}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Stop Loss</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-red)' }}>{trade.sl}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Take Profit</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-green)' }}>{trade.tp}</span>
              </div>
              {trade.exit && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Actual Exit</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{trade.exit}</span>
                </div>
              )}
              
              <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Risk:Reward</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>1 : {rr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Lot Size</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{trade.lots} Lots</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Commissions</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: trade.commissions ? 'var(--accent-red)' : 'var(--text-dim)' }}>
                  {trade.commissions ? '-$'+Number(trade.commissions).toFixed(2) : '--'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 800 }}>Net Profit</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: pnlUsd > 0 ? 'var(--accent-green)' : pnlUsd < 0 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                  {pnlUsd > 0 ? '+' : pnlUsd < 0 ? '-' : ''}${Math.abs(pnlUsd).toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* Analysis / Tags */}
          <Card>
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, marginBottom: '16px', color: 'var(--text-primary)' }}>Analysis & Tags</h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {mistakeTags.length > 0 ? (
                mistakeTags.map((tag, idx) => (
                  <span key={idx} style={{
                    background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px',
                    padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    {tag}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>No tags applied.</span>
              )}
            </div>
            
            <button style={{
              background: 'transparent', border: 'none', color: 'var(--text-dim)',
              fontSize: '12px', fontWeight: 600, marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer'
            }}>
              + Add Tag
            </button>
          </Card>

        </div>
      </div>

      {/* ── INTERACTIVE CHART SECTION ── */}
      <div style={{
        background: 'var(--bg-panel)',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        marginTop: '24px',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 6px var(--accent-green)' }} />
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Market Context — {trade.pair}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-base)', padding: '3px 10px', borderRadius: '999px', border: '1px solid var(--border)', fontWeight: 600 }}>
              Live Interactive Chart
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px' }}>💡</span>
            Log in to TradingView inside the chart to <strong>save &amp; restore drawings</strong>
          </div>
        </div>

        {/* Chart */}
        <div style={{ width: '100%', height: '620px' }}>
          <TradingViewAdvancedChart pair={trade.pair} theme={document.documentElement.getAttribute('data-theme') || 'light'} />
        </div>
      </div>
    </div>
  );
}
