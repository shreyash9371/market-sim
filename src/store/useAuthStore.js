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

// Initialize on load
supabase.auth.getSession().then(({ data }) => {
  globalUser = data.session?.user ?? null
  globalSessionId = data.session?.access_token?.slice(-32) ?? null
  globalLoading = false
  notify()
})

export function useAuthStore() {
  const [, rerender] = useState(0)

  useEffect(() => {
    const trigger = () => rerender(n => n + 1)
    listeners.add(trigger)
    return () => listeners.delete(trigger)
  }, [])

  return {
    user: globalUser,
    loading: globalLoading,
    approved: globalApproved,

    async signIn({ email, password }) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (!error && data?.user) {
        globalUser = data.user
        globalSessionId = data.session?.access_token?.slice(-32) ?? null
        notify()
      }
      return { data, error }
    },

    async signUp({ firstName, lastName, email, password }) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
        },
      })
      return { data, error }
    },

    async signOut() {
      await supabase.auth.signOut()
      globalUser = null
      globalApproved = false
      globalSessionId = null
      notify()
    },

    async refreshApproval() {
      if (!globalUser) return false
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('approved')
          .eq('id', globalUser.id)
          .single()

        if (error) {
          console.log('Profile query error:', error.message)
          // If profile not found, create it
          if (error.code === 'PGRST116') {
            await supabase.from('profiles').insert({
              id: globalUser.id,
              email: globalUser.email,
              first_name: globalUser.user_metadata?.first_name ?? '',
              last_name: globalUser.user_metadata?.last_name ?? '',
              approved: false,
            })
          }
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