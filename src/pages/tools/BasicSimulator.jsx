import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useMarketStore } from '../../store/useMarketStore'
import TopBar from '../../components/TopBar'
import OrderPanel from '../../components/OrderPanel'
import PriceChart from '../../components/PriceChart'
import BidAskTable from '../../components/BidAskTable'
import { useState } from 'react'

export default function BasicSimulator() {
  const [panelOpen, setPanelOpen] = useState(false)
  const store = useMarketStore()
  const auth = useAuthStore()
  const navigate = useNavigate()

  const firstName = auth.user?.user_metadata?.first_name || 'Trader'

  const handleTogglePanel = () => setPanelOpen(p => !p)

  const handleGenerate = () => {
    store.generateOrders()
    setPanelOpen(true)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'var(--bg-base)',
      padding: '12px',
      gap: '12px',
    }}>

      {/* Mini nav bar above TopBar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '7px 16px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
            fontFamily: 'var(--font-sans)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent-blue)'
            e.currentTarget.style.color = 'var(--accent-blue)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          ← Dashboard
        </button>

        <div style={{
          fontSize: '13px',
          color: 'var(--text-dim)',
          fontWeight: 500,
        }}>
          Basic Market Movements by Orders
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: '999px',
          padding: '5px 14px 5px 6px',
        }}>
          <div style={{
            width: '24px', height: '24px',
            borderRadius: '50%',
            background: 'var(--accent-blue)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px', fontWeight: 700, color: '#fff',
          }}>
            {firstName[0].toUpperCase()}
          </div>
          <span style={{
            fontSize: '13px', fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            {firstName}
          </span>
        </div>
      </div>

      {/* Simulator TopBar */}
      <TopBar
        onTogglePanel={handleTogglePanel}
        onGenerate={handleGenerate}
        selectedOrder={store.selectedOrder}
        onRun={store.executeOrder}
        onClearOrder={store.clearSelectedOrder}
        onUpdateSelectedOrder={store.updateSelectedOrder}
        onBack={store.goBack}
        onForward={store.goForward}
        canGoBack={store.canGoBack}
        canGoForward={store.canGoForward}
      />

      {/* Main body */}
      <div style={{
        display: 'flex',
        flex: 1,
        gap: '12px',
        overflow: 'hidden',
        position: 'relative',
        minHeight: 0,
      }}>

        <OrderPanel
          open={panelOpen}
          orders={store.orders}
          selectedOrder={store.selectedOrder}
          onSelectOrder={store.selectOrder}
          onClose={() => setPanelOpen(false)}
        />

        <div style={{
          flex: 1,
          background: 'var(--bg-panel)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          minWidth: 0,
        }}>
          <PriceChart
            priceHistory={store.priceHistory}
            currentPrice={store.currentPrice}
            orderBook={store.orderBook}
          />
        </div>

        <BidAskTable
          orderBook={store.orderBook}
          onGenerate={store.generateOrderBook}
          onUpdateLevel={store.updateOrderBookLevel}
        />
      </div>
    </div>
  )
}