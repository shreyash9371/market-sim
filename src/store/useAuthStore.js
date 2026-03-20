import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

let globalUser = null
let globalLoading = true
let listeners = new Set()

function setGlobal(partial) {
  if ('user' in partial) globalUser = partial.user
  if ('loading' in partial) globalLoading = partial.loading
  listeners.forEach(fn => fn())
}

supabase.auth.getSession().then(({ data }) => {
  globalUser = data.session?.user ?? null
  globalLoading = false
  listeners.forEach(fn => fn())
})

supabase.auth.onAuthStateChange((_event, session) => {
  globalUser = session?.user ?? null
  globalLoading = false
  listeners.forEach(fn => fn())
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

    async signIn({ email, password }) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    },

    async signOut() {
      await supabase.auth.signOut()
    },

    async resetPassword(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      })
      return { error }
    },
  }
}