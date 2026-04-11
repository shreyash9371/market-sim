import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

let globalUser = null
let globalLoading = true
let globalApproved = false
let globalSessionId = null
let listeners = new Set()

function notify() {
  listeners.forEach(fn => fn())
}

supabase.auth.getSession().then(({ data }) => {
  const guestSession = sessionStorage.getItem('guest_mode') === 'true';
  if (guestSession) {
    globalUser = { id: 'guest', isGuest: true, first_name: 'Guest', last_name: 'User', email: 'guest@mktsim.local', user_metadata: { first_name: 'Guest' } }
    globalApproved = true
    globalLoading = false
    notify()
  } else {
    globalUser = data.session?.user ?? null
    globalSessionId = data.session?.access_token?.slice(-32) ?? null
    if (globalUser) {
      supabase.from('profiles').select('approved').eq('id', globalUser.id).single()
        .then(({ data: profileData }) => {
          globalApproved = profileData?.approved ?? false
          globalLoading = false
          notify()
        })
        .catch(() => {
          globalLoading = false
          notify()
        })
    } else {
      globalLoading = false
      notify()
    }
  }
})

supabase.auth.onAuthStateChange((event, session) => {
  if (session && !sessionStorage.getItem('guest_mode')) {
    if (session.user.id !== globalUser?.id) {
      globalUser = session.user
      globalSessionId = session.access_token?.slice(-32) ?? null
      supabase.from('profiles').select('approved').eq('id', globalUser.id).single()
        .then(({ data: profileData }) => {
          globalApproved = profileData?.approved ?? false
          notify()
        })
    }
  } else if (!session && !sessionStorage.getItem('guest_mode')) {
    globalUser = null
    globalSessionId = null
    globalApproved = false
    notify()
  }
})

export function useAuthStore() {
  const [, rerender] = useState(0)

  useEffect(() => {
    const trigger = () => rerender(n => n + 1)
    listeners.add(trigger)
    return () => listeners.delete(trigger)
  }, [])

  // Session check every 30 seconds
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
          globalUser = null
          globalApproved = false
          globalSessionId = null
          notify()
          window.location.href = '/?kicked=true'
        }
      } catch (e) {}
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return {
    user: globalUser,
    loading: globalLoading,
    approved: globalApproved,
    isGuest: globalUser?.isGuest || false,

    async loginAsGuest() {
      sessionStorage.setItem('guest_mode', 'true')
      globalUser = { id: 'guest', isGuest: true, first_name: 'Guest', last_name: 'User', email: 'guest@mktsim.local', user_metadata: { first_name: 'Guest' } }
      globalApproved = true
      notify()
      
      // Attempt tracking guest login - fire and forget
      supabase.from('guest_logins').insert([ { } ]).then(() => {}).catch((e) => console.log('Guest tracking error:', e))
    },

    async signUp({ firstName, lastName, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  })
  return { data, error }
},

    async signIn({ email, password }) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (!error && data?.user) {
        sessionStorage.removeItem('guest_mode')
        globalUser = data.user
        globalSessionId = data.session?.access_token?.slice(-32) ?? null
        // Register session
        await supabase
          .from('profiles')
          .update({
            last_session_id: globalSessionId,
            last_login_at: new Date().toISOString(),
          })
          .eq('id', data.user.id)
        notify()
      }
      return { data, error }
    },

    async signInWithGoogle() {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      })
      return { data, error }
    },

    async signOut() {
      sessionStorage.removeItem('guest_mode')
      if (!globalUser?.isGuest) {
        await supabase.auth.signOut()
      }
      globalUser = null
      globalApproved = false
      globalSessionId = null
      notify()
    },

    async refreshApproval() {
      if (!globalUser) return false
      if (globalUser.isGuest) {
        globalApproved = true
        notify()
        return true
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('approved')
          .eq('id', globalUser.id)
          .single()
        if (error) {
          console.log('Profile error:', error.message)
          globalApproved = false
          notify()
          return false
        }
        globalApproved = data?.approved ?? false
        notify()
        return globalApproved
      } catch (e) {
        console.log('refreshApproval error:', e)
        globalApproved = false
        notify()
        return false
      }
    },

    async resetPassword(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      })
      return { error }
    },
  }
}