import { useState, useEffect } from 'react'
import { globalState, listeners } from './market/marketState'
import { executeOrder } from './market/executeOrder'
import { tickRealMarket } from './market/tickLogic'
import {
  runGenerateOrders,
  selectOrder,
  clearSelectedOrder,
  runGenerateOrderBook,
  toggleRealMarket,
  setPlaying,
  setPlaybackSpeed,
  setStartingPrice,
  setMarketCondition,
  updateSelectedOrder,
  updateOrderBookLevel,
  goBack,
  goForward
} from './market/marketActions'

export function useMarketStore() {
  const [, rerender] = useState(0)

  useEffect(() => {
    const trigger = () => rerender(n => n + 1)
    listeners.add(trigger)
    return () => listeners.delete(trigger)
  }, [])

  return {
    ...globalState,
    canGoBack: globalState.history.length > 0,
    canGoForward: globalState.future.length > 0,

    generateOrders: runGenerateOrders,
    selectOrder,
    clearSelectedOrder,
    generateOrderBook: runGenerateOrderBook,
    toggleRealMarket,
    setPlaying,
    setPlaybackSpeed,
    setStartingPrice,
    setMarketCondition,
    updateSelectedOrder,
    updateOrderBookLevel,
    executeOrder,
    goBack,
    goForward,
    tickRealMarket,
  }
}