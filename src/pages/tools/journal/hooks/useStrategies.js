import { useState, useEffect } from 'react'
import { supabase } from '../../../../utils/supabase'

export function useStrategies(auth) {
  const [strategies, setStrategies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth.user) {
      setLoading(false)
      return
    }

    if (auth.isGuest) {
      // Mock strategy for guest
      setStrategies([{
        id: 'guest-strategy-1',
        name: 'Guest Strategy',
        target_rr: 2.0,
        target_wr: 50,
        asset: 'Mixed'
      }])
      setLoading(false)
      return
    }

    async function fetchStrategies() {
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .order('created_at', { ascending: true })

      if (!error && data) {
        setStrategies(data)
      }
      setLoading(false)
    }

    fetchStrategies()
  }, [auth.user, auth.isGuest])

  async function createStrategy(newStrategy) {
    if (auth.isGuest) {
      const strategy = { ...newStrategy, id: `guest-strat-${Date.now()}` }
      setStrategies([...strategies, strategy])
      return { data: strategy, error: null }
    }

    const { data, error } = await supabase
      .from('strategies')
      .insert([{ ...newStrategy, user_id: auth.user.id }])
      .select()
      .single()

    if (!error && data) {
      setStrategies([...strategies, data])
    }
    return { data, error }
  }

  async function updateStrategy(id, updates) {
    if (auth.isGuest) {
      const updatedStrat = { ...strategies.find(s => s.id === id), ...updates }
      setStrategies(strategies.map(s => s.id === id ? updatedStrat : s))
      return { data: updatedStrat, error: null }
    }

    const { data, error } = await supabase
      .from('strategies')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setStrategies(strategies.map(s => s.id === id ? data : s))
    }
    return { data, error }
  }

  async function deleteStrategy(id) {
    if (auth.isGuest) {
      setStrategies(strategies.filter(s => s.id !== id))
      return { error: null }
    }

    const { error } = await supabase
      .from('strategies')
      .delete()
      .eq('id', id)

    if (!error) {
      setStrategies(strategies.filter(s => s.id !== id))
    }
    return { error }
  }

  return { strategies, loading, createStrategy, updateStrategy, deleteStrategy }
}
