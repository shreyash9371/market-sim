import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

let globalUser = null
let globalLoading = true
let globalApproved = false
let globalSessionId = null
let listeners = new Set()

function setGlobal(partial) {
  if ('user' in partial) globalUser = partial.user
  if ('loading' in partial) globalLoading = partial.loading
  if ('approved' in partial) globalApproved = partial.approved
  if ('sessionId' in partial) globalSessionId = partial.sessionId
  listeners.forEach(fn => fn())
}

async function checkApproval(userId) {
  if (!userId) return false
  const { data } = await supabase
    .from('profiles')
    .select('approved')
    .eq('id', userId)
    .single()
  return data?.approved ?? false
}

async function registerSession(userId, sessionId) {
  await supabase
    .from('profiles')
    .update({
      last_session_id: sessionId,
      last_login_at: new Date().toISOString(),
    })
    .eq('id', userId)
}

async function validateSession(userId, sessionId) {
  const { data } = await supabase
    .from('profiles')
    .select('last_session_id')
    .eq('id', userId)
    .single()
  if (!data?.last_session_id) return true
  return data.last_session_id === sessionId
}

supabase.auth.getSession().then(async ({ data }) => {
  const user = data.session?.user ?? null
  const sessionId = data.session?.access_token?.slice(-32) ?? null
  const approved = user ? await checkApproval(user.id) : false
  setGlobal({ user, loading: false, approved, sessionId })
})

supabase.auth.onAuthStateChange(async (event, session) => {
  const user = session?.user ?? null
  const sessionId = session?.access_token?.slice(-32) ?? null
  const approved = user ? await checkApproval(user.id) : false
  if (event === 'SIGNED_IN' && user && sessionId) {
    await registerSession(user.id, sessionId)
  }
  setGlobal({ user, loading: false, approved, sessionId })
})

export function useAuthStore() {
  const [, rerender] = useState(0)

  useEffect(() => {
    const trigger = () => rerender(n => n + 1)
    listeners.add(trigger)
    return () => listeners.delete(trigger)
  }, [])

  // Check session validity every 30 seconds
  useEffect(() => {
    if (!globalUser || !globalSessionId) return
    const interval = setInterval(async () => {
      const valid = await validateSession(globalUser.id, globalSessionId)
      if (!valid) {
        await supabase.auth.signOut()
        setGlobal({ user: null, approved: false, sessionId: null })
        window.location.href = '/?kicked=true'
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return {
    user: globalUser,
    loading: globalLoading,
    approved: globalApproved,

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
      setGlobal({ user: null, approved: false, sessionId: null })
    },

    async resetPassword(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      })
      return { error }
    },

    async refreshApproval() {
      if (!globalUser) return
      const approved = await checkApproval(globalUser.id)
      setGlobal({ approved })
    },
  }
}