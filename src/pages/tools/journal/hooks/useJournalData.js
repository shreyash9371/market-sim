import { useState, useEffect } from 'react'
import { supabase } from '../../../../utils/supabase'
import { getGuestTrades } from '../../../../utils/guestData'

export function useJournalData(auth) {
  const [trades, setTrades] = useState([])
  const [tradesLoading, setTradesLoading] = useState(true)

  useEffect(() => {
    if (!auth.user) {
      setTradesLoading(false)
      return
    }

    if (auth.isGuest) {
      setTrades(getGuestTrades())
      setTradesLoading(false)
      return
    }

    async function fetchTrades() {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: true })

      if (!error && data) {
        setTrades(data)
      }
      setTradesLoading(false)
    }

    fetchTrades()
  }, [auth.user, auth.isGuest])

  return { trades, setTrades, tradesLoading }
}
