import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Navigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function ProtectedRoute({ children }) {
  const auth = useAuthStore()
  const [checking, setChecking] = useState(true)
  const [approved, setApproved] = useState(false)
  const [hasUser, setHasUser] = useState(false)

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user ?? null

      if (!user) {
        setChecking(false)
        return
      }

      setHasUser(true)

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('approved')
          .eq('id', user.id)
          .single()

        setApproved(profile?.approved ?? false)
      } catch (e) {
        setApproved(false)
      }

      setChecking(false)
    }

    check()
  }, [])

  if (checking) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid var(--border)',
          borderTop: '3px solid var(--accent-blue)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{
          fontSize: '14px',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-sans)',
        }}>
          Loading...
        </span>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  if (!hasUser) {
    return <Navigate to="/" replace />
  }

  if (!approved) {
    return <Navigate to="/pending" replace />
  }

  return children
}