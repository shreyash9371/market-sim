import { SidebarItem } from '../../../../components/ui/SidebarItem.jsx'

export default function JournalSidebar({ activeTab, setActiveTab, setSelectedTradeDetail, setShowModal, showModal, selectedTradeDetail, theme, setTheme }) {
  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-panel)',
      borderRight: '1px solid var(--border)',
      padding: '32px 16px 24px',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: '64px', bottom: 0,
      overflowY: 'auto',
      zIndex: 40,
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '12px', paddingLeft: '16px' }}>
          Menu
        </div>
        <div id="tour-journal-dashboard">
          <SidebarItem label="Dashboard" active={activeTab === 'Dashboard' && !showModal && !selectedTradeDetail} onClick={() => { setActiveTab('Dashboard'); setSelectedTradeDetail(null); setShowModal(false); }} />
        </div>
        <div id="tour-statistics-tab">
          <SidebarItem label="Trading Statistics" active={activeTab === 'Trading Statistics' && !showModal && !selectedTradeDetail} onClick={() => { setActiveTab('Trading Statistics'); setSelectedTradeDetail(null); setShowModal(false); }} />
        </div>
        <div id="tour-journal-ai">
          <SidebarItem label="AI Trading Coach" active={activeTab === 'AI Trading Coach' && !showModal && !selectedTradeDetail} onClick={() => { setActiveTab('AI Trading Coach'); setSelectedTradeDetail(null); setShowModal(false); }} />
        </div>
        <div id="tour-journal-history">
          <SidebarItem label="Trading History" active={activeTab === 'Trading History' && !showModal && !selectedTradeDetail} onClick={() => { setActiveTab('Trading History'); setSelectedTradeDetail(null); setShowModal(false); }} />
        </div>
        <div id="tour-journal-images">
          <SidebarItem label="Images of your trades" active={activeTab === 'Images of your trades' && !showModal && !selectedTradeDetail} onClick={() => { setActiveTab('Images of your trades'); setSelectedTradeDetail(null); setShowModal(false); }} />
        </div>
        <div id="tour-mt5-sync">
          <SidebarItem label="Import MT5 (CSV/Excel)" active={activeTab === 'MT5 Sync' && !showModal && !selectedTradeDetail} onClick={() => { setActiveTab('MT5 Sync'); setSelectedTradeDetail(null); setShowModal(false); }} />
        </div>
      </div>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '4px', paddingLeft: '16px' }}>
          Preference & Support
        </div>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
            borderRadius: '12px', border: 'none', background: 'var(--bg-hover)',
            cursor: 'pointer', transition: 'var(--transition)', width: '100%',
            color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600
          }}
        >
          <span style={{ fontSize: '18px' }}>{theme === 'light' ? '🌙' : '☀️'}</span>
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>

        <a
          href="https://discord.gg/qMGJaYp7hP"
          target="_blank"
          rel="noreferrer"
          style={{
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
            borderRadius: '12px', background: 'rgba(88, 101, 242, 0.1)',
            cursor: 'pointer', transition: 'var(--transition)', width: '100%',
            color: '#5865F2', fontSize: '13px', fontWeight: 700
          }}
        >
          <span style={{ fontSize: '18px' }}>💬</span>
          Join Discord Support
        </a>
      </div>
    </aside>
  )
}
