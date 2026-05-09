import { Btn } from '../../../../components/ui/BaseComponents.jsx'

const inputStyle = { width: '100%', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }
const Label = ({ children }) => <label style={labelStyle}>{children}</label>

// ── Edit modal ────────────────────────────────────────────────────────────────
function EditModal({ propMode, editingStrat, setEditingStrat, onUpdate, creating }) {
  const set = (key, val) => setEditingStrat({ ...editingStrat, [key]: val })
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <div style={{ background: 'var(--bg-panel)', width: '100%', maxWidth: '440px', borderRadius: '24px', padding: '32px', border: '1px solid var(--border)', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          {propMode ? 'Edit Prop Firm Account' : 'Edit Strategy'}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          {propMode ? 'Update your account parameters.' : 'Update the parameters, goals, or rules for this strategy.'}
        </p>

        {propMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            <div>
              <Label>Prop Firm Name <span style={{ color: 'var(--accent-red)' }}>*</span></Label>
              <input type="text" value={editingStrat.name} onChange={e => set('name', e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <Label>Account Type</Label>
                <select value={editingStrat.type} onChange={e => set('type', e.target.value)} style={inputStyle}>
                  <option value="2-step">2-Step Eval</option>
                  <option value="1-step">1-Step Eval</option>
                  <option value="instant">Instant Funding</option>
                </select>
              </div>
              {editingStrat.type === '2-step' && (
                <div>
                  <Label>Phase</Label>
                  <select value={editingStrat.phase} onChange={e => set('phase', e.target.value)} style={inputStyle}>
                    <option value="1">Phase 1</option>
                    <option value="2">Phase 2</option>
                  </select>
                </div>
              )}
            </div>
            <div>
              <Label>Profit Target ($)</Label>
              <input type="number" value={editingStrat.target} onChange={e => set('target', e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><Label>Max DD ($)</Label><input type="number" value={editingStrat.maxDD} onChange={e => set('maxDD', e.target.value)} style={inputStyle} /></div>
              <div><Label>Daily DD ($)</Label><input type="number" value={editingStrat.dailyDD} onChange={e => set('dailyDD', e.target.value)} style={inputStyle} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><Label>Account Size ($)</Label><input type="number" value={editingStrat.accountSize} onChange={e => set('accountSize', e.target.value)} style={inputStyle} /></div>
              <div><Label>Start Date</Label><input type="date" value={editingStrat.startDate} onChange={e => set('startDate', e.target.value)} style={{ ...inputStyle, fontFamily: 'inherit' }} /></div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            <div>
              <Label>Strategy Name <span style={{ color: 'var(--accent-red)' }}>*</span></Label>
              <input type="text" value={editingStrat.name} onChange={e => set('name', e.target.value)} placeholder="e.g. London Breakout" style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><Label>Target R:R</Label><input type="number" step="0.1" value={editingStrat.target_rr} onChange={e => set('target_rr', e.target.value)} placeholder="e.g. 2.5" style={inputStyle} /></div>
              <div><Label>Target Win Rate (%)</Label><input type="number" value={editingStrat.target_wr} onChange={e => set('target_wr', e.target.value)} placeholder="e.g. 55" style={inputStyle} /></div>
            </div>
            <div>
              <Label>Asset / Pair</Label>
              <input type="text" value={editingStrat.asset} onChange={e => set('asset', e.target.value)} placeholder="e.g. EURUSD, Crypto, Mixed" style={inputStyle} />
            </div>
            <div>
              <Label>Strategy Rules & Notes</Label>
              <textarea value={editingStrat.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="Define your strategy rules, confluences, setup requirements..." style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'var(--font-sans)' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <Btn style={{ flex: 1, justifyContent: 'center' }} onClick={() => setEditingStrat(null)}>Cancel</Btn>
          <Btn primary style={{ flex: 1, justifyContent: 'center' }} onClick={onUpdate} disabled={creating}>
            {creating ? 'Updating...' : 'Save Changes'}
          </Btn>
        </div>
      </div>
    </div>
  )
}

// ── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteModal({ onCancel, onConfirm }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onCancel() }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg-panel)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.14)', width: '400px', maxWidth: '90vw', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '20px' }}>⚠️</div>
        <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>Delete this Strategy?</div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.5 }}>
          This will permanently delete the strategy AND <strong>ALL</strong> trades associated with it. This action cannot be undone.
        </div>
        <div style={{ display: 'flex', width: '100%', gap: '12px' }}>
          <Btn style={{ flex: 1, justifyContent: 'center' }} onClick={onCancel}>Cancel</Btn>
          <Btn danger style={{ flex: 1, justifyContent: 'center' }} onClick={onConfirm}>Delete Everything</Btn>
        </div>
      </div>
    </div>
  )
}

// ── Combined export ───────────────────────────────────────────────────────────
export { EditModal, DeleteModal }
