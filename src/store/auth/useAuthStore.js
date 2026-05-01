import { useState, useEffect } from 'react'
import { listeners } from './authListeners'
import './authInit'
import { notify } from './authListeners'
import { supabase } from '../../utils/supabase'
import {
  loginAsGuest,
  signUp,
  signIn,
  signInWithGoogle,
  signOut,
  refreshApproval,
  resetPassword
} from './authActions'

import { globalUser, globalSessionId, globalApproved, globalLoading, setGlobalUser, setGlobalApproved, setGlobalSessionId } from './authState'

export function useAuthStore() {
  const [, rerender] = useState(0)

  useEffect(() => {
    const trigger = () => rerender(n => n + 1)
    listeners.add(trigger)
    return () => listeners.delete(trigger)
  }, [])

  // 🔹 Session check
  useEffect(() => {
    if (!globalUser || !globalSessionId) return

    const interval = setInterval(async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('last_session_id')
          .eq('id', globalUser.id)
          .single()

        if (data?.last_session_id && data.last_session_id !== globalSessionId) {
          await supabase.auth.signOut()

          setGlobalUser(null)
          setGlobalApproved(false)
          setGlobalSessionId(null)

          notify()
          window.location.href = '/?kicked=true'
        }
      } catch (e) { }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return {
    // state
    user: globalUser,
    loading: globalLoading,
    approved: globalApproved,
    isGuest: globalUser?.isGuest || false,

    // actions
    loginAsGuest,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshApproval,
    resetPassword
  }
}