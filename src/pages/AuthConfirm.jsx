import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function AuthConfirm() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/dashboard')
      } else {
        navigate('/')
      }
    })
  }, [])

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      gap: '16px',
    }}>
      <div style={{
        width: '44px', height: '44px',
        border: '3px solid var(--border)',
        borderTop: '3px solid var(--accent-blue)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <div style={{
        fontSize: '16px', fontWeight: 600,
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-sans)',
      }}>
        Confirming your account...
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}