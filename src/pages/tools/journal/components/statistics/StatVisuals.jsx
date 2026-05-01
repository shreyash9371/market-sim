import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { Card, CardHeader } from './StatUIComponents'

export default function StatVisuals({ stats, setShowScoreInfo }) {
  return (
    <>
      {/* ── SECTION LABEL ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Equity Curve</div>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* ── EQUITY CURVE ROW ── */}
      <Card style={{ paddingBottom: '12px' }}>
        <CardHeader title="Equity Curve" />
        <div style={{ height: '240px', width: '100%', marginTop: '4px' }}>
          {stats.equityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.equityData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-base)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-dim)', fontFamily: 'var(--font-sans)' }} hide />
                <YAxis
                  domain={['auto', 'auto']}
                  axisLine={false} tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--text-dim)', fontWeight: 600, fontFamily: 'var(--font-sans)' }}
                  tickFormatter={(val) => `$${val.toLocaleString()}`}
                  width={70}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isProfit = data.pnl >= 0;
                      return (
                        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', fontFamily: 'var(--font-sans)' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>{data.date}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Trade P&L</span>
                              <span style={{ fontSize: '12px', fontWeight: 800, color: isProfit ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                {isProfit ? '+' : ''}${Math.abs(data.pnl).toFixed(2)}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', paddingTop: '4px', borderTop: '1px solid var(--border)' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>New Balance</span>
                              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>${data.equity.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="equity" stroke="var(--accent-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorEquity)" dot={{ r: 3, fill: '#fff', strokeWidth: 2, stroke: 'var(--accent-blue)' }} activeDot={{ r: 5, fill: '#fff', stroke: 'var(--accent-blue)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600 }}>
              No trades to plot exactly yet.
            </div>
          )}
        </div>
      </Card>

      {/* ── SECTION LABEL ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Performance Breakdown</div>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* ── METRICS & TRADER SCORE ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 440px', gap: '20px' }}>
        
        {/* Left Side: 6 Widgets in 2 rows of 3 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Profit vs Loss Summary */}
          <Card>
            <CardHeader title="Profit vs Loss Summary" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '4px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Gross Profit</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>+${stats.grossProfit.toFixed(2)}</div>
                <div style={{ marginTop: '8px', height: '5px', borderRadius: '99px', background: 'rgba(16,185,129,0.15)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((stats.grossProfit / (stats.grossProfit + stats.grossLoss || 1)) * 100, 100)}%`, height: '100%', background: 'var(--accent-green)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>{((stats.grossProfit / (stats.grossProfit + stats.grossLoss || 1)) * 100).toFixed(1)}% of total volume</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Gross Loss</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>-${stats.grossLoss.toFixed(2)}</div>
                <div style={{ marginTop: '8px', height: '5px', borderRadius: '99px', background: 'rgba(239,68,68,0.15)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((stats.grossLoss / (stats.grossProfit + stats.grossLoss || 1)) * 100, 100)}%`, height: '100%', background: 'var(--accent-red)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>{((stats.grossLoss / (stats.grossProfit + stats.grossLoss || 1)) * 100).toFixed(1)}% of total volume</div>
              </div>
            </div>
          </Card>

          {/* Win / Loss Analysis 2x2 Grid */}
          <Card>
            <CardHeader title="Win / Loss Analysis" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
              
              {/* Biggest Win */}
              <div style={{ background: 'rgba(16,185,129,0.04)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(16,185,129,0.12)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Biggest Win</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                  +${stats.biggestWin.toFixed(2)}
                </div>
              </div>

              {/* Biggest Loss */}
              <div style={{ background: 'rgba(239,68,68,0.04)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(239,68,68,0.12)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Biggest Loss</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                  -${stats.biggestLoss.toFixed(2)}
                </div>
              </div>

              {/* Avg Win */}
              <div style={{ background: 'var(--bg-base)', borderRadius: '12px', padding: '12px 14px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Avg Win</span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-green)', letterSpacing: '-0.3px' }}>
                  +${stats.avgWinSize.toFixed(2)}
                </div>
              </div>

              {/* Avg Loss */}
              <div style={{ background: 'var(--bg-base)', borderRadius: '12px', padding: '12px 14px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Avg Loss</span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-red)', letterSpacing: '-0.3px' }}>
                  -${stats.avgLossSize.toFixed(2)}
                </div>
              </div>

            </div>
          </Card>

          {/* Trade Mechanics */}
          <Card>
            <CardHeader title="Trade Mechanics" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Avg Duration</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.avgDurationStr}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>per trade avg</div>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Avg Lot Size</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.avgLotSize}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>lots per trade</div>
              </div>
            </div>
          </Card>

        </div>

        {/* Right Side: Trader Score */}
        <Card style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '260px', background: 'linear-gradient(135deg, var(--bg-panel) 0%, rgba(59,130,246,0.03) 100%)', borderTop: '3px solid var(--accent-blue)', position: 'relative' }}>
          <button 
            onClick={() => setShowScoreInfo(true)}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'var(--bg-base)', border: '1px solid var(--border)',
              width: '24px', height: '24px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.2s', zIndex: 20
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-blue)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-base)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            !
          </button>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', zIndex: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <CardHeader title="Trader Score" />
              </div>
              <div style={{ fontSize: '42px', fontWeight: 800, color: stats.overallScore >= 70 ? 'var(--accent-green)' : stats.overallScore >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)', letterSpacing: '-2px', lineHeight: 1, marginTop: '-8px' }}>
                {stats.overallScore}
                <span style={{ fontSize: '16px', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: 0 }}> / 100</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px', fontWeight: 600 }}>
                {stats.overallScore >= 70 ? '🏆 Top performer' : stats.overallScore >= 50 ? '📈 Developing' : '⚠️ Needs work'}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative', marginTop: '-10px', marginBottom: '-10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats.radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-dim)', fontSize: 11, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Trader" dataKey="A" stroke="var(--accent-blue)" fill="var(--accent-blue)" fillOpacity={0.2} strokeWidth={2} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 6px 16px rgba(0,0,0,0.08)', fontSize: '11px', fontWeight: 600, padding: '4px 8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  )
}
