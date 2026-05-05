import { useState, useEffect } from 'react'
import { supabase } from '../../../../utils/supabase'
import { getGuestTrades } from '../../../../utils/guestData'

export function useJournalData(auth, strategyId) {
  const [trades, setTrades] = useState([])
  const [tradesLoading, setTradesLoading] = useState(true)

  useEffect(() => {
    if (!auth.user || !strategyId) {
      setTradesLoading(false)
      return
    }

    if (auth.isGuest) {
      const allGuestTrades = getGuestTrades()
      // In guest mode, we can just pretend all trades belong to the guest strategy
      setTrades(allGuestTrades.filter(t => t.strategy_id === strategyId || !t.strategy_id))
      setTradesLoading(false)
      return
    }

    async function fetchTrades() {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('strategy_id', strategyId)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setTrades(data)
      }
      setTradesLoading(false)
    }

    fetchTrades()
  }, [auth.user, auth.isGuest, strategyId])

  return { trades, setTrades, tradesLoading }
}
