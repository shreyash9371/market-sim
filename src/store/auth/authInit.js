import { supabase } from '../../utils/supabase'

import {
    globalUser
} from './authState'

import {
    setGlobalUser,
    setGlobalApproved,
    setGlobalSessionId,
    setGlobalLoading
} from './authState'

import { notify } from './authListeners'

// 🔹 Initial session load
supabase.auth.getSession().then(({ data }) => {
    const guestSession = sessionStorage.getItem('guest_mode') === 'true'

    if (guestSession) {
        setGlobalUser({
            id: 'guest',
            isGuest: true,
            first_name: 'Guest',
            last_name: 'User',
            email: 'guest@mktsim.local',
            user_metadata: { first_name: 'Guest' }
        })

        setGlobalApproved(true)
        setGlobalLoading(false)
        notify()
        return
    }

    const user = data.session?.user ?? null
    const sessionId = data.session?.access_token?.slice(-32) ?? null

    setGlobalUser(user)
    setGlobalSessionId(sessionId)

    if (user) {
        supabase
            .from('profiles')
            .select('approved')
            .eq('id', user.id)
            .single()
            .then(() => {
                setGlobalApproved(true) // TEMP bypass
                setGlobalLoading(false)
                notify()
            })
            .catch(() => {
                setGlobalLoading(false)
                notify()
            })
    } else {
        setGlobalLoading(false)
        notify()
    }
})

// 🔹 Auth state changes
supabase.auth.onAuthStateChange((event, session) => {

    if (session && !sessionStorage.getItem('guest_mode')) {

        if (session.user.id !== globalUser?.id) {

            const sessionId = session.access_token?.slice(-32) ?? null

            setGlobalUser(session.user)
            setGlobalSessionId(sessionId)

            const meta = session.user.user_metadata || {}

            const firstName =
                meta.given_name ||
                meta.full_name?.split(' ')[0] ||
                meta.name?.split(' ')[0] ||
                ''

            const lastName =
                meta.family_name ||
                meta.full_name?.split(' ').slice(1).join(' ') ||
                meta.name?.split(' ').slice(1).join(' ') ||
                ''

            supabase.from('profiles')
                .upsert({
                    id: session.user.id,
                    email: session.user.email,
                    first_name: firstName || undefined,
                    last_name: lastName || undefined,
                    approved: true,
                    last_session_id: sessionId,
                    last_login_at: new Date().toISOString(),
                })
                .then(() => {
                    setGlobalApproved(true)
                    notify()
                })
        }

    } else if (!session && !sessionStorage.getItem('guest_mode')) {

        setGlobalUser(null)
        setGlobalSessionId(null)
        setGlobalApproved(false)

        notify()
    }
})