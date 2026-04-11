import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useMarketStore } from '../../store/useMarketStore'
import TopBar from '../../components/TopBar'
import OrderPanel from '../../components/OrderPanel'
import PriceChart from '../../components/PriceChart'
import BidAskTable from '../../components/BidAskTable'
import { useState, useEffect } from 'react'

export default function BasicSimulator() {
  const [panelOpen, setPanelOpen] = useState(false)
  const store = useMarketStore()
  const auth = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!store.isRealMarket || !store.playbackPlaying) return
    const intervalTime = Math.max(50, 2000 / store.playbackSpeed)
    const timer = setInterval(() => {
      store.tickRealMarket()
    }, intervalTime)
    return () => clearInterval(timer)
  }, [store.isRealMarket, store.playbackPlaying, store.playbackSpeed])

  const _meta = auth.user?.user_metadata || {}
  const firstName = _meta.first_name || _meta.given_name || _meta.full_name?.split(' ')[0] || _meta.name?.split(' ')[0] || 'Trader'

  const handleTogglePanel = () => setPanelOpen(p => !p)

  const handleGenerate = () => {
    store.generateOrders()
    setPanelOpen(true)
  }

  // Force open panel in real market mode to show execution
  useEffect(() => {
    if (store.isRealMarket) {
      setPanelOpen(true)
    }
  }, [store.isRealMarket])

  return (
    <div className="simulator-root" style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      background: 'var(--bg-base)',
      padding: '12px',
      gap: '12px',
    }}>

      {/* Mini nav bar */}
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
          executionCount={store.executionCount}
          selectedOrder={store.selectedOrder}
          onSelectOrder={store.selectOrder}
          onClose={() => setPanelOpen(false)}
          candleTickCount={store.candleTickCount}
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
            isRealMarket={store.isRealMarket}
            candles={store.candles}
            conditionArrows={store.conditionArrows || []}
            conditionAnchorPrice={store.conditionAnchorPrice}
            conditionPhase={store.conditionPhase}
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