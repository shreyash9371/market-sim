import TopBar from './components/TopBar'
import OrderPanel from './components/OrderPanel'
import PriceChart from './components/PriceChart'
import BidAskTable from './components/BidAskTable'
import { useState } from 'react'
import { useMarketStore } from './store/useMarketStore'
import './index.css'

export default function App() {
  const [panelOpen, setPanelOpen] = useState(false)
  const store = useMarketStore()

  const handleTogglePanel = () => setPanelOpen(p => !p)

  const handleGenerate = () => {
    store.generateOrders()
    setPanelOpen(true)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', width: '100vw',
      overflow: 'hidden', background: 'var(--bg-base)',
      padding: '16px', gap: '16px',
    }}>

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

      <div style={{
        display: 'flex', flex: 1, gap: '16px',
        overflow: 'hidden', position: 'relative', minHeight: 0,
      }}>

        <OrderPanel
          open={panelOpen}
          orders={store.orders}
          selectedOrder={store.selectedOrder}
          onSelectOrder={store.selectOrder}
          onClose={() => setPanelOpen(false)}
        />

        <div style={{
          flex: 1, background: 'var(--bg-panel)',
          borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)',
          overflow: 'hidden', minWidth: 0,
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