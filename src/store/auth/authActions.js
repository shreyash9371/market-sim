import { supabase } from '../../utils/supabase'

import {
    globalUser,
    setGlobalUser,
    setGlobalApproved,
    setGlobalSessionId
} from './authState'

import { notify } from './authListeners'

// 🔹 Guest Login
export async function loginAsGuest() {
    sessionStorage.setItem('guest_mode', 'true')

    setGlobalUser({
        id: 'guest',
        isGuest: true,
        first_name: 'Guest',
        last_name: 'User',
        email: 'guest@mktsim.local',
        user_metadata: { first_name: 'Guest' }
    })

    setGlobalApproved(true)
    notify()

    supabase.from('guest_logins').insert([{}]).catch(() => { })
}

// 🔹 Sign Up
export async function signUp({ firstName, lastName, email, password }) {
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
}

// 🔹 Sign In
export async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (!error && data?.user) {
        sessionStorage.removeItem('guest_mode')

        const sessionId = data.session?.access_token?.slice(-32) ?? null

        setGlobalUser(data.user)
        setGlobalSessionId(sessionId)

        await supabase
            .from('profiles')
            .update({
                last_session_id: sessionId,
                last_login_at: new Date().toISOString(),
            })
            .eq('id', data.user.id)

        notify()
    }

    return { data, error }
}

// 🔹 Google OAuth
export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/dashboard'
        }
    })

    return { data, error }
}

// 🔹 Sign Out
export async function signOut() {
    sessionStorage.removeItem('guest_mode')

    if (!globalUser?.isGuest) {
        await supabase.auth.signOut()
    }

    setGlobalUser(null)
    setGlobalApproved(false)
    setGlobalSessionId(null)

    notify()
}

// 🔹 Refresh Approval
export async function refreshApproval() {
    if (!globalUser) return false

    if (globalUser.isGuest) {
        setGlobalApproved(true)
        notify()
        return true
    }

    try {
        const { error } = await supabase
            .from('profiles')
            .select('approved')
            .eq('id', globalUser.id)
            .single()

        if (error) {
            setGlobalApproved(true)
            notify()
            return true
        }

        setGlobalApproved(true) // TEMP bypass
        notify()
        return true

    } catch (e) {
        setGlobalApproved(true)
        notify()
        return true
    }
}

// 🔹 Reset Password
export async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
    })

    return { error }
}