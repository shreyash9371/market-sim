import { Btn } from '../../../../components/ui/BaseComponents.jsx'

const inputStyle = { width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }
const Label = ({ children }) => <label style={labelStyle}>{children}</label>

// ── Shared prop firm fields ───────────────────────────────────────────────────
function PropFirmFields({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
      <div>
        <Label>Prop Firm Name <span style={{ color: 'var(--accent-red)' }}>*</span></Label>
        <input type="text" value={data.name} onChange={e => set('name', e.target.value)} placeholder="e.g. FTMO, Topstep" style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <Label>Account Type</Label>
          <select value={data.type} onChange={e => set('type', e.target.value)} style={inputStyle}>
            <option value="2-step">2-Step Eval</option>
            <option value="1-step">1-Step Eval</option>
            <option value="instant">Instant Funding</option>
          </select>
        </div>
        {data.type === '2-step' && (
          <div>
            <Label>Phase</Label>
            <select value={data.phase} onChange={e => set('phase', e.target.value)} style={inputStyle}>
              <option value="1">Phase 1</option>
              <option value="2">Phase 2</option>
            </select>
          </div>
        )}
      </div>
      <div>
        <Label>Profit Target ($)</Label>
        <input type="number" value={data.target} onChange={e => set('target', e.target.value)} placeholder="e.g. 5000" style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div><Label>Max DD ($)</Label><input type="number" value={data.maxDD} onChange={e => set('maxDD', e.target.value)} placeholder="e.g. 10000" style={inputStyle} /></div>
        <div><Label>Daily DD ($)</Label><input type="number" value={data.dailyDD} onChange={e => set('dailyDD', e.target.value)} placeholder="e.g. 5000" style={inputStyle} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div><Label>Account Size ($)</Label><input type="number" value={data.accountSize} onChange={e => set('accountSize', e.target.value)} placeholder="e.g. 50000" style={inputStyle} /></div>
        <div><Label>Start Date</Label><input type="date" value={data.startDate} onChange={e => set('startDate', e.target.value)} style={{ ...inputStyle, fontFamily: 'inherit' }} /></div>
      </div>
    </div>
  )
}

// ── Shared strategy fields ────────────────────────────────────────────────────
function StrategyFields({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
      <div>
        <Label>Strategy Name <span style={{ color: 'var(--accent-red)' }}>*</span></Label>
        <input type="text" value={data.name} onChange={e => set('name', e.target.value)} placeholder="e.g. London Breakout" style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div><Label>Target R:R</Label><input type="number" step="0.1" value={data.target_rr} onChange={e => set('target_rr', e.target.value)} placeholder="e.g. 2.5" style={inputStyle} /></div>
        <div><Label>Target Win Rate (%)</Label><input type="number" value={data.target_wr} onChange={e => set('target_wr', e.target.value)} placeholder="e.g. 55" style={inputStyle} /></div>
      </div>
      <div>
        <Label>Asset / Pair</Label>
        <input type="text" value={data.asset} onChange={e => set('asset', e.target.value)} placeholder="e.g. EURUSD, Crypto, Mixed" style={inputStyle} />
      </div>
      <div>
        <Label>Strategy Rules & Notes</Label>
        <textarea value={data.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="Define your strategy rules, confluences, setup requirements..." style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'var(--font-sans)' }} />
      </div>
    </div>
  )
}

// ── Create modal ──────────────────────────────────────────────────────────────
export default function StrategyCreateModal({ propMode, newStrat, setNewStrat, newProp, setNewProp, onClose, onCreate, creating }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <div style={{ background: 'var(--bg-panel)', width: '100%', maxWidth: '440px', borderRadius: '24px', padding: '32px', border: '1px solid var(--border)', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          {propMode ? 'New Prop Firm Account' : 'Create New Strategy'}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          {propMode ? 'Enter the details and rules for your evaluation or funded account.' : 'Define the parameters and goals for this specific strategy.'}
        </p>

        {propMode
          ? <PropFirmFields data={newProp} onChange={setNewProp} />
          : <StrategyFields  data={newStrat} onChange={setNewStrat} />}

        <div style={{ display: 'flex', gap: '12px' }}>
          <Btn style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</Btn>
          <Btn primary style={{ flex: 1, justifyContent: 'center' }} onClick={onCreate} disabled={creating}>
            {creating ? 'Creating...' : (propMode ? 'Create Account' : 'Create Strategy')}
          </Btn>
        </div>
      </div>
    </div>
  )
}
