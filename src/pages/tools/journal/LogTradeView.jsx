import { useEffect } from 'react'
import { SESSIONS } from '../../../utils/tradeMetrics'
import { startLogTradeTour } from '../../../system/ProductTourManager'
import { TradingViewAdvancedChart } from './components/TradingViewAdvancedChart'
import { PositionQuickFill } from './components/PositionQuickFill'
import { CustomSelect, StyledInput, AssetAutocomplete, CustomDatePicker, CustomTimePicker } from '../../../components/ui/FormComponents'
import { FGroup, inputStyle } from '../../../components/ui/BaseComponents'

// ── Small helpers ─────────────────────────────────────────────
function SectionLabel({ color, label }) {
  return (
    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ width: '16px', height: '2px', background: color, borderRadius: '1px', display: 'inline-block', flexShrink: 0 }} />
      {label}
    </div>
  )
}

function Divider() {
  return <div style={{ height: '1px', background: 'var(--border)', marginBottom: '22px' }} />
}

// ── Main Component ────────────────────────────────────────────
export default function LogTradeView({ form, setForm, onSubmit, onCancel, editingTradeId }) {
  const theme = document.documentElement.getAttribute('data-theme') || 'light'
  const pair = form.pair || 'EURUSD'

  useEffect(() => {
    if (!editingTradeId) startLogTradeTour();
  }, [editingTradeId])

  function setF(field, val) {
    setForm(f => ({ ...f, [field]: val }))
  }

  function handlePositionApply({ dir, entry, sl, tp }) {
    setForm(f => ({
      ...f,
      dir: dir || f.dir,
      entry: entry || f.entry,
      sl: sl || f.sl,
      tp: tp || f.tp,
    }))
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans)', paddingBottom: '40px' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        <div>
          <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0, marginBottom: '8px' }}>
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
            {editingTradeId ? '✎ Edit Trade' : '+ Log New Trade'}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '3px', marginBottom: 0 }}>
            Draw your setup on the chart · use Auto-Fill to populate levels · save the trade
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => startLogTradeTour(true)} style={{
            background: 'none', border: '1.5px solid var(--border)',
            color: 'var(--text-secondary)', padding: '6px 14px', borderRadius: '10px',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
            marginRight: '8px'
          }}>
            💡 How it works
          </button>
          <button onClick={onCancel} style={{ background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onSubmit}
            style={{ background: 'var(--accent-blue)', border: 'none', borderRadius: '12px', padding: '9px 26px', fontSize: '13px', fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,0.3)', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {editingTradeId ? '✓ Update Trade' : '✓ Save Trade'}
          </button>
        </div>
      </div>

      {/* ── CHART SECTION (TOP, FULL WIDTH) ── */}
      <div style={{
        background: '#0d1117', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden', marginBottom: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        {/* Chart Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'white', whiteSpace: 'nowrap' }}>Interactive Chart</span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '2px 10px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.08)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>TradingView</span>
          </div>

          <div id="tour-log-pair" style={{ flex: 1, maxWidth: '240px' }}>
            <AssetAutocomplete value={form.pair} onChange={val => setF('pair', val)} />
          </div>

          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span>💡</span> Log into TV for <strong style={{ color: 'rgba(255,255,255,0.55)' }}>saved drawings</strong>
          </div>
        </div>

        {/* Chart iframe */}
        <div style={{ width: '100%', height: '560px' }}>
          <TradingViewAdvancedChart pair={pair} theme={theme} />
        </div>

        {/* ── POSITION AUTO-FILL BAR ── */}
        <PositionQuickFill onApply={handlePositionApply} />
      </div>

      {/* ── FORM FIELDS (BOTTOM) ── */}
      <div style={{ background: 'var(--bg-panel)', borderRadius: '20px', border: '1px solid var(--border)', padding: '28px', marginBottom: '24px' }}>

        {/* Section 1: Trade Identity */}
        <div style={{ marginBottom: '22px' }}>
          <SectionLabel color="var(--accent-blue)" label="Trade Identity" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <FGroup id="tour-log-dir" label="Direction">
              <CustomSelect value={form.dir} onChange={val => setF('dir', val)} options={[{ value: 'long', label: '📈 Long' }, { value: 'short', label: '📉 Short' }]} />
            </FGroup>
            <FGroup label="Session">
              <CustomSelect value={form.session} onChange={val => setF('session', val)} placeholder="Session" options={SESSIONS.map(s => ({ value: s.key, label: s.label }))} />
            </FGroup>
            <FGroup label="Emotion">
              <CustomSelect value={form.emotion} onChange={val => setF('emotion', val)} placeholder="Emotion" options={[
                { value: 'calm', label: '😌 Calm' }, { value: 'confident', label: '💪 Confident' },
                { value: 'fomo', label: '😰 FOMO' }, { value: 'fearful', label: '😨 Fearful' },
                { value: 'greedy', label: '🤑 Greedy' }, { value: 'patient', label: '🧘 Patient' },
                { value: 'disciplined', label: '✅ Disciplined' },
              ]} />
            </FGroup>
          </div>
        </div>

        <Divider />

        {/* Section 2: Price Levels */}
        <div style={{ marginBottom: '22px' }}>
          <SectionLabel color="var(--accent-green)" label="Price Levels" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            <FGroup id="tour-log-entry" label="Entry *">
              <StyledInput type="number" step="0.00001" value={form.entry} onChange={e => setF('entry', e.target.value)} placeholder="1.08520" />
            </FGroup>
            <FGroup label="Exit (blank if open)">
              <StyledInput type="number" step="0.00001" value={form.exit} onChange={e => setF('exit', e.target.value)} placeholder="—" />
            </FGroup>
            <FGroup id="tour-log-sl" label="Stop Loss *">
              <StyledInput type="number" step="0.00001" value={form.sl} onChange={e => setF('sl', e.target.value)} placeholder="1.08200" />
            </FGroup>
            <FGroup id="tour-log-tp" label="Take Profit *">
              <StyledInput type="number" step="0.00001" value={form.tp} onChange={e => setF('tp', e.target.value)} placeholder="1.09200" />
            </FGroup>
          </div>
        </div>

        <Divider />

        {/* Section 3: Trade Timing */}
        <div style={{ marginBottom: '22px' }}>
          <SectionLabel color="var(--accent-yellow)" label="Trade Timing" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            <FGroup label="Entry Date">
              <CustomDatePicker value={form.date} onChange={val => setF('date', val)} />
            </FGroup>
            <FGroup label="Entry Time">
              <CustomTimePicker value={form.entryTime} onChange={val => setF('entryTime', val)} />
            </FGroup>
            <FGroup label="Exit Date">
              <CustomDatePicker value={form.exit_date} onChange={val => setF('exit_date', val)} />
            </FGroup>
            <FGroup label="Exit Time">
              <CustomTimePicker value={form.exitTime} onChange={val => setF('exitTime', val)} />
            </FGroup>
          </div>
        </div>

        <Divider />

        {/* Section 4: Position Size */}
        <div style={{ marginBottom: '22px' }}>
          <SectionLabel color="var(--accent-purple)" label="Position Size" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <FGroup label="Lot Size">
              <StyledInput type="number" step="0.01" value={form.lots} onChange={e => setF('lots', e.target.value)} />
            </FGroup>
            <FGroup label="Pip Value ($)">
              <StyledInput type="number" step="0.01" value={form.pipval} onChange={e => setF('pipval', e.target.value)} />
            </FGroup>
            <FGroup label="Commissions ($)">
              <StyledInput type="number" step="0.01" value={form.commissions} onChange={e => setF('commissions', e.target.value)} placeholder="0.00" />
            </FGroup>
          </div>
        </div>

        <Divider />

        {/* Section 5: Notes & Screenshots */}
        <div>
          <SectionLabel color="var(--accent-red)" label="Notes & Screenshots" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
            <FGroup label="Trade Notes">
              <textarea
                style={{ ...inputStyle, background: 'var(--bg-panel)', fontFamily: 'var(--font-sans)', resize: 'vertical', minHeight: '72px' }}
                value={form.notes}
                onChange={e => setF('notes', e.target.value)}
                placeholder="Setup, confluences, reasoning, lessons learned..."
              />
            </FGroup>
            <FGroup label="Chart Screenshots (Max 4)">
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(form.images || []).map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '10px', border: '1.5px solid var(--border)', overflow: 'hidden' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => { const n = [...(form.images || [])]; n.splice(idx, 1); setF('images', n) }}
                      style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.65)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                ))}
                {(form.images || []).length < 4 && (
                  <label style={{ width: '60px', height: '60px', borderRadius: '10px', border: '1.5px dashed var(--text-dim)', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '3px', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-base)'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <span style={{ fontSize: '8px', fontWeight: 700, color: 'var(--text-secondary)' }}>Upload</span>
                    <input type="file" accept="image/*" multiple onChange={(e) => {
                      const files = Array.from(e.target.files)
                      if ((form.images || []).length + files.length > 4) { alert('Max 4 images'); return }
                      files.forEach(file => {
                        const reader = new FileReader()
                        reader.onloadend = () => setForm(prev => ({ ...prev, images: [...(prev.images || []), reader.result] }))
                        reader.readAsDataURL(file)
                      })
                    }} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </FGroup>
          </div>
        </div>
      </div>

      {/* ── BOTTOM SAVE BAR ── */}
      <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button onClick={onCancel} style={{ background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
          Cancel
        </button>
        <button id="tour-log-submit" onClick={onSubmit}
          style={{ background: 'var(--accent-blue)', border: 'none', borderRadius: '12px', padding: '10px 32px', fontSize: '14px', fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,0.3)', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {editingTradeId ? '✓ Update Trade' : '✓ Save Trade'}
        </button>
      </div>
    </div>
  )
}
