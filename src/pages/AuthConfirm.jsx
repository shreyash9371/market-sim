import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function AuthConfirm() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleConfirm = async () => {
      // Get the token from the URL hash or query params
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const queryParams = new URLSearchParams(window.location.search)

      const accessToken = hashParams.get('access_token') || queryParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token')
      const tokenHash = queryParams.get('token_hash')
      const type = queryParams.get('type') || hashParams.get('type')

      if (accessToken && refreshToken) {
        // Set the session directly
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        navigate('/dashboard')
        return
      }

      if (tokenHash && type) {
        // Verify OTP token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type,
        })
        if (error) {
          navigate('/?error=confirmation_failed')
        } else {
          navigate('/dashboard')
        }
        return
      }

      // Fallback — check if already logged in
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        navigate('/dashboard')
      } else {
        navigate('/?error=confirmation_failed')
      }
    }

    handleConfirm()
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